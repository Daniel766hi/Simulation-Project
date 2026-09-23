"""Collect every result into one JSON blob and embed it in ../m5.html.

The page must open from file:// with no server (like the other pages in this repo), and
browsers block fetch() from file://, so the data is written inline between two markers.
"""
import json
import re
from datetime import date

import numpy as np
import pandas as pd

from config import (HORIZON, LAST_TRAIN_EVALUATION, LAST_TRAIN_VALIDATION, OUTPUTS, RAW,
                    ROOT)
from wrmsse import LEVEL_NAMES, LEVELS, aggregation_matrix, load_raw

PAGE = ROOT.parent / "m5.html"
HISTORY = 84                      # days of actuals shown before the forecast window
EXPLORER_LEVELS = ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9"]


def r(x, nd=4):
    return None if x is None or (isinstance(x, float) and np.isnan(x)) else round(float(x), nd)


def leaderboard():
    top = pd.read_excel(RAW / "scores.xlsx", sheet_name="Accuracy-Top50 (AL)", header=None)
    top = top.iloc[2:, [0, 13]].dropna()
    top.columns = ["team", "wrmsse"]
    top = top.reset_index(drop=True)
    top50 = [{"rank": i + 1, "team": str(t), "wrmsse": r(s)}
             for i, (t, s) in enumerate(zip(top["team"], top["wrmsse"].astype(float)))]
    raw_top = pd.read_excel(RAW / "scores.xlsx", sheet_name="Accuracy-Top50 (AL)", header=None)
    winner_levels = [r(v) for v in raw_top.iloc[2, 1:13].astype(float)]
    bench = pd.read_excel(RAW / "scores.xlsx", sheet_name="Accuracy-Benchmarks (AL)", header=None)
    official = [{"method": str(m), "wrmsse": r(s)}
                for m, s in zip(bench.iloc[2:, 0], bench.iloc[2:, 13].astype(float))]
    return top50, winner_levels, official


def explorer(full):
    ids = full[["item_id", "dept_id", "cat_id", "store_id", "state_id"]]
    S, labels = aggregation_matrix(ids)
    keep = labels["level"].isin(EXPLORER_LEVELS).to_numpy()
    S = S[keep]
    labels = labels[keep].reset_index(drop=True)
    first = LAST_TRAIN_EVALUATION - HISTORY + 1
    cols = [f"d_{d}" for d in range(first, LAST_TRAIN_EVALUATION + HORIZON + 1)]
    actual = S @ full[cols].to_numpy(np.float32)
    ours = S @ np.load(OUTPUTS / f"preds_final_o{LAST_TRAIN_EVALUATION}.npy")
    snaive = S @ np.load(OUTPUTS / f"preds_sNaive_o{LAST_TRAIN_EVALUATION}.npy")
    series = []
    for i, row in labels.iterrows():
        name = row["series"].replace("__", " · ")
        series.append({"level": row["level"], "name": name,
                       "actual": [int(round(v)) for v in actual[i]],
                       "ours": [round(float(v), 1) for v in ours[i]],
                       "snaive": [round(float(v), 1) for v in snaive[i]]})
    cal = pd.read_csv(RAW / "calendar.csv")
    dates = cal["date"].iloc[first - 1:LAST_TRAIN_EVALUATION + HORIZON].tolist()
    events = cal["event_name_1"].iloc[first - 1:LAST_TRAIN_EVALUATION + HORIZON]
    return {"dates": dates, "history": HISTORY, "series": series,
            "events": [None if pd.isna(e) else e for e in events]}


def horizon_error(full):
    """Mean absolute % error of the total-sales forecast by day ahead, ours vs sNaive."""
    act = full[[f"d_{d}" for d in range(LAST_TRAIN_EVALUATION + 1,
                                        LAST_TRAIN_EVALUATION + HORIZON + 1)]].to_numpy().sum(0)
    out = {}
    for name in ("final", "sNaive"):
        fc = np.load(OUTPUTS / f"preds_{name}_o{LAST_TRAIN_EVALUATION}.npy").sum(0)
        out[name] = [r(abs(f - a) / a, 4) for f, a in zip(fc, act)]
    return out


def importance():
    imp = pd.read_csv(OUTPUTS / f"importance_recursive_store_o{LAST_TRAIN_EVALUATION}.csv",
                      index_col=0).sum(axis=1)
    imp = (imp / imp.sum()).sort_values(ascending=False)
    return [{"feature": f, "share": r(v)} for f, v in imp.head(15).items()]


def design_comparison():
    """All-store public-LB scores of each model design (bias = forecast / actual)."""
    from score import evaluator
    full = load_raw()[0]
    act = full[[f"d_{d}" for d in range(LAST_TRAIN_VALIDATION + 1,
                                        LAST_TRAIN_VALIDATION + HORIZON + 1)]].to_numpy().sum()
    out = []
    for key, label in [("direct_unscaled_store", "Direct, lag >= 28 (first version)"),
                       ("direct_store", "Direct + dynamic scaling"),
                       ("mh_store", "Multi-horizon, origin-anchored"),
                       ("recursive_store", "Recursive + dynamic scaling"),
                       ("recursive_store_cat", "Recursive, per store x category pool")]:
        p = np.load(OUTPUTS / f"preds_{key}_o{LAST_TRAIN_VALIDATION}.npy")
        s, _ = evaluator(LAST_TRAIN_VALIDATION).score(p)
        out.append({"design": label, "wrmsse": r(s), "bias": r(p.sum() / act)})
    return out


SIM_PER_BUCKET = 80
SIM_BUCKETS = [("Fast movers (10+ units/day)", 10, np.inf),
               ("Medium movers (1-10 units/day)", 1, 10),
               ("Slow movers (0.2-1 units/day)", 0.2, 1)]


def simulator_items(full, calendar, prices):
    """Real item-stores for the in-browser replenishment simulator: actual private-window demand,
    both forecasts, and each forecast's out-of-sample daily error sd from the previous window."""
    from inventory_sim import unit_prices
    o, prev = LAST_TRAIN_EVALUATION, LAST_TRAIN_VALIDATION
    cols = lambda a, b: [f"d_{d}" for d in range(a, b + 1)]
    demand = full[cols(o + 1, o + HORIZON)].to_numpy(float)
    hist = full[cols(o - 55, o)].to_numpy(float)
    rate = full[cols(o - 27, o)].to_numpy(float).mean(axis=1)
    price = unit_prices(full, calendar, prices, o)
    act_prev = full[cols(prev + 1, prev + HORIZON)].to_numpy(float)
    fc = {k: np.load(OUTPUTS / f"preds_{k}_o{o}.npy") for k in ("final", "sNaive")}
    sd = {k: np.sqrt(((act_prev - np.load(OUTPUTS / f"preds_{k}_o{prev}.npy")) ** 2).mean(axis=1))
          for k in ("final", "sNaive")}
    dollars = rate * price
    items = []
    for label, lo, hi in SIM_BUCKETS:
        idx = np.flatnonzero((rate >= lo) & (rate < hi) & (price > 0))
        idx = idx[np.argsort(-dollars[idx])][:SIM_PER_BUCKET]
        for i in idx:
            items.append({
                "id": f"{full['item_id'].iat[i]} · {full['store_id'].iat[i]}",
                "group": label, "price": round(float(price[i]), 2),
                "hist": [int(v) for v in hist[i]], "demand": [int(v) for v in demand[i]],
                "fc": [round(float(v), 2) for v in fc["final"][i]],
                "fc_base": [round(float(v), 2) for v in fc["sNaive"][i]],
                "sd": round(float(sd["final"][i]), 3), "sd_base": round(float(sd["sNaive"][i]), 3),
            })
    unc = json.loads((OUTPUTS / "uncertainty.json").read_text())["choice"]["L12"]["chosen"]
    r = float(unc.split("=")[1].rstrip(")")) if unc.startswith("nb") else 8.0
    return {"items": items, "nb_r": r,
            "dates": calendar["date"].iloc[o - 56:o + HORIZON].tolist()}


def main():
    full, calendar, prices = load_raw()
    top50, winner_levels, official = leaderboard()
    final = json.loads((OUTPUTS / "final_scores.json").read_text())
    ours = {k: {"wrmsse": r(v["private"]), "folds": {str(o): r(x) for o, x in v["folds"].items()},
                "levels": [r(v["levels"][lv]) for lv, _ in LEVELS]}
            for k, v in final["models"].items()}
    bench = json.loads((OUTPUTS / "benchmarks.json").read_text())
    data = {
        "generated": date.today().isoformat(),
        "levels": [LEVEL_NAMES[lv] for lv, _ in LEVELS],
        "ours": ours,
        "weights": final["weights"],
        "alpha": final["alpha"],
        "calibration": final["calibration"],
        "rank_equivalent": final["rank_equivalent"],
        "ensemble": json.loads((OUTPUTS / "ensemble.json").read_text()),
        "reconcile": json.loads((OUTPUTS / "reconcile.json").read_text()),
        "scaling_ablation": json.loads((OUTPUTS / "experiment_scaling.json").read_text()),
        "design_1913": design_comparison(),
        "benchmarks": [{"method": b["method"], "wrmsse": r(b["wrmsse"]),
                        "official": r(b["official"]),
                        "levels": [r(b["levels"][lv]) for lv, _ in LEVELS]} for b in bench],
        "official_benchmarks": official,
        "top50": top50,
        "winner_levels": winner_levels,
        "evaluator": json.loads((OUTPUTS / "evaluator_validation.json").read_text()),
        "explorer": explorer(full),
        "horizon_error": horizon_error(full),
        "importance": importance(),
        "drivers": json.loads((OUTPUTS / "demand_drivers.json").read_text()),
        "inventory": json.loads((OUTPUTS / "inventory_sim.json").read_text()),
        "uncertainty": json.loads((OUTPUTS / "uncertainty.json").read_text()),
        "simulator": simulator_items(full, calendar, prices),
        "wspl_validation": json.loads((OUTPUTS / "wspl_validation.json").read_text()),
    }
    sc = OUTPUTS / "supply_chain.json"
    if sc.exists():
        data["supply_chain"] = json.loads(sc.read_text())
    bt = OUTPUTS / "backtest.json"
    if bt.exists():
        data["backtest"] = json.loads(bt.read_text())
    blob = json.dumps(data, separators=(",", ":"))
    html = PAGE.read_text()
    html, n = re.subn(r"(/\*M5-DATA\*/).*?(/\*END-M5-DATA\*/)",
                      lambda m: m.group(1) + blob + m.group(2), html, flags=re.S)
    assert n == 1, "data markers not found in m5.html"
    PAGE.write_text(html)
    print(f"embedded {len(blob) / 1e3:.0f} kB of results into {PAGE.name}")


if __name__ == "__main__":
    main()

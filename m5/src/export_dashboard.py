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
    ours = S @ np.load(OUTPUTS / "preds_ensemble_evaluation.npy")
    snaive = S @ np.load(OUTPUTS / "preds_sNaive_evaluation.npy")
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
    for name in ("ensemble", "sNaive"):
        fc = np.load(OUTPUTS / f"preds_{name}_evaluation.npy").sum(0)
        out[name] = [r(abs(f - a) / a, 4) for f, a in zip(fc, act)]
    return out


def importance():
    imp = pd.read_csv(OUTPUTS / "importance_direct_evaluation.csv", index_col=0).sum(axis=1)
    imp = (imp / imp.sum()).sort_values(ascending=False)
    return [{"feature": f, "share": r(v)} for f, v in imp.head(15).items()]


def main():
    full, calendar, prices = load_raw()
    top50, winner_levels, official = leaderboard()
    final = json.loads((OUTPUTS / "final_scores.json").read_text())
    ours = {k: {"wrmsse": r(v["wrmsse"]), "levels": [r(v["levels"][lv]) for lv, _ in LEVELS]}
            for k, v in final["evaluation"].items()}
    ours_val = {k: r(v["wrmsse"]) for k, v in final["validation"].items()}
    bench = json.loads((OUTPUTS / "benchmarks.json").read_text())
    data = {
        "generated": date.today().isoformat(),
        "levels": [LEVEL_NAMES[lv] for lv, _ in LEVELS],
        "ours": ours,
        "ours_validation": ours_val,
        "ensemble_weight_direct": final["weight_direct"],
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
    }
    blob = json.dumps(data, separators=(",", ":"))
    html = PAGE.read_text()
    html, n = re.subn(r"(/\*M5-DATA\*/).*?(/\*END-M5-DATA\*/)",
                      lambda m: m.group(1) + blob + m.group(2), html, flags=re.S)
    assert n == 1, "data markers not found in m5.html"
    PAGE.write_text(html)
    print(f"embedded {len(blob) / 1e3:.0f} kB of results into {PAGE.name}")


if __name__ == "__main__":
    main()

"""What moves Walmart unit sales? Three demand drivers measured directly from the data.

1. Price promotions - weekly own-price elasticity per department, estimated as the slope of
   log(units + 1) on log(price) after removing item-store and week fixed effects (so a
   holiday week or a strong item cannot masquerade as a price effect), plus the lift in
   price-cut weeks, split into temporary promotions and permanent markdowns.
2. SNAP days - the federal food-assistance payment days that differ by state. Sales on SNAP
   days vs non-SNAP days of the same state, month and weekday.
3. Calendar events - total sales on each named event day vs the same weekday in the four
   surrounding weeks.

Output: outputs/demand_drivers.json (consumed by the dashboard and the README).
"""
import json

import numpy as np
import pandas as pd

from config import OUTPUTS, PROCESSED, RAW
from train import STORES

INV = None


def decode():
    global INV
    enc = pd.read_pickle(PROCESSED / "encoders.pkl")
    INV = {k: {v: key for key, v in m.items()} for k, m in enc.items()}


def weekly_panel():
    cols = ["item_id", "dept_id", "cat_id", "d", "wm_yr_wk", "sales", "sell_price",
            "price_disc_4w"]
    parts = []
    for store in STORES:
        g = pd.read_parquet(PROCESSED / f"grid_{store}.parquet", columns=cols)
        g = g[g["d"] <= 1941]
        w = g.groupby(["item_id", "wm_yr_wk"], as_index=False).agg(
            dept_id=("dept_id", "first"), cat_id=("cat_id", "first"),
            units=("sales", "sum"), days=("sales", "size"), price=("sell_price", "first"),
            disc=("price_disc_4w", "first"))
        w = w[w["days"] == 7]
        # M5 prices are weekly averages; a handful are artefacts (e.g. $0.01 in a stock-out
        # week). Keep prices within 50-150% of the item's median, which drops ~0.1% of weeks.
        med = w.groupby("item_id")["price"].transform("median")
        w = w[(w["price"] >= 0.5 * med) & (w["price"] <= 1.5 * med)]
        w["store"] = store
        parts.append(w)
    return pd.concat(parts, ignore_index=True)


def two_way_demean(df, cols, fe1, fe2, iters=8):
    out = df[cols].astype(np.float64).copy()
    for _ in range(iters):
        out -= out.groupby(df[fe1]).transform("mean")
        out -= out.groupby(df[fe2]).transform("mean")
    return out


def price_elasticity(w):
    w = w[w["price"] > 0].copy()
    w["ly"] = np.log1p(w["units"])
    w["lp"] = np.log(w["price"])
    w["key"] = w["store"] + "_" + w["item_id"].astype(str)
    # Only items whose price actually varies carry information about elasticity.
    varies = w.groupby("key")["lp"].transform("std") > 1e-6
    w = w[varies]
    res = []
    for dept, g in w.groupby("dept_id"):
        dm = two_way_demean(g, ["ly", "lp"], "key", "wm_yr_wk")
        beta = float((dm["ly"] * dm["lp"]).sum() / (dm["lp"] ** 2).sum())
        resid = dm["ly"] - beta * dm["lp"]
        # Cluster-robust (by item-store) standard error of the slope.
        sc = (dm["lp"] * resid).groupby(g["key"]).sum()
        se = float(np.sqrt((sc ** 2).sum()) / (dm["lp"] ** 2).sum())
        res.append({"dept": INV["dept_id"][dept], "elasticity": beta, "se": se,
                    "item_stores": int(g["key"].nunique()), "weeks": int(len(g))})
    return res


def discount_lift(w):
    """Separate temporary promotions from permanent markdowns, then measure each one's lift.

    A price cut of 5%+ below the 4-week max is a *temporary promotion* if the price returns to
    within 0.5% of its pre-cut level within 4 weeks, otherwise a *markdown* (a permanent step
    down, often on a slowing product). Lift compares units in the cut week with the mean of the
    same item-store's full-price weeks in the 4 weeks before it.
    """
    w = w.sort_values(["store", "item_id", "wm_yr_wk"]).reset_index(drop=True)
    key = [w["store"], w["item_id"]]
    full = w["disc"] >= 0.995
    w["baseline"] = w["units"].where(full).groupby(key).transform(
        lambda s: s.shift(1).rolling(4, min_periods=2).mean())
    prev_price = w.groupby(key)["price"].shift(1)
    # Highest price over the next 4 weeks: did the shelf price come back?
    fut = pd.concat([w.groupby(key)["price"].shift(-k) for k in range(1, 5)], axis=1).max(axis=1)
    cut_start = (w["disc"] <= 0.95) & (prev_price.notna()) & (w["price"] < prev_price * 0.995)
    ev = w[cut_start & (w["baseline"] >= 7)].copy()     # >= 1 unit/day so ratios are stable
    ev["kind"] = np.where(fut[ev.index] >= prev_price[ev.index] * 0.995,
                          "temporary promotion", "permanent markdown")
    ev["depth"] = 1 - ev["price"] / prev_price[ev.index]
    # Median of per-event log ratios, so a few very high-volume items cannot dominate.
    ev["log_ratio"] = np.log((ev["units"] + 1) / (ev["baseline"] + 1))
    by_cat = []
    for (kind, cat), e in ev.groupby(["kind", "cat_id"]):
        by_cat.append({"kind": kind, "cat": INV["cat_id"][cat], "events": int(len(e)),
                       "median_depth": float(e["depth"].median()),
                       "lift": float(np.expm1(e["log_ratio"].median()))})
    bands = pd.cut(ev["depth"], [0.0, 0.10, 0.20, 0.30, 1.0],
                   labels=["<10%", "10-20%", "20-30%", "30%+"])
    by_band = [{"kind": k, "band": str(b), "events": int(len(e)),
                "lift": float(np.expm1(e["log_ratio"].median()))}
               for (k, b), e in ev.groupby([ev["kind"], bands], observed=True)]
    return by_cat, by_band


def snap_effect():
    sales = pd.read_csv(RAW / "sales_train_evaluation.csv")
    cal = pd.read_csv(RAW / "calendar.csv")
    days = [f"d_{i}" for i in range(1, 1942)]
    cal = cal.iloc[:1941].copy()
    date = pd.to_datetime(cal["date"])
    out = []
    for (state, cat), g in sales.groupby(["state_id", "cat_id"]):
        daily = g[days].sum().to_numpy()
        df = pd.DataFrame({"y": daily, "snap": cal[f"snap_{state}"].to_numpy(),
                           "ym": date.dt.to_period("M").astype(str), "dow": date.dt.dayofweek})
        df = df[df["y"] > 0]                      # drop Christmas closures
        # Ratio to the month x weekday mean, so SNAP days are compared like with like.
        df["rel"] = df["y"] / df.groupby(["ym", "dow"])["y"].transform("mean")
        lift = df.loc[df["snap"] == 1, "rel"].mean() / df.loc[df["snap"] == 0, "rel"].mean() - 1
        out.append({"state": state, "cat": cat, "lift": float(lift)})
    return out


def event_effect():
    sales = pd.read_csv(RAW / "sales_train_evaluation.csv")
    cal = pd.read_csv(RAW / "calendar.csv").iloc[:1941]
    total = sales[[f"d_{i}" for i in range(1, 1942)]].sum().to_numpy()
    rows = []
    for i, name in enumerate(cal["event_name_1"]):
        if pd.isna(name):
            continue
        ref = [i + k for k in (-21, -14, -7, 7, 14, 21) if 0 <= i + k < len(total)]
        rows.append({"event": name, "type": cal["event_type_1"].iloc[i],
                     "effect": total[i] / np.mean(total[ref]) - 1})
    df = pd.DataFrame(rows)
    agg = df.groupby(["event", "type"])["effect"].agg(["mean", "count"]).reset_index()
    agg = agg.sort_values("mean")
    return [{"event": r.event, "type": r.type, "effect": float(r["mean"]), "n": int(r["count"])}
            for _, r in agg.iterrows()]


def main():
    decode()
    w = weekly_panel()
    el = price_elasticity(w)
    for r in el:
        print(f"elasticity {r['dept']:12s} {r['elasticity']:+.2f} (se {r['se']:.2f})")
    lift_cat, lift_band = discount_lift(w)
    for r in lift_cat + lift_band:
        print(r)
    snap = snap_effect()
    print("snap", snap)
    ev = event_effect()
    print("events: most negative", ev[:3], "most positive", ev[-3:])
    OUTPUTS.mkdir(exist_ok=True)
    (OUTPUTS / "demand_drivers.json").write_text(json.dumps({
        "elasticity": el, "discount_lift_by_category": lift_cat,
        "discount_lift_by_depth": lift_band, "snap": snap, "events": ev}, indent=2))


if __name__ == "__main__":
    main()

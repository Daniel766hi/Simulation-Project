"""Hidden stock-outs: finding availability gaps in sales data that has no stock-out flag.

M5 records sales, not demand. When a product is off the shelf its sales are zero, and nothing in
the data says so. A run of 7+ consecutive zero-sale days for an item-store that sold at least one
unit a day on average over the previous 8 weeks is very unlikely to be chance (under a Poisson
with mean 1 it has probability e^-7 < 0.1%; for faster sellers far less), so it is flagged as a
probable stock-out. This is the "stockout-aware" view that the 2026 VN2 inventory-challenge
winner built into its features.

Outputs: how common the gaps are, how much revenue they cost (the item's normal daily rate over
the gap, at shelf price), where they concentrate, and whether they bias the final forecast.
"""
import json

import numpy as np
import pandas as pd

from config import HORIZON, LAST_TRAIN_EVALUATION, OUTPUTS, RAW
from wrmsse import load_raw

MIN_RUN = 7          # consecutive zero-sale days
MAX_RUN = 55         # longer gaps may be delistings rather than stock-outs: reported separately
MIN_RATE = 1.0       # average units/day over the lookback for the item to count as a regular seller
LOOKBACK = 56
PERIOD = (LAST_TRAIN_EVALUATION - 364 + 1, LAST_TRAIN_EVALUATION)   # the last year of history


def zero_runs(row):
    """(start, length) of every run of zeros in a 1-D array."""
    z = np.concatenate([[0], (row == 0).astype(np.int8), [0]])
    d = np.diff(z)
    starts, ends = np.flatnonzero(d == 1), np.flatnonzero(d == -1)
    return starts, ends - starts


def price_matrix(full, calendar, prices, first, last):
    cal = calendar.iloc[first - 1:last]
    p = prices.pivot_table(index=["item_id", "store_id"], columns="wm_yr_wk", values="sell_price")
    key = pd.MultiIndex.from_frame(full[["item_id", "store_id"]])
    return p.reindex(key)[cal["wm_yr_wk"].to_numpy()].to_numpy(float)


def main():
    full, calendar, prices = load_raw()
    first, last = PERIOD
    cols = [f"d_{d}" for d in range(first - LOOKBACK, last + 1)]
    Y = full[cols].to_numpy(float)
    P = price_matrix(full, calendar, prices, first - LOOKBACK, last)
    events = []
    for i in range(len(Y)):
        starts, lengths = zero_runs(Y[i])
        for s, L in zip(starts, lengths):
            if L < MIN_RUN or s < LOOKBACK:
                continue
            prior = Y[i, s - LOOKBACK:s]
            if np.isnan(P[i, s - LOOKBACK:s]).all():
                continue                                   # not yet on the shelf
            rate = np.nanmean(prior)
            if rate < MIN_RATE or np.isnan(P[i, s]):
                continue                                   # irregular seller, or delisted
            end = min(s + L, Y.shape[1])
            events.append({"row": i, "start_day": first - LOOKBACK + s, "length": int(L),
                           "rate": float(rate), "lost_units": float(rate * (end - s)),
                           "lost_revenue": float(np.nansum(rate * P[i, s:end])),
                           "open": bool(s + L >= Y.shape[1])})
    all_ev = pd.DataFrame(events)
    all_ev["cat"] = full["cat_id"].to_numpy()[all_ev["row"]]
    all_ev["store"] = full["store_id"].to_numpy()[all_ev["row"]]
    long_gaps = all_ev[all_ev["length"] > MAX_RUN]
    ev = all_ev[all_ev["length"] <= MAX_RUN]
    period_cols = [f"d_{d}" for d in range(first, last + 1)]
    revenue = np.nansum(full[period_cols].to_numpy(float) * P[:, LOOKBACK:])
    regular = (full[[f"d_{d}" for d in range(first - LOOKBACK, first)]].to_numpy(float).mean(1)
               >= MIN_RATE)

    # Do stock-outs bias the forecast? At each forecast origin, compare items with a probable
    # stock-out in the 28 days before it against regular sellers without one.
    def bias_at(o, name):
        path = OUTPUTS / f"preds_{name}_o{o}.npy"
        if not path.exists():
            return None
        recent = all_ev[(all_ev["start_day"] + all_ev["length"] > o - HORIZON)
                        & (all_ev["start_day"] <= o)]["row"].unique()
        fc = np.load(path).sum(axis=1)
        act = full[[f"d_{d}" for d in range(o + 1, o + HORIZON + 1)]].to_numpy(float).sum(axis=1)
        reg = full[[f"d_{d}" for d in range(o - LOOKBACK + 1, o + 1)]].to_numpy(float).mean(1) >= MIN_RATE
        gap = np.zeros(len(full), bool)
        gap[recent] = True
        return {"origin": o, "after_recent_stockout": float(fc[gap].sum() / act[gap].sum()),
                "regular_sellers_without": float(fc[reg & ~gap].sum() / act[reg & ~gap].sum()),
                "items_after_recent_stockout": int(gap.sum())}

    by_origin = [b for b in (bias_at(o, "final") or bias_at(o, "bt_final")
                             for o in (1773, 1801, 1829, 1857, 1885, 1913, 1941)) if b]
    bias = next(b for b in by_origin if b["origin"] == LAST_TRAIN_EVALUATION)

    out = {
        "definition": {"min_run_days": MIN_RUN, "max_run_days": MAX_RUN,
                       "min_rate_units_per_day": MIN_RATE,
                       "lookback_days": LOOKBACK, "period": [first, last]},
        "events": int(len(ev)),
        "item_stores_affected": int(ev["row"].nunique()),
        "regular_item_stores": int(regular.sum()),
        "lost_units": float(ev["lost_units"].sum()),
        "lost_revenue": float(ev["lost_revenue"].sum()),
        "period_revenue": float(revenue),
        "median_length": float(ev["length"].median()),
        "length_hist": {str(k): int(v) for k, v in
                        pd.cut(all_ev["length"], [6, 13, 27, 55, 10_000],
                               labels=["7-13", "14-27", "28-55", "56+"]).value_counts().sort_index().items()},
        "long_gaps": {"events": int(len(long_gaps)),
                      "lost_revenue_if_stockouts": float(long_gaps["lost_revenue"].sum())},
        "by_category": ev.groupby("cat")["lost_revenue"].sum().round(0).to_dict(),
        "by_store": ev.groupby("store")["lost_revenue"].sum().round(0).to_dict(),
        "forecast_bias": bias,
        "forecast_bias_by_origin": by_origin,
    }
    print(json.dumps({k: v for k, v in out.items() if k not in ("by_store",)}, indent=1))
    (OUTPUTS / "stockouts.json").write_text(json.dumps(out, indent=2))
    return out


if __name__ == "__main__":
    main()

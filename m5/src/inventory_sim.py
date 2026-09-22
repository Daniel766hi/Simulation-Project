"""What is a better forecast worth? Replay the 28-day private-leaderboard window through an
inventory policy driven by each forecast and measure stock held against service delivered.

Policy (per item-store, all 30,490 in parallel): periodic review every R = 7 days with a
lead time of L = 3 days, order-up-to level

    S = forecast demand over the next R + L days  +  z * sigma * sqrt(R + L)

Unmet demand is lost (a shopper facing an empty shelf buys elsewhere). sigma is each method's
own daily forecast-error standard deviation measured out of sample on the previous 28 days
(the public-leaderboard window), so a method that forecasts worse also pays for it with more
safety stock - exactly as it would in a real replenishment system.

Sweeping z traces each method's trade-off curve between fill rate and average inventory value.
The headline number is the inventory needed to reach the same fill rate.
"""
import json

import numpy as np
import pandas as pd

from config import HORIZON, LAST_TRAIN_EVALUATION, LAST_TRAIN_VALIDATION, OUTPUTS, RAW
from wrmsse import load_raw

R, L = 7, 3
METHODS = {                       # label: (validation-window preds, evaluation-window preds)
    "LightGBM ensemble": ("ensemble_validation", "ensemble_evaluation"),
    "Moving average": ("MA_validation", "MA_evaluation"),
    "sNaive": ("sNaive_validation", "sNaive_evaluation"),
}
Z_GRID = [0.0, 0.25, 0.5, 0.75, 1.0, 1.28, 1.65, 2.0, 2.33, 2.75, 3.0]


def unit_prices(full, calendar, prices, day):
    week = calendar.loc[calendar["d"] == f"d_{day}", "wm_yr_wk"].iloc[0]
    p = prices[prices["wm_yr_wk"] == week].set_index(["item_id", "store_id"])["sell_price"]
    key = pd.MultiIndex.from_frame(full[["item_id", "store_id"]])
    return p.reindex(key).fillna(0).to_numpy()


def extend(fc, days):
    """Forecast for `days` days, repeating the final week beyond the 28-day horizon."""
    reps = int(np.ceil(max(days - fc.shape[1], 0) / 7))
    tail = np.tile(fc[:, -7:], reps) if reps else fc[:, :0]
    return np.concatenate([fc, tail], axis=1)[:, :days]


def simulate(demand, fc, sigma, z, price):
    n, T = demand.shape
    fc_ext = extend(fc, T + R + L)
    ss = z * sigma * np.sqrt(R + L)
    on_hand = fc_ext[:, :L].sum(axis=1) + ss          # stock to cover the first lead time
    pipeline = np.zeros((n, T + L + 1))
    served = np.zeros(n)
    inv_value = 0.0
    stockout_days = np.zeros(n)
    for t in range(T):
        on_hand += pipeline[:, t]
        if t % R == 0:
            target = fc_ext[:, t:t + R + L].sum(axis=1) + ss
            position = on_hand + pipeline[:, t + 1:].sum(axis=1)
            pipeline[:, t + L] += np.maximum(target - position, 0)
        sold = np.minimum(on_hand, demand[:, t])
        stockout_days += demand[:, t] > on_hand + 1e-9
        served += sold
        on_hand -= sold
        inv_value += (on_hand * price).sum()
    total = demand.sum()
    return {
        "z": z,
        "fill_rate": float(served.sum() / total),
        "fill_rate_value": float((served * price).sum() / (demand.sum(axis=1) * price).sum()),
        "avg_inventory_value": float(inv_value / T),
        "stockout_day_share": float(stockout_days.sum() / (n * T)),
    }


def inventory_at_fill(curve, target):
    """Interpolate the average inventory value needed to hit a fill-rate target."""
    fr = np.array([c["fill_rate"] for c in curve])
    iv = np.array([c["avg_inventory_value"] for c in curve])
    if target < fr.min() or target > fr.max():
        return None
    return float(np.interp(target, fr, iv))


def main(methods=None):
    full, calendar, prices = load_raw()
    val_actual = full[[f"d_{d}" for d in range(LAST_TRAIN_VALIDATION + 1,
                                               LAST_TRAIN_VALIDATION + HORIZON + 1)]].to_numpy(float)
    demand = full[[f"d_{d}" for d in range(LAST_TRAIN_EVALUATION + 1,
                                           LAST_TRAIN_EVALUATION + HORIZON + 1)]].to_numpy(float)
    price = unit_prices(full, calendar, prices, LAST_TRAIN_EVALUATION)
    methods = methods or METHODS
    out = {"policy": {"review_days": R, "lead_time_days": L, "z_grid": Z_GRID}, "methods": {}}
    for label, (val_name, eval_name) in methods.items():
        val_fc = np.load(OUTPUTS / f"preds_{val_name}.npy")
        eval_fc = np.load(OUTPUTS / f"preds_{eval_name}.npy")
        sigma = np.sqrt(((val_actual - val_fc) ** 2).mean(axis=1))
        curve = [simulate(demand, eval_fc, sigma, z, price) for z in Z_GRID]
        out["methods"][label] = {
            "curve": curve,
            "inventory_at_95": inventory_at_fill(curve, 0.95),
            "inventory_at_90": inventory_at_fill(curve, 0.90),
            "mean_sigma": float(sigma.mean()),
        }
        c = curve[Z_GRID.index(1.65)]
        print(f"{label:12s} z=1.65 fill {c['fill_rate']:.3f}  inv ${c['avg_inventory_value']:,.0f}"
              f"   inv@95% {out['methods'][label]['inventory_at_95']}")
    (OUTPUTS / "inventory_sim.json").write_text(json.dumps(out, indent=2))
    return out


if __name__ == "__main__":
    main()

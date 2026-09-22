"""What is a better forecast worth? Replay the 28-day private-leaderboard window through an
inventory policy driven by each forecast and measure cost and service, not just error.

Policy (all 30,490 item-stores in parallel): periodic review every R = 7 days, lead time L = 3
days, order-up-to level

    S = forecast demand over the next R + L days  +  safety stock

and unmet demand is lost. Every method's uncertainty is measured out of sample, on its own
errors over the 28 days before the replay window, so a worse forecast pays twice: wrong order
quantities and more safety stock.

Three questions, each taken from recent research:

1. Service vs stock. Sweep the safety factor and trace fill rate against average inventory
   value; compare the stock each method needs for the same fill rate.
2. Does the most accurate forecast give the lowest cost? Theodorou, Spiliotis & Assimakopoulos
   (EJOR 2025, on M5 data) find accuracy matters most when holding cost is comparable to the
   cost of a lost sale, and that the most accurate method need not be cheapest when lost sales
   dominate, especially for intermittent items. Here each method gets its cost-minimising
   safety factor under three cost ratios, and the intermittent-demand specialists (SBA, TSB)
   are included on purpose.
3. Normal vs empirical safety stock. The textbook z * sigma * sqrt(R + L) assumes Gaussian iid
   errors; Trapero, Cardos & Kourentzes (Omega 2019; IJF 2019) show empirical quantiles of the
   actual errors set safety stock more reliably. Retail item-days are zero-heavy and skewed, so
   the Gaussian assumption is tested by the cycle service level each approach actually delivers.
"""
import json

import numpy as np
import pandas as pd
from scipy.stats import norm

from config import HORIZON, OUTPUTS
from wrmsse import load_raw

R, L = 7, 3
ORIGIN_SIGMA, ORIGIN_EVAL = 1913, 1941
Z_GRID = [0.0, 0.25, 0.5, 0.75, 1.0, 1.28, 1.65, 2.0, 2.33, 2.75, 3.0]
CSL_TARGETS = [0.80, 0.90, 0.95, 0.98]
# Lost-sale cost relative to the cost of holding one unit for one week (both as a share of
# shelf price). 1 = perishable / costly storage, 20 = typical grocery margin vs carrying cost.
COST_RATIOS = [1, 4, 20]
HOLD_PER_WEEK = 0.01          # 1% of price per unit-week (~50%/year incl. shrink and space)
METHODS = {
    "LightGBM (final)": "final",
    "Moving average": "MA",
    "SBA": "SBA",
    "TSB": "TSB",
    "sNaive": "sNaive",
}
VELOCITY_BINS = [0, 0.25, 1, 3, 10, np.inf]     # mean units/day, for pooled empirical quantiles


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


def simulate(demand, fc, ss, price):
    """Run the policy with a per-series safety stock vector; return service and stock KPIs."""
    n, T = demand.shape
    fc_ext = extend(fc, T + R + L)
    on_hand = fc_ext[:, :L].sum(axis=1) + ss            # stock to cover the first lead time
    pipeline = np.zeros((n, T + L + 1))
    served = np.zeros(n)
    inv_units_value = 0.0
    cycle_ok = np.ones((n, T // R), dtype=bool)
    for t in range(T):
        on_hand += pipeline[:, t]
        if t % R == 0:
            target = fc_ext[:, t:t + R + L].sum(axis=1) + ss
            position = on_hand + pipeline[:, t + 1:].sum(axis=1)
            pipeline[:, t + L] += np.maximum(target - position, 0)
        short = demand[:, t] > on_hand + 1e-9
        cycle_ok[:, t // R] &= ~short
        sold = np.minimum(on_hand, demand[:, t])
        served += sold
        on_hand -= sold
        inv_units_value += (on_hand * price).sum()
    lost_value = ((demand.sum(axis=1) - served) * price).sum()
    active = demand.sum(axis=1) > 0                       # CSL over items that sold something
    return {
        "fill_rate": float(served.sum() / demand.sum()),
        "avg_inventory_value": float(inv_units_value / T),
        "lost_sales_value": float(lost_value),
        "cycle_service_level": float(cycle_ok[active].mean()),
    }


def total_cost(kpi, ratio, T):
    hold = HOLD_PER_WEEK * kpi["avg_inventory_value"] * T / 7
    lost = HOLD_PER_WEEK * ratio * kpi["lost_sales_value"]
    return hold + lost, hold, lost


def empirical_factor(errors_window, sigma, velocity, q):
    """Pooled empirical quantile of standardised (R+L)-day cumulative errors, per velocity class.

    With 28 days per series there are only 19 overlapping (R+L)-day windows each, too few for
    a tail quantile, so windows are pooled across all series in the same demand-velocity class.
    """
    k = np.zeros(len(sigma))
    std = errors_window / np.maximum(sigma[:, None] * np.sqrt(R + L), 1e-6)
    cls = np.digitize(velocity, VELOCITY_BINS[1:-1])
    for c in np.unique(cls):
        m = cls == c
        k[m] = np.quantile(std[m].ravel(), q)
    return k


def main():
    full, calendar, prices = load_raw()
    cols = lambda o: [f"d_{d}" for d in range(o + 1, o + HORIZON + 1)]
    act_sigma = full[cols(ORIGIN_SIGMA)].to_numpy(float)
    demand = full[cols(ORIGIN_EVAL)].to_numpy(float)
    price = unit_prices(full, calendar, prices, ORIGIN_EVAL)
    T = demand.shape[1]
    velocity = full[[f"d_{d}" for d in range(ORIGIN_EVAL - 27, ORIGIN_EVAL + 1)]].to_numpy().mean(1)

    out = {"policy": {"review_days": R, "lead_time_days": L, "z_grid": Z_GRID,
                      "hold_per_week": HOLD_PER_WEEK, "cost_ratios": COST_RATIOS},
           "methods": {}}
    for label, key in METHODS.items():
        fc_sigma = np.load(OUTPUTS / f"preds_{key}_o{ORIGIN_SIGMA}.npy")
        fc_eval = np.load(OUTPUTS / f"preds_{key}_o{ORIGIN_EVAL}.npy")
        err = act_sigma - fc_sigma
        sigma = np.sqrt((err ** 2).mean(axis=1))
        wape = float(np.abs(demand - fc_eval).sum() / demand.sum())
        # 1. service vs stock curve (normal safety stock)
        curve = []
        for z in Z_GRID:
            k = simulate(demand, fc_eval, z * sigma * np.sqrt(R + L), price)
            k["z"] = z
            for ratio in COST_RATIOS:
                k[f"cost_r{ratio}"] = total_cost(k, ratio, T)[0]
            curve.append(k)
        # 2. cheapest safety factor per cost ratio
        best = {}
        for ratio in COST_RATIOS:
            c = min(curve, key=lambda x: x[f"cost_r{ratio}"])
            best[str(ratio)] = {"z": c["z"], "cost": c[f"cost_r{ratio}"],
                                "fill_rate": c["fill_rate"]}
        # 3. normal vs empirical safety stock at the same cycle-service target
        cum = np.stack([err[:, i:i + R + L].sum(axis=1) for i in range(T - R - L + 1)], axis=1)
        calib = []
        for q in CSL_TARGETS:
            normal = simulate(demand, fc_eval, norm.ppf(q) * sigma * np.sqrt(R + L), price)
            k_emp = empirical_factor(cum, sigma, velocity, q)
            emp = simulate(demand, fc_eval, np.maximum(k_emp, 0) * sigma * np.sqrt(R + L), price)
            calib.append({"target": q,
                          "normal_csl": normal["cycle_service_level"],
                          "normal_inventory": normal["avg_inventory_value"],
                          "empirical_csl": emp["cycle_service_level"],
                          "empirical_inventory": emp["avg_inventory_value"]})
        out["methods"][label] = {
            "wape": wape, "curve": curve, "best_by_ratio": best, "calibration": calib,
            "inventory_at_95": inventory_at_fill(curve, 0.95),
            "inventory_at_90": inventory_at_fill(curve, 0.90),
        }
        print(f"{label:18s} WAPE {wape:.3f}  inv@95% {out['methods'][label]['inventory_at_95']}"
              f"  best cost " + " ".join(f"r{r}:{best[str(r)]['cost']:,.0f}(z={best[str(r)]['z']})"
                                         for r in COST_RATIOS))
        for c in calib:
            print(f"    CSL target {c['target']:.2f}: normal {c['normal_csl']:.3f}"
                  f" (${c['normal_inventory']:,.0f})  empirical {c['empirical_csl']:.3f}"
                  f" (${c['empirical_inventory']:,.0f})")
    (OUTPUTS / "inventory_sim.json").write_text(json.dumps(out, indent=2))
    return out


def inventory_at_fill(curve, target):
    """Interpolate the average inventory value needed to hit a fill-rate target."""
    fr = np.array([c["fill_rate"] for c in curve])
    iv = np.array([c["avg_inventory_value"] for c in curve])
    if target < fr.min() or target > fr.max():
        return None
    return float(np.interp(target, fr, iv))


if __name__ == "__main__":
    main()

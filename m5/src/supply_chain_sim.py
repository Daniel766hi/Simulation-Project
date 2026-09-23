"""The bullwhip effect on real Walmart demand: a two-echelon supply chain driven by M5 data.

Network (per product): 10 stores -> 3 state distribution centres (DCs) -> supplier with
unlimited capacity. Consumer demand is the real M5 daily unit sales; every store forecast is a
real out-of-sample forecast made at a 28-day origin (models retrained every four weeks, the
retraining interval found near-optimal for M5 by the 2025 retraining-frequency study).

Policies
* Stores review every 7 days (all on the same weekday), order up to forecast demand over the
  next R + L days plus z * sigma * sqrt(R + L) from their DC; lead time 2 days if the DC has
  stock, otherwise the shortfall is back-ordered at the DC. Unmet consumer demand is lost.
* DCs review weekly, the day after store orders, with a 7-day supplier lead time, and order up
  to a forecast of what their stores will pull over the next R + L days plus safety stock.

The 2 x 2 x 2 experiment (Lee, Padmanabhan & Whang, 1997; Chen, Drezner, Ryan & Simchi-Levi,
2000; Disney & Towill, 2003):
* Forecast quality - stores order from the ML forecast, or from seasonal naive.
* Information sharing - the DC forecasts from the store orders it receives (exponential
  smoothing, the traditional set-up), or from the stores' shared point-of-sale demand forecasts.
  Its safety stock uses the error of the summed store forecasts, which carries the correlation
  between stores; the first version assumed independent store errors, under-stocked the DCs,
  and is kept as a comparison row.
* Order smoothing - orders close the whole gap to the order-up-to level (beta = 1), or only a
  share of it each review (proportional order-up-to, beta < 1; Disney & Towill, 2003).

Bullwhip at each echelon = Var(weekly orders placed) / Var(weekly consumer demand), pooled over
all product-DC pairs after a four-week warm-up. Every strategy is compared with the baseline
per product-DC pair with a paired Wilcoxon signed-rank test and a bootstrap confidence interval
of the mean difference, the same paired design used to compare policies in simulation studies.
A sweep over beta traces the frontier between bullwhip and total cost. The repository's
agent-based model (abm.html) shows the same mechanism with synthetic demand; this is the
real-data counterpart.
"""
import json

import numpy as np
from scipy.stats import norm

from config import HORIZON, OUTPUTS
from inventory_sim import unit_prices
from wrmsse import load_raw

WINDOWS = [1801, 1829, 1857, 1885, 1913, 1941]      # simulated; sigma from the window before
R_S, L_S = 7, 2          # store review period and DC-to-store lead time (days)
R_D, L_D = 7, 7          # DC review period and supplier lead time
Z = norm.ppf(0.95)
ALPHA_ES = 0.3           # exponential smoothing of received orders (no-sharing DC)
WARMUP_WEEKS = 4
HOLD_PER_WEEK = 0.01     # share of shelf price per unit-week, both echelons
LOST_SALE = 20           # lost sale cost as a multiple of weekly holding cost
BETA_SMOOTH = 0.4        # proportional order-up-to gain when smoothing is on


def window_forecasts(full, source, windows):
    """Forecast matrices per window origin: the ML pipeline or seasonal naive."""
    out = {}
    for o in windows:
        if source == "ml":
            out[o] = np.load(OUTPUTS / f"preds_{ML_NAME}_o{o}.npy").astype(float)
        else:
            last = full[[f"d_{d}" for d in range(o - 6, o + 1)]].to_numpy(float)
            out[o] = np.tile(last, HORIZON // 7)
    return out


ML_NAME = "bt_final"


def pout(forecast_review, target, position, beta):
    """Proportional order-up-to: expected review-period demand plus a share of the gap.
    beta = 1 is the standard order-up-to policy."""
    return np.maximum(forecast_review + beta * (target - forecast_review - position), 0)


def simulate(full, fc, sigma_fc, price, windows, sharing, beta=1.0, sigma_dc=None,
             demand_mult=None, store_fc_mult=None, dc_fc_mult=None):
    """Run the whole network day by day, vectorised over all item-stores and item-DCs.

    demand_mult scales real demand (promotional shocks); store_fc_mult / dc_fc_mult scale the
    forecasts the stores and the sharing DCs use, i.e. who knows about the promotion.
    """
    n = len(full)
    dc_key = (full["item_id"] + "|" + full["state_id"]).to_numpy()
    dc_codes, dc_idx = np.unique(dc_key, return_inverse=True)
    n_dc = len(dc_codes)
    first, last = windows[0] + 1, windows[-1] + HORIZON
    T = last - first + 1
    demand = full[[f"d_{d}" for d in range(first, last + 1)]].to_numpy(float)
    if demand_mult is not None:
        demand = demand * demand_mult
    dc_price = np.bincount(dc_idx, weights=price, minlength=n_dc) / np.bincount(dc_idx, minlength=n_dc)

    def fc_at(t, days, mult=None):
        """Store forecast of the next `days` days, made at the latest origin <= day t."""
        d = first + t
        o = max(w for w in windows if w < d)
        f = fc[o]
        start = d - o - 1
        idx = np.arange(start, start + days)
        idx = np.where(idx < HORIZON, idx, HORIZON - 7 + (idx - HORIZON) % 7)
        vals = f[:, idx]
        if mult is not None:
            cols = np.minimum(np.arange(t, t + days), T - 1)
            vals = vals * mult[:, cols]
        return vals.sum(axis=1), o

    # initial state: stores hold their first lead time plus safety stock, DCs a full cycle
    f0, o0 = fc_at(0, R_S + L_S)
    ss_s = Z * sigma_fc[o0] * np.sqrt(R_S + L_S)
    s_on = fc_at(0, L_S)[0] + ss_s
    s_pipe = np.zeros((n, T + L_S + 1))
    owed = np.zeros(n)                              # store orders back-ordered at the DC
    d_on = np.bincount(dc_idx, weights=fc_at(0, R_D + L_D)[0], minlength=n_dc) * 1.2
    d_pipe = np.zeros((n_dc, T + L_D + 1))
    es_level = np.bincount(dc_idx, weights=f0 / (R_S + L_S) * 7, minlength=n_dc)
    es_var = es_level ** 2 * 0.25
    weeks = T // 7
    w_dem = np.zeros((n_dc, weeks))
    w_sord = np.zeros((n_dc, weeks))
    w_dord = np.zeros((n_dc, weeks))
    lost = np.zeros(n)
    served = np.zeros(n)
    s_inv_units = np.zeros(n)
    d_inv_units = np.zeros(n_dc)
    s_inv_val = d_inv_val = 0.0
    d_short_units = d_req_units = 0.0
    measure_from = WARMUP_WEEKS * 7

    for t in range(T):
        wk = t // 7
        # arrivals
        s_on += s_pipe[:, t]
        d_on += d_pipe[:, t]
        # DC first clears back-orders, pro rata when it cannot cover them all
        if owed.any():
            need = np.bincount(dc_idx, weights=owed, minlength=n_dc)
            ratio = np.where(need > 0, np.minimum(d_on / np.maximum(need, 1e-9), 1), 0)
            ship = owed * ratio[dc_idx]
            d_on -= np.bincount(dc_idx, weights=ship, minlength=n_dc)
            owed -= ship
            s_pipe[:, t + L_S] += ship
        # store review
        if t % R_S == 0:
            f, o = fc_at(t, R_S + L_S, store_fc_mult)
            ss_s = Z * sigma_fc[o] * np.sqrt(R_S + L_S)
            position = s_on + s_pipe[:, t + 1:].sum(axis=1) + owed
            q = pout(fc_at(t, R_S, store_fc_mult)[0], f + ss_s, position, beta)
            need = np.bincount(dc_idx, weights=q, minlength=n_dc)
            ratio = np.where(need > 0, np.minimum(d_on / np.maximum(need, 1e-9), 1), 1)
            ship = q * ratio[dc_idx]
            d_on -= np.bincount(dc_idx, weights=ship, minlength=n_dc)
            owed += q - ship
            s_pipe[:, t + L_S] += ship
            if wk < weeks:
                w_sord[:, wk] += need
            if t >= measure_from:
                d_req_units += need.sum()
                d_short_units += (need - np.bincount(dc_idx, weights=ship, minlength=n_dc)).sum()
            # traditional DC forecast: exponential smoothing of weekly orders received
            err = need - es_level
            es_var = (1 - ALPHA_ES) * es_var + ALPHA_ES * err ** 2
            es_level = es_level + ALPHA_ES * err
        # DC review, the day after store orders
        if t % R_D == 1:
            if sharing:
                f, o = fc_at(t, R_D + L_D, dc_fc_mult)
                mean = np.bincount(dc_idx, weights=f, minlength=n_dc)
                if sigma_dc is not None:
                    # correlation-aware: sd of the DC-level (summed) forecast error
                    sd = sigma_dc[o]
                else:
                    # independence assumption: store errors add in quadrature
                    sd = np.sqrt(np.bincount(dc_idx, weights=sigma_fc[o] ** 2, minlength=n_dc))
                ss_d = Z * sd * np.sqrt(R_D + L_D)
            else:
                mean = es_level * (R_D + L_D) / 7
                ss_d = Z * np.sqrt(es_var) * np.sqrt((R_D + L_D) / 7)
            position = (d_on + d_pipe[:, t + 1:].sum(axis=1)
                        - np.bincount(dc_idx, weights=owed, minlength=n_dc))
            q_d = pout(mean * R_D / (R_D + L_D), mean + ss_d, position, beta)
            d_pipe[:, t + L_D] += q_d
            if wk < weeks:
                w_dord[:, wk] += q_d
        # consumer demand at stores
        sold = np.minimum(s_on, demand[:, t])
        s_on -= sold
        if wk < weeks:
            w_dem[:, wk] += np.bincount(dc_idx, weights=demand[:, t], minlength=n_dc)
        if t >= measure_from:
            served += sold
            lost += demand[:, t] - sold
            s_inv_val += (s_on * price).sum()
            d_inv_val += (d_on * dc_price).sum()
            s_inv_units += s_on
            d_inv_units += d_on

    keep = slice(WARMUP_WEEKS, weeks)
    dem, so, do = w_dem[:, keep], w_sord[:, keep], w_dord[:, keep]
    v_dem = dem.var(axis=1).sum()
    days = T - measure_from
    hold = HOLD_PER_WEEK * (s_inv_val + d_inv_val) / 7
    lost_value = (lost * price).sum()
    # per product-DC outcomes for the paired tests
    per_cost = (HOLD_PER_WEEK / 7 * (np.bincount(dc_idx, weights=s_inv_units * price, minlength=n_dc)
                                     + d_inv_units * dc_price)
                + HOLD_PER_WEEK * LOST_SALE * np.bincount(dc_idx, weights=lost * price, minlength=n_dc))
    vd = dem.var(axis=1)
    ok = vd > 0
    per_bw = np.full(n_dc, np.nan)
    per_bw[ok] = do.var(axis=1)[ok] / vd[ok]
    return {
        "_per_dc_cost": per_cost, "_per_dc_bullwhip": per_bw,
        "bullwhip_store_orders": float(so.var(axis=1).sum() / v_dem),
        "bullwhip_dc_orders": float(do.var(axis=1).sum() / v_dem),
        "store_fill_rate": float(served.sum() / (served.sum() + lost.sum())),
        "dc_fill_rate": float(1 - d_short_units / max(d_req_units, 1e-9)),
        "avg_store_inventory": float(s_inv_val / days),
        "avg_dc_inventory": float(d_inv_val / days),
        "holding_cost": float(hold),
        "lost_sales_cost": float(HOLD_PER_WEEK * LOST_SALE * lost_value),
        "total_cost": float(hold + HOLD_PER_WEEK * LOST_SALE * lost_value),
        "weekly": {"demand": dem.sum(axis=0).tolist(), "store_orders": so.sum(axis=0).tolist(),
                   "dc_orders": do.sum(axis=0).tolist()},
        "weeks_measured": int(dem.shape[1]),
    }


def paired(a, b, rng, n_boot=2000):
    """Paired comparison of per product-DC outcomes: b - a (negative = b is lower)."""
    from scipy.stats import wilcoxon
    m = np.isfinite(a) & np.isfinite(b)
    d = b[m] - a[m]
    stat = wilcoxon(d[d != 0])
    idx = rng.integers(0, len(d), size=(n_boot, len(d)))
    boot = d[idx].mean(axis=1)
    return {"n": int(m.sum()), "mean_diff": float(d.mean()), "median_diff": float(np.median(d)),
            "ci95": [float(np.quantile(boot, 0.025)), float(np.quantile(boot, 0.975))],
            "share_improved": float((d < 0).mean()), "wilcoxon_p": float(stat.pvalue)}


SCENARIOS = [(src, sh, beta) for src in ("snaive", "ml") for sh in (False, True)
             for beta in (1.0, BETA_SMOOTH)]


def label(src, sh, beta):
    return (("ML forecast" if src == "ml" else "Seasonal naive") + (" + sharing" if sh else "")
            + (" + smoothing" if beta < 1 else ""))


PROMO_SHARE, PROMO_LIFT, PROMO_DIP, PROMOS_PER_ITEM = 0.15, 1.0, 0.25, 2


def promo_calendar(full, windows, seed=11):
    """Synthetic promotions on real demand: for 15% of products in each state, two one-week
    promotions (+100%) at random weeks after the warm-up, each followed by a week at -25%
    (customers stocked up: the pull-forward dip). Returns a day-level demand multiplier."""
    rng = np.random.default_rng(seed)
    first, last = windows[0] + 1, windows[-1] + HORIZON
    T = last - first + 1
    weeks = T // 7
    dc_key = (full["item_id"] + "|" + full["state_id"]).to_numpy()
    codes, dc_idx = np.unique(dc_key, return_inverse=True)
    chosen = rng.random(len(codes)) < PROMO_SHARE
    mult_dc = np.ones((len(codes), T))
    for c in np.flatnonzero(chosen):
        for wk in rng.choice(np.arange(WARMUP_WEEKS, weeks - 1), PROMOS_PER_ITEM, replace=False):
            mult_dc[c, wk * 7:wk * 7 + 7] *= 1 + PROMO_LIFT
            mult_dc[c, wk * 7 + 7:wk * 7 + 14] *= 1 - PROMO_DIP
    return mult_dc[dc_idx], chosen


def promotion_experiment(full, fcs, sigmas, sig_dc, price, windows):
    """Who needs to know about a promotion? ML forecast, sharing DCs, four information set-ups."""
    mult, promo_dc = promo_calendar(full, windows)
    base_args = (full, fcs["ml"], sigmas["ml"], price, windows)
    setups = {
        "No promotion": dict(sharing=True),
        "Surprise promotion (nobody knew)": dict(sharing=True, demand_mult=mult),
        "Stores knew, DC saw only orders": dict(sharing=False, demand_mult=mult, store_fc_mult=mult),
        "Stores knew, DC used unadjusted shared forecasts": dict(sharing=True, demand_mult=mult,
                                                                 store_fc_mult=mult),
        "Promotion calendar shared across the chain": dict(sharing=True, demand_mult=mult,
                                                           store_fc_mult=mult, dc_fc_mult=mult),
    }
    res, per = {}, {}
    for name, kw in setups.items():
        r = simulate(*base_args, sigma_dc=sig_dc["ml"], **kw)
        per[name] = r.pop("_per_dc_cost")
        r.pop("_per_dc_bullwhip")
        res[name] = r
        print(f"promo | {name:50s} DC bullwhip {r['bullwhip_dc_orders']:.2f}  store fill "
              f"{r['store_fill_rate']:.3f}  DC fill {r['dc_fill_rate']:.3f}  cost ${r['total_cost']:,.0f}")
    ref = "Surprise promotion (nobody knew)"
    rng = np.random.default_rng(1)
    # paired over the promoted product-DC pairs only: the others are unaffected by design
    tests = {k: paired(per[ref][promo_dc], per[k][promo_dc], rng)
             for k in setups if k not in (ref, "No promotion")}
    return {"setups": res, "paired_vs_surprise": tests,
            "design": {"share_of_products": PROMO_SHARE, "lift": PROMO_LIFT, "dip": PROMO_DIP,
                       "promotions_per_product": PROMOS_PER_ITEM,
                       "promoted_product_dcs": int(promo_dc.sum())}}


def main(windows=WINDOWS):
    full, calendar, prices = load_raw()
    price = unit_prices(full, calendar, prices, windows[0])
    prev = [windows[0] - HORIZON] + windows[:-1]           # sigma from the window before
    dc_idx = np.unique((full["item_id"] + "|" + full["state_id"]).to_numpy(), return_inverse=True)[1]
    fcs, sigmas, sig_dc = {}, {}, {}
    for source in ("ml", "snaive"):
        fcs[source] = window_forecasts(full, source, sorted(set(windows + prev)))
        sigmas[source], sig_dc[source] = {}, {}
        for o, p in zip(windows, prev):
            act = full[[f"d_{d}" for d in range(p + 1, p + HORIZON + 1)]].to_numpy(float)
            err = act - fcs[source][p]
            sigmas[source][o] = np.sqrt((err ** 2).mean(axis=1))
            agg_err = np.stack([np.bincount(dc_idx, weights=err[:, j]) for j in range(HORIZON)], 1)
            sig_dc[source][o] = np.sqrt((agg_err ** 2).mean(axis=1))
    results, per = {}, {}
    for src, sh, beta in SCENARIOS:
        key = label(src, sh, beta)
        res = simulate(full, fcs[src], sigmas[src], price, windows, sh, beta, sig_dc[src])
        per[key] = (res.pop("_per_dc_cost"), res.pop("_per_dc_bullwhip"))
        results[key] = res
        print(f"{key:44s} bullwhip store {res['bullwhip_store_orders']:.2f}  "
              f"DC {res['bullwhip_dc_orders']:.2f}  store fill {res['store_fill_rate']:.3f}  "
              f"DC fill {res['dc_fill_rate']:.3f}  inv S ${res['avg_store_inventory']:,.0f} "
              f"DC ${res['avg_dc_inventory']:,.0f}  cost ${res['total_cost']:,.0f}")
    # the flaw the first version exposed: sharing with an independence-based DC safety stock
    for src in ("snaive", "ml"):
        key = label(src, True, 1.0) + " (independent-error safety stock)"
        res = simulate(full, fcs[src], sigmas[src], price, windows, True, 1.0, None)
        per[key] = (res.pop("_per_dc_cost"), res.pop("_per_dc_bullwhip"))
        results[key] = res
        print(f"{key:60s} DC fill {res['dc_fill_rate']:.3f}  DC inv ${res['avg_dc_inventory']:,.0f}"
              f"  cost ${res['total_cost']:,.0f}")
    base = label("snaive", False, 1.0)
    rng = np.random.default_rng(0)
    tests = {}
    for key in results:
        if key == base:
            continue
        with np.errstate(divide="ignore"):
            lb, lk = np.log(per[base][1]), np.log(per[key][1])
        tests[key] = {"cost": paired(per[base][0], per[key][0], rng),
                      "log_bullwhip_dc": paired(lb, lk, rng)}
        c = tests[key]["cost"]
        print(f"  vs baseline: {key:44s} cost diff per product-DC {c['mean_diff']:+.2f} "
              f"CI [{c['ci95'][0]:+.2f}, {c['ci95'][1]:+.2f}]  improved {c['share_improved']:.0%}  "
              f"p={c['wilcoxon_p']:.1e}")
    sweep = {}
    for src, sh in (("snaive", False), ("ml", True)):
        name = label(src, sh, 1.0)
        sweep[name] = []
        for beta in (0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0):
            r = simulate(full, fcs[src], sigmas[src], price, windows, sh, beta, sig_dc[src])
            sweep[name].append({"beta": beta, "bullwhip_dc": r["bullwhip_dc_orders"],
                                "bullwhip_store": r["bullwhip_store_orders"],
                                "total_cost": r["total_cost"], "store_fill": r["store_fill_rate"]})
        best = min(sweep[name], key=lambda x: x["total_cost"])
        print(f"beta sweep {name:28s} cost-optimal beta {best['beta']}  cost ${best['total_cost']:,.0f}"
              f"  DC bullwhip {best['bullwhip_dc']:.2f}")
    promo = promotion_experiment(full, fcs, sigmas, sig_dc, price, windows)
    out = {"windows": windows, "baseline": base, "beta_sweep": sweep, "promotions": promo,
           "policy": {"store_review": R_S, "store_lead": L_S, "dc_review": R_D, "dc_lead": L_D,
                      "service": 0.95, "alpha_es": ALPHA_ES, "beta_smoothing": BETA_SMOOTH,
                      "warmup_weeks": WARMUP_WEEKS, "hold_per_week": HOLD_PER_WEEK,
                      "lost_sale_multiple": LOST_SALE},
           "results": results, "paired_tests": tests}
    (OUTPUTS / "supply_chain.json").write_text(json.dumps(out, indent=2))
    return out


if __name__ == "__main__":
    main()

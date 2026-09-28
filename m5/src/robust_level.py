"""Robust level control: ensemble weights, alignment and bias correction chosen walk-forward.

The post-mortem and the seven-window backtest showed where accuracy is lost. The level (total
forecast / actual) decides most of the score, the store calibration step helped in only 3 of 7
windows, and ensemble weights picked on three windows did not carry over. This step asks whether
a more careful rule does better, under a strict protocol:

    For each window t, every setting (member weights, alignment strength alpha, bias rule) is
    chosen by its mean WRMSSE on the windows before t only, and then scored once on t.

So each reported score is out of sample for the choice made. Windows with fewer than two earlier
windows cannot be scored this way. Two caveats are stated in the output and the README: the menu
of rules was written after the backtest had been seen, and the private window (origin 1941)
was already known, so neither result can replace the pre-registered 0.5866.

Bias rules (applied per store to the aligned forecast, factor clipped to 0.8-1.25):
    none         no correction
    pooled       actual / forecast pooled over all earlier windows (the frozen pipeline's rule)
    last         actual / forecast of the most recent window only
    persistent-k correct only stores whose bias had the same sign in each of the last k windows,
                 by the mean ratio of those windows; other stores are left alone
Each rule also comes at half strength (shrink 0.5).
"""
import itertools
import json

import numpy as np

import calibrate
import reconcile
from config import HORIZON, OUTPUTS
from score import evaluator
from wrmsse import load_raw

ORIGINS = [1773, 1801, 1829, 1857, 1885, 1913, 1941]
ROLE = {1773: "backtest", 1801: "backtest", 1829: "backtest", 1857: "selection",
        1885: "selection", 1913: "selection", 1941: "private (already seen)"}
MEMBERS = ["recursive_store", "recursive2_store", "mh_store"]
STEP = 0.25
WEIGHTS = [w for w in itertools.product(np.arange(0, 1 + 1e-9, STEP), repeat=3)
           if abs(sum(w) - 1) < 1e-9]
ALPHAS = [0.0, 0.25, 0.5, 0.75, 1.0]
RULES = [(r, s) for r in ("none", "pooled", "last", "persistent-2", "persistent-3")
         for s in ((1.0,) if r == "none" else (0.5, 1.0))]
FROZEN = ((0.0, 0.5, 0.5), 0.5, ("pooled", 1.0))


def agg_forecast(A, keys, cal, o):
    path = OUTPUTS / f"agg_L9_o{o}.npy"
    if not path.exists():
        np.save(path, reconcile.forecast_aggregates(A, keys, cal, o))
    return np.load(path)


def ratios(fc_by_window, act_by_window, codes, n):
    """actual / forecast per store for each window."""
    out = []
    for fc, act in zip(fc_by_window, act_by_window):
        f, a = np.zeros(n), np.zeros(n)
        np.add.at(f, codes, fc.sum(axis=1))
        np.add.at(a, codes, act.sum(axis=1))
        out.append(np.where(f > 0, a / np.maximum(f, 1e-9), 1.0))
    return np.array(out)


def factor(rule, shrink, prior_fc, prior_act, codes, n):
    """Per-store multiplier from earlier windows' forecasts and actuals (no data from t)."""
    name = rule.split("-")[0]
    if rule == "none" or not prior_fc:
        return np.ones(n)
    if name == "pooled":
        f, a = np.zeros(n), np.zeros(n)
        for fc, act in zip(prior_fc, prior_act):
            np.add.at(f, codes, fc.sum(axis=1))
            np.add.at(a, codes, act.sum(axis=1))
        r = np.where(f > 0, a / np.maximum(f, 1e-9), 1.0)
    elif name == "last":
        r = ratios(prior_fc[-1:], prior_act[-1:], codes, n)[0]
    else:
        k = int(rule.split("-")[1])
        if len(prior_fc) < k:
            return np.ones(n)
        R = ratios(prior_fc[-k:], prior_act[-k:], codes, n)
        same = np.all(R > 1, axis=0) | np.all(R < 1, axis=0)
        r = np.where(same, R.mean(axis=0), 1.0)
    return np.clip(1 + shrink * (r - 1), 0.8, 1.25)


def main():
    full, calendar, _ = load_raw()
    cal = reconcile.calendar_frame(calendar)
    S9, A, keys = reconcile.aggregate_series(full)
    codes = calibrate.group_codes(full, calibrate.GRAINS["store"])
    n = codes.max() + 1
    members = {o: np.stack([np.load(OUTPUTS / f"preds_{m}_o{o}.npy") for m in MEMBERS])
               for o in ORIGINS}
    acts = {o: full[[f"d_{d}" for d in range(o + 1, o + HORIZON + 1)]].to_numpy(float)
            for o in ORIGINS}
    aggs = {o: agg_forecast(A, keys, cal, o) for o in ORIGINS}
    evs = {o: evaluator(o) for o in ORIGINS}

    # Score every setting at every window. Bias factors at window j use windows before j only.
    score = {}
    for w in WEIGHTS:
        for alpha in ALPHAS:
            aligned = {o: reconcile.align(np.tensordot(w, members[o], 1), S9, aggs[o], alpha)
                       for o in ORIGINS}
            for rule, shrink in RULES:
                for j, o in enumerate(ORIGINS):
                    prior = ORIGINS[:j]
                    f = factor(rule, shrink, [aligned[p] for p in prior],
                               [acts[p] for p in prior], codes, n)
                    score[(w, alpha, (rule, shrink), o)] = evs[o].score(aligned[o] * f[codes][:, None])[0]
        print("weights", w, "done", flush=True)

    frozen_w, frozen_a = FROZEN[0], FROZEN[1]
    menus = {
        "full grid (weights x alpha x rule)": sorted({k[:3] for k in score}),
        "bias rule only (frozen weights and alpha)": [(frozen_w, frozen_a, r) for r in RULES],
        "calibration strength only (none / half / full)":
            [(frozen_w, frozen_a, r) for r in (("none", 1.0), ("pooled", 0.5), ("pooled", 1.0))],
    }
    def mean_before(st, t):
        return np.mean([score[(*st, p)] for p in ORIGINS[:ORIGINS.index(t)]])
    results = {}
    for label, settings in menus.items():
        rows = {}
        for t in ORIGINS[2:]:
            chosen = min(settings, key=lambda st: mean_before(st, t))
            rows[str(t)] = {"role": ROLE[t],
                            "chosen": {"weights": dict(zip(MEMBERS, map(float, chosen[0]))),
                                       "alpha": chosen[1], "rule": chosen[2][0],
                                       "shrink": chosen[2][1]},
                            "wrmsse": score[(*chosen, t)], "frozen": score[(*FROZEN, t)]}
        scored = [t for t in rows if not ROLE[int(t)].startswith("private")]
        results[label] = {
            "settings": len(settings), "windows": rows,
            "mean": float(np.mean([rows[t]["wrmsse"] for t in scored])),
            "frozen_mean": float(np.mean([rows[t]["frozen"] for t in scored])),
            "wins": int(sum(rows[t]["wrmsse"] < rows[t]["frozen"] - 1e-9 for t in scored)),
            "ties": int(sum(abs(rows[t]["wrmsse"] - rows[t]["frozen"]) <= 1e-9 for t in scored)),
            "of": len(scored), "scored_windows": scored,
            "private": rows["1941"]["wrmsse"], "private_frozen": rows["1941"]["frozen"]}
        r = results[label]
        print(f"{label}: {r['settings']} settings, mean {r['mean']:.4f} vs frozen "
              f"{r['frozen_mean']:.4f} over {scored}; wins {r['wins']}, ties {r['ties']} of "
              f"{r['of']}; private {r['private']:.4f} vs {r['private_frozen']:.4f}")
    # How each bias rule does on its own, with the frozen weights and alpha, over all windows it
    # can be applied to (diagnostic; not used for any choice).
    per_rule = {f"{r}|{s}": {str(o): score[((0.0, 0.5, 0.5), 0.5, (r, s), o)] for o in ORIGINS[1:]}
                for r, s in RULES}
    caveat = ("Rule menu written after the backtest was seen; private window already known. "
              "Does not replace the pre-registered 0.5866.")
    (OUTPUTS / "robust_level.json").write_text(json.dumps(
        {"menus": results, "per_rule": per_rule, "caveat": caveat}, indent=2))


if __name__ == "__main__":
    main()

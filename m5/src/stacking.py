"""Stacked ensemble: learn blend weights instead of the fixed 50/50, then test them on untouched windows.

Pre-registered (this file and outputs/stack_weights.json are committed before any model for the
holdout windows 1661, 1633 and 1605 has finished training; the fit never reads those windows):

Members, built exactly as in extended_comparison.py:
    ours          0.5 recursive2 + 0.5 multi-horizon, aligned, walk-forward store calibration
    ours_masked   the same with stock-out days masked in training
    win_rec       mean of the winner recipe's three recursive components (store, store x cat, store x dept)
    win_dir       mean of the winner recipe's three direct components

Fit. Non-negative weights summing to one, chosen to minimise mean WRMSSE over the six finished
windows (1689, 1717, 1745, 1773, 1801, 1829). Four weights on six windows: few enough to limit
overfitting. Weights are frozen in outputs/stack_weights.json.

Test. On the holdout windows the stack is compared with the winner recipe and with the
pre-registered 50/50 combination. Three windows cannot give a significant test, so the holdout is
reported descriptively (mean WRMSSE and wins), and the stack is only called better if it beats
both on the holdout mean. The nine-window hypothesis test in extended_comparison.py is unchanged.

Usage:  python3 stacking.py fit    |    python3 stacking.py test
"""
import json
import sys

import numpy as np
from scipy import optimize

import calibrate
import reconcile
from config import HORIZON, OUTPUTS
from extended_comparison import ALPHA, MEMBERS, ORIGINS, agg_forecast, complete, load
from score import evaluator
from wrmsse import load_raw

FIT_WINDOWS = [1689, 1717, 1745, 1773, 1801, 1829]
HOLDOUT = [1605, 1633, 1661]
NAMES = ["ours", "ours_masked", "win_rec", "win_dir"]
REC = [f"recursive_win_{p}" for p in ("store", "store_cat", "store_dept")]
DIR = [f"direct_win_{p}" for p in ("store", "store_cat", "store_dept")]


def members(windows):
    """Member forecasts for the given windows (calibration walks forward in ORIGINS order)."""
    full, calendar, _ = load_raw()
    cal = reconcile.calendar_frame(calendar)
    S9, A, keys = reconcile.aggregate_series(full)
    codes = calibrate.group_codes(full, calibrate.GRAINS["store"])
    n = codes.max() + 1
    order = [o for o in ORIGINS if o in windows]
    acts = {o: full[[f"d_{d}" for d in range(o + 1, o + HORIZON + 1)]].to_numpy(float) for o in order}
    out = {o: {} for o in order}
    for label, (rec, mh) in MEMBERS.items():
        aligned = {}
        for i, o in enumerate(order):
            ens = 0.5 * load(rec, o) + 0.5 * load(mh, o)
            aligned[o] = reconcile.align(ens, S9, agg_forecast(A, keys, cal, o), ALPHA)
            f_sum, a_sum = np.zeros(n), np.zeros(n)
            for p in order[:i]:
                np.add.at(f_sum, codes, aligned[p].sum(axis=1))
                np.add.at(a_sum, codes, acts[p].sum(axis=1))
            f = np.clip(np.where(f_sum > 0, a_sum / np.maximum(f_sum, 1e-9), 1.0), 0.8, 1.25)
            out[o][label] = aligned[o] * f[codes][:, None]
    for o in order:
        out[o]["win_rec"] = np.mean([load(c, o) for c in REC], axis=0)
        out[o]["win_dir"] = np.mean([load(c, o) for c in DIR], axis=0)
    return out


def blend(m, w):
    return sum(wi * m[k] for wi, k in zip(w, NAMES))


def to_weights(z):
    e = np.exp(z - z.max())
    return e / e.sum()


def fit():
    assert all(complete(o) for o in FIT_WINDOWS)
    m = members(FIT_WINDOWS)
    evs = {o: evaluator(o) for o in FIT_WINDOWS}
    calls = [0]

    def loss(z):
        w = to_weights(z)
        calls[0] += 1
        return float(np.mean([evs[o].score(blend(m[o], w))[0] for o in FIT_WINDOWS]))

    best = None
    for start in (np.zeros(4), np.array([1.0, 0, 0.5, 0.5]), np.array([0, 1.0, 0.5, 0.5])):
        r = optimize.minimize(loss, start, method="Nelder-Mead", options={"xatol": 1e-3, "fatol": 1e-5, "maxiter": 400})
        if best is None or r.fun < best.fun:
            best = r
        print("start", start, "->", round(r.fun, 5), flush=True)
    w = to_weights(best.x)
    per = {}
    for o in FIT_WINDOWS:
        win = 0.5 * m[o]["win_rec"] + 0.5 * m[o]["win_dir"]
        per[str(o)] = {"stack": evs[o].score(blend(m[o], w))[0], "winner": evs[o].score(win)[0],
                       "combined": evs[o].score(0.5 * win + 0.5 * m[o]["ours"])[0]}
    res = {"weights": dict(zip(NAMES, map(float, w))), "fit_windows": FIT_WINDOWS, "holdout": HOLDOUT,
           "fit_mean": {k: float(np.mean([per[str(o)][k] for o in FIT_WINDOWS])) for k in ("stack", "winner", "combined")},
           "fit_per_window": per, "loss_calls": calls[0],
           "note": "In-sample fit on six windows. Only the holdout result counts as evidence."}
    (OUTPUTS / "stack_weights.json").write_text(json.dumps(res, indent=2))
    print(json.dumps(res, indent=1))


def test():
    frozen = json.loads((OUTPUTS / "stack_weights.json").read_text())
    w = np.array([frozen["weights"][k] for k in NAMES])
    done = [o for o in HOLDOUT if complete(o)]
    print("holdout windows complete:", done)
    if not done:
        return
    m = members(done)
    rows = {}
    for o in done:
        ev = evaluator(o)
        win = 0.5 * m[o]["win_rec"] + 0.5 * m[o]["win_dir"]
        rows[str(o)] = {"stack": ev.score(blend(m[o], w))[0], "winner": ev.score(win)[0],
                        "combined": ev.score(0.5 * win + 0.5 * m[o]["ours"])[0]}
        print(o, {k: round(v, 4) for k, v in rows[str(o)].items()}, flush=True)
    mean = {k: float(np.mean([r[k] for r in rows.values()])) for k in ("stack", "winner", "combined")}
    res = {"weights": frozen["weights"], "windows": rows, "mean": mean, "complete": len(done), "planned": len(HOLDOUT),
           "stack_wins_vs_winner": sum(r["stack"] < r["winner"] for r in rows.values()),
           "stack_wins_vs_combined": sum(r["stack"] < r["combined"] for r in rows.values()),
           "better_than_both": bool(len(done) == len(HOLDOUT) and mean["stack"] < min(mean["winner"], mean["combined"]))}
    (OUTPUTS / "stack_holdout.json").write_text(json.dumps(res, indent=2))
    print(json.dumps(res, indent=1))


if __name__ == "__main__":
    {"fit": fit, "test": test}[sys.argv[1]]()

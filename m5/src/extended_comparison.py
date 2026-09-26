"""Roadmap step 1: is the lead over the M5 winner's recipe real? Nine untouched windows.

Pre-registered (committed before any model for the new windows was scored):

Windows. Origins 1605, 1633, ..., 1829 (nine 28-day windows, d1606-1857), none used for any
choice in this project. The private window (1941) and the selection windows (1857-1913) are
excluded.

Methods, all trained from scratch at each origin and processed identically:
    winner      the winner's recipe at equal compute (winner_comparison.py)
    ours        frozen pipeline: 0.5 recursive2 + 0.5 multi-horizon, store x department
                alignment (alpha 0.5), store calibration pooled over all earlier windows in
                this sequence (walk-forward; the first window is uncalibrated)
    ours_masked the same with stock-out days masked in training (adopted in stockout_retrain.py)
    combined    0.5 winner + 0.5 ours   (the combination pre-registered in winner_comparison.py)
    combined_masked  0.5 winner + 0.5 ours_masked   (exploratory: not pre-registered earlier)

Hypotheses, each tested on the per-window WRMSSE differences d = method - winner:
    H1 (primary)   combined beats winner
    H2             ours beats winner
    H3             ours_masked beats winner
Tests: one-sided Wilcoxon signed-rank on d, and a Diebold-Mariano-style one-sided t-test on
mean(d) (with nine windows, 28 days apart and non-overlapping, windows are treated as
independent). A hypothesis counts as supported only if both p-values are below 0.05; otherwise
it is reported as not proven, whatever the mean says.
"""
import json

import numpy as np
from scipy import stats

import calibrate
import reconcile
from config import HORIZON, OUTPUTS
from score import evaluator
from wrmsse import load_raw

ORIGINS = [1605, 1633, 1661, 1689, 1717, 1745, 1773, 1801, 1829]
WIN_COMPONENTS = [f"{k}_win_{p}" for k in ("recursive", "direct")
                  for p in ("store", "store_cat", "store_dept")]
MEMBERS = {"ours": ("recursive2_store", "mh_store"),
           "ours_masked": ("recursive2m_store", "mhm_store")}
ALPHA = 0.5
HYPOTHESES = {"H1": "combined", "H2": "ours", "H3": "ours_masked"}


def have(name, o):
    return (OUTPUTS / f"preds_{name}_o{o}.npy").exists()


def load(name, o):
    return np.load(OUTPUTS / f"preds_{name}_o{o}.npy")


def agg_forecast(A, keys, cal, o):
    path = OUTPUTS / f"agg_L9_o{o}.npy"
    if not path.exists():
        np.save(path, reconcile.forecast_aggregates(A, keys, cal, o))
    return np.load(path)


def complete(o):
    return all(have(n, o) for n in WIN_COMPONENTS + [m for v in MEMBERS.values() for m in v])


def test(d):
    """One-sided tests that the differences d (method - winner) are below zero."""
    d = np.asarray(d)
    w = stats.wilcoxon(d, alternative="less").pvalue if np.any(d != 0) else 1.0
    t = stats.ttest_1samp(d, 0.0, alternative="less").pvalue
    return {"mean_diff": float(d.mean()), "wins": int((d < 0).sum()), "n": len(d),
            "wilcoxon_p": float(w), "dm_t_p": float(t),
            "supported": bool(w < 0.05 and t < 0.05)}


def ours_members(windows):
    """This pipeline's members (MEMBERS) for the given windows: 0.5 recursive + 0.5 multi-horizon,
    aligned to store x department, then store calibration pooled over the earlier windows among
    `windows` (walk-forward in time order; the first is uncalibrated). A window's forecast
    therefore depends on which earlier windows are passed in."""
    full, calendar, _ = load_raw()
    cal = reconcile.calendar_frame(calendar)
    S9, A, keys = reconcile.aggregate_series(full)
    codes = calibrate.group_codes(full, calibrate.GRAINS["store"])
    n = codes.max() + 1
    order = sorted(windows)   # time order; the same as ORIGINS order for the nine registered windows
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
    return out


def main():
    windows = [o for o in ORIGINS if complete(o)]
    print("complete windows:", windows)
    fc = ours_members(windows)
    rows = {}
    for o in windows:
        win = np.mean([load(c, o) for c in WIN_COMPONENTS], axis=0)
        fc[o]["winner"] = win
        fc[o]["combined"] = 0.5 * win + 0.5 * fc[o]["ours"]
        fc[o]["combined_masked"] = 0.5 * win + 0.5 * fc[o]["ours_masked"]
        ev = evaluator(o)
        rows[o] = {k: ev.score(v)[0] for k, v in fc[o].items()}
        print(o, {k: round(v, 4) for k, v in rows[o].items()}, flush=True)
    names = list(rows[windows[0]])
    mean = {k: float(np.mean([rows[o][k] for o in windows])) for k in names}
    tests = {h: {"method": m, **test([rows[o][m] - rows[o]["winner"] for o in windows])}
             for h, m in HYPOTHESES.items()}
    tests["exploratory"] = {"method": "combined_masked",
                            **test([rows[o]["combined_masked"] - rows[o]["winner"] for o in windows])}
    print(json.dumps({"mean": mean, "tests": tests}, indent=1))
    (OUTPUTS / "extended_comparison.json").write_text(json.dumps(
        {"windows": {str(o): r for o, r in rows.items()}, "mean": mean, "tests": tests,
         "complete": len(windows), "planned": len(ORIGINS)}, indent=2))


if __name__ == "__main__":
    main()

"""Censored demand, fixed at the source: retrain with stock-out days removed from the targets.

stockouts.py found that items coming back from a probable stock-out are under-forecast at all
seven origins (by 8-29%), and a post-hoc correction of those items failed (stockout_correction.py)
because restock timing is not in the sales data. The remaining fix is at training time: a zero
recorded while the shelf was empty is not a zero demand, so train.py --mask-stockouts drops
those targets (2.4% of item-days).

The two ensemble members that carry weight (recursive2, multi-horizon) are retrained this way
on the three untouched windows and pushed through the frozen pipeline (weights 0.5 / 0.5,
store x department alignment at alpha 0.5, store calibration walk-forward within these windows).

Decision rule, fixed before any masked model was scored: masking is adopted only if it passes
monitor.gate, a lower mean WRMSSE AND a win in at least 2 of the 3 windows.
"""
import json

import numpy as np

import calibrate
import reconcile
from config import HORIZON, OUTPUTS
from score import evaluator
from stockout_correction import flagged_items
from wrmsse import load_raw

WINDOWS = [1773, 1801, 1829]
VARIANTS = {"unmasked": ("recursive2_store", "mh_store"),
            "masked": ("recursive2m_store", "mhm_store")}
ALPHA = 0.5


def main():
    full, calendar, _ = load_raw()
    S9, _, _ = reconcile.aggregate_series(full)
    codes = calibrate.group_codes(full, calibrate.GRAINS["store"])
    n = codes.max() + 1
    acts = {o: full[[f"d_{d}" for d in range(o + 1, o + HORIZON + 1)]].to_numpy(float)
            for o in WINDOWS}
    rows = {o: {} for o in WINDOWS}
    for label, (rec, mh) in VARIANTS.items():
        aligned = {}
        for i, o in enumerate(WINDOWS):
            ens = 0.5 * np.load(OUTPUTS / f"preds_{rec}_o{o}.npy") + \
                  0.5 * np.load(OUTPUTS / f"preds_{mh}_o{o}.npy")
            aligned[o] = reconcile.align(ens, S9, np.load(OUTPUTS / f"agg_L9_o{o}.npy"), ALPHA)
            f_sum, a_sum = np.zeros(n), np.zeros(n)
            for p in WINDOWS[:i]:
                np.add.at(f_sum, codes, aligned[p].sum(axis=1))
                np.add.at(a_sum, codes, acts[p].sum(axis=1))
            f = np.clip(np.where(f_sum > 0, a_sum / np.maximum(f_sum, 1e-9), 1.0), 0.8, 1.25)
            final = aligned[o] * f[codes][:, None]
            flag = flagged_items(full, o)
            ev = evaluator(o)
            rows[o][label] = {"aligned": ev.score(aligned[o])[0], "final": ev.score(final)[0],
                              "bias_all": float(final.sum() / acts[o].sum()),
                              "bias_after_stockout": float(final[flag].sum() / acts[o][flag].sum())}
        print(label, {o: {k: round(v, 4) for k, v in rows[o][label].items()} for o in WINDOWS})
    mean = {v: float(np.mean([rows[o][v]["final"] for o in WINDOWS])) for v in VARIANTS}
    wins = int(sum(rows[o]["masked"]["final"] < rows[o]["unmasked"]["final"] for o in WINDOWS))
    passed = mean["masked"] < mean["unmasked"] and wins >= 2
    summary = {"mean_final": mean, "masked_wins": wins, "of": len(WINDOWS), "adopted": passed}
    print(json.dumps(summary, indent=1))
    (OUTPUTS / "stockout_retrain.json").write_text(json.dumps(
        {"windows": {str(o): r for o, r in rows.items()}, "summary": summary}, indent=2))


if __name__ == "__main__":
    main()

"""Bias calibration from past out-of-sample errors ("bias tracking").

Diagnosis (see experiment_scaling.py): every tree model tested is unbiased in sample but
forecasts 6-8% below actual out of sample, at every origin checked, even after dynamic scaling
and stronger regularisation. A stable, persistent bias is exactly what demand planners correct
with a tracking signal: measure forecast / actual on the forecasts already made and scaled back.

The correction for the forecast made at origin o uses only forecasts made at earlier origins,
scored against actuals that were known at o:

    factor(o) = 1 + shrink * (sum actual / sum forecast over earlier folds - 1)

computed globally, per store, or per store x department. The granularity and shrinkage are
chosen by walking forward through the folds, so the private window never influences them.
This is a different thing from the M5 "magic multiplier", which was tuned on the leaderboard
being scored.
"""
import json

import numpy as np
import pandas as pd

from config import HORIZON, OUTPUTS
from score import evaluator
from wrmsse import load_raw

GRAINS = {"global": [], "store": ["store_id"], "store_dept": ["store_id", "dept_id"]}
SHRINK = [0.0, 0.5, 1.0]


def group_codes(full, cols):
    if not cols:
        return np.zeros(len(full), dtype=int)
    return pd.factorize(full[cols].astype(str).agg("|".join, axis=1))[0]


def factors(name, origins, codes, full):
    """actual / forecast per group, pooled over the given earlier origins."""
    fc_sum = np.zeros(codes.max() + 1)
    act_sum = np.zeros(codes.max() + 1)
    for o in origins:
        fc = np.load(OUTPUTS / f"preds_{name}_o{o}.npy").sum(axis=1)
        act = full[[f"d_{d}" for d in range(o + 1, o + HORIZON + 1)]].to_numpy().sum(axis=1)
        np.add.at(fc_sum, codes, fc)
        np.add.at(act_sum, codes, act)
    return np.where(fc_sum > 0, act_sum / np.maximum(fc_sum, 1e-9), 1.0)


def apply(name, origin, prior, grain, shrink, full):
    codes = group_codes(full, GRAINS[grain])
    f = 1 + shrink * (factors(name, prior, codes, full) - 1)
    f = np.clip(f, 0.8, 1.25)
    return np.load(OUTPUTS / f"preds_{name}_o{origin}.npy") * f[codes][:, None]


def main(name="ensemble", folds=(1885, 1913), final=1941):
    full, _, _ = load_raw()
    # Walk forward: each fold after the first is corrected using only the folds before it.
    scores = {}
    for grain in GRAINS:
        for shrink in SHRINK:
            s = [evaluator(o).score(apply(name, o, folds[:i], grain, shrink, full))[0]
                 for i, o in enumerate(folds) if i > 0]
            scores[f"{grain}|{shrink}"] = float(np.mean(s))
            print(f"{grain:10s} shrink {shrink:.1f}  walk-forward WRMSSE {scores[f'{grain}|{shrink}']:.4f}")
    best = min(scores, key=scores.get)
    grain, shrink = best.split("|")[0], float(best.split("|")[1])
    print("chosen:", grain, shrink)
    for i, o in enumerate((*folds, final)):
        prior = [p for p in folds if p < o]
        out = apply(name, o, prior, grain, shrink, full) if prior else \
            np.load(OUTPUTS / f"preds_{name}_o{o}.npy")
        np.save(OUTPUTS / f"preds_{name}_cal_o{o}.npy", out.astype(np.float32))
    codes = group_codes(full, GRAINS[grain])
    final_f = 1 + shrink * (factors(name, folds, codes, full) - 1)
    result = {"scores": scores, "grain": grain, "shrink": shrink,
              "final_factor_mean": float(np.clip(final_f, 0.8, 1.25).mean())}
    (OUTPUTS / "calibrate.json").write_text(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    main()

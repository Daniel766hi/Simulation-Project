"""Ablation behind the model-design decisions (results in outputs/experiment_scaling.json).

Two stores x two rolling origins x four designs. The other eight stores keep the
seasonal-naive forecast in every run, so score differences come only from these two stores.

A  direct, lag >= 28 relative to the target day (the common M5 public-kernel design)
B  A + per-series dynamic scaling, time-decayed weights, no whole-history item means
C  origin-anchored multi-horizon model (features at the forecast origin, horizon as a feature)
D  C without item_id as a feature
"""
import json

import numpy as np

import train
from config import OUTPUTS
from features import load_grid
from score import evaluator

STORES = ["CA_2", "TX_1"]
ORIGINS = [1885, 1913]
ROUNDS = 600
OFF = {"scale": False, "decay_half_life": 0, "drop_enc": False, "drop_item_id": False}
CONFIGS = {
    "A_direct_lag28": ("direct", OFF),
    "B_direct_scaled_decay": ("direct", {**OFF, "scale": True, "decay_half_life": 365,
                                         "drop_enc": True}),
    "C_multi_horizon": ("mh", {**OFF, "scale": True, "decay_half_life": 365}),
    "D_multi_horizon_no_item_id": ("mh", {**OFF, "scale": True, "decay_half_life": 365,
                                          "drop_item_id": True}),
}


def main():
    res = {}
    for o in ORIGINS:
        base = np.load(OUTPUTS / f"preds_sNaive_o{o}.npy")
        act = evaluator(o).actuals
        for name, (kind, opts) in CONFIGS.items():
            preds = {s: train.train_group(load_grid(s), s, kind, o, ROUNDS, train.PARAMS,
                                          lambda m: None, opts)[0] for s in STORES}
            part = train.to_matrix(preds, o)
            rows = part.sum(axis=1) > 0
            mat = base.copy()
            mat[rows] = part[rows]
            s, _ = evaluator(o).score(mat)
            bias = float(part[rows].sum() / act[rows].sum())
            res[f"{name}@{o}"] = {"wrmsse": s, "bias": bias}
            print(f"{o} {name:28s} WRMSSE {s:.4f}  forecast/actual {bias:.3f}", flush=True)
            (OUTPUTS / "experiment_scaling.json").write_text(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()

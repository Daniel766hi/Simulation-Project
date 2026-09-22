"""Ablation behind the dynamic-scaling decision (results in outputs/experiment_scaling.json).

Two stores x two rolling origins x four settings, direct model. The other eight stores keep
the seasonal-naive forecast in every run, so score differences come only from these stores.
"""
import json
import sys

import numpy as np

import train
from config import OUTPUTS
from features import load_grid
from score import evaluator

STORES = ["CA_2", "TX_1"]
ORIGINS = [1885, 1913]
CONFIGS = {
    "A_baseline": {"scale": False, "decay_half_life": 0, "drop_enc": False},
    "B_drop_item_means": {"scale": False, "decay_half_life": 0, "drop_enc": True},
    "C_dynamic_scaling": {"scale": True, "decay_half_life": 0, "drop_enc": True},
    "D_scaling_plus_decay": {"scale": True, "decay_half_life": 365, "drop_enc": True},
}


def main():
    res = {}
    for o in ORIGINS:
        base = np.load(OUTPUTS / f"preds_sNaive_o{o}.npy")
        act = evaluator(o).actuals
        for name, opts in CONFIGS.items():
            mat = base.copy()
            preds = {}
            for store in STORES:
                out, _ = train.train_group(load_grid(store), store, "direct", o, 800, train.PARAMS,
                                           lambda m: None, opts)
                preds[store] = out
            part = train.to_matrix(preds, o)
            rows = part.sum(axis=1) > 0
            mat[rows] = part[rows]
            s, lv = evaluator(o).score(mat)
            bias = float(part[rows].sum() / act[rows].sum())
            res[f"{name}@{o}"] = {"wrmsse": s, "bias": bias}
            print(f"{o} {name:22s} WRMSSE {s:.4f}  forecast/actual {bias:.3f}", flush=True)
    (OUTPUTS / "experiment_scaling.json").write_text(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()

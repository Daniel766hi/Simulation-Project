"""Score saved prediction matrices with the validated WRMSSE evaluator.

    python score.py direct_validation recursive_validation
    python score.py --blend direct_validation recursive_validation   # equal-weight average
"""
import argparse
import json

import numpy as np

from config import LAST_TRAIN_EVALUATION, LAST_TRAIN_VALIDATION, OUTPUTS
from wrmsse import build_evaluator, load_raw

_cache = {}


def evaluator(phase):
    if phase not in _cache:
        full, calendar, prices = load_raw()
        last = LAST_TRAIN_VALIDATION if phase == "validation" else LAST_TRAIN_EVALUATION
        _cache[phase] = build_evaluator(full, calendar, prices, last)
    return _cache[phase]


def phase_of(name):
    return "validation" if "validation" in name else "evaluation"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("names", nargs="+")
    ap.add_argument("--blend", action="store_true")
    args = ap.parse_args()
    results = {}
    mats = {n: np.load(OUTPUTS / f"preds_{n}.npy") for n in args.names}
    if args.blend:
        mats["blend(" + "+".join(args.names) + ")"] = np.mean(list(mats.values()), axis=0)
    for name, mat in mats.items():
        s, lv = evaluator(phase_of(name)).score(mat)
        results[name] = {"wrmsse": s, "levels": lv}
        print(f"{name:45s} WRMSSE {s:.4f}   " +
              " ".join(f"{k}:{v:.3f}" for k, v in lv.items()))
    scores_file = OUTPUTS / "scores.json"
    old = json.loads(scores_file.read_text()) if scores_file.exists() else {}
    old.update(results)
    scores_file.write_text(json.dumps(old, indent=2))


if __name__ == "__main__":
    main()

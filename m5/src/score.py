"""Score saved prediction matrices with the validated WRMSSE evaluator.

    python score.py direct_store_o1913 recursive_store_o1913
    python score.py --blend direct_store_o1913 recursive_store_o1913   # equal-weight average

The forecast origin is read from the name (`_o<last training day>`), so any rolling-origin fold
is scored against its own 28 following days, with weights and scales from its own history.
"""
import argparse
import json
import re

import numpy as np

from config import OUTPUTS
from wrmsse import build_evaluator, load_raw

_cache = {}
_raw = {}


def evaluator(origin: int):
    if origin not in _cache:
        if not _raw:
            _raw["data"] = load_raw()
        full, calendar, prices = _raw["data"]
        _cache[origin] = build_evaluator(full, calendar, prices, origin)
    return _cache[origin]


def origin_of(name: str) -> int:
    return int(re.search(r"_o(\d+)", name).group(1))


def load(name):
    return np.load(OUTPUTS / f"preds_{name}.npy")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("names", nargs="+")
    ap.add_argument("--blend", action="store_true")
    args = ap.parse_args()
    mats = {n: load(n) for n in args.names}
    if args.blend:
        mats["blend(" + "+".join(args.names) + ")"] = np.mean(list(mats.values()), axis=0)
    results = {}
    for name, mat in mats.items():
        s, lv = evaluator(origin_of(name if "_o" in name else args.names[0])).score(mat)
        results[name] = {"wrmsse": s, "levels": lv}
        print(f"{name:60s} WRMSSE {s:.4f}   " + " ".join(f"{k}:{v:.3f}" for k, v in lv.items()))
    scores_file = OUTPUTS / "scores.json"
    old = json.loads(scores_file.read_text()) if scores_file.exists() else {}
    old.update(results)
    scores_file.write_text(json.dumps(old, indent=2))


if __name__ == "__main__":
    main()

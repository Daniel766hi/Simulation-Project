"""Prove the WSPL implementation matches the organisers: reproduce two published benchmarks."""
import json

from config import LAST_TRAIN_EVALUATION, OUTPUTS
from wrmsse import load_raw
from wspl import WSPLEvaluator, naive_benchmark, snaive_benchmark

OFFICIAL = {"Naive": 0.594882, "sNaive": 0.255203}


def main():
    full, calendar, prices = load_raw()
    ev = WSPLEvaluator(full, calendar, prices, LAST_TRAIN_EVALUATION)
    res = {}
    for name, fn in (("Naive", naive_benchmark), ("sNaive", snaive_benchmark)):
        s, _ = ev.score(fn(ev))
        res[name] = {"ours": s, "official": OFFICIAL[name]}
        print(f"{name:7s} ours {s:.6f}  official {OFFICIAL[name]:.6f}")
        assert abs(s - OFFICIAL[name]) < 1e-4
    (OUTPUTS / "wspl_validation.json").write_text(json.dumps(res, indent=2))
    print("WSPL evaluator validated")


if __name__ == "__main__":
    main()

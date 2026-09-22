"""Prove the WRMSSE implementation matches the organisers' before trusting any score from it.

Check 1: our series weights vs weights_evaluation.csv (the file the organisers scored with).
Check 2: our Naive and seasonal-naive scores vs the published benchmark scores.
"""
import json

import numpy as np
import pandas as pd

from config import LAST_TRAIN_EVALUATION, OUTPUTS, RAW
from wrmsse import build_evaluator, load_raw

OFFICIAL = {"Naive": 1.752010, "sNaive": 0.847017}


def main():
    full, calendar, prices = load_raw()
    ev = build_evaluator(full, calendar, prices, LAST_TRAIN_EVALUATION)

    # --- weights ---
    off = pd.read_csv(RAW / "weights_evaluation.csv")
    ours = ev.labels.copy()
    ours["weight"] = ev.weights
    # Keys differ in column order between files (L11 is state, item there), so compare the
    # unordered set of key parts; "X" marks an unused slot in the organisers' file.
    def canon(a, b):
        return a.combine(b, lambda x, y: "|".join(sorted(v for v in (x, y) if v not in ("X", None)
                                                         and isinstance(v, str))))
    parts = ours["series"].str.split("__", expand=True)
    ours["key"] = canon(parts[0], parts[1])
    off["level"] = "L" + off["Level_id"].str.replace("Level", "")
    off["key"] = canon(off["Agg_Level_1"], off["Agg_Level_2"])
    m = ours.merge(off, on=["level", "key"], how="outer", suffixes=("", "_off"), indicator=True)
    matched = (m["_merge"] == "both").mean()
    max_err = (m["weight"] - m["weight_off"]).abs().max()
    print(f"weights: {len(m)} series, matched {matched:.4%}, max |diff| {max_err:.2e}")

    # --- benchmark scores ---
    hist = full[[f"d_{d}" for d in range(1, LAST_TRAIN_EVALUATION + 1)]].to_numpy(np.float32)
    naive = np.repeat(hist[:, -1:], 28, axis=1)
    snaive = np.tile(hist[:, -7:], 4)
    results = {}
    for name, fc in [("Naive", naive), ("sNaive", snaive)]:
        s, _ = ev.score(fc)
        results[name] = {"ours": s, "official": OFFICIAL[name], "abs_diff": abs(s - OFFICIAL[name])}
        print(f"{name:7s} ours {s:.6f}  official {OFFICIAL[name]:.6f}")

    OUTPUTS.mkdir(exist_ok=True)
    (OUTPUTS / "evaluator_validation.json").write_text(json.dumps({
        "weights_matched_share": matched, "weights_max_abs_diff": float(max_err),
        "benchmarks": results}, indent=2))
    assert matched == 1.0 and max_err < 1e-5, "weights disagree with organisers"
    assert all(r["abs_diff"] < 1e-4 for r in results.values()), "scores disagree"
    print("evaluator validated")


if __name__ == "__main__":
    main()

"""Blend the direct and recursive models, choosing the weight on the validation window only.

The weight is picked where it can be checked honestly (public-leaderboard days 1914-1941) and
then applied unchanged to the private-leaderboard forecasts, which are scored exactly once.
"""
import json

import numpy as np

from config import OUTPUTS
from score import evaluator

MODELS = ("direct", "recursive")
GRID = np.round(np.arange(0, 1.01, 0.1), 2)


def main():
    val = {m: np.load(OUTPUTS / f"preds_{m}_validation.npy") for m in MODELS}
    ev_val = evaluator("validation")
    curve = []
    for w in GRID:
        s, _ = ev_val.score(w * val["direct"] + (1 - w) * val["recursive"])
        curve.append({"w_direct": float(w), "wrmsse": s})
        print(f"w_direct={w:.1f}  validation WRMSSE {s:.4f}")
    best = min(curve, key=lambda r: r["wrmsse"])
    w = best["w_direct"]
    print(f"chosen w_direct={w}")

    out = {"weight_direct": w, "validation_curve": curve, "validation": {}, "evaluation": {}}
    for phase in ("validation", "evaluation"):
        preds = {m: np.load(OUTPUTS / f"preds_{m}_{phase}.npy") for m in MODELS}
        blend = w * preds["direct"] + (1 - w) * preds["recursive"]
        np.save(OUTPUTS / f"preds_ensemble_{phase}.npy", blend.astype(np.float32))
        for name, mat in {**preds, "ensemble": blend}.items():
            s, lv = evaluator(phase).score(mat)
            out[phase][name] = {"wrmsse": s, "levels": lv}
            print(f"{phase:10s} {name:9s} WRMSSE {s:.4f}")
    (OUTPUTS / "final_scores.json").write_text(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()

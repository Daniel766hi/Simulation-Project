"""Freeze the final forecast, then score the private window once.

Order matters and is enforced here: ensemble weights and alignment strength are chosen on the
rolling folds, the final forecast is written, and only then is anything scored on d_1942-1969.
"""
import json
import shutil

import pandas as pd

import ensemble
import reconcile
from config import OUTPUTS, RAW
from score import evaluator, load

FOLDS, FINAL = ensemble.FOLDS, ensemble.FINAL


def main():
    ensemble.main()
    rec = reconcile.main(base_name="ensemble", origins_tune=FOLDS, origin_final=FINAL)
    for o in (*FOLDS, FINAL):
        shutil.copy(OUTPUTS / f"preds_ensemble_aligned_o{o}.npy", OUTPUTS / f"preds_final_o{o}.npy")

    # ---- everything below reads the private window; nothing above may change after it ----
    ens = json.loads((OUTPUTS / "ensemble.json").read_text())
    names = ens["members"] + ["ensemble", "final"]
    out = {"weights": ens["chosen_weights"], "alpha": rec["alpha"], "models": {}}
    for n in names:
        folds = {o: evaluator(o).score(load(f"{n}_o{o}"))[0] for o in FOLDS}
        s, lv = evaluator(FINAL).score(load(f"{n}_o{FINAL}"))
        out["models"][n] = {"folds": folds, "private": s, "levels": lv}
        print(f"{n:22s} folds {[round(v, 4) for v in folds.values()]}  private {s:.4f}")
    top = pd.read_excel(RAW / "scores.xlsx", sheet_name="Accuracy-Top50 (AL)", header=None)
    top_scores = top.iloc[2:, 13].astype(float).to_numpy()
    s = out["models"]["final"]["private"]
    out["rank_equivalent"] = int((top_scores < s).sum() + 1) if s <= top_scores.max() else None
    print("rank equivalent:", out["rank_equivalent"])
    (OUTPUTS / "final_scores.json").write_text(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()

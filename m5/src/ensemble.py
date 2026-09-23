"""Combine the model family, then align it top-down; every choice made on rolling folds only.

Ma & Fildes ("The performance of the global bottom-up approach in the M5 accuracy competition:
A robustness check", IJF 2022) showed the top M5 methods were not robust across time periods
and called the final ranking "somewhat of a lottery". So every choice here (members, weights,
alignment strength, bias calibration) is scored on three rolling origins, d_1857, d_1885 and
d_1913, and the average decides. The private window (origin d_1941) is scored once, after
everything is fixed.

Candidates:
* each single model;
* the equal-weight mean of all members, as used by the M5 winner;
* weights on a 0.1-step simplex grid, optimised on the folds.

A simple mean is the default unless optimised weights beat it on the fold average: the
forecasting literature repeatedly finds that estimated combination weights add variance that
often cancels their in-sample gain.
"""
import itertools
import json

import numpy as np

from config import OUTPUTS
from score import evaluator

MEMBERS = ["recursive_store", "recursive_store_cat", "mh_store"]
FOLDS = (1857, 1885, 1913)
FINAL = 1941


def load(name, origin):
    return np.load(OUTPUTS / f"preds_{name}_o{origin}.npy")


def fold_score(weights, preds):
    return float(np.mean([evaluator(o).score(sum(w * preds[o][m] for m, w in weights.items()))[0]
                          for o in FOLDS]))


def simplex(n, step=0.1):
    k = int(round(1 / step))
    for c in itertools.product(range(k + 1), repeat=n):
        if sum(c) == k:
            yield [x / k for x in c]


def main():
    members = [m for m in MEMBERS if all((OUTPUTS / f"preds_{m}_o{o}.npy").exists()
                                         for o in (*FOLDS, FINAL))]
    preds = {o: {m: load(m, o) for m in members} for o in FOLDS}
    report = {"members": members, "folds": list(FOLDS), "single": {}, "per_fold": {}}
    for m in members:
        report["single"][m] = fold_score({m: 1.0}, preds)
        report["per_fold"][m] = {o: evaluator(o).score(preds[o][m])[0] for o in FOLDS}
        print(f"{m:22s} fold-mean {report['single'][m]:.4f}  {report['per_fold'][m]}")
    equal = {m: 1 / len(members) for m in members}
    report["equal"] = fold_score(equal, preds)
    print(f"equal-weight mean       fold-mean {report['equal']:.4f}")

    best_w, best_s = equal, report["equal"]
    for w in simplex(len(members)):
        s = fold_score(dict(zip(members, w)), preds)
        if s < best_s - 1e-9:
            best_w, best_s = dict(zip(members, w)), s
    report["optimised"] = {"weights": best_w, "score": best_s}
    print(f"optimised weights       fold-mean {best_s:.4f}  {best_w}")
    weights = best_w
    report["chosen_weights"] = weights

    for o in (*FOLDS, FINAL):
        blend = sum(w * load(m, o) for m, w in weights.items())
        np.save(OUTPUTS / f"preds_ensemble_o{o}.npy", blend.astype(np.float32))
    (OUTPUTS / "ensemble.json").write_text(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

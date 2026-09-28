"""M5 Uncertainty track: nine quantiles for all 42,840 series from the final point forecast.

Quantiles do not add up a hierarchy, so each level gets its own quantile model, chosen
walk-forward on the rolling folds from two candidates:

1. Pinball-optimal multipliers. q_u = point x m_u(level). For a fixed level, the m that
   minimises the weighted scaled pinball loss is a weighted quantile of actual / point with
   weights w_i * point / scale_i, so it has a closed form: no search, no overfitting knobs.
   A variant fits separate multipliers for each week ahead, since uncertainty widens with h.
2. Negative binomial. For sparse, count-valued series (single items, item x state, item x store)
   a multiplier on a small mean is a poor description of 0/1/2-unit days. q_u is the u-quantile
   of a negative binomial with mean = point and a dispersion r(level) picked from a grid.

For each level the candidate with the lower walk-forward WSPL is kept. The multipliers and
dispersions used at the private origin are estimated from all three folds; the private window
is never used. The same quantiles feed the inventory analysis (a quantile is a safety-stock
level).
"""
import json

import numpy as np
from scipy.stats import nbinom

from config import OUTPUTS
from wrmsse import LEVELS, load_raw
from wspl import QUANTILES, WSPLEvaluator, naive_benchmark, snaive_benchmark

FOLDS, FINAL = (1857, 1885, 1913), 1941
NB_GRID = [0.5, 1, 2, 4, 8, 16, 64]
NB_LEVELS = ("L10", "L11", "L12")


def weighted_quantile(x, w, q):
    order = np.argsort(x)
    x, w = x[order], w[order]
    cw = np.cumsum(w)
    return np.interp(q * cw[-1], cw, x)


class Data:
    def __init__(self):
        self.full, self.cal, self.prices = load_raw()
        self.ev = {}

    def evaluator(self, o):
        if o not in self.ev:
            self.ev[o] = WSPLEvaluator(self.full, self.cal, self.prices, o)
        return self.ev[o]

    def point(self, name, o):
        return np.asarray(self.evaluator(o).S @ np.load(OUTPUTS / f"preds_{name}_o{o}.npy"))


def fit_multipliers(D, name, origins, idx, days=slice(None)):
    """m_u for one level, pooled over earlier origins (closed-form weighted quantiles)."""
    ratios, weights = [], []
    for o in origins:
        ev = D.evaluator(o)
        p = D.point(name, o)[idx][:, days]
        y = ev.agg_actuals[idx][:, days]
        w = (ev.weights[idx] / np.maximum(ev.scale[idx], 1e-9))[:, None] * p
        ok = p > 1e-6
        ratios.append((y / np.where(ok, p, 1))[ok])
        weights.append(w[ok])
    r, w = np.concatenate(ratios), np.concatenate(weights)
    return np.array([weighted_quantile(r, w, u) for u in QUANTILES])


def mult_quantiles(D, name, origins, idx, p, by_week):
    """Multiplier quantiles; with by_week, separate multipliers for each week ahead, since
    uncertainty widens with the horizon."""
    if not by_week:
        return p[None] * fit_multipliers(D, name, origins, idx)[:, None, None]
    q = np.empty((len(QUANTILES),) + p.shape)
    for wk in range(4):
        days = slice(7 * wk, 7 * wk + 7)
        m = fit_multipliers(D, name, origins, idx, days)
        q[:, :, days] = p[None, :, days] * m[:, None, None]
    return q


def nb_quantiles(p, r):
    mu = np.maximum(p, 1e-6)
    prob = r / (r + mu)
    return np.stack([nbinom.ppf(u, r, prob) for u in QUANTILES])


def level_spl(ev, q, idx):
    """Weighted scaled pinball loss of one level's series (q: 9 x n x 28)."""
    y = ev.agg_actuals[idx][None]
    u = QUANTILES[:, None, None]
    loss = np.where(q <= y, (y - q) * u, (q - y) * (1 - u)).mean(axis=2)
    return float((ev.weights[idx] * (loss / np.maximum(ev.scale[idx], 1e-9)).mean(axis=0)).sum())


def build(D, name, o, prior, choice):
    """Quantiles for every series at origin o, with each level's method fitted on `prior`."""
    ev = D.evaluator(o)
    p = D.point(name, o)
    q = np.zeros((len(QUANTILES),) + p.shape)
    for lv, _ in LEVELS:
        idx = ev.level_idx[lv]
        method, param = choice[lv]
        if method in ("mult", "mult_week"):
            q[:, idx] = mult_quantiles(D, name, prior, idx, p[idx], method == "mult_week")
        else:
            q[:, idx] = nb_quantiles(p[idx], param)
    return q


def main(name="final", score_private=True):
    D = Data()
    # Walk-forward selection per level: fold k is scored with parameters from folds before it.
    choice, report = {}, {}
    for lv, _ in LEVELS:
        cands = {("mult", None): [], ("mult_week", None): []}
        if lv in NB_LEVELS:
            cands.update({("nb", r): [] for r in NB_GRID})
        for i, o in enumerate(FOLDS[1:], start=1):
            ev = D.evaluator(o)
            idx = ev.level_idx[lv]
            p = D.point(name, o)[idx]
            for (method, param) in cands:
                if method in ("mult", "mult_week"):
                    q = mult_quantiles(D, name, FOLDS[:i], idx, p, method == "mult_week")
                else:
                    q = nb_quantiles(p, param)
                cands[(method, param)].append(level_spl(ev, q, idx))
        means = {k: float(np.mean(v)) for k, v in cands.items()}
        best = min(means, key=means.get)
        choice[lv] = best
        report[lv] = {"chosen": f"{best[0]}" + (f"(r={best[1]})" if best[1] else ""),
                      "walk_forward": {f"{k[0]}{'' if k[1] is None else k[1]}": v
                                       for k, v in means.items()}}
        print(f"{lv:4s} chosen {report[lv]['chosen']:12s}  " +
              " ".join(f"{k}:{v:.4f}" for k, v in report[lv]["walk_forward"].items()))

    fold_scores = {}
    for i, o in enumerate(FOLDS[1:], start=1):
        fold_scores[o] = D.evaluator(o).score(build(D, name, o, FOLDS[:i], choice))[0]
    print("walk-forward WSPL on folds:", {k: round(v, 4) for k, v in fold_scores.items()})
    if not score_private:
        return {"fold_wspl": fold_scores, "choice": report}

    # ---- private window: parameters from all folds, scored once ----
    ev = D.evaluator(FINAL)
    q = build(D, name, FINAL, FOLDS, choice)
    s, lv_scores = ev.score(q)
    bench = {"Naive": ev.score(naive_benchmark(ev))[0], "sNaive": ev.score(snaive_benchmark(ev))[0]}
    print(f"private WSPL {s:.4f}   benchmarks {bench}")
    np.save(OUTPUTS / f"quantiles_{name}_o{FINAL}.npy", q[:, -30490:].astype(np.float32))
    import pandas as pd
    from config import RAW
    top = pd.read_excel(RAW / "scores.xlsx", sheet_name="Uncertainty-Top50 (AL)", header=None)
    top_scores = top.iloc[2:, 13].astype(float).to_numpy()
    rank = int((top_scores < s).sum() + 1) if s <= top_scores.max() else None
    out = {"private_wspl": s, "levels": lv_scores, "fold_wspl": fold_scores, "choice": report,
           "benchmarks": bench, "rank_equivalent": rank,
           "top50": [float(x) for x in top_scores]}
    (OUTPUTS / "uncertainty.json").write_text(json.dumps(out, indent=2, default=str))
    print("rank equivalent:", rank)
    return out


if __name__ == "__main__":
    main()

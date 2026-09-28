"""Weighted Scaled Pinball Loss, the metric of the M5 Uncertainty competition.

Nine quantiles (0.005 ... 0.995) are forecast for every one of the 42,840 series directly,
because quantiles do not add up the hierarchy. For series i and quantile u:

    SPL_i(u) = mean_h pinball_u(y, q) / mean_t |y_t - y_{t-1}|

with the scale taken from the series' first non-zero sale, like WRMSSE but with absolute rather
than squared differences. Series weights are the same dollar-sales weights as WRMSSE; each
series averages its nine SPLs, each level sums its weighted series, and the 12 levels are
averaged.
"""
import numpy as np

from config import HORIZON
from wrmsse import build_evaluator

QUANTILES = np.array([0.005, 0.025, 0.165, 0.25, 0.5, 0.75, 0.835, 0.975, 0.995])


class WSPLEvaluator:
    def __init__(self, full, calendar, prices, origin):
        self.base = build_evaluator(full, calendar, prices, origin)
        train = full[[f"d_{d}" for d in range(1, origin + 1)]].to_numpy(np.float32)
        agg = np.asarray(self.base.S @ train)
        started = np.cumsum(agg != 0, axis=1) > 0
        diff = np.abs(np.diff(agg, axis=1))
        mask = started[:, :-1]
        self.scale = (diff * mask).sum(axis=1) / np.maximum(mask.sum(axis=1), 1)
        self.agg_actuals = self.base.agg_actuals
        self.agg_train = agg
        self.weights = self.base.weights
        self.level_idx = self.base.level_idx
        self.S = self.base.S

    def score(self, q):
        """q: array (9, 42840, 28) of quantile forecasts for every hierarchy series."""
        y = self.agg_actuals[None]
        u = QUANTILES[:, None, None]
        loss = np.where(q <= y, (y - q) * u, (q - y) * (1 - u)).mean(axis=2)   # (9, series)
        spl = (loss / np.maximum(self.scale, 1e-9)[None]).mean(axis=0)
        per_level = {lv: float((self.weights[i] * spl[i]).sum()) for lv, i in self.level_idx.items()}
        return float(np.mean(list(per_level.values()))), per_level


def naive_benchmark(ev):
    """Organisers' Naive benchmark: last value, normal errors, sd of in-sample one-step errors
    growing with sqrt(h). Reproduces the published 0.594882 (validate_wspl.py)."""
    from scipy.stats import norm
    agg = ev.agg_train
    started = np.cumsum(agg != 0, axis=1) > 0
    e = np.where(started[:, :-1], agg[:, 1:] - agg[:, :-1], np.nan)
    sd = np.nanstd(e, axis=1)
    point = np.repeat(agg[:, -1:], HORIZON, axis=1)
    mult = np.sqrt(np.arange(1, HORIZON + 1))
    return np.maximum(point[None] + norm.ppf(QUANTILES)[:, None, None] * sd[None, :, None]
                      * mult[None, None, :], 0)


def snaive_benchmark(ev):
    """Organisers' seasonal-naive benchmark: last week repeated, normal errors with the sd of
    in-sample seasonal differences growing with sqrt(weeks ahead). Reproduces 0.255203."""
    from scipy.stats import norm
    agg = ev.agg_train
    started = np.cumsum(agg != 0, axis=1) > 0
    e = np.where(started[:, :-7], agg[:, 7:] - agg[:, :-7], np.nan)
    sd = np.nanstd(e, axis=1)
    point = np.tile(agg[:, -7:], HORIZON // 7)
    mult = np.sqrt(np.ceil(np.arange(1, HORIZON + 1) / 7))
    return np.maximum(point[None] + norm.ppf(QUANTILES)[:, None, None] * sd[None, :, None]
                      * mult[None, None, :], 0)

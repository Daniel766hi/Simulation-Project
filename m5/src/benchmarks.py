"""Re-implement the organisers' statistical benchmarks, vectorised across all 30,490 series.

Following the M5 guide: every method is fitted on each series from its first non-zero sale,
SES picks alpha from {0.1, 0.2, 0.3} and MA picks a window from 2..14 by in-sample MSE, and the
intermittent-demand methods (Croston, SBA, TSB) use the textbook recursions. Each method's
score is compared with the organisers' published score for the same benchmark: all land within
0.0003 of it except TSB (0.003), whose parameter search the guide does not pin down exactly.
"""
import json

import numpy as np
import pandas as pd

from config import HORIZON, LAST_TRAIN_EVALUATION, LAST_TRAIN_VALIDATION, OUTPUTS, RAW
from wrmsse import build_evaluator, load_raw


def _active_mask(y):
    return np.cumsum(y != 0, axis=1) > 0


def ses(y, alphas=(0.1, 0.2, 0.3)):
    """Simple exponential smoothing with in-sample-optimal alpha per series."""
    act = _active_mask(y)
    best_err = np.full(len(y), np.inf)
    best_level = np.zeros(len(y))
    for a in alphas:
        level = np.zeros(len(y))
        started = np.zeros(len(y), bool)
        sse = np.zeros(len(y))
        n = np.zeros(len(y))
        for t in range(y.shape[1]):
            yt = y[:, t]
            on = act[:, t]
            fit = started & on
            sse += np.where(fit, (yt - level) ** 2, 0)
            n += fit
            level = np.where(fit, a * yt + (1 - a) * level, np.where(on & ~started, yt, level))
            started |= on
        err = sse / np.maximum(n, 1)
        better = err < best_err
        best_err = np.where(better, err, best_err)
        best_level = np.where(better, level, best_level)
    return np.repeat(best_level[:, None], HORIZON, axis=1)


def moving_average(y, windows=range(2, 15)):
    act = _active_mask(y)
    csum = np.cumsum(np.where(act, y, 0), axis=1)
    best_err = np.full(len(y), np.inf)
    best_fc = np.zeros(len(y))
    for k in windows:
        # One-step MA forecast of y_t from y_{t-k..t-1}, scored where the window is active.
        ma = (csum[:, k - 1:-1] - np.concatenate([np.zeros((len(y), 1)), csum[:, :-k - 1]], axis=1)) / k
        target = y[:, k:]
        valid = act[:, :-k]  # window start active
        err = np.where(valid, (target - ma) ** 2, 0).sum(1) / np.maximum(valid.sum(1), 1)
        fc = y[:, -k:].mean(axis=1)
        better = err < best_err
        best_err = np.where(better, err, best_err)
        best_fc = np.where(better, fc, best_fc)
    return np.repeat(best_fc[:, None], HORIZON, axis=1)


def croston(y, alpha=0.1, variant="croston"):
    """Croston / SBA: smooth non-zero demand size and inter-demand interval separately."""
    size = np.zeros(len(y))
    interval = np.zeros(len(y))
    q = np.ones(len(y))          # periods since last demand
    started = np.zeros(len(y), bool)
    for t in range(y.shape[1]):
        yt = y[:, t]
        nz = yt > 0
        first = nz & ~started
        upd = nz & started
        size = np.where(first, yt, np.where(upd, alpha * yt + (1 - alpha) * size, size))
        interval = np.where(first, 1.0, np.where(upd, alpha * q + (1 - alpha) * interval, interval))
        q = np.where(nz, 1, q + 1)
        started |= nz
    fc = np.where(interval > 0, size / np.maximum(interval, 1e-9), 0)
    if variant == "sba":
        fc *= 1 - alpha / 2
    return np.repeat(fc[:, None], HORIZON, axis=1)


def tsb(y, grid=(0.1, 0.2, 0.3)):
    """Teunter-Syntetos-Babai: smooth demand probability every period and size on demand,
    with both smoothing constants chosen per series by in-sample MSE."""
    best_err = np.full(len(y), np.inf)
    best_fc = np.zeros(len(y))
    for alpha_d in grid:
        for alpha_p in grid:
            size = np.zeros(len(y))
            prob = np.zeros(len(y))
            started = np.zeros(len(y), bool)
            sse = np.zeros(len(y))
            n = np.zeros(len(y))
            for t in range(y.shape[1]):
                yt = y[:, t]
                nz = yt > 0
                sse += np.where(started, (yt - prob * size) ** 2, 0)
                n += started
                first = nz & ~started
                prob = np.where(first, 1.0,
                                np.where(started, alpha_p * nz + (1 - alpha_p) * prob, prob))
                size = np.where(first, yt,
                                np.where(started & nz, alpha_d * yt + (1 - alpha_d) * size, size))
                started |= nz
            err = sse / np.maximum(n, 1)
            better = err < best_err
            best_err = np.where(better, err, best_err)
            best_fc = np.where(better, prob * size, best_fc)
    return np.repeat(best_fc[:, None], HORIZON, axis=1)


def official_scores():
    b = pd.read_excel(RAW / "scores.xlsx", sheet_name="Accuracy-Benchmarks (AL)", header=None)
    return dict(zip(b.iloc[2:, 0], b.iloc[2:, 13].astype(float)))


def run(last_train_day=LAST_TRAIN_EVALUATION):
    full, calendar, prices = load_raw()
    ev = build_evaluator(full, calendar, prices, last_train_day)
    y = full[[f"d_{d}" for d in range(1, last_train_day + 1)]].to_numpy(np.float64)
    methods = {
        "Naive": np.repeat(y[:, -1:], HORIZON, axis=1),
        "sNaive": np.tile(y[:, -7:], HORIZON // 7),
        "MA": moving_average(y),
        "SES": ses(y),
        "CRO": croston(y),
        "SBA": croston(y, variant="sba"),
        "TSB": tsb(y),
    }
    off = official_scores() if last_train_day == LAST_TRAIN_EVALUATION else {}
    rows = []
    for name, fc in methods.items():
        s, lv = ev.score(fc)
        rows.append({"method": name, "wrmsse": s, "official": off.get(name), "levels": lv})
        print(f"{name:7s} ours {s:.4f}   official {off.get(name, float('nan')):.4f}")
    return rows, methods


ORIGINS = (1857, 1885, LAST_TRAIN_VALIDATION, LAST_TRAIN_EVALUATION)


def main():
    OUTPUTS.mkdir(exist_ok=True)
    # Earlier-origin forecasts are kept too: the inventory simulation measures each method's
    # out-of-sample error there, and the extra fold feeds the rolling-origin comparison.
    for origin in ORIGINS:
        rows, methods = run(origin)
        for name, fc in methods.items():
            np.save(OUTPUTS / f"preds_{name}_o{origin}.npy", fc.astype(np.float32))
        if origin == LAST_TRAIN_EVALUATION:
            (OUTPUTS / "benchmarks.json").write_text(json.dumps(rows, indent=2))


if __name__ == "__main__":
    main()

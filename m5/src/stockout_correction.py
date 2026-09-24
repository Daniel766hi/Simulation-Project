"""Stockout-aware forecast correction, tested walk-forward.

stockouts.py found that items coming back from a probable stock-out are under-forecast at every
origin checked (the zeros taught the model that demand had fallen: censored demand). This step
scales the forecast of those items only, by the actual / forecast ratio the same subgroup showed
at earlier origins, and leaves every other item untouched.

It is judged the same way as the calibration step that failed: window by window, with the factor
learned only from windows before the one being scored. It does not survive that test, and the
split by recovered vs still-out-of-stock items explains why: items still off the shelf at the
origin are under-forecast in some windows (restocked during the window) and over-forecast in
others, so the size of the bias is not predictable from sales history. Fixing censored demand
needs inventory or restock data, or retraining with stock-out days treated as missing.

Windows whose forecasts were used for earlier choices, and the already-seen private window, are
labelled as such; this correction was designed after the private window was scored, so it can
never change the reported result.
"""
import json

import numpy as np
import pandas as pd

from config import HORIZON, OUTPUTS
from score import evaluator
from stockouts import LOOKBACK, MAX_RUN, MIN_RATE, MIN_RUN, PERIOD, zero_runs
from wrmsse import load_raw

ORIGINS = [1773, 1801, 1829, 1857, 1885, 1913, 1941]
ROLE = {1773: "backtest", 1801: "backtest", 1829: "backtest", 1857: "selection",
        1885: "selection", 1913: "selection", 1941: "private (already seen)"}
CLIP = (1.0, 1.6)


def base_forecast(o):
    """The frozen pipeline's forecast at origin o (backtest output where available)."""
    for name in ("bt_final", "final"):
        path = OUTPUTS / f"preds_{name}_o{o}.npy"
        if path.exists():
            return np.load(path), name
    return None, None


def flagged_items(full, o):
    """Item-stores with a probable stock-out (7-55 zero days, regular seller) overlapping the
    28 days before origin o. Uses only data up to o."""
    cols = [f"d_{d}" for d in range(o - HORIZON - MAX_RUN - LOOKBACK + 1, o + 1)]
    Y = full[cols].to_numpy(float)
    flag = np.zeros(len(full), bool)
    for i in range(len(Y)):
        starts, lengths = zero_runs(Y[i])
        for s, L in zip(starts, lengths):
            end = s + L                                    # exclusive, relative to cols
            if L < MIN_RUN or s < LOOKBACK or end < Y.shape[1] - HORIZON:
                continue
            if end < Y.shape[1] and L > MAX_RUN:
                continue
            if np.nanmean(Y[i, s - LOOKBACK:s]) >= MIN_RATE:
                flag[i] = True
                break
    return flag


def main():
    full, _, _ = load_raw()
    avail = [o for o in ORIGINS if base_forecast(o)[0] is not None]
    flags = {o: flagged_items(full, o) for o in avail}
    acts = {o: full[[f"d_{d}" for d in range(o + 1, o + HORIZON + 1)]].to_numpy(float)
            for o in avail}
    rows = {}
    for i, o in enumerate(avail):
        fc, src = base_forecast(o)
        prior = avail[:i]
        f = flags[o]
        last3 = full[[f"d_{d}" for d in range(o - 2, o + 1)]].to_numpy(float).sum(axis=1)
        rec, still = f & (last3 > 0), f & (last3 == 0)
        row = {"role": ROLE[o], "source": src, "flagged_items": int(f.sum()),
               "subgroup_bias": float(fc[f].sum() / acts[o][f].sum()),
               "recovered_items": int(rec.sum()),
               "recovered_bias": float(fc[rec].sum() / acts[o][rec].sum()),
               "still_out_items": int(still.sum()),
               "still_out_bias": float(fc[still].sum() / max(acts[o][still].sum(), 1e-9))}
        if prior:
            num = sum(acts[p][flags[p]].sum() for p in prior)
            den = sum(base_forecast(p)[0][flags[p]].sum() for p in prior)
            factor = float(np.clip(num / den, *CLIP))
            corrected = fc.copy()
            corrected[f] *= factor
            s0 = evaluator(o).score(fc)[0]
            s1 = evaluator(o).score(corrected)[0]
            row.update({"factor": factor, "wrmsse_base": s0, "wrmsse_corrected": s1,
                        "helped": bool(s1 < s0)})
        rows[o] = row
        print(o, row)
    scored = [r for r in rows.values() if "helped" in r]
    summary = {"windows_scored": len(scored), "helped": int(sum(r["helped"] for r in scored)),
               "mean_change": float(np.mean([r["wrmsse_corrected"] - r["wrmsse_base"]
                                             for r in scored])) if scored else None}
    print(summary)
    (OUTPUTS / "stockout_correction.json").write_text(json.dumps(
        {"windows": rows, "summary": summary}, indent=2))


if __name__ == "__main__":
    main()

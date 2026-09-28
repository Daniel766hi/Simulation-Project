"""Multi-level alignment: does aligning to more than one aggregate level help?

reconcile.py aligns the item forecasts to one independent aggregate model (store x department,
level 9). WRMSSE weights all 12 levels equally and nine of them are aggregates, so a level
error that shows at store level (level 3) or store x category (level 8) costs as much as one at
level 9. The reconciliation literature argues for pooling information from several levels
(Wickramasuriya, Athanasopoulos & Hyndman, JASA 2019; Athanasopoulos et al., IJF 2024).

This test keeps everything else frozen (member weights 0 / 0.5 / 0.5, alpha 0.5 at every level,
no tuning) and compares four variants on all seven windows:

    L9          the current pipeline: align to store x department
    L3          align to store totals only
    L8          align to store x category only
    L9 then L3  align to store x department, then to store totals

The same aggregate LightGBM design (reconcile.forecast_aggregates) forecasts every level.
The variants were written after the backtest was seen and the private window is already known,
so the result is a diagnostic for future work and cannot change the reported 0.5866.
"""
import json

import numpy as np

import reconcile
from config import OUTPUTS
from score import evaluator
from wrmsse import aggregation_matrix, load_raw

ORIGINS = [1773, 1801, 1829, 1857, 1885, 1913, 1941]
WEIGHTS = {"recursive_store": 0.0, "recursive2_store": 0.5, "mh_store": 0.5}
ALPHA = 0.5


def level_series(full, level):
    """Summing matrix, daily totals and (store, group) keys for one aggregate level."""
    ids = full[["item_id", "dept_id", "cat_id", "store_id", "state_id"]]
    S, labels = aggregation_matrix(ids)
    rows = np.flatnonzero(labels["level"].to_numpy() == level)
    S_l = S[rows]
    days = [f"d_{d}" for d in range(1, 1970)]
    A = np.asarray(S_l @ full[days].to_numpy(np.float32))
    parts = labels["series"].iloc[rows].str.split("__", expand=True)
    keys = parts.rename(columns={0: "store_id", 1: "dept_id"})
    if "dept_id" not in keys:
        keys["dept_id"] = "ALL"                    # store level: one group per store
    return S_l, A, keys[["store_id", "dept_id"]].reset_index(drop=True)


def agg_forecast(level, A, keys, cal, o):
    path = OUTPUTS / f"agg_{level}_o{o}.npy"
    if not path.exists():
        np.save(path, reconcile.forecast_aggregates(A, keys, cal, o))
    return np.load(path)


def main():
    full, calendar, _ = load_raw()
    cal = reconcile.calendar_frame(calendar)
    levels = {lv: level_series(full, lv) for lv in ("L3", "L8", "L9")}
    rows = {}
    for o in ORIGINS:
        ens = sum(w * np.load(OUTPUTS / f"preds_{m}_o{o}.npy") for m, w in WEIGHTS.items())
        fc = {lv: agg_forecast(lv, A, k, cal, o) for lv, (_, A, k) in levels.items()}
        S = {lv: v[0] for lv, v in levels.items()}
        l9 = reconcile.align(ens, S["L9"], fc["L9"], ALPHA)
        variants = {
            "none": ens,
            "L9": l9,
            "L3": reconcile.align(ens, S["L3"], fc["L3"], ALPHA),
            "L8": reconcile.align(ens, S["L8"], fc["L8"], ALPHA),
            "L9 then L3": reconcile.align(l9, S["L3"], fc["L3"], ALPHA),
        }
        ev = evaluator(o)
        rows[o] = {k: ev.score(v)[0] for k, v in variants.items()}
        print(o, {k: round(v, 4) for k, v in rows[o].items()}, flush=True)
    names = list(rows[ORIGINS[0]])
    unseen = [o for o in ORIGINS if o != 1941]
    summary = {k: {"mean_1773_1913": float(np.mean([rows[o][k] for o in unseen])),
                   "beats_L9": int(sum(rows[o][k] < rows[o]["L9"] for o in unseen)),
                   "of": len(unseen), "private_already_seen": rows[1941][k]} for k in names}
    print(json.dumps(summary, indent=1))
    (OUTPUTS / "multilevel.json").write_text(json.dumps(
        {"windows": {str(o): v for o, v in rows.items()}, "summary": summary}, indent=2))


if __name__ == "__main__":
    main()

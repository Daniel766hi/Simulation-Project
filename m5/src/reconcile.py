"""Top-down alignment: correct bottom-level forecasts with an independent aggregate model.

Why: a model trained on item-store rows minimises item-level loss. Small biases that are
invisible on one item (a store drifting up 3%, a department slowing) add up across 3,049
items, and the upper levels of WRMSSE punish them hard. The M5 runner-up forecast the top
levels separately and adjusted the bottom forecasts towards them (Anderer & Li, "Hierarchical
forecasting with a top-down alignment of independent-level forecasts", IJF 2022); the
reconciliation literature (Athanasopoulos, Hyndman, Kourentzes & Panagiotelis, "Forecast
reconciliation: A review", IJF 2024) explains why mixing information from several levels
beats pure bottom-up.

What this does:
1. Forecast the 70 store x department daily totals with a small global LightGBM trained on
   those aggregates only. Aggregates are smooth, so four horizon-bucket models are used
   (days 1-7 may use lags from 7 days back, days 8-14 from 14, ...): no recursion, no leakage.
2. For every store x department and day, scale the item forecasts so they move towards the
   aggregate forecast:  item *= clip(aggregate / sum(items), 0.75, 1.33) ** alpha.
3. Choose alpha on the rolling validation folds, never on the private window.
"""
import json
import warnings

import lightgbm as lgb
import numpy as np
import pandas as pd

from config import HORIZON, OUTPUTS
from wrmsse import aggregation_matrix, load_raw

warnings.filterwarnings("ignore", category=RuntimeWarning)

AGG_LEVEL = "L9"            # store x department
TRAIN_DAYS = 1000
PARAMS = {"objective": "l2", "learning_rate": 0.03, "num_leaves": 31, "min_data_in_leaf": 40,
          "feature_fraction": 0.8, "bagging_fraction": 0.8, "bagging_freq": 1,
          "lambda_l2": 1.0, "verbose": -1, "num_threads": 2, "seed": 7}
ROUNDS = 600
ALPHAS = [0.0, 0.25, 0.5, 0.75, 1.0]


def aggregate_series(full):
    ids = full[["item_id", "dept_id", "cat_id", "store_id", "state_id"]]
    S, labels = aggregation_matrix(ids)
    rows = np.flatnonzero(labels["level"].to_numpy() == AGG_LEVEL)
    S9 = S[rows]
    days = [f"d_{d}" for d in range(1, 1970)]
    A = np.asarray(S9 @ full[days].to_numpy(np.float32))
    keys = labels["series"].iloc[rows].str.split("__", expand=True)
    keys.columns = ["store_id", "dept_id"]
    return S9, A, keys.reset_index(drop=True)


def calendar_frame(calendar):
    cal = calendar.copy()
    date = pd.to_datetime(cal["date"])
    ev = cal["event_name_1"].notna().to_numpy()
    idx = np.arange(len(cal))
    ev_idx = idx[ev]
    nxt = np.searchsorted(ev_idx, idx)
    to_next = np.where(nxt < len(ev_idx), ev_idx[np.minimum(nxt, len(ev_idx) - 1)] - idx, 99)
    return pd.DataFrame({
        "dow": date.dt.dayofweek, "dom": date.dt.day, "month": date.dt.month,
        "event": cal["event_type_1"].astype("category").cat.codes,
        "event_name": cal["event_name_1"].astype("category").cat.codes,
        "days_to_event": np.minimum(to_next, 30),
        "snap_CA": cal["snap_CA"], "snap_TX": cal["snap_TX"], "snap_WI": cal["snap_WI"],
    })


def build_rows(A, keys, cal, days, min_lag, origin):
    """Feature rows for every aggregate series on the given days (1-based day numbers)."""
    known = A.copy()
    known[:, origin:] = np.nan                 # nothing after the origin is ever visible
    scale = np.nanmean(known[:, origin - 364:origin], axis=1, keepdims=True)
    Z = known / scale
    frames = []
    for d in days:
        j = d - 1
        f = {"series": np.arange(len(A)), "day": np.full(len(A), d)}
        for lag in list(range(min_lag, min_lag + 7)) + [min_lag + 7, min_lag + 14, 364]:
            f[f"lag_{lag}"] = Z[:, j - lag] if j - lag >= 0 else np.nan
        for w in (7, 28, 91):
            lo = j - min_lag - w + 1
            f[f"rmean_{w}"] = np.nanmean(Z[:, max(lo, 0):j - min_lag + 1], axis=1)
        f["dow_mean"] = np.nanmean(np.stack([Z[:, j - min_lag - 7 * k] for k in range(4)]), axis=0)
        for c in cal.columns:
            if not c.startswith("snap"):
                f[c] = np.full(len(A), cal[c].iloc[j])
        f["snap"] = np.array([cal[f"snap_{s[:2]}"].iloc[j] for s in keys["store_id"]])
        f["y"] = A[:, j] / scale[:, 0]
        frames.append(pd.DataFrame(f))
    df = pd.concat(frames, ignore_index=True)
    df["store"] = pd.Categorical(keys["store_id"].to_numpy()[df["series"]]).codes
    df["dept"] = pd.Categorical(keys["dept_id"].to_numpy()[df["series"]]).codes
    return df, scale[:, 0]


def forecast_aggregates(A, keys, cal, origin):
    """70 x 28 forecast of store x department totals for days origin+1 .. origin+28."""
    out = np.zeros((len(A), HORIZON))
    for b in range(4):
        min_lag = 7 * (b + 1)
        tr_days = range(origin - TRAIN_DAYS + 1, origin + 1)
        tr, _ = build_rows(A, keys, cal, tr_days, min_lag, origin)
        feats = [c for c in tr.columns if c not in ("y", "series", "day")]
        model = lgb.train(PARAMS, lgb.Dataset(tr[feats], tr["y"],
                                              categorical_feature=["store", "dept"]), ROUNDS)
        fc_days = list(range(origin + 7 * b + 1, origin + 7 * b + 8))
        te, scale = build_rows(A, keys, cal, fc_days, min_lag, origin)
        pred = model.predict(te[feats]) * scale[te["series"]]
        out[te["series"].to_numpy(), te["day"].to_numpy() - origin - 1] = np.maximum(pred, 0)
    return out


def align(bottom, S9, agg_fc, alpha, lo=0.75, hi=1.33):
    sums = np.asarray(S9 @ bottom)
    factor = np.clip(np.where(sums > 0, agg_fc / np.maximum(sums, 1e-9), 1.0), lo, hi) ** alpha
    group = np.asarray(S9.argmax(axis=0)).ravel()      # each item-store belongs to one group
    return bottom * factor[group]


def main(base_name="ensemble", origins_tune=(1885, 1913), origin_final=1941):
    from score import evaluator
    full, calendar, prices = load_raw()
    cal = calendar_frame(calendar)
    S9, A, keys = aggregate_series(full)
    agg = {o: forecast_aggregates(A, keys, cal, o) for o in (*origins_tune, origin_final)}
    for o, fc in agg.items():
        np.save(OUTPUTS / f"agg_L9_o{o}.npy", fc)

    result = {"level": AGG_LEVEL, "alphas": ALPHAS, "folds": {}}
    for o in origins_tune:
        base = np.load(OUTPUTS / f"preds_{base_name}_o{o}.npy")
        act = A[:, o:o + HORIZON]
        bu = np.asarray(S9 @ base)
        result["folds"][o] = {
            "agg_model_wape": float(np.abs(agg[o] - act).sum() / act.sum()),
            "bottom_up_wape": float(np.abs(bu - act).sum() / act.sum()),
            "wrmsse": {str(a): evaluator(o).score(align(base, S9, agg[o], a))[0] for a in ALPHAS},
        }
        print(o, json.dumps(result["folds"][o], indent=1))
    mean = {a: np.mean([result["folds"][o]["wrmsse"][str(a)] for o in origins_tune]) for a in ALPHAS}
    best = min(mean, key=mean.get)
    result["mean_wrmsse_by_alpha"] = {str(a): float(v) for a, v in mean.items()}
    result["alpha"] = best
    print("chosen alpha", best, mean)
    for o in (*origins_tune, origin_final):
        base = np.load(OUTPUTS / f"preds_{base_name}_o{o}.npy")
        np.save(OUTPUTS / f"preds_{base_name}_aligned_o{o}.npy",
                align(base, S9, agg[o], best).astype(np.float32))
    (OUTPUTS / "reconcile.json").write_text(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    main()

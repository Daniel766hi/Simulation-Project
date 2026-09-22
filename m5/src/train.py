"""Train one LightGBM model per store and forecast the 28-day horizon.

    python train.py --kind direct    --phase validation   # tune: train <= d_1913, predict 1914-1941
    python train.py --kind recursive --phase evaluation   # final: train <= d_1941, predict 1942-1969

Per-store models keep each model's data small enough for a laptop and let every store learn
its own weekly rhythm and SNAP response. The Tweedie objective suits the target: a point mass
at zero (most item-days sell nothing) plus a long right tail on promotion and holiday days.
Predictions are written to outputs/preds_<kind>_<phase>.npy in the row order of the official
sales file so they can be scored or blended directly.
"""
import argparse
import json
import time
import warnings

import lightgbm as lgb
import numpy as np
import pandas as pd

from config import (HORIZON, LAST_TRAIN_EVALUATION, LAST_TRAIN_VALIDATION, OUTPUTS,
                    PROCESSED, RAW)
from features import CATEGORICAL, assemble, history_features, load_grid, to_wide

warnings.filterwarnings("ignore", category=RuntimeWarning)

STORES = ["CA_1", "CA_2", "CA_3", "CA_4", "TX_1", "TX_2", "TX_3", "WI_1", "WI_2", "WI_3"]
TRAIN_DAYS = 1000   # how many days of history each store model learns from

PARAMS = {
    "objective": "tweedie",
    "tweedie_variance_power": 1.1,
    "metric": "rmse",
    "learning_rate": 0.05,
    "num_leaves": 255,
    "min_data_in_leaf": 255,
    "feature_fraction": 0.6,
    "bagging_fraction": 0.7,
    "bagging_freq": 1,
    "lambda_l2": 0.1,
    "max_bin": 127,
    "boost_from_average": False,
    "num_threads": 4,
    "verbose": -1,
    "seed": 42,
}


def train_store(store, kind, last_train, rounds, params, log):
    grid = load_grid(store)
    items, wide = to_wide(grid, last_train)
    train_days = range(last_train - TRAIN_DAYS + 1, last_train + 1)
    X = assemble(grid, items, wide, kind, train_days, last_train)
    X = X[X["sales"].notna()]
    feat_cols = [c for c in X.columns if c not in ("d", "sales")]
    ds = lgb.Dataset(X[feat_cols], X["sales"], categorical_feature=CATEGORICAL,
                     free_raw_data=True)
    t = time.time()
    model = lgb.train(params, ds, num_boost_round=rounds)
    log(f"  {store}: {len(X):,} rows, {len(feat_cols)} features, trained in {time.time() - t:.0f}s")
    del X, ds

    fc_days = list(range(last_train + 1, last_train + HORIZON + 1))
    if kind == "direct":
        F = assemble(grid, items, wide, kind, fc_days, last_train)
        pred = np.clip(model.predict(F[feat_cols]), 0, None)
        out = F[["item_id", "d"]].assign(pred=pred)
    else:
        # Walk forward: each day's prediction becomes history for the next day's features.
        parts = []
        for day in fc_days:
            F = assemble(grid, items, wide, kind, [day], last_train)
            pred = np.clip(model.predict(F[feat_cols]), 0, None)
            rows = np.searchsorted(items, F["item_id"].to_numpy())
            wide[rows, day - 1] = pred
            parts.append(F[["item_id", "d"]].assign(pred=pred))
        out = pd.concat(parts, ignore_index=True)
    imp = pd.Series(model.feature_importance("gain"), index=feat_cols)
    return out, imp


def to_matrix(pred_long, last_train):
    """Reshape {store: long predictions} into the 30,490 x 28 official row order."""
    enc = pd.read_pickle(PROCESSED / "encoders.pkl")
    order = pd.read_csv(RAW / "sales_train_evaluation.csv", usecols=["item_id", "store_id"])
    order["item_code"] = order["item_id"].map(enc["item_id"])
    mat = np.zeros((len(order), HORIZON), dtype=np.float32)
    for store, df in pred_long.items():
        rows = order.index[order["store_id"] == store]
        pos = pd.Series(np.arange(len(rows)), index=order.loc[rows, "item_code"].to_numpy())
        r = rows[pos.loc[df["item_id"].to_numpy()].to_numpy()]
        mat[r, df["d"].to_numpy() - last_train - 1] = df["pred"].to_numpy()
    return mat


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kind", choices=["direct", "recursive"], default="direct")
    ap.add_argument("--phase", choices=["validation", "evaluation"], default="validation")
    ap.add_argument("--rounds", type=int, default=800)
    ap.add_argument("--stores", default="all")
    ap.add_argument("--tag", default="")
    ap.add_argument("--params", default="{}", help="JSON overrides for PARAMS")
    args = ap.parse_args()

    last_train = LAST_TRAIN_VALIDATION if args.phase == "validation" else LAST_TRAIN_EVALUATION
    stores = STORES if args.stores == "all" else args.stores.split(",")
    params = {**PARAMS, **json.loads(args.params)}
    name = f"{args.kind}_{args.phase}{args.tag}"
    OUTPUTS.mkdir(exist_ok=True)
    log_file = open(OUTPUTS / f"log_{name}.txt", "w")

    def log(msg):
        print(msg, flush=True)
        log_file.write(msg + "\n")
        log_file.flush()

    log(f"{name}: train <= d_{last_train}, {args.rounds} rounds, params {params}")
    preds, imps = {}, []
    for store in stores:
        preds[store], imp = train_store(store, args.kind, last_train, args.rounds, params, log)
        imps.append(imp.rename(store))
    np.save(OUTPUTS / f"preds_{name}.npy", to_matrix(preds, last_train))
    pd.concat(imps, axis=1).to_csv(OUTPUTS / f"importance_{name}.csv")
    log("done")


if __name__ == "__main__":
    main()

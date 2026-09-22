"""Train pooled LightGBM models and forecast the 28 days after a forecast origin.

    python train.py --kind direct    --pool store     --origin 1913   # public-LB window
    python train.py --kind recursive --pool store_cat --origin 1941   # private-LB window

A pool is the slice of data one model learns from: one model per store (10 models), per store
x category (30) or per store x department (70). The M5 winner averaged all three pools in both
a direct and a recursive variant (Makridakis, Spiliotis & Assimakopoulos, IJF 2022): different
pools see different cross-series patterns, so their errors are partly independent and the
average beats each member. The Tweedie objective suits the target: a point mass at zero (most
item-days sell nothing) plus a long right tail on promotion and holiday days.

Predictions go to outputs/preds_<kind>_<pool>_o<origin>.npy in the row order of the official
sales file so they can be scored or blended directly.
"""
import argparse
import json
import time
import warnings

import lightgbm as lgb
import numpy as np
import pandas as pd

from config import HORIZON, OUTPUTS, PROCESSED, RAW
from features import CATEGORICAL, assemble, load_grid, to_wide

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


POOL_COLS = {"store": None, "store_cat": "cat_id", "store_dept": "dept_id"}


def train_group(grid, label, kind, last_train, rounds, params, log):
    items, wide = to_wide(grid, last_train)
    train_days = range(last_train - TRAIN_DAYS + 1, last_train + 1)
    X = assemble(grid, items, wide, kind, train_days, last_train)
    X = X[X["sales"].notna()]
    feat_cols = [c for c in X.columns if c not in ("d", "sales")]
    ds = lgb.Dataset(X[feat_cols], X["sales"], categorical_feature=CATEGORICAL,
                     free_raw_data=True)
    t = time.time()
    model = lgb.train(params, ds, num_boost_round=rounds)
    log(f"  {label}: {len(X):,} rows, {len(feat_cols)} features, trained in {time.time() - t:.0f}s")
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


def train_store(store, pool, kind, last_train, rounds, params, log):
    grid = load_grid(store)
    col = POOL_COLS[pool]
    if col is None:
        return train_group(grid, store, kind, last_train, rounds, params, log)
    outs, imps = [], []
    for key, sub in grid.groupby(col):
        out, imp = train_group(sub.reset_index(drop=True), f"{store}/{col}={key}", kind,
                               last_train, rounds, params, log)
        outs.append(out)
        imps.append(imp)
    return pd.concat(outs, ignore_index=True), pd.concat(imps, axis=1).sum(axis=1)


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
    ap.add_argument("--pool", choices=list(POOL_COLS), default="store")
    ap.add_argument("--origin", type=int, default=1913,
                    help="last training day; 1913 = public LB, 1941 = private LB, 1885 = extra fold")
    ap.add_argument("--rounds", type=int, default=800)
    ap.add_argument("--stores", default="all")
    ap.add_argument("--tag", default="")
    ap.add_argument("--params", default="{}", help="JSON overrides for PARAMS")
    args = ap.parse_args()

    last_train = args.origin
    stores = STORES if args.stores == "all" else args.stores.split(",")
    params = {**PARAMS, **json.loads(args.params)}
    name = f"{args.kind}_{args.pool}_o{last_train}{args.tag}"
    OUTPUTS.mkdir(exist_ok=True)
    log_file = open(OUTPUTS / f"log_{name}.txt", "w")

    def log(msg):
        print(msg, flush=True)
        log_file.write(msg + "\n")
        log_file.flush()

    log(f"{name}: train <= d_{last_train}, {args.rounds} rounds, params {params}")
    preds, imps = {}, []
    for store in stores:
        preds[store], imp = train_store(store, args.pool, args.kind, last_train, args.rounds,
                                        params, log)
        imps.append(imp.rename(store))
    np.save(OUTPUTS / f"preds_{name}.npy", to_matrix(preds, last_train))
    pd.concat(imps, axis=1).to_csv(OUTPUTS / f"importance_{name}.csv")
    log("done")


if __name__ == "__main__":
    main()

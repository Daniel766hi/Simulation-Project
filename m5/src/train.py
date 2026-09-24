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
import shutil
import time
import warnings

import lightgbm as lgb
import numpy as np
import pandas as pd

from config import HORIZON, OUTPUTS, PROCESSED, RAW
from features import CATEGORICAL, assemble, assemble_mh, load_grid, to_wide

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

# Tree models cannot extrapolate a level they have not seen (Januschowski et al., "Forecasting
# with trees", IJF 2022), and M5 demand grew 14-20% year on year. Two remedies from the VN2
# winning solution (2026 report): per-series dynamic scaling, so the model learns patterns
# relative to each item's recent level instead of absolute volumes, and time-decayed sample
# weights, so recent behaviour counts more. Whole-history item means are dropped because they
# anchor forecasts to old volume levels.
OPTIONS = {"scale": True, "decay_half_life": 365, "drop_enc": True, "drop_item_id": True}
LEVEL_FEATURE = {"direct": ("rmean_28_30", "rmean_28_180"), "recursive": ("rmean_1_30", "rmean_1_60")}


def level_of(X, kind):
    short, long = LEVEL_FEATURE[kind]
    lvl = np.fmax(X[short].to_numpy(), 0.25 * np.nan_to_num(X[long].to_numpy()))
    return np.fmax(np.nan_to_num(lvl), 0.05)


def scale_frame(X, kind, opts):
    """Divide every sales-history feature by the item's recent level; return frame and level."""
    X = X.drop(columns=[c for c in ("enc_item_mean", "enc_item_std") if opts["drop_enc"]
                        and c in X.columns])
    if not opts["scale"]:
        return X, np.ones(len(X))
    lvl = level_of(X, kind)
    hist = [c for c in X.columns if c.startswith(("lag_", "rmean_", "rstd_", "dow_mean_"))]
    X[hist] = X[hist].to_numpy() / lvl[:, None]
    X["log_level"] = np.log(lvl)
    return X, lvl


MH_ORIGINS = 26          # training origins for the multi-horizon model, one every MH_STEP days
MH_STEP = 14


def train_group_mh(grid, label, last_train, rounds, params, log, opts):
    """Origin-anchored multi-horizon model: one pass, freshest data, every horizon at once."""
    items, wide = to_wide(grid, last_train)
    origins = [last_train - 28 - MH_STEP * k for k in range(MH_ORIGINS)]
    parts = []
    for o in origins:
        block, lvl = assemble_mh(grid, items, wide, o)
        block["_lvl"] = lvl
        block["_age"] = last_train - o
        parts.append(block)
    X = pd.concat(parts, ignore_index=True)
    X = X[X["sales"].notna()].reset_index(drop=True)
    # item_id as a 3,049-level categorical lets the model memorise each item's past ratio to its
    # level; out of sample that over-shrinks slow movers, so it is dropped by default.
    drop = {"d", "sales", "_lvl", "_age"} | ({"item_id"} if opts.get("drop_item_id") else set())
    feat_cols = [c for c in X.columns if c not in drop]
    lvl = X["_lvl"].to_numpy()
    weight = lvl * (0.5 ** (X["_age"].to_numpy() / opts["decay_half_life"])
                    if opts["decay_half_life"] else 1.0)
    ds = lgb.Dataset(X[feat_cols], X["sales"].to_numpy() / lvl, weight=weight,
                     categorical_feature=[c for c in CATEGORICAL if c in feat_cols],
                     free_raw_data=True)
    t = time.time()
    model = lgb.train(params, ds, num_boost_round=rounds)
    log(f"  {label}: {len(X):,} rows, {len(feat_cols)} features, trained in {time.time() - t:.0f}s")
    del X, ds
    F, lv = assemble_mh(grid, items, wide, last_train)
    pred = np.clip(model.predict(F[feat_cols]) * lv, 0, None)
    imp = pd.Series(model.feature_importance("gain"), index=feat_cols)
    return F[["item_id", "d"]].assign(pred=pred), imp


def stockout_mask(wide, last_train):
    """True on item-days inside a probable stock-out known by last_train: a run of 7+ zero days
    (at most 55 if it has ended) in an item that sold 1+ unit a day over the 56 days before it.
    Same rule as stockouts.py; only history up to last_train is used."""
    from stockouts import LOOKBACK, MAX_RUN, MIN_RATE, MIN_RUN, zero_runs
    mask = np.zeros(wide.shape, dtype=bool)
    hist = wide[:, :last_train]
    for i in range(len(hist)):
        row = np.nan_to_num(hist[i], nan=-1.0)            # not on sale yet: never a zero run
        for s, L in zip(*zero_runs(row)):
            if L < MIN_RUN or s < LOOKBACK or (s + L < last_train and L > MAX_RUN):
                continue
            if np.nanmean(hist[i, s - LOOKBACK:s]) >= MIN_RATE:
                mask[i, s:s + L] = True
    return mask


def train_group(grid, label, kind, last_train, rounds, params, log, opts=None):
    opts = opts or OPTIONS
    if kind == "mh":
        return train_group_mh(grid, label, last_train, rounds, params, log, opts)
    items, wide = to_wide(grid, last_train)
    train_days = range(last_train - TRAIN_DAYS + 1, last_train + 1)
    X = assemble(grid, items, wide, kind, train_days, last_train)
    X = X[X["sales"].notna()].reset_index(drop=True)
    if opts.get("mask_stockouts"):
        # Censored demand: a zero during a stock-out is not a zero demand, so drop those targets.
        m = stockout_mask(wide, last_train)
        hit = m[np.searchsorted(items, X["item_id"].to_numpy()), X["d"].to_numpy() - 1]
        X = X[~hit].reset_index(drop=True)
    X, lvl = scale_frame(X, kind, opts)
    feat_cols = [c for c in X.columns if c not in ("d", "sales")]
    weight = lvl.copy()                               # keep the loss on the unit scale
    if opts["decay_half_life"]:
        weight *= 0.5 ** ((last_train - X["d"].to_numpy()) / opts["decay_half_life"])
    ds = lgb.Dataset(X[feat_cols], X["sales"].to_numpy() / lvl, weight=weight,
                     categorical_feature=CATEGORICAL, free_raw_data=True)
    t = time.time()
    model = lgb.train(params, ds, num_boost_round=rounds)
    log(f"  {label}: {len(X):,} rows, {len(feat_cols)} features, trained in {time.time() - t:.0f}s")
    del X, ds

    fc_days = list(range(last_train + 1, last_train + HORIZON + 1))
    def predict(F):
        Fs, lv = scale_frame(F.copy(), kind, opts)
        return np.clip(model.predict(Fs[feat_cols]) * lv, 0, None)

    if kind == "direct":
        F = assemble(grid, items, wide, kind, fc_days, last_train)
        pred = predict(F)
        out = F[["item_id", "d"]].assign(pred=pred)
    else:
        # Walk forward: each day's prediction becomes history for the next day's features.
        parts = []
        for day in fc_days:
            F = assemble(grid, items, wide, kind, [day], last_train, window=200)
            pred = predict(F)
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
    global TRAIN_DAYS
    ap = argparse.ArgumentParser()
    ap.add_argument("--kind", choices=["direct", "recursive", "mh"], default="direct")
    ap.add_argument("--pool", choices=list(POOL_COLS), default="store")
    ap.add_argument("--origin", type=int, default=1913,
                    help="last training day; 1913 = public LB, 1941 = private LB, 1885 = extra fold")
    ap.add_argument("--rounds", type=int, default=800)
    ap.add_argument("--stores", default="all")
    ap.add_argument("--tag", default="", help="variant name, appended to the model kind")
    ap.add_argument("--train-days", type=int, default=TRAIN_DAYS)
    ap.add_argument("--no-scaling", action="store_true",
                    help="first-version settings: no dynamic scaling, no decay, item means kept")
    ap.add_argument("--mask-stockouts", action="store_true",
                    help="drop training targets that fall inside a probable stock-out")
    ap.add_argument("--params", default="{}", help="JSON overrides for PARAMS")
    args = ap.parse_args()

    last_train = args.origin
    stores = STORES if args.stores == "all" else args.stores.split(",")
    params = {**PARAMS, **json.loads(args.params)}
    name = f"{args.kind}{args.tag}_{args.pool}_o{last_train}"
    TRAIN_DAYS = args.train_days
    if args.no_scaling:
        OPTIONS.update({"scale": False, "decay_half_life": 0, "drop_enc": False})
    if args.mask_stockouts:
        OPTIONS["mask_stockouts"] = True
    OUTPUTS.mkdir(exist_ok=True)
    log_file = open(OUTPUTS / f"log_{name}.txt", "a")
    # Per-store checkpoints, so a run interrupted by a container restart resumes where it stopped.
    ckpt = OUTPUTS / "checkpoints" / name
    ckpt.mkdir(parents=True, exist_ok=True)

    def log(msg):
        print(msg, flush=True)
        log_file.write(msg + "\n")
        log_file.flush()

    log(f"{name}: train <= d_{last_train}, {args.rounds} rounds, params {params}")
    preds, imps = {}, []
    for store in stores:
        p_file, i_file = ckpt / f"{store}_pred.parquet", ckpt / f"{store}_imp.parquet"
        if p_file.exists() and i_file.exists():
            preds[store], imp = pd.read_parquet(p_file), pd.read_parquet(i_file)["imp"]
            log(f"  {store}: resumed from checkpoint")
        else:
            preds[store], imp = train_store(store, args.pool, args.kind, last_train, args.rounds,
                                            params, log)
            preds[store].to_parquet(p_file)
            imp.rename("imp").to_frame().to_parquet(i_file)
        imps.append(imp.rename(store))
    np.save(OUTPUTS / f"preds_{name}.npy", to_matrix(preds, last_train))
    pd.concat(imps, axis=1).to_csv(OUTPUTS / f"importance_{name}.csv")
    log("done")
    shutil.rmtree(ckpt)


if __name__ == "__main__":
    main()

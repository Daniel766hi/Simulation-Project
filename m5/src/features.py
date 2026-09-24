"""Sales-history features, computed from an items x days matrix so training and inference share
exactly one code path.

Two feature sets:

* **direct**   - every lag is at least 28 days old, so one model forecasts all 28 days at once
                 with no feedback of its own predictions (robust, no error accumulation).
* **recursive** - short lags (1-14 days) and recent rolling means; forecasting walks forward
                 one day at a time and feeds each day's prediction into the next day's features.

Pre-release days and every day after the training cut-off are NaN in the matrix, so no
feature can ever see a value from the forecast window.
"""
import numpy as np
import pandas as pd

from config import PROCESSED

STATIC = ["item_id", "dept_id", "cat_id", "event_name_1", "event_type_1", "event_name_2",
          "event_type_2", "tm_dom", "tm_woy", "tm_month", "tm_year", "tm_dow", "tm_weekend",
          "days_to_event", "days_since_event", "snap", "sell_price", "price_max", "price_min",
          "price_std", "price_mean", "price_norm", "price_nunique", "item_nunique",
          "price_momentum", "price_momentum_m", "price_momentum_y", "price_disc_4w",
          "weeks_on_sale"]
CATEGORICAL = ["item_id", "dept_id", "cat_id", "event_name_1", "event_type_1",
               "event_name_2", "event_type_2"]

SPECS = {
    "direct": {
        "lags": list(range(28, 43)),
        "rolls": [(28, w) for w in (7, 14, 30, 60, 180)],
        "stds": [(28, w) for w in (7, 30)],
        "same_dow": 28,
    },
    "recursive": {
        "lags": list(range(1, 15)),
        "rolls": [(s, w) for s in (1, 7, 14) for w in (7, 14, 30, 60)],
        "stds": [(1, 7), (1, 30)],
        "same_dow": 7,
    },
}


def load_grid(store: str) -> pd.DataFrame:
    return pd.read_parquet(PROCESSED / f"grid_{store}.parquet")


def to_wide(grid: pd.DataFrame, last_known_day: int, n_days: int = 1969):
    """items x days sales matrix (column j = day j+1), NaN when unknown or not yet on sale."""
    items = np.sort(grid["item_id"].unique())
    row = np.searchsorted(items, grid["item_id"].to_numpy())
    wide = np.full((len(items), n_days), np.nan, dtype=np.float32)
    wide[row, grid["d"].to_numpy() - 1] = grid["sales"].to_numpy()
    wide[:, last_known_day:] = np.nan
    return items, wide


def _rolling(wide, shift, window, func):
    """Rolling nan-aware mean/std of the `window` days ending `shift` days before each column."""
    v = np.nan_to_num(wide)
    c = (~np.isnan(wide)).astype(np.float32)
    pad = np.zeros((wide.shape[0], 1), dtype=np.float64)
    cs = np.concatenate([pad, np.cumsum(v, axis=1, dtype=np.float64)], axis=1)
    cc = np.concatenate([pad, np.cumsum(c, axis=1, dtype=np.float64)], axis=1)
    n = wide.shape[1]
    end = np.arange(n) - shift + 1                    # exclusive end index into cs
    start = end - window
    end_c = np.clip(end, 0, n)
    start_c = np.clip(start, 0, n)
    s = cs[:, end_c] - cs[:, start_c]
    k = cc[:, end_c] - cc[:, start_c]
    with np.errstate(invalid="ignore", divide="ignore"):
        mean = np.where(k > 0, s / k, np.nan)
        if func == "mean":
            return mean.astype(np.float32)
        cs2 = np.concatenate([pad, np.cumsum(v.astype(np.float64) ** 2, axis=1)], axis=1)
        s2 = cs2[:, end_c] - cs2[:, start_c]
        var = np.where(k > 1, s2 / k - mean ** 2, np.nan)
        return np.sqrt(np.maximum(var, 0)).astype(np.float32)


def _shifted(wide, lag):
    out = np.full_like(wide, np.nan)
    out[:, lag:] = wide[:, :-lag]
    return out


def history_features(wide, kind, cols=None):
    """Return {name: items x len(cols) array} for the given day columns (0-based)."""
    spec = SPECS[kind]
    cols = np.arange(wide.shape[1]) if cols is None else np.asarray(cols)
    feats = {}
    for lag in spec["lags"]:
        feats[f"lag_{lag}"] = _shifted(wide, lag)[:, cols]
    for s, w in spec["rolls"]:
        feats[f"rmean_{s}_{w}"] = _rolling(wide, s, w, "mean")[:, cols]
    for s, w in spec["stds"]:
        feats[f"rstd_{s}_{w}"] = _rolling(wide, s, w, "std")[:, cols]
    # Mean of the last four same-weekday observations: the weekly shape, at the right age.
    s0 = spec["same_dow"]
    same = np.stack([_shifted(wide, s0 + 7 * k) for k in range(4)])
    with np.errstate(invalid="ignore"):
        feats[f"dow_mean_{s0}"] = np.nanmean(same, axis=0)[:, cols]
    # Share of zero-sale days in the last 28 known days: intermittency of the item.
    zeros = (wide == 0).astype(np.float32)
    zeros[np.isnan(wide)] = np.nan
    feats["zero_share_28"] = _rolling(zeros, spec["lags"][0], 28, "mean")[:, cols]
    return feats


def item_encodings(wide, last_known_day):
    """Per-item mean and std of sales over the known history (a stable level estimate)."""
    known = wide[:, :last_known_day]
    with np.errstate(invalid="ignore"):
        return {"enc_item_mean": np.nanmean(known, axis=1),
                "enc_item_std": np.nanstd(known, axis=1)}


def assemble(grid, items, wide, kind, days, last_known_day, window=None):
    """Long feature frame for the rows of `grid` whose day is in `days`.

    `window` limits history features to that many days before the first requested day. Every
    feature looks back at most 74 days, so a 200-day window gives identical values while making
    the recursive day-by-day walk far cheaper than recomputing over the full history.
    """
    sub = grid[grid["d"].isin(days)].reset_index(drop=True)
    row = np.searchsorted(items, sub["item_id"].to_numpy())
    day_cols = np.asarray(sorted(days)) - 1
    col_pos = np.searchsorted(day_cols, sub["d"].to_numpy() - 1)
    off = max(0, int(day_cols.min()) - window) if window else 0
    feats = history_features(wide[:, off:], kind, day_cols - off)
    out = sub[["item_id", "d", "sales"] + [c for c in STATIC if c != "item_id"]].copy()
    for name, arr in feats.items():
        out[name] = arr[row, col_pos]
    for name, arr in item_encodings(wide, last_known_day).items():
        out[name] = arr[row].astype(np.float32)
    return out


# --------------------------------------------------------------------------------------------
# Origin-anchored multi-horizon features ("mh" model)
#
# The direct design above uses lags of at least 28 days relative to the *target* day, so on day
# 1 of the horizon it ignores the 27 most recent known days: its level information is always a
# month stale, which under-forecasts a growing business. Here every feature is computed at the
# forecast *origin* from all data up to it, and the horizon h (1..28) is a feature, so one model
# serves every horizon with the freshest data and no recursion. This is the single global
# multi-horizon design of the VN2 inventory-challenge winner (2026 report), including its
# per-series dynamic scaling: sales-history features and the target are divided by the item's
# level at the origin, so the model learns shape rather than volume.
# --------------------------------------------------------------------------------------------
MH_WINDOWS = (7, 14, 28, 56, 112, 364)


def _tail_mean(v, w):
    x = v[:, -w:]
    with np.errstate(invalid="ignore"):
        return np.nanmean(x, axis=1)


def origin_features(wide, origin):
    """Per-item statistics of everything known up to and including day `origin` (1-based)."""
    v = wide[:, :origin]
    f = {f"o_mean_{w}": _tail_mean(v, w) for w in MH_WINDOWS}
    with np.errstate(invalid="ignore"):
        f["o_std_28"] = np.nanstd(v[:, -28:], axis=1)
        z = (v[:, -28:] == 0).astype(np.float32)
        z[np.isnan(v[:, -28:])] = np.nan
        f["o_zero_share_28"] = np.nanmean(z, axis=1)
    for k in range(1, 8):
        f[f"o_lag_{k}"] = v[:, -k]
    sold = np.where(np.nan_to_num(v) > 0, np.arange(v.shape[1]), -1).max(axis=1)
    f["o_days_since_sale"] = np.where(sold >= 0, np.minimum(v.shape[1] - 1 - sold, 365), 365)
    f["o_trend_28_112"] = f["o_mean_28"] / (f["o_mean_112"] + 0.05)
    return f


def mh_level(f):
    lvl = np.fmax(np.nan_to_num(f["o_mean_28"]), 0.25 * np.nan_to_num(f["o_mean_112"]))
    return np.fmax(lvl, 0.05)


def assemble_mh(grid, items, wide, origin, horizon=28):
    """Rows for days origin+1 .. origin+horizon, features anchored at `origin`.

    Returns the feature frame (history features already divided by the level) and the level
    of each row, so target / level is the training label and prediction * level the forecast.
    """
    sub = grid[(grid["d"] > origin) & (grid["d"] <= origin + horizon)].reset_index(drop=True)
    row = np.searchsorted(items, sub["item_id"].to_numpy())
    t = sub["d"].to_numpy().astype(int)                  # 1-based target day
    h = t - origin
    f = origin_features(wide, origin)
    lvl = mh_level(f)[row]
    out = sub[["item_id", "d", "sales"] + [c for c in STATIC if c != "item_id"]].copy()
    out["h"] = h.astype(np.int8)
    scaled = [k for k in f if k not in ("o_days_since_sale", "o_zero_share_28", "o_trend_28_112")]
    for k, arr in f.items():
        out[k] = (arr[row] / lvl if k in scaled else arr[row]).astype(np.float32)
    # The four most recent same-weekday observations at or before the origin, and last year.
    first = t - 7 * np.ceil(h / 7).astype(int)          # most recent same weekday <= origin
    same = np.stack([wide[row, first - 7 * k - 1] for k in range(4)])
    with np.errstate(invalid="ignore"):
        out["o_same_dow_4"] = (np.nanmean(same, axis=0) / lvl).astype(np.float32)
        out["o_same_dow_1"] = (same[0] / lvl).astype(np.float32)
    out["o_last_year"] = (wide[row, t - 364 - 1] / lvl).astype(np.float32)
    out["log_level"] = np.log(lvl).astype(np.float32)
    return out, lvl

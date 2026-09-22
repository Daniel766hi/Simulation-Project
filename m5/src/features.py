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


def assemble(grid, items, wide, kind, days, last_known_day):
    """Long feature frame for the rows of `grid` whose day is in `days`."""
    sub = grid[grid["d"].isin(days)].reset_index(drop=True)
    row = np.searchsorted(items, sub["item_id"].to_numpy())
    day_cols = np.asarray(sorted(days)) - 1
    col_pos = np.searchsorted(day_cols, sub["d"].to_numpy() - 1)
    feats = history_features(wide, kind, day_cols)
    out = sub[["item_id", "d", "sales"] + [c for c in STATIC if c != "item_id"]].copy()
    for name, arr in feats.items():
        out[name] = arr[row, col_pos]
    for name, arr in item_encodings(wide, last_known_day).items():
        out[name] = arr[row].astype(np.float32)
    return out

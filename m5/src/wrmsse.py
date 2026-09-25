"""Weighted Root Mean Squared Scaled Error, the official M5 Accuracy metric.

The score is built over 42,840 series at 12 aggregation levels (total, state, store, category,
department, their crosses, item, item x state, item x store):

    RMSSE_i = sqrt( mean_h (y - yhat)^2 / mean_t (y_t - y_{t-1})^2 )

The denominator is the in-sample one-step naive error, computed from each series' first
non-zero sale so that products not yet on the shelf do not shrink the scale. Each series is
weighted by its dollar sales over the last 28 training days, weights sum to 1 within a level,
and the final score is the plain average of the 12 level scores.

Correctness is checked in `validate_evaluator.py` against the organisers' own weight file and
the published benchmark scores.
"""
import numpy as np
import pandas as pd
from scipy import sparse

from config import HORIZON, ID_COLS, RAW

LEVELS = [
    ("L1", []),
    ("L2", ["state_id"]),
    ("L3", ["store_id"]),
    ("L4", ["cat_id"]),
    ("L5", ["dept_id"]),
    ("L6", ["state_id", "cat_id"]),
    ("L7", ["state_id", "dept_id"]),
    ("L8", ["store_id", "cat_id"]),
    ("L9", ["store_id", "dept_id"]),
    ("L10", ["item_id"]),
    ("L11", ["item_id", "state_id"]),
    ("L12", ["item_id", "store_id"]),
]
LEVEL_NAMES = {
    "L1": "Total", "L2": "State", "L3": "Store", "L4": "Category", "L5": "Department",
    "L6": "State x category", "L7": "State x department", "L8": "Store x category",
    "L9": "Store x department", "L10": "Item", "L11": "Item x state", "L12": "Item x store",
}


def aggregation_matrix(ids: pd.DataFrame):
    """Sparse 0/1 matrix mapping the 30,490 bottom series to all 42,840 hierarchy series."""
    blocks, labels = [], []
    n = len(ids)
    for level, cols in LEVELS:
        if cols:
            key = ids[cols].astype(str).agg("__".join, axis=1)
        else:
            key = pd.Series("Total", index=ids.index)
        codes, uniques = pd.factorize(key, sort=False)
        blocks.append(sparse.csr_matrix(
            (np.ones(n, dtype=np.float32), (codes, np.arange(n))), shape=(len(uniques), n)))
        labels.append(pd.DataFrame({"level": level, "series": uniques}))
    return sparse.vstack(blocks).tocsr(), pd.concat(labels, ignore_index=True)


class WRMSSEEvaluator:
    """Precomputes scales and weights once, then scores any 30,490 x 28 forecast matrix."""

    def __init__(self, sales: pd.DataFrame, prices: pd.DataFrame, calendar: pd.DataFrame,
                 last_train_day: int, actuals: np.ndarray):
        self.ids = sales[ID_COLS].reset_index(drop=True)
        train_cols = [f"d_{d}" for d in range(1, last_train_day + 1)]
        train = sales[train_cols].to_numpy(np.float32)
        self.S, self.labels = aggregation_matrix(self.ids)

        agg_train = self.S @ train                                   # 42,840 x T
        self.scale = self._scales(agg_train)
        self.weights = self._weights(train, prices, calendar, last_train_day)
        self.actuals = np.asarray(actuals, dtype=np.float32)
        self.agg_actuals = self.S @ self.actuals
        self.level_idx = {lv: np.flatnonzero(self.labels["level"].to_numpy() == lv)
                          for lv, _ in LEVELS}

    @staticmethod
    def _scales(agg_train):
        # Squared one-step differences, counted only from the first non-zero observation on.
        started = np.cumsum(agg_train != 0, axis=1) > 0
        diff2 = np.diff(agg_train, axis=1) ** 2
        mask = started[:, :-1]                    # a diff counts once its left point is active
        n = mask.sum(axis=1)
        return (diff2 * mask).sum(axis=1) / np.maximum(n, 1)

    def _weights(self, train, prices, calendar, last_train_day):
        days = range(last_train_day - HORIZON + 1, last_train_day + 1)
        cal = calendar.set_index("d")
        weeks = cal.loc[[f"d_{d}" for d in days], "wm_yr_wk"].to_numpy()
        p = prices.pivot_table(index=["item_id", "store_id"], columns="wm_yr_wk",
                               values="sell_price")
        key = pd.MultiIndex.from_frame(self.ids[["item_id", "store_id"]])
        price_mat = p.reindex(key)[weeks].to_numpy(np.float32)
        dollars = np.nan_to_num(train[:, -HORIZON:] * price_mat)
        agg = self.S @ dollars.sum(axis=1)
        w = np.empty_like(agg)
        for level, _ in LEVELS:
            idx = np.flatnonzero(self.labels["level"].to_numpy() == level)
            w[idx] = agg[idx] / agg[idx].sum()
        return w

    def rmsse(self, forecast: np.ndarray) -> np.ndarray:
        agg_fc = self.S @ np.asarray(forecast, dtype=np.float32)
        mse = ((self.agg_actuals - agg_fc) ** 2).mean(axis=1)
        # A series with no sales history yet (not launched at an early origin) has scale 0 and
        # weight 0; give it zero error instead of 0 * inf = NaN.
        with np.errstate(divide="ignore", invalid="ignore"):
            return np.where(self.scale > 0, np.sqrt(mse / np.where(self.scale > 0, self.scale, 1)), 0.0)

    def score(self, forecast: np.ndarray):
        """Return (overall WRMSSE, {level: score})."""
        r = self.rmsse(forecast)
        per_level = {lv: float((self.weights[i] * r[i]).sum()) for lv, i in self.level_idx.items()}
        return float(np.mean(list(per_level.values()))), per_level


def _calendar(raw):
    calendar = pd.read_csv(raw / "calendar.csv")
    if "d" not in calendar:              # the redistributed calendar drops Kaggle's d column
        calendar.insert(0, "d", [f"d_{i}" for i in range(1, len(calendar) + 1)])
    return calendar


def load_raw():
    sales = pd.read_csv(RAW / "sales_train_evaluation.csv")
    if not (RAW / "sales_test_evaluation.csv").exists():
        # Kaggle ships sales only up to d_1941; the last 28 days are what is being forecast.
        future = pd.DataFrame(np.nan, index=sales.index,
                              columns=[f"d_{d}" for d in range(1942, 1970)])
        return pd.concat([sales, future], axis=1), _calendar(RAW), pd.read_csv(RAW / "sell_prices.csv")
    test = pd.read_csv(RAW / "sales_test_evaluation.csv")
    calendar = _calendar(RAW)
    prices = pd.read_csv(RAW / "sell_prices.csv")
    assert (sales["item_id"].values == test["item_id"].values).all()
    assert (sales["store_id"].values == test["store_id"].values).all()
    full = pd.concat([sales, test.drop(columns=ID_COLS)], axis=1)
    return full, calendar, prices


def build_evaluator(full, calendar, prices, last_train_day):
    """Evaluator for forecasting days last_train_day+1 .. +28 using actuals held in `full`."""
    act_cols = [f"d_{d}" for d in range(last_train_day + 1, last_train_day + HORIZON + 1)]
    return WRMSSEEvaluator(full, prices, calendar, last_train_day, full[act_cols].to_numpy())

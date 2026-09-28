"""Turn the wide M5 files into one long, compact parquet grid per store.

Each row is one item-store-day with its unit sales and every feature that does not depend on
past sales (those are added at training time, because their construction differs between the
direct and recursive models). Rows before an item's first price week are dropped: the product
was not on the shelf, so its zeros are not demand information.
"""
import numpy as np
import pandas as pd

from config import ID_COLS, LAST_DAY, PROCESSED
from wrmsse import load_raw

CAT_COLS = ["item_id", "dept_id", "cat_id", "store_id", "state_id",
            "event_name_1", "event_type_1", "event_name_2", "event_type_2"]


def calendar_features(calendar: pd.DataFrame) -> pd.DataFrame:
    cal = calendar.copy()
    cal["d"] = cal["d"].str[2:].astype(np.int16)
    date = pd.to_datetime(cal["date"])
    cal["tm_dom"] = date.dt.day.astype(np.int8)
    cal["tm_woy"] = date.dt.isocalendar().week.astype(np.int8)
    cal["tm_month"] = date.dt.month.astype(np.int8)
    cal["tm_year"] = (date.dt.year - date.dt.year.min()).astype(np.int8)
    cal["tm_dow"] = date.dt.dayofweek.astype(np.int8)
    cal["tm_weekend"] = (cal["tm_dow"] >= 5).astype(np.int8)
    # Distance to the next / since the last calendar event, so the model can learn the
    # run-up to Christmas, Thanksgiving, Super Bowl etc. rather than only the day itself.
    has_event = cal["event_name_1"].notna().to_numpy()
    idx = np.arange(len(cal))
    ev_idx = idx[has_event]
    nxt = np.searchsorted(ev_idx, idx)
    prv = nxt - 1
    to_next = np.where(nxt < len(ev_idx), ev_idx[np.minimum(nxt, len(ev_idx) - 1)] - idx, 99)
    since = np.where(prv >= 0, idx - ev_idx[np.maximum(prv, 0)], 99)
    cal["days_to_event"] = np.minimum(to_next, 30).astype(np.int8)
    cal["days_since_event"] = np.minimum(since, 30).astype(np.int8)
    keep = ["d", "wm_yr_wk", "event_name_1", "event_type_1", "event_name_2", "event_type_2",
            "snap_CA", "snap_TX", "snap_WI", "tm_dom", "tm_woy", "tm_month", "tm_year",
            "tm_dow", "tm_weekend", "days_to_event", "days_since_event"]
    return cal[keep]


def price_features(prices: pd.DataFrame, calendar: pd.DataFrame) -> pd.DataFrame:
    p = prices.copy()
    g = p.groupby(["store_id", "item_id"])["sell_price"]
    p["price_max"] = g.transform("max")
    p["price_min"] = g.transform("min")
    p["price_std"] = g.transform("std")
    p["price_mean"] = g.transform("mean")
    p["price_norm"] = p["sell_price"] / p["price_max"]          # 1.0 = regular shelf price
    p["price_nunique"] = g.transform("nunique")
    p["item_nunique"] = p.groupby(["store_id", "sell_price"])["item_id"].transform("nunique")
    # Price momentum: relative to last week (a cut shows up as < 1), to the month and year mean.
    p = p.merge(calendar[["wm_yr_wk", "tm_month", "tm_year"]].drop_duplicates("wm_yr_wk"),
                on="wm_yr_wk", how="left")
    p["price_momentum"] = p["sell_price"] / g.shift(1)
    p["price_momentum_m"] = p["sell_price"] / p.groupby(
        ["store_id", "item_id", "tm_year", "tm_month"])["sell_price"].transform("mean")
    p["price_momentum_y"] = p["sell_price"] / p.groupby(
        ["store_id", "item_id", "tm_year"])["sell_price"].transform("mean")
    # Discount depth relative to the item's rolling 4-week max: a cleaner "promotion" signal.
    p["price_disc_4w"] = p["sell_price"] / g.transform(lambda s: s.rolling(4, 1).max())
    p["release_week"] = p.groupby(["store_id", "item_id"])["wm_yr_wk"].transform("min")
    p = p.drop(columns=["tm_month", "tm_year"])
    for c in p.select_dtypes("float64"):
        p[c] = p[c].astype(np.float32)
    return p


def main():
    PROCESSED.mkdir(parents=True, exist_ok=True)
    full, calendar, prices = load_raw()
    cal = calendar_features(calendar)
    pf = price_features(prices, cal)

    # Consistent category codes across stores so one encoder serves every model.
    enc = {}
    for c in ["item_id", "dept_id", "cat_id", "store_id", "state_id"]:
        enc[c] = {v: i for i, v in enumerate(sorted(full[c].unique()))}
    for c in ["event_name_1", "event_type_1", "event_name_2", "event_type_2"]:
        vals = sorted(cal[c].dropna().unique())
        enc[c] = {v: i + 1 for i, v in enumerate(vals)}           # 0 = no event
        cal[c] = cal[c].map(enc[c]).fillna(0).astype(np.int8)
    pd.to_pickle(enc, PROCESSED / "encoders.pkl")

    day_cols = [f"d_{d}" for d in range(1, LAST_DAY + 1)]
    for store, block in full.groupby("store_id", sort=True):
        state = store.split("_")[0]
        long = block.melt(id_vars=ID_COLS, value_vars=day_cols, var_name="d", value_name="sales")
        long["d"] = long["d"].str[2:].astype(np.int16)
        long["sales"] = long["sales"].astype(np.float32)
        long = long.merge(cal, on="d", how="left")
        long["snap"] = long[f"snap_{state}"].astype(np.int8)
        long = long.drop(columns=["snap_CA", "snap_TX", "snap_WI"])
        long = long.merge(pf, on=["store_id", "item_id", "wm_yr_wk"], how="left")
        long = long[long["wm_yr_wk"] >= long["release_week"]]     # also drops NaN release
        long["weeks_on_sale"] = ((long["wm_yr_wk"] // 100 - long["release_week"] // 100) * 52
                                 + long["wm_yr_wk"] % 100 - long["release_week"] % 100
                                 ).astype(np.int16)
        for c in ["item_id", "dept_id", "cat_id", "store_id", "state_id"]:
            long[c] = long[c].map(enc[c]).astype(np.int16)
        long = long.drop(columns=["release_week"]).sort_values(["item_id", "d"])
        long = long.reset_index(drop=True)
        long.to_parquet(PROCESSED / f"grid_{store}.parquet", index=False)
        print(store, f"{len(long):,} rows", f"{long.memory_usage().sum() / 1e6:.0f} MB")


if __name__ == "__main__":
    main()

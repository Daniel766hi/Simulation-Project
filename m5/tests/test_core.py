"""Fast unit tests on synthetic data (no M5 download needed): metric maths, features, leakage.

    cd m5 && python3 -m pytest -q tests
"""
import sys
from pathlib import Path

import warnings

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
warnings.filterwarnings("ignore", category=RuntimeWarning)

from features import _rolling, _shifted, history_features, origin_features  # noqa: E402
from wrmsse import WRMSSEEvaluator, aggregation_matrix  # noqa: E402
from wspl import QUANTILES  # noqa: E402
import benchmarks  # noqa: E402
import reconcile  # noqa: E402


def toy_hierarchy(n_days=60, horizon=28, seed=0):
    """2 states x 1 store each x 2 categories x 2 items: small enough to check by hand."""
    rng = np.random.default_rng(seed)
    rows = []
    for state in ("CA", "TX"):
        store = f"{state}_1"
        for cat in ("FOODS", "HOBBIES"):
            for k in (1, 2):
                rows.append({"item_id": f"{cat}_1_00{k}", "dept_id": f"{cat}_1", "cat_id": cat,
                             "store_id": store, "state_id": state})
    ids = pd.DataFrame(rows)
    total = n_days + horizon
    sales = rng.poisson(3, size=(len(ids), total)).astype(float)
    sales[0, :5] = 0                                   # a late launch: leading zeros
    df = pd.concat([ids, pd.DataFrame(sales, columns=[f"d_{d}" for d in range(1, total + 1)])],
                   axis=1)
    cal = pd.DataFrame({"d": [f"d_{d}" for d in range(1, total + 1)],
                        "wm_yr_wk": [11101 + (d - 1) // 7 for d in range(1, total + 1)]})
    prices = pd.DataFrame([{"store_id": r.store_id, "item_id": r.item_id, "wm_yr_wk": w,
                            "sell_price": 2.0 + i} for i, r in enumerate(ids.itertuples())
                           for w in cal["wm_yr_wk"].unique()])
    actuals = sales[:, n_days:]
    return df, cal, prices, n_days, actuals


def test_aggregation_matrix_counts():
    df, *_ = toy_hierarchy()
    S, labels = aggregation_matrix(df[["item_id", "dept_id", "cat_id", "store_id", "state_id"]])
    counts = labels["level"].value_counts()
    assert counts["L1"] == 1 and counts["L2"] == 2 and counts["L3"] == 2
    assert counts["L12"] == len(df)
    # every level partitions the bottom series exactly once
    for lv in counts.index:
        assert np.allclose(S[(labels["level"] == lv).to_numpy()].sum(axis=0), 1)


def test_perfect_forecast_scores_zero_and_weights_sum_to_one():
    df, cal, prices, n, act = toy_hierarchy()
    ev = WRMSSEEvaluator(df, prices, cal, n, act)
    s, per_level = ev.score(act)
    assert s == pytest.approx(0, abs=1e-9)
    for lv, idx in ev.level_idx.items():
        assert ev.weights[idx].sum() == pytest.approx(1)


def test_rmsse_matches_hand_computation_for_one_series():
    df, cal, prices, n, act = toy_hierarchy()
    ev = WRMSSEEvaluator(df, prices, cal, n, act)
    fc = act + 1.0                                     # every day off by exactly one unit
    r = ev.rmsse(fc)
    i = int(ev.level_idx["L12"][0])                    # series 0 has five leading zeros
    y = df[[f"d_{d}" for d in range(6, n + 1)]].to_numpy()[0]
    scale = np.mean(np.diff(y) ** 2)
    assert r[i] == pytest.approx(np.sqrt(1.0 / scale), rel=1e-5)


def test_shifted_and_rolling_never_look_forward():
    wide = np.arange(1, 21, dtype=np.float32)[None]    # values 1..20 on days 1..20
    lag = _shifted(wide, 3)
    assert np.isnan(lag[0, :3]).all() and lag[0, 3] == 1
    roll = _rolling(wide, 1, 4, "mean")                # mean of the 4 days before each day
    assert roll[0, 10] == pytest.approx(np.mean([7, 8, 9, 10]))


def test_future_sales_cannot_leak_into_features():
    """to_wide must hide every value after the cut-off, so planting absurd future sales in the
    grid must leave every feature for the forecast window unchanged."""
    from features import to_wide
    rng = np.random.default_rng(1)
    days = np.arange(1, 201)
    grid = pd.DataFrame({"item_id": np.repeat([10, 11, 12], len(days)),
                         "d": np.tile(days, 3),
                         "sales": rng.poisson(2, 3 * len(days)).astype(np.float32)})
    cut = 150
    poisoned = grid.copy()
    poisoned.loc[poisoned["d"] > cut, "sales"] = 999.0
    _, wa = to_wide(grid, cut, n_days=200)
    _, wb = to_wide(poisoned, cut, n_days=200)
    assert np.isnan(wb[:, cut:]).all()
    window = np.arange(cut, cut + 28)                  # 0-based columns of days 151..178
    for kind in ("direct", "recursive"):
        fa, fb = history_features(wa, kind, window), history_features(wb, kind, window)
        for k in fa:
            np.testing.assert_array_equal(fa[k], fb[k])
    fa, fb = origin_features(wa, cut), origin_features(wb, cut)
    for k in fa:
        np.testing.assert_array_equal(fa[k], fb[k])


def test_origin_features_use_only_the_past():
    wide = np.tile(np.arange(1, 101, dtype=np.float32), (2, 1))
    f = origin_features(wide, 50)
    assert f["o_lag_1"][0] == 50 and f["o_mean_7"][0] == pytest.approx(np.mean(range(44, 51)))


def test_croston_on_regular_demand_equals_demand_rate():
    y = np.tile([0, 4.0], 100)[None]                   # 4 units every second day = 2/day
    fc = benchmarks.croston(y, alpha=0.1)
    assert fc[0, 0] == pytest.approx(2.0, rel=0.02)


def test_alignment_with_alpha_zero_is_identity_and_one_matches_totals():
    df, *_ = toy_hierarchy()
    ids = df[["item_id", "dept_id", "cat_id", "store_id", "state_id"]]
    S, labels = aggregation_matrix(ids)
    S9 = S[(labels["level"] == "L9").to_numpy()]
    bottom = np.full((len(df), 28), 2.0)
    agg = np.asarray(S9 @ bottom) * 1.1                # aggregate model says +10%
    np.testing.assert_allclose(reconcile.align(bottom, S9, agg, 0.0), bottom)
    np.testing.assert_allclose(np.asarray(S9 @ reconcile.align(bottom, S9, agg, 1.0)), agg)


def test_pinball_quantiles_are_ordered_and_symmetric():
    assert np.all(np.diff(QUANTILES) > 0)
    np.testing.assert_allclose(QUANTILES + QUANTILES[::-1], 1.0)


def test_unlaunched_series_do_not_turn_the_score_into_nan():
    df, cal, prices, n, act = toy_hierarchy()
    df.loc[0, [f"d_{d}" for d in range(1, n + 1)]] = 0.0     # item not on sale yet at the origin
    ev = WRMSSEEvaluator(df, prices, cal, n, act)
    s, per_level = ev.score(act + 1.0)
    assert np.isfinite(s) and all(np.isfinite(v) for v in per_level.values())

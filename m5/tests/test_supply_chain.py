"""Verification of the supply-chain simulator: extreme-condition tests and mass balance.

Extreme-condition testing checks that a simulation behaves sensibly when inputs are pushed to
limits where the right answer is known in advance; mass balance checks that no units are created
or destroyed. Synthetic data only, so these run in a second without the M5 download.
"""
import sys
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
warnings.filterwarnings("ignore", category=RuntimeWarning)

import supply_chain_sim as sc  # noqa: E402
from config import HORIZON  # noqa: E402

WINDOWS = [140, 168, 196]           # three forecast origins -> 84 simulated days


def make_chain(daily, n_items=2, stores=("CA_1", "CA_2", "TX_1")):
    """Synthetic network with the given daily demand (scalar or per-day array)."""
    rows = [{"item_id": f"I{i}", "store_id": s, "state_id": s[:2]}
            for i in range(n_items) for s in stores]
    last = WINDOWS[-1] + HORIZON
    d = np.broadcast_to(np.asarray(daily, float), (last,)) if np.ndim(daily) == 0 else np.asarray(daily, float)
    days = pd.DataFrame(np.tile(d, (len(rows), 1)), columns=[f"d_{k}" for k in range(1, last + 1)])
    return pd.concat([pd.DataFrame(rows), days], axis=1)


def perfect_inputs(full):
    fc, sig = {}, {}
    for o in [WINDOWS[0] - HORIZON] + WINDOWS:
        fc[o] = full[[f"d_{d}" for d in range(o + 1, o + HORIZON + 1)]].to_numpy(float)
        sig[o] = np.zeros(len(full))
    return fc, sig


def run(full, fc, sig, sharing=False, beta=1.0):
    price = np.ones(len(full))
    return sc.simulate(full, fc, sig, price, WINDOWS, sharing, beta)


def test_zero_demand_everything_stays_quiet():
    full = make_chain(0.0)
    fc, sig = perfect_inputs(full)
    for sharing in (False, True):
        r = run(full, fc, sig, sharing)
        assert r["units_served"] == 0 and r["units_lost"] == 0
        assert r["lost_sales_cost"] == 0
        assert sum(r["weekly"]["store_orders"]) == 0


def test_constant_demand_with_perfect_forecast_serves_everything():
    full = make_chain(5.0)
    fc, sig = perfect_inputs(full)
    for sharing in (False, True):
        r = run(full, fc, sig, sharing)
        assert r["store_fill_rate"] == pytest.approx(1.0)
        # in steady state stores order exactly what shoppers bought that week
        np.testing.assert_allclose(r["weekly"]["store_orders"], r["weekly"]["demand"], rtol=1e-9)


def test_units_are_conserved():
    rng = np.random.default_rng(3)
    last = WINDOWS[-1] + HORIZON
    full = make_chain(0)
    demand = rng.poisson(4, size=(len(full), last)).astype(float)
    full[[f"d_{d}" for d in range(1, last + 1)]] = demand
    fc = {o: np.full((len(full), HORIZON), 4.0) for o in [WINDOWS[0] - HORIZON] + WINDOWS}
    sig = {o: np.full(len(full), 2.0) for o in [WINDOWS[0] - HORIZON] + WINDOWS}
    r = run(full, fc, sig)
    measured = demand[:, WINDOWS[0] + sc.WARMUP_WEEKS * 7:WINDOWS[-1] + HORIZON].sum()
    assert r["units_served"] + r["units_lost"] == pytest.approx(measured)
    assert 0 < r["store_fill_rate"] <= 1


def test_unforecast_demand_step_causes_stockouts_then_recovery():
    last = WINDOWS[-1] + HORIZON
    daily = np.full(last, 5.0)
    step_day = WINDOWS[1] + 3                         # demand doubles mid-window, unforeseen
    daily[step_day:] = 10.0
    full = make_chain(daily)
    fc, sig = perfect_inputs(full)
    fc[WINDOWS[1]] = np.full_like(fc[WINDOWS[1]], 5.0)   # the forecast made before the step misses it
    r = run(full, fc, sig)
    assert r["store_fill_rate"] < 1.0                # the surprise costs sales ...
    known = run(full, *perfect_inputs(full))
    assert known["store_fill_rate"] > r["store_fill_rate"]   # ... that a correct forecast avoids


def test_order_smoothing_reduces_order_variance():
    rng = np.random.default_rng(5)
    last = WINDOWS[-1] + HORIZON
    full = make_chain(0)
    full[[f"d_{d}" for d in range(1, last + 1)]] = rng.poisson(6, size=(len(full), last)).astype(float)
    fc = {o: np.full((len(full), HORIZON), 6.0) for o in [WINDOWS[0] - HORIZON] + WINDOWS}
    sig = {o: np.full(len(full), 2.5) for o in [WINDOWS[0] - HORIZON] + WINDOWS}
    plain = run(full, fc, sig, beta=1.0)
    smooth = run(full, fc, sig, beta=0.3)
    assert smooth["bullwhip_store_orders"] < plain["bullwhip_store_orders"]

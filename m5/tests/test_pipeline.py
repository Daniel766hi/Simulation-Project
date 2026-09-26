"""Unit tests for the pieces the pre-registered comparison is built from: top-down alignment,
the stacked blend and the hypothesis test. Synthetic data only, so no M5 download is needed.

    cd m5 && python3 -m pytest -q tests
"""
import sys
import warnings
from pathlib import Path

import numpy as np
import pytest
from scipy import sparse

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
warnings.filterwarnings("ignore", category=RuntimeWarning)

import reconcile  # noqa: E402
from extended_comparison import test as hypothesis_test  # noqa: E402
from stacking import NAMES, blend, to_weights  # noqa: E402


def toy_groups(seed=0):
    """Six item-stores in two store x department groups, 28 days of forecasts."""
    rng = np.random.default_rng(seed)
    S9 = sparse.csr_matrix(np.array([[1, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 1]], dtype=float))
    bottom = rng.uniform(0.5, 3.0, size=(6, 28))
    return S9, bottom


def test_align_alpha_zero_is_identity():
    S9, bottom = toy_groups()
    agg = np.asarray(S9 @ bottom) * 1.2
    assert np.allclose(reconcile.align(bottom, S9, agg, 0.0), bottom)


def test_align_alpha_one_matches_aggregate_inside_the_clip():
    S9, bottom = toy_groups()
    agg = np.asarray(S9 @ bottom) * 1.1                  # inside [0.75, 1.33]
    out = reconcile.align(bottom, S9, agg, 1.0)
    assert np.allclose(np.asarray(S9 @ out), agg)
    # within a group every item moves by the same factor, so the item mix is kept
    assert np.allclose(out[:3] / bottom[:3], 1.1) and np.allclose(out[3:] / bottom[3:], 1.1)


def test_align_clips_extreme_corrections():
    S9, bottom = toy_groups()
    agg = np.asarray(S9 @ bottom) * 5.0                  # far outside the clip
    out = reconcile.align(bottom, S9, agg, 1.0)
    assert np.allclose(out / bottom, 1.33)
    agg_low = np.asarray(S9 @ bottom) * 0.1
    assert np.allclose(reconcile.align(bottom, S9, agg_low, 1.0) / bottom, 0.75)


def test_align_half_alpha_is_geometric_midpoint_and_keeps_zeros():
    S9, bottom = toy_groups()
    bottom[3:, 5] = 0.0                                  # a group with no forecast on one day
    agg = np.asarray(S9 @ bottom) * 1.21
    agg[1, 5] = 4.0
    out = reconcile.align(bottom, S9, agg, 0.5)
    assert np.allclose(out[:3, 0] / bottom[:3, 0], 1.1)  # sqrt(1.21)
    assert np.all(out[3:, 5] == 0.0)                     # nothing to scale, no division by zero
    assert np.all(out >= 0)


def test_stack_weights_live_on_the_simplex():
    for z in (np.zeros(4), np.array([3.0, -1.0, 0.5, 10.0]), np.array([-50.0, 0, 50, 700])):
        w = to_weights(z)
        assert np.all(w >= 0) and np.isclose(w.sum(), 1.0) and np.argmax(w) == np.argmax(z)


def test_blend_is_the_weighted_sum_of_members():
    rng = np.random.default_rng(1)
    members = {k: rng.uniform(0, 5, size=(6, 28)) for k in NAMES}
    w = to_weights(np.array([0.2, -0.4, 1.0, 0.1]))
    expected = sum(wi * members[k] for wi, k in zip(w, NAMES))
    assert np.allclose(blend(members, w), expected)
    one_hot = np.eye(len(NAMES))[2]
    assert np.allclose(blend(members, one_hot), members[NAMES[2]])


def test_hypothesis_needs_both_tests_and_all_windows_to_agree():
    better = [-0.02, -0.01, -0.03, -0.015, -0.02, -0.01, -0.025, -0.005, -0.01]
    res = hypothesis_test(better)
    assert res["supported"] and res["wins"] == 9 and res["n"] == 9
    assert res["wilcoxon_p"] < 0.05 and res["dm_t_p"] < 0.05


@pytest.mark.parametrize("d", [
    [0.0] * 9,                                             # no difference at all
    [-0.02, 0.03, -0.01, 0.02, -0.01, 0.01, -0.02, 0.02, 0.0],   # a coin flip
    [-0.2, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01],      # one big win, eight small losses
])
def test_hypothesis_is_not_supported_without_consistent_evidence(d):
    res = hypothesis_test(d)
    assert not res["supported"]

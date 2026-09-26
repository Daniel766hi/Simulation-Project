"""Confirmation test for the stacked blend on six new untouched windows (roadmap, after step 1).

Pre-registered: this file and outputs/stack_weights_9.json are committed before any model for the
new windows has started training.

Why. On the three-window holdout the stack beat the 50/50 combination in 3 of 3 windows (mean
0.5626 vs 0.5697), but three windows cannot give a significant test. This test decides whether
the stack should replace the 50/50 combination.

Weights. Refitted with stacking.fit_weights on all nine registered windows (1605 to 1829), then
frozen in outputs/stack_weights_9.json. Members and calibration exactly as in stacking.py.

New windows. Origins 1577, 1549, 1521, 1493, 1465, 1437: the six 28-day windows immediately before
the nine, never used for any fit or choice. Store calibration walks forward over the new windows
only, in time order (1437 is uncalibrated), so nothing after a window is used to forecast it.

Hypotheses (one-sided; supported only if the Wilcoxon signed-rank test and the paired t-test on
the per-window WRMSSE differences (a Diebold-Mariano test) both give p < 0.05, exactly as in
extended_comparison.test):
    P1 (primary)  the stack beats the 50/50 combination
    P2            the stack beats the winner's recipe
    R1            replication of H1 on new data: the 50/50 combination beats the winner's recipe
With six windows the smallest one-sided Wilcoxon p is 1/64, so P1 needs the stack to win at least
five windows with any loss small. If P1 is not supported, the 50/50 combination stays the method.

Usage:  python3 stack_confirm.py fit    |    python3 stack_confirm.py test
"""
import json
import sys

import numpy as np

from config import OUTPUTS
from extended_comparison import ORIGINS, complete, test as paired_test
from score import evaluator
from stacking import NAMES, blend, fit_weights, members

FIT = list(ORIGINS)
NEW = [1437, 1465, 1493, 1521, 1549, 1577]
WEIGHTS = OUTPUTS / "stack_weights_9.json"


def fit():
    w, m, evs, calls = fit_weights(FIT)
    per = {str(o): evs[o].score(blend(m[o], w))[0] for o in FIT}
    res = {"weights": dict(zip(NAMES, map(float, w))), "fit_windows": FIT, "new_windows": NEW,
           "fit_mean_stack": float(np.mean(list(per.values()))), "fit_per_window": per, "loss_calls": calls,
           "note": "In-sample fit on nine windows. Only the six new windows count as evidence."}
    WEIGHTS.write_text(json.dumps(res, indent=2))
    print(json.dumps(res, indent=1))


def test():
    w = np.array([json.loads(WEIGHTS.read_text())["weights"][k] for k in NAMES])
    done = [o for o in NEW if complete(o)]
    print("new windows complete:", done)
    if not done:
        return
    m = members(done)
    rows = {}
    for o in done:
        ev = evaluator(o)
        win = 0.5 * m[o]["win_rec"] + 0.5 * m[o]["win_dir"]
        rows[o] = {"stack": ev.score(blend(m[o], w))[0], "winner": ev.score(win)[0],
                   "combined": ev.score(0.5 * win + 0.5 * m[o]["ours"])[0]}
        print(o, {k: round(v, 4) for k, v in rows[o].items()}, flush=True)

    def diff(a, b):
        return [rows[o][a] - rows[o][b] for o in done]

    res = {"windows": {str(o): r for o, r in rows.items()},
           "mean": {k: float(np.mean([r[k] for r in rows.values()])) for k in ("stack", "winner", "combined")},
           "tests": {"P1": {"method": "stack vs combined", **paired_test(diff("stack", "combined"))},
                     "P2": {"method": "stack vs winner", **paired_test(diff("stack", "winner"))},
                     "R1": {"method": "combined vs winner", **paired_test(diff("combined", "winner"))}},
           "complete": len(done), "planned": len(NEW)}
    (OUTPUTS / "stack_confirm.json").write_text(json.dumps(res, indent=2))
    print(json.dumps(res, indent=1))


if __name__ == "__main__":
    {"fit": fit, "test": test}[sys.argv[1]]()

"""Maintenance tools: a drift monitor and an accuracy gate for any change to the pipeline.

Drift monitor. For every store and window, forecast / actual of the frozen pipeline. A store is
flagged when it is off by more than TOLERANCE in the same direction in two windows running:
the tracking-signal idea demand planners use, and the signal the calibration step misread (a
one-window bias is usually noise; a repeated one is worth acting on).

Accuracy gate. A candidate forecast replaces the current one only if it has the lower mean
WRMSSE over the gate windows AND wins most of them. Both conditions matter: the post-mortem
showed a step can win on average through one lucky window and still lose most of the time.

    python monitor.py                                  # drift report for the frozen pipeline
    python monitor.py --gate CANDIDATE [--base bt_final] [--windows 1773,1801,1829]
"""
import argparse
import json

import numpy as np

from config import HORIZON, OUTPUTS
from score import evaluator
from wrmsse import load_raw

ORIGINS = [1773, 1801, 1829, 1857, 1885, 1913, 1941]
TOLERANCE = 0.05


def drift(full, name="bt_final"):
    stores = full["store_id"].to_numpy()
    names = sorted(set(stores))
    ratio = {}
    for o in ORIGINS:
        fc = np.load(OUTPUTS / f"preds_{name}_o{o}.npy").sum(axis=1)
        act = full[[f"d_{d}" for d in range(o + 1, o + HORIZON + 1)]].to_numpy().sum(axis=1)
        ratio[o] = {s: float(fc[stores == s].sum() / act[stores == s].sum()) for s in names}
    alerts = []
    for a, b in zip(ORIGINS, ORIGINS[1:]):
        for s in names:
            ra, rb = ratio[a][s] - 1, ratio[b][s] - 1
            if abs(ra) > TOLERANCE and abs(rb) > TOLERANCE and np.sign(ra) == np.sign(rb):
                alerts.append({"store": s, "windows": [a, b],
                               "direction": "over" if rb > 0 else "under",
                               "ratios": [round(ratio[a][s], 3), round(ratio[b][s], 3)]})
    return {"tolerance": TOLERANCE, "ratio": {str(o): r for o, r in ratio.items()},
            "alerts": alerts}


def gate(candidate, base, windows):
    rows = {}
    for o in windows:
        ev = evaluator(o)
        rows[o] = {k: ev.score(np.load(OUTPUTS / f"preds_{n}_o{o}.npy"))[0]
                   for k, n in (("candidate", candidate), ("base", base))}
    mean = {k: float(np.mean([r[k] for r in rows.values()])) for k in ("candidate", "base")}
    wins = int(sum(r["candidate"] < r["base"] for r in rows.values()))
    passed = mean["candidate"] < mean["base"] and wins > len(windows) / 2
    return {"candidate": candidate, "base": base, "windows": {str(o): r for o, r in rows.items()},
            "mean": mean, "wins": wins, "of": len(windows), "passed": bool(passed)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gate", help="prediction name to test, e.g. winner_recipe")
    ap.add_argument("--base", default="bt_final")
    ap.add_argument("--windows", default="1773,1801,1829")
    args = ap.parse_args()
    if args.gate:
        g = gate(args.gate, args.base, [int(w) for w in args.windows.split(",")])
        print(f"{g['candidate']} vs {g['base']}: mean {g['mean']['candidate']:.4f} vs "
              f"{g['mean']['base']:.4f}, wins {g['wins']} of {g['of']} -> "
              f"{'PASS' if g['passed'] else 'FAIL'}")
        return
    report = drift(load_raw()[0])
    for a in report["alerts"]:
        print(f"{a['store']}: {a['direction']}-forecast in windows {a['windows']} "
              f"(forecast / actual {a['ratios']})")
    print(f"{len(report['alerts'])} alerts at tolerance {TOLERANCE:.0%}")
    (OUTPUTS / "monitor.json").write_text(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

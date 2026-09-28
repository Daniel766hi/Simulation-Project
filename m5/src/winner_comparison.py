"""Head-to-head: this project's frozen pipeline vs the M5 winner's recipe, on untouched windows.

The private leaderboard is already known, so it cannot decide a fair contest. Instead both
methods are scored on the three rolling windows that played no part in any choice made for
this project (forecast origins d_1773, d_1801, d_1829).

The winner's recipe (YeonJun In, 1st place, code in the organisers' M5-methods repository) is
re-implemented at compute matched to this project: the same six components - recursive and
non-recursive LightGBM, each trained per store, per store x category and per store x department -
no per-series scaling, item-level mean encodings kept, the winner's leaf and sampling settings
(4,095 rows per leaf, 50% feature and row sampling, 100 bins), and the final forecast as the plain
average of the six. Two things are scaled down and stated openly:
- 255 leaves per tree instead of 2,047 (the same as this project's models). At full size one store
  took 2,060 s to train against 266 s, so 18 runs would need about four days on this machine.
- 900 trees at learning rate 0.05 on the last 1,000 days, instead of 3,000 at 0.015 on the full
  history (learning rate x trees is matched: 45 vs 45).
So this compares the two recipes at equal compute, not against the original full-size run.

Pre-registered before any result was seen (committed while the replica was still training):
a fixed 50/50 average of this project's final forecast and the winner's recipe ("combined").
No weight is tuned, so it cannot be fitted to these windows. The M5 organisers found that
combining different strong methods was the most reliable gain in the competition.
"""
import json

import numpy as np

from config import OUTPUTS
from score import evaluator

WINDOWS = [1773, 1801, 1829]
COMPONENTS = [f"{k}_win_{p}" for k in ("recursive", "direct")
              for p in ("store", "store_cat", "store_dept")]
OURS = {"ours_final": "bt_final", "ours_before_calibration": "bt_aligned"}


def load(name, o):
    return np.load(OUTPUTS / f"preds_{name}_o{o}.npy")


def main():
    rows = {}
    for o in WINDOWS:
        ev = evaluator(o)
        comps = {c: load(c, o) for c in COMPONENTS}
        winner = np.mean(list(comps.values()), axis=0)
        np.save(OUTPUTS / f"preds_winner_recipe_o{o}.npy", winner.astype(np.float32))
        ours = {k: load(v, o) for k, v in OURS.items()}
        entries = {"winner_recipe": winner, **comps, **ours,
                   "combined": 0.5 * winner + 0.5 * ours["ours_final"]}
        rows[o] = {}
        for name, mat in entries.items():
            s, lv = ev.score(mat)
            rows[o][name] = {"wrmsse": s, "levels": lv}
        w, f = rows[o]["winner_recipe"]["wrmsse"], rows[o]["ours_final"]["wrmsse"]
        print(f"d{o + 1}-{o + 28}: winner recipe {w:.4f}  ours {f:.4f}  "
              f"({'ours better' if f < w else 'winner better'} by {abs(w - f):.4f})")
    mean = {k: float(np.mean([rows[o][k]["wrmsse"] for o in WINDOWS])) for k in rows[WINDOWS[0]]}
    wins = sum(rows[o]["ours_final"]["wrmsse"] < rows[o]["winner_recipe"]["wrmsse"] for o in WINDOWS)
    comb = sum(rows[o]["combined"]["wrmsse"] < min(rows[o]["winner_recipe"]["wrmsse"],
                                                   rows[o]["ours_final"]["wrmsse"]) for o in WINDOWS)
    summary = {"mean_wrmsse": mean, "ours_final_wins": int(wins), "combined_beats_both": int(comb),
               "of": len(WINDOWS)}
    print(json.dumps(summary, indent=1))
    (OUTPUTS / "winner_comparison.json").write_text(json.dumps(
        {"windows": {str(k): v for k, v in rows.items()}, "summary": summary}, indent=2))


if __name__ == "__main__":
    main()

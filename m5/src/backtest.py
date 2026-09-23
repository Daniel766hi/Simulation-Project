"""Robustness backtest of the frozen pipeline over seven 28-day windows.

Ma & Fildes (IJF 2022) recommend judging forecasting methods on multiple rolling test sets,
because a single window can reward luck. After the final result was fixed, the whole pipeline
(members, ensemble weights 0 / 0.5 / 0.5, alignment alpha = 0.5, store-level calibration) was
frozen and replayed on three earlier windows that played no part in any decision:

    backtest windows   origins 1773, 1801, 1829   (never used for any choice)
    selection windows  origins 1857, 1885, 1913   (weights, alpha, calibration chosen here)
    private window     origin  1941               (scored once, reported as final)

Calibration at each origin uses every earlier origin in this sequence (walk-forward), so the
backtest also answers the open question from the post-mortem: does bias calibration help in
general, or was the private-window failure typical?
"""
import json

import numpy as np

import calibrate
import reconcile
from config import HORIZON, OUTPUTS
from score import evaluator
from wrmsse import load_raw

ORIGINS = [1773, 1801, 1829, 1857, 1885, 1913, 1941]
ROLE = {1773: "backtest", 1801: "backtest", 1829: "backtest", 1857: "selection",
        1885: "selection", 1913: "selection", 1941: "private"}


def main():
    final = json.loads((OUTPUTS / "final_scores.json").read_text())
    weights, alpha = final["weights"], final["alpha"]
    grain, shrink = final["calibration"]["grain"], final["calibration"]["shrink"]
    full, calendar, _ = load_raw()
    cal = reconcile.calendar_frame(calendar)
    S9, A, keys = reconcile.aggregate_series(full)
    codes = calibrate.group_codes(full, calibrate.GRAINS[grain])

    rows = {}
    for i, o in enumerate(ORIGINS):
        members = {m: np.load(OUTPUTS / f"preds_{m}_o{o}.npy") for m in weights}
        ens = sum(w * members[m] for m, w in weights.items())
        agg = reconcile.forecast_aggregates(A, keys, cal, o)
        aligned = reconcile.align(ens, S9, agg, alpha)
        np.save(OUTPUTS / f"preds_bt_aligned_o{o}.npy", aligned.astype(np.float32))
        prior = ORIGINS[:i]
        if prior:
            f = 1 + shrink * (calibrate.factors("bt_aligned", prior, codes, full) - 1)
            calibrated = aligned * np.clip(f, 0.8, 1.25)[codes][:, None]
        else:
            calibrated = aligned
        hist = full[[f"d_{d}" for d in range(o - 6, o + 1)]].to_numpy(float)
        snaive = np.tile(hist, HORIZON // 7)
        act = full[[f"d_{d}" for d in range(o + 1, o + HORIZON + 1)]].to_numpy().sum()
        ev = evaluator(o)
        stages = {"sNaive": snaive, **members, "ensemble": ens, "aligned": aligned,
                  "calibrated": calibrated}
        rows[o] = {"role": ROLE[o],
                   "wrmsse": {k: ev.score(v)[0] for k, v in stages.items()},
                   "bias": {k: float(v.sum() / act) for k, v in stages.items()}}
        print(o, ROLE[o], {k: round(v, 4) for k, v in rows[o]["wrmsse"].items()})

    def helped(a, b, roles):
        wins = [rows[o]["wrmsse"][b] < rows[o]["wrmsse"][a] for o in ORIGINS if ROLE[o] in roles]
        return {"wins": int(sum(wins)), "of": len(wins)}

    summary = {}
    for roles, label in ((("backtest",), "backtest"), (("backtest", "selection", "private"), "all")):
        summary[label] = {
            "ensemble_vs_best_member": {
                "wins": int(sum(rows[o]["wrmsse"]["ensemble"] < min(rows[o]["wrmsse"][m] for m in weights)
                                for o in ORIGINS if ROLE[o] in roles)),
                "of": sum(ROLE[o] in roles for o in ORIGINS)},
            "alignment": helped("ensemble", "aligned", roles),
            "calibration": helped("aligned", "calibrated", roles),
            "mean": {k: float(np.mean([rows[o]["wrmsse"][k] for o in ORIGINS if ROLE[o] in roles]))
                     for k in rows[ORIGINS[0]]["wrmsse"]},
        }
        print(label, json.dumps(summary[label], indent=1))
    (OUTPUTS / "backtest.json").write_text(json.dumps({"windows": rows, "summary": summary},
                                                      indent=2))


if __name__ == "__main__":
    main()

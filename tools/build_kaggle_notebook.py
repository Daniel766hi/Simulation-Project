"""Build m5/kaggle/m5-forecast.ipynb: a self-contained Kaggle notebook for M5 Forecasting - Accuracy.

The notebook embeds the repository's own pipeline modules (written to disk with %%writefile),
so the code that runs on Kaggle is the code that was tested here. Run from the repo root:

    python3 tools/build_kaggle_notebook.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "m5" / "src"
OUT = ROOT / "m5" / "kaggle" / "m5-forecast.ipynb"
MODULES = ["config.py", "wrmsse.py", "prepare_data.py", "features.py", "stockouts.py",
           "train.py", "reconcile.py"]

# Store calibration factors of the final pipeline: actual / forecast of the aligned ensemble,
# pooled over the three validation folds (origins 1857, 1885, 1913), clipped to 0.8-1.25.
# They use training-period data only and reproduce preds_final_o1941 to within 1e-5.
STORE_FACTORS = {"CA_1": 1.001908, "CA_2": 1.048772, "CA_3": 0.971688, "CA_4": 1.026075,
                 "TX_1": 1.018551, "TX_2": 1.013119, "TX_3": 1.019434, "WI_1": 1.01416,
                 "WI_2": 1.052672, "WI_3": 1.040425}


def md(text):
    return {"cell_type": "markdown", "metadata": {}, "source": text.strip("\n").splitlines(True)}


def code(text):
    return {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [],
            "source": text.strip("\n").splitlines(True)}


INTRO = """
# M5 Forecasting: LightGBM pipeline + the winner's recipe, combined

Forecasts 28 days of unit sales for 30,490 Walmart item-stores (d_1942–d_1969) and writes
`submission.csv`. Full write-up, tests and dashboard:
[github.com/Daniel766hi/Simulation-Project](https://github.com/Daniel766hi/Simulation-Project/tree/claude/gifted-tesla-9xrlx2/m5).

**Method.** Two forecasts are averaged 50/50:

1. **This pipeline.** A recursive LightGBM and an origin-anchored multi-horizon LightGBM, one model per
   store, Tweedie loss, per-series scaling with time-decay weights. Their average is aligned to an
   independent store × department aggregate model (top-down alignment, Anderer & Li 2022) and then
   multiplied by per-store bias factors learned on three earlier validation windows.
2. **The M5 winner's recipe** (YeonJun In, 1st place): recursive and non-recursive LightGBM, each per
   store, per store × category and per store × department, averaged. It runs here at the same compute
   as part 1 (255 leaves, 900 trees at learning rate 0.05, last 1,000 days), not at its original size.

**Why the combination.** On three windows that played no part in any choice (d1774–1857), the
winner's recipe scored a mean WRMSSE of 0.626, this pipeline 0.616 and the 50/50 average 0.599.
The two miss the overall level in opposite directions, so averaging cancels much of the error. The
combination was fixed in the repository before any of those results existed.

**Honesty note.** This notebook was written after the competition ended and after the private
leaderboard window was known. Its score is a late submission and says nothing about rank.

**Runtime** on Kaggle's 4-CPU notebooks: about 1.5 h for part 1 and about 6 h more for part 2.
Set `RUN_WINNER = False` for a fast run of part 1 only.
"""

SETTINGS = f"""
import glob, os, sys, subprocess, time
from pathlib import Path

RUN_WINNER = True     # add the winner's recipe (about 6 h); False = this pipeline only (about 1.5 h)
QUICK = False         # smoke test: 5 trees per model, finishes in minutes, scores badly

found = glob.glob("/kaggle/input/*/calendar.csv") + glob.glob("/kaggle/input/*/*/calendar.csv")
RAW = Path(os.environ.get("M5_RAW") or (Path(found[0]).parent if found else "."))
WORK = Path(os.environ.get("M5_WORK", "/kaggle/working"))
SRC = WORK / "src"
SRC.mkdir(parents=True, exist_ok=True)
os.chdir(WORK)                                  # the %%writefile cells below write to src/
os.environ["M5_RAW"], os.environ["M5_WORK"] = str(RAW), str(WORK)
ORIGIN = 1941                                   # train through d_1941, forecast d_1942..d_1969
ROUNDS = 5 if QUICK else 800
WIN_ROUNDS = 5 if QUICK else 900
STORE_FACTORS = {json.dumps(STORE_FACTORS)}
print("data:", RAW, "| work:", WORK)
"""

RUN_HELPER = """
def run(*args):
    \"\"\"Run one pipeline script from src/, streaming its log.\"\"\"
    t = time.time()
    print(">>", " ".join(args), flush=True)
    p = subprocess.run([sys.executable, *args], cwd=SRC, env=os.environ.copy(),
                       capture_output=True, text=True)
    print(p.stdout[-3000:], p.stderr[-3000:] if p.returncode else "")
    if p.returncode:
        raise RuntimeError(f"{args[0]} failed")
    print(f"   done in {(time.time() - t) / 60:.1f} min", flush=True)
"""

PREPARE = """
# One long parquet grid per store: sales, calendar and price features.
run("prepare_data.py")
"""

OURS = """
# Part 1: the two weighted members of this pipeline.
V2 = '{"seed":7,"num_leaves":127,"feature_fraction":0.5,"bagging_seed":7,"feature_fraction_seed":7}'
run("train.py", "--kind", "recursive", "--tag", "2", "--train-days", "730", "--params", V2,
    "--pool", "store", "--origin", str(ORIGIN), "--rounds", str(ROUNDS))
run("train.py", "--kind", "mh", "--pool", "store", "--origin", str(ORIGIN), "--rounds", str(ROUNDS))
"""

WINNER = """
# Part 2: the M5 winner's recipe at equal compute (six components).
WIN = '{"min_data_in_leaf":4095,"feature_fraction":0.5,"bagging_fraction":0.5,"bagging_freq":1,"max_bin":100}'
if RUN_WINNER:
    for kind in ("recursive", "direct"):
        for pool in ("store", "store_cat", "store_dept"):
            run("train.py", "--kind", kind, "--tag", "_win", "--no-scaling", "--pool", pool,
                "--origin", str(ORIGIN), "--rounds", str(WIN_ROUNDS), "--params", WIN)
"""

ASSEMBLE = """
# Ensemble -> top-down alignment -> store calibration, then the 50/50 combination.
import numpy as np, pandas as pd
sys.path.insert(0, str(SRC))
import reconcile
from config import OUTPUTS
from wrmsse import load_raw

full, calendar, _ = load_raw()
load = lambda name: np.load(OUTPUTS / f"preds_{name}_o{ORIGIN}.npy")
ensemble = 0.5 * load("recursive2_store") + 0.5 * load("mh_store")
S9, A, keys = reconcile.aggregate_series(full)
agg = reconcile.forecast_aggregates(A, keys, reconcile.calendar_frame(calendar), ORIGIN)
ours = reconcile.align(ensemble, S9, agg, 0.5) * full["store_id"].map(STORE_FACTORS).to_numpy()[:, None]
if RUN_WINNER:
    winner = np.mean([load(f"{k}_win_{p}") for k in ("recursive", "direct")
                      for p in ("store", "store_cat", "store_dept")], axis=0)
    forecast = 0.5 * winner + 0.5 * ours
else:
    forecast = ours
print("forecast", forecast.shape, "total units", round(float(forecast.sum())))
"""

SUBMIT = """
# submission.csv: evaluation rows = the forecast; validation rows = the known sales of d_1914..d_1941.
F = [f"F{i}" for i in range(1, 29)]
ev = pd.DataFrame(forecast, columns=F)
ev.insert(0, "id", (full["item_id"] + "_" + full["store_id"] + "_evaluation").to_numpy())
va = pd.DataFrame(full[[f"d_{d}" for d in range(1914, 1942)]].to_numpy(), columns=F)
va.insert(0, "id", ev["id"].str.replace("_evaluation", "_validation", regex=False).to_numpy())
sub = pd.concat([va, ev], ignore_index=True)
sample = RAW / "sample_submission.csv"
if sample.exists():
    order = pd.read_csv(sample, usecols=["id"])["id"]
    sub = sub.set_index("id").loc[order].reset_index()
assert len(sub) == 60980 and sub[F].notna().all().all() and (sub[F] >= 0).all().all()
sub.to_csv(WORK / "submission.csv", index=False)
print(sub.shape, "->", WORK / "submission.csv")
sub.head()
"""


def main():
    cells = [md(INTRO), code(SETTINGS),
             md("## Pipeline modules\nThe repository's own modules, written to `src/`.")]
    for m in MODULES:
        cells.append(code(f"%%writefile src/{m}\n" + (SRC / m).read_text()))
    cells += [md("## Run"), code(RUN_HELPER), code(PREPARE), code(OURS), code(WINNER),
              md("## Combine and write the submission"), code(ASSEMBLE), code(SUBMIT)]
    nb = {"cells": cells, "metadata": {"kernelspec": {"display_name": "Python 3",
                                                      "language": "python", "name": "python3"},
                                       "language_info": {"name": "python"}},
          "nbformat": 4, "nbformat_minor": 5}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(nb, indent=1))
    print("wrote", OUT, f"({len(cells)} cells)")


if __name__ == "__main__":
    main()

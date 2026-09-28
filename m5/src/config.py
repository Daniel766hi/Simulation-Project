"""Paths and competition constants shared by every stage of the pipeline."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# M5_RAW / M5_WORK let the same code run elsewhere, e.g. in a Kaggle notebook.
RAW = Path(os.environ.get("M5_RAW", ROOT / "data" / "raw"))
PROCESSED = Path(os.environ.get("M5_WORK", ROOT / "data")) / "processed"
OUTPUTS = Path(os.environ["M5_WORK"]) / "outputs" if "M5_WORK" in os.environ else ROOT / "outputs"
DASHBOARD_JSON = ROOT.parent / "m5-data.json"

HORIZON = 28
# Day indices (d_1 = 2011-01-29). Public LB = validation, private LB = evaluation.
LAST_TRAIN_VALIDATION = 1913   # train through d_1913, forecast d_1914..d_1941
LAST_TRAIN_EVALUATION = 1941   # train through d_1941, forecast d_1942..d_1969
LAST_DAY = 1969

ID_COLS = ["item_id", "dept_id", "cat_id", "store_id", "state_id"]

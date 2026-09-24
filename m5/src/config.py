"""Paths and competition constants shared by every stage of the pipeline."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"
OUTPUTS = ROOT / "outputs"
DASHBOARD_JSON = ROOT.parent / "m5-data.json"

HORIZON = 28
# Day indices (d_1 = 2011-01-29). Public LB = validation, private LB = evaluation.
LAST_TRAIN_VALIDATION = 1913   # train through d_1913, forecast d_1914..d_1941
LAST_TRAIN_EVALUATION = 1941   # train through d_1941, forecast d_1942..d_1969
LAST_DAY = 1969

ID_COLS = ["item_id", "dept_id", "cat_id", "store_id", "state_id"]

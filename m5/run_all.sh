#!/usr/bin/env bash
# Reproduce every result in m5/outputs and the numbers embedded in ../m5.html.
# Roughly 6 hours on a 4-core machine; almost all of it is LightGBM training
# (4 model variants x 3 forecast origins).
set -euo pipefail
cd "$(dirname "$0")/src"
python3 download.py                 # M5 data + official scores (~50 MB)
python3 validate_evaluator.py       # WRMSSE must match the organisers before anything else runs
python3 prepare_data.py             # long per-store feature grids
python3 benchmarks.py               # statistical benchmarks at all three origins
# Two rolling validation origins (1885, 1913 = public LB) and the final origin (1941 = private LB)
for origin in 1885 1913 1941; do
  for pool in store store_cat; do
    for kind in direct recursive; do
      python3 train.py --kind "$kind" --pool "$pool" --origin "$origin" --rounds 800
    done
  done
done
python3 finalize.py                 # ensemble weights + alignment chosen on folds; private scored once
python3 demand_drivers.py           # price elasticity, SNAP, calendar events
python3 inventory_sim.py            # forecast accuracy -> inventory cost and service level
python3 export_dashboard.py         # embed results in ../m5.html

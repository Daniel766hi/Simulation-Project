#!/usr/bin/env bash
# Reproduce every result in m5/outputs and the numbers embedded in ../m5.html.
# About 2-3 hours on a 4-core laptop; almost all of it is LightGBM training.
set -euo pipefail
cd "$(dirname "$0")/src"
python3 download.py                 # M5 data + official scores (~50 MB)
python3 validate_evaluator.py       # WRMSSE must match the organisers before anything else runs
python3 prepare_data.py             # long per-store feature grids
python3 benchmarks.py               # statistical benchmarks, both windows
for kind in direct recursive; do
  python3 train.py --kind "$kind" --phase validation --rounds 800
done
for kind in direct recursive; do
  python3 train.py --kind "$kind" --phase evaluation --rounds 800
done
python3 ensemble.py                 # blend weight chosen on validation, applied to evaluation
python3 demand_drivers.py           # price elasticity, SNAP, calendar events
python3 inventory_sim.py            # forecast accuracy -> inventory and service level
python3 export_dashboard.py         # embed results in ../m5.html

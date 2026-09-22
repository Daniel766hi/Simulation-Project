#!/usr/bin/env bash
# Reproduce every result in m5/outputs and the numbers embedded in ../m5.html.
# Roughly 7-8 hours on a 4-core machine; almost all of it is LightGBM training
# (3 model designs x 4 forecast origins).
set -euo pipefail
cd "$(dirname "$0")/src"
python3 download.py                 # M5 data + official scores (~50 MB)
python3 validate_evaluator.py       # WRMSSE must match the organisers before anything else runs
python3 prepare_data.py             # long per-store feature grids
python3 benchmarks.py               # statistical benchmarks at each origin
python3 experiment_scaling.py       # design ablation: direct vs scaled vs multi-horizon
# Three rolling validation origins (1857, 1885, 1913 = public LB) and the final origin
# (1941 = private LB). Designs: origin-anchored multi-horizon, recursive, direct.
for origin in 1857 1885 1913 1941; do
  for kind in mh recursive direct; do
    python3 train.py --kind "$kind" --pool store --origin "$origin" --rounds 800
  done
done
python3 finalize.py                 # ensemble -> alignment -> bias calibration, all chosen on
                                    # the folds; the private window is scored once, last
python3 demand_drivers.py           # price elasticity, SNAP, calendar events
python3 inventory_sim.py            # forecast accuracy -> inventory cost and service level
python3 export_dashboard.py         # embed results in ../m5.html

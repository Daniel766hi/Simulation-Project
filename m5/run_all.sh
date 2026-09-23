#!/usr/bin/env bash
# Reproduce every result in m5/outputs and the numbers embedded in ../m5.html.
# Roughly 8-9 hours on a 4-core machine; almost all of it is LightGBM training
# (3 ensemble members x 4 forecast origins, plus the design comparison at d_1913).
set -euo pipefail
cd "$(dirname "$0")/src"
python3 download.py                 # M5 data + official scores (~50 MB)
python3 validate_evaluator.py       # WRMSSE must match the organisers before anything else runs
python3 validate_wspl.py            # and so must WSPL (Uncertainty track)
python3 prepare_data.py             # long per-store feature grids
python3 benchmarks.py               # statistical benchmarks at each origin
python3 experiment_scaling.py       # design ablation: direct vs scaled vs multi-horizon
# Design comparison on the public-LB window, all stores: direct (lag >= 28), scaled
# recursive, origin-anchored multi-horizon. The direct design lost and is not an ensemble member.
python3 train.py --kind direct --tag _unscaled --no-scaling --pool store --origin 1913 --rounds 800
python3 train.py --kind direct --pool store --origin 1913 --rounds 800
# Ensemble members at three rolling validation origins (1857, 1885, 1913 = public LB) and the
# final origin (1941 = private LB).
# recursive2 is a diversified sibling: other seed, 730-day history, smaller trees.
V2='{"seed":7,"num_leaves":127,"feature_fraction":0.5,"bagging_seed":7,"feature_fraction_seed":7}'
python3 train.py --kind recursive --pool store_cat --origin 1913 --rounds 800  # compared, dropped
for origin in 1857 1885 1913 1941; do
  python3 train.py --kind recursive              --pool store --origin "$origin" --rounds 800
  python3 train.py --kind recursive --tag 2 --train-days 730 --params "$V2" \
                                                 --pool store --origin "$origin" --rounds 800
  python3 train.py --kind mh                     --pool store --origin "$origin" --rounds 800
done
python3 finalize.py                 # ensemble -> alignment -> bias calibration, all chosen on
                                    # the folds; the private window is scored once, last
python3 uncertainty.py              # Uncertainty track: quantiles for all 42,840 series
python3 demand_drivers.py           # price elasticity, SNAP, calendar events
python3 stockouts.py                # hidden stock-outs: lost revenue and forecast bias
python3 inventory_sim.py            # forecast accuracy -> inventory cost and service level
# Robustness backtest: frozen pipeline on three earlier windows (1773, 1801, 1829)
for origin in 1773 1801 1829; do
  python3 train.py --kind recursive              --pool store --origin "$origin" --rounds 800
  python3 train.py --kind recursive --tag 2 --train-days 730 --params "$V2" \
                                                 --pool store --origin "$origin" --rounds 800
  python3 train.py --kind mh                     --pool store --origin "$origin" --rounds 800
done
python3 backtest.py                 # seven-window robustness table + rolling forecasts
python3 supply_chain_sim.py         # two-echelon bullwhip experiment + promotion stress test
python3 export_dashboard.py         # embed results in ../m5.html

# Roadmap: staying ahead of the M5 winner's recipe

The Kaggle leaderboard closed in 2020, so the only fair contest left is on data neither side
was tuned on. Where things stand on the three untouched windows (mean WRMSSE, lower is better):

| Method | Mean | Windows won vs winner's recipe |
|---|---|---|
| M5 winner's recipe (equal compute) | 0.6264 | – |
| This pipeline | 0.6164 | 2 of 3 |
| This pipeline, stock-out masking | 0.6156 | 2 of 3 |
| **Pre-registered 50/50 combination** | **0.5986** | 2 of 3 |

What the evidence so far says about where the next gains are:

1. **Diversity beats cleverness.** The largest single gain came from averaging two different
   methods (−2.9% vs this pipeline). None of the winner's six models alone beat 0.727, and their
   average reached 0.626.
2. **Few choices, many windows.** Choosing from 675 settings did worse than choosing from 3.
   Every new idea gets one pre-registered setting, not a search.
3. **Fix causes, not symptoms.** Calibration patched an under-forecast whose cause was
   stock-outs; masking them improved the pipeline before calibration by 3.9% in every window.
4. **Three windows cannot prove a lead.** Two of three wins is suggestive, not significant.

## Plan, in order

Every step uses the same protocol: one setting fixed and committed before scoring, judged on
untouched windows only, adopted only through `monitor.py`'s gate (lower mean and most windows
won). Costs are on this 4-core machine.

| # | Step | Why | Cost | Gate |
|---|---|---|---|---|
| 1 | **Six more untouched windows** (origins 1605–1745), ours and the winner's recipe | Turns "2 of 3" into a test with power: paired Diebold–Mariano and Wilcoxon over 9 windows | ~7 h per window | Lead holds with p < 0.05, or it is reported as not proven |
| 2 | **Stock-out masking in the winner's components** too, then re-combine | Both halves of the combination share the censoring bias; fixing it on both sides should stack where masking one side did not | ~18 h | Combination mean below 0.5986 |
| 3 | **Seed bagging**: three seeds for each of our two weighted members | Cheapest form of diversity; reduces variance without new design choices | ~3 h per window | Mean and majority of windows |
| 4 | **Full-size winner check** (2,047 leaves, 3,000 trees) on one window | Confirms the equal-compute replica did not handicap the winner | ~35 h | Result reported either way |
| 5 | **Direct quantile models** for the uncertainty track | Winners of that track modelled quantiles directly (Lainder & Wolfinger, IJF 2022); current 0.1726 ≈ #28 | ~6 h per window | WSPL on untouched windows |
| 6 | **Pretrained time-series model at store × department** as the alignment target (Chronos, Ansari et al. 2024) | A different model family for the level that alignment trusts most | depends on CPU inference speed | Mean and majority of windows |

Step 1 is running: `queue_extended.sh` trains every model for the six new windows, and
`extended_comparison.py` holds the hypotheses and tests, committed before any new window was
scored.

Steps 1 and 2 matter most: step 1 decides whether the lead is real, step 2 is the likeliest way
to widen it. Steps 3–6 are only worth running once step 1 shows how large a gain must be to
count.

## Tried and rejected before step 1 (three existing windows, no retraining)

| Candidate | Mean WRMSSE |
|---|---|
| 50/50 combination (pre-registered, kept) | **0.5986** |
| Three-way average: winner's recipe, ours, ours with stock-out masking | 0.5998 |
| 50/50 average, then store × department alignment and store calibration | 0.6168 |
| The same with the masked pipeline | 0.6192 |

Putting the combination through this pipeline's level control made it worse. The winner's
half is already close to the right level (total forecast ÷ actual 1.01), so correcting the
average again overshoots. The plain 50/50 average stays the method under test in step 1.

## Keeping the lead

- `monitor.py` every month: drift alerts per store and the gate for any change.
- Retrain monthly on a rolling window with the same frozen settings; per-store checkpoints make
  runs resumable.
- Report inventory cost and fill rate (`inventory_sim.py`, `supply_chain_sim.py`) next to
  WRMSSE, so an "improvement" only counts if it also lowers cost.

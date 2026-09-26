# Roadmap: staying ahead of the M5 winner's recipe

The Kaggle leaderboard closed in 2020, so the only fair contest left is on data neither side
was tuned on.

**Update, September 2026: the pre-registered nine-window test has finished.** The 50/50
combination beats the winner's recipe in 8 of 9 untouched windows (mean 0.5679 against 0.6145;
Wilcoxon p = 0.004, Diebold–Mariano p = 0.001). This pipeline on its own does not pass the
registered test. Full results under "Step 1 result" below.

Where things stood on the original three untouched windows (mean WRMSSE, lower is better):

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

### Step 1 result: nine untouched windows (finished September 2026)

`queue_extended.sh` trained every model for the six new windows; `extended_comparison.py` held
the hypotheses and tests, committed before any new window was scored. Mean WRMSSE over the nine
windows (origins 1605 to 1829; lower is better), and the registered tests against the winner's
recipe at equal compute. A hypothesis is supported only if the Wilcoxon and Diebold–Mariano tests
both give p < 0.05 and the method wins most windows.

| Method | Mean | Windows won vs winner's recipe | Wilcoxon p | DM p | Supported |
|---|---|---|---|---|---|
| M5 winner's recipe (equal compute) | 0.6145 | – | – | – | – |
| **50/50 combination (H1)** | **0.5679** | **8 of 9** | **0.004** | **0.001** | **yes** |
| This pipeline (H2) | 0.5735 | 6 of 9 | 0.064 | 0.036 | no |
| This pipeline, stock-out masking (H3) | 0.5781 | 6 of 9 | 0.064 | 0.049 | no |
| Masked combination (exploratory, not registered) | 0.5714 | 8 of 9 | 0.004 | 0.001 | (yes) |

What this does and does not show:
- **The combination's lead is real on this evidence**: 7.6% lower mean WRMSSE than the winner's
  recipe, better in 8 of 9 untouched windows, and both tests agree. This is the registered
  result.
- **The pipeline on its own is not proven better.** Its mean is lower by 6.7%, but it wins only
  6 of 9 windows and the Wilcoxon test misses 0.05, so under the rule fixed in advance H2 and H3
  are not supported, even though the Diebold–Mariano test alone would pass.
- **Stock-out masking did not help over nine windows** (0.5781 against 0.5735), unlike the
  earlier three windows. The earlier gain did not generalise.
- The comparison is against a replica of the winner's recipe at equal compute, not against the
  original competition submission (see step 4).

### Stacking holdout (registered in `stacking.py`, weights frozen before the holdout trained)

| Window | Winner's recipe | 50/50 combination | Stacked blend |
|---|---|---|---|
| 1605 | 0.7134 | 0.6287 | **0.6247** |
| 1633 | 0.5588 | 0.5030 | **0.4947** |
| 1661 | 0.6563 | 0.5775 | **0.5684** |
| Mean | 0.6428 | 0.5697 | **0.5626** |

The stack beat both references on the holdout mean, which was the registered criterion, and
won all three windows. The margin over the 50/50 combination is small (1.2%) and three windows
cannot give a significant test (the chance of winning 3 of 3 by luck is 1 in 8), so this is
promising, not established. The earlier interim 1661 figures (stack 0.559, 50/50 0.561) were
provisional for the reason given below and are superseded.

With step 1 done, step 2 is next. Masking helped neither half on its own over nine windows, so
step 2 should be judged strictly on the same protocol rather than assumed. The stacked blend is
the other candidate: it should now be re-fitted on all nine windows and tested on new ones
before it replaces the 50/50 combination.

## Tried and rejected before step 1 (three existing windows, no retraining)

| Candidate | Mean WRMSSE |
|---|---|
| 50/50 combination (pre-registered, kept) | **0.5986** |
| Three-way average: winner's recipe, ours, ours with stock-out masking | 0.5998 |
| 50/50 average, then store × department alignment and store calibration | 0.6168 |
| The same with the masked pipeline | 0.6192 |

Putting the combination through this pipeline's level control made it worse. The two halves
miss the level in opposite directions: total forecast ÷ actual was 1.048, 0.992 and 1.010 for
the winner's recipe against 0.976, 0.957 and 0.996 for this pipeline. The plain average
already cancels most of that error, so correcting it again overshoots. This is also why the
combination works at all. The plain 50/50 average stays the method under test in step 1.

## Keeping the lead

- `monitor.py` every month: drift alerts per store and the gate for any change.
- Retrain monthly on a rolling window with the same frozen settings; per-store checkpoints make
  runs resumable.
- Report inventory cost and fill rate (`inventory_sim.py`, `supply_chain_sim.py`) next to
  WRMSSE, so an "improvement" only counts if it also lowers cost.

## Code review during step 1 (September 2026)

Done now, without touching anything the running test loads:
- Lint clean (`ruff check src tests`, settings in `ruff.toml`), now also run in CI.
- Ten new unit tests (`tests/test_pipeline.py`) on the building blocks of the comparison:
  top-down alignment (identity at alpha 0, exact match inside the clip at alpha 1, clipping,
  zero-safe), the stacked blend (weights on the simplex, blend = weighted sum) and the
  hypothesis rule (supported only when both tests agree; a single large win does not count).

These files were frozen until the nine-window test finished, so every window was produced by
the same code: `train.py`, `features.py`, `config.py`, `stockouts.py`, `calibrate.py`,
`reconcile.py`, `score.py`, `wrmsse.py`, `extended_comparison.py`, `stacking.py`.

Found in review and fixed after the test (both registered result files reproduce exactly after
the changes):
1. `stacking.members()` calibrates walk-forward only over the windows it is given. On the
   holdout that means window 1661 is uncalibrated while only 1661 is complete, and its score
   changes once 1605 and 1633 exist. The interim 1661 number (stack 0.559, winner 0.656,
   50/50 0.561) is therefore provisional; only the three-window result counts.
   Fixed in the documentation of `stacking.members()` and `extended_comparison.ours_members()`;
   the registered result is the one on all three windows.
2. The ensemble -> alignment -> walk-forward calibration code was duplicated in
   `extended_comparison.main()` and `stacking.members()`. It is now one function,
   `extended_comparison.ours_members()`, used by both.
3. The two unused imports in `reconcile.py` and `stockouts.py` are removed, with their
   `ruff.toml` exceptions.

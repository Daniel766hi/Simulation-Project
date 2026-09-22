# M5 Forecasting: Walmart demand, from leaderboard score to inventory decision

A complete, reproducible solution to Kaggle's **M5 Forecasting – Accuracy** competition
(University of Nicosia with Walmart, 2020; US$100,000 prize pool across the Accuracy and
Uncertainty tracks). The task is to forecast daily unit sales of 3,049 products in 10 stores
across California, Texas and Wisconsin for the next 28 days, scored on 42,840 series from total
company sales down to single item in single store.

The project goes past the leaderboard. It asks two further questions a supply-chain team would
ask: **what drives demand here**, and **what is a better forecast worth in inventory?**

Interactive results: [`../m5.html`](../m5.html) (opens offline, like the other pages in this repo).

<!--RESULTS-->

## How it is built

| Step | Script | What it does |
|---|---|---|
| 1 | `download.py` | Fetches the full M5 data set (including private-leaderboard actuals and the official series weights) and the organisers' published scores |
| 2 | `validate_evaluator.py` | Proves the WRMSSE implementation matches the organisers before any score is trusted |
| 3 | `prepare_data.py` | Wide sales files to one long feature grid per store: calendar, events, SNAP, 13 price features |
| 4 | `benchmarks.py` | Re-implements seven of the organisers' statistical benchmarks, vectorised across all series |
| 5 | `train.py` | Per-store LightGBM, two strategies (direct and recursive), Tweedie loss |
| 6 | `ensemble.py` | Blend weight chosen on the validation window, then applied unchanged to the private window |
| 7 | `demand_drivers.py` | Price elasticity (two-way fixed effects), SNAP uplift, calendar-event effects, promotion vs markdown |
| 8 | `inventory_sim.py` | Replays the private window through a periodic-review inventory policy driven by each forecast |
| 9 | `export_dashboard.py` | Embeds every result into `../m5.html` |

`./run_all.sh` runs everything end to end (about 2–3 hours on a 4-core machine, almost all of it
LightGBM training).

### 1. An exact evaluator first

WRMSSE weights each series by its dollar sales over the last 28 training days and scales its
error by its own in-sample one-step naive error (from the first non-zero sale onwards), across
12 aggregation levels. It is easy to get subtly wrong, and a wrong metric makes every later
decision wrong. So before any model was trained, the implementation was checked against the
organisers' own files:

| Check | Ours | Official |
|---|---|---|
| Series weights, 42,840 series | all matched | max abs difference 2.0e-6 |
| Naive benchmark | 1.752010 | 1.752010 |
| Seasonal naive benchmark | 0.847017 | 0.847017 |

### 2. Statistical benchmarks

| Benchmark | Ours | Official |
|---|---|---|
| Naive | 1.7520 | 1.7520 |
| Seasonal naive | 0.8470 | 0.8470 |
| Moving average (window 2–14 by in-sample MSE) | 0.9560 | 0.9560 |
| Simple exponential smoothing | 0.9693 | 0.9691 |
| Croston | 0.9566 | 0.9566 |
| SBA | 0.9572 | 0.9572 |
| TSB | 0.9642 | 0.9614 |

TSB is 0.003 off because the guide does not pin down its parameter search; everything else
reproduces to four decimals, the SES gap is 0.0002.

A useful fact falls out of this table: the simple **seasonal naive** (repeat last week) beats
every smoothing and intermittent-demand method at 0.847, because those methods produce flat
forecasts and Walmart's weekly cycle is strong. Any serious model must beat 0.847.

### 3. Features

Every row is one item-store-day.

- **Calendar:** weekday, day of month, week, month, year, weekend flag, event name and type (two
  slots), days to the next event and since the last one.
- **SNAP:** whether the day is a food-assistance payment day in the store's state.
- **Price:** shelf price; its max, min, mean and std over the item's life; price relative to the
  item's regular (max) price; price momentum vs last week, month and year; discount vs the 4-week
  max; number of distinct prices; number of items sharing the same price; weeks since launch.
- **Sales history** (built from an items × days matrix so training and inference share one code
  path): lags, rolling means and standard deviations, the mean of the last four same-weekday
  observations, the share of zero-sale days in the last 28, and item-level mean and std.

Rows before an item's first price week are dropped: the product was not on the shelf, so its
zeros carry no demand information.

### 4. Two LightGBM strategies, one model per store

- **Direct:** every sales feature is at least 28 days old, so one model forecasts all 28 days in
  a single pass and never consumes its own predictions. Robust, and no error accumulation.
- **Recursive:** short lags (1–14 days) and recent rolling means. The model walks forward one day
  at a time and writes each prediction back into history for the next day's features. Sharper
  at short horizons, at the risk of compounding its own errors.

Both use a **Tweedie** objective (variance power 1.1): the target is a point mass at zero (most
item-days sell nothing) plus a long right tail, which is exactly the distribution Tweedie models.
Each store's model learns from its last 1,000 days.

### 5. Discipline

- Day 1914–1941 (the public leaderboard) was the only window used to compare settings, choose the
  ensemble weight and check the feature code.
- Final models were retrained on data up to day 1941 and scored **once** on days 1942–1969 (the
  private leaderboard). No setting was changed after that score was seen.
- The competition closed in 2020 and its actuals are now public, so this is a retrospective
  result and not a verified Kaggle submission. The process above is the only guard against
  overfitting to the answer, and it is stated here so it can be checked in the code.

## Data

M5 data © the M5 organisers, redistributed by them for research after the competition, and
fetched here from Nixtla's public mirror of that archive. Top-50 and benchmark scores come from the
organisers' [M5-methods](https://github.com/Mcompetitions/M5-methods) repository. Raw and
processed data are downloaded at run time and never committed (`m5/data/` is git-ignored).

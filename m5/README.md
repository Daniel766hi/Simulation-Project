# M5 Forecasting: Walmart demand, from leaderboard score to inventory decision

A complete, reproducible solution to Kaggle's **M5 Forecasting – Accuracy** competition
(University of Nicosia with Walmart, 2020; US$100,000 prize pool across the Accuracy and
Uncertainty tracks). The task is to forecast daily unit sales of 3,049 products in 10 stores
across California, Texas and Wisconsin for the next 28 days, scored on 42,840 series from total
company sales down to single item in single store.

The project goes past the leaderboard. It asks two further questions a supply-chain team would
ask: **what drives demand here**, and **what is a better forecast worth in inventory?**

Interactive results: [`../m5.html`](../m5.html) (opens offline, like the other pages in this repo).

## Results

All numbers are on the **private leaderboard** (days 1942–1969), scored once, after every
choice had been fixed on three rolling validation folds.

### Accuracy track (WRMSSE, lower is better)

| Stage | Fold mean | Private LB |
|---|---|---|
| Organiser benchmark: seasonal naive | – | 0.8470 |
| Best organiser benchmark (ES_bu) | – | 0.6710 |
| Recursive LightGBM, per store | 0.6060 | 0.6602 |
| Recursive sibling (other seed, 730-day history) | 0.6253 | 0.6961 |
| Multi-horizon, origin-anchored | 0.6191 | 0.5451 |
| Ensemble (weights 0 / 0.5 / 0.5, chosen on folds) | 0.5676 | 0.5923 |
| + top-down alignment (α = 0.5) | 0.5564 | 0.5443 |
| **+ bias calibration = final** | 0.5519 | **0.5866** |

- **Final: 0.5866**, 30.7% better than seasonal naive and 12.6% better than the best organiser
  benchmark; outside the published top 50 (50th place: 0.576).
- **An honest negative result.** The last step, walk-forward bias calibration, improved the
  folds (every earlier window under-ran the forecast) but hurt the private window, which was flat
  against the month before. The stage before it scored 0.5443, which would have placed about
  **#6** of ~5,500 teams. Switching to it now would be choosing on the answer, so the
  pre-registered result stands. This is the robustness problem Ma & Fildes (2022) describe.
- **Rankings flip between windows.** Each ensemble member was the best single model in a
  different fold, and the multi-horizon model, weakest on the public window, was the best single
  model on the private one. Combining them was worth about 6% on the folds.

### Uncertainty track (WSPL, lower is better)

| | Private LB |
|---|---|
| Organiser benchmark: seasonal naive | 0.2552 |
| Best organiser benchmark (ARIMA) | 0.2046 |
| **This project** | **0.1726** |
| Kaggle winner / 50th place | 0.1542 / 0.1787 |

**0.1726 would place #28 on the published top-50 leaderboard.** The WSPL evaluator reproduces
the organisers' Naive (0.594881 vs 0.594882) and seasonal-naive (0.255198 vs 0.255203)
uncertainty benchmarks. The quantile model is chosen per level on the folds: pinball-optimal
multipliers for aggregates, a negative binomial for item-level counts.

### Inventory impact (private window, all 30,490 item-stores)

| Method | Item-day WAPE | Stock for 95% fill rate | Cheapest total cost, lost sale = 1× / 4× / 20× weekly holding |
|---|---|---|---|
| **LightGBM (final)** | 75.6% | **$1.08M** | **$30.0k / $45.2k / $75.3k** |
| SBA | 77.4% | $1.16M | $30.1k / $47.4k / $78.8k |
| TSB | 78.3% | $1.34M | $31.7k / $48.5k / $85.2k |
| Moving average | 78.8% | $1.40M | $32.0k / $49.9k / $87.9k |
| Seasonal naive | 91.6% | $1.52M | $32.3k / $52.6k / $91.7k |

- **29% less stock** than a seasonal-naive-driven policy for the same 95% fill rate.
- The gap between methods grows with the cost of a lost sale: at 1× the intermittent-demand
  method SBA is within 0.2% of LightGBM, at 20× LightGBM is 4% cheaper than SBA and 18% cheaper
  than seasonal naive. This is consistent with Theodorou, Spiliotis & Assimakopoulos (2025).
- **Safety stock.** The textbook normal rule misses its own cycle-service target by 2.9 points on
  average; empirical error quantiles by 2.5; the negative binomial from the Uncertainty model by
  2.2, and it holds *less* stock than the normal rule at every target.

### Demand drivers

- **Price:** own-price elasticities from −0.35 (HOUSEHOLD_2) to −1.31 (FOODS_1), estimated with
  item-store and week fixed effects. Weeks with a price cut sell *fewer* units than the preceding
  full-price weeks: cuts are concentrated on slowing items (clearance). The M5 price field
  cannot separate a promotion from a markdown, so promotion modelling needs a promotion calendar.
- **SNAP days** lift FOODS sales by 10% (CA), 15% (TX) and 29% (WI), with little effect on
  other categories.
- **Calendar:** Christmas (stores closed, −100%), Thanksgiving (−30%), Labor Day (+27%).


## How it is built

| Step | Script | What it does |
|---|---|---|
| 1 | `download.py` | Fetches the full M5 data set (including private-leaderboard actuals and the official series weights) and the organisers' published scores |
| 2 | `validate_evaluator.py` | Proves the WRMSSE implementation matches the organisers before any score is trusted |
| 3 | `prepare_data.py` | Wide sales files to one long feature grid per store: calendar, events, SNAP, 13 price features |
| 4 | `benchmarks.py` | Re-implements seven of the organisers' statistical benchmarks, vectorised across all series |
| 5 | `experiment_scaling.py` | Design ablation behind the choice of model (see "Diagnosing a level bias") |
| 6 | `train.py` | LightGBM, Tweedie loss, three designs (direct, recursive, origin-anchored multi-horizon), per-store or per-store × category pools, dynamic scaling and time-decayed weights |
| 7 | `ensemble.py` | Combines the members, weights chosen on three rolling folds |
| 8 | `reconcile.py` | Top-down alignment to an independent store × department model |
| 9 | `calibrate.py` | Walk-forward bias calibration from earlier folds' errors |
| 10 | `finalize.py` | Runs 7-9 in order, then scores the private window once |
| 10b | `validate_wspl.py`, `uncertainty.py` | Uncertainty track: WSPL evaluator checked against the organisers' benchmarks, then nine quantiles for all 42,840 series |
| 11 | `demand_drivers.py` | Price elasticity (two-way fixed effects), SNAP uplift, calendar-event effects, promotion vs markdown |
| 12 | `inventory_sim.py` | Replays the private window through a periodic-review policy: service vs stock, total cost under three cost ratios, normal vs empirical safety stock |
| 13 | `export_dashboard.py` | Embeds every result into `../m5.html` |

`./run_all.sh` runs everything end to end (8–9 hours on a 4-core machine, almost all of it
LightGBM training). `python3 -m pytest` runs the unit tests in seconds without the data:
metric maths against hand computations, hierarchy aggregation, alignment, and a leakage test
that plants absurd future sales and checks that no feature changes.

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
  observations and the share of zero-sale days in the last 28, all divided by the item's recent
  level (dynamic scaling), plus the log of that level. Whole-history item means were dropped
  after the bias diagnosis below, and so was `item_id` in the multi-horizon model.

Rows before an item's first price week are dropped: the product was not on the shelf, so its
zeros carry no demand information.

### 4. Diagnosing a level bias, then choosing the design

The first model (the common M5 "lag ≥ 28" direct design) scored 0.6956 on the public window and
forecast **7.5% below actual in every store**, while being unbiased on its own training days
(ratio 0.99). A flat ×1.08 multiplier would have lifted it to 0.5453, which says the error was
almost entirely *level*, not *shape*. Tuning that multiplier on the window being scored is the
M5 "magic multiplier" and is leakage, so the cause was investigated instead:

1. **Stale information.** Lag ≥ 28 features are computed relative to the target day, so on day 1
   of the horizon the model ignores the 27 most recent known days.
2. **Trees do not extrapolate.** M5 demand grew 14–20% a year; a tree predicts constants per leaf
   and cannot reach levels it has not seen (Januschowski et al., 2022).
3. **Regression to the mean in slow movers.** Items in the slowest quartile sold 2.5–3× their
   previous month's level in the next month; using `item_id` as a feature let the model memorise
   item ratios and over-shrink them.

Remedies were tested before being adopted: per-series dynamic scaling and time-decayed weights
(from the 2026 VN2 winner), an origin-anchored multi-horizon design, dropping `item_id`, and
stronger regularisation (which did not help). All ten stores, public window:

| Design | WRMSSE | Forecast ÷ actual |
|---|---|---|
| Direct, lag ≥ 28 (first version) | 0.6956 | 0.926 |
| Direct + dynamic scaling | 0.7288 | 0.917 |
| Multi-horizon, origin-anchored | 0.6677 | 0.933 |
| **Recursive + dynamic scaling** | **0.5721** | 0.971 |
| Recursive, per store × category pool | 0.6990 | 0.933 |

The recursive design, which always uses the latest day, won clearly. Scaling did not rescue the
direct design: it scales by a level that is itself a month old. Splitting each store's model by
category, as the M5 winner did, made things worse here (HOBBIES fell to 80% of actual), so the
ensemble combines two differently seeded and configured recursive per-store models with the
multi-horizon model, and the remaining out-of-sample bias is corrected by walk-forward calibration.

All models use a **Tweedie** objective (variance power 1.1): the target is a point mass at zero
(most item-days sell nothing) plus a long right tail.

### 5. Discipline

- Every choice (design, members, weights, alignment strength, calibration) was made on three
  rolling origins, forecasting days 1858–1885, 1886–1913 and 1914–1941 (the last is the public
  leaderboard). No choice used days 1942–1969.
- Final models were retrained on data up to day 1941 and scored **once** on days 1942–1969 (the
  private leaderboard). No setting was changed after that score was seen.
- The competition closed in 2020 and its actuals are now public, so this is a retrospective
  result and not a verified Kaggle submission. The process above is the only guard against
  overfitting to the answer, and it is stated here so it can be checked in the code.

## What the research literature changed

The first version followed the standard competition recipe. A second pass applied findings from
the forecasting literature published since the competition; each change is tested on rolling
folds before it is kept.

| Change | Why (source) | Where |
|---|---|---|
| Per-series dynamic scaling and time-decayed weights; whole-history item means dropped | The first model was unbiased in sample but under-forecast the next 28 days by 7.5%: demand grew 14–20% a year and trees cannot extrapolate levels they have not seen (Januschowski et al., *Forecasting with trees*, IJF 2022). Remedy taken from the VN2 inventory-challenge winner (2026 report) | `train.py`, `experiment_scaling.py` |
| Several data pools (store, store × category) and both horizon strategies | The M5 winner averaged 220 LightGBM models over three pools, each direct and recursive (Makridakis, Spiliotis & Assimakopoulos, IJF 2022) | `train.py`, `ensemble.py` |
| Two rolling validation origins instead of one window | Top M5 methods were not robust across periods; the final ranking was "somewhat of a lottery" (Ma & Fildes, IJF 2022) | `ensemble.py`, `finalize.py` |
| Top-down alignment to an independent store × department model | The M5 runner-up aligned bottom forecasts to separate top-level forecasts (Anderer & Li, IJF 2022); why combining levels helps (Athanasopoulos et al., *Forecast reconciliation: a review*, IJF 2024) | `reconcile.py` |
| Cost-based inventory evaluation, intermittent-demand methods included | Accuracy and inventory cost are not the same ranking, especially for intermittent items (Theodorou, Spiliotis & Assimakopoulos, EJOR 2025; Marik et al., 2026) | `inventory_sim.py` |
| Empirical vs normal safety stock | Gaussian iid errors are a poor assumption; empirical quantiles set safety stock more reliably (Trapero, Cardós & Kourentzes, Omega 2019 and IJF 2019) | `inventory_sim.py` |

Not tried: time-series foundation models (Chronos, TimesFM). Recent benchmarks show them
competitive on regular, strongly seasonal series, but their weights are hosted on Hugging Face,
which the build environment could not reach.

### References

- Makridakis, S., Spiliotis, E., & Assimakopoulos, V. (2022). M5 accuracy competition: Results, findings, and conclusions. *International Journal of Forecasting*, 38(4), 1346–1364.
- Anderer, M., & Li, F. (2022). Hierarchical forecasting with a top-down alignment of independent-level forecasts. *International Journal of Forecasting*.
- Ma, S., & Fildes, R. (2022). The performance of the global bottom-up approach in the M5 accuracy competition: A robustness check. *International Journal of Forecasting*.
- Januschowski, T., Wang, Y., Torkkola, K., Erkkilä, T., Hasson, H., & Gasthaus, J. (2022). Forecasting with trees. *International Journal of Forecasting*, 38(4), 1473–1481.
- Athanasopoulos, G., Hyndman, R. J., Kourentzes, N., & Panagiotelis, A. (2024). Forecast reconciliation: A review. *International Journal of Forecasting*, 40(2), 430–456.
- Kolassa, S. (2023). Do we want coherent hierarchical forecasts, or minimal MAPEs or MAEs? (We won't get both!). *International Journal of Forecasting*, 39(4), 1512–1517.
- Sprangers, O., Wadman, W., Schelter, S., & de Rijke, M. (2024). Hierarchical forecasting at scale. *International Journal of Forecasting*.
- Theodorou, E., Spiliotis, E., & Assimakopoulos, V. (2025). Forecast accuracy and inventory performance: Insights on their relationship from the M5 competition data. *European Journal of Operational Research*, 322(2), 414–426.
- Trapero, J. R., Cardós, M., & Kourentzes, N. (2019). Empirical safety stock estimation based on kernel and GARCH models. *Omega*.
- Trapero, J. R., Cardós, M., & Kourentzes, N. (2019). Quantile forecast optimal combination to enhance safety stock estimation. *International Journal of Forecasting*.
- VN2 Inventory Planning Challenge winner report (2026). One global model, many behaviors: Stockout-aware feature engineering and dynamic scaling for multi-horizon retail demand forecasting with a cost-aware ordering policy. arXiv:2601.18919.
- Marik, S., et al. (2026). Beyond accuracy: Evaluating forecasting models by multi-echelon inventory cost. arXiv:2603.16815.

## Data

M5 data © the M5 organisers, redistributed by them for research after the competition, and
fetched here from Nixtla's public mirror of that archive. Top-50 and benchmark scores come from the
organisers' [M5-methods](https://github.com/Mcompetitions/M5-methods) repository. Raw and
processed data are downloaded at run time and never committed (`m5/data/` is git-ignored).

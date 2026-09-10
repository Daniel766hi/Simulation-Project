# Mine Production & Cost Simulator

A client-side, browser-based simulation of an open-pit style mine's production, cost and
profitability over time. Built as a self-contained web app: no backend, no build step, nothing
leaves the browser.

Open `index.html` directly, or serve the folder locally:

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

## What it does

You set 17 operating and market variables across four groups (reserve & grade, operations,
market, costs & horizon). The app then runs a month-by-month simulation and plots the result as
a line-with-dot-marker chart (X = month, Y = a metric you choose — cumulative profit, cumulative
discounted profit/NPV, monthly profit/revenue/cost, ore mined, metal produced, grade, price, or
remaining reserve), alongside a 10-card KPI summary (total production, revenue, cost, net profit,
NPV, payback month, mine life, average realized price, cash cost per tonne).

**Scenario comparison** — save any run as a named scenario and it stays overlaid on the chart as
a dashed line, with a comparison table of net profit, NPV, metal produced, ore mined, cash cost
and payback across all saved runs. This is the intended workflow: set a base case, save it, then
change one variable at a time and see what it does to the economics.

**Export CSV** — downloads the full month-by-month output of the current run for further analysis
in Excel or pandas.

A second tab runs a **Monte Carlo risk analysis**: it re-runs the same model N times (default
150), each time drawing new random noise for grade, equipment availability and the price path,
and plots one dot per trial (X = total metal produced, Y = final cumulative profit), colored
green/red for profit/loss. This turns the single-run chart into a spread that shows how sensitive
the project's economics are to operational and market uncertainty, with summary statistics
(mean, standard deviation, P10/P50/P90, % of trials profitable).

## Model logic

Each simulated month:

1. **Ramp-up** — mining rate scales linearly from 0 to full planned capacity over the ramp-up
   period.
2. **Availability** — actual mining rate = planned rate × ramp factor × availability, where
   availability is the average value plus normally-distributed monthly noise.
3. **Ore mined** — the smaller of (available mining capacity) and (remaining reserve); the
   reserve is depleted accordingly, so production stops once it runs out.
4. **Grade** — the average ore grade plus normally-distributed monthly noise, floored at 0.
5. **Metal produced** — ore mined × effective grade × recovery rate.
6. **Price** — follows a random walk (monthly normal noise as % volatility around the previous
   month's price) with an independent chance each month of a price "shock" (a step change of a
   set magnitude), representing demand or supply shocks.
7. **Revenue** — metal produced × price.
8. **Cost** — (mining cost/t + processing cost/t) × ore mined + fixed monthly cost.
9. **Profit** — revenue − cost, accumulated into a running cumulative profit.
10. **Discounting** — each month's profit is discounted at the monthly equivalent of the annual
    discount rate, `profit / (1 + r_monthly)^month` where `r_monthly = (1 + r_annual)^(1/12) − 1`,
    and accumulated into a running NPV of operating cash flow.

**Payback month** is defined as the first month after which cumulative profit stays positive for
the remainder of the run — so a project that briefly breaks even and then falls back into loss is
reported as "not reached" rather than showing a misleadingly early payback.

Randomness is generated from a seeded PRNG (mulberry32) with Box-Muller normal sampling, so a
given seed always reproduces the same run — useful for comparing scenarios apples-to-apples, and
for the Monte Carlo tab (each trial uses `seed + trial index × 7919 + 1` so trials are
independent but the whole batch is reproducible from the same base seed).

## Known simplifications (read before treating this as a real feasibility model)

This is a teaching/portfolio-grade model, not a bankable feasibility study. Notable
simplifications:

- **No stripping ratio, pit geometry, or blending constraints** — "ore mined" is a single
  aggregate stream, not split by pit phase or material type.
- **Price and grade noise are independent month to month** (no autocorrelation/mean reversion
  beyond the random-walk drift already built into price).
- **NPV is of operating cash flow only** — there is no capital expenditure, so this is not a
  project NPV in the investment-decision sense; it does not tell you whether the mine is worth
  building, only what the modeled operating cash flows are worth today. Payback is likewise an
  operating-cash break-even, not a discounted payback on invested capital.
- **No taxes, royalties, depreciation, or working capital** — only operating cost and fixed cost
  are modeled.
- **Units are commodity-agnostic** — "%” grade and "$/t metal" price are meant to be filled in
  consistently for whatever commodity you're modeling (e.g., copper grade/price, gold needs
  price converted to $/t rather than $/oz, iron ore grade is usually %Fe not a trace-metal %,
  etc.). The defaults loosely resemble a mid-size copper operation but are illustrative only.
- **Single ore type / single price series** — no polymetallic byproduct credits.

If you want to extend it toward a more realistic feasibility model, the natural next additions
are: capex and financing (so NPV becomes a real investment decision), taxes and royalties,
stripping ratio and cut-off grade optimization, and correlated multi-factor Monte Carlo (e.g.,
price and cost both driven by a shared macro factor rather than drawn independently).

## Tech

Single `index.html` (structure, styling, and simulation logic) plus a vendored copy of
[Chart.js](https://www.chartjs.org/) in `vendor/` (so the app works fully offline — no CDN
dependency). No build tooling, no package manager needed to run it.

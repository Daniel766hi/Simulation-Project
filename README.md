# Simulation Project

Browser-based simulation and forecasting models sharing one design system. Every page is
self-contained: no backend, no build step, no network access required.

| Page | Model | Paradigm |
|---|---|---|
| `index.html` | Mine production, cost and project economics | Discrete-time deterministic + Monte Carlo |
| `abm.html` | Supply chain bullwhip effect | Agent-based |
| `bass.html` | Product adoption / Bass diffusion | Agent-based |
| `m5.html` | Walmart demand forecasting (Kaggle M5) → inventory impact | Machine learning + inventory simulation |
| `tetris.html` | Line Clear, a Tetris-style block game | Game (canvas) |
| `salt-road.html` | The Salt Road, a dark adventure RPG: explore, recruit a party, turn-based battles, twelve chapters, four endings, an endless dungeon | Game (canvas) |

---

# 1. Mine Production & Cost Simulator

A client-side, browser-based simulation of an open-pit style mine: production and operating cost
month by month, carried through a full cash-flow waterfall (revenue → operating cost → royalties
→ tax → sustaining capex) to NPV, IRR and payback on invested capital. Built as a self-contained
web app: no backend, no build step, nothing leaves the browser.

Open `index.html` directly, or serve the folder locally:

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

## What it does

You set 22 operating, market, capital and fiscal variables across five groups. The app runs a
month-by-month simulation and plots the result as a line-with-dot-marker chart (X = month, Y = a
metric you choose — cumulative net cash flow, NPV profile, monthly free cash flow, EBITDA,
revenue, operating cost, royalties & tax, ore mined, metal produced, grade, price, or remaining
reserve), alongside a KPI panel covering production, revenue, operating cost, EBITDA, royalties
& tax, capex, net cash flow, NPV, IRR, payback, discounted payback and cash cost per tonne.

The default view is the cumulative net cash flow curve, which produces the classic project
J-curve: it starts at minus the initial capex, climbs as production ramps up, crosses zero at
payback, and ends at the project's total net cash generation.

**Scenario comparison** — save any run as a named scenario and it stays overlaid on the chart as
a dashed line, with a comparison table of NPV, IRR, net cash flow, EBITDA, metal produced, cash
cost and payback across all saved runs. This is the intended workflow: set a base case, save it,
then change one variable at a time and see what it does to the investment case.

**Export CSV** — downloads the full month-by-month output of the current run (including the whole
cash-flow waterfall) for further analysis in Excel or pandas.

A second tab runs a **Monte Carlo risk analysis**: it re-runs the same model N times (default
150), each time drawing new random noise for grade, equipment availability and the price path,
and plots one dot per trial (X = total metal produced, Y = project NPV), colored green for
value-accretive and red for value-destroying. Summary statistics report mean NPV, standard
deviation, P10/P50/P90 and the probability of a positive NPV — which is the number that actually
matters: a project with a healthy expected NPV but only a 55% chance of clearing zero is a very
different proposition from one at 95%.

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
6. **Price** — a random walk (monthly normal noise as % volatility around the previous month's
   price), plus an independent chance each month of a price shock (a step change of a set
   magnitude), then pulled back toward the long-run base price by the mean-reversion rate.
7. **Revenue** — metal produced × price.
8. **Operating cost** — (mining cost/t + processing cost/t) × ore mined + fixed monthly cost.
9. **Royalty** — a percentage of revenue, charged before tax.
10. **EBITDA** — revenue − operating cost − royalty.
11. **Tax** — charged on positive EBITDA at the tax rate, with losses carried forward to shelter
    later profits.
12. **Free cash flow** — EBITDA − tax − sustaining capex (charged per tonne of ore mined).
13. **Discounting** — each month's free cash flow is discounted at the monthly equivalent of the
    annual rate, `fcf / (1 + r_monthly)^month` where `r_monthly = (1 + r_annual)^(1/12) − 1`.

Cumulative cash flow starts at −(initial capex), so both the cash curve and the NPV profile are
project-level figures including the upfront investment.

**NPV** is the final cumulative discounted cash flow. **IRR** is the discount rate at which NPV
crosses zero, found by bracketing outward from zero and bisecting, then annualized from the
monthly rate. **Payback** is the first month after which cumulative cash flow stays positive for
the remainder of the run — so a project that briefly breaks even and then falls back into loss is
reported as "not reached" rather than showing a misleadingly early payback.

Randomness is generated from a seeded PRNG (mulberry32) with Box-Muller normal sampling, so a
given seed always reproduces the same run — useful for comparing scenarios apples-to-apples, and
for the Monte Carlo tab (each trial uses `seed + trial index × 7919 + 1` so trials are
independent but the whole batch is reproducible from the same base seed).

## About the default values

The defaults describe an illustrative mid-size operation: a 20 Mt reserve at 1.2% grade, mined at
150 kt/month over a 10-year horizon, with $110M initial capex. They are **calibrated to produce a
plausible project profile** (≈19% IRR, payback around month 66, positive but not risk-free NPV),
not drawn from a real deposit. Recalibrate them for whatever commodity and jurisdiction you are
actually modeling before drawing any conclusion from the output.

The default random seed (303) was chosen because its single deterministic run lands close to the
median Monte Carlo outcome, so the first thing you see is a representative path rather than a
lucky or unlucky one. Press "Randomize seed & re-run" to see how much the outcome moves.

## The single most important assumption: mean reversion

The mean-reversion rate has more influence on the investment conclusion than any other input.
Holding everything else at default and varying only mean reversion:

| Mean reversion | Price half-life | Mean NPV | P(NPV > 0) |
|---|---|---|---|
| 0%/mo (pure random walk) | never reverts | −$176M | 17% |
| 2%/mo | ~34 months | −$34M | 33% |
| 3%/mo (default) | ~23 months | ~$0M | 48% |
| 5%/mo | ~14 months | +$40M | 71% |
| 10%/mo | ~7 months | +$84M | 100% |

The reason is that price shocks are one-directional by default (−25%), so with weak mean
reversion they compound into a permanent price collapse over a 10-year horizon rather than
representing temporary dislocations. The model's implicit assumption is that shocks are temporary
and prices revert to a long-run level; if you believe a shock is permanent, set mean reversion
to 0 and the economics change completely.

This is worth knowing before quoting any number this tool produces: the headline NPV is a
statement about your price assumptions at least as much as about the mine.

## Known simplifications (read before treating this as a real feasibility model)

This is a teaching/portfolio-grade model, not a bankable feasibility study. Notable
simplifications:

- **No stripping ratio, pit geometry, cut-off grade, or blending constraints** — "ore mined" is a
  single aggregate stream, not split by pit phase or material type, and there is no decision about
  what is ore versus waste.
- **Noise is independent month to month** — real mines have persistent grade domains and
  correlated downtime, whereas here each month's grade and availability are drawn independently.
  Over a long horizon this averages out by the law of large numbers, so the model understates
  production risk; the Monte Carlo spread is driven almost entirely by price, not operations.
- **Tax is charged on EBITDA, not taxable income** — there is no depreciation or capital
  allowance shield, so tax is overstated in early years relative to a real fiscal model. Loss
  carry-forward is modeled, but with no expiry limit.
- **No financing, working capital, closure or rehabilitation costs** — capex is all-equity and
  entirely upfront at month 0, and there is no salvage value or closure liability at the end.
- **IRR assumes a conventional cash-flow profile** — where cash flows change sign more than once,
  IRR is not unique and the solver returns one root; it reports "n/a" when no sign change exists.
  NPV is the more reliable metric.
- **Units are commodity-agnostic** — "%" grade and "$/t metal" price must be filled in
  consistently for whatever commodity you're modeling (e.g., gold needs price converted to $/t
  rather than $/oz; iron ore grade is usually %Fe, not a trace-metal %).
- **Single ore type / single price series** — no polymetallic byproduct credits.

If you want to extend it toward a more realistic feasibility model, the natural next additions
are: a depreciation schedule so tax is charged on taxable income, capex phasing and debt
financing, stripping ratio and cut-off grade optimization, autocorrelated operational noise, and
correlated multi-factor Monte Carlo (price and cost driven by a shared macro factor rather than
drawn independently).

## Tech

Single `index.html` (structure, styling, and simulation logic) plus a vendored copy of
[Chart.js](https://www.chartjs.org/) in `vendor/` (so the app works fully offline — no CDN
dependency). No build tooling, no package manager needed to run it.


---

# 2. Supply Chain Agent Model (`abm.html`)

An agent-based model of a four-echelon supply chain — retailer, wholesaler, distributor, factory.
Each agent is autonomous: it sees only its own inventory and the orders arriving from the customer
directly downstream, and it applies the same ordering rule every week. Nothing in the code tells any
agent to overreact. **The bullwhip effect emerges from the interaction of local rules and delays.**

The page animates the chain live — dots are shipments moving downstream and orders travelling
upstream — alongside charts of orders and inventory per echelon, so you can watch amplification
build rather than just read it off a table.

## Agent rule

Every week, each agent in turn:

1. Receives goods that have finished their shipping delay, decrementing its outstanding-order count.
2. Receives orders from its customer (after the order delay), adding them to its backlog.
3. Ships whatever inventory can cover; the rest stays backlogged.
4. Updates a demand forecast by exponential smoothing: `forecast = α·signal + (1−α)·forecast`.
5. Orders up to a target level:

```
target   = forecast × (shipping delay + order delay + 1) + safety × forecast
position = on-hand − backlog + β × outstanding orders
order    = smoothing × (target − position) + (1 − smoothing) × forecast
```

The factory has no supplier: its "orders" are production, arriving after the same lead time.

The chain **starts in equilibrium** — on-hand covers one week of demand plus the safety factor, and
both pipelines are pre-filled at the base rate — so what you measure is the response to demand
variability, not a startup transient.

## The three behavioural levers

- **β, supply-line awareness** — how much of what you have already ordered but not yet received you
  count. β = 1 is fully rational. Below that you re-order the same shortfall repeatedly, which is
  the classic beer-game finding and the main behavioural engine of the bullwhip.
- **α, forecast responsiveness** — how hard you chase the last observation. High α turns noise into
  a trend.
- **Order adjustment** — how much of the stock gap you try to close in a single week. Low values
  damp heavily.

## Bullwhip measurement

`bullwhip(i) = Var(orders placed by agent i) / Var(real consumer demand)`, computed after a 10-week
warm-up. Above 1.0× means that agent amplifies the signal it received. Note the ratio is sensitive
to a small denominator: with promotions switched off, consumer variance is tiny and the ratio rises
even though the absolute swings are smaller.

## What the mitigations actually do

Measured at the factory, seed 7, 150 weeks, defaults otherwise:

| Configuration | Retailer | Wholesaler | Distributor | Factory |
|---|---|---|---|---|
| No mitigation | 1.38× | 3.26× | 6.98× | **9.61×** |
| Share real consumer demand | 1.38× | 1.05× | 0.66× | **0.51×** |
| Cap orders at 2× normal volume | 1.33× | 3.00× | 5.30× | **6.20×** |
| Full supply-line awareness (β = 1) | 1.13× | 1.91× | 3.87× | **6.32×** |
| Shorter lead times (ship 1, order 1) | 0.89× | 1.32× | 2.22× | **3.17×** |
| Heavy order damping (adjustment 0.12) | 0.55× | 0.55× | 0.65× | **0.80×** |

Sharing point-of-sale data is by far the strongest single lever, which is the standard result: the
amplification is driven by each agent forecasting from a signal that has already been distorted
upstream of it.

The order cap is capped against a **slow trailing average of normal volume**, not against the
agent's own forecast. Capping against your own forecast does nothing, because during a spike the
forecast is already inflated — an easy mistake that makes the control look like it works.

## Known simplifications

- **Single product, single supplier per echelon** — no sourcing choice, no substitution, no capacity
  limits at the factory (it can produce any quantity).
- **No prices, margins or costs** — the model measures amplification, service and inventory, not
  profit. Ordering is not economically optimised.
- **Backlogs never cancel** — unfilled orders wait indefinitely rather than being lost sales.
- **All agents share one rule and one parameter set** — real chains have heterogeneous policies.
- **Deterministic given a seed**, like the mine model, so scenarios are compared like for like.


---

# 3. Bass Diffusion (`bass.html`)

An agent-based version of the Bass diffusion model, in the style of the classic AnyLogic example.
Every square in the field is one person, in one of two states: **potential adopter** or **adopter**.
Each month, a potential adopter can flip in two ways:

- **Advertising (innovation)** — an independent chance `p` per month of adopting with no social
  contact at all. This is what gets the curve off zero when nobody has adopted yet.
- **Word of mouth (imitation)** — the person has some number of conversations per month; if the
  other party has already adopted, they convert with the persuasion probability.

No adoption curve is programmed anywhere. The S-curve, and the bell-shaped uptake peak beneath it,
are what those two rules produce.

## Validation against the closed-form solution

The continuous Bass model has a closed-form solution:

```
F(t) = (1 − e^−(p+q)t) / (1 + (q/p)·e^−(p+q)t)
```

where `q = contacts per month × persuasion rate`. The page draws it dashed over the agent output,
so the model checks itself. Averaged over 8 seeds with 1,200 agents mixing at random:

| Month | Agent model | Closed form | Difference |
|---|---|---|---|
| 6 | 148 | 147 | +0.1% of population |
| 12 | 510 | 520 | −0.8% |
| 18 | 930 | 937 | −0.6% |
| 24 | 1128 | 1130 | −0.2% |
| 36 | 1195 | 1196 | −0.1% |

Agreement inside 1% of population is the evidence that the agent rules really do reproduce the
aggregate equation.

## Where the agent model stops agreeing — and why that is the point

Switch on **"talk to neighbours only"** and people can contact only those within a radius of them,
instead of anyone in the population. The closed form assumes perfect mixing, so it no longer
applies, and adoption slows and clusters. Same parameters, 300 agents, 48 months:

| Contact rule | Half the market by | 95% by | Deviation from closed form at month 18 |
|---|---|---|---|
| Random mixing | month 14 | month 24 | +1% |
| Neighbourhood 25% of field | month 12 | month 25 | +4% |
| Neighbourhood 14% | month 13 | month 27 | −4% |
| Neighbourhood 9% (default) | month 13 | month 34 | −9% |
| Neighbourhood 6% | month 16 | never | −21% |

At a 6% neighbourhood the product never reaches 95% of the market inside the horizon at all. This
is the practical argument for building an agent model rather than solving an equation: the moment
the population stops being perfectly mixed, the aggregate formula overstates how fast and how far
something spreads.

## Known simplifications

- **The field is decorative for random mixing** — positions only matter in neighbourhood mode.
- **Nobody ever un-adopts**, there is no repeat purchase, no competing product, and no price.
- **The social network is geometric**, not a real network — no hubs, no clustering coefficient, no
  weak ties. Real diffusion depends heavily on network topology.
- **Everyone is identical** apart from position: same contact rate, same persuasion probability.
- **Contacts are sampled with replacement** each month rather than drawn from a fixed set of
  friends.


---

# 4. M5 Demand Forecasting (`m5.html`, `m5/`)

A full solution to both tracks of Kaggle's **M5 Forecasting** competition: 28-day forecasts of
daily unit sales for 30,490 Walmart item-stores, scored on the competition's own metrics over
42,840 series. Private-leaderboard results: **0.5866 WRMSSE** (Accuracy, 31% better than seasonal
naive) and **0.1726 WSPL** (Uncertainty, about #28 of the published top 50). The forecasts cut the
stock needed for a 95% fill rate by 29% in an inventory simulation. The Python pipeline lives in `m5/`; `m5.html` is the results dashboard, with
leaderboard comparison, a forecast explorer, demand-driver analysis (price elasticity, SNAP
days, calendar events) and an inventory simulation that turns forecast accuracy into stock and
service level. Full write-up, results and reproduction steps: [`m5/README.md`](m5/README.md).

## Deploying the site

The site is static HTML (Chart.js is vendored in `vendor/`), so any static host works.
`tools/build_static_site.sh` collects the four pages into `public/`.

- **GitHub Pages:** `.github/workflows/pages.yml` publishes `public/` on every push to the
  default branch. One-time setup: repository Settings → Pages → Source: *GitHub Actions*.
  The site then lives at `https://daniel766hi.github.io/Simulation-Project/`.
- **Vercel:** import the repository at vercel.com/new; `vercel.json` sets the build command and
  output folder, so no settings need changing.

---

# The Salt Road (`salt-road.html`)

A single-file canvas RPG. Everything, music and voices included, is synthesised live in the browser, and the page plays offline. It is built from ordered parts in `salt-road/src` with `node tools/salt-road-build.mjs` (no dependencies). `salt-road/README.md` explains the parts and the browser tests.

- **Voices.** A formant speech synthesiser babbles each line in the speaker's own voice, with pitch, throat size, pace, breath, rasp, growl, choir, water, metal and echo. Settings has Voiced, Blips, Spoken (browser text-to-speech) or Off.
- **Saves for every player.** The game saves in the browser as you play. Where storage is blocked, progress is kept with the tab and the title screen says so. Save codes and save files carry a game anywhere. There is no account or server. The title screen shows what Continue leads to (chapter, time played, party), and Start over asks before it erases a save. After an ending nothing more is saved, and the New Game+ offer waits on the title screen until it is used. Coming back after an hour or more opens with a short "Previously" card: the last page of Tobin's Chronicle and the current goal.
- **Arms and armour.** Each hero has a weapon and an armour slot beside the relic, with five tiers per weapon kind. The smiths sell them: Odo in Kessa, Dov in Oru and Qasim on the Dry Sea, with better stock as the story opens up. Buying fits the gear at once and trades the old piece in for half. The metal, glow and trim show on the battle figures. Because gear can be bought, every monster has a quarter more health and attack.
- **Champions, spoils and the anvil.** Any ordinary monster can turn up as a champion, with more health and one or two powers that change the fight:
  - Vampiric: heals from every wound it deals.
  - Ironhide: armoured, and every blow on it lands a fifth lighter.
  - Swift: often strikes a second time.
  - Thorned: a fifth of every blow comes back at the striker.
  - Frenzied: hits harder each time it is hurt.
  - Warded: a ward soaks damage first and returns every third round.
  - Undying: gets up once after it falls.

  Some roam the map already glowing. Every win pays salt shards, and champions and bosses also drop champion cores. At the smiths' anvils, shards temper each fighter's weapon and armour up to +5, and cores set runes. There are four weapon runes (Hooks, Thirst, Thunder, Salt) and three armour runes (Brambles, Wells, the Wall). Runes circle the fighter in battle and flare when they fire.
- **Talents.** At levels 3, 6, 10 and 14 every fighter learns one of two talents:

  | Level | Tier | Choice |
  |---|---|---|
  | 3 | Instinct | First Blood or Second Wind |
  | 6 | Craft | Open Wounds or Bulwark |
  | 10 | Resolve | Executioner or Momentum |
  | 14 | Legend | Last Stand or Storm Heart |

  The choice comes up after a battle, or any time on the Party screen, where it can be switched for 20 coin. Talents flash over the hero when they fire. Odo's three smithing counters now sit together under one "Smithing" menu.
- **The last battle: King Aurel's three tides.** The final fight has rules no other fight has:

  | Tide | When | What happens |
  |---|---|---|
  | The Drowned Court | from the start | The sea rises every round. While his court kneels around him, the King takes a third less damage. |
  | The King Rises | two thirds health | He transforms. Every third round he drags a fighter below, where they lose their turns and slowly drown until the party hurts him enough in one round to make him let go. |
  | The Last Rain | a quarter health | The rain falls upward, the sea rises twice as fast, and the party's Fury builds half again as fast. |

  - The sea level (0–10) is drawn rising over the party. From 6 it drowns everyone a little each round; at 10 it becomes the Flood, his strongest blow.
  - Any fighter can spend a turn to **Ring the Rain Bell**, the Bell Sable carried all the way: the sea falls back 4, the King is exposed, and his wind-up breaks.
  - When he falls, the water drains and the drowned rise as lights.
  - The apology route keeps its honest sword duel.
- **Monster strength.** A balance simulation fought every chapter's battles with an automatic player and a typical party. Before this change, bosses from Chapter 4 on died in 2–3 rounds with the party near full health. Monsters and bosses now grow with the party level expected where they live. Going back to an early road stays easy.

  With a typical party (a gear tier behind the best, forge upgrades, talents):
  - ordinary fights take about 3 rounds;
  - main bosses take about 7 rounds and leave the party at roughly half health;
  - the King takes about 13 rounds.

  A party three levels behind still wins most fights. Each defeat by the same boss makes it a little weaker next time, up to three defeats, and Story difficulty stays the gentle option.
- **How it works** (pause menu): a guide to every system, in plain words. Each topic appears once you have met that system, marked "new". Champions now start in Chapter II.
- **Clearer battles.** Floating words over a fighter go up one after another instead of on top of each other, and champion tags are shorter. Champion powers, runes, talents and the King's rules share one set of battle hooks; a rule that fails is logged and skipped, and the fight goes on.
- **Boss phases.** At half health every boss transforms into a second form with its own design: the Butcher unbound, the Brood Queen, the Dead Conductor, Voss as the Bell Incarnate, Hollis as one great maw, the Ledger Made Flesh, a bloated Gulp, Maw fused with his ship, the Screaming Choir, Vela as the storm itself, Aurel as the Deep's Crown, Corvin as the Golden Debt, the Burning Ledger Tree, the Toll Engine, the Abyss Mouth and the three-headed Crystal Dragon. The change plays out on screen (a white flicker, bursting shards, a title splash). The boss then speaks, flares with an aura, hits harder, moves faster and readies its worst move next. Hollis keeps his own three phases instead (the drowned at 60%, the Tide at 30%), so he transforms without the extra strength.
- **Comfort.** A controller works everywhere: A talks, B goes back, X dashes (hold to run), Y opens the party, Select the journal, LB the minimap, Start pauses, and the D-pad or left stick moves. Settings > Keys rebinds any action, with an AZERTY (ZQSD) preset, and the key hints follow. Settings > Comfort has three text sizes and softer battle flashes. Reading text is set in Atkinson Hyperlegible (letters such as e, o and c, or l, I and 1, are drawn to be told apart); the pixel face stays for titles and banners, and Font: Pixel puts it everywhere. Cutscene lines wait for a key press or a tap (or, on Auto, stay long enough to read); E moves on one line and Esc skips. In battle, the Fury gauge sits right above the commands at the bottom right and reads Ready when full, and every condition shows its turns left, on the hero cards and above each enemy.
- **Rebuilding Kessa.** From Chapter I, Elder Nadia's board by the well lists six places to rebuild with coin and salt shards. Each has two levels, the builders finish by the next dawn (sleep at night to get there sooner), and the new building appears on its lot:

  | Place | Level 1 | Level 2 |
  |---|---|---|
  | Herb Garden | Salves heal 30 | Salves heal 40, Tonics restore 10 SP |
  | Salt Bed Inn | Benched companions earn 75% XP | They earn full XP |
  | Market Hall | Two Salves to collect each day | Plus a Tonic and a rarer remedy |
  | Village Forge | Arms and armour 10% cheaper | 20% cheaper |
  | Training Yard | Battles start with 15 Fury | 30 Fury |
  | Courier Post | Battles pay 15% more coin | 30% more |

  Finishing everything brings a "Home Again" card and an achievement, and the endings remember what was built.
- **Phones held upright.** The party, coin and goal panels sit under the picture with the dialogue and battle menus, so the road stays clear. The pause menu, party screen and journal use the whole screen.
- **Act III, part 1: The Rime.** From Chapter X, a stair at the south rim of the Dry Sea leads down to a frozen salt shelf. Four generations ago the village of Kelda froze its rain in the Ice House so the Guild could never sell it, and Saint Isolde froze with it to keep it. Now the Bell rings and the ice wants to be water again; let go all at once, it would drown the caravan road. The region has a walled village with a healer and a hearth, a frozen lake, the cutters' quarry, three salt tablets, four new monsters (Rime Wolf, Frost Wight, Ice Thrall, Hoarfrost Moth) and a two-phase boss, Saint Isolde, who becomes the Thaw. The player chooses how she lets go, and the journal, the Chronicle and the endings remember it. The world map grew by fifty rows for it; older saves are padded to match.
- **The Long Road** (Pause menu):
  - a Courier Rank and perks kept across playthroughs
  - a daily welcome-back gift with a visiting streak
  - the Deep Stair, an endless descent through five biomes (Salt Steps, Drowned Galleries, Counting Vaults, Storm Shaft, Sunken Choir), each with its own monsters, backdrop and twist. There are twelve boons between floors, one of them rare, and relics at floors 10, 20 and 30
  - the Daily Descent, one Stair run a day with the same floors, champions and boon offers for every player, plus a record of recent runs
  - the Hall of Echoes, boss rematches at three tiers
  - a Weekly Trial


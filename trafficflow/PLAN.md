# TrafficFlowBench (2026 IEEE Big Data Cup): entry plan

Hand-off note for the session that builds the entry.

## The competition (from public sources; confirm on the Kaggle page)
- **Where it runs:** Kaggle, as part of the 2026 IEEE Big Data Cup.
- **The data:** ten freeway corridors at five-minute resolution.
- **Four scored tasks on the same data:**
  1. **State estimation:** fill in the masked detector cells.
  2. **Queue forecasting:** which links are queued over the next 30 minutes.
  3. **Physics consistency:** the reconstruction must obey traffic-flow physics (LWR-type conservation).
  4. **ODME:** estimate an origin-destination (path-flow) matrix from link counts and a weak prior.
- **Score:** 0.35·S_state + 0.30·S_queue + 0.15·S_physics + 0.20·S_ODME, higher is better.
- **Prizes:** Gold $1,500, Silver $1,000, Bronze $500, Student $500. There are Open and Expert divisions.
- **Deadline:** sources disagree. One says the submission window ends **16 Oct 2026, 12:00 UTC**; another says **6 Nov**. Check the rules page first.
- **Public reference points:** public-leaderboard scores reported on GitHub are about 0.845–0.867.

## Rules to respect
- Write our own code. Don't copy other participants' repositories. Kaggle rules forbid private sharing, and public code must be shared on the Kaggle forums. We read public write-ups for ideas only.
- Submissions go out under the user's account, so the user confirms the first submission. After that, each submission must be an improvement checked on local validation.
- Choose every setting on local validation (days/corridors held out the way the test is masked), not on the public leaderboard. The final pick is the best on local validation, with the public board used only as a sanity check.

## What the user sets up
1. **Join:** Join Competition on Kaggle and accept the rules (Kaggle may ask for phone verification).
2. **Network access:** allow `www.kaggle.com` and `storage.googleapis.com` in the environment's settings.
3. **API token:** add it as environment variables `KAGGLE_USERNAME` and `KAGGLE_KEY`. A new session picks them up.

## Build order
1. **Data:** `kaggle competitions download -c <slug>`, then read the data description and sample_submission exactly.
2. **Validation:** reproduce the official metric per task, and mask held-out cells the same way the test does.
3. **Task 4, ODME:** a cheap, high-weight task. Project the prior onto the link-count constraints (constrained least squares / NNLS), then check it against the metric.
4. **Task 1, state:** spatio-temporal interpolation with upstream/downstream neighbours, time of day and the same slot last week, then a gradient-boosted residual model (LightGBM, as in M5).
5. **Task 2, queue:** LightGBM classification on recent speed/occupancy trends and neighbour states. Tune the threshold on validation.
6. **Task 3, physics:** post-process the Task 1 output towards flow conservation (a minimum-change projection), trading off against S_state.
7. **Submit:** blend, then submit (the user confirms the first one), and improve daily until the deadline.

## Compute here
- **Machine:** 4 CPUs, about 15 GB RAM, about 29 GB free disk, no GPU. That's enough for LightGBM and least-squares methods.
- **M5 training:** the M5 confirmation run may still be using the CPUs in the old session. It finishes on its own there.

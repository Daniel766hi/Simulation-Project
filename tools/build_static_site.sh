#!/usr/bin/env bash
# Collect the public pages into public/ for static hosting (GitHub Pages or Vercel).
# The pages are plain HTML with Chart.js vendored locally, so nothing needs compiling.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf public
mkdir -p public/vendor
cp index.html abm.html bass.html m5.html tetris.html salt-road.html public/
cp vendor/chart.umd.min.js vendor/chart.js.LICENSE.md public/vendor/
cp -r sherryn public/sherryn
cp -r karen public/karen
# The gift page used to live at /birthday/; keep that address working by redirecting it.
mkdir -p public/birthday
printf '%s\n' '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=../sherryn/"><a href="../sherryn/">Open</a>' > public/birthday/index.html
touch public/.nojekyll
echo "built public/: $(ls public | tr '\n' ' ')"

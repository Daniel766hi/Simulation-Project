#!/usr/bin/env bash
# Collect the public pages into public/ for static hosting (GitHub Pages or Vercel).
# The pages are plain HTML with Chart.js vendored locally, so nothing needs compiling.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf public
mkdir -p public/vendor
cp index.html abm.html bass.html m5.html public/
cp vendor/chart.umd.min.js vendor/chart.js.LICENSE.md public/vendor/
touch public/.nojekyll
echo "built public/: $(ls public | tr '\n' ' ')"

#!/bin/bash
# Installs what the M5 forecasting pipeline needs to run its tests and linter in Claude Code on the web.
# The browser pages need nothing: they are self-contained HTML, and Playwright ships with the web image.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

python3 -m pip install --quiet --disable-pip-version-check -r m5/requirements.txt pytest ruff

# let node scripts find the globally installed Playwright (used for browser checks of the games)
if [ -n "${CLAUDE_ENV_FILE:-}" ] && command -v npm >/dev/null 2>&1; then
  echo "export NODE_PATH=\"$(npm root -g)\"" >> "$CLAUDE_ENV_FILE"
fi

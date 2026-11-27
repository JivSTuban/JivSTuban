#!/bin/bash
# Rebuilds the README images exactly like .github/workflows/card.yml and force-pushes them to the
# `output` branch. Runs hourly on jiv-server (scripts/systemd/profile-card.timer) because GitHub's
# "every 6 h" schedule fires about twice a day, leaving the live numbers up to 13 h stale.
# card.yml stays on as the fallback; whichever publishes last wins, both with fresh data.
#   Reads: GitHub GraphQL with `gh auth token` (any token that can read public profile data).
#   Writes: the `output` branch over SSH with $WORK/deploy_key, a write deploy key for this repo only.
#   No change since the last publish = no push.
# The body sits in { } so bash reads it whole before the `git reset` below rewrites this file.
{
set -euo pipefail
REPO=JivSTuban/JivSTuban
CITY_SHA=7d95e7d4cdc028dd1e1cbd957d65f35efb12ae39 # github-profile-3d-contrib v0.9.3, same pin as card.yml
WORK="${PROFILE_CARD_HOME:-$HOME/profile-card}"
export GIT_SSH_COMMAND="ssh -i $WORK/deploy_key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

cd "$WORK"
[ -d src ] || git clone -q "https://github.com/$REPO.git" src
git -C src fetch -q origin main && git -C src reset -q --hard origin/main
[ -d city ] || git clone -q https://github.com/yoshi389111/github-profile-3d-contrib.git city
git -C city cat-file -e "$CITY_SHA" 2>/dev/null || git -C city fetch -q origin
git -C city checkout -q "$CITY_SHA"

export GH_TOKEN="$(gh auth token)"
cd src
node --test scripts/*.test.mjs
rm -rf dist profile-3d-contrib
node scripts/build.mjs dist
GITHUB_TOKEN="$GH_TOKEN" USERNAME=JivSTuban SETTING_JSON=assets/city-3d.json node ../city/dist/index.js
cp profile-3d-contrib/city-light.svg profile-3d-contrib/city-dark.svg dist/

cd dist
git init -q -b output
git config user.name "profile-card (jiv-server)"
git config user.email "profile-card@jiv-server.local"
git add -A
git commit -q -m "cards $(date -u +%F)"
git fetch -q "git@github.com:$REPO.git" output 2>/dev/null || true
if [ "$(git rev-parse HEAD^{tree})" = "$(git rev-parse -q --verify FETCH_HEAD^{tree} || true)" ]; then
  echo "no change"
  exit 0
fi
git push -q -f "git@github.com:$REPO.git" output
echo "published $(git rev-parse --short HEAD)"
exit
}

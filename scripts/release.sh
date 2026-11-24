#!/usr/bin/env bash
# Usage: scripts/release.sh X.Y.Z
#
# Prepares a release from develop and opens its pull request into main.
# Merging that pull request is the decision to release: release.yml then tags
# vX.Y.Z on main, publishes the GitHub Release from the CHANGELOG section and
# merges main back into develop. Vercel deploys main, so production moves on
# that merge and on no other.
#
# What it needs before it starts: develop clean and equal to origin/develop,
# a non-empty `## [Unreleased]` section in CHANGELOG.md, and an entry for
# X.Y.Z in src/data/changelog/data.ts (the in-app changelog is bilingual prose,
# a script cannot write it). It then dates both, bumps package.json, runs the
# CI gates, commits on release/X.Y.Z, pushes and opens the pull request.
#
# DRY_RUN=1 makes the same edits and runs the same gates, prints the diff,
# then restores the files. Nothing is committed, pushed or opened.
set -euo pipefail
cd "$(dirname "$0")/.."

die() { echo "release: $*" >&2; exit 1; }
ver=${1:?usage: scripts/release.sh X.Y.Z}
[[ $ver =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "version must look like 1.2.3"
dry=${DRY_RUN:-0}
[[ $dry =~ ^[01]$ ]] || die "DRY_RUN must be 0 or 1"
tag="v$ver"
branch="release/$ver"
today=$(date +%F)
managed=(CHANGELOG.md package.json src/data/changelog/data.ts)

[ "$(git branch --show-current)" = develop ] || die "not on develop"
git diff --quiet && git diff --cached --quiet || die "uncommitted changes"
if [ "$dry" = 0 ]; then
    git fetch -q origin develop main --tags
    [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/develop)" ] || die "develop differs from origin/develop"
    ! git rev-parse -q --verify "refs/remotes/origin/$branch" >/dev/null || die "$branch already exists on origin"
fi
! git rev-parse -q --verify "refs/tags/$tag" >/dev/null || die "tag $tag already exists"

current=$(jq -r .version package.json)
[ "$current" != "$ver" ] && [ "$(printf '%s\n%s\n' "$current" "$ver" | sort -V | tail -1)" = "$ver" ] \
    || die "$ver is not above the current version $current"
unreleased=$(awk '/^## \[Unreleased\]/ { on = 1; next } on && /^## \[/ { exit } on' CHANGELOG.md)
grep -q '^- ' <<<"$unreleased" || die "## [Unreleased] in CHANGELOG.md has no entry"
grep -q "version: \"$ver\"," src/data/changelog/data.ts \
    || die "src/data/changelog/data.ts has no entry for $ver (write it first, FR and EN)"

# The tree was clean on entry, so putting the managed files back is exact.
restore() { git checkout -q -- "${managed[@]}"; }
trap 'code=$?; [ $code = 0 ] || restore; exit $code' EXIT

# `## [Unreleased]` stays, empty, above the new section.
sed -i "0,/^## \[Unreleased\]\$/s//## [Unreleased]\n\n## [$ver] - $today/" CHANGELOG.md
sed -i "0,/\"version\": \".*\"/s//\"version\": \"$ver\"/" package.json
sed -i "/version: \"$ver\",/{n;s/date: \".*\"/date: \"$today\"/}" src/data/changelog/data.ts
grep -q "^## \[$ver\] - $today\$" CHANGELOG.md || die "could not date the CHANGELOG section"
[ "$(jq -r .version package.json)" = "$ver" ] || die "could not bump package.json"

# The gates CI runs on every pull request, in the same order (CLAUDE.md).
bunx tsc --noEmit
bun test 2>&1 | tail -3
bun run check:i18n
bun run check:typography
bun run check:errors
bun run scripts/generate-wordmark.mjs --check
bun run scripts/qa-zone-colors.ts
bun run scripts/qa-workout-schema.ts

git diff --stat -- "${managed[@]}"
if [ "$dry" = 1 ]; then
    restore
    echo "dry run complete: files restored, nothing committed"
    exit 0
fi

notes=$(awk -v v="$ver" '$0 ~ "^## \\[" v "\\]" { on = 1; next } on && /^## \[/ { exit } on' CHANGELOG.md)
git switch -q -c "$branch"
git commit -q -m "chore(release): $ver" -- "${managed[@]}"
trap - EXIT
git push -q -u origin "$branch"
gh pr create --base main --head "$branch" --title "Release $ver" \
    --body "$(printf 'Merging this publishes %s: release.yml tags main, creates the GitHub Release from the notes below and merges main back into develop.\n\n%s\n' "$tag" "$notes")"
git switch -q develop

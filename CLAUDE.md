# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Runtime is **Bun**. There is no npm/yarn path.

```bash
bun install
bun run dev            # Vite dev server, http://localhost:5173
bun run preview        # serve the built dist/

bunx tsc --noEmit      # typecheck (what CI runs)
bun test               # whole unit suite (71 *.test.ts / *.test.tsx files, Bun's runner)
bun test src/lib/planGenerator/tss.test.ts     # one file
bun test -t "negative split"                    # one test by name

bun run build          # tsc + workout schema QA + icon check + sitemap + licenses + vite build + route-meta
bun run build:seo      # build + prerender (headless Chrome, slow)
```

Gates CI runs on every PR, in this order: `bunx tsc --noEmit`, `bun test`,
`bun run check:i18n` (FR/EN namespace parity), `bun run check:typography`,
`bun run scripts/generate-wordmark.mjs --check`, `bun run scripts/qa-zone-colors.ts`,
`bun run scripts/qa-workout-schema.ts`. Run those seven before claiming green.
`scripts/qa-zone-audit.ts` also runs but is informational: it exits 0 whatever it
finds, so read its log rather than its exit code.

`bun run scripts/qa-workout-schema.ts --file src/data/workouts/vma.json` validates a single
catalogue file. `bun run scripts/site-stats.ts` re-measures the catalogue counts
(never restate a count from memory or from a doc).

CI deliberately skips `prerender`, `generate:og`, `generate:pwa-screenshots`, `demo:gif`
and the full `build`, because they drive a headless Chrome and cost minutes.

## Architecture

Single static React 19 + Vite 7 SPA. **No backend, no accounts, no database.** All user
state lives in `localStorage` (and IndexedDB via `idb-keyval` for heavier blobs). Treat
"add a server call" as out of bounds unless explicitly asked.

**The catalogue is data, not code.** Workouts, plans, weeks, collections, articles,
glossary and science references are versioned JSON/TS under `src/data/`. Adding content
means adding data plus passing the schema validator, not writing components.

Flow to follow when tracing a feature: `src/types/index.ts` (the `WorkoutTemplate` shape)
-> `src/data/workouts/*.json` -> `src/data/workouts/index.ts` (per-shape lazy loaders)
-> `src/hooks/useWorkouts.ts` -> `src/pages/WorkoutDetailPage.tsx`.

Layout:

- `src/pages/` route components, every one lazy loaded through `lazyPage()` in `App.tsx`,
  which also awaits `i18nReady` so no page flashes raw i18n keys.
- `src/lib/` pure helpers, where the real logic lives and where tests sit next to their
  source. Notably `planGenerator/` (phases, volume, pace engines per discipline, audit,
  reschedule, substitution, TSS) and `export/` (FIT, GPX, ICS, PDF, PNG, Strava).
- `src/components/` split by role: `ui/` primitives, `domain/` widgets, `editorial/`,
  `visualization/` (every chart is hand-drawn SVG, there is no charting library),
  `layout/`, `search/`, `share/`, `seo/`.
- `src/styles/` hand-written CSS, `zn-` prefixed, tokens in `src/styles/design/`
  (`colors`, `zones`, `spacing`, `typography`, `fonts`, `motion`, `borders`), one sheet
  per component in `src/styles/components/`. **No Tailwind, no shadcn, no CSS-in-JS.**
  Zone colours are checked against `design/zones.css` by `qa-zone-colors.ts`.
- `src/i18n/locales/{fr,en}/*.json` bilingual namespaces. Both languages always ship
  together; `check:i18n` fails on a missing key on either side.

Discipline model: `Practice` (`road | trail | ultra | triathlon`) sits *above*
modality (`running | cycling | swimming | strength`), it does not replace it.
`practiceFromRaceDistance` in `src/types/practice.ts` is an exhaustive `switch` with no
`default` on purpose, so a new `RaceDistance` breaks `tsc` instead of silently becoming
"road". See `docs/pratiques.md` for decisions already settled there.

## SEO and PWA pipeline

`vite build` emits the SPA; `scripts/generate-route-meta.ts` then writes one static HTML
shell per public URL, because social crawlers never run JS and `vercel.json` would
otherwise hand every URL the same `index.html` with a homepage canonical. `cleanUrls: true`
makes Vercel serve `dist/library.html` for `/library` before the SPA rewrite.
`scripts/prerender.ts` is the heavier variant that renders each route with Puppeteer
(full `puppeteer` locally, `@sparticuz/chromium` + `puppeteer-core` on Vercel).

Share cards are painted, not composed at request time (there is no backend to compose
them). `scripts/generate-og-image.ts` writes the six section cards, and
`scripts/generate-og-workouts.ts` (`bun run generate:og:workouts`, ~9 min of headless
Chrome) writes one per catalogue session into `public/og/workout/<id>.png`, reusing the
same template through its `workout` variant. Both are committed, both are skipped by CI,
and `build:seo:full` runs them. `generate-route-meta.ts` points a workout route at its
card only when the PNG exists and falls back to `og-library.png`, so adding a session
without repainting degrades instead of serving a 404. Those 250 files are in the Workbox
`globIgnores`: only crawlers fetch them, so precaching them would put 16MB on every
install.

Workbox is configured with `registerType: "prompt"` and *no* `skipWaiting`/`clientsClaim`:
a new service worker never activates behind the app's back, the update banner asks. Do not
"fix" that by enabling them.

`build.rollupOptions.output.manualChunks` lists only packages actually declared in
`package.json`; a stale name there is an unresolvable Rollup entry and a dead build. The
Lighthouse budget bounds the startup path at 850KB, so do not casually move a dependency
into `vendor-*`.

## House rules

**Typography gate.** `«` `»` `—` `–` are banned everywhere under `src/` and `scripts/`:
visible text, editorial data, code comments and tests included. Replacements: bare label
instead of chevrons, comma instead of an em dash incise, middle dot `·` between two labels,
hyphen for a range. Enforced by `bun run check:typography`.

**Workout ids.** `PREFIX-NNN`, prefix registered per bucket in `ID_PREFIX_REGISTRY`
(`scripts/qa-workout-schema.ts`). An unregistered prefix is a hard failure. Which schema a
template is held to is decided by its **file location**, not by its own `kind`:
`src/data/strength/sessions/` is the strength schema, `src/data/workouts/` the running one.
`cycling.json` and `swimming.json` are not categories, their templates carry a running
`category` plus a `discipline`. `docs/workout-format.md` documents the format, but the
validator wins when they disagree.

**`scripts/qa-*.ts` is gitignored** except for a short negated allowlist in `.gitignore`.
Some QA scripts exist only on a developer machine, so a CI step naming one would fail on
"Module not found". Un-ignore first if a new one should gate.

**Commits.** Conventional Commits in French (`fix(pwa): ...`, `feat(nav): ...`).

## Docs worth reading before a related change

`docs/pratiques.md` (practice axis, triathlon stance), `docs/workout-format.md` (authoring
a valid workout), `docs/icon-mapping.md`, `docs/doodles.md` (23 illustrations generated
from `scripts/doodles/rig.mjs`), `CONTRIBUTING.md` (bilingual policy, id conventions).

<div align="center">
  <img src="src/assets/logo.svg" alt="Zoned" width="120" />

  # Zoned

  **Open-source endurance training — workouts, plans, calculators. Runs entirely in your browser.**

  *Free. No account. No tracking. Forever.*

  ### [→ zoned.run](https://zoned.run)

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
  [![Version](https://img.shields.io/badge/version-v0.7.0-orange?style=flat-square)](https://github.com/alarboulletmarin/zoned/releases)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
  [![Good first issues](https://img.shields.io/github/issues/alarboulletmarin/zoned/good%20first%20issue?style=flat-square&color=7057ff&label=good%20first%20issues)](https://github.com/alarboulletmarin/zoned/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
  [![Open issues](https://img.shields.io/github/issues/alarboulletmarin/zoned?style=flat-square)](https://github.com/alarboulletmarin/zoned/issues)
  [![Last commit](https://img.shields.io/github/last-commit/alarboulletmarin/zoned?style=flat-square)](https://github.com/alarboulletmarin/zoned/commits/main)
  [![Stars](https://img.shields.io/github/stars/alarboulletmarin/zoned?style=flat-square)](https://github.com/alarboulletmarin/zoned/stargazers)
  <br/>
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
  [![Bun](https://img.shields.io/badge/Bun-runtime-fbf0df?style=flat-square&logo=bun&logoColor=black)](https://bun.sh)

  <br/>

  <img src="assets/demo.gif" alt="Demo — browsing the library, filtering threshold workouts, opening a session and exporting it as Garmin FIT" width="800" />
</div>

---

## What is Zoned?

Zoned is a free, open-source web app for structured endurance training. Everything ships in a single static React 19 bundle — there's no backend, no account system and no telemetry beyond anonymous page views. Your zones, favorites and custom workouts stay in `localStorage`.

The catalogue is grounded in published training science (**Seiler**, **Billat**, **Daniels**, **Coggan**, **Bangsbo**, **Beattie**, **Rønnestad**), with every workout, plan and calculator versioned in this repo as plain JSON / TypeScript. It is built in collaboration with [Claude Code](https://claude.ai/code).

| | |
|---|---|
| **210** running workouts | 12 categories from recovery to VMA |
| **17** strength sessions | full body, legs, core, plyometrics, mobility |
| **10** cycling + **10** swimming sessions | Coggan FTP / CSS zones |
| **9** training plans | 5K → marathon, with strength periodization |
| **12** calculators | zones, paces, VMA, FTP, CSS, age-graded, what-if, race-day |
| **15** collections · **12** articles · **50+** glossary terms | bilingual FR / EN |

---

## Demos

<div align="center">
  <img src="assets/demo-plans.gif" alt="Demo — adopting a prebuilt semi-marathon plan: phases, stats and calendar" width="800" />
  <p><em>Adopt a prebuilt training plan — phases, stats, then your own calendar</em></p>

  <img src="assets/demo-calculators.gif" alt="Demo — estimating VMA from a 10K race time and previewing pace zones" width="800" />
  <p><em>Estimate your VMA from a race time and preview your pace zones</em></p>

  <img src="assets/demo-mobile.gif" alt="Demo — mobile: navigation menu, filter drawer and workout structure" width="300" />
  <p><em>Fully responsive — filter drawer and workout details on mobile</em></p>
</div>

---

## Screenshots

<div align="center">
  <img src="assets/home_fr_light.png" alt="Home — Light mode" width="600" />
  <p><em>Home — Light mode</em></p>

  <img src="assets/home_fr_dark.png" alt="Home — Dark mode" width="600" />
  <p><em>Home — Dark mode</em></p>

  <img src="assets/libray_fr_light.png" alt="Library" width="600" />
  <p><em>Library</em></p>

  <img src="assets/workout_fr_light.png" alt="Workout detail" width="600" />
  <p><em>Workout detail</em></p>

  <img src="assets/plan_with_stats_fr_light.png" alt="Training plan" width="600" />
  <p><em>Training plan</em></p>
</div>

### In motion

<table>
  <tr>
    <td align="center" width="33%">
      <img src="assets/polarise.gif" alt="Polarised week distribution" width="240" /><br/>
      <sub><b>The 80/20 model</b><br/>What a well-dosed week looks like</sub>
    </td>
    <td align="center" width="33%">
      <img src="assets/zones.gif" alt="Six training zones" width="240" /><br/>
      <sub><b>Six zones, six adaptations</b><br/>Z1 recovery → Z6 sprint</sub>
    </td>
    <td align="center" width="33%">
      <img src="assets/workouts.gif" alt="Three weekly workouts" width="240" /><br/>
      <sub><b>Three workouts a week</b><br/>Recovery · VMA · long run</sub>
    </td>
  </tr>
</table>

---

## Features

### Workouts
- **210 running sessions** across 12 categories: recovery, endurance, tempo, threshold, VMA, long run, hills, fartlek, race pace, mixed, trail, assessment
- **10 cycling + 10 swimming sessions** with discipline-aware zones (Coggan FTP, CSS) and cross-discipline substitution in plans
- **17 strength sessions** for runners: full body, legs, core, plyometrics, mobility, prehab — based on Beattie 2017, Rønnestad 2014, Lauersen 2014
- **46 exercises** with A/B position images, muscle maps, form cues, and progression/regression chains
- **6 training zones**: Z1 (recovery) → Z6 (sprint)
- **Specialized methods**: Norwegian double threshold, Bangsbo 10-20-30, Billat 30/30, Yasso 800s, Cooper / VAMEVAL tests
- **Personalized zones**: from your max HR and VMA
- **Custom workout builder**: assemble your own sessions block by block (warm-up, main set, cool-down)

### Calculators (12)
Training zones · Pace converter · Pace reference table · Treadmill converter · Split generator · VMA from race time · FTP cycling test · CSS swimming test · Race equivalence · Age-graded performance · Race-day simulator · What-if simulator

### Training plans
- **Plan generator**: personalised multi-week plans (5K to marathon)
- **9 prebuilt plans** with integrated strength training, plus free mode to build from scratch
- **Strength periodization**: auto-suggested strength sessions per training phase
- **4 view modes**: Calendar, Weekly, Monthly, List
- **Drag-and-drop** calendar, cross-training support (strength, cycling, swimming, yoga)
- **Export**: PDF, ICS (Google/Apple/Outlook Calendar)
- **Race day simulator**: km-by-km pacing, nutrition timing, checklists

### Routes
- **Route generator**: build a real-world loop or out-and-back from your position
- **POI-aware routing**: waypoints picked from parks, promenades, greenways and beaches via Overpass
- **3 candidates per request**: each with elevation profile, estimated duration and named POI markers
- **GPX export** + local saved routes
- **Privacy toggle**: opt-out from Settings if you don't want to send coordinates to public services

### Discovery
- **Quiz**: find the right workout in 5 questions (goal, time, terrain, level, weakness)
- **Workout of the day** · random workout
- **15 curated collections** · command palette (Cmd+K)
- **Favorites**: save and organise preferred workouts

### Export
ICS · PNG · PDF · **Garmin FIT** (native workout file) · **GPX** (routes)

### Learn
- **12 bilingual articles** on training principles (Seiler, polarized, threshold…)
- **Nutrition hub**: 14 sections covering the 1:0.8 carb ratio, 1.8 g/kg protein target, AIS-classified supplements, cramps science, heat acclimation, female-specific needs, debunked myths — sources Witard 2025, Rowlands 2020, Schwellnus, Aragon, Margolis, Paulsen, Trommelen
- **3 practical guides**: nutrition (with fueling calculator), race prep, warm-up
- **Methodology** page and **50+ term glossary** across 9 categories
- **69 contextual tips** throughout the app

---

## Philosophy

| | |
|---|---|
| **Zero tracking** | No cookies, no user accounts, no server-side data |
| **Local-first** | Zones, favorites, custom workouts and routes live in your browser |
| **Privacy by design** | Only anonymous page views via Vercel Analytics |
| **100% free** | No premium tier, no paywall, ever |
| **Open source** | MIT licensed — fork it, host it, audit it |

---

## Getting started

### Run locally

```bash
git clone https://github.com/alarboulletmarin/zoned.git
cd zoned
bun install
bun run dev       # http://localhost:5173
```

```bash
bun run build     # TypeScript check + build to dist/
bun run preview   # Preview production build
```

### Docker

```bash
docker compose up -d   # http://localhost:8080
```

### Self-host

The build output in `dist/` is a static SPA — drop it on any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3, nginx, Caddy). No environment variables required to run; analytics is opt-in via Vercel.

---

## Project structure

```
src/
├── pages/           # Route components (lazy-loaded)
├── components/      # UI (editorial atoms, domain widgets, visualizations)
├── data/            # JSON workouts + TS catalogues
│   ├── workouts/    # Running / cycling / swimming session JSON, by category
│   ├── strength/    # Strength sessions + exercise library
│   ├── prebuilt-plans/
│   ├── collections/
│   └── articles/    # Bilingual editorial content
├── hooks/           # React hooks (useWorkouts, useAppStats, …)
├── lib/             # Pure helpers (zones, pacing, exports, storage)
├── i18n/locales/    # FR / EN translation namespaces
└── types/           # WorkoutTemplate, Plan, Zone, etc.
```

Want a high-level tour of how a workout flows from JSON to the rendered detail page? Start at [`src/types/index.ts`](src/types/index.ts) (the `WorkoutTemplate` shape) → [`src/data/workouts/`](src/data/workouts/) (the JSON) → [`src/hooks/useWorkouts.ts`](src/hooks/useWorkouts.ts) → [`src/pages/WorkoutDetailPage.tsx`](src/pages/WorkoutDetailPage.tsx).

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | React 19 + Vite 7 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix UI) |
| Animations | framer-motion (respects `prefers-reduced-motion`) |
| Charts | Recharts |
| i18n | i18next (FR / EN) |
| PWA | Workbox |
| Analytics | Vercel Analytics (anonymous page views only) |
| Runtime | Bun |

---

## Contributing

Contributions are very welcome — coaches, runners, devs, designers. **No need to be a developer:** the easiest way is to share a workout idea via a GitHub issue.

**Ways to contribute, easiest first:**

| | |
|---|---|
| 💡 **Suggest a workout** | Open a [workout idea issue](https://github.com/alarboulletmarin/zoned/issues/new?template=workout_idea.md) — no JSON required |
| 🐛 **Report a bug** | Use the [bug report template](https://github.com/alarboulletmarin/zoned/issues/new?template=bug_report.md) |
| 🌍 **Improve a translation** | Edit a file in [`src/i18n/locales/`](src/i18n/locales/) and open a PR |
| 📝 **Write or refine an article** | Add or improve content in [`src/data/articles/content/`](src/data/articles/content/) |
| 🏋️ **Submit a full workout** | Add JSON in [`src/data/workouts/`](src/data/workouts/) — see [CONTRIBUTING.md](CONTRIBUTING.md) for the schema |
| 🎨 **UI / UX polish** | Pick a [`good first issue`](https://github.com/alarboulletmarin/zoned/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) |
| 📚 **Improve the methodology page** | Citations and clarity always welcome |

The in-app contribution form lives at [zoned.run/contribute](https://zoned.run/contribute) and pre-fills the right issue template.

**Before opening a PR**, please:

```bash
bun run build         # type check + production build
bun run check:i18n    # FR / EN parity check
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for workout ID conventions, the `WorkoutTemplate` schema, and the bilingual policy. By participating you agree to keep things kind and constructive.

---

## Roadmap

Tracked publicly in [GitHub Issues](https://github.com/alarboulletmarin/zoned/issues) and the [Releases](https://github.com/alarboulletmarin/zoned/releases) page. Recent waves:

- **0.5.x** — multi-discipline (cycling / swimming), route generator, strength periodization
- **next** — additional bilingual articles, more curated collections, broader plan library, deeper trail metrics

Feature requests are welcome via issues.

---

## About the author

Runner and developer. I created Zoned to make structured zone-based training accessible to everyone — for free, with no account and no tracking. Every workout, calculator and plan is grounded in training science.

[![Strava](https://img.shields.io/badge/Strava-FC4C02?style=flat-square&logo=strava&logoColor=white)](https://www.strava.com/athletes/115001213)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/alarboulletmarin)

---

## Support

If Zoned helps you train, you can support the project on Ko-fi — entirely optional.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/T6T01WC5ZC)

A ⭐ on the repo is also greatly appreciated and helps other runners find the project.

---

## License

[MIT](LICENSE) — free to use, fork, host or adapt. Attribution is appreciated.

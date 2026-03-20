# Zoned

A library of **200 structured running workouts** based on the 6-zone training system.

**Live**: [zoned.run](https://zoned.run)

## Philosophy

- **Zero tracking**: No cookies, no user accounts, no server-side data
- **Local-first**: All your data stays in your browser
- **Privacy by design**: Only anonymous page views via Vercel Analytics
- **100% free**: No premium tier, no paywall

## Features

### Workouts
- **Structured workouts**: Warm-up, main set, cool-down, coaching tips, and common mistakes
- **6 training zones**: From Z1 (recovery) to Z6 (sprint)
- **200 sessions** across 11 categories: recovery, endurance, tempo, threshold, VMA, long run, hills, fartlek, race pace, mixed, assessment
- **Specialized methods**: Norwegian double threshold, Bangsbo 10-20-30, Billat 30/30, Yasso 800s, Cooper/VAMEVAL tests
- **Personalized zones**: Based on your FCmax and VMA

### Calculators
- **Zone calculator**: HR and pace zones from FCmax or VMA
- **Pace calculator**: Target time predictions
- **Pace converter**: min/km to km/h and vice versa
- **Pace table**: Complete pace reference table
- **Treadmill converter**: Speed to pace conversion
- **Split generator**: Custom splits for race distances
- **VMA calculator**: Estimate VMA from race times
- **Race equivalence**: Predict times across distances
- **Age-graded calculator**: Performance adjusted for age

### Training Plans
- **Plan generator**: Create personalized multi-week training plans (5K to marathon)
- **8 prebuilt plans**: Ready-to-use plans for common goals
- **Free plan mode**: Build your own plan from scratch
- **Drag-and-drop calendar**: Reorganize sessions visually
- **Plan export**: PDF and ICS (calendar) formats

### Discovery & Tools
- **Quiz**: Find the right workout for your goals and schedule
- **Random workout**: Discover new sessions with one click
- **Workout of the Day**: Daily curated workout
- **Command palette**: Quick search with Cmd+K / Ctrl+K
- **16 collections**: Curated thematic workout paths

### Library
- **Filters**: Duration, category, difficulty, terrain, target system
- **View modes**: Grid and list views
- **Favorites**: Save and organize preferred workouts
- **Infinite scroll**: Smooth browsing with auto-loading

### Export
- **ICS**: Add to Google Calendar, Apple Calendar, Outlook
- **PNG**: High-resolution workout image
- **PDF**: Printable document
- **Garmin FIT**: Native workout file for Garmin devices

### Educational Content
- **12 articles**: Bilingual guides on training principles
- **3 practical guides**: Nutrition, race prep, warm-up
- **Glossary**: 50+ technical terms with definitions (9 categories)
- **69 tips**: Contextual training advice

### Settings & Accessibility
- **Themes**: Light/dark mode with color blind palettes (deuteranopia, protanopia, tritanopia)
- **Units**: Metric (km/h, min/km) and Imperial (mph, min/mi)
- **Data backup**: Export and import all your data as JSON
- **Offline-ready**: Everything stays on your device
- **Bilingual**: French and English

## Installation

```bash
bun install
bun run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
bun run build    # Build to dist/
bun run preview  # Preview production build
```

## Docker

```bash
docker compose up -d
```

Open [http://localhost:8080](http://localhost:8080)

## Stack

- React 19
- Vite 7
- Tailwind CSS 4
- TypeScript
- Recharts
- Radix UI (shadcn/ui)
- Sonner
- Workbox (PWA)
- Vercel Analytics
- i18next (FR/EN)

## Support

If you find Zoned useful, you can support the project on [Ko-fi](https://ko-fi.com/T6T01WC5ZC).

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/T6T01WC5ZC)

## Contributing

This project is developed in collaboration with AI (Claude Code).

Issues and suggestions welcome on [GitLab](https://gitlab.com/alarboulletmarin-oss/zoned/-/issues).

## License

MIT

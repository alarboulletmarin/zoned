# Zoned

A library of **150 structured running workouts** based on the 6-zone training system.

**Live**: [zoned.run](https://zoned.run)

## Features

### Workouts
- **Structured workouts**: Warm-up, main set, cool-down, coaching tips, and common mistakes
- **6 training zones**: From Z1 (recovery) to Z6 (sprint)
- **150 sessions** across 11 categories: recovery, endurance, tempo, threshold, VMA, long run, hills, fartlek, race pace, mixed, assessment
- **Specialized methods**: Norwegian double threshold, Bangsbo 10-20-30, Billat 30/30, Yasso 800s, Cooper/VAMEVAL tests
- **Personalized zones**: Based on your FCmax and VMA

### Discovery & Tools
- **Quiz**: Find the right workout for your goals and schedule
- **Random workout**: Discover new sessions with one click
- **Workout of the Day**: Daily curated workout
- **Pace calculator**: Target time predictions
- **Command palette**: Quick search with Cmd+K / Ctrl+K

### Export
- **ICS**: Add to Google Calendar, Apple Calendar, Outlook
- **PNG**: High-resolution workout image
- **PDF**: Printable document
- **Garmin FIT**: Native workout file for Garmin devices

### Educational Content
- **Knowledge hub**: 12 bilingual articles on training principles
- **Glossary**: 50+ technical terms with definitions
- **Tips**: Contextual training advice

### Library
- **Filters**: Duration, category, difficulty, terrain, target system
- **View modes**: Grid and list views
- **Favorites**: Save and organize preferred workouts

### Settings & Accessibility
- **Themes**: Light/dark mode with color blind palettes (deuteranopia, protanopia, tritanopia)
- **Units**: Metric (km/h, min/km) and Imperial (mph, min/mi)
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
- Recharts
- Radix UI
- Vercel Analytics
- i18next (FR/EN)

## Contributing

This project is developed in collaboration with AI (Claude Code).

Issues and suggestions welcome on [GitLab](https://gitlab.com/andmusic/zoned/-/issues).

## License

MIT

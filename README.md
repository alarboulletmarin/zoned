# Zoned

A library of **181 structured running workouts** based on the 6-zone training system.

**Live**: [zoned.run](https://zoned.run)

## Features

### Workouts
- **Structured workouts**: Warm-up, main set, cool-down, coaching tips, and common mistakes
- **6 training zones**: From Z1 (recovery) to Z6 (sprint)
- **181 sessions** across 11 categories: recovery, endurance, tempo, threshold, VMA, long run, hills, fartlek, race pace, mixed, assessment
- **Specialized methods**: Norwegian double threshold, Bangsbo 10-20-30, Billat 30/30, Yasso 800s, Cooper/VAMEVAL tests
- **Personalized zones**: Based on your FCmax and VMA

### Discovery & Tools
- **Quiz**: Find the right workout for your goals and schedule
- **Random workout**: Discover new sessions with one click
- **Workout of the Day**: Daily curated workout
- **Pace calculator**: Target time predictions
- **Command palette**: Quick search with Cmd+K / Ctrl+K
- **Changelog**: Track app updates and new features

### Library
- **Filters**: Duration, category, difficulty, terrain, target system
- **View modes**: Grid and list views
- **Favorites**: Save and organize preferred workouts
- **Infinite scroll**: Smooth browsing with auto-loading
- **Collections**: 12 curated thematic collections (beginner, anti-stress, race goals, etc.)

### Export
- **ICS**: Add to Google Calendar, Apple Calendar, Outlook
- **PNG**: High-resolution workout image
- **PDF**: Printable document
- **Garmin FIT**: Native workout file for Garmin devices

### Training Plans
- **Plan generator**: Create personalized multi-week training plans
- **Plan wizard**: Progressive volume, phase management, race week planning
- **Plan export**: PDF and ICS (calendar) formats

### Guides
- **Runner's nutrition**: Calculator and practical advice
- **Race preparation**: Pre-race checklist and strategies
- **Warm-up routines**: Dynamic warm-up protocols

### Community
- **Contribute workouts**: Submit new workout ideas via the app
- **Quick idea mode**: Simple form for workout suggestions
- **Full workout wizard**: Detailed 4-step submission with preview

### Educational Content
- **Knowledge hub**: 12 bilingual articles on training principles
- **3 practical guides**: Nutrition, race prep, warm-up
- **Glossary**: 50+ technical terms with definitions
- **Tips**: Contextual training advice

### Settings & Accessibility
- **Themes**: Light/dark mode with color blind palettes (deuteranopia, protanopia, tritanopia)
- **Units**: Metric (km/h, min/km) and Imperial (mph, min/mi)
- **Offline-ready**: Everything stays on your device
- **Bilingual**: French and English
- **Error handling**: Graceful error boundaries and 404 page

### Navigation
- **Collapsible sidebar**: Notion/Linear-style navigation with expandable sections

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

## Routes

- `/` - Home
- `/library` - Workout catalog with filters and infinite scroll
- `/workout/:id` - Workout detail with export, nutrition, zones
- `/plans` - Training plans
- `/plan/new` - Plan generator wizard
- `/collections` - Curated workout collections
- `/learn` - Knowledge hub articles
- `/glossary` - Training glossary
- `/guides` - Practical guides (nutrition, race prep, warm-up)
- `/quiz` - Workout recommendation quiz
- `/my-zones` - Zone calculator
- `/settings` - Theme, units, accessibility
- `/favorites` - Saved workouts
- `/contribute` - Submit workout ideas
- `/changelog` - Version history
- `/about` - About the project

## Stack

- React 19
- Vite 7
- Tailwind CSS 4
- Recharts
- Radix UI
- Sonner
- Workbox
- Vercel Analytics
- i18next (FR/EN)

## Contributing

This project is developed in collaboration with AI (Claude Code).

Issues and suggestions welcome on [GitLab](https://gitlab.com/andmusic/zoned/-/issues).

## License

MIT

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-01-26

### Added

#### Export System
- Export workouts to 4 formats from detail page
- **ICS (Calendar)**: Add workout to Google Calendar, Apple Calendar, Outlook
- **PNG (Image)**: High-resolution export with full workout card (name, description, timeline, zones, blocks)
- **PDF (Document)**: Printable document with workout structure, coaching tips, and common mistakes
- **Garmin FIT**: Native workout file for Garmin devices with HR zones and step intensity

#### UI Components
- Dropdown menu component (Radix-based)
- Date/time picker for calendar export
- Exportable workout card with complete workout summary

### Changed

- Footer now displays dynamic workout and category counts
- Added GitLab repository link in footer

### Chores

- Clean up TypeScript cache files

## [0.1.0] - 2026-01-26

### Added

#### Core Application
- Initial React 19 + Vite + Tailwind 4 project setup
- 6-zone training system with scientific basis (Z1-Z6)
- 136 workout templates across 11 categories
- Multi-page routing: Home, Library, Workout Detail, Settings, Favorites
- Docker deployment configuration

#### Workout Library
- Categories: recovery, endurance, tempo, threshold, VMA, long run, hills, fartlek, race pace, mixed, assessment
- Assessment category with Cooper test, VAMEVAL, half-Cooper, and Léger-Boucher tests
- Norwegian double threshold sessions
- Bangsbo 10-20-30 method sessions
- Billat 30/30, SET and NRRs VMA sessions
- Yasso 800s, Rosario, and cutdown sessions
- Long regeneration and yoga-run sessions

#### Visualization
- Interactive timeline showing workout structure
- Zone distribution display
- Intensity bar indicator
- Support for complex interval patterns (e.g., 2x12x30s)

#### Personalization
- Zone calculator with FCmax/VMA inputs
- Personal zone preferences with localStorage persistence
- Favorites system with dedicated /favorites page
- Advanced filters: terrain type, target system, favorites only

#### Discovery
- Workout recommendation quiz based on goals and constraints
- Pace calculator for target times
- Workout of the Day with deterministic daily selection

#### Internationalization
- French-first with full English support
- All workout blocks translated in both languages
- Language detection via localStorage, navigator, or HTML tag

#### UI/UX
- shadcn/ui components with Radix primitives
- Lucide icons throughout (replaced emoji icons)
- CategoryIcon components for visual categorization
- Tap-to-reveal tooltips for mobile accessibility

### Fixed

- Multi-set interval pattern parsing (2x12x30s)
- Quiz fallback results sorted by closest duration
- Message display when no exact duration match in quiz
- Duration estimates using typicalDuration field
- French titles in visualization translations
- Category type mappings (vma → vma_intervals)

### Documentation

- README with project overview and commands
- Docker deployment instructions

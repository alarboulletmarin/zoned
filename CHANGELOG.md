# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-01-31

### Added

#### Educational Content
- Knowledge hub with 12 bilingual articles on training principles
- Glossary page with 50+ training terms and definitions
- Educational tips system with 69 contextual tips (shown on homepage and workout details)
- New articles: zones, testing-vma, warmup, recovery, nutrition, faq, periodization, supercompensation, tapering, polarized-training, progressive-overload, consistency

#### Random Workout
- Random workout button in header with dice icon
- Random workout CTA card on homepage
- Quick access to discover new workouts

#### Settings & Personalization
- Settings page with theme and unit preferences
- Color blind accessible palettes (deuteranopia, protanopia, tritanopia)
- Unit conversion between metric (km/h, min/km) and imperial (mph, min/mi)
- Pace and zone calculators with unit support

#### Library Enhancements
- View mode selector (grid/list views)
- Command palette search with Cmd+K / Ctrl+K
- 14 new workout sessions (150 total)
- Mobile filter button with active filter badge

#### UI/UX Improvements
- Compact mobile layout for homepage CTAs (Quiz and Random side by side)
- Tips banner without dismiss button (always visible)
- Animated navigation underline
- Heart bounce animation on favorite button
- View transitions between pages
- Responsive header with intermediate breakpoint
- Zone detail modal with clickable workout links

#### SEO & Analytics
- Comprehensive SEO infrastructure with meta tags
- Structured data (JSON-LD) for workouts
- Vercel Analytics integration
- About page with project information

### Changed

- Homepage CTAs use compact 2-column grid layout on mobile
- Replaced lucide-react with inline SVG icons (65 icons)
- Zone colors now use CSS variables for theming
- Personalized zones displayed on workout detail page
- Quiz results integrate with library filters

### Fixed

- Language detection handles locale variants (en-US, fr-CA)
- Glossary cards re-render on language change
- Mobile menu closes on route change
- Interval parsing improved for recovery zone extraction
- Duration calculations aligned between timeline and metadata
- PDF export uses async blob download
- Various modal/dialog background fixes
- Minimum filter duration lowered to 10 minutes

### Performance

- Lazy-load articles and glossary data
- Code-splitting for workout data by category
- Main bundle reduced from 1MB to 88KB gzip
- Dead code elimination

## [0.1.2] - 2026-01-26

### Added

#### Branding
- Project logo with pulse design integrated in header
- Optimized favicon variants (16x16, 32x32, 180x180, 192x192, 512x512)
- SVG import support for logo assets

#### UI Components
- Empty state component with i18n support
- Scroll-to-top floating button
- Loading spinner on export button for better feedback

#### Accessibility
- Keyboard shortcuts for search functionality
- ARIA modal attributes to filter drawer for screen readers
- ARIA label to search input for accessibility
- Increased touch targets in mobile header for easier interaction

#### Mobile Experience
- Modal filter system with apply/cancel actions on mobile
- Search bar moved outside filter drawer for better discoverability

#### User Experience
- Quick wins UI improvements integrated in library
- Real-time system theme preference listener
- Automatic scroll to top on page navigation

### Changed

- Renamed mobile filter drawer to "Filters" for clarity

### Fixed

#### Mobile Layout
- Prevented mobile overflow in workout detail header
- Prevented mobile overflow by reorganizing header actions

#### Internationalization
- Translated workout not found error message
- Added translations for modal filter actions (apply/cancel)

### Chores

- Ignore Serena config directory in version control

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

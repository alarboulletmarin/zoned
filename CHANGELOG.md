# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2026-03-20

### Added

- Data export and import in settings: backup all your data (favorites, plans, settings, zones) as JSON, restore from a backup file
- Storage persistence warning: first-time dialog when saving favorites or creating a plan, explaining that data is stored locally
- Privacy-first positioning: visible badges on homepage hero, privacy note in footer, dedicated privacy section in settings
- Ko-fi support link in footer and about page
- SEO: H1 heading, intro text and JSON-LD WebApplication schema on Zones and Pace calculator pages
- SEO: 53 new routes in sitemap — collections, prebuilt plans, calculators, methodology, guides (318 → 371 URLs)
- SEO: JSON-LD WebApplication schema on all 9 calculator pages
- SEO: BreadcrumbList JSON-LD on Article, Collection and Prebuilt Plan detail pages
- SEO: enriched Article JSON-LD with author, publisher, datePublished and dateModified
- SEO: updated default OG image with current stats (200 workouts, 9 calculators, "No Account Needed")
- SEO: prerender English pages and hreflang alternate links in sitemap
- About page redesigned with personal section, updated stats, contact links (Strava, GitLab)
- Custom workout builder: create, edit, save and export your own workouts with warm-up, main set and cool-down blocks
- Custom workouts integrated into library, search, favorites and training plans
- FIT export guide: step-by-step transfer instructions modal after Garmin export, with OS detection and non-Garmin alternatives
- Quiz improved from 3 to 5 questions: added experience level and weakness, now shows 6 results
- Cross-training activities (strength, cycling, swimming, yoga, rest) available in plan workout panel as regular sessions

### Changed

- README updated to reflect 200 workouts, 9 calculators, privacy-first philosophy, and current feature set

### Fixed

- Date inputs on mobile: larger touch targets (44px minimum), text-base font to prevent iOS zoom, locale-aware lang attribute, "Start now" / "Choose a date" toggle on free plan creation

## [0.2.1] - 2026-03-19

### Added

#### Workouts
- 19 new science-based workouts to reach 200 total: Norwegian 4×4 (Helgerud), Tabata, R-Pace (Daniels), CV Tinman, Over/Under, Canova Progressive, Hanson Strength Run, Tempo with surges, heat acclimatization, Train Low, DFA alpha1, cardiac drift durability, ultra time-on-feet, broken race, Canova extensive, plyometric circuit, Hudson 1-2-3-2-1, 3-min all-out test, lactate step test

#### Glossary
- 2 new glossary terms: Critical Velocity (CV) and Surge, with auto-linking in workout descriptions

#### Plans
- Interactive calendar view for training plans with week × 7 days grid, mobile week navigation, and colored phases
- Native drag & drop to move sessions between days (desktop and mobile with visual ghost)
- Workout library side panel to add sessions via drag (desktop/tablet) or tap (mobile) with search and category filters
- Free plan mode: create a blank plan (name + week count) and place workouts manually
- Plan import/export as JSON to share or backup your plans
- Delete sessions from both calendar and list views with trash button
- 8 pre-built ready-to-use plans: 5K beginner/intermediate, 10K beginner/intermediate, half-marathon, marathon, base building, return from injury
- Optional start/end dates on free and pre-built plans, editable at creation and afterwards
- Enhanced statistics section with 8 metrics, weekly volume chart, zone distribution (Z1-Z6), target system breakdown, and collapsible accordion

#### UX
- Inline "+" buttons in each day cell (mobile) and each week (list) to quickly add sessions
- Contextual hints in library panel: drag, click or tap depending on display mode
- Click on a session in calendar view navigates to workout detail (with "Back to plan" link)
- Compact mobile layout for plan creation cards (no scroll) and prebuilt plan grid (2×4)

### Changed

- Quiz and plan creation refactored to full-viewport steps (one question per view, no scrolling on mobile)
- Delete plan button replaced by action menu (export JSON + delete)
- Homepage section spacing reduced for better visual rhythm
- Background preloading of sidebar pages for instant navigation
- 5-plan limit indicator with hidden creation buttons when limit is reached

### Fixed

- Dark mode compatibility: timeline colors, segments without zones, and recovery sessions
- Mobile navigation flash eliminated by deferring sidebar close to after page render
- Fixed session index in sorted list view (delete/replace targeted the wrong element)

## [0.2.0] - 2026-03-19

### Added

- Methodology page: scientific foundations of the 6-zone system with 8 researchers, 6 studies (PubMed links), reference books, blogs and podcasts
- New editorial design inspired by Google Stitch: homepage with asymmetric hero, bento grid stats, cards with zone-colored top border
- Workout detail page: bento header with metrics grid (duration, difficulty, target system, environment), prominent export buttons, favorite in top right
- Redesigned Workout of the Day: bento layout with large duration, coaching tips in right column, fully clickable card
- Enlarged session timeline visualization (h-40/h-56) with zone labels on hover and better segment contrast

### Changed

- Replaced zone-stripe (left colored border) with colored top borders on all cards (workouts, collections, articles)
- Mobile responsive: reduced sizes on mobile for hero, stats, buttons and workout of the day
- Removed redundant Details card from workout page sidebar

### Fixed

- Display recovery between repetitions in phase details (3x30s, fartlek, etc.) without redundancy with description
- Inter-series rest indication for multi-set blocks (e.g. 2x(10x 45s VO2max / 15s recovery) → ~3 min jog between sets)
- Missing 'Mythic Workouts' collection on homepage (missing accent in slug)
- Segments without zone (drills, transitions) invisible in timeline — fallback color fixed

## [0.1.7] - 2026-03-18

### Added

- Wikipedia-style auto-linking: all 200+ glossary terms and 12 articles become clickable throughout the entire app with hover previews
- Automatic links to learning articles (periodization, supercompensation, warm-up…) with inline preview
- Unified preview popover for desktop and mobile: close button, link to full page
- Callout blocks in all 12 articles: tips, warnings, key takeaways and statistics
- Reading progress bar and table of contents (desktop sidebar, mobile dropdown) in articles

### Changed

- Replaced dangerouslySetInnerHTML in articles with secure React components

### Fixed

- Back button on glossary pages now returns to the previous page (not always to the glossary)
- Mobile button touch targets enlarged to 44px (Apple HIG standard) without visual overflow
- Comprehensive French accent and spelling corrections across the entire application
- Improved footer and sidebar layout (alignment, responsive)

## [0.1.6] - 2026-03-17

### Added

#### Glossary
- 3 new glossary categories: Biomechanics (12 terms), Injuries & Prevention (10 terms), Nutrition (17 terms)
- 39 new bilingual glossary terms covering stride mechanics, common running injuries, and sports nutrition
- Nutrition terms include: isotonic drinks, maltodextrin, glucose-fructose ratio, BCAAs, caffeine, vitamin D, iron deficiency

#### Calculators
- New `/calculateurs` hub page with 7 running calculator tools
- Race equivalence calculator (predict times across distances)
- Age-graded performance calculator (compare performances across ages)

#### SEO
- Post-build prerendering of all 318 pages via Puppeteer for non-JS crawlers
- Enriched JSON-LD structured data on workout pages (ExercisePlan + BreadcrumbList)
- Enriched JSON-LD on glossary term pages (DefinedTerm + BreadcrumbList)
- WebSite schema with SearchAction on homepage (enables Google sitelinks search box)
- CollectionPage and DefinedTermSet schemas on listing pages
- SEOHead component now supports multiple JSON-LD blocks
- New `build:seo` script combining build + sitemap generation + prerendering

#### Features
- Copy link button on workout detail page

### Fixed

- Sitemap generator now correctly reads glossary `.ts` files (was looking for `.json`, finding 0 terms)
- Sitemap expanded from 175 to 318 URLs (added guides, collections, calculators, all glossary terms)
- Workout of the day: hash-based seed for stable selection across catalog changes
- Workout of the day: selection no longer shifts when workouts are added/removed
- Plan generation: limit check now runs before generation instead of after

## [0.1.5] - 2026-03-14

### Added

#### Navigation
- New collapsible sidebar navigation (Notion/Linear-style) with 3 states: expanded, collapsed, mobile sheet
- Minimal top bar with logo, centered search, and quick actions
- Sidebar with grouped sections (Training, Discover, Tools) and tooltips in collapsed mode
- Smooth collapse/expand animation with unified CSS transitions
- Sidebar state persistence (collapsed/expanded) in localStorage

#### Community Contribution
- Community contribution form with two modes (quick idea / full workout)
- 4-step wizard to create detailed workouts with real-time preview
- Automatic generation of pre-filled GitLab issues from the form
- GitLab issue templates for workout submissions (quick idea and detailed)
- Contribution guide (CONTRIBUTING.md) with conventions and instructions

#### Training Plans
- Personalized training plan generator with multi-step wizard, phase management, and progressive volume
- Training plan export to PDF and ICS (calendar)
- Training plan CTA on homepage with adaptive behavior (links to create or list)
- Trail race support: short trail (30km), trail (60km), ultra trail (100km) with terrain-adapted training
- Plan statistics overview: total sessions, hours, avg/week, key sessions, session type distribution bar
- Swap/replace any session in a plan with another workout from the library (search + type filters)
- ICS export dialog: choose your training days and long run day before calendar export
- Enriched PDF export with full workout blocks (warm-up, main set, cool-down, coaching tips)
- Enriched ICS export with full session details and coaching tips
- Pace target notes generated for tempo/threshold/VO2max/long run sessions
- Elevation notes for long run sessions when race has elevation gain
- Delete plans directly from the plans list page with confirmation dialog
- Volume adjustment indicator on session duration (explanatory tooltip and percentage)

#### Guides
- 3 bilingual practical guides: runner's nutrition, race preparation, and warm-up routines

#### Library
- 17 new scientifically-grounded workouts (181 total)
- 4 new assessment tests: Cooper, Conconi, Yasso 800s, MAF Maffetone
- 5 new fartleks: Kenyan 1/1, descending, long distance 2/1, ascending ladder, whistle
- 4 new recovery sessions: barefoot, aqua jogging, joint mobility, nature regeneration
- 4 new hill sessions: explosive sprints, progressive gradient, rolling hills, downhill technique
- Infinite scroll on library replacing "Show more" button

#### Features
- Changelog page (`/changelog`) with version timeline and "What's New" indicator
- Custom 404 page with navigation suggestions
- Toast notifications for action feedback (exports, favorites, etc.)
- Error Boundary component for graceful error handling

### Changed

- Replaced horizontal navigation with responsive vertical sidebar
- Removed theme/language toggles from sidebar (already present in top bar)
- Reduced logo size in top bar for better visual balance
- Collections pages unified with flat minimal design
- Dynamic imports for all pages (lazy loading)
- Improved zone calculator validation
- Pagination added to library
- Removed day-of-week assignment: runners are free to choose their own training days
- Sessions displayed by priority (long run → key → endurance → recovery) without day labels

### Fixed

- Center search bar and logo in top bar (correct alignment on mobile, tablet and desktop)
- Center icons in collapsed sidebar (removed ghost gap)
- Fixed "Base — Base" duplicate label in week headers (phase shown twice)
- Duration calculation now uses actual workout blocks instead of inaccurate `typicalDuration` metadata
- Trail workouts no longer selected for road races (even with elevation)
- Main set duration scaled by volume %, warm-up/cool-down kept at full duration
- Improved variety in easy/recovery session selection
- Contextual back navigation: returns to plan (not library) when coming from a plan
- Fixed spacing in plan weekly view sessions

## [0.1.4] - 2026-02-13

### Added

#### Collections
- 12 curated thematic workout collections (beginner, anti-stress, injury comeback, pre/post-race, 5K/10K/half/marathon/ultra goals, legendary workouts, VO2max progression)
- Collections listing page with responsive grid layout
- Collection detail page with gradient hero, step numbering for progression paths
- Featured collections section on homepage
- Navigation link in header (desktop + mobile)

#### PWA
- Progressive Web App support with offline caching via Workbox
- Service worker with auto-update strategy
- App manifest with icons and theme colors

#### Workout Detail
- Dynamic nutrition recommendations based on workout duration and intensity
- Hydration guidelines adapted to session type
- Recovery recommendations with timeline and tips

### Changed

- Header actions consolidated with grid layout and dropdown menu
- Updated README with new features and tech stack

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

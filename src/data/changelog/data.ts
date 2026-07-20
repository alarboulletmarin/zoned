import type { ChangelogVersion } from "./types";

export const changelogVersions: ChangelogVersion[] = [
  {
    version: "0.7.2",
    date: "2026-07-20",
    changes: {
      added: [
        {
          text: "Categories sur les semaines enregistrees (heritees des semaines pre-construites), avec badge et filtres sur Mes semaines",
          textEn: "Categories on saved weeks (inherited from prebuilt weeks), with a badge and filter chips on My weeks",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Duplication d'une semaine depuis la liste (suivi de completion remis a zero sur la copie)",
          textEn: "Duplicate a saved week from the list (completion tracking reset on the copy)",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Partage d'une semaine par lien encode compact, avec page d'apercu et « Ajouter a mes semaines »",
          textEn: "Share a week as a compact encoded link, with a preview page and \"Add to my weeks\"",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Import d'une semaine depuis un fichier JSON sur Mes semaines",
          textEn: "Import a week from a JSON file on My weeks",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
      ],
      changed: [
        {
          text: "Actions des cartes de semaine regroupees dans un menu ; en-tete de la page semaine reorganise autour d'un badge categorie",
          textEn: "Week card actions grouped into an overflow menu; week page header reworked around a category badge",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Les seances multiples d'un meme jour comptent dans les stats hebdo et s'empilent dans le rythme de la semaine",
          textEn: "Multiple sessions on the same day now count in weekly stats and stack in the rhythm chart",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Les semaines dupliquees ou importees apparaissent immediatement, sans rafraichir la page",
          textEn: "Duplicated or imported weeks appear immediately without a page refresh",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.7.1",
    date: "2026-07-20",
    changes: {
      added: [
        {
          text: "Bouton « Partager sur Strava » (copie en un clic) sur les pages seance",
          textEn: "\"Share on Strava\" copy-to-clipboard button on session pages",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Palette de commandes etendue a davantage de surfaces produit",
          textEn: "Command Palette extended to more product surfaces",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
      ],
      changed: [
        {
          text: "Page d'accueil reorganisee autour de la generation de plans : accroche orientee benefice, « Generer mon plan » en action principale, section Plans remontee juste apres les points d'entree",
          textEn: "Homepage reordered around plan generation: benefit-led hero copy, \"Generate my plan\" as primary CTA, Plans section moved right after the entry points",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Tableau de bord des plans : les plans termines sont separes des plans actifs",
          textEn: "Plans dashboard separates ended plans from active ones",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Grilles de cartes animees mobile-first (retour tactile, lift et glow au survol)",
          textEn: "Card grids gain mobile-first interactive motion (tap feedback, hover lift and glow)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Raccourcis clavier affiches selon le systeme (Ctrl sur Windows/Linux, Cmd sur macOS)",
          textEn: "Keyboard shortcut hints follow the OS (Ctrl on Windows/Linux, Cmd on macOS)",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Barre de navigation : bascule en menu hamburger sous 1024 px, plus aucun debordement aux largeurs intermediaires",
          textEn: "Top bar collapses to the hamburger below 1024px, no more overflow at mid-size viewports",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Cartes calculateurs de la page d'accueil a hauteur egale, lien d'ouverture ancre en bas",
          textEn: "Homepage calculator cards share equal heights, explore link pinned to the bottom",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Serie de correctifs issus de l'audit mobile-first (#96-#106)",
          textEn: "Mobile-first audit issues resolved (#96-#106)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "En-tetes de tableau colles a leur carte plutot qu'au viewport",
          textEn: "Sticky table headers pin inside their card instead of the viewport",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      performance: [
        {
          text: "Police Space Grotesk auto-hebergee, chaine Google Fonts bloquante supprimee",
          textEn: "Space Grotesk self-hosted, render-blocking Google Fonts chain removed",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Bundle d'entree scinde : locales, react-dom et palette de commandes en chunks separes",
          textEn: "Entry bundle split: locales, react-dom and command palette in separate chunks",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Chargement de la bibliotheque differe hors de la fenetre LCP, toutes les animations composited",
          textEn: "Library fetch deferred out of the LCP window, all animations composited",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Budgets de performance Lighthouse en CI, CLS du footer corrige sur les pages courtes",
          textEn: "Lighthouse CI performance budgets, footer CLS fixed on short pages",
          category: "Performance",
          categoryEn: "Performance",
        },
      ],
    },
  },
  {
    version: "0.7.0",
    date: "2026-06-03",
    changes: {
      added: [
        {
          text: "Mode « Ma semaine » : generateur de semaine polarisee 80/20 qui compose 3 a 6 seances complementaires, avec un editeur de semaine (board 7 jours, jauge d'equilibre 80/20, rythme de la semaine) et une generation automatique animee",
          textEn: "« My week » mode: a polarised 80/20 week generator composing 3-6 complementary sessions, with a week editor (7-day board, 80/20 balance gauge, week rhythm) and an animated automatic generation",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Semaines pre-construites : semaines types sourcees (base aerobie 80/20, bloc seuil, affutage VO2, recuperation, gros volume, reprise douce) avec un contenu pedagogique « pourquoi cette semaine » et « pourquoi cette seance »",
          textEn: "Pre-built weeks: sourced template weeks (aerobic base 80/20, threshold block, VO2 sharpening, recovery, high volume, easy return) with pedagogical « why this week » and « why this session » notes",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Page « Tirer une seance » : tirage aleatoire d'une seance selon des filtres (discipline, zones, duree, niveau) avec une animation de recherche",
          textEn: "« Draw a session » page: random session draw from filters (discipline, zones, duration, level) with a searching animation",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
      ],
      changed: [
        {
          text: "La page des semaines (/weeks) et sa creation s'alignent sur le design des plans (cartes, badges, mini-stats, boutons Voir/Exporter)",
          textEn: "The weeks page (/weeks) and its creation flow now match the plans design (cards, badges, mini-stats, View/Export actions)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Editeur de semaine mobile-first : bandeau resume au-dessus du board, reglages toujours accessibles, board jamais comprime",
          textEn: "Mobile-first week editor: summary strip above the board, settings always accessible, board never compressed",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Pages Articles et Collections alignees sur la mise en page du hub Calculateurs",
          textEn: "Learn and Collections pages aligned with the Calculators hub layout",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Page de detail d'une seance aeree pour une meilleure lisibilite mobile",
          textEn: "Session detail page given more breathing room for better mobile readability",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "i18n FR/EN et SEO finalises sur les pages semaine",
          textEn: "FR/EN i18n and SEO finalised on the week pages",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      fixed: [
        {
          text: "Le filtre de duree de la bibliotheque ne masque plus les seances longues",
          textEn: "The library duration filter no longer hides long sessions",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "La seance tiree est conservee lors de la navigation",
          textEn: "The drawn session is kept across navigation",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Liens de pied de page de la sidebar : plus de debordement sur mobile (grille 2x2)",
          textEn: "Sidebar footer links: no more overflow on mobile (2x2 grid)",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.6.1",
    date: "2026-05-28",
    changes: {
      added: [
        {
          text: "Dialog de partage avec carrousel style Strava et 17 templates de seance (export PNG bilingue)",
          textEn: "Share dialog with Strava-style template carousel and 17 workout templates (bilingual PNG export)",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Carte OG editoriale avec stats live au format carre, optimisee pour les previews sociales",
          textEn: "Editorial OG share card with live stats in a square format optimised for social previews",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "SEO : enrichissement JSON-LD sur toutes les pages et ajout de llms.txt pour les crawlers IA",
          textEn: "SEO: enriched JSON-LD across all pages and added llms.txt for AI crawlers",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Migration vers le meta hoisting natif de React 19 (remplace react-helmet-async)",
          textEn: "React 19 native meta hoisting (replaces react-helmet-async)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Generateur de sitemap reecrit et prerender durci pour React 19",
          textEn: "Sitemap generator rewritten and prerender hardened for React 19",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      changed: [
        {
          text: "CTA hero de la home bascule sur 'Voir mes plans' quand l'utilisateur a deja des plans sauvegardes",
          textEn: "Home hero CTA swaps to 'View my plans' when the user has saved plans",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Strategie de deploiement : Vercel build au runtime au lieu de servir un dist/ commite",
          textEn: "Deploy strategy: Vercel builds at runtime instead of serving a committed dist/",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Dependance react-helmet-async supprimee (bundle allege)",
          textEn: "Dropped react-helmet-async dependency (lighter bundle)",
          category: "Performance",
          categoryEn: "Performance",
        },
      ],
      fixed: [
        {
          text: "Toast positionne top-center sur mobile pour ne plus chevaucher les boutons d'action",
          textEn: "Toast pinned top-center on mobile so it no longer overlaps action buttons",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Vercel SPA rewrite /(.*) vers / pour que les routes client ne renvoient plus 404",
          textEn: "Vercel SPA rewrite /(.*) → / so client routes stop returning 404",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Share sur iOS Safari : Promise<Blob> dans ClipboardItem et title retire du native share (Instagram)",
          textEn: "Share on iOS Safari: Promise<Blob> in ClipboardItem and title dropped from native share (Instagram)",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "PWA : skipWaiting et clientsClaim forces pour que mobile recoive le contenu frais immediatement",
          textEn: "PWA: skipWaiting + clientsClaim so mobile clients receive fresh content immediately",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Accessibilite : ordre des headings, aria labels et contraste WCAG AA ajustes",
          textEn: "Accessibility: heading order, aria labels and WCAG AA contrast tweaks",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Learn page : la grille stagger se remonte au changement de filtre pour que les cards restent visibles",
          textEn: "Learn page: stagger grid remounts on filter change so cards stay visible",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Build : sitemap genere avant vite build pour qu'il soit shippe dans dist/",
          textEn: "Build: sitemap generated before vite build so it ships in dist/",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Prerender ne tombe plus dans une boucle de retry sur Vercel (HTML capture utilise au lieu de waitForFunction)",
          textEn: "Prerender no longer hits a retry storm on Vercel (trusts captured HTML instead of waitForFunction)",
          category: "Performance",
          categoryEn: "Performance",
        },
      ],
    },
  },
  {
    version: "0.6.0",
    date: "2026-05-27",
    changes: {
      added: [
        {
          text: "Refonte editoriale de la home : journal d'entrainement, sections pleine largeur, sources de chercheurs reelles, FAQ en accordeon et primitives de cards reutilisables",
          textEn: "Editorial landing rewrite: home redesigned as a training journal with full-bleed sections, real researcher sources, accordion FAQ, and reusable card primitives",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Citation rotative quotidienne sur la home, signee par de vrais athletes et coachs (deterministe selon le jour)",
          textEn: "Daily rotating quote on home from real athletes & coaches (deterministic by day)",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Nouvelle navigation haute avec menus deroulants au survol et menu mobile redessine",
          textEn: "Top navigation rework with hover dropdowns and a redesigned mobile sheet",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Sidebar avec groupes repliables et etat ouvert/ferme conserve d'une session a l'autre",
          textEn: "Sidebar with collapsible groups and persisted open/closed state across sessions",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Footer global promu depuis la landing : switcher FR/EN visible sur mobile, layout 3 colonnes compact",
          textEn: "Global Footer promoted from the landing page (FR/EN switcher visible on mobile, compact 3-column layout)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "README open-source avec stats GitHub live (etoiles, issues, dernier commit) et badge de version",
          textEn: "Open-source README with live GitHub stats (stars, issues, last commit) and version badge",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
      changed: [
        {
          text: "Header editorial propage a l'ensemble de l'app en 6 vagues : pages calculateurs, pages hub (vague 1), pages article-like (vague 3), pages detail (vague 4), pages utilitaires (vague 5), formulaires et builders",
          textEn: "Editorial header propagated across the whole app in 6 waves: calculator pages, hub pages (wave 1), article-like pages (wave 3), detail pages (wave 4), utility pages (wave 5), forms/builders",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Fiche seance refondue avec divulgation progressive : ton editorial, moins de bruit visuel",
          textEn: "Workout detail page refactored with progressive disclosure (editorial tone, less visual noise)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Passe couleur sur la home : hero plus marque, cards signalees par accents, bordures decoratives supprimees",
          textEn: "Home colour pass: punchier hero, signalled cards, decorative borders removed",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Hub calculateurs regroupe en 3 sections avec layout aere en colonne unique sur mobile",
          textEn: "Calculators hub grouped into 3 sections with an airy single-column layout on mobile",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Atomes de la HomePage extraits et reutilises sur la LibraryPage pour cohesion visuelle",
          textEn: "HomePage atoms extracted and reused on LibraryPage for consistency",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Compaction mobile de la home : §04 et §05 alignes sur le pattern de grille de §06 ; motion subtile, points finaux abandonnes sur les titres, em dashes generalises",
          textEn: "Home mobile compaction: §04/§05 now match the §06 grid pattern; subtle motion polish, trailing periods dropped on section titles, em dashes adopted",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Le compteur de seances sur la page About inclut maintenant les sessions velo et natation (pas seulement le running)",
          textEn: "About workouts count now includes cycling + swimming sessions (not only running)",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Stats live de la page About cablees sur les vrais compteurs du catalogue",
          textEn: "About page live stats wired to the actual catalogue counts",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Layout 3 colonnes du footer ne casse plus sur les ecrans mobiles etroits",
          textEn: "Footer 3-column layout no longer breaks on narrow mobile screens",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.5.4",
    date: "2026-05-11",
    changes: {
      added: [
        {
          text: "Nouvelle categorie 'Trail' avec 10 seances (TRL-001 → TRL-010) basees sur protocoles Koop / Vernillo / Uphill Athlete : sprints en cote, VMA cote, force-endurance, tempo en montee prolongee, descente technique, endurance en montee soutenue, endurance vallonnee, sortie longue trail, back-to-back jour 1 et jour 2",
          textEn: "New 'Trail' category with 10 sessions (TRL-001 → TRL-010) based on Koop / Vernillo / Uphill Athlete protocols: hill sprints, VO2max hills, power hills, sustained tempo climb, controlled downhill, sustained climbing endurance, rolling endurance, specific long run, back-to-back day 1 and 2",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Champs D+, pente et terrain sur les blocs de seance (4 types de terrain : route, sentier roulant, sentier technique, montagne)",
          textEn: "elevationGainM, gradientPercent and terrainType fields on workout blocks (4 terrain types: road, runnable trail, technical trail, mountain)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Mini profil altimetrique SVG sur les fiches seance et les cards Trail avec detection intelligente des oscillations (montee/descente repetees)",
          textEn: "Mini elevation profile SVG on workout detail pages and Trail cards with smart oscillation detection for hill repeats",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Helper workoutMetrics : calcul du D+, D-, pente moyenne, terrain dominant et densite verticale (m/km)",
          textEn: "workoutMetrics helper: computes D+, D-, average gradient, dominant terrain and vertical density (m/km)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Enrichissement D+/pente/terrain sur les 15 seances 'Cotes' et 10 autres seances vallonnees (Endurance vallonnee, Sortie longue trail, Ultra time-on-feet, Tempo vallonne, Allure trail, Seuil vallonne...)",
          textEn: "D+/gradient/terrain backfill on all 15 'Hills' workouts and 10 other hilly endurance workouts (rolling endurance, trail long run, ultra time-on-feet, hilly tempo, trail race pace, hilly threshold...)",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Bandeau Trail sur les fiches seance : D+ total, D- total, densite verticale, pente moyenne, terrain dominant",
          textEn: "Trail stats banner on workout detail pages: total D+, total D-, vertical density, average gradient, dominant terrain",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Badges D+ et terrain sur les cards de la bibliotheque (Grid + Focus), D+ chiffre sur les vues Compact et Liste",
          textEn: "D+ and terrain badges on library cards (Grid + Focus), numeric D+ on Compact and List views",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Generateur de plan : priorite +100 pour les seances 'trail' lors d'une course trail_short / trail / ultra",
          textEn: "Plan generator: +100 priority boost for 'trail' workouts when race is trail_short / trail / ultra",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Quiz 'cotes' inclut maintenant les seances trail (en plus de la categorie hills)",
          textEn: "Quiz 'hills' environment now includes trail workouts in addition to hills category",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Generateur de parcours : detecte category=trail et override surface, terrain et target D+ depuis les metriques de la seance",
          textEn: "Route generator: detects category=trail and overrides surface, terrain preference and elevation target from workout metrics",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Durees explicites parsables ajoutees aux phases de recuperation des seances de cotes et mixtes",
          textEn: "Explicit parsable durations added to recovery phases of hills and mixed workouts",
          category: "Seances",
          categoryEn: "Workouts",
        },
      ],
      fixed: [
        {
          text: "Scroll infini bibliotheque bloque a 24 elements quand le sentinel se monte apres isLoading",
          textEn: "Library infinite scroll stuck at 24 items when sentinel mounts after isLoading",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "D+/km et pente moyenne plus honnetes : prennent en compte tout l'echauffement et le retour au calme (distance estimee via duree × allure de zone)",
          textEn: "D+/km and average gradient more honest: include warmup and cooldown blocks (distance estimated via duration × zone-pace)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "D- (denivele negatif) affiche pour les seances de descente ou oscillantes (cotes avec recuperation en descente)",
          textEn: "D- (elevation loss) displayed for downhill or oscillating sessions (hill repeats with descending recovery)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Bandeau 'Cotes requises' supprime quand les metriques Trail sont visibles (suppression de la redondance)",
          textEn: "'Hills required' environment label removed when trail metrics are displayed (deduplication)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Descentes HIL-015 zonees en Z2 pour distinguer visuellement montees (orange) et descentes (vert) dans la timeline",
          textEn: "HIL-015 descents zoned Z2 (instead of Z3) so SessionTimeline visually distinguishes climbs (orange) from descents (green)",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Recovery 'Remontee trottee souple' de TRL-005 affiche maintenant sa duree explicite (12 min)",
          textEn: "TRL-005 recovery 'Remontee trottee souple' now displays its explicit duration (12 min)",
          category: "Seances",
          categoryEn: "Workouts",
        },
      ],
    },
  },
  {
    version: "0.5.3",
    date: "2026-05-10",
    changes: {
      added: [
        {
          text: "Wizard de plan : sauvegarde automatique du brouillon avec banniere Reprendre / Repartir de zero au reload",
          textEn: "Plan wizard autosave with Resume / Start fresh banner on reload",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Undo/Redo dans l'editeur de seance avec raccourcis Cmd+Z / Shift+Cmd+Z",
          textEn: "Undo/Redo in workout builder with Cmd+Z / Shift+Cmd+Z keyboard shortcuts",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Hooks reutilisables : useZoneColors (multi-discipline), useUndoRedo, usePlanDraft",
          textEn: "Reusable hooks: useZoneColors (multi-discipline), useUndoRedo, usePlanDraft",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Composants ResponsiveTable (table desktop -> cards mobile) et PageContainer pour des layouts coherents",
          textEn: "ResponsiveTable component (desktop table → mobile cards) and PageContainer layout primitive",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Skeletons composites contextuels (WorkoutCard, PlanWeek, Table, Article) avec effet shimmer",
          textEn: "Contextual skeleton composites (WorkoutCard, PlanWeek, Table, Article) with shimmer effect",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Variants d'EmptyState : no-results, not-started, error, offline",
          textEn: "EmptyState variants: no-results, not-started, error, offline",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Breakpoint Tailwind tablet: (900px) et variables CSS pour les zones cycling/swimming + accents par discipline",
          textEn: "Tailwind tablet: breakpoint (900px) plus CSS vars for cycling/swimming zones and discipline accents",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      changed: [
        {
          text: "HomePage : animation des mots accent migree vers framer-motion (rotation plus fluide, suppression du jank setTimeout)",
          textEn: "HomePage hero accent words migrated to framer-motion (smoother rotation, no setTimeout jank)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Recherche /library + /glossary : non-bloquante via useDeferredValue (60 fps en tapant)",
          textEn: "Library and glossary search runs non-blocking via useDeferredValue",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Exports PDF / PNG / FIT / ICS : toast.loading durant la generation",
          textEn: "PDF / PNG / FIT / ICS exports show toast.loading during generation",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Sidebar : 'Creer' -> 'Creer une seance' pour plus de clarte",
          textEn: "Sidebar entry 'Create' → 'Create workout' for clarity",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Touch targets WCAG : boutons icon-* atteignent 44x44 px sur les devices tactiles",
          textEn: "WCAG touch targets: icon buttons reach 44×44 px on coarse-pointer devices",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "index.css scinde en 5 modules focused (tokens / themes / palettes-a11y / animations / overrides)",
          textEn: "index.css split into 5 focused modules (tokens / themes / palettes-a11y / animations / overrides)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Tableaux scrollables : sticky thead; VMA et equivalence affichent des cards sur mobile",
          textEn: "Sticky thead on scrollable tables; VMA and race-equivalence tables render as cards on mobile",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Brouillon de plan ecrase au mount sous React Strict Mode (silent data loss)",
          textEn: "Plan draft was wiped on mount under React Strict Mode (silent data loss)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Couleurs hex cycling/swimming hardcodees migrees vers CSS vars (multisport-ready)",
          textEn: "Hardcoded cycling/swimming hex colors migrated to CSS vars (multisport-ready)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Auto-zoom iOS sur les inputs corrige architecturalement via pointer:coarse",
          textEn: "iOS input auto-zoom mitigated architecturally via pointer:coarse media query",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Logo 'Zoned' visible des la largeur tablette (md:inline) au lieu de >= 1024 px",
          textEn: "'Zoned' logo now visible from tablet width (md:inline) instead of ≥ 1024 px",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Suppression de Header.tsx orphelin (537 lignes, plus aucun importeur)",
          textEn: "Removed orphan Header.tsx (537 lines, no importers)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      performance: [
        {
          text: "Skeletons avec effet shimmer via react-loading-skeleton (~5 kB gz)",
          textEn: "Shimmer skeletons via react-loading-skeleton (~5 kB gz)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Pas de regression LCP : /library a 1572 ms, CLS 0.00",
          textEn: "No LCP regression: /library at 1572 ms, CLS 0.00",
          category: "Performance",
          categoryEn: "Performance",
        },
      ],
    },
  },
  {
    version: "0.5.2",
    date: "2026-05-10",
    changes: {
      added: [
        {
          text: "Hub nutrition sur /nutrition avec 14 sections vulgarisees (ratio 1:0.8, proteines 1,8 g/kg, supplements classes AIS A-D, crampes, chaleur, coureuses, 10 idees recues, FAQ)",
          textEn: "Nutrition hub at /nutrition with 14 beginner-friendly sections (1:0.8 carb ratio, protein 1.8 g/kg, AIS-classified supplements, cramps science, heat, female runners, 10 debunked myths, FAQ)",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "17 supplements classes selon le framework de l'Institut Australien du Sport (niveaux A a D) avec dose, timing et explication",
          textEn: "17 supplements ranked by Australian Institute of Sport framework (A through D) with dose, timing and rationale",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "10 idees recues demontees dans un accordeon interactif (fenetre 30 min, ratio 4:1, magnesium-crampes, cafe deshydrate, etc.)",
          textEn: "10 false beliefs dismantled in an interactive accordion (30-min window, 4:1 ratio, magnesium for cramps, coffee dehydrates, etc.)",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Entree 'Nutrition' dans la sidebar Apprendre, entre Articles et Glossaire",
          textEn: "'Nutrition' sidebar entry under Learn, between Articles and Glossary",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Nouveaux composants visuels : RatioGauge, MythBuster, ProteinTimingChart, GutTrainingTimeline, SupplementGrid avec badges AIS, CrampsScience, WomenInsightGrid, HeatGrid",
          textEn: "New visual primitives: RatioGauge, MythBuster, ProteinTimingChart, GutTrainingTimeline, SupplementGrid with AIS badges, CrampsScience, WomenInsightGrid, HeatGrid",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Recommandations proteines mises a jour : 1,4-2,2 g/kg/jour selon le volume d'entrainement (Witard 2025, Sports Medicine) — anciennement 1,2-1,8",
          textEn: "Protein recommendations updated: 1.4-2.2 g/kg/day based on training volume (Witard 2025, Sports Medicine) — previously 1.2-1.8",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Ratio glucose:fructose modernise : 1:0.8 au-dela de 60 g/h (Rowlands 2020) — anciennement 2:1",
          textEn: "Glucose:fructose ratio modernized: 1:0.8 above 60 g/h (Rowlands 2020) — previously 2:1",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Charge glucidique : 36-48 h a 10-12 g/kg (protocole moderne) — la methode 3 jours est obsolete",
          textEn: "Carb loading: 36-48 h at 10-12 g/kg (modern protocol) — 3-day method obsolete",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Demythification de la fenetre 30 min post-effort dans le calculator et le guide : vraie fenetre 4-6 h glycogene / 24-48 h proteines",
          textEn: "Post-effort recovery window debunked in calculator and guide: real window is 4-6 h glycogen / 24-48 h protein, not 30 min",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Le ratio 4:1 glucides:proteines en recuperation est un mythe (Margolis 2021) : l'effet apparent vient des calories ajoutees",
          textEn: "4:1 carb:protein recovery ratio noted as myth (Margolis 2021): the apparent benefit comes from added calories",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
      fixed: [
        {
          text: "Calculateur de ravitaillement : nombre de gels desormais realiste via un split 60 % gels / 40 % boisson energetique (avant : 14 gels comptes pour un marathon a 80 g/h, desormais 7)",
          textEn: "Fueling calculator gel count now realistic: split 60% gels / 40% sports drink (previously counted 14 gels for a 3h30 marathon at 80 g/h, now 7)",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Sources mises a jour dans le guide et la FAQ : Rowlands 2020, Witard 2025, Aragon 2013, Margolis 2021, Schwellnus, Paulsen, Trommelen 2023",
          textEn: "Sources updated across guide and FAQ to cite Rowlands 2020, Witard 2025, Aragon 2013, Margolis 2021, Schwellnus, Paulsen, Trommelen 2023",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
    },
  },
  {
    version: "0.5.1",
    date: "2026-05-10",
    changes: {
      added: [
        {
          text: "Editeur de trace en ligne : waypoints draggables, clic pour inserer/supprimer, poignees plus denses et marqueurs distincts depart/arrivee pour aller-retour vs boucle",
          textEn: "On-line trace editor: draggable waypoints, click to insert/remove, denser handles and distinct start/end markers for out-and-back vs loop",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Page Track Finder : liste les pistes d'athletisme a proximite et propose un aller-retour, avec boost VMA dans le moteur de recommandation",
          textEn: "Track Finder page: lists nearby athletics tracks and routes a there-and-back leg, with VMA-aware boost in the recommendation engine",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Affordances carte : chevrons de direction, clic pour choisir le point de depart, cap boussole, expand et reverse",
          textEn: "Map editing affordances: direction chevrons, click-to-pick start, compass bearing, expand and reverse",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Cible de denivele avec moteur de recommandation par discipline et pistes d'athletisme comme POI pour les seances VO2max/VMA",
          textEn: "Elevation target with discipline-aware recommendation engine and athletics tracks as POI for VO2max/VMA sessions",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Lancement du generateur de parcours depuis une seance planifiee ou un workout, avec le preset discipline pre-rempli",
          textEn: "Launch the route generator from a planned session or workout with the discipline preset already filled",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Spotlight d'actualites swipeable sur la home (tactile + drag souris, strip glissant, pointer events)",
          textEn: "Swipeable news spotlight on the homepage (touch + mouse drag, sliding strip, pointer events)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Section 'Comment ca marche' detaillee sur la page du generateur de parcours",
          textEn: "How-it-works details on the route generator page",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
      changed: [
        {
          text: "Layout desktop one-page premium pour les parcours (strip Strava-style, details repliables, CTA sticky, toolbar dense) — sans scroll, footer masque",
          textEn: "Premium desktop one-page layout for routes (Strava-style strip, collapsible details, sticky CTA, dense top toolbar) — no scroll, footer hidden",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "UX mobile reconstruite autour d'une carte persistante avec cartes candidats, top bar slim 3 lignes (chips + adresse + CTA) et search row Strava-style",
          textEn: "Mobile UX rebuilt around a map-first persistent card with candidate cards, slim 3-row top bar (chips + address + CTA) and Strava-style search row",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Estimation de duree par discipline a la place du total Brouter, avec un cap a 200 km en cyclisme",
          textEn: "Discipline-aware duration estimate replaces Brouter total-time, with a 200 km cap on cycling",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Chip de distance unique, action bar separee, stats h3, tooltip d'altitude et sous-items dans la sidebar du generateur",
          textEn: "Single distance chip, action bar split, h3 stats, elevation tooltip and sidebar sub-items in the route generator UI",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Rejet des trajets traversant la mer et message d'erreur specifique quand Brouter renvoie 400 sur un waypoint inaccessible",
          textEn: "Reject sea-bound legs and surface a specific error when Brouter returns 400 on an unreachable waypoint",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Restauration du sizing des tuiles Leaflet sous le preflight Tailwind v4",
          textEn: "Restore Leaflet tile sizing under Tailwind v4 preflight",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Anti-zoom iOS renforce sur les formulaires mobiles, dropdown d'adresse remontee au-dessus de la carte",
          textEn: "iOS input zoom hardened across mobile route forms; address dropdown lifted above the map",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Distance preset exacte au tap pour que 21.1 km et 42.2 km restent marques actifs",
          textEn: "Exact preset distance on tap so 21.1 km and 42.2 km stay marked active",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Select-all au focus sur les inputs distance et denivele",
          textEn: "Select-all on focus for distance and elevation inputs",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Profil d'altitude reste proportionnel via aspect-ratio CSS au lieu de s'etirer plat sur les containers larges",
          textEn: "Elevation chart stays proportional via CSS aspect-ratio instead of stretching flat on wide containers",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Cles i18n manquantes sur la page about et view.findWeekRoute",
          textEn: "Missing i18n keys on the about page and view.findWeekRoute",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Icone velo coherent pour les onglets et slides cyclisme, routage du filtre ?type= corrige",
          textEn: "Bike icon used consistently for cycling tabs and slides; ?type= filter routing fixed",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      performance: [
        {
          text: "Parallelisation des candidats avec timeout/retry Brouter et validation runtime, debounce du re-routage au drag (123 s -> 10 s)",
          textEn: "Parallelize route candidates with Brouter timeout/retry and runtime validation; debounce drag re-route (123 s -> 10 s)",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Cache LRU Brouter et dedup Overpass avec persistance idb-keyval (TTL 7 jours)",
          textEn: "Brouter LRU cache and Overpass dedup with idb-keyval persistence (TTL 7 days)",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Stockage des parcours migre vers IndexedDB, colonne carte desktop bornee au viewport",
          textEn: "Routes storage migrated to IndexedDB; desktop map column capped to viewport",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Extraction des helpers convergence/PRNG/scoring et hook useRouteEditor (RouteGeneratorPage 1100 -> 952, recommendation 669 -> 560)",
          textEn: "Extract convergence/PRNG/scoring helpers and useRouteEditor hook (RouteGeneratorPage 1100 -> 952, recommendation 669 -> 560)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
    },
  },
  {
    version: "0.5.0",
    date: "2026-05-06",
    changes: {
      added: [
        {
          text: "Generateur de parcours : creez une boucle ou un aller-retour reel depuis votre position avec routage Brouter, export GPX et sauvegarde locale",
          textEn: "Route Generator: build a real-world loop or out-and-back from your position with Brouter routing, GPX export and local save",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Routage POI-aware : waypoints choisis depuis les parcs, promenades, voies vertes, plages et sentiers via Overpass (fallback triangulation en zone rurale)",
          textEn: "POI-aware routing: waypoints picked from parks, promenades, greenways, beaches and trails via Overpass (triangulation fallback for rural areas)",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "3 propositions de parcours par generation avec markers POI nommes et profil altimetrique",
          textEn: "3 route candidates per request with named POI markers and elevation profile",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Toggle 'Activer le generateur de parcours' dans les Reglages pour ne plus envoyer aucune coordonnee a un service tiers",
          textEn: "Privacy toggle in Settings to opt-out of the route generator entirely",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Fondation multi-discipline : seances cyclisme et natation, zones FTP/CSS et substitution inter-discipline dans les plans",
          textEn: "Multi-discipline foundation: cycling and swimming workouts, FTP/CSS zones and cross-discipline substitution in plans",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "10 seances cyclisme et 10 seances natation : endurance longue, sweet spot, seuil, intervalles, technique et pyramides",
          textEn: "10 cycling templates and 10 swimming templates spanning long endurance, sweet spot, threshold, intervals, technique work and pyramids",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Pages de test guidees FTP et CSS avec apercu des zones Coggan / CSS",
          textEn: "FTP and CSS guided test pages with Coggan / CSS zone previews",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Onglet velotaf dans le profil pour declarer ses kilometres de domicile-travail",
          textEn: "Vélotaf settings tab in profile for commute kilometres",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
      ],
      changed: [
        {
          text: "Multi-trace overlay : les 3 candidats s'affichent dans des couleurs et motifs distincts pour rester lisibles quand les traces se chevauchent",
          textEn: "Multi-trace overlay: candidates render in distinct colours and dash patterns to stay distinguishable when tracks overlap",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Tri des propositions par precision de distance (meilleure correspondance en premier), rejet automatique des candidats > 20% hors cible",
          textEn: "Candidates sorted by distance accuracy (best match first); off-target results (>20%) are rejected",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Filtres discipline dans la bibliotheque qui passent a la ligne sur mobile au lieu de defiler horizontalement",
          textEn: "Discipline filter tabs in library wrap on mobile to avoid horizontal scroll",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Propositions de parcours qui tombaient toutes sur les memes waypoints — diversification par seed pour garantir des tracés distincts",
          textEn: "Route candidates were falling on the same waypoints — seed-driven diversification now ensures distinct proposals",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Messages d'erreur clairs quand la geolocalisation est bloquee, refusee ou en timeout",
          textEn: "Geolocation errors surface clear messages when blocked, denied or timed out",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Zones Z>6 clampees a Z6 et allures sport-specifiques pour les segments distance-only",
          textEn: "Z>6 zones clamp to Z6 and use sport-specific paces for distance-only segments",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Substitution de seance preserve la discipline a travers le round-trip localStorage",
          textEn: "Substitute session preserves discipline through localStorage round-trip",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
    },
  },
  {
    version: "0.4.4",
    date: "2026-04-13",
    changes: {
      added: [
        {
          text: "Objectifs intermediaires dans les plans d'entrainement avec priorite A/B/C et coaching adapte a la distance (#44)",
          textEn: "Intermediate race goals in training plans with priority A/B/C and distance-aware coaching (#44)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Auto-correction des avertissements du plan en un clic (espacement seances, volume, recuperation, affutage)",
          textEn: "One-click auto-fix for plan audit warnings (session spacing, volume, recovery, taper)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Detection de sessions dupliquees sur le meme jour et saut de volume post-recuperation",
          textEn: "Duplicate day session detection and post-recovery volume jump check",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Phases structurees dans le detail des seances (intervalles imbriques)",
          textEn: "Structured workout phases with nested interval details in session view",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Estimation de la duree des courses intermediaires (distance + niveau + penalite trail)",
          textEn: "Race duration estimation for intermediate races (distance + runner level + trail penalty)",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      fixed: [
        {
          text: "Faux positifs dans l'audit de coherence (sessions de course comptees comme seances cles)",
          textEn: "False positives in plan audit (race sessions counted as key sessions)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Volume de recuperation affiche a 65% fixe au lieu du ratio reel vs peak",
          textEn: "Recovery week volumePercent showing fixed 65% instead of actual ratio to peak",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Seuil de volume jump trop strict (arrondi, plans a faible volume)",
          textEn: "Volume jump threshold too strict (rounding artifacts, low-volume plans)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Kilometrages hebdomadaires non arrondis dans les statistiques",
          textEn: "Weekly km not rounded in stats chart",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Emoji remplaces par des icones dans le panneau de coherence",
          textEn: "Emoji replaced with colored dot icons in audit panel",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.4.3",
    date: "2026-04-12",
    changes: {
      added: [
        {
          text: "Plans libres guidés avec checklist par phase, conseils contextuels et navigation entre semaines sur toutes les vues",
          textEn: "Guided free plans with phase-aware checklist, contextual tips, and week navigation across all views",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Page profil coureur unifiée avec historique d'entraînement, records personnels et aperçu forme",
          textEn: "Runner profile page with unified training history, personal records, and fitness overview",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Sheet de clôture de séance avec 3 choix (comme prévu / modifiée / sautée) et suivi durée/distance/RPE réels",
          textEn: "Session completion sheet with 3 choices (as planned / modified / skipped) and actual duration/distance/RPE tracking",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Indisponibilités (jours bloqués) avec sélecteur de plage de dates et replanification automatique",
          textEn: "Unavailabilities (blocked days) with date range picker and automatic skip-based rescheduling",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Annulation en un clic des changements majeurs du plan via bandeau LastChangePanel et toast",
          textEn: "One-click undo for major plan changes via LastChangePanel banner and toast action",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Moteur d'adaptation multi-semaines avec dialog de prévisualisation et analyse sur 3 semaines glissantes",
          textEn: "Multi-week adaptation engine with preview dialog and 3-week sliding window analysis",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Audit automatique de cohérence du plan avec 8 vérifications (espacement, sauts de volume, intégrité récup/affûtage)",
          textEn: "Automatic plan coherence audit with 8 checks: spacing, volume jumps, recovery/taper integrity",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Recherche insensible aux accents dans la bibliothèque et la palette de commandes",
          textEn: "Accent-insensitive search across library and command palette",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Workouts custom intégrés dans les favoris (ajout, affichage, nettoyage à la suppression)",
          textEn: "Custom workouts fully integrated into favorites (add, display, cleanup on delete)",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "UX PWA : prompt d'installation, indicateur hors ligne, notification de mise à jour",
          textEn: "PWA UX: install prompt, offline indicator, update notification",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Clôture de séance remplacée par un popover ancré (desktop/tablette) et mini sheet compact (mobile) pour une UX moins intrusive",
          textEn: "Session completion replaced with anchored popover (desktop/tablet) and compact bottom sheet (mobile) for less intrusive UX",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Badges RPE et distance masqués sur les cartes de séance mobile pour éviter le débordement",
          textEn: "RPE and distance badges hidden on mobile session cards to prevent overflow",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Les statistiques utilisent la durée/distance réelle quand disponible au lieu des valeurs planifiées",
          textEn: "Stats now use actual duration/distance when available instead of planned values",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Jours bloqués visibles sur toutes les vues (calendrier, semaine, mois, liste) avec fond hachuré",
          textEn: "Blocked days visible across all views (calendar, weekly, monthly, list) with hatched background",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "L'adaptation affiche un dialog de prévisualisation avant application au lieu d'un apply silencieux",
          textEn: "Adaptation shows a preview dialog before applying instead of silent auto-apply",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Blocage de l'ajout/déplacement/drop sur les jours indisponibles sur toutes les vues du plan",
          textEn: "Block add/move/drop on unavailable days across all plan views",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Accents français dans les traductions indisponibilité/replanification",
          textEn: "French accents in unavailability/reschedule translations",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Persistance correcte des indisponibilités après replanification et annulation",
          textEn: "Unavailabilities persisting correctly after rescheduling and undo",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Ordre chronologique de la timeline du simulateur pour les départs très tôt ou tard",
          textEn: "Race simulator timeline order for early morning or late-night race starts",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Affichage et saisie des dates alignés sur la langue de l'app avec DatePicker custom",
          textEn: "Date display and input aligned with app language using custom DatePicker",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.4.2",
    date: "2026-04-11",
    changes: {
      added: [
        {
          text: "Date de début explicite dans la création de plan assisté (Commencer maintenant / Choisir une date), réellement respectée de la génération aux exports",
          textEn: "Explicit start date in assisted plan creation (Start now / Choose a date), properly honored end-to-end from generation to exports",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Backup/restore complet avec choix explicite Fusionner/Remplacer, couvrant les race simulations et les scénarios what-if",
          textEn: "Full backup/restore with explicit Merge/Replace choice, covering race simulations and what-if scenarios",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Récapitulatif des séances non renseignées à la validation d'une semaine, avec choix explicite Marquer comme passées / Laisser non renseignées",
          textEn: "Unresolved sessions recap when validating a week, with explicit Mark as skipped / Leave unresolved choice",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Suppression de la limite de 5 plans et validation d'import renforcée avec bornes de domaine sur le schéma (volume, nombre de semaines)",
          textEn: "Removed the 5-plan cap and tightened import validation with schema domain guards (volume percent, max weeks)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Les stats kilométriques hebdomadaires utilisent en priorité les données les plus fiables (réel > cible > estimation)",
          textEn: "Weekly mileage stats now prefer the most reliable distance data available (actual > target > estimation)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Architecture i18n : migration complète des ternaires isEn vers i18next t()/pickLang, extraction des namespaces homepage, content et calculators, script de vérification de parité FR/EN",
          textEn: "i18n architecture: full migration from isEn ternaries to i18next t()/pickLang, extraction of homepage, content and calculators namespaces, FR/EN parity check script",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      fixed: [
        {
          text: "Le générateur de plan assisté respecte désormais la date de début choisie pour calculer le nombre total de semaines (utilisait la date du jour avant)",
          textEn: "The assisted plan generator now respects the chosen start date when computing total weeks (previously used today's date)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Modale de validation de semaine responsive sur mobile/tablette/desktop : les boutons ne débordent plus du cadre sur les écrans étroits ou moyens",
          textEn: "Week validation modal responsive on mobile/tablet/desktop: buttons no longer overflow the container on narrow or medium viewports",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Les séances marquées comme passées ne gonflent plus les stats kilométriques hebdomadaires",
          textEn: "Skipped sessions no longer inflate weekly mileage stats",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Restauration de sauvegarde : rollback atomique en cas d'échec (quota localStorage) au lieu d'un état partiel et d'un toast de succès trompeur",
          textEn: "Backup restore: atomic rollback on failure (e.g. localStorage quota) instead of a partial state and misleading success toast",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Sauvegarde de plan : gestion gracieuse des erreurs de quota localStorage avec toast d'erreur clair au lieu d'un échec silencieux",
          textEn: "Plan save: graceful handling of localStorage quota errors with a clear error toast instead of silent failure",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
    },
  },
  {
    version: "0.4.1",
    date: "2026-04-10",
    changes: {
      added: [
        {
          text: "Export PDF professionnel des plans : tableaux compacts 6 colonnes avec zones colorées, appendice dédupliqué avec liens cliquables, bannière titre et métadonnées structurées",
          textEn: "Professional plan PDF export: compact 6-column weekly tables with colored zone cells, deduplication appendix with clickable internal links, dark title banner, and structured metadata",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Affichage de la distance (km) à côté de la durée dans les séances de plan",
          textEn: "Display distance (km) alongside duration in plan sessions",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      changed: [
        {
          text: "Format de durée h:mm (ex: 1h59) pour les valeurs >= 60 minutes dans toute l'application",
          textEn: "Use h:mm duration format (e.g., 1h59) for values >= 60 minutes across the entire app",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Filtres à puces multi-sélection avec affichage progressif dans la bibliothèque",
          textEn: "Multi-select chip filters with progressive disclosure in library",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Calcul incorrect du volumePercent dans les durées de séances",
          textEn: "Incorrect volumePercent scaling in workout duration calculations",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Ajustement du volume du générateur de plans pour les jours/semaine et réduction du taux de progression",
          textEn: "Plan generator volume adjustment for days/week and reduced progression rate",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Mapping des jours dans l'export ICS et gestion des séances de renforcement",
          textEn: "ICS plan export day mapping and strength session handling",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Bug d'interaction toggle + changement de semaine",
          textEn: "Toggle + week change interaction bug",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Séparateur de sidebar et renommage de la page méthodologie en guide",
          textEn: "Sidebar separator and plan methodology page renamed to guide",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.4.0",
    date: "2026-04-06",
    changes: {
      added: [
        {
          text: "Renforcement musculaire pour coureurs : 46 exercices (5 catégories) avec images, carte musculaire et points clés de forme",
          textEn: "Strength training for runners: 46 exercises (5 categories) with A/B images, muscle maps, and form cues",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "17 séances de renforcement structurées : full body, jambes, core, pliométrie, mobilité et prévention blessures",
          textEn: "17 structured strength sessions: full body, legs, core, plyometrics, mobility, and injury prevention",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Toggle Course / Renforcement / Tout dans la bibliothèque avec filtres adaptatifs par type d'activité",
          textEn: "Running / Strength / All toggle in library with adaptive filters per activity type",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Page de détail des séances de renforcement : timeline musculaire, carte anatomique interactive, images d'exercices, badges d'intensité",
          textEn: "Strength workout detail page: muscle timeline, interactive body map, exercise images, intensity badges",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Intégration du renforcement dans le générateur de plans avec périodisation scientifique (Rønnestad 2014, Beattie 2017)",
          textEn: "Strength integration in plan generator with scientific periodization (Rønnestad 2014, Beattie 2017)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Séances de renforcement dans les 9 plans prêts à l'emploi (143 séances au total)",
          textEn: "Strength sessions added to all 9 prebuilt plans (143 sessions total)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "3 collections de renforcement : Force pour coureurs, Core stability, Prévention blessures",
          textEn: "3 strength collections: Strength for Runners, Core Stability, Injury Prevention",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Section renforcement sur la page d'accueil avec 3 séances en vedette",
          textEn: "Strength section on homepage with 3 featured sessions",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Onglet Renforcement dans le panel d'ajout de séances des plans",
          textEn: "Strength tab in plan workout addition panel",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Modal d'agrandissement des images d'exercices au clic",
          textEn: "Click-to-zoom modal for exercise images",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Correction du loader infini dans les statistiques de plan contenant des séances de renforcement",
          textEn: "Fixed infinite loader in plan stats when plan contains strength sessions",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Correction de la barre de filtre sticky sur la page bibliothèque",
          textEn: "Fixed sticky filter bar on library page",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.3.4",
    date: "2026-04-04",
    changes: {
      added: [
        {
          text: "SEO : données structurées (Organization, FAQPage, HowTo, ExercisePlan), meta descriptions enrichies, BreadcrumbList sur toutes les pages, prerendering nginx pour les bots",
          textEn: "SEO: structured data (Organization, FAQPage, HowTo, ExercisePlan), enriched meta descriptions, BreadcrumbList on all pages, nginx bot prerendering",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Mini-timeline sticky sur la page détail de séance : barre compacte avec nom, zone dominante et durée qui suit le scroll",
          textEn: "Sticky mini-timeline on workout detail page: compact zone bar follows scroll with workout name and duration",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Plan prébuilt « Reprise après longue pause » : 10 semaines de reconstruction progressive après plusieurs mois d'arrêt",
          textEn: "Prebuilt plan \"Return After Long Break\": 10-week progressive plan for returning after months off",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Liens croisés entre contenus : articles, séances et termes glossaire liés sur chaque page détail",
          textEn: "Cross-content links on workout, article, and glossary detail pages",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Recherche unifiée dans la palette de commandes : séances, articles et glossaire avec headers de section",
          textEn: "Unified search in command palette: workouts, articles, and glossary with section headers",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Sparkline de progression des plans : mini-graphique SVG du volume hebdomadaire coloré par phase d'entraînement",
          textEn: "Plan progress sparkline: SVG weekly volume chart colored by training phase on plan cards",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Légende interactive des zones dans le calculateur : accordéon avec sensations, bénéfices et exemples de séances par zone",
          textEn: "Interactive zone legend on calculator: expandable accordion with sensations, benefits, and example workouts per zone",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Fil d'Ariane contextuel sur la page détail de séance avec accent coloré par zone et conscience du parcours",
          textEn: "Contextual breadcrumb trail on workout detail page with zone-colored accent and journey awareness",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Aperçu des cartes : mini-timeline toujours visible sur les cartes de séances",
          textEn: "Card peek preview: always-visible compact session timeline on workout cards",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Feedback RPE post-complétion avec barre dégradée colorée par zones (échelle 1-10)",
          textEn: "Post-completion RPE feedback with zone-colored gradient bar (1-10 scale)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Skeleton loading avec animation shimmer aux couleurs des zones",
          textEn: "Skeleton loading states with zone-shimmer animation",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Empty states animés pour les pages Plans, Favoris et Bibliothèque",
          textEn: "Animated empty states for Plans, Favorites, and Library pages",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.3.3",
    date: "2026-04-03",
    changes: {
      added: [
        {
          text: "Page méthodologie des plans : explique les 7 principes scientifiques derrière la génération de plans (périodisation, 80/20, semaines de récupération, progression du volume, sortie longue, types de séances, affûtage)",
          textEn: "Plan methodology page: explains the 7 evidence-based principles behind plan generation (periodization, 80/20, recovery weeks, volume progression, long run, session types, taper)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Simulateur what-if : comparez deux scénarios d'entraînement côte à côte avec volume, répartition des zones et insights qualitatifs",
          textEn: "What-if training scenario simulator: compare two training scenarios side by side with volume, zone distribution, and qualitative insights",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Édition inline du nom de plan et refonte du menu d'export (#39)",
          textEn: "Inline plan name editing and refactored plan export menu (#39)",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      fixed: [
        {
          text: "La visualisation de la timeline de séance estime correctement la durée des blocs basés sur la distance (distanceM), corrigeant 69 blocs dans 6 fichiers de séances",
          textEn: "Session timeline visualization now correctly estimates duration from distance-based blocks (distanceM), fixing 69 blocks across 6 workout files",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Normalisation de la date de début de plan au lundi dans getCurrentWeek",
          textEn: "Normalize plan start date to Monday in getCurrentWeek",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
    },
  },
  {
    version: "0.3.2",
    date: "2026-03-28",
    changes: {
      added: [
        {
          text: "Mode de saisie du temps visé dans la création de plan : basculer entre allure cible (min/km) et temps d'arrivée (H:MM:SS), avec conversion automatique (#29)",
          textEn: "Finish time input mode in plan creation: toggle between target pace and target finish time with automatic conversion (#29)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Descriptions de niveau à travers l'app : chaque niveau (débutant, intermédiaire, avancé, élite) affiche la fréquence et le volume hebdomadaire attendus (#28)",
          textEn: "Level descriptions across the app: each difficulty level now shows concrete frequency and weekly volume expectations (#28)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Bandeau de contexte plan sur la fiche séance : affiche la durée adaptée selon le pourcentage de volume de la semaine (#32)",
          textEn: "Plan context banner on workout detail page: shows scaled duration based on the week's volume percentage (#32)",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      changed: [
        {
          text: "Avertissement de durée de plan redesigné : affiche les risques spécifiques et suggère des alternatives (#27)",
          textEn: "Plan duration warning redesigned: shows specific risks and suggests alternatives (#27)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Section stats renommée : « Kilométrage hebdomadaire » et « Temps d'entraînement hebdomadaire » avec sous-titres descriptifs (#30)",
          textEn: "Stats section renamed with descriptive subtitles (#30)",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Le retour depuis une fiche séance revient à la bonne semaine dans la vue plan (#31)",
          textEn: "Navigating back from workout detail now returns to the correct week in weekly plan view (#31)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "La fiche séance affiche la durée adaptée au plan au lieu de la durée de base (#32)",
          textEn: "Workout detail page displays plan-scaled duration instead of base duration (#32)",
          category: "Séances",
          categoryEn: "Workouts",
        },
      ],
    },
  },
  {
    version: "0.3.1",
    date: "2026-03-28",
    changes: {
      added: [
        {
          text: "Section « Pourquoi ça marche » sur chaque fiche séance : explication physiologique, rôle de chaque zone, adaptations attendues et références scientifiques (Billat, Seiler, Daniels...)",
          textEn: "\"Why it works\" science section on each workout detail page: physiological rationale, zone explanations, expected adaptations and scientific references (Billat, Seiler, Daniels...)",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Conseils d'entraînement déplacés dans la barre latérale pour une meilleure hiérarchie du contenu",
          textEn: "Coaching tips moved to sidebar for better content hierarchy",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Pages de comparaison SEO (Zoned vs Runna, Kiprun Pacer, Campus Coach)",
          textEn: "SEO comparison pages (Zoned vs Runna, Kiprun Pacer, Campus Coach)",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Calculateurs ajoutés dans la navigation header et le menu mobile",
          textEn: "Calculators added to header navigation and mobile menu",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Page bibliothèque : grille responsive, modes compact/focus et filtres rapides",
          textEn: "Library page: responsive grid, compact/focus view modes and quick filters",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Avertissement avant de quitter le workout builder avec des modifications non sauvegardées",
          textEn: "Unsaved changes warning before leaving workout builder",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Amélioration des zones de touch, de la responsivité mobile et de la cohérence des interactions",
          textEn: "Improved touch targets, mobile responsiveness and interaction consistency",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "scaledReps ne s'applique qu'aux blocs avec répétitions, évite l'explosion de durée",
          textEn: "scaledReps only applies to blocks with repetitions, prevents duration explosion",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Le tap mobile ouvre correctement le menu contextuel, correction de la sélection de texte au long-press, RPE visible en vue semaine",
          textEn: "Mobile tap opens context menu correctly, prevented text selection on long-press, show RPE in weekly view",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
    },
  },
  {
    version: "0.3.0",
    date: "2026-03-26",
    changes: {
      added: [
        {
          text: "4 modes de vue pour les plans : Calendrier (table complète), Semaine (agenda navigable), Mois (calendrier mensuel avec dates réelles) et Liste",
          textEn: "4 plan view modes: Calendar (full table), Weekly (navigable agenda), Monthly (real-date calendar) and List",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Vue Semaine : agenda navigable semaine par semaine avec grille 7 colonnes sur desktop et 4+3 sur mobile, drag-and-drop et context menu",
          textEn: "Weekly view: navigable week-by-week agenda with 7-column grid on desktop and 4+3 on mobile, drag-and-drop and context menu",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Vue Mois : même rendu que le calendrier complet mais filtré par mois avec navigation, jours hors-mois grisés",
          textEn: "Monthly view: same rendering as full calendar but filtered by month with navigation, out-of-month days grayed out",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Numéros de jours et marqueur de mois inline dans les cellules du calendrier avec mise en évidence du jour actuel",
          textEn: "Day-of-month numbers and inline month marker in calendar cells with current day highlighting",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Générateur de plan v2 : moteur d'allures basé sur Daniels, progression sortie longue Pfitzinger, taper exponentiel Mujika",
          textEn: "Plan generator v2: Daniels-based pace engine, Pfitzinger long run progression, Mujika exponential taper model",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Suivi de complétion des séances : cycle planned/completed/skipped avec saisie RPE, validation de semaine et adaptation automatique du volume",
          textEn: "Session completion tracking: planned/completed/skipped cycle with RPE input, week validation and automatic volume adaptation",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "5 nouveaux plans pré-construits : 5K débutant, 5K intermédiaire, 10K débutant, 10K intermédiaire, retour de blessure",
          textEn: "5 new prebuilt plans: 5K beginner, 5K intermediate, 10K beginner, 10K intermediate, return from injury",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Plans non-course : construction de base, retour de blessure et démarrage débutant avec objectifs adaptés",
          textEn: "Non-race plans: base building, return from injury and beginner start with adapted goals",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Statistiques enrichies : distance hebdomadaire, répartition easy/hard 80/20, charge d'entraînement, progression sortie longue, taux de complétion",
          textEn: "Enhanced statistics: weekly distance chart, 80/20 easy/hard split, training load, long run progression, completion rate",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Annotations d'allure (paceNotes) sur chaque séance avec zones Daniels et plages min/max en min/km",
          textEn: "Pace annotations (paceNotes) on each session with Daniels zones and min/max ranges in min/km",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Scaling progressif (intensityType, weeklyFrequencyMax, minimumRecoveryDays) sur les 200 séances d'entraînement",
          textEn: "Progressive scaling (intensityType, weeklyFrequencyMax, minimumRecoveryDays) across all 200 workout templates",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
      ],
      changed: [
        {
          text: "Wizard de création de plan repensé avec étapes dynamiques selon l'objectif (course, base, blessure, débutant)",
          textEn: "Plan creation wizard redesigned with dynamic steps based on goal (race, base building, injury return, beginner)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Plans pré-construits marathon, semi-marathon et base building enrichis avec allures, load scores et distances cibles",
          textEn: "Marathon, half-marathon and base building prebuilt plans enriched with paces, load scores and distance targets",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Optimisation des performances : memo() sur les composants lourds, thème géré par ref + custom event",
          textEn: "Performance optimization: memo() on heavy components, theme managed via ref + custom event",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Le sélecteur de vue est persisté en localStorage et adapté au responsive (Calendrier et Mois desktop uniquement)",
          textEn: "View mode selector persisted in localStorage and responsive-aware (Calendar and Monthly desktop only)",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      fixed: [
        {
          text: "Correction des sessionType invalides dans les données (vma, mixed, hills, race_pace)",
          textEn: "Fixed invalid sessionType values in workout data (vma, mixed, hills, race_pace)",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Le kilométrage hebdomadaire se met désormais à jour dynamiquement à l'ajout, suppression ou déplacement de séances",
          textEn: "Weekly km now updates dynamically when sessions are added, deleted or moved",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Correction de l'ancrage des dates : les jours du calendrier sont alignés sur le lundi de la semaine de début du plan",
          textEn: "Fixed date anchoring: calendar days now align to the Monday of the plan start week",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
    },
  },
  {
    version: "0.2.3",
    date: "2026-03-22",
    changes: {
      added: [
        {
          text: "Simulateur jour de course : distance, temps cible et heure de départ pour un plan complet (réveil, petit-déjeuner, échauffement, allure km par km, nutrition, checklists) avec export PDF",
          textEn: "Race day simulator: enter distance, target time and start time to get a complete race day plan (wake-up, breakfast, warmup, km-by-km pacing, nutrition, checklists) with PDF export",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Onboarding mobile repensé : carte inline au lieu de bulles positionnées, indices contextuels à la première visite de la bibliothèque, du calendrier de plan et de l'éditeur de séances",
          textEn: "Mobile onboarding reworked: inline card replaces broken positioned bubbles, contextual toast hints on first visit to library, plan calendar and workout builder",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Appui long (mobile) et clic droit (desktop) sur les séances du calendrier de plan : menu contextuel « Voir la séance » et « Supprimer » avec vibration haptique",
          textEn: "Long press (mobile) and right-click (desktop) context menu on plan calendar sessions with 'View session' and 'Delete' actions, haptic vibration on mobile",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Termes du glossaire auto-liés (cliquables) dans la page méthodologie et les recommandations nutritionnelles",
          textEn: "Glossary terms auto-linked (clickable) in methodology page and nutrition recommendation sections",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Bouton de suppression avec dialogue de confirmation dans la liste des séances de l'éditeur",
          textEn: "Delete button with confirmation dialog on workout list view in builder",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Import/export de séances personnalisées en JSON, bouton « Créer » renommé pour plus de clarté",
          textEn: "Import/export custom workouts as JSON files, 'Create' button renamed for clarity",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Rechargement automatique de l'app lors d'une mise à jour du service worker PWA",
          textEn: "App automatically reloads when a new version is available (PWA service worker update)",
          category: "Performance",
          categoryEn: "Performance",
        },
      ],
      changed: [
        {
          text: "Navigation latérale réorganisée en groupes orientés tâches : Découvrir, Entraînement, Séances, Plan",
          textEn: "Sidebar navigation restructured into task-oriented groups: Discover, Training, Sessions, Plan",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Section récupération ouverte par défaut dans le simulateur de course",
          textEn: "Recovery section open by default in race simulator",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Taille de l'en-tête de la page favoris alignée avec les autres pages de liste",
          textEn: "Favorites page header size aligned with other listing pages",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Amélioration de la qualité des exports PDF et ICS des plans",
          textEn: "Improved plan PDF and ICS export quality",
          category: "Bug",
          categoryEn: "Bug",
        },
      ],
    },
  },
  {
    version: "0.2.2",
    date: "2026-03-20",
    changes: {
      added: [
        {
          text: "Export et import de données : sauvegardez tous vos favoris, plans et paramètres en JSON, restaurez depuis un fichier",
          textEn: "Data export and import: backup all your data (favorites, plans, settings) as JSON, restore from backup file",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Avertissement de persistance : dialogue explicatif lors de la première sauvegarde de favori ou de plan",
          textEn: "Storage persistence warning: first-time dialog when saving favorites or plans explaining local-only storage",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Positionnement vie privée : badges sur la page d'accueil, mention dans le footer, section dédiée dans les paramètres",
          textEn: "Privacy positioning: visible badges on homepage hero, privacy note in footer, and privacy section in settings",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Bouton de soutien Ko-fi dans le footer et la page À propos",
          textEn: "Ko-fi support link in footer and about page",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "SEO : contenu textuel et JSON-LD WebApplication sur les pages Zones et Allures",
          textEn: "SEO: H1 heading, intro text and JSON-LD WebApplication schema on Zones and Pace calculator pages",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "SEO : 53 nouvelles routes dans le sitemap (collections, plans pré-construits, calculateurs) — 318 → 371 URLs",
          textEn: "SEO: 53 new routes in sitemap — collections, prebuilt plans, calculators (318 → 371 URLs)",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "SEO : JSON-LD WebApplication sur les 9 pages calculateurs",
          textEn: "SEO: JSON-LD WebApplication schema on all 9 calculator pages",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "SEO : fil d'Ariane JSON-LD sur les pages Article, Collection et Plan pré-construit",
          textEn: "SEO: BreadcrumbList JSON-LD on Article, Collection and Prebuilt Plan detail pages",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "SEO : schema Article enrichi avec auteur, éditeur et dates de publication",
          textEn: "SEO: enriched Article JSON-LD with author, publisher, datePublished and dateModified",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "SEO : image OG par défaut mise à jour (200 séances, 9 calculateurs, « No Account Needed »)",
          textEn: "SEO: updated default OG image with current stats (200 workouts, 9 calculators, 'No Account Needed')",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "SEO : pré-rendu des pages anglaises et liens hreflang dans le sitemap",
          textEn: "SEO: prerender English pages and hreflang alternate links in sitemap",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "Page À propos repensée avec section personnelle, stats à jour et liens de contact (email, Strava, GitHub)",
          textEn: "About page redesigned with personal section, updated stats and contact links (Strava, GitHub)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Éditeur de séances personnalisées : créez, modifiez, sauvegardez et exportez vos propres séances",
          textEn: "Custom workout builder: create, edit, save and export your own workouts",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Séances personnalisées intégrées dans la bibliothèque, la recherche, les favoris et les plans",
          textEn: "Custom workouts integrated into library, search, favorites and training plans",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Guide de transfert FIT : instructions pas à pas après l'export Garmin, avec détection OS et alternatives non-Garmin",
          textEn: "FIT export guide: step-by-step transfer instructions after Garmin export with OS detection",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Quiz amélioré de 3 à 5 questions : niveau d'expérience et point faible, 6 résultats affichés",
          textEn: "Quiz improved from 3 to 5 questions: experience level and weakness, 6 results shown",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Activités cross-training (renforcement, vélo, natation, yoga, repos) dans le panel d'ajout de séances des plans",
          textEn: "Cross-training activities (strength, cycling, swimming, yoga, rest) available in plan workout panel",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Onboarding première visite : 3 bulles guidées mettant en avant la bibliothèque, le quiz et les plans",
          textEn: "First-visit onboarding: 3-step guided bubbles highlighting library, quiz, and plans",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "README mis à jour avec 200 séances, nouvelles fonctionnalités et philosophie de confidentialité",
          textEn: "README updated to reflect 200 workouts, new features, and privacy-first philosophy",
          category: "Documentation",
          categoryEn: "Documentation",
        },
      ],
      fixed: [
        {
          text: "Champs de date sur mobile : cibles tactiles de 44px, police text-base pour éviter le zoom iOS, option « Commencer maintenant »",
          textEn: "Date inputs on mobile: adequate touch targets (44px), text-base font to prevent iOS zoom, 'Start now' option for plan dates",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Filtre de durée étendu à 0-240min pour inclure toutes les séances (les ultra étaient exclues)",
          textEn: "Duration filter range extended to 0-240min to include all workouts (ultra sessions were excluded)",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Éditeur de séances : les boutons exporter et supprimer apparaissent immédiatement après la première sauvegarde",
          textEn: "Workout builder: export and delete buttons now appear immediately after first save",
          category: "Bug",
          categoryEn: "Bug",
        },
      ],
    },
  },
  {
    version: "0.2.1",
    date: "2026-03-19",
    changes: {
      added: [
        {
          text: "Vue calendrier interactive pour les plans d'entraînement avec grille semaine × 7 jours, navigation par semaine sur mobile, et phases colorées",
          textEn: "Interactive calendar view for training plans with week × 7 days grid, mobile week navigation, and colored phases",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Drag & drop natif pour déplacer les séances entre jours (desktop et mobile avec ghost visuel)",
          textEn: "Native drag & drop to move sessions between days (desktop and mobile with visual ghost)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Panel bibliothèque latéral pour ajouter des séances par drag (desktop/tablette) ou tap (mobile) avec recherche et filtres par catégorie",
          textEn: "Workout library side panel to add sessions via drag (desktop/tablet) or tap (mobile) with search and category filters",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Mode plan libre : créez un plan vierge (nom + nombre de semaines) et placez vos séances manuellement",
          textEn: "Free plan mode: create a blank plan (name + week count) and place workouts manually",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Import/export de plans en JSON pour partager ou sauvegarder ses plans",
          textEn: "Plan import/export as JSON to share or backup your plans",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Suppression de séances depuis les vues calendrier et liste avec bouton corbeille",
          textEn: "Delete sessions from both calendar and list views with trash button",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Boutons \"+\" intégrés dans chaque cellule jour (mobile) et chaque semaine (liste) pour ajouter des séances rapidement",
          textEn: "Inline \"+\" buttons in each day cell (mobile) and each week (list) to quickly add sessions",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Indices contextuels dans le panel bibliothèque : drag, clic ou tap selon le mode d'affichage",
          textEn: "Contextual hints in library panel: drag, click or tap depending on display mode",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "19 nouvelles séances scientifiques pour atteindre 200 au total : Norvégien 4×4 (Helgerud), Tabata, R-Pace (Daniels), CV Tinman, Over/Under, Canova Progressive, Hanson Strength Run, Tempo avec surges, acclimatation chaleur, Train Low, DFA alpha1, durabilité cardiaque, ultra time-on-feet, broken race, Canova extensif, circuit pliométrique, Hudson 1-2-3-2-1, test 3min all-out, test par paliers",
          textEn: "19 new science-based workouts to reach 200 total: Norwegian 4×4 (Helgerud), Tabata, R-Pace (Daniels), CV Tinman, Over/Under, Canova Progressive, Hanson Strength Run, Tempo with surges, heat acclimatization, Train Low, DFA alpha1, cardiac drift durability, ultra time-on-feet, broken race, Canova extensive, plyometric circuit, Hudson 1-2-3-2-1, 3-min all-out test, lactate step test",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "2 nouveaux termes au glossaire : Vitesse Critique (CV) et Surge, avec auto-linking dans les descriptions de séances",
          textEn: "2 new glossary terms: Critical Velocity (CV) and Surge, with auto-linking in workout descriptions",
          category: "Glossaire",
          categoryEn: "Glossary",
        },
        {
          text: "8 plans pré-construits prêt-à-l'emploi : 5K débutant/intermédiaire, 10K débutant/intermédiaire, semi-marathon, marathon, construction de base, retour de blessure",
          textEn: "8 pre-built ready-to-use plans: 5K beginner/intermediate, 10K beginner/intermediate, half-marathon, marathon, base building, return from injury",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Dates de début/fin optionnelles sur les plans libres et pré-construits, modifiables à la création et après coup",
          textEn: "Optional start/end dates on free and pre-built plans, editable at creation and afterwards",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Section statistiques enrichie avec 8 métriques, graphique de volume par semaine, distribution par zone (Z1-Z6), répartition des systèmes ciblés, et accordéon repliable",
          textEn: "Enhanced statistics section with 8 metrics, weekly volume chart, zone distribution (Z1-Z6), target system breakdown, and collapsible accordion",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Filtre favoris dans le panel bibliothèque des plans avec message d'état vide adapté",
          textEn: "Favorites filter in plan workout library panel with adapted empty state message",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Phases d'entraînement et semaines de récupération dans les plans libres (Base, Build, Peak, Taper)",
          textEn: "Training phases and recovery weeks in free plans (Base, Build, Peak, Taper)",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      changed: [
        {
          text: "Quiz et création de plan refactorés en étapes plein écran (une question par vue, pas de scroll sur mobile)",
          textEn: "Quiz and plan creation refactored to full-viewport steps (one question per view, no scrolling on mobile)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Bouton supprimer le plan remplacé par un menu d'actions (export JSON + supprimer)",
          textEn: "Delete plan button replaced by action menu (export JSON + delete)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Espacement des sections de la page d'accueil réduit pour un meilleur rythme visuel",
          textEn: "Homepage section spacing reduced for better visual rhythm",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Préchargement des pages du sidebar en arrière-plan pour une navigation instantanée",
          textEn: "Background preloading of sidebar pages for instant navigation",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Indicateur de limite de 5 plans avec masquage des boutons de création quand la limite est atteinte",
          textEn: "5-plan limit indicator with hidden creation buttons when limit is reached",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Compatibilité dark mode : couleurs de la timeline, segments sans zone, et sessions de récupération",
          textEn: "Dark mode compatibility: timeline colors, segments without zones, and recovery sessions",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Flash de navigation mobile éliminé en différant la fermeture du sidebar après le rendu de la page",
          textEn: "Mobile navigation flash eliminated by deferring sidebar close to after page render",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Correction de l'index de session en vue liste triée (supprimer/remplacer ciblait le mauvais élément)",
          textEn: "Fixed session index in sorted list view (delete/replace targeted the wrong element)",
          category: "Bug",
          categoryEn: "Bug",
        },
      ],
    },
  },
  {
    version: "0.2.0",
    date: "2026-03-19",
    changes: {
      added: [
        {
          text: "Page Méthodologie : fondements scientifiques du système 6 zones avec 8 chercheurs, 6 études (liens PubMed), livres, blogs et podcasts de référence",
          textEn: "Methodology page: scientific foundations of the 6-zone system with 8 researchers, 6 studies (PubMed links), reference books, blogs and podcasts",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Nouveau design éditorial inspiré de Google Stitch : page d'accueil avec hero asymétrique, stats en bento grid, cartes avec border-top coloré par zone",
          textEn: "New editorial design inspired by Google Stitch: homepage with asymmetric hero, bento grid stats, cards with zone-colored top border",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Page détail de séance : header bento avec grille de métriques (durée, difficulté, système cible, environnement), boutons d'export proéminents, favori en haut à droite",
          textEn: "Workout detail page: bento header with metrics grid (duration, difficulty, target system, environment), prominent export buttons, favorite in top right",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Séance du jour repensée : layout bento avec durée en grand, conseils du coach dans la colonne droite, card entièrement cliquable",
          textEn: "Redesigned Workout of the Day: bento layout with large duration, coaching tips in right column, fully clickable card",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Visualisation de la timeline agrandie (h-40/h-56) avec labels de zone au survol et meilleur contraste des segments",
          textEn: "Enlarged session timeline visualization (h-40/h-56) with zone labels on hover and better segment contrast",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Remplacement du zone-stripe (bande colorée à gauche) par des border-top colorés sur toutes les cartes (séances, collections, articles)",
          textEn: "Replaced zone-stripe (left colored border) with colored top borders on all cards (workouts, collections, articles)",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Responsive mobile : tailles réduites sur mobile pour le hero, les stats, les boutons et la séance du jour",
          textEn: "Mobile responsive: reduced sizes on mobile for hero, stats, buttons and workout of the day",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Suppression de la carte Détails redondante dans le sidebar de la page de séance",
          textEn: "Removed redundant Details card from workout page sidebar",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Affichage de la récupération entre les répétitions dans le détail des phases (3x30s, fartlek, etc.) sans redondance avec la description",
          textEn: "Display recovery between repetitions in phase details (3x30s, fartlek, etc.) without redundancy with description",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Indication du repos inter-séries pour les blocs multi-séries (ex: 2x(10x 45s VMA / 15s récup) → ~3 min footing entre les séries)",
          textEn: "Inter-series rest indication for multi-set blocks (e.g. 2x(10x 45s VO2max / 15s recovery) → ~3 min jog between sets)",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Collection « Séances mythiques » manquante sur la page d'accueil (accent manquant dans le slug)",
          textEn: "Missing 'Mythic Workouts' collection on homepage (missing accent in slug)",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Segments sans zone (gammes, transitions) invisibles dans la timeline — couleur de fallback corrigée",
          textEn: "Segments without zone (drills, transitions) invisible in timeline — fallback color fixed",
          category: "Bug",
          categoryEn: "Bug",
        },
      ],
    },
  },
  {
    version: "0.1.7",
    date: "2026-03-18",
    changes: {
      added: [
        {
          text: "Auto-liens style Wikipedia : les 200+ termes du glossaire et les 12 articles deviennent cliquables partout dans l'app (séances, articles, guides, glossaire, collections, tips) avec aperçu au survol",
          textEn: "Wikipedia-style auto-linking: all 200+ glossary terms and 12 articles become clickable throughout the entire app (workouts, articles, guides, glossary, collections, tips) with hover previews",
          category: "SEO & UX",
          categoryEn: "SEO & UX",
        },
        {
          text: "Liens automatiques vers les articles d'apprentissage (périodisation, surcompensation, échauffement…) avec aperçu intégré",
          textEn: "Automatic links to learning articles (periodization, supercompensation, warm-up…) with inline preview",
          category: "SEO & UX",
          categoryEn: "SEO & UX",
        },
        {
          text: "Popover d'aperçu unifié desktop et mobile : croix pour fermer, lien vers la page complète",
          textEn: "Unified preview popover for desktop and mobile: close button, link to full page",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Blocs callout dans les 12 articles : conseils, avertissements, points clés et statistiques",
          textEn: "Callout blocks in all 12 articles: tips, warnings, key takeaways and statistics",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Barre de progression de lecture et table des matières (sidebar desktop, dropdown mobile) dans les articles",
          textEn: "Reading progress bar and table of contents (desktop sidebar, mobile dropdown) in articles",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Suppression de dangerouslySetInnerHTML dans les articles au profit de composants React sécurisés",
          textEn: "Replaced dangerouslySetInnerHTML in articles with secure React components",
          category: "Sécurité",
          categoryEn: "Security",
        },
      ],
      fixed: [
        {
          text: "Le bouton retour sur les pages glossaire ramène maintenant à la page précédente (et non toujours au glossaire)",
          textEn: "Back button on glossary pages now returns to the previous page (not always to the glossary)",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Zones tactiles des boutons mobile agrandies à 44px (standard Apple HIG) sans débordement visuel",
          textEn: "Mobile button touch targets enlarged to 44px (Apple HIG standard) without visual overflow",
          category: "Accessibilité",
          categoryEn: "Accessibility",
        },
        {
          text: "Correction complète des accents et de l'orthographe française sur l'ensemble de l'application",
          textEn: "Comprehensive French accent and spelling corrections across the entire application",
          category: "i18n",
          categoryEn: "i18n",
        },
        {
          text: "Amélioration du layout footer et sidebar (alignement, responsive)",
          textEn: "Improved footer and sidebar layout (alignment, responsive)",
          category: "UI",
          categoryEn: "UI",
        },
      ],
    },
  },
  {
    version: "0.1.6",
    date: "2026-03-17",
    changes: {
      added: [
        {
          text: "3 nouvelles catégories de glossaire : Biomécanique (12 termes), Blessures & Prévention (10 termes), Nutrition (17 termes)",
          textEn: "3 new glossary categories: Biomechanics (12 terms), Injuries & Prevention (10 terms), Nutrition (17 terms)",
          category: "Glossaire",
          categoryEn: "Glossary",
        },
        {
          text: "39 termes bilingues couvrant la mécanique de foulée, les blessures courantes et la nutrition sportive",
          textEn: "39 bilingual terms covering stride mechanics, common running injuries, and sports nutrition",
          category: "Glossaire",
          categoryEn: "Glossary",
        },
        {
          text: "Page hub /calculators avec 7 outils de calcul pour coureurs",
          textEn: "Calculator hub page /calculators with 7 running calculator tools",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Calculateur d'équivalence de course (prédire ses temps sur différentes distances)",
          textEn: "Race equivalence calculator (predict times across distances)",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Calculateur de performance ajustée à l'âge (comparer ses performances entre différents âges)",
          textEn: "Age-graded performance calculator (compare performances across ages)",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Pré-rendu de 318 pages au build pour les moteurs de recherche (SEO)",
          textEn: "Post-build prerendering of 318 pages for search engine crawlers (SEO)",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "Données structurées JSON-LD enrichies (ExercisePlan, DefinedTerm, BreadcrumbList, WebSite, SearchAction)",
          textEn: "Enriched JSON-LD structured data (ExercisePlan, DefinedTerm, BreadcrumbList, WebSite, SearchAction)",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "Bouton copier le lien sur la page détail d'un entraînement",
          textEn: "Copy link button on workout detail page",
          category: "Fonctionnalités",
          categoryEn: "Features",
        },
      ],
      fixed: [
        {
          text: "Le générateur de sitemap lit maintenant les fichiers glossaire .ts (cherchait des .json, 0 termes trouvés)",
          textEn: "Sitemap generator now correctly reads glossary .ts files (was looking for .json, finding 0 terms)",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "Sitemap étendu de 175 à 318 URLs (ajout des guides, collections, calculateurs et tous les termes glossaire)",
          textEn: "Sitemap expanded from 175 to 318 URLs (added guides, collections, calculators, all glossary terms)",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "Séance du jour : sélection stable grâce à un seed basé sur un hash (ne change plus quand le catalogue évolue)",
          textEn: "Workout of the day: stable selection with hash-based seed (no longer shifts when catalog changes)",
        },
        {
          text: "Génération de plan : vérification de la limite avant la génération au lieu d'après",
          textEn: "Plan generation: limit check now runs before generation instead of after",
        },
      ],
    },
  },
  {
    version: "0.1.5",
    date: "2026-03-14",
    changes: {
      added: [
        {
          text: "Nouvelle navigation sidebar collapsible style Notion/Linear avec 3 états (expanded, collapsed, mobile sheet)",
          textEn: "New collapsible sidebar navigation Notion/Linear-style with 3 states (expanded, collapsed, mobile sheet)",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Top bar minimaliste avec logo, recherche centrée et actions rapides",
          textEn: "Minimal top bar with logo, centered search and quick actions",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Sidebar avec sections groupées (Entraînement, Découvrir, Outils) et tooltips en mode collapsed",
          textEn: "Sidebar with grouped sections (Training, Discover, Tools) and tooltips in collapsed mode",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Animation fluide de collapse/expand avec transitions CSS unifiées",
          textEn: "Smooth collapse/expand animation with unified CSS transitions",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Persistance de l'état sidebar (collapsed/expanded) dans localStorage",
          textEn: "Sidebar state persistence (collapsed/expanded) in localStorage",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Formulaire de contribution communautaire avec deux modes (idée rapide / séance complète)",
          textEn:
            "Community contribution form with two modes (quick idea / full workout)",
          category: "Contribution",
          categoryEn: "Contribution",
        },
        {
          text: "Wizard 4 étapes pour créer une séance détaillée avec prévisualisation en temps réel",
          textEn:
            "4-step wizard to create a detailed workout with real-time preview",
          category: "Contribution",
          categoryEn: "Contribution",
        },
        {
          text: "Génération automatique d'issues GitHub pré-remplies depuis le formulaire",
          textEn:
            "Automatic generation of pre-filled GitHub issues from the form",
          category: "Contribution",
          categoryEn: "Contribution",
        },
        {
          text: "Templates d'issues GitHub pour les soumissions de séances (idée rapide et détaillée)",
          textEn:
            "GitHub issue templates for workout submissions (quick idea and detailed)",
          category: "Contribution",
          categoryEn: "Contribution",
        },
        {
          text: "Guide de contribution (CONTRIBUTING.md) avec conventions et instructions",
          textEn:
            "Contribution guide (CONTRIBUTING.md) with conventions and instructions",
          category: "Contribution",
          categoryEn: "Contribution",
        },
        {
          text: "17 nouvelles séances scientifiquement fondées (181 au total)",
          textEn: "17 new scientifically-grounded workouts (181 total)",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "4 nouveaux tests d'évaluation : Cooper, Conconi, Yasso 800s, MAF Maffetone",
          textEn:
            "4 new assessment tests: Cooper, Conconi, Yasso 800s, MAF Maffetone",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "5 nouveaux fartleks : kényan 1/1, dégressif, 2/1 longue distance, escalier montant, whistle",
          textEn:
            "5 new fartleks: Kenyan 1/1, descending, long distance 2/1, ascending ladder, whistle",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "4 nouvelles séances de récupération : pieds nus, aqua jogging, mobilité articulaire, régénération nature",
          textEn:
            "4 new recovery sessions: barefoot, aqua jogging, joint mobility, nature regeneration",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "4 nouvelles séances de côtes : sprints explosifs, gradient progressif, rolling hills, technique de descente",
          textEn:
            "4 new hill sessions: explosive sprints, progressive gradient, rolling hills, downhill technique",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "Générateur de plans d'entraînement personnalisés avec wizard multi-étapes, gestion des phases et volume progressif",
          textEn:
            "Personalized training plan generator with multi-step wizard, phase management and progressive volume",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Export des plans d'entraînement en PDF et ICS (calendrier)",
          textEn: "Training plan export to PDF and ICS (calendar)",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "3 guides pratiques bilingues : nutrition du coureur, préparation avant course, et routines d'échauffement",
          textEn:
            "3 bilingual practical guides: runner's nutrition, race preparation, and warm-up routines",
          category: "Guides",
          categoryEn: "Guides",
        },
        {
          text: "Page changelog avec timeline des versions et indicateur 'Quoi de neuf'",
          textEn:
            "Changelog page with version timeline and 'What's New' indicator",
          category: "Fonctionnalités",
          categoryEn: "Features",
        },
        {
          text: "Page 404 personnalisée avec suggestions de navigation",
          textEn: "Custom 404 page with navigation suggestions",
          category: "Fonctionnalités",
          categoryEn: "Features",
        },
        {
          text: "Notifications toast pour les retours d'actions (exports, favoris, etc.)",
          textEn:
            "Toast notifications for action feedback (exports, favorites, etc.)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Composant Error Boundary pour la gestion gracieuse des erreurs",
          textEn: "Error Boundary component for graceful error handling",
          category: "Fonctionnalités",
          categoryEn: "Features",
        },
        {
          text: "Défilement infini sur la bibliothèque remplaçant le bouton 'Voir plus'",
          textEn:
            "Infinite scroll on library replacing 'Show more' button",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "CTA Plans d'entraînement sur la page d'accueil avec comportement adaptatif",
          textEn:
            "Training plan CTA on homepage with adaptive behavior",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Support trail : short trail (30km), trail (60km), ultra trail (100km) avec entraînement adapté au terrain",
          textEn: "Trail race support: short trail (30km), trail (60km), ultra trail (100km) with terrain-adapted training",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Statistiques du plan : séances totales, heures, moyenne/semaine, séances clés, barre de répartition par type",
          textEn: "Plan statistics overview: total sessions, hours, avg/week, key sessions, session type distribution bar",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Remplacement de séances dans le plan par une autre de la bibliothèque (recherche + filtres par type)",
          textEn: "Swap/replace any session in a plan with another workout from the library (search + type filters)",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Dialog d'export ICS : choix des jours d'entraînement et du jour de sortie longue avant export calendrier",
          textEn: "ICS export dialog: choose your training days and long run day before calendar export",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Export PDF enrichi avec blocs complets (échauffement, corps de séance, retour au calme, conseils coaching)",
          textEn: "Enriched PDF export with full workout blocks (warm-up, main set, cool-down, coaching tips)",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Export ICS enrichi avec détails complets de la séance et conseils coaching",
          textEn: "Enriched ICS export with full session details and coaching tips",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Notes d'allure cible générées pour les séances tempo/seuil/VO2max/sortie longue",
          textEn: "Pace target notes generated for tempo/threshold/VO2max/long run sessions",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Notes d'élévation pour les sorties longues quand la course a du dénivelé",
          textEn: "Elevation notes for long run sessions when race has elevation gain",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Suppression de plans directement depuis la liste avec dialog de confirmation",
          textEn: "Delete plans directly from the plans list page with confirmation dialog",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Indicateur de volume ajusté sur la durée des séances (tooltip explicatif et pourcentage)",
          textEn: "Volume adjustment indicator on session duration (explanatory tooltip and percentage)",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Design des pages collections unifié avec style plat et minimaliste",
          textEn: "Collections pages unified with flat minimal design",
          category: "UI",
          categoryEn: "UI",
        },
        {
          text: "Imports dynamiques pour toutes les pages (lazy loading)",
          textEn: "Dynamic imports for all pages (lazy loading)",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Validation améliorée du calculateur de zones",
          textEn: "Improved zone calculator validation",
          category: "Outils",
          categoryEn: "Tools",
        },
        {
          text: "Pagination ajoutée à la bibliothèque",
          textEn: "Pagination added to library",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "Suppression des boutons thème/langue de la sidebar (déjà présents dans la top bar)",
          textEn: "Removed theme/language toggles from sidebar (already in top bar)",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Réduction de la taille du logo dans la top bar pour un meilleur équilibre visuel",
          textEn: "Reduced logo size in top bar for better visual balance",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Remplacement de la navigation horizontale par une sidebar verticale responsive",
          textEn: "Replaced horizontal navigation with a responsive vertical sidebar",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Suppression de l'attribution de jour fixe : les coureurs choisissent librement leurs jours d'entraînement",
          textEn: "Removed day-of-week assignment: runners are free to choose their own training days",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Séances affichées par priorité (sortie longue → clé → endurance → récupération) sans labels de jour",
          textEn: "Sessions displayed by priority (long run → key → endurance → recovery) without day labels",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
      ],
      fixed: [
        {
          text: "Centrage de la barre de recherche et du logo dans la top bar (alignement correct sur mobile, tablette et desktop)",
          textEn: "Center search bar and logo in top bar (correct alignment on mobile, tablet and desktop)",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Centrage des icônes dans la sidebar en mode collapsed (suppression du gap fantôme)",
          textEn: "Center icons in collapsed sidebar (removed ghost gap)",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Correction du label \"Base — Base\" dupliqué dans les en-têtes de semaine",
          textEn: "Fixed \"Base — Base\" duplicate label in week headers (phase shown twice)",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Calcul de durée basé sur les blocs réels au lieu des métadonnées typicalDuration inexactes",
          textEn: "Duration calculation now uses actual workout blocks instead of inaccurate typicalDuration metadata",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Les séances trail ne sont plus sélectionnées pour les courses sur route",
          textEn: "Trail workouts no longer selected for road races (even with elevation)",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Réduction du corps de séance proportionnelle au volume de la semaine (échauffement/retour au calme inchangés)",
          textEn: "Main set duration scaled by volume %, warm-up/cool-down kept at full duration",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Meilleure variété dans la sélection des séances faciles/récupération",
          textEn: "Improved variety in easy/recovery session selection",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Navigation retour contextuelle : retour vers le plan (et non la bibliothèque) quand on vient d'un plan",
          textEn: "Contextual back navigation: returns to plan (not library) when coming from a plan",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Espacement corrigé dans les séances de la vue hebdomadaire du plan",
          textEn: "Fixed spacing in plan weekly view sessions",
          category: "UI",
          categoryEn: "UI",
        },
      ],
    },
  },
  {
    version: "0.1.4",
    date: "2026-02-13",
    changes: {
      added: [
        {
          text: "12 collections thématiques de séances (débutant, anti-stress, retour de blessure, pré/post-course, objectifs 5K/10K/semi/marathon/ultra, séances légendaires, progression VO2max)",
          textEn:
            "12 curated thematic workout collections (beginner, anti-stress, injury comeback, pre/post-race, 5K/10K/half/marathon/ultra goals, legendary workouts, VO2max progression)",
          category: "Collections",
          categoryEn: "Collections",
        },
        {
          text: "Page de listing des collections avec grille responsive",
          textEn: "Collections listing page with responsive grid layout",
          category: "Collections",
          categoryEn: "Collections",
        },
        {
          text: "Page de détail de collection avec hero en gradient et numérotation des étapes",
          textEn:
            "Collection detail page with gradient hero, step numbering for progression paths",
          category: "Collections",
          categoryEn: "Collections",
        },
        {
          text: "Section collections mises en avant sur la page d'accueil",
          textEn: "Featured collections section on homepage",
          category: "Collections",
          categoryEn: "Collections",
        },
        {
          text: "Lien de navigation dans le header (desktop + mobile)",
          textEn: "Navigation link in header (desktop + mobile)",
          category: "Collections",
          categoryEn: "Collections",
        },
        {
          text: "Support Progressive Web App avec cache hors-ligne via Workbox",
          textEn:
            "Progressive Web App support with offline caching via Workbox",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "Service worker avec stratégie de mise à jour automatique",
          textEn: "Service worker with auto-update strategy",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "Manifeste d'application avec icônes et couleurs du thème",
          textEn: "App manifest with icons and theme colors",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "Recommandations nutritionnelles dynamiques basées sur la durée et l'intensité",
          textEn:
            "Dynamic nutrition recommendations based on workout duration and intensity",
          category: "Détail séance",
          categoryEn: "Workout Detail",
        },
        {
          text: "Conseils d'hydratation adaptés au type de séance",
          textEn: "Hydration guidelines adapted to session type",
          category: "Détail séance",
          categoryEn: "Workout Detail",
        },
        {
          text: "Recommandations de récupération avec chronologie et conseils",
          textEn: "Recovery recommendations with timeline and tips",
          category: "Détail séance",
          categoryEn: "Workout Detail",
        },
      ],
      changed: [
        {
          text: "Actions du header consolidées avec grille et menu déroulant",
          textEn:
            "Header actions consolidated with grid layout and dropdown menu",
        },
      ],
    },
  },
  {
    version: "0.1.3",
    date: "2026-01-31",
    changes: {
      added: [
        {
          text: "Hub de connaissances avec 12 articles bilingues sur les principes d'entraînement",
          textEn:
            "Knowledge hub with 12 bilingual articles on training principles",
          category: "Contenu éducatif",
          categoryEn: "Educational Content",
        },
        {
          text: "Page glossaire avec 50+ termes et définitions d'entraînement",
          textEn: "Glossary page with 50+ training terms and definitions",
          category: "Contenu éducatif",
          categoryEn: "Educational Content",
        },
        {
          text: "Système de conseils éducatifs avec 69 conseils contextuels (accueil et détails des séances)",
          textEn:
            "Educational tips system with 69 contextual tips (shown on homepage and workout details)",
          category: "Contenu éducatif",
          categoryEn: "Educational Content",
        },
        {
          text: "Nouveaux articles : zones, test VMA, échauffement, récupération, nutrition, FAQ, périodisation, surcompensation, affûtage, entraînement polarisé, surcharge progressive, régularité",
          textEn:
            "New articles: zones, testing-vma, warmup, recovery, nutrition, faq, periodization, supercompensation, tapering, polarized-training, progressive-overload, consistency",
          category: "Contenu éducatif",
          categoryEn: "Educational Content",
        },
        {
          text: "Bouton de séance aléatoire dans le header avec icône de dé",
          textEn: "Random workout button in header with dice icon",
          category: "Séance aléatoire",
          categoryEn: "Random Workout",
        },
        {
          text: "Carte CTA de séance aléatoire sur la page d'accueil",
          textEn: "Random workout CTA card on homepage",
          category: "Séance aléatoire",
          categoryEn: "Random Workout",
        },
        {
          text: "Accès rapide pour découvrir de nouvelles séances",
          textEn: "Quick access to discover new workouts",
          category: "Séance aléatoire",
          categoryEn: "Random Workout",
        },
        {
          text: "Page de paramètres avec préférences de thème et d'unités",
          textEn: "Settings page with theme and unit preferences",
          category: "Paramètres",
          categoryEn: "Settings & Personalization",
        },
        {
          text: "Palettes accessibles pour les daltoniens (deutéranopie, protanopie, tritanopie)",
          textEn:
            "Color blind accessible palettes (deuteranopia, protanopia, tritanopia)",
          category: "Paramètres",
          categoryEn: "Settings & Personalization",
        },
        {
          text: "Conversion d'unités entre métrique (km/h, min/km) et impérial (mph, min/mi)",
          textEn:
            "Unit conversion between metric (km/h, min/km) and imperial (mph, min/mi)",
          category: "Paramètres",
          categoryEn: "Settings & Personalization",
        },
        {
          text: "Calculateurs de pace et de zones avec support des unités",
          textEn: "Pace and zone calculators with unit support",
          category: "Paramètres",
          categoryEn: "Settings & Personalization",
        },
        {
          text: "Sélecteur de mode d'affichage (grille/liste)",
          textEn: "View mode selector (grid/list views)",
          category: "Bibliothèque",
          categoryEn: "Library Enhancements",
        },
        {
          text: "Recherche par palette de commandes avec Cmd+K / Ctrl+K",
          textEn: "Command palette search with Cmd+K / Ctrl+K",
          category: "Bibliothèque",
          categoryEn: "Library Enhancements",
        },
        {
          text: "14 nouvelles séances d'entraînement (150 au total)",
          textEn: "14 new workout sessions (150 total)",
          category: "Bibliothèque",
          categoryEn: "Library Enhancements",
        },
        {
          text: "Bouton de filtre mobile avec badge de filtres actifs",
          textEn: "Mobile filter button with active filter badge",
          category: "Bibliothèque",
          categoryEn: "Library Enhancements",
        },
        {
          text: "Mise en page compacte mobile pour les CTAs de la page d'accueil (Quiz et Aléatoire côté à côté)",
          textEn:
            "Compact mobile layout for homepage CTAs (Quiz and Random side by side)",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Bannière de conseils sans bouton de fermeture (toujours visible)",
          textEn: "Tips banner without dismiss button (always visible)",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Soulignement animé de la navigation",
          textEn: "Animated navigation underline",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Animation de rebond du coeur sur le bouton favori",
          textEn: "Heart bounce animation on favorite button",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Transitions de vue entre les pages",
          textEn: "View transitions between pages",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Header responsive avec point d'arrêt intermédiaire",
          textEn: "Responsive header with intermediate breakpoint",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Modal de détail de zone avec liens cliquables vers les séances",
          textEn: "Zone detail modal with clickable workout links",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Infrastructure SEO complète avec meta tags",
          textEn: "Comprehensive SEO infrastructure with meta tags",
          category: "SEO & Analytics",
          categoryEn: "SEO & Analytics",
        },
        {
          text: "Données structurées (JSON-LD) pour les séances",
          textEn: "Structured data (JSON-LD) for workouts",
          category: "SEO & Analytics",
          categoryEn: "SEO & Analytics",
        },
        {
          text: "Intégration Vercel Analytics",
          textEn: "Vercel Analytics integration",
          category: "SEO & Analytics",
          categoryEn: "SEO & Analytics",
        },
        {
          text: "Page à propos avec informations du projet",
          textEn: "About page with project information",
          category: "SEO & Analytics",
          categoryEn: "SEO & Analytics",
        },
      ],
      changed: [
        {
          text: "Les CTAs de la page d'accueil utilisent une grille compacte à 2 colonnes sur mobile",
          textEn:
            "Homepage CTAs use compact 2-column grid layout on mobile",
        },
        {
          text: "Remplacement de lucide-react par des icônes SVG inline (65 icônes)",
          textEn: "Replaced lucide-react with inline SVG icons (65 icons)",
        },
        {
          text: "Les couleurs de zone utilisent maintenant des variables CSS pour le théming",
          textEn: "Zone colors now use CSS variables for theming",
        },
        {
          text: "Zones personnalisées affichées sur la page de détail de séance",
          textEn: "Personalized zones displayed on workout detail page",
        },
        {
          text: "Les résultats du quiz s'intègrent aux filtres de la bibliothèque",
          textEn: "Quiz results integrate with library filters",
        },
      ],
      fixed: [
        {
          text: "La détection de langue gère les variantes de locale (en-US, fr-CA)",
          textEn:
            "Language detection handles locale variants (en-US, fr-CA)",
        },
        {
          text: "Les cartes du glossaire se re-rendent au changement de langue",
          textEn: "Glossary cards re-render on language change",
        },
        {
          text: "Le menu mobile se ferme au changement de route",
          textEn: "Mobile menu closes on route change",
        },
        {
          text: "Amélioration du parsing d'intervalles pour l'extraction de la zone de récupération",
          textEn:
            "Interval parsing improved for recovery zone extraction",
        },
        {
          text: "Calculs de durée alignés entre la timeline et les métadonnées",
          textEn:
            "Duration calculations aligned between timeline and metadata",
        },
        {
          text: "L'export PDF utilise un téléchargement blob asynchrone",
          textEn: "PDF export uses async blob download",
        },
        {
          text: "Corrections diverses des arrière-plans de modales/dialogues",
          textEn: "Various modal/dialog background fixes",
        },
        {
          text: "Durée minimale de filtre abaissée à 10 minutes",
          textEn: "Minimum filter duration lowered to 10 minutes",
        },
      ],
      performance: [
        {
          text: "Chargement différé des articles et données du glossaire",
          textEn: "Lazy-load articles and glossary data",
        },
        {
          text: "Découpe du code pour les données de séance par catégorie",
          textEn: "Code-splitting for workout data by category",
        },
        {
          text: "Bundle principal réduit de 1 Mo à 88 Ko gzip",
          textEn: "Main bundle reduced from 1MB to 88KB gzip",
        },
        {
          text: "Élimination du code mort",
          textEn: "Dead code elimination",
        },
      ],
    },
  },
  {
    version: "0.1.2",
    date: "2026-01-26",
    changes: {
      added: [
        {
          text: "Logo du projet avec design pulse intégré dans le header",
          textEn: "Project logo with pulse design integrated in header",
          category: "Branding",
          categoryEn: "Branding",
        },
        {
          text: "Variantes de favicon optimisées (16x16, 32x32, 180x180, 192x192, 512x512)",
          textEn:
            "Optimized favicon variants (16x16, 32x32, 180x180, 192x192, 512x512)",
          category: "Branding",
          categoryEn: "Branding",
        },
        {
          text: "Support d'import SVG pour les assets du logo",
          textEn: "SVG import support for logo assets",
          category: "Branding",
          categoryEn: "Branding",
        },
        {
          text: "Composant d'état vide avec support i18n",
          textEn: "Empty state component with i18n support",
          category: "Composants UI",
          categoryEn: "UI Components",
        },
        {
          text: "Bouton flottant de retour en haut de page",
          textEn: "Scroll-to-top floating button",
          category: "Composants UI",
          categoryEn: "UI Components",
        },
        {
          text: "Indicateur de chargement sur le bouton d'export",
          textEn: "Loading spinner on export button for better feedback",
          category: "Composants UI",
          categoryEn: "UI Components",
        },
        {
          text: "Raccourcis clavier pour la fonctionnalité de recherche",
          textEn: "Keyboard shortcuts for search functionality",
          category: "Accessibilité",
          categoryEn: "Accessibility",
        },
        {
          text: "Attributs ARIA modal au tiroir de filtres pour les lecteurs d'écran",
          textEn:
            "ARIA modal attributes to filter drawer for screen readers",
          category: "Accessibilité",
          categoryEn: "Accessibility",
        },
        {
          text: "Label ARIA sur le champ de recherche pour l'accessibilité",
          textEn: "ARIA label to search input for accessibility",
          category: "Accessibilité",
          categoryEn: "Accessibility",
        },
        {
          text: "Zones tactiles agrandies dans le header mobile pour une interaction facilitée",
          textEn:
            "Increased touch targets in mobile header for easier interaction",
          category: "Accessibilité",
          categoryEn: "Accessibility",
        },
        {
          text: "Système de filtres modal avec actions appliquer/annuler sur mobile",
          textEn:
            "Modal filter system with apply/cancel actions on mobile",
          category: "Expérience mobile",
          categoryEn: "Mobile Experience",
        },
        {
          text: "Barre de recherche déplacée hors du tiroir de filtres pour une meilleure découverte",
          textEn:
            "Search bar moved outside filter drawer for better discoverability",
          category: "Expérience mobile",
          categoryEn: "Mobile Experience",
        },
        {
          text: "Améliorations rapides de l'interface intégrées dans la bibliothèque",
          textEn: "Quick wins UI improvements integrated in library",
          category: "Expérience utilisateur",
          categoryEn: "User Experience",
        },
        {
          text: "Écouteur en temps réel des préférences de thème système",
          textEn: "Real-time system theme preference listener",
          category: "Expérience utilisateur",
          categoryEn: "User Experience",
        },
        {
          text: "Retour automatique en haut de page lors de la navigation",
          textEn: "Automatic scroll to top on page navigation",
          category: "Expérience utilisateur",
          categoryEn: "User Experience",
        },
      ],
      changed: [
        {
          text: "Tiroir de filtre mobile renommé en \"Filtres\" pour plus de clarté",
          textEn:
            'Renamed mobile filter drawer to "Filters" for clarity',
        },
      ],
      fixed: [
        {
          text: "Correction du débordement mobile dans le header du détail de séance",
          textEn:
            "Prevented mobile overflow in workout detail header",
          category: "Mise en page mobile",
          categoryEn: "Mobile Layout",
        },
        {
          text: "Correction du débordement mobile par réorganisation des actions du header",
          textEn:
            "Prevented mobile overflow by reorganizing header actions",
          category: "Mise en page mobile",
          categoryEn: "Mobile Layout",
        },
        {
          text: "Traduction du message d'erreur de séance introuvable",
          textEn: "Translated workout not found error message",
          category: "Internationalisation",
          categoryEn: "Internationalization",
        },
        {
          text: "Ajout des traductions pour les actions du filtre modal (appliquer/annuler)",
          textEn:
            "Added translations for modal filter actions (apply/cancel)",
          category: "Internationalisation",
          categoryEn: "Internationalization",
        },
      ],
    },
  },
  {
    version: "0.1.1",
    date: "2026-01-26",
    changes: {
      added: [
        {
          text: "Export des séances en 4 formats depuis la page de détail",
          textEn: "Export workouts to 4 formats from detail page",
          category: "Système d'export",
          categoryEn: "Export System",
        },
        {
          text: "ICS (Calendrier) : ajouter une séance à Google Calendar, Apple Calendar, Outlook",
          textEn:
            "ICS (Calendar): Add workout to Google Calendar, Apple Calendar, Outlook",
          category: "Système d'export",
          categoryEn: "Export System",
        },
        {
          text: "PNG (Image) : export haute résolution avec la carte complète de séance (nom, description, timeline, zones, blocs)",
          textEn:
            "PNG (Image): High-resolution export with full workout card (name, description, timeline, zones, blocks)",
          category: "Système d'export",
          categoryEn: "Export System",
        },
        {
          text: "PDF (Document) : document imprimable avec structure de séance, conseils et erreurs courantes",
          textEn:
            "PDF (Document): Printable document with workout structure, coaching tips, and common mistakes",
          category: "Système d'export",
          categoryEn: "Export System",
        },
        {
          text: "Garmin FIT : fichier natif pour appareils Garmin avec zones FC et intensité des étapes",
          textEn:
            "Garmin FIT: Native workout file for Garmin devices with HR zones and step intensity",
          category: "Système d'export",
          categoryEn: "Export System",
        },
        {
          text: "Composant de menu déroulant (basé sur Radix)",
          textEn: "Dropdown menu component (Radix-based)",
          category: "Composants UI",
          categoryEn: "UI Components",
        },
        {
          text: "Sélecteur de date/heure pour l'export calendrier",
          textEn: "Date/time picker for calendar export",
          category: "Composants UI",
          categoryEn: "UI Components",
        },
        {
          text: "Carte de séance exportable avec résumé complet",
          textEn: "Exportable workout card with complete workout summary",
          category: "Composants UI",
          categoryEn: "UI Components",
        },
      ],
      changed: [
        {
          text: "Le pied de page affiche maintenant le nombre dynamique de séances et catégories",
          textEn:
            "Footer now displays dynamic workout and category counts",
        },
        {
          text: "Ajout du lien vers le dépôt GitHub dans le pied de page",
          textEn: "Added GitHub repository link in footer",
        },
      ],
    },
  },
  {
    version: "0.1.0",
    date: "2026-01-26",
    changes: {
      added: [
        {
          text: "Projet initial React 19 + Vite + Tailwind 4",
          textEn: "Initial React 19 + Vite + Tailwind 4 project setup",
          category: "Application principale",
          categoryEn: "Core Application",
        },
        {
          text: "Système d'entraînement à 6 zones avec base scientifique (Z1-Z6)",
          textEn:
            "6-zone training system with scientific basis (Z1-Z6)",
          category: "Application principale",
          categoryEn: "Core Application",
        },
        {
          text: "136 modèles de séances répartis en 11 catégories",
          textEn: "136 workout templates across 11 categories",
          category: "Application principale",
          categoryEn: "Core Application",
        },
        {
          text: "Navigation multi-pages : Accueil, Bibliothèque, Détail séance, Paramètres, Favoris",
          textEn:
            "Multi-page routing: Home, Library, Workout Detail, Settings, Favorites",
          category: "Application principale",
          categoryEn: "Core Application",
        },
        {
          text: "Configuration de déploiement Docker",
          textEn: "Docker deployment configuration",
          category: "Application principale",
          categoryEn: "Core Application",
        },
        {
          text: "Catégories : récupération, endurance, tempo, seuil, VMA, sortie longue, côtes, fartlek, allure course, mixte, évaluation",
          textEn:
            "Categories: recovery, endurance, tempo, threshold, VMA, long run, hills, fartlek, race pace, mixed, assessment",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Catégorie évaluation avec test de Cooper, VAMEVAL, demi-Cooper et Léger-Boucher",
          textEn:
            "Assessment category with Cooper test, VAMEVAL, half-Cooper, and Leger-Boucher tests",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Séances de double seuil norvégien",
          textEn: "Norwegian double threshold sessions",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Séances méthode Bangsbo 10-20-30",
          textEn: "Bangsbo 10-20-30 method sessions",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Séances VMA Billat 30/30, SET et NRRs",
          textEn: "Billat 30/30, SET and NRRs VMA sessions",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Séances Yasso 800, Rosario et cutdown",
          textEn: "Yasso 800s, Rosario, and cutdown sessions",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Séances de sortie longue de régénération et yoga-run",
          textEn: "Long regeneration and yoga-run sessions",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Timeline interactive montrant la structure de la séance",
          textEn: "Interactive timeline showing workout structure",
          category: "Visualisation",
          categoryEn: "Visualization",
        },
        {
          text: "Affichage de la distribution des zones",
          textEn: "Zone distribution display",
          category: "Visualisation",
          categoryEn: "Visualization",
        },
        {
          text: "Indicateur de barre d'intensité",
          textEn: "Intensity bar indicator",
          category: "Visualisation",
          categoryEn: "Visualization",
        },
        {
          text: "Support des patterns d'intervalles complexes (ex : 2x12x30s)",
          textEn:
            "Support for complex interval patterns (e.g., 2x12x30s)",
          category: "Visualisation",
          categoryEn: "Visualization",
        },
        {
          text: "Calculateur de zones avec entrées FCmax/VMA",
          textEn: "Zone calculator with FCmax/VMA inputs",
          category: "Personnalisation",
          categoryEn: "Personalization",
        },
        {
          text: "Préférences de zones personnelles avec persistence localStorage",
          textEn:
            "Personal zone preferences with localStorage persistence",
          category: "Personnalisation",
          categoryEn: "Personalization",
        },
        {
          text: "Système de favoris avec page /favorites dédiée",
          textEn: "Favorites system with dedicated /favorites page",
          category: "Personnalisation",
          categoryEn: "Personalization",
        },
        {
          text: "Filtres avancés : type de terrain, système cible, favoris uniquement",
          textEn:
            "Advanced filters: terrain type, target system, favorites only",
          category: "Personnalisation",
          categoryEn: "Personalization",
        },
        {
          text: "Quiz de recommandation de séances basé sur les objectifs et contraintes",
          textEn:
            "Workout recommendation quiz based on goals and constraints",
          category: "Découverte",
          categoryEn: "Discovery",
        },
        {
          text: "Calculateur de pace pour les temps cibles",
          textEn: "Pace calculator for target times",
          category: "Découverte",
          categoryEn: "Discovery",
        },
        {
          text: "Séance du jour avec sélection quotidienne déterministe",
          textEn:
            "Workout of the Day with deterministic daily selection",
          category: "Découverte",
          categoryEn: "Discovery",
        },
        {
          text: "Français par défaut avec support complet de l'anglais",
          textEn: "French-first with full English support",
          category: "Internationalisation",
          categoryEn: "Internationalization",
        },
        {
          text: "Tous les blocs de séance traduits dans les deux langues",
          textEn: "All workout blocks translated in both languages",
          category: "Internationalisation",
          categoryEn: "Internationalization",
        },
        {
          text: "Détection de langue via localStorage, navigator ou balise HTML",
          textEn:
            "Language detection via localStorage, navigator, or HTML tag",
          category: "Internationalisation",
          categoryEn: "Internationalization",
        },
        {
          text: "Composants shadcn/ui avec primitives Radix",
          textEn: "shadcn/ui components with Radix primitives",
          category: "UI/UX",
          categoryEn: "UI/UX",
        },
        {
          text: "Icônes Lucide dans toute l'application (remplacement des emojis)",
          textEn: "Lucide icons throughout (replaced emoji icons)",
          category: "UI/UX",
          categoryEn: "UI/UX",
        },
        {
          text: "Composants CategoryIcon pour la catégorisation visuelle",
          textEn: "CategoryIcon components for visual categorization",
          category: "UI/UX",
          categoryEn: "UI/UX",
        },
        {
          text: "Tooltips tactiles pour l'accessibilité mobile",
          textEn: "Tap-to-reveal tooltips for mobile accessibility",
          category: "UI/UX",
          categoryEn: "UI/UX",
        },
      ],
      fixed: [
        {
          text: "Parsing des patterns d'intervalles multi-séries (2x12x30s)",
          textEn: "Multi-set interval pattern parsing (2x12x30s)",
        },
        {
          text: "Résultats de secours du quiz triés par durée la plus proche",
          textEn: "Quiz fallback results sorted by closest duration",
        },
        {
          text: "Affichage du message quand aucune correspondance exacte de durée dans le quiz",
          textEn:
            "Message display when no exact duration match in quiz",
        },
        {
          text: "Estimations de durée utilisant le champ typicalDuration",
          textEn: "Duration estimates using typicalDuration field",
        },
        {
          text: "Titres français dans les traductions de la visualisation",
          textEn: "French titles in visualization translations",
        },
        {
          text: "Mappages de types de catégories (vma -> vma_intervals)",
          textEn: "Category type mappings (vma -> vma_intervals)",
        },
      ],
    },
  },
];

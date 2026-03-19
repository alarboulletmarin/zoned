import type { ChangelogVersion } from "./types";

export const changelogVersions: ChangelogVersion[] = [
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
          text: "Page hub /calculateurs avec 7 outils de calcul pour coureurs",
          textEn: "Calculator hub page /calculateurs with 7 running calculator tools",
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
          text: "Génération automatique d'issues GitLab pré-remplies depuis le formulaire",
          textEn:
            "Automatic generation of pre-filled GitLab issues from the form",
          category: "Contribution",
          categoryEn: "Contribution",
        },
        {
          text: "Templates d'issues GitLab pour les soumissions de séances (idée rapide et détaillée)",
          textEn:
            "GitLab issue templates for workout submissions (quick idea and detailed)",
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
          text: "Ajout du lien vers le dépôt GitLab dans le pied de page",
          textEn: "Added GitLab repository link in footer",
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

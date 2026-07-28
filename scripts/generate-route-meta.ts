/**
 * USAGE: bun run scripts/generate-route-meta.ts   (runs as part of `bun run build`)
 *
 * Writes one static HTML shell per public URL so that the metadata a crawler
 * reads before running any JavaScript is already correct for that page.
 *
 * Why this exists:
 *   - Social crawlers (Twitterbot, facebookexternalhit, Slackbot, LinkedInBot,
 *     Discord) never execute JS, so they only ever see what is in the shell.
 *   - Googlebot renders JS, but only on a second pass. Until then the SPA
 *     rewrite in vercel.json served the same index.html for every URL, which
 *     meant ~420 pages declared `rel=canonical` pointing at the homepage.
 *
 * Because vercel.json sets `cleanUrls: true`, Vercel serves dist/library.html
 * for /library *before* falling through to the SPA rewrite — so crawlers get
 * per-route metadata while the React app still boots identically for users.
 *
 * The copy is French: the canonical URL of every page is its French version
 * (the English one is the `?lang=en` alternate, which cannot be addressed by
 * a static file). <SEOHead> takes over at runtime and localises everything.
 *
 * Coverage is asserted against public/sitemap.xml — a URL in the sitemap with
 * no shell here fails the build rather than silently regressing to the
 * homepage canonical.
 *
 * Deliberately string-based: no Puppeteer, no React SSR, no headless Chrome.
 * It runs in milliseconds and therefore works inside a Vercel build, unlike
 * scripts/prerender.ts (local-only, see CLAUDE.md).
 */

import { mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { readSiteStats } from "./site-stats";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const DATA_DIR = join(ROOT, "src/data");
const SITE_URL = "https://zoned.run";

const stats = readSiteStats();

interface RouteMeta {
  /** Route path as served, without trailing slash (except "/"). */
  path: string;
  title: string;
  description: string;
  /** Filename under /public, defaults to the site-wide card. */
  image?: string;
  ogType?: "website" | "article";
  /** Page-specific schema.org entities, appended to WebSite + Organization. */
  jsonLd?: Record<string, unknown>[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Meta descriptions get truncated by search engines past ~160 characters. */
function clamp(value: string, max = 155): string {
  const flat = value.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

function breadcrumb(trail: { name: string; item?: string }[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: entry.name,
      ...(entry.item ? { item: entry.item } : {}),
    })),
  };
}

// ── Static pages ────────────────────────────────────────────────────────────

/** `glossaryTerms` is counted from the term files rather than hardcoded. */
const getStaticRoutes = (glossaryTerms: number): RouteMeta[] => [
  {
    path: "/",
    title: "Zoned — Séances de course scientifiques par zones",
    description: `${stats.workouts} séances structurées, ${stats.plans} plans d'entraînement et ${stats.calculators} calculateurs bâtis sur un modèle à 6 zones. Gratuit, open source, sans compte ni tracking.`,
  },
  {
    path: "/library",
    title: "Bibliothèque de séances",
    description: `Parcourez ${stats.workouts} séances de course, vélo, natation et renforcement en 12 catégories. Filtrez par zone, durée ou matériel, exportez vers Garmin, PDF ou agenda.`,
    image: "og-library.png",
  },
  {
    path: "/library/draw",
    title: "Trouver une séance",
    description:
      "Répondez à quelques questions sur votre forme, votre temps disponible et votre objectif : Zoned vous propose la séance adaptée dans le catalogue.",
    image: "og-library.png",
  },
  {
    path: "/calculators",
    title: "Calculateurs running",
    description: `${stats.calculators} calculateurs gratuits : zones, allures, VMA, FTP, CSS, tapis, équivalences et age-graded. Sans compte, tout reste dans votre navigateur.`,
    image: "og-calculators.png",
  },
  {
    path: "/plan/new/prebuilt",
    title: "Plans d'entraînement prêts à l'emploi",
    description: `${stats.plans} plans d'entraînement du 5 km au marathon avec renforcement périodisé. Adoptez-en un en un clic, puis adaptez-le. Export PDF et agenda.`,
    image: "og-plans.png",
  },
  {
    path: "/plan/new",
    title: "Créer un plan d'entraînement",
    description:
      "Générez un plan personnalisé à partir de votre course, votre niveau et vos disponibilités — ou partez de zéro. Gratuit, sans compte, 100 % local.",
    image: "og-plans.png",
  },
  {
    path: "/plans/methodology",
    title: "Méthodologie des plans",
    description:
      "Comment Zoned construit ses plans : périodisation en phases, progression du volume, placement des séances qualité, affûtage et semaines de récupération.",
    image: "og-plans.png",
  },
  {
    path: "/weeks/new/prebuilt",
    title: "Semaines d'entraînement prêtes à l'emploi",
    description:
      "Des semaines types autonomes — base aérobie 80/20, bloc seuil, bloc côtes, affûtage VO2, semaine de récupération — à adopter sans engager un plan complet.",
    image: "og-plans.png",
  },
  {
    path: "/learn",
    title: "Apprendre",
    description:
      "Articles bilingues sur la science de l'entraînement : polarisé 80/20, seuil, VMA, périodisation et récupération. Appuyés sur Seiler, Billat, Daniels, Coggan.",
    image: "og-learn.png",
  },
  {
    path: "/methodology",
    title: "Méthodologie",
    description:
      "Comment Zoned construit ses séances et ses plans : le modèle à 6 zones, la distribution polarisée 80/20 et la recherche publiée derrière chaque recommandation.",
    image: "og-learn.png",
  },
  {
    path: "/glossary",
    title: "Glossaire du running",
    description: `${glossaryTerms} termes d'entraînement en endurance expliqués sur 9 catégories : zones, physiologie, nutrition, récupération et compétition. Bilingue.`,
    image: "og-learn.png",
  },
  {
    path: "/guides",
    title: "Guides pratiques",
    description:
      "Guides concrets pour l'échauffement, la préparation de course et la nutrition — dont un calculateur d'apports bâti sur la recherche en nutrition sportive.",
    image: "og-learn.png",
  },
  {
    path: "/guides/nutrition",
    title: "Guide nutrition",
    description:
      "S'alimenter en endurance : ratio 1:0,8, 1,8 g/kg de protéines, timing de la caféine, crampes et entraînement digestif. Avec calculateur personnalisé.",
    image: "og-learn.png",
  },
  {
    path: "/guides/race-prep",
    title: "Guide préparation de course",
    description:
      "Tout pour les semaines avant votre course : affûtage, checklist, routine du matin et logistique — pour ne rien laisser à l'improvisation.",
    image: "og-learn.png",
  },
  {
    path: "/guides/warmup",
    title: "Guide de l'échauffement",
    description:
      "Comment s'échauffer avant un footing, un fractionné ou une course : structure progressive, gammes et timing, adaptés à la séance qui suit.",
    image: "og-learn.png",
  },
  {
    path: "/race-simulator",
    title: "Simulateur de course",
    description:
      "Planifiez votre course kilomètre par kilomètre : temps de passage, timing des gels et de l'hydratation, électrolytes et checklist. Export PDF.",
    image: "og-race-simulator.png",
  },
  {
    path: "/collections",
    title: "Collections thématiques",
    description:
      "Des ensembles de séances regroupées par objectif — débuter la course, du 5 km à l'ultra, gagner en vitesse, se renforcer. Une entrée guidée dans le catalogue.",
    image: "og-library.png",
  },
  {
    path: "/nutrition",
    title: "Hub nutrition",
    description:
      "14 sections fondées sur les preuves : ratios glucidiques, cibles protéiques, compléments classés AIS, caféine, crampes et besoins féminins.",
    image: "og-learn.png",
  },
  {
    path: "/routes",
    title: "Générateur de parcours",
    description:
      "Générez un parcours de course réel depuis n'importe quelle adresse : boucle, aller-retour ou point à point, avec dénivelé, distance cible et export GPX.",
  },
  {
    path: "/routes/tracks",
    title: "Trouver une piste d'athlétisme",
    description:
      "Localisez les pistes d'athlétisme autour de vous pour vos séances de fractionné sur 400 m, avec distance et itinéraire.",
  },
  {
    path: "/compare",
    title: "Comparatifs",
    description:
      "Zoned face aux applications d'entraînement payantes : prix, compte requis, données collectées, plans personnalisés, exports et ouverture du code.",
  },
  {
    path: "/about",
    title: "À propos",
    description: `Pourquoi Zoned existe : ${stats.workouts} séances fondées sur la science, ${stats.plans} plans et ${stats.calculators} calculateurs — gratuits, open source, sans compte ni tracking, pour toujours.`,
  },
  {
    path: "/contribute",
    title: "Contribuer",
    description:
      "Proposez une séance, signalez un bug ou améliorez une traduction. Aucun code requis — le formulaire ouvre une issue GitHub pré-remplie.",
  },
  {
    path: "/changelog",
    title: "Journal des versions",
    description:
      "Chaque version de Zoned, ce qui a changé et quand — livré en continu et à ciel ouvert.",
  },
];

// ── Calculators ─────────────────────────────────────────────────────────────

/**
 * Route → i18n key under `calculateurs` in locales/fr/calculators.json. The
 * copy stays in the bundle so the static shell and <SEOHead> never disagree.
 * Asserted exhaustive against App.tsx below.
 */
const CALCULATOR_KEYS: Record<string, string> = {
  "/calculators/zones": "zones",
  "/calculators/allures": "paces",
  "/calculators/convertisseur": "converter",
  "/calculators/table-allures": "paceTable",
  "/calculators/tapis-roulant": "treadmill",
  "/calculators/splits": "splits",
  "/calculators/vma": "vma",
  "/calculators/ftp": "ftp",
  "/calculators/css": "css",
  "/calculators/equivalence": "equivalence",
  "/calculators/age-graded": "ageGraded",
  "/calculators/what-if": "whatIf",
};

function getCalculatorRoutes(): RouteMeta[] {
  const bundle = JSON.parse(
    readFileSync(join(ROOT, "src/i18n/locales/fr/calculators.json"), "utf-8")
  ) as { calculateurs: Record<string, { seoTitle?: string; seoDescription?: string }> };

  const app = readFileSync(join(ROOT, "src/App.tsx"), "utf-8");
  const declared = [...app.matchAll(/path="(\/calculators\/[a-z0-9-]+)"/g)].map((m) => m[1]);

  const missing = declared.filter((p) => !(p in CALCULATOR_KEYS));
  if (missing.length > 0) {
    throw new Error(
      `Calculator routes with no CALCULATOR_KEYS entry: ${missing.join(", ")} — ` +
        `add them so the route keeps its own static metadata.`
    );
  }

  return declared.map((path) => {
    const entry = bundle.calculateurs[CALCULATOR_KEYS[path]];
    if (!entry?.seoTitle || !entry?.seoDescription) {
      throw new Error(`Missing calculateurs.${CALCULATOR_KEYS[path]}.seoTitle/seoDescription in fr/calculators.json`);
    }
    return {
      path,
      title: entry.seoTitle,
      description: clamp(entry.seoDescription),
      image: "og-calculators.png",
      jsonLd: [
        breadcrumb([
          { name: "Accueil", item: `${SITE_URL}/` },
          { name: "Calculateurs", item: `${SITE_URL}/calculators` },
          { name: entry.seoTitle },
        ]),
      ],
    };
  });
}

// ── Data-driven pages ───────────────────────────────────────────────────────

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category?: string;
  difficulty?: string;
  duration?: number;
}

function getWorkoutRoutes(): RouteMeta[] {
  const dir = join(DATA_DIR, "workouts");
  const out: RouteMeta[] = [];

  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const data = JSON.parse(readFileSync(join(dir, file), "utf-8")) as {
      templates?: WorkoutTemplate[];
    };
    for (const w of data.templates ?? []) {
      const description = clamp(w.description);
      out.push({
        path: `/workout/${w.id}`,
        title: w.name,
        description,
        image: "og-library.png",
        ogType: "article",
        jsonLd: [
          {
            "@type": "ExercisePlan",
            name: w.name,
            description,
            url: `${SITE_URL}/workout/${w.id}`,
            exerciseType: "Running",
            isAccessibleForFree: true,
            inLanguage: ["fr-FR", "en-US"],
            ...(w.difficulty ? { intensity: w.difficulty } : {}),
          },
          breadcrumb([
            { name: "Accueil", item: `${SITE_URL}/` },
            { name: "Bibliothèque", item: `${SITE_URL}/library` },
            { name: w.name },
          ]),
        ],
      });
    }
  }

  return out;
}

interface GlossaryTerm {
  id: string;
  term: string;
  acronym?: string;
  shortDefinition: string;
  fullDefinition?: string;
}

async function getGlossaryRoutes(): Promise<RouteMeta[]> {
  const dir = join(DATA_DIR, "glossary/terms");
  const out: RouteMeta[] = [];

  for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
    const mod = await import(join(dir, file));
    for (const exported of Object.values(mod)) {
      if (!Array.isArray(exported)) continue;
      for (const term of exported as GlossaryTerm[]) {
        if (!term?.id) continue;
        const name = term.acronym || term.term;
        const description = clamp(term.shortDefinition);
        out.push({
          path: `/glossary/${term.id}`,
          title: name,
          description,
          image: "og-learn.png",
          jsonLd: [
            {
              "@type": "DefinedTerm",
              name,
              description: clamp(term.fullDefinition ?? term.shortDefinition, 300),
              url: `${SITE_URL}/glossary/${term.id}`,
              ...(term.acronym ? { termCode: term.acronym } : {}),
              inDefinedTermSet: {
                "@type": "DefinedTermSet",
                name: "Glossaire du running",
                url: `${SITE_URL}/glossary`,
              },
            },
            breadcrumb([
              { name: "Accueil", item: `${SITE_URL}/` },
              { name: "Glossaire", item: `${SITE_URL}/glossary` },
              { name },
            ]),
          ],
        });
      }
    }
  }

  return out;
}

async function getArticleRoutes(): Promise<RouteMeta[]> {
  const mod = await import(join(DATA_DIR, "articles/metadata.ts"));
  const articles = (mod.articleMetadata ?? []) as Array<{
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    updatedAt?: string;
  }>;

  return articles.map((a) => ({
    path: `/learn/${a.slug}`,
    title: a.title,
    description: clamp(a.description),
    image: "og-learn.png",
    ogType: "article" as const,
    jsonLd: [
      {
        "@type": "Article",
        headline: a.title,
        description: clamp(a.description),
        url: `${SITE_URL}/learn/${a.slug}`,
        datePublished: a.publishedAt,
        dateModified: a.updatedAt ?? a.publishedAt,
        inLanguage: "fr-FR",
        author: { "@type": "Person", name: "Andrea Larboullet-Marin" },
        publisher: {
          "@type": "Organization",
          name: "Zoned",
          logo: { "@type": "ImageObject", url: `${SITE_URL}/pwa-512x512.png` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/learn/${a.slug}` },
      },
      breadcrumb([
        { name: "Accueil", item: `${SITE_URL}/` },
        { name: "Apprendre", item: `${SITE_URL}/learn` },
        { name: a.title },
      ]),
    ],
  }));
}

async function getCollectionRoutes(): Promise<RouteMeta[]> {
  const mod = await import(join(DATA_DIR, "collections/data.ts"));
  const collections = (mod.collections ?? []) as Array<{
    slug: string;
    name: string;
    description: string;
  }>;

  return collections.map((c) => ({
    path: `/collections/${c.slug}`,
    title: c.name,
    description: clamp(c.description),
    image: "og-library.png",
    jsonLd: [
      breadcrumb([
        { name: "Accueil", item: `${SITE_URL}/` },
        { name: "Collections", item: `${SITE_URL}/collections` },
        { name: c.name },
      ]),
    ],
  }));
}

/** Fill an i18next `{{placeholder}}` template from the French bundle. */
function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? ""));
}

/** The very keys PrebuiltPlanDetailPage renders, so both stay in lockstep. */
function readPrebuiltPlanTemplates(): { title: string; description: string } {
  const bundle = JSON.parse(
    readFileSync(join(ROOT, "src/i18n/locales/fr/plan.json"), "utf-8")
  ) as { prebuilt?: { seoTitle?: string; seoDescription?: string } };

  const title = bundle.prebuilt?.seoTitle;
  const description = bundle.prebuilt?.seoDescription;
  if (!title || !description) {
    throw new Error("Missing prebuilt.seoTitle/seoDescription in fr/plan.json");
  }
  return { title, description };
}

/**
 * Prebuilt plans and prebuilt weeks: one slug-carrying export per file.
 * `titleTemplate` / `descriptionTemplate` come from the same i18n keys the
 * page renders, so the static shell and <SEOHead> never disagree.
 */
async function getPrebuiltRoutes(
  dir: string,
  prefix: string,
  parent: { name: string; item: string },
  image: string,
  templates?: { title: string; description: string }
): Promise<RouteMeta[]> {
  const out: RouteMeta[] = [];

  for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
    const mod = await import(join(dir, file));
    for (const exported of Object.values(mod)) {
      const entry = exported as {
        slug?: string;
        name?: string;
        description?: string;
        totalWeeks?: number;
        sessionsPerWeek?: number;
      };
      if (!entry?.slug || !entry.name) continue;

      const values = {
        name: entry.name,
        weeks: entry.totalWeeks ?? 0,
        sessions: entry.sessionsPerWeek ?? 0,
        desc: entry.description ?? "",
      };
      const title = templates ? interpolate(templates.title, values) : entry.name;
      const description = clamp(
        templates ? interpolate(templates.description, values) : (entry.description ?? "")
      );

      out.push({
        path: `${prefix}/${entry.slug}`,
        title,
        description,
        image,
        jsonLd: [
          {
            "@type": "ExercisePlan",
            name: entry.name,
            description,
            url: `${SITE_URL}${prefix}/${entry.slug}`,
            exerciseType: "Running",
            isAccessibleForFree: true,
            inLanguage: ["fr-FR", "en-US"],
          },
          breadcrumb([
            { name: "Accueil", item: `${SITE_URL}/` },
            parent,
            { name: entry.name },
          ]),
        ],
      });
    }
  }

  return out;
}

async function getCompareRoutes(): Promise<RouteMeta[]> {
  const mod = await import(join(DATA_DIR, "competitors.ts"));
  const competitors = (mod.competitors ?? []) as Array<{
    slug: string;
    nameFr: string;
    descriptionFr: string;
  }>;

  return competitors.map((c) => ({
    path: `/compare/${c.slug}`,
    title: `Zoned vs ${c.nameFr}`,
    description: clamp(c.descriptionFr),
    jsonLd: [
      breadcrumb([
        { name: "Accueil", item: `${SITE_URL}/` },
        { name: "Comparatifs", item: `${SITE_URL}/compare` },
        { name: `Zoned vs ${c.nameFr}` },
      ]),
    ],
  }));
}

// ── HTML emission ───────────────────────────────────────────────────────────

/** Escape a string for use inside a double-quoted HTML attribute. */
function attr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Escape a string for use as HTML text content. */
function text(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** `</script>` inside JSON-LD would close the tag early. */
function jsonLdPayload(entity: Record<string, unknown>): string {
  return JSON.stringify({ "@context": "https://schema.org", ...entity }).replace(
    /<\//g,
    "<\\/"
  );
}

const BASE_LD: Record<string, unknown>[] = [
  {
    "@type": "WebSite",
    name: "Zoned",
    url: SITE_URL,
    inLanguage: ["fr-FR", "en-US"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/library?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@type": "Organization",
    name: "Zoned",
    url: SITE_URL,
    logo: `${SITE_URL}/pwa-512x512.png`,
    founder: { "@type": "Person", name: "Andrea Larboullet-Marin" },
    sameAs: ["https://github.com/alarboulletmarin/zoned"],
  },
];

function buildSeoBlock(route: RouteMeta): string {
  // "/" is the only path that keeps its trailing slash, matching the sitemap.
  const url = route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
  const fullTitle = route.path === "/" ? route.title : `${route.title} | Zoned`;
  const image = `${SITE_URL}/${route.image ?? "og-image.png"}`;
  const alt = `Zoned — ${route.title}`;

  const tags = [
    `<title data-default-seo>${text(fullTitle)}</title>`,
    `<meta data-default-seo name="description" content="${attr(route.description)}" />`,
    `<meta data-default-seo name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`,
    `<link data-default-seo rel="canonical" href="${attr(url)}" />`,
    `<link data-default-seo rel="alternate" hreflang="fr-FR" href="${attr(url)}" />`,
    `<link data-default-seo rel="alternate" hreflang="en-US" href="${attr(`${url}?lang=en`)}" />`,
    `<link data-default-seo rel="alternate" hreflang="x-default" href="${attr(url)}" />`,
    `<meta data-default-seo property="og:type" content="${route.ogType ?? "website"}" />`,
    `<meta data-default-seo property="og:site_name" content="Zoned" />`,
    `<meta data-default-seo property="og:title" content="${attr(fullTitle)}" />`,
    `<meta data-default-seo property="og:description" content="${attr(route.description)}" />`,
    `<meta data-default-seo property="og:url" content="${attr(url)}" />`,
    `<meta data-default-seo property="og:image" content="${attr(image)}" />`,
    `<meta data-default-seo property="og:image:width" content="1200" />`,
    `<meta data-default-seo property="og:image:height" content="630" />`,
    `<meta data-default-seo property="og:image:type" content="image/png" />`,
    `<meta data-default-seo property="og:image:alt" content="${attr(alt)}" />`,
    `<meta data-default-seo property="og:locale" content="fr_FR" />`,
    `<meta data-default-seo property="og:locale:alternate" content="en_US" />`,
    `<meta data-default-seo name="twitter:card" content="summary_large_image" />`,
    `<meta data-default-seo name="twitter:site" content="@zoned_run" />`,
    `<meta data-default-seo name="twitter:title" content="${attr(fullTitle)}" />`,
    `<meta data-default-seo name="twitter:description" content="${attr(route.description)}" />`,
    `<meta data-default-seo name="twitter:image" content="${attr(image)}" />`,
    `<meta data-default-seo name="twitter:image:alt" content="${attr(alt)}" />`,
    ...[...BASE_LD, ...(route.jsonLd ?? [])].map(
      (ld) =>
        `<script data-default-seo type="application/ld+json">${jsonLdPayload(ld)}</script>`
    ),
  ];

  return tags.map((tag) => `    ${tag}`).join("\n");
}

/**
 * Strip every `data-default-seo` tag from the shell and splice the route's own
 * block in at the position the first one occupied.
 */
const TITLE_TAG = /<title\b[^>]*\bdata-default-seo\b[^>]*>[\s\S]*?<\/title>/;
const SCRIPT_TAG = /<script\b[^>]*\bdata-default-seo\b[^>]*>[\s\S]*?<\/script>/;
const VOID_TAG = /<(?:meta|link)\b[^>]*\bdata-default-seo\b[^>]*\/?>/;

function applyRouteMeta(shell: string, route: RouteMeta): string {
  let out = shell;
  let anchor = -1;

  for (const pattern of [TITLE_TAG, SCRIPT_TAG, VOID_TAG]) {
    let match = out.match(pattern);
    while (match?.index !== undefined) {
      if (anchor === -1 || match.index < anchor) anchor = match.index;
      out = out.slice(0, match.index) + out.slice(match.index + match[0].length);
      match = out.match(pattern);
    }
  }

  if (anchor === -1) {
    throw new Error(
      "No [data-default-seo] tags found in dist/index.html — did index.html lose its static SEO block?"
    );
  }

  // Drop the blank line the removals left behind, then insert the new block.
  const before = out.slice(0, anchor).replace(/[ \t]*$/, "");
  const after = out.slice(anchor).replace(/^\s*\n/, "\n");
  return `${before}${buildSeoBlock(route)}\n${after.replace(/^\n/, "")}`;
}

/** dist/library.html for /library, dist/index.html for /. */
function outputPath(routePath: string): string {
  return routePath === "/"
    ? join(DIST, "index.html")
    : join(DIST, `${routePath.replace(/^\//, "")}.html`);
}

/**
 * Every URL the sitemap advertises must have a shell, otherwise it falls back
 * to the SPA rewrite and inherits the homepage canonical.
 */
function assertSitemapCoverage(covered: Set<string>): void {
  const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf-8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(SITE_URL, "")
  );

  const missing = locs.filter((loc) => !covered.has(loc === "" ? "/" : loc));
  if (missing.length > 0) {
    throw new Error(
      `${missing.length} sitemap URL(s) have no static shell and would serve the ` +
        `homepage canonical:\n  ${missing.slice(0, 20).join("\n  ")}` +
        (missing.length > 20 ? `\n  … and ${missing.length - 20} more` : "")
    );
  }
}

async function main() {
  const shellPath = join(DIST, "index.html");
  let shell: string;
  try {
    shell = readFileSync(shellPath, "utf-8");
  } catch {
    throw new Error(`dist/index.html not found — run \`vite build\` before ${import.meta.file}`);
  }

  const glossaryRoutes = await getGlossaryRoutes();

  const routes: RouteMeta[] = [
    ...getStaticRoutes(glossaryRoutes.length),
    ...getCalculatorRoutes(),
    ...getWorkoutRoutes(),
    ...glossaryRoutes,
    ...(await getArticleRoutes()),
    ...(await getCollectionRoutes()),
    ...(await getPrebuiltRoutes(
      join(DATA_DIR, "prebuilt-plans/plans"),
      "/plan/prebuilt",
      { name: "Plans", item: `${SITE_URL}/plan/new/prebuilt` },
      "og-plans.png",
      readPrebuiltPlanTemplates()
    )),
    ...(await getPrebuiltRoutes(
      join(DATA_DIR, "prebuilt-weeks/weeks"),
      "/weeks/prebuilt",
      { name: "Semaines", item: `${SITE_URL}/weeks/new/prebuilt` },
      "og-plans.png"
    )),
    ...(await getCompareRoutes()),
  ];

  const seen = new Set<string>();
  const oversized: string[] = [];
  for (const route of routes) {
    if (seen.has(route.path)) {
      throw new Error(`Duplicate route metadata for ${route.path}`);
    }
    seen.add(route.path);

    // Search engines truncate past roughly these lengths; data-derived copy is
    // already clamped, so anything here is hand-written and worth rewriting.
    const titleLength = `${route.title} | Zoned`.length;
    if (titleLength > 65) oversized.push(`${route.path}: title ${titleLength} chars`);
    if (route.description.length > 160) {
      oversized.push(`${route.path}: description ${route.description.length} chars`);
    }
  }
  if (oversized.length > 0) {
    throw new Error(`Metadata exceeds display limits:\n  ${oversized.join("\n  ")}`);
  }

  assertSitemapCoverage(seen);

  for (const route of routes) {
    const outPath = outputPath(route.path);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, applyRouteMeta(shell, route), "utf-8");
  }

  console.log(`✓ Wrote per-route metadata for ${routes.length} routes into dist/`);
}

await main();

/**
 * USAGE: bun run scripts/generate-route-meta.ts   (runs as part of `bun run build`)
 *
 * Social crawlers — Twitterbot, facebookexternalhit, Slackbot, LinkedInBot,
 * Discord — never execute JavaScript, so they never see the tags <SEOHead>
 * renders at runtime. With the SPA rewrite in vercel.json every URL would
 * otherwise serve the same index.html, meaning one generic preview for the
 * whole site.
 *
 * This pass takes the built dist/index.html and writes one copy per key route
 * with the `data-default-seo` tags rewritten for that page. Because vercel.json
 * sets `cleanUrls: true`, Vercel serves dist/library.html for /library *before*
 * falling through to the SPA rewrite — so crawlers get per-route metadata while
 * the React app still boots and takes over identically for real users.
 *
 * Deliberately string-based: no Puppeteer, no React SSR, no headless Chrome.
 * It runs in milliseconds and therefore works inside a Vercel build, unlike
 * scripts/prerender.ts (local-only, see CLAUDE.md).
 */

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { readSiteStats } from "./site-stats";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const SITE_URL = "https://zoned.run";

const stats = readSiteStats();

interface RouteMeta {
  /** Route path as served, without trailing slash. */
  path: string;
  title: string;
  description: string;
  /** Filename under /public, defaults to the site-wide card. */
  image?: string;
}

/**
 * Public, linkable routes worth their own preview. Private routes (/plans,
 * /favorites, /settings…) are omitted on purpose — they are Disallow-ed in
 * robots.txt and never shared.
 */
const ROUTES: RouteMeta[] = [
  {
    path: "/library",
    title: "Workout Library",
    description: `Browse ${stats.workouts} structured running, cycling, swimming and strength sessions across 12 categories — filter by zone, duration, terrain or equipment, then export to Garmin, PDF or your calendar.`,
    image: "og-library.png",
  },
  {
    path: "/calculators",
    title: "Running Calculators",
    description: `${stats.calculators} free calculators: training zones, pace converter, VMA from a race time, FTP, CSS, treadmill equivalence, age-graded performance and race-day pacing. No account, results stay in your browser.`,
    image: "og-calculators.png",
  },
  {
    path: "/plan/new/prebuilt",
    title: "Ready-Made Training Plans",
    description: `${stats.plans} prebuilt training plans from 5K to marathon, with periodized strength work. Adopt one in a click, then adapt it — calendar view, drag-and-drop, PDF and calendar export.`,
    image: "og-plans.png",
  },
  {
    path: "/plan/new",
    title: "Build a Training Plan",
    description:
      "Generate a personalised multi-week plan from your race, level and weekly schedule — or build one from scratch. Free, no account, everything stays on your device.",
    image: "og-plans.png",
  },
  {
    path: "/learn",
    title: "Learn",
    description:
      "Bilingual articles on training science: polarized 80/20, threshold work, VMA, periodization and recovery — grounded in Seiler, Billat, Daniels and Coggan.",
    image: "og-learn.png",
  },
  {
    path: "/methodology",
    title: "Methodology",
    description:
      "How Zoned builds its sessions and plans: the 6-zone model, the 80/20 polarized distribution, and the published research behind every recommendation.",
    image: "og-learn.png",
  },
  {
    path: "/glossary",
    title: "Running Glossary",
    description:
      "50+ endurance training terms explained across 9 categories — zones, physiology, nutrition, recovery and racing. Bilingual, linked throughout the app.",
    image: "og-learn.png",
  },
  {
    path: "/guides",
    title: "Practical Guides",
    description:
      "Hands-on guides for warm-up, race preparation and nutrition — including a fueling calculator built on current sports-nutrition research.",
    image: "og-learn.png",
  },
  {
    path: "/guides/nutrition",
    title: "Nutrition Guide",
    description:
      "Fueling for endurance: the 1:0.8 carb ratio, 1.8 g/kg protein target, caffeine timing, cramps, heat acclimation and gut training — with a personalised calculator.",
    image: "og-learn.png",
  },
  {
    path: "/guides/race-prep",
    title: "Race Preparation Guide",
    description:
      "Everything for the weeks before your race: taper, race-week checklist, morning routine and logistics — so nothing is left to improvisation.",
    image: "og-learn.png",
  },
  {
    path: "/guides/warmup",
    title: "Warm-Up Guide",
    description:
      "How to warm up properly before easy runs, intervals and races — progressive structure, drills and timing, adapted to the session ahead.",
    image: "og-learn.png",
  },
  {
    path: "/race-simulator",
    title: "Race-Day Simulator",
    description:
      "Plan your race km by km: target splits, gel and hydration timing, electrolyte needs and pre-race checklists. Save your simulations and export them as PDF.",
    image: "og-race-simulator.png",
  },
  {
    path: "/collections",
    title: "Curated Collections",
    description:
      "Curated sets of workouts grouped by goal — start running, 5K to ultra, build speed, get stronger. A guided way into the catalogue.",
    image: "og-library.png",
  },
  {
    path: "/nutrition",
    title: "Nutrition Hub",
    description:
      "14 evidence-based sections on endurance nutrition — carbohydrate ratios, protein targets, AIS-classified supplements, caffeine, cramps and female-specific needs.",
    image: "og-learn.png",
  },
  {
    path: "/about",
    title: "About",
    description: `Why Zoned exists: ${stats.workouts} science-based sessions, ${stats.plans} plans and ${stats.calculators} calculators — free, open source, no account and no tracking, forever.`,
  },
  {
    path: "/contribute",
    title: "Contribute",
    description:
      "Suggest a workout, report a bug or improve a translation. No coding required — the form opens a pre-filled GitHub issue for you.",
  },
  {
    path: "/changelog",
    title: "Changelog",
    description: "Every release of Zoned, what changed and when — shipped continuously and in the open.",
  },
];

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

function buildSeoBlock(route: RouteMeta): string {
  const fullTitle = `${route.title} | Zoned`;
  const url = `${SITE_URL}${route.path}`;
  const image = `${SITE_URL}/${route.image ?? "og-image.png"}`;
  const alt = `Zoned — ${route.title}`;

  const tags = [
    `<title data-default-seo>${text(fullTitle)}</title>`,
    `<meta data-default-seo name="description" content="${attr(route.description)}" />`,
    `<link data-default-seo rel="canonical" href="${attr(url)}" />`,
    `<meta data-default-seo property="og:type" content="website" />`,
    `<meta data-default-seo property="og:site_name" content="Zoned" />`,
    `<meta data-default-seo property="og:title" content="${attr(fullTitle)}" />`,
    `<meta data-default-seo property="og:description" content="${attr(route.description)}" />`,
    `<meta data-default-seo property="og:url" content="${attr(url)}" />`,
    `<meta data-default-seo property="og:image" content="${attr(image)}" />`,
    `<meta data-default-seo property="og:image:width" content="1200" />`,
    `<meta data-default-seo property="og:image:height" content="630" />`,
    `<meta data-default-seo property="og:image:type" content="image/png" />`,
    `<meta data-default-seo property="og:image:alt" content="${attr(alt)}" />`,
    `<meta data-default-seo property="og:locale" content="en_US" />`,
    `<meta data-default-seo property="og:locale:alternate" content="fr_FR" />`,
    `<meta data-default-seo name="twitter:card" content="summary_large_image" />`,
    `<meta data-default-seo name="twitter:title" content="${attr(fullTitle)}" />`,
    `<meta data-default-seo name="twitter:description" content="${attr(route.description)}" />`,
    `<meta data-default-seo name="twitter:image" content="${attr(image)}" />`,
    `<meta data-default-seo name="twitter:image:alt" content="${attr(alt)}" />`,
  ];

  return tags.map((tag) => `    ${tag}`).join("\n");
}

/**
 * Strip every `data-default-seo` tag from the shell and splice the route's own
 * block in at the position the first one occupied.
 */
const TITLE_TAG = /<title\b[^>]*\bdata-default-seo\b[^>]*>[\s\S]*?<\/title>/;
const VOID_TAG = /<(?:meta|link)\b[^>]*\bdata-default-seo\b[^>]*\/?>/;

function applyRouteMeta(shell: string, route: RouteMeta): string {
  let out = shell;
  let anchor = -1;

  for (const pattern of [TITLE_TAG, VOID_TAG]) {
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

function main() {
  const shellPath = join(DIST, "index.html");
  let shell: string;
  try {
    shell = readFileSync(shellPath, "utf-8");
  } catch {
    throw new Error(`dist/index.html not found — run \`vite build\` before ${import.meta.file}`);
  }

  for (const route of ROUTES) {
    const outPath = join(DIST, `${route.path.replace(/^\//, "")}.html`);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, applyRouteMeta(shell, route), "utf-8");
  }

  console.log(`✓ Wrote per-route metadata for ${ROUTES.length} routes into dist/`);
}

main();

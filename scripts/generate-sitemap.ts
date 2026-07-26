/**
 * USAGE: bun run scripts/generate-sitemap.ts
 *
 * Generates public/sitemap.xml from the static route catalogue + data files.
 *
 * What we include:
 *   - All public pages (homepage, hubs, calculators, guides, comparisons)
 *   - All workouts (~220 items)
 *   - All articles, with their per-article publishedAt/updatedAt dates
 *   - All glossary terms
 *   - All curated collections
 *   - All prebuilt training plans
 *
 * What we exclude (matches robots.txt Disallow rules):
 *   - /my-zones, /favorites, /settings, /profile (per-user state)
 *   - /plans (user dashboard), /plan/new/assisted, /plan/new/free
 *   - /plan/:id, /routes/:id (localStorage-only entities)
 *
 * Date strategy:
 *   - Articles get their real publishedAt/updatedAt from metadata.ts.
 *   - Other pages get a stable lastmod derived from the file's mtime so
 *     Google sees a real change signal when content moves, not a "today"
 *     pulse every build.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const SITE_URL = "https://zoned.run";
const ROOT = join(import.meta.dirname, "..");
const DATA_DIR = join(ROOT, "src/data");
const OUTPUT_PATH = join(ROOT, "public/sitemap.xml");

interface WorkoutTemplate {
  id: string;
}

interface UrlEntry {
  loc: string;
  priority: string;
  changefreq: string;
  lastmod: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function fileMtimeIso(path: string): string {
  try {
    return statSync(path).mtime.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

// ── Data extractors ─────────────────────────────────────────────────────────

function getWorkoutIds(): { id: string; lastmod: string }[] {
  const workoutsDir = join(DATA_DIR, "workouts");
  const out: { id: string; lastmod: string }[] = [];

  const files = readdirSync(workoutsDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const fullPath = join(workoutsDir, file);
    const lastmod = fileMtimeIso(fullPath);
    const content = readFileSync(fullPath, "utf-8");
    const data = JSON.parse(content);
    if (data.templates && Array.isArray(data.templates)) {
      for (const workout of data.templates as WorkoutTemplate[]) {
        out.push({ id: workout.id, lastmod });
      }
    }
  }

  return out;
}

interface ArticleEntry {
  slug: string;
  publishedAt: string;
  updatedAt?: string;
}

async function getArticles(): Promise<ArticleEntry[]> {
  // Pull straight from the source-of-truth metadata.ts.
  const mod = await import(join(DATA_DIR, "articles/metadata.ts"));
  const articles = (mod.articleMetadata || []) as Array<{
    slug: string;
    publishedAt: string;
    updatedAt?: string;
  }>;
  return articles.map((a) => ({
    slug: a.slug,
    publishedAt: a.publishedAt,
    updatedAt: a.updatedAt,
  }));
}

async function getGlossaryTermIds(): Promise<{ id: string; lastmod: string }[]> {
  const termsDir = join(DATA_DIR, "glossary/terms");
  const files = readdirSync(termsDir).filter((f) => f.endsWith(".ts"));
  const ids: { id: string; lastmod: string }[] = [];

  for (const file of files) {
    const fullPath = join(termsDir, file);
    const lastmod = fileMtimeIso(fullPath);
    const mod = await import(fullPath);
    const exported = Object.values(mod);
    for (const val of exported) {
      if (Array.isArray(val)) {
        for (const term of val as { id: string }[]) {
          if (term.id) ids.push({ id: term.id, lastmod });
        }
      }
    }
  }

  return ids;
}

async function getCollectionSlugs(): Promise<string[]> {
  const mod = await import(join(DATA_DIR, "collections/data.ts"));
  return ((mod.collections || []) as { slug: string }[]).map((c) => c.slug);
}

async function getPrebuiltPlanSlugs(): Promise<string[]> {
  const plansDir = join(DATA_DIR, "prebuilt-plans/plans");
  const files = readdirSync(plansDir).filter((f) => f.endsWith(".ts"));
  const slugs: string[] = [];

  for (const file of files) {
    const mod = await import(join(plansDir, file));
    for (const exported of Object.values(mod)) {
      const slug = (exported as { slug?: string })?.slug;
      if (slug) slugs.push(slug);
    }
  }

  return slugs;
}

async function getPrebuiltWeekSlugs(): Promise<string[]> {
  const weeksDir = join(DATA_DIR, "prebuilt-weeks/weeks");
  const files = readdirSync(weeksDir).filter((f) => f.endsWith(".ts"));
  const slugs: string[] = [];

  for (const file of files) {
    const mod = await import(join(weeksDir, file));
    for (const exported of Object.values(mod)) {
      const slug = (exported as { slug?: string })?.slug;
      if (slug) slugs.push(slug);
    }
  }

  return slugs;
}

/**
 * Read the calculator routes straight out of the router, which is the source of
 * truth for what actually resolves. Text-matched rather than imported: importing
 * App.tsx would pull in every page module for three strings.
 */
function getCalculatorPaths(): string[] {
  const app = readFileSync(join(ROOT, "src/App.tsx"), "utf-8");
  const paths = [...app.matchAll(/path="(\/calculators\/[a-z0-9-]+)"/g)].map((m) => m[1]);
  return [...new Set(paths)];
}

// ── Sitemap builder ─────────────────────────────────────────────────────────

async function generateSitemap(): Promise<string> {
  const workouts = getWorkoutIds();
  const articles = await getArticles();
  const glossaryTerms = await getGlossaryTermIds();
  const collectionSlugs = await getCollectionSlugs();
  const prebuiltPlanSlugs = await getPrebuiltPlanSlugs();
  const prebuiltWeekSlugs = await getPrebuiltWeekSlugs();
  const calculatorPaths = getCalculatorPaths();

  // Stable lastmod for non-data pages: tied to package.json mtime so it only
  // moves when we ship something new. Beats "today" on every build.
  const pkgMtime = fileMtimeIso(join(ROOT, "package.json"));

  const urls: UrlEntry[] = [
    { loc: "/", priority: "1.0", changefreq: "weekly", lastmod: pkgMtime },
    { loc: "/library", priority: "0.9", changefreq: "weekly", lastmod: pkgMtime },
    { loc: "/learn", priority: "0.8", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/glossary", priority: "0.8", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/about", priority: "0.5", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/collections", priority: "0.7", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/calculators", priority: "0.7", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/methodology", priority: "0.7", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/guides", priority: "0.7", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/plan/new/prebuilt", priority: "0.7", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/plan/new", priority: "0.6", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/plans/methodology", priority: "0.6", changefreq: "yearly", lastmod: pkgMtime },
    { loc: "/changelog", priority: "0.5", changefreq: "weekly", lastmod: pkgMtime },
    { loc: "/contribute", priority: "0.4", changefreq: "yearly", lastmod: pkgMtime },
    // Nutrition hub (canonical landing page)
    { loc: "/nutrition", priority: "0.8", changefreq: "monthly", lastmod: pkgMtime },
    // Guide pages
    { loc: "/guides/nutrition", priority: "0.7", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/guides/race-prep", priority: "0.7", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/guides/warmup", priority: "0.7", changefreq: "monthly", lastmod: pkgMtime },
    // Race simulator
    { loc: "/race-simulator", priority: "0.7", changefreq: "monthly", lastmod: pkgMtime },
    // Curated weeks hub — the standalone-week counterpart of /plan/new/prebuilt.
    // /weeks itself stays out: it is the user's saved-week list, like /plans.
    { loc: "/weeks/new/prebuilt", priority: "0.7", changefreq: "monthly", lastmod: pkgMtime },
    // Public tools with no per-user state
    { loc: "/library/draw", priority: "0.6", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/routes", priority: "0.6", changefreq: "monthly", lastmod: pkgMtime },
    { loc: "/routes/tracks", priority: "0.6", changefreq: "monthly", lastmod: pkgMtime },
  ];

  // Calculators
  for (const path of calculatorPaths) {
    urls.push({ loc: path, priority: "0.7", changefreq: "monthly", lastmod: pkgMtime });
  }

  // Collections
  for (const slug of collectionSlugs) {
    urls.push({ loc: `/collections/${slug}`, priority: "0.6", changefreq: "monthly", lastmod: pkgMtime });
  }

  // Prebuilt plans
  for (const slug of prebuiltPlanSlugs) {
    urls.push({ loc: `/plan/prebuilt/${slug}`, priority: "0.7", changefreq: "monthly", lastmod: pkgMtime });
  }

  // Curated weeks
  for (const slug of prebuiltWeekSlugs) {
    urls.push({ loc: `/weeks/prebuilt/${slug}`, priority: "0.6", changefreq: "monthly", lastmod: pkgMtime });
  }

  // Articles — per-article publishedAt/updatedAt
  for (const a of articles) {
    urls.push({
      loc: `/learn/${a.slug}`,
      priority: "0.8",
      changefreq: "monthly",
      lastmod: a.updatedAt || a.publishedAt,
    });
  }

  // Workouts — lastmod from JSON file mtime
  for (const w of workouts) {
    urls.push({
      loc: `/workout/${w.id}`,
      priority: "0.7",
      changefreq: "monthly",
      lastmod: w.lastmod,
    });
  }

  // Glossary terms
  for (const t of glossaryTerms) {
    urls.push({
      loc: `/glossary/${t.id}`,
      priority: "0.6",
      changefreq: "monthly",
      lastmod: t.lastmod,
    });
  }

  // Compare pages
  urls.push({ loc: "/compare", priority: "0.7", changefreq: "monthly", lastmod: pkgMtime });
  for (const slug of ["runna", "kiprun-pacer", "campus-coach"]) {
    urls.push({ loc: `/compare/${slug}`, priority: "0.7", changefreq: "monthly", lastmod: pkgMtime });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (url) => `  <url>
    <loc>${SITE_URL}${url.loc}</loc>
    <xhtml:link rel="alternate" hreflang="fr-FR" href="${SITE_URL}${url.loc}" />
    <xhtml:link rel="alternate" hreflang="en-US" href="${SITE_URL}${url.loc}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${url.loc}" />
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return xml;
}

const sitemap = await generateSitemap();
writeFileSync(OUTPUT_PATH, sitemap);
console.log(`Sitemap generated at ${OUTPUT_PATH}`);
console.log(`Total URLs: ${sitemap.match(/<url>/g)?.length || 0}`);

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
 *   - Data-driven pages get the commit date of the file they are built from.
 *   - Static pages get the repository HEAD date: their copy lives in the
 *     component and the i18n bundles, both of which move with every release.
 *
 * `lastmod` is omitted entirely when git history is unavailable (shallow CI
 * clone). File mtimes are useless here — on Vercel every file is checked out
 * at build time, so mtime would stamp today's date on all 440 URLs. Google
 * discards a `lastmod` it catches being wrong, so no date beats a fake one.
 *
 * `priority` and `changefreq` are deliberately absent: Google has ignored
 * both since 2023 and they only add bytes.
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { execFileSync } from "child_process";
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
  /** Omitted when git history cannot supply a truthful date. */
  lastmod?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf-8" }).trim();
}

/** True when git can answer "when did this file last change?" honestly. */
const GIT_DATES_AVAILABLE = (() => {
  try {
    return git("rev-parse", "--is-shallow-repository") === "false";
  } catch {
    return false;
  }
})();

if (!GIT_DATES_AVAILABLE) {
  console.warn("! No usable git history — emitting the sitemap without <lastmod>.");
}

const dateCache = new Map<string, string | undefined>();

/** Commit date (YYYY-MM-DD) of the last change to `path`. */
function fileCommitIso(path: string): string | undefined {
  if (!GIT_DATES_AVAILABLE) return undefined;
  const cached = dateCache.get(path);
  if (cached !== undefined || dateCache.has(path)) return cached;

  let date: string | undefined;
  try {
    date = git("log", "-1", "--format=%cs", "--", path) || undefined;
  } catch {
    date = undefined;
  }
  dateCache.set(path, date);
  return date;
}

/** Repository HEAD date, used for pages whose content lives in the app shell. */
const HEAD_DATE = GIT_DATES_AVAILABLE ? (() => {
  try {
    return git("log", "-1", "--format=%cs");
  } catch {
    return undefined;
  }
})() : undefined;

// ── Data extractors ─────────────────────────────────────────────────────────

function getWorkoutIds(): { id: string; lastmod?: string }[] {
  const workoutsDir = join(DATA_DIR, "workouts");
  const out: { id: string; lastmod?: string }[] = [];

  const files = readdirSync(workoutsDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const fullPath = join(workoutsDir, file);
    const lastmod = fileCommitIso(fullPath);
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

async function getGlossaryTermIds(): Promise<{ id: string; lastmod?: string }[]> {
  const termsDir = join(DATA_DIR, "glossary/terms");
  const files = readdirSync(termsDir).filter((f) => f.endsWith(".ts"));
  const ids: { id: string; lastmod?: string }[] = [];

  for (const file of files) {
    const fullPath = join(termsDir, file);
    const lastmod = fileCommitIso(fullPath);
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

interface SlugEntry {
  slug: string;
  lastmod?: string;
}

async function getCollectionSlugs(): Promise<SlugEntry[]> {
  const source = join(DATA_DIR, "collections/data.ts");
  const mod = await import(source);
  const lastmod = fileCommitIso(source);
  return ((mod.collections || []) as { slug: string }[]).map((c) => ({ slug: c.slug, lastmod }));
}

/** Read one-slug-per-file catalogues (prebuilt plans, prebuilt weeks). */
async function getSlugsFromDir(dir: string): Promise<SlugEntry[]> {
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));
  const out: SlugEntry[] = [];

  for (const file of files) {
    const fullPath = join(dir, file);
    const lastmod = fileCommitIso(fullPath);
    const mod = await import(fullPath);
    for (const exported of Object.values(mod)) {
      const slug = (exported as { slug?: string })?.slug;
      if (slug) out.push({ slug, lastmod });
    }
  }

  return out;
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
  const collections = await getCollectionSlugs();
  const prebuiltPlans = await getSlugsFromDir(join(DATA_DIR, "prebuilt-plans/plans"));
  const prebuiltWeeks = await getSlugsFromDir(join(DATA_DIR, "prebuilt-weeks/weeks"));
  const calculatorPaths = getCalculatorPaths();

  // Static pages: their copy lives in the page component and the i18n bundles,
  // so they genuinely move with each release — HEAD is the honest date.
  const shell = HEAD_DATE;

  const urls: UrlEntry[] = [
    { loc: "/", lastmod: shell },
    { loc: "/library", lastmod: shell },
    { loc: "/learn", lastmod: shell },
    { loc: "/glossary", lastmod: shell },
    { loc: "/about", lastmod: shell },
    { loc: "/collections", lastmod: shell },
    { loc: "/calculators", lastmod: shell },
    { loc: "/methodology", lastmod: shell },
    { loc: "/guides", lastmod: shell },
    { loc: "/plan/new/prebuilt", lastmod: shell },
    { loc: "/plan/new", lastmod: shell },
    { loc: "/plans/methodology", lastmod: shell },
    { loc: "/changelog", lastmod: shell },
    { loc: "/contribute", lastmod: shell },
    // Nutrition hub (canonical landing page)
    { loc: "/nutrition", lastmod: shell },
    // Guide pages
    { loc: "/guides/nutrition", lastmod: shell },
    { loc: "/guides/race-prep", lastmod: shell },
    { loc: "/guides/warmup", lastmod: shell },
    // Race simulator
    { loc: "/race-simulator", lastmod: shell },
    // Curated weeks hub — the standalone-week counterpart of /plan/new/prebuilt.
    // /weeks itself stays out: it is the user's saved-week list, like /plans.
    { loc: "/weeks/new/prebuilt", lastmod: shell },
    // Public tools with no per-user state
    { loc: "/library/draw", lastmod: shell },
    { loc: "/routes", lastmod: shell },
    { loc: "/routes/tracks", lastmod: shell },
  ];

  // Calculators
  for (const path of calculatorPaths) {
    urls.push({ loc: path, lastmod: shell });
  }

  // Collections
  for (const c of collections) {
    urls.push({ loc: `/collections/${c.slug}`, lastmod: c.lastmod });
  }

  // Prebuilt plans
  for (const p of prebuiltPlans) {
    urls.push({ loc: `/plan/prebuilt/${p.slug}`, lastmod: p.lastmod });
  }

  // Curated weeks
  for (const w of prebuiltWeeks) {
    urls.push({ loc: `/weeks/prebuilt/${w.slug}`, lastmod: w.lastmod });
  }

  // Articles — per-article publishedAt/updatedAt
  for (const a of articles) {
    urls.push({ loc: `/learn/${a.slug}`, lastmod: a.updatedAt || a.publishedAt });
  }

  // Workouts
  for (const w of workouts) {
    urls.push({ loc: `/workout/${w.id}`, lastmod: w.lastmod });
  }

  // Glossary terms
  for (const t of glossaryTerms) {
    urls.push({ loc: `/glossary/${t.id}`, lastmod: t.lastmod });
  }

  // Compare pages
  urls.push({ loc: "/compare", lastmod: shell });
  for (const slug of ["runna", "kiprun-pacer", "campus-coach"]) {
    urls.push({ loc: `/compare/${slug}`, lastmod: shell });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (url) => `  <url>
    <loc>${SITE_URL}${url.loc}</loc>
    <xhtml:link rel="alternate" hreflang="fr-FR" href="${SITE_URL}${url.loc}" />
    <xhtml:link rel="alternate" hreflang="en-US" href="${SITE_URL}${url.loc}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${url.loc}" />${
      url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ""
    }
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

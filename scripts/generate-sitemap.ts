import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const SITE_URL = "https://zoned.run";
const DATA_DIR = join(import.meta.dirname, "../src/data");
const OUTPUT_PATH = join(import.meta.dirname, "../public/sitemap.xml");

interface WorkoutTemplate {
  id: string;
}

function getWorkoutIds(): string[] {
  const workoutsDir = join(DATA_DIR, "workouts");
  const ids: string[] = [];

  const files = readdirSync(workoutsDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const content = readFileSync(join(workoutsDir, file), "utf-8");
    const data = JSON.parse(content);
    if (data.templates && Array.isArray(data.templates)) {
      for (const workout of data.templates as WorkoutTemplate[]) {
        ids.push(workout.id);
      }
    }
  }

  return ids;
}

function getArticleSlugs(): string[] {
  return [
    "zones",
    "testing-vma",
    "warmup",
    "recovery",
    "nutrition",
    "faq",
    "periodization",
    "supercompensation",
    "tapering",
    "polarized-training",
    "progressive-overload",
    "consistency",
  ];
}

async function getGlossaryTermIds(): Promise<string[]> {
  const termsDir = join(DATA_DIR, "glossary/terms");
  const files = readdirSync(termsDir).filter((f) => f.endsWith(".ts"));
  const ids: string[] = [];

  for (const file of files) {
    const mod = await import(join(termsDir, file));
    const exported = Object.values(mod);
    for (const val of exported) {
      if (Array.isArray(val)) {
        for (const term of val as { id: string }[]) {
          if (term.id) ids.push(term.id);
        }
      }
    }
  }

  return ids;
}

function getCollectionSlugs(): string[] {
  return [
    "debuter-le-running", "anti-stress", "retour-de-blessure", "post-course",
    "pre-course", "séances-mythiques", "objectif-5k", "objectif-10k",
    "objectif-semi", "objectif-marathon", "objectif-ultra", "progresser-vma",
  ];
}

function getPrebuiltPlanSlugs(): string[] {
  return [
    "5k-debutant", "5k-intermediaire", "10k-debutant", "10k-intermediaire",
    "semi-marathon", "marathon", "construction-base", "retour-de-blessure",
  ];
}

function getCalculatorPaths(): string[] {
  return [
    "/calculateurs/zones", "/calculateurs/allures", "/calculateurs/vma",
    "/calculateurs/convertisseur", "/calculateurs/table-allures",
    "/calculateurs/tapis-roulant", "/calculateurs/splits",
    "/calculateurs/equivalence", "/calculateurs/age-graded",
  ];
}

async function generateSitemap(): Promise<string> {
  const workoutIds = getWorkoutIds();
  const articleSlugs = getArticleSlugs();
  const glossaryTermIds = await getGlossaryTermIds();
  const collectionSlugs = getCollectionSlugs();
  const prebuiltPlanSlugs = getPrebuiltPlanSlugs();
  const calculatorPaths = getCalculatorPaths();
  const today = new Date().toISOString().split("T")[0];

  const urls: { loc: string; priority: string; changefreq: string }[] = [
    // Main pages
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/library", priority: "0.9", changefreq: "weekly" },
    { loc: "/learn", priority: "0.8", changefreq: "monthly" },
    { loc: "/glossary", priority: "0.8", changefreq: "monthly" },
    { loc: "/quiz", priority: "0.6", changefreq: "monthly" },
    { loc: "/about", priority: "0.5", changefreq: "monthly" },
    { loc: "/collections", priority: "0.6", changefreq: "monthly" },
    { loc: "/calculateurs", priority: "0.6", changefreq: "monthly" },
    { loc: "/methodology", priority: "0.7", changefreq: "monthly" },
    { loc: "/guides", priority: "0.7", changefreq: "monthly" },
    { loc: "/plan/new/prebuilt", priority: "0.6", changefreq: "monthly" },
    // Guide pages
    { loc: "/guides/nutrition", priority: "0.7", changefreq: "monthly" },
    { loc: "/guides/race-prep", priority: "0.7", changefreq: "monthly" },
    { loc: "/guides/warmup", priority: "0.7", changefreq: "monthly" },
  ];

  // Calculators
  for (const path of calculatorPaths) {
    urls.push({ loc: path, priority: "0.7", changefreq: "monthly" });
  }

  // Collections
  for (const slug of collectionSlugs) {
    urls.push({ loc: `/collections/${slug}`, priority: "0.6", changefreq: "monthly" });
  }

  // Prebuilt plans
  for (const slug of prebuiltPlanSlugs) {
    urls.push({ loc: `/plan/prebuilt/${slug}`, priority: "0.6", changefreq: "monthly" });
  }

  // Articles
  for (const slug of articleSlugs) {
    urls.push({ loc: `/learn/${slug}`, priority: "0.7", changefreq: "monthly" });
  }

  // Workouts
  for (const id of workoutIds) {
    urls.push({ loc: `/workout/${id}`, priority: "0.7", changefreq: "monthly" });
  }

  // Glossary terms
  for (const id of glossaryTermIds) {
    urls.push({ loc: `/glossary/${id}`, priority: "0.6", changefreq: "monthly" });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${SITE_URL}${url.loc}</loc>
    <lastmod>${today}</lastmod>
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

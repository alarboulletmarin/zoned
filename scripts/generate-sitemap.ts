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
  return ["zones", "testing-vma", "warmup", "recovery", "nutrition", "faq"];
}

function getGlossaryTerms(): string[] {
  const glossaryDir = join(DATA_DIR, "glossary/terms");
  try {
    const files = readdirSync(glossaryDir).filter((f) => f.endsWith(".json"));
    return files.map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}

function generateSitemap(): string {
  const workoutIds = getWorkoutIds();
  const articleSlugs = getArticleSlugs();
  const glossaryTerms = getGlossaryTerms();
  const today = new Date().toISOString().split("T")[0];

  const urls: { loc: string; priority: string; changefreq: string }[] = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/library", priority: "0.9", changefreq: "weekly" },
    { loc: "/learn", priority: "0.8", changefreq: "monthly" },
    { loc: "/glossary", priority: "0.7", changefreq: "monthly" },
    { loc: "/about", priority: "0.5", changefreq: "monthly" },
    { loc: "/quiz", priority: "0.6", changefreq: "monthly" },
  ];

  for (const slug of articleSlugs) {
    urls.push({ loc: `/learn/${slug}`, priority: "0.7", changefreq: "monthly" });
  }

  for (const id of workoutIds) {
    urls.push({ loc: `/workout/${id}`, priority: "0.7", changefreq: "monthly" });
  }

  for (const term of glossaryTerms) {
    urls.push({ loc: `/glossary/${term}`, priority: "0.5", changefreq: "monthly" });
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

const sitemap = generateSitemap();
writeFileSync(OUTPUT_PATH, sitemap);
console.log(`Sitemap generated at ${OUTPUT_PATH}`);
console.log(`Total URLs: ${sitemap.match(/<url>/g)?.length || 0}`);

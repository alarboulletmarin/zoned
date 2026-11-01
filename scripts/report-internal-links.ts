/**
 * USAGE: bun run scripts/report-internal-links.ts
 *
 * Compte les liens internes du HTML pret a l'emploi (dist/).
 * Une URL du sitemap sans lien entrant, autre que le sien, est orpheline.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { SEO_HUBS, SEO_TARGETS } from "../src/data/seo/link-targets";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const SITEMAP = join(ROOT, "public/sitemap.xml");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith(".html") && name !== "spa.html") out.push(full);
  }
  return out;
}

function pageUrl(file: string): string {
  const rel = relative(DIST, file).split("\\").join("/");
  if (rel === "index.html") return "/";
  if (rel === "_en.html") return "/?lang=en";
  if (rel.startsWith("_en/")) {
    const path = `/${rel.slice(4).replace(/\.html$/, "")}`;
    return `${path}?lang=en`;
  }
  const path = `/${rel.replace(/\.html$/, "")}`;
  return path;
}

function normalize(href: string): string | null {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  let url = href;
  if (url.startsWith("https://zoned.run")) url = url.slice("https://zoned.run".length) || "/";
  if (url.startsWith("http://") || url.startsWith("https://")) return null;
  if (!url.startsWith("/")) return null;
  url = url.split("#")[0];
  if (/\.(txt|xml|png|svg|jpg|jpeg|webp|ico|webmanifest|css|js|woff2?)$/i.test(url.split("?")[0])) return null;
  if (url === "") return "/";
  return url;
}

const files = walk(DIST);
const inbound = new Map<string, number>();
const outbound = new Map<string, number>();

for (const file of files) {
  const page = pageUrl(file);
  const html = readFileSync(file, "utf-8");
  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/gi)].map((match) => normalize(match[1]));
  let count = 0;
  for (const href of hrefs) {
    if (!href || href === page) continue;
    count += 1;
    inbound.set(href, (inbound.get(href) ?? 0) + 1);
  }
  outbound.set(page, count);
}

const sitemap = readFileSync(SITEMAP, "utf-8");
const locs = [...sitemap.matchAll(/<loc>https:\/\/zoned\.run([^<]*)<\/loc>/g)].map((match) =>
  match[1] === "" ? "/" : match[1],
);

const orphans = locs.filter((loc) => (inbound.get(loc) ?? 0) === 0);

console.log(`Pages HTML : ${files.length}`);
console.log(`URLs du sitemap : ${locs.length}`);
console.log(`Orphelines (dans le sitemap, aucun lien entrant) : ${orphans.length}`);
for (const loc of orphans) console.log(`  ${loc}`);

console.log("\nCibles du maillage (FR et EN) :");
const interesting = [...new Set([...SEO_TARGETS, ...SEO_HUBS].map((target) => target.path))];
for (const path of interesting) {
  const fr = inbound.get(path) ?? 0;
  const en = inbound.get(`${path === "/" ? "/" : path}?lang=en`) ?? 0;
  console.log(`  ${path}  FR ${fr}  EN ${en}`);
}

const ranked = [...inbound.entries()].sort((a, b) => b[1] - a[1]);
console.log("\nPlus liees :");
for (const [path, count] of ranked.slice(0, 15)) console.log(`  ${count}\t${path}`);

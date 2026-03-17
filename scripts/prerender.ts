/**
 * USAGE: bun run scripts/prerender.ts
 *
 * Post-build prerendering script.
 * Serves the built dist/ folder, visits each route with Puppeteer,
 * and saves the fully rendered HTML for SEO crawlers.
 *
 * Run after `vite build`:
 *   bun run build && bun run scripts/prerender.ts
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { createServer } from "http";
import puppeteer from "puppeteer";

const DIST_DIR = join(import.meta.dirname, "../dist");
const SITEMAP_PATH = join(import.meta.dirname, "../public/sitemap.xml");
const PORT = 4173;
const CONCURRENCY = 5;
const SITE_URL = `http://localhost:${PORT}`;

// Parse routes from sitemap.xml
function getRoutesFromSitemap(): string[] {
  const xml = readFileSync(SITEMAP_PATH, "utf-8");
  const matches = xml.matchAll(/<loc>https:\/\/zoned\.run(\/[^<]*)<\/loc>/g);
  return [...matches].map((m) => m[1]);
}

// Simple static file server for dist/
function startServer(): Promise<ReturnType<typeof createServer>> {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = req.url || "/";
      const filePath = url === "/" ? "/index.html" : url;
      const fullPath = join(DIST_DIR, filePath);

      // Try exact file first
      if (existsSync(fullPath) && !fullPath.endsWith("/")) {
        const ext = fullPath.split(".").pop() || "";
        const mimeTypes: Record<string, string> = {
          html: "text/html",
          js: "application/javascript",
          css: "text/css",
          json: "application/json",
          png: "image/png",
          svg: "image/svg+xml",
          ico: "image/x-icon",
          woff: "font/woff",
          woff2: "font/woff2",
          webmanifest: "application/manifest+json",
        };
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
        res.end(readFileSync(fullPath));
        return;
      }

      // SPA fallback: serve index.html for all routes
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(readFileSync(join(DIST_DIR, "index.html")));
    });

    server.listen(PORT, () => resolve(server));
  });
}

// Process routes in batches
async function processInBatches(
  routes: string[],
  browser: Awaited<ReturnType<typeof puppeteer.launch>>,
  batchSize: number
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < routes.length; i += batchSize) {
    const batch = routes.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((route) => prerenderRoute(route, browser))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        success++;
      } else {
        failed++;
        console.error(`  ✗ ${result.reason}`);
      }
    }

    const progress = Math.min(i + batchSize, routes.length);
    process.stdout.write(`\r  Progress: ${progress}/${routes.length} routes`);
  }

  console.log();
  return { success, failed };
}

// Prerender a single route
async function prerenderRoute(
  route: string,
  browser: Awaited<ReturnType<typeof puppeteer.launch>>
): Promise<void> {
  const page = await browser.newPage();

  try {
    // Set French locale for i18n detection
    await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });

    // Block unnecessary resources for speed
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "font", "media"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Set French language in localStorage before page loads
    // i18n detection order: localStorage("zoned-language") → navigator → htmlTag
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(window, "__prerender_localStorage", { value: {} });
    });

    await page.goto(`${SITE_URL}${route}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    // Set localStorage on the correct origin, then reload
    await page.evaluate(() => {
      localStorage.setItem("zoned-language", "fr");
    });
    await page.goto(`${SITE_URL}${route}`, {
      waitUntil: "networkidle0",
      timeout: 15000,
    });

    // Wait for React lazy-loading, data fetching, and react-helmet-async to flush
    await page.waitForFunction(
      () => {
        // Check that react-helmet-async has updated the title (not default)
        const title = document.title;
        const hasHelmet = title !== "Zoned - Scientific Running Workouts" || document.querySelector('[data-rh]');
        // Check that the main content has rendered (no spinner)
        const noSpinner = !document.querySelector('.spinner');
        return hasHelmet || noSpinner;
      },
      { timeout: 10000 }
    ).catch(() => {
      // Fallback: wait a bit more for homepage/simple pages
    });
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 300)));

    // Get the full rendered HTML
    const html = await page.content();

    // Write to dist/<route>/index.html
    const outputDir = join(DIST_DIR, route);
    const outputPath = route === "/" ? join(DIST_DIR, "index.html") : join(outputDir, "index.html");

    if (route !== "/") {
      mkdirSync(dirname(outputPath), { recursive: true });
    }

    writeFileSync(outputPath, html);
  } finally {
    await page.close();
  }
}

// Main
async function main() {
  console.log("🔍 Prerendering Zoned for SEO...\n");

  // Check dist exists
  if (!existsSync(DIST_DIR)) {
    console.error("❌ dist/ not found. Run `bun run build` first.");
    process.exit(1);
  }

  // Get routes from sitemap
  const routes = getRoutesFromSitemap();
  console.log(`  Found ${routes.length} routes in sitemap\n`);

  // Start server
  const server = await startServer();
  console.log(`  Static server on port ${PORT}`);

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  console.log(`  Puppeteer launched (concurrency: ${CONCURRENCY})\n`);

  try {
    const { success, failed } = await processInBatches(routes, browser, CONCURRENCY);
    console.log(`\n✅ Prerendering complete: ${success} success, ${failed} failed`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

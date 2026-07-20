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

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "fs";
import { join, dirname } from "path";
import { createServer } from "http";
import puppeteerCore from "puppeteer-core";
import type { Browser } from "puppeteer-core";

/**
 * Launch a headless Chrome that works in both environments:
 *
 * - **Dev box** uses the full `puppeteer` package; its postinstall already
 *   downloaded a matching Chrome into `node_modules/.cache/puppeteer`.
 * - **Vercel** can't run that binary (the build image lacks libnspr4 and
 *   friends), so we swap in `@sparticuz/chromium`, a self-contained build
 *   designed for serverless runtimes, and drive it with `puppeteer-core`.
 */
async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteerCore.launch({
      headless: true,
      args: [...chromium.args, "--disable-dev-shm-usage"],
      executablePath: await chromium.executablePath(),
      // Desktop viewport so the snapshot keeps the full top-bar nav links
      // (below 1024px the TopBar collapses into the hamburger sheet).
      defaultViewport: { width: 1280, height: 800 },
    });
  }
  const puppeteer = (await import("puppeteer")).default;
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    // Desktop viewport so the snapshot keeps the full top-bar nav links
    // (below 1024px the TopBar collapses into the hamburger sheet).
    defaultViewport: { width: 1280, height: 800 },
  }) as Promise<Browser>;
}

const DIST_DIR = join(import.meta.dirname, "../dist");
const SITEMAP_PATH = join(import.meta.dirname, "../public/sitemap.xml");
const PORT = 4173;
// Concurrency: higher numbers cut wall time linearly but each Chrome tab
// uses ~150-250 MB. Vercel build runners (2 cores, 8 GB) need a tighter
// cap to avoid OOM kills; local dev boxes can push much harder.
const CONCURRENCY = process.env.VERCEL ? 6 : 12;
const SITE_URL = `http://localhost:${PORT}`;

// Parse routes from sitemap.xml
function getRoutesFromSitemap(): string[] {
  const xml = readFileSync(SITEMAP_PATH, "utf-8");
  const matches = xml.matchAll(/<loc>https:\/\/zoned\.run(\/[^<]*)<\/loc>/g);
  return [...matches].map((m) => m[1]);
}

// Simple static file server for dist/
function startServer(): Promise<ReturnType<typeof createServer>> {
  // Snapshot the SPA shell once at boot. The FR pass overwrites
  // dist/index.html with its rendered output, which would break every
  // subsequent route request that falls back to the SPA shell. Caching
  // sidesteps the race and keeps the server stable across passes.
  const spaShell = readFileSync(join(DIST_DIR, "index.html"));

  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = req.url || "/";
      const filePath = url === "/" ? "/index.html" : url;
      const fullPath = join(DIST_DIR, filePath);

      // Try exact file first — but only if it's actually a file. A bare
      // route like /workout/REC-001 matches an existing directory left over
      // from a previous prerender pass; reading it as a file throws EISDIR.
      // For "/" we always serve the cached shell; otherwise the FR pass's
      // own output would feed back into the EN pass.
      if (url !== "/" && existsSync(fullPath) && !fullPath.endsWith("/") && statSync(fullPath).isFile()) {
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
        try {
          const body = readFileSync(fullPath);
          res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
          res.end(body);
          return;
        } catch {
          // File vanished between stat and read; fall through to the shell.
        }
      }

      // SPA fallback: serve the cached shell. Never read from disk here.
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(spaShell);
    });

    server.listen(PORT, () => resolve(server));
  });
}

// Process routes in batches for a given language. Returns the list of
// routes whose SEOHead snapshot didn't catch (rendered=false) so callers
// can retry them.
async function processInBatches(
  routes: string[],
  lang: "fr" | "en",
  browser: Browser,
  batchSize: number,
  options: { waitTimeoutMs?: number } = {}
): Promise<{ success: number; failed: number; unrendered: string[] }> {
  let success = 0;
  let failed = 0;
  const unrendered: string[] = [];

  for (let i = 0; i < routes.length; i += batchSize) {
    const batch = routes.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((route) => prerenderRoute(route, lang, browser, options))
    );

    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        success++;
        if (!result.value.success) {
          unrendered.push(batch[idx]);
        }
      } else {
        failed++;
        unrendered.push(batch[idx]);
        console.error(`  ✗ ${result.reason}`);
      }
    });

    const progress = Math.min(i + batchSize, routes.length);
    process.stdout.write(`\r  [${lang.toUpperCase()}] Progress: ${progress}/${routes.length} routes`);
  }

  console.log();
  return { success, failed, unrendered };
}

// Prerender a single route in a given language. Returns true if SEOHead
// successfully rendered JSON-LD into the document; false if we snapshot
// an empty React shell (signals we should retry the route).
async function prerenderRoute(
  route: string,
  lang: "fr" | "en",
  browser: Browser,
  options: { waitTimeoutMs?: number } = {}
): Promise<{ success: boolean }> {
  const page = await browser.newPage();
  const waitTimeoutMs = options.waitTimeoutMs ?? 8000;

  try {
    const acceptLang = lang === "fr" ? "fr-FR,fr;q=0.9" : "en-US,en;q=0.9";
    await page.setExtraHTTPHeaders({ "Accept-Language": acceptLang });

    // Block unnecessary resources for speed.
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "font", "media", "stylesheet"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Seed localStorage before any script executes so i18next picks the
    // right language on first (and only) load.
    await page.evaluateOnNewDocument((l: string) => {
      try {
        localStorage.setItem("zoned-language", l);
      } catch {
        // ignore
      }
    }, lang);

    await page.goto(`${SITE_URL}${route}`, {
      waitUntil: "networkidle2",
      timeout: 25000,
    });

    // Wait for SEOHead's JSON-LD scripts to land in <head>. Base SEOHead
    // emits 2 site-wide schemas (WebSite + Organization), so >=2 means at
    // least one render commit has happened. We don't fail on timeout —
    // some Vercel boxes are slow to mount React but eventually do; we'd
    // rather snapshot late content than skip it.
    await page
      .waitForFunction(
        () => {
          const tags = document.head.querySelectorAll(
            'script[type="application/ld+json"]'
          );
          return tags.length >= 2;
        },
        { timeout: waitTimeoutMs, polling: 100 }
      )
      .catch(() => {
        // Fallback: trust the HTML check below.
      });

    const html = await page.content();
    // Truth source for "did SEOHead render?": inspect the captured HTML
    // directly. Avoids spurious retries when waitForFunction's polling
    // misses the commit window but the content is still there.
    const ldMatches = html.match(/<script\s+type="application\/ld\+json"/gi) || [];
    const rendered = ldMatches.length >= 2;

    // FR: dist/<route>/index.html — EN: dist/<route>/index.en.html
    const fileName = lang === "fr" ? "index.html" : "index.en.html";
    const outputPath = route === "/"
      ? join(DIST_DIR, fileName)
      : join(DIST_DIR, route, fileName);

    if (route !== "/") {
      mkdirSync(dirname(outputPath), { recursive: true });
    }

    writeFileSync(outputPath, html);
    return { success: rendered };
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

  // Launch browser (full puppeteer locally, @sparticuz/chromium on Vercel)
  const browser = await launchBrowser();
  console.log(`  Puppeteer launched (concurrency: ${CONCURRENCY})\n`);

  try {
    // Pass 1: French (default)
    console.log("  Pass 1: French\n");
    const fr = await processInBatches(routes, "fr", browser, CONCURRENCY);

    // Pass 2: English
    console.log("\n  Pass 2: English\n");
    const en = await processInBatches(routes, "en", browser, CONCURRENCY);

    // Pass 3: Retry routes that snapshotted before SEOHead committed.
    // Lower concurrency + longer timeout so the heavy hub pages
    // (calculators, library, learn) get the resources they need to mount.
    //
    // Cap the retry size: if more than 1/4 of routes "didn't render", the
    // wait condition is the problem, not the routes. Retrying 800+ pages
    // on a Vercel build runner would blow past the 45-minute build limit
    // for no benefit (we already captured their HTML in the first pass).
    const retryCap = Math.floor(routes.length / 4);
    const retryFr = fr.unrendered.slice(0, retryCap);
    const retryEn = en.unrendered.slice(0, retryCap);
    let retryFrResult = { success: 0, failed: 0, unrendered: [] as string[] };
    let retryEnResult = { success: 0, failed: 0, unrendered: [] as string[] };

    if (retryFr.length > 0 || retryEn.length > 0) {
      const skippedFr = fr.unrendered.length - retryFr.length;
      const skippedEn = en.unrendered.length - retryEn.length;
      console.log(
        `\n  Pass 3: Retry (FR: ${retryFr.length}${skippedFr ? ` +${skippedFr} skipped` : ""}, EN: ${retryEn.length}${skippedEn ? ` +${skippedEn} skipped` : ""}) with longer timeout\n`
      );
      if (retryFr.length > 0) {
        retryFrResult = await processInBatches(retryFr, "fr", browser, 3, {
          waitTimeoutMs: 20000,
        });
      }
      if (retryEn.length > 0) {
        retryEnResult = await processInBatches(retryEn, "en", browser, 3, {
          waitTimeoutMs: 20000,
        });
      }
    }

    const totalRoutes = routes.length * 2;
    const totalRendered =
      (fr.success - fr.unrendered.length) +
      (en.success - en.unrendered.length) +
      (retryFrResult.success - retryFrResult.unrendered.length) +
      (retryEnResult.success - retryEnResult.unrendered.length);
    const totalFailed = fr.failed + en.failed + retryFrResult.failed + retryEnResult.failed;
    const stillUnrendered = retryFrResult.unrendered.length + retryEnResult.unrendered.length;

    console.log(
      `\n✅ Prerendering complete: ${totalRendered}/${totalRoutes} fully rendered, ${stillUnrendered} shell-only, ${totalFailed} crashed`
    );
    if (stillUnrendered > 0) {
      console.log(`  Routes still missing SEOHead after retry:`);
      [...retryFrResult.unrendered.map((r) => `    FR: ${r}`), ...retryEnResult.unrendered.map((r) => `    EN: ${r}`)].forEach(
        (line) => console.log(line)
      );
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

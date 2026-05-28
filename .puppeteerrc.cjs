const { join } = require("node:path");

const isVercel = !!process.env.VERCEL;

/**
 * Puppeteer install config.
 *
 * - **Local dev**: download Chrome into `node_modules/.cache/puppeteer`
 *   so the binary stays inside the cache directory that build tools and
 *   Vercel both ignore by default.
 * - **Vercel**: skip the download entirely — the build image lacks the
 *   shared libs (libnspr4, libnss3…) the bundled Chrome needs. We use
 *   `@sparticuz/chromium` at runtime in scripts/prerender.ts instead.
 */
module.exports = {
  skipDownload: isVercel,
  cacheDirectory: join(__dirname, "node_modules", ".cache", "puppeteer"),
};

const { join } = require("node:path");

/**
 * Tell Puppeteer to install Chrome under `node_modules/.cache/puppeteer`.
 *
 * Why: Vercel caches `node_modules` between deploys but NOT `/vercel/.cache`
 * (the default Puppeteer location). Putting the browser binary inside
 * `node_modules/.cache` lets us avoid re-downloading Chrome on every build.
 */
module.exports = {
  cacheDirectory: join(__dirname, "node_modules", ".cache", "puppeteer"),
};

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8")) as { version: string };

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    svgr(),
    tailwindcss(),
    VitePWA({
      // "prompt", not "autoUpdate": a new service worker installs, precaches,
      // then sits in `waiting` until <UpdatePrompt> is told to activate it.
      // Every byte of user data lives in this browser, so a deploy must never
      // reload the page out from under someone mid-edit.
      registerType: "prompt",
      includeAssets: ["favicon.svg", "favicon-32x32.png", "favicon-16x16.png"],
      manifest: {
        // English strings: the install prompt is the first thing an
        // international visitor sees, and the app itself still switches to
        // French automatically from the browser locale.
        name: "Zoned — Endurance Training",
        short_name: "Zoned",
        description:
          "Science-based endurance training: structured workouts, training plans and calculators built on a 6-zone system. No account, no tracking.",
        lang: "en",
        categories: ["health", "fitness", "sports", "lifestyle"],
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        // Drives Chrome's rich install prompt; without both form factors it
        // falls back to the bare icon-and-name dialog.
        // Regenerate with `bun run generate:pwa-screenshots`.
        screenshots: [
          {
            src: "screenshots/wide-home.png",
            sizes: "1280x800",
            type: "image/png",
            form_factor: "wide",
            label: "Structured training, without the noise",
          },
          {
            src: "screenshots/wide-library.png",
            sizes: "1280x800",
            type: "image/png",
            form_factor: "wide",
            label: "Browse the workout library",
          },
          {
            src: "screenshots/narrow-home.png",
            sizes: "540x960",
            type: "image/png",
            form_factor: "narrow",
            label: "Structured training, without the noise",
          },
          {
            src: "screenshots/narrow-library.png",
            sizes: "540x960",
            type: "image/png",
            form_factor: "narrow",
            label: "Browse the workout library",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        globIgnores: ["**/pdfmake*", "**/vfs_fonts*", "**/fitsdk*", "**/garmin*"],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Files served verbatim out of public/, not SPA routes. The navigation
        // fallback hands every navigation index.html, so without this the
        // router receives /licenses.txt, matches nothing and renders its 404 —
        // while curl, having no service worker, gets the real file. No route
        // ends in .txt or .xml, so the pattern cannot swallow a real page.
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/\.(txt|xml)$/],
        // No skipWaiting, no clientsClaim, deliberately. Together with
        // registerType "prompt" they are the whole guarantee: with neither set,
        // no code path can activate a new version behind the app's back.
        //
        // These two used to be true, on the reasoning that mobile users never
        // "close all tabs" and would otherwise be stranded on the first version
        // they cached. That problem is real, and the banner is what answers it:
        // `watchForegroundUpdates` re-checks whenever the app comes back to the
        // foreground, so a resumed PWA is *asked*, not stranded. The 404s that
        // comment accepted — in-flight lazy chunks pointing at hashes the new
        // worker no longer serves — stop happening too, because the old worker
        // keeps serving its own precache until the user consents.
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          // react-dom/client must be listed explicitly: the object form maps
          // resolved entry points, and the /client subpath (where the whole
          // 540KB renderer lives) is a separate entry from "react-dom".
          // Without it the renderer lands in the app entry chunk.
          "vendor-react": ["react", "react-dom", "react-dom/client", "react-router-dom"],
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
          "vendor-i18n": ["i18next", "i18next-browser-languagedetector", "react-i18next"],
        },
      },
    },
  },
});

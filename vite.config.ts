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
      registerType: "autoUpdate",
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
        // skipWaiting + clientsClaim: the new SW activates as soon as it's
        // installed, instead of waiting for every tab to close. Mobile users
        // never "close all tabs" (they just background the browser), so without
        // this they're permanently stuck on whatever version was first cached.
        // The trade-off: in-flight lazy chunks pointing to old hashes can 404
        // mid-navigation; we accept that — a soft reload recovers, and a stale
        // app is worse than one occasional refresh.
        skipWaiting: true,
        clientsClaim: true,
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

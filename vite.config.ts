import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
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
        theme_color: "#F6F5F2",
        background_color: "#F6F5F2",
        display: "standalone",
        // L'app installée ouvre sur le cockpit, pas sur la landing. C'est le
        // sens même d'avoir séparé les deux : "/" est la page publique qu'on
        // partage et qu'un robot indexe, /today est l'écran de quelqu'un qui
        // s'entraîne. Aucune redirection depuis "/" en revanche — ce serait
        // une plaie SEO, et ça rendrait la page marketing inatteignable.
        start_url: "/today",
        scope: "/",
        // Appui long sur l'icône installée. Les trois destinations qu'on
        // ouvre vraiment, sans passer par un écran.
        shortcuts: [
          { name: "Library", short_name: "Library", url: "/library" },
          { name: "New plan", short_name: "New plan", url: "/plan/new" },
          { name: "Calculators", short_name: "Calculators", url: "/calculators" },
        ],
        // Toutes dessinées par scripts/generate-wordmark.mjs depuis
        // public/app-icon.svg, et toutes à fond perdu : le carré d'encre va
        // jusqu'au bord, c'est le système qui pose son masque. Le favicon,
        // lui, garde sa plaque de papier arrondie et ne sert QUE l'onglet.
        // any et maskable sont deux dessins, pas deux usages du même : un
        // masque rond ne garde que le disque inscrit à 80 % du côté, donc le
        // z. y est plus petit, et le générateur refuse de sortir un maskable
        // dont la diagonale déborde de cette zone.
        icons: [
          {
            src: "app-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
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
          // Rien qui ne soit déclaré dans package.json, ni plus ni moins. Un nom de trop ici est une entrée rollup introuvable, donc
          // un build mort : dialog, slider, switch et tabs étaient restés dans
          // la liste après que le projet leur a substitué ses propres
          // primitives (<dialog> natif, ui/slot.tsx), et n'étaient plus dans le
          // lockfile. La CI, qui installe propre, échouait sur le premier ;
          // un node_modules local qui les gardait masquait les trois autres.
          // react-slot est parti aussi : il n'est là qu'en dépendance
          // transitive de dropdown-menu, et il atterrit de toute façon dans ce
          // chunk-ci avec l'importateur qui le tire.
          //
          // react-popover n'entre PAS : il est bien déclaré et utilisé, mais il
          // n'a jamais été listé ici, et l'ajouter ferait entrer son poids dans
          // le chemin de démarrage que le budget Lighthouse borne à 850KB pour
          // ~740 observés. Réparer ce chunk n'est pas l'occasion de le changer.
          "vendor-radix": [
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tooltip",
          ],
          "vendor-i18n": ["i18next", "i18next-browser-languagedetector", "react-i18next"],
        },
      },
    },
  },
});

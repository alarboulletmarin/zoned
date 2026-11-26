import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8")) as { version: string };

/** Le CSS du client n'a rien a faire dans le bundle execute par Bun. */
function ignoreCss(): Plugin {
  return {
    name: "ignore-css-ssr",
    enforce: "pre",
    resolveId(id) {
      if (id.endsWith(".css")) return id;
      return null;
    },
    load(id) {
      if (id.endsWith(".css")) return "export default {}";
      return null;
    },
  };
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    // The day of the build, for example links that must read the same in the
    // prerendered HTML and in the client's first render (AgentsPage).
    __BUILD_DAY__: JSON.stringify(process.env.ZONED_BUILD_DAY ?? new Date().toISOString().slice(0, 10)),
  },
  plugins: [ignoreCss(), react(), svgr()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
      "virtual:pwa-register/react": resolve(import.meta.dirname, "src/prerender/pwa-stub.tsx"),
    },
  },
  ssr: {
    // Le bundle doit tourner sous Bun avec les paquets du projet.
    noExternal: true,
  },
  build: {
    ssr: "src/entry-server.tsx",
    outDir: "dist-ssr",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: "esm",
      },
    },
  },
});

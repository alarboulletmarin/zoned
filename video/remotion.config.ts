import { Config } from "@remotion/cli/config";

// `npx remotion studio` / `render` then need no entry-point argument.
Config.setEntryPoint("./src/index.ts");

// The stage is flat colour and type: JPEG frames at high quality encode faster
// than PNG and H.264 throws away the difference anyway.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);

/**
 * Chrome. Remotion downloads its own by default; an environment that already
 * ships one (a CI image, a container) says so here rather than pulling a second
 * copy. Unset, nothing changes.
 */
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}

/**
 * `?raw` imports a file as its text. The showreel reads the app's official
 * wordmark this way (src/showreel/logo.ts) so it animates the real paths rather
 * than a copy. The bundler's own asset rule also matches `.svg`, so it is told
 * to leave `?raw` requests alone, otherwise both rules claim the module.
 */
Config.overrideWebpackConfig((config) => {
  const rules = (config.module?.rules ?? []).map((rule) =>
    rule && typeof rule === "object" && rule.test instanceof RegExp && rule.test.test("x.svg")
      ? { ...rule, resourceQuery: { not: [/raw/] } }
      : rule,
  );
  return {
    ...config,
    module: { ...config.module, rules: [...rules, { resourceQuery: /raw/, type: "asset/source" }] },
  };
});

Config.setCodec("h264");
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);

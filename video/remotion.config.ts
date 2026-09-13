import { Config } from "@remotion/cli/config";

// `npx remotion studio` / `render` then need no entry-point argument.
Config.setEntryPoint("./src/index.ts");

// The stage is flat colour and type: JPEG frames at high quality encode faster
// than PNG and H.264 throws away the difference anyway.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);

Config.setCodec("h264");
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);

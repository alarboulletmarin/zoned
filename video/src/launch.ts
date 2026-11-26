/**
 * Entry point for the Launch film alone.
 *
 * The main entry (`index.ts`) bundles every film, and the others read
 * `src/data/facts.json` from `bun run sync`. Launch reads none of it, so it gets
 * its own root and renders even when the sync is not run or not working:
 *
 *   npx remotion render src/launch.ts Launch-Square-EN out/Launch-Square-EN.mp4
 */
import { registerRoot } from "remotion";
import { LaunchRoot } from "./LaunchRoot";

registerRoot(LaunchRoot);

/**
 * USAGE:
 *   bun run render                     # all 48: every film, both cuts, both languages
 *   bun run render fr                  # only the French films
 *   bun run render en wide             # only the English 16:9 cuts
 *   bun run render wide                # only the 16:9 cuts, both languages
 *   bun run render Spot-Wide-FR Teaser-Story-EN
 *   bun run render Overview-Wide-EN --frames 90   # quick look, first 90 frames
 *
 * Renders to out/<id>.mp4 and prints what ffprobe actually got, because a file
 * that exists is not the same as a file that plays.
 */

import { execFileSync, spawnSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "out");
const SHOTS = join(ROOT, "public", "shots");

const LANGS = ["fr", "en"] as const;
type Lang = (typeof LANGS)[number];

/**
 * Screens the compositions reference, per language. A missing one fails the
 * render late and cryptically.
 *
 * This list is the `shot` ids in src/compositions/FeatureDemo.tsx plus the
 * library shot the Overview uses. It had drifted twice: `about` was referenced
 * by Feature-Liberte and missing here, while `compare` was still listed after
 * the competitor act was cut. Both directions are bad — one lets a render fail
 * halfway, the other blocks a render on a file nothing reads.
 */
const REQUIRED_SHOTS = [
  "about-desktop.png",
  "about-mobile.png",
  "adjust-desktop.png",
  "adjust-mobile.png",
  "library-desktop.png",
  "library-mobile.png",
  "methodology-desktop.png",
  "methodology-mobile.png",
  "plans-desktop.png",
  "plans-mobile.png",
  "racesim-desktop.png",
  "racesim-mobile.png",
  // Routes renders blank in the phone viewport, so its film uses the browser
  // frame in both cuts and there is no mobile capture to require.
  "routes-desktop.png",
  "science-desktop.png",
  "science-mobile.png",
  "zones-desktop.png",
  "zones-mobile.png",
];

/** Only the languages actually being rendered need their captures on disk. */
function assertShots(langs: Lang[]) {
  const missing = langs.flatMap((lang) =>
    REQUIRED_SHOTS.map((f) => `${lang}/${f}`).filter((f) => !existsSync(join(SHOTS, f))),
  );
  if (!missing.length) return;
  console.error("Missing screenshots:\n  " + missing.join("\n  "));
  console.error(
    `\nRun \`bun run shots --lang ${langs.length > 1 ? "all" : langs[0]}\` first (captures from zoned.run).`,
  );
  process.exit(1);
}

/**
 * `--quiet` prints every id on a single space-separated line, not one per line
 * — splitting on newlines silently yields just the first composition.
 */
function listCompositions(): string[] {
  const raw = execFileSync("npx", ["remotion", "compositions", "--quiet"], {
    cwd: ROOT,
    encoding: "utf-8",
  });
  return raw.split(/\s+/).filter((id) => /^[A-Za-z][A-Za-z0-9-]*$/.test(id));
}

function probe(file: string) {
  const res = spawnSync(
    "ffprobe",
    [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height,r_frame_rate,nb_frames",
      "-of", "csv=p=0",
      file,
    ],
    { encoding: "utf-8" },
  );
  return res.status === 0 ? res.stdout.trim() : "ffprobe unavailable";
}

const langOf = (id: string): Lang => (id.endsWith("-EN") ? "en" : "fr");
const formatOf = (id: string) => (id.includes("-Wide-") ? "wide" : "story");

function main() {
  mkdirSync(OUT, { recursive: true });

  const argv = process.argv.slice(2);
  const framesIndex = argv.indexOf("--frames");
  const frames = framesIndex === -1 ? null : argv[framesIndex + 1];
  // Guard the -1 case: `i !== framesIndex + 1` becomes `i !== 0` when the flag
  // is absent, which silently swallowed the first composition name.
  const selectors = argv.filter(
    (a, i) => a !== "--frames" && (framesIndex === -1 || i !== framesIndex + 1),
  );

  const all = listCompositions();
  let targets = all;

  if (selectors.length) {
    const wants = new Set(selectors.map((s) => s.toLowerCase()));
    // A language or a format on its own narrows; naming both narrows twice, so
    // `render en wide` is the nine-plus-three English landscape cuts and not
    // every English film plus every landscape one.
    const langWanted = LANGS.filter((l) => wants.has(l));
    const formatWanted = (["wide", "story"] as const).filter((f) => wants.has(f));

    targets = all.filter((id) => {
      if (wants.has(id.toLowerCase())) return true;
      if (!langWanted.length && !formatWanted.length) return false;
      const okLang = !langWanted.length || langWanted.includes(langOf(id));
      const okFormat = !formatWanted.length || formatWanted.includes(formatOf(id));
      return okLang && okFormat;
    });
  }

  if (!targets.length) {
    console.error(`Nothing matched ${selectors.join(", ")}.`);
    console.error(`Known compositions:\n  ${all.join("\n  ")}`);
    process.exit(1);
  }

  // Checked after the selection, so rendering only the French films does not
  // require the English captures to exist.
  assertShots([...new Set(targets.map(langOf))]);

  console.log(`Rendering ${targets.length} composition(s)\n`);

  for (const id of targets) {
    const file = join(OUT, `${id}.mp4`);
    const args = ["remotion", "render", id, file];
    if (frames) args.push("--frames", `0-${Number(frames) - 1}`);

    process.stdout.write(`→ ${id}\n`);
    const res = spawnSync("npx", args, { cwd: ROOT, stdio: "inherit" });
    if (res.status !== 0) {
      console.error(`\n✗ ${id} failed`);
      process.exit(res.status ?? 1);
    }
    console.log(`  ✓ ${id}.mp4  [${probe(file)}]\n`);
  }

  console.log(`Videos in ${OUT}`);
}

main();

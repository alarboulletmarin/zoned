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
 * The screens each film puts on the wall, per composition. A missing one fails
 * the render late and cryptically.
 *
 * The ids are the `shot` values in src/compositions/FeatureDemo.tsx, plus the
 * library shot the Overview uses. The list had drifted twice while it was one
 * flat array: `about` was referenced by Feature-Liberte and missing here, while
 * `compare` was still listed after the competitor act was cut. Both directions
 * are bad — one lets a render fail halfway, the other blocks a render on a file
 * nothing reads.
 *
 * Keyed by film, it also stops a subset render from demanding the whole set:
 * rendering the three films the README carries no longer waits on a capture of
 * the route generator, which needs a live routing service to say anything.
 *
 * `routes` has no phone entry on purpose: the page renders blank in the phone
 * viewport, so its film uses the browser frame in both cuts.
 */
const FILM_SHOTS: Record<string, string[]> = {
  Teaser: [],
  Spot: [],
  Overview: ["library"],
  "Feature-Liberte": ["about"],
  "Feature-Adapt": ["adjust"],
  "Feature-Library": ["library"],
  "Feature-Polarise": ["methodology"],
  "Feature-Plans": ["plans"],
  "Feature-Racesim": ["racesim"],
  "Feature-Routes": ["routes"],
  "Feature-Science": ["science"],
  "Feature-Zones": ["zones"],
};

const DEVICES: Record<string, string[]> = { routes: ["desktop"] };

/** `Feature-Science-Story-EN` → `Feature-Science`. */
const filmOf = (id: string) => id.replace(/-(Wide|Story)-(FR|EN)$/, "");

/**
 * Only the captures the selected films actually read, in the languages they
 * are being rendered in.
 */
function assertShots(targets: string[]) {
  const missing = targets.flatMap((id) => {
    const film = filmOf(id);
    const shots = FILM_SHOTS[film];
    if (!shots) {
      console.error(`Unknown film "${film}" — add it to FILM_SHOTS in this script.`);
      process.exit(1);
    }
    return shots.flatMap((shot) =>
      (DEVICES[shot] ?? ["desktop", "mobile"])
        .map((device) => `${langOf(id)}/${shot}-${device}.png`)
        .filter((f) => !existsSync(join(SHOTS, f))),
    );
  });

  const unique = [...new Set(missing)];
  if (!unique.length) return;

  const langs = [...new Set(targets.map(langOf))];
  console.error("Missing screenshots:\n  " + unique.join("\n  "));
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

  // Checked after the selection, so a render asks only for the captures the
  // films it is about to make actually read — in the languages it makes them.
  assertShots(targets);

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

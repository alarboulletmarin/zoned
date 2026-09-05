/**
 * USAGE:
 *   bun run scripts/qa-motion.ts              # every mp4 in out/
 *   bun run scripts/qa-motion.ts Spot-Wide
 *
 * Fails when a film goes still.
 *
 * The first cut of these videos was rejected as flat, and the cause was
 * measurable: every element animated once on entry and then held, so most of
 * each act was a frozen frame with a dissolve at either end. Reviewing stills
 * could never have caught that — a still of a frozen shot looks identical to a
 * still of a moving one.
 *
 * ffmpeg's `freezedetect` reports any span where consecutive frames differ by
 * less than `NOISE`. Anything over `MAX_FREEZE_SEC` is a dead shot.
 */

import { readdirSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";

const OUT = join(import.meta.dirname, "..", "out");

/** Difference below which two frames count as identical. */
const NOISE = 0.0015;
/** A hold longer than this reads as a paused video. */
const MAX_FREEZE_SEC = 0.4;

type Freeze = { start: number; end: number; duration: number };

function detectFreezes(file: string): Freeze[] {
  const res = spawnSync(
    "ffmpeg",
    ["-i", file, "-vf", `freezedetect=n=${NOISE}:d=${MAX_FREEZE_SEC}`, "-map", "0:v:0", "-f", "null", "-"],
    { encoding: "utf-8" },
  );

  const log = res.stderr ?? "";
  const freezes: Freeze[] = [];
  let start: number | null = null;

  for (const line of log.split("\n")) {
    const begin = line.match(/freeze_start:\s*([\d.]+)/);
    if (begin) {
      start = Number(begin[1]);
      continue;
    }
    const end = line.match(/freeze_end:\s*([\d.]+)/);
    if (end && start !== null) {
      const stop = Number(end[1]);
      freezes.push({ start, end: stop, duration: stop - start });
      start = null;
    }
  }

  // A freeze still open at EOF never emits freeze_end.
  const duration = Number(
    spawnSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
      { encoding: "utf-8" },
    ).stdout,
  );
  if (start !== null && Number.isFinite(duration)) {
    freezes.push({ start, end: duration, duration: duration - start });
  }

  return freezes;
}

function main() {
  const only = process.argv.slice(2);
  const files = readdirSync(OUT)
    .filter((f) => f.endsWith(".mp4"))
    .filter((f) => !only.length || only.some((s) => f.toLowerCase().includes(s.toLowerCase())))
    .sort();

  if (!files.length) {
    console.error(`No rendered videos in ${OUT}. Run \`bun run render\` first.`);
    process.exit(1);
  }

  let failed = 0;

  for (const file of files) {
    const freezes = detectFreezes(join(OUT, file));
    const worst = freezes.reduce((max, f) => Math.max(max, f.duration), 0);

    if (!freezes.length) {
      console.log(`  ok   ${file.padEnd(28)} jamais figé`);
      continue;
    }

    failed++;
    console.log(
      `  ✗    ${file.padEnd(28)} ${freezes.length} arrêt(s), le plus long ${worst.toFixed(2)}s`,
    );
    for (const f of freezes.slice(0, 4)) {
      console.log(`         ${f.start.toFixed(2)}s → ${f.end.toFixed(2)}s`);
    }
  }

  console.log(
    failed
      ? `\n${failed}/${files.length} film(s) contiennent un plan figé de plus de ${MAX_FREEZE_SEC}s.`
      : `\n${files.length} film(s) : aucun plan figé.`,
  );
  process.exit(failed ? 1 : 0);
}

main();

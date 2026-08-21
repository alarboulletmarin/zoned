/**
 * USAGE: bun run scripts/generate-brand-icons.ts
 *
 * Generates the whole Zoned Brut brand mark ("la réglette" — six bars, one per
 * training zone) from a single geometry declared below, so the sign can never
 * drift between the app asset, the favicon and the PWA icons.
 *
 * This is NOT scripts/generate-icons.ts: that one builds the Material Symbols
 * UI set. Material Symbols publishes no brand mark, so this one owns it.
 *
 * Outputs:
 *   - src/assets/logo.svg                   the sign alone, transparent, 121×96
 *   - public/favicon.svg                    square variant, ink plate, 48×48
 *   - public/favicon-16x16.png              rasterized from the square variant
 *   - public/favicon-32x32.png
 *   - public/favicon.ico                    16 + 32 + 48, PNG-encoded entries
 *   - public/apple-touch-icon-180x180.png
 *   - public/pwa-64x64.png
 *   - public/pwa-192x192.png
 *   - public/pwa-512x512.png
 *   - public/maskable-icon-512x512.png      réglette shrunk into the safe circle
 *
 * Colours come from src/lib/zoneColors.ts (ZONE_HEX_LIGHT), which
 * scripts/qa-zone-colors.ts already keeps in sync with themes.css — the mark
 * literally is the app's zone ramp, so it must not carry a private copy.
 */

import { writeFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";
import { ZONE_HEX_LIGHT } from "../src/lib/zoneColors";

const ROOT = join(import.meta.dirname, "..");

const INK = "#0b0b0a";

/**
 * The réglette, as specified in the "Zoned Brut — Logo" handoff (piste L4):
 * six bars, bottom-aligned, bar width 16 / gap 5 over a 96-high box, with the
 * zone profile 32 / 100 / 46 / 70 / 40 / 22 %. Z2 is the tallest because the
 * ramp is a training profile, not a crescendo.
 */
const BAR_PERCENTS = [32, 100, 46, 70, 40, 22] as const;
const ZONE_ORDER = [1, 2, 3, 4, 5, 6] as const;

/** Free-standing sign: bar 16, gap 5, height 96 → 121×96. */
const SIGN = { bar: 16, gap: 5, height: 96 };
const SIGN_WIDTH = SIGN.bar * 6 + SIGN.gap * 5; // 121

/**
 * Square plate (favicon / app icon): bar 4, gap 2, 28 tall, sitting 9 above the
 * bottom edge of a 48 box — the handoff's favicon cell, extended back to six
 * bars so the square variant still says "one bar per zone".
 */
const PLATE = { size: 48, bar: 4, gap: 2, height: 28, bottom: 9 };
const PLATE_WIDTH = PLATE.bar * 6 + PLATE.gap * 5; // 34

function bars(
  { bar, gap, height, baseline, x0 }: { bar: number; gap: number; height: number; baseline: number; x0: number },
): string {
  return ZONE_ORDER.map((zone, i) => {
    const h = Math.round((BAR_PERCENTS[i] / 100) * height);
    const x = x0 + i * (bar + gap);
    const y = baseline - h;
    return `  <rect x="${x}" y="${y}" width="${bar}" height="${h}" fill="${ZONE_HEX_LIGHT[zone]}"/>`;
  }).join("\n");
}

function signSvg(): string {
  return `<svg width="${SIGN_WIDTH}" height="${SIGN.height}" viewBox="0 0 ${SIGN_WIDTH} ${SIGN.height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Zoned">
${bars({ bar: SIGN.bar, gap: SIGN.gap, height: SIGN.height, baseline: SIGN.height, x0: 0 })}
</svg>
`;
}

/**
 * @param scale shrink factor about the mark's centre. Maskable icons are
 * cropped to a circle of 80 % of the icon's width, and the réglette's diagonal
 * at full size overflows it.
 */
function plateSvg(scale = 1): string {
  const x0 = (PLATE.size - PLATE_WIDTH) / 2;
  const baseline = PLATE.size - PLATE.bottom;
  const cx = PLATE.size / 2;
  const cy = baseline - PLATE.height / 2;
  const inner = bars({ bar: PLATE.bar, gap: PLATE.gap, height: PLATE.height, baseline, x0 });
  const group =
    scale === 1
      ? inner
      : `  <g transform="translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})">\n${inner}\n  </g>`;
  return `<svg width="${PLATE.size}" height="${PLATE.size}" viewBox="0 0 ${PLATE.size} ${PLATE.size}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Zoned">
  <rect width="${PLATE.size}" height="${PLATE.size}" fill="${INK}"/>
${group}
</svg>
`;
}

async function png(svg: string, size: number): Promise<Buffer> {
  return sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Minimal ICO writer: sharp cannot emit .ico, and the format is a 6-byte
 * header plus one 16-byte directory entry per image. Every Windows since Vista
 * reads PNG-encoded entries, which is what the browsers care about.
 */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const dir: Buffer[] = [];
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    dir.push(entry);
  }
  return Buffer.concat([header, ...dir, ...images.map((i) => i.data)]);
}

function write(rel: string, data: string | Buffer) {
  writeFileSync(join(ROOT, rel), data);
  console.log(`  → ${rel}`);
}

async function main() {
  console.log("Generating Zoned Brut brand marks (réglette L4)...");

  const sign = signSvg();
  const plate = plateSvg();
  const maskable = plateSvg(0.8);

  write("src/assets/logo.svg", sign);
  write("public/favicon.svg", plate);

  const icoSizes = [16, 32, 48];
  const icoPngs = await Promise.all(
    icoSizes.map(async (size) => ({ size, data: await png(plate, size) })),
  );
  write("public/favicon-16x16.png", icoPngs[0].data);
  write("public/favicon-32x32.png", icoPngs[1].data);
  write("public/favicon.ico", ico(icoPngs));

  for (const [rel, size] of [
    ["public/apple-touch-icon-180x180.png", 180],
    ["public/pwa-64x64.png", 64],
    ["public/pwa-192x192.png", 192],
    ["public/pwa-512x512.png", 512],
  ] as const) {
    write(rel, await png(plate, size));
  }

  write("public/maskable-icon-512x512.png", await png(maskable, 512));

  console.log("Done.");
}

main().catch((err) => {
  console.error("Failed to generate brand icons:", err);
  process.exit(1);
});

import sharp from "sharp";
import { join } from "path";

const OUTPUT_PATH = join(import.meta.dirname, "../public/og-image.png");

// OG image dimensions (recommended: 1200x630)
const WIDTH = 1200;
const HEIGHT = 630;

// Zone colors from the app
const ZONE_COLORS = [
  "#22c55e", // Z1 - green
  "#3b82f6", // Z2 - blue
  "#eab308", // Z3 - yellow
  "#f97316", // Z4 - orange
  "#ef4444", // Z5 - red
  "#a855f7", // Z6 - purple
];

async function generateOgImage() {
  // Create SVG with gradient background and text
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f172a"/>
          <stop offset="100%" style="stop-color:#1e293b"/>
        </linearGradient>
        <linearGradient id="zones" x1="0%" y1="0%" x2="100%" y2="0%">
          ${ZONE_COLORS.map((color, i) => `<stop offset="${(i / 5) * 100}%" style="stop-color:${color}"/>`).join("")}
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>

      <!-- Zone stripe at top -->
      <rect x="0" y="0" width="100%" height="8" fill="url(#zones)"/>

      <!-- Zone badges -->
      ${ZONE_COLORS.map((color, i) => `
        <rect x="${180 + i * 150}" y="180" width="60" height="36" rx="6" fill="${color}" opacity="0.9"/>
        <text x="${210 + i * 150}" y="205" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">Z${i + 1}</text>
      `).join("")}

      <!-- Title -->
      <text x="600" y="320" font-family="system-ui, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">Zoned</text>

      <!-- Subtitle -->
      <text x="600" y="400" font-family="system-ui, sans-serif" font-size="32" fill="#94a3b8" text-anchor="middle">Free Structured Running Workouts</text>

      <!-- Stats -->
      <text x="300" y="500" font-family="system-ui, sans-serif" font-size="22" fill="#64748b" text-anchor="middle">200 Workouts</text>
      <text x="480" y="500" font-family="system-ui, sans-serif" font-size="22" fill="#64748b" text-anchor="middle">•</text>
      <text x="600" y="500" font-family="system-ui, sans-serif" font-size="22" fill="#64748b" text-anchor="middle">9 Calculators</text>
      <text x="720" y="500" font-family="system-ui, sans-serif" font-size="22" fill="#64748b" text-anchor="middle">•</text>
      <text x="900" y="500" font-family="system-ui, sans-serif" font-size="22" fill="#64748b" text-anchor="middle">No Account Needed</text>

      <!-- URL -->
      <text x="600" y="580" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#94a3b8" text-anchor="middle">zoned.run</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(OUTPUT_PATH);

  console.log(`OG image generated at ${OUTPUT_PATH}`);
}

generateOgImage();

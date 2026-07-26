/**
 * USAGE: bun run scripts/generate-icons.ts [--check]
 *
 * Generates src/components/icons/index.tsx from Material Symbols (Sharp,
 * weight 600) SVGs shipped by the @material-symbols/svg-600 dev dependency.
 *
 * Why a generator instead of a runtime dependency:
 *   The output is committed, so the app keeps zero icon dependencies at
 *   runtime and Vite can tree-shake per named export — same contract as the
 *   hand-inlined set it replaces.
 *
 * Inputs:
 *   - scripts/data/icon-mapping.csv          export|material|status|note
 *   - node_modules/@material-symbols/svg-600/sharp/<name>.svg
 *   - node_modules/@material-symbols/svg-600/sharp/<name>-fill.svg (optional)
 *
 * Rows whose material name is "-" are brand logos with no Material
 * equivalent; they live in src/components/icons/brand.tsx and are only
 * re-exported here.
 *
 * --check exits non-zero if the committed file is out of date instead of
 * rewriting it, so CI can catch a stale index.tsx.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const MAPPING_PATH = join(ROOT, "scripts/data/icon-mapping.csv");
const SVG_DIR = join(ROOT, "node_modules/@material-symbols/svg-600/sharp");
const PKG_PATH = join(ROOT, "node_modules/@material-symbols/svg-600/package.json");
const OUTPUT_PATH = join(ROOT, "src/components/icons/index.tsx");

/** Rows in icon-mapping.csv. */
interface MappingRow {
  exportName: string;
  materialName: string;
  status: string;
  note: string;
}

/** A Material glyph resolved to its actual path data. */
interface Glyph {
  exportName: string;
  materialName: string;
  viewBox: string;
  outlinePath: string;
  /**
   * null when the package ships no `-fill` counterpart, or when it ships one
   * that is byte-identical to the outline (true for purely geometric glyphs).
   * Either way there is nothing for `filled` to switch to.
   */
  filledPath: string | null;
  /** Distinguishes "no -fill upstream" from "-fill identical to the outline". */
  fillState: "distinct" | "identical" | "absent";
}

function readMapping(): MappingRow[] {
  return readFileSync(MAPPING_PATH, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => {
      const [exportName, materialName, status, note = ""] = line.split("|");
      return { exportName, materialName, status, note };
    });
}

/**
 * Pulls the viewBox and the inner markup out of a Material SVG.
 *
 * The upstream files are a single <svg> wrapping one or more <path d="…"/>
 * with no other attribute, so this stays deliberately narrow: anything it
 * does not recognise is a hard error rather than a silent partial render.
 */
function parseSvg(filePath: string): { viewBox: string; inner: string } {
  const raw = readFileSync(filePath, "utf-8").trim();

  const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) throw new Error(`No viewBox in ${filePath}`);

  const inner = raw.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").trim();
  if (!inner) throw new Error(`Empty <svg> in ${filePath}`);

  const unexpected = inner.replace(/<path d="[^"]*"\s*\/>/g, "").trim();
  if (unexpected) {
    throw new Error(
      `Unsupported markup in ${filePath} (expected only <path d="…"/>): ${unexpected}`,
    );
  }

  return { viewBox, inner };
}

function resolveGlyph(row: MappingRow): Glyph {
  const outlineFile = join(SVG_DIR, `${row.materialName}.svg`);
  if (!existsSync(outlineFile)) {
    throw new Error(
      `${row.exportName}: ${row.materialName}.svg not found in ${SVG_DIR}. ` +
        `Icon names must be verified against the package, never guessed.`,
    );
  }

  const outline = parseSvg(outlineFile);
  const filledFile = join(SVG_DIR, `${row.materialName}-fill.svg`);
  const filled = existsSync(filledFile) ? parseSvg(filledFile) : null;

  if (filled && filled.viewBox !== outline.viewBox) {
    throw new Error(
      `${row.exportName}: ${row.materialName} and its -fill variant disagree on viewBox`,
    );
  }

  const fillState: Glyph["fillState"] = !filled
    ? "absent"
    : filled.inner === outline.inner
      ? "identical"
      : "distinct";

  return {
    exportName: row.exportName,
    materialName: row.materialName,
    viewBox: outline.viewBox,
    outlinePath: outline.inner,
    filledPath: fillState === "distinct" ? filled!.inner : null,
    fillState,
  };
}

function renderComponent(glyph: Glyph): string {
  // `filled` is only destructured when there is something to switch to,
  // otherwise noUnusedLocals would reject the generated file.
  const signature = glyph.filledPath
    ? "{ className, size = 24, filled = false }: IconProps"
    : "{ className, size = 24 }: IconProps";

  const body = glyph.filledPath
    ? `      {filled ? (\n        ${glyph.filledPath}\n      ) : (\n        ${glyph.outlinePath}\n      )}`
    : `      ${glyph.outlinePath}`;

  const fallbackNote =
    glyph.fillState === "absent"
      ? `// No \`${glyph.materialName}-fill\` upstream: \`filled\` silently falls back to the outline.\n`
      : glyph.fillState === "identical"
        ? `// \`${glyph.materialName}-fill\` is identical to the outline upstream: \`filled\` is a no-op.\n`
        : "";

  return (
    `${fallbackNote}export function ${glyph.exportName}(${signature}) {\n` +
    `  return (\n` +
    `    <Svg viewBox="${glyph.viewBox}" size={size} className={className}>\n` +
    `${body}\n` +
    `    </Svg>\n` +
    `  );\n` +
    `}\n`
  );
}

function renderFile(glyphs: Glyph[], brandExports: string[], version: string): string {
  const header = `/**
 * Material Symbols icons — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Regenerate with: bun run generate:icons
 * Generator:       scripts/generate-icons.ts
 * Mapping table:   scripts/data/icon-mapping.csv (rationale in docs/icon-mapping.md)
 *
 * Source:  Material Symbols, Sharp style, weight 600
 *          https://github.com/google/material-design-icons
 *          via the @material-symbols/svg-600 npm package (v${version})
 * Licence: Apache License 2.0, © Google — see licenses/APACHE-2.0.txt
 *          The upstream package ships no NOTICE file, so none is propagated.
 *
 * Modifications applied to the original SVGs:
 *   - each glyph is wrapped in a React component instead of a standalone file
 *   - the <svg> wrapper attributes are rewritten: fixed width/height replaced
 *     by a \`size\` prop, \`fill\` bound to \`currentColor\`, and
 *     \`aria-hidden\`/\`focusable\` added so icons stay out of the a11y tree
 *   - the outline and \`-fill\` path data of a glyph are merged into one
 *     component, selected at runtime by the \`filled\` prop
 *   - the path data itself is copied verbatim, unaltered
 *
 * Brand logos (GithubIcon, StravaIcon) have no Material equivalent and are
 * re-exported from ./brand — that file is hand-maintained.
 */

import type { ReactNode } from "react";
import type { IconProps } from "./types";

export type { IconProps } from "./types";
export { ${brandExports.join(", ")} } from "./brand";

/**
 * Shared <svg> wrapper. The viewBox is supplied per icon rather than fixed
 * globally, so glyphs on a different grid stay renderable.
 */
function Svg({
  viewBox,
  size,
  className,
  children,
}: {
  viewBox: string;
  size: number | string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}
`;

  return [header, ...glyphs.map(renderComponent)].join("\n");
}

function main() {
  const check = process.argv.includes("--check");
  const rows = readMapping();

  const brandExports = rows.filter((r) => r.materialName === "-").map((r) => r.exportName);
  const glyphs = rows.filter((r) => r.materialName !== "-").map(resolveGlyph);

  const version = JSON.parse(readFileSync(PKG_PATH, "utf-8")).version as string;
  const output = renderFile(glyphs, brandExports, version);

  if (check) {
    const current = existsSync(OUTPUT_PATH) ? readFileSync(OUTPUT_PATH, "utf-8") : "";
    if (current !== output) {
      console.error("✗ src/components/icons/index.tsx is out of date — run: bun run generate:icons");
      process.exit(1);
    }
    console.log(`✓ ${glyphs.length} icons up to date`);
    return;
  }

  writeFileSync(OUTPUT_PATH, output);

  const absent = glyphs.filter((g) => g.fillState === "absent");
  const identical = glyphs.filter((g) => g.fillState === "identical");
  console.log(
    `✓ ${glyphs.length} Material icons + ${brandExports.length} brand re-exports → src/components/icons/index.tsx`,
  );
  console.log(
    `  ${glyphs.length - absent.length - identical.length} with a distinct solid variant, ` +
      `${identical.length} whose -fill is identical upstream, ${absent.length} without any -fill`,
  );
  if (absent.length > 0) {
    console.log(`  filled falls back to the outline for: ${absent.map((g) => g.exportName).join(", ")}`);
  }
}

main();

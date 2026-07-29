/**
 * USAGE: bun run scripts/generate-licenses.ts
 *
 * Generates public/licenses.txt — the third-party notices for everything the
 * production bundle redistributes.
 *
 * Why this file has to exist: almost every licence in the dependency tree (MIT,
 * BSD, ISC, Apache-2.0) grants the right to redistribute *on condition* that the
 * copyright notice travels with the copy. Minification strips those comments, so
 * without this file `dist/assets/*.js` ships the code and drops the notice. The
 * repository already documents the material vendored into git (THIRD-PARTY.md);
 * this covers the material that only appears once the site is built.
 *
 * Scope: `dependencies` from package.json plus their transitive `dependencies`.
 * devDependencies are excluded — they never reach the browser. The walk reads
 * each package's own declared deps rather than listing node_modules, which would
 * otherwise sweep in the whole dev toolchain (bun installs the tree flat).
 *
 * Licence texts are reproduced in full, verbatim, including proprietary ones such
 * as the Garmin FIT SDK agreement. Summarising or omitting a notice is the exact
 * failure this file exists to prevent.
 *
 * Output is sorted by package name so the file is deterministic: rebuilding
 * without a dependency change produces a byte-identical result.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const MODULES_DIR = join(ROOT, "node_modules");
const OUTPUT_PATH = join(ROOT, "public/licenses.txt");

/** Filenames that hold a licence text, in the order we prefer them. */
const LICENSE_FILE_PATTERN = /^(LICENSE|LICENCE|COPYING|NOTICE)(\.\w+)?$/i;

interface PackageManifest {
  name?: string;
  version?: string;
  license?: string | { type?: string };
  licenses?: Array<{ type?: string }>;
  author?: string | { name?: string };
  homepage?: string;
  repository?: string | { url?: string };
  dependencies?: Record<string, string>;
}

interface Notice {
  name: string;
  version: string;
  license: string;
  publisher: string;
  url: string;
  text: string;
}

function readManifest(dir: string): PackageManifest | null {
  const path = join(dir, "package.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as PackageManifest;
  } catch {
    return null;
  }
}

/** Normalises the several shapes npm has allowed for `license` over the years. */
function licenseOf(manifest: PackageManifest): string {
  if (typeof manifest.license === "string") return manifest.license;
  if (manifest.license?.type) return manifest.license.type;
  const legacy = manifest.licenses?.map((l) => l.type).filter(Boolean);
  if (legacy?.length) return legacy.join(" OR ");
  return "UNKNOWN";
}

function publisherOf(manifest: PackageManifest): string {
  if (typeof manifest.author === "string") return manifest.author;
  return manifest.author?.name ?? "";
}

function urlOf(manifest: PackageManifest): string {
  if (manifest.homepage) return manifest.homepage;
  const repo =
    typeof manifest.repository === "string"
      ? manifest.repository
      : (manifest.repository?.url ?? "");
  return repo.replace(/^git\+/, "").replace(/\.git$/, "");
}

/**
 * Reads every licence-bearing file in the package. Apache-2.0 packages ship a
 * separate NOTICE whose contents section 4(d) requires us to propagate, so we
 * concatenate rather than take the first match.
 */
function licenseTextOf(dir: string): string {
  const files = readdirSync(dir)
    .filter((f) => LICENSE_FILE_PATTERN.test(f))
    .sort();
  const parts: string[] = [];
  for (const file of files) {
    try {
      const body = readFileSync(join(dir, file), "utf8").trim();
      if (body) parts.push(files.length > 1 ? `--- ${file} ---\n${body}` : body);
    } catch {
      // Unreadable file (a directory named LICENSE, a broken symlink): skip it
      // rather than fail the build, and let the missing-text report flag it.
    }
  }
  return parts.join("\n\n");
}

/**
 * Walks the production dependency graph breadth-first from the direct
 * dependencies, following each package's own declared `dependencies`.
 */
function collectNotices(): { notices: Notice[]; missing: string[] } {
  const rootManifest = readManifest(ROOT);
  const queue = Object.keys(rootManifest?.dependencies ?? {});
  const visited = new Set<string>(queue);
  const notices: Notice[] = [];
  const missing: string[] = [];

  while (queue.length > 0) {
    const name = queue.shift() as string;
    const dir = join(MODULES_DIR, name);
    const manifest = readManifest(dir);
    if (!manifest) {
      missing.push(`${name} (not installed)`);
      continue;
    }

    const text = licenseTextOf(dir);
    if (!text) missing.push(`${name} (no licence file in package)`);

    notices.push({
      name,
      version: manifest.version ?? "",
      license: licenseOf(manifest),
      publisher: publisherOf(manifest),
      url: urlOf(manifest),
      text,
    });

    for (const dep of Object.keys(manifest.dependencies ?? {})) {
      if (!visited.has(dep)) {
        visited.add(dep);
        queue.push(dep);
      }
    }
  }

  notices.sort((a, b) => a.name.localeCompare(b.name, "en"));
  missing.sort((a, b) => a.localeCompare(b, "en"));
  return { notices, missing };
}

function render(notices: Notice[]): string {
  const summary = notices
    .map((n) => `  ${n.name}@${n.version} — ${n.license}`)
    .join("\n");

  const bodies = notices.map((n) => {
    const header = [
      `${n.name}@${n.version}`,
      `Licence: ${n.license}`,
      n.publisher ? `Publisher: ${n.publisher}` : "",
      n.url ? `Source: ${n.url}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const body =
      n.text ||
      "No licence text ships inside this package. Refer to the source " +
        "repository above for the terms.";

    return `${"=".repeat(78)}\n${header}\n${"=".repeat(78)}\n\n${body}`;
  });

  return `Third-party licences bundled into the Zoned web application
${"=".repeat(78)}

Zoned's own source code is MIT licensed — see the LICENSE file in the source
repository at https://github.com/alarboulletmarin/zoned.

This file reproduces the licence of every third-party package Zoned depends on
at runtime, as those licences require. It is generated by
scripts/generate-licenses.ts from the "dependencies" declared in package.json
plus their transitive dependencies; "devDependencies" are excluded.

Some listed packages are not reachable from the browser bundle — code splitting
means a given build may not include all of them. Erring towards one notice too
many is deliberate: a missing notice breaks a licence, a surplus one does not.

Third-party material committed into the repository itself — the Material
Symbols icon set, Lucide, and the Space Grotesk typeface — is documented
separately in THIRD-PARTY.md, with the full texts under licenses/.

Note: the Garmin FIT SDK below is proprietary, not open source. Its agreement is
between Garmin and Zoned; it is reproduced here because Zoned redistributes the
SDK's compiled code, and its terms forbid removing or obscuring its notices. It
grants you no rights over that SDK.

Packages (${notices.length}):

${summary}

${bodies.join("\n\n")}
`;
}

const { notices, missing } = collectNotices();
writeFileSync(OUTPUT_PATH, render(notices), "utf8");

console.log(
  `licenses.txt: ${notices.length} packages -> ${OUTPUT_PATH.replace(ROOT + "/", "")}`,
);
if (missing.length > 0) {
  // Not fatal: a missing text does not block a deploy, but it is the one thing
  // in here a human has to resolve by hand, so it must be visible in the log.
  console.warn(`  ${missing.length} without a bundled licence text:`);
  for (const entry of missing) console.warn(`    - ${entry}`);
}

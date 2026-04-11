/**
 * Check FR/EN parity across every i18n namespace.
 *
 * Fails (exit 1) if:
 *  - a key exists in FR but not EN (or vice-versa)
 *  - a key resolves to a non-string leaf in one language and a string in the other
 *  - a namespace file is missing in one language
 *
 * Usage:
 *   bun run scripts/check-i18n-parity.ts
 *
 * Integrate in pre-commit / CI:
 *   "scripts": { "check:i18n": "bun run scripts/check-i18n-parity.ts" }
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const LOCALES_DIR = join(import.meta.dirname, "../src/i18n/locales");
const LANGS = ["fr", "en"] as const;
type Lang = (typeof LANGS)[number];

type Leaf = string | number | boolean | null;
type JsonValue = Leaf | JsonValue[] | { [k: string]: JsonValue };

interface Issue {
  namespace: string;
  key: string;
  kind: "missing-in-fr" | "missing-in-en" | "type-mismatch" | "empty-string";
  detail?: string;
}

function loadNamespace(lang: Lang, ns: string): JsonValue {
  const path = join(LOCALES_DIR, lang, `${ns}.json`);
  return JSON.parse(readFileSync(path, "utf-8")) as JsonValue;
}

function listNamespaces(): string[] {
  const frFiles = readdirSync(join(LOCALES_DIR, "fr")).filter((f) => f.endsWith(".json"));
  return frFiles.map((f) => f.replace(/\.json$/, "")).sort();
}

function walkKeys(value: JsonValue, prefix = ""): Map<string, JsonValue> {
  const out = new Map<string, JsonValue>();
  if (value === null || typeof value !== "object") {
    out.set(prefix, value);
    return out;
  }
  if (Array.isArray(value)) {
    // Arrays are treated as leaves — the parity check verifies the *shape*, not every element.
    out.set(prefix, value);
    return out;
  }
  for (const [k, v] of Object.entries(value)) {
    const nextKey = prefix ? `${prefix}.${k}` : k;
    const nested = walkKeys(v as JsonValue, nextKey);
    for (const [kk, vv] of nested) out.set(kk, vv);
  }
  return out;
}

function typeOf(v: JsonValue): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function checkNamespace(ns: string): Issue[] {
  const issues: Issue[] = [];
  let fr: JsonValue;
  let en: JsonValue;
  try {
    fr = loadNamespace("fr", ns);
  } catch {
    issues.push({ namespace: ns, key: "*", kind: "missing-in-fr" });
    return issues;
  }
  try {
    en = loadNamespace("en", ns);
  } catch {
    issues.push({ namespace: ns, key: "*", kind: "missing-in-en" });
    return issues;
  }

  const frKeys = walkKeys(fr);
  const enKeys = walkKeys(en);

  for (const [key, frVal] of frKeys) {
    if (!enKeys.has(key)) {
      issues.push({ namespace: ns, key, kind: "missing-in-en" });
      continue;
    }
    const enVal = enKeys.get(key)!;
    const frType = typeOf(frVal);
    const enType = typeOf(enVal);
    if (frType !== enType) {
      issues.push({
        namespace: ns,
        key,
        kind: "type-mismatch",
        detail: `fr=${frType} en=${enType}`,
      });
      continue;
    }
    if (frType === "string" && frVal !== "" && enVal === "") {
      issues.push({ namespace: ns, key, kind: "empty-string", detail: "en is empty" });
    }
    if (frType === "string" && enVal !== "" && frVal === "") {
      issues.push({ namespace: ns, key, kind: "empty-string", detail: "fr is empty" });
    }
  }
  for (const key of enKeys.keys()) {
    if (!frKeys.has(key)) {
      issues.push({ namespace: ns, key, kind: "missing-in-fr" });
    }
  }

  return issues;
}

function main(): void {
  const namespaces = listNamespaces();
  const allIssues: Issue[] = [];

  for (const ns of namespaces) {
    allIssues.push(...checkNamespace(ns));
  }

  const errors = allIssues.filter((i) => i.kind !== "empty-string");
  const warnings = allIssues.filter((i) => i.kind === "empty-string");

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`OK — FR/EN parity across ${namespaces.length} namespaces (${namespaces.join(", ")})`);
    process.exit(0);
  }

  const groupByNs = (issues: Issue[]) => {
    const m = new Map<string, Issue[]>();
    for (const issue of issues) {
      if (!m.has(issue.namespace)) m.set(issue.namespace, []);
      m.get(issue.namespace)!.push(issue);
    }
    return m;
  };

  if (warnings.length > 0) {
    console.warn(`WARN — ${warnings.length} empty-string warning(s) (non-blocking)\n`);
    for (const [ns, issues] of groupByNs(warnings)) {
      console.warn(`  [${ns}] ${issues.length} warning(s)`);
      for (const issue of issues) {
        const detail = issue.detail ? ` (${issue.detail})` : "";
        console.warn(`    - ${issue.key}${detail}`);
      }
      console.warn("");
    }
  }

  if (errors.length === 0) {
    console.log(`OK — FR/EN key parity across ${namespaces.length} namespaces (warnings above)`);
    process.exit(0);
  }

  console.error(`FAIL — ${errors.length} error(s) across ${groupByNs(errors).size} namespace(s)\n`);
  for (const [ns, issues] of groupByNs(errors)) {
    console.error(`  [${ns}] ${issues.length} error(s)`);
    for (const issue of issues) {
      const detail = issue.detail ? ` (${issue.detail})` : "";
      console.error(`    - ${issue.kind}: ${issue.key}${detail}`);
    }
    console.error("");
  }
  process.exit(1);
}

main();

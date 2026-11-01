/**
 * Choisit les liens contextuels d'une page a partir de `link-targets.ts`.
 */

import { SEO_HUBS, SEO_TARGETS, type SeoMatch, type SeoTarget } from "@/data/seo/link-targets";

export type HubLang = "fr" | "en";

export type LinkSource =
  | { kind: "workout"; id: string; category?: string; zone?: number | null; discipline?: string }
  | { kind: "glossary"; id: string; category?: string; zone?: number | null }
  | { kind: "article"; id: string }
  | { kind: "calculator"; id: string }
  | { kind: "page"; id: string };

export interface HubLink {
  path: string;
  anchor: string;
}

const MAX_SPECIFIC = 6;
const MAX_HUBS = 4;

export function sourcePath(source: LinkSource): string {
  switch (source.kind) {
    case "workout":
      return `/workout/${source.id}`;
    case "glossary":
      return `/glossary/${source.id}`;
    case "article":
      return `/learn/${source.id}`;
    case "calculator":
    case "page":
      return source.id;
  }
}

function matchField(rule: SeoMatch | undefined, source: LinkSource): boolean {
  if (!rule) return false;
  if (rule.all) return true;
  if (source.kind === "workout") {
    if (rule.ids?.includes(source.id)) return true;
    if (source.category && rule.categories?.includes(source.category as never)) return true;
    if (source.zone != null && rule.zones?.includes(source.zone)) return true;
    if (source.discipline && rule.disciplines?.includes(source.discipline)) return true;
  }
  if (source.kind === "glossary") {
    if (rule.ids?.includes(source.id)) return true;
    if (source.category && rule.categories?.includes(source.category as never)) return true;
    if (source.zone != null && rule.zones?.includes(source.zone)) return true;
  }
  if (source.kind === "article") {
    if (rule.ids?.includes(source.id)) return true;
  }
  if (source.kind === "calculator" || source.kind === "page") {
    const path = sourcePath(source);
    if (rule.paths?.includes(path) || rule.ids?.includes(source.id)) return true;
  }
  return false;
}

function targetMatches(target: SeoTarget, source: LinkSource): boolean {
  if (target.path === sourcePath(source)) return false;
  switch (source.kind) {
    case "workout":
      return matchField(target.fromWorkouts, source);
    case "glossary":
      return matchField(target.fromGlossary, source);
    case "article":
      return matchField(target.fromArticles, source);
    case "calculator":
      return matchField(target.fromCalculators, source);
    case "page":
      return matchField(target.fromPages, source);
  }
}

function pickAnchor(anchors: string[], seed: string): string {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const index = (hash >>> 0) % anchors.length;
  return anchors[index] ?? anchors[0];
}

function collect(targets: SeoTarget[], source: LinkSource, lang: HubLang, limit: number, seen: Set<string>): HubLink[] {
  const out: HubLink[] = [];
  for (const target of targets) {
    if (out.length >= limit) break;
    if (seen.has(target.path)) continue;
    if (!targetMatches(target, source)) continue;
    const anchors = target.anchors[lang];
    if (!anchors.length) continue;
    seen.add(target.path);
    out.push({
      path: target.path,
      anchor: pickAnchor(anchors, `${source.kind}:${source.id}:${target.path}`),
    });
  }
  return out;
}

export function linksFor(
  source: LinkSource,
  lang: HubLang,
  targets: SeoTarget[] = SEO_TARGETS,
  hubs: SeoTarget[] = SEO_HUBS,
): HubLink[] {
  const seen = new Set<string>();
  const specific = collect(targets, source, lang, MAX_SPECIFIC, seen);
  const broad = collect(hubs, source, lang, MAX_HUBS, seen);
  return [...specific, ...broad];
}

import type {
  CockpitSettings,
  ModuleId,
  OpeningAnimation,
  UnitSystem,
  UserSettings,
} from "@/types/settings";
import { DEFAULT_SETTINGS, MODULE_IDS } from "@/types/settings";
import type { Practice } from "@/types/practice";
import { PRACTICES } from "@/types/practice";

/**
 * Assainir l'objet `zoned-settings` relu du stockage.
 *
 * Le provider faisait `{ ...DEFAULT_SETTINGS, ...JSON.parse(stored) }`, ce qui
 * suffit à faire traverser des champs additifs — mais fait aussi entrer le
 * contenu du stockage **tel quel**, typé comme s'il était valide. Tant que les
 * réglages n'étaient que trois chaînes, le pire cas était un thème inconnu.
 * Avec des tableaux, un `disabledModules: "routes"` (une chaîne, écrite à la
 * main, restaurée d'une sauvegarde bricolée, ou corrompue) fait lever chaque
 * `.includes()` en plein rendu — donc un écran blanc, et pas seulement un
 * réglage ignoré.
 *
 * Même style que `planSchema.ts` : listes blanches littérales, on jette ce
 * qu'on ne reconnaît pas, on ne rejette jamais l'objet entier. Un réglage
 * illisible retombe sur son défaut, les autres survivent.
 */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asUnitSystem(value: unknown): UnitSystem {
  return value === "imperial" || value === "metric" ? value : DEFAULT_SETTINGS.unitSystem;
}

function asOpeningAnimation(value: unknown): OpeningAnimation {
  return value === "always" || value === "never" || value === "system"
    ? value
    : DEFAULT_SETTINGS.openingAnimation;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** Filtre un tableau sur une liste blanche, en écartant les doublons. */
function asKnownList<T extends string>(value: unknown, known: readonly T[]): T[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<T>();
  for (const item of value) {
    if (typeof item === "string" && (known as readonly string[]).includes(item)) {
      seen.add(item as T);
    }
  }
  return [...seen];
}

function asCockpit(value: unknown): CockpitSettings {
  const fallback = DEFAULT_SETTINGS.cockpit;
  if (!isObject(value)) return { ...fallback };
  return {
    resume: asBoolean(value.resume, fallback.resume),
    shortcuts: asBoolean(value.shortcuts, fallback.shortcuts),
    art: asBoolean(value.art, fallback.art),
  };
}

export function sanitizeSettings(raw: unknown): UserSettings {
  if (!isObject(raw)) return { ...DEFAULT_SETTINGS, cockpit: { ...DEFAULT_SETTINGS.cockpit } };
  return {
    unitSystem: asUnitSystem(raw.unitSystem),
    routeGeneratorEnabled: asBoolean(
      raw.routeGeneratorEnabled,
      DEFAULT_SETTINGS.routeGeneratorEnabled,
    ),
    openingAnimation: asOpeningAnimation(raw.openingAnimation),
    enabledPractices: asKnownList<Practice>(raw.enabledPractices, PRACTICES),
    disabledModules: asKnownList<ModuleId>(raw.disabledModules, MODULE_IDS),
    cockpit: asCockpit(raw.cockpit),
  };
}

/** Lire le stockage sans jamais laisser une charge utile cassée faire tomber l'app. */
export function parseStoredSettings(stored: string | null): UserSettings {
  if (!stored) return sanitizeSettings(null);
  try {
    return sanitizeSettings(JSON.parse(stored));
  } catch {
    return sanitizeSettings(null);
  }
}

/** Une surface masquée dans les réglages. Masquer n'est pas désactiver. */
export function isModuleHidden(settings: UserSettings, module: ModuleId): boolean {
  return settings.disabledModules.includes(module);
}

/**
 * Les pratiques à mettre en avant. **Vide veut dire toutes** — on ne montre
 * jamais une app sans pratique parce que personne n'a encore répondu.
 */
export function visiblePractices(settings: UserSettings): readonly Practice[] {
  return settings.enabledPractices.length > 0 ? settings.enabledPractices : PRACTICES;
}

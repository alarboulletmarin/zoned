/**
 * i18n data helpers — pick the right language variant from data objects.
 *
 * Data objects (workouts, metadata, articles) have bilingual fields:
 *   { name: "Footing", nameEn: "Easy run" }
 *
 * These helpers replace the repetitive `isEn ? obj.nameEn : obj.name` pattern.
 */
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";

/**
 * Check if the current language is English.
 * Use for conditional logic (e.g. date format locales).
 */
export function isEnglish(): boolean {
  return i18n.language?.startsWith("en") ?? false;
}

/**
 * React hook version — reactive to language changes.
 */
export function useIsEnglish(): boolean {
  const { i18n: i18nInstance } = useTranslation();
  return i18nInstance.language?.startsWith("en") ?? false;
}

/**
 * Pick the localized field from a data object.
 *
 * @example
 *   pickLang(workout, "name")             // returns workout.nameEn (en) or workout.name (fr)
 *   pickLang(zoneMeta, "label")           // returns zoneMeta.labelEn or zoneMeta.label
 *   pickLang(item, "description", "")     // with fallback
 */
export function pickLang<T extends object, K extends string>(
  obj: T | null | undefined,
  field: K,
  fallback?: string,
): string {
  if (!obj) return fallback ?? "";
  const record = obj as Record<string, unknown>;
  const en = record[`${field}En`];
  // Try `field` first (e.g. `name`), then `${field}Fr` (e.g. `nameFr`)
  const fr = record[field] ?? record[`${field}Fr`];
  const value = isEnglish() ? (en ?? fr) : (fr ?? en);
  return (value as string | undefined) ?? fallback ?? "";
}

/**
 * React hook version — reactive to language changes.
 * Use this inside components when you want re-renders on language switch.
 */
export function usePickLang() {
  const isEn = useIsEnglish();
  return <T extends object, K extends string>(
    obj: T | null | undefined,
    field: K,
    fallback?: string,
  ): string => {
    if (!obj) return fallback ?? "";
    const record = obj as Record<string, unknown>;
    const en = record[`${field}En`];
    // Try `field` first (e.g. `name`), then `${field}Fr` (e.g. `nameFr`)
    const fr = record[field] ?? record[`${field}Fr`];
    const value = isEn ? (en ?? fr) : (fr ?? en);
    return (value as string | undefined) ?? fallback ?? "";
  };
}

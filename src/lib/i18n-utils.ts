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

/**
 * Pick the localized array field from a data object.
 * Same fallback logic as `pickLang` but for array-typed fields.
 *
 * @example
 *   pickLangArray<string>(workout, "coachingTips")  // workout.coachingTipsEn or workout.coachingTips
 */
export function pickLangArray<T = unknown>(
  obj: object | null | undefined,
  field: string,
): T[] {
  if (!obj) return [];
  const record = obj as Record<string, unknown>;
  const en = record[`${field}En`];
  const fr = record[field] ?? record[`${field}Fr`];
  const value = isEnglish() ? (en ?? fr) : (fr ?? en);
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * React hook version of `pickLangArray` — reactive to language changes.
 */
export function usePickLangArray() {
  const isEn = useIsEnglish();
  return <T = unknown>(
    obj: object | null | undefined,
    field: string,
  ): T[] => {
    if (!obj) return [];
    const record = obj as Record<string, unknown>;
    const en = record[`${field}En`];
    const fr = record[field] ?? record[`${field}Fr`];
    const value = isEn ? (en ?? fr) : (fr ?? en);
    return Array.isArray(value) ? (value as T[]) : [];
  };
}

/**
 * Pick the right string from a `{fr, en}` shaped locale object.
 * Use for static label maps: `{sessionType: {fr: "…", en: "…"}}`.
 *
 * @example
 *   pickLocale(SESSION_TYPE_LABELS[type])
 */
export function pickLocale(
  obj: { fr: string; en: string } | null | undefined,
  fallback: string = "",
): string {
  if (!obj) return fallback;
  return isEnglish() ? obj.en : obj.fr;
}

/**
 * React hook version of `pickLocale` — reactive to language changes.
 */
export function usePickLocale() {
  const isEn = useIsEnglish();
  return (
    obj: { fr: string; en: string } | null | undefined,
    fallback: string = "",
  ): string => {
    if (!obj) return fallback;
    return isEn ? obj.en : obj.fr;
  };
}

function getDateLocale(): string {
  return isEnglish() ? "en-GB" : "fr-FR";
}

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  const d = typeof date === "string" ? new Date(date + (date.length === 10 ? "T00:00:00" : "")) : date;
  return d.toLocaleDateString(getDateLocale(), options);
}

export function formatDateShort(date: Date | string): string {
  return formatDate(date, { day: "numeric", month: "short" });
}

export function formatDateMedium(date: Date | string): string {
  return formatDate(date, { day: "numeric", month: "long", year: "numeric" });
}

export function formatWeekday(date: Date | string): string {
  return formatDate(date, { weekday: "long" });
}

export function getDateInputLang(): string {
  return isEnglish() ? "en" : "fr";
}

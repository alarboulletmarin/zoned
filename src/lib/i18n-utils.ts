/**
 * i18n data helpers, pick the right language variant from data objects.
 *
 * Data objects (workouts, metadata, articles) have bilingual fields:
 *   { name: "Footing", nameEn: "Easy run" }
 *
 * These helpers replace the repetitive `isEn ? obj.nameEn : obj.name` pattern.
 */
import i18n, { type SupportedLanguage } from "@/i18n";
import { useTranslation } from "react-i18next";

/**
 * Return the active supported language ("fr" | "en" | "it").
 */
export function getLanguage(): SupportedLanguage {
  const code = i18n.language?.split("-")[0];
  if (code === "en" || code === "it") return code;
  return "fr";
}

/**
 * React hook version, reactive to language changes.
 */
export function useLanguage(): SupportedLanguage {
  const { i18n: i18nInstance } = useTranslation();
  const code = i18nInstance.language?.split("-")[0];
  if (code === "en" || code === "it") return code;
  return "fr";
}

/**
 * Check if the current language is English.
 * Use for conditional logic (e.g. date format locales).
 */
export function isEnglish(): boolean {
  return i18n.language?.startsWith("en") ?? false;
}

/**
 * React hook version, reactive to language changes.
 */
export function useIsEnglish(): boolean {
  const { i18n: i18nInstance } = useTranslation();
  return i18nInstance.language?.startsWith("en") ?? false;
}

function pickFromRecord<T>(
  record: Record<string, unknown>,
  field: string,
  lang: SupportedLanguage,
): T | undefined {
  const en = record[`${field}En`];
  const fr = record[field] ?? record[`${field}Fr`];
  if (lang === "it") {
    const it = record[`${field}It`];
    return (it ?? en ?? fr) as T | undefined;
  }
  if (lang === "en") {
    return (en ?? fr) as T | undefined;
  }
  return (fr ?? en) as T | undefined;
}

/**
 * Pick the localized field from a data object.
 *
 * @example
 *   pickLang(workout, "name")             // returns workout.nameIt (it), workout.nameEn (en), or workout.name (fr)
 *   pickLang(zoneMeta, "label")           // returns zoneMeta.labelIt, zoneMeta.labelEn, or zoneMeta.label
 *   pickLang(item, "description", "")     // with fallback
 */
export function pickLang<T extends object, K extends string>(
  obj: T | null | undefined,
  field: K,
  fallback?: string,
): string {
  if (!obj) return fallback ?? "";
  return pickFromRecord<string>(obj as Record<string, unknown>, field, getLanguage()) ?? fallback ?? "";
}

/**
 * React hook version, reactive to language changes.
 * Use this inside components when you want re-renders on language switch.
 */
export function usePickLang() {
  const lang = useLanguage();
  return <T extends object, K extends string>(
    obj: T | null | undefined,
    field: K,
    fallback?: string,
  ): string => {
    if (!obj) return fallback ?? "";
    return pickFromRecord<string>(obj as Record<string, unknown>, field, lang) ?? fallback ?? "";
  };
}

/**
 * Pick the localized array field from a data object.
 * Same fallback logic as `pickLang` but for array-typed fields.
 *
 * @example
 *   pickLangArray<string>(workout, "coachingTips")
 */
export function pickLangArray<T = unknown>(
  obj: object | null | undefined,
  field: string,
): T[] {
  if (!obj) return [];
  const value = pickFromRecord<unknown>(obj as Record<string, unknown>, field, getLanguage());
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * React hook version of `pickLangArray`, reactive to language changes.
 */
export function usePickLangArray() {
  const lang = useLanguage();
  return <T = unknown>(
    obj: object | null | undefined,
    field: string,
  ): T[] => {
    if (!obj) return [];
    const value = pickFromRecord<unknown>(obj as Record<string, unknown>, field, lang);
    return Array.isArray(value) ? (value as T[]) : [];
  };
}

/**
 * Pick the right string from a `{fr, en, it?}` shaped locale object.
 * Use for static label maps: `{sessionType: {fr: "…", en: "…", it: "…"}}`.
 *
 * @example
 *   pickLocale(SESSION_TYPE_LABELS[type])
 */
export function pickLocale(
  obj: { fr: string; en: string; it?: string } | null | undefined,
  fallback: string = "",
): string {
  if (!obj) return fallback;
  const lang = getLanguage();
  if (lang === "it") return obj.it ?? obj.en ?? obj.fr;
  return lang === "en" ? obj.en : obj.fr;
}

/**
 * React hook version of `pickLocale`, reactive to language changes.
 */
export function usePickLocale() {
  const lang = useLanguage();
  return (
    obj: { fr: string; en: string; it?: string } | null | undefined,
    fallback: string = "",
  ): string => {
    if (!obj) return fallback;
    if (lang === "it") return obj.it ?? obj.en ?? obj.fr;
    return lang === "en" ? obj.en : obj.fr;
  };
}

export function getDateLocale(): string {
  const lang = getLanguage();
  if (lang === "it") return "it-IT";
  return lang === "en" ? "en-GB" : "fr-FR";
}

export function useDateLocale(): string {
  const lang = useLanguage();
  if (lang === "it") return "it-IT";
  return lang === "en" ? "en-GB" : "fr-FR";
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
  return getLanguage();
}

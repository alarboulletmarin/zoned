import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import frCommon from "./locales/fr/common.json";
import frLibrary from "./locales/fr/library.json";
import frSession from "./locales/fr/session.json";

import enCommon from "./locales/en/common.json";
import enLibrary from "./locales/en/library.json";
import enSession from "./locales/en/session.json";

// Resources object
const resources = {
  fr: {
    common: frCommon,
    library: frLibrary,
    session: frSession,
  },
  en: {
    common: enCommon,
    library: enLibrary,
    session: enSession,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    resources,
    fallbackLng: "fr",
    defaultNS: "common",
    ns: ["common", "library", "session"],

    // Detection options
    detection: {
      // Order of detection
      order: ["localStorage", "navigator", "htmlTag"],
      // Key to store in localStorage
      lookupLocalStorage: "zoned-language",
      // Cache user language
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Export type for supported languages
export type SupportedLanguage = "fr" | "en";

// Export available languages
export const supportedLanguages: { code: SupportedLanguage; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

// Helper to get current language
export function getCurrentLanguage(): SupportedLanguage {
  return (i18n.language?.split("-")[0] as SupportedLanguage) || "fr";
}

// Helper to change language
export function changeLanguage(lang: SupportedLanguage): Promise<void> {
  return i18n.changeLanguage(lang) as Promise<void>;
}

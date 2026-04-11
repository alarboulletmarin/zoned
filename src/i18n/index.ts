import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import frCommon from "./locales/fr/common.json";
import frLibrary from "./locales/fr/library.json";
import frSession from "./locales/fr/session.json";
import frGlossary from "./locales/fr/glossary.json";
import frContribute from "./locales/fr/contribute.json";
import frPlan from "./locales/fr/plan.json";

import enCommon from "./locales/en/common.json";
import enLibrary from "./locales/en/library.json";
import enSession from "./locales/en/session.json";
import enGlossary from "./locales/en/glossary.json";
import enContribute from "./locales/en/contribute.json";
import enPlan from "./locales/en/plan.json";

import frGuides from "./locales/fr/guides.json";
import enGuides from "./locales/en/guides.json";

import frSimulator from "./locales/fr/simulator.json";
import enSimulator from "./locales/en/simulator.json";

import frWhatif from "./locales/fr/whatif.json";
import enWhatif from "./locales/en/whatif.json";

import frStrength from "./locales/fr/strength.json";
import enStrength from "./locales/en/strength.json";

import frCalculators from "./locales/fr/calculators.json";
import enCalculators from "./locales/en/calculators.json";

import frContent from "./locales/fr/content.json";
import enContent from "./locales/en/content.json";

import frHomepage from "./locales/fr/homepage.json";
import enHomepage from "./locales/en/homepage.json";

// Resources object
const resources = {
  fr: {
    common: frCommon,
    library: frLibrary,
    session: frSession,
    glossary: frGlossary,
    contribute: frContribute,
    plan: frPlan,
    guides: frGuides,
    simulator: frSimulator,
    whatif: frWhatif,
    strength: frStrength,
    calculators: frCalculators,
    content: frContent,
    homepage: frHomepage,
  },
  en: {
    common: enCommon,
    library: enLibrary,
    session: enSession,
    glossary: enGlossary,
    contribute: enContribute,
    plan: enPlan,
    guides: enGuides,
    simulator: enSimulator,
    whatif: enWhatif,
    strength: enStrength,
    calculators: enCalculators,
    content: enContent,
    homepage: enHomepage,
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
    fallbackNS: "common",
    ns: ["common", "library", "session", "glossary", "contribute", "plan", "guides", "simulator", "whatif", "strength", "calculators", "content", "homepage"],

    // Detection options
    detection: {
      // Order of detection
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      // Read ?lang= query parameter (default is ?lng=)
      lookupQuerystring: "lang",
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
export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
}

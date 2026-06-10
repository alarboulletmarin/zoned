import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Boot-critical namespaces, bundled statically for the default language so
// the first paint (TopBar, Footer, MobileSidebar, toasts) never waits on a
// network round-trip. Everything else — the other 14 namespaces and the
// entire inactive language — is loaded through dynamic imports below, which
// keeps ~120 KB gzip of locale JSON out of the entry chunk.
import frCommon from "./locales/fr/common.json";
import frHomepage from "./locales/fr/homepage.json";

export const NAMESPACES = [
  "common",
  "library",
  "session",
  "glossary",
  "contribute",
  "plan",
  "guides",
  "simulator",
  "whatif",
  "strength",
  "calculators",
  "content",
  "homepage",
  "profile",
  "routes",
  "nutrition",
] as const;

// One lazy chunk per locale file (32 total), fetched on demand.
const localeLoaders = import.meta.glob<{ default: Record<string, unknown> }>(
  "./locales/*/*.json"
);

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    resources: {
      fr: {
        common: frCommon,
        homepage: frHomepage,
      },
    },
    // Resources are completed at runtime via addResourceBundle; without this
    // flag i18next would treat the partial `resources` above as the full set.
    partialBundledLanguages: true,
    fallbackLng: "fr",
    defaultNS: "common",
    fallbackNS: "common",
    ns: ["common", "library", "session", "glossary", "contribute", "plan", "guides", "simulator", "whatif", "strength", "calculators", "content", "homepage", "profile", "routes", "nutrition"],

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

// ============================================================
// Lazy bundle loading
// ============================================================

/** Detected language clamped to a language we ship bundles for. Anything
 *  unsupported (e.g. navigator "de") renders through the fr fallback,
 *  matching the previous eager-resources behaviour. */
function activeLanguage(): SupportedLanguage {
  return getCurrentLanguage() === "en" ? "en" : "fr";
}

const loadedBundles = new Set<string>(["fr:common", "fr:homepage"]);
const bundlePromises = new Map<string, Promise<void>>();

function loadBundle(lng: SupportedLanguage, ns: string): Promise<void> {
  const key = `${lng}:${ns}`;
  if (loadedBundles.has(key)) return Promise.resolve();
  let promise = bundlePromises.get(key);
  if (!promise) {
    const loader = localeLoaders[`./locales/${lng}/${ns}.json`];
    promise = loader
      ? loader().then((mod) => {
          i18n.addResourceBundle(lng, ns, mod.default, true, true);
          loadedBundles.add(key);
        })
      : Promise.resolve();
    bundlePromises.set(key, promise);
  }
  return promise;
}

/** Load every namespace for `lng`. Resolved bundles are cached, so calling
 *  this repeatedly (every lazy page joins it) is free after the first run. */
export function ensureTranslations(
  lng: SupportedLanguage = activeLanguage()
): Promise<void> {
  return Promise.all(NAMESPACES.map((ns) => loadBundle(lng, ns))).then(
    () => undefined
  );
}

// Non-French boot: the eager shell (TopBar, Footer) renders before any lazy
// page resolves, so its namespaces must be present before the first render.
// Top-level await holds main.tsx until these two small bundles land (one
// round-trip, en users only — fr is already bundled statically).
if (activeLanguage() !== "fr") {
  await Promise.all([
    loadBundle(activeLanguage(), "common"),
    loadBundle(activeLanguage(), "homepage"),
  ]);
}

/** Every React.lazy page joins this promise so a page never renders before
 *  its translations exist — same Suspense fallback as the code-split wait,
 *  hence zero flash-of-keys and zero CLS. */
export const i18nReady = ensureTranslations();

// fallbackLng is "fr": for en users, make sure fallback lookups eventually
// resolve to French rather than raw keys (FR/EN parity is enforced by
// scripts/check-i18n-parity.ts, so this is defence in depth). Idle priority.
if (activeLanguage() !== "fr") {
  i18nReady.then(() => {
    const idle =
      typeof requestIdleCallback === "function"
        ? requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 2000);
    idle(() => void ensureTranslations("fr"));
  });
}

// Helper to change language
export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  // Load the target language fully before switching so already-rendered
  // screens swap atomically instead of flashing missing keys.
  await ensureTranslations(lang);
  await i18n.changeLanguage(lang);
}

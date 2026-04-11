/**
 * i18next types — exposes the resources shape for tooling and docs.
 *
 * NOTE: strict key checking via `CustomTypeOptions.resources` is NOT enabled.
 * Enabling it would require refactoring many call sites:
 * - dynamic keys (`t(variable)`)
 * - template-literal keys (`t(\`learn.categories.${cat}\`)`)
 * - `t("ns:key")` prefix usage combined with `useTranslation("common")` is not
 *   supported by i18next's type inference unless `defaultNS` is declared as a
 *   tuple AND every call site uses `useTranslation()` without a string argument.
 *
 * The exported types below can still be consumed by external scripts (e.g. the
 * FR/EN parity checker in Phase 4) without enabling module augmentation.
 */
import type frCommon from "./locales/fr/common.json";
import type frLibrary from "./locales/fr/library.json";
import type frSession from "./locales/fr/session.json";
import type frGlossary from "./locales/fr/glossary.json";
import type frContribute from "./locales/fr/contribute.json";
import type frPlan from "./locales/fr/plan.json";
import type frGuides from "./locales/fr/guides.json";
import type frSimulator from "./locales/fr/simulator.json";
import type frWhatif from "./locales/fr/whatif.json";
import type frStrength from "./locales/fr/strength.json";
import type frCalculators from "./locales/fr/calculators.json";
import type frContent from "./locales/fr/content.json";
import type frHomepage from "./locales/fr/homepage.json";

export type I18nResources = {
  common: typeof frCommon;
  library: typeof frLibrary;
  session: typeof frSession;
  glossary: typeof frGlossary;
  contribute: typeof frContribute;
  plan: typeof frPlan;
  guides: typeof frGuides;
  simulator: typeof frSimulator;
  whatif: typeof frWhatif;
  strength: typeof frStrength;
  calculators: typeof frCalculators;
  content: typeof frContent;
  homepage: typeof frHomepage;
};

export type I18nNamespace = keyof I18nResources;

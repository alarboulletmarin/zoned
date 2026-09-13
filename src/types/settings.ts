import type { Practice } from "@/types/practice";

/**
 * User Settings Types
 */

export type UnitSystem = "metric" | "imperial";

/**
 * Les surfaces que l'on peut masquer.
 *
 * Une liste d'opt-OUT, pas une carte de booléens : la valeur par défaut est
 * alors le tableau vide, ce qui fait traverser le `{ ...DEFAULT_SETTINGS,
 * ...parsed }` du provider sans une ligne de migration. Un objet
 * `zoned-settings` écrit avant ce champ gagne le défaut à la lecture.
 *
 * Masquer n'est pas désactiver : la route reste vivante et indexée, seule la
 * navigation cesse d'y mener. Voir `ModuleGate`.
 */
export type ModuleId =
  | "routes"
  | "raceSimulator"
  | "learn"
  | "collections"
  | "strength";

export const MODULE_IDS: readonly ModuleId[] = [
  "routes",
  "raceSimulator",
  "learn",
  "collections",
  "strength",
] as const;

/**
 * The opening animation on app launch, three-state like the theme.
 *
 * `system` follows prefers-reduced-motion: the shell is held either way, but
 * the runner freezes on its contact pose when the OS asks for less motion.
 * `always` plays it regardless, the ONLY legitimate way to override an
 * accessibility preference is the same person asking for it, here, on purpose.
 * `never` skips the hold entirely and hands over as soon as the app mounts.
 */
export type OpeningAnimation = "system" | "always" | "never";

/** Ce que le cockpit montre. Tout à `true` par défaut. */
export interface CockpitSettings {
  /** La ligne reprendre : le plan ou la semaine en cours. */
  resume: boolean;
  /** Les deux gestes courts : tirer une séance, composer ma semaine. */
  shortcuts: boolean;
  /** La figure de clôture. */
  art: boolean;
}

export interface UserSettings {
  unitSystem: UnitSystem;
  /**
   * Route Generator opt-in. Sending the start coordinate to public services
   * (Brouter, Nominatim, Overpass) is the only privacy-relevant network
   * traffic the app emits, so users can disable it from Settings.
   *
   * **Distinct de `disabledModules`, et à garder distinct** : ce n'est pas une
   * bascule d'affichage, c'est le seul consentement de sortie réseau de
   * l'app. Les confondre laisserait un choix de navigation réactiver des
   * requêtes sortantes sans que personne ne l'ait demandé. On lit les deux.
   */
  routeGeneratorEnabled: boolean;
  /**
   * Whether the launch screen plays its run cycle. Read before any bundle by
   * the inline script in index.html, which mirrors it onto
   * `document.documentElement.dataset.opening`.
   */
  openingAnimation: OpeningAnimation;
  /**
   * Les pratiques que l'app met en avant. **Vide = toutes**, et c'est le
   * défaut : rien n'est demandé au premier lancement, la pratique est apprise
   * au premier choix.
   */
  enabledPractices: Practice[];
  /** Les surfaces masquées. Vide = tout est visible. */
  disabledModules: ModuleId[];
  cockpit: CockpitSettings;
}

export const DEFAULT_COCKPIT: CockpitSettings = {
  resume: true,
  shortcuts: true,
  art: true,
};

export const DEFAULT_SETTINGS: UserSettings = {
  unitSystem: "metric",
  routeGeneratorEnabled: true,
  openingAnimation: "system",
  enabledPractices: [],
  disabledModules: [],
  cockpit: DEFAULT_COCKPIT,
};

/**
 * User Settings Types
 */

export type ColorPalette = "standard" | "deuteranopia" | "tritanopia";
export type UnitSystem = "metric" | "imperial";

/**
 * The opening animation on app launch, three-state like the theme.
 *
 * `system` follows prefers-reduced-motion: the shell is held either way, but
 * the runner freezes on its contact pose when the OS asks for less motion.
 * `always` plays it regardless — the ONLY legitimate way to override an
 * accessibility preference is the same person asking for it, here, on purpose.
 * `never` skips the hold entirely and hands over as soon as the app mounts.
 */
export type OpeningAnimation = "system" | "always" | "never";

export interface UserSettings {
  colorPalette: ColorPalette;
  unitSystem: UnitSystem;
  /**
   * Route Generator opt-in. Sending the start coordinate to public services
   * (Brouter, Nominatim, Overpass) is the only privacy-relevant network
   * traffic the app emits, so users can disable it from Settings.
   */
  routeGeneratorEnabled: boolean;
  /**
   * Whether the launch screen plays its run cycle. Read before any bundle by
   * the inline script in index.html, which mirrors it onto
   * `document.documentElement.dataset.opening`.
   */
  openingAnimation: OpeningAnimation;
}

export const DEFAULT_SETTINGS: UserSettings = {
  colorPalette: "standard",
  unitSystem: "metric",
  routeGeneratorEnabled: true,
  openingAnimation: "system",
};

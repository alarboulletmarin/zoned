/**
 * User Settings Types
 */

export type ColorPalette = "standard" | "deuteranopia" | "tritanopia";
export type UnitSystem = "metric" | "imperial";

export interface UserSettings {
  colorPalette: ColorPalette;
  unitSystem: UnitSystem;
  /**
   * Route Generator opt-in. Sending the start coordinate to public services
   * (Brouter, Nominatim, Overpass) is the only privacy-relevant network
   * traffic the app emits, so it stays off until someone turns it on from
   * Settings. Opt-in means opt-in: the default below is `false`, and
   * `readStoredSettings()` in useSettings.tsx explains what happens to the
   * browsers that were written under the old `true` default.
   */
  routeGeneratorEnabled: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  colorPalette: "standard",
  unitSystem: "metric",
  routeGeneratorEnabled: false,
};

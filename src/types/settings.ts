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
   * traffic the app emits, so users can disable it from Settings.
   */
  routeGeneratorEnabled: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  colorPalette: "standard",
  unitSystem: "metric",
  routeGeneratorEnabled: true,
};

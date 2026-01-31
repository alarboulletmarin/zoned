/**
 * User Settings Types
 */

export type ColorPalette = "standard" | "deuteranopia" | "tritanopia";
export type UnitSystem = "metric" | "imperial";

export interface UserSettings {
  colorPalette: ColorPalette;
  unitSystem: UnitSystem;
}

export const DEFAULT_SETTINGS: UserSettings = {
  colorPalette: "standard",
  unitSystem: "metric",
};

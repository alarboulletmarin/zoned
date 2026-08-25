import {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  type ReactNode,
} from "react";
import type {
  UserSettings,
  ColorPalette,
  UnitSystem,
} from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";

export const SETTINGS_STORAGE_KEY = "zoned-settings";

/** One-shot latch for the opt-in migration below. Set on the first mount of
 *  any build that ships it, whether or not there was anything to migrate. */
export const ROUTE_GENERATOR_OPT_IN_MIGRATION_KEY =
  "zoned-settings:route-generator-opt-in";

/**
 * `routeGeneratorEnabled` used to default to `true`, and the provider below
 * persists the whole settings object on mount — so every browser that has
 * ever opened Zoned holds a stored `true` whether or not anyone asked for it.
 * That `true` carries no consent, and honouring it would make the new `false`
 * default a no-op for existing users while their start coordinate kept
 * reaching Brouter, Nominatim and Overpass.
 *
 * So, once per browser: a stored `true` is dropped, letting DEFAULT_SETTINGS
 * supply `false`. A stored `false` was only ever a deliberate opt-out under
 * the old default, so it is kept. After the latch is set, a stored `true` is
 * a real choice made against the new default and is honoured like any other.
 *
 * The rare user who had toggled the generator off and back on re-enables it
 * in one click from Settings, which is where every disabled route page
 * already points.
 */
function dropInheritedRouteGeneratorOptIn(
  parsed: Partial<UserSettings>,
): Partial<UserSettings> {
  if (localStorage.getItem(ROUTE_GENERATOR_OPT_IN_MIGRATION_KEY)) return parsed;
  localStorage.setItem(ROUTE_GENERATOR_OPT_IN_MIGRATION_KEY, "1");
  if (parsed.routeGeneratorEnabled !== true) return parsed;
  const { routeGeneratorEnabled: _inherited, ...rest } = parsed;
  return rest;
}

/**
 * Read persisted settings, completed by DEFAULT_SETTINGS for anything the
 * stored blob does not carry (a key added since it was written, or dropped by
 * the migration above). Exported so it can be tested without a DOM.
 */
export function readStoredSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const parsed: Partial<UserSettings> = stored ? JSON.parse(stored) : {};
    return { ...DEFAULT_SETTINGS, ...dropInheritedRouteGeneratorOptIn(parsed) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface SettingsContextValue {
  settings: UserSettings;
  setColorPalette: (palette: ColorPalette) => void;
  setUnitSystem: (unit: UnitSystem) => void;
  setRouteGeneratorEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Provider to share settings state across all components
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(readStoredSettings);

  // Apply color palette to document root
  useEffect(() => {
    const root = document.documentElement;
    // Remove all palette classes
    root.classList.remove("palette-deuteranopia", "palette-tritanopia");
    // Add current palette class if not standard
    if (settings.colorPalette !== "standard") {
      root.classList.add(`palette-${settings.colorPalette}`);
    }
  }, [settings.colorPalette]);

  // Persist to localStorage when settings change
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setColorPalette = useCallback((palette: ColorPalette) => {
    setSettings((prev) => ({ ...prev, colorPalette: palette }));
  }, []);

  const setUnitSystem = useCallback((unit: UnitSystem) => {
    setSettings((prev) => ({ ...prev, unitSystem: unit }));
  }, []);

  const setRouteGeneratorEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, routeGeneratorEnabled: enabled }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setColorPalette,
        setUnitSystem,
        setRouteGeneratorEnabled,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to access settings from the shared context
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

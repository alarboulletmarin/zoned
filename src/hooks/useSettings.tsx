import {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  type ReactNode,
} from "react";
import type {
  CockpitSettings,
  ModuleId,
  UserSettings,
  UnitSystem,
  OpeningAnimation,
} from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";
import type { Practice } from "@/types/practice";
import { parseStoredSettings } from "@/lib/settingsSchema";

const STORAGE_KEY = "zoned-settings";

interface SettingsContextValue {
  settings: UserSettings;
  setUnitSystem: (unit: UnitSystem) => void;
  setRouteGeneratorEnabled: (enabled: boolean) => void;
  setOpeningAnimation: (opening: OpeningAnimation) => void;
  setEnabledPractices: (practices: Practice[]) => void;
  setModuleHidden: (module: ModuleId, hidden: boolean) => void;
  setCockpit: (patch: Partial<CockpitSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Provider to share settings state across all components
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  /* Le spread `{ ...DEFAULT_SETTINGS, ...parsed }` suffisait quand les
     réglages n'étaient que trois chaînes. Avec des tableaux, une charge utile
     mal formée ne donne plus un réglage ignoré mais un écran blanc, parce que
     `.includes()` lève sur une chaîne. `parseStoredSettings` assainit champ
     par champ et ne rejette jamais l'objet entier. */
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      return parseStoredSettings(localStorage.getItem(STORAGE_KEY));
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Keep the root attribute the inline boot script set in step with the
  // choice, so a change applies to the next launch without a reload.
  useEffect(() => {
    document.documentElement.dataset.opening = settings.openingAnimation;
  }, [settings.openingAnimation]);

  // Persist to localStorage when settings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setUnitSystem = useCallback((unit: UnitSystem) => {
    setSettings((prev) => ({ ...prev, unitSystem: unit }));
  }, []);

  const setRouteGeneratorEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, routeGeneratorEnabled: enabled }));
  }, []);

  /* The launch screen paints before this hook exists, so it reads the value
     straight from localStorage via the inline script in index.html. Mirroring
     it onto the root element here keeps the two in step when the choice
     changes mid-session, without a reload. */
  const setOpeningAnimation = useCallback((opening: OpeningAnimation) => {
    setSettings((prev) => ({ ...prev, openingAnimation: opening }));
  }, []);

  const setEnabledPractices = useCallback((practices: Practice[]) => {
    setSettings((prev) => ({ ...prev, enabledPractices: practices }));
  }, []);

  const setModuleHidden = useCallback((module: ModuleId, hidden: boolean) => {
    setSettings((prev) => {
      const without = prev.disabledModules.filter((m) => m !== module);
      return { ...prev, disabledModules: hidden ? [...without, module] : without };
    });
  }, []);

  const setCockpit = useCallback((patch: Partial<CockpitSettings>) => {
    setSettings((prev) => ({ ...prev, cockpit: { ...prev.cockpit, ...patch } }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setUnitSystem,
        setRouteGeneratorEnabled,
        setOpeningAnimation,
        setEnabledPractices,
        setModuleHidden,
        setCockpit,
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

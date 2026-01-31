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

const STORAGE_KEY = "zoned-settings";

interface SettingsContextValue {
  settings: UserSettings;
  setColorPalette: (palette: ColorPalette) => void;
  setUnitSystem: (unit: UnitSystem) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Provider to share settings state across all components
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setColorPalette = useCallback((palette: ColorPalette) => {
    setSettings((prev) => ({ ...prev, colorPalette: palette }));
  }, []);

  const setUnitSystem = useCallback((unit: UnitSystem) => {
    setSettings((prev) => ({ ...prev, unitSystem: unit }));
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

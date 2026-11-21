import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  createContext,
  type ReactNode,
} from "react";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { isServerSnapshot } from "@/prerender/snapshot";

const STORAGE_KEY = "zoned-favorites";

interface FavoritesContextValue {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/* Les abonnés fins : un coeur ne relit que sa propre séance, et la liste
   n'est lue que par qui la demande. Sans cela, un clic sur un coeur
   redessinait toute la bibliothèque (près d'une demi-seconde sur un
   téléphone). */
interface FavoritesStore {
  subscribe: (listener: () => void) => () => void;
  get: () => string[];
  toggleFavorite: (id: string) => void;
}

const FavoritesStoreContext = createContext<FavoritesStore | null>(null);
const NONE: string[] = [];

/**
 * Provider to share favorites state across all components
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const snapshot = isServerSnapshot();
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (snapshot) return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      // Unreadable favourites read as none. The entry is not overwritten
      // here, so a later, working read still finds it.
      return [];
    }
  });
  const [persistReady, setPersistReady] = useState(!snapshot);

  useEffect(() => {
    if (!snapshot) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch {
      // Favoris illisibles : on garde la liste vide de ce rendu.
    }
    setPersistReady(true);
  }, [snapshot]);

  // Persist to localStorage when favorites change
  useEffect(() => {
    if (!persistReady) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, persistReady]);

  const addFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    triggerStorageWarning();
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter((fav) => fav !== id);
      }
      return [...prev, id];
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const current = useRef(favorites);
  const listeners = useRef(new Set<() => void>());
  useLayoutEffect(() => {
    current.current = favorites;
    for (const listener of listeners.current) listener();
  }, [favorites]);

  const store = useMemo<FavoritesStore>(
    () => ({
      subscribe: (listener) => {
        listeners.current.add(listener);
        return () => listeners.current.delete(listener);
      },
      get: () => current.current,
      toggleFavorite,
    }),
    [toggleFavorite],
  );

  const value = useMemo(
    () => ({ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }),
    [favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite],
  );

  return (
    <FavoritesStoreContext.Provider value={store}>
      <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
    </FavoritesStoreContext.Provider>
  );
}

function useFavoritesStore(): FavoritesStore {
  const store = useContext(FavoritesStoreContext);
  if (!store) throw new Error("useFavoritesStore must be used within a FavoritesProvider");
  return store;
}

/** Un seul identifiant : le composant ne se redessine que si son état change. */
export function useIsFavorite(id: string): [boolean, () => void] {
  const store = useFavoritesStore();
  const read = () => store.get().includes(id);
  const favorited = useSyncExternalStore(store.subscribe, read, read);
  const toggle = useCallback(() => store.toggleFavorite(id), [store, id]);
  return [favorited, toggle];
}

/** La liste, lue seulement quand `enabled` : sinon une liste vide stable. */
export function useFavoriteIds(enabled: boolean): string[] {
  const store = useFavoritesStore();
  const read = () => (enabled ? store.get() : NONE);
  return useSyncExternalStore(store.subscribe, read, read);
}

/**
 * Hook to access favorites from the shared context
 */
export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}

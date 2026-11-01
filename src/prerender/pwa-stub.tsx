import { useState } from "react";

/**
 * Remplace `virtual:pwa-register/react` pendant le rendu statique.
 * Le service worker n'existe pas au build.
 */
export function useRegisterSW(_options?: {
  immediate?: boolean;
  onRegisteredSW?: (url: string, registration: ServiceWorkerRegistration | undefined) => void;
}) {
  const needRefresh = useState(false);
  const offlineReady = useState(false);
  return {
    needRefresh,
    offlineReady,
    updateServiceWorker: async (_reloadPage?: boolean) => {},
  };
}

import { useCallback, useEffect, useState } from "react";
import { isServerSnapshot } from "@/prerender/snapshot";
import { loadUserZonePrefs } from "@/lib/zones";
import { getAllPlans } from "@/lib/planStorage";
import { isoDateOnly } from "@/lib/planDates";
import { NO_NUMBERS, readMyNumbers, type MyNumbers } from "@/lib/myNumbers";

function read(): MyNumbers {
  return readMyNumbers(loadUserZonePrefs(), getAllPlans(), isoDateOnly(new Date()));
}

/**
 * Les repères de la personne (`lib/myNumbers.ts`). Sur une page prérendue le
 * premier rendu est vide, comme le HTML, et le stockage est lu dans l'effet.
 * `refresh` relit après une écriture (Prendre X comme VMA).
 */
export function useMyNumbers(): { numbers: MyNumbers; ready: boolean; refresh: () => void } {
  const snapshot = isServerSnapshot();
  const [numbers, setNumbers] = useState<MyNumbers>(() => (snapshot ? NO_NUMBERS : read()));
  const [ready, setReady] = useState(!snapshot);
  const refresh = useCallback(() => setNumbers(read()), []);

  useEffect(() => {
    if (!snapshot) return;
    setNumbers(read());
    setReady(true);
  }, [snapshot]);

  return { numbers, ready, refresh };
}

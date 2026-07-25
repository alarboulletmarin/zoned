import { useEffect, useState } from "react";

/**
 * Local time as minutes since midnight, refreshed every 30 s.
 *
 * Drives the "maintenant" marker: the page's whole point on race morning is
 * knowing what comes next, so the plan has to know what time it is.
 */
export function useNowMinutes(): number {
  const [minutes, setMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      const d = new Date();
      setMinutes(d.getHours() * 60 + d.getMinutes());
    }, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return minutes;
}

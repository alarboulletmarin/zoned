import { useState, useCallback } from "react";
import { getLatestVersionString } from "@/data/changelog";

const STORAGE_KEY = "zoned-last-seen-version";

export function useWhatsNew() {
  const latestVersion = getLatestVersionString();
  const [lastSeen, setLastSeen] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "";
  });

  const hasNewVersion = lastSeen !== latestVersion;

  const markAsSeen = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, latestVersion);
    setLastSeen(latestVersion);
  }, [latestVersion]);

  return { hasNewVersion, latestVersion, markAsSeen };
}

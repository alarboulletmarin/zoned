import type { Difficulty } from "@/types";

/**
 * Les calculs du parcours, sans React.
 *
 * Toutes pures : elles se testent sans monter un composant, ce qui n'était pas
 * le cas quand elles vivaient au milieu de la page.
 */

export function getTodayDateInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function suggestLevel(vma: number): Difficulty {
  if (vma < 12) return "beginner";
  if (vma <= 15) return "intermediate";
  if (vma <= 18) return "advanced";
  return "elite";
}

export function formatPace(totalSeconds: number): string {
  const min = Math.floor(totalSeconds / 60);
  const sec = Math.round(totalSeconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function parsePaceToSeconds(paceStr: string): number | null {
  const match = paceStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const min = parseInt(match[1], 10);
  const sec = parseInt(match[2], 10);
  if (sec >= 60) return null;
  return min * 60 + sec;
}

export function estimateFinishTime(
  paceSecondsPerKm: number,
  distanceKm: number
): string {
  const totalSeconds = paceSecondsPerKm * distanceKm;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (hours > 0) {
    return `${hours}h${minutes.toString().padStart(2, "0")}min${seconds.toString().padStart(2, "0")}s`;
  }
  return `${minutes}min${seconds.toString().padStart(2, "0")}s`;
}

export function parseFinishTimeToSeconds(timeStr: string): number | null {
  // Supports H:MM:SS, H:MM, HH:MM:SS, HH:MM, MM:SS (if no hours)
  const full = timeStr.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (full) {
    const h = parseInt(full[1], 10);
    const m = parseInt(full[2], 10);
    const s = parseInt(full[3], 10);
    if (m >= 60 || s >= 60) return null;
    return h * 3600 + m * 60 + s;
  }
  const short = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (short) {
    const a = parseInt(short[1], 10);
    const b = parseInt(short[2], 10);
    if (b >= 60) return null;
    // If a >= 1 and context suggests hours (for marathon-type distances), treat as H:MM
    // We always treat as H:MM if a < 60
    return a * 3600 + b * 60;
  }
  return null;
}

export function finishTimeToPaceSeconds(finishTimeSeconds: number, distanceKm: number): number {
  return finishTimeSeconds / distanceKm;
}

export function generateId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Form state type ──────────────────────────────────────────────────

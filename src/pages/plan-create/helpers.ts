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

export function generateId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

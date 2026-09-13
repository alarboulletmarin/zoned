import type { Practice } from "@/types/practice";
import { PRACTICES } from "@/types/practice";

/**
 * La pratique regardée en dernier.
 *
 * Deux questions différentes, qui n'ont pas le même logement :
 *
 * - quelles pratiques l'app me montre ? est de la config, et vit dans
 *   `UserSettings.enabledPractices` ;
 * - quelle pratique je regarde là ? est de l'état de contenu. Il vit dans
 *   **l'URL d'abord** (`?practice=`), pour qu'un lien de bibliothèque reste
 *   partageable et marque-page, et ce module ne garde que l'écho du dernier
 *   choix pour ne pas reposer la question au retour.
 *
 * Sa propre clé, et surtout pas `zoned-settings` : cet objet est relu par le
 * script inline d'`index.html` **avant tout bundle**, et il doit rester
 * minuscule et purement présentationnel.
 *
 * Même motif que `loadUserZonePrefs` (`lib/zones.ts`) et `loadRunnerProfile`.
 */

const STORAGE_KEY = "zoned:practice";

function isPractice(value: unknown): value is Practice {
  return typeof value === "string" && (PRACTICES as readonly string[]).includes(value);
}

/** Le dernier choix, ou null, jamais une valeur inventée. */
export function loadLastPractice(): Practice | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isPractice(stored) ? stored : null;
  } catch {
    // Navigation privée, stockage bloqué : on n'a simplement pas de mémoire.
    return null;
  }
}

export function saveLastPractice(practice: Practice | null): void {
  try {
    if (practice === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, practice);
  } catch {
    // Rien à faire : le choix vit dans l'URL, la mémoire n'est qu'un confort.
  }
}

/**
 * La pratique à afficher au montage, par ordre de priorité : ce que dit
 * l'URL, puis le dernier choix, puis rien, toutes. On ne devine jamais
 * une pratique que la personne n'a pas choisie.
 */
export function resolvePractice(
  fromUrl: string | null,
  allowed: readonly Practice[],
): Practice | null {
  if (isPractice(fromUrl) && allowed.includes(fromUrl)) return fromUrl;
  if (fromUrl !== null) return null; // un paramètre illisible ne réveille pas la mémoire
  const remembered = loadLastPractice();
  return remembered && allowed.includes(remembered) ? remembered : null;
}

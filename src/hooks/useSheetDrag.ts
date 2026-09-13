/**
 * Le glisser-pour-fermer d'une bottom sheet, en un seul endroit.
 *
 * Deux surfaces s'en servent : la primitive `<SheetContent side="bottom">`, qui
 * le donne d'un coup aux quatre sheets du bas, et PlanWorkoutPanel, qui est une
 * sheet faite main. Elles ne partagent ni leur DOM ni leur CSS, seulement le
 * geste, d'où un hook plutôt qu'un composant.
 *
 * Le panneau est lu dans `e.currentTarget` et jamais par une ref : dans un
 * gestionnaire tactile, c'est exactement l'élément qui porte le geste, ce qui
 * évite de faire remonter une ref à travers NativeDialog.
 *
 * La prise n'est PAS toute la surface. Un panneau défile, et si le doigt posé
 * sur la liste tirait la sheet, on ne pourrait plus la parcourir. Trois entrées
 * seulement : ce qui se déclare `data-sheet-handle`, l'en-tête d'une sheet de
 * la primitive, et la bande de tête qui porte la poignée dessinée.
 */
import { useCallback, useRef } from "react";

import { shouldCloseSheet } from "@/lib/sheetDrag";

/**
 * Hauteur de la bande de tête qui vaut prise, poignée comprise. Elle existe
 * pour les sheets sans en-tête, SessionCompletionPanel est la seule, et pour
 * la poignée elle-même, qui est un ::before et qu'aucun sélecteur ne peut
 * atteindre depuis un événement.
 */
const GRIP_BAND = 64;

/** Un toucher qui commence ici tire le panneau ; ailleurs il le fait défiler. */
function estUnePrise(cible: HTMLElement, panneau: HTMLElement, y: number): boolean {
  if (cible.closest("[data-sheet-handle]")) return true;
  if (cible.closest('[data-slot="sheet-header"]')) return true;
  return y - panneau.getBoundingClientRect().top < GRIP_BAND;
}

/**
 * @param actif  faux pour une sheet qui n'est pas hincée en bas, ou en mode
 *               inline : les gestionnaires sont alors des coquilles vides.
 * @param onClose ce que le geste appelle quand il aboutit.
 */
export function useSheetDrag(actif: boolean, onClose: () => void) {
  const depart = useRef<number | null>(null);
  const courant = useRef<number | null>(null);
  /** Dernier point échantillonné, pour la vitesse au lâcher. */
  const dernier = useRef<{ y: number; t: number } | null>(null);
  const vitesse = useRef(0);

  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (!actif) return;
      const y = e.touches[0].clientY;
      if (!estUnePrise(e.target as HTMLElement, e.currentTarget, y)) return;

      depart.current = y;
      courant.current = y;
      dernier.current = { y, t: e.timeStamp };
      vitesse.current = 0;
      // Tant que le doigt est posé, le panneau colle au toucher : une
      // transition animerait chaque position et le ferait traîner derrière lui.
      e.currentTarget.style.transition = "none";
    },
    [actif],
  );

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (depart.current === null) return;
    const y = e.touches[0].clientY;

    const precedent = dernier.current;
    if (precedent && e.timeStamp > precedent.t) {
      vitesse.current = (y - precedent.y) / (e.timeStamp - precedent.t);
    }
    dernier.current = { y, t: e.timeStamp };

    courant.current = y;
    const course = y - depart.current;
    // Vers le haut, rien : une sheet ne monte pas au-dessus de son bord.
    if (course > 0) {
      e.currentTarget.style.transform = `translateY(${course}px)`;
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (depart.current === null || courant.current === null) return;
      const course = courant.current - depart.current;
      const v = vitesse.current;
      depart.current = null;
      courant.current = null;
      dernier.current = null;
      vitesse.current = 0;

      // La transition d'abord, la position ensuite : c'est le style d'arrivée
      // qui porte la transition, donc le retour s'anime.
      e.currentTarget.style.transition = "";
      e.currentTarget.style.transform = "";

      if (shouldCloseSheet(course, v)) onClose();
    },
    [onClose],
  );

  return { onTouchStart, onTouchMove, onTouchEnd };
}

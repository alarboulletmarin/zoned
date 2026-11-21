import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export interface DragSource {
  week: number;
  index: number;
  day: number;
}

export interface DropTarget {
  week: number;
  day: number;
}

export interface DragState {
  source: DragSource;
  over: DropTarget | null;
  dx: number;
  dy: number;
}

/** La marge, en haut et en bas de la fenêtre, où le glisser fait défiler la page. */
const EDGE = 72;
const SPEED = 14;

function targetAt(x: number, y: number): DropTarget | null {
  for (const el of document.elementsFromPoint(x, y)) {
    const host = (el as HTMLElement).closest<HTMLElement>("[data-drop-week]");
    if (host) {
      return { week: Number(host.dataset.dropWeek), day: Number(host.dataset.dropDay) };
    }
  }
  return null;
}

/**
 * Le glisser d'une séance vers un autre jour, ou une autre semaine, du mode
 * Modifier. Des événements de pointeur, pas le glisser-déposer HTML : ce
 * dernier n'existe pas au doigt sur iOS. La poignée capture le pointeur ; la
 * cible est la journée sous le doigt (`data-drop-week`, `data-drop-day`),
 * et la page défile seule quand le doigt approche d'un bord.
 *
 * Le clavier et les lecteurs d'écran ont leur équivalent : l'entrée
 * Déplacer du menu de la séance.
 */
export function usePlanDrag(onDrop: (source: DragSource, target: DropTarget) => void) {
  const [state, setState] = useState<DragState | null>(null);
  const drop = useRef(onDrop);
  drop.current = onDrop;
  const pointerY = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  const stopScroll = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    pointerY.current = null;
  }, []);

  useEffect(() => stopScroll, [stopScroll]);

  const start = useCallback(
    (event: ReactPointerEvent<HTMLElement>, source: DragSource) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      const handle = event.currentTarget;
      const pointerId = event.pointerId;
      try {
        handle.setPointerCapture(pointerId);
      } catch (error) {
        // Un pointeur déjà relâché ne se capture plus : le glisser s'arrête là.
        console.warn("usePlanDrag: capture", error);
        return;
      }
      // La carte ne suit le doigt qu'à la verticale : les jours sont empilés,
      // et une carte tirée vers la droite élargissait la page, que Safari
      // dézoomait aussitôt pour la montrer en entier.
      const x0 = event.clientX;
      const y0 = event.clientY + window.scrollY;
      let over: DropTarget | null = null;
      let done = false;

      const scrollTick = () => {
        const y = pointerY.current;
        if (y !== null) {
          if (y < EDGE) window.scrollBy(0, -SPEED);
          else if (y > window.innerHeight - EDGE) window.scrollBy(0, SPEED);
        }
        frame.current = requestAnimationFrame(scrollTick);
      };
      frame.current = requestAnimationFrame(scrollTick);

      const move = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) return;
        pointerY.current = e.clientY;
        // La cible se lit sous le doigt, à sa vraie position horizontale.
        over = targetAt(Math.max(x0, 1), e.clientY) ?? targetAt(e.clientX, e.clientY);
        setState({ source, over, dx: 0, dy: e.clientY + window.scrollY - y0 });
      };
      /* La fin du geste arrive par plusieurs portes : le relâchement, une
         annulation, ou iOS qui reprend la main (perte de la capture). Une
         seule compte ; sans elles toutes, une carte restait figée hors de sa
         colonne, son jour vide. */
      const finish = (commit: boolean) => (e?: Event) => {
        if (done) return;
        if (e && "pointerId" in e && (e as PointerEvent).pointerId !== pointerId) return;
        done = true;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", cancel);
        handle.removeEventListener("lostpointercapture", lost);
        stopScroll();
        setState(null);
        if (commit && over && (over.week !== source.week || over.day !== source.day)) {
          drop.current(source, over);
        }
      };
      const up = finish(true);
      const cancel = finish(false);
      // La capture perdue après un relâchement normal arrive en second : le
      // relâchement a déjà conclu. Seule, c'est une interruption.
      const lost = finish(false);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", cancel);
      handle.addEventListener("lostpointercapture", lost);
      setState({ source, over: null, dx: 0, dy: 0 });
    },
    [stopScroll],
  );

  return { drag: state, startDrag: start };
}

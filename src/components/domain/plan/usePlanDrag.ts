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
      handle.setPointerCapture(event.pointerId);
      const x0 = event.clientX;
      const y0 = event.clientY + window.scrollY;
      let over: DropTarget | null = null;

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
        pointerY.current = e.clientY;
        over = targetAt(e.clientX, e.clientY);
        setState({ source, over, dx: e.clientX - x0, dy: e.clientY + window.scrollY - y0 });
      };
      const end = (commit: boolean) => () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
        handle.removeEventListener("pointercancel", cancel);
        stopScroll();
        setState(null);
        if (commit && over && (over.week !== source.week || over.day !== source.day)) {
          drop.current(source, over);
        }
      };
      const up = end(true);
      const cancel = end(false);
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
      handle.addEventListener("pointercancel", cancel);
      setState({ source, over: null, dx: 0, dy: 0 });
    },
    [stopScroll],
  );

  return { drag: state, startDrag: start };
}

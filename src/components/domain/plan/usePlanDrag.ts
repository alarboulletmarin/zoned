import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createSessionDragGhost, slotInDay } from "@/lib/sessionDrag";

export interface DragSource {
  week: number;
  index: number;
}

export interface DropTarget {
  week: number;
  day: number;
  before?: number;
}

const EDGE = 72;
const SPEED = 14;
const DRAG_THRESHOLD = 10;

function slotOf(day: HTMLElement, y: number, source: DragSource): DropTarget {
  const week = Number(day.dataset.dropWeek);
  return { week, day: Number(day.dataset.dropDay), before: slotInDay(day, y, week === source.week ? source.index : -1) };
}

function slotAt(x: number, y: number, source: DragSource): DropTarget | null {
  const day = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-drop-week]");
  return day ? slotOf(day, y, source) : null;
}

/** La poignée lance le glisser, la carte suit le pointeur et en indique la place. */
export function usePlanDrag(onMove: (source: DragSource, target: DropTarget) => void) {
  const [drag, setDrag] = useState<{ source: DragSource; over: DropTarget | null } | null>(null);
  const moveSession = useRef(onMove);
  moveSession.current = onMove;
  const cancelDrag = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelDrag.current?.(), []);

  function hover(over: DropTarget | null) {
    setDrag((previous) => {
      if (!previous || (
        previous.over?.week === over?.week && previous.over?.day === over?.day && previous.over?.before === over?.before
      )) return previous;
      return { source: previous.source, over };
    });
  }

  function onPointerDown(event: PointerEvent<HTMLElement>, card: DragSource) {
    if (!event.isPrimary || event.button !== 0 || cancelDrag.current) return;
    event.preventDefault();
    const element = event.currentTarget;
    const cardElement = element.closest<HTMLElement>(".zn-plansess");
    if (!cardElement) return;
    const pointerId = event.pointerId;
    try {
      element.setPointerCapture(pointerId);
    } catch (error) {
      // Le navigateur a déjà relâché le pointeur : aucun glisser à annuler.
      console.warn("usePlanDrag: capture", error);
      return;
    }

    const x0 = event.clientX;
    const y0 = event.clientY;
    const bounds = cardElement.getBoundingClientRect();
    let x = x0;
    let y = y0;
    let frame = 0;
    let ghost: HTMLElement | null = null;

    const scroll = () => {
      const before = window.scrollY;
      if (y < EDGE) window.scrollBy(0, -SPEED);
      else if (y > window.innerHeight - EDGE) window.scrollBy(0, SPEED);
      if (before !== window.scrollY) hover(slotAt(x, y, card));
      frame = requestAnimationFrame(scroll);
    };
    const move = (e: globalThis.PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      x = e.clientX;
      y = e.clientY;
      if (!ghost) {
        if (Math.abs(x - x0) <= DRAG_THRESHOLD && Math.abs(y - y0) <= DRAG_THRESHOLD) return;
        ghost = createSessionDragGhost(cardElement);
        ghost.style.transform = `translate(${bounds.left - x0}px, ${bounds.top - y0}px)`;
        setDrag({ source: card, over: null });
        frame = requestAnimationFrame(scroll);
      }
      ghost.style.left = `${x}px`;
      ghost.style.top = `${y}px`;
      hover(slotAt(x, y, card));
    };
    const finish = (target: DropTarget | null) => {
      cleanup();
      if (!ghost) return;
      setDrag(null);
      if (target) moveSession.current(card, target);
    };
    const up = (e: globalThis.PointerEvent) => {
      if (e.pointerId === pointerId) finish(ghost ? slotAt(e.clientX, e.clientY, card) : null);
    };
    const cancel = (e: globalThis.PointerEvent) => {
      if (e.pointerId === pointerId) finish(null);
    };
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(null);
    };
    const cleanup = () => {
      cancelDrag.current = null;
      cancelAnimationFrame(frame);
      ghost?.remove();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", keydown);
      element.removeEventListener("lostpointercapture", cancel);
      if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
    };
    cancelDrag.current = cleanup;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("keydown", keydown);
    element.addEventListener("lostpointercapture", cancel);
  }

  return { drag, onPointerDown };
}

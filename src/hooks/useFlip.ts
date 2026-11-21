import { useLayoutEffect, useRef } from "react";

export interface FlipPoint {
  x: number;
  y: number;
}

/**
 * Geste : le delta à rejouer en sens inverse pour qu'un élément paraisse
 * rester là où il était. `null` quand il n'a pas bougé (ou n'existait pas
 * avant : un bloc ajouté n'est pas déplacé, il apparaît).
 */
export function flipDelta(
  prev: FlipPoint | undefined,
  next: FlipPoint,
): FlipPoint | null {
  if (!prev) return null;
  const dx = prev.x - next.x;
  const dy = prev.y - next.y;
  return Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 ? null : { x: dx, y: dy };
}

function measure(container: HTMLElement): Map<string, FlipPoint> {
  // Relatif au conteneur : un défilement entre deux rendus ne fausse rien.
  const origin = container.getBoundingClientRect();
  const out = new Map<string, FlipPoint>();
  for (const el of container.querySelectorAll<HTMLElement>(":scope > [data-flip-key]")) {
    const r = el.getBoundingClientRect();
    out.set(el.dataset.flipKey!, { x: r.left - origin.left, y: r.top - origin.top });
  }
  return out;
}

/**
 * FLIP fait main pour une liste : les enfants directs portent
 * `data-flip-key`, et `order` change quand un bloc est ajouté, supprimé ou
 * déplacé. Seul ce changement d'ordre anime (jamais le montage, jamais une
 * simple édition de valeur, donc jamais un glisser de curseur), et rien
 * n'anime sous prefers-reduced-motion.
 */
export function useFlip<T extends HTMLElement>(order: string) {
  const ref = useRef<T>(null);
  const prev = useRef<{ order: string; rects: Map<string, FlipPoint> } | null>(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    const rects = measure(container);
    const before = prev.current;
    prev.current = { order, rects };
    if (!before || before.order === order) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    for (const el of container.querySelectorAll<HTMLElement>(":scope > [data-flip-key]")) {
      const next = rects.get(el.dataset.flipKey!);
      const delta = next && flipDelta(before.rects.get(el.dataset.flipKey!), next);
      if (!delta) continue;
      el.style.transition = "none";
      el.style.transform = `translate(${delta.x}px, ${delta.y}px)`;
      el.getBoundingClientRect(); // force le point de départ
      el.style.transition = "transform var(--dur-base) var(--ease-out)";
      el.style.transform = "";
      const done = (e: TransitionEvent) => {
        if (e.target !== el) return;
        el.style.transition = "";
        el.removeEventListener("transitionend", done);
      };
      el.addEventListener("transitionend", done);
    }
  });

  return ref;
}

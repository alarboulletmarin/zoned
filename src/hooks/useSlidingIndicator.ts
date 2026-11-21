import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

export interface IndicatorBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Measurable = Pick<HTMLElement, "offsetLeft" | "offsetTop" | "offsetWidth" | "offsetHeight">;

/** La boîte de l'élément choisi, dans le repère de son conteneur ; null si rien n'est choisi. */
export function indicatorBox(item: Measurable | null | undefined): IndicatorBox | null {
  if (!item) return null;
  return { x: item.offsetLeft, y: item.offsetTop, w: item.offsetWidth, h: item.offsetHeight };
}

/**
 * Un seul indicateur posé sur l'élément choisi d'une rangée, qui glisse de
 * l'un à l'autre au lieu de sauter (geste : la sélection vient de changer).
 *
 * Le conteneur reçoit `--ind-x`, `--ind-y`, `--ind-w`, `--ind-h`, mesurés sur
 * l'élément que `selector` désigne (le conteneur doit être `position:
 * relative`, c'est son repère). Le CSS ne transitionne que sous
 * `[data-sliding]`, posé le temps d'un choix (400 ms) qui suit de près un
 * pointeur ou une touche : à l'arrivée sur la page, quand un réglage
 * est relu ou qu'une police ou la fenêtre change la taille, la pose est
 * nette. Un redimensionnement PENDANT la fenêtre glisse avec elle : sur
 * `Tabs`, l'onglet choisi passe en gras et change de largeur dans le même
 * rendu que le choix. `data-placed` (une image après la première pose)
 * reste pour les transitions des éléments eux-mêmes.
 */
/* La dernière saisie de la personne, n'importe où dans la page. */
let lastInput = -Infinity;
if (typeof window !== "undefined") {
  const mark = () => {
    lastInput = performance.now();
  };
  window.addEventListener("pointerdown", mark, true);
  window.addEventListener("keydown", mark, true);
}

export function useSlidingIndicator(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  selectedKey: unknown,
) {
  const [placed, setPlaced] = useState(false);
  const placeRef = useRef<() => void>(() => {});
  placeRef.current = () => {
    const el = containerRef.current;
    if (!el) return;
    const box = indicatorBox(el.querySelector<HTMLElement>(selector));
    el.toggleAttribute("data-indicator", box != null);
    if (!box) return;
    el.style.setProperty("--ind-x", `${box.x}px`);
    el.style.setProperty("--ind-y", `${box.y}px`);
    el.style.setProperty("--ind-w", `${box.w}px`);
    el.style.setProperty("--ind-h", `${box.h}px`);
  };

  /* La sélection change : la pose suit, et glisse. `data-sliding` ouvre la
     transition le temps d'UN choix ; hors de cette fenêtre, une pose (police
     qui arrive, fenêtre qui change) est nette, rien ne bouge au chargement.
     Au premier rendu, pas de fenêtre : l'indicateur est déjà là. */
  const slideTimer = useRef<number | undefined>(undefined);
  useLayoutEffect(() => {
    const el = containerRef.current;
    // Un choix venu d'ailleurs (un réglage relu après le montage) n'est pas
    // un geste : seule une sélection qui suit de près une saisie glisse. La
    // seconde couvre l'avancée du cockpit, 700 ms après une clôture.
    if (el && performance.now() - lastInput < 1000) {
      el.setAttribute("data-sliding", "");
      window.clearTimeout(slideTimer.current);
      slideTimer.current = window.setTimeout(() => el.removeAttribute("data-sliding"), 400);
    }
    placeRef.current();
  }, [containerRef, selector, selectedKey]);
  useEffect(() => () => window.clearTimeout(slideTimer.current), []);

  // L'observateur vit autant que le conteneur, pas autant qu'une sélection.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => placeRef.current());
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPlaced(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return placed;
}

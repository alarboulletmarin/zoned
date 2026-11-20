import { useLayoutEffect, type RefObject } from "react";

/* La dernière façon dont la personne a agi : clavier ou pointeur. Écoutée
   en phase de capture, une fois pour toute l'app. */
let lastModality: "keyboard" | "pointer" = "pointer";
if (typeof document !== "undefined") {
  document.addEventListener(
    "keydown",
    (e) => {
      if (!e.metaKey && !e.ctrlKey && !e.altKey) lastModality = "keyboard";
    },
    true,
  );
  document.addEventListener("pointerdown", () => (lastModality = "pointer"), true);
}

/**
 * Le focus qu'une feuille pose seule à son ouverture (la semaine choisie, la
 * famille de la séance) ne s'affiche pas comme un focus clavier quand la
 * feuille a été ouverte au doigt ou à la souris : l'anneau vermillon y
 * ajoutait un accent que personne n'avait demandé. Ouverte au clavier, la
 * feuille garde l'anneau, c'est là qu'il sert. Le focus reste posé dans les
 * deux cas ; l'anneau revient à la première touche.
 */
export function useQuietInitialFocus(ref: RefObject<HTMLElement | null>, open: boolean) {
  // Avant la première peinture : la feuille (showModal) a déjà posé son
  // focus, l'anneau ne doit pas s'afficher même une image.
  useLayoutEffect(() => {
    if (!open || lastModality === "keyboard") return;
    const el = ref.current;
    if (!el) return;
    el.setAttribute("data-quiet-focus", "");
    if (document.activeElement !== el) {
      el.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
    }
    const wake = () => {
      el.removeAttribute("data-quiet-focus");
      el.removeEventListener("blur", wake);
      document.removeEventListener("keydown", wake, true);
    };
    el.addEventListener("blur", wake);
    document.addEventListener("keydown", wake, true);
    return wake;
  }, [open, ref]);
}

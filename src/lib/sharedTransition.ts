import type { MouseEvent } from "react";
import { useNavigate, type To } from "react-router-dom";
import { startNavTransition } from "./directionalTransition";

/** Origine : un nom CSS unique, même pour les identifiants contenant des signes. */
export function sharedTransitionName(kind: "wk" | "plan", id: string, part: "title" | "profile") {
  const safeId = Array.from(id, (char) => char.codePointAt(0)!.toString(16)).join("-");
  return `zn-${kind}-${part}-${safeId}`;
}

/** Origine : seule la carte activée rejoint le titre et le profil du détail. */
export function useSharedTransition(
  to: To,
  kind: "wk" | "plan",
  id: string,
  titleSelector: string,
  containerSelector?: string,
  state?: unknown,
) {
  const navigate = useNavigate();
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      (event.currentTarget.target && event.currentTarget.target !== "_self") || event.currentTarget.hasAttribute("download")
    ) return;
    event.preventDefault();
    const scope = containerSelector ? event.currentTarget.closest(containerSelector) : event.currentTarget;
    const marked: { node: HTMLElement; previous: string }[] = [];
    if (scope && typeof document.startViewTransition === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const mark = (selector: string, part: "title" | "profile") => {
        const node = scope.querySelector<HTMLElement>(selector);
        if (!node) return;
        marked.push({ node, previous: node.style.viewTransitionName });
        node.style.viewTransitionName = sharedTransitionName(kind, id, part);
      };
      mark(titleSelector, "title");
      if (kind === "wk") mark(".zn-zonebar", "profile");
    }
    const transition = startNavTransition(() => navigate(to, { state }), {
      key: `${kind === "wk" ? "workout" : "plan"}:${id}`,
    });
    const clear = () => {
      for (const { node, previous } of marked) node.style.viewTransitionName = previous;
    };
    if (transition) void transition.finished.then(clear, clear);
    else clear();
  };
}

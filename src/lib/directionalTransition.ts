import { flushSync } from "react-dom";

type Direction = "next" | "prev";
type PendingView = { key?: string; ready?: () => void; transition?: ViewTransition };
let active: PendingView | undefined;

function startTransition(run: () => void, options: { direction?: Direction; key?: string }) {
  if (
    typeof document.startViewTransition !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    active?.ready?.();
    active?.transition?.skipTransition();
    active = undefined;
    delete document.documentElement.dataset.move;
    run();
    return;
  }
  active?.ready?.();
  active?.transition?.skipTransition();
  const pending: PendingView = { key: options.key };
  active = pending;
  const root = document.documentElement;
  if (options.direction) root.dataset.move = options.direction;
  else delete root.dataset.move;
  const transition = document.startViewTransition(() => {
    if (active !== pending) return;
    if (!options.key) {
      flushSync(run);
      return;
    }
    return new Promise<void>((resolve) => {
      // Attente réelle : libérer la capture au montage, au plus après 300 ms.
      const timer = window.setTimeout(() => pending.ready?.(), 300);
      pending.ready = () => {
        window.clearTimeout(timer);
        pending.ready = undefined;
        resolve();
      };
      try {
        run();
      } catch (error) {
        pending.ready();
        throw error;
      }
    });
  });
  pending.transition = transition;
  const clear = () => {
    pending.ready?.();
    if (active !== pending) return;
    delete root.dataset.move;
    active = undefined;
  };
  void transition.finished.then(clear, clear);
  return transition;
}

/** Geste : les changements locaux suivent le parcours, jamais le montage. */
export function withDirectionalTransition(direction: Direction, update: () => void) {
  return startTransition(update, { direction });
}

/** Origine : attendre le contenu réel, même sous startTransition du Router. */
export function startNavTransition(run: () => void, options: { key: string; direction?: Direction }) {
  return startTransition(run, options);
}

/** Attente : seule la destination demandée peut libérer sa capture. */
export function markViewReady(key: string) {
  if (active?.key === key) active.ready?.();
}

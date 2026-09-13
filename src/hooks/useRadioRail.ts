import { useCallback, type KeyboardEvent, type RefObject } from "react";

/**
 * Le contrat clavier d'un `role="radiogroup"`.
 *
 * Ce dépôt a livré deux fois un `role` sans son clavier, et c'est bloquant dès
 * que le rail défile : cinq boutons tabulables et aucune flèche. Le motif APG
 * Radio Group veut **un seul arrêt de tabulation** pour le groupe, et des
 * flèches qui déplacent le focus ET cochent, avec bouclage.
 *
 * Le rail des disciplines de la bibliothèque le portait déjà, écrit à la main.
 * L'arrivée d'un second rail, les pratiques, en aurait fait une copie : donc
 * il est sorti ici. Mécanique reprise de `ui/segmented.tsx`.
 */
export function useRadioRail<T>({
  items,
  value,
  onChange,
  railRef,
}: {
  items: readonly T[];
  value: T;
  onChange: (next: T) => void;
  railRef: RefObject<HTMLElement | null>;
}) {
  const move = useCallback(
    (index: number) => {
      const next = items[index];
      if (next === undefined) return;
      onChange(next);
      railRef.current
        ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
        [index]?.focus();
    },
    [items, onChange, railRef],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const count = items.length;
      if (count === 0) return;
      const current = items.indexOf(value);
      // Rien de coché : la première option porte l'arrêt de tabulation.
      const tabStop = current === -1 ? 0 : current;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          move((tabStop - 1 + count) % count);
          break;
        case "ArrowRight":
        case "ArrowDown":
          move((tabStop + 1) % count);
          break;
        case "Home":
          move(0);
          break;
        case "End":
          move(count - 1);
          break;
        default:
          return;
      }
      event.preventDefault();
    },
    [items, value, move],
  );

  return { onKeyDown, move };
}

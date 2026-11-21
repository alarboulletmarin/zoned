import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Les clés dont la valeur vient de passer d'un état à un autre selon
 * `predicate`. Une clé absente de `before` n'a pas d'avant : un montage, un
 * élément qui arrive, ne comptent pas. Une valeur inchangée non plus, ce qui
 * couvre un rechargement qui relit la même chose.
 */
export function justChangedKeys<V>(
  before: ReadonlyMap<string, V>,
  after: Iterable<readonly [string, V]>,
  predicate: (prev: V, next: V) => boolean,
): string[] {
  const keys: string[] = [];
  for (const [key, next] of after) {
    if (!before.has(key)) continue;
    const prev = before.get(key) as V;
    if (Object.is(prev, next) || !predicate(prev, next)) continue;
    keys.push(key);
  }
  return keys;
}

/** Les clés qui n'étaient pas là avant ; rien au premier passage (`before` nul). */
export function newKeys(before: ReadonlySet<string> | null, after: Iterable<string>): string[] {
  if (!before) return [];
  const keys: string[] = [];
  for (const key of after) if (!before.has(key)) keys.push(key);
  return keys;
}

/**
 * Les positions de `after` dont la signature n'existait pas dans `before`,
 * doublons comptés. Une annulation qui remet une séance la fait reparaître
 * telle qu'elle était : c'est elle, et elle seule, dont la signature est
 * nouvelle, même si toutes les autres ont glissé d'une place.
 */
export function restoredPositions(before: readonly string[], after: readonly string[]): number[] {
  const left = new Map<string, number>();
  for (const sig of before) left.set(sig, (left.get(sig) ?? 0) + 1);
  const positions: number[] = [];
  after.forEach((sig, position) => {
    const n = left.get(sig) ?? 0;
    if (n > 0) left.set(sig, n - 1);
    else positions.push(position);
  });
  return positions;
}

const NOTHING: ReadonlySet<string> = new Set();

/**
 * Origine : les éléments qui viennent d'arriver dans une liste, le temps d'un
 * passage. Rien au montage : une liste chargée n'arrive pas, elle est là.
 */
export function useJustAdded(keys: readonly string[], holdMs = 1500) {
  const memory = useRef<ReadonlySet<string> | null>(null);
  const [added, setAdded] = useState<ReadonlySet<string>>(NOTHING);
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef(keys);
  latest.current = keys;
  const signature = keys.join("\u0001");

  useLayoutEffect(() => {
    const fresh = newKeys(memory.current, latest.current);
    memory.current = new Set(latest.current);
    if (fresh.length === 0) return;
    setAdded(new Set(fresh));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(NOTHING), holdMs);
  }, [signature, holdMs]);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  return added;
}

/**
 * Geste : ce que la personne vient de faire, repéré au moment du PASSAGE et
 * gardé le temps d'un seul passage (motion.css). Le mécanisme du cockpit
 * (`data-just-done`), pour toute liste : la mémoire des valeurs vit dans une
 * ref, la marque est posée avant la peinture (effet de mise en page, sinon
 * l'état final se montrerait une image avant de s'animer), et retirée par
 * `clear` à la fin de l'animation, ou par le minuteur de secours.
 *
 * Les valeurs doivent être simples (statut, booléen, nombre) : elles servent
 * aussi de signature pour ne relancer l'effet que sur un vrai changement.
 */
export function useJustChanged<V extends string | number | boolean | null | undefined>(
  entries: ReadonlyArray<readonly [string, V]>,
  predicate: (prev: V, next: V) => boolean,
  holdMs = 1500,
) {
  const memory = useRef(new Map<string, V>());
  const [keys, setKeys] = useState<ReadonlySet<string>>(NOTHING);
  const timer = useRef<number | undefined>(undefined);
  const test = useRef(predicate);
  test.current = predicate;
  const latest = useRef(entries);
  latest.current = entries;

  const signature = entries.map(([key, value]) => `${key}\u0000${String(value)}`).join("\u0001");
  useLayoutEffect(() => {
    const now = latest.current;
    const changed = justChangedKeys(memory.current, now, test.current);
    memory.current = new Map(now);
    if (changed.length === 0) return;
    setKeys(new Set(changed));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setKeys(NOTHING), holdMs);
  }, [signature, holdMs]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const clear = useCallback((key: string) => {
    setKeys((current) => {
      if (!current.has(key)) return current;
      const next = new Set(current);
      next.delete(key);
      return next.size === 0 ? NOTHING : next;
    });
  }, []);

  return { keys, clear };
}

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Lightweight history stack for editor screens — keeps `present` state behind
 * a Reactish setter (`set`) and exposes `undo` / `redo` callbacks plus the
 * `canUndo` / `canRedo` flags consumers need to disable buttons.
 *
 * The hook is intentionally generic and pure-state: it doesn't read the DOM,
 * spawn timers or care about the shape of `T`. Callers control batching by
 * deciding when to invoke `set` (one call per snapshot to keep undo coarse,
 * one per keystroke for fine-grained typing — usually too noisy).
 *
 * Capacity defaults to 20 entries which empirically covers an editing session
 * without bloating localStorage drafts that may persist the whole structure
 * in flight. When the cap is hit the oldest snapshot is dropped, so the
 * earliest undo simply stops working — preferable to unbounded memory growth.
 *
 * Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z (or Ctrl+Y on Windows) shortcuts are wired
 * automatically while the hook is mounted; pass `enableShortcuts={false}` to
 * opt out (e.g. when a modal must own undo locally).
 */
export interface UseUndoRedoResult<T> {
  present: T;
  set: (next: T | ((prev: T) => T)) => void;
  /**
   * Move `present` without recording a snapshot. For continuous input — a
   * slider being dragged — where every intermediate frame must render but only
   * the released value belongs in history. Pair it with one `set` on release,
   * built from the value captured before the gesture began.
   */
  replace: (next: T | ((prev: T) => T)) => void;
  reset: (next: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface UseUndoRedoOptions {
  /** Maximum number of snapshots retained (default 20). */
  capacity?: number;
  /** Bind Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z (default true). */
  enableShortcuts?: boolean;
}

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(
  initial: T,
  options: UseUndoRedoOptions = {},
): UseUndoRedoResult<T> {
  const { capacity = 20, enableShortcuts = true } = options;
  const [history, setHistory] = useState<History<T>>(() => ({
    past: [],
    present: initial,
    future: [],
  }));

  // Keep an always-fresh ref so the keyboard listener doesn't need to be
  // re-bound on every state change (would otherwise miss rapid Cmd+Z).
  const historyRef = useRef(history);
  historyRef.current = history;

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setHistory((h) => {
        const value =
          typeof next === "function"
            ? (next as (prev: T) => T)(h.present)
            : next;
        if (Object.is(value, h.present)) return h;
        const past = h.past.length >= capacity ? h.past.slice(1) : h.past;
        return {
          past: [...past, h.present],
          present: value,
          future: [],
        };
      });
    },
    [capacity],
  );

  const replace = useCallback((next: T | ((prev: T) => T)) => {
    setHistory((h) => {
      const value =
        typeof next === "function"
          ? (next as (prev: T) => T)(h.present)
          : next;
      return Object.is(value, h.present) ? h : { ...h, present: value };
    });
  }, []);

  const reset = useCallback((next: T) => {
    setHistory({ past: [], present: next, future: [] });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      return {
        past: [...h.past, h.present],
        present: next,
        future: h.future.slice(1),
      };
    });
  }, []);

  useEffect(() => {
    if (!enableShortcuts) return;
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (isTyping) return;
      const isMod = event.metaKey || event.ctrlKey;
      if (!isMod) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enableShortcuts, undo, redo]);

  return {
    present: history.present,
    set,
    replace,
    reset,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}

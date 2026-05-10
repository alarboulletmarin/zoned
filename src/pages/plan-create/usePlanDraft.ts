import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Persists the multi-step plan-creation form to localStorage so an interrupted
 * session (closed tab, hard reload, accidental nav) can be resumed later.
 *
 * Why keep the persistence here instead of inlining inside PlanCreatePage?
 * The page is already 1700+ lines and this concern is purely cross-cutting:
 * read once on mount, write on every meaningful state change, clear when
 * the plan is finalized. Extracting it lets the page stay focused on the
 * wizard flow while the draft contract (single key, version, ts) lives in
 * one file we can evolve.
 *
 * Versioning: bumping `DRAFT_VERSION` invalidates older drafts so a schema
 * change (added/removed FormState field) doesn't crash the restore path.
 */

const STORAGE_KEY = "zoned:plan-draft";
const DRAFT_VERSION = 1;
/** Drafts older than this are treated as stale and silently discarded. */
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface DraftPayload<F> {
  version: number;
  ts: number;
  stepIndex: number;
  form: F;
}

export interface UsePlanDraftResult {
  /** True when a previously saved draft exists and hasn't been restored or dismissed. */
  hasDraft: boolean;
  /** Restore the latest saved draft via the supplied setters. No-op if no draft. */
  restoreDraft: () => void;
  /** Drop the current draft from storage and the banner. */
  clearDraft: () => void;
  /** Stop persisting future updates (call after a successful plan creation). */
  finalize: () => void;
}

export function usePlanDraft<F>(
  form: F,
  setForm: (next: F) => void,
  stepIndex: number,
  setStepIndex: (idx: number) => void,
): UsePlanDraftResult {
  // Capture initial draft presence synchronously so the banner shows on first
  // paint (no flash of "no draft" while we read storage in an effect).
  const [hasDraft, setHasDraft] = useState<boolean>(() => readDraft<F>() != null);
  const finalizedRef = useRef(false);

  // Persist every meaningful change. localStorage writes are ~µs on modern
  // hardware so we don't bother debouncing — and the synchronous write means
  // beforeunload / pagehide always sees the latest snapshot.
  useEffect(() => {
    if (finalizedRef.current) return;
    const payload: DraftPayload<F> = {
      version: DRAFT_VERSION,
      ts: Date.now(),
      stepIndex,
      form,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Quota / private mode: silent failure preferable to throwing in render.
    }
  }, [form, stepIndex]);

  const restoreDraft = useCallback(() => {
    const draft = readDraft<F>();
    if (!draft) {
      setHasDraft(false);
      return;
    }
    setForm(draft.form);
    setStepIndex(draft.stepIndex);
    setHasDraft(false);
  }, [setForm, setStepIndex]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setHasDraft(false);
  }, []);

  const finalize = useCallback(() => {
    finalizedRef.current = true;
    clearDraft();
  }, [clearDraft]);

  return { hasDraft, restoreDraft, clearDraft, finalize };
}

function readDraft<F>(): DraftPayload<F> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftPayload<F>;
    if (parsed.version !== DRAFT_VERSION) return null;
    if (Date.now() - parsed.ts > DRAFT_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

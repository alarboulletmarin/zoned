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
  /**
   * L'identifiant de l'étape, en plus de son index.
   *
   * L'index seul ne désigne plus la même question dès que la liste d'étapes
   * dépend des réponses : un brouillon arrêté à Niveau (index 5 d'un
   * parcours course) revenait sur Allure si le parcours restauré était
   * plus court. On résout par id, et l'index ne sert que de repli.
   *
   * Absent des brouillons écrits avant son existence, d'où l'optionnel.
   */
  stepId?: string;
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
  options?: {
    /**
     * L'id de l'étape courante, persisté à côté de l'index.
     */
    stepId?: string;
    /**
     * Remet un brouillon relu en état.
     *
     * Sans lui, `setForm(draft.form)` posait un objet auquel il MANQUE les
     * champs ajoutés depuis, **typé comme s'il les avait** : `form.practice`
     * valait `undefined` là où le code attend une valeur. L'appelant passe
     * `stored => ({ ...initialForm, ...stored })`.
     */
    revive?: (stored: F) => F;
    /** Retrouve l'index d'une étape par son id, dans le parcours restauré. */
    resolveStepIndex?: (stepId: string, form: F) => number | null;
  },
): UsePlanDraftResult {
  // Capture initial draft presence synchronously so the banner shows on first
  // paint (no flash of "no draft" while we read storage in an effect).
  const [hasDraft, setHasDraft] = useState<boolean>(() => readDraft<F>() != null);
  const finalizedRef = useRef(false);
  // Snapshot the initial inputs so we can detect whether the effect is firing
  // for the *initial* state (no real user change yet) or after a setter has
  // produced a fresh reference. Persisting the initial state would overwrite
  // a saved draft before the user has had a chance to click "Reprendre",
  // a silent data-loss bug that surfaced under React Strict Mode in dev,
  // where the effect fires twice on mount.
  const initialFormRef = useRef(form);
  const initialStepRef = useRef(stepIndex);
  // Les options changent à chaque rendu (l'id d'étape en fait partie) : une
  // ref les garde à jour sans relancer l'effet de persistance.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Persist every meaningful change. localStorage writes are ~µs on modern
  // hardware so we don't bother debouncing, and the synchronous write means
  // beforeunload / pagehide always sees the latest snapshot.
  useEffect(() => {
    if (finalizedRef.current) return;
    // Skip while the inputs are still the *initial* references, that
    // covers both first effect run and Strict Mode's second pass.
    if (
      form === initialFormRef.current &&
      stepIndex === initialStepRef.current
    ) {
      return;
    }
    const payload: DraftPayload<F> = {
      version: DRAFT_VERSION,
      ts: Date.now(),
      stepIndex,
      stepId: optionsRef.current?.stepId,
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
    const opts = optionsRef.current;
    // Fusionner, pas remplacer : un brouillon d'avant l'ajout d'un champ n'en
    // a pas la clé, et le poser tel quel donne un état incomplet typé complet.
    const revived = opts?.revive ? opts.revive(draft.form) : draft.form;
    setForm(revived);

    /* L'étape se retrouve par son ID, jamais par son index.
     *
     * Un index n'a de sens que dans le parcours où il a été écrit. Quand une
     * étape s'ajoute en tête, la pratique, l'index 5 qui désignait Niveau
     * désigne maintenant Courses de prépa : on reprendrait à la mauvaise
     * question, en silence, ce qui est pire que de reprendre au début.
     *
     * Donc : l'id s'il est là et qu'il existe encore dans le parcours
     * restauré ; sinon on repart de la première étape. Ce n'est pas une perte
     *, toutes les réponses sont restaurées, on ne fait que les retraverser,
     * et ça ne concerne que les brouillons écrits avant que `stepId` existe. */
    const byId =
      draft.stepId && opts?.resolveStepIndex
        ? opts.resolveStepIndex(draft.stepId, revived)
        : null;
    setStepIndex(byId ?? 0);
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

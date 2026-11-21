import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Le brouillon du parcours, dans localStorage, pour qu'un onglet fermé ou une
 * page rechargée ne perde pas les réponses.
 *
 * Il garde les réponses et l'écran où l'on était, par son identifiant : un
 * index ne désigne plus le même écran dès que le parcours dépend des
 * réponses. `DRAFT_VERSION` change avec la forme des réponses ; un brouillon
 * d'une autre version est ignoré plutôt que restauré à moitié.
 */

const STORAGE_KEY = "zoned:plan-draft";
const DRAFT_VERSION = 3;
/** Au-delà, un brouillon est considéré comme abandonné. */
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface DraftPayload<F> {
  version: number;
  ts: number;
  step: string;
  form: F;
}

export interface UsePlanDraftResult {
  /** Un brouillon existe, ni repris ni écarté. */
  hasDraft: boolean;
  restoreDraft: () => void;
  clearDraft: () => void;
  /** Arrête d'enregistrer (après la création du plan) et efface le brouillon. */
  finalize: () => void;
}

export function usePlanDraft<F>(
  form: F,
  setForm: (next: F) => void,
  step: string,
  setStep: (step: string) => void,
  revive: (stored: F) => F,
): UsePlanDraftResult {
  // Lu au premier rendu : le bandeau s'affiche sans clignoter.
  const [hasDraft, setHasDraft] = useState<boolean>(() => readDraft<F>() != null);
  const finalizedRef = useRef(false);
  // L'état initial n'est pas une réponse : l'enregistrer écraserait le
  // brouillon avant qu'on ait pu cliquer Reprendre (deux passes en Strict Mode).
  const initialFormRef = useRef(form);
  const initialStepRef = useRef(step);
  const reviveRef = useRef(revive);
  reviveRef.current = revive;

  useEffect(() => {
    if (finalizedRef.current) return;
    if (form === initialFormRef.current && step === initialStepRef.current) return;
    const payload: DraftPayload<F> = { version: DRAFT_VERSION, ts: Date.now(), step, form };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      // Une réponse donnée depuis l'ouverture remplace l'ancien brouillon.
      setHasDraft(false);
    } catch {
      // Quota plein ou navigation privée : le parcours marche sans brouillon.
    }
  }, [form, step]);

  const restoreDraft = useCallback(() => {
    const draft = readDraft<F>();
    setHasDraft(false);
    if (!draft) return;
    setForm(reviveRef.current(draft.form));
    setStep(draft.step);
  }, [setForm, setStep]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Rien à effacer qu'on puisse atteindre : le bandeau part quand même.
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
    // Un brouillon illisible est un brouillon absent : le parcours part de zéro.
    return null;
  }
}

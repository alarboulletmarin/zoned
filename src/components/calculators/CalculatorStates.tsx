import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Generic, reusable states for calculator pages (spec: vide, valeur
 * improbable, chargement, valeurs manquantes, hors-ligne). Confirmations
 * ("Zones enregistrées", "Tableau copié", "PDF impossible") are already
 * handled by the app's `sonner` toasts (see `toast.success` call sites) —
 * no separate component is needed there, only consistent wording.
 */

/** 01 — nothing entered yet: a dash placeholder, not a fabricated example. */
export function CalculatorEmptyResult({ hint }: { hint?: React.ReactNode }) {
  return (
    <div className="border-2 border-border/70 px-5 py-8 sm:py-10 flex flex-col items-center text-center gap-2">
      <p className="font-mono text-4xl sm:text-5xl text-muted-foreground/70">—</p>
      {hint && <p className="font-mono text-[11px] leading-[1.7] text-muted-foreground max-w-[42ch]">{hint}</p>}
    </div>
  );
}

/** 02 — implausible value: warns without blocking, offers "calculate anyway" / "correct". */
export function CalculatorImplausibleWarning({
  message,
  onProceed,
  onCorrect,
  proceedLabel,
  correctLabel,
  note,
}: {
  message: React.ReactNode;
  onProceed: () => void;
  onCorrect: () => void;
  proceedLabel: string;
  correctLabel: string;
  note?: React.ReactNode;
}) {
  return (
    <div className="border-2 border-zone-5 px-4 py-3.5">
      <p className="text-[13px] leading-[1.55] text-zone-5">{message}</p>
      <div className="flex flex-wrap gap-2.5 mt-3.5">
        <Button size="sm" onClick={onProceed}>
          {proceedLabel}
        </Button>
        <Button size="sm" variant="outline" onClick={onCorrect}>
          {correctLabel}
        </Button>
      </div>
      {note && <p className="font-mono text-[10px] text-muted-foreground mt-3">{note}</p>}
    </div>
  );
}

/** 05 — a required value (e.g. HR max) is missing from the profile. */
export function CalculatorMissingValueBanner({
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  message: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="border-2 border-zone-3 px-4 py-3.5">
      <p className="text-[13px] leading-[1.55] text-foreground/85">{message}</p>
      <div className="flex flex-col sm:flex-row gap-2.5 mt-3.5">
        <Button size="sm" onClick={onPrimary}>
          {primaryLabel}
        </Button>
        {secondaryLabel && onSecondary && (
          <Button size="sm" variant="outline" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/** 06 — offline reassurance: every calculator runs fully client-side. */
export function CalculatorOfflineNote({ className }: { className?: string }) {
  const { t } = useTranslation("common");
  return (
    <div className={cn("bg-ink text-paper px-3.5 py-2.5 font-mono text-[11px] tracking-[0.05em]", className)}>
      {t("calculators:calculateurs.states.offline")}
    </div>
  );
}

/** 03 — loading placeholder for the rare case a calculation isn't instant. */
export function CalculatorLoadingState() {
  const { t } = useTranslation("common");
  return (
    <div className="border-2 border-border/70 px-5 py-6 flex flex-col gap-3" role="status" aria-live="polite">
      <div className="h-9 bg-muted animate-pulse" />
      <div className="h-3.5 w-[70%] bg-muted animate-pulse" />
      <div className="h-3.5 w-[52%] bg-muted animate-pulse" />
      <p className="font-mono text-[11px] text-muted-foreground mt-1">
        {t("calculators:calculateurs.states.loading")}
      </p>
    </div>
  );
}

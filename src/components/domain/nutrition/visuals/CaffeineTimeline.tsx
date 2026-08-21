import { useTranslation } from "react-i18next";
import { Coffee, AlertTriangle } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { CaffeineStep } from "@/data/nutrition/types";

interface Props {
  steps: CaffeineStep[];
  contraindicationsKeys?: string[];
}

export function CaffeineTimeline({ steps, contraindicationsKeys = [] }: Props) {
  const { t } = useTranslation("nutrition");

  return (
    <div className="space-y-6">
      <div className="border-2 border-foreground bg-card p-4 md:p-6">
        <ol className="relative space-y-5">
          <span
            aria-hidden="true"
            className="absolute left-4 top-2 bottom-2 w-px bg-filet"
          />
          {steps.map((step, idx) => (
            <li key={step.timeLabelKey} className="relative flex gap-4">
              <span
                className={cn(
                  "relative z-10 inline-flex size-8 shrink-0 items-center justify-center border-2 border-foreground bg-background",
                  idx === steps.length - 1 && "bg-ink text-accent-acid border-ink"
                )}
              >
                <Coffee className="size-3.5" aria-hidden="true" />
              </span>
              <div className="flex-1 pt-1">
                <p className="font-mono text-xs font-bold tracking-wide uppercase text-foreground">
                  {t(step.timeLabelKey)}
                </p>
                <p className="text-sm text-foreground">{t(step.actionKey)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {contraindicationsKeys.length > 0 && (
        <div className="flex gap-3 border-2 border-warning p-4">
          <AlertTriangle className="size-5 shrink-0 text-warning" aria-hidden="true" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold">{t("hub.caffeine.contraindications.heading")}</p>
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              {contraindicationsKeys.map((k) => (
                <li key={k}>{t(k)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

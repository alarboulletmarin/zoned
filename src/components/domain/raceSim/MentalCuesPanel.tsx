import { useTranslation } from "react-i18next";
import type { MentalCue } from "@/lib/raceSimulator";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";

/**
 * One cue per segment. The range lives in the badge only — the cue text used
 * to restate it ("Km 1-2 : …") right next to a badge saying the same thing,
 * and the two didn't even agree.
 */
export function MentalCuesPanel({
  cues,
  className,
}: {
  cues: MentalCue[];
  className?: string;
}) {
  const { t } = useTranslation("simulator");
  const pick = usePickLang();

  return (
    <ol className={cn("space-y-3", className)}>
      {cues.map((cue, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-px w-[4.75rem] shrink-0 rounded-full bg-muted px-2 py-1 text-center font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
            {formatKm(cue.fromKm)}–{formatKm(cue.toKm)}&nbsp;{t("labels.km")}
          </span>
          <p className="min-w-0 flex-1 text-sm leading-relaxed">
            {pick(cue, "text")}
          </p>
        </li>
      ))}
    </ol>
  );
}

function formatKm(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

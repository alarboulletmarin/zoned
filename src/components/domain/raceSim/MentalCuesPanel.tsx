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
    <ol
      className={cn("zn-stack zn-rs-cues", className)}
      style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
    >
      {cues.map((cue, i) => (
        <li
          key={i}
          className="zn-row zn-row--start"
          style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
        >
          <span className="zn-rs-cues__range">
            {formatKm(cue.fromKm)}–{formatKm(cue.toKm)}&nbsp;{t("labels.km")}
          </span>
          <p className="zn-rs-cues__text">{pick(cue, "text")}</p>
        </li>
      ))}
    </ol>
  );
}

function formatKm(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

import { useTranslation } from "react-i18next";
import { Check, AlertTriangle } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { PolarisedSplit } from "@/lib/weekStats";

/** Target easy share — the 80 in 80/20. */
const TARGET_LOW = 0.8;
/** "Balanced" band on the hard share (Tempo + Intense): roughly 20 ± 8. */
const HARD_MIN = 0.12;
const HARD_MAX = 0.3;

interface PolarizationGaugeProps {
  polarised: PolarisedSplit;
  className?: string;
}

/**
 * Stacked Easy / Tempo / Intense bar computed on real time-in-zone, with a
 * dotted marker at the 80 % easy target and a "✓ balanced" badge — the visual
 * proof that the week respects the 80/20 polarisation (Epic #83, issue #87).
 */
export function PolarizationGauge({
  polarised,
  className,
}: PolarizationGaugeProps) {
  const { t } = useTranslation("library");
  const { lowShare, midShare, highShare, zonedMinutes } = polarised;

  if (zonedMinutes <= 0) return null;

  const hardShare = midShare + highShare;
  const status =
    hardShare < HARD_MIN ? "tooEasy" : hardShare > HARD_MAX ? "tooHard" : "balanced";
  const balanced = status === "balanced";
  const pct = (n: number) => Math.round(n * 100);

  const segments = [
    { key: "easy", share: lowShare, zone: 1 },
    { key: "tempo", share: midShare, zone: 3 },
    { key: "intense", share: highShare, zone: 4 },
  ] as const;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t("weekly.gauge.title")}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            balanced
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
          )}
          title={t(`weekly.gauge.${status}`)}
        >
          {balanced ? (
            <Check className="size-3.5" />
          ) : (
            <AlertTriangle className="size-3.5" />
          )}
          {pct(lowShare)} / {pct(hardShare)}
        </span>
      </div>

      {/* Stacked bar + 80 % marker */}
      <div className="relative">
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
          {segments.map((s) =>
            s.share > 0 ? (
              <div
                key={s.key}
                style={{
                  flex: s.share,
                  backgroundColor: `var(--zone-${s.zone})`,
                }}
                title={`${t(`weekly.gauge.${s.key}`)} · ${pct(s.share)} %`}
              />
            ) : null,
          )}
        </div>
        {/* Dotted target marker at 80 % */}
        <div
          className="pointer-events-none absolute inset-y-0 border-l-2 border-dashed border-foreground/60"
          style={{ left: `${TARGET_LOW * 100}%` }}
          aria-hidden
        >
          <span className="absolute -top-0.5 left-1 whitespace-nowrap text-[10px] font-medium text-muted-foreground">
            {t("weekly.gauge.target")}
          </span>
        </div>
      </div>

      {/* Verdict caption */}
      {!balanced && (
        <p
          className={cn(
            "text-xs",
            "text-amber-600 dark:text-amber-400",
          )}
        >
          {t(`weekly.gauge.${status}Hint`)}
        </p>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {segments.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: `var(--zone-${s.zone})` }}
            />
            {t(`weekly.gauge.${s.key}`)} {pct(s.share)} %
          </span>
        ))}
      </div>
    </div>
  );
}

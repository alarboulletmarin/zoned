import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertTriangle, Lightbulb } from "@/components/icons";

import type { FindingSeverity, PlanFinding } from "@/lib/planGenerator/audit";

export type { FindingSeverity, PlanFinding };

interface PlanAuditPanelProps {
  findings: PlanFinding[];
  onGoToWeek?: (weekNumber: number) => void;
  onFix?: (finding: PlanFinding) => void;
}

/** Zoned Brut: no pastel tints — a flat card, a 2px contour, and a square
 *  severity flat. Error is the poster red, a warning borrows Z3 (the "watch
 *  this" end of the ramp), info stays plain ink. */
const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { textColor: string; borderColor: string; dotColor: string }
> = {
  error: {
    textColor: "text-poster-red",
    borderColor: "border-poster-red",
    dotColor: "bg-poster-red",
  },
  warning: {
    textColor: "text-foreground",
    borderColor: "border-zone-3",
    dotColor: "bg-zone-3",
  },
  info: {
    textColor: "text-foreground",
    borderColor: "border-foreground",
    dotColor: "bg-foreground",
  },
};

export function PlanAuditPanel({ findings, onGoToWeek, onFix }: PlanAuditPanelProps) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const [expanded, setExpanded] = useState(false);

  if (findings.length === 0) return null;

  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warning");
  const infos = findings.filter((f) => f.severity === "info");

  const bannerSeverity: FindingSeverity =
    errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "info";
  const config = SEVERITY_CONFIG[bannerSeverity];

  return (
    <div className={cn("rounded-none border-2 bg-card", config.borderColor)}>
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm"
      >
        <span className={cn("font-mono text-xs uppercase tracking-[0.1em] flex items-center gap-2", config.textColor)}>
          <AlertTriangle className="size-4" />
          {t("audit.title")}
          <span className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground">
            {errors.length > 0 && t("audit.errors", { count: errors.length })}
            {errors.length > 0 && warnings.length > 0 && " \u00B7 "}
            {warnings.length > 0 && t("audit.warnings", { count: warnings.length })}
            {(errors.length > 0 || warnings.length > 0) && infos.length > 0 && " \u00B7 "}
            {infos.length > 0 && t("audit.infos", { count: infos.length })}
          </span>
        </span>
        {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {/* Expanded findings list */}
      {expanded && (
        <div className="border-t border-filet px-3 py-2 space-y-1.5">
          {findings.map((finding) => {
            const fConfig = SEVERITY_CONFIG[finding.severity];
            return (
              <div key={finding.id} className="flex items-start gap-2 text-sm">
                <span className={cn("shrink-0 mt-1.5 size-2 rounded-none", fConfig.dotColor)} />
                <div className="flex-1 min-w-0">
                  <span className={fConfig.textColor}>
                    {pick(finding, "message")}
                  </span>
                  {finding.suggestion && (
                    <p className="text-xs mt-0.5 text-muted-foreground italic flex items-center gap-1">
                      <Lightbulb className="size-3 shrink-0" />
                      {pick(finding, "suggestion")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {onFix && finding.fixable && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 font-mono text-[11px] uppercase tracking-[0.06em] px-2"
                      onClick={() => onFix(finding)}
                    >
                      {t("audit.fix")}
                    </Button>
                  )}
                  {onGoToWeek && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 font-mono text-[11px] uppercase tracking-[0.06em] px-2"
                      onClick={() => onGoToWeek(finding.weekNumber)}
                    >
                      S{finding.weekNumber}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

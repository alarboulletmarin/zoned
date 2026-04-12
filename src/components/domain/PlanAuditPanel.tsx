import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useIsEnglish } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertTriangle } from "@/components/icons";

import type { FindingSeverity, PlanFinding } from "@/lib/planGenerator/audit";

export type { FindingSeverity, PlanFinding };

interface PlanAuditPanelProps {
  findings: PlanFinding[];
  onGoToWeek?: (weekNumber: number) => void;
}

const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { icon: string; textColor: string; bgColor: string; borderColor: string }
> = {
  error: {
    icon: "\uD83D\uDD34",
    textColor: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
  },
  warning: {
    icon: "\uD83D\uDFE1",
    textColor: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  info: {
    icon: "\uD83D\uDD35",
    textColor: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
};

export function PlanAuditPanel({ findings, onGoToWeek }: PlanAuditPanelProps) {
  const { t } = useTranslation("plan");
  const isEn = useIsEnglish();
  const [expanded, setExpanded] = useState(false);

  if (findings.length === 0) return null;

  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warning");
  const infos = findings.filter((f) => f.severity === "info");

  const bannerSeverity: FindingSeverity =
    errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "info";
  const config = SEVERITY_CONFIG[bannerSeverity];

  return (
    <div className={cn("rounded-lg border", config.borderColor, config.bgColor)}>
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm"
      >
        <span className={cn("font-medium flex items-center gap-2", config.textColor)}>
          <AlertTriangle className="size-4" />
          {t("audit.title")}
          <span className="text-xs font-normal">
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
        <div className="border-t px-3 py-2 space-y-1.5">
          {findings.map((finding) => {
            const fConfig = SEVERITY_CONFIG[finding.severity];
            return (
              <div key={finding.id} className="flex items-start gap-2 text-sm">
                <span className="shrink-0 text-xs mt-0.5">{fConfig.icon}</span>
                <span className={cn("flex-1 min-w-0", fConfig.textColor)}>
                  {isEn ? finding.messageEn : finding.message}
                </span>
                {onGoToWeek && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs shrink-0 px-2"
                    onClick={() => onGoToWeek(finding.weekNumber)}
                  >
                    S{finding.weekNumber}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

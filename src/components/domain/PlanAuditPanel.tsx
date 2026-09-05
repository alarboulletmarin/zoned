import type { ComponentType } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { IconProps } from "@/components/icons";
import { AlertTriangle, ChevronDown, ChevronUp, Info, Lightbulb } from "@/components/icons";

import type { FindingSeverity, PlanFinding } from "@/lib/planGenerator/audit";

export type { FindingSeverity, PlanFinding };

interface PlanAuditPanelProps {
  findings: PlanFinding[];
  onGoToWeek?: (weekNumber: number) => void;
  onFix?: (finding: PlanFinding) => void;
}

/** Each severity gets its own glyph: no state in this system rests on colour. */
const SEVERITY_GLYPH: Record<FindingSeverity, ComponentType<IconProps>> = {
  error: AlertTriangle,
  warning: Info,
  info: Lightbulb,
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

  const counts = [
    errors.length > 0 ? t("audit.errors", { count: errors.length }) : null,
    warnings.length > 0 ? t("audit.warnings", { count: warnings.length }) : null,
    infos.length > 0 ? t("audit.infos", { count: infos.length }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="zn-paudit">
      <Alert
        kind={bannerSeverity}
        title={t("audit.title")}
        action={
          <Button
            variant="outline"
            size="sm"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? t("audit.hideList") : t("audit.showList")}
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </Button>
        }
      >
        {counts}. {t("audit.intact")}
      </Alert>

      {expanded && (
        <ul className="zn-paudit__list">
          {findings.map((finding) => {
            const Glyph = SEVERITY_GLYPH[finding.severity];
            return (
              <li
                key={finding.id}
                className="zn-paudit__item"
                data-severity={finding.severity}
              >
                <span className="zn-paudit__glyph">
                  <Glyph size={15} />
                  <span className="sr-only">
                    {t(`common:alert.${finding.severity}`)}
                  </span>
                </span>
                <span className="zn-paudit__body">
                  <span className="zn-paudit__msg">{pick(finding, "message")}</span>
                  {finding.suggestion && (
                    <span className="zn-paudit__hint">
                      <Lightbulb size={13} />
                      {pick(finding, "suggestion")}
                    </span>
                  )}
                </span>
                <span className="zn-paudit__actions">
                  {onFix && finding.fixable && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onFix(finding)}
                    >
                      {t("audit.fix")}
                    </Button>
                  )}
                  {onGoToWeek && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t("audit.goToWeek", { week: finding.weekNumber })}
                      onClick={() => onGoToWeek(finding.weekNumber)}
                    >
                      S{finding.weekNumber}
                    </Button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { memo, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { usePickLang } from "@/lib/i18n-utils";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lightbulb, ChevronDown, ChevronLeft, ChevronRight, Route as RouteIcon } from "@/components/icons";
import { PHASE_GUIDANCE } from "@/data/guidance/phaseGuidance";
import { tips } from "@/data/tips/data";
import type { PlanWeek } from "@/types/plan";

// ── Props ──────────────────────────────────────────────────────────

interface WeekGuidancePanelProps {
  week: PlanWeek;
  daysPerWeek: number;
  /** Show prev/next arrows to navigate between weeks. */
  showWeekNav?: boolean;
  totalWeeks?: number;
  /** Min navigable week (default 1). */
  minWeek?: number;
  /** Max navigable week (default totalWeeks). */
  maxWeek?: number;
  onWeekChange?: (weekNumber: number) => void;
  onGenerateRoute?: () => void;
  className?: string;
}

// ── Storage key ────────────────────────────────────────────────────

const STORAGE_KEY = "zoned-guidance-collapsed";

// ── Component ──────────────────────────────────────────────────────

export const WeekGuidancePanel = memo(function WeekGuidancePanel({
  week,
  daysPerWeek,
  showWeekNav,
  totalWeeks,
  minWeek = 1,
  maxWeek,
  onWeekChange,
  onGenerateRoute,
  className,
}: WeekGuidancePanelProps) {
  const { t } = useTranslation("plan");
  const pickLang = usePickLang();

  // Collapsed state, persisted in localStorage
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Get guidance for current phase
  const guidance = PHASE_GUIDANCE[week.phase];

  // Calculate checklist items for this week
  const items = useMemo(
    () => guidance.checklist(daysPerWeek, week.isRecoveryWeek),
    [guidance, daysPerWeek, week.isRecoveryWeek],
  );

  // Evaluate each checklist item against current sessions
  const checks = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        checked: item.matchFn(week.sessions),
      })),
    [items, week.sessions],
  );

  const doneCount = checks.filter((c) => c.checked).length;

  // Deterministic tip based on weekNumber (cycles through phase tips)
  const tip = useMemo(() => {
    if (!guidance.tipIds.length) return null;
    const tipId =
      guidance.tipIds[week.weekNumber % guidance.tipIds.length];
    return tips.find((t) => t.id === tipId) ?? null;
  }, [guidance.tipIds, week.weekNumber]);

  // Persist collapse preference
  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore quota errors */
      }
      return next;
    });
  }, []);

  return (
    <div className={cn("zn-pguide", className)}>
      {/* Header - always visible */}
      <div className="zn-pguide__head">
        {showWeekNav && onWeekChange && (
          <button
            type="button"
            onClick={() => onWeekChange(week.weekNumber - 1)}
            disabled={week.weekNumber <= minWeek}
            className="zn-pguide__nav"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={toggleCollapse}
          className="zn-pguide__toggle"
          aria-expanded={!collapsed}
          aria-label={collapsed ? t("guidance.expand") : t("guidance.collapse")}
        >
          <Lightbulb size={16} />
          <span className="zn-pguide__title">{t("guidance.title")}</span>
          {showWeekNav && (
            <span className="zn-pguide__count">S{week.weekNumber}</span>
          )}
          <span className="zn-pguide__count">
            {doneCount}/{items.length}
          </span>
          <ChevronDown size={16} className="zn-pguide__chev" />
        </button>
        {showWeekNav && onWeekChange && (
          <button
            type="button"
            onClick={() => onWeekChange(week.weekNumber + 1)}
            disabled={week.weekNumber >= (maxWeek ?? totalWeeks ?? Infinity)}
            className="zn-pguide__nav"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Body - collapsible */}
      {!collapsed && (
        <div className="zn-pguide__body">
          {/* Phase description */}
          <p className="zn-pguide__desc">{t(guidance.descriptionKey)}</p>

          {/* Recovery week banner */}
          {week.isRecoveryWeek && (
            <Alert kind="info">{t("guidance.recoveryWeekNote")}</Alert>
          )}

          {/* Checklist */}
          <ul className="zn-pguide__list">
            {checks.map((item) => (
              <li
                key={item.id}
                className="zn-pguide__item"
                data-checked={item.checked}
              >
                {item.checked ? (
                  <svg viewBox="0 0 16 16" className="zn-pguide__mark" aria-hidden="true">
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      fill="currentColor"
                      opacity="0.15"
                    />
                    <path
                      d="M5 8l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" className="zn-pguide__mark" aria-hidden="true">
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </svg>
                )}
                <span className="zn-pguide__text">
                  {item.count != null
                    ? t(item.labelKey, { count: item.count })
                    : t(item.labelKey)}
                </span>
              </li>
            ))}
          </ul>

          {/* Tip */}
          {tip && (
            <p className="zn-pguide__tip">
              <span className="zn-pguide__tip-label">
                {t("guidance.tipLabel")}
              </span>{" "}
              {pickLang(tip, "text")}
            </p>
          )}

          {onGenerateRoute && (
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateRoute}
              className="zn-pguide__cta"
            >
              <RouteIcon size={15} />
              {t("view.findWeekRoute")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

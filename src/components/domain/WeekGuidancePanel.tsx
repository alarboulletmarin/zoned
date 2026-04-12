import { memo, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { usePickLang } from "@/lib/i18n-utils";
import { Lightbulb, ChevronDown, ChevronLeft, ChevronRight } from "@/components/icons";
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
    <div
      className={cn(
        "rounded-lg border border-dashed border-primary/30 bg-primary/5 dark:bg-primary/10",
        className,
      )}
    >
      {/* Header - always visible */}
      <div className="flex items-center gap-1 px-3 py-2">
        {showWeekNav && onWeekChange && (
          <button
            type="button"
            onClick={() => onWeekChange(week.weekNumber - 1)}
            disabled={week.weekNumber <= minWeek}
            className="p-0.5 rounded hover:bg-accent disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="size-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={toggleCollapse}
          className="flex-1 flex items-center justify-between gap-2 text-left"
          aria-expanded={!collapsed}
          aria-label={collapsed ? t("guidance.expand") : t("guidance.collapse")}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="size-4 text-primary" />
            {t("guidance.title")}
            {showWeekNav && (
              <span className="text-xs text-muted-foreground font-normal">
                S{week.weekNumber}
              </span>
            )}
            <span className="text-xs text-muted-foreground font-normal">
              {doneCount}/{items.length}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              !collapsed && "rotate-180",
            )}
          />
        </button>
        {showWeekNav && onWeekChange && (
          <button
            type="button"
            onClick={() => onWeekChange(week.weekNumber + 1)}
            disabled={week.weekNumber >= (maxWeek ?? totalWeeks ?? Infinity)}
            className="p-0.5 rounded hover:bg-accent disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>

      {/* Body - collapsible */}
      {!collapsed && (
        <div className="px-3 pb-3 space-y-3">
          {/* Phase description */}
          <p className="text-xs text-muted-foreground">
            {t(guidance.descriptionKey)}
          </p>

          {/* Recovery week banner */}
          {week.isRecoveryWeek && (
            <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded px-2 py-1.5">
              {t("guidance.recoveryWeekNote")}
            </div>
          )}

          {/* Checklist */}
          <div className="space-y-1.5">
            {checks.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 text-xs"
              >
                {item.checked ? (
                  <svg
                    viewBox="0 0 16 16"
                    className="size-4 shrink-0 text-green-500"
                  >
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
                  <svg
                    viewBox="0 0 16 16"
                    className="size-4 shrink-0 text-muted-foreground/50"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>
                )}
                <span
                  className={cn(
                    item.checked &&
                      "text-muted-foreground line-through",
                  )}
                >
                  {item.count != null
                    ? t(item.labelKey, { count: item.count })
                    : t(item.labelKey)}
                </span>
              </div>
            ))}
          </div>

          {/* Tip */}
          {tip && (
            <div className="text-xs bg-background/50 rounded px-2.5 py-2 border border-border/50">
              <span className="font-medium text-primary">
                {t("guidance.tipLabel")}
              </span>{" "}
              <span className="text-muted-foreground">
                {pickLang(tip, "text")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

import { useState, useMemo, memo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight, Flag, Dumbbell, Clock } from "@/components/icons";
import type { TrainingPlan, PlanSession } from "@/types/plan";
import type { AnyWorkoutTemplate } from "@/types";
import { getDominantZone, isRunningWorkout } from "@/types";
import { zoneClass } from "@/lib/zoneColors";
import { computeWeekKm } from "@/lib/planStats";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { dateToWeekAndDay } from "@/lib/planDates";

// ── Month names ─────────────────────────────────────────────────────

const MONTH_NAMES_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Props ───────────────────────────────────────────────────────────

interface PlanMonthlyViewProps {
  plan: TrainingPlan;
  workoutNames: Record<string, string>;
  workoutTemplates?: Record<string, AnyWorkoutTemplate>;
  currentWeek: number;
  initialWeek?: number;
  isEn: boolean;
  startDate: string | undefined;
  onSessionClick?: (weekNumber: number, sessionIndex: number, workoutId: string) => void;
  onSessionMove?: (fromWeek: number, fromSessionIndex: number, toWeek: number, toDay: number) => void;
  onSessionDelete?: (weekNumber: number, sessionIndex: number) => void;
  onFindRoute?: (weekNumber: number, sessionIndex: number) => void;
  onToggleComplete?: (weekNumber: number, sessionIndex: number) => void;
  onValidateWeek?: (weekNumber: number) => void;
  onWorkoutAdd?: (workoutId: string, weekNumber: number, day: number) => void;
  onAddToDay?: (weekNumber: number, day: number) => void;
  onWeekChange?: (week: number) => void;
  onVisibleWeeksChange?: (weekNumbers: number[]) => void;
  blockedDays?: Set<string>;
}

// ── Component ───────────────────────────────────────────────────────

export const PlanMonthlyView = memo(function PlanMonthlyView({
  plan,
  workoutNames,
  workoutTemplates,
  currentWeek,
  initialWeek,
  startDate,
  onSessionClick,
  onWeekChange,
  onVisibleWeeksChange,
}: PlanMonthlyViewProps) {
  const { t, i18n } = useTranslation("plan");
  // ── No start date fallback ──────────────────────────────────────
  if (!startDate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="size-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          {t("monthlyView.noStartDate")}
        </p>
      </div>
    );
  }

  // ── Parse start date ────────────────────────────────────────────
  // Find the Monday of the start week (dayOfWeek 0=Mon...6=Sun)
  const planStart = useMemo(() => {
    const dateOnly = startDate.split("T")[0];
    const [y, m, d] = dateOnly.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const jsDay = date.getDay(); // 0=Sun...6=Sat
    const offset = jsDay === 0 ? -6 : 1 - jsDay;
    date.setDate(date.getDate() + offset);
    return date;
  }, [startDate]);

  const planEnd = useMemo(() => {
    const d = new Date(planStart);
    d.setDate(d.getDate() + plan.totalWeeks * 7 - 1);
    return d;
  }, [planStart, plan.totalWeeks]);

  // ── Map: weekNumber -> { startDate, endDate } for each week ────
  const weekDateRanges = useMemo(() => {
    const map = new Map<number, { start: Date; end: Date }>();
    for (const week of plan.weeks) {
      const weekStart = new Date(planStart);
      weekStart.setDate(weekStart.getDate() + (week.weekNumber - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      map.set(week.weekNumber, { start: weekStart, end: weekEnd });
    }
    return map;
  }, [plan.weeks, planStart]);

  // ── Initial month: month containing the target training week ──
  const initialMonth = useMemo(() => {
    const targetWeek = initialWeek ?? currentWeek;
    if (targetWeek >= 1 && targetWeek <= plan.totalWeeks) {
      const range = weekDateRanges.get(targetWeek);
      if (range) {
        return { year: range.start.getFullYear(), month: range.start.getMonth() };
      }
    }
    return { year: planStart.getFullYear(), month: planStart.getMonth() };
  }, [planStart, initialWeek, currentWeek, plan.totalWeeks, weekDateRanges]);

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  // ── Month boundaries for navigation ────────────────────────────
  const minMonth = useMemo(() => ({ year: planStart.getFullYear(), month: planStart.getMonth() }), [planStart]);
  const maxMonth = useMemo(() => ({ year: planEnd.getFullYear(), month: planEnd.getMonth() }), [planEnd]);

  const canGoPrev = selectedMonth.year > minMonth.year ||
    (selectedMonth.year === minMonth.year && selectedMonth.month > minMonth.month);
  const canGoNext = selectedMonth.year < maxMonth.year ||
    (selectedMonth.year === maxMonth.year && selectedMonth.month < maxMonth.month);

  // Find the first week number visible in a given month
  const firstWeekInMonth = useCallback((year: number, month: number): number | null => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    let first: number | null = null;
    for (const [weekNumber, range] of weekDateRanges) {
      if (range.start <= monthEnd && range.end >= monthStart) {
        if (first === null || weekNumber < first) first = weekNumber;
      }
    }
    return first;
  }, [weekDateRanges]);

  const goToPrevMonth = useCallback(() => {
    if (!canGoPrev) return;
    const newMonth = selectedMonth.month === 0
      ? { year: selectedMonth.year - 1, month: 11 }
      : { year: selectedMonth.year, month: selectedMonth.month - 1 };
    setSelectedMonth(newMonth);
    const week = firstWeekInMonth(newMonth.year, newMonth.month);
    if (week != null) onWeekChange?.(week);
  }, [canGoPrev, selectedMonth, firstWeekInMonth, onWeekChange]);

  const goToNextMonth = useCallback(() => {
    if (!canGoNext) return;
    const newMonth = selectedMonth.month === 11
      ? { year: selectedMonth.year + 1, month: 0 }
      : { year: selectedMonth.year, month: selectedMonth.month + 1 };
    setSelectedMonth(newMonth);
    const week = firstWeekInMonth(newMonth.year, newMonth.month);
    if (week != null) onWeekChange?.(week);
  }, [canGoNext, selectedMonth, firstWeekInMonth, onWeekChange]);

  // Adjacent month labels for the "← Avril / Juin →" nav
  const monthNames = i18n.language?.startsWith("en") ? MONTH_NAMES_EN : MONTH_NAMES_FR;
  const prevMonthLabel = selectedMonth.month === 0 ? monthNames[11] : monthNames[selectedMonth.month - 1];
  const nextMonthLabel = selectedMonth.month === 11 ? monthNames[0] : monthNames[selectedMonth.month + 1];

  // ── Filter weeks that have at least one day in the selected month ──
  const filteredWeekNumbers = useMemo(() => {
    const monthStart = new Date(selectedMonth.year, selectedMonth.month, 1);
    const monthEnd = new Date(selectedMonth.year, selectedMonth.month + 1, 0);
    const result = new Set<number>();
    for (const [weekNumber, range] of weekDateRanges) {
      if (range.start <= monthEnd && range.end >= monthStart) {
        result.add(weekNumber);
      }
    }
    return result;
  }, [selectedMonth, weekDateRanges]);

  // Notify parent of visible weeks for guidance panel navigation
  useEffect(() => {
    onVisibleWeeksChange?.([...filteredWeekNumbers].sort((a, b) => a - b));
  }, [filteredWeekNumbers, onVisibleWeeksChange]);

  // ── Week range + cumulative volume summary ("S5 → S8 · 179 km") ──
  const monthSummary = useMemo(() => {
    const weeks = [...filteredWeekNumbers].sort((a, b) => a - b);
    if (weeks.length === 0) return null;
    const totalKm = Math.round(
      plan.weeks
        .filter((w) => filteredWeekNumbers.has(w.weekNumber))
        .reduce((sum, w) => sum + computeWeekKm(w), 0),
    );
    return { minWeek: weeks[0], maxWeek: weeks[weeks.length - 1], totalKm };
  }, [filteredWeekNumbers, plan.weeks]);

  // ── Lookup: weekNumber -> dayOfWeek -> sessions[] ───────────────
  const sessionsByWeekDay = useMemo(() => {
    const map = new Map<number, Map<number, PlanSession[]>>();
    for (const week of plan.weeks) {
      const dayMap = new Map<number, PlanSession[]>();
      for (const session of week.sessions) {
        const existing = dayMap.get(session.dayOfWeek) || [];
        existing.push(session);
        dayMap.set(session.dayOfWeek, existing);
      }
      map.set(week.weekNumber, dayMap);
    }
    return map;
  }, [plan.weeks]);

  const dayHeaders = useMemo(
    () => [0, 1, 2, 3, 4, 5, 6].map((i) => t(`daysShort.${i}`)),
    [t],
  );

  // ── Build the 7-column month grid (full weeks, Monday first) ───
  const gridCells = useMemo(() => {
    const daysInMonth = new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate();
    const firstJsDay = new Date(selectedMonth.year, selectedMonth.month, 1).getDay(); // 0=Sun...6=Sat
    const leadingBlanks = firstJsDay === 0 ? 6 : firstJsDay - 1; // Monday-first offset
    const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, i) => {
      const dayOffset = i - leadingBlanks; // 0-based day-of-month offset (can be negative or >= daysInMonth)
      const date = new Date(selectedMonth.year, selectedMonth.month, 1 + dayOffset);
      const isOutsideMonth = dayOffset < 0 || dayOffset >= daysInMonth;
      const mapping = dateToWeekAndDay(planStart, date);
      const inPlan = mapping != null && mapping.weekNumber >= 1 && mapping.weekNumber <= plan.totalWeeks;
      const sessions = inPlan
        ? sessionsByWeekDay.get(mapping!.weekNumber)?.get(mapping!.dayOfWeek) ?? []
        : [];
      return {
        key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        dayOfMonth: date.getDate(),
        isOutsideMonth,
        inPlan,
        weekNumber: mapping?.weekNumber,
        sessions,
        week: inPlan ? plan.weeks.find((w) => w.weekNumber === mapping!.weekNumber) : undefined,
      };
    });
  }, [selectedMonth, planStart, plan.totalWeeks, plan.weeks, sessionsByWeekDay]);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className={cn(
            "flex items-center gap-1 px-1.5 py-1 rounded-none font-mono text-[11px] uppercase tracking-[0.04em] transition-colors",
            canGoPrev
              ? "hover:bg-muted text-muted-foreground hover:text-foreground"
              : "text-muted-foreground/30 cursor-not-allowed",
          )}
          aria-label={t("monthlyView.previousMonth")}
        >
          <ChevronLeft className="size-4 shrink-0" />
          <span className="hidden sm:inline">{prevMonthLabel}</span>
        </button>

        <h3 className="font-mono font-bold uppercase tracking-[-0.04em] text-xl md:text-2xl text-center">
          {monthNames[selectedMonth.month]} {selectedMonth.year}
        </h3>

        <button
          type="button"
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={cn(
            "flex items-center gap-1 px-1.5 py-1 rounded-none font-mono text-[11px] uppercase tracking-[0.04em] transition-colors",
            canGoNext
              ? "hover:bg-muted text-muted-foreground hover:text-foreground"
              : "text-muted-foreground/30 cursor-not-allowed",
          )}
          aria-label={t("monthlyView.nextMonth")}
        >
          <span className="hidden sm:inline">{nextMonthLabel}</span>
          <ChevronRight className="size-4 shrink-0" />
        </button>
      </div>

      {/* Week range + cumulative volume */}
      {monthSummary && (
        <p className="text-right font-mono text-[11px] tracking-[0.04em] text-muted-foreground mb-3">
          {monthSummary.minWeek === monthSummary.maxWeek
            ? t("monthlyView.weekRangeSingle", { week: monthSummary.minWeek, km: monthSummary.totalKm })
            : t("monthlyView.weekRange", { from: monthSummary.minWeek, to: monthSummary.maxWeek, km: monthSummary.totalKm })}
        </p>
      )}

      {/* Day-of-week header row */}
      <div className="grid grid-cols-7 border-t border-filet">
        {dayHeaders.map((day, i) => (
          <div
            key={i}
            className="px-1 py-1.5 text-center font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Month grid — 72px rows on mobile/tablet, 118px on desktop (spec) */}
      <div className="grid grid-cols-7 auto-rows-[72px] md:auto-rows-[118px] border-l border-filet">
        {gridCells.map((cell) => {
          const isRestDay = cell.inPlan && cell.sessions.length === 0;
          return (
            <div
              key={cell.key}
              className={cn(
                "border-t border-r border-filet px-1 py-1 flex flex-col gap-0.5 overflow-hidden",
                cell.isOutsideMonth && "opacity-25",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10px] tabular-nums leading-none",
                  cell.sessions.length > 0 ? "text-foreground" : "text-muted-foreground/60",
                )}
              >
                {cell.dayOfMonth}
              </span>

              {isRestDay && (
                <span className="font-mono text-[9px] text-muted-foreground/60 leading-tight">
                  {t("prebuilt.rest")}
                </span>
              )}

              {cell.sessions.map((session, sIdx) => {
                const isRaceDay = session.workoutId === "__race_day__";
                const isIntermediateRace = session.workoutId === "__intermediate_race__";
                const isSpecialSession = isRaceDay || isIntermediateRace;
                const isStrength = session.sessionType === "strength" || session.workoutId?.startsWith("STR-");
                const template = workoutTemplates?.[session.workoutId];
                const zone = !isSpecialSession && !isStrength && template && isRunningWorkout(template)
                  ? getDominantZone(template)
                  : undefined;
                const workoutName = workoutNames[session.workoutId] || session.workoutId;
                const originalIndex = cell.week?.sessions.indexOf(session) ?? -1;
                const clickable = onSessionClick && !isSpecialSession && cell.weekNumber != null && originalIndex >= 0;

                const handleClick = clickable
                  ? () => onSessionClick(cell.weekNumber!, originalIndex, session.workoutId)
                  : undefined;

                if (isSpecialSession) {
                  return (
                    <div
                      key={sIdx}
                      className="shrink-0 bg-ink text-paper px-1 py-0.5 font-mono text-[9px] font-bold leading-tight flex items-center gap-0.5"
                    >
                      <Flag className="size-2.5 shrink-0" />
                      <span className="truncate">
                        {isIntermediateRace ? t("intermediateGoals.raceDayLabel") : t("calendar.race")}
                      </span>
                    </div>
                  );
                }

                if (isStrength) {
                  return (
                    <div
                      key={sIdx}
                      role={handleClick ? "button" : undefined}
                      tabIndex={handleClick ? 0 : undefined}
                      onClick={handleClick}
                      onKeyDown={
                        handleClick
                          ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }
                          : undefined
                      }
                      className={cn(
                        "flex items-center gap-0.5 font-mono text-[9px] text-muted-foreground leading-tight",
                        handleClick && "cursor-pointer hover:text-foreground",
                      )}
                    >
                      <Dumbbell className="size-2.5 shrink-0" />
                      <span className="truncate">
                        {t("monthlyView.strengthLabel")} · {formatDurationMinutes(session.estimatedDurationMin)}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={sIdx}
                    role={handleClick ? "button" : undefined}
                    tabIndex={handleClick ? 0 : undefined}
                    onClick={handleClick}
                    onKeyDown={
                      handleClick
                        ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }
                        : undefined
                    }
                    className={cn("flex flex-col gap-0.5 min-w-0", handleClick && "cursor-pointer group")}
                  >
                    <span
                      className={cn(
                        "self-start px-1 py-px font-mono text-[9px] font-bold leading-none tabular-nums",
                        zone
                          ? cn(zoneClass(zone, "bg"), zoneClass(zone, "textOn"))
                          : "border border-foreground text-foreground",
                      )}
                    >
                      {zone ? `Z${zone} · ` : ""}{formatDurationMinutes(session.estimatedDurationMin)}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] leading-tight text-foreground/80 line-clamp-2",
                        handleClick && "group-hover:text-primary",
                      )}
                      title={workoutName}
                    >
                      {workoutName}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-3 space-y-0.5">
        <p className="font-mono text-[10px] text-muted-foreground/70 flex items-center gap-1">
          <Clock className="size-2.5 shrink-0" />
          {t("monthlyView.footerScopeNote")}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/70">
          {t("monthlyView.footerGuidanceNote")}
        </p>
      </div>
    </div>
  );
});

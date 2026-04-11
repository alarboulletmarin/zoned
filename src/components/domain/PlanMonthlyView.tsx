import { useState, useMemo, memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "@/components/icons";
import type { TrainingPlan } from "@/types/plan";
import { PlanCalendar } from "./PlanCalendar";

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
  currentWeek: number;
  initialWeek?: number;
  isEn: boolean;
  startDate: string | undefined;
  onSessionClick?: (weekNumber: number, sessionIndex: number, workoutId: string) => void;
  onSessionMove?: (fromWeek: number, fromSessionIndex: number, toWeek: number, toDay: number) => void;
  onSessionDelete?: (weekNumber: number, sessionIndex: number) => void;
  onToggleComplete?: (weekNumber: number, sessionIndex: number) => void;
  onValidateWeek?: (weekNumber: number) => void;
  onWorkoutAdd?: (workoutId: string, weekNumber: number, day: number) => void;
  onAddToDay?: (weekNumber: number, day: number) => void;
  onWeekChange?: (week: number) => void;
}

// ── Component ───────────────────────────────────────────────────────

export const PlanMonthlyView = memo(function PlanMonthlyView({
  plan,
  workoutNames,
  currentWeek,
  initialWeek,
  isEn,
  startDate,
  onSessionClick,
  onSessionMove,
  onSessionDelete,
  onToggleComplete,
  onValidateWeek,
  onWorkoutAdd,
  onAddToDay,
  onWeekChange,
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

  const monthNames = i18n.language?.startsWith("en") ? MONTH_NAMES_EN : MONTH_NAMES_FR;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            canGoPrev
              ? "hover:bg-muted text-foreground"
              : "text-muted-foreground/30 cursor-not-allowed",
          )}
          aria-label={t("monthlyView.previousMonth")}
        >
          <ChevronLeft className="size-5" />
        </button>

        <h3 className="text-sm font-semibold">
          {monthNames[selectedMonth.month]} {selectedMonth.year}
        </h3>

        <button
          type="button"
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            canGoNext
              ? "hover:bg-muted text-foreground"
              : "text-muted-foreground/30 cursor-not-allowed",
          )}
          aria-label={t("monthlyView.nextMonth")}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Reuse PlanCalendar with filtered weeks */}
      <PlanCalendar
        plan={plan}
        workoutNames={workoutNames}
        currentWeek={currentWeek}
        isEn={isEn}
        onSessionClick={onSessionClick}
        onSessionMove={onSessionMove}
        onSessionDelete={onSessionDelete}
        onToggleComplete={onToggleComplete}
        onValidateWeek={onValidateWeek}
        onWorkoutAdd={onWorkoutAdd}
        onAddToDay={onAddToDay}
        filteredWeekNumbers={filteredWeekNumbers}
        planStartDate={startDate}
        visibleMonth={selectedMonth}
      />
    </div>
  );
});

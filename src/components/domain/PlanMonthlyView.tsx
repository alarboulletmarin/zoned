import { useState, useMemo, memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight, Star, Flag, Clock, Plus } from "@/components/icons";
import { PHASE_META } from "@/types/plan";
import type { TrainingPlan, PlanSession, PlanWeek } from "@/types/plan";

// ── Color maps (shared with PlanCalendar) ────────────────────────────

const SESSION_COLORS: Record<string, string> = {
  recovery: "#94a3b8",
  endurance: "#60a5fa",
  long_run: "#2563eb",
  tempo: "#eab308",
  threshold: "#f97316",
  vo2max: "#ef4444",
  speed: "#f87171",
  fartlek: "#a855f7",
  hills: "#22c55e",
  race_specific: "#f59e0b",
  strength: "#78716c",
  cycling: "#06b6d4",
  swimming: "#0ea5e9",
  yoga: "#d946ef",
  rest_day: "#a1a1aa",
  rest: "#a1a1aa",
  cross_training: "#6b7280",
};

const PHASE_BG: Record<string, string> = {
  base: "bg-blue-50/50 dark:bg-blue-950/20",
  build: "bg-orange-50/50 dark:bg-orange-950/20",
  peak: "bg-red-50/50 dark:bg-red-950/20",
  taper: "bg-green-50/50 dark:bg-green-950/20",
  recovery: "bg-slate-50/50 dark:bg-slate-950/20",
};

// ── Day headers ─────────────────────────────────────────────────────

const DAY_HEADERS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAY_HEADERS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES_FR = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];
const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Types ───────────────────────────────────────────────────────────

interface SessionEntry {
  session: PlanSession;
  weekNumber: number;
  sessionIndex: number;
  week: PlanWeek;
}

interface PlanMonthlyViewProps {
  plan: TrainingPlan;
  workoutNames: Record<string, string>;
  currentWeek: number;
  isEn: boolean;
  startDate: string | undefined;
  onSessionClick?: (weekNumber: number, sessionIndex: number, workoutId: string) => void;
  onToggleComplete?: (weekNumber: number, sessionIndex: number) => void;
  onAddToDay?: (weekNumber: number, day: number) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────

function getSessionDate(startDate: Date, weekNumber: number, dayOfWeek: number): Date {
  const d = new Date(startDate);
  d.setDate(d.getDate() + (weekNumber - 1) * 7 + dayOfWeek);
  return d;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Get the Monday-based weekday for a Date (0=Mon...6=Sun).
 */
function getMondayBasedDay(date: Date): number {
  const jsDay = date.getDay(); // 0=Sun...6=Sat
  return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * Get all days for a calendar month grid.
 * Returns 4-6 weeks of 7 days, padding with previous/next month days.
 */
function getCalendarDays(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const startDay = getMondayBasedDay(firstOfMonth); // offset from Monday

  const days: Date[] = [];

  // Previous month padding
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, 1);
    d.setDate(d.getDate() - i - 1);
    days.push(d);
  }

  // Current month days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // Next month padding to complete the last row
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1];
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    days.push(next);
  }

  return days;
}

/**
 * Find which week number a given date falls in (for plan range checks).
 * Returns the week number (1-based) or null if outside the plan.
 */
function getWeekNumberForDate(startDate: Date, date: Date): number | null {
  const diffMs = date.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  const weekNumber = Math.floor(diffDays / 7) + 1;
  return weekNumber;
}

function getDayOfWeekForDate(startDate: Date, date: Date): number {
  const diffMs = date.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return ((diffDays % 7) + 7) % 7; // 0=Mon...6=Sun based on plan start
}

// ── Component ───────────────────────────────────────────────────────

export const PlanMonthlyView = memo(function PlanMonthlyView({
  plan,
  workoutNames,
  currentWeek,
  isEn,
  startDate,
  onSessionClick,
  onToggleComplete,
  onAddToDay,
}: PlanMonthlyViewProps) {
  // ── No start date fallback ──────────────────────────────────────
  if (!startDate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="size-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          {isEn
            ? "Set a start date to display the monthly view"
            : "Definissez une date de debut pour afficher la vue mensuelle"}
        </p>
      </div>
    );
  }

  // ── Parse start date ────────────────────────────────────────────
  const planStart = useMemo(() => {
    const [y, m, d] = startDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [startDate]);

  const planEnd = useMemo(() => {
    const d = new Date(planStart);
    d.setDate(d.getDate() + plan.totalWeeks * 7 - 1);
    return d;
  }, [planStart, plan.totalWeeks]);

  // ── Pre-compute session map: dateKey -> SessionEntry[] ──────────
  const sessionMap = useMemo(() => {
    const map = new Map<string, SessionEntry[]>();
    for (const week of plan.weeks) {
      for (let sIdx = 0; sIdx < week.sessions.length; sIdx++) {
        const session = week.sessions[sIdx];
        const date = getSessionDate(planStart, week.weekNumber, session.dayOfWeek);
        const key = toDateKey(date);
        const entry: SessionEntry = {
          session,
          weekNumber: week.weekNumber,
          sessionIndex: sIdx,
          week,
        };
        const existing = map.get(key);
        if (existing) {
          existing.push(entry);
        } else {
          map.set(key, [entry]);
        }
      }
    }
    return map;
  }, [plan.weeks, planStart]);

  // ── Week lookup by week number ─────────────────────────────────
  const weekByNumber = useMemo(() => {
    const map = new Map<number, PlanWeek>();
    for (const week of plan.weeks) {
      map.set(week.weekNumber, week);
    }
    return map;
  }, [plan.weeks]);

  // ── Initial month: the month containing the current training week
  const initialMonth = useMemo(() => {
    if (currentWeek >= 1 && currentWeek <= plan.totalWeeks) {
      const currentWeekStart = new Date(planStart);
      currentWeekStart.setDate(currentWeekStart.getDate() + (currentWeek - 1) * 7);
      return { year: currentWeekStart.getFullYear(), month: currentWeekStart.getMonth() };
    }
    return { year: planStart.getFullYear(), month: planStart.getMonth() };
  }, [planStart, currentWeek, plan.totalWeeks]);

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  // ── Month boundaries for navigation ─────────────────────────────
  const minMonth = useMemo(() => ({ year: planStart.getFullYear(), month: planStart.getMonth() }), [planStart]);
  const maxMonth = useMemo(() => ({ year: planEnd.getFullYear(), month: planEnd.getMonth() }), [planEnd]);

  const canGoPrev = selectedMonth.year > minMonth.year ||
    (selectedMonth.year === minMonth.year && selectedMonth.month > minMonth.month);
  const canGoNext = selectedMonth.year < maxMonth.year ||
    (selectedMonth.year === maxMonth.year && selectedMonth.month < maxMonth.month);

  const goToPrevMonth = useCallback(() => {
    if (!canGoPrev) return;
    setSelectedMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  }, [canGoPrev]);

  const goToNextMonth = useCallback(() => {
    if (!canGoNext) return;
    setSelectedMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  }, [canGoNext]);

  // ── Calendar days for the selected month ────────────────────────
  const calendarDays = useMemo(
    () => getCalendarDays(selectedMonth.year, selectedMonth.month),
    [selectedMonth.year, selectedMonth.month],
  );

  const today = useMemo(() => new Date(), []);
  const dayHeaders = isEn ? DAY_HEADERS_EN : DAY_HEADERS_FR;
  const monthNames = isEn ? MONTH_NAMES_EN : MONTH_NAMES_FR;

  // ── Render ──────────────────────────────────────────────────────
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
          aria-label={isEn ? "Previous month" : "Mois precedent"}
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
          aria-label={isEn ? "Next month" : "Mois suivant"}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border/50 rounded-lg overflow-hidden border border-border/50">
        {/* Day headers */}
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="bg-muted/50 px-1 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {/* Day cells */}
        {calendarDays.map((date, idx) => {
          const dateKey = toDateKey(date);
          const isCurrentMonth = date.getMonth() === selectedMonth.month;
          const isToday = isSameDay(date, today);
          const sessions = sessionMap.get(dateKey) || [];
          const weekNum = getWeekNumberForDate(planStart, date);
          const isInPlanRange = weekNum !== null && weekNum >= 1 && weekNum <= plan.totalWeeks;
          const isCurrentWeekDay = isInPlanRange && weekNum === currentWeek;
          const week = weekNum !== null ? weekByNumber.get(weekNum) : undefined;
          const phase = week?.phase;
          const dayOfWeek = isInPlanRange ? getDayOfWeekForDate(planStart, date) : -1;

          return (
            <div
              key={idx}
              className={cn(
                "bg-background relative transition-colors",
                // Cell height
                "min-h-[48px] md:min-h-[100px]",
                // Outside month
                !isCurrentMonth && "opacity-30",
                // Outside plan range (but in month)
                isCurrentMonth && !isInPlanRange && "bg-muted/20",
                // Current training week tint
                isCurrentWeekDay && "bg-primary/5",
                // Phase background for in-plan days
                isInPlanRange && !isCurrentWeekDay && phase && PHASE_BG[phase],
                // Today highlight
                isToday && "ring-2 ring-primary ring-inset z-10",
              )}
            >
              {/* Day number + phase indicator */}
              <div className="flex items-start justify-between p-1">
                <span
                  className={cn(
                    "text-xs tabular-nums leading-none",
                    isToday && "font-bold text-primary",
                    !isToday && isCurrentMonth && "text-foreground",
                    !isToday && !isCurrentMonth && "text-muted-foreground",
                  )}
                >
                  {date.getDate()}
                </span>
                {/* Phase dot for first day of a week in plan */}
                {isInPlanRange && phase && dayOfWeek === 0 && (
                  <div
                    className={cn("size-1.5 rounded-full shrink-0 mt-0.5", PHASE_META[phase].color)}
                    title={isEn ? PHASE_META[phase].labelEn : PHASE_META[phase].label}
                  />
                )}
              </div>

              {/* Desktop sessions (>= md) */}
              <div className="hidden md:block px-1 pb-1 space-y-0.5">
                {sessions.map((entry, sIdx) => {
                  const { session, weekNumber, sessionIndex } = entry;
                  const isRaceDay = session.workoutId === "__race_day__";
                  const dotColor = SESSION_COLORS[session.sessionType] || "#9ca3af";
                  const displayName = workoutNames[session.workoutId] || session.workoutId;
                  const isCompleted = session.status === "completed";
                  const isSkipped = session.status === "skipped";

                  if (isRaceDay) {
                    return (
                      <div
                        key={sIdx}
                        className="rounded border border-primary/30 bg-primary/10 px-1 py-0.5 text-center"
                      >
                        <Flag className="size-3 text-primary mx-auto" />
                        <span className="text-[9px] font-semibold text-primary leading-tight block">
                          {isEn ? "Race" : "Course"}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={sIdx} className="flex items-start gap-0.5">
                      {/* Completion checkbox */}
                      {onToggleComplete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(weekNumber, sessionIndex);
                          }}
                          className={cn(
                            "size-3 rounded-sm border shrink-0 flex items-center justify-center transition-colors mt-0.5",
                            isCompleted
                              ? "bg-green-500 border-green-500 text-white"
                              : isSkipped
                                ? "bg-muted border-muted-foreground/30"
                                : "border-muted-foreground/40 hover:border-primary",
                          )}
                          title={
                            isCompleted
                              ? (isEn ? "Completed" : "Fait")
                              : isSkipped
                                ? (isEn ? "Skipped" : "Passe")
                                : (isEn ? "Mark as done" : "Marquer comme fait")
                          }
                        >
                          {isCompleted && (
                            <svg viewBox="0 0 12 12" className="size-2" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                          {isSkipped && (
                            <svg viewBox="0 0 12 12" className="size-1.5" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 3l6 6M9 3l-6 6" />
                            </svg>
                          )}
                        </button>
                      )}

                      {/* Session card */}
                      <div
                        role={onSessionClick ? "button" : undefined}
                        tabIndex={onSessionClick ? 0 : undefined}
                        onClick={
                          onSessionClick
                            ? () => onSessionClick(weekNumber, sessionIndex, session.workoutId)
                            : undefined
                        }
                        onKeyDown={
                          onSessionClick
                            ? (e) => { if (e.key === "Enter") onSessionClick(weekNumber, sessionIndex, session.workoutId); }
                            : undefined
                        }
                        className={cn(
                          "flex-1 min-w-0 rounded px-1 py-0.5 transition-colors border-l-2",
                          "bg-secondary/60 hover:bg-secondary",
                          isCompleted && "bg-green-500/10 hover:bg-green-500/15 ring-1 ring-green-500/30",
                          isSkipped && "opacity-50",
                          onSessionClick ? "cursor-pointer" : "cursor-default",
                        )}
                        style={{ borderLeftColor: dotColor }}
                      >
                        <div className="flex items-center gap-0.5">
                          {session.isKeySession && (
                            <Star className="size-2 text-yellow-500 fill-yellow-500 shrink-0" />
                          )}
                          <span
                            className={cn(
                              "text-[10px] leading-tight font-medium truncate block",
                              isSkipped && "line-through text-muted-foreground",
                            )}
                            title={displayName}
                          >
                            {displayName}
                          </span>
                        </div>
                        {session.estimatedDurationMin > 0 && !session.workoutId.startsWith("__activity_") && (
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="size-2" />
                            {session.estimatedDurationMin}min
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add session button for empty in-plan days */}
                {sessions.length === 0 && isInPlanRange && isCurrentMonth && onAddToDay && weekNum !== null && (
                  <button
                    type="button"
                    onClick={() => onAddToDay(weekNum, dayOfWeek)}
                    className="w-full mt-auto rounded border border-dashed border-muted-foreground/20 p-1 flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground/60 hover:border-muted-foreground/40 transition-colors"
                    title={isEn ? "Add session" : "Ajouter une seance"}
                  >
                    <Plus className="size-3" />
                  </button>
                )}
              </div>

              {/* Mobile sessions (< md) */}
              <div className="md:hidden px-0.5 pb-1">
                {sessions.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {sessions.map((entry, sIdx) => {
                      const { session, weekNumber, sessionIndex } = entry;
                      const isRaceDay = session.workoutId === "__race_day__";
                      const dotColor = SESSION_COLORS[session.sessionType] || "#9ca3af";
                      const isCompleted = session.status === "completed";
                      const isSkipped = session.status === "skipped";

                      if (isRaceDay) {
                        return (
                          <div
                            key={sIdx}
                            className="size-4 rounded-sm bg-primary/20 flex items-center justify-center"
                            title={isEn ? "Race" : "Course"}
                          >
                            <Flag className="size-2.5 text-primary" />
                          </div>
                        );
                      }

                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={
                            onSessionClick
                              ? () => onSessionClick(weekNumber, sessionIndex, session.workoutId)
                              : undefined
                          }
                          className={cn(
                            "size-4 rounded-sm flex items-center justify-center text-[8px] font-bold transition-colors",
                            isCompleted && "ring-1 ring-green-500/50",
                            isSkipped && "opacity-40",
                            onSessionClick ? "cursor-pointer active:scale-95" : "cursor-default",
                          )}
                          style={{ backgroundColor: `${dotColor}30`, color: dotColor }}
                          title={workoutNames[session.workoutId] || session.workoutId}
                        >
                          {isCompleted ? (
                            <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          ) : isSkipped ? (
                            <svg viewBox="0 0 12 12" className="size-2" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 3l6 6M9 3l-6 6" />
                            </svg>
                          ) : (
                            session.sessionType.charAt(0).toUpperCase()
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Mobile add button for empty in-plan days */}
                {sessions.length === 0 && isInPlanRange && isCurrentMonth && onAddToDay && weekNum !== null && (
                  <button
                    type="button"
                    onClick={() => onAddToDay(weekNum, dayOfWeek)}
                    className="w-full mt-0.5 flex items-center justify-center text-muted-foreground/20 active:text-muted-foreground/50"
                    title={isEn ? "Add session" : "Ajouter une seance"}
                  >
                    <Plus className="size-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

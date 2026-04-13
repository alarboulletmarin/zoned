import { useState, useRef, useMemo, useCallback, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Star, Flag, Clock, Trash2, Eye, Dumbbell } from "@/components/icons";
import { PHASE_META, RACE_DISTANCE_META } from "@/types/plan";
import type { TrainingPlan, PlanSession, IntermediateGoal } from "@/types/plan";
import { computeWeekKm, computeWeekDuration } from "@/lib/planStats";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { usePickLang } from "@/lib/i18n-utils";
import { toast } from "sonner";

// ── Color maps ──────────────────────────────────────────────────────

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

// ── Props ───────────────────────────────────────────────────────────

interface PlanCalendarProps {
  plan: TrainingPlan;
  workoutNames: Record<string, string>;
  currentWeek: number;
  isEn: boolean;
  onSessionClick?: (weekNumber: number, sessionIndex: number, workoutId: string) => void;
  onSessionMove?: (
    fromWeek: number,
    fromSessionIndex: number,
    toWeek: number,
    toDay: number,
  ) => void;
  onSessionDelete?: (weekNumber: number, sessionIndex: number) => void;
  onToggleComplete?: (weekNumber: number, sessionIndex: number) => void;
  onValidateWeek?: (weekNumber: number) => void;
  onWorkoutAdd?: (workoutId: string, weekNumber: number, day: number) => void;
  /** Mobile: open the workout panel for a specific day */
  onAddToDay?: (weekNumber: number, day: number) => void;
  /** If provided, only render these week numbers (used by monthly view) */
  filteredWeekNumbers?: Set<number>;
  /** If provided, show day-of-month numbers in cells (ISO date or datetime string) */
  planStartDate?: string;
  /** If provided, gray out cells outside this month (used by monthly view) */
  visibleMonth?: { year: number; month: number };
  /** If provided, scroll this week row into view on mount */
  initialWeek?: number;
  /** Set of "weekNumber-dayOfWeek" strings marking blocked days */
  blockedDays?: Set<string>;
}

// ── Component ───────────────────────────────────────────────────────

export const PlanCalendar = memo(function PlanCalendar({
  plan,
  workoutNames,
  currentWeek,
  isEn,
  onSessionClick,
  onSessionMove,
  onSessionDelete,
  onToggleComplete,
  onValidateWeek,
  onWorkoutAdd,
  filteredWeekNumbers,
  planStartDate,
  visibleMonth,
  initialWeek,
  blockedDays,
}: PlanCalendarProps) {
  const { t } = useTranslation("plan");
  const pickLang = usePickLang();
  const dayHeaders = useMemo(
    () => [0, 1, 2, 3, 4, 5, 6].map((i) => t(`daysShort.${i}`)),
    [t],
  );

  // ── Scroll-to-week ref ────────────────────────────────────────────
  const initialWeekRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (initialWeek == null || !initialWeekRowRef.current) return;
    requestAnimationFrame(() => {
      initialWeekRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [initialWeek]);

  // Parse planStartDate and find the Monday of week 1
  // dayOfWeek in sessions is 0=Mon...6=Sun, so we anchor to the Monday of the start week
  const parsedStartDate = useMemo(() => {
    if (!planStartDate) return null;
    const dateOnly = planStartDate.split("T")[0];
    const [y, m, d] = dateOnly.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    // Find the Monday of this week (JS getDay: 0=Sun...6=Sat)
    const jsDay = date.getDay();
    const offset = jsDay === 0 ? -6 : 1 - jsDay; // Monday offset
    date.setDate(date.getDate() + offset);
    return date;
  }, [planStartDate]);

  // ── Native drag state ───────────────────────────────────────────
  const [draggedSession, setDraggedSession] = useState<{
    weekNumber: number;
    sessionIndex: number;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ weekNumber: number; day: number } | null>(null);

  // Touch-specific refs
  const touchDragRef = useRef<{
    weekNumber: number;
    sessionIndex: number;
  } | null>(null);
  const touchGhostRef = useRef<HTMLElement | null>(null);
  const dropTargetRef = useRef<{ weekNumber: number; day: number } | null>(null);

  // Long-press / context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    weekNumber: number;
    sessionIndex: number;
    workoutId: string;
  } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const longPressFiredRef = useRef(false);
  // Store session info for touchend tap detection
  const touchSessionRef = useRef<{
    weekNumber: number;
    sessionIndex: number;
    workoutId: string;
    target: HTMLElement | null;
  } | null>(null);

  // Close context menu on outside click or Escape
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => setContextMenu(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    document.addEventListener("pointerdown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [contextMenu]);

  // Pre-compute which weeks start a new phase (for top-border marking)
  const phaseStartWeeks = useMemo(() => {
    const starts = new Set<number>();
    for (const phaseRange of plan.phases) {
      starts.add(phaseRange.startWeek);
    }
    // Remove the very first week so it doesn't get an extra border
    const firstWeek = plan.weeks[0]?.weekNumber;
    if (firstWeek !== undefined) starts.delete(firstWeek);
    return starts;
  }, [plan.phases, plan.weeks]);

  // Build a lookup: weekNumber -> dayOfWeek -> sessions[]
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

  // ── Desktop drag handlers (HTML5 Drag and Drop) ─────────────────

  const handleDragStart = useCallback(
    (e: React.DragEvent, weekNumber: number, sessionIndex: number) => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = "move";
      // Delay state change so browser captures the ghost at full opacity first
      requestAnimationFrame(() => {
        setDraggedSession({ weekNumber, sessionIndex });
      });
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, weekNumber: number, day: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropTarget({ weekNumber, day });
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, weekNumber: number, day: number) => {
      e.preventDefault();
      setDropTarget(null);

      // Block drop on unavailable days
      if (blockedDays?.has(`${weekNumber}-${day}`)) {
        toast.error(t("reschedule.blockedDrop"));
        setDraggedSession(null);
        return;
      }

      // Check if this is a drop from the workout library panel
      const workoutId = e.dataTransfer.getData("workout-id");
      if (workoutId && onWorkoutAdd) {
        onWorkoutAdd(workoutId, weekNumber, day);
        setDraggedSession(null);
        return;
      }

      if (!draggedSession || !onSessionMove) return;

      // Don't move to same position
      const week = plan.weeks.find(w => w.weekNumber === draggedSession.weekNumber);
      const session = week?.sessions[draggedSession.sessionIndex];
      if (session && session.dayOfWeek === day && draggedSession.weekNumber === weekNumber) return;

      onSessionMove(draggedSession.weekNumber, draggedSession.sessionIndex, weekNumber, day);
      setDraggedSession(null);
    },
    [draggedSession, onSessionMove, onWorkoutAdd, plan.weeks, blockedDays, t],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedSession(null);
    setDropTarget(null);
  }, []);

  // ── Mobile touch handlers (long press + drag) ──────────────────

  const startDrag = useCallback(
    (touch: React.Touch, weekNumber: number, sessionIndex: number, target: HTMLElement | null) => {
      isDraggingRef.current = true;
      touchDragRef.current = { weekNumber, sessionIndex };
      setDraggedSession({ weekNumber, sessionIndex });

      // Clone the dragged element as ghost
      const ghost = target
        ? (target.cloneNode(true) as HTMLElement)
        : document.createElement("div");

      ghost.style.cssText = `
        position: fixed; z-index: 9999; pointer-events: none;
        width: ${target?.offsetWidth || 80}px;
        opacity: 0.85;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        transform: translate(-50%, -50%);
      `;
      ghost.style.left = `${touch.clientX}px`;
      ghost.style.top = `${touch.clientY}px`;
      document.body.appendChild(ghost);
      touchGhostRef.current = ghost;
    },
    [],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, weekNumber: number, sessionIndex: number, workoutId: string) => {
      // If the tap is on a button (checkbox, delete), let it handle itself
      const tappedEl = e.target as HTMLElement;
      if (tappedEl.closest("button")) return;

      e.stopPropagation();
      const touch = e.touches[0];
      const target = (e.target as HTMLElement).closest("[draggable]") as HTMLElement | null;

      // Reset state
      isDraggingRef.current = false;
      longPressFiredRef.current = false;
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      touchSessionRef.current = { weekNumber, sessionIndex, workoutId, target };

      // Start long-press timer (400ms)
      longPressTimerRef.current = setTimeout(() => {
        if (!isDraggingRef.current) {
          longPressFiredRef.current = true;
          // Haptic feedback
          if (navigator.vibrate) navigator.vibrate(50);
          setContextMenu({
            x: touch.clientX,
            y: touch.clientY,
            weekNumber,
            sessionIndex,
            workoutId,
          });
        }
      }, 400);
    },
    [],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const startPos = touchStartPosRef.current;

      // If long press already fired (context menu open), ignore movement
      if (longPressFiredRef.current) {
        e.preventDefault();
        return;
      }

      // Check if we've moved enough to start a drag (>10px)
      if (!isDraggingRef.current && startPos) {
        const dx = touch.clientX - startPos.x;
        const dy = touch.clientY - startPos.y;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          // Cancel long-press timer, start drag
          if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
          const sessionInfo = touchSessionRef.current;
          if (sessionInfo) {
            startDrag(touch, sessionInfo.weekNumber, sessionInfo.sessionIndex, sessionInfo.target);
          }
        }
      }

      // If dragging, move the ghost
      if (isDraggingRef.current && touchGhostRef.current) {
        e.preventDefault();
        touchGhostRef.current.style.left = `${touch.clientX}px`;
        touchGhostRef.current.style.top = `${touch.clientY}px`;

        // Find drop target using document.elementsFromPoint
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        const dropCell = elements.find(el => el.hasAttribute("data-drop-id"));

        if (dropCell) {
          const [weekStr, dayStr] = (dropCell.getAttribute("data-drop-id") || "").split("-");
          const newTarget = { weekNumber: Number(weekStr), day: Number(dayStr) };
          if (
            !dropTargetRef.current ||
            dropTargetRef.current.weekNumber !== newTarget.weekNumber ||
            dropTargetRef.current.day !== newTarget.day
          ) {
            dropTargetRef.current = newTarget;
            setDropTarget(newTarget);
          }
        } else {
          dropTargetRef.current = null;
          setDropTarget(null);
        }
      }
    },
    [startDrag],
  );

  const handleTouchEnd = useCallback(() => {
    // Cancel long-press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const wasDragging = isDraggingRef.current;
    const wasLongPress = longPressFiredRef.current;
    const sessionInfo = touchSessionRef.current;

    // Clean up ghost if dragging
    if (touchGhostRef.current) {
      document.body.removeChild(touchGhostRef.current);
      touchGhostRef.current = null;
    }

    if (wasDragging) {
      // Handle drop
      const dragState = touchDragRef.current;
      const target = dropTargetRef.current;
      touchDragRef.current = null;
      dropTargetRef.current = null;
      setDraggedSession(null);
      setDropTarget(null);

      if (dragState && target && onSessionMove) {
        if (blockedDays?.has(`${target.weekNumber}-${target.day}`)) {
          toast.error(t("reschedule.blockedDrop"));
        } else {
          const week = plan.weeks.find(w => w.weekNumber === dragState.weekNumber);
          const session = week?.sessions[dragState.sessionIndex];
          if (!(session && session.dayOfWeek === target.day && dragState.weekNumber === target.weekNumber)) {
            onSessionMove(dragState.weekNumber, dragState.sessionIndex, target.weekNumber, target.day);
          }
        }
      }
    } else if (!wasLongPress && sessionInfo) {
      // Short tap: open context menu (easier than hitting the small checkbox)
      setContextMenu({
        x: touchStartPosRef.current?.x ?? 0,
        y: touchStartPosRef.current?.y ?? 0,
        weekNumber: sessionInfo.weekNumber,
        sessionIndex: sessionInfo.sessionIndex,
        workoutId: sessionInfo.workoutId,
      });
    }
    // If wasLongPress: context menu is already open, do nothing

    // Reset refs
    isDraggingRef.current = false;
    longPressFiredRef.current = false;
    touchStartPosRef.current = null;
    touchSessionRef.current = null;
  }, [onSessionMove, onSessionClick, plan.weeks]);

  // ── Listen for mobile touch drops from the workout panel ────
  useEffect(() => {
    if (!onWorkoutAdd) return;
    const handler = (e: Event) => {
      const { workoutId, weekNumber, day } = (e as CustomEvent).detail;
      onWorkoutAdd(workoutId, weekNumber, day);
    };
    document.addEventListener("panel-workout-drop", handler);
    return () => document.removeEventListener("panel-workout-drop", handler);
  }, [onWorkoutAdd]);

  return (
    <>
      {/* ── Calendar grid ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm table-fixed">
          <colgroup>
            <col className="w-[90px] md:w-[110px]" />
            {Array.from({ length: 7 }, (_, i) => (
              <col key={i} />
            ))}
          </colgroup>
          {/* Header row */}
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-background px-2 py-2 text-left text-xs font-medium text-muted-foreground">
                {t("calendar.week")}
              </th>
              {dayHeaders.map((day, i) => (
                <th
                  key={i}
                  className="px-0.5 py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          {/* Week rows */}
          <tbody>
            {plan.weeks.filter(week => !filteredWeekNumbers || filteredWeekNumbers.has(week.weekNumber)).map((week) => {
              const isCurrent =
                currentWeek === week.weekNumber &&
                currentWeek >= 1 &&
                currentWeek <= plan.totalWeeks;
              const phaseMeta = PHASE_META[week.phase];
              const isPhaseStart = phaseStartWeeks.has(week.weekNumber);
              const dayMap = sessionsByWeekDay.get(week.weekNumber);

              // No separator rows — month labels appear inline in cells (on the 1st of each month)

              // Short label for calendar column (avoid overflow)
              let weekLabel: string;
              if (week.weekNumber === plan.totalWeeks && week.sessions.some(s => s.workoutId === "__race_day__")) {
                weekLabel = t("calendar.race");
              } else if (week.intermediateRace) {
                weekLabel = t("intermediateGoals.weekLabel");
              } else if (week.isRecoveryWeek) {
                weekLabel = t("calendar.recoveryWeek");
              } else {
                weekLabel = `${t("calendar.weekPrefix")}${week.weekNumber}`;
              }

              return (
                <tr
                  key={week.weekNumber}
                  ref={week.weekNumber === initialWeek ? initialWeekRowRef : undefined}
                  className={cn(
                    "border-b border-border/40",
                    isPhaseStart && "border-t-2 border-t-border",
                    isCurrent && "bg-primary/10",
                    !isCurrent && week.isRecoveryWeek && "bg-muted/40",
                    !isCurrent && !week.isRecoveryWeek && PHASE_BG[week.phase as string]
                  )}
                >
                  {/* Week label column (sticky on mobile) */}
                  <td
                    className={cn(
                      "sticky left-0 z-10 px-2 py-1.5 align-top",
                      isCurrent && "bg-primary/10",
                      !isCurrent && week.isRecoveryWeek && "bg-muted/40",
                      !isCurrent && !week.isRecoveryWeek && "bg-background"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className={cn("size-2 rounded-full shrink-0", phaseMeta.color)}
                      />
                      <span className="font-medium text-xs whitespace-nowrap">
                        {weekLabel}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground leading-none">
                      {pickLang(phaseMeta, "label")}
                    </span>
                    {week.sessions.length > 0 && (
                      <span className="text-[9px] text-muted-foreground/70 tabular-nums">
                        ~{Math.round(computeWeekKm(week))}km · {formatDurationMinutes(computeWeekDuration(week))}
                      </span>
                    )}
                    {isCurrent && (
                      <div className="text-[9px] font-semibold text-primary mt-0.5">
                        {t("calendar.now")}
                      </div>
                    )}
                    {/* Completion stats + validate button */}
                    {(() => {
                      const total = week.sessions.length;
                      if (total === 0) return null;
                      const done = week.sessions.filter(s => s.status === "completed" || s.status === "modified").length;
                      const skipped = week.sessions.filter(s => s.status === "skipped").length;
                      const resolved = done + skipped;
                      const allResolved = resolved === total;

                      if (allResolved && resolved > 0) {
                        return (
                          <div className="text-[9px] text-green-600 dark:text-green-400 font-medium mt-0.5 flex items-center gap-0.5">
                            <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6l3 3 5-5" /></svg>
                            {done}/{total}
                          </div>
                        );
                      }

                      if (resolved > 0 && !allResolved && onValidateWeek) {
                        return (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onValidateWeek(week.weekNumber); }}
                            className="text-[9px] mt-0.5 px-1 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                            title={t("calendar.validateWeek")}
                          >
                            {t("calendar.validateCount", { done, total })}
                          </button>
                        );
                      }

                      return null;
                    })()}
                  </td>

                  {/* Day cells (0=Mon to 6=Sun) */}
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const sessions = dayMap?.get(dayIndex) || [];
                    const isDropHere =
                      dropTarget?.weekNumber === week.weekNumber && dropTarget?.day === dayIndex;

                    // Compute actual date for this cell
                    let dayOfMonth: number | null = null;
                    let isToday = false;
                    let isOutsideMonth = false;
                    let isFirstOfMonth = false;
                    let monthLabel = "";
                    if (parsedStartDate) {
                      const cellDate = new Date(parsedStartDate);
                      cellDate.setDate(cellDate.getDate() + (week.weekNumber - 1) * 7 + dayIndex);
                      dayOfMonth = cellDate.getDate();
                      const now = new Date();
                      isToday = cellDate.getFullYear() === now.getFullYear() &&
                        cellDate.getMonth() === now.getMonth() &&
                        cellDate.getDate() === now.getDate();
                      if (visibleMonth) {
                        isOutsideMonth = cellDate.getFullYear() !== visibleMonth.year ||
                          cellDate.getMonth() !== visibleMonth.month;
                      }
                      // Detect first of month for inline month label
                      isFirstOfMonth = dayOfMonth === 1 && dayIndex > 0; // dayIndex > 0 to skip Monday (already a new row)
                      if (dayOfMonth === 1) {
                        const shortMonths = isEn
                          ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                          : ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
                        monthLabel = shortMonths[cellDate.getMonth()];
                      }
                    }

                    const isBlockedDay = blockedDays?.has(`${week.weekNumber}-${dayIndex}`) ?? false;

                    return (
                      <td
                        key={dayIndex}
                        data-drop-id={`${week.weekNumber}-${dayIndex}`}
                        onDragOver={isOutsideMonth ? undefined : (e) => handleDragOver(e, week.weekNumber, dayIndex)}
                        onDragLeave={isOutsideMonth ? undefined : handleDragLeave}
                        onDrop={isOutsideMonth ? undefined : (e) => handleDrop(e, week.weekNumber, dayIndex)}
                        className={cn(
                          "px-0.5 py-1 align-top transition-colors",
                          isDropHere && !isOutsideMonth && "ring-2 ring-primary/50 bg-primary/5 rounded",
                          isOutsideMonth && "opacity-25",
                          isFirstOfMonth && "border-l-2 border-l-primary/40",
                          isBlockedDay && !isOutsideMonth && "bg-muted/50 bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,rgba(0,0,0,0.04)_4px,rgba(0,0,0,0.04)_6px)]",
                        )}
                      >
                        {isBlockedDay && !isOutsideMonth && (
                          <span className="text-[8px] font-medium text-muted-foreground/70 block text-center leading-none mb-0.5">
                            {t("unavailability.blocked")}
                          </span>
                        )}
                        {dayOfMonth !== null && (
                          <span className={cn(
                            "text-[10px] tabular-nums block text-center mb-0.5",
                            isToday
                              ? "font-bold text-primary"
                              : monthLabel
                                ? "font-semibold text-primary/70"
                                : "text-muted-foreground/60"
                          )}>
                            {monthLabel ? `${dayOfMonth} ${monthLabel}` : dayOfMonth}
                          </span>
                        )}
                        {sessions.length === 0 ? (
                          !dayOfMonth && !isBlockedDay && <span className="text-xs text-muted-foreground/40 block text-center">—</span>
                        ) : (
                          <div className="space-y-0.5">
                            {sessions.map((session, sIdx) => {
                              const isRaceDay = session.workoutId === "__race_day__";
                              const isIntermediateRace = session.workoutId === "__intermediate_race__";
                              const isSpecialSession = isRaceDay || isIntermediateRace;
                              const originalIndex = week.sessions.indexOf(session);
                              const isDragging =
                                draggedSession?.weekNumber === week.weekNumber &&
                                draggedSession?.sessionIndex === originalIndex;
                              const sessionName = workoutNames[session.workoutId] || session.workoutId;

                              return (
                                <div
                                  key={sIdx}
                                  draggable={!isSpecialSession}
                                  onDragStart={
                                    isSpecialSession
                                      ? undefined
                                      : (e) => handleDragStart(e, week.weekNumber, originalIndex)
                                  }
                                  onDragEnd={isSpecialSession ? undefined : handleDragEnd}
                                  onTouchStart={
                                    isSpecialSession
                                      ? undefined
                                      : (e) =>
                                          handleTouchStart(
                                            e,
                                            week.weekNumber,
                                            originalIndex,
                                            session.workoutId,
                                          )
                                  }
                                  onTouchMove={isSpecialSession ? undefined : handleTouchMove}
                                  onTouchEnd={isSpecialSession ? undefined : handleTouchEnd}
                                  style={isSpecialSession ? undefined : { touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
                                  className={cn(
                                    !isSpecialSession && "cursor-grab active:cursor-grabbing",
                                    isDragging && "opacity-40",
                                  )}
                                >
                                  <SessionCell
                                    session={session}
                                    isRaceDay={isRaceDay}
                                    isIntermediateRace={isIntermediateRace}
                                    intermediateRace={week.intermediateRace}
                                    workoutName={sessionName}
                                    onClick={
                                      onSessionClick && !isSpecialSession
                                        ? () =>
                                            onSessionClick(
                                              week.weekNumber,
                                              originalIndex,
                                              session.workoutId,
                                            )
                                        : undefined
                                    }
                                    onDelete={
                                      onSessionDelete && !isSpecialSession
                                        ? () => onSessionDelete(week.weekNumber, originalIndex)
                                        : undefined
                                    }
                                    onToggleComplete={
                                      onToggleComplete && !isSpecialSession
                                        ? () => onToggleComplete(week.weekNumber, originalIndex)
                                        : undefined
                                    }
                                    completionKey={`${week.weekNumber}-${originalIndex}`}
                                    onContextMenu={
                                      !isSpecialSession
                                        ? (e: React.MouseEvent) => {
                                            e.preventDefault();
                                            setContextMenu({
                                              x: e.clientX,
                                              y: e.clientY,
                                              weekNumber: week.weekNumber,
                                              sessionIndex: originalIndex,
                                              workoutId: session.workoutId,
                                            });
                                          }
                                        : undefined
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Context menu (long press mobile / right-click desktop) ── */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-50"
          onPointerDown={() => setContextMenu(null)}
        >
          <div
            className="fixed bg-card border rounded-lg shadow-lg py-1 min-w-[160px] z-50"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              transform: "translate(-50%, 4px)",
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {onSessionClick && (
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                onClick={() => {
                  onSessionClick(contextMenu.weekNumber, contextMenu.sessionIndex, contextMenu.workoutId);
                  setContextMenu(null);
                }}
              >
                <Eye className="size-4 text-muted-foreground shrink-0" />
                {t("calendar.viewSession")}
              </button>
            )}
            {onToggleComplete && (
              <>
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                  onClick={() => {
                    onToggleComplete(contextMenu.weekNumber, contextMenu.sessionIndex);
                    setContextMenu(null);
                  }}
                >
                  <svg viewBox="0 0 24 24" className="size-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12l5 5 9-9" />
                  </svg>
                  {t("completion.toggleDone")}
                </button>
              </>
            )}
            {onSessionDelete && (
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                onClick={() => {
                  onSessionDelete(contextMenu.weekNumber, contextMenu.sessionIndex);
                  setContextMenu(null);
                }}
              >
                <Trash2 className="size-4 shrink-0" />
                {t("calendar.deleteSession")}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
});

// ── Session cell sub-component ──────────────────────────────────────

const SessionCell = memo(function SessionCell({
  session,
  isRaceDay,
  isIntermediateRace,
  intermediateRace,
  workoutName,
  onClick,
  onDelete,
  onToggleComplete,
  onContextMenu,
  completionKey,
}: {
  session: PlanSession;
  isRaceDay: boolean;
  isIntermediateRace?: boolean;
  intermediateRace?: IntermediateGoal;
  workoutName?: string;
  onClick?: () => void;
  onDelete?: () => void;
  onToggleComplete?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  completionKey?: string;
}) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  if (isRaceDay) {
    return (
      <div className="rounded border border-primary/30 bg-primary/10 px-1 py-1 text-center">
        <Flag className="size-3 text-primary mx-auto" />
        <span className="text-[10px] font-semibold text-primary leading-tight block">
          {t("calendar.race")}
        </span>
      </div>
    );
  }

  if (isIntermediateRace) {
    const distMeta = intermediateRace?.raceDistance ? RACE_DISTANCE_META[intermediateRace.raceDistance] : null;
    const distLabel = distMeta ? pick(distMeta, "label") : intermediateRace?.raceDistance;
    return (
      <div className="rounded border border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/30 px-1 py-1 text-center">
        <Flag className="size-3 text-orange-500 mx-auto" />
        <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-300 leading-tight block">
          {distLabel || t("intermediateGoals.raceDayLabel")}
        </span>
        {intermediateRace?.priority && (
          <span className={cn(
            "text-[8px] font-bold leading-tight block",
            intermediateRace.priority === "A" && "text-red-600 dark:text-red-400",
            intermediateRace.priority === "B" && "text-orange-600 dark:text-orange-400",
            intermediateRace.priority === "C" && "text-yellow-600 dark:text-yellow-400",
          )}>
            {t(`intermediateGoals.badge.${intermediateRace.priority}`)}
          </span>
        )}
      </div>
    );
  }

  const isStrength = session.sessionType === "strength" || session.workoutId?.startsWith("STR-");
  const dotColor = SESSION_COLORS[session.sessionType] || "#9ca3af";
  const displayName = workoutName || session.workoutId;
  const isCompleted = session.status === "completed";
  const isSkipped = session.status === "skipped";
  const isModified = session.status === "modified";

  return (
    <div className="relative group" onContextMenu={onContextMenu}>
      {/* Delete button */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "absolute top-0.5 right-0.5 z-20",
            "text-muted-foreground hover:text-destructive",
            "hidden sm:group-hover:block",
            "transition-colors",
          )}
          title={t("calendar.deleteSessionTitle")}
        >
          <Trash2 className="size-3" />
        </button>
      )}

      <div className="flex items-start gap-0.5">
        {/* Completion checkbox — outside the clickable area */}
        {onToggleComplete && (
          <button
            type="button"
            role="checkbox"
            aria-checked={isCompleted || isModified}
            data-completion-key={completionKey}
            aria-label={
              isCompleted ? t("completion.completed")
                : isModified ? t("completion.modified")
                  : isSkipped ? t("completion.skipped")
                    : t("completion.markDone")
            }
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleComplete();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className={cn(
              "size-3.5 rounded-sm border shrink-0 flex items-center justify-center transition-colors mt-1",
              isCompleted
                ? "bg-green-500 border-green-500 text-white"
                : isModified
                  ? "bg-blue-500 border-blue-500 text-white"
                  : isSkipped
                    ? "bg-muted border-muted-foreground/30"
                    : "border-muted-foreground/40 hover:border-primary"
            )}
            title={
              isCompleted ? t("completion.completed")
                : isModified ? t("completion.modified")
                  : isSkipped ? t("completion.skipped")
                    : t("completion.markDone")
            }
          >
            {isCompleted && (
              <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6l3 3 5-5" />
              </svg>
            )}
            {isModified && (
              <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 2l1.5 1.5L5 9 2 9l0-3L7.5 0.5z" />
              </svg>
            )}
            {isSkipped && (
              <svg viewBox="0 0 12 12" className="size-2" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            )}
          </button>
        )}

        {/* Session content — clickable */}
        <div
          role="button"
          tabIndex={onClick ? 0 : undefined}
          onClick={onClick}
          onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
          className={cn(
            "flex-1 min-w-0 rounded px-1 py-1 text-left transition-colors",
            isStrength
              ? "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border border-amber-300 dark:border-amber-700"
              : "bg-secondary/60 hover:bg-secondary",
            isCompleted && !isStrength && "bg-green-500/10 hover:bg-green-500/15 ring-1 ring-green-500/30",
            isCompleted && isStrength && "ring-1 ring-green-500/30",
            isModified && !isStrength && "bg-blue-500/10 hover:bg-blue-500/15 ring-1 ring-blue-500/30",
            isModified && isStrength && "ring-1 ring-blue-500/30",
            isSkipped && "opacity-50",
            !onClick && "cursor-default",
            onClick && "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <div className="flex items-center gap-1">
            {isStrength ? (
              <Dumbbell className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
            ) : (
              <span
                className="size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: dotColor }}
              />
            )}
            {session.isKeySession && (
              <Star className="size-2.5 text-yellow-500 fill-yellow-500 shrink-0" />
            )}
          </div>
          <span
            className={cn(
              "text-[11px] leading-tight font-medium line-clamp-2 mt-0.5 block",
              isSkipped && "line-through text-muted-foreground",
              isStrength && !isSkipped && "text-amber-900 dark:text-amber-100"
            )}
            title={displayName}
          >
          {displayName}
        </span>
        {session.estimatedDurationMin > 0 && !session.workoutId.startsWith("__activity_") && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
            <Clock className="size-2.5" />
            {formatDurationMinutes(session.estimatedDurationMin)}
            {session.targetDistanceKm != null && session.targetDistanceKm > 0 && (
              <span> · {session.sessionType !== "long_run" && "~"}{session.targetDistanceKm}km</span>
            )}
            {session.rpe && (
              <span className="ml-1 text-[9px] font-medium text-amber-600">RPE {session.rpe}</span>
            )}
          </span>
        )}
        </div>
      </div>
    </div>
  );
});

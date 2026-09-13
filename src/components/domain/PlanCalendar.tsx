import { useState, useRef, useMemo, useCallback, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { Star, Flag, Clock, Trash2, Eye, Dumbbell, Route as RouteIcon } from "@/components/icons";
import { PHASE_META, RACE_DISTANCE_META } from "@/types/plan";
import type { TrainingPlan, PlanSession, IntermediateGoal } from "@/types/plan";
import { computeWeekKm, computeWeekDuration } from "@/lib/planStats";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { ZoneScale } from "@/components/visualization";
import { usePickLang } from "@/lib/i18n-utils";
import { toast } from "sonner";
import { SESSION_ZONE, sessionColor } from "@/lib/sessionColors";

/** A session type with no aerobic zone gets the hollow mark, never a hue. */
function isZoned(sessionType: string): boolean {
  return SESSION_ZONE[sessionType as keyof typeof SESSION_ZONE] != null;
}

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
  onFindRoute?: (weekNumber: number, sessionIndex: number) => void;
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
  onFindRoute,
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
      <div className="zn-plancal">
        <div className="zn-scroll-x">
        <table className="zn-plancal__table">
          <colgroup>
            <col className="zn-plancal__col-week" />
            {Array.from({ length: 7 }, (_, i) => (
              <col key={i} />
            ))}
          </colgroup>
          {/* Header row */}
          <thead className="zn-plancal__head">
            <tr>
              <th className="zn-plancal__head-week">{t("calendar.week")}</th>
              {dayHeaders.map((day, i) => (
                <th key={i}>{day}</th>
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

              // No separator rows, month labels appear inline in cells (on the 1st of each month)

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
                  className="zn-plancal__week"
                  data-phase-start={isPhaseStart || undefined}
                  data-current={isCurrent || undefined}
                  data-recovery={week.isRecoveryWeek || undefined}
                >
                  {/* Week label column (sticky on mobile) */}
                  <td className="zn-plancal__gutter">
                    <div className="zn-plancal__wknum">{weekLabel}</div>
                    <span className="zn-plancal__phase">
                      {pickLang(phaseMeta, "label")}
                    </span>
                    {week.sessions.length > 0 && (
                      <span className="zn-plancal__volume">
                        ~{Math.round(computeWeekKm(week))}km · {formatDurationMinutes(computeWeekDuration(week))}
                      </span>
                    )}
                    {isCurrent && (
                      <div className="zn-plancal__now">{t("calendar.now")}</div>
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
                          <div className="zn-plancal__done">
                            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6l3 3 5-5" /></svg>
                            {done}/{total}
                          </div>
                        );
                      }

                      if (resolved > 0 && !allResolved && onValidateWeek) {
                        return (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onValidateWeek(week.weekNumber); }}
                            className="zn-plancal__validate"
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
                        className="zn-plancal__day"
                        data-drop={(isDropHere && !isOutsideMonth) || undefined}
                        data-outside={isOutsideMonth || undefined}
                        data-today={(isToday && !isOutsideMonth) || undefined}
                        data-month-start={isFirstOfMonth || undefined}
                        data-blocked={(isBlockedDay && !isOutsideMonth) || undefined}
                      >
                        {isBlockedDay && !isOutsideMonth && (
                          <span className="zn-plancal__blocked-label">
                            {t("unavailability.blocked")}
                          </span>
                        )}
                        {dayOfMonth !== null && (
                          <span
                            className="zn-plancal__date"
                            data-month-label={monthLabel ? "true" : undefined}
                          >
                            {monthLabel ? `${dayOfMonth} ${monthLabel}` : dayOfMonth}
                          </span>
                        )}
                        {sessions.length === 0 ? (
                          !dayOfMonth && !isBlockedDay && <span className="zn-plancal__empty">-</span>
                        ) : (
                          <div className="zn-plancal__sessions">
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
                                  className={isSpecialSession ? undefined : "zn-plan-drag"}
                                  data-dragging={isDragging || undefined}
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
                                    onFindRoute={
                                      onFindRoute && !isSpecialSession
                                        ? () => onFindRoute(week.weekNumber, originalIndex)
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

        {/* The grid paints zone ink, so it carries the ramp's legend once. */}
        <ZoneScale />
      </div>

      {/* ── Context menu (long press mobile / right-click desktop) ── */}
      {contextMenu && (
        <div
          className="zn-plan-menu__scrim"
          onPointerDown={() => setContextMenu(null)}
        >
          <div
            className="zn-menu zn-plan-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {onSessionClick && (
              <button
                type="button"
                className="zn-menu__item"
                onClick={() => {
                  onSessionClick(contextMenu.weekNumber, contextMenu.sessionIndex, contextMenu.workoutId);
                  setContextMenu(null);
                }}
              >
                <Eye />
                {t("calendar.viewSession")}
              </button>
            )}
            {onFindRoute && (
              <button
                type="button"
                className="zn-menu__item"
                onClick={() => {
                  onFindRoute(contextMenu.weekNumber, contextMenu.sessionIndex);
                  setContextMenu(null);
                }}
              >
                <RouteIcon />
                {t("view.findRoute")}
              </button>
            )}
            {onToggleComplete && (
              <>
                <button
                  type="button"
                  className="zn-menu__item"
                  onClick={() => {
                    onToggleComplete(contextMenu.weekNumber, contextMenu.sessionIndex);
                    setContextMenu(null);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12l5 5 9-9" />
                  </svg>
                  {t("completion.toggleDone")}
                </button>
              </>
            )}
            {onSessionDelete && (
              <button
                type="button"
                className="zn-menu__item"
                data-variant="destructive"
                onClick={() => {
                  onSessionDelete(contextMenu.weekNumber, contextMenu.sessionIndex);
                  setContextMenu(null);
                }}
              >
                <Trash2 />
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
  onFindRoute,
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
  onFindRoute?: () => void;
  onToggleComplete?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  completionKey?: string;
}) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  if (isRaceDay) {
    return (
      <div className="zn-sess" data-kind="race">
        <Flag className="zn-sess__flag" />
        <span className="zn-sess__race-label">{t("calendar.race")}</span>
      </div>
    );
  }

  if (isIntermediateRace) {
    const distMeta = intermediateRace?.raceDistance ? RACE_DISTANCE_META[intermediateRace.raceDistance] : null;
    const distLabel = distMeta ? pick(distMeta, "label") : intermediateRace?.raceDistance;
    return (
      <div className="zn-sess" data-kind="intermediate">
        <Flag className="zn-sess__flag" />
        <span className="zn-sess__race-label">
          {distLabel || t("intermediateGoals.raceDayLabel")}
        </span>
        {intermediateRace?.priority && (
          <span className="zn-sess__priority" data-priority={intermediateRace.priority}>
            {t(`intermediateGoals.badge.${intermediateRace.priority}`)}
          </span>
        )}
      </div>
    );
  }

  const isStrength = session.sessionType === "strength" || session.workoutId?.startsWith("STR-");
  const zoned = !isStrength && isZoned(session.sessionType);
  const displayName = workoutName || session.workoutId;
  const isCompleted = session.status === "completed";
  const isSkipped = session.status === "skipped";
  const isModified = session.status === "modified";

  return (
    <div
      className="zn-sess"
      data-status={session.status}
      data-unzoned={zoned ? undefined : "true"}
      onContextMenu={onContextMenu}
    >
      <div className="zn-sess__actions">
        {onFindRoute && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onFindRoute();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="zn-sess__action"
            title={t("view.findRoute")}
          >
            <RouteIcon />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="zn-sess__action"
            data-variant="destructive"
            title={t("calendar.deleteSessionTitle")}
          >
            <Trash2 />
          </button>
        )}
      </div>

      <div className="zn-row zn-row--start" style={{ "--gap": "var(--sp-2)" } as React.CSSProperties}>
        {/* Completion checkbox, outside the clickable area */}
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
            className="zn-sess__check"
            data-status={session.status}
            title={
              isCompleted ? t("completion.completed")
                : isModified ? t("completion.modified")
                  : isSkipped ? t("completion.skipped")
                    : t("completion.markDone")
            }
          >
            {isCompleted && (
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6l3 3 5-5" />
              </svg>
            )}
            {isModified && (
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 2l1.5 1.5L5 9 2 9l0-3L7.5 0.5z" />
              </svg>
            )}
            {isSkipped && (
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            )}
          </button>
        )}

        {/* Session content, clickable */}
        <div
          role="button"
          tabIndex={onClick ? 0 : undefined}
          onClick={onClick}
          onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
          className="zn-sess__body"
          data-clickable={onClick ? "true" : "false"}
        >
          <div className="zn-sess__head">
            {isStrength ? (
              <Dumbbell className="zn-sess__icon" />
            ) : (
              <span
                className="zn-sess__dot"
                style={zoned ? ({ "--zn-dot": sessionColor(session.sessionType) } as React.CSSProperties) : undefined}
              />
            )}
            {session.isKeySession && (
              <span className="zn-sess__key">
                <Star filled />
              </span>
            )}
          </div>
          <span className="zn-sess__name" title={displayName}>
            {displayName}
          </span>
          {session.estimatedDurationMin > 0 && !session.workoutId.startsWith("__activity_") && (
            <span className="zn-sess__facts">
              <Clock />
              <span className="zn-sess__facts-text">
                {formatDurationMinutes(session.estimatedDurationMin)}
                {session.targetDistanceKm != null && session.targetDistanceKm > 0 && (
                  <> · {session.sessionType !== "long_run" && "~"}{session.targetDistanceKm}km</>
                )}
                {session.rpe && <> · RPE {session.rpe}</>}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

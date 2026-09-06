import { useState, useRef, useMemo, useCallback, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { Star, Flag, Clock, Trash2, Eye, ChevronLeft, ChevronRight, ChevronDown, Dumbbell, Dices, Lock, LockOpen, Route as RouteIcon } from "@/components/icons";
import { PHASE_META, RACE_DISTANCE_META } from "@/types/plan";
import type { TrainingPlan } from "@/types/plan";
import { computeWeekKm, computeWeekDuration } from "@/lib/planStats";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { ZoneScale } from "@/components/visualization";
import { usePickLang } from "@/lib/i18n-utils";
import { toast } from "sonner";
import { WeekGuidancePanel } from "@/components/domain/WeekGuidancePanel";
import { SESSION_ZONE, sessionColor } from "@/lib/sessionColors";

/** Placeholder sessions (race day, cross-training activities) have no catalog
 *  workout behind them, so there is nothing to draw a replacement from. */
function isRedrawable(workoutId: string): boolean {
  return !workoutId.startsWith("__");
}

/** A session type with no aerobic zone gets the hollow mark, never a hue. */
function isZoned(sessionType: string): boolean {
  return SESSION_ZONE[sessionType as keyof typeof SESSION_ZONE] != null;
}

// ── Props ───────────────────────────────────────────────────────────

/** Per-workout badge data shown on the card (zone + session load). */
export interface WorkoutCardMeta {
  zone?: number;
  tss?: number | null;
}

interface PlanWeeklyViewProps {
  plan: TrainingPlan;
  workoutNames: Record<string, string>;
  /** Optional zone/TSS per workout id — adds a meta line to each card. */
  workoutMeta?: Record<string, WorkoutCardMeta>;
  currentWeek: number;
  initialWeek?: number;
  isEn: boolean;
  planStartDate?: string;
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
  /** "Ma semaine": lock a session so it survives week (re)generation. */
  onToggleLock?: (weekNumber: number, sessionIndex: number) => void;
  /** "Ma semaine": draw another workout for this session only. */
  onRedraw?: (weekNumber: number, sessionIndex: number) => void;
  /** Replaces a day's content while the draw animation runs (null = untouched). */
  renderScanCell?: (day: number) => React.ReactNode | null;
  onValidateWeek?: (weekNumber: number) => void;
  onWorkoutAdd?: (workoutId: string, weekNumber: number, day: number) => void;
  onAddToDay?: (weekNumber: number, day: number) => void;
  onWeekChange?: (week: number) => void;
  onFindWeekRoute?: (weekNumber: number) => void;
  blockedDays?: Set<string>;
  /** Standalone "Ma semaine": hide week nav + free-plan guide, rest cards on empty days. */
  singleWeek?: boolean;
}

// ── Component ───────────────────────────────────────────────────────

export const PlanWeeklyView = memo(function PlanWeeklyView({
  plan,
  workoutNames,
  workoutMeta,
  currentWeek,
  initialWeek,
  isEn,
  planStartDate,
  onSessionClick,
  onSessionMove,
  onSessionDelete,
  onFindRoute,
  onToggleComplete,
  onToggleLock,
  onRedraw,
  renderScanCell,
  onValidateWeek,
  onWorkoutAdd,
  onAddToDay,
  onWeekChange,
  onFindWeekRoute,
  blockedDays,
  singleWeek = false,
}: PlanWeeklyViewProps) {
  const { t } = useTranslation(["plan", "library", "common"]);
  const pickLang = usePickLang();
  // ── Week navigation state ──────────────────────────────────────
  const [selectedWeek, setSelectedWeek] = useState(Math.max(1, initialWeek ?? currentWeek));

  const weekData = useMemo(
    () => plan.weeks.find((w) => w.weekNumber === selectedWeek),
    [plan.weeks, selectedWeek],
  );

  const parsedStartDate = useMemo(() => {
    if (!planStartDate) return null;
    const dateOnly = planStartDate.split("T")[0];
    const [y, m, d] = dateOnly.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    // Normalize to Monday of that week (same logic as PlanCalendar)
    const jsDay = date.getDay();
    const offset = jsDay === 0 ? -6 : 1 - jsDay;
    date.setDate(date.getDate() + offset);
    return date;
  }, [planStartDate]);

  // ── Native drag state ─────────────────────────────────────────
  const [draggedSession, setDraggedSession] = useState<{
    weekNumber: number;
    sessionIndex: number;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ weekNumber: number; day: number } | null>(null);

  // Trash drop zone — surfaced only while a session is being dragged, so
  // "remove a session" is discoverable without a right-click.
  const [overTrash, setOverTrash] = useState(false);
  const overTrashRef = useRef(false);

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

  // Lock state of the session the context menu targets (drives lock/unlock label).
  const contextSessionLocked =
    contextMenu != null &&
    plan.weeks.find((w) => w.weekNumber === contextMenu.weekNumber)
      ?.sessions[contextMenu.sessionIndex]?.locked === true;

  // ── Desktop drag handlers (HTML5 Drag and Drop) ───────────────

  const handleDragStart = useCallback(
    (e: React.DragEvent, weekNumber: number, sessionIndex: number) => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = "move";
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
      const week = plan.weeks.find((w) => w.weekNumber === draggedSession.weekNumber);
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

  // ── Mobile touch handlers (long press + drag) ─────────────────

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
        const overTrashNow = elements.some((el) => el.hasAttribute("data-trash-drop"));
        if (overTrashNow !== overTrashRef.current) {
          overTrashRef.current = overTrashNow;
          setOverTrash(overTrashNow);
        }
        if (overTrashNow) {
          dropTargetRef.current = null;
          setDropTarget(null);
          return;
        }
        const dropCell = elements.find((el) => el.hasAttribute("data-drop-id"));

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
      const droppedOnTrash = overTrashRef.current;
      touchDragRef.current = null;
      dropTargetRef.current = null;
      overTrashRef.current = false;
      setOverTrash(false);
      setDraggedSession(null);
      setDropTarget(null);

      if (dragState && droppedOnTrash && onSessionDelete) {
        onSessionDelete(dragState.weekNumber, dragState.sessionIndex);
      } else if (dragState && target && onSessionMove) {
        // Block drop on unavailable days
        if (blockedDays?.has(`${target.weekNumber}-${target.day}`)) {
          toast.error(t("reschedule.blockedDrop"));
        } else {
          const week = plan.weeks.find((w) => w.weekNumber === dragState.weekNumber);
          const session = week?.sessions[dragState.sessionIndex];
          if (
            !(
              session &&
              session.dayOfWeek === target.day &&
              dragState.weekNumber === target.weekNumber
            )
          ) {
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
  }, [onSessionMove, onSessionDelete, onSessionClick, plan.weeks]);

  // ── Derived data ──────────────────────────────────────────────

  const isCurrent =
    currentWeek === selectedWeek && currentWeek >= 1 && currentWeek <= plan.totalWeeks;

  const phaseMeta = weekData ? PHASE_META[weekData.phase] : null;

  const dayHeadersShort = useMemo(
    () => [0, 1, 2, 3, 4, 5, 6].map((i) => t(`daysShort.${i}`)),
    [t],
  );
  const dayHeadersFull = useMemo(
    () => [0, 1, 2, 3, 4, 5, 6].map((i) => t(`days.${i}`)),
    [t],
  );

  // ── Render ────────────────────────────────────────────────────

  return (
    <>
      <div className="zn-planweek">
        {/* ── Week navigation ── */}
        {!singleWeek && (
        <div className="zn-planweek__nav">
          <button
            type="button"
            onClick={() => {
              const newWeek = Math.max(1, selectedWeek - 1);
              setSelectedWeek(newWeek);
              onWeekChange?.(newWeek);
            }}
            disabled={selectedWeek <= 1}
            className="zn-planweek__nav-btn"
          >
            <ChevronLeft />
          </button>

          <div className="zn-planweek__heading">
            <div className="zn-planweek__title-row">
              <span className="zn-planweek__title">
                {t("weeklyView.weekTitle", { week: selectedWeek })}
              </span>
              {isCurrent && (
                <span className="zn-planweek__now">{t("calendar.now")}</span>
              )}
            </div>
            {weekData && phaseMeta && (
              <>
                <span className="zn-planweek__sub">
                  {pickLang(phaseMeta, "label")}
                </span>
                {parsedStartDate && (() => {
                  const shortMonths = isEn
                    ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                    : ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
                  const weekStart = new Date(parsedStartDate);
                  weekStart.setDate(weekStart.getDate() + (selectedWeek - 1) * 7);
                  const weekEnd = new Date(parsedStartDate);
                  weekEnd.setDate(weekEnd.getDate() + (selectedWeek - 1) * 7 + 6);
                  const label = weekStart.getMonth() === weekEnd.getMonth()
                    ? `${weekStart.getDate()} - ${weekEnd.getDate()} ${shortMonths[weekStart.getMonth()]}`
                    : `${weekStart.getDate()} ${shortMonths[weekStart.getMonth()]} - ${weekEnd.getDate()} ${shortMonths[weekEnd.getMonth()]}`;
                  return <span className="zn-planweek__sub">{label}</span>;
                })()}
                {weekData.sessions.length > 0 && (
                  <span className="zn-planweek__sub">
                    ~{Math.round(computeWeekKm(weekData))}km ·{" "}
                    {formatDurationMinutes(computeWeekDuration(weekData))}
                  </span>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const newWeek = Math.min(plan.totalWeeks, selectedWeek + 1);
              setSelectedWeek(newWeek);
              onWeekChange?.(newWeek);
            }}
            disabled={selectedWeek >= plan.totalWeeks}
            className="zn-planweek__nav-btn"
          >
            <ChevronRight />
          </button>
        </div>
        )}

        {/* ── Week completion stats ── */}
        {weekData && (() => {
          const total = weekData.sessions.length;
          if (total === 0) return null;
          const done = weekData.sessions.filter((s) => s.status === "completed" || s.status === "modified").length;
          const skipped = weekData.sessions.filter((s) => s.status === "skipped").length;
          const resolved = done + skipped;
          const allResolved = resolved === total;

          if (allResolved && resolved > 0) {
            return (
              <div className="zn-planweek__banner">
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 6l3 3 5-5" />
                </svg>
                {done}/{total} {t("weeklyView.completed")}
              </div>
            );
          }

          if (resolved > 0 && !allResolved && onValidateWeek) {
            return (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onValidateWeek(selectedWeek);
                }}
                className="zn-planweek__pill"
                title={t("calendar.validateWeek")}
              >
                {t("calendar.validateCount", { done, total })}
              </button>
            );
          }

          return null;
        })()}

        {weekData && onFindWeekRoute && (
          <button
            type="button"
            onClick={() => onFindWeekRoute(selectedWeek)}
            className="zn-planweek__pill"
          >
            <RouteIcon />
            {t("view.findWeekRoute")}
          </button>
        )}

        {/* ── Week guidance (free plans only) ── */}
        {weekData && plan.config.planMode === "free" && !singleWeek && (
          <WeekGuidancePanel
            week={weekData}
            daysPerWeek={plan.config.daysPerWeek}
          />
        )}

        {/* ── Day grid ── */}
        {weekData && (
          <div
            className="zn-planweek__board"
            data-recovery={weekData.isRecoveryWeek || undefined}
          >
            {/* Mobile: 4+3 grid layout */}
            {[
                [0, 1, 2, 3],
                [4, 5, 6],
              ].map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  className="zn-planweek__row"
                  style={{ "--cols": row.length } as React.CSSProperties}
                >
                  {row.map((dayIndex) => {
                    let dayOfMonth: number | null = null;
                    let monthLabel = "";
                    let isToday = false;
                    if (parsedStartDate) {
                      const cellDate = new Date(parsedStartDate);
                      cellDate.setDate(cellDate.getDate() + (selectedWeek - 1) * 7 + dayIndex);
                      dayOfMonth = cellDate.getDate();
                      const now = new Date();
                      isToday = cellDate.getFullYear() === now.getFullYear()
                        && cellDate.getMonth() === now.getMonth()
                        && cellDate.getDate() === now.getDate();
                      if (dayOfMonth === 1) {
                        const shortMonths = isEn
                          ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                          : ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
                        monthLabel = shortMonths[cellDate.getMonth()];
                      }
                    }
                    return (
                      <DayCell
                        key={dayIndex}
                        dayIndex={dayIndex}
                        weekData={weekData}
                        selectedWeek={selectedWeek}
                        dayLabel={dayHeadersShort[dayIndex]}
                        dayOfMonth={dayOfMonth}
                        monthLabel={monthLabel}
                        isToday={isToday}
                        workoutNames={workoutNames}
                        workoutMeta={workoutMeta}
                        dropTarget={dropTarget}
                        draggedSession={draggedSession}
                        singleWeek={singleWeek}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onSessionClick={onSessionClick}
                        onFindRoute={onFindRoute}
                        onToggleComplete={onToggleComplete}
                        onToggleLock={onToggleLock}
                        onRedraw={onRedraw}
                        onSessionDelete={onSessionDelete}
                        renderScanCell={renderScanCell}
                        onAddToDay={onAddToDay}
                        setContextMenu={setContextMenu}
                        isBlockedDay={blockedDays?.has(`${selectedWeek}-${dayIndex}`) ?? false}
                      />
                    );
                  })}
                </div>
              ))}

            {/* Desktop: single 7-column row */}
            <div className="zn-planweek__week-row">
              {Array.from({ length: 7 }, (_, dayIndex) => {
                let dayOfMonth: number | null = null;
                let monthLabel = "";
                let isToday = false;
                if (parsedStartDate) {
                  const cellDate = new Date(parsedStartDate);
                  cellDate.setDate(cellDate.getDate() + (selectedWeek - 1) * 7 + dayIndex);
                  dayOfMonth = cellDate.getDate();
                  const now = new Date();
                  isToday = cellDate.getFullYear() === now.getFullYear()
                    && cellDate.getMonth() === now.getMonth()
                    && cellDate.getDate() === now.getDate();
                  if (dayOfMonth === 1) {
                    const shortMonths = isEn
                      ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                      : ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
                    monthLabel = shortMonths[cellDate.getMonth()];
                  }
                }
                return (
                  <DayCell
                    key={dayIndex}
                    dayIndex={dayIndex}
                    weekData={weekData}
                    selectedWeek={selectedWeek}
                    dayLabel={dayHeadersFull[dayIndex]}
                    dayOfMonth={dayOfMonth}
                    monthLabel={monthLabel}
                    isToday={isToday}
                    workoutNames={workoutNames}
                    workoutMeta={workoutMeta}
                    dropTarget={dropTarget}
                    draggedSession={draggedSession}
                    isDesktop
                    singleWeek={singleWeek}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onSessionClick={onSessionClick}
                    onFindRoute={onFindRoute}
                    onToggleComplete={onToggleComplete}
                    onToggleLock={onToggleLock}
                    onRedraw={onRedraw}
                    onSessionDelete={onSessionDelete}
                    renderScanCell={renderScanCell}
                    onAddToDay={onAddToDay}
                    setContextMenu={setContextMenu}
                    isBlockedDay={blockedDays?.has(`${selectedWeek}-${dayIndex}`) ?? false}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* The board paints zone ink, so it carries the ramp's legend once —
            repliée, parce qu'on l'apprend une fois et qu'elle coûtait 131px
            au-dessus du pli chaque jour. */}
        {weekData && (
          <details className="zn-disclosure">
            <summary className="zn-disclosure__summary">
              <span className="zn-kicker zn-kicker--xs zn-fill">{t("common:zones.scaleTitle")}</span>
              <ChevronDown className="zn-disclosure__chevron" />
            </summary>
            <div className="zn-disclosure__panel">
              <ZoneScale showTitle={false} />
            </div>
          </details>
        )}
      </div>

      {/* ── Trash drop zone (appears while dragging a session) ── */}
      {draggedSession && onSessionDelete && (
        <div
          data-trash-drop=""
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            setOverTrash(true);
          }}
          onDragLeave={() => setOverTrash(false)}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOverTrash(false);
            if (draggedSession) {
              onSessionDelete(draggedSession.weekNumber, draggedSession.sessionIndex);
              setDraggedSession(null);
              setDropTarget(null);
            }
          }}
          className="zn-plan-trash"
          data-armed={overTrash || undefined}
        >
          <Trash2 />
          {t("calendar.dropToDelete")}
        </div>
      )}

      {/* ── Context menu (long press mobile / right-click desktop) ── */}
      {contextMenu && (
        <div className="zn-plan-menu__scrim" onPointerDown={() => setContextMenu(null)}>
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
                  onSessionClick(
                    contextMenu.weekNumber,
                    contextMenu.sessionIndex,
                    contextMenu.workoutId,
                  );
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
            )}
            {onRedraw && isRedrawable(contextMenu.workoutId) && !contextSessionLocked && (
              <button
                type="button"
                className="zn-menu__item"
                onClick={() => {
                  onRedraw(contextMenu.weekNumber, contextMenu.sessionIndex);
                  setContextMenu(null);
                }}
              >
                <Dices />
                {t("library:weekly.slot.reroll")}
              </button>
            )}
            {onToggleLock && (
              <button
                type="button"
                className="zn-menu__item"
                onClick={() => {
                  onToggleLock(contextMenu.weekNumber, contextMenu.sessionIndex);
                  setContextMenu(null);
                }}
              >
                {contextSessionLocked ? (
                  <LockOpen />
                ) : (
                  <Lock />
                )}
                {contextSessionLocked
                  ? t("library:weekly.slot.unlock")
                  : t("library:weekly.slot.lock")}
              </button>
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

// ── DayCell sub-component ──────────────────────────────────────────

interface DayCellProps {
  dayIndex: number;
  weekData: TrainingPlan["weeks"][number];
  selectedWeek: number;
  dayLabel: string;
  dayOfMonth?: number | null;
  monthLabel?: string;
  isToday?: boolean;
  workoutNames: Record<string, string>;
  workoutMeta?: Record<string, WorkoutCardMeta>;
  dropTarget: { weekNumber: number; day: number } | null;
  draggedSession: { weekNumber: number; sessionIndex: number } | null;
  isDesktop?: boolean;
  /** Standalone "Ma semaine" board: rest cards on empty days, taller mobile cells. */
  singleWeek?: boolean;
  onDragOver: (e: React.DragEvent, weekNumber: number, day: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, weekNumber: number, day: number) => void;
  onDragStart: (e: React.DragEvent, weekNumber: number, sessionIndex: number) => void;
  onDragEnd: () => void;
  onTouchStart: (
    e: React.TouchEvent,
    weekNumber: number,
    sessionIndex: number,
    workoutId: string,
  ) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onSessionClick?: (weekNumber: number, sessionIndex: number, workoutId: string) => void;
  onFindRoute?: (weekNumber: number, sessionIndex: number) => void;
  onToggleComplete?: (weekNumber: number, sessionIndex: number) => void;
  onToggleLock?: (weekNumber: number, sessionIndex: number) => void;
  onRedraw?: (weekNumber: number, sessionIndex: number) => void;
  onSessionDelete?: (weekNumber: number, sessionIndex: number) => void;
  renderScanCell?: (day: number) => React.ReactNode | null;
  onAddToDay?: (weekNumber: number, day: number) => void;
  setContextMenu: (
    menu: {
      x: number;
      y: number;
      weekNumber: number;
      sessionIndex: number;
      workoutId: string;
    } | null,
  ) => void;
  isBlockedDay?: boolean;
}

const DayCell = memo(function DayCell({
  dayIndex,
  weekData,
  selectedWeek,
  dayLabel,
  dayOfMonth,
  monthLabel,
  isToday,
  workoutNames,
  workoutMeta,
  dropTarget,
  draggedSession,
  isDesktop,
  singleWeek,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onSessionClick,
  onFindRoute,
  onToggleComplete,
  onToggleLock,
  onRedraw,
  onSessionDelete,
  renderScanCell,
  onAddToDay,
  setContextMenu,
  isBlockedDay,
}: DayCellProps) {
  const { t } = useTranslation(["plan", "library"]);
  const pickLang = usePickLang();
  const sessions = weekData.sessions.filter((s) => s.dayOfWeek === dayIndex);
  // While the draw animation runs, this day shows the spinning card instead of
  // its own content — same cell, same position, so nothing can drift.
  const scanContent = renderScanCell?.(dayIndex) ?? null;
  const isDropHere = dropTarget?.weekNumber === selectedWeek && dropTarget?.day === dayIndex;

  return (
    <div
      data-drop-id={`${selectedWeek}-${dayIndex}`}
      onDragOver={(e) => onDragOver(e, selectedWeek, dayIndex)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, selectedWeek, dayIndex)}
      className="zn-planweek__day"
      data-today={isToday || undefined}
      aria-current={isToday ? "date" : undefined}
      data-desktop={isDesktop || undefined}
      data-single-week={singleWeek || undefined}
      data-drop={isDropHere || undefined}
      data-blocked={isBlockedDay || undefined}
    >
      {isBlockedDay && (
        <span className="zn-planweek__blocked-label">
          {t("unavailability.blocked")}
        </span>
      )}
      <span className="zn-planweek__daylabel">{dayLabel}</span>
      {dayOfMonth != null && (
        <span
          className="zn-planweek__date"
          data-today={isToday || undefined}
          data-month-label={monthLabel ? "true" : undefined}
        >
          {monthLabel ? `${dayOfMonth} ${monthLabel}` : dayOfMonth}
        </span>
      )}

      {scanContent && (
        <div className="zn-planweek__scan" aria-hidden="true">
          {scanContent}
        </div>
      )}

      {!scanContent && sessions.length === 0 ? (
        onAddToDay && !isBlockedDay ? (
          <button
            type="button"
            onClick={() => onAddToDay(selectedWeek, dayIndex)}
            className="zn-planweek__add"
          >
            {singleWeek && (
              <span className="zn-planweek__add-kind">
                {t("library:weekly.kinds.rest")}
              </span>
            )}
            <span className="zn-planweek__add-plus">+</span>
          </button>
        ) : (
          <span className="zn-planweek__empty">---</span>
        )
      ) : null}

      {!scanContent && sessions.map((session, sIdx) => {
        const isRaceDay = session.workoutId === "__race_day__";
        const isIntermediateRace = session.workoutId === "__intermediate_race__";
        const isSpecialSession = isRaceDay || isIntermediateRace;
        const originalIndex = weekData.sessions.indexOf(session);
        const isDragging =
          draggedSession?.weekNumber === selectedWeek &&
          draggedSession?.sessionIndex === originalIndex;
        const sessionName = workoutNames[session.workoutId] || session.workoutId;
        const isStrength = session.sessionType === "strength" || session.workoutId?.startsWith("STR-");
        const meta = workoutMeta?.[session.workoutId];

        return (
          <div
            key={sIdx}
            draggable={!isSpecialSession}
            onDragStart={
              isSpecialSession ? undefined : (e) => onDragStart(e, selectedWeek, originalIndex)
            }
            onDragEnd={isSpecialSession ? undefined : onDragEnd}
            onTouchStart={
              isSpecialSession
                ? undefined
                : (e) => onTouchStart(e, selectedWeek, originalIndex, session.workoutId)
            }
            onTouchMove={isSpecialSession ? undefined : onTouchMove}
            onTouchEnd={isSpecialSession ? undefined : onTouchEnd}
            onContextMenu={
              isSpecialSession
                ? undefined
                : (e: React.MouseEvent) => {
                    e.preventDefault();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      weekNumber: selectedWeek,
                      sessionIndex: originalIndex,
                      workoutId: session.workoutId,
                    });
                  }
            }
            style={isSpecialSession ? undefined : { touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
            className={isSpecialSession ? undefined : "zn-plan-drag"}
            data-dragging={isDragging || undefined}
          >
            <div
              className="zn-sess"
              data-density="card"
              data-kind={isRaceDay ? "race" : isIntermediateRace ? "intermediate" : undefined}
              data-status={isSpecialSession ? undefined : session.status}
              data-unzoned={isSpecialSession || isZoned(session.sessionType) ? undefined : "true"}
              data-locked={session.locked || undefined}
            >
              {isRaceDay ? (
                <>
                  <Flag className="zn-sess__flag" />
                  <span className="zn-sess__race-label">{t("calendar.race")}</span>
                </>
              ) : isIntermediateRace ? (
                <>
                  <Flag className="zn-sess__flag" />
                  <span className="zn-sess__race-label">
                    {weekData?.intermediateRace?.raceDistance
                      ? pickLang(RACE_DISTANCE_META[weekData.intermediateRace.raceDistance], "label")
                      : t("intermediateGoals.raceDayLabel")}
                  </span>
                  {weekData?.intermediateRace?.priority && (
                    <span
                      className="zn-sess__priority"
                      data-priority={weekData.intermediateRace.priority}
                    >
                      {t(`intermediateGoals.badge.${weekData.intermediateRace.priority}`)}
                    </span>
                  )}
                </>
              ) : (
                <>
                  {/* Card actions, top-right. Hover-only on desktop; the lock
                      stays visible once set. Touch users reach them through the
                      long-press context menu. */}
                  <div className="zn-sess__actions">
                    {onFindRoute && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFindRoute(selectedWeek, originalIndex);
                        }}
                        className="zn-sess__action"
                        title={t("view.findRoute")}
                      >
                        <RouteIcon />
                      </button>
                    )}
                    {onRedraw && isRedrawable(session.workoutId) && !session.locked && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRedraw(selectedWeek, originalIndex);
                        }}
                        className="zn-sess__action"
                        title={t("library:weekly.slot.reroll")}
                        aria-label={t("library:weekly.slot.reroll")}
                      >
                        <Dices />
                      </button>
                    )}
                    {onSessionDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSessionDelete(selectedWeek, originalIndex);
                        }}
                        className="zn-sess__action"
                        data-variant="destructive"
                        title={t("calendar.deleteSession")}
                        aria-label={t("calendar.deleteSession")}
                      >
                        <Trash2 />
                      </button>
                    )}
                    {onToggleLock && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(selectedWeek, originalIndex);
                        }}
                        aria-pressed={session.locked === true}
                        className="zn-sess__action"
                        title={
                          session.locked
                            ? t("library:weekly.slot.lockedHint")
                            : t("library:weekly.slot.lock")
                        }
                        aria-label={
                          session.locked
                            ? t("library:weekly.slot.unlock")
                            : t("library:weekly.slot.lock")
                        }
                      >
                        {session.locked ? <Lock /> : <LockOpen />}
                      </button>
                    )}
                  </div>
                  <div className="zn-sess__head">
                    {onToggleComplete && (
                      <button
                        type="button"
                        data-completion-key={`${selectedWeek}-${originalIndex}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(selectedWeek, originalIndex);
                        }}
                        className="zn-sess__check"
                        data-status={session.status}
                        title={
                          session.status === "completed"
                            ? t("completion.completed")
                            : session.status === "modified"
                              ? t("completion.modified")
                              : session.status === "skipped"
                                ? t("completion.skipped")
                                : t("completion.markDone")
                        }
                      >
                        {session.status === "completed" && (
                          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                        {session.status === "modified" && (
                          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 2l1.5 1.5L5 9 2 9l0-3L7.5 0.5z" />
                          </svg>
                        )}
                        {session.status === "skipped" && (
                          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3l6 6M9 3l-6 6" />
                          </svg>
                        )}
                      </button>
                    )}
                    {isStrength ? (
                      <Dumbbell className="zn-sess__icon" />
                    ) : (
                      <span
                        className="zn-sess__dot"
                        style={
                          isZoned(session.sessionType)
                            ? ({ "--zn-dot": sessionColor(session.sessionType) } as React.CSSProperties)
                            : undefined
                        }
                      />
                    )}
                    {/* The zone label is the dot's legend — the ink ramp orders
                        the zones, it does not name them. */}
                    {meta?.zone != null && (
                      <span
                        className="zn-sess__zone"
                        title={t("library:weekly.card.zone", { zone: meta.zone })}
                      >
                        Z{meta.zone}
                      </span>
                    )}
                    {session.isKeySession && (
                      <span className="zn-sess__key" title={t("view.keySession")}>
                        <Star filled />
                      </span>
                    )}
                  </div>
                  <span
                    role="button"
                    tabIndex={onSessionClick ? 0 : undefined}
                    onClick={
                      onSessionClick
                        ? () => onSessionClick(selectedWeek, originalIndex, session.workoutId)
                        : undefined
                    }
                    onKeyDown={
                      onSessionClick
                        ? (e) => {
                            if (e.key === "Enter")
                              onSessionClick(selectedWeek, originalIndex, session.workoutId);
                          }
                        : undefined
                    }
                    className="zn-sess__name"
                    data-clickable={onSessionClick ? "true" : undefined}
                    /* The single-week board has room for a third line. */
                    style={{ "--lines": singleWeek ? 3 : 2 } as React.CSSProperties}
                    title={sessionName}
                  >
                    {sessionName}
                  </span>
                  {session.estimatedDurationMin > 0 &&
                    !session.workoutId.startsWith("__activity_") && (
                      <span className="zn-sess__facts">
                        <Clock />
                        <span className="zn-sess__facts-text">
                          {formatDurationMinutes(session.estimatedDurationMin)}
                          {session.targetDistanceKm != null && session.targetDistanceKm > 0 && (
                            <span className="zn-sess__fact-wide"> · {session.sessionType !== "long_run" && "~"}{session.targetDistanceKm}km</span>
                          )}
                          {meta?.tss != null && meta.tss > 0 && (
                            <span className="zn-sess__fact-wide"> · {meta.tss} TSS</span>
                          )}
                          {session.rpe && (
                            <span className="zn-sess__fact-wide"> · RPE {session.rpe}</span>
                          )}
                        </span>
                      </span>
                    )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {!scanContent && sessions.length > 0 && onAddToDay && !isBlockedDay && (
        <button
          type="button"
          onClick={() => onAddToDay(selectedWeek, dayIndex)}
          className="zn-planweek__add"
          data-slot="tail"
        >
          <span className="zn-planweek__add-plus">+</span>
        </button>
      )}
    </div>
  );
});

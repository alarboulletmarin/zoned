import { useState, useRef, useMemo, useCallback, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Star, Flag, Clock, Trash2, Eye, ChevronLeft, ChevronRight, Dumbbell } from "@/components/icons";
import { PHASE_META } from "@/types/plan";
import type { TrainingPlan } from "@/types/plan";
import { computeWeekKm, computeWeekDuration } from "@/lib/planStats";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { usePickLang } from "@/lib/i18n-utils";

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

interface PlanWeeklyViewProps {
  plan: TrainingPlan;
  workoutNames: Record<string, string>;
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
  onToggleComplete?: (weekNumber: number, sessionIndex: number) => void;
  onValidateWeek?: (weekNumber: number) => void;
  onWorkoutAdd?: (workoutId: string, weekNumber: number, day: number) => void;
  onAddToDay?: (weekNumber: number, day: number) => void;
  onWeekChange?: (week: number) => void;
}

// ── Component ───────────────────────────────────────────────────────

export const PlanWeeklyView = memo(function PlanWeeklyView({
  plan,
  workoutNames,
  currentWeek,
  initialWeek,
  isEn,
  planStartDate,
  onSessionClick,
  onSessionMove,
  onSessionDelete,
  onToggleComplete,
  onValidateWeek,
  onWorkoutAdd,
  onAddToDay,
  onWeekChange,
}: PlanWeeklyViewProps) {
  const { t } = useTranslation("plan");
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
    [draggedSession, onSessionMove, onWorkoutAdd, plan.weeks],
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
      touchDragRef.current = null;
      dropTargetRef.current = null;
      setDraggedSession(null);
      setDropTarget(null);

      if (dragState && target && onSessionMove) {
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
      <div className="space-y-4">
        {/* ── Week navigation ── */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              const newWeek = Math.max(1, selectedWeek - 1);
              setSelectedWeek(newWeek);
              onWeekChange?.(newWeek);
            }}
            disabled={selectedWeek <= 1}
            className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium disabled:opacity-30 transition-colors hover:bg-muted/80"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="font-semibold text-sm md:text-base">
                {t("weeklyView.weekTitle", { week: selectedWeek })}
              </span>
              {isCurrent && (
                <span className="text-[10px] md:text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {t("calendar.now")}
                </span>
              )}
            </div>
            {weekData && phaseMeta && (
              <>
                <span className="text-xs text-muted-foreground">
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
                  return <span className="block text-[10px] text-muted-foreground/70">{label}</span>;
                })()}
                {weekData.sessions.length > 0 && (
                  <span className="block text-[10px] text-muted-foreground/70 tabular-nums">
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
            className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium disabled:opacity-30 transition-colors hover:bg-muted/80"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

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
              <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                <svg
                  viewBox="0 0 12 12"
                  className="size-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 6l3 3 5-5" />
                </svg>
                {done}/{total} {t("weeklyView.completed")}
              </div>
            );
          }

          if (resolved > 0 && !allResolved && onValidateWeek) {
            return (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onValidateWeek(selectedWeek);
                  }}
                  className="text-xs px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                  title={t("calendar.validateWeek")}
                >
                  {t("calendar.validateCount", { done, total })}
                </button>
              </div>
            );
          }

          return null;
        })()}

        {/* ── Day grid ── */}
        {weekData && (
          <div
            className={cn(
              "rounded-lg p-2 transition-colors",
              weekData.isRecoveryWeek && "bg-muted/40",
              !weekData.isRecoveryWeek && PHASE_BG[weekData.phase as string],
            )}
          >
            {/* Mobile: 4+3 grid layout */}
            <div className="md:hidden space-y-1.5">
              {[
                [0, 1, 2, 3],
                [4, 5, 6],
              ].map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  className={cn(
                    "grid gap-1.5",
                    row.length === 4 ? "grid-cols-4" : "grid-cols-3",
                  )}
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
                        dropTarget={dropTarget}
                        draggedSession={draggedSession}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onSessionClick={onSessionClick}
                        onToggleComplete={onToggleComplete}
                        onAddToDay={onAddToDay}
                        setContextMenu={setContextMenu}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Desktop: single 7-column row */}
            <div className="hidden md:grid md:grid-cols-7 md:gap-2">
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
                    dropTarget={dropTarget}
                    draggedSession={draggedSession}
                    isDesktop
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onSessionClick={onSessionClick}
                    onToggleComplete={onToggleComplete}
                    onAddToDay={onAddToDay}
                    setContextMenu={setContextMenu}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Context menu (long press mobile / right-click desktop) ── */}
      {contextMenu && (
        <div className="fixed inset-0 z-50" onPointerDown={() => setContextMenu(null)}>
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
                  onSessionClick(
                    contextMenu.weekNumber,
                    contextMenu.sessionIndex,
                    contextMenu.workoutId,
                  );
                  setContextMenu(null);
                }}
              >
                <Eye className="size-4 text-muted-foreground shrink-0" />
                {t("calendar.viewSession")}
              </button>
            )}
            {onToggleComplete && (
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                onClick={() => {
                  onToggleComplete(contextMenu.weekNumber, contextMenu.sessionIndex);
                  setContextMenu(null);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4 text-green-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12l5 5 9-9" />
                </svg>
                {t("completion.toggleDone")}
              </button>
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
  dropTarget: { weekNumber: number; day: number } | null;
  draggedSession: { weekNumber: number; sessionIndex: number } | null;
  isDesktop?: boolean;
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
  onToggleComplete?: (weekNumber: number, sessionIndex: number) => void;
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
  dropTarget,
  draggedSession,
  isDesktop,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onSessionClick,
  onToggleComplete,
  onAddToDay,
  setContextMenu,
}: DayCellProps) {
  const { t } = useTranslation("plan");
  const sessions = weekData.sessions.filter((s) => s.dayOfWeek === dayIndex);
  const isDropHere = dropTarget?.weekNumber === selectedWeek && dropTarget?.day === dayIndex;

  return (
    <div
      data-drop-id={`${selectedWeek}-${dayIndex}`}
      onDragOver={(e) => onDragOver(e, selectedWeek, dayIndex)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, selectedWeek, dayIndex)}
      className={cn(
        "rounded-lg bg-secondary/30 p-1.5 transition-colors",
        isDesktop ? "min-h-[120px]" : "min-h-[80px]",
        isDropHere && "ring-2 ring-primary/50 bg-primary/5",
      )}
    >
      <span
        className={cn(
          "font-semibold text-muted-foreground block",
          isDesktop ? "text-xs" : "text-[10px]",
          dayOfMonth != null ? "mb-0" : "mb-1",
        )}
      >
        {dayLabel}
      </span>
      {dayOfMonth != null && (
        <span className={cn(
          "text-[10px] tabular-nums block text-center mb-1",
          isToday
            ? "font-bold text-primary"
            : monthLabel
              ? "font-semibold text-primary/70"
              : "text-muted-foreground/60",
        )}>
          {monthLabel ? `${dayOfMonth} ${monthLabel}` : dayOfMonth}
        </span>
      )}

      {sessions.length === 0 ? (
        onAddToDay ? (
          <button
            type="button"
            onClick={() => onAddToDay(selectedWeek, dayIndex)}
            className={cn(
              "w-full rounded bg-card/50 border border-dashed border-muted-foreground/30 flex items-center justify-center gap-1 text-muted-foreground/40 active:text-primary hover:text-primary hover:border-primary/40 transition-colors",
              isDesktop ? "p-4" : "p-3",
            )}
          >
            <span className="text-sm font-medium">+</span>
          </button>
        ) : (
          <span className="text-[10px] text-muted-foreground/30 block text-center mt-4">
            ---
          </span>
        )
      ) : null}

      {sessions.map((session, sIdx) => {
        const isRaceDay = session.workoutId === "__race_day__";
        const originalIndex = weekData.sessions.indexOf(session);
        const isDragging =
          draggedSession?.weekNumber === selectedWeek &&
          draggedSession?.sessionIndex === originalIndex;
        const sessionName = workoutNames[session.workoutId] || session.workoutId;
        const isStrength = session.sessionType === "strength" || session.workoutId?.startsWith("STR-");

        return (
          <div
            key={sIdx}
            draggable={!isRaceDay}
            onDragStart={
              isRaceDay ? undefined : (e) => onDragStart(e, selectedWeek, originalIndex)
            }
            onDragEnd={isRaceDay ? undefined : onDragEnd}
            onTouchStart={
              isRaceDay
                ? undefined
                : (e) => onTouchStart(e, selectedWeek, originalIndex, session.workoutId)
            }
            onTouchMove={isRaceDay ? undefined : onTouchMove}
            onTouchEnd={isRaceDay ? undefined : onTouchEnd}
            onContextMenu={
              isRaceDay
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
            style={isRaceDay ? undefined : { touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
            className={cn(
              !isRaceDay && "cursor-grab active:cursor-grabbing",
              isDragging && "opacity-40",
            )}
          >
            <div
              className={cn(
                "rounded mb-1 relative",
                isDesktop ? "p-2" : "p-1.5",
                isStrength
                  ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700"
                  : "bg-card border border-border/50",
              )}
            >
              {isRaceDay ? (
                <div className="text-center py-1">
                  <Flag className="size-3.5 text-primary mx-auto" />
                  <span className="text-[10px] font-bold text-primary block">
                    {t("calendar.race")}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1 mb-0.5">
                    {onToggleComplete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(selectedWeek, originalIndex);
                        }}
                        className={cn(
                          "size-3.5 rounded-sm border shrink-0 flex items-center justify-center transition-colors",
                          session.status === "completed"
                            ? "bg-green-500 border-green-500 text-white"
                            : session.status === "modified"
                              ? "bg-blue-500 border-blue-500 text-white"
                              : session.status === "skipped"
                                ? "bg-muted border-muted-foreground/30"
                                : "border-muted-foreground/40 hover:border-primary",
                        )}
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
                          <svg
                            viewBox="0 0 12 12"
                            className="size-2.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                        {session.status === "modified" && (
                          <svg
                            viewBox="0 0 12 12"
                            className="size-2.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M9 2l1.5 1.5L5 9 2 9l0-3L7.5 0.5z" />
                          </svg>
                        )}
                        {session.status === "skipped" && (
                          <svg
                            viewBox="0 0 12 12"
                            className="size-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 3l6 6M9 3l-6 6" />
                          </svg>
                        )}
                      </button>
                    )}
                    {isStrength ? (
                      <Dumbbell className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                    ) : (
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: SESSION_COLORS[session.sessionType] || "#9ca3af",
                        }}
                      />
                    )}
                    {session.isKeySession && (
                      <Star className="size-2.5 text-yellow-500 fill-yellow-500 shrink-0" />
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
                    className={cn(
                      "text-[10px] leading-tight font-medium line-clamp-2 block",
                      isDesktop && "text-[11px]",
                      session.status === "skipped" && "line-through text-muted-foreground",
                      isStrength && session.status !== "skipped" && "text-amber-900 dark:text-amber-100",
                      onSessionClick && "cursor-pointer hover:text-primary transition-colors",
                    )}
                    title={sessionName}
                  >
                    {sessionName}
                  </span>
                  {session.estimatedDurationMin > 0 &&
                    !session.workoutId.startsWith("__activity_") && (
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
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
                </>
              )}
            </div>
          </div>
        );
      })}

      {sessions.length > 0 && onAddToDay && (
        <button
          type="button"
          onClick={() => onAddToDay(selectedWeek, dayIndex)}
          className="w-full mt-1 rounded bg-card/50 border border-dashed border-muted-foreground/30 p-1.5 flex items-center justify-center gap-1 text-muted-foreground/40 active:text-primary hover:text-primary hover:border-primary/40 transition-colors"
        >
          <span className="text-sm font-medium">+</span>
        </button>
      )}
    </div>
  );
});

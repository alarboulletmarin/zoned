import { useState, useRef, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Star, Flag, Clock, Trash2 } from "@/components/icons";
import { PHASE_META } from "@/types/plan";
import type { TrainingPlan, PlanSession } from "@/types/plan";

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
}

// ── Component ───────────────────────────────────────────────────────

export function PlanCalendar({
  plan,
  workoutNames,
  currentWeek,
  isEn,
  onSessionClick,
  onSessionMove,
  onSessionDelete,
}: PlanCalendarProps) {
  const dayHeaders = isEn ? DAY_HEADERS_EN : DAY_HEADERS_FR;

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
      if (!draggedSession || !onSessionMove) return;

      // Don't move to same position
      const week = plan.weeks.find(w => w.weekNumber === draggedSession.weekNumber);
      const session = week?.sessions[draggedSession.sessionIndex];
      if (session && session.dayOfWeek === day && draggedSession.weekNumber === weekNumber) return;

      onSessionMove(draggedSession.weekNumber, draggedSession.sessionIndex, weekNumber, day);
      setDraggedSession(null);
    },
    [draggedSession, onSessionMove, plan.weeks],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedSession(null);
    setDropTarget(null);
  }, []);

  // ── Mobile touch handlers ───────────────────────────────────────

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, weekNumber: number, sessionIndex: number) => {
      e.stopPropagation();
      const touch = e.touches[0];
      const target = (e.target as HTMLElement).closest("[draggable]") as HTMLElement | null;

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

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchDragRef.current || !touchGhostRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];

    // Move ghost centered on finger
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
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Clean up ghost
    if (touchGhostRef.current) {
      document.body.removeChild(touchGhostRef.current);
      touchGhostRef.current = null;
    }

    const dragState = touchDragRef.current;
    const target = dropTargetRef.current;
    touchDragRef.current = null;
    dropTargetRef.current = null;
    setDraggedSession(null);
    setDropTarget(null);

    if (!dragState || !target || !onSessionMove) return;

    const week = plan.weeks.find(w => w.weekNumber === dragState.weekNumber);
    const session = week?.sessions[dragState.sessionIndex];
    if (session && session.dayOfWeek === target.day && dragState.weekNumber === target.weekNumber) return;

    onSessionMove(dragState.weekNumber, dragState.sessionIndex, target.weekNumber, target.day);
  }, [onSessionMove, plan.weeks]);

  // Mobile: week selector state
  const [mobileWeek, setMobileWeek] = useState(Math.max(1, currentWeek));

  const mobileWeekData = plan.weeks.find(w => w.weekNumber === mobileWeek);

  return (
    <>
      {/* ── Mobile: agenda view ── */}
      <div className="md:hidden space-y-4">
        {/* Week navigation */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setMobileWeek(w => Math.max(1, w - 1))}
            disabled={mobileWeek <= 1}
            className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium disabled:opacity-30"
          >
            ←
          </button>
          <div className="text-center">
            <span className="font-semibold text-sm">
              {isEn ? `Week ${mobileWeek}` : `Semaine ${mobileWeek}`}
            </span>
            {mobileWeekData && (
              <span className="text-xs text-muted-foreground ml-2">
                {isEn ? PHASE_META[mobileWeekData.phase].labelEn : PHASE_META[mobileWeekData.phase].label}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileWeek(w => Math.min(plan.totalWeeks, w + 1))}
            disabled={mobileWeek >= plan.totalWeeks}
            className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium disabled:opacity-30"
          >
            →
          </button>
        </div>

        {/* Week grid: 4 cols top row, 3 cols bottom row */}
        {mobileWeekData && (
          <div className="space-y-1.5">
            {[
              [0, 1, 2, 3],
              [4, 5, 6],
            ].map((row, rowIdx) => (
              <div key={rowIdx} className={cn("grid gap-1.5", row.length === 4 ? "grid-cols-4" : "grid-cols-3")}>
                {row.map((dayIndex) => {
                  const sessions = mobileWeekData.sessions.filter(s => s.dayOfWeek === dayIndex);
                  const isDropHere =
                    dropTarget?.weekNumber === mobileWeek && dropTarget?.day === dayIndex;

                  return (
                    <div
                      key={dayIndex}
                      data-drop-id={`${mobileWeek}-${dayIndex}`}
                      onDragOver={(e) => handleDragOver(e, mobileWeek, dayIndex)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, mobileWeek, dayIndex)}
                      className={cn(
                        "min-h-[80px] rounded-lg bg-secondary/30 p-1.5 transition-colors",
                        isDropHere && "ring-2 ring-primary/50 bg-primary/5",
                      )}
                    >
                      <span className="text-[10px] font-semibold text-muted-foreground block mb-1">
                        {dayHeaders[dayIndex]}
                      </span>
                      {sessions.length === 0 && (
                        <span className="text-[10px] text-muted-foreground/30 block text-center mt-4">—</span>
                      )}
                      {sessions.map((session, sIdx) => {
                        const isRaceDay = session.workoutId === "__race_day__";
                        const originalIndex = mobileWeekData.sessions.indexOf(session);
                        const isDragging =
                          draggedSession?.weekNumber === mobileWeek &&
                          draggedSession?.sessionIndex === originalIndex;
                        const sessionName = workoutNames[session.workoutId] || session.workoutId;

                        return (
                          <div
                            key={sIdx}
                            draggable={!isRaceDay}
                            onDragStart={
                              isRaceDay
                                ? undefined
                                : (e) => handleDragStart(e, mobileWeek, originalIndex)
                            }
                            onDragEnd={isRaceDay ? undefined : handleDragEnd}
                            onTouchStart={
                              isRaceDay
                                ? undefined
                                : (e) => handleTouchStart(e, mobileWeek, originalIndex)
                            }
                            onTouchMove={isRaceDay ? undefined : handleTouchMove}
                            onTouchEnd={isRaceDay ? undefined : handleTouchEnd}
                            style={isRaceDay ? undefined : { touchAction: "none" }}
                            className={cn(
                              !isRaceDay && "cursor-grab active:cursor-grabbing",
                              isDragging && "opacity-40",
                            )}
                          >
                            <div
                              className="rounded bg-card border border-border/50 p-1.5 mb-1 cursor-pointer relative"
                              onClick={() => !isRaceDay && onSessionClick?.(mobileWeek, originalIndex, session.workoutId)}
                            >
                              {isRaceDay ? (
                                <div className="text-center py-1">
                                  <Flag className="size-3.5 text-primary mx-auto" />
                                  <span className="text-[10px] font-bold text-primary block">{isEn ? "Race" : "Course"}</span>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: SESSION_COLORS[session.sessionType] || "#9ca3af" }} />
                                    {session.isKeySession && <Star className="size-2.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                                  </div>
                                  <span className="text-[10px] leading-tight font-medium line-clamp-2 block">
                                    {sessionName}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground">{session.estimatedDurationMin}min</span>
                                  {onSessionDelete && (
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); onSessionDelete(mobileWeek, originalIndex); }}
                                      onPointerDown={(e) => e.stopPropagation()}
                                      className="absolute top-0.5 right-0.5 text-muted-foreground/50 active:text-destructive"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop: calendar grid ── */}
      <div className="hidden md:block overflow-x-auto">
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
                {isEn ? "Week" : "Sem."}
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
            {plan.weeks.map((week) => {
              const isCurrent =
                currentWeek === week.weekNumber &&
                currentWeek >= 1 &&
                currentWeek <= plan.totalWeeks;
              const phaseMeta = PHASE_META[week.phase];
              const isPhaseStart = phaseStartWeeks.has(week.weekNumber);
              const dayMap = sessionsByWeekDay.get(week.weekNumber);

              const weekLabel = isEn
                ? week.weekLabelEn || `W${week.weekNumber}`
                : week.weekLabel || `S${week.weekNumber}`;

              return (
                <tr
                  key={week.weekNumber}
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
                      {isEn ? phaseMeta.labelEn : phaseMeta.label}
                    </span>
                    {isCurrent && (
                      <div className="text-[9px] font-semibold text-primary mt-0.5">
                        {isEn ? "NOW" : "ACTUEL"}
                      </div>
                    )}
                  </td>

                  {/* Day cells (0=Mon to 6=Sun) */}
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const sessions = dayMap?.get(dayIndex) || [];
                    const isDropHere =
                      dropTarget?.weekNumber === week.weekNumber && dropTarget?.day === dayIndex;

                    return (
                      <td
                        key={dayIndex}
                        data-drop-id={`${week.weekNumber}-${dayIndex}`}
                        onDragOver={(e) => handleDragOver(e, week.weekNumber, dayIndex)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, week.weekNumber, dayIndex)}
                        className={cn(
                          "px-0.5 py-1 align-top transition-colors",
                          isDropHere && "ring-2 ring-primary/50 bg-primary/5 rounded",
                        )}
                      >
                        {sessions.length === 0 ? (
                          <span className="text-xs text-muted-foreground/40 block text-center">
                            —
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            {sessions.map((session, sIdx) => {
                              const isRaceDay = session.workoutId === "__race_day__";
                              const originalIndex = week.sessions.indexOf(session);
                              const isDragging =
                                draggedSession?.weekNumber === week.weekNumber &&
                                draggedSession?.sessionIndex === originalIndex;
                              const sessionName = workoutNames[session.workoutId] || session.workoutId;

                              return (
                                <div
                                  key={sIdx}
                                  draggable={!isRaceDay}
                                  onDragStart={
                                    isRaceDay
                                      ? undefined
                                      : (e) => handleDragStart(e, week.weekNumber, originalIndex)
                                  }
                                  onDragEnd={isRaceDay ? undefined : handleDragEnd}
                                  onTouchStart={
                                    isRaceDay
                                      ? undefined
                                      : (e) =>
                                          handleTouchStart(
                                            e,
                                            week.weekNumber,
                                            originalIndex,
                                          )
                                  }
                                  onTouchMove={isRaceDay ? undefined : handleTouchMove}
                                  onTouchEnd={isRaceDay ? undefined : handleTouchEnd}
                                  style={isRaceDay ? undefined : { touchAction: "none" }}
                                  className={cn(
                                    !isRaceDay && "cursor-grab active:cursor-grabbing",
                                    isDragging && "opacity-40",
                                  )}
                                >
                                  <SessionCell
                                    session={session}
                                    isRaceDay={isRaceDay}
                                    workoutName={sessionName}
                                    isEn={isEn}
                                    onClick={
                                      onSessionClick && !isRaceDay
                                        ? () =>
                                            onSessionClick(
                                              week.weekNumber,
                                              originalIndex,
                                              session.workoutId,
                                            )
                                        : undefined
                                    }
                                    onDelete={
                                      onSessionDelete && !isRaceDay
                                        ? () => onSessionDelete(week.weekNumber, originalIndex)
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
    </>
  );
}

// ── Session cell sub-component ──────────────────────────────────────

function SessionCell({
  session,
  isRaceDay,
  workoutName,
  isEn,
  onClick,
  onDelete,
}: {
  session: PlanSession;
  isRaceDay: boolean;
  workoutName?: string;
  isEn: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}) {
  if (isRaceDay) {
    return (
      <div className="rounded border border-primary/30 bg-primary/10 px-1 py-1 text-center">
        <Flag className="size-3 text-primary mx-auto" />
        <span className="text-[10px] font-semibold text-primary leading-tight block">
          {isEn ? "Race" : "Course"}
        </span>
      </div>
    );
  }

  const dotColor = SESSION_COLORS[session.sessionType] || "#9ca3af";
  const displayName = workoutName || session.workoutId;

  return (
    <div className="relative group">
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
          title={isEn ? "Delete session" : "Supprimer la séance"}
        >
          <Trash2 className="size-3" />
        </button>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          "w-full rounded px-1 py-1 text-left transition-colors",
          "bg-secondary/60 hover:bg-secondary",
          !onClick && "cursor-default"
        )}
      >
        <div className="flex items-center gap-1">
          <span
            className="size-1.5 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
          />
          {session.isKeySession && (
            <Star className="size-2.5 text-yellow-500 fill-yellow-500 shrink-0" />
          )}
        </div>
        <span
          className="text-[11px] leading-tight font-medium line-clamp-2 mt-0.5 block"
          title={displayName}
        >
          {displayName}
        </span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
          <Clock className="size-2.5" />
          {session.estimatedDurationMin}min
        </span>
      </button>
    </div>
  );
}

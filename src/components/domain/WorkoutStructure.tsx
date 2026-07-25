import { useTranslation } from "react-i18next";
import { Lightbulb, AlertTriangle } from "@/components/icons";
import { ZoneBadge } from "./ZoneBadge";
import { PhaseCard } from "./PhaseCard";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate, WorkoutStep, WorkoutStepRepeat, WorkoutStepSegment, ZoneRange, ZoneSpan } from "@/types";
import { getWorkoutDiscipline, parseZoneSpan } from "@/types";
import { formatPace } from "@/lib/zones";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { useIsEnglish, usePickLang, usePickLangArray } from "@/lib/i18n-utils";
import { getWorkoutPhaseSteps, summarizeWorkoutSteps } from "@/lib/workoutStructure";
import { formatDurationMinutes } from "@/components/visualization/transforms";

interface WorkoutStructureProps {
  workout: WorkoutTemplate;
  userZones?: ZoneRange[];
  className?: string;
}

interface StepItemProps {
  step: WorkoutStep;
  depth: number;
  userZones?: ZoneRange[];
  t: (key: string, opts?: Record<string, unknown>) => string;
  isEnglish: boolean;
}

export function WorkoutStructure({ workout, userZones, className }: WorkoutStructureProps) {
  const { t } = useTranslation("session");
  const isEnglish = useIsEnglish();

  // Personalized paces (min/km) only make sense for running. Strip them for
  // cycling and swimming so the personalised footer falls back to HR alone
  // until discipline-specific zone systems (FTP, CSS) are wired in.
  const discipline = getWorkoutDiscipline(workout);
  const effectiveUserZones =
    discipline === "running"
      ? userZones
      : userZones?.map(({ paceMinPerKm: _paceMin, paceMaxPerKm: _paceMax, ...rest }) => rest);

  const phases = [
    {
      key: "warmup" as const,
      label: t("structure.warmup"),
      steps: getWorkoutPhaseSteps(workout, "warmup"),
      summary: summarizeWorkoutSteps(getWorkoutPhaseSteps(workout, "warmup"), isEnglish),
    },
    {
      key: "main" as const,
      label: t("structure.main"),
      steps: getWorkoutPhaseSteps(workout, "main"),
      summary: summarizeWorkoutSteps(getWorkoutPhaseSteps(workout, "main"), isEnglish),
    },
    {
      key: "cooldown" as const,
      label: t("structure.cooldown"),
      steps: getWorkoutPhaseSteps(workout, "cooldown"),
      summary: summarizeWorkoutSteps(getWorkoutPhaseSteps(workout, "cooldown"), isEnglish),
    },
  ].filter((phase) => phase.steps.length > 0);

  return (
    <div className={cn("space-y-7 sm:space-y-8", className)}>
      {phases.map((phase) => (
        <PhaseCard
          key={phase.key}
          label={phase.label}
          summary={shouldShowPhaseSummary(phase.steps) ? phase.summary : null}
        >
          {phase.steps.map((step, index) => (
            <StepItem key={`${phase.key}-${index}`} step={step} depth={0} userZones={effectiveUserZones} t={t} isEnglish={isEnglish} />
          ))}
        </PhaseCard>
      ))}
    </div>
  );
}

/**
 * Heart-rate and pace targets for a zone spec.
 *
 * A range spec spans its whole width: `Z1-Z2` must read from the bottom of Z1
 * to the top of Z2, not just Z2's numbers under a badge that says Z1-Z2.
 */
function formatPersonalizedZone(span: ZoneSpan, userZones: ZoneRange[]): string | null {
  const low = userZones.find((zone) => zone.zone === span.min);
  const high = userZones.find((zone) => zone.zone === span.max);
  if (!low || !high) return null;

  const parts: string[] = [];
  if (low.hrMin && high.hrMax) {
    parts.push(`${low.hrMin}-${high.hrMax} bpm`);
  }
  // Pace runs the other way: the slowest pace belongs to the easiest zone.
  if (high.paceMinPerKm && low.paceMaxPerKm) {
    parts.push(`${formatPace(high.paceMinPerKm)}-${formatPace(low.paceMaxPerKm)}/km`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

function hasNestedRepeat(steps: WorkoutStep[]): boolean {
  return steps.some((step) => step.kind === "repeat");
}

function shouldShowPhaseSummary(steps: WorkoutStep[]): boolean {
  return hasNestedRepeat(steps);
}

function getRecoveryChipLabel(
  step: WorkoutStepRepeat,
  isEnglish: boolean,
  t: StepItemProps["t"],
): string | null {
  if (!step.between || step.between.length === 0) return null;

  const value = summarizeWorkoutSteps(step.between, isEnglish);
  if (step.unit === "sets") return t("structure.chips.seriesRecovery", { value });
  if (step.unit === "blocks") return t("structure.chips.blocksRecovery", { value });
  return null;
}

function areAllSegments(steps: WorkoutStep[]): steps is WorkoutStepSegment[] {
  return steps.every((step) => step.kind === "segment");
}

function isCompactRepeat(step: WorkoutStepRepeat): boolean {
  return areAllSegments(step.steps) && areAllSegments(step.between ?? []);
}

function isCompactNestedRepeat(step: WorkoutStepRepeat): step is WorkoutStepRepeat & { steps: [WorkoutStepRepeat] } {
  return step.steps.length === 1
    && step.steps[0]?.kind === "repeat"
    && isCompactRepeat(step.steps[0])
    && areAllSegments(step.between ?? []);
}

function StepItem({ step, depth, userZones, t, isEnglish }: StepItemProps) {
  if (step.kind === "segment") {
    return <StepRow step={step} depth={depth} userZones={userZones} t={t} />;
  }

  if (isCompactNestedRepeat(step)) {
    return <CompactNestedRepeatItem step={step} depth={depth} userZones={userZones} t={t} />;
  }

  if (isCompactRepeat(step)) {
    return <CompactRepeatItem step={step} depth={depth} userZones={userZones} t={t} isEnglish={isEnglish} />;
  }

  const repeatLabel = t(`structure.repeatUnits.${step.unit ?? "blocks"}`, { count: step.count });
  const betweenLabel = t(`structure.between.${step.unit ?? "blocks"}`);
  const showBetweenPlaceholder = (step.unit === "sets" || step.unit === "blocks") && (!step.between || step.between.length === 0);

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4 space-y-3",
        depth > 0 && "ml-4 sm:ml-6",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{repeatLabel}</p>
        </div>
      </div>

      <div className="space-y-2 border-l border-border/60 pl-3 sm:pl-4">
        {step.steps.map((child, index) => (
          <StepItem key={`step-${depth}-${index}`} step={child} depth={depth + 1} userZones={userZones} t={t} isEnglish={isEnglish} />
        ))}
      </div>

      {(step.between && step.between.length > 0) || showBetweenPlaceholder ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-background/70 p-3 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {betweenLabel}
          </p>
          {step.between && step.between.length > 0 ? (
            <div className="space-y-2">
              {step.between.map((child, index) => (
                <StepItem key={`between-${depth}-${index}`} step={child} depth={depth + 1} userZones={userZones} t={t} isEnglish={isEnglish} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t("structure.notSpecified")}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function CompactNestedRepeatItem({
  step,
  depth,
  userZones,
  t,
}: Omit<StepItemProps, "isEnglish"> & { step: WorkoutStepRepeat & { steps: [WorkoutStepRepeat] } }) {
  const inner = step.steps[0];
  const innerSegments = inner.steps as WorkoutStepSegment[];
  const innerBetween = (inner.between ?? []) as WorkoutStepSegment[];
  const setBetween = (step.between ?? []) as WorkoutStepSegment[];

  const setsLabel = t(`structure.repeatUnits.${step.unit ?? "blocks"}`, { count: step.count });
  const repsLabel = t(`structure.repeatUnits.${inner.unit ?? "blocks"}`, { count: inner.count });
  const betweenSetsLabel = t(`structure.between.${step.unit ?? "blocks"}`);

  return (
    <div className={cn("rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4 space-y-3", depth > 0 && "ml-4 sm:ml-6")}>
      {/* Plain text, not pills: these are counts to read, not controls to
          press. The previous rounded secondary badges read as toggles. */}
      <p className="text-sm font-semibold tracking-tight">
        {setsLabel} <span className="text-muted-foreground font-normal">·</span> {repsLabel}
      </p>

      <RepeatGroup count={inner.count}>
        {innerSegments.map((segment, index) => (
          <StepRow key={`compact-inner-step-${index}`} step={segment} userZones={userZones} t={t} />
        ))}
        {innerBetween.map((segment, index) => (
          <StepRow key={`compact-inner-between-${index}`} step={segment} userZones={userZones} t={t} dashed />
        ))}
      </RepeatGroup>

      {setBetween.length > 0 && (
        <div className="rounded-lg border border-dashed border-border/60 bg-background/70 p-3 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{betweenSetsLabel}</p>
          {setBetween.map((segment, index) => (
            <StepRow key={`compact-between-${index}`} step={segment} userZones={userZones} t={t} muted />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Wraps the steps a repeat applies to, with the multiplier leading the group
 * and a rule running down its full height. A bare "x 12" floating under the
 * last row gave no clue whether it covered one step or the pair.
 */
function RepeatGroup({ count, children }: { count: number; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-xs font-semibold text-foreground tabular-nums shrink-0">
          {count} ×
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
      <div className="space-y-2 border-l-2 border-border/60 pl-3">{children}</div>
    </div>
  );
}

function CompactRepeatItem({
  step,
  depth,
  userZones,
  t,
  isEnglish,
}: StepItemProps & { step: WorkoutStepRepeat }) {
  const stepSegments = step.steps as WorkoutStepSegment[];
  const betweenSegments = (step.between ?? []) as WorkoutStepSegment[];
  const seriesRecovery = getRecoveryChipLabel(step, isEnglish, t);
  const betweenLabel = t(`structure.between.${step.unit ?? "blocks"}`);
  const showBetweenPlaceholder = (step.unit === "sets" || step.unit === "blocks") && betweenSegments.length === 0;

  return (
    <div className={cn("rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4 space-y-3", depth > 0 && "ml-4 sm:ml-6")}>
      <RepeatGroup count={step.count}>
        {stepSegments.map((segment, index) => (
          <StepRow key={`compact-step-${index}`} step={segment} userZones={userZones} t={t} />
        ))}
        {betweenSegments.map((segment, index) => (
          <StepRow key={`compact-between-${index}`} step={segment} userZones={userZones} t={t} dashed />
        ))}
      </RepeatGroup>

      {seriesRecovery && (
        <p className="text-xs text-muted-foreground tracking-tight">{seriesRecovery}</p>
      )}

      {showBetweenPlaceholder && (
        <div className="rounded-lg border border-dashed border-border/60 bg-background/70 p-3 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{betweenLabel}</p>
          <p className="text-sm text-muted-foreground italic">{t("structure.notSpecified")}</p>
        </div>
      )}
    </div>
  );
}

function buildMetaParts(step: WorkoutStepSegment): string[] {
  const parts: string[] = [];
  if (step.durationSec != null) parts.push(formatDurationMinutes(step.durationSec / 60));
  if (step.distanceKm != null) parts.push(`${step.distanceKm} km`);
  if (step.distanceM != null) parts.push(`${step.distanceM} m`);
  if (step.elevationGainM != null && step.elevationGainM > 0) {
    parts.push(`+${step.elevationGainM} m D+`);
  }
  if (step.gradientPercent != null && step.gradientPercent !== 0) {
    parts.push(`${step.gradientPercent > 0 ? "+" : ""}${step.gradientPercent}%`);
  }
  return parts;
}

/**
 * One step of a phase.
 *
 * Priority is deliberately inverted compared to the previous layout: the
 * numbers you read mid-session — heart rate and pace — are the dominant
 * line, and the exercise name drops to a caption underneath. When the runner
 * has not set their zones there is nothing to promote, so the name keeps the
 * lead line instead of leaving it empty.
 */
function StepRow({
  step,
  userZones,
  t,
  depth = 0,
  muted = false,
  dashed = false,
}: {
  step: WorkoutStepSegment;
  userZones?: ZoneRange[];
  t: StepItemProps["t"];
  depth?: number;
  muted?: boolean;
  dashed?: boolean;
}) {
  const pickLang = usePickLang();
  const description = pickLang(step, "description");
  const span = parseZoneSpan(step.zone);
  const targets = span && userZones && userZones.length > 0
    ? formatPersonalizedZone(span, userZones)
    : null;

  const metaParts = buildMetaParts(step);
  const isRecovery = dashed || step.role === "recovery";

  return (
    <div
      className={cn(
        "rounded-lg border border-border/40 bg-background/80 p-3",
        muted && "bg-muted/35",
        isRecovery && "border-dashed border-border/50 bg-muted/20",
        depth > 0 && "ml-4 sm:ml-6",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {step.zone ? (
              <ZoneBadge zone={step.zone} size="sm" showLabel={!targets} />
            ) : (
              <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                {t("structure.noZone")}
              </span>
            )}
            {targets ? (
              <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                {targets}
              </span>
            ) : (
              <GlossaryLinkedText text={description} className="text-sm font-medium min-w-0" as="span" />
            )}
          </div>
          {targets && (
            <GlossaryLinkedText
              text={description}
              className="text-xs text-muted-foreground block min-w-0"
              as="span"
            />
          )}
        </div>
        {metaParts.length > 0 && (
          <span className="font-mono text-sm text-foreground/80 tabular-nums whitespace-nowrap shrink-0">
            {metaParts.join(" · ")}
          </span>
        )}
      </div>
    </div>
  );
}

interface CoachingTipsProps {
  workout: WorkoutTemplate;
  className?: string;
}

export function CoachingTips({ workout, className }: CoachingTipsProps) {
  const { t } = useTranslation("session");
  const pickLangArray = usePickLangArray();

  const tips = pickLangArray<string>(workout, "coachingTips");
  const mistakes = pickLangArray<string>(workout, "commonMistakes");

  return (
    <div className={cn("space-y-6", className)}>
      {tips.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="size-4 text-success" />
            {t("coaching.tips")}
          </h4>
          <ul className="space-y-1.5">
            {tips.map((tip, index) => (
              <li
                key={index}
                className="text-sm text-muted-foreground pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-success"
              >
                <GlossaryLinkedText text={tip} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {mistakes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            {t("coaching.mistakes")}
          </h4>
          <ul className="space-y-1.5">
            {mistakes.map((mistake, index) => (
              <li
                key={index}
                className="text-sm text-muted-foreground pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-destructive"
              >
                <GlossaryLinkedText text={mistake} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

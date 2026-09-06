import { useTranslation } from "react-i18next";
import { ZoneBadge } from "./ZoneBadge";
import { PhaseCard } from "./PhaseCard";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate, WorkoutStep, WorkoutStepRepeat, WorkoutStepSegment, ZoneRange, ZoneSpan } from "@/types";
import { getWorkoutDiscipline, parseZoneSpan } from "@/types";
import { formatPace } from "@/lib/zones";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { useIsEnglish, usePickLang, usePickLangArray } from "@/lib/i18n-utils";
import { getWorkoutPhaseSteps, summarizeWorkoutSteps } from "@/lib/workoutStructure";
import { formatDurationMinutes, transformSessionBlocks } from "@/components/visualization/transforms";
import { ZoneBar, type ZoneBarBlock } from "@/components/visualization/ZoneBar";
import { ZoneScale } from "@/components/visualization/ZoneScale";
import type { BlockType, ZoneNumber } from "@/components/visualization/types";

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

  // The segments the timeline already computes, reused to draw each phase its
  // own profile. No new flattening logic: this is the same call `ZoneBar`'s
  // own `toZoneBarBlocks` makes, only kept split by phase.
  const { segments } = transformSessionBlocks(workout);

  // The zones this session actually paints, warm-up and cool-down included.
  // Read off the segments rather than lib/landing-stats' getWorkoutZones,
  // which only walks the main set: a tempo session would then have named Z3
  // under a chart that also draws its Z1 warm-up.
  const paintedZones = [
    ...new Set(
      segments
        .map((segment) => segment.zoneNumber)
        .filter((zone): zone is ZoneNumber => zone != null),
    ),
  ].sort((a, b) => a - b);

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
    <div className={cn("zn-structure", className)}>
      {/* The ramp orders the zones but does not name them, so the surface that
          paints them shows the legend once, above the phases — and only for the
          zones this session actually touches. */}
      <ZoneScale className="zn-structure__legend" zones={paintedZones} />

      {phases.map((phase) => {
        const profile = phaseProfile(segments, phase.key);
        const minutes = segments
          .filter((segment) => segment.type === phase.key)
          .reduce((sum, segment) => sum + segment.durationMin, 0);

        return (
          <PhaseCard
            key={phase.key}
            className="zn-phase"
            label={phase.label}
            summary={shouldShowPhaseSummary(phase.steps) ? phase.summary : null}
            meta={
              profile.length > 0 ? (
                <span className="zn-phase__profile">
                  <ZoneBar blocks={profile} condense height={18} className="zn-phase__bar" />
                  {formatDurationMinutes(minutes)}
                </span>
              ) : null
            }
          >
            {phase.steps.map((step, index) => (
              <StepItem key={`${phase.key}-${index}`} step={step} depth={0} userZones={effectiveUserZones} t={t} isEnglish={isEnglish} />
            ))}
          </PhaseCard>
        );
      })}
    </div>
  );
}

/** One phase's blocks for the ZoneBar. `zone: 0` is recovery, not a zone. */
function phaseProfile(
  segments: ReturnType<typeof transformSessionBlocks>["segments"],
  phase: BlockType,
): ZoneBarBlock[] {
  return segments
    .filter((segment) => segment.type === phase)
    .map((segment) => ({
      seconds: Math.round(segment.durationMin * 60),
      zone: segment.isRecovery || segment.zoneNumber == null ? 0 : segment.zoneNumber,
    }));
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
    <div className="zn-repeat" data-depth={depth > 0 ? "nested" : undefined}>
      <p className="zn-repeat__count">{repeatLabel}</p>

      <div className="zn-repeat__group">
        {step.steps.map((child, index) => (
          <StepItem key={`step-${depth}-${index}`} step={child} depth={depth + 1} userZones={userZones} t={t} isEnglish={isEnglish} />
        ))}
      </div>

      {(step.between && step.between.length > 0) || showBetweenPlaceholder ? (
        <div className="zn-repeat__between">
          <p className="zn-kicker zn-kicker--xs">{betweenLabel}</p>
          {step.between && step.between.length > 0 ? (
            <div>
              {step.between.map((child, index) => (
                <StepItem key={`between-${depth}-${index}`} step={child} depth={depth + 1} userZones={userZones} t={t} isEnglish={isEnglish} />
              ))}
            </div>
          ) : (
            <p className="zn-repeat__note">{t("structure.notSpecified")}</p>
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
    <div className="zn-repeat" data-depth={depth > 0 ? "nested" : undefined}>
      {/* Plain mono, not pills: these are counts to read, not controls to
          press. The previous rounded secondary badges read as toggles. */}
      <p className="zn-repeat__count">
        {setsLabel} · {repsLabel}
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
        <div className="zn-repeat__between">
          <p className="zn-kicker zn-kicker--xs">{betweenSetsLabel}</p>
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
    <div className="zn-repeat__group">
      <div className="zn-repeat__lead">
        <span className="zn-repeat__count">{count} ×</span>
        <span className="zn-repeat__rule" />
      </div>
      <div>{children}</div>
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
    <div className="zn-repeat" data-depth={depth > 0 ? "nested" : undefined}>
      <RepeatGroup count={step.count}>
        {stepSegments.map((segment, index) => (
          <StepRow key={`compact-step-${index}`} step={segment} userZones={userZones} t={t} />
        ))}
        {betweenSegments.map((segment, index) => (
          <StepRow key={`compact-between-${index}`} step={segment} userZones={userZones} t={t} dashed />
        ))}
      </RepeatGroup>

      {seriesRecovery && <p className="zn-repeat__note">{seriesRecovery}</p>}

      {showBetweenPlaceholder && (
        <div className="zn-repeat__between">
          <p className="zn-kicker zn-kicker--xs">{betweenLabel}</p>
          <p className="zn-repeat__note">{t("structure.notSpecified")}</p>
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
    // A ruled row, the shape the kit's session screen states: zone mark,
    // label, mono meta. Recovery is not a zone — its rule is the 45 degree
    // hatch the profile gives an unmeasured block.
    <div
      className="zn-step"
      data-recovery={isRecovery ? "true" : undefined}
      data-muted={muted ? "true" : undefined}
      data-depth={depth > 0 ? "nested" : undefined}
    >
      <div className="zn-step__body">
        <div className="zn-step__head">
          {step.zone ? (
            <ZoneBadge zone={step.zone} size="sm" showLabel={!targets} />
          ) : (
            <span className="zn-step__nozone">{t("structure.noZone")}</span>
          )}
          {targets ? (
            <span className="zn-step__targets">{targets}</span>
          ) : (
            <GlossaryLinkedText text={description} className="zn-step__label" as="span" />
          )}
        </div>
        {targets && (
          <GlossaryLinkedText text={description} className="zn-step__desc" as="span" />
        )}
      </div>
      {metaParts.length > 0 && (
        <span className="zn-step__meta">{metaParts.join(" · ")}</span>
      )}
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
    // The kit's marks rather than two coloured glyphs: an em rule for advice,
    // a cross for a mistake, both in vermillon type. The success green was a
    // second hue the system reserves for a success state.
    <div className={cn("zn-coaching", className)}>
      {tips.length > 0 && (
        <div className="zn-coaching__group">
          <h4 className="zn-coaching__title">{t("coaching.tips")}</h4>
          <ul className="zn-coaching__list">
            {tips.map((tip, index) => (
              <li key={index} className="zn-coaching__item">
                <span className="zn-coaching__mark" aria-hidden="true">—</span>
                <GlossaryLinkedText text={tip} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {mistakes.length > 0 && (
        <div className="zn-coaching__group">
          <h4 className="zn-coaching__title">{t("coaching.mistakes")}</h4>
          <ul className="zn-coaching__list">
            {mistakes.map((mistake, index) => (
              <li key={index} className="zn-coaching__item">
                <span className="zn-coaching__mark" aria-hidden="true">×</span>
                <GlossaryLinkedText text={mistake} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { Lightbulb, AlertTriangle } from "@/components/icons";
import { ZoneBadge } from "./ZoneBadge";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate, WorkoutStep, WorkoutStepRepeat, WorkoutStepSegment, ZoneRange, ZoneNumber } from "@/types";
import { getZoneNumber } from "@/types";
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
    <div className={cn("space-y-5", className)}>
      {phases.map((phase) => (
        <section key={phase.key} className="space-y-2.5">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {phase.label}
            </h4>
            {phase.summary && shouldShowPhaseSummary(phase.steps) && (
              <p className="text-sm font-medium text-foreground/85 tracking-tight">
                {phase.summary}
              </p>
            )}
          </div>
          <div className="space-y-3">
            {phase.steps.map((step, index) => (
              <StepItem key={`${phase.key}-${index}`} step={step} depth={0} userZones={userZones} t={t} isEnglish={isEnglish} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function formatPersonalizedZone(zoneNumber: ZoneNumber, userZones: ZoneRange[]): string | null {
  const zoneData = userZones.find((zone) => zone.zone === zoneNumber);
  if (!zoneData) return null;

  const parts: string[] = [];
  if (zoneData.hrMin && zoneData.hrMax) {
    parts.push(`${zoneData.hrMin}-${zoneData.hrMax} bpm`);
  }
  if (zoneData.paceMinPerKm && zoneData.paceMaxPerKm) {
    parts.push(`${formatPace(zoneData.paceMinPerKm)}-${formatPace(zoneData.paceMaxPerKm)}/km`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

function hasNestedRepeat(steps: WorkoutStep[]): boolean {
  return steps.some((step) => step.kind === "repeat");
}

function shouldShowPhaseSummary(steps: WorkoutStep[]): boolean {
  return hasNestedRepeat(steps);
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
    return <SegmentItem step={step} depth={depth} userZones={userZones} t={t} />;
  }

  if (isCompactNestedRepeat(step)) {
    return <CompactNestedRepeatItem step={step} depth={depth} userZones={userZones} t={t} isEnglish={isEnglish} />;
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
  isEnglish,
}: StepItemProps & { step: WorkoutStepRepeat & { steps: [WorkoutStepRepeat] } }) {
  const inner = step.steps[0];
  const innerSegments = inner.steps as WorkoutStepSegment[];
  const innerBetween = (inner.between ?? []) as WorkoutStepSegment[];
  const setBetween = (step.between ?? []) as WorkoutStepSegment[];
  const repeatLabel = t(`structure.repeatUnits.${step.unit ?? "blocks"}`, { count: step.count });
  const innerLabel = t(`structure.repeatUnits.${inner.unit ?? "blocks"}`, { count: inner.count });
  const betweenLabel = t(`structure.between.${step.unit ?? "blocks"}`);
  const innerSummary = summarizeWorkoutSteps([inner], isEnglish).replace(/^\d+x\(/, "").replace(/\)$/, "");

  return (
    <div className={cn("rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4 space-y-3", depth > 0 && "ml-4 sm:ml-6")}>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{repeatLabel}</p>
        {depth > 0 && <p className="text-sm text-muted-foreground">{innerSummary}</p>}
      </div>

      <div className="rounded-lg border border-border/40 bg-background/80 p-3 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{innerLabel}</p>
        {innerSegments.map((segment, index) => (
          <SegmentSummaryRow key={`compact-inner-step-${index}`} step={segment} userZones={userZones} t={t} />
        ))}
        {innerBetween.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t(`structure.between.${inner.unit ?? "blocks"}`)}
            </p>
            {innerBetween.map((segment, index) => (
              <SegmentSummaryRow key={`compact-inner-between-${index}`} step={segment} userZones={userZones} t={t} muted />
            ))}
          </div>
        )}
      </div>

      {setBetween.length > 0 && (
        <div className="rounded-lg border border-dashed border-border/60 bg-background/70 p-3 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{betweenLabel}</p>
          {setBetween.map((segment, index) => (
            <SegmentSummaryRow key={`compact-between-${index}`} step={segment} userZones={userZones} t={t} muted />
          ))}
        </div>
      )}
    </div>
  );
}

function CompactRepeatItem({
  step,
  depth,
  userZones,
  t,
}: StepItemProps & { step: WorkoutStepRepeat }) {
  const stepSegments = step.steps as WorkoutStepSegment[];
  const betweenSegments = (step.between ?? []) as WorkoutStepSegment[];
  const repeatLabel = t(`structure.repeatUnits.${step.unit ?? "blocks"}`, { count: step.count });
  const betweenLabel = t(`structure.between.${step.unit ?? "blocks"}`);
  const showBetweenPlaceholder = (step.unit === "sets" || step.unit === "blocks") && (!step.between || step.between.length === 0);

  return (
    <div className={cn("rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4 space-y-3", depth > 0 && "ml-4 sm:ml-6")}>
      <p className="text-sm font-semibold">{repeatLabel}</p>

      <div className="space-y-2">
        {stepSegments.map((segment, index) => (
          <SegmentSummaryRow key={`compact-step-${index}`} step={segment} userZones={userZones} t={t} />
        ))}
      </div>

      {(step.between && step.between.length > 0) || showBetweenPlaceholder ? (
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{betweenLabel}</p>
          {betweenSegments.length > 0 ? (
            betweenSegments.map((segment, index) => (
              <SegmentSummaryRow key={`compact-between-${index}`} step={segment} userZones={userZones} t={t} muted />
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">{t("structure.notSpecified")}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SegmentSummaryRow({
  step,
  userZones,
  t,
  muted = false,
}: {
  step: WorkoutStepSegment;
  userZones?: ZoneRange[];
  t: StepItemProps["t"];
  muted?: boolean;
}) {
  const pickLang = usePickLang();
  const description = pickLang(step, "description");
  const zoneNumber = step.zone ? getZoneNumber(step.zone) : null;
  const personalizedInfo = zoneNumber && userZones && userZones.length > 0
    ? formatPersonalizedZone(zoneNumber, userZones)
    : null;

  const metaParts: string[] = [];
  if (step.durationSec != null) metaParts.push(formatDurationMinutes(step.durationSec / 60));
  if (step.distanceKm != null) metaParts.push(`${step.distanceKm} km`);
  if (step.distanceM != null) metaParts.push(`${step.distanceM} m`);

  return (
    <div className={cn("rounded-lg border border-border/40 bg-background/80 p-2.5 space-y-1.5", muted && "bg-muted/35")}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {step.zone ? (
            <ZoneBadge zone={step.zone} size="sm" showLabel />
          ) : (
            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
              {t("structure.noZone")}
            </span>
          )}
          <GlossaryLinkedText text={description} className="text-sm font-medium min-w-0" as="span" />
        </div>
        {metaParts.length > 0 && (
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {metaParts.join(" · ")}
          </span>
        )}
      </div>
      {personalizedInfo && (
        <p className="text-[11px] text-muted-foreground">{personalizedInfo}</p>
      )}
    </div>
  );
}

function SegmentItem({
  step,
  depth,
  userZones,
  t,
}: Pick<StepItemProps, "depth" | "userZones"> & { step: WorkoutStepSegment; t: StepItemProps["t"] }) {
  const pickLang = usePickLang();
  const description = pickLang(step, "description");
  const zoneNumber = step.zone ? getZoneNumber(step.zone) : null;
  const personalizedInfo = zoneNumber && userZones && userZones.length > 0
    ? formatPersonalizedZone(zoneNumber, userZones)
    : null;

  const metaParts: string[] = [];
  if (step.durationSec != null) metaParts.push(formatDurationMinutes(step.durationSec / 60));
  if (step.distanceKm != null) metaParts.push(`${step.distanceKm} km`);
  if (step.distanceM != null) metaParts.push(`${step.distanceM} m`);

  return (
    <div
      className={cn(
        "rounded-lg border border-border/40 bg-background/80 p-3",
        step.role === "recovery" && "bg-muted/35",
        depth > 0 && "ml-4 sm:ml-6",
      )}
    >
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {step.zone ? (
              <ZoneBadge zone={step.zone} size="sm" showLabel />
            ) : (
              <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                {t("structure.noZone")}
              </span>
            )}
            <GlossaryLinkedText text={description} className="text-sm font-medium min-w-0" as="span" />
          </div>
          {metaParts.length > 0 && (
            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
              {metaParts.join(" · ")}
            </span>
          )}
        </div>
        {personalizedInfo && (
          <p className="text-[11px] text-muted-foreground">{personalizedInfo}</p>
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

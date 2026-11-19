import { useTranslation } from "react-i18next";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { usePickLang } from "@/lib/i18n-utils";
import { stepTarget } from "@/lib/sessionFacts";
import { stripLeadingDuration } from "@/lib/stepLabel";
import { flattenWorkoutSegments, getWorkoutPhaseSteps } from "@/lib/workoutStructure";
import type {
  WorkoutPhaseKey,
  WorkoutStep,
  WorkoutStepSegment,
  WorkoutTemplate,
  ZoneRange,
} from "@/types";
import { ZoneChip } from "./ZoneChip";

const PHASES: WorkoutPhaseKey[] = ["warmup", "main", "cooldown"];

interface StepContext {
  userZones?: ZoneRange[];
  /** Les zones portent des allures, et la séance se court : on les écrit. */
  paces: boolean;
  /** Une séance de course sans zones enregistrées : on dit ce qu'il manque. */
  hint: boolean;
}

/**
 * Les phases de la séance, en UNE liste, dans un seul cadre, à toutes les
 * largeurs. Sur bureau elles étaient trois cartes côte à côte, de hauteurs
 * inégales, dont les étiquettes longues débordaient.
 *
 * Une étape est une ligne de trois colonnes : la puce de zone, le libellé
 * avec sa cible dessous, la durée. Le libellé perd la durée qu'il répète
 * (`stripLeadingDuration`). Sans zones, la ligne de cible dit Allure · VMA
 * requise, pour que l'on voie ce qui manque plutôt qu'un vide. Une
 * répétition garde son crochet et son `3 ×`.
 */
export function SessionPhaseList({
  workout,
  userZones,
}: {
  workout: WorkoutTemplate;
  userZones?: ZoneRange[];
}) {
  const { t } = useTranslation("session");
  const running = (workout.discipline ?? "running") === "running";
  const hasZones = (userZones?.length ?? 0) > 0;
  const ctx: StepContext = { userZones, paces: running, hint: running && !hasZones };

  const segments = flattenWorkoutSegments(workout);
  const phases = PHASES.map((key) => ({
    key,
    steps: getWorkoutPhaseSteps(workout, key),
    seconds: segments.filter((s) => s.phase === key).reduce((sum, s) => sum + s.durationSec, 0),
  })).filter((phase) => phase.steps.length > 0);

  return (
    <ol className="zn-plist">
      {phases.map((phase) => (
        <li key={phase.key} className="zn-plist__phase">
          <div className="zn-plist__head">
            <h3 className="zn-plist__title">{t(`structure.${phase.key}`)}</h3>
            {phase.seconds > 0 && (
              <span className="zn-plist__dur">{formatDurationMinutes(phase.seconds / 60)}</span>
            )}
          </div>
          <Steps steps={phase.steps} ctx={ctx} />
        </li>
      ))}
    </ol>
  );
}

function Steps({ steps, ctx, nested = false }: { steps: WorkoutStep[]; ctx: StepContext; nested?: boolean }) {
  const { t } = useTranslation("session");
  return (
    <>
      {steps.map((step, index) =>
        step.kind === "segment" ? (
          <StepRow key={index} step={step} ctx={ctx} nested={nested} />
        ) : (
          <div key={index} className="zn-plist__repeat">
            <span className="zn-plist__count">{t("page.repeat", { count: step.count })}</span>
            <Steps steps={step.steps} ctx={ctx} nested />
            {step.between && step.between.length > 0 && (
              <>
                {step.unit && step.unit !== "reps" && (
                  <span className="zn-plist__between">{t(`structure.between.${step.unit}`)}</span>
                )}
                <Steps steps={step.between} ctx={ctx} nested />
              </>
            )}
          </div>
        ),
      )}
    </>
  );
}

function stepSize(step: WorkoutStepSegment): string | null {
  if (step.durationSec != null && step.durationSec > 0) return formatDurationMinutes(step.durationSec / 60);
  if (step.distanceKm != null) return `${step.distanceKm} km`;
  if (step.distanceM != null) return `${step.distanceM} m`;
  return null;
}

function StepRow({ step, ctx, nested }: { step: WorkoutStepSegment; ctx: StepContext; nested: boolean }) {
  const { t } = useTranslation("session");
  const pick = usePickLang();
  const label = stripLeadingDuration(pick(step, "description"), step.durationSec);
  const target = stepTarget(step.zone, ctx.userZones, { paces: ctx.paces });
  const extra =
    step.elevationGainM != null && step.elevationGainM > 0 ? `+${step.elevationGainM} m D+` : null;
  const sub = [target ?? (ctx.hint && step.zone ? t("page.paceNeeded") : null), extra]
    .filter(Boolean)
    .join(" · ");
  const size = stepSize(step);

  return (
    <div className="zn-plist__step" data-nested={nested || undefined} data-recovery={step.role === "recovery" || undefined}>
      <ZoneChip zone={step.zone} />
      <span className="zn-plist__label">
        <GlossaryLinkedText text={label} className="zn-plist__name" as="span" />
        {sub && (
          <span className="zn-plist__target" data-missing={!target || undefined}>
            {sub}
          </span>
        )}
      </span>
      {size && <span className="zn-plist__size">{size}</span>}
    </div>
  );
}

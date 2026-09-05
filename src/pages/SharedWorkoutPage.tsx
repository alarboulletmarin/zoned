import { useMemo, type CSSProperties } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { ZoneBar, toZoneBarBlocks } from "@/components/visualization/ZoneBar";
import { ZoneScale } from "@/components/visualization/ZoneScale";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import {
  decodeSharedWorkout,
  sharedWorkoutToTemplate,
} from "@/lib/share/workoutShare";
import {
  getStructuredWorkoutDurationMinutes,
  getWorkoutPhaseSteps,
  summarizeWorkoutSteps,
} from "@/lib/workoutStructure";
import { saveCustomWorkout } from "@/lib/customWorkoutStorage";
import { useIsEnglish } from "@/lib/i18n-utils";
import type { WorkoutPhaseKey } from "@/types";

const PHASES: { key: WorkoutPhaseKey; labelKey: string }[] = [
  { key: "warmup", labelKey: "workoutBuilder.warmup" },
  { key: "main", labelKey: "workoutBuilder.mainSet" },
  { key: "cooldown", labelKey: "workoutBuilder.cooldown" },
];

/**
 * A session that arrived by link.
 *
 * Everything on this screen is decoded from the URL — there is no storage
 * lookup and no id to resolve — so a truncated link is the one failure mode,
 * and it gets an Alert with the way out rather than a bare sentence.
 */
export function SharedWorkoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["calculators", "session", "common"]);
  const isEnglish = useIsEnglish();

  const encoded = searchParams.get("d");
  const workout = useMemo(() => {
    const payload = encoded ? decodeSharedWorkout(encoded) : null;
    return payload ? sharedWorkoutToTemplate(payload) : null;
  }, [encoded]);

  if (!workout) {
    return (
      <>
        <SEOHead
          noindex
          title={t("calculators:workoutBuilder.shared.title")}
          canonical="/workout/shared"
        />
        <div className="zn-session__missing">
          <Alert
            kind="error"
            title={t("calculators:workoutBuilder.shared.invalidTitle")}
            action={
              <Button variant="outline" asChild>
                <Link to="/workout/builder">
                  <ArrowLeft />
                  {t("calculators:workoutBuilder.myWorkouts")}
                </Link>
              </Button>
            }
          >
            {t("calculators:workoutBuilder.shared.invalid")}
          </Alert>
        </div>
      </>
    );
  }

  const totalMin = getStructuredWorkoutDurationMinutes(workout);
  const phases = PHASES.map(({ key, labelKey }) => ({
    key,
    label: t(`calculators:${labelKey}`),
    steps: getWorkoutPhaseSteps(workout, key),
  })).filter((phase) => phase.steps.length > 0);
  const blockCount = phases.reduce((sum, phase) => sum + phase.steps.length, 0);

  const handleAdd = () => {
    try {
      saveCustomWorkout(workout);
    } catch {
      toast.error(t("calculators:workoutBuilder.maxReached"));
      return;
    }
    toast.success(t("calculators:workoutBuilder.workoutSaved"));
    navigate(`/workout/builder/${workout.id}`);
  };

  return (
    <>
      <SEOHead noindex title={workout.name} canonical="/workout/shared" />

      <div className="zn-shared">
        <header className="zn-shared__head">
          <div
            className="zn-cluster"
            style={{ "--gap": "var(--sp-5)" } as CSSProperties}
          >
            <Badge variant="outline">{formatDurationMinutes(totalMin)}</Badge>
            <Badge variant="secondary">
              {blockCount} {t("calculators:workoutBuilder.blocks")}
            </Badge>
          </div>

          <h1 className="zn-display" data-level="2">
            {workout.name}
          </h1>

          <p className="zn-body zn-body--lead zn-session__lede">
            {t("calculators:workoutBuilder.shared.subtitle")}
          </p>

          <div
            className="zn-cluster zn-shared__call"
            style={{ "--gap": "var(--sp-6)" } as CSSProperties}
          >
            <Button size="lg" onClick={handleAdd}>
              {t("calculators:workoutBuilder.shared.add")}
            </Button>
          </div>
        </header>

        {/* The profile, then the legend that names the ramp it is drawn in. */}
        <section
          className="zn-stack"
          style={{ "--gap": "var(--sp-12)" } as CSSProperties}
          aria-labelledby="shared-profile"
        >
          <h2 id="shared-profile" className="zn-title" data-level="3">
            {t("calculators:workoutBuilder.preview")}
          </h2>
          <div>
            <ZoneBar
              blocks={toZoneBarBlocks(workout)}
              height={112}
              className="zn-session__profile"
            />
            <div className="zn-session__axis">
              <span className="zn-kicker zn-kicker--inline">
                {t("session:screen.axisStart")}
              </span>
              <span className="zn-kicker zn-kicker--inline">
                {t("session:screen.axisEnd", {
                  duration: formatDurationMinutes(totalMin),
                })}
              </span>
            </div>
          </div>
          <ZoneScale />
        </section>

        <section
          className="zn-stack"
          style={{ "--gap": "var(--sp-8)" } as CSSProperties}
          aria-labelledby="shared-phases"
        >
          <h2 id="shared-phases" className="zn-title" data-level="3">
            {t("session:screen.structureTitle")}
          </h2>
          <div>
            {phases.map((phase) => (
              <div key={phase.key} className="zn-shared__phase">
                <span className="zn-kicker zn-kicker--inline">
                  {phase.label}
                </span>
                <p className="zn-body zn-body--sm">
                  {summarizeWorkoutSteps(phase.steps, isEnglish)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Thumb-zone call on a phone. */}
      <div className="zn-shared__dock">
        <Button size="lg" onClick={handleAdd}>
          {t("calculators:workoutBuilder.shared.add")}
        </Button>
      </div>
    </>
  );
}

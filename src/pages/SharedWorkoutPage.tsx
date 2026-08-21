import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, Clock, Share } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { FadeUp } from "@/components/editorial";
import { SessionTimeline } from "@/components/visualization/SessionTimeline";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { decodeSharedWorkout, sharedWorkoutToTemplate } from "@/lib/share/workoutShare";
import {
  getStructuredWorkoutDurationMinutes,
  getWorkoutPhaseSteps,
  summarizeWorkoutSteps,
} from "@/lib/workoutStructure";
import { saveCustomWorkout } from "@/lib/customWorkoutStorage";
import { useIsEnglish } from "@/lib/i18n-utils";
import type { WorkoutPhaseKey } from "@/types";

const PHASES: { key: WorkoutPhaseKey; labelKey: string; color: string }[] = [
  { key: "warmup", labelKey: "calculators:workoutBuilder.warmup", color: "text-zone-2" },
  { key: "main", labelKey: "calculators:workoutBuilder.mainSet", color: "text-zone-5" },
  { key: "cooldown", labelKey: "calculators:workoutBuilder.cooldown", color: "text-zone-1" },
];

export function SharedWorkoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation("calculators");
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
          title={t("workoutBuilder.shared.title")}
          canonical="/workout/shared"
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t("workoutBuilder.shared.invalid")}</p>
          <Button variant="link" asChild className="mt-4">
            <Link to="/workout/builder">
              <ArrowLeft className="mr-2 size-4" />
              {t("workoutBuilder.myWorkouts")}
            </Link>
          </Button>
        </div>
      </>
    );
  }

  const totalMin = getStructuredWorkoutDurationMinutes(workout);
  const blockCount = PHASES.reduce(
    (sum, { key }) => sum + getWorkoutPhaseSteps(workout, key).length,
    0,
  );

  const handleAdd = () => {
    try {
      saveCustomWorkout(workout);
    } catch {
      toast.error(t("workoutBuilder.maxReached"));
      return;
    }
    toast.success(t("workoutBuilder.workoutSaved"));
    navigate(`/workout/builder/${workout.id}`);
  };

  return (
    <>
      <SEOHead noindex title={workout.name} canonical="/workout/shared" />
      <div className="py-8 max-w-3xl mx-auto space-y-6 pb-28 lg:pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Share className="size-5 text-muted-foreground shrink-0" />
              <h1 className="font-sans font-bold uppercase text-3xl md:text-5xl leading-[0.9] tracking-[-0.04em]">
                {workout.name}
              </h1>
            </div>
            <FadeUp as="p" delay={0.1} className="text-muted-foreground max-w-2xl">
              {t("workoutBuilder.shared.subtitle")}
            </FadeUp>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="size-3" />
                {formatDurationMinutes(totalMin)}
              </Badge>
              <Badge variant="secondary">
                {blockCount} {t("workoutBuilder.blocks")}
              </Badge>
            </div>
          </div>

          {/* CTA top (desktop) */}
          <Button size="lg" onClick={handleAdd} className="shrink-0 hidden lg:inline-flex">
            {t("workoutBuilder.shared.add")}
          </Button>
        </div>

        {/* Preview — same timeline the builder shows while editing. */}
        <div className="border-2 border-foreground bg-background p-5">
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
            {t("workoutBuilder.preview")}
          </p>
          <div className="mt-3">
            <SessionTimeline workout={workout} />
          </div>
        </div>

        {/* Phase breakdown */}
        <div className="space-y-3">
          {PHASES.map(({ key, labelKey, color }) => {
            const steps = getWorkoutPhaseSteps(workout, key);
            if (steps.length === 0) return null;

            return (
              <Card key={key} size="flush">
                <CardContent className="p-3 sm:p-4 space-y-1">
                  <h2 className={`text-sm font-semibold ${color}`}>{t(labelKey)}</h2>
                  <p className="text-sm text-muted-foreground">
                    {summarizeWorkoutSteps(steps, isEnglish)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Mobile sticky CTA (thumb zone). */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Button className="w-full" size="lg" onClick={handleAdd}>
          {t("workoutBuilder.shared.add")}
        </Button>
      </div>
    </>
  );
}

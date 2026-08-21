/**
 * ExportableWorkoutCard - Complete workout card for PNG export
 *
 * Renders a self-contained card with all workout info:
 * - Name, description, duration, difficulty
 * - Timeline visualization
 * - Zone distribution
 * - Blocks summary
 */

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Target, Zap } from "@/components/icons";
import { DifficultyIcon } from "./DifficultyIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZoneBadge } from "./ZoneBadge";
import { SessionTimeline, ZoneDistribution } from "@/components/visualization";
import type { WorkoutTemplate } from "@/types";
import { getDominantZone } from "@/types";
import { getWorkoutDuration } from "@/components/visualization";
import { usePickLang } from "@/lib/i18n-utils";

interface ExportableWorkoutCardProps {
  workout: WorkoutTemplate;
}

export const ExportableWorkoutCard = forwardRef<
  HTMLDivElement,
  ExportableWorkoutCardProps
>(function ExportableWorkoutCard({ workout }, ref) {
  const { t } = useTranslation(["session", "library", "common"]);
  const pickLang = usePickLang();

  const dominantZone = getDominantZone(workout);
  const duration = getWorkoutDuration(workout);

  // Count blocks
  const warmupBlocks = workout.warmupTemplate?.length || 0;
  const mainBlocks = workout.mainSetTemplate.length;
  const cooldownBlocks = workout.cooldownTemplate?.length || 0;

  return (
    <div
      ref={ref}
      className="bg-paper text-ink border-2 border-ink p-6 w-[800px]"
      // `ink` and `paper` are theme constants, so the exported image stays the
      // same poster whether the app is in light or dark mode.
      style={{ fontFamily: '"General Sans", system-ui, -apple-system, sans-serif' }}
    >
      {/* Header */}
      <div className={`zone-${dominantZone} mb-6`}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-ink mb-1">
              {pickLang(workout, "name")}
            </h1>
            <p className="text-sm text-ink/70 line-clamp-2">
              {pickLang(workout, "description")}
            </p>
          </div>
          <ZoneBadge zone={dominantZone} size="lg" showLabel />
        </div>

        {/* Quick Info Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1.5 border-ink text-ink">
            <Clock className="size-3" />
            {duration} {t("common:units.minutes")}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 border-ink text-ink">
            <DifficultyIcon difficulty={workout.difficulty} className="size-3" />
            {t(`library:difficulty.${workout.difficulty}`)}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 border-ink text-ink">
            <Target className="size-3" />
            {t(`targetSystems.${workout.targetSystem}`)}
          </Badge>
          <Badge variant="default" className="gap-1.5 bg-ink text-paper">
            <Zap className="size-3" />
            {warmupBlocks + mainBlocks + cooldownBlocks} blocs
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Timeline - Takes 2 columns */}
        <Card className="col-span-2 bg-paper text-ink border-ink">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink">
              {t("titles.sessionTimeline")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SessionTimeline workout={workout} />
          </CardContent>
        </Card>

        {/* Zone Distribution */}
        <Card className="bg-paper text-ink border-ink">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink">
              {t("titles.zoneDistribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ZoneDistribution workout={workout} />
          </CardContent>
        </Card>
      </div>

      {/* Blocks Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
        {workout.warmupTemplate && workout.warmupTemplate.length > 0 && (
          <div className="border-2 border-ink bg-paper rounded-none p-3">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink mb-1">
              {t("session:structure.warmup")}
            </h4>
            <ul className="space-y-0.5 text-ink/80">
              {workout.warmupTemplate.slice(0, 3).map((block, i) => (
                <li key={i} className="truncate">
                  • {pickLang(block, "description")}
                </li>
              ))}
              {workout.warmupTemplate.length > 3 && (
                <li className="font-mono text-ink/60">+{workout.warmupTemplate.length - 3} autres</li>
              )}
            </ul>
          </div>
        )}
        <div className="border-2 border-ink bg-paper rounded-none p-3">
          <h4 className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink mb-1">
            {t("session:structure.main")}
          </h4>
          <ul className="space-y-0.5 text-ink/80">
            {workout.mainSetTemplate.slice(0, 3).map((block, i) => (
              <li key={i} className="truncate">
                • {pickLang(block, "description")}
              </li>
            ))}
            {workout.mainSetTemplate.length > 3 && (
              <li className="font-mono text-ink/60">+{workout.mainSetTemplate.length - 3} autres</li>
            )}
          </ul>
        </div>
        {workout.cooldownTemplate && workout.cooldownTemplate.length > 0 && (
          <div className="border-2 border-ink bg-paper rounded-none p-3">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink mb-1">
              {t("session:structure.cooldown")}
            </h4>
            <ul className="space-y-0.5 text-ink/80">
              {workout.cooldownTemplate.slice(0, 3).map((block, i) => (
                <li key={i} className="truncate">
                  • {pickLang(block, "description")}
                </li>
              ))}
              {workout.cooldownTemplate.length > 3 && (
                <li className="font-mono text-ink/60">+{workout.cooldownTemplate.length - 3} autres</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t-2 border-ink flex justify-between items-center font-mono text-[11px] uppercase tracking-wide text-ink/60">
        <span>zoned.run</span>
        <span>{workout.id}</span>
      </div>
    </div>
  );
});

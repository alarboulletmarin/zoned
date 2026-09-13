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

  const phases = [
    { key: "warmup" as const, blocks: workout.warmupTemplate },
    { key: "main" as const, blocks: workout.mainSetTemplate },
    { key: "cooldown" as const, blocks: workout.cooldownTemplate },
  ].filter((phase) => phase.blocks != null && phase.blocks.length > 0);

  return (
    <div ref={ref} className="zn-export">
      {/* Header */}
      <div className="zn-export__head">
        <div className="zn-export__title-row">
          <div className="zn-export__titles">
            <h1 className="zn-export__title">{pickLang(workout, "name")}</h1>
            <p className="zn-export__desc">{pickLang(workout, "description")}</p>
          </div>
          <ZoneBadge zone={dominantZone} size="lg" showLabel />
        </div>

        {/* Quick Info Badges */}
        <div className="zn-export__facts">
          <Badge variant="secondary">
            <Clock />
            {duration} {t("common:units.minutes")}
          </Badge>
          <Badge variant="secondary">
            <DifficultyIcon difficulty={workout.difficulty} />
            {t(`library:difficulty.${workout.difficulty}`)}
          </Badge>
          <Badge variant="secondary">
            <Target />
            {t(`targetSystems.${workout.targetSystem}`)}
          </Badge>
          <Badge variant="outline">
            <Zap />
            {t("session:export.blockCount", {
              count: warmupBlocks + mainBlocks + cooldownBlocks,
            })}
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="zn-export__cols">
        {/* Timeline - Takes 2 columns */}
        <Card>
          <CardHeader>
            <CardTitle>{t("titles.sessionTimeline")}</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionTimeline workout={workout} />
          </CardContent>
        </Card>

        {/* Zone Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t("titles.zoneDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ZoneDistribution workout={workout} />
          </CardContent>
        </Card>
      </div>

      {/* Blocks Summary */}
      <div className="zn-export__phases">
        {phases.map((phase) => (
          <div key={phase.key} className="zn-export__phase">
            <h4 className="zn-export__phase-title">
              {t(`session:structure.${phase.key}`)}
            </h4>
            <ul className="zn-export__phase-list">
              {phase.blocks!.slice(0, 3).map((block, i) => (
                <li key={i} className="zn-export__phase-item">
                  {pickLang(block, "description")}
                </li>
              ))}
              {phase.blocks!.length > 3 && (
                <li className="zn-export__more">
                  {t("session:export.andMore", { count: phase.blocks!.length - 3 })}
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="zn-export__foot">
        <span>zoned.run</span>
        <span className="zn-export__code">{workout.id}</span>
      </div>
    </div>
  );
});

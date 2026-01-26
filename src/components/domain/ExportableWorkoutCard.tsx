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
import { Clock, Dumbbell, Target, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZoneBadge } from "./ZoneBadge";
import { SessionTimeline, ZoneDistribution } from "@/components/visualization";
import type { WorkoutTemplate } from "@/types";
import { getDominantZone, getEstimatedDuration } from "@/types";

interface ExportableWorkoutCardProps {
  workout: WorkoutTemplate;
}

export const ExportableWorkoutCard = forwardRef<
  HTMLDivElement,
  ExportableWorkoutCardProps
>(function ExportableWorkoutCard({ workout }, ref) {
  const { t, i18n } = useTranslation(["session", "library", "common"]);
  const isEn = i18n.language === "en";

  const dominantZone = getDominantZone(workout);
  const duration = getEstimatedDuration(workout);

  // Count blocks
  const warmupBlocks = workout.warmupTemplate?.length || 0;
  const mainBlocks = workout.mainSetTemplate.length;
  const cooldownBlocks = workout.cooldownTemplate?.length || 0;

  return (
    <div
      ref={ref}
      className="bg-white p-6 w-[800px]"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Header */}
      <div className={`zone-${dominantZone} zone-stripe pl-3 mb-6`}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isEn ? workout.nameEn : workout.name}
            </h1>
            <p className="text-sm text-gray-600 line-clamp-2">
              {isEn ? workout.descriptionEn : workout.description}
            </p>
          </div>
          <ZoneBadge zone={dominantZone} size="lg" showLabel />
        </div>

        {/* Quick Info Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Clock className="size-3" />
            {duration} {t("common:units.minutes")}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Dumbbell className="size-3" />
            {t(`library:difficulty.${workout.difficulty}`)}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Target className="size-3" />
            {t(`targetSystems.${workout.targetSystem}`)}
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Zap className="size-3" />
            {warmupBlocks + mainBlocks + cooldownBlocks} blocs
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Timeline - Takes 2 columns */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("titles.sessionTimeline")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SessionTimeline workout={workout} />
          </CardContent>
        </Card>

        {/* Zone Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
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
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-700 mb-1">
              {t("session:structure.warmup")}
            </h4>
            <ul className="space-y-0.5 text-gray-600">
              {workout.warmupTemplate.slice(0, 3).map((block, i) => (
                <li key={i} className="truncate">
                  • {isEn && block.descriptionEn ? block.descriptionEn : block.description}
                </li>
              ))}
              {workout.warmupTemplate.length > 3 && (
                <li className="text-gray-400">+{workout.warmupTemplate.length - 3} autres</li>
              )}
            </ul>
          </div>
        )}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-medium text-gray-700 mb-1">
            {t("session:structure.main")}
          </h4>
          <ul className="space-y-0.5 text-gray-600">
            {workout.mainSetTemplate.slice(0, 3).map((block, i) => (
              <li key={i} className="truncate">
                • {isEn && block.descriptionEn ? block.descriptionEn : block.description}
              </li>
            ))}
            {workout.mainSetTemplate.length > 3 && (
              <li className="text-gray-400">+{workout.mainSetTemplate.length - 3} autres</li>
            )}
          </ul>
        </div>
        {workout.cooldownTemplate && workout.cooldownTemplate.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-700 mb-1">
              {t("session:structure.cooldown")}
            </h4>
            <ul className="space-y-0.5 text-gray-600">
              {workout.cooldownTemplate.slice(0, 3).map((block, i) => (
                <li key={i} className="truncate">
                  • {isEn && block.descriptionEn ? block.descriptionEn : block.description}
                </li>
              ))}
              {workout.cooldownTemplate.length > 3 && (
                <li className="text-gray-400">+{workout.cooldownTemplate.length - 3} autres</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400">
        <span>zoned.run</span>
        <span>{workout.id}</span>
      </div>
    </div>
  );
});

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutStructure } from "@/components/domain/WorkoutStructure";
import { SessionTimeline } from "@/components/visualization/SessionTimeline";
import { ZoneDistribution } from "@/components/visualization/ZoneDistribution";
import { Eye } from "@/components/icons";
import type { WorkoutTemplate } from "@/types";

interface WorkoutPreviewProps {
  data: Partial<WorkoutTemplate>;
}

function buildPreviewTemplate(data: Partial<WorkoutTemplate>): WorkoutTemplate {
  return {
    id: "preview",
    name: data.name || "...",
    nameEn: data.nameEn || "",
    description: data.description || "",
    descriptionEn: data.descriptionEn || "",
    category: data.category || "endurance",
    sessionType: data.sessionType || "endurance",
    targetSystem: data.targetSystem || "aerobic_base",
    difficulty: data.difficulty || "intermediate",
    typicalDuration: data.typicalDuration || { min: 30, max: 60 },
    environment: data.environment || {
      requiresHills: false,
      requiresTrack: false,
    },
    warmupTemplate: data.warmupTemplate || [],
    mainSetTemplate: data.mainSetTemplate || [],
    cooldownTemplate: data.cooldownTemplate || [],
    warmupStructure: data.warmupStructure || [],
    mainSetStructure: data.mainSetStructure || [],
    cooldownStructure: data.cooldownStructure || [],
    coachingTips: data.coachingTips || [],
    coachingTipsEn: data.coachingTipsEn || [],
    commonMistakes: data.commonMistakes || [],
    commonMistakesEn: data.commonMistakesEn || [],
    variationIds: [],
    selectionCriteria: {
      phases: ["base"],
      weekPositions: ["mid"],
      relativeLoad: "moderate",
      tags: [],
      priorityScore: 5,
    },
  };
}

export function WorkoutPreview({ data }: WorkoutPreviewProps) {
  const { t } = useTranslation("contribute");

  const template = useMemo(() => buildPreviewTemplate(data), [data]);

  const hasBlocks =
    template.warmupTemplate.length > 0 ||
    template.mainSetTemplate.length > 0 ||
    template.cooldownTemplate.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="size-4" />
          {t("preview.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasBlocks ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("preview.emptyState")}
            </p>
          </div>
        ) : (
          <>
            {/* Timeline visualization */}
            <SessionTimeline workout={template} />

            {/* Block structure */}
            <WorkoutStructure workout={template} />

            {/* Zone distribution */}
            <ZoneDistribution workout={template} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

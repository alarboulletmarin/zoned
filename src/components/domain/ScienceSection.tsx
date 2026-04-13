import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZoneBadge } from "@/components/domain";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { FlaskConical, Brain, Sparkles, BookOpen } from "@/components/icons";
import { TARGET_SYSTEM_SCIENCE } from "@/data/science";
import type { TargetSystemScience, ScientificReference } from "@/data/science";
import { ZONE_META } from "@/types";
import type { WorkoutTemplate, ZoneNumber } from "@/types";
import { usePickLang, usePickLangArray } from "@/lib/i18n-utils";
import { getWorkoutZoneNumbers } from "@/lib/workoutStructure";

interface ScienceSectionProps {
  workout: WorkoutTemplate;
}

function getWorkoutZones(workout: WorkoutTemplate): ZoneNumber[] {
  return getWorkoutZoneNumbers(workout);
}

export function ScienceSection({ workout }: ScienceSectionProps) {
  const { t } = useTranslation("session");
  const pick = usePickLang();
  const pickLangArray = usePickLangArray();

  const science: TargetSystemScience | undefined =
    TARGET_SYSTEM_SCIENCE[workout.targetSystem];
  if (!science) return null;

  const workoutZones = getWorkoutZones(workout);

  // Filter zone rationale to matching workout zones, or show all if none match
  const filteredZoneRationale = workoutZones.length > 0
    ? science.zoneRationale.filter((zr) => workoutZones.includes(zr.zone))
    : science.zoneRationale;

  // If filtering produced no results, fall back to showing all
  const displayedZoneRationale =
    filteredZoneRationale.length > 0 ? filteredZoneRationale : science.zoneRationale;

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FlaskConical className="size-5" />
          {t("titles.scienceMode")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rationale */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FlaskConical className="size-4 text-muted-foreground" />
              {t("science.rationale")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <GlossaryLinkedText
                text={pick(science, "rationale")}
              />
            </p>
          </div>

          {/* Zones solicited */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Brain className="size-4 text-muted-foreground" />
              {t("science.zonesSolicited")}
            </h3>
            <div className="space-y-2">
              {displayedZoneRationale.map((zr) => (
                <div key={zr.zone} className="flex items-start gap-3">
                  <ZoneBadge zone={zr.zone} size="sm" />
                  <div>
                    <span className="text-xs font-medium">
                      {pick(ZONE_META[zr.zone], "label")}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {pick(zr, "why")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adaptations */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" />
              {t("science.adaptations")}
            </h3>
            <ul className="space-y-1 ml-6">
              {pickLangArray<string>(science, "adaptations").map(
                (adaptation: string, i: number) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground list-disc"
                  >
                    <GlossaryLinkedText text={adaptation} />
                  </li>
                )
              )}
            </ul>
          </div>

          {/* References */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              {t("science.references")}
            </h3>
            <ul className="space-y-1.5">
              {science.references.map((ref: ScientificReference, i: number) => (
                <li key={i} className="text-xs text-muted-foreground">
                  <span className="font-medium">{ref.authors}</span> (
                  {ref.year}).{" "}
                  <span className="italic">{ref.title}</span>.{" "}
                  {ref.journal}.
                  {ref.link && (
                    <a
                      href={ref.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-primary hover:underline"
                    >
                      {t("science.viewStudy")} →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
    </Card>
  );
}

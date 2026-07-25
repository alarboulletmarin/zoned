import { useTranslation } from "react-i18next";
import { ZoneBadge } from "@/components/domain";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { FlaskConical, Brain, Sparkles, BookOpen, ChevronDown } from "@/components/icons";
import { TARGET_SYSTEM_SCIENCE } from "@/data/science";
import type { TargetSystemScience, ScientificReference } from "@/data/science";
import { getWorkoutDiscipline, ZONE_META } from "@/types";
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

  // No card, no title: the enclosing Section already owns both. This used to
  // print "Pourquoi ça marche" a second time right under its own heading.
  return (
    <div className="space-y-6">
        {getWorkoutDiscipline(workout) !== "running" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            {t("science.crossDisciplineNote")}
          </div>
        )}
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

          {/* References — folded away by default. Full APA citations in 11px
              grey are a wall of text; the count plus author and year is what
              a reader scans, and the full record is one tap away. */}
          {science.references.length > 0 && (
            <details className="group border-t border-border/60 pt-3">
              <summary className="flex items-center gap-2 min-h-11 cursor-pointer list-none text-sm font-semibold rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <BookOpen className="size-4 text-muted-foreground shrink-0" />
                <span>
                  {t("science.referencesCount", { count: science.references.length })}
                </span>
                <ChevronDown className="size-4 text-foreground/40 transition-transform group-open:rotate-180 shrink-0" />
              </summary>
              <ul className="space-y-2 mt-2">
                {science.references.map((ref: ScientificReference, i: number) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{ref.authors}</span>{" "}
                    <span className="text-muted-foreground tabular-nums">({ref.year})</span>
                    {ref.link && (
                      <a
                        href={ref.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:underline"
                      >
                        {t("science.viewStudy")} →
                      </a>
                    )}
                    <span className="block text-xs text-muted-foreground italic mt-0.5">
                      {ref.title}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
    </div>
  );
}

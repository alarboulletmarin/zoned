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

const HEAD_GAP = { "--gap": "var(--sp-4)" } as React.CSSProperties;
const GROUP_GAP = { "--gap": "var(--sp-6)" } as React.CSSProperties;

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
    <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as React.CSSProperties}>
      {getWorkoutDiscipline(workout) !== "running" && (
        <p className="zn-science__note">{t("science.crossDisciplineNote")}</p>
      )}

      {/* Rationale */}
      <div className="zn-stack" style={GROUP_GAP}>
        <h3 className="zn-row zn-kicker" style={HEAD_GAP}>
          <FlaskConical className="zn-science__glyph" />
          {t("science.rationale")}
        </h3>
        <p className="zn-body zn-body--sm zn-muted">
          <GlossaryLinkedText text={pick(science, "rationale")} />
        </p>
      </div>

      {/* Zones solicited */}
      <div className="zn-stack" style={GROUP_GAP}>
        <h3 className="zn-row zn-kicker" style={HEAD_GAP}>
          <Brain className="zn-science__glyph" />
          {t("science.zonesSolicited")}
        </h3>
        <div className="zn-stack">
          {displayedZoneRationale.map((zr) => (
            <div key={zr.zone} className="zn-row zn-row--start" style={GROUP_GAP}>
              <ZoneBadge zone={zr.zone} size="sm" />
              <div className="zn-fill">
                <span className="zn-science__zone-name">
                  {pick(ZONE_META[zr.zone], "label")}
                </span>
                <p className="zn-caption zn-muted">{pick(zr, "why")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adaptations */}
      <div className="zn-stack" style={GROUP_GAP}>
        <h3 className="zn-row zn-kicker" style={HEAD_GAP}>
          <Sparkles className="zn-science__glyph" />
          {t("science.adaptations")}
        </h3>
        <ul className="zn-science__list">
          {pickLangArray<string>(science, "adaptations").map(
            (adaptation: string, i: number) => (
              <li key={i}>
                <GlossaryLinkedText text={adaptation} />
              </li>
            )
          )}
        </ul>
      </div>

      {/* References, folded away by default. Full APA citations in 11px
          grey are a wall of text; the count plus author and year is what
          a reader scans, and the full record is one tap away. */}
      {science.references.length > 0 && (
        <details className="zn-science__refs">
          <summary className="zn-science__summary">
            <BookOpen className="zn-science__glyph" />
            <span className="zn-fill">
              {t("science.referencesCount", { count: science.references.length })}
            </span>
            <ChevronDown className="zn-science__chevron" />
          </summary>
          <ul className="zn-stack zn-science__reflist" style={GROUP_GAP}>
            {science.references.map((ref: ScientificReference, i: number) => (
              <li key={i} className="zn-science__ref">
                <span className="zn-science__ref-authors">{ref.authors}</span>{" "}
                <span className="zn-science__ref-year">({ref.year})</span>{" "}
                {ref.link && (
                  <a
                    href={ref.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="zn-clink"
                    data-size="sm"
                  >
                    {t("science.viewStudy")} →
                  </a>
                )}
                <span className="zn-science__ref-title">{ref.title}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

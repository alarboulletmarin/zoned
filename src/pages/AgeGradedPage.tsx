import { useState, useMemo, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { StatBlock } from "@/components/domain/StatBlock";
import { buildParamsUrl } from "@/lib/share/urlParams";
import { Card, CardContent } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEOHead } from "@/components/seo";
import { useSettings } from "@/hooks/useSettings";
import { formatPaceWithUnit } from "@/lib/units";
import { usePickLang } from "@/lib/i18n-utils";

// Open-class world records in seconds
const WORLD_RECORDS = {
  male: {
    5: 757, // 12:37 (Joshua Cheptegei)
    10: 1577, // 26:17 (Joshua Cheptegei)
    21.1: 3456, // 57:36 (Jacob Kiplimo)
    42.195: 7260, // 2:01:00 (Kelvin Kiptum)
  },
  female: {
    5: 852, // 14:12 (Beatrice Chebet)
    10: 1752, // 29:12 (Beatrice Chebet)
    21.1: 3756, // 1:02:36 (Ruth Chepngetich)
    42.195: 7632, // 2:07:12 (Ruth Chepngetich)
  },
} as const;

type Gender = "male" | "female";
type DistanceKey = keyof typeof WORLD_RECORDS.male;

const DISTANCES: { id: DistanceKey; label: string; labelEn: string }[] = [
  { id: 5, label: "5 km", labelEn: "5K" },
  { id: 10, label: "10 km", labelEn: "10K" },
  { id: 21.1, label: "Semi-marathon", labelEn: "Half Marathon" },
  { id: 42.195, label: "Marathon", labelEn: "Marathon" },
];

function getAgeFactor(age: number): number {
  if (age >= 25 && age <= 34) return 1.0;
  if (age < 25) {
    // Young runners: slight penalty
    return 1.0 - (25 - age) * 0.005;
  }
  // Masters: progressive decline
  if (age <= 50) return 1.0 - (age - 34) * 0.005;
  if (age <= 60) return 1.0 - (50 - 34) * 0.005 - (age - 50) * 0.008;
  return 1.0 - (50 - 34) * 0.005 - (60 - 50) * 0.008 - (age - 60) * 0.012;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * The five bands of the age-graded scale, in the user's words.
 *
 * They used to be painted with the zone ramp (`text-zone-2` … `text-zone-6`),
 * which said "this is a training zone" about something that is not one. The
 * band is now the figure's footnote, in plain type: the score itself is the
 * number that carries the meaning.
 */
function getPerformanceLevel(
  percentage: number,
  t: (key: string) => string,
): string {
  if (percentage >= 90) return t("calculators:calculateurs.ageGraded.levelWorldClass");
  if (percentage >= 80) return t("calculators:calculateurs.ageGraded.levelNational");
  if (percentage >= 70) return t("calculators:calculateurs.ageGraded.levelRegional");
  if (percentage >= 60) return t("calculators:calculateurs.ageGraded.levelLocal");
  return t("calculators:calculateurs.ageGraded.levelRecreational");
}

export function AgeGradedPage() {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  const [searchParams] = useSearchParams();
  const [age, setAge] = useState<string>(() => searchParams.get("age") ?? "");
  const [gender, setGender] = useState<Gender>(() =>
    searchParams.get("g") === "female" ? "female" : "male",
  );
  const [distanceKey, setDistanceKey] = useState<DistanceKey>(() => {
    const shared = Number(searchParams.get("d"));
    return DISTANCES.some((d) => d.id === shared) ? (shared as DistanceKey) : 10;
  });
  const [hours, setHours] = useState<string>(() => searchParams.get("h") ?? "");
  const [minutes, setMinutes] = useState<string>(() => searchParams.get("m") ?? "");
  const [seconds, setSeconds] = useState<string>(() => searchParams.get("s") ?? "");

  // Parse inputs
  const parsedAge = age !== "" ? parseInt(age, 10) : 0;
  const parsedHours = hours !== "" ? parseInt(hours, 10) : 0;
  const parsedMinutes = minutes !== "" ? parseInt(minutes, 10) : 0;
  const parsedSeconds = seconds !== "" ? parseInt(seconds, 10) : 0;
  const totalTimeSeconds =
    parsedHours * 3600 + parsedMinutes * 60 + parsedSeconds;

  const hasValidInputs =
    parsedAge >= 15 && parsedAge <= 99 && totalTimeSeconds > 0;

  // Calculate age-graded result
  const result = useMemo(() => {
    if (!hasValidInputs) return null;

    const worldRecord = WORLD_RECORDS[gender][distanceKey];
    const ageFactor = getAgeFactor(parsedAge);
    const ageGradedRecord = worldRecord / ageFactor;
    const ageGradedPercentage = (ageGradedRecord / totalTimeSeconds) * 100;

    // Sanity: percentage should be between 1% and 120%
    if (
      !Number.isFinite(ageGradedPercentage) ||
      ageGradedPercentage < 1 ||
      ageGradedPercentage > 120
    )
      return null;

    // Calculate pace (min/km)
    const paceMinPerKm = totalTimeSeconds / 60 / distanceKey;

    return {
      percentage: Math.round(ageGradedPercentage * 10) / 10,
      worldRecord,
      ageGradedRecord,
      paceMinPerKm,
    };
  }, [hasValidInputs, gender, distanceKey, parsedAge, totalTimeSeconds]);

  // Clamp numeric input within range
  const handleNumericInput = (
    value: string,
    setter: (v: string) => void,
    max: number,
  ) => {
    if (value === "") {
      setter("");
      return;
    }
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 0) return;
    if (num > max) {
      setter(String(max));
      return;
    }
    setter(String(num));
  };

  const performanceLevel = result ? getPerformanceLevel(result.percentage, t) : null;

  return (
    <>
      <SEOHead
        title={t("calculators:calculateurs.ageGraded.seoTitle")}
        description={t("calculators:calculateurs.ageGraded.seoDescription")}
        canonical="/calculators/age-graded"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculators:calculateurs.ageGraded.seoAppName"),
            description: t("calculators:calculateurs.ageGraded.seoAppDescription"),
            url: "https://zoned.run/calculators/age-graded",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculators:calculateurs.ageGraded.seoBreadcrumb") },
            ],
          },
        ]}
      />

      <div className="zn-num">
        <section
          className="zn-num__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("calculators:calculateurs.ageGraded.kicker")}
          </span>
          <h1 className="zn-display" data-level="3">
            {t("calculators:calculateurs.ageGraded.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-num__lede">
            {t("calculators:calculateurs.ageGraded.description")}
          </p>
        </section>

        <section className="zn-num__panel zn-stack zn-tool">
          {/* Who you are and what you ran. */}
          <Card>
            <CardContent
              className="zn-stack"
              style={{ "--gap": "var(--sp-12)" } as CSSProperties}
            >
              <div className="zn-calc__field">
                <label htmlFor="age" className="zn-calc__label">
                  {t("calculators:calculateurs.ageGraded.age")}
                </label>
                <span className="zn-numfield" style={{ "--field-w": "48px" } as CSSProperties}>
                  <input
                    id="age"
                    type="number"
                    min={15}
                    max={99}
                    placeholder="35"
                    value={age}
                    onChange={(e) => handleNumericInput(e.target.value, setAge, 99)}
                    className="zn-numfield__input"
                    aria-label={t("calculators:calculateurs.ageGraded.age")}
                  />
                  <span className="zn-numfield__unit">
                    {t("calculators:calculateurs.ageGraded.yearsShort")}
                  </span>
                </span>
              </div>

              <div className="zn-calc__field">
                <span className="zn-calc__label">
                  {t("calculators:calculateurs.ageGraded.gender")}
                </span>
                <Segmented
                  value={gender}
                  onChange={setGender}
                  label={t("calculators:calculateurs.ageGraded.gender")}
                  options={[
                    { value: "male", label: t("calculators:calculateurs.ageGraded.male") },
                    { value: "female", label: t("calculators:calculateurs.ageGraded.female") },
                  ]}
                />
              </div>

              <div className="zn-calc__field">
                <label htmlFor="distance" className="zn-calc__label">
                  {t("calculators:calculateurs.ageGraded.distance")}
                </label>
                <Select
                  value={String(distanceKey)}
                  onValueChange={(v) => setDistanceKey(parseFloat(v) as DistanceKey)}
                >
                  <SelectTrigger id="distance" className="zn-tool__wide">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTANCES.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {pickLang(d, "label")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="zn-calc__field">
                <span className="zn-calc__label">
                  {t("calculators:calculateurs.ageGraded.time")}
                </span>
                <div className="zn-num__time">
                  <span className="zn-numfield">
                    <input
                      type="number"
                      min={0}
                      max={9}
                      placeholder="0"
                      value={hours}
                      onChange={(e) => handleNumericInput(e.target.value, setHours, 9)}
                      className="zn-numfield__input"
                      aria-label={t("calculators:calculateurs.ageGraded.hours")}
                    />
                    <span className="zn-numfield__unit">h</span>
                  </span>
                  <span className="zn-numfield">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="00"
                      value={minutes}
                      onChange={(e) => handleNumericInput(e.target.value, setMinutes, 59)}
                      className="zn-numfield__input"
                      aria-label={t("calculators:calculateurs.ageGraded.minutes")}
                    />
                    <span className="zn-numfield__unit">min</span>
                  </span>
                  <span className="zn-numfield">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="00"
                      value={seconds}
                      onChange={(e) => handleNumericInput(e.target.value, setSeconds, 59)}
                      className="zn-numfield__input"
                      aria-label={t("calculators:calculateurs.ageGraded.seconds")}
                    />
                    <span className="zn-numfield__unit">sec</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Where that puts you against the record. */}
          {result && performanceLevel && (
            <div className="zn-stack" style={{ "--gap": "var(--sp-13)" } as CSSProperties}>
              <StatBlock
                tone="ink"
                size="lg"
                value={`${result.percentage.toFixed(1)} %`}
                label={t("calculators:calculateurs.ageGraded.scoreLabel")}
                footnote={performanceLevel}
              />

              <dl className="zn-tool__facts">
                <dt>{t("calculators:calculateurs.ageGraded.openWorldRecord")}</dt>
                <dd>{formatTime(result.worldRecord)}</dd>
                <dt>{t("calculators:calculateurs.ageGraded.ageAdjustedRecord")}</dt>
                <dd>{formatTime(result.ageGradedRecord)}</dd>
                <dt>{t("calculators:calculateurs.ageGraded.yourTime")}</dt>
                <dd>{formatTime(totalTimeSeconds)}</dd>
                <dt>{t("calculators:calculateurs.ageGraded.paceLabel")}</dt>
                <dd>{formatPaceWithUnit(result.paceMinPerKm, unit)}</dd>
              </dl>

              <div className="zn-cluster">
                <ShareLinkButton
                  buildUrl={() =>
                    buildParamsUrl("/calculators/age-graded", {
                      age,
                      g: gender,
                      d: distanceKey,
                      h: hours,
                      m: minutes,
                      s: seconds,
                    })
                  }
                  title={t("calculators:calculateurs.ageGraded.title")}
                />
              </div>

              <p className="zn-body zn-body--sm zn-muted zn-measure">
                {t("calculators:calculateurs.ageGraded.explanation")}
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

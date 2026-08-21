import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { buildParamsUrl } from "@/lib/share/urlParams";
import { SEOHead } from "@/components/seo";
import { useSettings } from "@/hooks/useSettings";
import { formatPaceWithUnit } from "@/lib/units";
import { usePickLang } from "@/lib/i18n-utils";
import {
  CalculatorHero,
  CalculatorPanel,
  CalculatorLabel,
  CalculatorChip,
  CalculatorTimeField,
  CalculatorResultHeadline,
} from "@/components/calculators";

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

function getPerformanceLevel(
  percentage: number,
  t: (key: string) => string,
): { label: string; colorClass: string } {
  if (percentage >= 90)
    return {
      label: t("calculators:calculateurs.ageGraded.levelWorldClass"),
      colorClass: "text-zone-6",
    };
  if (percentage >= 80)
    return {
      label: t("calculators:calculateurs.ageGraded.levelNational"),
      colorClass: "text-zone-5",
    };
  if (percentage >= 70)
    return {
      label: t("calculators:calculateurs.ageGraded.levelRegional"),
      colorClass: "text-zone-4",
    };
  if (percentage >= 60)
    return {
      label: t("calculators:calculateurs.ageGraded.levelLocal"),
      colorClass: "text-zone-3",
    };
  return {
    label: t("calculators:calculateurs.ageGraded.levelRecreational"),
    colorClass: "text-zone-2",
  };
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

  const performanceLevel = result
    ? getPerformanceLevel(result.percentage, t)
    : null;

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
      <div className="py-8 max-w-2xl mx-auto">
        <CalculatorHero
          groupLabel={t("calculators:calculateurs.groups.terrain")}
          title={t("calculators:calculateurs.ageGraded.title")}
          description={t("calculators:calculateurs.ageGraded.description")}
        />

        {/* Input panel */}
        <CalculatorPanel className="mb-6 space-y-6">
          {/* Age + Gender row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Age */}
            <div>
              <label htmlFor="age" className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                {t("calculators:calculateurs.ageGraded.age")}
              </label>
              <input
                id="age"
                type="number"
                min={15}
                max={99}
                placeholder={t("calculators:calculateurs.ageGraded.agePlaceholder")}
                value={age}
                onChange={(e) => handleNumericInput(e.target.value, setAge, 99)}
                className="block w-full border-0 border-b-[3px] border-foreground bg-transparent px-1 py-2 mt-2 font-mono text-2xl tabular-nums focus-visible:outline-none"
                aria-label={t("calculators:calculateurs.ageGraded.age")}
              />
            </div>

            {/* Gender */}
            <div>
              <CalculatorLabel className="mb-2.5">
                {t("calculators:calculateurs.ageGraded.gender")}
              </CalculatorLabel>
              <div className="flex gap-2">
                <CalculatorChip active={gender === "male"} onClick={() => setGender("male")} className="flex-1">
                  {t("calculators:calculateurs.ageGraded.male")}
                </CalculatorChip>
                <CalculatorChip active={gender === "female"} onClick={() => setGender("female")} className="flex-1">
                  {t("calculators:calculateurs.ageGraded.female")}
                </CalculatorChip>
              </div>
            </div>
          </div>

          {/* Distance + Time row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Distance */}
            <div>
              <label htmlFor="distance" className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                {t("calculators:calculateurs.ageGraded.distance")}
              </label>
              <select
                id="distance"
                value={distanceKey}
                onChange={(e) =>
                  setDistanceKey(parseFloat(e.target.value) as DistanceKey)
                }
                className="block w-full border-0 border-b-[3px] border-foreground bg-transparent px-1 py-2 mt-2 font-mono text-lg focus-visible:outline-none"
              >
                {DISTANCES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {pickLang(d, "label")}
                  </option>
                ))}
              </select>
            </div>

            {/* Time */}
            <div>
              <CalculatorLabel className="mb-2.5">
                {t("calculators:calculateurs.ageGraded.time")}
              </CalculatorLabel>
              <div className="flex items-end gap-2">
                <CalculatorTimeField
                  value={hours}
                  onChange={(v) => handleNumericInput(v, setHours, 9)}
                  max={9}
                  placeholder="0"
                  unitLabel="h"
                  ariaLabel={t("calculators:calculateurs.ageGraded.hours")}
                  className="w-12 sm:w-14"
                />
                <span className="pb-6 font-mono text-lg text-muted-foreground">:</span>
                <CalculatorTimeField
                  value={minutes}
                  onChange={(v) => handleNumericInput(v, setMinutes, 59)}
                  max={59}
                  placeholder="00"
                  unitLabel="min"
                  ariaLabel={t("calculators:calculateurs.ageGraded.minutes")}
                  className="w-12 sm:w-14"
                />
                <span className="pb-6 font-mono text-lg text-muted-foreground">:</span>
                <CalculatorTimeField
                  value={seconds}
                  onChange={(v) => handleNumericInput(v, setSeconds, 59)}
                  max={59}
                  placeholder="00"
                  unitLabel="sec"
                  ariaLabel={t("calculators:calculateurs.ageGraded.seconds")}
                  className="w-12 sm:w-14"
                />
              </div>
            </div>
          </div>
        </CalculatorPanel>

        {/* Results */}
        {result && performanceLevel && (
          <div className="space-y-6">
            {/* Big percentage display */}
            <CalculatorPanel className="flex flex-col items-center text-center py-8">
              <CalculatorResultHeadline
                label={performanceLevel.label}
                value={`${result.percentage.toFixed(1)}%`}
              />
            </CalculatorPanel>

            {/* Context panel */}
            <CalculatorPanel>
              <div className="space-y-0 font-mono">
                <div className="flex justify-between items-center py-2.5 border-b border-border">
                  <span className="text-[13px] text-muted-foreground">
                    {t("calculators:calculateurs.ageGraded.openWorldRecord")}
                  </span>
                  <span className="text-[13px] tabular-nums">
                    {formatTime(result.worldRecord)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-border">
                  <span className="text-[13px] text-muted-foreground">
                    {t("calculators:calculateurs.ageGraded.ageAdjustedRecord")}
                  </span>
                  <span className="text-[13px] tabular-nums">
                    {formatTime(result.ageGradedRecord)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-border">
                  <span className="text-[13px] text-muted-foreground">
                    {t("calculators:calculateurs.ageGraded.yourTime")}
                  </span>
                  <span className="text-[13px] tabular-nums">
                    {formatTime(totalTimeSeconds)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[13px] text-muted-foreground">
                    {t("calculators:calculateurs.ageGraded.paceLabel")}
                  </span>
                  <span className="text-[13px] tabular-nums">
                    {formatPaceWithUnit(result.paceMinPerKm, unit)}
                  </span>
                </div>
              </div>
            </CalculatorPanel>

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

            {/* Explanation */}
            <p className="text-sm text-muted-foreground">
              {t("calculators:calculateurs.ageGraded.explanation")}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Star } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { useSettings } from "@/hooks/useSettings";
import { formatPaceWithUnit } from "@/lib/units";

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
      label: t("calculateurs.ageGraded.levelWorldClass"),
      colorClass: "text-zone-6",
    };
  if (percentage >= 80)
    return {
      label: t("calculateurs.ageGraded.levelNational"),
      colorClass: "text-zone-5",
    };
  if (percentage >= 70)
    return {
      label: t("calculateurs.ageGraded.levelRegional"),
      colorClass: "text-zone-4",
    };
  if (percentage >= 60)
    return {
      label: t("calculateurs.ageGraded.levelLocal"),
      colorClass: "text-zone-3",
    };
  return {
    label: t("calculateurs.ageGraded.levelRecreational"),
    colorClass: "text-zone-2",
  };
}

export function AgeGradedPage() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<Gender>("male");
  const [distanceKey, setDistanceKey] = useState<DistanceKey>(10);
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");

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
        title={t("calculateurs.ageGraded.seoTitle")}
        description={t("calculateurs.ageGraded.seoDescription")}
        canonical="/calculators/age-graded"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculateurs.ageGraded.seoAppName"),
            description: t("calculateurs.ageGraded.seoAppDescription"),
            url: "https://zoned.run/calculators/age-graded",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculateurs.ageGraded.seoBreadcrumb") },
            ],
          },
        ]}
      />
      <div className="py-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Star className="size-8 text-primary" />
            {t("calculateurs.ageGraded.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("calculateurs.ageGraded.description")}
          </p>
        </div>

        {/* Input Card */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-6">
            {/* Age + Gender row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Age */}
              <div className="space-y-2">
                <label htmlFor="age" className="text-sm font-medium">
                  {t("calculateurs.ageGraded.age")}
                </label>
                <input
                  id="age"
                  type="number"
                  min={15}
                  max={99}
                  placeholder={t("calculateurs.ageGraded.agePlaceholder")}
                  value={age}
                  onChange={(e) => handleNumericInput(e.target.value, setAge, 99)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm tabular-nums shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={t("calculateurs.ageGraded.age")}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("calculateurs.ageGraded.gender")}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={gender === "male" ? "default" : "outline"}
                    onClick={() => setGender("male")}
                    className="flex-1"
                  >
                    {t("calculateurs.ageGraded.male")}
                  </Button>
                  <Button
                    variant={gender === "female" ? "default" : "outline"}
                    onClick={() => setGender("female")}
                    className="flex-1"
                  >
                    {t("calculateurs.ageGraded.female")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Distance + Time row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Distance */}
              <div className="space-y-2">
                <label htmlFor="distance" className="text-sm font-medium">
                  {t("calculateurs.ageGraded.distance")}
                </label>
                <select
                  id="distance"
                  value={distanceKey}
                  onChange={(e) =>
                    setDistanceKey(parseFloat(e.target.value) as DistanceKey)
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {DISTANCES.map((d) => (
                    <option key={d.id} value={d.id}>
                      {isEn ? d.labelEn : d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("calculateurs.ageGraded.time")}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      min={0}
                      max={9}
                      placeholder="0"
                      value={hours}
                      onChange={(e) =>
                        handleNumericInput(e.target.value, setHours, 9)
                      }
                      className="flex h-12 w-14 rounded-md border border-input bg-transparent px-2 py-1 text-center text-lg tabular-nums shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={t("calculateurs.ageGraded.hours")}
                    />
                    <span className="text-xs text-muted-foreground mt-1">
                      h
                    </span>
                  </div>
                  <span className="text-xl font-bold text-muted-foreground pb-4">
                    :
                  </span>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="00"
                      value={minutes}
                      onChange={(e) =>
                        handleNumericInput(e.target.value, setMinutes, 59)
                      }
                      className="flex h-12 w-14 rounded-md border border-input bg-transparent px-2 py-1 text-center text-lg tabular-nums shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={t("calculateurs.ageGraded.minutes")}
                    />
                    <span className="text-xs text-muted-foreground mt-1">
                      min
                    </span>
                  </div>
                  <span className="text-xl font-bold text-muted-foreground pb-4">
                    :
                  </span>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="00"
                      value={seconds}
                      onChange={(e) =>
                        handleNumericInput(e.target.value, setSeconds, 59)
                      }
                      className="flex h-12 w-14 rounded-md border border-input bg-transparent px-2 py-1 text-center text-lg tabular-nums shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={t("calculateurs.ageGraded.seconds")}
                    />
                    <span className="text-xs text-muted-foreground mt-1">
                      sec
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && performanceLevel && (
          <div className="space-y-6">
            {/* Big percentage display */}
            <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
              <CardContent className="py-8 flex flex-col items-center text-center">
                <p className="text-5xl font-bold tabular-nums">
                  {result.percentage.toFixed(1)}%
                </p>
                <p className={`text-lg font-semibold mt-2 ${performanceLevel.colorClass}`}>
                  {performanceLevel.label}
                </p>
              </CardContent>
            </Card>

            {/* Context card */}
            <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      {t("calculateurs.ageGraded.openWorldRecord")}
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatTime(result.worldRecord)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      {t("calculateurs.ageGraded.ageAdjustedRecord")}
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatTime(result.ageGradedRecord)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      {t("calculateurs.ageGraded.yourTime")}
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatTime(totalTimeSeconds)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">
                      {t("calculateurs.ageGraded.paceLabel")}
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatPaceWithUnit(result.paceMinPerKm, unit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Explanation */}
            <p className="text-sm text-muted-foreground">
              {t("calculateurs.ageGraded.explanation")}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Save, Trash2, Heart, Gauge, ChevronDown, Dumbbell } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ZONE_META,
  getDominantZone,
  type ZoneNumber,
  type UserZonePreferences,
  type WorkoutTemplate,
} from "@/types";
import {
  calculateAllZones,
  formatPace,
  loadUserZonePrefs,
  saveUserZonePrefs,
  clearUserZonePrefs,
} from "@/lib/zones";
import { useSettings } from "@/hooks/useSettings";
import { convertPace, getSpeedUnit, getPaceUnit } from "@/lib/units";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useIsMobile } from "@/hooks/useIsMobile";

/** Max example workouts shown per zone (desktop / mobile) */
const MAX_EXAMPLES = 3;
const MAX_EXAMPLES_MOBILE = 2;

/**
 * Build a map from ZoneNumber to up to MAX_EXAMPLES workout examples.
 * Uses getDominantZone to classify each workout, then picks the first
 * MAX_EXAMPLES per zone (deterministic order from data files).
 */
function buildZoneWorkoutMap(
  workouts: WorkoutTemplate[]
): Record<ZoneNumber, WorkoutTemplate[]> {
  const map: Record<ZoneNumber, WorkoutTemplate[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  for (const w of workouts) {
    // Skip custom workouts (no stable route)
    if (w.id.startsWith("CUSTOM-")) continue;
    const zone = getDominantZone(w);
    if (map[zone].length < MAX_EXAMPLES) {
      map[zone].push(w);
    }
  }

  return map;
}

export function ZoneCalculator() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const { settings } = useSettings();
  const unit = settings.unitSystem;
  const isMobile = useIsMobile();

  const [fcMax, setFcMax] = useState<string>("");
  const [vma, setVma] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [expandedZone, setExpandedZone] = useState<ZoneNumber | null>(null);

  // Load workouts for example links
  const { workouts } = useWorkouts();
  const zoneWorkouts = useMemo(() => buildZoneWorkoutMap(workouts), [workouts]);

  // Validation helpers
  const parsedFcMax = fcMax ? parseFloat(fcMax) : undefined;
  const parsedVma = vma ? parseFloat(vma) : undefined;

  const fcMaxError =
    fcMax !== "" &&
    (parsedFcMax === undefined ||
      !Number.isFinite(parsedFcMax) ||
      parsedFcMax < 100 ||
      parsedFcMax > 250);
  const vmaError =
    vma !== "" &&
    (parsedVma === undefined ||
      !Number.isFinite(parsedVma) ||
      parsedVma < 8 ||
      parsedVma > 30);

  // Load stored preferences on mount
  useEffect(() => {
    const prefs = loadUserZonePrefs();
    if (prefs) {
      if (prefs.fcMax) setFcMax(prefs.fcMax.toString());
      if (prefs.vma) setVma(prefs.vma.toString());
      setSaved(true);
    }
  }, []);

  const prefs: UserZonePreferences = {
    fcMax: fcMax && !fcMaxError ? parsedFcMax : undefined,
    vma: vma && !vmaError ? parsedVma : undefined,
  };

  const zones = calculateAllZones(prefs);
  const hasValues = prefs.fcMax || prefs.vma;
  const hasErrors = fcMaxError || vmaError;

  const handleSave = () => {
    if (hasValues && !hasErrors) {
      saveUserZonePrefs(prefs);
      setSaved(true);
    }
  };

  const handleClear = () => {
    clearUserZonePrefs();
    setFcMax("");
    setVma("");
    setSaved(false);
  };

  const toggleZone = useCallback((zone: ZoneNumber) => {
    setExpandedZone((prev) => (prev === zone ? null : zone));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="size-5" />
          {t("myZones.zoneCalculator.title")}
        </CardTitle>
        <CardDescription>
          {t("myZones.zoneCalculator.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="fcMax" className="flex items-center gap-2 text-sm font-medium">
              <Heart className="size-4 text-red-500" />
              {t("myZones.zoneCalculator.fcMax")}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="fcMax"
                type="number"
                min={100}
                max={250}
                placeholder="180"
                value={fcMax}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFcMax(e.target.value);
                  setSaved(false);
                }}
                className={cn(
                  "flex h-9 w-full max-w-[120px] rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                  fcMaxError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-input focus-visible:ring-ring"
                )}
              />
              <span className="text-sm text-muted-foreground">bpm</span>
            </div>
            {fcMaxError && (
              <p className="text-xs text-red-500">
                {t("myZones.zoneCalculator.invalidFcMax")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="vma" className="flex items-center gap-2 text-sm font-medium">
              <Gauge className="size-4 text-blue-500" />
              {t("myZones.zoneCalculator.vma")}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="vma"
                type="number"
                min={8}
                max={30}
                step={0.5}
                placeholder="15"
                value={vma}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setVma(e.target.value);
                  setSaved(false);
                }}
                className={cn(
                  "flex h-9 w-full max-w-[120px] rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                  vmaError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-input focus-visible:ring-ring"
                )}
              />
              <span className="text-sm text-muted-foreground">{getSpeedUnit(unit)}</span>
            </div>
            {vmaError && (
              <p className="text-xs text-red-500">
                {t("myZones.zoneCalculator.invalidVma")}
              </p>
            )}
          </div>
        </div>

        {/* Zone Table with Accordion Panels */}
        {hasValues && (
          <div className="space-y-0 overflow-hidden">
            {/* Header row -- hidden on mobile where zone rows stack vertically */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_32px] items-center border-b px-3 py-2 text-sm font-medium">
              <span>{t("myZones.zoneCalculator.zone")}</span>
              {prefs.fcMax && (
                <span className="min-w-[110px] text-left">
                  {t("myZones.zoneCalculator.heartRate")}
                </span>
              )}
              {prefs.vma && (
                <span className="min-w-[130px] text-left">
                  {t("myZones.zoneCalculator.pace")}
                </span>
              )}
              {/* Spacer for chevron column */}
              <span />
            </div>

            {zones.map((z) => {
              const meta = ZONE_META[z.zone as ZoneNumber];
              const zoneNum = z.zone as ZoneNumber;
              const isExpanded = expandedZone === zoneNum;
              const examples = zoneWorkouts[zoneNum];

              return (
                <div key={z.zone} className="border-b last:border-b-0">
                  {/* Zone row (clickable) */}
                  <button
                    type="button"
                    onClick={() => toggleZone(zoneNum)}
                    aria-expanded={isExpanded}
                    aria-controls={`zone-panel-${zoneNum}`}
                    className={cn(
                      // Mobile: flex column with chevron in top-right corner
                      // Desktop: 4-column grid
                      "w-full px-3 py-2 text-left text-xs sm:text-sm transition-colors duration-150",
                      "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                      "flex flex-col gap-1 sm:grid sm:grid-cols-[1fr_auto_auto_32px] sm:items-center sm:gap-0",
                      `bg-${meta.color}/10`
                    )}
                  >
                    {/* Zone label + chevron row */}
                    <span className="flex items-center justify-between min-w-0">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 font-medium min-w-0",
                          `text-${meta.color}`
                        )}
                      >
                        <span
                          className={cn(
                            "size-3 shrink-0 rounded-full",
                            `bg-${meta.color}`
                          )}
                        />
                        <span className="truncate">
                          Z{z.zone} - {isEn ? meta.labelEn : meta.label}
                        </span>
                      </span>
                      {/* Chevron visible only on mobile (inline with label) */}
                      <span className="flex items-center justify-center sm:hidden">
                        <ChevronDown
                          className={cn(
                            "size-4 text-muted-foreground transition-transform duration-300",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </span>
                    </span>

                    {/* HR & pace values -- stacked on mobile, inline on desktop */}
                    {(prefs.fcMax || prefs.vma) && (
                      <span className="flex flex-wrap gap-x-3 gap-y-0.5 pl-5 sm:contents sm:pl-0">
                        {prefs.fcMax && (
                          <span className="tabular-nums text-foreground sm:min-w-[110px]">
                            {z.hrMin}-{z.hrMax} bpm
                          </span>
                        )}
                        {prefs.vma && (
                          <span className="tabular-nums text-foreground sm:min-w-[130px]">
                            {formatPace(convertPace(z.paceMinPerKm!, unit))}-
                            {formatPace(convertPace(z.paceMaxPerKm!, unit))} {getPaceUnit(unit)}
                          </span>
                        )}
                      </span>
                    )}

                    {/* Chevron visible only on desktop (grid column) */}
                    <span className="hidden sm:flex items-center justify-center">
                      <ChevronDown
                        className={cn(
                          "size-4 text-muted-foreground transition-transform duration-300",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </span>
                  </button>

                  {/* Expandable panel */}
                  <div
                    id={`zone-panel-${zoneNum}`}
                    role="region"
                    aria-labelledby={`zone-row-${zoneNum}`}
                    className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                    style={{
                      gridTemplateRows: isExpanded ? "1fr" : "0fr",
                    }}
                  >
                    <div className="overflow-hidden">
                      <div
                        className={cn(
                          "border-l-4 px-3 sm:px-4 py-3 space-y-2",
                          `border-${meta.color}`
                        )}
                      >
                        {/* Sensation */}
                        <div>
                          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("myZones.zoneCalculator.sensation")}
                          </span>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            {isEn ? meta.sensationEn : meta.sensation}
                          </p>
                        </div>

                        {/* Benefit */}
                        <div>
                          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("myZones.zoneCalculator.benefit")}
                          </span>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            {isEn ? meta.benefitEn : meta.benefit}
                          </p>
                        </div>

                        {/* Example workouts */}
                        {examples.length > 0 && (
                          <div>
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                              <Dumbbell className="size-3" />
                              {t("myZones.zoneCalculator.exampleWorkouts")}
                            </span>
                            <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 sm:flex-col sm:gap-x-0 sm:space-y-0.5">
                              {examples
                                .slice(0, isMobile ? MAX_EXAMPLES_MOBILE : MAX_EXAMPLES)
                                .map((w) => (
                                <li key={w.id}>
                                  <Link
                                    to={`/workout/${w.id}`}
                                    className={cn(
                                      "text-xs sm:text-sm underline-offset-2 hover:underline",
                                      `text-${meta.color}`
                                    )}
                                  >
                                    {isEn ? w.nameEn : w.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!hasValues || saved || hasErrors}>
            <Save className="size-4 mr-2" />
            {saved
              ? t("myZones.zoneCalculator.saved")
              : t("myZones.zoneCalculator.save")}
          </Button>
          {saved && (
            <Button variant="outline" onClick={handleClear}>
              <Trash2 className="size-4 mr-2" />
              {t("myZones.zoneCalculator.clear")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

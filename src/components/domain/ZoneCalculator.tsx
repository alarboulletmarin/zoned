import {
  Fragment,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { Save, Trash2, HeartRate, Gauge, ChevronDown, Dumbbell } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Annotation } from "@/components/domain/Annotation";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { buildParamsUrl } from "@/lib/share/urlParams";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ZONE_META,
  getDominantZone,
  type ZoneNumber,
  type ZoneRange,
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
import { usePickLang } from "@/lib/i18n-utils";

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

interface ZoneCalculatorProps {
  /** The zones recomputed on every valid entry, for the page's plate that
      prints them under each figure; empty when nothing is known. */
  onZonesChange?: (zones: ZoneRange[]) => void;
}

export function ZoneCalculator({ onZonesChange }: ZoneCalculatorProps = {}) {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();
  const { settings } = useSettings();
  const unit = settings.unitSystem;
  const isMobile = useIsMobile();

  // A shared link carries the sender's values, they win over whatever the
  // recipient has stored locally, otherwise the link would show their zones.
  const [searchParams] = useSearchParams();
  const sharedFcMax = searchParams.get("fcmax") ?? "";
  const sharedVma = searchParams.get("vma") ?? "";

  const [fcMax, setFcMax] = useState<string>(sharedFcMax);
  const [vma, setVma] = useState<string>(sharedVma);
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

  // Load stored preferences on mount, skipped when the URL already supplies values.
  useEffect(() => {
    if (sharedFcMax || sharedVma) return;
    const prefs = loadUserZonePrefs();
    if (prefs) {
      if (prefs.fcMax) setFcMax(prefs.fcMax.toString());
      if (prefs.vma) setVma(prefs.vma.toString());
      setSaved(true);
    }
  }, [sharedFcMax, sharedVma]);

  const validFcMax = fcMax && !fcMaxError ? parsedFcMax : undefined;
  const validVma = vma && !vmaError ? parsedVma : undefined;
  const prefs: UserZonePreferences = { fcMax: validFcMax, vma: validVma };

  const zones = useMemo(
    () => calculateAllZones({ fcMax: validFcMax, vma: validVma }),
    [validFcMax, validVma]
  );
  useEffect(() => {
    onZonesChange?.(zones);
  }, [zones, onZonesChange]);

  const hasValues = prefs.fcMax || prefs.vma;
  const hasErrors = fcMaxError || vmaError;

  // The one boundary worth a sentence: entering Z4. Recomputed from the
  // reader's numbers, Z4's lower pace bound (the slowest), and its lower
  // heart-rate bound. One line per known quantity.
  const z4 = zones.find((z) => z.zone === 4);
  const thresholdNote = [
    z4?.paceMaxPerKm !== undefined &&
      t("calculators:calculateurs.zones.thresholdPace", {
        pace: `${formatPace(convertPace(z4.paceMaxPerKm, unit))}${getPaceUnit(unit)}`,
      }),
    z4?.hrMin !== undefined &&
      t("calculators:calculateurs.zones.thresholdHr", { bpm: z4.hrMin }),
  ]
    .filter(Boolean)
    .join("\n");

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
        <CardTitle className="zn-calc__card-title">
          <Gauge />
          {t("myZones.zoneCalculator.title")}
        </CardTitle>
        <CardDescription>
          {t("myZones.zoneCalculator.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="zn-stack" style={{ "--gap": "var(--sp-12)" } as CSSProperties}>
        {/* Inputs */}
        <div className="zn-calc__fields">
          <div className="zn-calc__field">
            <label htmlFor="fcMax" className="zn-calc__label">
              <HeartRate />
              {t("myZones.zoneCalculator.fcMax")}
            </label>
            <span className="zn-numfield" data-invalid={fcMaxError ? "true" : undefined}>
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
                className="zn-numfield__input"
              />
              <span className="zn-numfield__unit">bpm</span>
            </span>
            {fcMaxError && (
              <p className="zn-calc__error">
                {t("myZones.zoneCalculator.invalidFcMax")}
              </p>
            )}
          </div>

          <div className="zn-calc__field">
            <label htmlFor="vma" className="zn-calc__label">
              <Gauge />
              {t("myZones.zoneCalculator.vma")}
            </label>
            <span className="zn-numfield" data-invalid={vmaError ? "true" : undefined}>
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
                className="zn-numfield__input"
              />
              <span className="zn-numfield__unit">{getSpeedUnit(unit)}</span>
            </span>
            {vmaError && (
              <p className="zn-calc__error">
                {t("myZones.zoneCalculator.invalidVma")}
              </p>
            )}
          </div>
        </div>

        {/* Zone Table with Accordion Panels */}
        {hasValues && (
          <div
            className="zn-ztable"
            style={
              {
                "--hr-w": prefs.fcMax ? "110px" : "0px",
                "--pace-w": prefs.vma ? "130px" : "0px",
              } as CSSProperties
            }
          >
            {/* Header row -- hidden on mobile where zone rows stack vertically */}
            {/* Four cells always, so the grid columns line up with the rows
                below whichever of the two inputs is filled in; the unused
                column is zero-width. */}
            <div className="zn-ztable__head">
              <span>{t("myZones.zoneCalculator.zone")}</span>
              <span>{prefs.fcMax ? t("myZones.zoneCalculator.heartRate") : ""}</span>
              <span>{prefs.vma ? t("myZones.zoneCalculator.pace") : ""}</span>
              {/* Spacer for chevron column */}
              <span />
            </div>

            {zones.map((z) => {
              const meta = ZONE_META[z.zone as ZoneNumber];
              const zoneNum = z.zone as ZoneNumber;
              const isExpanded = expandedZone === zoneNum;
              const examples = zoneWorkouts[zoneNum];

              return (
                <Fragment key={z.zone}>
                  {/* Between Z3 and Z4, the one boundary worth a sentence: an
                      annotation row in its place in the table, the arrow
                      towards the Z4 row. Arrow only, no figure: the page
                      already has one, the ZoneFigures plate, and one figure
                      per screen is the rule (docs/doodles.md). */}
                  {zoneNum === 4 && thresholdNote && (
                    <Annotation
                      className="zn-ztable__note"
                      text={thresholdNote}
                      arrow="down-right"
                    />
                  )}
                  <div className="zn-ztable__group">
                    {/* Zone row (clickable) */}
                    <button
                      type="button"
                      onClick={() => toggleZone(zoneNum)}
                      aria-expanded={isExpanded}
                      aria-controls={`zone-panel-${zoneNum}`}
                      className="zn-ztable__row"
                    >
                      {/* Zone label + chevron row */}
                      <span className="zn-ztable__label">
                        <span className="zn-ztable__name">
                          {/* The legend's own swatch, so a row can never show a
                              density the legend does not. */}
                          <span className="zn-zonescale__swatch" aria-hidden="true">
                            <span className="zn-zonescale__fill" data-zone={zoneNum} />
                          </span>
                          <span>
                            Z{z.zone} - {pickLang(meta, "label")}
                          </span>
                        </span>
                        {/* Chevron visible only on mobile (inline with label) */}
                        <span className="zn-ztable__chevron zn-ztable__chevron--narrow">
                          <ChevronDown />
                        </span>
                      </span>

                      {/* HR & pace values -- stacked on mobile, inline on desktop */}
                      <span className="zn-ztable__values">
                        <span className="zn-ztable__value">
                          {prefs.fcMax ? `${z.hrMin}-${z.hrMax} bpm` : ""}
                        </span>
                        <span className="zn-ztable__value">
                          {prefs.vma
                            ? `${formatPace(convertPace(z.paceMinPerKm!, unit))}-${formatPace(convertPace(z.paceMaxPerKm!, unit))} ${getPaceUnit(unit)}`
                            : ""}
                        </span>
                      </span>

                      {/* Chevron visible only on desktop (grid column) */}
                      <span className="zn-ztable__chevron zn-ztable__chevron--wide">
                        <ChevronDown />
                      </span>
                    </button>

                    {/* Expandable panel */}
                    <div
                      id={`zone-panel-${zoneNum}`}
                      role="region"
                      aria-labelledby={`zone-row-${zoneNum}`}
                      className="zn-ztable__panel"
                      data-open={isExpanded ? "true" : undefined}
                    >
                      <div className="zn-ztable__clip">
                        <div className="zn-ztable__detail zn-zone-edge" data-zone={zoneNum}>
                          {/* Sensation */}
                          <div>
                            <p className="zn-ztable__term">
                              {t("myZones.zoneCalculator.sensation")}
                            </p>
                            <p className="zn-ztable__text">
                              {pickLang(meta, "sensation")}
                            </p>
                          </div>

                          {/* Benefit */}
                          <div>
                            <p className="zn-ztable__term">
                              {t("myZones.zoneCalculator.benefit")}
                            </p>
                            <p className="zn-ztable__text">
                              {pickLang(meta, "benefit")}
                            </p>
                          </div>

                          {/* Example workouts */}
                          {examples.length > 0 && (
                            <div>
                              <p className="zn-ztable__term">
                                <Dumbbell />
                                {t("myZones.zoneCalculator.exampleWorkouts")}
                              </p>
                              <ul className="zn-ztable__examples">
                                {examples
                                  .slice(0, isMobile ? MAX_EXAMPLES_MOBILE : MAX_EXAMPLES)
                                  .map((w) => (
                                  <li key={w.id}>
                                    <Link to={`/workout/${w.id}`} className="zn-ztable__example">
                                      {pickLang(w, "name")}
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
                </Fragment>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="zn-calc__actions">
          <Button onClick={handleSave} disabled={!hasValues || saved || hasErrors}>
            <Save />
            {saved
              ? t("myZones.zoneCalculator.saved")
              : t("myZones.zoneCalculator.save")}
          </Button>
          {saved && (
            <Button variant="outline" onClick={handleClear}>
              <Trash2 />
              {t("myZones.zoneCalculator.clear")}
            </Button>
          )}
          <ShareLinkButton
            buildUrl={() =>
              buildParamsUrl("/calculators/zones", { vma, fcmax: fcMax })
            }
            title={t("myZones.zoneCalculator.title")}
            disabled={!hasValues || hasErrors}
          />
        </div>
      </CardContent>
    </Card>
  );
}

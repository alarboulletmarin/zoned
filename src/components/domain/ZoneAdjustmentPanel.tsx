import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RotateCcw } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { zoneClass } from "@/lib/zoneColors";
import { cn } from "@/lib/utils";
import { usePickLang } from "@/lib/i18n-utils";
import {
  calculateAllZones,
  findOverlappingZonePairs,
  formatPace,
  setZoneOverride,
  clearAllZoneOverrides,
} from "@/lib/zones";
import {
  ZONE_META,
  type ZoneNumber,
  type ZoneRange,
  type ZoneOverride,
  type UserZonePreferences,
} from "@/types";

const ZONE_NUMBERS: ZoneNumber[] = [1, 2, 3, 4, 5, 6];

/** Which axis the sliders drive. `both` stacks one row per axis. */
type ZoneBasis = "pace" | "hr" | "both";

/** Tailwind needs literal class names — see the note in `zoneColors.ts`. */
const ZONE_RANGE_CLASS: Record<ZoneNumber, string> = {
  1: "bg-zone-1",
  2: "bg-zone-2",
  3: "bg-zone-3",
  4: "bg-zone-4",
  5: "bg-zone-5",
  6: "bg-zone-6",
};

interface Domain {
  min: number;
  max: number;
}

/** Slider bounds wide enough to hold every zone edge, formula or manual. */
function buildDomain(values: number[], pad: number): Domain | null {
  if (values.length === 0) return null;
  return {
    min: Math.floor((Math.min(...values) - pad) / 5) * 5,
    max: Math.ceil((Math.max(...values) + pad) / 5) * 5,
  };
}

function paceSeconds(paceMinPerKm: number): number {
  return Math.round(paceMinPerKm * 60);
}

/** One zone, one axis: chip · double-handle slider · current bounds. */
function ZoneSliderRow({
  zone,
  axis,
  values,
  domain,
  isManual,
  readout,
  thumbLabels,
  onDrag,
  onCommit,
}: {
  zone: ZoneNumber;
  axis: "pace" | "hr";
  values: [number, number];
  domain: Domain;
  isManual: boolean;
  /** Formats the live slider values for the right-hand column. */
  readout: (values: [number, number]) => string;
  thumbLabels: [string, string];
  onDrag?: (values: [number, number]) => void;
  onCommit: (values: [number, number]) => void;
}) {
  const pickLang = usePickLang();
  const [local, setLocal] = useState<[number, number]>(values);

  useEffect(() => {
    setLocal(values);
    // Re-sync when the stored bounds change (save, reset, VMA edit).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values[0], values[1]]);

  const text = readout(local);

  return (
    <div className="grid grid-cols-[44px_1fr] sm:grid-cols-[56px_1fr_112px] items-center gap-x-4 gap-y-2">
      <span
        className={cn(
          "justify-self-start px-2 py-1 font-mono text-xs font-bold",
          zoneClass(zone, "bg"),
          zoneClass(zone, "textOn"),
        )}
        title={pickLang(ZONE_META[zone], "label")}
      >
        Z{zone}
      </span>
      <Slider
        min={domain.min}
        max={domain.max}
        step={1}
        inverted={axis === "pace"}
        minStepsBetweenThumbs={1}
        value={local}
        onValueChange={(v) => {
          const next: [number, number] = [v[0], v[1]];
          setLocal(next);
          onDrag?.(next);
        }}
        onValueCommit={(v) => onCommit([v[0], v[1]])}
        rangeClassName={ZONE_RANGE_CLASS[zone]}
        thumbClassName={isManual ? "bg-accent-acid" : "bg-background"}
        thumbLabels={thumbLabels}
        thumbValueTexts={[readout([local[0], local[0]]), readout([local[1], local[1]])]}
      />
      <span
        className={cn(
          "col-span-2 sm:col-span-1 font-mono text-[13px] sm:text-right",
          isManual ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {text}
      </span>
    </div>
  );
}

interface ZoneAdjustmentPanelProps {
  prefs: UserZonePreferences;
  /** Called after any save/reset so the parent can reload from storage. */
  onChange: () => void;
  /** Real catalogue session counts per zone, for the "adjusted by hand" note. */
  zoneSessionCounts?: Partial<Record<ZoneNumber, number>>;
}

export function ZoneAdjustmentPanel({
  prefs,
  onChange,
  zoneSessionCounts,
}: ZoneAdjustmentPanelProps) {
  const { t } = useTranslation("profile");

  const zones = useMemo(() => calculateAllZones(prefs), [prefs]);
  const formulaZones = useMemo(
    () => calculateAllZones({ fcMax: prefs.fcMax, vma: prefs.vma }),
    [prefs.fcMax, prefs.vma]
  );
  const hasPace = prefs.vma !== undefined;
  const hasHr = prefs.fcMax !== undefined;

  const [basis, setBasis] = useState<ZoneBasis>(hasPace ? "pace" : "hr");
  useEffect(() => {
    setBasis(hasPace ? "pace" : "hr");
  }, [hasPace, hasHr]);

  const paceDomain = useMemo(
    () =>
      buildDomain(
        [...zones, ...formulaZones]
          .flatMap((z) => [z.paceMinPerKm, z.paceMaxPerKm])
          .filter((v): v is number => v !== undefined)
          .map(paceSeconds),
        30
      ),
    [zones, formulaZones]
  );
  const hrDomain = useMemo(
    () =>
      buildDomain(
        [...zones, ...formulaZones]
          .flatMap((z) => [z.hrMin, z.hrMax])
          .filter((v): v is number => v !== undefined),
        8
      ),
    [zones, formulaZones]
  );

  /** Live bounds while a thumb is being dragged, so the overlap check and the
   *  manual note react before the pointer is released. */
  const [dragging, setDragging] = useState<{
    zone: ZoneNumber;
    axis: "pace" | "hr";
    values: [number, number];
  } | null>(null);

  const previewZones = useMemo<ZoneRange[]>(() => {
    if (!dragging) return zones;
    return zones.map((z) =>
      z.zone !== dragging.zone
        ? z
        : dragging.axis === "pace"
          ? {
              ...z,
              paceMinPerKm: dragging.values[0] / 60,
              paceMaxPerKm: dragging.values[1] / 60,
            }
          : { ...z, hrMin: dragging.values[0], hrMax: dragging.values[1] }
    );
  }, [zones, dragging]);

  const overlaps = useMemo(
    () => findOverlappingZonePairs(previewZones),
    [previewZones]
  );

  if (!hasPace && !hasHr) return null;

  function commit(zone: ZoneNumber, axis: "pace" | "hr", values: [number, number]) {
    setDragging(null);
    const current = zones.find((z) => z.zone === zone);
    if (!current) return;

    const next: ZoneOverride = {
      paceMinPerKm: current.paceMinPerKm,
      paceMaxPerKm: current.paceMaxPerKm,
      hrMin: current.hrMin,
      hrMax: current.hrMax,
    };
    if (axis === "pace") {
      next.paceMinPerKm = values[0] / 60;
      next.paceMaxPerKm = values[1] / 60;
    } else {
      next.hrMin = values[0];
      next.hrMax = values[1];
    }

    // Slid back onto the formula: drop the override instead of freezing the
    // computed value, so a later VMA change keeps flowing through.
    const formula = formulaZones.find((z) => z.zone === zone);
    const samePace =
      formula?.paceMinPerKm === undefined ||
      next.paceMinPerKm === undefined ||
      (paceSeconds(next.paceMinPerKm) === paceSeconds(formula.paceMinPerKm) &&
        paceSeconds(next.paceMaxPerKm!) === paceSeconds(formula.paceMaxPerKm!));
    const sameHr =
      formula?.hrMin === undefined ||
      next.hrMin === undefined ||
      (next.hrMin === formula.hrMin && next.hrMax === formula.hrMax);

    setZoneOverride(zone, samePace && sameHr ? null : next);
    onChange();
  }

  function handleResetAll() {
    clearAllZoneOverrides();
    toast.success(t("me.zones.saved"));
    onChange();
  }

  const paceReadout = (v: [number, number]) =>
    `${formatPace(v[0] / 60)}–${formatPace(v[1] / 60)}`;
  const hrReadout = (v: [number, number]) => `${v[0]}–${v[1]} bpm`;

  const basisOptions: Array<{ value: ZoneBasis; label: string }> = [
    ...(hasPace ? [{ value: "pace" as const, label: t("me.zones.basisPace") }] : []),
    ...(hasHr ? [{ value: "hr" as const, label: t("me.zones.basisHr") }] : []),
    ...(hasPace && hasHr
      ? [{ value: "both" as const, label: t("me.zones.basisBoth") }]
      : []),
  ];

  const showPace = hasPace && (basis === "pace" || basis === "both");
  const showHr = hasHr && (basis === "hr" || basis === "both");
  const manualZones = zones.filter((z) => z.isManual);

  return (
    <div className="space-y-6">
      {basisOptions.length > 1 && (
        <div className="flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-wider">
          {basisOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setBasis(option.value)}
              aria-pressed={basis === option.value}
              className={cn(
                "px-3.5 py-2.5 border transition-colors duration-150",
                basis === option.value
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {ZONE_NUMBERS.map((zone) => {
          const range = zones.find((z) => z.zone === zone);
          if (!range) return null;
          return (
            <div key={zone} className="space-y-3">
              {showPace &&
                paceDomain &&
                range.paceMinPerKm !== undefined &&
                range.paceMaxPerKm !== undefined && (
                  <ZoneSliderRow
                    zone={zone}
                    axis="pace"
                    domain={paceDomain}
                    isManual={!!range.isManual}
                    values={[
                      paceSeconds(range.paceMinPerKm),
                      paceSeconds(range.paceMaxPerKm),
                    ]}
                    readout={paceReadout}
                    thumbLabels={[
                      `Z${zone} ${t("me.zones.adjustMinLabel")}`,
                      `Z${zone} ${t("me.zones.adjustMaxLabel")}`,
                    ]}
                    onDrag={(values) => setDragging({ zone, axis: "pace", values })}
                    onCommit={(values) => commit(zone, "pace", values)}
                  />
                )}
              {showHr &&
                hrDomain &&
                range.hrMin !== undefined &&
                range.hrMax !== undefined && (
                  <ZoneSliderRow
                    zone={zone}
                    axis="hr"
                    domain={hrDomain}
                    isManual={!!range.isManual}
                    values={[range.hrMin, range.hrMax]}
                    readout={hrReadout}
                    thumbLabels={[
                      `Z${zone} ${t("me.zones.boundLow")}`,
                      `Z${zone} ${t("me.zones.boundHigh")}`,
                    ]}
                    onDrag={(values) => setDragging({ zone, axis: "hr", values })}
                    onCommit={(values) => commit(zone, "hr", values)}
                  />
                )}
            </div>
          );
        })}
      </div>

      {overlaps.length > 0 && (
        <div className="border-2 border-destructive p-4 space-y-2">
          {overlaps.map(([lower, upper]) => (
            <p key={`${lower}-${upper}`} className="text-sm text-foreground">
              {t("me.zones.overlapWarning", { lower, upper })}
            </p>
          ))}
          <p className="text-xs text-muted-foreground">
            {t("me.zones.overlapOnlyInsists")}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={handleResetAll}>
              {t("me.zones.overlapFix")}
            </Button>
          </div>
        </div>
      )}

      {manualZones.map((zone) => {
        const formula = formulaZones.find((z) => z.zone === zone.zone);
        const sessionCount = zoneSessionCounts?.[zone.zone as ZoneNumber];
        return (
          <div
            key={zone.zone}
            className={cn("border-2 p-4 space-y-1", zoneClass(zone.zone as ZoneNumber, "border"))}
          >
            <p
              className={cn(
                "font-mono text-[10px] tracking-wide uppercase",
                zoneClass(zone.zone as ZoneNumber, "text")
              )}
            >
              {t("me.zones.manualAdjustTitle")}
            </p>
            <p className="text-sm text-foreground">
              {t("me.zones.manualAdjustBody", {
                zone: zone.zone,
                current:
                  hasPace && zone.paceMinPerKm !== undefined
                    ? `${formatPace(zone.paceMinPerKm)}–${formatPace(zone.paceMaxPerKm!)}`
                    : `${zone.hrMin}–${zone.hrMax}`,
                formula: (() => {
                  if (!formula) return "—";
                  return hasPace && formula.paceMinPerKm !== undefined
                    ? `${formatPace(formula.paceMinPerKm)}–${formatPace(formula.paceMaxPerKm!)}`
                    : `${formula.hrMin}–${formula.hrMax}`;
                })(),
              })}
              {sessionCount !== undefined && sessionCount > 0 && (
                <>
                  {" "}
                  {t("me.zones.manualAdjustSessions", { count: sessionCount })}
                </>
              )}
            </p>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-4">
        {manualZones.length > 0 && (
          <Button variant="outline" onClick={handleResetAll}>
            <RotateCcw className="size-4 mr-2" />
            {t("me.zones.resetAll")}
          </Button>
        )}
        <p className="font-mono text-[11px] text-muted-foreground">
          {t("me.zones.autoSaved")}
        </p>
      </div>
    </div>
  );
}

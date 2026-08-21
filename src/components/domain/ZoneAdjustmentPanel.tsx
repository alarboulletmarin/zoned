import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Save, RotateCcw } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveTable, type ResponsiveTableColumn } from "@/components/ui/responsive-table";
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
import { ZONE_META, type ZoneNumber, type ZoneRange, type UserZonePreferences } from "@/types";

const ZONE_NUMBERS: ZoneNumber[] = [1, 2, 3, 4, 5, 6];

/** "4:06" -> 4.1 (minutes, decimal). Returns undefined for anything that
 *  doesn't parse as m:ss with a non-negative, in-range second component. */
function parsePaceString(value: string): number | undefined {
  const trimmed = value.trim();
  const match = /^(\d{1,2}):([0-5]?\d)$/.exec(trimmed);
  if (!match) return undefined;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return minutes + seconds / 60;
}

interface ZoneAdjustmentPanelProps {
  prefs: UserZonePreferences;
  /** Called after any save/reset so the parent can reload from storage. */
  onChange: () => void;
}

export function ZoneAdjustmentPanel({ prefs, onChange }: ZoneAdjustmentPanelProps) {
  const { t } = useTranslation("profile");
  const pickLang = usePickLang();

  const zones = useMemo(() => calculateAllZones(prefs), [prefs]);
  const formulaZones = useMemo(
    () => calculateAllZones({ fcMax: prefs.fcMax, vma: prefs.vma }),
    [prefs.fcMax, prefs.vma]
  );
  const overlaps = useMemo(() => findOverlappingZonePairs(zones), [zones]);
  const hasPace = prefs.vma !== undefined;
  const hasHr = prefs.fcMax !== undefined;

  const [selectedZone, setSelectedZone] = useState<ZoneNumber>(4);
  const selected = zones.find((z) => z.zone === selectedZone);

  const [paceMinText, setPaceMinText] = useState("");
  const [paceMaxText, setPaceMaxText] = useState("");
  const [hrMinText, setHrMinText] = useState("");
  const [hrMaxText, setHrMaxText] = useState("");

  useEffect(() => {
    setPaceMinText(selected?.paceMinPerKm !== undefined ? formatPace(selected.paceMinPerKm) : "");
    setPaceMaxText(selected?.paceMaxPerKm !== undefined ? formatPace(selected.paceMaxPerKm) : "");
    setHrMinText(selected?.hrMin !== undefined ? String(selected.hrMin) : "");
    setHrMaxText(selected?.hrMax !== undefined ? String(selected.hrMax) : "");
    // Re-sync only when the selected zone or the underlying data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZone, prefs]);

  if (!hasPace && !hasHr) return null;

  const parsedPaceMin = paceMinText ? parsePaceString(paceMinText) : undefined;
  const parsedPaceMax = paceMaxText ? parsePaceString(paceMaxText) : undefined;
  const paceError = hasPace && (paceMinText !== "" || paceMaxText !== "") &&
    (parsedPaceMin === undefined || parsedPaceMax === undefined);

  const parsedHrMin = hrMinText ? Number(hrMinText) : undefined;
  const parsedHrMax = hrMaxText ? Number(hrMaxText) : undefined;
  const hrError = hasHr && (hrMinText !== "" || hrMaxText !== "") &&
    (parsedHrMin === undefined || !Number.isFinite(parsedHrMin) ||
      parsedHrMax === undefined || !Number.isFinite(parsedHrMax));

  function handleSave() {
    if (paceError || hrError) return;
    setZoneOverride(selectedZone, {
      paceMinPerKm: hasPace ? parsedPaceMin : undefined,
      paceMaxPerKm: hasPace ? parsedPaceMax : undefined,
      hrMin: hasHr ? parsedHrMin : undefined,
      hrMax: hasHr ? parsedHrMax : undefined,
    });
    toast.success(t("me.zones.saved"));
    onChange();
  }

  function handleResetZone() {
    setZoneOverride(selectedZone, null);
    toast.success(t("me.zones.saved"));
    onChange();
  }

  function handleResetAll() {
    clearAllZoneOverrides();
    toast.success(t("me.zones.saved"));
    onChange();
  }

  const columns: ResponsiveTableColumn<ZoneRange>[] = [
    {
      key: "zone",
      header: t("me.zones.adjustZoneLabel"),
      cell: (z) => (
        <span className={cn("inline-flex items-center gap-2 font-semibold", zoneClass(z.zone as ZoneNumber, "text"))}>
          <span className={cn("size-2.5 rounded-none", zoneClass(z.zone as ZoneNumber, "bg"))} />
          Z{z.zone} — {pickLang(ZONE_META[z.zone as ZoneNumber], "label")}
        </span>
      ),
    },
    {
      key: "pace",
      header: "min/km",
      cell: (z) =>
        z.paceMinPerKm !== undefined && z.paceMaxPerKm !== undefined
          ? `${formatPace(z.paceMinPerKm)}–${formatPace(z.paceMaxPerKm)}`
          : "—",
      hideOnMobile: !hasPace,
    },
    {
      key: "hr",
      header: "bpm",
      cell: (z) => (z.hrMin !== undefined && z.hrMax !== undefined ? `${z.hrMin}–${z.hrMax}` : "—"),
      hideOnMobile: !hasHr,
    },
    {
      key: "manual",
      header: "",
      cell: (z) =>
        z.isManual ? <Badge variant="secondary">{t("me.dashboard.manualBadge")}</Badge> : null,
    },
  ];

  return (
    <div className="space-y-4">
      {overlaps.length > 0 && (
        <div className="border-2 border-destructive p-4 space-y-2">
          {overlaps.map(([lower, upper]) => (
            <p key={`${lower}-${upper}`} className="text-sm text-foreground">
              {t("me.zones.overlapWarning", { lower, upper })}
            </p>
          ))}
          <p className="text-xs text-muted-foreground">{t("me.zones.overlapOnlyInsists")}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={handleResetAll}>
              {t("me.zones.overlapFix")}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <div>
          <label className="text-sm font-medium mb-1.5 block">{t("me.zones.adjustZoneLabel")}</label>
          <Select value={String(selectedZone)} onValueChange={(v) => setSelectedZone(Number(v) as ZoneNumber)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ZONE_NUMBERS.map((zone) => (
                <SelectItem key={zone} value={String(zone)}>
                  Z{zone} — {pickLang(ZONE_META[zone], "label")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {hasPace && (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {t("me.zones.adjustMinLabel")} (min/km)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="4:06"
                  value={paceMinText}
                  onChange={(e) => setPaceMinText(e.target.value)}
                  className={cn(
                    "flex h-9 w-full rounded-none border-2 bg-transparent px-3 py-1 text-sm font-mono",
                    "transition-[border-color] duration-150 ease-out outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring",
                    paceError ? "border-destructive" : "border-input"
                  )}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {t("me.zones.adjustMaxLabel")} (min/km)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="4:18"
                  value={paceMaxText}
                  onChange={(e) => setPaceMaxText(e.target.value)}
                  className={cn(
                    "flex h-9 w-full rounded-none border-2 bg-transparent px-3 py-1 text-sm font-mono",
                    "transition-[border-color] duration-150 ease-out outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring",
                    paceError ? "border-destructive" : "border-input"
                  )}
                />
              </div>
            </>
          )}
          {hasHr && (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {t("me.zones.adjustMinLabel")} (bpm)
                </label>
                <input
                  type="number"
                  value={hrMinText}
                  onChange={(e) => setHrMinText(e.target.value)}
                  className={cn(
                    "flex h-9 w-full rounded-none border-2 bg-transparent px-3 py-1 text-sm font-mono",
                    "transition-[border-color] duration-150 ease-out outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring",
                    hrError ? "border-destructive" : "border-input"
                  )}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {t("me.zones.adjustMaxLabel")} (bpm)
                </label>
                <input
                  type="number"
                  value={hrMaxText}
                  onChange={(e) => setHrMaxText(e.target.value)}
                  className={cn(
                    "flex h-9 w-full rounded-none border-2 bg-transparent px-3 py-1 text-sm font-mono",
                    "transition-[border-color] duration-150 ease-out outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring",
                    hrError ? "border-destructive" : "border-input"
                  )}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {selected?.isManual && (
        <div className="border-2 border-zone-3 p-4 space-y-1">
          <p className="font-mono text-[10px] tracking-wide uppercase text-zone-3">
            {t("me.zones.manualAdjustTitle")}
          </p>
          <p className="text-sm text-foreground">
            {t("me.zones.manualAdjustBody", {
              zone: selectedZone,
              current: hasPace && selected.paceMinPerKm !== undefined
                ? `${formatPace(selected.paceMinPerKm)}–${formatPace(selected.paceMaxPerKm!)}`
                : `${selected.hrMin}–${selected.hrMax}`,
              formula: (() => {
                const formula = formulaZones.find((z) => z.zone === selectedZone);
                if (!formula) return "—";
                return hasPace && formula.paceMinPerKm !== undefined
                  ? `${formatPace(formula.paceMinPerKm)}–${formatPace(formula.paceMaxPerKm!)}`
                  : `${formula.hrMin}–${formula.hrMax}`;
              })(),
            })}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} disabled={paceError || hrError}>
          <Save className="size-4 mr-2" />
          {t("me.zones.save")}
        </Button>
        {selected?.isManual && (
          <Button variant="outline" onClick={handleResetZone}>
            <RotateCcw className="size-4 mr-2" />
            {t("me.zones.resetZone")}
          </Button>
        )}
      </div>

      <ResponsiveTable
        data={zones}
        columns={columns}
        rowKey={(z) => z.zone}
        mobileCardTitle={(z) => `Z${z.zone}`}
      />
    </div>
  );
}

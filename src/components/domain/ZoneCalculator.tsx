import { useState, useEffect, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Save, Trash2, Heart, Gauge } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ZONE_META, type ZoneNumber, type UserZonePreferences } from "@/types";
import {
  calculateAllZones,
  formatPace,
  loadUserZonePrefs,
  saveUserZonePrefs,
  clearUserZonePrefs,
} from "@/lib/zones";
import { useSettings } from "@/hooks/useSettings";
import { convertPace, getSpeedUnit, getPaceUnit } from "@/lib/units";

export function ZoneCalculator() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  const [fcMax, setFcMax] = useState<string>("");
  const [vma, setVma] = useState<string>("");
  const [saved, setSaved] = useState(false);

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
    fcMax: fcMax ? parseFloat(fcMax) : undefined,
    vma: vma ? parseFloat(vma) : undefined,
  };

  const zones = calculateAllZones(prefs);
  const hasValues = prefs.fcMax || prefs.vma;

  const handleSave = () => {
    if (hasValues) {
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
                className="flex h-9 w-full max-w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="text-sm text-muted-foreground">bpm</span>
            </div>
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
                className="flex h-9 w-full max-w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="text-sm text-muted-foreground">{getSpeedUnit(unit)}</span>
            </div>
          </div>
        </div>

        {/* Zone Table */}
        {hasValues && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left font-medium">
                    {t("myZones.zoneCalculator.zone")}
                  </th>
                  {prefs.fcMax && (
                    <th className="py-2 px-3 text-left font-medium">
                      {t("myZones.zoneCalculator.heartRate")}
                    </th>
                  )}
                  {prefs.vma && (
                    <th className="py-2 px-3 text-left font-medium">
                      {t("myZones.zoneCalculator.pace")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {zones.map((z) => {
                  const meta = ZONE_META[z.zone as ZoneNumber];
                  return (
                    <tr
                      key={z.zone}
                      className={cn(
                        "border-b last:border-b-0",
                        `bg-${meta.color}/10`
                      )}
                    >
                      <td className="py-2 px-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 font-medium",
                            `text-${meta.color}`
                          )}
                        >
                          <span
                            className={cn(
                              "size-3 rounded-full",
                              `bg-${meta.color}`
                            )}
                          />
                          Z{z.zone} - {isEn ? meta.labelEn : meta.label}
                        </span>
                      </td>
                      {prefs.fcMax && (
                        <td className="py-2 px-3 tabular-nums">
                          {z.hrMin}-{z.hrMax} bpm
                        </td>
                      )}
                      {prefs.vma && (
                        <td className="py-2 px-3 tabular-nums">
                          {formatPace(convertPace(z.paceMinPerKm!, unit))}-
                          {formatPace(convertPace(z.paceMaxPerKm!, unit))} {getPaceUnit(unit)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!hasValues || saved}>
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

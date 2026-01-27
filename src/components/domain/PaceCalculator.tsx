import { useState, useEffect, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Timer, Gauge, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateRaceTimes } from "@/lib/paceCalculator";
import { loadUserZonePrefs } from "@/lib/zones";

export function PaceCalculator() {
  const { t } = useTranslation("common");

  const [vma, setVma] = useState<string>("");

  // Load stored VMA from user zone preferences on mount
  useEffect(() => {
    const prefs = loadUserZonePrefs();
    if (prefs?.vma) {
      setVma(prefs.vma.toString());
    }
  }, []);

  const vmaValue = vma ? parseFloat(vma) : 0;
  const raceEstimates = calculateRaceTimes(vmaValue);
  const hasVma = vmaValue > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="size-5" />
          {t("myZones.paceCalculator.title")}
        </CardTitle>
        <CardDescription>
          {t("myZones.paceCalculator.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* VMA Input */}
        <div className="space-y-2">
          <label
            htmlFor="pace-vma"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Gauge className="size-4 text-blue-500" />
            {t("myZones.zoneCalculator.vma")}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="pace-vma"
              type="number"
              min={8}
              max={30}
              step={0.5}
              placeholder="15"
              value={vma}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setVma(e.target.value);
              }}
              className="flex h-9 w-full max-w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-sm text-muted-foreground">km/h</span>
          </div>
        </div>

        {/* Race Times Table */}
        {hasVma ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left font-medium">
                    {t("myZones.paceCalculator.distance")}
                  </th>
                  <th className="py-2 px-3 text-left font-medium">
                    {t("myZones.paceCalculator.vmaPercent")}
                  </th>
                  <th className="py-2 px-3 text-left font-medium">
                    {t("myZones.paceCalculator.pace")}
                  </th>
                  <th className="py-2 px-3 text-left font-medium">
                    {t("myZones.paceCalculator.time")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {raceEstimates.map((estimate) => (
                  <tr
                    key={estimate.distance}
                    className="border-b last:border-b-0 hover:bg-muted/50"
                  >
                    <td className="py-2 px-3 font-medium">
                      {estimate.distance}
                    </td>
                    <td className="py-2 px-3 tabular-nums text-muted-foreground">
                      {estimate.vmaPercentage}%
                    </td>
                    <td className="py-2 px-3 tabular-nums">
                      {estimate.paceMinKm}/km
                    </td>
                    <td className="py-2 px-3 tabular-nums font-medium">
                      {estimate.estimatedTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Info className="size-4" />
            {t("myZones.paceCalculator.noVma")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

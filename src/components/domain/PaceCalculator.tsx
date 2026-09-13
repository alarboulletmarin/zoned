import { useState, useEffect, type ChangeEvent, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Timer, Gauge, Info } from "@/components/icons";
import { ShareLinkButton } from "@/components/domain/ShareLinkButton";
import { buildParamsUrl } from "@/lib/share/urlParams";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateRaceTimes } from "@/lib/paceCalculator";
import { loadUserZonePrefs } from "@/lib/zones";
import { useSettings } from "@/hooks/useSettings";
import {
  convertPace,
  convertDistanceText,
  getSpeedUnit,
  getPaceUnit,
} from "@/lib/units";

export function PaceCalculator() {
  const { t } = useTranslation("common");
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  // A shared link carries the sender's VMA, it wins over the stored one.
  const [searchParams] = useSearchParams();
  const sharedVma = searchParams.get("vma") ?? "";

  const [vma, setVma] = useState<string>(sharedVma);

  // Load stored VMA from user zone preferences on mount
  useEffect(() => {
    if (sharedVma) return;
    const prefs = loadUserZonePrefs();
    if (prefs?.vma) {
      setVma(prefs.vma.toString());
    }
  }, [sharedVma]);

  const vmaValue = vma ? parseFloat(vma) : 0;
  const raceEstimates = calculateRaceTimes(vmaValue);
  const hasVma = vmaValue > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="zn-calc__card-title">
          <Timer />
          {t("myZones.paceCalculator.title")}
        </CardTitle>
        <CardDescription>
          {t("myZones.paceCalculator.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="zn-stack" style={{ "--gap": "var(--sp-12)" } as CSSProperties}>
        {/* VMA Input */}
        <div className="zn-calc__field">
          <label htmlFor="pace-vma" className="zn-calc__label">
            <Gauge />
            {t("myZones.zoneCalculator.vma")}
          </label>
          <span className="zn-numfield" style={{ "--field-w": "64px" } as CSSProperties}>
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
              className="zn-numfield__input"
            />
            <span className="zn-numfield__unit">{getSpeedUnit(unit)}</span>
          </span>
        </div>

        {/* Race Times Table */}
        {hasVma ? (
          <div className="zn-stack">
            <div className="zn-pace zn-scroll-x">
              <table className="zn-pace__table">
                <thead>
                  <tr>
                    <th className="zn-pace__th">
                      {t("myZones.paceCalculator.distance")}
                    </th>
                    <th className="zn-pace__th">
                      {t("myZones.paceCalculator.vmaPercent")}
                    </th>
                    <th className="zn-pace__th">
                      {t("myZones.paceCalculator.pace")}
                    </th>
                    <th className="zn-pace__th">
                      {t("myZones.paceCalculator.time")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                {raceEstimates.map((estimate) => {
                  // Parse pace string "4:30" -> minutes
                  const [min, sec] = estimate.paceMinKm.split(":").map(Number);
                  const paceMinPerKm = min + sec / 60;
                  const convertedPace = convertPace(paceMinPerKm, unit);
                  const convertedMin = Math.floor(convertedPace);
                  const convertedSec = Math.round((convertedPace - convertedMin) * 60);
                  const paceDisplay = `${convertedMin}:${convertedSec.toString().padStart(2, "0")}`;

                  return (
                    <tr key={estimate.distance} className="zn-pace__row">
                      <td className="zn-pace__td zn-pace__td--name">
                        {convertDistanceText(estimate.distance, unit)}
                      </td>
                      <td className="zn-pace__td zn-pace__td--num">
                        {estimate.vmaPercentage}%
                      </td>
                      <td className="zn-pace__td zn-pace__td--num">
                        {paceDisplay}{getPaceUnit(unit)}
                      </td>
                      <td className="zn-pace__td zn-pace__td--total">
                        {estimate.estimatedTime}
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
            <div>
              <ShareLinkButton
                buildUrl={() => buildParamsUrl("/calculators/allures", { vma })}
                title={t("myZones.paceCalculator.title")}
              />
            </div>
          </div>
        ) : (
          <div className="zn-calc__empty">
            <Info />
            {t("myZones.paceCalculator.noVma")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

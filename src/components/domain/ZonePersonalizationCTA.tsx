import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Gauge } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { saveUserZonePrefs, validateZonePrefs } from "@/lib/zones";
import { cn } from "@/lib/utils";

/** The VMA field's DOM id, so the hero's primary action can focus it. */
export const ZONE_CTA_INPUT_ID = "zone-cta-vma";

interface ZonePersonalizationCTAProps {
  className?: string;
  /** Called once the VMA is stored, so the page can redraw with real paces. */
  onSaved: () => void;
}

export function ZonePersonalizationCTA({ className, onSaved }: ZonePersonalizationCTAProps) {
  const { t } = useTranslation("common");
  const [vma, setVma] = useState("");

  const parsed = vma === "" ? undefined : parseFloat(vma);
  const invalid = parsed !== undefined && validateZonePrefs({ vma: parsed }).vma === undefined;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (parsed === undefined || invalid) return;
    saveUserZonePrefs({ vma: parsed });
    onSaved();
  };

  return (
    // Stacks vertically on mobile so the field never overlaps the text;
    // reverts to the inline row at 640px.
    <form className={cn("zn-zone-cta", className)} onSubmit={handleSubmit}>
      <div className="zn-zone-cta__body">
        <Gauge className="zn-zone-cta__icon" />
        <p className="zn-zone-cta__text">
          <label htmlFor={ZONE_CTA_INPUT_ID}>{t("zonePersonalization.ctaMessage")}</label>
          <Link to="/calculators/vma" className="zn-zone-cta__help">
            {t("zonePersonalization.noVma")}
          </Link>
        </p>
      </div>
      <div className="zn-zone-cta__actions">
        <span className="zn-numfield" data-invalid={invalid ? "true" : undefined}>
          <input
            id={ZONE_CTA_INPUT_ID}
            type="number"
            inputMode="decimal"
            step="0.5"
            min={8}
            max={30}
            placeholder="15"
            value={vma}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setVma(e.target.value)}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? `${ZONE_CTA_INPUT_ID}-error` : undefined}
            className="zn-numfield__input"
          />
          <span className="zn-numfield__unit">km/h</span>
        </span>
        <Button type="submit" size="sm" disabled={parsed === undefined || invalid}>
          {t("zonePersonalization.submit")}
        </Button>
      </div>
      {invalid && (
        <p id={`${ZONE_CTA_INPUT_ID}-error`} className="zn-zone-cta__error" role="alert">
          {t("myZones.zoneCalculator.invalidVma")}
        </p>
      )}
    </form>
  );
}

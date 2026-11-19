import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loadUserZonePrefs, saveUserZonePrefs, validateZonePrefs } from "@/lib/zones";
import type { UserZonePreferences } from "@/types";
import { cn } from "@/lib/utils";
import { useIsEnglish } from "@/lib/i18n-utils";

/** The VMA field's DOM id, so another control can focus it. */
export const ZONE_CTA_INPUT_ID = "zone-cta-vma";

interface ZonePersonalizationCTAProps {
  className?: string;
  /** Les zones déjà enregistrées, `null` sans rien. */
  current: UserZonePreferences | null;
  /** Called once the VMA is stored, so the page can redraw with real paces. */
  onSaved: () => void;
}

/**
 * L'encart VMA de la page de séance, juste au-dessus des blocs dont il
 * remplit les allures. Deux états :
 *
 * - **sans zones** : une ligne en pointillés, le champ, un bouton contour et
 *   un lien souligné vers le calcul de la VMA. Aucun vermillon : l'action
 *   principale de l'écran est ailleurs ;
 * - **avec zones** : une ligne mono qui dit pour quelle VMA (ou quelle FC
 *   max) les allures sont écrites, et Modifier, qui rouvre le champ prérempli.
 *
 * L'enregistrement garde la FC max déjà saisie : changer sa VMA ne doit pas
 * effacer ses fréquences.
 */
export function ZonePersonalizationCTA({ className, current, onSaved }: ZonePersonalizationCTAProps) {
  const { t } = useTranslation(["session", "common"]);
  const isEn = useIsEnglish();
  const [editing, setEditing] = useState(false);
  const [vma, setVma] = useState(current?.vma != null ? String(current.vma) : "");

  const parsed = vma === "" ? undefined : parseFloat(vma.replace(",", "."));
  const invalid = parsed !== undefined && validateZonePrefs({ vma: parsed }).vma === undefined;
  const hasZones = current != null && (current.vma != null || current.fcMax != null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (parsed === undefined || invalid) return;
    saveUserZonePrefs({ ...(loadUserZonePrefs() ?? {}), vma: parsed });
    setEditing(false);
    onSaved();
  };

  if (hasZones && !editing) {
    return (
      <p className={cn("zn-zone-line", className)}>
        <span>
          {current.vma != null
            ? t("session:page.zonesForVma", { vma: isEn ? String(current.vma) : String(current.vma).replace(".", ",") })
            : t("session:page.zonesForHr", { fcMax: current.fcMax })}
        </span>
        <button
          type="button"
          className="zn-zone-line__edit"
          aria-label={t("session:page.zonesEditLabel")}
          onClick={() => {
            setVma(current.vma != null ? String(current.vma) : "");
            setEditing(true);
          }}
        >
          {t("session:page.zonesEdit")}
        </button>
      </p>
    );
  }

  return (
    <form className={cn("zn-zone-cta", className)} onSubmit={handleSubmit}>
      <p className="zn-zone-cta__text">
        <label htmlFor={ZONE_CTA_INPUT_ID}>{t("session:page.vmaPrompt")}</label>
        <Link to="/calculators/vma" className="zn-zone-cta__help">
          {t("common:zonePersonalization.noVma")}
        </Link>
      </p>
      <div className="zn-zone-cta__actions">
        <span className="zn-numfield zn-zone-cta__field" data-invalid={invalid ? "true" : undefined}>
          <input
            id={ZONE_CTA_INPUT_ID}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="15"
            value={vma}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setVma(e.target.value)}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? `${ZONE_CTA_INPUT_ID}-error` : undefined}
            className="zn-numfield__input"
          />
          <span className="zn-numfield__unit">km/h</span>
        </span>
        <button
          type="submit"
          className="zn-zone-cta__submit"
          disabled={parsed === undefined || invalid}
        >
          {t("session:page.vmaSubmit")}
        </button>
      </div>
      {invalid && (
        <p id={`${ZONE_CTA_INPUT_ID}-error`} className="zn-zone-cta__error" role="alert">
          {t("common:myZones.zoneCalculator.invalidVma")}
        </p>
      )}
    </form>
  );
}

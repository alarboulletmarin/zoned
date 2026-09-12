import type { CSSProperties } from "react";
import { Segmented } from "@/components/ui/segmented";
import type { TerrainType } from "@/types";
import type { StepContext, StepDef } from "../types";

/** Les trois terrains qu'un trail traverse, du plus roulant au plus raide. */
const TERRAINS: TerrainType[] = ["trail_runnable", "trail_technical", "mountain"];

/**
 * Le terrain et le dénivelé — trail et ultra seulement.
 *
 * Le champ dénivelé existait déjà, mais il était posé sur l'écran d'allure et
 * rendait SANS CONDITION : quelqu'un qui préparait un 5 km sur route se
 * faisait demander un D+. Le booléen `isTrail` de cet écran ne gouvernait
 * qu'une phrase d'aide. Le champ n'est donc pas inventé ici, il est remis là
 * où il veut dire quelque chose.
 *
 * Le terrain, lui, est nouveau, et il n'écrit qu'une préférence : il oriente
 * la sélection des séances via leur `terrainType`. **Aucune formule du moteur
 * ne bouge** — c'est la ligne de périmètre de tout ce chantier.
 */
function TerrainBody({ form, setForm, uid, t }: StepContext) {
  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
      <div className="zn-contrib-field">
        <span className="zn-contrib-field__label">{t("terrain.kind")}</span>
        <Segmented
          label={t("terrain.kind")}
          value={form.terrain}
          onChange={(v) => setForm((f) => ({ ...f, terrain: v as TerrainType }))}
          options={TERRAINS.map((kind) => ({
            value: kind,
            label: t(`terrain.kinds.${kind}`),
          }))}
        />
        <p className="zn-caption zn-faint">{t("terrain.kindDesc")}</p>
      </div>

      <div className="zn-contrib-field">
        <label className="zn-contrib-field__label" htmlFor={`${uid}-elevation`}>
          {t("terrain.elevation")}
        </label>
        <input
          id={`${uid}-elevation`}
          type="number"
          inputMode="numeric"
          min={0}
          max={10000}
          data-mono="true"
          className="zn-contrib-input"
          placeholder={t("terrain.elevationPlaceholder")}
          value={form.elevationGain}
          aria-describedby={`${uid}-elevation-hint`}
          onChange={(e) => setForm((f) => ({ ...f, elevationGain: e.target.value }))}
        />
        <p id={`${uid}-elevation-hint`} className="zn-caption zn-faint">
          {t("terrain.elevationDesc")}
        </p>
      </div>
    </div>
  );
}

export const terrainStep: StepDef = {
  id: "terrain",
  titleKey: "terrain.title",
  subtitleKey: "terrain.subtitle",
  Body: TerrainBody,
  isComplete: () => true,
  nextLabelKey: "nav.continue",
  showSkip: true,
};

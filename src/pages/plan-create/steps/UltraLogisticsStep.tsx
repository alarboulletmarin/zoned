import type { CSSProperties } from "react";
import { Switch } from "@/components/ui/switch";
import type { StepContext, StepDef } from "../types";

/**
 * La logistique d'un ultra : ce qui se répète à l'entraînement parce que ça
 * arrivera en course, la nuit, l'estomac, les bâtons, et deux jours de suite.
 *
 * Cette étape n'écrit QUE des préférences. Elle oriente la sélection des
 * séances par leurs tags (`time-on-feet`, `back_to_back`, `hike-run`,
 * `nutrition-practice`), et elle le dit. **Aucune formule du moteur ne
 * bouge** : `planGenerator/**` ne reçoit aucune édition de ce chantier, parce
 * que ses tables d'ultra, volume, phases, affûtage, sont déjà complètes.
 */
const TOGGLES = [
  { key: "ultraNight", labelKey: "ultra.night", descKey: "ultra.nightDesc" },
  { key: "ultraFuelling", labelKey: "ultra.fuelling", descKey: "ultra.fuellingDesc" },
  { key: "ultraPoles", labelKey: "ultra.poles", descKey: "ultra.polesDesc" },
  { key: "ultraBackToBack", labelKey: "ultra.backToBack", descKey: "ultra.backToBackDesc" },
] as const;

function UltraLogisticsBody({ form, setForm, uid, t }: StepContext) {
  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-10)" } as CSSProperties}>
      {TOGGLES.map(({ key, labelKey, descKey }) => (
        <div key={key} className="zn-stack" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
          <div className="zn-contrib-toggle">
            <label className="zn-contrib-toggle__label" htmlFor={`${uid}-${key}`}>
              {t(labelKey)}
            </label>
            <Switch
              id={`${uid}-${key}`}
              checked={form[key]}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, [key]: !!checked }))}
            />
          </div>
          <p className="zn-caption zn-faint">{t(descKey)}</p>
        </div>
      ))}
    </div>
  );
}

export const ultraLogisticsStep: StepDef = {
  id: "ultra_logistics",
  titleKey: "ultra.title",
  subtitleKey: "ultra.subtitle",
  Body: UltraLogisticsBody,
  isComplete: () => true,
  nextLabelKey: "nav.continue",
  showSkip: true,
};

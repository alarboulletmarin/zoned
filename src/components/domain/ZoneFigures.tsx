/**
 * ZoneFigures, la planche des six zones.
 *
 * Le même corps, six fois, du pas de marche au sprint. C'est le seul endroit de
 * l'app où le dessin explique au lieu d'accompagner : lues de gauche à droite,
 * les six postures disent la montée en effort sans une ligne de texte, et la
 * table qui suit met les chiffres dessous.
 *
 * Les six se tiennent sur UNE règle droite, le sol dessiné a quitté les
 * fichiers, le bas du viewBox de chaque figure est sa semelle, et c'est le
 * bord bas de sa case qui lui sert de sol. Sous la règle, comme des
 * graduations : le code, le nom, et quand les chiffres du lecteur sont connus
 * (`zones` non vide) la plage de sa zone, l'allure si la VMA est là, sinon la
 * fréquence cardiaque.
 *
 * L'encre de chaque figure est celle de sa zone dans la rampe, Z1 pâle, Z6
 * pleine. L'effort est donc encodé deux fois, par la posture et par le poids du
 * trait, ce qui est exactement la redondance que le système impose déjà aux
 * blocs de séance (teinte + hauteur). Le vermillon reste au contact avec le sol.
 *
 * Chaque figure est dimensionnée depuis la largeur de son viewBox, à une
 * échelle commune (`--zfig-scale`, en CSS) : les six sont le même corps, donc
 * la même échelle, une figure penchée est plus large qu'une figure debout,
 * pas plus grande.
 *
 * Accessibilité : une seule image, un seul nom. Codes, noms et plages sont
 * décoratifs ici, la table ou les cartes dessous les portent comme du texte,
 * et les faire lire deux fois ne dit rien de plus.
 */

import type { CSSProperties } from "react";
import Zone1 from "@/assets/doodles/zone-1.svg?react";
import Zone2 from "@/assets/doodles/zone-2.svg?react";
import Zone3 from "@/assets/doodles/zone-3.svg?react";
import Zone4 from "@/assets/doodles/zone-4.svg?react";
import Zone5 from "@/assets/doodles/zone-5.svg?react";
import Zone6 from "@/assets/doodles/zone-6.svg?react";
import { ZONE_META, type ZoneNumber, type ZoneRange } from "@/types";
import { formatPace } from "@/lib/zones";
import { convertPace, getPaceUnit } from "@/lib/units";
import { useSettings } from "@/hooks/useSettings";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";

/** Les six figures et la largeur de leur viewBox (src/assets/doodles/zone-N.svg). */
const FIGURES: [typeof Zone1, number][] = [
  [Zone1, 154.9],
  [Zone2, 172.2],
  [Zone3, 181.9],
  [Zone4, 175.5],
  [Zone5, 180.5],
  [Zone6, 187.2],
];

interface ZoneFiguresProps {
  /** Nom accessible de la planche entière. */
  label: string;
  /** Les plages du lecteur, de calculateAllZones ; vide ou absent : les noms seuls. */
  zones?: ZoneRange[];
  className?: string;
}

export function ZoneFigures({ label, zones, className }: ZoneFiguresProps) {
  const pickLang = usePickLang();
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  const rangeOf = (zone: ZoneNumber): string | null => {
    const z = zones?.find((r) => r.zone === zone);
    if (!z) return null;
    if (z.paceMinPerKm !== undefined && z.paceMaxPerKm !== undefined) {
      return `${formatPace(convertPace(z.paceMinPerKm, unit))}-${formatPace(convertPace(z.paceMaxPerKm, unit))}${getPaceUnit(unit)}`;
    }
    if (z.hrMin !== undefined && z.hrMax !== undefined) {
      return `${z.hrMin}-${z.hrMax} bpm`;
    }
    return null;
  };

  return (
    <div role="img" aria-label={label} className={cn("zn-zfig", className)}>
      {FIGURES.map(([Art, vbWidth], i) => {
        const zone = (i + 1) as ZoneNumber;
        const range = rangeOf(zone);
        return (
          <div
            key={zone}
            className="zn-zfig__cell"
            style={
              {
                "--zfig-ink": `var(--zone-${zone})`,
                "--zfig-vw": vbWidth,
              } as CSSProperties
            }
          >
            <div className="zn-zfig__stage">
              <Art className="zn-zfig__art" aria-hidden="true" focusable="false" />
            </div>
            <div className="zn-zfig__tick" aria-hidden="true">
              <span className="zn-zfig__code">Z{zone}</span>
              <span className="zn-zfig__name">{pickLang(ZONE_META[zone], "label")}</span>
              {range && <span className="zn-zfig__range">{range}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

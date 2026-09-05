/**
 * ZoneFigures — la planche des six zones.
 *
 * Le même corps, six fois, du pas de marche au sprint. C'est le seul endroit de
 * l'app où le dessin explique au lieu d'accompagner : lues de gauche à droite,
 * les six postures disent la montée en effort sans une ligne de texte, et la
 * table qui suit met les chiffres dessous.
 *
 * L'encre de chaque figure est celle de sa zone dans la rampe — Z1 pâle, Z6
 * pleine. L'effort est donc encodé deux fois, par la posture et par le poids du
 * trait, ce qui est exactement la redondance que le système impose déjà aux
 * blocs de séance (teinte + hauteur). Le vermillon reste au contact avec le sol.
 *
 * Accessibilité : une seule image, un seul nom. Les six codes Z1..Z6 sont
 * décoratifs ici — la table dessous les porte comme du texte, et les faire lire
 * deux fois ne dit rien de plus.
 */

import type { CSSProperties } from "react";
import Zone1 from "@/assets/doodles/zone-1.svg?react";
import Zone2 from "@/assets/doodles/zone-2.svg?react";
import Zone3 from "@/assets/doodles/zone-3.svg?react";
import Zone4 from "@/assets/doodles/zone-4.svg?react";
import Zone5 from "@/assets/doodles/zone-5.svg?react";
import Zone6 from "@/assets/doodles/zone-6.svg?react";
import { cn } from "@/lib/utils";

const FIGURES = [Zone1, Zone2, Zone3, Zone4, Zone5, Zone6];

interface ZoneFiguresProps {
  /** Nom accessible de la planche entière. */
  label: string;
  className?: string;
}

export function ZoneFigures({ label, className }: ZoneFiguresProps) {
  return (
    <div role="img" aria-label={label} className={cn("zn-zfig", className)}>
      {FIGURES.map((Art, i) => (
        <div
          key={i}
          className="zn-zfig__cell"
          style={{ "--zfig-ink": `var(--zone-${i + 1})` } as CSSProperties}
        >
          <Art className="zn-zfig__art" aria-hidden="true" focusable="false" />
          <span className="zn-zfig__code" aria-hidden="true">
            Z{i + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

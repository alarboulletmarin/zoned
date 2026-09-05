/**
 * Annotation — une légende manuscrite qui montre un endroit de la page.
 *
 * Le registre vient des notices annotées à la main : une phrase courte, une
 * flèche tracée, et parfois quelqu'un qui montre. Il sert là où une légende
 * posée sous un bloc ne suffit pas — quand ce qu'il faut comprendre est *un
 * endroit* du bloc, pas le bloc entier.
 *
 * Trois raisons pour lesquelles ça ne contredit pas la règle « des personnages,
 * jamais d'objets » de docs/doodles.md : une flèche n'est pas un objet
 * représenté mais une marque d'annotation, du même ordre que la ligne de sol ;
 * aucun glyphe Material ne fait ce travail, donc elle n'entre en concurrence
 * avec rien ; et la variante `figure` remet un personnage au départ du trait.
 *
 * La flèche est en encre, jamais en vermillon. L'accent reste réservé au
 * contact avec le sol — une flèche rouge ferait un second point focal sur
 * chaque écran qui en porte une.
 *
 * Placement : le composant se pose dans le flux, juste avant ou juste après le
 * bloc qu'il désigne, et la flèche pointe vers lui. Pas de positionnement
 * absolu : une annotation calée en pixels sur une cible qui bouge se retrouve à
 * désigner le vide dès que la colonne change de largeur.
 *
 * Le texte est du contenu, il se lit ; la flèche et la figure sont muettes.
 */

import type { FunctionComponent, SVGProps } from "react";
import ArrowDownRight from "@/assets/doodles/arrow-down-right.svg?react";
import ArrowDownLeft from "@/assets/doodles/arrow-down-left.svg?react";
import ArrowUpRight from "@/assets/doodles/arrow-up-right.svg?react";
import ArrowHook from "@/assets/doodles/arrow-hook.svg?react";
import Pointing from "@/assets/doodles/pointing.svg?react";
import { cn } from "@/lib/utils";

const ARROWS: Record<string, FunctionComponent<SVGProps<SVGElement>>> = {
  "down-right": ArrowDownRight,
  "down-left": ArrowDownLeft,
  "up-right": ArrowUpRight,
  hook: ArrowHook,
};

interface AnnotationProps {
  /** La phrase. Courte : deux lignes de mono, pas un paragraphe. */
  text: string;
  /** Le sens du trait. `up-*` quand l'annotation est SOUS sa cible. */
  arrow?: keyof typeof ARROWS;
  /** Pose la figure qui montre au départ du trait. Une par écran, au plus. */
  figure?: boolean;
  /** Bord sur lequel l'annotation s'aligne dans sa colonne. */
  align?: "start" | "end";
  className?: string;
}

export function Annotation({
  text,
  arrow = "down-right",
  figure = false,
  align = "start",
  className,
}: AnnotationProps) {
  const Arrow = ARROWS[arrow];

  return (
    <p
      className={cn("zn-note", className)}
      data-arrow={arrow}
      data-align={align}
    >
      {figure && (
        <Pointing className="zn-note__figure" aria-hidden="true" focusable="false" />
      )}
      <span className="zn-note__text">{text}</span>
      <Arrow className="zn-note__arrow" aria-hidden="true" focusable="false" />
    </p>
  );
}

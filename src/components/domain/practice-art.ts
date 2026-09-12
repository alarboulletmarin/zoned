import type { FunctionComponent, SVGProps } from "react";
import Climbing from "@/assets/doodles/climbing.svg?react";
import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import Standing from "@/assets/doodles/standing.svg?react";
import WalkingAway from "@/assets/doodles/walking-away.svg?react";
import type { Practice } from "@/types/practice";

/**
 * La figure de chaque pratique. Une seule table, pour que les trois surfaces
 * qui en montrent une ne divergent pas.
 *
 * Trois des quatre sont des RÉEMPLOIS, et c'est un choix, pas une économie :
 *
 *   route     `runners-duo` — le dessin approuvé du projet. Il ne se retouche
 *             pas et il n'avait pas à être remplacé.
 *   ultra     `walking-away` — la figure qui s'éloigne. C'est exactement ce
 *             que l'ultra est : du temps sur les pieds, et on avance.
 *   triathlon `standing` — debout, bras qui pendent. Elle sert déjà l'état
 *             « rien de commencé », et c'est précisément le statut du
 *             triathlon : annoncé, pas livré. La même figure pour le même
 *             sens, ce qui est de la cohésion et non un raccourci.
 *   trail     `climbing` — la seule à avoir été dessinée pour ce chantier
 *             (scripts/doodles/practices.mjs, huit tours). Rien dans les
 *             vingt-trois dessins ne disait la pente.
 *
 * « Une figure de plus ne se juge pas sur la place disponible mais sur ce
 * qu'elle retire » (docs/doodles.md). Trois réemplois, un dessin.
 *
 * Le type est celui qu'`EmptyState.art` attend : un SVG importé avec `?react`.
 */
export const PRACTICE_ART: Record<
  Practice,
  FunctionComponent<SVGProps<SVGElement>>
> = {
  road: RunnersDuo,
  trail: Climbing,
  ultra: WalkingAway,
  triathlon: Standing,
};

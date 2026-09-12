import type { FunctionComponent, SVGProps } from "react";
import DoorToday from "@/assets/doodles/door-today.svg?react";
import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import Standing from "@/assets/doodles/standing.svg?react";
import WalkingAway from "@/assets/doodles/walking-away.svg?react";
import type { Practice } from "@/types/practice";

/**
 * La figure de chaque pratique. Une seule table, pour que les trois surfaces
 * qui en montrent une ne divergent pas.
 *
 * **Les quatre sont des réemplois**, et la quatrième l'est devenue en revue.
 * Une figure avait été dessinée pour le trail — `climbing`, huit tours de
 * relecture — et elle a été jetée : rastérisée à côté de `door-today`, c'était
 * LA MÊME POSE à quelques degrés d'inclinaison près. Le tour 6 l'avait comparée
 * à `easy-run` et au duo, c'est-à-dire à tout sauf au dessin dont elle était le
 * jumeau. Deux dessins pour une pose, c'est exactement la masse que ce chantier
 * retire. Le constat est consigné dans docs/doodles.md.
 *
 * Donc quatre réemplois, et c'est un choix, pas une économie :
 *
 *   route     `runners-duo` — le dessin approuvé du projet. Il ne se retouche
 *             pas et il n'avait pas à être remplacé.
 *   ultra     `walking-away` — la figure qui s'éloigne. C'est exactement ce
 *             que l'ultra est : du temps sur les pieds, et on avance.
 *   triathlon `standing` — debout, bras qui pendent. Elle sert déjà l'état
 *             « rien de commencé », et c'est précisément le statut du
 *             triathlon : annoncé, pas livré. La même figure pour le même
 *             sens, ce qui est de la cohésion et non un raccourci.
 *   trail     `door-today` — la foulée penchée, genou haut, appui planté. Elle
 *             sert déjà la porte « aujourd'hui » et la clôture du cockpit ;
 *             aucun écran n'en montre deux à la fois, et la répétition est ce
 *             qui fait lire une famille (docs/doodles.md).
 *
 * « Une figure de plus ne se juge pas sur la place disponible mais sur ce
 * qu'elle retire » (docs/doodles.md). Zéro dessin ajouté.
 *
 * Le type est celui qu'`EmptyState.art` attend : un SVG importé avec `?react`.
 */
export const PRACTICE_ART: Record<
  Practice,
  FunctionComponent<SVGProps<SVGElement>>
> = {
  road: RunnersDuo,
  trail: DoorToday,
  ultra: WalkingAway,
  triathlon: Standing,
};

import type { FunctionComponent, SVGProps } from "react";
import DoorToday from "@/assets/doodles/door-today.svg?react";
import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import type { Practice } from "@/types/practice";

/**
 * La figure de chaque pratique. Une seule table, pour que les trois surfaces
 * qui en montrent une ne divergent pas.
 *
 * **Les deux sont des réemplois**, et celle du trail l'est devenue en revue.
 * Une figure avait été dessinée pour le trail, `climbing`, huit tours de
 * relecture, et elle a été jetée : rastérisée à côté de `door-today`, c'était
 * LA MÊME POSE à quelques degrés d'inclinaison près. Le tour 6 l'avait comparée
 * à `easy-run` et au duo, c'est-à-dire à tout sauf au dessin dont elle était le
 * jumeau. Deux dessins pour une pose, c'est exactement la masse que ce chantier
 * retire. Le constat est consigné dans docs/doodles.md.
 *
 * Donc deux réemplois, et c'est un choix, pas une économie :
 *
 *   route     `runners-duo`, le dessin approuvé du projet. Il ne se retouche
 *             pas et il n'avait pas à être remplacé.
 *   trail     `door-today`, la foulée penchée, genou haut, appui planté. Elle
 *             sert déjà la porte aujourd'hui et la clôture du cockpit ;
 *             aucun écran n'en montre deux à la fois, et la répétition est ce
 *             qui fait lire une famille (docs/doodles.md).
 *
 * Une figure de plus ne se juge pas sur la place disponible mais sur ce
 * qu'elle retire (docs/doodles.md). Zéro dessin ajouté.
 *
 * Le type est celui qu'`EmptyState.art` attend : un SVG importé avec `?react`.
 */
export const PRACTICE_ART: Record<
  Practice,
  FunctionComponent<SVGProps<SVGElement>>
> = {
  road: RunnersDuo,
  trail: DoorToday,
};

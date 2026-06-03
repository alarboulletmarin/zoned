import type { PrebuiltWeek } from "./types";
import { baseAerobie } from "./weeks/base-aerobie";
import { blocDeveloppement } from "./weeks/bloc-developpement";
import { affutageVo2 } from "./weeks/affutage-vo2";
import { recuperation } from "./weeks/recuperation";
import { grosVolume } from "./weeks/gros-volume";
import { repriseDouce } from "./weeks/reprise-douce";

const allWeeks: PrebuiltWeek[] = [
  baseAerobie,
  blocDeveloppement,
  affutageVo2,
  grosVolume,
  recuperation,
  repriseDouce,
];

const bySlug = new Map(allWeeks.map((w) => [w.slug, w]));

export function getAllPrebuiltWeeks(): PrebuiltWeek[] {
  return allWeeks;
}

export function getPrebuiltWeekBySlug(slug: string): PrebuiltWeek | undefined {
  return bySlug.get(slug);
}

export type { PrebuiltWeek, PrebuiltWeekSession, PrebuiltWeekCategory } from "./types";

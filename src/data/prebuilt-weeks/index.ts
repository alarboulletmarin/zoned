import type { PrebuiltWeek } from "./types";
import { premiersPas } from "./weeks/premiers-pas";
import { baseAerobie } from "./weeks/base-aerobie";
import { blocDeveloppement } from "./weeks/bloc-developpement";
import { blocCotes } from "./weeks/bloc-cotes";
import { grosVolume } from "./weeks/gros-volume";
import { semainePic } from "./weeks/semaine-pic";
import { allureSpecifique } from "./weeks/allure-specifique";
import { affutageVo2 } from "./weeks/affutage-vo2";
import { recuperation } from "./weeks/recuperation";
import { repriseDouce } from "./weeks/reprise-douce";

// Ordered as a training cycle reads: entry point, base, build, peak,
// sharpening, then the two lighter weeks.
const allWeeks: PrebuiltWeek[] = [
  premiersPas,
  baseAerobie,
  blocDeveloppement,
  blocCotes,
  grosVolume,
  semainePic,
  allureSpecifique,
  affutageVo2,
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

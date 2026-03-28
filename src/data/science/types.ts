import type { TargetSystem, ZoneNumber } from "@/types";

export interface ScientificReference {
  authors: string;
  year: number;
  title: string;
  journal: string;
  link?: string;
}

export interface TargetSystemScience {
  rationale: string;
  rationaleEn: string;
  zoneRationale: { zone: ZoneNumber; why: string; whyEn: string }[];
  adaptations: string[];
  adaptationsEn: string[];
  references: ScientificReference[];
}

export type TargetSystemScienceMap = Record<TargetSystem, TargetSystemScience>;

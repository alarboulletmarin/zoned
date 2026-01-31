import type { WorkoutCategory, ZoneNumber } from "@/types";

export type TipCategory = "training" | "physiology" | "nutrition" | "recovery" | "culture";

export interface Tip {
  id: string;
  text: string;
  textEn: string;
  category: TipCategory;
  relatedZones?: ZoneNumber[];
  relatedCategories?: WorkoutCategory[];
  relatedTermId?: string; // Lien glossaire
  articleId?: string; // Lien article
}

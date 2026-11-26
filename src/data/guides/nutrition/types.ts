export interface NutritionSection {
  id: string;
  title: string;
  titleEn: string;
  titleIt?: string;
  icon: string; // Lucide icon name
  content: NutritionBlock[];
}

export interface NutritionBlock {
  type: "paragraph" | "list" | "tip" | "warning" | "table";
  text?: string;
  textEn?: string;
  textIt?: string;
  items?: { text: string; textEn: string; textIt?: string }[];
  rows?: { label: string; labelEn: string; labelIt?: string; value: string; valueEn: string; valueIt?: string }[];
}

export interface FuelingStrategy {
  durationRange: [number, number]; // minutes
  carbsPerHourG: [number, number];
  fluidMlPerHour: [number, number];
  sodiumMgPerHour: [number, number];
  gelFrequencyMin: number;
  notes: string;
  notesEn: string;
  notesIt?: string;
}

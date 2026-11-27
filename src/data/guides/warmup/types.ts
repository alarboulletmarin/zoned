export interface WarmupSection {
  id: string;
  title: string;
  titleEn: string;
  titleIt?: string;
  icon: string;
  content: ContentBlock[];
}

export interface ContentBlock {
  type: "paragraph" | "list" | "exercise" | "tip" | "warning";
  text?: string;
  textEn?: string;
  textIt?: string;
  items?: { text: string; textEn: string; textIt?: string }[];
  exercises?: Exercise[];
}

export interface Exercise {
  name: string;
  nameEn: string;
  nameIt?: string;
  description: string;
  descriptionEn: string;
  descriptionIt?: string;
  durationSeconds?: number;
  repetitions?: number;
  sets?: number;
}

export interface WarmupRoutine {
  id: string;
  name: string;
  nameEn: string;
  nameIt?: string;
  targetSessionType: string;
  totalDurationMin: number;
  exercises: Exercise[];
}

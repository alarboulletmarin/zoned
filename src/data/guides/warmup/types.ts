export interface WarmupSection {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  content: ContentBlock[];
}

export interface ContentBlock {
  type: "paragraph" | "list" | "exercise" | "tip" | "warning";
  text?: string;
  textEn?: string;
  items?: { text: string; textEn: string }[];
  exercises?: Exercise[];
}

export interface Exercise {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  durationSeconds?: number;
  repetitions?: number;
  sets?: number;
}

export interface WarmupRoutine {
  id: string;
  name: string;
  nameEn: string;
  targetSessionType: string;
  totalDurationMin: number;
  exercises: Exercise[];
}

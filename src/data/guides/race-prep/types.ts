export interface RacePrepSection {
  id: string;
  title: string;
  titleEn: string;
  titleIt?: string;
  icon: string;
  content: ContentBlock[];
}

export interface ContentBlock {
  type: "paragraph" | "list" | "tip" | "warning" | "checklist" | "timeline" | "table";
  text?: string;
  textEn?: string;
  textIt?: string;
  items?: { text: string; textEn: string; textIt?: string; checked?: boolean }[];
  rows?: { label: string; labelEn: string; labelIt?: string; value: string; valueEn: string; valueIt?: string }[];
}

export interface RecoveryTimeline {
  distance: string;
  distanceEn: string;
  distanceIt?: string;
  totalDays: number;
  phases: { dayRange: string; activity: string; activityEn: string; activityIt?: string }[];
}

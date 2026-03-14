export interface RacePrepSection {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  content: ContentBlock[];
}

export interface ContentBlock {
  type: "paragraph" | "list" | "tip" | "warning" | "checklist" | "timeline" | "table";
  text?: string;
  textEn?: string;
  items?: { text: string; textEn: string; checked?: boolean }[];
  rows?: { label: string; labelEn: string; value: string; valueEn: string }[];
}

export interface RecoveryTimeline {
  distance: string;
  distanceEn: string;
  totalDays: number;
  phases: { dayRange: string; activity: string; activityEn: string }[];
}

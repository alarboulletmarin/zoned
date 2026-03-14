export type ChangeType = "added" | "changed" | "fixed" | "performance";

export interface ChangelogItem {
  text: string; // FR
  textEn: string; // EN
  category?: string;
  categoryEn?: string;
}

export interface ChangelogVersion {
  version: string;
  date: string;
  changes: Partial<Record<ChangeType, ChangelogItem[]>>;
}

export type ChangeType = "added" | "changed" | "fixed" | "performance";

export interface ChangelogItem {
  text: string; // FR
  textEn: string; // EN
  textIt?: string; // IT
  category?: string;
  categoryEn?: string;
  categoryIt?: string;
}

export interface ChangelogVersion {
  version: string;
  date: string;
  changes: Partial<Record<ChangeType, ChangelogItem[]>>;
}

export interface MetSection {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  content: MetBlock[];
}

export interface MetBlock {
  type: "paragraph" | "list" | "tip" | "warning" | "formula" | "table";
  text?: string;
  textEn?: string;
  items?: { text: string; textEn: string }[];
  rows?: { label: string; labelEn: string; value: string; valueEn: string }[];
  formula?: string;
}

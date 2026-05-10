import type { ThemeAccent, SupplementVerdict, AisCategory } from "@/data/nutrition/types";

interface AccentClasses {
  /** Card gradient + border, applied with `bg-gradient-to-br`. */
  card: string;
  /** Solid soft background (e.g. icon box, eyebrow chip). */
  bg: string;
  /** Foreground text color in accent hue. */
  text: string;
  /** Border accent only. */
  border: string;
}

export const ACCENT_CLASSES: Record<ThemeAccent, AccentClasses> = {
  amber: {
    card: "from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-500/25 dark:via-amber-500/10 border-amber-500/30",
    bg: "bg-amber-100 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/40",
  },
  blue: {
    card: "from-blue-500/15 via-blue-500/5 to-transparent dark:from-blue-500/25 dark:via-blue-500/10 border-blue-500/30",
    bg: "bg-blue-100 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/40",
  },
  rose: {
    card: "from-rose-500/15 via-rose-500/5 to-transparent dark:from-rose-500/25 dark:via-rose-500/10 border-rose-500/30",
    bg: "bg-rose-100 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/40",
  },
  green: {
    card: "from-green-500/15 via-green-500/5 to-transparent dark:from-green-500/25 dark:via-green-500/10 border-green-500/30",
    bg: "bg-green-100 dark:bg-green-950/40",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-500/40",
  },
  violet: {
    card: "from-violet-500/15 via-violet-500/5 to-transparent dark:from-violet-500/25 dark:via-violet-500/10 border-violet-500/30",
    bg: "bg-violet-100 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-500/40",
  },
  primary: {
    card: "from-primary/15 via-primary/5 to-transparent dark:from-primary/25 dark:via-primary/10 border-primary/30",
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/40",
  },
  cyan: {
    card: "from-cyan-500/15 via-cyan-500/5 to-transparent dark:from-cyan-500/25 dark:via-cyan-500/10 border-cyan-500/30",
    bg: "bg-cyan-100 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-500/40",
  },
  orange: {
    card: "from-orange-500/15 via-orange-500/5 to-transparent dark:from-orange-500/25 dark:via-orange-500/10 border-orange-500/30",
    bg: "bg-orange-100 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-500/40",
  },
  slate: {
    card: "from-slate-500/15 via-slate-500/5 to-transparent dark:from-slate-500/25 dark:via-slate-500/10 border-slate-500/30",
    bg: "bg-slate-200 dark:bg-slate-800/60",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-500/40",
  },
};

export const VERDICT_CLASSES: Record<SupplementVerdict, { bg: string; text: string; dot: string }> = {
  proven: {
    bg: "bg-green-100 dark:bg-green-950/40",
    text: "text-green-800 dark:text-green-300",
    dot: "bg-green-500",
  },
  conditional: {
    bg: "bg-amber-100 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  marketing: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground/40",
  },
};

/** AIS framework — Australian Institute of Sport supplement classification. */
export const AIS_CLASSES: Record<AisCategory, { bg: string; text: string; label: string }> = {
  A: { bg: "bg-green-600", text: "text-white", label: "A" },
  B: { bg: "bg-amber-500", text: "text-white", label: "B" },
  C: { bg: "bg-slate-400", text: "text-white", label: "C" },
  D: { bg: "bg-rose-600", text: "text-white", label: "D" },
};

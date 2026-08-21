import type { SupplementVerdict, AisCategory } from "@/data/nutrition/types";

/** Zoned Brut: colour carries meaning only for zones — everywhere else it's
 *  ink/paper + the flat semantic borders (success/warning/destructive). The
 *  verdict and AIS gradings below are genuinely semantic (proven vs
 *  marketing, A vs D), so they keep a border + text colour; nothing gets a
 *  soft fill, a gradient or a rounded corner. */
export const VERDICT_CLASSES: Record<SupplementVerdict, { border: string; text: string; dot: string }> = {
  proven: {
    border: "border-success",
    text: "text-success",
    dot: "bg-success",
  },
  conditional: {
    border: "border-warning",
    text: "text-warning",
    dot: "bg-warning",
  },
  marketing: {
    border: "border-filet",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

/** AIS framework — Australian Institute of Sport supplement classification. */
export const AIS_CLASSES: Record<AisCategory, { border: string; text: string; label: string }> = {
  A: { border: "border-success", text: "text-success", label: "A" },
  B: { border: "border-warning", text: "text-warning", label: "B" },
  C: { border: "border-filet", text: "text-muted-foreground", label: "C" },
  D: { border: "border-destructive", text: "text-destructive", label: "D" },
};

// src/components/domain/methodology/ConfidenceBadge.tsx
// The three-status system the Zoned Brut methodology mockup prescribes:
// never a figure without its level of proof. Measured (a cited source),
// estimated (a formula), or an owned editorial choice — told apart by the
// filet alone, per the mockup: 1px solid / 2px solid Z3 / 2px dashed.

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type ConfidenceLevel = "measured" | "estimated" | "choice";

const BORDER_CLASS: Record<ConfidenceLevel, string> = {
  measured: "border border-filet",
  estimated: "border-2 border-zone-3",
  choice: "border-2 border-dashed border-filet",
};

const META_CLASS: Record<ConfidenceLevel, string> = {
  measured: "text-muted-foreground",
  estimated: "text-zone-3",
  choice: "text-muted-foreground",
};

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  className?: string;
}

export function ConfidenceBadge({ level, className }: ConfidenceBadgeProps) {
  const { t } = useTranslation("content");

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 px-2.5 py-1 font-mono text-[10px] tracking-[0.06em] uppercase text-foreground",
        BORDER_CLASS[level],
        className,
      )}
    >
      {t(`content:methodology.confidence.${level}`)}
      <span className={META_CLASS[level]}>{t(`content:methodology.confidence.${level}Meta`)}</span>
    </span>
  );
}

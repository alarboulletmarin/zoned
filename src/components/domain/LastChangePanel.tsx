import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LastChangePanelProps {
  label: string;
  labelEn: string;
  at: string; // ISO datetime
  onUndo: () => void;
}

export function LastChangePanel({ label, labelEn, at, onUndo }: LastChangePanelProps) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();

  // Hide if older than 24h
  const ageMs = Date.now() - new Date(at).getTime();
  if (ageMs > 24 * 60 * 60 * 1000) return null;

  // Relative time
  const ageMin = Math.floor(ageMs / 60000);
  const timeAgo = ageMin < 1 ? t("lastChange.justNow")
    : ageMin < 60 ? t("lastChange.minutesAgo", { count: ageMin })
    : t("lastChange.hoursAgo", { count: Math.floor(ageMin / 60) });

  const displayLabel = pick({ field: label, fieldEn: labelEn }, "field");

  return (
    <div className={cn(
      "flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-3 py-2 text-sm",
    )}>
      <span className="flex-1 truncate text-amber-900 dark:text-amber-100">
        {displayLabel}
        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">{timeAgo}</span>
      </span>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 text-xs h-7 border-amber-300 dark:border-amber-700"
        onClick={onUndo}
      >
        {t("lastChange.undo")}
      </Button>
    </div>
  );
}

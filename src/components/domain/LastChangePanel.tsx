import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { Alert } from "@/components/ui/alert";
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
    <Alert
      kind="info"
      title={displayLabel}
      className="zn-plast"
      action={
        <Button variant="outline" size="sm" onClick={onUndo}>
          {t("lastChange.undo")}
        </Button>
      }
    >
      {timeAgo}
    </Alert>
  );
}

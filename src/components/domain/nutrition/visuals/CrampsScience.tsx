import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckIcon, Lightbulb } from "@/components/icons";

export function CrampsScience() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="flex flex-col gap-2 border-2 border-destructive p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-destructive">
            {t("hub.cramps.old.label")}
          </p>
        </div>
        <p className="font-semibold leading-tight">{t("hub.cramps.old.title")}</p>
        <p className="text-xs text-muted-foreground">{t("hub.cramps.old.detail")}</p>
      </div>

      <div className="flex flex-col gap-2 border-2 border-success p-4">
        <div className="flex items-center gap-2">
          <CheckIcon className="size-4 text-success" aria-hidden="true" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-success">
            {t("hub.cramps.new.label")}
          </p>
        </div>
        <p className="font-semibold leading-tight">{t("hub.cramps.new.title")}</p>
        <p className="text-xs text-muted-foreground">{t("hub.cramps.new.detail")}</p>
      </div>

      <div className="flex flex-col gap-2 border-2 border-warning p-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 text-warning" aria-hidden="true" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-warning">
            {t("hub.cramps.fix.label")}
          </p>
        </div>
        <p className="font-semibold leading-tight">{t("hub.cramps.fix.title")}</p>
        <p className="text-xs text-muted-foreground">{t("hub.cramps.fix.detail")}</p>
      </div>
    </div>
  );
}

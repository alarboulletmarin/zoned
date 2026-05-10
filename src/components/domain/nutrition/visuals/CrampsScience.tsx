import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckIcon, Lightbulb } from "@/components/icons";

export function CrampsScience() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="flex flex-col gap-2 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle
            className="size-4 text-rose-600 dark:text-rose-400"
            aria-hidden="true"
          />
          <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            {t("hub.cramps.old.label")}
          </p>
        </div>
        <p className="font-semibold leading-tight">{t("hub.cramps.old.title")}</p>
        <p className="text-xs text-muted-foreground">{t("hub.cramps.old.detail")}</p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-green-500/40 bg-green-50 dark:bg-green-950/20 p-4 ring-1 ring-green-500/10">
        <div className="flex items-center gap-2">
          <CheckIcon
            className="size-4 text-green-600 dark:text-green-400"
            aria-hidden="true"
          />
          <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-300">
            {t("hub.cramps.new.label")}
          </p>
        </div>
        <p className="font-semibold leading-tight">{t("hub.cramps.new.title")}</p>
        <p className="text-xs text-muted-foreground">{t("hub.cramps.new.detail")}</p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4">
        <div className="flex items-center gap-2">
          <Lightbulb
            className="size-4 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            {t("hub.cramps.fix.label")}
          </p>
        </div>
        <p className="font-semibold leading-tight">{t("hub.cramps.fix.title")}</p>
        <p className="text-xs text-muted-foreground">{t("hub.cramps.fix.detail")}</p>
      </div>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckIcon } from "@/components/icons";
import { myths } from "@/data/nutrition";

export function MythBuster() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {myths.map((m) => (
        <details
          key={m.id}
          className="group rounded-xl border border-border/50 bg-muted/30 transition-colors open:bg-muted/50"
        >
          <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
            <AlertTriangle
              className="size-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex-1 space-y-0.5">
              <p className="text-xs font-medium uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {t("hub.myths.mythLabel")}
              </p>
              <p className="text-sm font-medium leading-snug">« {t(m.mythKey)} »</p>
            </div>
            <span
              aria-hidden="true"
              className="text-xs text-muted-foreground transition-transform group-open:rotate-180"
            >
              ▾
            </span>
          </summary>
          <div className="border-t border-border/40 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <CheckIcon
                className="size-4 shrink-0 text-green-600 dark:text-green-400 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400">
                  {t("hub.myths.truthLabel")}
                </p>
                <p className="text-sm text-foreground">{t(m.truthKey)}</p>
                <p className="text-xs text-muted-foreground italic">{t(m.sourceKey)}</p>
              </div>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

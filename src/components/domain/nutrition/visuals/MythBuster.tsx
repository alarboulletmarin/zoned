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
          className="group border-2 border-foreground bg-card transition-colors open:bg-secondary"
        >
          <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
            <AlertTriangle className="size-4 shrink-0 text-destructive mt-0.5" aria-hidden="true" />
            <div className="flex-1 space-y-0.5">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-destructive">
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
          <div className="border-t border-filet p-4 space-y-2">
            <div className="flex items-start gap-2">
              <CheckIcon className="size-4 shrink-0 text-success mt-0.5" aria-hidden="true" />
              <div className="flex-1 space-y-1">
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-success">
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

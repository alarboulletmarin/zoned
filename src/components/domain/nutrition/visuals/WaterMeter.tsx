import { useTranslation } from "react-i18next";
import { Droplets, Sun, Moon } from "@/components/icons";
import type { IconProps } from "@/components/icons";

const MOMENTS: Array<{
  key: "morning" | "day" | "evening";
  Icon: React.ComponentType<IconProps>;
}> = [
  { key: "morning", Icon: Sun },
  { key: "day", Icon: Droplets },
  { key: "evening", Icon: Moon },
];

export function WaterMeter() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-500/20 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {MOMENTS.map(({ key, Icon }) => (
            <div
              key={key}
              className="flex items-start gap-3 rounded-lg bg-background/60 backdrop-blur p-3"
            >
              <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/40">
                <Icon className="size-4 text-blue-700 dark:text-blue-300" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t(`hub.hydration.${key}.label`)}
                </p>
                <p className="text-base font-semibold leading-tight">
                  {t(`hub.hydration.${key}.value`)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(`hub.hydration.${key}.helper`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t("hub.hydration.footnote")}</p>
    </div>
  );
}

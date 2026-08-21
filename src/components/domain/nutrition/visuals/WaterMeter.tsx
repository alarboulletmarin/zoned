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
      <div className="border-2 border-foreground bg-card p-4 md:p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {MOMENTS.map(({ key, Icon }) => (
            <div key={key} className="flex items-start gap-3 border border-filet p-3">
              <div className="inline-flex size-9 shrink-0 items-center justify-center bg-secondary">
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
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

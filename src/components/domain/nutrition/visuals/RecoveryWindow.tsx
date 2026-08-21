import { useTranslation } from "react-i18next";
import { Zap, Utensils, Moon } from "@/components/icons";
import type { IconProps } from "@/components/icons";

interface Phase {
  key: "immediate" | "short" | "long";
  Icon: React.ComponentType<IconProps>;
}

const PHASES: Phase[] = [
  { key: "immediate", Icon: Zap },
  { key: "short", Icon: Utensils },
  { key: "long", Icon: Moon },
];

export function RecoveryWindow() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
      {PHASES.map(({ key, Icon }) => (
        <div key={key} className="flex flex-col gap-3 border-2 border-foreground bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex size-9 items-center justify-center bg-secondary">
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <span className="font-mono px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border border-filet">
              {t(`hub.recovery.phases.${key}.window`)}
            </span>
          </div>
          <h3 className="font-semibold leading-tight">
            {t(`hub.recovery.phases.${key}.title`)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(`hub.recovery.phases.${key}.detail`)}
          </p>
        </div>
      ))}
    </div>
  );
}

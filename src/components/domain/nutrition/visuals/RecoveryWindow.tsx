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
        <div
          key={key}
          className="flex flex-col gap-3 rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent dark:from-green-500/20 p-4"
        >
          <div className="flex items-center gap-2">
            <div className="inline-flex size-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/40">
              <Icon className="size-4 text-green-700 dark:text-green-300" aria-hidden="true" />
            </div>
            <span className="rounded-full bg-green-100 dark:bg-green-950/40 px-2.5 py-0.5 text-xs font-bold text-green-800 dark:text-green-300">
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

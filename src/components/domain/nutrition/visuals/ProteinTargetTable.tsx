import { useTranslation } from "react-i18next";
import { proteinTargets } from "@/data/nutrition";

export function ProteinTargetTable() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="overflow-x-auto rounded-xl border border-border/50 bg-muted/30">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-semibold">
              {t("hub.protein.targets.headers.profile")}
            </th>
            <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">
              {t("hub.protein.targets.headers.volume")}
            </th>
            <th className="text-left px-4 py-3 font-semibold">
              {t("hub.protein.targets.headers.target")}
            </th>
          </tr>
        </thead>
        <tbody>
          {proteinTargets.map((row, idx) => (
            <tr
              key={row.profileKey}
              className={
                idx !== proteinTargets.length - 1
                  ? "border-b border-border/40"
                  : undefined
              }
            >
              <td className="px-4 py-3">
                <div className="space-y-0.5">
                  <p className="font-medium">{t(row.profileKey)}</p>
                  <p className="text-xs text-muted-foreground sm:hidden">
                    {t(row.hoursPerWeekKey)}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                {t(row.hoursPerWeekKey)}
              </td>
              <td className="px-4 py-3">
                <div className="space-y-0.5">
                  <span className="rounded-full bg-rose-100 dark:bg-rose-950/40 px-2.5 py-0.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                    {t(row.targetKey)}
                  </span>
                  <p className="text-xs text-muted-foreground">{t(row.helperKey)}</p>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

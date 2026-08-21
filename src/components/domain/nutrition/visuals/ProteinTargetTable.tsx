import { useTranslation } from "react-i18next";
import { proteinTargets } from "@/data/nutrition";

export function ProteinTargetTable() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="overflow-x-auto border-2 border-foreground bg-card">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-filet">
            <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              {t("hub.protein.targets.headers.profile")}
            </th>
            <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground hidden sm:table-cell">
              {t("hub.protein.targets.headers.volume")}
            </th>
            <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              {t("hub.protein.targets.headers.target")}
            </th>
          </tr>
        </thead>
        <tbody>
          {proteinTargets.map((row, idx) => (
            <tr
              key={row.profileKey}
              className={idx !== proteinTargets.length - 1 ? "border-b border-filet" : undefined}
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
                  <span className="font-mono text-sm font-bold">{t(row.targetKey)}</span>
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

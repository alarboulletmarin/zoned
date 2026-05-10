import { useTranslation } from "react-i18next";
import { carbsPerHourRows } from "@/data/nutrition";

export function CarbsPerHourTable() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="overflow-x-auto rounded-xl border border-border/50 bg-muted/30">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-semibold">
              {t("hub.during.headers.distance")}
            </th>
            <th className="text-left px-4 py-3 font-semibold">
              {t("hub.during.headers.carbsPerHour")}
            </th>
            <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">
              {t("hub.during.headers.ratio")}
            </th>
            <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">
              {t("hub.during.headers.total")}
            </th>
          </tr>
        </thead>
        <tbody>
          {carbsPerHourRows.map((row, idx) => (
            <tr
              key={row.distanceKey}
              className={
                idx !== carbsPerHourRows.length - 1
                  ? "border-b border-border/40"
                  : undefined
              }
            >
              <td className="px-4 py-3 font-medium">{t(row.distanceKey)}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                  {row.carbsPerHour} g/h
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell font-mono text-xs">
                {t(row.ratioKey)}
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                {t(row.totalKey)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

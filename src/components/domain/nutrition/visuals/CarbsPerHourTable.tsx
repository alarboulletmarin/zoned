import { useTranslation } from "react-i18next";
import { carbsPerHourRows } from "@/data/nutrition";

export function CarbsPerHourTable() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="overflow-x-auto border-2 border-foreground bg-card">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-filet">
            <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              {t("hub.during.headers.distance")}
            </th>
            <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              {t("hub.during.headers.carbsPerHour")}
            </th>
            <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground hidden sm:table-cell">
              {t("hub.during.headers.ratio")}
            </th>
            <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground hidden md:table-cell">
              {t("hub.during.headers.total")}
            </th>
          </tr>
        </thead>
        <tbody>
          {carbsPerHourRows.map((row, idx) => (
            <tr
              key={row.distanceKey}
              className={idx !== carbsPerHourRows.length - 1 ? "border-b border-filet" : undefined}
            >
              <td className="px-4 py-3 font-medium">{t(row.distanceKey)}</td>
              <td className="px-4 py-3">
                <span className="font-mono text-sm font-bold">{row.carbsPerHour} g/h</span>
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

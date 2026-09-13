import { useTranslation } from "react-i18next";
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from "@/components/ui/responsive-table";
import { carbsPerHourRows } from "@/data/nutrition";
import type { CarbsRow } from "@/data/nutrition/types";

/**
 * How many carbs an hour, by race distance.
 *
 * A real table, so it is the ported ResponsiveTable: a framed paper grid at
 * md+, one outlined card per distance below it. The hand-rolled `hidden
 * sm:table-cell` columns are gone, the card view carries every column with
 * its own label, which is what those classes were working around.
 */
export function CarbsPerHourTable() {
  const { t } = useTranslation("nutrition");

  const columns: ResponsiveTableColumn<CarbsRow>[] = [
    {
      key: "distance",
      header: t("hub.during.headers.distance"),
      cell: (row) => t(row.distanceKey),
      hideOnMobile: true,
    },
    {
      key: "carbs",
      header: t("hub.during.headers.carbsPerHour"),
      cell: (row) => (
        <span className="zn-nut-tag">{row.carbsPerHour} g/h</span>
      ),
    },
    {
      key: "ratio",
      header: t("hub.during.headers.ratio"),
      cell: (row) => <span className="zn-mono">{t(row.ratioKey)}</span>,
    },
    {
      key: "total",
      header: t("hub.during.headers.total"),
      cell: (row) => t(row.totalKey),
    },
  ];

  return (
    <ResponsiveTable
      data={carbsPerHourRows}
      columns={columns}
      rowKey="distanceKey"
      mobileCardTitle={(row) => t(row.distanceKey)}
    />
  );
}

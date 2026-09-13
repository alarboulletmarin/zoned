import { useTranslation } from "react-i18next";
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from "@/components/ui/responsive-table";
import { proteinTargets } from "@/data/nutrition";
import type { ProteinDose } from "@/data/nutrition/types";

/**
 * Daily protein target by training volume, a real table, so the ported
 * ResponsiveTable. The mobile duplicate of the volume column disappears with
 * it: the card view already prints every column under its own label.
 */
export function ProteinTargetTable() {
  const { t } = useTranslation("nutrition");

  const columns: ResponsiveTableColumn<ProteinDose>[] = [
    {
      key: "profile",
      header: t("hub.protein.targets.headers.profile"),
      cell: (row) => t(row.profileKey),
      hideOnMobile: true,
    },
    {
      key: "volume",
      header: t("hub.protein.targets.headers.volume"),
      cell: (row) => <span className="zn-mono">{t(row.hoursPerWeekKey)}</span>,
    },
    {
      key: "target",
      header: t("hub.protein.targets.headers.target"),
      cell: (row) => (
        <>
          <span className="zn-nut-tag">{t(row.targetKey)}</span>
          <p className="zn-caption zn-faint">{t(row.helperKey)}</p>
        </>
      ),
    },
  ];

  return (
    <ResponsiveTable
      data={proteinTargets}
      columns={columns}
      rowKey="profileKey"
      mobileCardTitle={(row) => t(row.profileKey)}
    />
  );
}

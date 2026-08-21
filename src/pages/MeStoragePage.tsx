import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveTable, type ResponsiveTableColumn } from "@/components/ui/responsive-table";
import { DeleteStorageKeyDialog } from "@/components/domain/DeleteStorageKeyDialog";
import { downloadBackup } from "@/lib/downloadBackup";
import {
  computeStorageKeyStats,
  computeGroupTotals,
  totalBytes,
  presentKeyCount,
  formatStorageSize,
  STORAGE_GROUP_ORDER,
  type StorageGroup,
  type StorageKeyStat,
} from "@/lib/storageInventory";
import type { BackupStorageKey } from "@/lib/backup";

const GROUP_BAR_CLASS: Record<StorageGroup, string> = {
  workouts: "bg-zone-4",
  plans: "bg-zone-2",
  profile: "bg-zone-3",
  routes: "bg-zone-6",
  scenarios: "bg-zone-5",
  settings: "bg-zone-1",
};

const GROUP_DOT_CLASS: Record<StorageGroup, string> = GROUP_BAR_CLASS;

export function MeStoragePage() {
  const { t } = useTranslation("profile");
  const [refreshTick, setRefreshTick] = useState(0);

  const stats = computeStorageKeyStats((key) => localStorage.getItem(key));
  const groupTotals = computeGroupTotals(stats);
  const total = totalBytes(stats);
  const keyCount = presentKeyCount(stats);

  const rows = [...stats].sort((a, b) => {
    const groupDiff = STORAGE_GROUP_ORDER.indexOf(a.group) - STORAGE_GROUP_ORDER.indexOf(b.group);
    if (groupDiff !== 0) return groupDiff;
    return b.bytes - a.bytes;
  });

  const groupLabel: Record<StorageGroup, string> = {
    workouts: t("me.storage.groupWorkouts"),
    plans: t("me.storage.groupPlans"),
    profile: t("me.storage.groupProfile"),
    routes: t("me.storage.groupRoutes"),
    scenarios: t("me.storage.groupScenarios"),
    settings: t("me.storage.groupSettings"),
  };

  const columns: ResponsiveTableColumn<StorageKeyStat>[] = [
    {
      key: "key",
      header: t("me.storage.tableKey"),
      cell: (row) => <span className="text-foreground">{row.key}</span>,
    },
    {
      key: "content",
      header: t("me.storage.tableContent"),
      cell: (row) => (
        <span className="font-sans text-sm text-muted-foreground">
          {t(`me.storage.keys.${row.key}.content`)}
        </span>
      ),
    },
    {
      key: "objects",
      header: t("me.storage.tableObjects"),
      cell: (row) => (row.present ? row.objectCount : "—"),
      hideOnMobile: true,
    },
    {
      key: "weight",
      header: t("me.storage.tableWeight"),
      cell: (row) => (row.present ? formatStorageSize(row.bytes) : t("me.storage.empty")),
    },
    {
      key: "consequence",
      header: t("me.storage.tableConsequence"),
      cell: (row) => (
        <span className="font-sans text-sm text-muted-foreground">
          {t(`me.storage.keys.${row.key}.consequence`)}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "",
      cell: (row) =>
        row.present ? (
          <DeleteStorageKeyDialog
            storageKey={row.key as BackupStorageKey}
            onDeleted={() => setRefreshTick((n) => n + 1)}
          />
        ) : null,
    },
  ];

  return (
    <>
      <SEOHead noindex title={t("me.storage.seoTitle")} description={t("me.storage.seoDescription")} />
      <div key={refreshTick} className="py-8 max-w-5xl mx-auto space-y-8">
        <div>
          <p className="font-mono text-[11px] tracking-wide uppercase text-muted-foreground">
            <Link to="/me" className="underline underline-offset-2">
              {t("me.storage.breadcrumb")}
            </Link>
            {" · "}
            {t("me.storage.here")}
          </p>
          <EditorialTitle as="h1" size="lg" className="mt-3">
            {t("me.storage.title", { count: keyCount, size: formatStorageSize(total) })}
          </EditorialTitle>
          <FadeUp as="p" delay={0.1} className="mt-3 text-muted-foreground max-w-2xl">
            {t("me.storage.intro")}
          </FadeUp>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-[10px] tracking-wide uppercase text-muted-foreground">
              {t("me.storage.distributionTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex h-3 w-full overflow-hidden">
              {STORAGE_GROUP_ORDER.filter((g) => groupTotals[g] > 0).map((group) => (
                <div
                  key={group}
                  className={GROUP_BAR_CLASS[group]}
                  style={{ width: `${total > 0 ? (groupTotals[group] / total) * 100 : 0}%` }}
                />
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {STORAGE_GROUP_ORDER.filter((g) => groupTotals[g] > 0).map((group) => (
                <div key={group} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className={`size-2.5 shrink-0 ${GROUP_DOT_CLASS[group]}`} />
                    {groupLabel[group]}
                  </span>
                  <span className="font-mono text-xs">{formatStorageSize(groupTotals[group])}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ResponsiveTable
          data={rows}
          columns={columns}
          rowKey={(row) => row.key}
          mobileCardTitle={(row) => row.key}
          rowClassName={(row) => (!row.present ? "opacity-50" : undefined)}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[10px] tracking-wide uppercase text-muted-foreground">
                {t("me.storage.clearsEverythingTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                <li>{t("me.storage.clearsEverything1")}</li>
                <li>{t("me.storage.clearsEverything2")}</li>
                <li>{t("me.storage.clearsEverything3")}</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[10px] tracking-wide uppercase text-muted-foreground">
                {t("me.storage.clearsNothingTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                <li>{t("me.storage.clearsNothing1")}</li>
                <li>{t("me.storage.clearsNothing2")}</li>
                <li>{t("me.storage.clearsNothing3")}</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-ink text-paper border-ink">
            <CardHeader>
              <CardTitle className="font-mono text-[10px] tracking-wide uppercase opacity-70">
                {t("me.storage.onlyBackupTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm opacity-85">{t("me.storage.onlyBackupBody")}</p>
              <Button className="w-full" onClick={downloadBackup}>
                {t("me.storage.exportNow", { size: formatStorageSize(total) })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

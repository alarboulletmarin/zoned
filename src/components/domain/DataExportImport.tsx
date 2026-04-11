import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Download, Upload } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BACKUP_STORAGE_KEYS,
  buildBackupData,
  buildManagedStorageSnapshot,
  parseBackupData,
  type BackupData,
  type BackupStorageKey,
  type RestoreMode,
} from "@/lib/backup";

export function DataExportImport() {
  const { t } = useTranslation("common");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [restoreMode, setRestoreMode] = useState<RestoreMode>("replace");

  function handleExport() {
    const backup = buildBackupData((key) => localStorage.getItem(key));

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `zoned-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("settings.data.exportSuccess"));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = parseBackupData(JSON.parse(event.target?.result as string));
        if (!parsed) {
          toast.error(t("settings.data.invalidFile"));
          return;
        }
        setPendingImport(parsed);
        setShowConfirm(true);
      } catch {
        toast.error(t("settings.data.invalidFile"));
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be selected again
    e.target.value = "";
  }

  function confirmImport() {
    if (!pendingImport) return;

    const currentManagedEntries = Object.fromEntries(
      BACKUP_STORAGE_KEYS.flatMap((key) => {
        const value = localStorage.getItem(key);
        return value === null ? [] : [[key, value]];
      })
    ) as Partial<Record<BackupStorageKey, string>>;

    const snapshot = buildManagedStorageSnapshot(
      currentManagedEntries,
      pendingImport.localStorage,
      restoreMode,
    );

    if (restoreMode === "replace") {
      for (const key of BACKUP_STORAGE_KEYS) {
        localStorage.removeItem(key);
      }
    }

    for (const [key, value] of Object.entries(snapshot)) {
      if (typeof value !== "string") continue;
      localStorage.setItem(key, value);
    }

    setShowConfirm(false);
    toast.success(t("settings.data.importSuccess"));
    setTimeout(() => window.location.reload(), 1000);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.data.title")}</CardTitle>
          <CardDescription>{t("settings.data.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="size-4" />
              {t("settings.data.exportButton")}
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              {t("settings.data.importButton")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.data.confirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("settings.data.confirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm font-medium">{t("settings.data.restoreModeLabel")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRestoreMode("replace")}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  restoreMode === "replace"
                    ? "border-primary bg-primary/10"
                    : "hover:bg-accent/50"
                )}
              >
                <div className="font-medium text-sm">{t("settings.data.replaceModeTitle")}</div>
                <div className="text-xs text-muted-foreground mt-1">{t("settings.data.replaceModeDescription")}</div>
              </button>
              <button
                type="button"
                onClick={() => setRestoreMode("merge")}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  restoreMode === "merge"
                    ? "border-primary bg-primary/10"
                    : "hover:bg-accent/50"
                )}
              >
                <div className="font-medium text-sm">{t("settings.data.mergeModeTitle")}</div>
                <div className="text-xs text-muted-foreground mt-1">{t("settings.data.mergeModeDescription")}</div>
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              {t("actions.cancel")}
            </Button>
            <Button onClick={confirmImport}>
              {t("settings.data.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

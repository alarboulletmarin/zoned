import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/toast";
import { Download, Upload } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { triggerDownload } from "@/lib/export/download";
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
  buildBackupData,
  parseBackupData,
  restoreBackup,
  type BackupData,
  type RestoreMode,
} from "@/lib/backup";

export function DataExportImport() {
  const { t } = useTranslation("common");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [restoreMode, setRestoreMode] = useState<RestoreMode>("replace");
  const [isRestoring, setIsRestoring] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [invalidFile, setInvalidFile] = useState(false);

  function handleExport() {
    const backup = buildBackupData((key) => localStorage.getItem(key));

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const date = new Date().toISOString().split("T")[0];
    triggerDownload(blob, `zoned-backup-${date}.json`);
    toast.success(t("settings.data.exportSuccess"));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setInvalidFile(false);
    setIsReading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      setIsReading(false);
      try {
        const parsed = parseBackupData(JSON.parse(event.target?.result as string));
        if (!parsed) {
          setInvalidFile(true);
          return;
        }
        setPendingImport(parsed);
        setShowConfirm(true);
      } catch {
        setInvalidFile(true);
      }
    };
    reader.onerror = () => {
      setIsReading(false);
      setInvalidFile(true);
    };
    reader.readAsText(file);
    // Reset so the same file can be selected again
    e.target.value = "";
  }

  function confirmImport() {
    if (!pendingImport || isRestoring) return;
    setIsRestoring(true);

    try {
      restoreBackup(localStorage, pendingImport.localStorage, restoreMode);
    } catch (err) {
      console.error("Restore failed, rolled back", err);
      toast.failure(t("settings.data.importError"), err);
      setIsRestoring(false);
      setShowConfirm(false);
      return;
    }

    setShowConfirm(false);
    setIsRestoring(false);
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
        <CardContent
          className="zn-stack"
          style={{ "--gap": "var(--sp-8)" } as React.CSSProperties}
        >
          <div
            className="zn-cluster"
            style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
          >
            <Button variant="outline" onClick={handleExport}>
              <Download />
              {t("settings.data.exportButton")}
            </Button>
            <Button
              variant="outline"
              disabled={isReading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload />
              {t("settings.data.importButton")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              hidden
            />
          </div>

          {isReading ? (
            <Spinner size={16} inline label={t("settings.data.reading")} />
          ) : null}

          {invalidFile ? (
            <Alert
              kind="error"
              title={t("settings.data.invalidFileTitle")}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t("settings.data.chooseAnotherFile")}
                </Button>
              }
              onDismiss={() => setInvalidFile(false)}
            >
              {t("settings.data.invalidFile")}
            </Alert>
          ) : null}
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
          <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}>
            <p className="zn-label">{t("settings.data.restoreModeLabel")}</p>
            <div className="zn-grid" style={{ "--cols": 2, "--gap": "var(--sp-5)" } as React.CSSProperties}>
              <button
                type="button"
                onClick={() => setRestoreMode("replace")}
                aria-pressed={restoreMode === "replace"}
                className="zn-choice"
              >
                <span className="zn-choice__title">{t("settings.data.replaceModeTitle")}</span>
                <span className="zn-choice__text">{t("settings.data.replaceModeDescription")}</span>
              </button>
              <button
                type="button"
                onClick={() => setRestoreMode("merge")}
                aria-pressed={restoreMode === "merge"}
                className="zn-choice"
              >
                <span className="zn-choice__title">{t("settings.data.mergeModeTitle")}</span>
                <span className="zn-choice__text">{t("settings.data.mergeModeDescription")}</span>
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isRestoring}
            >
              {t("actions.cancel")}
            </Button>
            <Button onClick={confirmImport} disabled={isRestoring}>
              {t("settings.data.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

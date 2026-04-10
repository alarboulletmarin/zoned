import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Download, Upload } from "@/components/icons";
import { Button } from "@/components/ui/button";
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

const STORAGE_KEYS = [
  "zoned-plans",
  "zoned-favorites",
  "zoned-settings",
  "zoned-last-seen-version",
  "zoned-viewMode",
  "zoned-dismissed-tips",
  "zoned-userZones",
  "zoned-quiz-results",
  "zoned-zone-cta-dismissed",
  "zoned-racechecklist",
  "zoned-theme",
  "zoned-sidebar-collapsed",
  "zoned-language",
  "zoned-custom-workouts",
] as const;

interface BackupData {
  _meta: { version: number; app: string; exportedAt: string };
  localStorage: Record<string, unknown>;
}

export function DataExportImport() {
  const { t } = useTranslation("common");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleExport() {
    const data: Record<string, unknown> = {};
    for (const key of STORAGE_KEYS) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    }

    const backup: BackupData = {
      _meta: {
        version: 1,
        app: "zoned",
        exportedAt: new Date().toISOString(),
      },
      localStorage: data,
    };

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
        const parsed = JSON.parse(event.target?.result as string);
        if (
          parsed?._meta?.app !== "zoned" ||
          typeof parsed?.localStorage !== "object"
        ) {
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

    for (const [key, value] of Object.entries(pendingImport.localStorage)) {
      if (!(STORAGE_KEYS as readonly string[]).includes(key)) continue;
      localStorage.setItem(
        key,
        typeof value === "string" ? value : JSON.stringify(value)
      );
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

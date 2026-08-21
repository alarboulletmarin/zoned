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
  BACKUP_STORAGE_KEYS,
  computeImportDiff,
  parseBackupData,
  resolveImportWrites,
  type BackupData,
  type BackupStorageKey,
  type ImportChoice,
  type ImportDiff,
} from "@/lib/backup";
import { STORAGE_KEY_GROUPS, formatStorageSize } from "@/lib/storageInventory";
import { downloadBackup } from "@/lib/downloadBackup";

/** Rows shown on the conflict screen. Every managed key gets its own row,
 *  except the settings keys (theme, language, view modes…) which collapse
 *  into a single decision — the same granularity the storage inventory uses. */
const SETTINGS_ROW_ID = "settings";

function rowIdFor(key: BackupStorageKey): string {
  return STORAGE_KEY_GROUPS[key] === "settings" ? SETTINGS_ROW_ID : key;
}

function readManagedEntries(): Partial<Record<BackupStorageKey, string>> {
  const entries: Partial<Record<BackupStorageKey, string>> = {};
  for (const key of BACKUP_STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) entries[key] = value;
  }
  return entries;
}

function countObjects(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  return value === undefined || value === null ? 0 : 1;
}

interface PendingImport {
  data: BackupData;
  diff: ImportDiff;
  fileName: string;
  bytes: number;
}

export function DataExportImport() {
  const { t } = useTranslation(["common", "profile"]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [choices, setChoices] = useState<Record<string, ImportChoice>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [readError, setReadError] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  function handleExport() {
    downloadBackup();
    toast.success(t("settings.data.exportSuccess"));
  }

  /** Writes the resolved entries, rolling every managed key back to its
   *  previous value if a single write fails (a full quota mid-import). */
  function applyImport(
    data: BackupData,
    resolvedChoices: Partial<Record<BackupStorageKey, ImportChoice>>,
  ) {
    if (isRestoring) return;
    setIsRestoring(true);

    const previousState = readManagedEntries();
    const writes = resolveImportWrites(previousState, data.localStorage, resolvedChoices);

    try {
      for (const [key, value] of Object.entries(writes)) {
        if (typeof value !== "string") continue;
        localStorage.setItem(key, value);
      }
    } catch (err) {
      console.error("Restore failed, rolling back", err);
      for (const key of BACKUP_STORAGE_KEYS) {
        try {
          const prev = previousState[key];
          if (prev === undefined) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, prev);
          }
        } catch {
          // best-effort rollback — keep going even if a single key fails
        }
      }
      toast.error(t("settings.data.importError"));
      setIsRestoring(false);
      setPending(null);
      return;
    }

    setPending(null);
    setIsRestoring(false);
    toast.success(t("settings.data.importSuccess"));
    setTimeout(() => window.location.reload(), 1000);
  }

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      let parsed: BackupData | null = null;
      try {
        parsed = parseBackupData(JSON.parse(text));
      } catch {
        parsed = null;
      }
      if (!parsed) {
        setPending(null);
        setReadError(true);
        toast.error(t("settings.data.invalidFile"));
        return;
      }

      setReadError(false);
      const diff = computeImportDiff(readManagedEntries(), parsed.localStorage);

      // Nothing to arbitrate: import straight away, no review screen.
      if (diff.conflicts.length === 0) {
        applyImport(parsed, {});
        return;
      }

      setChoices(
        Object.fromEntries(
          diff.conflicts.map((key) => [rowIdFor(key), "replace" as ImportChoice]),
        ),
      );
      setPending({
        data: parsed,
        diff,
        fileName: file.name,
        bytes: new TextEncoder().encode(text).length,
      });
    };
    reader.readAsText(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    // Reset so the same file can be selected again
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  function confirmImport() {
    if (!pending) return;
    const resolved: Partial<Record<BackupStorageKey, ImportChoice>> = {};
    for (const key of pending.diff.conflicts) {
      resolved[key] = choices[rowIdFor(key)] ?? "replace";
    }
    applyImport(pending.data, resolved);
  }

  // One row per conflicting key, settings keys folded into a single row.
  const conflictRows: { id: string; keys: BackupStorageKey[] }[] = [];
  for (const key of pending?.diff.conflicts ?? []) {
    const id = rowIdFor(key);
    const existing = conflictRows.find((row) => row.id === id);
    if (existing) existing.keys.push(key);
    else conflictRows.push({ id, keys: [key] });
  }

  const objectCount = pending
    ? Object.values(pending.data.localStorage).reduce<number>(
        (sum, value) => sum + countObjects(value),
        0,
      )
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.data.title")}</CardTitle>
        <CardDescription>{t("settings.data.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" onClick={handleExport}>
          <Download className="size-4" />
          {t("settings.data.exportButton")}
        </Button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "w-full rounded-none p-6 flex flex-col items-center gap-2 transition-colors",
            "font-mono text-[11px] tracking-wide uppercase",
            isDragging
              ? "border-2 border-solid border-foreground bg-accent-acid text-ink"
              : "border-2 border-dashed border-input text-muted-foreground hover:border-foreground hover:text-foreground",
          )}
        >
          <Upload className="size-5" />
          <span>
            {isDragging
              ? t("settings.data.dropzoneActive")
              : t("settings.data.dropzoneIdle")}
          </span>
          <span className="normal-case tracking-normal opacity-70">
            {t("settings.data.dropzoneHint")}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="hidden"
        />

        {readError && (
          <p className="border-2 border-destructive text-destructive p-3 font-mono text-xs">
            {t("settings.data.readError")}
          </p>
        )}

        {pending && (
          <div className="space-y-3">
            <div className="bg-ink text-paper px-4 py-3 flex justify-between gap-4 font-mono text-[11px] tracking-wide uppercase">
              <span className="truncate">
                {t("settings.data.fileRead", { name: pending.fileName })}
              </span>
              <span className="opacity-70 shrink-0">
                {t("settings.data.fileObjects", { count: objectCount })} ·{" "}
                {formatStorageSize(pending.bytes)}
              </span>
            </div>

            <div className="border-2 border-zone-3 p-4 space-y-4">
              <div>
                <p className="font-mono text-[10px] tracking-wide uppercase text-muted-foreground">
                  {t("settings.data.conflictEyebrow")}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {t("settings.data.conflictTitle", { count: conflictRows.length })}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("settings.data.conflictIntro")}
                </p>
              </div>

              <ul className="border-t border-border">
                {conflictRows.map((row) => {
                  const choice = choices[row.id] ?? "replace";
                  const isSettingsRow = row.id === SETTINGS_ROW_ID;
                  return (
                    <li
                      key={row.id}
                      className="border-b border-border py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-foreground break-all">
                          {isSettingsRow
                            ? t("profile:me.storage.groupSettings")
                            : row.keys[0]}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isSettingsRow
                            ? t("profile:me.storage.settingsGroupContent")
                            : t(`profile:me.storage.keys.${row.keys[0]}.content`)}
                        </p>
                      </div>
                      <div className="flex shrink-0 font-mono text-[10px] tracking-wide uppercase">
                        <button
                          type="button"
                          onClick={() => setChoices((c) => ({ ...c, [row.id]: "keep" }))}
                          className={cn(
                            "border-2 px-3 py-2",
                            choice === "keep"
                              ? "border-foreground bg-accent-acid text-ink"
                              : "border-input text-muted-foreground hover:border-foreground",
                          )}
                        >
                          {t("settings.data.keepExisting")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setChoices((c) => ({ ...c, [row.id]: "replace" }))}
                          className={cn(
                            "border-2 border-l-0 px-3 py-2",
                            choice === "replace"
                              ? "border-foreground bg-accent-acid text-ink"
                              : "border-input text-muted-foreground hover:border-foreground",
                          )}
                        >
                          {t("settings.data.useImported")}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                {pending.diff.additions.length > 0
                  ? t("settings.data.additionsSummary", {
                      count: pending.diff.additions.length,
                      keys: pending.diff.additions.join(", "),
                    })
                  : t("settings.data.additionsNone")}
                {pending.diff.identical.length > 0 && (
                  <>
                    {" "}
                    {t("settings.data.identicalSummary", {
                      count: pending.diff.identical.length,
                    })}
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={confirmImport} disabled={isRestoring}>
                {t("settings.data.confirmButton")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPending(null)}
                disabled={isRestoring}
              >
                {t("actions.cancel")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

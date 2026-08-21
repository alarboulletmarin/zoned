import { buildBackupData } from "@/lib/backup";

/** Builds the full backup from localStorage and triggers a browser download.
 *  Shared by every "Exporter tout (JSON)" entry point (Settings, /me, /me/storage)
 *  so the file name and shape never drift between them. */
export function downloadBackup(): void {
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
}

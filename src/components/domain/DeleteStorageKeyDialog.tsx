import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BackupStorageKey } from "@/lib/backup";

interface DeleteStorageKeyDialogProps {
  storageKey: BackupStorageKey;
  onDeleted: () => void;
}

/** Real, functional per-key deletion — the row's own "Effacer" action from
 *  the storage inventory. A full reload after removal keeps every
 *  React context (favorites, settings, theme…) in sync with the now-gone
 *  key instead of holding stale in-memory state. */
export function DeleteStorageKeyDialog({ storageKey, onDeleted }: DeleteStorageKeyDialogProps) {
  const { t } = useTranslation("profile");
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    localStorage.removeItem(storageKey);
    toast.success(t("me.storage.deleteKeySuccess", { key: storageKey }));
    setOpen(false);
    onDeleted();
    setTimeout(() => window.location.reload(), 600);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label={t("me.storage.deleteKey")}
      >
        <Trash2 className="size-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("me.storage.deleteKeyTitle", { key: storageKey })}</DialogTitle>
          <DialogDescription>{t("me.storage.deleteKeyBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("me.clearAll.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            <Trash2 className="size-4 mr-2" />
            {t("me.storage.deleteKeyConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

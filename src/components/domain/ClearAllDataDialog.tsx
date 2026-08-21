import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { clearAllManagedStorage, BACKUP_STORAGE_KEYS } from "@/lib/backup";
import { computeStorageKeyStats, totalObjects } from "@/lib/storageInventory";

interface ClearAllDataDialogProps {
  /** Rendered as the opening trigger — usually a destructive Button. */
  children: React.ReactNode;
  onExportFirst: () => void;
}

/** "Tout effacer" — the one destructive, non-undoable action in the app.
 *  Gated behind typing the localized confirmation word, matching the
 *  friction level the design calls for ("la friction est proportionnée
 *  au risque"). Actually removes every managed key and reloads. */
export function ClearAllDataDialog({ children, onExportFirst }: ClearAllDataDialogProps) {
  const { t } = useTranslation("profile");
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const confirmWord = t("me.clearAll.confirmWord");
  const stats = computeStorageKeyStats((key) => localStorage.getItem(key));
  const objectCount = totalObjects(stats);
  const canConfirm = confirmText.trim().toUpperCase() === confirmWord.toUpperCase();

  function handleConfirm() {
    if (!canConfirm) return;
    clearAllManagedStorage((key) => localStorage.removeItem(key));
    toast.success(t("me.clearAll.success"));
    setOpen(false);
    setTimeout(() => window.location.reload(), 800);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmText("");
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">
            {t("me.clearAll.title", { count: BACKUP_STORAGE_KEYS.length })}
          </DialogTitle>
          <DialogDescription>
            {t("me.clearAll.body", { objects: objectCount })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium block">
            {t("me.clearAll.typeToConfirmLabel", { word: confirmWord })}
          </label>
          <Input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={confirmWord}
            className="text-sm uppercase tracking-wide"
            autoComplete="off"
            autoCapitalize="characters"
          />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onExportFirst}>
            {t("me.clearAll.exportFirst")}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("me.clearAll.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={!canConfirm}>
              <Trash2 className="size-4 mr-2" />
              {t("me.clearAll.confirm")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

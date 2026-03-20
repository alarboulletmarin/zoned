import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WARNING_KEY = "zoned-storage-warning-seen";
const EVENT_NAME = "zoned:storage-warning";

export function triggerStorageWarning() {
  if (localStorage.getItem(WARNING_KEY) !== "true") {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
}

export function StorageWarning() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleEvent = useCallback(() => {
    if (localStorage.getItem(WARNING_KEY) !== "true") {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener(EVENT_NAME, handleEvent);
    return () => window.removeEventListener(EVENT_NAME, handleEvent);
  }, [handleEvent]);

  function dismiss() {
    localStorage.setItem(WARNING_KEY, "true");
    setOpen(false);
  }

  function goToExport() {
    localStorage.setItem(WARNING_KEY, "true");
    setOpen(false);
    navigate("/settings");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && dismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("storageWarning.title")}</DialogTitle>
          <DialogDescription>
            {t("storageWarning.description")}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm font-medium text-destructive">
          {t("storageWarning.warning")}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={goToExport}>
            {t("storageWarning.exportButton")}
          </Button>
          <Button onClick={dismiss}>{t("storageWarning.understand")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

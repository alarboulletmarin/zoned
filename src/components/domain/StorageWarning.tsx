import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "@/components/ui/alert";
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

function seen() {
  try {
    return localStorage.getItem(WARNING_KEY) === "true";
  } catch {
    // Stockage illisible : l'avertissement compte comme vu, rien d'autre ne marcherait de toute façon.
    return true;
  }
}

function markSeen() {
  try {
    localStorage.setItem(WARNING_KEY, "true");
  } catch {
    // Quota plein ou navigation privée : la note reviendra, rien de perdu.
  }
}

/**
 * La même mise en garde, en ligne en haut de la page plan : un plan créé y
 * arrive, et une fenêtre par-dessus le plan qu'on vient de créer cachait
 * justement ce qu'on venait chercher.
 */
export function StorageNote() {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(() => !seen());
  if (!open) return null;
  return (
    <Alert
      kind="warning"
      title={t("storageWarning.title")}
      action={
        <Button variant="outline" size="sm" asChild>
          <Link to="/settings" onClick={markSeen}>
            {t("storageWarning.exportButton")}
          </Link>
        </Button>
      }
      onDismiss={() => {
        markSeen();
        setOpen(false);
      }}
    >
      {t("storageWarning.description")} {t("storageWarning.warning")}
    </Alert>
  );
}

/** La fenêtre, pour les favoris et les semaines, qui n'ont pas de page où la poser. */
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
        <Alert kind="warning">{t("storageWarning.warning")}</Alert>
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

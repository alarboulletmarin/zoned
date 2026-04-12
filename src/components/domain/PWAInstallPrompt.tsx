import { useTranslation } from "react-i18next";
import { Download, X } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface Props {
  onInstall: () => void;
  onDismiss: () => void;
}

export function PWAInstallPrompt({ onInstall, onDismiss }: Props) {
  const { t } = useTranslation("common");

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="rounded-lg border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <Download className="size-5 mt-0.5 shrink-0 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{t("pwa.installTitle")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("pwa.installDesc")}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" onClick={onInstall}>
                {t("pwa.install")}
              </Button>
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                {t("pwa.dismiss")}
              </Button>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

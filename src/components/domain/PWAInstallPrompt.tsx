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
    <div className="zn-prompt">
      <span aria-hidden="true" className="zn-prompt__glyph">
        <Download />
      </span>
      <div className="zn-prompt__body">
        <p className="zn-prompt__title">{t("pwa.installTitle")}</p>
        <p className="zn-prompt__text">{t("pwa.installDesc")}</p>
        <div className="zn-prompt__actions">
          <Button size="sm" onClick={onInstall}>
            {t("pwa.install")}
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            {t("pwa.dismiss")}
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t("pwa.dismiss")}
        className="zn-prompt__dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { Download, Loader2, Save, Share } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Plan actions, ranked.
 *
 * Exporting the PDF is what the plan is for — it is the thing that ends up on
 * a phone on race morning — so it is the primary button, and the screen's one
 * vermillon fill. Save and share stay outlined.
 */
export function RaceSimActions({
  onExportPdf,
  onSave,
  onShare,
  exporting = false,
  variant = "stack",
  className,
}: {
  onExportPdf: () => void;
  onSave: () => void;
  onShare: () => void;
  exporting?: boolean;
  variant?: "stack" | "bar";
  className?: string;
}) {
  const { t } = useTranslation("simulator");

  const pdf = (
    <Button
      onClick={onExportPdf}
      disabled={exporting}
      className="zn-rs-actions__pdf"
    >
      {exporting ? <Loader2 className="zn-rs-actions__spinner" /> : <Download />}
      {t("actions.exportPdf")}
    </Button>
  );

  if (variant === "bar") {
    return (
      <div className={cn("zn-rs-actions", className)} data-variant="bar">
        {pdf}
        <Button variant="outline" size="icon" onClick={onSave} aria-label={t("actions.save")}>
          <Save />
        </Button>
        <Button variant="outline" size="icon" onClick={onShare} aria-label={t("actions.share")}>
          <Share />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("zn-rs-actions", className)} data-variant="stack">
      {pdf}
      <div className="zn-rs-actions__grid">
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save />
          {t("actions.save")}
        </Button>
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share />
          {t("actions.share")}
        </Button>
      </div>
    </div>
  );
}

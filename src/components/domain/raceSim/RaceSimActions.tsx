import { useTranslation } from "react-i18next";
import { Download, Loader2, Save, Share } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Plan actions, ranked.
 *
 * Exporting the PDF is what the plan is for — it is the thing that ends up on
 * a phone on race morning — so it is the primary button and it stays reachable
 * instead of sitting at the foot of a very long page.
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
      className={variant === "stack" ? "w-full" : "flex-1"}
    >
      {exporting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {t("actions.exportPdf")}
    </Button>
  );

  if (variant === "bar") {
    return (
      <div className={cn("flex gap-2", className)}>
        {pdf}
        <Button variant="outline" size="icon" onClick={onSave} aria-label={t("actions.save")}>
          <Save className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onShare} aria-label={t("actions.share")}>
          <Share className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {pdf}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="size-3.5" />
          {t("actions.save")}
        </Button>
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share className="size-3.5" />
          {t("actions.share")}
        </Button>
      </div>
    </div>
  );
}

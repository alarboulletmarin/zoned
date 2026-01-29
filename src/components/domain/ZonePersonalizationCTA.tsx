import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Settings, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DISMISS_STORAGE_KEY = "zoned-zone-cta-dismissed";

interface ZonePersonalizationCTAProps {
  className?: string;
}

export function ZonePersonalizationCTA({ className }: ZonePersonalizationCTAProps) {
  const { t } = useTranslation("common");
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash

  useEffect(() => {
    // Check if user has dismissed the CTA
    const dismissed = localStorage.getItem(DISMISS_STORAGE_KEY);
    setIsDismissed(dismissed === "true");
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-3 rounded-lg",
        "bg-primary/5 border border-primary/20",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Settings className="size-4 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          {t("zonePersonalization.ctaMessage")}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" asChild>
          <Link to="/my-zones">
            {t("zonePersonalization.ctaButton")}
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleDismiss}
          aria-label={t("zonePersonalization.dismiss")}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

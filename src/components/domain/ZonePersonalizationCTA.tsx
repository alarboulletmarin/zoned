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
        // Stacks vertically so it reads well both full-width and in the
        // 320px workout-detail sidebar.
        "relative flex flex-col gap-3 p-3 border border-border",
        className
      )}
    >
      <div className="flex items-start gap-3 pr-8">
        <Settings className="size-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          {t("zonePersonalization.ctaMessage")}
        </p>
      </div>
      <Button variant="outline" size="sm" asChild className="w-full">
        <Link to="/me/zones">
          {t("zonePersonalization.ctaButton")}
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDismiss}
        aria-label={t("zonePersonalization.dismiss")}
        className="absolute right-1 top-1 size-8"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

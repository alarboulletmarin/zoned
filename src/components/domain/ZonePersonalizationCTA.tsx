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
        // Stacks vertically on mobile so the button never overlaps the text;
        // reverts to the original inline row at sm+.
        "relative flex flex-col gap-3 p-3 rounded-lg",
        "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        "bg-primary/5 border border-primary/20",
        className
      )}
    >
      {/* pr-10 on mobile keeps the text clear of the absolutely-placed close */}
      <div className="flex items-start gap-3 pr-10 sm:pr-0">
        <Settings className="size-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm text-muted-foreground">
          {t("zonePersonalization.ctaMessage")}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:shrink-0">
        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
          <Link to="/my-zones">
            {t("zonePersonalization.ctaButton")}
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          aria-label={t("zonePersonalization.dismiss")}
          className="absolute right-1.5 top-1.5 size-9 sm:static"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

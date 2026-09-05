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
    // Stacks vertically on mobile so the button never overlaps the text;
    // reverts to the inline row at 640px.
    <div className={cn("zn-zone-cta", className)}>
      {/* The inline-end padding on mobile keeps the text clear of the
          absolutely-placed close button. */}
      <div className="zn-zone-cta__body">
        <Settings className="zn-zone-cta__icon" />
        <p className="zn-zone-cta__text">
          {t("zonePersonalization.ctaMessage")}
        </p>
      </div>
      <div className="zn-zone-cta__actions">
        <Button variant="outline" size="sm" asChild className="zn-zone-cta__link">
          <Link to="/my-zones">
            {t("zonePersonalization.ctaButton")}
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          aria-label={t("zonePersonalization.dismiss")}
          className="zn-zone-cta__dismiss"
        >
          <X />
        </Button>
      </div>
    </div>
  );
}

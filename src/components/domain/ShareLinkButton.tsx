import { useTranslation } from "react-i18next";
import { useShareLink } from "@/hooks/useShareLink";
import { Share } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface ShareLinkButtonProps {
  /** Built lazily so the URL always reflects the current inputs. */
  buildUrl: () => string;
  /** Title passed to the native share sheet. */
  title?: string;
  label?: string;
  disabled?: boolean;
  variant?: "outline" | "secondary" | "ghost";
  className?: string;
}

/**
 * Share the current page state as a link: native share sheet when available
 * (mobile), clipboard fallback everywhere else.
 */
export function ShareLinkButton({
  buildUrl,
  title,
  label,
  disabled,
  variant = "outline",
  className,
}: ShareLinkButtonProps) {
  const { t } = useTranslation("common");

  const handleShare = useShareLink(buildUrl, title);

  return (
    <Button
      variant={variant}
      onClick={handleShare}
      disabled={disabled}
      className={className}
    >
      <Share />
      {label ?? t("share.link")}
    </Button>
  );
}

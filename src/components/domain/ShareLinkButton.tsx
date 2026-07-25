import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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

  const handleShare = useCallback(async () => {
    const url = buildUrl();
    if (navigator.share) {
      try {
        await navigator.share(title ? { title, url } : { url });
      } catch {
        // Share sheet dismissed — nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("share.toast.linkCopied"));
    } catch {
      toast.error(t("share.toast.error"));
    }
  }, [buildUrl, title, t]);

  return (
    <Button
      variant={variant}
      onClick={handleShare}
      disabled={disabled}
      className={className}
    >
      <Share className="size-4" />
      {label ?? t("share.link")}
    </Button>
  );
}

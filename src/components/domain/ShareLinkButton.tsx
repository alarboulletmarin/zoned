import { useTranslation } from "react-i18next";
import { useCopiedFlag, useShareLink } from "@/hooks/useShareLink";
import { Check, Share } from "@/components/icons";
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

  const [copied, flash] = useCopiedFlag();
  const handleShare = useShareLink(buildUrl, title, flash);
  const idle = label ?? t("share.link");

  /* Geste : la copie se confirme sur le bouton lui-même, l'icône devient une
     coche et le libellé dit Copié, 1,5 s. Les deux libellés partagent une
     case de grille (`.zn-swap`), le bouton garde la largeur du plus long et
     rien ne bouge autour. La région vivante le dit à qui ne le voit pas. */
  return (
    <>
      <Button
        variant={variant}
        onClick={handleShare}
        disabled={disabled}
        className={className}
        data-copied={copied || undefined}
      >
        {copied ? <Check /> : <Share />}
        <span className="zn-swap">
          <span data-shown={!copied || undefined}>{idle}</span>
          <span data-shown={copied || undefined}>{t("share.copiedShort")}</span>
        </span>
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? t("share.toast.linkCopied") : ""}
      </span>
    </>
  );
}

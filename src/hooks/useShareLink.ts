import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/toast";

/**
 * Partager un lien : la feuille de partage du système quand elle existe
 * (téléphone), le presse-papiers et un toast partout ailleurs.
 *
 * Sorti de `ShareLinkButton` pour qu'un item de menu puisse partager aussi :
 * le bouton ne relaie ni ref ni gestionnaires, il ne survit pas au `Slot`
 * d'un `DropdownMenuItem`. Le hook n'a pas ce problème, il rend une fonction.
 */
export function useShareLink(
  buildUrl: () => string,
  title?: string,
  /** Un bouton qui confirme sur lui-même : le toast de succès n'est pas dit. */
  onCopied?: () => void,
) {
  const { t } = useTranslation("common");
  return useCallback(async () => {
    const url = buildUrl();
    if (navigator.share) {
      try {
        await navigator.share(title ? { title, url } : { url });
      } catch {
        // Share sheet dismissed, nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      if (onCopied) onCopied();
      else toast.success(t("share.toast.linkCopied"));
    } catch (err) {
      toast.failure(t("share.toast.linkCopyFailed"), err);
    }
  }, [buildUrl, title, t, onCopied]);
}

/**
 * Geste : la copie a porté, dit là où on a cliqué. Vrai pendant 1,5 s après
 * `flash()`, puis le bouton revient. Un second clic relance le compte.
 */
export function useCopiedFlag(holdMs = 1500) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const flash = useCallback(() => {
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), holdMs);
  }, [holdMs]);
  return [copied, flash] as const;
}

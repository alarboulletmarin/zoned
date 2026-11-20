import { useCallback } from "react";
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
export function useShareLink(buildUrl: () => string, title?: string) {
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
      toast.success(t("share.toast.linkCopied"));
    } catch (err) {
      toast.failure(t("share.toast.linkCopyFailed"), err);
    }
  }, [buildUrl, title, t]);
}

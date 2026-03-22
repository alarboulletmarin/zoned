import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const HINT_PREFIX = "zoned-hint-";

export function usePageHint(
  hintKey: string,
  titleKey: string,
  descriptionKey: string,
) {
  const { t } = useTranslation("common");

  useEffect(() => {
    const storageKey = `${HINT_PREFIX}${hintKey}-seen`;
    if (localStorage.getItem(storageKey) === "true") return;

    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, "true");
      toast(t(titleKey), {
        description: t(descriptionKey),
        duration: 8000,
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [hintKey, titleKey, descriptionKey, t]);
}

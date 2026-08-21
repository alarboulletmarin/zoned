/**
 * "Zoned" wordmark — Brut brand mark used across the app chrome (top bar,
 * mobile nav panel, footer). No icon: the design system's nav specs render
 * the brand as tight-tracked uppercase type only (see "Zoned Brut - Design
 * System.dc.html", section 02 "Navigation").
 *
 * Renders the translated app name so FR/EN stay in sync with `common:app.name`
 * (currently "Zoned" in both locales) instead of hardcoding the string.
 */

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  const { t } = useTranslation("common");
  return (
    <span
      className={cn(
        "font-sans font-bold uppercase leading-none tracking-[-0.045em]",
        className,
      )}
    >
      {t("app.name")}
    </span>
  );
}

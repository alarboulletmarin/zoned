import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface CalculatorHeroProps {
  /** Category label shown after the "Calculateurs" breadcrumb link. */
  groupLabel: string;
  title: React.ReactNode;
  description: React.ReactNode;
  className?: string;
}

/**
 * Sober "Brut" page header shared by every calculator detail page: a mono
 * breadcrumb back to the hub, a big uppercase title and a short lead. Mirrors
 * the hero pattern already established on HomePage's "Aujourd'hui" module
 * rather than the italic `EditorialTitle` used pre-migration.
 */
export function CalculatorHero({ groupLabel, title, description, className }: CalculatorHeroProps) {
  const { t } = useTranslation("common");

  return (
    <div className={cn("mb-8 md:mb-10", className)}>
      <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
        <Link to="/calculators" className="underline underline-offset-2 hover:text-foreground transition-colors">
          {t("calculators:calculateurs.breadcrumb")}
        </Link>
        {" · "}
        {groupLabel}
      </p>
      <h1 className="font-sans font-bold uppercase leading-[0.92] tracking-[-0.05em] text-[32px] sm:text-[42px] md:text-[52px] mt-3">
        {title}
      </h1>
      <p className="mt-3 text-[15px] md:text-base leading-[1.55] text-foreground/80 max-w-[58ch] text-wrap-pretty">
        {description}
      </p>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Calculator } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function NutritionHero() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="border-t border-filet pt-5 md:pt-6">
      <p className="font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
        {t("hub.eyebrow")}
      </p>
      <h1 className="font-sans font-bold uppercase leading-[0.9] tracking-[-0.05em] text-[36px] sm:text-[44px] md:text-[52px] mt-2 max-w-3xl">
        {t("hub.title")}
      </h1>
      <p className="text-muted-foreground md:text-lg max-w-xl mt-3">
        {t("hub.subtitle")}
      </p>
      <div className="mt-5">
        <Button asChild variant="outline">
          <Link to="/guides/nutrition">
            <Calculator className="size-4" aria-hidden="true" />
            <span>{t("hub.cta.calculator")}</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

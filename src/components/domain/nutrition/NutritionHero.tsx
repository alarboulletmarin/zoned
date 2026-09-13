import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Calculator } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function NutritionHero() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="zn-nut-hero">
      <span className="zn-kicker">{t("hub.eyebrow")}</span>
      <h1 className="zn-display" data-level="2">
        {t("hub.title")}
      </h1>
      <p className="zn-body zn-body--lead zn-measure">{t("hub.subtitle")}</p>
      {/* The screen's one vermillon fill: the calculator is what this page is
          for, and the strip at the foot offers the rest as outlined doors. */}
      <div className="zn-cluster zn-nut-hero__actions">
        <Button asChild size="lg">
          <Link to="/guides/nutrition">
            <Calculator aria-hidden="true" />
            <span>{t("hub.cta.calculator")}</span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

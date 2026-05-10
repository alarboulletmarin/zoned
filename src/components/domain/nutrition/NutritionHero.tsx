import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Utensils, ArrowRight, Calculator, Sparkles } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function NutritionHero() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 p-6 md:p-10 lg:p-12">
      <Utensils
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -right-8 size-44 md:size-64 lg:size-72 text-primary opacity-[0.06] dark:opacity-[0.10]"
      />
      <div className="relative max-w-2xl space-y-4 md:space-y-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {t("hub.eyebrow")}
        </span>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
          {t("hub.title")}
        </h1>
        <p className="text-muted-foreground md:text-lg max-w-xl">
          {t("hub.subtitle")}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link to="/guides/nutrition">
              <Calculator className="size-4" aria-hidden="true" />
              <span>{t("hub.cta.calculator")}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

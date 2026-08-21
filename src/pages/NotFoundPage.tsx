import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <SEOHead
        title="404"
        description={t("errors.notFound.description")}
        noindex
      />
      <div className="py-16 flex flex-col items-center justify-center text-center max-w-md md:max-w-lg mx-auto">
        <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground">
          {t("errors.workoutNotFoundPanel.eyebrow")}
        </span>
        <span className="font-sans font-bold text-8xl uppercase leading-[0.9] tracking-tight text-foreground/15 mt-3">
          404
        </span>
        <h1 className="font-sans font-bold text-3xl sm:text-4xl uppercase leading-[0.95] tracking-tight mt-4">
          {t("errors.notFound.title")}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {t("errors.notFound.description")}
        </p>
        <Button asChild className="mt-8">
          <Link to="/">{t("errors.notFound.backHome")}</Link>
        </Button>
      </div>
    </>
  );
}

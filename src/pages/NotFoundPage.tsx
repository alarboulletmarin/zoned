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
      <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
        <span className="text-8xl font-bold text-muted-foreground/50">404</span>
        <h1 className="text-2xl font-bold">{t("errors.notFound.title")}</h1>
        <p className="text-muted-foreground">
          {t("errors.notFound.description")}
        </p>
        <Button asChild>
          <Link to="/">{t("errors.notFound.backHome")}</Link>
        </Button>
      </div>
    </>
  );
}

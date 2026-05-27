import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { EditorialTitle, FadeUp } from "@/components/editorial";

export function NotFoundPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <SEOHead
        title="404"
        description={t("errors.notFound.description")}
        noindex
      />
      <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 max-w-md md:max-w-lg mx-auto">
        <span className="font-sans font-semibold italic text-8xl text-muted-foreground/40 tracking-tight">
          404
        </span>
        <EditorialTitle as="h1" size="md">
          {t("errors.notFound.title")}
        </EditorialTitle>
        <FadeUp as="p" delay={0.1} className="text-muted-foreground">
          {t("errors.notFound.description")}
        </FadeUp>
        <Button asChild>
          <Link to="/">{t("errors.notFound.backHome")}</Link>
        </Button>
      </div>
    </>
  );
}

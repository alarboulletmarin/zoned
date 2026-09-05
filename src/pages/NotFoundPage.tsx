import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * The one screen the design kit deliberately leaves unmocked: it says a 404
 * is an `Alert kind="error"` on an otherwise empty page, and nothing more.
 *
 * The copy follows the system's rule for an error — what happened, what is
 * still intact, and the way out — because an error with no way forward is a
 * dead end.
 */
export function NotFoundPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <SEOHead
        title="404"
        description={t("errors.notFound.description")}
        noindex
      />
      <div className="zn-ref__void">
        <span className="zn-ref__code" aria-hidden="true">
          404
        </span>
        <h1 className="zn-display" data-level="3">
          {t("errors.notFound.title")}
        </h1>
        <Alert
          kind="error"
          action={
            <Button asChild>
              <Link to="/">{t("errors.notFound.backHome")}</Link>
            </Button>
          }
        >
          {t("errors.notFound.body")}
        </Alert>
      </div>
    </>
  );
}

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import WalkingAway from "@/assets/doodles/walking-away.svg?react";

/**
 * The one screen the design kit deliberately leaves unmocked: it says a 404
 * is an `Alert kind="error"` on an otherwise empty page, and nothing more.
 *
 * The copy follows the system's rule for an error — what happened, what is
 * still intact, and the way out — because an error with no way forward is a
 * dead end.
 *
 * The drawing is the one docs/doodles.md calls almost mandatory here: a figure
 * seen from behind, walking off. It says what the code and the sentence say —
 * you have gone past the place — without a second sentence, and it is the only
 * screen in the app with nothing else on it to look at.
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
        <WalkingAway
          className="zn-ref__art"
          aria-hidden="true"
          focusable="false"
        />
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

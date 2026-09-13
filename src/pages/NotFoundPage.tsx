import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { Button } from "@/components/ui/button";
import WalkingAway from "@/assets/doodles/walking-away.svg?react";

/**
 * The one screen the design kit deliberately leaves unmocked: it says a 404
 * is an `Alert kind="error"` on an otherwise empty page, and nothing more.
 *
 * The copy follows the system's rule for an error, what happened, what is
 * still intact, and the way out, because an error with no way forward is a
 * dead end.
 *
 * The drawing is the sentence. The ground rule starts at the left edge of the
 * screen and stops; a figure walks toward the void past its end, and the
 * status code is a mono dimension printed where the ground ran out. That is
 * what the alert and its pictogram used to say, with a figure competing
 * against a glyph in a pink fill, so both are gone. The figure is the
 * existing walking-away drawing turned round by CSS: a stage direction, not a
 * correction of an approved drawing.
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
      <div className="zn-void">
        <div className="zn-void__scene" aria-hidden="true">
          <div className="zn-void__ground">
            <WalkingAway className="zn-void__art" focusable="false" />
          </div>
          <span className="zn-void__code">404</span>
        </div>
        <h1 className="zn-display" data-level="3">
          {t("errors.notFound.title")}
        </h1>
        <p className="zn-body zn-void__body">{t("errors.notFound.body")}</p>
        <Button asChild>
          <Link to="/">{t("errors.notFound.backHome")}</Link>
        </Button>
      </div>
    </>
  );
}

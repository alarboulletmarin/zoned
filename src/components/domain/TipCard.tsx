import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lightbulb, ChevronRight } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Tip } from "@/data/tips";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { usePickLang } from "@/lib/i18n-utils";

export interface TipCardProps {
  tip: Tip;
  variant?: "inline" | "card" | "banner";
  className?: string;
}

/**
 * A contextual tip, at three densities: a line inside a paragraph
 * (`inline`), a compact aside beside a session (`card`), a full-width strip
 * (`banner`). Same anatomy throughout — ink lamp, the tip, the way out.
 */
export function TipCard({
  tip,
  variant = "card",
  className,
}: TipCardProps) {
  const { t } = useTranslation("common");
  const pick = usePickLang();

  const text = pick(tip, "text");

  // Determine link destination
  const hasLink = tip.relatedTermId || tip.articleId;
  const linkTo = tip.articleId
    ? `/learn/${tip.articleId}`
    : tip.relatedTermId
      ? `/glossary#${tip.relatedTermId}`
      : null;

  const more = hasLink && linkTo && (
    <Link to={linkTo} className="zn-clink" data-size="sm">
      {t("tips.learnMore")}
      <ChevronRight />
    </Link>
  );

  return (
    <div className={cn("zn-tip", className)} data-variant={variant}>
      <Lightbulb className="zn-tip__icon" />
      <div className="zn-tip__body">
        {variant === "card" && (
          <span className="zn-kicker zn-kicker--inline">{t("tips.title")}</span>
        )}
        <p className="zn-tip__text">
          <GlossaryLinkedText text={text} />
          {/* Inline tips keep the way out on the same line as the sentence. */}
          {variant === "inline" && more && <> {more}</>}
        </p>
        {variant !== "inline" && more}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ArticleMeta } from "@/data/articles";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { usePickLang } from "@/lib/i18n-utils";

interface ArticleCardProps {
  article: ArticleMeta;
  className?: string;
}

/**
 * One article in the "Comprendre" index.
 *
 * The category is the only badge, the reading time is always shown — it is
 * the promise the card makes — and the whole card is the target, so there is
 * no "Lire" button to add.
 */
export function ArticleCard({ article, className }: ArticleCardProps) {
  const { t } = useTranslation(["content", "common"]);
  const pick = usePickLang();

  return (
    <Link to={`/learn/${article.slug}`} className={cn("zn-ecard", className)}>
      <Badge variant="outline">
        {t(`content:learn.categories.${article.category}`)}
      </Badge>

      <h3 className="zn-ecard__title">{pick(article, "title")}</h3>

      <p className="zn-ecard__desc">
        <GlossaryLinkedText text={pick(article, "description")} />
      </p>

      <div className="zn-ecard__meta">
        <span className="zn-ecard__code">
          {article.readTime} {t("common:units.minutes")}
        </span>
      </div>
    </Link>
  );
}

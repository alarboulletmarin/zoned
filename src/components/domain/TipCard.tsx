import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lightbulb, ChevronRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Tip } from "@/data/tips";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";

export interface TipCardProps {
  tip: Tip;
  variant?: "inline" | "card" | "banner";
  className?: string;
}

export function TipCard({
  tip,
  variant = "card",
  className,
}: TipCardProps) {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language === "en";

  const text = isEn ? tip.textEn : tip.text;

  // Determine link destination
  const hasLink = tip.relatedTermId || tip.articleId;
  const linkTo = tip.articleId
    ? `/learn/${tip.articleId}`
    : tip.relatedTermId
      ? `/glossary#${tip.relatedTermId}`
      : null;

  if (variant === "inline") {
    return (
      <div className={cn("flex items-start gap-2 text-sm", className)}>
        <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="text-muted-foreground"><GlossaryLinkedText text={text} /></span>
          {hasLink && linkTo && (
            <Link
              to={linkTo}
              className="ml-1 text-primary hover:underline inline-flex items-center"
            >
              {t("tips.learnMore")}
              <ChevronRight className="size-3" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <Card className={cn("bg-gradient-to-r from-amber-500/10 to-amber-400/5 border-amber-500/20", className)}>
        <CardContent className="flex items-center gap-3 py-3 sm:py-4">
          <div className="rounded-full bg-amber-500/10 p-1.5 sm:p-2 shrink-0">
            <Lightbulb className="size-4 sm:size-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground"><GlossaryLinkedText text={text} /></p>
          </div>
          {hasLink && linkTo && (
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link to={linkTo}>
                <span className="hidden sm:inline">{t("tips.learnMore")}</span>
                <ChevronRight className="size-4 sm:ml-1" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default: card variant (used in workout detail)
  return (
    <Card size="compact" className={cn("overflow-hidden", className)}>
      <CardContent className="py-2.5">
        <div className="flex items-start gap-2.5">
          <div className="size-7 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
            <Lightbulb className="size-3.5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-0.5">
              {t("tips.title")}
            </p>
            <p className="text-sm text-muted-foreground"><GlossaryLinkedText text={text} /></p>
            {hasLink && linkTo && (
              <Link
                to={linkTo}
                className="text-xs text-primary hover:underline inline-flex items-center mt-1.5"
              >
                {t("tips.learnMore")}
                <ChevronRight className="size-3" />
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

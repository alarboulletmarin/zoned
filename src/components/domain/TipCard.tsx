import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lightbulb, X, ChevronRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Tip } from "@/data/tips";

export interface TipCardProps {
  tip: Tip;
  variant?: "inline" | "card" | "banner";
  onDismiss?: () => void;
  className?: string;
}

export function TipCard({
  tip,
  variant = "card",
  onDismiss,
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
          <span className="text-muted-foreground">{text}</span>
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
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-amber-500/10 p-3">
              <Lightbulb className="size-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-amber-600 dark:text-amber-400">
                {t("tips.title")}
              </h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasLink && linkTo && (
              <Button variant="outline" asChild>
                <Link to={linkTo}>
                  {t("tips.learnMore")}
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                aria-label={t("tips.dismiss")}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default: card variant
  return (
    <Card size="compact" className={cn("overflow-hidden", className)}>
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
            <Lightbulb className="size-4 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {t("tips.title")}
              </p>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 -mt-1 -mr-1"
                  onClick={onDismiss}
                  aria-label={t("tips.dismiss")}
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{text}</p>
            {hasLink && linkTo && (
              <Link
                to={linkTo}
                className="text-xs text-primary hover:underline inline-flex items-center mt-2"
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

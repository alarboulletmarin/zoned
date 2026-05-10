import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Calculator,
  Book,
  GraduationCap,
  Flag,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { cn } from "@/lib/utils";

interface CtaItem {
  to: string;
  Icon: React.ComponentType<IconProps>;
  titleKey: string;
  subtitleKey: string;
}

const CTAS: CtaItem[] = [
  { to: "/guides/nutrition", Icon: Calculator, titleKey: "hub.ctaStrip.guide.title", subtitleKey: "hub.ctaStrip.guide.subtitle" },
  { to: "/glossary", Icon: Book, titleKey: "hub.ctaStrip.glossary.title", subtitleKey: "hub.ctaStrip.glossary.subtitle" },
  { to: "/learn/nutrition", Icon: GraduationCap, titleKey: "hub.ctaStrip.article.title", subtitleKey: "hub.ctaStrip.article.subtitle" },
  { to: "/race-simulator", Icon: Flag, titleKey: "hub.ctaStrip.simulator.title", subtitleKey: "hub.ctaStrip.simulator.subtitle" },
];

export function NutritionCTAStrip() {
  const { t } = useTranslation("nutrition");

  return (
    <section aria-labelledby="cta-strip-heading" className="space-y-4">
      <h2 id="cta-strip-heading" className="text-xl md:text-2xl font-bold tracking-tight">
        {t("hub.ctaStrip.heading")}
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CTAS.map(({ to, Icon, titleKey, subtitleKey }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "group flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/30 p-4",
              "transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-md hover:bg-muted/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <div className="flex items-center justify-between">
              <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
              <ArrowRight
                className="size-4 text-muted-foreground transition-transform motion-safe:group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold leading-tight">{t(titleKey)}</p>
              <p className="text-xs text-muted-foreground">{t(subtitleKey)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

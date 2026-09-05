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
    <section
      aria-labelledby="cta-strip-heading"
      className="zn-stack"
      style={{ "--gap": "var(--sp-11)" } as React.CSSProperties}
    >
      <h2 id="cta-strip-heading" className="zn-title" data-level="2">
        {t("hub.ctaStrip.heading")}
      </h2>
      <div
        className="zn-grid"
        style={{ "--cols": 4, "--cols-md": 2 } as React.CSSProperties}
      >
        {CTAS.map(({ to, Icon, titleKey, subtitleKey }) => (
          <Link key={to} to={to} className="zn-nut-cta">
            <div className="zn-nut-cta__head">
              <Icon aria-hidden="true" />
              <ArrowRight className="zn-nut-cta__arrow" aria-hidden="true" />
            </div>
            <div>
              <p className="zn-nut-cta__title">{t(titleKey)}</p>
              <p className="zn-nut-cta__sub">{t(subtitleKey)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

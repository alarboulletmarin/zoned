import type { CSSProperties, FunctionComponent, SVGProps } from "react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { DoorCard } from "@/components/domain/DoorCard";
import Stretching from "@/assets/doodles/stretching.svg?react";
import { nutritionSections } from "@/data/guides/nutrition";
import { racePrepSections } from "@/data/guides/race-prep";
import { warmupRoutines } from "@/data/guides/warmup";

/**
 * The three practical guides.
 *
 * A hub is three doors and nothing else, so it is built out of the same
 * DoorCard the calculators hub uses: the whole card is the link, the mono
 * kicker says what is behind it, and the vermillon line at the foot is the
 * promise. The icon medallions the page used to carry are gone — three tinted
 * chips are three accents on a screen allowed one.
 */
interface GuideEntry {
  id: string;
  kickerKey: string;
  /** What the kicker counts — read from the guide's own data, never typed. */
  count: number;
  titleKey: string;
  descriptionKey: string;
  href: string;
  /** Le dessin que porte la porte, quand il existe. */
  art?: FunctionComponent<SVGProps<SVGElement>>;
}

const GUIDES: GuideEntry[] = [
  {
    id: "nutrition",
    kickerKey: "nutrition.kicker",
    count: nutritionSections.length,
    titleKey: "nutrition.title",
    descriptionKey: "nutrition.description",
    href: "/guides/nutrition",
  },
  {
    id: "race-prep",
    kickerKey: "racePrep.kicker",
    count: racePrepSections.length,
    titleKey: "racePrep.title",
    descriptionKey: "racePrep.description",
    href: "/guides/race-prep",
  },
  {
    id: "warmup",
    kickerKey: "warmup.kicker",
    count: warmupRoutines.length,
    titleKey: "warmup.title",
    descriptionKey: "warmup.description",
    href: "/guides/warmup",
    art: Stretching,
  },
];

export function GuidesPage() {
  const { t } = useTranslation("guides");

  return (
    <>
      <SEOHead
        title="Guides"
        description={t("guides.seoDescription")}
        canonical="/guides"
        jsonLd={[
          {
            "@type": "CollectionPage",
            name: "Guides",
            description: t("guides.seoCollectionDescription"),
            url: "https://zoned.run/guides",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Guides" },
            ],
          },
        ]}
      />

      <div className="zn-guide">
        <section
          className="zn-stack zn-guide__head"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("guides.kicker", { n: GUIDES.length })}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("guides.heading")}
          </h1>
          <p className="zn-body zn-body--lead zn-guide__lede">
            {t("guides.subtitle")}
          </p>
        </section>

        <section className="zn-guide__band">
          <div className="zn-grid">
            {GUIDES.map((guide) => (
              <DoorCard
                key={guide.id}
                to={guide.href}
                kicker={t(guide.kickerKey, { n: guide.count })}
                title={t(guide.titleKey)}
                body={t(guide.descriptionKey)}
                cta={t("explore")}
                art={guide.art}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

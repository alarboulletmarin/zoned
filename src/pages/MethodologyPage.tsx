import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import { ZoneFigures } from "@/components/domain/ZoneFigures";
import { usePickLang } from "@/lib/i18n-utils";
import type { ZoneNumber } from "@/types";

// ---------------------------------------------------------------------------
// Zone data
// ---------------------------------------------------------------------------

interface ZoneInfo {
  zone: ZoneNumber;
  nameFr: string;
  nameEn: string;
  marker: string;
  markerEn: string;
  developsFr: string;
  developsEn: string;
}

const zones: ZoneInfo[] = [
  {
    zone: 1,
    nameFr: "Récupération",
    nameEn: "Recovery",
    marker: "Sous le VT1",
    markerEn: "Below VT1",
    developsFr: "Favorise la circulation sanguine et l'élimination des déchets métaboliques",
    developsEn: "Promotes blood flow and eliminates metabolic waste",
  },
  {
    zone: 2,
    nameFr: "Endurance",
    nameEn: "Endurance",
    marker: "Autour du VT1",
    markerEn: "Around VT1",
    developsFr: "Adaptations mitochondriales, oxydation des graisses, base aérobie",
    developsEn: "Mitochondrial adaptations, fat oxidation, aerobic base",
  },
  {
    zone: 3,
    nameFr: "Tempo",
    nameEn: "Tempo",
    marker: "Entre VT1 et VT2",
    markerEn: "Between VT1 and VT2",
    developsFr: "Capacité aérobie et clairance du lactate",
    developsEn: "Aerobic capacity and lactate clearance",
  },
  {
    zone: 4,
    nameFr: "Seuil",
    nameEn: "Threshold",
    marker: "Autour du VT2 / seuil lactique",
    markerEn: "Around VT2 / lactate turn point",
    developsFr: "Relève le seuil anaérobie",
    developsEn: "Raises anaerobic threshold",
  },
  {
    zone: 5,
    nameFr: "VO2max",
    nameEn: "VO2max",
    marker: "Au-dessus du VT2",
    markerEn: "Above VT2",
    developsFr: "Puissance aérobie maximale",
    developsEn: "Maximal aerobic power",
  },
  {
    zone: 6,
    nameFr: "Neuromusculaire",
    nameEn: "Neuromuscular",
    marker: "Effort maximal",
    markerEn: "Maximal effort",
    developsFr: "Recrutement des unités motrices, puissance de sprint, anaérobie alactique",
    developsEn: "Motor unit recruitment, sprint power, anaerobic alactic",
  },
];

// ---------------------------------------------------------------------------
// Researchers data
// ---------------------------------------------------------------------------

interface Researcher {
  name: string;
  contributionFr: string;
  contributionEn: string;
  publicationFr: string;
  publicationEn: string;
  link?: string;
}

const researchers: Researcher[] = [
  {
    name: "Stephen Seiler",
    contributionFr: "Modèle d'entraînement polarisé (80/20)",
    contributionEn: "Polarized training model (80/20)",
    publicationFr: "\"Quantifying training intensity distribution in elite endurance athletes\" (2006, Scand J Med Sci Sports)",
    publicationEn: "\"Quantifying training intensity distribution in elite endurance athletes\" (2006, Scand J Med Sci Sports)",
    link: "https://pubmed.ncbi.nlm.nih.gov/16430681/",
  },
  {
    name: "Véronique Billat",
    contributionFr: "Chercheuse française. Intervalles à VO2max, protocole 30/30, concept de vVO2max",
    contributionEn: "French researcher. VO2max intervals, 30/30 protocol, vVO2max concept",
    publicationFr: "\"Intermittent runs at vVO2max\" (1999)",
    publicationEn: "\"Intermittent runs at vVO2max\" (1999)",
    link: "https://pubmed.ncbi.nlm.nih.gov/10638376/",
  },
  {
    name: "Jack Daniels",
    contributionFr: "Système VDOT et zones d'entraînement (1933–2025)",
    contributionEn: "VDOT system and training zones (1933–2025)",
    publicationFr: "Livre : \"Daniels' Running Formula\"",
    publicationEn: "Book: \"Daniels' Running Formula\"",
  },
  {
    name: "Arthur Lydiard",
    contributionFr: "Périodisation et construction de la base aérobie",
    contributionEn: "Periodization and aerobic base building",
    publicationFr: "Pionnier de l'approche par construction de base",
    publicationEn: "Pioneer of the base-building approach",
  },
  {
    name: "Tim Noakes",
    contributionFr: "Théorie du gouverneur central",
    contributionEn: "Central governor theory",
    publicationFr: "Livre : \"Lore of Running\"",
    publicationEn: "Book: \"Lore of Running\"",
  },
  {
    name: "Wildor Hollmann & Alois Mader",
    contributionFr: "Origines du concept de seuil lactique (groupe de Cologne, années 1970)",
    contributionEn: "Lactate threshold concept origins (Cologne group, 1970s)",
    publicationFr: "Travaux fondateurs sur le métabolisme lactique",
    publicationEn: "Foundational work on lactate metabolism",
  },
  {
    name: "Oliver Faude",
    contributionFr: "Revue définitive des concepts de seuil lactique (2009)",
    contributionEn: "Definitive review of lactate threshold concepts (2009)",
    publicationFr: "\"Lactate Threshold Concepts\" (Sports Med, 2009)",
    publicationEn: "\"Lactate Threshold Concepts\" (Sports Med, 2009)",
    link: "https://link.springer.com/article/10.2165/00007256-200939060-00003",
  },
  {
    name: "Iñigo San Millán",
    contributionFr: "Entraînement en Zone 2 et recherche sur la santé métabolique",
    contributionEn: "Zone 2 training and metabolic health research",
    publicationFr: "Recherche sur la santé métabolique et les mitochondries",
    publicationEn: "Research on metabolic health and mitochondria",
  },
];

// ---------------------------------------------------------------------------
// Studies data
// ---------------------------------------------------------------------------

interface Study {
  authors: string;
  year: number;
  titleFr: string;
  titleEn: string;
  journal: string;
  link?: string;
}

const studies: Study[] = [
  {
    authors: "Seiler & Kjerland",
    year: 2006,
    titleFr: "Quantifying training intensity distribution in elite endurance athletes",
    titleEn: "Quantifying training intensity distribution in elite endurance athletes",
    journal: "Scand J Med Sci Sports 16(1):49-56",
    link: "https://pubmed.ncbi.nlm.nih.gov/16430681/",
  },
  {
    authors: "Billat et al.",
    year: 1999,
    titleFr: "Interval training at VO2max: effects on aerobic performance",
    titleEn: "Interval training at VO2max: effects on aerobic performance",
    journal: "Med Sci Sports Exerc",
    link: "https://pubmed.ncbi.nlm.nih.gov/9927024/",
  },
  {
    authors: "Billat et al.",
    year: 2000,
    titleFr: "Intermittent runs at vVO2max enables longer time at VO2max",
    titleEn: "Intermittent runs at vVO2max enables longer time at VO2max",
    journal: "Eur J Appl Physiol",
    link: "https://pubmed.ncbi.nlm.nih.gov/10638376/",
  },
  {
    authors: "Faude et al.",
    year: 2009,
    titleFr: "Lactate Threshold Concepts",
    titleEn: "Lactate Threshold Concepts",
    journal: "Sports Med 39(6):469-490",
    link: "https://link.springer.com/article/10.2165/00007256-200939060-00003",
  },
  {
    authors: "Kindermann et al.",
    year: 1979,
    titleFr: "The significance of the aerobic-anaerobic transition for training",
    titleEn: "The significance of the aerobic-anaerobic transition for training",
    journal: "Dtsch Z Sportmed",
  },
  {
    authors: "Wasserman & McIlroy",
    year: 1964,
    titleFr: "Detecting the threshold of anaerobic metabolism",
    titleEn: "Detecting the threshold of anaerobic metabolism",
    journal: "Am J Cardiol",
  },
];

// ---------------------------------------------------------------------------
// Resources data
// ---------------------------------------------------------------------------

interface Resource {
  nameFr: string;
  nameEn: string;
  link?: string;
}

interface ResourceGroup {
  labelFr: string;
  labelEn: string;
  items: Resource[];
}

const resources: ResourceGroup[] = [
  {
    labelFr: "Livres",
    labelEn: "Books",
    items: [
      { nameFr: "\"Daniels' Running Formula\" - Jack Daniels", nameEn: "\"Daniels' Running Formula\" - Jack Daniels" },
      { nameFr: "\"Lore of Running\" - Tim Noakes", nameEn: "\"Lore of Running\" - Tim Noakes" },
      { nameFr: "\"Entraînement pratique et scientifique à la course à pied\" - Véronique Billat", nameEn: "\"Practical and Scientific Training for Running\" - Véronique Billat" },
    ],
  },
  {
    labelFr: "Blogs",
    labelEn: "Blogs",
    items: [
      { nameFr: "Science of Running", nameEn: "Science of Running", link: "https://scienceofrunning.com" },
      { nameFr: "Running Writings", nameEn: "Running Writings", link: "https://runningwritings.com" },
      { nameFr: "Conseils Course à Pied", nameEn: "Conseils Course à Pied", link: "https://conseils-courseapied.com" },
    ],
  },
  {
    labelFr: "Podcasts",
    labelEn: "Podcasts",
    items: [
      { nameFr: "Science of Running (Steve Magness)", nameEn: "Science of Running (Steve Magness)" },
      { nameFr: "The Real Science of Sport (Ross Tucker)", nameEn: "The Real Science of Sport (Ross Tucker)" },
      { nameFr: "Fast Talk (VeloNews)", nameEn: "Fast Talk (VeloNews)" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MethodologyPage() {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();

  return (
    <>
      <SEOHead
        title={t("content:methodology.title")}
        description={t("content:methodology.seoDescription")}
        canonical="/methodology"
        jsonLd={[
          {
            "@type": "WebPage",
            name: t("content:methodology.title"),
            url: "https://zoned.run/methodology",
            description: t("content:methodology.seoDescription"),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("content:article.home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("content:methodology.title") },
            ],
          },
        ]}
      />

      <div className="zn-guide">
        {/* 1 — what this page is, and how much of it is cited */}
        <section
          className="zn-stack zn-guide__head"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("content:methodology.kicker", { n: studies.length })}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("content:methodology.heading")}
          </h1>
          <p className="zn-body zn-body--lead zn-guide__lede">
            {t("content:methodology.intro")}
          </p>
        </section>

        {/* 2 — the approach, as prose. The reading treatment is the article
            block: same measure, same rhythm, same pulled-out caution. */}
        <section className="zn-guide__band" aria-labelledby="meth-approach">
          <h2
            id="meth-approach"
            className="zn-title zn-guide__bandhead"
            data-level="2"
          >
            {t("content:methodology.ourApproach")}
          </h2>

          <div className="zn-prose zn-measure">
            <GlossaryLinkedText
              as="p"
              className="zn-prose__p"
              text={t("content:methodology.ourApproachText1")}
            />
            <GlossaryLinkedText
              as="p"
              className="zn-prose__p"
              text={t("content:methodology.ourApproachText2")}
            />
            <aside className="zn-prose__callout" data-kind="warning">
              <span className="zn-kicker zn-prose__callout-label">
                {t("content:article.callout.warning")}
              </span>
              <GlossaryLinkedText
                as="p"
                className="zn-prose__callout-text"
                text={t("content:methodology.ourApproachDisclaimer")}
              />
            </aside>
          </div>
        </section>

        {/* 3 — the six zones. The scale names the ink ramp once, then each
            zone is read on its own card in the ramp's own order. */}
        <section className="zn-guide__band" aria-labelledby="meth-zones">
          <h2
            id="meth-zones"
            className="zn-title zn-guide__bandhead"
            data-level="2"
          >
            {t("content:methodology.sixZones")}
          </h2>

          {/* La planche ouvre la bande, dans le flux et pas dans une carte
              grise — un dessin dans une boîte se lit comme une vignette. Les
              six postures disent la montée en effort, et les graduations sous
              la règle les nomment : la planche est la légende. Une seule
              figure par champ de vision — les cartes n'en portent pas. */}
          <ZoneFigures
            label={t("content:methodology.figuresLabel")}
            className="zn-guide__figures"
          />

          <div className="zn-grid">
            {zones.map((z) => (
              <div key={z.zone} className="zn-guide__zone">
                <div
                  className="zn-row"
                  style={{ "--gap": "var(--sp-5)" } as CSSProperties}
                >
                  <ZoneBadge zone={z.zone} />
                  <h3 className="zn-title zn-fill zn-truncate" data-level="4">
                    {pickLang(z, "name")}
                  </h3>
                </div>

                <div className="zn-guide__fact">
                  <span className="zn-kicker">
                    {t("content:methodology.marker")}
                  </span>
                  <GlossaryLinkedText
                    className="zn-body zn-body--sm zn-muted"
                    text={pickLang(z, "marker")}
                  />
                </div>

                <div className="zn-guide__fact">
                  <span className="zn-kicker">
                    {t("content:methodology.develops")}
                  </span>
                  <GlossaryLinkedText
                    className="zn-body zn-body--sm zn-muted"
                    text={pickLang(z, "develops")}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4 — who did the work. The publication is printed in the source
            face under the contribution it backs, not asserted as prose. */}
        <section className="zn-guide__band" aria-labelledby="meth-researchers">
          <h2
            id="meth-researchers"
            className="zn-title zn-guide__bandhead"
            data-level="2"
          >
            {t("content:methodology.researchers")}
          </h2>

          <div className="zn-grid" style={{ "--cols": 2 } as CSSProperties}>
            {researchers.map((r) => (
              <Card key={r.name} size="compact">
                <CardHeader>
                  <CardTitle>{r.name}</CardTitle>
                  <CardDescription>
                    <GlossaryLinkedText text={pickLang(r, "contribution")} />
                  </CardDescription>
                </CardHeader>
                <CardContent
                  className="zn-stack"
                  style={{ "--gap": "var(--sp-5)" } as CSSProperties}
                >
                  <p className="zn-source">{pickLang(r, "publication")}</p>
                  {r.link && (
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="zn-prose__link zn-guide__extlink"
                    >
                      {t("content:methodology.viewPublication")}
                      <ExternalLink />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 5 — the papers themselves, oldest marker first: year, title,
            journal. */}
        <section className="zn-guide__band" aria-labelledby="meth-studies">
          <h2
            id="meth-studies"
            className="zn-title zn-guide__bandhead"
            data-level="2"
          >
            {t("content:methodology.keyStudies")}
          </h2>

          <ul
            className="zn-stack"
            style={{ "--gap": "var(--sp-6)", listStyle: "none", margin: 0, padding: 0 } as CSSProperties}
          >
            {studies.map((s, i) => (
              <li key={i} className="zn-guide__ref">
                <span className="zn-mono zn-guide__refyear">{s.year}</span>
                <div
                  className="zn-stack zn-fill"
                  style={{ "--gap": "var(--sp-3)" } as CSSProperties}
                >
                  <p className="zn-guide__reftitle">{pickLang(s, "title")}</p>
                  <p className="zn-source">
                    {s.authors} &mdash; {s.journal}
                  </p>
                  {s.link && (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="zn-prose__link zn-guide__extlink"
                    >
                      {t("content:methodology.viewStudy")}
                      <ExternalLink />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 6 — where to read further, by kind. */}
        <section className="zn-guide__band" aria-labelledby="meth-resources">
          <h2
            id="meth-resources"
            className="zn-title zn-guide__bandhead"
            data-level="2"
          >
            {t("content:methodology.resources")}
          </h2>

          <div className="zn-grid">
            {resources.map((group) => (
              <div
                key={group.labelFr}
                className="zn-stack"
                style={{ "--gap": "var(--sp-8)" } as CSSProperties}
              >
                <h3 className="zn-kicker">{pickLang(group, "label")}</h3>
                <ul
                  className="zn-stack"
                  style={{ "--gap": "var(--sp-5)", listStyle: "none", margin: 0, padding: 0 } as CSSProperties}
                >
                  {group.items.map((item) => (
                    <li key={item.nameFr} className="zn-body zn-body--sm">
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="zn-prose__link zn-guide__extlink"
                        >
                          {pickLang(item, "name")}
                          <ExternalLink />
                        </a>
                      ) : (
                        <span className="zn-muted">{pickLang(item, "name")}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

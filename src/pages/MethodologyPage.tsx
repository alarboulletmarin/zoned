import { useTranslation } from "react-i18next";
import { ExternalLink, FlaskConical, BookOpen, GraduationCap, Activity } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SEOHead } from "@/components/seo";

// ---------------------------------------------------------------------------
// Zone data
// ---------------------------------------------------------------------------

interface ZoneInfo {
  zone: number;
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
// Zone border color mapping (Tailwind can't generate dynamic class names)
// ---------------------------------------------------------------------------

const zoneBorderClasses: Record<number, string> = {
  1: "border-t-zone-1",
  2: "border-t-zone-2",
  3: "border-t-zone-3",
  4: "border-t-zone-4",
  5: "border-t-zone-5",
  6: "border-t-zone-6",
};

const zoneTextClasses: Record<number, string> = {
  1: "text-zone-1",
  2: "text-zone-2",
  3: "text-zone-3",
  4: "text-zone-4",
  5: "text-zone-5",
  6: "text-zone-6",
};

const zoneBgClasses: Record<number, string> = {
  1: "bg-zone-1/10",
  2: "bg-zone-2/10",
  3: "bg-zone-3/10",
  4: "bg-zone-4/10",
  5: "bg-zone-5/10",
  6: "bg-zone-6/10",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MethodologyPage() {
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  return (
    <>
      <SEOHead
        title={isEn ? "Methodology" : "Méthodologie"}
        description={
          isEn
            ? "The scientific foundations behind Zoned's 6-zone training system. Based on established sports science research."
            : "Les fondements scientifiques du système d'entraînement à 6 zones de Zoned. Basé sur la recherche en sciences du sport."
        }
        canonical="/methodology"
        jsonLd={{
          "@type": "WebPage",
          name: isEn ? "Methodology" : "Méthodologie",
          url: "https://zoned.run/methodology",
          description: isEn
            ? "The scientific foundations behind Zoned's 6-zone training system."
            : "Les fondements scientifiques du système d'entraînement à 6 zones de Zoned.",
        }}
      />

      <div className="py-8 space-y-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <FlaskConical className="size-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">
            {isEn ? "The Science behind Zoned" : "La Science derrière Zoned"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isEn
              ? "Every workout in Zoned is grounded in decades of sports science research. Here are the physiological principles and key studies that shape our training zones."
              : "Chaque séance dans Zoned repose sur des décennies de recherche en sciences du sport. Voici les principes physiologiques et les études clés qui structurent nos zones d'entraînement."}
          </p>
        </div>

        {/* Section 1: Our Approach */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Activity className="size-5 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold">
              {isEn ? "Our Approach" : "Notre approche"}
            </h2>
          </div>
          <div className="text-muted-foreground space-y-3 pl-12">
            <p>
              {isEn
                ? "All workouts in Zoned are based on established sports science. The intensity zones are not arbitrary: they correspond to real physiological thresholds that can be measured in a lab or estimated from field tests."
                : "Toutes les séances de Zoned sont basées sur les sciences du sport établies. Les zones d'intensité ne sont pas arbitraires : elles correspondent à des seuils physiologiques réels, mesurables en laboratoire ou estimables à partir de tests de terrain."}
            </p>
            <p>
              {isEn
                ? "Our 6-zone model is derived from key physiological markers: the first ventilatory threshold (VT1), the second ventilatory threshold (VT2, also called the lactate turn point), and maximal oxygen uptake (VO2max). These thresholds define distinct metabolic states that require specific training stimuli."
                : "Notre modèle à 6 zones est dérivé de marqueurs physiologiques clés : le premier seuil ventilatoire (VT1), le second seuil ventilatoire (VT2, aussi appelé seuil lactique), et la consommation maximale d'oxygène (VO2max). Ces seuils définissent des états métaboliques distincts qui nécessitent des stimuli d'entraînement spécifiques."}
            </p>
            <p className="text-sm italic border-l-2 border-primary/30 pl-4">
              {isEn
                ? "Important: The percentage-based zones presented here are approximations. Heart rate at LT1 and LT2 varies significantly between individuals. Lab testing provides the most accurate boundaries for your personal zones."
                : "Important : les zones en pourcentage présentées ici sont des approximations. La fréquence cardiaque aux seuils LT1 et LT2 varie considérablement d'un individu à l'autre. Un test en laboratoire fournit les limites les plus précises pour vos zones personnelles."}
            </p>
          </div>
        </section>

        {/* Section 2: The 6 Zones */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Activity className="size-5 text-orange-500" />
            </div>
            <h2 className="text-2xl font-semibold">
              {isEn ? "The 6 Zones" : "Les 6 Zones"}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((z) => (
              <div
                key={z.zone}
                className={`rounded-lg border border-border/50 bg-card border-t-4 ${zoneBorderClasses[z.zone]} p-5 space-y-3`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center size-8 rounded-full text-sm font-bold ${zoneBgClasses[z.zone]} ${zoneTextClasses[z.zone]}`}
                  >
                    Z{z.zone}
                  </span>
                  <h3 className="font-semibold">
                    {isEn ? z.nameEn : z.nameFr}
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-foreground">
                      {isEn ? "Marker:" : "Marqueur :"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {isEn ? z.markerEn : z.marker}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      {isEn ? "Develops:" : "Développe :"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {isEn ? z.developsEn : z.developsFr}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Key Researchers & Methods */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <GraduationCap className="size-5 text-purple-500" />
            </div>
            <h2 className="text-2xl font-semibold">
              {isEn
                ? "Key Researchers & Methods"
                : "Chercheurs & Méthodes de référence"}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {researchers.map((r) => (
              <Card key={r.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{r.name}</CardTitle>
                  <CardDescription>
                    {isEn ? r.contributionEn : r.contributionFr}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {isEn ? r.publicationEn : r.publicationFr}
                  </p>
                  {r.link && (
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                    >
                      {isEn ? "View publication" : "Voir la publication"}
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 4: Key Studies */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <BookOpen className="size-5 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold">
              {isEn ? "Key Studies" : "Études fondamentales"}
            </h2>
          </div>

          <div className="space-y-3">
            {studies.map((s, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/50 bg-card p-4 flex flex-col sm:flex-row sm:items-start gap-3"
              >
                <span className="shrink-0 inline-flex items-center justify-center size-8 rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                  {s.year}
                </span>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium text-sm">
                    {isEn ? s.titleEn : s.titleFr}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {s.authors} &mdash; {s.journal}
                  </p>
                  {s.link && (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {isEn ? "View study" : "Voir l'étude"}
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Resources */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <BookOpen className="size-5 text-amber-500" />
            </div>
            <h2 className="text-2xl font-semibold">
              {isEn ? "Resources" : "Ressources"}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {resources.map((group) => (
              <div key={group.labelFr} className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  {isEn ? group.labelEn : group.labelFr}
                </h3>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.nameFr} className="text-sm">
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          {isEn ? item.nameEn : item.nameFr}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">
                          {isEn ? item.nameEn : item.nameFr}
                        </span>
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

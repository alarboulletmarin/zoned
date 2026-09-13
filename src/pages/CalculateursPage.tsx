import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { DoorCard } from "@/components/domain/DoorCard";
import { usePickLang } from "@/lib/i18n-utils";

/**
 * One tool of the hub. `kicker` is the mono micro-label printed above the
 * name, it states what the tool eats, in figures, rather than restating the
 * title in smaller type.
 */
interface CalculateurEntry {
  id: string;
  kicker: string;
  kickerEn: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  href: string;
}

/** Group ids surfaced in the hub. Each group is a band of the page, separated
 *  from the next by a full-width ink rule. */
type CalcGroupId = "benchmarks" | "pace" | "race";

interface CalcGroup {
  id: CalcGroupId;
  titleKey: string;
  members: string[];
}

const CALC_GROUPS: CalcGroup[] = [
  {
    id: "benchmarks",
    titleKey: "calculators:calculateurs.groups.benchmarks",
    members: ["zones", "vma", "ftp", "css"],
  },
  {
    id: "pace",
    titleKey: "calculators:calculateurs.groups.pace",
    members: ["allures", "table-allures", "tapis-roulant"],
  },
  {
    id: "race",
    titleKey: "calculators:calculateurs.groups.race",
    members: ["splits", "equivalence", "age-graded", "race-simulator", "what-if"],
  },
];

export const CALCULATEURS: CalculateurEntry[] = [
  {
    id: "zones",
    kicker: "6 zones",
    kickerEn: "6 zones",
    title: "Zones d'entraînement",
    titleEn: "Training zones",
    description: "Pose tes six zones de fréquence et d'allure depuis ta VMA ou ta FCmax.",
    descriptionEn: "Set your six heart-rate and pace zones from your vVO2max or max HR.",
    href: "/calculators/zones",
  },
  {
    id: "allures",
    kicker: "min/km · km/h",
    kickerEn: "min/km · km/h",
    title: "Convertisseur d'allures",
    titleEn: "Pace converter",
    description: "Passe de min/km à km/h et à min/mile pendant que tu tapes.",
    descriptionEn: "Move between min/km, km/h and min/mile as you type.",
    href: "/calculators/convertisseur",
  },
  {
    id: "table-allures",
    kicker: "3:00 → 10:00/km",
    kickerEn: "3:00 → 10:00/km",
    title: "Table de référence",
    titleEn: "Pace reference table",
    description: "Toutes les allures de 3:00 à 10:00/km, avec le chrono sur cinq distances.",
    descriptionEn: "Every pace from 3:00 to 10:00/km, with the time over five distances.",
    href: "/calculators/table-allures",
  },
  {
    id: "tapis-roulant",
    kicker: "% de pente",
    kickerEn: "% incline",
    title: "Convertisseur tapis roulant",
    titleEn: "Treadmill converter",
    description: "Traduis vitesse et inclinaison du tapis en allure de terrain.",
    descriptionEn: "Turn treadmill speed and incline into an outdoor pace.",
    href: "/calculators/tapis-roulant",
  },
  {
    id: "splits",
    kicker: "km par km",
    kickerEn: "km by km",
    title: "Générateur de splits",
    titleEn: "Split generator",
    description: "Découpe ton objectif chrono en passages kilomètre par kilomètre.",
    descriptionEn: "Cut your target time into kilometre-by-kilometre splits.",
    href: "/calculators/splits",
  },
  {
    id: "vma",
    kicker: "chrono → VMA",
    kickerEn: "time → vVO2max",
    title: "VMA depuis un chrono",
    titleEn: "vVO2max from a race time",
    description: "Déduis ta VMA d'un résultat de course, sans repasser un test.",
    descriptionEn: "Derive your vVO2max from a race result, with no new test.",
    href: "/calculators/vma",
  },
  {
    id: "ftp",
    kicker: "20 min · rampe",
    kickerEn: "20 min · ramp",
    title: "Test FTP vélo",
    titleEn: "FTP cycling test",
    description: "Estime ta FTP depuis un test de 20 minutes ou un test en rampe.",
    descriptionEn: "Estimate your FTP from a 20-minute test or a ramp test.",
    href: "/calculators/ftp",
  },
  {
    id: "css",
    kicker: "400 m + 200 m",
    kickerEn: "400 m + 200 m",
    title: "Test CSS natation",
    titleEn: "CSS swimming test",
    description: "Estime ta vitesse critique de nage depuis un 400 m et un 200 m.",
    descriptionEn: "Estimate your critical swim speed from a 400 m and a 200 m.",
    href: "/calculators/css",
  },
  {
    id: "equivalence",
    kicker: "5 km → marathon",
    kickerEn: "5 km → marathon",
    title: "Équivalence entre distances",
    titleEn: "Race equivalence",
    description: "Projette un seul résultat sur toutes les autres distances.",
    descriptionEn: "Project one result onto every other distance.",
    href: "/calculators/equivalence",
  },
  {
    id: "age-graded",
    kicker: "% record mondial",
    kickerEn: "% world record",
    title: "Performance age-graded",
    titleEn: "Age-graded performance",
    description: "Situe ton chrono face au record mondial de ton âge et de ton sexe.",
    descriptionEn: "Place your time against the world record for your age and sex.",
    href: "/calculators/age-graded",
  },
  {
    id: "race-simulator",
    kicker: "jour de course",
    kickerEn: "race day",
    title: "Simulateur jour de course",
    titleEn: "Race day simulator",
    description: "Cale horaires, allures, ravitaillements et repères mentaux avant le départ.",
    descriptionEn: "Set the schedule, paces, fuelling and mental cues before the gun.",
    href: "/race-simulator",
  },
  {
    id: "what-if",
    kicker: "deux scénarios",
    kickerEn: "two scenarios",
    title: "Simulateur what-if",
    titleEn: "What-if simulator",
    description: "Compare deux entraînements et lis l'écart semaine par semaine.",
    descriptionEn: "Compare two training scenarios and read the gap week by week.",
    href: "/calculators/what-if",
  },
];

export function CalculateursPage() {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();

  return (
    <>
      <SEOHead
        title={t("calculators:calculateurs.hub.seoTitle")}
        description={t("calculators:calculateurs.hub.seoDescription")}
        canonical="/calculators"
        jsonLd={[
          {
            "@type": "CollectionPage",
            name: t("calculators:calculateurs.hub.seoCollectionName"),
            description: t("calculators:calculateurs.hub.seoDescription"),
            url: "https://zoned.run/calculators",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculators:calculateurs.breadcrumb") },
            ],
          },
        ]}
      />

      <div className="zn-num">
        <section
          className="zn-num__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("calculators:calculateurs.kicker", {
              tools: CALCULATEURS.length,
              groups: CALC_GROUPS.length,
            })}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("calculators:calculateurs.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-num__lede">
            {t("calculators:calculateurs.description")}
          </p>
        </section>

        {/* One family of tools per band, each on its own ink rule. */}
        {CALC_GROUPS.map((group) => {
          const groupItems = group.members
            .map((memberId) => CALCULATEURS.find((c) => c.id === memberId))
            .filter((c): c is CalculateurEntry => c != null);
          if (groupItems.length === 0) return null;

          return (
            <section
              key={group.id}
              className="zn-num__group"
              aria-labelledby={`calc-${group.id}`}
            >
              <div className="zn-row zn-row--split zn-num__grouphead">
                <h2 id={`calc-${group.id}`} className="zn-title" data-level="3">
                  {t(group.titleKey)}
                </h2>
                <span className="zn-mono zn-faint">
                  {t("calculators:calculateurs.groupCount", {
                    count: groupItems.length,
                  })}
                </span>
              </div>

              <div className="zn-grid">
                {groupItems.map((item) => (
                  <DoorCard
                    key={item.id}
                    className="zn-num__door"
                    to={item.href}
                    kicker={pickLang(item, "kicker")}
                    title={pickLang(item, "title")}
                    body={pickLang(item, "description")}
                    cta={t("calculators:calculateurs.explore")}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

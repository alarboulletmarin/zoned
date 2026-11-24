import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { HubNav, navSection } from "@/components/layout";
import { ArrowRight } from "@/components/icons";
import { formatDecimal } from "@/components/calc";
import { useMyNumbers } from "@/hooks/useMyNumbers";
import { calculatePaceZones, formatPace } from "@/lib/zones";
import { formatSplitTime } from "@/lib/splits";
import { RACE_DISTANCE_META } from "@/types/plan";
import { raceLabel, type MyNumbers, type UpcomingRace } from "@/lib/myNumbers";

/**
 * One tool of the hub. The page lists six, in three families; cycling and
 * swimming tests keep their routes but sit on one quiet line at the bottom.
 * `site-stats.ts` counts the `id:` lines of this array: keep one per tool.
 */
interface CalculateurEntry {
  id: "zones" | "vma" | "allures" | "tapis-roulant" | "splits" | "race-simulator";
  family: "benchmarks" | "convert" | "race";
  href: string;
}

export const CALCULATEURS: CalculateurEntry[] = [
  {
    id: "zones",
    family: "benchmarks",
    href: "/calculators/zones",
  },
  {
    id: "vma",
    family: "benchmarks",
    href: "/calculators/vma",
  },
  {
    id: "allures",
    family: "convert",
    href: "/calculators/allures",
  },
  {
    id: "tapis-roulant",
    family: "convert",
    href: "/calculators/tapis-roulant",
  },
  {
    id: "splits",
    family: "race",
    href: "/calculators/splits",
  },
  {
    id: "race-simulator",
    family: "race",
    href: "/race-simulator",
  },
];

const FAMILIES = ["benchmarks", "convert", "race"] as const;

/** Threshold midpoint rounded to 5 s, min/km. */
function thresholdMid(n: MyNumbers): number | undefined {
  if (!n.threshold) return undefined;
  const sec = ((n.threshold.fast + n.threshold.slow) / 2) * 60;
  return (Math.round(sec / 5) * 5) / 60;
}

/** The answer each row already gives with the person's numbers, else what the tool does. */
function useRowAnswers(n: MyNumbers): Record<CalculateurEntry["id"], string> {
  const { t, i18n } = useTranslation("calculators");
  const lang = i18n.language;
  const isEn = lang.startsWith("en");
  const z2 = n.vma ? calculatePaceZones(n.vma).find((z) => z.zone === 2) : undefined;
  const pace = thresholdMid(n);
  const roadRace = n.races.find((r) => !r.isTrail && r.targetSeconds);
  const races = n.races.slice(0, 2);

  return {
    zones:
      z2?.paceMinPerKm != null && z2.paceMaxPerKm != null
        ? t("hub.rows.zonesAnswer", { range: `${formatPace(z2.paceMinPerKm)}-${formatPace(z2.paceMaxPerKm)}` })
        : t("hub.rows.zones"),
    vma: t("hub.rows.vma"),
    allures:
      pace !== undefined
        ? `${formatPace(pace)}/km = ${formatDecimal(60 / pace, 1, lang)} km/h = ${formatPace(pace * 1.609344)}/mi`
        : t("hub.rows.allures"),
    "tapis-roulant": t("hub.rows.tapis"),
    splits: roadRace?.targetSeconds
      ? t("hub.rows.splitsAnswer", {
          distance: raceLabelDistance(roadRace, isEn),
          time: formatSplitTime(roadRace.targetSeconds),
          pace: formatPace(roadRace.targetSeconds / 60 / roadRace.distanceKm),
        })
      : t("hub.rows.splits"),
    "race-simulator":
      races.length > 0
        ? races.map((r) => `${raceLabel(r, isEn)} · ${t("hub.daysLeft", { count: r.daysLeft })}`).join(" · ")
        : t("hub.rows.raceSim"),
  };
}

function raceLabelDistance(race: UpcomingRace, isEn: boolean): string {
  const meta = RACE_DISTANCE_META[race.distance];
  return isEn ? meta.labelEn : meta.label;
}

function Tile({
  to,
  label,
  value,
  foot,
  empty,
  ink,
}: {
  to: string;
  label: string;
  value: ReactNode;
  foot: ReactNode;
  empty?: boolean;
  ink?: boolean;
}) {
  return (
    <Link to={to} className="zn-calc-tile" data-empty={empty || undefined} data-ink={ink || undefined}>
      <span className="zn-calc-tile__label">{label}</span>
      <span className="zn-calc-tile__value">{value}</span>
      <span className="zn-calc-tile__foot">{foot}</span>
    </Link>
  );
}

export function CalculateursPage() {
  const { t, i18n } = useTranslation("calculators");
  const lang = i18n.language;
  const isEn = lang.startsWith("en");
  const { numbers } = useMyNumbers();
  const answers = useRowAnswers(numbers);
  const race = numbers.races[0];
  const setIt = (
    <>
      {t("hub.setIt")} <ArrowRight size={14} />
    </>
  );
  const raceDate = race
    ? new Date(`${race.date}T12:00:00`).toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "";

  return (
    <>
      <SEOHead
        title={t("calculateurs.hub.seoTitle")}
        description={t("calculateurs.hub.seoDescription")}
        canonical="/calculators"
        jsonLd={[
          {
            "@type": "CollectionPage",
            name: t("calculateurs.hub.seoCollectionName"),
            description: t("calculateurs.hub.seoDescription"),
            url: "https://zoned.run/calculators",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb") },
            ],
          },
        ]}
      />

      <div className="zn-calc zn-calc--wide zn-calc-hub">
        <header className="zn-calc-hub__head">
          <p className="zn-kicker zn-calc-head__kicker">{t("hub.kicker", { count: CALCULATEURS.length })}</p>
          <div className="zn-calc-hub__titles">
            <h1 className="zn-display" data-level="2">
              {t("calculateurs.title")}
            </h1>
            <p className="zn-body zn-body--lead zn-calc-head__lede">{t("hub.lede")}</p>
          </div>
          {/* Sous 1024px, la porte Mes chiffres : les deux calculateurs du
              menu déroulant sont des lignes de cette page, on ne les répète pas. */}
          <HubNav section={navSection("numbers")} omit={["/calculators/zones", "/calculators/vma"]} />
        </header>

        <section className="zn-calc-section" aria-labelledby="calc-mine">
          <h2 id="calc-mine" className="zn-calc-h2 zn-calc-hub__mine">
            {t("hub.mine")}
          </h2>
          <div className="zn-calc-tiles" data-cols="4">
            <Tile
              to="/calculators/vma"
              label={t("hub.tiles.vma")}
              empty={!numbers.vma}
              value={
                numbers.vma ? (
                  <>
                    {formatDecimal(numbers.vma, 1, lang)}
                    <small> km/h</small>
                  </>
                ) : (
                  "-"
                )
              }
              foot={numbers.vma ? t("hub.tiles.vmaFoot", { pace: formatPace(60 / numbers.vma) }) : setIt}
            />
            <Tile
              to="/calculators/zones"
              label={t("hub.tiles.fcMax")}
              empty={!numbers.fcMax}
              value={
                numbers.fcMax ? (
                  <>
                    {numbers.fcMax}
                    <small> bpm</small>
                  </>
                ) : (
                  "-"
                )
              }
              foot={numbers.fcMax ? t("hub.tiles.fcMaxFoot") : setIt}
            />
            <Tile
              to="/calculators/zones"
              label={t("hub.tiles.threshold")}
              empty={!numbers.threshold}
              value={
                numbers.threshold ? `${formatPace(numbers.threshold.fast)}-${formatPace(numbers.threshold.slow)}` : "-"
              }
              foot={numbers.threshold ? t("hub.tiles.thresholdFoot") : setIt}
            />
            {race ? (
              <Tile
                to={`/race-simulator?race=${encodeURIComponent(race.key)}`}
                label={t("hub.tiles.race")}
                ink
                value={
                  <>
                    {raceLabel(race, isEn)}
                    {race.elevationGain ? (
                      <>
                        <br />
                        {race.elevationGain} D+
                      </>
                    ) : null}
                  </>
                }
                foot={
                  <span className="zn-mono">
                    {raceDate.toLocaleUpperCase(isEn ? "en-GB" : "fr-FR")} · {t("hub.daysLeft", { count: race.daysLeft })}
                  </span>
                }
              />
            ) : (
              <Tile to="/race-simulator" label={t("hub.tiles.race")} empty value="-" foot={setIt} />
            )}
          </div>
        </section>

        <div className="zn-calc-hub__families">
          {FAMILIES.map((family) => {
            const tools = CALCULATEURS.filter((c) => c.family === family);
            return (
              <section key={family} className="zn-calc-hub__family" aria-labelledby={`calc-${family}`}>
                <div className="zn-calc-hub__familyhead">
                  <h2 id={`calc-${family}`} className="zn-calc-h2">
                    {t(`hub.families.${family}`)}
                  </h2>
                  <span className="zn-mono zn-faint">{tools.length}</span>
                </div>
                <ul>
                  {tools.map((tool) => (
                    <li key={tool.id}>
                      <Link to={tool.href} className="zn-calc-hub__row">
                        <span className="zn-calc-hub__name">{t(`hub.names.${tool.id}`)}</span>
                        <span className="zn-calc-hub__answer">{answers[tool.id]}</span>
                        <ArrowRight size={18} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <p className="zn-calc-hub__other">
          {t("hub.other")} <Link to="/calculators/ftp">{t("hub.ftp")}</Link> ·{" "}
          <Link to="/calculators/css">{t("hub.css")}</Link>
        </p>
      </div>
    </>
  );
}

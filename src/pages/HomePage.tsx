import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronDown, ExternalLink } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from "@/components/ui/responsive-table";
import { SEOHead } from "@/components/seo";
import { useWorkouts } from "@/hooks";
import { useAppStats } from "@/hooks/useAppStats";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import { useIdleAfterLoad } from "@/hooks/useIdleAfterLoad";
import { usePlans } from "@/hooks/usePlans";
import { ZONE_META, type ZoneNumber } from "@/types";
import { usePickLang, useIsEnglish } from "@/lib/i18n-utils";
import {
  getISOWeek,
  pickWeeklyWorkouts,
  EXPORT_FORMATS,
} from "@/lib/landing-stats";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { getQuoteOfTheDay } from "@/data/quotes";
import { ZoneDetailModal } from "@/components/domain/ZoneDetailModal";
import { WorkoutCard } from "@/components/domain/WorkoutCard";
import { DoorCard } from "@/components/domain/DoorCard";
import { IllustrationSlot } from "@/components/domain/IllustrationSlot";
import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { StatBlock } from "@/components/domain/StatBlock";
import { ZoneRow } from "@/components/domain/ZoneRow";
import {
  loadUserZonePrefs,
  saveUserZonePrefs,
  calculateAllZones,
  formatPace,
} from "@/lib/zones";
import { cn } from "@/lib/utils";
import type { UserZonePreferences } from "@/types";

const ZONES = [1, 2, 3, 4, 5, 6] as const;

// ────────────────────────────────────────────────────────────────────────────
// Static editorial constants — derived from the codebase, not invented.
// RESEARCHERS surfaces the major scientific figures whose work the app
// builds on. Each entry points to the canonical source (peer-reviewed paper
// when one exists, otherwise a reference book). External URLs go to PubMed
// or the publisher so the user lands on the official record, not a Zoned
// summary article.
// ────────────────────────────────────────────────────────────────────────────

interface ResearcherSource {
  /** Single-line citation as it appears in the card. */
  citationKey: string;
  /** Optional external link. We point at PubMed / publisher so the user
   *  always lands on the canonical record. Books usually have no URL. */
  url?: string;
}

interface Researcher {
  name: string;
  /** One short line under the name describing the contribution. */
  contributionKey: string;
  source: ResearcherSource;
  /** Short method tag rendered as a mono uppercase kicker. Hard-coded —
   *  these are named conventions (POLARISED, VDOT, vVO₂max…), not
   *  translated. */
  tag: string;
}

const RESEARCHERS: Researcher[] = [
  {
    name: "Stephen Seiler",
    tag: "Polarised · 80/20",
    contributionKey: "homepage:home.s04.researchers.seiler.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.seiler.citation",
      url: "https://pubmed.ncbi.nlm.nih.gov/16774644/",
    },
  },
  {
    name: "Véronique Billat",
    tag: "vVO₂max · 30/30",
    contributionKey: "homepage:home.s04.researchers.billat.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.billat.citation",
      url: "https://pubmed.ncbi.nlm.nih.gov/9927009/",
    },
  },
  {
    name: "Jack Daniels",
    tag: "VDOT · T/I/R",
    contributionKey: "homepage:home.s04.researchers.daniels.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.daniels.citation",
    },
  },
  {
    name: "Arthur Lydiard",
    tag: "Base building",
    contributionKey: "homepage:home.s04.researchers.lydiard.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.lydiard.citation",
    },
  },
  {
    name: "Tim Noakes",
    tag: "Central governor",
    contributionKey: "homepage:home.s04.researchers.noakes.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.noakes.citation",
    },
  },
  {
    name: "Wildor Hollmann & Alois Mader",
    tag: "Lactate threshold",
    contributionKey: "homepage:home.s04.researchers.cologne.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.cologne.citation",
    },
  },
  {
    name: "Oliver Faude",
    tag: "Threshold review",
    contributionKey: "homepage:home.s04.researchers.faude.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.faude.citation",
      url: "https://pubmed.ncbi.nlm.nih.gov/19402743/",
    },
  },
  {
    name: "Iñigo San Millán",
    tag: "Zone 2 · mitochondria",
    contributionKey: "homepage:home.s04.researchers.sanMillan.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.sanMillan.citation",
    },
  },
];

// Every calculator surfaced on the home page. Each entry maps 1:1 to an
// existing route in App.tsx, and the title/desc come from calculators.json
// (or a fallback in homepage.json for the ones that don't have a dedicated
// key) so the wording stays in sync with the destination page.
const CALCULATORS: Array<{
  key: string;
  slug: string;
  titleKey: string;
  descKey: string;
}> = [
  {
    key: "zones",
    slug: "/calculators/zones",
    titleKey: "calculators:calculateurs.zones.title",
    descKey: "homepage:home.s06.tools.zones",
  },
  {
    key: "converter",
    slug: "/calculators/convertisseur",
    titleKey: "calculators:calculateurs.converter.title",
    descKey: "homepage:home.s06.tools.converter",
  },
  {
    key: "paceTable",
    slug: "/calculators/table-allures",
    titleKey: "calculators:calculateurs.paceTable.title",
    descKey: "homepage:home.s06.tools.paceTable",
  },
  {
    key: "treadmill",
    slug: "/calculators/tapis-roulant",
    titleKey: "calculators:calculateurs.treadmill.title",
    descKey: "homepage:home.s06.tools.treadmill",
  },
  {
    key: "splits",
    slug: "/calculators/splits",
    titleKey: "calculators:calculateurs.splits.title",
    descKey: "homepage:home.s06.tools.splits",
  },
  {
    key: "vma",
    slug: "/calculators/vma",
    titleKey: "calculators:calculateurs.vma.title",
    descKey: "homepage:home.s06.tools.vma",
  },
  {
    key: "ftp",
    slug: "/calculators/ftp",
    titleKey: "calculators:calculateurs.ftp.title",
    descKey: "homepage:home.s06.tools.ftp",
  },
  {
    key: "css",
    slug: "/calculators/css",
    titleKey: "calculators:calculateurs.css.title",
    descKey: "homepage:home.s06.tools.css",
  },
  {
    key: "equivalence",
    slug: "/calculators/equivalence",
    titleKey: "calculators:calculateurs.equivalence.title",
    descKey: "homepage:home.s06.tools.equivalence",
  },
  {
    key: "ageGraded",
    slug: "/calculators/age-graded",
    titleKey: "calculators:calculateurs.ageGraded.title",
    descKey: "homepage:home.s06.tools.ageGraded",
  },
  {
    key: "raceSimulator",
    slug: "/race-simulator",
    titleKey: "homepage:home.s06.tools.raceSimulator.title",
    descKey: "homepage:home.s06.tools.raceSimulator.desc",
  },
  {
    key: "whatIf",
    slug: "/calculators/what-if",
    titleKey: "calculators:calculateurs.whatIf.title",
    descKey: "homepage:home.s06.tools.whatIf",
  },
];

// Frequently-asked questions answered on the page (no external link).
// The id picks both the question and the answer in homepage.s09.q[id]. Each
// answer has been verified against README.md and src/lib/export/* so the
// list never advertises a feature that isn't shipped.
const FAQ_IDS = [
  "hrm",
  "export",
  "custom",
  "free",
  "devices",
  "offline",
  "data",
] as const;

// Canonical Seiler-style polarised reference — these are *teaching values*,
// not measurements of the user's library. They illustrate what a well-dosed
// training week looks like under the 80/20 model.
const POLARISED_REFERENCE: Record<ZoneNumber, number> = {
  1: 62,
  2: 18,
  3: 6,
  4: 9,
  5: 4,
  6: 1,
};
const POLARISED_LOW = POLARISED_REFERENCE[1] + POLARISED_REFERENCE[2];
const POLARISED_HIGH =
  POLARISED_REFERENCE[4] + POLARISED_REFERENCE[5] + POLARISED_REFERENCE[6];


// ── §03 zone metadata. RPE and the "% FCmax" model lines describe the
// physiology and don't depend on the user; the bpm and pace columns are
// computed from their measured FCmax / VMA when available (see
// calculateAllZones), and this dash appears when nothing has been measured.
const NOT_MEASURED = "—";
const ZONE_FC_PERCENT: Record<ZoneNumber, string> = {
  1: "50–60 % FCmax",
  2: "60–70 % FCmax",
  3: "70–80 % FCmax",
  4: "80–90 % FCmax",
  5: "90–100 % FCmax",
  6: "> 100 % FCmax",
};
const ZONE_RPE: Record<ZoneNumber, string> = {
  1: "1–2 / 10",
  2: "3–4 / 10",
  3: "5–6 / 10",
  4: "7 / 10",
  5: "8–9 / 10",
  6: "10 / 10",
};

/** A percentage, French-typeset: a non-breaking space before the sign. */
function pct(value: number): string {
  return `${value} %`;
}

// ────────────────────────────────────────────────────────────────────────────
// HomePage
// ────────────────────────────────────────────────────────────────────────────

export function HomePage() {
  const { t } = useTranslation(["homepage", "common", "calculators"]);
  const pickLang = usePickLang();
  const isEn = useIsEnglish();
  const dailyQuote = useMemo(() => getQuoteOfTheDay(), []);
  const [selectedZone, setSelectedZone] = useState<ZoneNumber | null>(null);

  // User's measured references (VMA, FCmax) — read once at mount. Updates from
  // the inline form above the zone table re-store these in localStorage and
  // bump local state so the table refreshes without a page reload.
  const [userPrefs, setUserPrefs] = useState<UserZonePreferences | null>(() =>
    loadUserZonePrefs(),
  );
  const hasUserZones = !!(userPrefs?.vma || userPrefs?.fcMax);

  const personalRanges = useMemo(() => {
    if (!userPrefs) return null;
    const all = calculateAllZones(userPrefs);
    if (all.length === 0) return null;
    return all.reduce(
      (acc, range) => {
        acc[range.zone] = range;
        return acc;
      },
      {} as Record<ZoneNumber, (typeof all)[number]>,
    );
  }, [userPrefs]);

  const updatePrefs = (next: UserZonePreferences) => {
    saveUserZonePrefs(next);
    setUserPrefs(next);
  };

  // Catalogue counts, read straight off the shipped data (never hardcoded).
  const appStats = useAppStats();
  const { plans: userPlans } = usePlans();
  const hasPlans = userPlans.length > 0;
  const prebuiltPlans = useMemo(() => getAllPrebuiltPlans(), []);

  // The three weekly picks need the workout chunks. None of it is
  // LCP-critical — the hero renders without them — so wait for load+idle
  // before fetching to keep the bandwidth free for the hero on slow mobile.
  const libraryFetchReady = useIdleAfterLoad();
  const { workouts: runWorkouts } = useWorkouts({ enabled: libraryFetchReady });
  const { workouts: cyclingWorkouts } = useCrossDisciplineWorkouts("cycling", {
    enabled: libraryFetchReady,
  });
  const { workouts: swimWorkouts } = useCrossDisciplineWorkouts("swimming", {
    enabled: libraryFetchReady,
  });

  // ── Three weekly suggestions. Pick one run, one bike, one swim from the
  // library — the deterministic week-keyed picker keeps the trio stable for
  // the entire ISO week, which matches the editorial "issue" framing.
  const suggested = useMemo(() => {
    const tempo = pickWeeklyWorkouts(
      runWorkouts,
      (w) => (w.discipline ?? "running") === "running" && w.category === "tempo",
      1,
      0,
    )[0];
    const cycling = pickWeeklyWorkouts(cyclingWorkouts, () => true, 1, 1)[0];
    const swimming = pickWeeklyWorkouts(swimWorkouts, () => true, 1, 2)[0];
    return [tempo, cycling, swimming].filter(
      (w): w is NonNullable<typeof w> => w != null,
    );
  }, [runWorkouts, cyclingWorkouts, swimWorkouts]);

  // ── Plans by distance, ordered race-progression. Filter to distances that
  // actually have a plan shipped so empty rows never render.
  //

  // The hero kicker: today's date and the ISO week, the way a training log
  // is dated. Mono, uppercased by the stylesheet.
  const today = useMemo(() => new Date(), []);
  const dateLine = `${today.toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })} · ${t("homepage:home.hero.week", { n: getISOWeek(today) })}`;

  const seoDescription = t("common:pages.home.seoDescription", {
    count: appStats.workouts || 200,
  });

  // Rich JSON-LD for the homepage. SEOHead already injects WebSite + Organization
  // site-wide, so we only add the homepage-specific layers here:
  // - WebApplication descriptor (we're a free running app — closest type)
  // - FAQPage so questions qualify for "People also ask" snippets
  const homepageJsonLd: Record<string, unknown>[] = [
    {
      "@type": "WebApplication",
      name: "Zoned",
      url: "https://zoned.run",
      applicationCategory: "SportsApplication",
      operatingSystem: "Web, iOS, Android",
      browserRequirements: "Requires JavaScript. Works offline as a PWA.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
      featureList: [
        "256 science-based workouts: running, trail, cycling, swimming, strength",
        "6-zone training system",
        "Personalised training plans",
        "VMA / HRmax / pace calculators",
        "Race simulator with nutrition timing",
        "FIT, PDF, ICS exports",
        "Bilingual FR / EN",
        "Open source, no account, no tracking",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Est-ce que Zoned est gratuit ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui. Zoned est gratuit, sans compte, sans publicité et sans tracking. Le code source est ouvert sur GitHub.",
          },
        },
        {
          "@type": "Question",
          name: "Faut-il créer un compte pour utiliser Zoned ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Non. Aucune inscription n'est requise. Vos préférences (zones personnelles, favoris, plans) sont stockées localement dans votre navigateur.",
          },
        },
        {
          "@type": "Question",
          name: "Sur quelles bases scientifiques s'appuie Zoned ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Zoned s'appuie sur les travaux de Stephen Seiler (polarisé 80/20), Véronique Billat (vVO₂max, 30/30), Jack Daniels (VDOT), Joe Friel (zones LTHR) et Phil Maffetone (MAF 180).",
          },
        },
        {
          "@type": "Question",
          name: "Combien de séances sont disponibles ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `Plus de ${appStats.workouts || 200} séances de course à pied, plus 10 séances cyclisme et 10 séances natation pour le cross-training, organisées en 6 zones d'intensité.`,
          },
        },
        {
          "@type": "Question",
          name: "Puis-je exporter les séances sur ma montre Garmin ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui. Chaque séance peut être exportée au format FIT (Garmin), PDF imprimable, ICS (calendrier) ou PNG image.",
          },
        },
      ],
    },
  ];

  // The zone atlas, as table rows. One markup for both viewports —
  // ResponsiveTable turns it into a card per zone below its own breakpoint.
  const zoneColumns: ResponsiveTableColumn<ZoneNumber>[] = [
    {
      key: "zone",
      header: t("homepage:home.s03.zone"),
      hideOnMobile: true,
      cell: (z) => (
        <span className="zn-home__zcode" data-zone={z}>
          Z{z}
        </span>
      ),
    },
    {
      key: "name",
      header: t("homepage:home.s03.name"),
      hideOnMobile: true,
      cell: (z) => (
        <button
          type="button"
          className="zn-home__zname"
          onClick={() => setSelectedZone(z)}
        >
          {pickLang(ZONE_META[z], "label")}
        </button>
      ),
    },
    {
      key: "hr",
      header: t("homepage:home.s03.hr"),
      cell: (z) => {
        const range = personalRanges?.[z];
        return (
          <div className="zn-stack" style={{ "--gap": "var(--sp-1)" } as CSSProperties}>
            <span
              className={cn("zn-mono", range ? "zn-home__measured" : "zn-faint")}
            >
              {range?.hrMin && range?.hrMax
                ? `${range.hrMin}–${range.hrMax} bpm`
                : NOT_MEASURED}
            </span>
            <span className="zn-mono zn-faint">{ZONE_FC_PERCENT[z]}</span>
          </div>
        );
      },
    },
    {
      key: "rpe",
      header: t("homepage:home.s03.rpe"),
      cell: (z) => <span className="zn-mono zn-muted">{ZONE_RPE[z]}</span>,
    },
    {
      key: "adaptation",
      header: t("homepage:home.s03.adaptation"),
      cell: (z) => (
        <span className="zn-body zn-body--sm">
          {pickLang(ZONE_META[z], "benefit")}
        </span>
      ),
    },
    {
      key: "pace",
      header: t("homepage:home.s03.refPace"),
      cell: (z) => {
        const range = personalRanges?.[z];
        return (
          <span className={cn("zn-mono", range ? "zn-home__measured" : "zn-faint")}>
            {range?.paceMinPerKm && range?.paceMaxPerKm
              ? `${formatPace(range.paceMinPerKm)}–${formatPace(range.paceMaxPerKm)}/km`
              : NOT_MEASURED}
          </span>
        );
      },
    },
  ];

  return (
    <div className="zn-home">
      <SEOHead
        title={t("homepage:home.seoTitle")}
        description={seoDescription}
        canonical="/"
        jsonLd={homepageJsonLd}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — the question the reader is asking, and the two ways out
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="zn-home__hero">
        <div className="zn-stack" style={{ "--gap": "var(--sp-13)" } as CSSProperties}>
          <span className="zn-kicker">{dateLine}</span>
          <h1 className="zn-display zn-home__headline">
            {t("homepage:home.hero.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-home__lede">
            {t("homepage:home.hero.lede", {
              sessions: appStats.workouts,
              plans: prebuiltPlans.length,
              calculators: CALCULATORS.length,
            })}
          </p>
          {/* The screen's single vermillon fill lives here and nowhere else. */}
          <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            <Button asChild size="lg">
              <Link to={hasPlans ? "/plans" : "/plan/new"}>
                {t(
                  hasPlans
                    ? "homepage:home.hero.ctaPrimaryHasPlans"
                    : "homepage:home.hero.ctaPrimary",
                )}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/library">{t("homepage:home.hero.ctaSecondary")}</Link>
            </Button>
          </div>
        </div>

        <IllustrationSlot
          height={400}
          art={RunnersDuo}
          brief={t("homepage:home.hero.illustrationBrief")}
          label={t("homepage:home.hero.illustrationLabel")}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          §01 — the three doors, directly under the hero
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="zn-home__doors" aria-labelledby="home-doors-title">
        <h2 id="home-doors-title" className="sr-only">
          {t("homepage:home.s01.title")}
        </h2>
        <DoorCard
          to="/library"
          kicker={t("homepage:home.s01.e1Kicker")}
          title={t("homepage:home.s01.e1Title")}
          body={t("homepage:home.s01.e1Body")}
          cta={t("homepage:home.s01.e1Link")}
        />
        <DoorCard
          to="/plans"
          kicker={t("homepage:home.s01.e2Kicker")}
          title={t("homepage:home.s01.e2Title")}
          body={t("homepage:home.s01.e2Body")}
          cta={t("homepage:home.s01.e2Link")}
        />
        <DoorCard
          to="/methodology"
          kicker={t("homepage:home.s01.e3Kicker")}
          title={t("homepage:home.s01.e3Title")}
          body={t("homepage:home.s01.e3Body")}
          cta={t("homepage:home.s01.e3Link")}
        />
        {/* The calculators used to get a section of their own listing all
            twelve. One door says the same thing: the hub is one click away,
            and the number is already in the lede. */}
        <DoorCard
          to="/calculators"
          kicker={t("homepage:home.s06.kicker")}
          title={t("homepage:home.s06.title")}
          body={t("homepage:home.s06.body")}
          cta={t("homepage:home.s06.link")}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Fig. 01 — what a well-dosed week looks like
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="zn-section zn-split"
        style={
          { "--split": "340px 1fr", "--gap": "var(--sp-18)" } as CSSProperties
        }
        aria-labelledby="home-fig-title"
      >
        <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
          <span className="zn-kicker">{t("homepage:home.hero.fig.kicker")}</span>
          <h2 id="home-fig-title" className="zn-title" data-level="1">
            {t("homepage:home.hero.fig.title")}
          </h2>
          <p className="zn-body">{t("homepage:home.hero.fig.body")}</p>
          <span className="zn-source">{t("homepage:home.hero.fig.source")}</span>
        </div>

        <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
          <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            {ZONES.map((zone) => (
              <ZoneRow
                key={zone}
                zone={zone}
                name={t(`homepage:home.hero.fig.zones.z${zone}`)}
                value={pct(POLARISED_REFERENCE[zone])}
                percent={POLARISED_REFERENCE[zone]}
                labelWidth={130}
              />
            ))}
          </div>
          <div className="zn-home__pair">
            <StatBlock
              tone="card"
              value={pct(POLARISED_LOW)}
              label={t("homepage:home.hero.fig.lowRange")}
              footnote={t("homepage:home.hero.fig.lowCaption")}
            />
            <StatBlock
              tone="ink"
              value={pct(POLARISED_HIGH)}
              label={t("homepage:home.hero.fig.highRange")}
              footnote={t("homepage:home.hero.fig.highCaption")}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          The four numbers
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="zn-section zn-home__strip">
        <div className="zn-home__strip-cell">
          <StatBlock
            value={String(appStats.workouts)}
            label={t("homepage:home.stats.sessions")}
          />
        </div>
        <div className="zn-home__strip-cell">
          <StatBlock
            value={String(prebuiltPlans.length)}
            label={t("homepage:home.stats.plansFrom")}
          />
        </div>
        <div className="zn-home__strip-cell">
          <StatBlock
            value={String(CALCULATORS.length)}
            label={t("homepage:home.stats.calculators")}
          />
        </div>
        <div className="zn-home__strip-cell">
          <StatBlock
            value="0"
            label={t("homepage:home.s08.lines.account")}
          />
        </div>
      </section>

      {/* §05 — the plans section lived here. It re-sold what the "Suivre un
          plan structuré" door already offers three screens higher up, so it
          folded into that door. /plans stays in the nav, the footer and the
          palette. */}

      <section
        className="zn-section zn-split"
        style={
          { "--split": "340px 1fr", "--gap": "var(--sp-18)" } as CSSProperties
        }
        aria-labelledby="home-week-title"
      >
        <SectionHead
          id="home-week-title"
          kicker={t("homepage:home.s02.kicker")}
          title={t("homepage:home.s02.title")}
          body={t("homepage:home.s02.body")}
        />
        {/* --gap is re-stated here: the section sets one for its own two
            columns, and custom properties inherit. */}
        <div className="zn-grid" style={{ "--gap": "var(--gap-grid)" } as CSSProperties}>
          {suggested.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          §03 — the zone atlas
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="zn-section" aria-labelledby="home-zones-title">
        <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
          <SectionHead
            id="home-zones-title"
            kicker={t("homepage:home.s03.kicker")}
            title={
              <>
                {t("homepage:home.s03.title1")}
                <br />
                {t("homepage:home.s03.title2")}
              </>
            }
            body={t("homepage:home.s03.body")}
          />

          <ZonesPersonaliser
            prefs={userPrefs}
            hasUserZones={hasUserZones}
            onSave={updatePrefs}
          />

          <ResponsiveTable<ZoneNumber>
            data={[...ZONES]}
            columns={zoneColumns}
            rowKey={(z) => z}
            caption={t("homepage:home.s03.fig")}
            mobileCardTitle={(z) => (
              <span
                className="zn-row"
                style={{ "--gap": "var(--sp-6)" } as CSSProperties}
              >
                <span className="zn-home__zcode" data-zone={z}>
                  Z{z}
                </span>
                <button
                  type="button"
                  className="zn-home__zname"
                  onClick={() => setSelectedZone(z)}
                >
                  {pickLang(ZONE_META[z], "label")}
                </button>
              </span>
            )}
          />
        </div>
      </section>

      <ZoneDetailModal
        zone={selectedZone}
        zoneMeta={selectedZone ? ZONE_META[selectedZone] : null}
        open={selectedZone !== null}
        onOpenChange={(open) => !open && setSelectedZone(null)}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          §04 — researchers and reference sources
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="zn-section" aria-labelledby="home-science-title">
        <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
          <SectionHead
            id="home-science-title"
            kicker={t("homepage:home.s04.kicker")}
            title={t("homepage:home.s04.title")}
            body={t("homepage:home.s04.body")}
          />

          {/* Eight researcher cards used to sit here, each with a tag, a name,
              a paragraph of contribution and a citation. The system's rule is
              that science is cited, not invoked — so what survives is the
              citation itself, in mono, which is exactly the form it prescribes.
              Every name, source and link is still on the page; only the
              paragraph around each one is gone. */}
          <ul className="zn-home__sources">
            {RESEARCHERS.map((r) => (
              <li key={r.name} className="zn-home__source">
                <span className="zn-home__source-name">{r.name}</span>
                <span className="zn-source">{t(r.source.citationKey)}</span>
                {r.source.url && (
                  <a
                    className="zn-home__link"
                    href={r.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t("homepage:home.s04.viewPublication")} — ${r.name}`}
                  >
                    <ExternalLink />
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* Quote of the day — rotates daily through attributable quotes
              from runners, coaches and sports physicians. */}
          <blockquote className="zn-home__quote">
            <p className="zn-home__quote-text">
              {isEn ? dailyQuote.en : dailyQuote.fr}
            </p>
            <footer className="zn-kicker" style={{ marginBlockStart: "var(--sp-8)" }}>
              {dailyQuote.author} ·{" "}
              {isEn ? dailyQuote.role.en : dailyQuote.role.fr}
            </footer>
          </blockquote>
        </div>
      </section>

      {/* §06 — the twelve calculator cards lived here. They are a door now:
          the hub lists them, and a landing page does not need to name all
          twelve to say they exist. */}

      {/* ═══════════════════════════════════════════════════════════════════
          §08 — ethos, the one inverted band
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="zn-section zn-split zn-home__ethos"
        style={{ "--split": "1fr 1fr", "--gap": "var(--sp-18)" } as CSSProperties}
        aria-labelledby="home-ethos-title"
      >
        <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
          <span className="zn-kicker">{t("homepage:home.s08.kicker")}</span>
          <h2 id="home-ethos-title" className="zn-display" data-level="3">
            {t("homepage:home.s08.title1")}
            <br />
            {t("homepage:home.s08.title2")}
          </h2>
          <p className="zn-body zn-measure">{t("homepage:home.s08.body")}</p>
        </div>

        <ul className="zn-home__ethos-list">
          <li>
            <StatBlock
              size="lg"
              value="00"
              label={t("homepage:home.s08.lines.trackers")}
            />
          </li>
          <li>
            <StatBlock
              size="lg"
              value="00"
              label={t("homepage:home.s08.lines.account")}
            />
          </li>
          <li>
            <StatBlock
              size="lg"
              value="00"
              label={t("homepage:home.s08.lines.network")}
            />
          </li>
          <li>
            <StatBlock
              size="lg"
              value={String(EXPORT_FORMATS.length).padStart(2, "0")}
              label={t("homepage:home.s08.lines.exports")}
              footnote={EXPORT_FORMATS.map((f) => `.${f}`).join(" · ")}
            />
          </li>
        </ul>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          §09 — questions answered in place
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="zn-section" aria-labelledby="home-faq-title">
        <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
          <SectionHead
            id="home-faq-title"
            kicker={t("homepage:home.s09.kicker")}
            title={t("homepage:home.s09.title")}
          />
          <div className="zn-home__faq">
            {FAQ_IDS.map((id, i) => (
              <details key={id} className="zn-home__faq-item">
                <summary className="zn-home__faq-q">
                  <span className="zn-mono zn-faint zn-home__faq-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="zn-title" data-level="4">
                    {t(`homepage:home.s09.q.${id}.q`)}
                  </span>
                  <ChevronDown className="zn-home__faq-chevron" />
                </summary>
                <p className="zn-body zn-home__faq-a">
                  {t(`homepage:home.s09.q.${id}.a`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          The last call before the shell's footer
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="zn-section zn-home__cta" aria-labelledby="home-cta-title">
        <span className="zn-kicker">{t("homepage:home.cta.kicker")}</span>
        <h2
          id="home-cta-title"
          className="zn-display zn-home__cta-title"
          data-level="3"
        >
          {t("homepage:home.cta.line1")}
          <br />
          {t("homepage:home.cta.line2")}
        </h2>
        <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
          <Button asChild size="lg" variant="outline-primary">
            <Link to="/plan/new">
              {t("homepage:home.cta.primary")}
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/library">{t("homepage:home.cta.secondary")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components — local to the landing. The global footer lives in
// src/components/layout/Footer.tsx and is rendered by App.tsx.
// ────────────────────────────────────────────────────────────────────────────

/** The head of a band: mono kicker, then the title, then the body. Every
 *  section on this page opens the same way, which is what makes the page read
 *  as one document rather than as a stack of widgets. */
function SectionHead({
  id,
  kicker,
  title,
  body,
  note,
}: {
  id: string;
  kicker: string;
  title: ReactNode;
  body?: string;
  /** One extra line under the body — a practical aside, not a second body. */
  note?: string;
}) {
  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
      <span className="zn-kicker">{kicker}</span>
      <h2 id={id} className="zn-title" data-level="1">
        {title}
      </h2>
      {body && <p className="zn-body zn-measure">{body}</p>}
      {note && <p className="zn-body zn-body--sm zn-muted zn-measure">{note}</p>}
    </div>
  );
}

// ─── ZonesPersonaliser ──────────────────────────────────────────────────────
// Two compact inputs (VMA, FCmax) shown above the zone table. Submitting them
// writes the values through saveUserZonePrefs (which also syncs them to the
// runner profile) and the parent re-renders the table with personalised bpm
// and pace ranges. When values already exist we show a quiet status line
// instead so the form doesn't keep nagging set-up users.
function ZonesPersonaliser({
  prefs,
  hasUserZones,
  onSave,
}: {
  prefs: UserZonePreferences | null;
  hasUserZones: boolean;
  onSave: (next: UserZonePreferences) => void;
}) {
  const { t } = useTranslation("homepage");
  const [vma, setVma] = useState(prefs?.vma?.toString() ?? "");
  const [fcMax, setFcMax] = useState(prefs?.fcMax?.toString() ?? "");
  const [editing, setEditing] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vma.trim() === "" ? undefined : parseFloat(vma.replace(",", "."));
    const f = fcMax.trim() === "" ? undefined : parseInt(fcMax, 10);
    if (v === undefined && f === undefined) return;
    onSave({ vma: v, fcMax: f });
    setEditing(false);
  };

  if (hasUserZones && !editing) {
    return (
      <div className="zn-cluster" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
        <span className="zn-kicker">{t("home.s03.personal.label")}</span>
        {prefs?.vma != null && (
          <span className="zn-mono zn-muted">VMA {prefs.vma} km/h</span>
        )}
        {prefs?.fcMax != null && (
          <span className="zn-mono zn-muted">FCmax {prefs.fcMax} bpm</span>
        )}
        <Button type="button" variant="link" onClick={() => setEditing(true)}>
          {t("home.s03.personal.edit")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="zn-home__prefs">
      <p className="zn-kicker" style={{ flexBasis: "100%" }}>
        {t("home.s03.personal.prompt")}
      </p>
      <div className="zn-home__field">
        <label className="zn-label" htmlFor="home-vma">
          {t("home.s03.personal.vmaLabel")}
        </label>
        <input
          id="home-vma"
          className="zn-home__input"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="8"
          max="30"
          value={vma}
          onChange={(e) => setVma(e.target.value)}
          placeholder="16.0"
        />
      </div>
      <div className="zn-home__field">
        <label className="zn-label" htmlFor="home-fcmax">
          {t("home.s03.personal.fcMaxLabel")}
        </label>
        <input
          id="home-fcmax"
          className="zn-home__input"
          type="number"
          inputMode="numeric"
          step="1"
          min="100"
          max="250"
          value={fcMax}
          onChange={(e) => setFcMax(e.target.value)}
          placeholder="190"
        />
      </div>
      <Button type="submit" variant="outline-primary">
        {t("home.s03.personal.submit")}
      </Button>
      {editing && (
        <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
          {t("home.s03.personal.cancel")}
        </Button>
      )}
    </form>
  );
}

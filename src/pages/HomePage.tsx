import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronDown } from "@/components/icons";
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
import { getISOWeek, pickWeeklyWorkouts, EXPORT_FORMATS } from "@/lib/landing-stats";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { ZoneDetailModal } from "@/components/domain/ZoneDetailModal";
import { WorkoutCard } from "@/components/domain/WorkoutCard";
import { DoorCard } from "@/components/domain/DoorCard";
import { IllustrationSlot } from "@/components/domain/IllustrationSlot";
import { ZoneFigures } from "@/components/domain/ZoneFigures";
import { StatBlock } from "@/components/domain/StatBlock";
import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import {
  loadUserZonePrefs,
  calculateAllZones,
  formatPace,
} from "@/lib/zones";
import { cn } from "@/lib/utils";

const ZONES = [1, 2, 3, 4, 5, 6] as const;

// ────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────
// HomePage
// ────────────────────────────────────────────────────────────────────────────

export function HomePage() {
  const { t } = useTranslation(["homepage", "common", "calculators"]);
  const pickLang = usePickLang();
  const isEn = useIsEnglish();
  const [selectedZone, setSelectedZone] = useState<ZoneNumber | null>(null);

  // User's measured references (VMA, FCmax) — read once at mount. Updates from
  // Read once at mount, and only read: the form that used to write them from
  // this page is gone, so /my-zones and the runner profile are the only
  // writers left. Nothing on this screen can change them under the table.
  const userPrefs = useMemo(() => loadUserZonePrefs(), []);

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
        "262 science-based workouts: running, trail, cycling, swimming, strength",
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
      {/* The hero closes on a full-width ink rule, and the duo stands on it:
          its files carry no ground line, the bottom of its box is its ground,
          and that ground is a line the page already draws. On a wide screen
          the button row ends on the same rule; on a phone the duo comes after
          the buttons, still on the rule (docs/doodles.md). */}
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
          {/* The screen's single vermillon fill lives here and nowhere else.

              Un seul CTA conditionnel, et c'est tout le pont entre les deux
              pages : quelqu'un qui a déjà une donnée locale revient pour
              s'entraîner, pas pour relire l'argumentaire, donc le bouton
              principal l'emmène au cockpit. Pas de bandeau, pas
              d'interstitiel, pas de rejet à mémoriser, et surtout pas de
              redirection — "/" reste la page publique que les robots
              indexent et que les gens partagent. */}
          <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            <Button asChild size="lg">
              <Link to={hasPlans ? "/today" : "/plan/new"}>
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

        {/* The width lives in home.css (.zn-home__duo): 460px, the column the
            duo is drawn for, and at most 240px on a phone — less where the
            floating MENU pill would otherwise cover it. The height follows
            the viewBox. */}
        <IllustrationSlot
          ground="rule"
          className="zn-home__duo"
          art={RunnersDuo}
          brief={t("homepage:home.hero.illustrationBrief")}
          label={t("homepage:home.hero.illustrationLabel")}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          §01 — the four doors, directly under the hero
          ═══════════════════════════════════════════════════════════════════ */}
      {/* Bare doors: kicker, title, promise. The 64px vignettes went — under
          84px a crossing line reads as a pictogram, and the one figure this
          screen gets is the duo above. The five doors keep their drawings at
          200px in the menu, where they have a ground to stand on. */}
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

      {/* Fig. 01 — the polarised week — and the four-number strip both lived
          here. The figure restated in six bars what the zone atlas below says
          with six drawings, and the strip printed "256 séances · 9 plans · 12
          calculateurs · 0 compte" one screen under a lede that already says
          exactly that. On a phone the strip's four labels also collided into
          each other. Both are gone; /methodology keeps the 80/20 argument and
          its sources. */}

      {/* §05 — the plans section lived here. It re-sold what the "Suivre un
          plan structuré" door already offers three screens higher up, so it
          folded into that door. /plans stays in the nav, the footer and the
          palette. */}

      <section
        className="zn-section zn-split zn-home__week"
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

          <ZoneFigures label={t("homepage:home.s03.figuresLabel")} />

          {/* The "calcule tes zones personnalisées" form stood here: two inputs
              and a submit, above the table it filled in. It was the only thing
              on the landing page asking the reader for something. The table
              still shows their bpm and pace ranges whenever the values exist —
              read from the same localStorage — and /my-zones is where they are
              set, which is a page whose whole job that is. */}

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

      {/* §04 — the researchers, their citations and the quote of the day were
          here. A landing page makes the claim; /methodology is where it is
          argued and sourced, and that page carries the same list in full. */}

      {/* §06 — the twelve calculator cards lived here. They are a door now:
          the hub lists them, and a landing page does not need to name all
          twelve to say they exist. */}

      {/* ═══════════════════════════════════════════════════════════════════
          §08 — ethos, the one inverted band. Kept on the owner's call: the
          lede and the footer say "local" in words, this says it in figures,
          and it is the claim the project is built on.
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


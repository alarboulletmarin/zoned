import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, GithubIcon, ChevronDown } from "@/components/icons";
import {
  EditorialTitle,
  StaggerGrid,
  StaggerItem,
  useCountUp,
  Divider,
} from "@/components/editorial";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { useWorkouts } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import { usePlans } from "@/hooks/usePlans";
import { ZONE_META, type ZoneNumber } from "@/types";
import { usePickLang } from "@/lib/i18n-utils";
import {
  computeLandingStats,
  pickWeeklyWorkouts,
  EXPORT_FORMATS,
} from "@/lib/landing-stats";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { getQuoteOfTheDay } from "@/data/quotes";
import { ZoneDetailModal } from "@/components/domain/ZoneDetailModal";
import { WorkoutCard } from "@/components/domain/WorkoutCard";
import {
  loadUserZonePrefs,
  saveUserZonePrefs,
  calculateAllZones,
  formatPace,
} from "@/lib/zones";
import type { UserZonePreferences } from "@/types";

// Zone color classes — Tailwind needs static class names so we map explicitly.
const ZONE_BAR_BG: Record<ZoneNumber, string> = {
  1: "bg-zone-1",
  2: "bg-zone-2",
  3: "bg-zone-3",
  4: "bg-zone-4",
  5: "bg-zone-5",
  6: "bg-zone-6",
};
const ZONE_CHIP_BG: Record<ZoneNumber, string> = {
  1: "bg-zone-1/15 text-zone-1",
  2: "bg-zone-2/15 text-zone-2",
  3: "bg-zone-3/15 text-zone-3",
  4: "bg-zone-4/15 text-zone-4",
  5: "bg-zone-5/15 text-zone-5",
  6: "bg-zone-6/15 text-zone-6",
};

// ────────────────────────────────────────────────────────────────────────────
// Static editorial constants — derived from the codebase, not invented.
// RESEARCHERS surfaces the major scientific figures whose work the app
// builds on. Each entry points to the canonical source (peer-reviewed paper
// when one exists, otherwise a reference book). External URLs go to PubMed
// or the publisher so the user lands on the official record, not a Zoned
// summary article.
// ────────────────────────────────────────────────────────────────────────────

interface ResearcherSource {
  /** Italic, single-line citation as it appears in the card. */
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
  /** Short method tag rendered as a mono uppercase caption on every
   *  surface (mobile card + desktop card). Hard-coded — these are
   *  named conventions (POLARISED, VDOT, vVO₂max…), not translated. */
  tag: string;
  /** Tailwind text-* colour for the tag. Picked per researcher so the
   *  list reads with a coherent palette rather than a flat grey wash. */
  tagColor: string;
}

const RESEARCHERS: Researcher[] = [
  {
    name: "Stephen Seiler",
    tag: "Polarised · 80/20",
    tagColor: "text-zone-2",
    contributionKey: "homepage:home.s04.researchers.seiler.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.seiler.citation",
      url: "https://pubmed.ncbi.nlm.nih.gov/16774644/",
    },
  },
  {
    name: "Véronique Billat",
    tag: "vVO₂max · 30/30",
    tagColor: "text-zone-5",
    contributionKey: "homepage:home.s04.researchers.billat.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.billat.citation",
      url: "https://pubmed.ncbi.nlm.nih.gov/9927009/",
    },
  },
  {
    name: "Jack Daniels",
    tag: "VDOT · T/I/R",
    tagColor: "text-zone-3",
    contributionKey: "homepage:home.s04.researchers.daniels.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.daniels.citation",
    },
  },
  {
    name: "Arthur Lydiard",
    tag: "Base building",
    tagColor: "text-zone-2",
    contributionKey: "homepage:home.s04.researchers.lydiard.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.lydiard.citation",
    },
  },
  {
    name: "Tim Noakes",
    tag: "Central governor",
    tagColor: "text-primary",
    contributionKey: "homepage:home.s04.researchers.noakes.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.noakes.citation",
    },
  },
  {
    name: "Wildor Hollmann & Alois Mader",
    tag: "Lactate threshold",
    tagColor: "text-zone-4",
    contributionKey: "homepage:home.s04.researchers.cologne.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.cologne.citation",
    },
  },
  {
    name: "Oliver Faude",
    tag: "Threshold review",
    tagColor: "text-zone-4",
    contributionKey: "homepage:home.s04.researchers.faude.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.faude.citation",
      url: "https://pubmed.ncbi.nlm.nih.gov/19402743/",
    },
  },
  {
    name: "Iñigo San Millán",
    tag: "Zone 2 · mitochondria",
    tagColor: "text-zone-2",
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

/** Subtle "scroll to discover" cue anchored at the foot of the hero. Pulses
 *  gently; respects prefers-reduced-motion (then it stays static). */
function ScrollHint() {
  const reduced = useReducedMotion();
  const { t } = useTranslation("homepage");
  return (
    <div className="hidden md:flex justify-center mt-14 pb-2">
      <motion.div
        className="flex flex-col items-center gap-1.5 text-muted-foreground"
        initial={reduced ? false : { opacity: 0 }}
        animate={reduced ? undefined : { opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
          {t("home.hero.scrollHint")}
        </span>
        <motion.span
          aria-hidden
          animate={reduced ? undefined : { y: [0, 5, 0] }}
          transition={
            reduced
              ? undefined
              : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          }
          className="inline-block"
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// HomePage
// ────────────────────────────────────────────────────────────────────────────

export function HomePage() {
  const { t, i18n } = useTranslation(["homepage", "common", "library"]);
  const pickLang = usePickLang();
  const dailyQuote = useMemo(() => getQuoteOfTheDay(), []);
  const isEn = i18n.language?.startsWith("en");
  const [selectedZone, setSelectedZone] = useState<ZoneNumber | null>(null);
  // User's measured references (VMA, FCmax) — read once at mount. Updates from
  // the inline form below the zone table re-store these in localStorage and
  // bump local state so the table refreshes without a page reload.
  const [userPrefs, setUserPrefs] = useState<UserZonePreferences | null>(
    () => loadUserZonePrefs(),
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

  const { workouts: runWorkouts } = useWorkouts();
  const { workouts: cyclingWorkouts } = useCrossDisciplineWorkouts("cycling");
  const { workouts: swimWorkouts } = useCrossDisciplineWorkouts("swimming");
  const { workouts: strengthWorkouts } = useStrengthWorkouts();
  const { plans: userPlans } = usePlans();
  const hasPlans = userPlans.length > 0;

  // Endurance pool — running + cycling + swimming. Strength sessions are on
  // a different shape (no zones) so we add them only to the headline count.
  const allEndurance = useMemo(
    () => [...runWorkouts, ...cyclingWorkouts, ...swimWorkouts],
    [runWorkouts, cyclingWorkouts, swimWorkouts],
  );
  const stats = useMemo(
    () => computeLandingStats(allEndurance),
    [allEndurance],
  );
  const totalSessions = stats.totalSessions + strengthWorkouts.length;

  const prebuiltPlans = useMemo(() => getAllPrebuiltPlans(), []);

  // ── Hero rotating accent — single italic word punctuating the headline.
  // Reads "L'entraînement <structuré|lisible|outillé|documenté>, sans bruit."
  // The whole expression hinges on this word, so the list is kept short.
  const accentWords = useMemo(
    () => t("homepage:home.hero.accent", { returnObjects: true }) as string[],
    [t],
  );
  const [accentIndex, setAccentIndex] = useState(0);
  useEffect(() => {
    if (accentWords.length <= 1) return;
    const id = setInterval(() => {
      setAccentIndex((i) => (i + 1) % accentWords.length);
    }, 3500);
    return () => clearInterval(id);
  }, [accentWords.length]);

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
    const cycling = pickWeeklyWorkouts(
      cyclingWorkouts,
      () => true,
      1,
      1,
    )[0];
    const swimming = pickWeeklyWorkouts(
      swimWorkouts,
      () => true,
      1,
      2,
    )[0];
    return [tempo, cycling, swimming].filter(
      (w): w is NonNullable<typeof w> => w != null,
    );
  }, [runWorkouts, cyclingWorkouts, swimWorkouts]);

  // ── Plans by distance, ordered race-progression. Filter to distances that
  // actually have a plan shipped so empty rows never render.
  //
  // Each row needs its "canonical" plan for that distance. We can't just pick
  // the shortest because some recovery plans (retour-blessure, reprise-longue
  // -pause) are tagged with a raceDistance but are not the entry point for
  // beginners. Matching by slug prefix instead gives the right row.
  const planRows = useMemo(() => {
    const order: Array<{ key: string; distance: string; slugPrefix?: string }> = [
      { key: "5K", distance: "5K", slugPrefix: "5k-" },
      { key: "10K", distance: "10K", slugPrefix: "10k-" },
      { key: "semi", distance: "semi" },
      { key: "marathon", distance: "marathon" },
      { key: "trail", distance: "trail" },
    ];
    return order
      .map(({ key, distance, slugPrefix }) => {
        let plans = prebuiltPlans.filter((p) => p.raceDistance === distance);
        if (slugPrefix) {
          const matching = plans.filter((p) => p.slug.startsWith(slugPrefix));
          if (matching.length > 0) plans = matching;
        }
        if (plans.length === 0) return null;
        // Prefer the beginner plan: easiest difficulty, then shortest.
        const score = (d: typeof plans[0]["difficulty"]) =>
          d === "beginner" ? 0 : d === "intermediate" ? 1 : d === "advanced" ? 2 : 3;
        const canonical = plans.reduce((a, b) => {
          const da = score(a.difficulty);
          const db = score(b.difficulty);
          if (da !== db) return da < db ? a : b;
          return a.totalWeeks < b.totalWeeks ? a : b;
        });
        return { key, plan: canonical, alt: plans.length - 1 };
      })
      .filter((r): r is { key: string; plan: typeof prebuiltPlans[0]; alt: number } => r != null);
  }, [prebuiltPlans]);

  const seoDescription = t("common:pages.home.seoDescription", {
    count: totalSessions || 200,
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
        "200+ science-based running workouts",
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
            text: `Plus de ${totalSessions || 200} séances de course à pied, plus 10 séances cyclisme et 10 séances natation pour le cross-training, organisées en 6 zones d'intensité.`,
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

  return (
    <div className="font-sans text-foreground">
      <SEOHead
        title={t("homepage:home.seoTitle")}
        description={seoDescription}
        canonical="/"
        jsonLd={homepageJsonLd}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — headline + lead + CTAs + sidecar polarised chart
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="pt-2 md:pt-8 pb-12 md:pb-20">

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-start">
          {/* Left column — title + body + CTAs + stat row */}
          <div className="max-w-[640px]">
            {/* Headline locked to 3 lines (head / rotating accent / tail) so
                the hero block keeps the exact same height as the word
                rotates — no layout jitter between "structuré" and
                "documenté". Each piece sits on its own line via block. */}
            <h1 className="font-sans font-semibold text-[40px] sm:text-6xl md:text-[68px] leading-[1.02] tracking-tight mb-8">
              <span className="block">{t("homepage:home.hero.head")}</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={accentIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
                  className="block italic"
                >
                  {accentWords[accentIndex]},
                </motion.span>
              </AnimatePresence>
              <span className="block">{t("homepage:home.hero.tail")}</span>
            </h1>

            <p className="text-[15px] md:text-base leading-[1.65] text-foreground/75 max-w-[520px] mb-8">
              {t("homepage:home.hero.lead", {
                sessions: totalSessions,
                plans: prebuiltPlans.length,
                calculators: CALCULATORS.length,
              })}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-12">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link to="/library">
                  <ArrowRight className="size-4" />
                  {t("homepage:home.hero.ctaPrimary")}
                </Link>
              </Button>
              <Button asChild variant="outline-primary" size="lg" className="rounded-full px-6">
                <Link to={hasPlans ? "/plans" : "/plan/new"}>
                  {t(
                    hasPlans
                      ? "homepage:home.hero.ctaSecondaryHasPlans"
                      : "homepage:home.hero.ctaSecondary",
                  )}
                </Link>
              </Button>
            </div>

            {/* Stat row — every figure derived, count-up on mount. Each
                number gets its own accent: the catalogue size in primary
                (the "headline" stat), then the three companion stats
                tint Z2 / Z3 / Z5 to walk the eye across the row without
                competing with the chart sidecar. */}
            <div className="border-t border-foreground/15 pt-6 grid grid-cols-4 gap-4">
              <CountStat
                target={totalSessions}
                label={t("homepage:home.stats.sessions")}
                color="text-primary"
              />
              <CountStat
                target={prebuiltPlans.length}
                label={`${t("homepage:home.stats.plansFrom")} ${
                  prebuiltPlans.find((p) => p.raceDistance === "5K") ? "5K" : ""
                } → ${
                  prebuiltPlans.find((p) => p.raceDistance === "marathon")
                    ? "marathon"
                    : prebuiltPlans[prebuiltPlans.length - 1]?.raceDistance ?? ""
                }`}
                color="text-zone-2"
              />
              <CountStat
                target={CALCULATORS.length}
                label={t("homepage:home.stats.calculators")}
                color="text-zone-3"
              />
              <StatBlock
                value="0"
                label={t("homepage:home.stats.trackers")}
                sub={t("homepage:home.stats.noAccount")}
                color="text-zone-5"
              />
            </div>
          </div>

          {/* Right column — canonical polarised week reference */}
          <PolarisedChart />
        </div>

        <ScrollHint />
      </section>

      {/* Horizontal rule between sections — recurring across the page. */}
      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════
          §01 — Trois entrées
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">

        <EditorialTitle>{t("homepage:home.s01.title")}</EditorialTitle>
        <p className="mt-3 text-sm text-foreground/65 max-w-xl leading-relaxed">
          {t("homepage:home.s01.body")}
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-10 divide-y md:divide-y-0 md:divide-x divide-foreground/15">
          <EntryColumn
            num="01"
            title={t("homepage:home.s01.e1Title")}
            body={t("homepage:home.s01.e1Body")}
            linkLabel={t("homepage:home.s01.e1Link")}
            to="/library"
          />
          <EntryColumn
            num="02"
            title={t("homepage:home.s01.e2Title")}
            body={t("homepage:home.s01.e2Body")}
            linkLabel={t("homepage:home.s01.e2Link")}
            to="/plans"
          />
          <EntryColumn
            num="03"
            title={t("homepage:home.s01.e3Title")}
            body={t("homepage:home.s01.e3Body")}
            linkLabel={t("homepage:home.s01.e3Link")}
            to="/methodology"
          />
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════
          §02 — Trois séances suggérées (déterministe pour la semaine)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2.2fr] gap-10">
          <div>

            <EditorialTitle>{t("homepage:home.s02.title")}</EditorialTitle>
            <p className="mt-3 text-sm text-foreground/65 max-w-xs leading-relaxed">
              {t("homepage:home.s02.body")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {suggested.map((w) => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════
          §03 — Atlas des zones (table Z1→Z6 dérivée de ZONE_META)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">

        <EditorialTitle>
          {t("homepage:home.s03.title1")}
          <br />
          {t("homepage:home.s03.title2")}
        </EditorialTitle>
        <p className="mt-3 text-sm text-foreground/65 max-w-xl leading-relaxed">
          {t("homepage:home.s03.body")}
        </p>

        <ZonesPersonaliser
          prefs={userPrefs}
          hasUserZones={hasUserZones}
          onSave={updatePrefs}
        />

        {/* Desktop / tablet: full 6-column table. */}
        <div className="hidden md:block mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-foreground/20">
                <th className="text-left py-3 pr-4 font-normal w-20">
                  {t("homepage:home.s03.zone")}
                </th>
                <th className="text-left py-3 pr-4 font-normal">
                  {t("homepage:home.s03.name")}
                </th>
                <th className="text-left py-3 pr-4 font-normal w-28">
                  {t("homepage:home.s03.hr")}
                </th>
                <th className="text-left py-3 pr-4 font-normal w-24">
                  {t("homepage:home.s03.rpe")}
                </th>
                <th className="text-left py-3 pr-4 font-normal">
                  {t("homepage:home.s03.adaptation")}
                </th>
                <th className="text-right py-3 pl-4 font-normal w-24">
                  {t("homepage:home.s03.refPace")}
                </th>
              </tr>
            </thead>
            <tbody>
              {([1, 2, 3, 4, 5, 6] as const).map((z) => {
                const range = personalRanges?.[z];
                const hrCell =
                  range?.hrMin && range?.hrMax
                    ? `${range.hrMin}–${range.hrMax} bpm`
                    : ZONE_FC_FALLBACK[z];
                const paceCell =
                  range?.paceMinPerKm && range?.paceMaxPerKm
                    ? `${formatPace(range.paceMinPerKm)}–${formatPace(range.paceMaxPerKm)}/km`
                    : ZONE_PACE_FALLBACK[z];
                return (
                  <ZoneRow
                    key={z}
                    zone={z}
                    label={pickLang(ZONE_META[z], "label")}
                    hrRange={hrCell}
                    fcPercent={ZONE_FC_PERCENT[z]}
                    rpe={ZONE_RPE[z]}
                    benefit={pickLang(ZONE_META[z], "benefit")}
                    refPace={paceCell}
                    isPersonal={!!range}
                    onClick={() => setSelectedZone(z)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile: one card per zone — keeps every column readable
            without horizontal scrolling. */}
        <ul className="md:hidden mt-8 space-y-3">
          {([1, 2, 3, 4, 5, 6] as const).map((z) => {
            const range = personalRanges?.[z];
            const hrCell =
              range?.hrMin && range?.hrMax
                ? `${range.hrMin}–${range.hrMax} bpm`
                : ZONE_FC_FALLBACK[z];
            const paceCell =
              range?.paceMinPerKm && range?.paceMaxPerKm
                ? `${formatPace(range.paceMinPerKm)}–${formatPace(range.paceMaxPerKm)}/km`
                : ZONE_PACE_FALLBACK[z];
            return (
              <li key={z}>
                <button
                  type="button"
                  onClick={() => setSelectedZone(z)}
                  className="block w-full text-left border border-border rounded-md p-4 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-1 font-mono text-[11px] rounded-sm ${ZONE_CHIP_BG[z]}`}
                      >
                        Z{z}
                      </span>
                      <span className="font-semibold text-base">
                        {pickLang(ZONE_META[z], "label")}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-foreground/45 tracking-wider">
                      {ZONE_FC_PERCENT[z]}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-3 leading-snug">
                    {pickLang(ZONE_META[z], "benefit")}
                  </p>
                  <div className="mt-3 pt-3 border-t border-dashed border-border/60 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-foreground/45">
                        {t("homepage:home.s03.hr")}
                      </p>
                      <p
                        className={`font-mono tabular-nums mt-0.5 ${
                          range ? "text-primary font-semibold" : "text-foreground/60"
                        }`}
                      >
                        {hrCell}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-foreground/45">
                        {t("homepage:home.s03.rpe")}
                      </p>
                      <p className="font-mono tabular-nums mt-0.5 text-foreground/60">
                        {ZONE_RPE[z]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-foreground/45">
                        {t("homepage:home.s03.refPace")}
                      </p>
                      <p
                        className={`font-mono tabular-nums mt-0.5 ${
                          range ? "text-primary font-semibold" : "text-foreground/60"
                        }`}
                      >
                        {paceCell}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <ZoneDetailModal
        zone={selectedZone}
        zoneMeta={selectedZone ? ZONE_META[selectedZone] : null}
        open={selectedZone !== null}
        onOpenChange={(open) => !open && setSelectedZone(null)}
      />

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════
          §04 — Chercheurs et sources de référence
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <EditorialTitle>{t("homepage:home.s04.title")}</EditorialTitle>
        <p className="mt-3 text-sm text-foreground/65 max-w-xl leading-relaxed">
          {t("homepage:home.s04.body")}
        </p>

        {/* Mobile: dense 2-col grid (name + arrow only). Links open the
            external publication when available, otherwise the methodology
            hub — matches the calculator-grid pattern on mobile. */}
        <StaggerGrid className="md:hidden mt-10 grid grid-cols-2 gap-2">
          {RESEARCHERS.map((r) => {
            const href = r.source.url ?? "/methodology";
            const isExternal = !!r.source.url;
            const cls =
              "group block border border-border bg-card hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 p-3 rounded-md flex flex-col h-full";
            const content = (
              <>
                <span
                  className={`font-mono text-[9px] tracking-[0.14em] uppercase ${r.tagColor} mb-1.5 truncate`}
                >
                  {r.tag}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-semibold flex-1 leading-snug group-hover:text-primary transition-colors">
                    {r.name}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </>
            );
            return (
              <StaggerItem key={r.name}>
                {isExternal ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cls}
                  >
                    {content}
                  </a>
                ) : (
                  <Link to={href} className={cls}>
                    {content}
                  </Link>
                )}
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        <StaggerGrid className="hidden md:grid mt-10 grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {RESEARCHERS.map((r) => (
            <StaggerItem key={r.name}>
              <ResearcherCard researcher={r} t={t} />
            </StaggerItem>
          ))}
        </StaggerGrid>

        {/* Quote of the day — rotates daily through 20 attributable
            quotes from runners, coaches and sports physicians. */}
        <blockquote className="mt-16 md:mt-20 max-w-2xl mx-auto text-center">
          <p className="font-sans italic text-xl md:text-2xl leading-[1.45]">
            {isEn ? dailyQuote.en : dailyQuote.fr}
          </p>
          <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/55">
            {dailyQuote.author} · {isEn ? dailyQuote.role.en : dailyQuote.role.fr}
          </p>
        </blockquote>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════
          §05 — Plans (5K → ultra), data from prebuilt-plans
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">

        <EditorialTitle>{t("homepage:home.s05.title")}</EditorialTitle>
        <p className="mt-3 text-sm text-foreground/65 max-w-xl leading-relaxed">
          {t("homepage:home.s05.body", {
            count: prebuiltPlans.length,
            min: Math.min(...prebuiltPlans.map((p) => p.totalWeeks)),
            max: Math.max(...prebuiltPlans.map((p) => p.totalWeeks)),
          })}
        </p>

        {/* Mobile: dense 2-col grid (distance + arrow only). Each card
            jumps to the canonical plan for that distance — matches the
            calculator-grid pattern. */}
        <StaggerGrid className="md:hidden mt-10 grid grid-cols-2 gap-3">
          {planRows.map(({ key, plan }) => (
            <StaggerItem key={key}>
              <Link
                to={`/plan/prebuilt/${plan.slug}`}
                className="group block border border-border bg-card hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 p-3 rounded-md flex flex-col gap-3 h-full"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base font-sans italic font-semibold flex-1 leading-snug group-hover:text-primary transition-colors">
                    {t(`homepage:home.s05.distance.${key}`)}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
                {/* Mini macrocycle bar — same colour scale as the
                    desktop legend so the user can read base → taper at
                    a glance even on phones. */}
                <div className="flex h-1.5 overflow-hidden rounded-sm">
                  {plan.phases.map((p, i) => {
                    const span = p.endWeek - p.startWeek + 1;
                    const pct = (span / plan.totalWeeks) * 100;
                    return (
                      <div
                        key={i}
                        className={PHASE_COLORS[p.phase] ?? "bg-foreground/20"}
                        style={{ width: `${pct}%` }}
                      />
                    );
                  })}
                </div>
                <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground -mt-1">
                  {plan.totalWeeks} {t("homepage:home.s05.weeks")}
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>

        {/* Desktop / tablet: existing full row layout. */}
        <div className="hidden md:block mt-10 divide-y divide-foreground/15 border-y border-foreground/15">
          {planRows.map(({ key, plan }) => (
            <PlanRow
              key={key}
              label={t(`homepage:home.s05.distance.${key}`)}
              plan={plan}
              t={t}
            />
          ))}
        </div>
        <PlanPhaseLegend />
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════
          §06 — Calculateurs (grid 3×3, count dérivé du tableau)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <EditorialTitle>{t("homepage:home.s06.title")}</EditorialTitle>
        <p className="mt-3 text-sm text-foreground/65 max-w-xl leading-relaxed">
          {t("homepage:home.s06.body")}
        </p>

        {/* Mobile: dense 2-col grid with title + chevron only — keeps the
            scroll short. From sm+ each card grows to title + description +
            CTA, three columns on md+. */}
        <StaggerGrid className="mt-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {CALCULATORS.map((c) => (
            <StaggerItem key={c.key}>
              <Link
                to={c.slug}
                className="group block border border-border bg-card hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 p-3 sm:p-5 rounded-md flex items-center sm:block gap-2 sm:gap-0"
              >
                <h3 className="text-sm sm:text-base font-semibold sm:mb-1.5 group-hover:text-primary transition-colors flex-1 sm:flex-none leading-snug">
                  {t(c.titleKey)}
                </h3>
                <p className="hidden sm:block text-sm text-muted-foreground leading-snug line-clamp-2">
                  {t(c.descKey)}
                </p>
                <span className="hidden sm:inline-flex mt-3 items-center text-xs font-medium text-primary">
                  {t("calculators:calculateurs.explore")}
                  <ArrowRight className="size-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                </span>
                <ArrowRight className="size-4 sm:hidden text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════
          §08 — Éthos (section sombre inverse) — 4 chiffres factuels
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-screen left-1/2 -ml-[50vw] py-16 md:py-24 bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16">
          <div>
            <h2 className="font-sans font-semibold italic text-3xl md:text-5xl leading-[1.05]">
              {t("homepage:home.s08.title1")}
              <br />
              {t("homepage:home.s08.title2")}
            </h2>
            <p className="mt-6 text-sm leading-[1.65] text-background/70 max-w-md">
              {t("homepage:home.s08.body")}
            </p>
          </div>

          <ul className="space-y-6 md:pt-2">
            <EthosLine
              value="00"
              label={t("homepage:home.s08.lines.trackers")}
            />
            <EthosLine
              value="00"
              label={t("homepage:home.s08.lines.account")}
            />
            <EthosLine
              value="00"
              label={t("homepage:home.s08.lines.network")}
            />
            <EthosLine
              value={String(EXPORT_FORMATS.length).padStart(2, "0")}
              label={t("homepage:home.s08.lines.exports")}
              sub={EXPORT_FORMATS.map((f) => `.${f}`).join(" · ")}
            />
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          §09 — FAQ (in-page accordion, real answers — no external link)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <EditorialTitle>{t("homepage:home.s09.title")}</EditorialTitle>

        <div className="mt-10 border-t border-foreground/15">
          {FAQ_IDS.map((id, i) => (
            <details
              key={id}
              className="group border-b border-foreground/15 [&[open]>summary>svg]:rotate-180 [&[open]>summary]:bg-accent/40 [&[open]>summary>svg]:text-primary [&[open]>summary>span.q-num]:text-primary"
            >
              <summary className="flex items-center gap-4 sm:gap-6 py-5 cursor-pointer list-none hover:bg-accent/30 transition-colors px-2 -mx-2 rounded-sm">
                <span className="q-num font-mono text-[11px] tracking-[0.15em] text-foreground/50 w-6 shrink-0 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-sans italic text-lg md:text-xl flex-1">
                  {t(`homepage:home.s09.q.${id}.q`)}
                </span>
                <ChevronDown className="size-4 text-foreground/40 transition-all shrink-0" />
              </summary>
              <div className="pb-5 pl-12 pr-6 text-sm leading-relaxed text-foreground/75 max-w-3xl">
                {t(`homepage:home.s09.q.${id}.a`)}
              </div>
            </details>
          ))}
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════
          CTA final — last call before the footer
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 text-center">
        <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-foreground/55 mb-8">
          <span className="inline-block h-px w-10 bg-foreground/55 align-middle mr-3" />
          {t("homepage:home.cta.kicker")}
          <span className="inline-block h-px w-10 bg-foreground/55 align-middle ml-3" />
        </p>
        <h2 className="font-sans font-semibold italic text-3xl md:text-5xl leading-[1.1] max-w-3xl mx-auto">
          {t("homepage:home.cta.line1")}
          <br />
          {t("homepage:home.cta.line2")}
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="rounded-full px-6">
            <Link to="/library">
              <ArrowRight className="size-4" />
              {t("homepage:home.cta.primary")}
            </Link>
          </Button>
          <Button asChild variant="outline-primary" size="lg" className="rounded-full px-6">
            <a
              href="https://github.com/alarboulletmarin/zoned"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="size-4" />
              {t("homepage:home.cta.secondary")}
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components — local to the landing. Generic editorial atoms live in
// src/components/editorial/. The global footer lives in
// src/components/layout/Footer.tsx and is rendered by App.tsx for every
// non-fullscreen route, including the home page.
// ────────────────────────────────────────────────────────────────────────────

function StatBlock({
  value,
  label,
  sub,
  color,
}: {
  value: string;
  label: string;
  sub?: string;
  /** Tailwind text-* class for the big number. Defaults to foreground. */
  color?: string;
}) {
  return (
    <div>
      <p
        className={`font-sans italic text-3xl md:text-4xl leading-none tabular-nums ${color ?? "text-foreground"}`}
      >
        {value}
      </p>
      <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-foreground/55 mt-2 leading-tight">
        {label}
      </p>
      {sub && (
        <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-foreground/40 leading-tight">
          {sub}
        </p>
      )}
    </div>
  );
}

/** Stat block whose value animates from 0 to `target` on mount. */
function CountStat({
  target,
  label,
  color,
}: {
  target: number;
  label: string;
  color?: string;
}) {
  const value = useCountUp(target);
  return <StatBlock value={String(value)} label={label} color={color} />;
}

// Canonical Seiler-style polarised reference — these are *teaching values*,
// not measurements of the user's library. They illustrate what a well-dosed
// training week looks like under the 80/20 model. Anything that smells like
// "live data" (TSS, totals) has been removed to avoid mixing both ideas.
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

function PolarisedChart() {
  const { t } = useTranslation("homepage");
  const reduced = useReducedMotion();
  const max = Math.max(...Object.values(POLARISED_REFERENCE));
  const zoneNames: Record<ZoneNumber, string> = {
    1: t("home.hero.fig.zones.z1"),
    2: t("home.hero.fig.zones.z2"),
    3: t("home.hero.fig.zones.z3"),
    4: t("home.hero.fig.zones.z4"),
    5: t("home.hero.fig.zones.z5"),
    6: t("home.hero.fig.zones.z6"),
  };

  // Bars start collapsed and grow to their target width once the chart
  // is mounted. Mirrors the "discover, don't announce" intent.
  const [animated, setAnimated] = useState(reduced);
  useEffect(() => {
    if (reduced) {
      setAnimated(true);
      return;
    }
    const id = window.setTimeout(() => setAnimated(true), 200);
    return () => window.clearTimeout(id);
  }, [reduced]);

  return (
    <div className="border border-border bg-card rounded-lg p-6 md:p-8">
      <p className="font-sans font-semibold italic text-2xl md:text-3xl leading-tight">
        {t("home.hero.fig.title")}
      </p>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {t("home.hero.fig.body")}
      </p>

      <div className="mt-7 space-y-2.5">
        {([1, 2, 3, 4, 5, 6] as const).map((zone, i) => {
          const pct = POLARISED_REFERENCE[zone];
          return (
            <div key={zone} className="grid grid-cols-[7.5rem_1fr_2.4rem] items-center gap-3">
              <div className="flex items-baseline gap-1.5 text-xs min-w-0">
                <span className="font-mono font-semibold text-foreground/75 shrink-0">
                  Z{zone}
                </span>
                <span className="text-muted-foreground truncate">
                  {zoneNames[zone]}
                </span>
              </div>
              <div className="h-2.5 bg-foreground/[0.06] rounded-sm overflow-hidden">
                <div
                  className={`h-full ${ZONE_BAR_BG[zone]} rounded-sm transition-[width] duration-[900ms] ease-out`}
                  style={{
                    width: `${animated ? (pct / max) * 100 : 0}%`,
                    transitionDelay: reduced ? "0ms" : `${i * 80}ms`,
                  }}
                />
              </div>
              <span className="font-mono text-xs text-foreground tabular-nums text-right font-semibold">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Two summary chips — the actual takeaway of the figure. */}
      <div className="mt-6 pt-5 border-t border-dashed border-border grid grid-cols-2 gap-3">
        <PolarisedSummaryChip
          rangeLabel={t("home.hero.fig.lowRange")}
          value={POLARISED_LOW}
          caption={t("home.hero.fig.lowCaption")}
          accent="zone-2"
        />
        <PolarisedSummaryChip
          rangeLabel={t("home.hero.fig.highRange")}
          value={POLARISED_HIGH}
          caption={t("home.hero.fig.highCaption")}
          accent="zone-5"
        />
      </div>
    </div>
  );
}

function PolarisedSummaryChip({
  rangeLabel,
  value,
  caption,
  accent,
}: {
  rangeLabel: string;
  value: number;
  caption: string;
  accent: "zone-2" | "zone-5";
}) {
  const accentBg = accent === "zone-2" ? "bg-zone-2/15" : "bg-zone-5/15";
  const accentText = accent === "zone-2" ? "text-zone-2" : "text-zone-5";
  return (
    <div className={`${accentBg} rounded-md p-3`}>
      <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground leading-tight">
        {rangeLabel}
      </p>
      <p className={`font-sans font-semibold italic text-2xl mt-1 ${accentText}`}>
        {value}&thinsp;%
      </p>
      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
        {caption}
      </p>
    </div>
  );
}

function EntryColumn({
  num,
  title,
  body,
  linkLabel,
  to,
}: {
  num: string;
  title: string;
  body: string;
  linkLabel: string;
  to: string;
}) {
  return (
    <div className="py-8 md:py-0 md:px-8 first:md:pl-0 last:md:pr-0 flex flex-col">
      <p className="font-mono text-[11px] tracking-[0.15em] text-foreground/50 mb-3">
        {num}
      </p>
      <h3 className="font-sans italic text-2xl mb-3">{title}</h3>
      <p className="text-sm leading-[1.65] text-foreground/75 mb-5 flex-1">
        {body}
      </p>
      <Button asChild variant="outline-primary" size="sm" className="self-start">
        <Link to={to}>
          {linkLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </div>
  );
}

// ── §03 zone metadata. RPE and the "% FCmax" model lines describe the
// physiology and don't depend on the user; the bpm and pace columns are
// computed from their measured FCmax / VMA when available (see calculateAll
// Zones), and these fallbacks appear when nothing has been measured yet.
const ZONE_FC_PERCENT: Record<ZoneNumber, string> = {
  1: "50–60 % FCmax",
  2: "60–70 % FCmax",
  3: "70–80 % FCmax",
  4: "80–90 % FCmax",
  5: "90–100 % FCmax",
  6: "> 100 % FCmax",
};
const ZONE_FC_FALLBACK: Record<ZoneNumber, string> = {
  1: "—",
  2: "—",
  3: "—",
  4: "—",
  5: "—",
  6: "—",
};
const ZONE_RPE: Record<ZoneNumber, string> = {
  1: "1–2 / 10",
  2: "3–4 / 10",
  3: "5–6 / 10",
  4: "7 / 10",
  5: "8–9 / 10",
  6: "10 / 10",
};
const ZONE_PACE_FALLBACK: Record<ZoneNumber, string> = {
  1: "—",
  2: "—",
  3: "—",
  4: "—",
  5: "—",
  6: "—",
};

function ZoneRow({
  zone,
  label,
  hrRange,
  fcPercent,
  rpe,
  benefit,
  refPace,
  isPersonal,
  onClick,
}: {
  zone: ZoneNumber;
  label: string;
  hrRange: string;
  fcPercent: string;
  rpe: string;
  benefit: string;
  refPace: string;
  isPersonal: boolean;
  onClick: () => void;
}) {
  return (
    <tr
      className="border-b border-foreground/10 hover:bg-foreground/[0.03] transition-colors cursor-pointer"
      onClick={onClick}
    >
      <td className="py-5 pr-4">
        <span
          className={`inline-flex items-center justify-center px-2 py-1 font-mono text-[11px] ${ZONE_CHIP_BG[zone]}`}
        >
          Z{zone}
        </span>
      </td>
      <td className="py-5 pr-4">
        <p className="font-sans italic text-lg leading-tight">{label}</p>
        <p className="font-mono text-[10px] tracking-wider text-foreground/45 mt-0.5">
          {fcPercent}
        </p>
      </td>
      <td className="py-5 pr-4 font-mono text-xs tabular-nums">
        <span className={isPersonal ? "text-primary font-semibold" : "text-foreground/45"}>
          {hrRange}
        </span>
      </td>
      <td className="py-5 pr-4 font-mono text-xs text-foreground/70 tabular-nums">
        {rpe}
      </td>
      <td className="py-5 pr-4 text-sm leading-snug text-foreground/80">
        {benefit}
      </td>
      <td className="py-5 pl-4 text-right font-mono text-xs tabular-nums">
        <span className={isPersonal ? "text-primary font-semibold" : "text-foreground/45"}>
          {refPace}
        </span>
      </td>
    </tr>
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
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-foreground/55">
          {t("home.s03.personal.label")}
        </span>
        {prefs?.vma != null && (
          <span className="font-mono tabular-nums">
            VMA <strong className="text-foreground font-semibold">{prefs.vma}</strong> km/h
          </span>
        )}
        {prefs?.fcMax != null && (
          <span className="font-mono tabular-nums">
            FCmax <strong className="text-foreground font-semibold">{prefs.fcMax}</strong> bpm
          </span>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-primary text-sm font-medium underline underline-offset-4 hover:text-primary/80"
        >
          {t("home.s03.personal.edit")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 flex flex-wrap items-end gap-3 p-4 rounded-md border border-dashed border-border bg-card"
    >
      <div>
        <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">
          {t("home.s03.personal.prompt")}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col text-xs text-muted-foreground">
            <span className="mb-1">{t("home.s03.personal.vmaLabel")}</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="8"
              max="30"
              value={vma}
              onChange={(e) => setVma(e.target.value)}
              placeholder="16.0"
              className="w-24 px-2.5 py-1.5 rounded border border-input bg-background text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="flex flex-col text-xs text-muted-foreground">
            <span className="mb-1">{t("home.s03.personal.fcMaxLabel")}</span>
            <input
              type="number"
              inputMode="numeric"
              step="1"
              min="100"
              max="250"
              value={fcMax}
              onChange={(e) => setFcMax(e.target.value)}
              placeholder="190"
              className="w-24 px-2.5 py-1.5 rounded border border-input bg-background text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <Button type="submit" size="sm">
            {t("home.s03.personal.submit")}
          </Button>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
            >
              {t("home.s03.personal.cancel")}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function ResearcherCard({
  researcher,
  t,
}: {
  researcher: Researcher;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const hasUrl = !!researcher.source.url;
  return (
    <article className="pl-5 py-1 border-l border-border transition-colors hover:border-foreground/40">
      <p
        className={`font-mono text-[10px] tracking-[0.16em] uppercase ${researcher.tagColor} mb-1.5`}
      >
        {researcher.tag}
      </p>
      <h3 className="text-lg font-semibold">{researcher.name}</h3>
      <p className="text-sm text-muted-foreground mt-1 leading-snug">
        {t(researcher.contributionKey)}
      </p>
      <p className="font-sans italic text-sm text-foreground/80 mt-3 leading-snug">
        {t(researcher.source.citationKey)}
      </p>
      {hasUrl && (
        <a
          href={researcher.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
        >
          {t("homepage:home.s04.viewPublication")}
          <ArrowRight className="size-3" />
        </a>
      )}
    </article>
  );
}

/** Maps macrocycle phase identifiers to zone-coloured backgrounds. The
 *  same colour scale is reused by the legend below the plan rows so the
 *  reader can decode the segments in one glance. */
const PHASE_COLORS: Record<string, string> = {
  base: "bg-zone-2",
  build: "bg-zone-3",
  peak: "bg-zone-4",
  taper: "bg-zone-5",
  recovery: "bg-zone-1",
};

function PlanRow({
  label,
  plan,
  t,
}: {
  label: string;
  plan: ReturnType<typeof getAllPrebuiltPlans>[number];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_2fr_0.8fr] items-center gap-4 py-5"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
    >
      <p className="font-sans italic text-xl md:text-2xl">{label}</p>
      <p className="text-sm text-foreground/70">
        {plan.totalWeeks} {t("homepage:home.s05.weeks")}
      </p>
      <p className="text-sm text-foreground/70 hidden md:block">
        {plan.sessionsPerWeek} {t("homepage:home.s05.sessionsPerWeek")}
      </p>
      {/* Phase bar — fills in left-to-right when the row enters the
          viewport. Each segment's width is proportional to its share of
          the total weeks; same colour code as the legend below. */}
      <motion.div
        className="hidden md:flex h-2 overflow-hidden rounded-sm origin-left"
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={reduced ? undefined : { scaleX: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0, 0, 0.2, 1], delay: 0.1 }}
      >
        {plan.phases.map((p, i) => {
          const span = p.endWeek - p.startWeek + 1;
          const pct = (span / plan.totalWeeks) * 100;
          return (
            <div
              key={i}
              className={PHASE_COLORS[p.phase] ?? "bg-foreground/20"}
              style={{ width: `${pct}%` }}
              title={`${p.phase} (${span}w)`}
            />
          );
        })}
      </motion.div>
      <Button asChild variant="outline-primary" size="sm" className="justify-self-end">
        <Link to={`/plan/prebuilt/${plan.slug}`}>
          {t("homepage:home.s05.choose")}
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </motion.div>
  );
}

/** Tiny legend explaining what the phase-bar colours mean. Anchored
 *  under the plan table; only visible from md+ since the bars are
 *  hidden on mobile (each row reduces to label + weeks + CTA there). */
function PlanPhaseLegend() {
  const { t } = useTranslation("homepage");
  const phases: Array<{ key: string; color: string }> = [
    { key: "base", color: PHASE_COLORS.base },
    { key: "build", color: PHASE_COLORS.build },
    { key: "peak", color: PHASE_COLORS.peak },
    { key: "taper", color: PHASE_COLORS.taper },
  ];
  return (
    <div className="hidden md:flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs text-muted-foreground">
      <span className="font-mono text-[10px] tracking-[0.18em] uppercase">
        {t("home.s05.legend")}
      </span>
      {phases.map((p) => (
        <span key={p.key} className="inline-flex items-center gap-1.5">
          <span className={`inline-block w-3.5 h-2 rounded-sm ${p.color}`} />
          {t(`home.s05.phases.${p.key}`)}
        </span>
      ))}
    </div>
  );
}

function EthosLine({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <li className="grid grid-cols-[80px_1fr] items-baseline gap-4 border-b border-background/15 pb-5">
      <span className="font-sans italic text-3xl md:text-4xl tabular-nums">
        {value}
      </span>
      <div>
        <p className="text-sm md:text-base">{label}</p>
        {sub && (
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-background/55 mt-1">
            {sub}
          </p>
        )}
      </div>
    </li>
  );
}


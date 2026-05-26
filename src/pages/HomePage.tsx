import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, GithubIcon, ChevronDown } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { useWorkouts } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import { ZONE_META, type ZoneNumber } from "@/types";
import { usePickLang } from "@/lib/i18n-utils";
import {
  computeLandingStats,
  pickWeeklyWorkouts,
  getISOWeek,
  EXPORT_FORMATS,
} from "@/lib/landing-stats";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { ZoneDetailModal } from "@/components/domain/ZoneDetailModal";
import { WorkoutCard } from "@/components/domain/WorkoutCard";
import {
  loadUserZonePrefs,
  saveUserZonePrefs,
  calculateAllZones,
  formatPace,
} from "@/lib/zones";
import type { UserZonePreferences } from "@/types";
import Logo from "@/assets/logo.svg?react";

// ────────────────────────────────────────────────────────────────────────────
// Editorial atoms — short, local helpers that build the "training journal"
// vocabulary used throughout the page. Kept in-file so the HomePage stays
// self-contained and the rest of the app isn't polluted with one-shot styles.
// ────────────────────────────────────────────────────────────────────────────

/** Title used for every section heading. Italic sans display. */
function EditorialTitle({
  children,
  size = "lg",
}: {
  children: React.ReactNode;
  size?: "lg" | "xl";
}) {
  const cls = size === "xl" ? "text-[44px] md:text-6xl" : "text-3xl md:text-4xl";
  return (
    <h2
      className={`font-sans font-semibold italic leading-[1.05] tracking-tight ${cls}`}
    >
      {children}
    </h2>
  );
}

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
}

const RESEARCHERS: Researcher[] = [
  {
    name: "Stephen Seiler",
    contributionKey: "homepage:home.s04.researchers.seiler.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.seiler.citation",
      url: "https://pubmed.ncbi.nlm.nih.gov/16774644/",
    },
  },
  {
    name: "Véronique Billat",
    contributionKey: "homepage:home.s04.researchers.billat.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.billat.citation",
      url: "https://pubmed.ncbi.nlm.nih.gov/9927009/",
    },
  },
  {
    name: "Jack Daniels",
    contributionKey: "homepage:home.s04.researchers.daniels.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.daniels.citation",
    },
  },
  {
    name: "Arthur Lydiard",
    contributionKey: "homepage:home.s04.researchers.lydiard.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.lydiard.citation",
    },
  },
  {
    name: "Tim Noakes",
    contributionKey: "homepage:home.s04.researchers.noakes.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.noakes.citation",
    },
  },
  {
    name: "Wildor Hollmann & Alois Mader",
    contributionKey: "homepage:home.s04.researchers.cologne.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.cologne.citation",
    },
  },
  {
    name: "Oliver Faude",
    contributionKey: "homepage:home.s04.researchers.faude.contribution",
    source: {
      citationKey: "homepage:home.s04.researchers.faude.citation",
      url: "https://pubmed.ncbi.nlm.nih.gov/19402743/",
    },
  },
  {
    name: "Iñigo San Millán",
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

// ────────────────────────────────────────────────────────────────────────────
// HomePage
// ────────────────────────────────────────────────────────────────────────────

export function HomePage() {
  const { t } = useTranslation(["homepage", "common", "library"]);
  const pickLang = usePickLang();
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

  // ── Session of the week — one prominent pick distinct from the trio above.
  const sessionOfWeek = useMemo(() => {
    const pool = runWorkouts
      .filter(
        (w) =>
          (w.discipline ?? "running") === "running" &&
          (w.category === "threshold" || w.category === "vma_intervals"),
      )
      .sort((a, b) => a.id.localeCompare(b.id));
    if (pool.length === 0) return null;
    return pool[getISOWeek() % pool.length];
  }, [runWorkouts]);

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

  return (
    <div className="font-sans text-foreground">
      <SEOHead
        title={t("homepage:home.seoTitle")}
        description={seoDescription}
        canonical="/"
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
              <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                <Link to="/plan/new">{t("homepage:home.hero.ctaSecondary")}</Link>
              </Button>
            </div>

            {/* Stat row — every figure derived, including the trailing zero */}
            <div className="border-t border-foreground/15 pt-6 grid grid-cols-4 gap-4">
              <StatBlock
                value={String(totalSessions)}
                label={t("homepage:home.stats.sessions")}
              />
              <StatBlock
                value={String(prebuiltPlans.length)}
                label={`${t("homepage:home.stats.plansFrom")} ${
                  prebuiltPlans.find((p) => p.raceDistance === "5K") ? "5K" : ""
                } → ${
                  prebuiltPlans.find((p) => p.raceDistance === "marathon")
                    ? "marathon"
                    : prebuiltPlans[prebuiltPlans.length - 1]?.raceDistance ?? ""
                }`}
              />
              <StatBlock
                value={String(CALCULATORS.length)}
                label={t("homepage:home.stats.calculators")}
              />
              <StatBlock
                value="0"
                label={t("homepage:home.stats.trackers")}
                sub={t("homepage:home.stats.noAccount")}
              />
            </div>
          </div>

          {/* Right column — canonical polarised week reference */}
          <PolarisedChart />
        </div>
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

        <div className="mt-8 overflow-x-auto">
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

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {RESEARCHERS.map((r) => (
            <ResearcherCard key={r.name} researcher={r} t={t} />
          ))}
        </div>

        {/* Editor's note quote */}
        <blockquote className="mt-16 md:mt-20 max-w-2xl mx-auto text-center">
          <p className="font-sans italic text-xl md:text-2xl leading-[1.45]">
            {t("homepage:home.s04.quote")}
          </p>
          <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/55">
            — {t("homepage:home.s04.quoteAttr")}
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

        <div className="mt-10 divide-y divide-foreground/15 border-y border-foreground/15">
          {planRows.map(({ key, plan }) => (
            <PlanRow
              key={key}
              label={t(`homepage:home.s05.distance.${key}`)}
              plan={plan}
              t={t}
            />
          ))}
        </div>
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
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {CALCULATORS.map((c) => (
            <Link
              key={c.key}
              to={c.slug}
              className="group block border border-border bg-card hover:border-primary/40 hover:bg-accent/30 transition-colors p-3 sm:p-5 rounded-md flex items-center sm:block gap-2 sm:gap-0"
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
          ))}
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════
          §07 — Séance de la semaine (anatomie + bloc d'effort)
          ═══════════════════════════════════════════════════════════════════ */}
      {sessionOfWeek && (
        <>
          <section className="py-16 md:py-20">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-3">
              {t("homepage:home.s07.kicker")}
            </p>
            <EditorialTitle>
              «&nbsp;{pickLang(sessionOfWeek, "name")}&nbsp;»
            </EditorialTitle>
            <p className="mt-3 text-sm text-foreground/65 max-w-xl leading-relaxed">
              {pickLang(sessionOfWeek, "description")}
            </p>

            <div className="mt-8 max-w-2xl">
              <WorkoutCard workout={sessionOfWeek} expanded />
            </div>
          </section>
          <Divider />
        </>
      )}

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
              className="group border-b border-foreground/15 [&[open]>summary>svg]:rotate-180"
            >
              <summary className="flex items-center gap-6 py-5 cursor-pointer list-none hover:bg-accent/30 transition-colors px-2 -mx-2">
                <span className="font-mono text-[11px] tracking-[0.15em] text-foreground/50 w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-sans italic text-lg md:text-xl flex-1">
                  {t(`homepage:home.s09.q.${id}.q`)}
                </span>
                <ChevronDown className="size-4 text-foreground/40 transition-transform shrink-0" />
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
          <Button asChild variant="outline" size="lg" className="rounded-full px-6">
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

      <LandingFooter />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Landing-page footer — richer than the global one. Mirrors the magazine
// reference: brand + tagline on the left, four short columns on the right
// (product / science / project / legal), license + version on the bottom row.
// The global app footer is hidden on / by App.tsx's ConditionalFooter rule.
// ────────────────────────────────────────────────────────────────────────────

function LandingFooter() {
  const { t } = useTranslation(["homepage", "common"]);
  const year = new Date().getFullYear();
  const version = APP_VERSION;

  return (
    <footer className="relative w-screen left-1/2 -ml-[50vw] mt-8 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 md:gap-8">
          <div className="max-w-xs">
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-4"
              aria-label="Zoned — accueil"
            >
              <Logo className="w-10 h-5" />
              <span className="font-bold text-base">{t("common:app.name")}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("homepage:home.footer.tagline")}
            </p>
          </div>

          <FooterColumn
            title={t("homepage:home.footer.groups.product")}
            links={[
              { label: t("homepage:home.footer.product.library"), to: "/library" },
              { label: t("homepage:home.footer.product.plans"), to: "/plans" },
              { label: t("homepage:home.footer.product.calculators"), to: "/calculators" },
              { label: t("homepage:home.footer.product.routes"), to: "/routes" },
            ]}
          />
          <FooterColumn
            title={t("homepage:home.footer.groups.science")}
            links={[
              { label: t("homepage:home.footer.science.methodology"), to: "/methodology" },
              { label: t("homepage:home.footer.science.glossary"), to: "/glossary" },
              { label: t("homepage:home.footer.science.guides"), to: "/guides" },
            ]}
          />
          <FooterColumn
            title={t("homepage:home.footer.groups.project")}
            links={[
              { label: t("homepage:home.footer.project.about"), to: "/about" },
              {
                label: t("homepage:home.footer.project.github"),
                href: "https://github.com/alarboulletmarin/zoned",
              },
              { label: t("homepage:home.footer.project.changelog"), to: "/changelog" },
            ]}
          />
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
            {t("homepage:home.footer.license", { year })}
          </p>
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
            {t("homepage:home.footer.version", { version })}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; to?: string; href?: string }>;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground mb-3">
        {title}
      </p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <Link
                to={link.to}
                className="text-sm text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Package version is injected at build time by Vite via __APP_VERSION__.
// We fall back to "dev" when the constant is missing (eg. unit tests).
declare const __APP_VERSION__: string | undefined;
const APP_VERSION =
  typeof __APP_VERSION__ === "string" && __APP_VERSION__.length > 0
    ? __APP_VERSION__
    : "dev";

// ────────────────────────────────────────────────────────────────────────────
// Sub-components — kept in this file because nothing outside the landing
// uses them. Promoting them to /components would only add noise.
// ────────────────────────────────────────────────────────────────────────────

function Divider() {
  return <hr className="border-0 border-t border-foreground/15" />;
}

function StatBlock({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="font-sans italic text-3xl md:text-4xl leading-none">
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
  const max = Math.max(...Object.values(POLARISED_REFERENCE));
  const zoneNames: Record<ZoneNumber, string> = {
    1: t("home.hero.fig.zones.z1"),
    2: t("home.hero.fig.zones.z2"),
    3: t("home.hero.fig.zones.z3"),
    4: t("home.hero.fig.zones.z4"),
    5: t("home.hero.fig.zones.z5"),
    6: t("home.hero.fig.zones.z6"),
  };

  return (
    <div className="border border-border bg-card rounded-lg p-6 md:p-8">
      <p className="font-sans font-semibold italic text-2xl md:text-3xl leading-tight">
        {t("home.hero.fig.title")}
      </p>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {t("home.hero.fig.body")}
      </p>

      <div className="mt-7 space-y-2.5">
        {([1, 2, 3, 4, 5, 6] as const).map((zone) => {
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
                  className={`h-full ${ZONE_BAR_BG[zone]} rounded-sm transition-[width] duration-700 ease-out`}
                  style={{ width: `${(pct / max) * 100}%` }}
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
      <Button asChild variant="outline" size="sm" className="self-start">
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
    <article className="border-l-2 border-border pl-5 py-1">
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

function PlanRow({
  label,
  plan,
  t,
}: {
  label: string;
  plan: ReturnType<typeof getAllPrebuiltPlans>[number];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const phaseColors: Record<string, string> = {
    base: "bg-zone-2",
    build: "bg-zone-3",
    peak: "bg-zone-4",
    taper: "bg-zone-5",
    recovery: "bg-zone-1",
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_2fr_0.8fr] items-center gap-4 py-5">
      <p className="font-sans italic text-xl md:text-2xl">{label}</p>
      <p className="text-sm text-foreground/70">
        {plan.totalWeeks} {t("homepage:home.s05.weeks")}
      </p>
      <p className="text-sm text-foreground/70 hidden md:block">
        {plan.sessionsPerWeek} {t("homepage:home.s05.sessionsPerWeek")}
      </p>
      <div className="hidden md:flex h-2 overflow-hidden">
        {plan.phases.map((p, i) => {
          const span = p.endWeek - p.startWeek + 1;
          const pct = (span / plan.totalWeeks) * 100;
          return (
            <div
              key={i}
              className={phaseColors[p.phase] ?? "bg-foreground/20"}
              style={{ width: `${pct}%` }}
              title={`${p.phase} (${span}w)`}
            />
          );
        })}
      </div>
      <Button asChild variant="outline" size="sm" className="justify-self-end">
        <Link to={`/plan/prebuilt/${plan.slug}`}>
          {t("homepage:home.s05.choose")}
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
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


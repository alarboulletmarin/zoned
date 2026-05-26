import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, GithubIcon } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { useWorkouts, useTips } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import { ZONE_META, type ZoneNumber } from "@/types";
import { usePickLang } from "@/lib/i18n-utils";
import {
  computeLandingStats,
  pickWeeklyWorkouts,
  getISOWeek,
  estimateTSS,
  getWorkoutZones,
  EXPORT_FORMATS,
  SCHOOLS,
  type School,
} from "@/lib/landing-stats";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { articleMetadata } from "@/data/articles";
import { ZoneDetailModal } from "@/components/domain/ZoneDetailModal";

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
// SCHOOL_REFS uses real bibliography for each coach surfaced in §04. The
// referenced calculators map 1:1 to existing routes in App.tsx, so changing
// the list here changes both the count (§06 kicker) and the cards rendered.
// ────────────────────────────────────────────────────────────────────────────

const SCHOOL_REFS: Record<
  School,
  { name: string; year: number; tagKey: string; bibKey: string; descKey: string }
> = {
  seiler: {
    name: "Stephen Seiler",
    year: 2009,
    tagKey: "polarised",
    bibKey: "schoolSeilerBib",
    descKey: "schoolSeilerDesc",
  },
  daniels: {
    name: "Jack Daniels",
    year: 1998,
    tagKey: "vdot",
    bibKey: "schoolDanielsBib",
    descKey: "schoolDanielsDesc",
  },
  billat: {
    name: "Véronique Billat",
    year: 2001,
    tagKey: "vvo2",
    bibKey: "schoolBillatBib",
    descKey: "schoolBillatDesc",
  },
  coggan: {
    name: "Andrew Coggan",
    year: 2003,
    tagKey: "tss",
    bibKey: "schoolCogganBib",
    descKey: "schoolCogganDesc",
  },
};

// Glyph + slug pairs for the 9 calculators surfaced in §06. The total count
// drives the "neuf instruments" kicker — keep this list in sync with reality.
const CALCULATORS: Array<{ glyph: string; key: string; slug: string }> = [
  { glyph: "σ", key: "vdot", slug: "/calculators/vma" },
  { glyph: "W", key: "ftp", slug: "/calculators/ftp" },
  { glyph: "♥", key: "hrZones", slug: "/calculators/zones" },
  { glyph: "τ", key: "paceZones", slug: "/calculators/allures" },
  { glyph: "~", key: "css", slug: "/calculators/css" },
  { glyph: "Σ", key: "splits", slug: "/calculators/splits" },
  { glyph: "P", key: "predictor", slug: "/calculators/equivalence" },
  { glyph: "∫", key: "ageGraded", slug: "/calculators/age-graded" },
  { glyph: "◐", key: "whatIf", slug: "/calculators/what-if" },
];

// FAQ entries — point to existing articles so the answers always exist.
// "id" is an i18n key under common:pages.home.faq.*.
const FAQ_ENTRIES: Array<{ id: string; slug: string }> = [
  { id: "hrm", slug: "testing-vma" },
  { id: "export", slug: "faq" },
  { id: "custom", slug: "periodization" },
  { id: "free", slug: "faq" },
  { id: "devices", slug: "faq" },
];

// ────────────────────────────────────────────────────────────────────────────
// HomePage
// ────────────────────────────────────────────────────────────────────────────

export function HomePage() {
  const { t, i18n } = useTranslation(["homepage", "common", "library"]);
  const isEn = i18n.language?.startsWith("en") ?? false;
  const pickLang = usePickLang();
  const [selectedZone, setSelectedZone] = useState<ZoneNumber | null>(null);

  const { workouts: runWorkouts } = useWorkouts();
  const { workouts: cyclingWorkouts } = useCrossDisciplineWorkouts("cycling");
  const { workouts: swimWorkouts } = useCrossDisciplineWorkouts("swimming");
  const { workouts: strengthWorkouts } = useStrengthWorkouts();
  const { tip } = useTips();

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
  const articleCount = articleMetadata.length;

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

  // ── Volume number printed on the masthead. Resets every year so the issue
  // numbering stays bounded and matches the calendar (Vol.01 in 2026).
  const now = new Date();
  const volume = Math.max(1, now.getFullYear() - 2025);
  const issue = String(getISOWeek(now)).padStart(2, "0");

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
  const planRows = useMemo(() => {
    const order: Array<{ key: string; distance: string }> = [
      { key: "5K", distance: "5K" },
      { key: "10K", distance: "10K" },
      { key: "semi", distance: "semi" },
      { key: "marathon", distance: "marathon" },
      { key: "trail", distance: "trail" },
    ];
    return order
      .map(({ key, distance }) => {
        const plans = prebuiltPlans.filter((p) => p.raceDistance === distance);
        if (plans.length === 0) return null;
        // Pick the canonical plan for the distance: shortest duration first
        // (debutant), so the row reflects an honest entry point.
        const canonical = plans.reduce((a, b) =>
          a.totalWeeks < b.totalWeeks ? a : b,
        );
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
          HERO — masthead + headline + sidecar (Fig.01 distribution Seiler)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="pt-2 md:pt-8 pb-12 md:pb-20">
        {/* Masthead line — volume, issue, license */}
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-foreground/60 mb-10 md:mb-14 flex flex-wrap items-center gap-x-2">
          <span className="inline-block h-px w-10 bg-foreground/60 mr-2 align-middle" />
          <span>
            {t("homepage:home.masthead.volume")} {String(volume).padStart(2, "0")}
          </span>
          <span aria-hidden>·</span>
          <span>
            {t("homepage:home.masthead.issue")} {issue}
          </span>
          <span aria-hidden className="text-foreground/30">
            ◇
          </span>
          <span>{t("homepage:home.masthead.openSource")}</span>
          <span aria-hidden>·</span>
          <span>{t("homepage:home.masthead.local")}</span>
          <span aria-hidden>·</span>
          <span>{t("homepage:home.masthead.noAccount")}</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-start">
          {/* Left column — title + body + CTAs + stat row */}
          <div className="max-w-[640px]">
            <h1 className="font-sans font-semibold text-[40px] sm:text-6xl md:text-[68px] leading-[1.02] tracking-tight mb-8">
              {t("homepage:home.hero.head")}{" "}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={accentIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
                  className="italic"
                >
                  {accentWords[accentIndex]}
                </motion.span>
              </AnimatePresence>
              {t("homepage:home.hero.tail")}
            </h1>

            <p className="text-[15px] md:text-base leading-[1.65] text-foreground/75 max-w-[520px] mb-8">
              {t("homepage:home.hero.lead", {
                sessions: totalSessions,
                plans: prebuiltPlans.length,
                calculators: CALCULATORS.length,
              })}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-12">
              <Link
                to="/library"
                className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-3 text-sm font-medium hover:bg-foreground/85 transition-colors"
              >
                <ArrowRight className="size-4" />
                {t("homepage:home.hero.ctaPrimary")}
              </Link>
              <Link
                to="/plan/new"
                className="inline-flex items-center gap-2 border border-foreground/30 px-5 py-3 text-sm font-medium hover:bg-foreground/5 transition-colors"
              >
                {t("homepage:home.hero.ctaSecondary")}
              </Link>
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

          {/* Right column — Fig.01 polarised distribution */}
          <PolarisedChart
            zones={stats.zones}
            polarised={stats.polarised}
            totalMinutes={stats.totalMinutes}
          />
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {suggested.map((w) => (
              <SuggestedCard
                key={w.id}
                workoutId={w.id}
                discipline={w.discipline ?? "running"}
                name={pickLang(w, "name")}
                method={detectMethodLabel(w.name + " " + w.descriptionEn, isEn)}
                target={w.targetSystem}
                durationMin={Math.round(
                  (w.typicalDuration.min + w.typicalDuration.max) / 2,
                )}
                tss={estimateTSS(w)}
                level={
                  w.difficulty === "beginner"
                    ? 1
                    : w.difficulty === "intermediate"
                      ? 2
                      : w.difficulty === "advanced"
                        ? 3
                        : 4
                }
                zones={getWorkoutZones(w)}
                t={t}
              />
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

        <div className="mt-10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-foreground/20">
                <th className="text-left py-3 pr-4 font-normal w-20">
                  {t("homepage:home.s03.zone")}
                </th>
                <th className="text-left py-3 pr-4 font-normal">
                  {t("homepage:home.s03.name")}
                </th>
                <th className="text-left py-3 pr-4 font-normal w-24">
                  {t("homepage:home.s03.rpe")}
                </th>
                <th className="text-left py-3 pr-4 font-normal w-28">
                  {t("homepage:home.s03.lactate")}
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
              {([1, 2, 3, 4, 5, 6] as const).map((z) => (
                <ZoneRow
                  key={z}
                  zone={z}
                  label={pickLang(ZONE_META[z], "label")}
                  fcRange={ZONE_FC[z]}
                  rpe={ZONE_RPE[z]}
                  lactate={ZONE_LACTATE[z]}
                  benefit={pickLang(ZONE_META[z], "benefit")}
                  refPace={ZONE_PACE[z]}
                  onClick={() => setSelectedZone(z)}
                />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-right text-foreground/45">
          {t("homepage:home.s03.fig")}
        </p>
      </section>

      <ZoneDetailModal
        zone={selectedZone}
        zoneMeta={selectedZone ? ZONE_META[selectedZone] : null}
        open={selectedZone !== null}
        onOpenChange={(open) => !open && setSelectedZone(null)}
      />

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════
          §04 — Quatre écoles (counts dérivés depuis les workouts)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">

        <EditorialTitle>{t("homepage:home.s04.title")}</EditorialTitle>
        <p className="mt-3 text-sm text-foreground/65 max-w-xl leading-relaxed">
          {t("homepage:home.s04.body")}
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCHOOLS.map((s) => (
            <SchoolCard
              key={s}
              school={s}
              name={SCHOOL_REFS[s].name}
              year={SCHOOL_REFS[s].year}
              tag={t(`homepage:home.s04.tags.${SCHOOL_REFS[s].tagKey}`)}
              desc={t(`homepage:home.s04.${SCHOOL_REFS[s].descKey}`)}
              bib={t(`homepage:home.s04.${SCHOOL_REFS[s].bibKey}`)}
              count={stats.bySchool[s]}
              t={t}
            />
          ))}
        </div>

        {/* Editor's note quote */}
        <blockquote className="mt-16 md:mt-20 max-w-2xl mx-auto text-center">
          <p className="font-sans italic text-xl md:text-2xl leading-[1.45]">
            {t("homepage:home.s04.quote")}
          </p>
          <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/55">
            — {t("homepage:home.s04.quoteAttr", {
              vol: String(volume).padStart(2, "0"),
            })}
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
        <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/45">
          {t("homepage:home.s05.fig")}
        </p>
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

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border-t border-l border-foreground/15">
          {CALCULATORS.map((c, i) => (
            <Link
              key={c.key}
              to={c.slug}
              className="group relative border-r border-b border-foreground/15 p-6 hover:bg-foreground/5 transition-colors"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[11px] tracking-[0.15em] text-foreground/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden
                  className="font-sans text-2xl text-foreground/60 group-hover:text-foreground transition-colors"
                >
                  {c.glyph}
                </span>
              </div>
              <h3 className="font-sans italic text-xl mt-8">
                {t(`homepage:home.s06.tools.${c.key}.name`)}
              </h3>
              <p className="text-xs text-foreground/55 mt-1">
                {t(`homepage:home.s06.tools.${c.key}.sub`)}
              </p>
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

            <EditorialTitle>
              «&nbsp;{pickLang(sessionOfWeek, "name")}&nbsp;»
            </EditorialTitle>
            <p className="mt-3 text-sm text-foreground/65 max-w-xl leading-relaxed">
              {pickLang(sessionOfWeek, "description")}
            </p>

            <div className="mt-10 border border-foreground/15 p-6 md:p-8">
              <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-foreground/55 flex flex-wrap gap-x-3 gap-y-1 mb-6">
                <span>{t(`library:disciplines.${sessionOfWeek.discipline ?? "running"}`, sessionOfWeek.discipline ?? "running")}</span>
                <span aria-hidden>·</span>
                <span>{t(`library:categories.${sessionOfWeek.category}`)}</span>
                <span aria-hidden>·</span>
                <span>{sessionOfWeek.id}</span>
              </div>

              <h3 className="font-sans italic text-2xl md:text-3xl mb-6">
                {pickLang(sessionOfWeek, "name")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
                <SessionProfile workout={sessionOfWeek} />
                <div className="space-y-6">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/55 mb-1">
                      {t("homepage:home.s07.target")}
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {pickLang(ZONE_META[getWorkoutZones(sessionOfWeek)[0] ?? 4], "benefit")}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/55 mb-1">
                      {t("homepage:home.s07.metrics")}
                    </p>
                    <SessionMetrics workout={sessionOfWeek} t={t} />
                  </div>
                  <Link
                    to={`/workout/${sessionOfWeek.id}`}
                    className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs font-medium hover:bg-foreground/85 transition-colors"
                  >
                    <ArrowRight className="size-3.5" />
                    {t("homepage:home.s07.open")}
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <Divider />
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          §08 — Éthos (section sombre inverse) — 4 chiffres factuels
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="-mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-16 md:py-24 bg-foreground text-background">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16">
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
          §09 — FAQ (5 questions liées à des articles existants)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <EditorialTitle>{t("homepage:home.s09.title")}</EditorialTitle>

        <ul className="mt-10 border-y border-foreground/15">
          {FAQ_ENTRIES.map((q, i) => (
            <li key={q.id} className="border-b border-foreground/15 last:border-b-0">
              <Link
                to={`/learn/${q.slug}`}
                className="flex items-baseline gap-6 py-4 hover:bg-foreground/5 transition-colors px-2 -mx-2"
              >
                <span className="font-mono text-[11px] tracking-[0.15em] text-foreground/50 w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-sans italic text-lg md:text-xl flex-1">
                  {t(`homepage:home.s09.q.${q.id}`)}
                </span>
                <ArrowRight className="size-4 text-foreground/40" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-foreground/55">
          {t("homepage:home.s09.more", { count: articleCount })}{" "}
          <Link to="/learn" className="underline underline-offset-4">
            {t("homepage:home.s09.moreLink")}
          </Link>
        </p>
      </section>

      {/* Optional tip — only shows when one is available for the day */}
      {tip && (
        <>
          <Divider />
          <section className="py-10">
            <div className="flex items-baseline gap-6">
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50">
                {t("homepage:home.tip")}
              </span>
              <p className="font-sans italic text-base md:text-lg flex-1">
                {pickLang(tip, "content")}
              </p>
            </div>
          </section>
        </>
      )}

      <Divider />

      {/* ═══════════════════════════════════════════════════════════════════
          CTA final — "Commencer maintenant"
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 text-center">
        <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-foreground/55 mb-8">
          <span className="inline-block h-px w-10 bg-foreground/55 align-middle mr-3" />
          {t("homepage:home.cta.kicker")}
          <span className="inline-block h-px w-10 bg-foreground/55 align-middle ml-3" />
        </p>
        <h2 className="font-sans italic text-3xl md:text-5xl leading-[1.1] max-w-3xl mx-auto">
          {t("homepage:home.cta.line1")}
          <br />
          {t("homepage:home.cta.line2")}
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/library"
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/85 transition-colors"
          >
            <ArrowRight className="size-4" />
            {t("homepage:home.cta.primary")}
          </Link>
          <a
            href="https://github.com/alarboulletmarin/zoned"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            {t("homepage:home.cta.secondary")}
            <GithubIcon className="size-4" />
          </a>
        </div>
      </section>
    </div>
  );
}

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

function PolarisedChart({
  zones,
  polarised,
  totalMinutes,
}: {
  zones: { zone: ZoneNumber; share: number }[];
  polarised: { low: number; mid: number; high: number };
  totalMinutes: number;
}) {
  const { t } = useTranslation("homepage");
  const max = Math.max(...zones.map((z) => z.share));
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  // Crude TSS aggregate: ~1 TSS per IF²×minute. The figure is illustrative,
  // it's there to give the "FIG.01" caption a real value to print.
  const tssTotal = Math.round(totalMinutes * 0.7);

  return (
    <div className="border border-foreground/15 p-6 md:p-8 bg-foreground/[0.02]">
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/55">
        {t("home.hero.fig.title")}
      </p>
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/45">
        {t("home.hero.fig.attr")}
      </p>

      <div className="mt-8 space-y-3.5">
        {zones.map(({ zone, share }) => (
          <div key={zone} className="flex items-center gap-4">
            <span className="font-mono text-[11px] tracking-wider text-foreground/65 w-6">
              Z{zone}
            </span>
            <div className="flex-1 h-2 bg-foreground/[0.06]">
              <div
                className={`h-full ${ZONE_BAR_BG[zone]}`}
                style={{
                  width: `${max > 0 ? (share / max) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="font-mono text-[11px] text-foreground/65 w-10 text-right tabular-nums">
              {(share * 100).toFixed(share < 0.005 ? 1 : 0)}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-dashed border-foreground/20 flex justify-between font-mono text-[11px] tracking-wider text-foreground/65">
        <span>
          {t("home.hero.fig.totalLabel")} {h}
          {t("home.hero.fig.hourShort")} {String(m).padStart(2, "0")}
          {t("home.hero.fig.minShort")}
        </span>
        <span>TSS {tssTotal.toLocaleString()}</span>
      </div>

      <p className="mt-4 font-sans italic text-xs text-foreground/60 leading-relaxed">
        {t("home.hero.fig.caption", {
          low: Math.round(polarised.low * 100),
          high: Math.round(polarised.high * 100),
        })}
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
    <div className="py-8 md:py-0 md:px-8 first:md:pl-0 last:md:pr-0">
      <p className="font-mono text-[11px] tracking-[0.15em] text-foreground/50 mb-3">
        {num}
      </p>
      <h3 className="font-sans italic text-2xl mb-3">{title}</h3>
      <p className="text-sm leading-[1.65] text-foreground/75 mb-4">{body}</p>
      <Link
        to={to}
        className="font-sans italic text-sm underline underline-offset-4 hover:text-foreground/80"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

function SuggestedCard({
  workoutId,
  discipline,
  name,
  method,
  target,
  durationMin,
  tss,
  level,
  zones,
  t,
}: {
  workoutId: string;
  discipline: string;
  name: string;
  method: string;
  target: string;
  durationMin: number;
  tss: number;
  level: number;
  zones: ZoneNumber[];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const discIcon: Record<string, string> = {
    running: "↗",
    cycling: "⌀",
    swimming: "≋",
  };
  return (
    <Link
      to={`/workout/${workoutId}`}
      className="block border border-foreground/15 p-5 hover:bg-foreground/[0.03] transition-colors group"
    >
      <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.15em] uppercase text-foreground/55">
        <span className="flex items-center gap-2">
          <span aria-hidden className="text-foreground/70">
            {discIcon[discipline] ?? "•"}
          </span>
          {t(`library:disciplines.${discipline}`, discipline)}
        </span>
        <span className="text-foreground/45">{method}</span>
      </div>
      <h3 className="font-sans italic text-lg leading-tight mt-3 group-hover:text-foreground/90">
        {name}
      </h3>
      <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-foreground/40 mt-1">
        {target.replace(/_/g, " ")}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
        <Metric label={t("homepage:home.s02.dur")} value={`${durationMin}'`} />
        <Metric label={t("homepage:home.s02.tss")} value={String(tss)} />
        <Metric
          label={t("homepage:home.s02.lvl")}
          value={"★".repeat(level) + "☆".repeat(Math.max(0, 4 - level))}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-1">
        {zones.map((z) => (
          <span
            key={z}
            className={`font-mono text-[10px] tracking-wider px-1.5 py-0.5 ${ZONE_CHIP_BG[z]}`}
          >
            Z{z}
          </span>
        ))}
      </div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-foreground/45">
        {label}
      </p>
      <p className="font-mono text-sm text-foreground tabular-nums mt-0.5">
        {value}
      </p>
    </div>
  );
}

// ── §03 zone metadata. Numeric ranges aren't in ZONE_META so they live here;
// they describe the model, not arbitrary copy. Kept as pure constants.
const ZONE_FC: Record<ZoneNumber, string> = {
  1: "< 68% FCmax",
  2: "68–78% FCmax",
  3: "78–87% FCmax",
  4: "87–93% FCmax",
  5: "93–97% FCmax",
  6: "> 97% FCmax",
};
const ZONE_RPE: Record<ZoneNumber, string> = {
  1: "1–2 / 10",
  2: "3–4 / 10",
  3: "5–6 / 10",
  4: "7 / 10",
  5: "8–9 / 10",
  6: "10 / 10",
};
const ZONE_LACTATE: Record<ZoneNumber, string> = {
  1: "< 1.5",
  2: "1.5–2.0",
  3: "2.0–3.0",
  4: "3.0–4.5",
  5: "4.5–7.0",
  6: "> 7.0",
};
const ZONE_PACE: Record<ZoneNumber, string> = {
  1: "8:30/km",
  2: "6:30/km",
  3: "5:30/km",
  4: "4:45/km",
  5: "4:00/km",
  6: "3:20/km",
};

function ZoneRow({
  zone,
  label,
  fcRange,
  rpe,
  lactate,
  benefit,
  refPace,
  onClick,
}: {
  zone: ZoneNumber;
  label: string;
  fcRange: string;
  rpe: string;
  lactate: string;
  benefit: string;
  refPace: string;
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
          {fcRange}
        </p>
      </td>
      <td className="py-5 pr-4 font-mono text-xs text-foreground/70 tabular-nums">
        {rpe}
      </td>
      <td className="py-5 pr-4 font-mono text-xs text-foreground/70 tabular-nums">
        {lactate}
      </td>
      <td className="py-5 pr-4 text-sm leading-snug text-foreground/80">
        {benefit}
      </td>
      <td className="py-5 pl-4 text-right font-mono text-xs text-foreground/70 tabular-nums">
        {refPace}
      </td>
    </tr>
  );
}

function SchoolCard({
  name,
  year,
  tag,
  desc,
  bib,
  count,
  school,
  t,
}: {
  name: string;
  year: number;
  tag: string;
  desc: string;
  bib: string;
  count: number;
  school: School;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <article className="border border-foreground/15 p-6 md:p-7 flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/55">
          {t("homepage:home.s04.schoolLabel")} · {year}
        </p>
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase bg-foreground/8 px-2 py-1">
          {tag}
        </span>
      </div>
      <h3 className="font-sans italic text-2xl mt-3">{name}</h3>
      <p className="text-sm leading-[1.6] text-foreground/75 mt-3 flex-1">
        {desc}
      </p>
      <div className="mt-6 pt-4 border-t border-dashed border-foreground/20 flex items-baseline justify-between gap-4">
        <p className="font-sans italic text-xs text-foreground/55 leading-snug">
          {bib}
        </p>
        {count > 0 && (
          <Link
            to={`/library?q=${school}`}
            className="font-sans italic text-sm shrink-0 underline underline-offset-4 hover:text-foreground/80"
          >
            {count} {t("homepage:home.s04.sessions")} →
          </Link>
        )}
      </div>
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
      <Link
        to={`/plan/prebuilt/${plan.slug}`}
        className="font-sans italic text-sm justify-self-end underline underline-offset-4 hover:text-foreground/80"
      >
        {t("homepage:home.s05.choose")} →
      </Link>
    </div>
  );
}

function SessionProfile({
  workout,
}: {
  workout: ReturnType<typeof getAllPrebuiltPlans>[number] extends infer _
    ? import("@/types").WorkoutTemplate
    : never;
}) {
  // Build a horizontal effort profile from main set blocks. Each block becomes
  // a bar, height = zone level, width proportional to durationMin × repetitions.
  const blocks = (workout.mainSetTemplate ?? []).filter((b) => b.zone);
  if (blocks.length === 0) {
    return (
      <div className="h-32 border-t border-dashed border-foreground/20 flex items-end justify-center text-xs text-foreground/40 font-mono">
        no profile
      </div>
    );
  }
  const totalUnits = blocks.reduce(
    (s, b) => s + (b.durationMin ?? 1) * (b.repetitions ?? 1) * (b.sets ?? 1),
    0,
  );
  return (
    <div>
      <div className="h-32 flex items-end gap-0.5">
        {blocks.map((b, i) => {
          const z = parseInt(b.zone?.replace(/\D/g, "") ?? "1", 10) as ZoneNumber;
          const units = (b.durationMin ?? 1) * (b.repetitions ?? 1) * (b.sets ?? 1);
          const width = totalUnits > 0 ? (units / totalUnits) * 100 : 0;
          const height = 25 + z * 12; // 37%..97%
          return (
            <div
              key={i}
              className={`${ZONE_BAR_BG[z]} opacity-90`}
              style={{ width: `${width}%`, height: `${height}%` }}
              title={`Z${z} · ${units}'`}
            />
          );
        })}
      </div>
      <p className="mt-2 font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/45">
        FIG.04 — {workout.id}
      </p>
    </div>
  );
}

function SessionMetrics({
  workout,
  t,
}: {
  workout: import("@/types").WorkoutTemplate;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const mid = Math.round(
    (workout.typicalDuration.min + workout.typicalDuration.max) / 2,
  );
  const tss = estimateTSS(workout);
  const zones = getWorkoutZones(workout);
  const topZone = zones[zones.length - 1] ?? 4;
  const level =
    workout.difficulty === "beginner"
      ? 1
      : workout.difficulty === "intermediate"
        ? 2
        : workout.difficulty === "advanced"
          ? 3
          : 4;
  return (
    <div className="grid grid-cols-4 gap-3">
      <Metric label={t("homepage:home.s07.dur")} value={`${mid}'`} />
      <Metric label="TSS" value={String(tss)} />
      <Metric label={t("homepage:home.s07.zone")} value={`Z${topZone}`} />
      <Metric
        label={t("homepage:home.s07.lvl")}
        value={"★".repeat(level) + "☆".repeat(Math.max(0, 4 - level))}
      />
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

/** Coarse method label inferred from a workout's text. Kept extremely small
 *  because the workout schema doesn't carry a structured "method" field yet —
 *  improving this is on the to-do list, but a regex here is honest and works
 *  with the existing JSON. */
function detectMethodLabel(haystack: string, isEn: boolean): string {
  if (/billat|30\s*\/\s*30|vvo2/i.test(haystack)) return "Billat · 30/30";
  if (/daniels|vdot|t-?pace/i.test(haystack)) return isEn ? "Daniels · T-pace" : "Daniels · T-pace";
  if (/coggan|ftp|tss/i.test(haystack)) return "Coggan · FTP";
  if (/seiler|polaris/i.test(haystack)) return "Seiler · 80/20";
  if (/css/i.test(haystack)) return "CSS · Pyramide";
  return isEn ? "Open" : "Libre";
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RotateCcw, ChevronDown } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { useWorkouts } from "@/hooks";
import { usePlans } from "@/hooks/usePlans";
import { useAppStats } from "@/hooks/useAppStats";
import { usePickLang } from "@/lib/i18n-utils";
import {
  getWorkoutDuration,
  formatDurationMinutes,
} from "@/components/visualization";
import { getWorkoutZoneMinutes } from "@/lib/landing-stats";
import { getDominantZone } from "@/types";
import type { WorkoutTemplate, ZoneNumber } from "@/types";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────────
// Zone color classes — Tailwind needs static class names so we map explicitly
// (see CLAUDE.md: interpolated `bg-zone-${n}` is silently dropped by the
// production build).
// ────────────────────────────────────────────────────────────────────────────
const ZONE_BAR_BG: Record<ZoneNumber, string> = {
  1: "bg-zone-1",
  2: "bg-zone-2",
  3: "bg-zone-3",
  4: "bg-zone-4",
  5: "bg-zone-5",
  6: "bg-zone-6",
};

const ZONES: readonly ZoneNumber[] = [1, 2, 3, 4, 5, 6];

/** Duration presets offered by the "Aujourd'hui" module, in minutes. */
const DURATIONS = [30, 45, 60, 90] as const;

/**
 * Illustrative 12-week volume progression — a teaching example of what a
 * generated plan looks like (semi-marathon, 4 sessions/week → 48 sessions
 * over 12 weeks), not a measurement of any specific real plan. Reused
 * identically in the "Préparer une course" panel and the "02 · plans" tile,
 * mirroring how the design repeats the same figure in both spots. Compare
 * to `POLARISED_REFERENCE`-style teaching values used elsewhere in the app.
 */
const PROGRESSION_WEEKS: ReadonlyArray<{ pct: number; zone: ZoneNumber }> = [
  { pct: 52, zone: 2 },
  { pct: 58, zone: 2 },
  { pct: 66, zone: 2 },
  { pct: 44, zone: 1 },
  { pct: 72, zone: 2 },
  { pct: 80, zone: 4 },
  { pct: 88, zone: 4 },
  { pct: 56, zone: 1 },
  { pct: 96, zone: 4 },
  { pct: 100, zone: 5 },
  { pct: 70, zone: 5 },
  { pct: 38, zone: 1 },
];

/** "30" -> "30 min" / "1 h", "90" -> "1 h 30" / "1h30". */
function formatChipDuration(minutes: number, isEn: boolean): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (isEn) return m === 0 ? `${h}h` : `${h}h${m}`;
  return m === 0 ? `${h} h` : `${h} h ${m}`;
}

// ────────────────────────────────────────────────────────────────────────────
// HomePage — direction "2a, Accueil-manifeste": a duration → session finder
// above the fold, then an editorial manifesto (library / plans / calculators
// / method) backed by real catalogue counts.
// ────────────────────────────────────────────────────────────────────────────

export function HomePage() {
  const { t, i18n } = useTranslation(["homepage", "library", "common"]);
  const pickLang = usePickLang();
  const isEn = i18n.language?.startsWith("en") ?? false;
  const stats = useAppStats();
  const { workouts: runWorkouts, isLoading: workoutsLoading } = useWorkouts();
  const { plans: userPlans } = usePlans();
  const hasPlans = userPlans.length > 0;

  // ── "Aujourd'hui" — duration chips drive a real filtered suggestion,
  // closest-duration-first over the running catalogue. ─────────────────────
  const [selectedDuration, setSelectedDuration] = useState<number>(45);
  const [cursor, setCursor] = useState(0);

  const candidates = useMemo(() => {
    if (runWorkouts.length === 0) return [];
    return [...runWorkouts]
      .sort(
        (a, b) =>
          Math.abs(getWorkoutDuration(a) - selectedDuration) -
          Math.abs(getWorkoutDuration(b) - selectedDuration),
      )
      .slice(0, 6);
  }, [runWorkouts, selectedDuration]);

  useEffect(() => setCursor(0), [selectedDuration]);

  const current =
    candidates.length > 0 ? (candidates[cursor % candidates.length] ?? null) : null;
  const canRefresh = candidates.length > 1;
  const refresh = () => {
    if (!canRefresh) return;
    setCursor((c) => (c + 1) % candidates.length);
  };
  const resultEyebrow = t("homepage:home.today.resultEyebrow", {
    duration: formatChipDuration(selectedDuration, isEn),
  });

  // ── "01 · la bibliothèque" — real dominant-zone histogram over the
  // running catalogue (not invented). ───────────────────────────────────────
  const zoneDistribution = useMemo(() => {
    const counts: Record<ZoneNumber, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const w of runWorkouts) counts[getDominantZone(w)]++;
    return ZONES.map((zone) => ({ zone, count: counts[zone] }));
  }, [runWorkouts]);

  const seoDescription = t("common:pages.home.seoDescription", {
    count: stats.workouts || 200,
  });

  // WebApplication descriptor only — the FAQ accordion isn't part of this
  // direction, so we don't ship an FAQPage schema with nothing visible to
  // back it.
  const homepageJsonLd: Record<string, unknown>[] = [
    {
      "@type": "WebApplication",
      name: "Zoned",
      url: "https://zoned.run",
      applicationCategory: "SportsApplication",
      operatingSystem: "Web, iOS, Android",
      browserRequirements: "Requires JavaScript. Works offline as a PWA.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
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
          Entry module — "Aujourd'hui" (functional) / "Préparer une course"
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="today" className="pt-2 md:pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-filet">
          {/* ── Aujourd'hui ── */}
          <div className="p-5 sm:p-6 md:p-9 border-b md:border-b-0 md:border-r border-filet">
            <p className="font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              {t("homepage:home.today.eyebrow")}
            </p>
            <h1 className="font-sans font-bold uppercase leading-[0.92] tracking-[-0.05em] text-[32px] sm:text-[38px] md:text-[52px] mt-3">
              {t("homepage:home.today.title")}
            </h1>
            <p className="mt-3 text-[15px] md:text-base leading-[1.55] text-foreground/80 max-w-[38ch]">
              {t("homepage:home.today.lead")}
            </p>

            {/* Duration chips */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 mt-6">
              {DURATIONS.map((d) => {
                const active = d === selectedDuration;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDuration(d)}
                    aria-pressed={active}
                    className={cn(
                      "border-2 px-4 py-3.5 md:py-4 font-bold text-base md:text-lg uppercase tracking-tight transition-colors",
                      active
                        ? "border-transparent bg-accent-acid text-ink"
                        : "border-foreground bg-transparent hover:bg-secondary",
                    )}
                  >
                    {formatChipDuration(d, isEn)}
                  </button>
                );
              })}
            </div>

            {/* Suggestion */}
            <div className="mt-6" aria-live="polite">
              {candidates.length === 0 ? (
                <div className="border border-dashed border-border p-5 text-sm text-muted-foreground">
                  {workoutsLoading
                    ? t("homepage:home.today.loading")
                    : t("homepage:home.today.empty")}
                </div>
              ) : (
                <>
                  {/* Desktop: single primary card */}
                  <div className="hidden md:block">
                    {current && (
                      <SuggestionCard
                        workout={current}
                        pickLang={pickLang}
                        t={t}
                        variant="primary"
                        resultEyebrow={resultEyebrow}
                        onRefresh={refresh}
                        canRefresh={canRefresh}
                      />
                    )}
                  </div>

                  {/* Mobile: horizontal-scroll comparison of up to 4 matches */}
                  <div className="md:hidden">
                    <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5 sm:-mx-6 sm:px-6">
                      {candidates.slice(0, 4).map((w, i) => (
                        <div key={w.id} className="shrink-0 w-[258px]">
                          <SuggestionCard
                            workout={w}
                            pickLang={pickLang}
                            t={t}
                            variant={i === 0 ? "primary" : "compact"}
                            resultEyebrow={i === 0 ? resultEyebrow : undefined}
                            onRefresh={i === 0 ? refresh : undefined}
                            canRefresh={i === 0 ? canRefresh : false}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
                      {t("homepage:home.today.mobileHint")}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Préparer une course ── */}
          <div className="p-5 sm:p-6 md:p-9 bg-foreground text-background">
            <p className="font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-background/60">
              {t("homepage:home.prepare.eyebrow")}
            </p>
            <h2 className="font-sans font-bold uppercase leading-[0.92] tracking-[-0.05em] text-[28px] sm:text-[34px] md:text-[52px] mt-3">
              {t("homepage:home.prepare.title")}
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-[1.55] text-background/85 max-w-[38ch]">
              {t("homepage:home.prepare.lead")}
            </p>

            <div className="grid grid-cols-2 gap-x-5 gap-y-4 mt-6">
              <PrepareField
                label={t("homepage:home.prepare.fields.goal")}
                value={t("homepage:home.prepare.fields.goalValue")}
              />
              <PrepareField
                label={t("homepage:home.prepare.fields.date")}
                value={t("homepage:home.prepare.fields.dateValue")}
                mono
              />
              <PrepareField
                label={t("homepage:home.prepare.fields.sessions")}
                value={t("homepage:home.prepare.fields.sessionsValue")}
                mono
              />
              <PrepareField
                label={t("homepage:home.prepare.fields.volume")}
                value={t("homepage:home.prepare.fields.volumeValue")}
                mono
              />
            </div>

            <div className="mt-6">
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-background/60">
                {t("homepage:home.prepare.outcomeLabel")}
              </p>
              <TwelveWeekChart className="mt-3 h-12 md:h-14" />
              <p className="mt-2.5 font-mono text-[11px] text-background/70">
                {t("homepage:home.prepare.outcomeStats")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <Link
                to={hasPlans ? "/plans" : "/plan/new/assisted"}
                className="inline-flex items-center bg-background text-foreground border-2 border-background px-5 py-3.5 font-mono text-xs font-bold tracking-wide uppercase hover:bg-background/90 transition-colors"
              >
                {t(
                  hasPlans
                    ? "homepage:home.prepare.ctaPrimaryHasPlans"
                    : "homepage:home.prepare.ctaPrimary",
                )}
              </Link>
              <Link
                to="/plan/new/prebuilt"
                className="font-mono text-xs tracking-[0.08em] uppercase text-background/70 underline underline-offset-4 hover:text-background transition-colors"
              >
                {t("homepage:home.prepare.ctaSecondary", { count: stats.plans })}
              </Link>
            </div>
          </div>
        </div>

        {/* Stat line */}
        <div className="border-t-2 border-foreground px-5 sm:px-6 md:px-9 py-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] sm:text-[11px] tracking-[0.1em] uppercase text-muted-foreground">
          <span>
            {t("homepage:home.statline.text", {
              sessions: stats.runningWorkouts,
              plans: stats.plans,
              calculators: stats.calculators,
            })}
          </span>
          <a
            href="#manifesto"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            {t("homepage:home.statline.cta")}
            <ChevronDown className="size-3.5" />
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Manifeste — le projet, puis 4 sections avec chiffres réels
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="manifesto" className="pt-14 md:pt-20">
        <p className="font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
          {t("homepage:home.manifesto.eyebrow")}
        </p>
        <h2 className="font-sans font-bold uppercase leading-[0.94] tracking-[-0.05em] text-[30px] sm:text-[36px] md:text-[56px] mt-3 max-w-[18ch]">
          {t("homepage:home.manifesto.title")}
        </h2>
        <p className="mt-5 text-base md:text-lg leading-[1.6] text-foreground/80 max-w-[64ch]">
          {t("homepage:home.manifesto.bodyBefore")}
          <em className="not-italic font-semibold">
            {t("homepage:home.manifesto.bodyEmphasis")}
          </em>
          {t("homepage:home.manifesto.bodyAfter")}
        </p>

        {/* 4-tile grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-filet mt-10">
          <ManifestoTile
            kicker={t("homepage:home.sections.library.kicker")}
            count={t("homepage:home.sections.library.count", {
              count: stats.runningWorkouts,
            })}
            title={t("homepage:home.sections.library.title")}
            body={t("homepage:home.sections.library.body")}
            cta={t("homepage:home.sections.library.cta")}
            to="/library"
            className="border-b md:border-r border-filet"
          >
            <div className="flex h-3 mt-5">
              {zoneDistribution.map(({ zone, count }) =>
                count > 0 ? (
                  <div
                    key={zone}
                    className={ZONE_BAR_BG[zone]}
                    style={{
                      width: `${(count / Math.max(stats.runningWorkouts, 1)) * 100}%`,
                    }}
                  />
                ) : null,
              )}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 font-mono text-[10px] text-muted-foreground">
              {zoneDistribution.map(({ zone, count }) => (
                <span key={zone}>
                  {count} Z{zone}
                </span>
              ))}
            </div>
          </ManifestoTile>

          <ManifestoTile
            kicker={t("homepage:home.sections.plans.kicker")}
            count={t("homepage:home.sections.plans.count", { count: stats.plans })}
            title={t("homepage:home.sections.plans.title")}
            body={t("homepage:home.sections.plans.body")}
            cta={t("homepage:home.sections.plans.cta", { count: stats.plans })}
            to="/plans"
            className="border-b border-filet"
          >
            <div className="flex flex-col mt-4 text-sm text-foreground/75">
              <p className="py-2 border-t border-foreground/15">
                {t("homepage:home.sections.plans.line1")}
              </p>
              <p className="py-2 border-t border-b border-foreground/15">
                {t("homepage:home.sections.plans.line2")}
              </p>
            </div>
            <TwelveWeekChart className="mt-4 h-10 md:h-12" />
          </ManifestoTile>

          <ManifestoTile
            kicker={t("homepage:home.sections.calculators.kicker")}
            count={t("homepage:home.sections.calculators.count", {
              count: stats.calculators,
            })}
            title={t("homepage:home.sections.calculators.title")}
            body={t("homepage:home.sections.calculators.body", {
              sessions: stats.runningWorkouts,
            })}
            cta={t("homepage:home.sections.calculators.cta")}
            to="/calculators/vma"
            className="border-b md:border-r md:border-b-0 border-filet"
          >
            <div className="flex gap-6 mt-5 font-mono">
              <ExampleStat
                value={t("homepage:home.sections.calculators.example.vma")}
                label={t("homepage:home.sections.calculators.example.vmaLabel")}
              />
              <ExampleStat
                value={t("homepage:home.sections.calculators.example.pace10k")}
                label={t("homepage:home.sections.calculators.example.pace10kLabel")}
              />
              <ExampleStat
                value={t("homepage:home.sections.calculators.example.semi")}
                label={t("homepage:home.sections.calculators.example.semiLabel")}
              />
            </div>
          </ManifestoTile>

          <ManifestoTile
            kicker={t("homepage:home.sections.method.kicker")}
            count={t("homepage:home.sections.method.count", {
              sources: stats.scienceSources,
              terms: stats.glossaryTerms,
            })}
            title={t("homepage:home.sections.method.title")}
            body={t("homepage:home.sections.method.body")}
            cta={t("homepage:home.sections.method.cta")}
            to="/methodology"
          >
            <div className="flex flex-col mt-4 text-sm text-foreground/75">
              <p className="py-2 border-t border-foreground/15">
                {t("homepage:home.sections.method.line1")}
              </p>
              <p className="py-2 border-t border-foreground/15">
                {t("homepage:home.sections.method.line2")}
              </p>
              <p className="py-2 border-t border-b border-foreground/15">
                {t("homepage:home.sections.method.line3")}
              </p>
            </div>
          </ManifestoTile>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Ce que Zoned ne fait pas — inverse section, une seule répétition
          assumée (l'appel de fin ramène au module "Aujourd'hui")
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-screen left-1/2 -ml-[50vw] mt-16 md:mt-20 py-14 md:py-16 bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <p className="font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
            {t("homepage:home.notDo.eyebrow")}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 mt-6">
            {(["account", "notification", "server", "subscription"] as const).map(
              (key) => (
                <div key={key}>
                  <p className="font-sans font-bold uppercase leading-[1.05] tracking-[-0.03em] text-lg md:text-[26px]">
                    {t(`homepage:home.notDo.items.${key}.title`)}
                  </p>
                  <p className="mt-2.5 text-sm leading-[1.55] text-foreground/75">
                    {t(`homepage:home.notDo.items.${key}.body`)}
                  </p>
                </div>
              ),
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-10">
            <a
              href="#today"
              className="inline-flex items-center bg-accent-acid text-ink px-5 py-3.5 font-mono text-xs font-bold tracking-wide uppercase hover:bg-accent-acid/90 transition-colors"
            >
              {t("homepage:home.notDo.ctaPrimary")}
            </a>
            <Link
              to="/library"
              className="font-mono text-xs tracking-[0.08em] uppercase text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              {t("homepage:home.notDo.ctaSecondary", {
                count: stats.runningWorkouts,
              })}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

/** Real suggested workout card, driven by the duration chips. Same markup
 *  for the desktop "primary" card and the mobile comparison scroller —
 *  responsive variants of one component, not two separate implementations. */
function SuggestionCard({
  workout,
  pickLang,
  t,
  variant,
  resultEyebrow,
  onRefresh,
  canRefresh,
}: {
  workout: WorkoutTemplate;
  pickLang: ReturnType<typeof usePickLang>;
  t: ReturnType<typeof useTranslation>["t"];
  variant: "primary" | "compact";
  resultEyebrow?: string;
  onRefresh?: () => void;
  canRefresh?: boolean;
}) {
  const duration = getWorkoutDuration(workout);
  const zoneMinutes = getWorkoutZoneMinutes(workout);
  const zones = ZONES.filter((z) => zoneMinutes[z] > 0);
  const totalZoneMinutes = zones.reduce((sum, z) => sum + zoneMinutes[z], 0);

  return (
    <div
      className={cn(
        "bg-card h-full flex flex-col",
        variant === "primary" ? "p-5 md:p-6" : "p-4",
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground truncate">
          {resultEyebrow ?? t(`library:categories.${workout.category}`)}
        </span>
        {onRefresh && canRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground inline-flex items-center gap-1 hover:text-foreground shrink-0"
          >
            <RotateCcw className="size-3" />
            {t("homepage:home.today.refresh")}
          </button>
        ) : (
          <span className="font-mono text-[10px] text-muted-foreground shrink-0">
            {formatDurationMinutes(duration)}
          </span>
        )}
      </div>
      <h3
        className={cn(
          "font-sans font-bold uppercase leading-[1.04] tracking-tight mt-2.5",
          variant === "primary" ? "text-2xl md:text-[32px]" : "text-xl",
        )}
      >
        {pickLang(workout, "name")}
      </h3>
      <p className="mt-2 text-sm leading-snug text-foreground/70 line-clamp-2">
        {pickLang(workout, "description")}
      </p>
      {totalZoneMinutes > 0 && (
        <div className="flex h-2 mt-3 gap-px" aria-hidden="true">
          {zones.map((z) => (
            <div
              key={z}
              className={ZONE_BAR_BG[z]}
              style={{ width: `${(zoneMinutes[z] / totalZoneMinutes) * 100}%` }}
            />
          ))}
        </div>
      )}
      <Button
        asChild
        size={variant === "primary" ? "default" : "sm"}
        className="mt-4 w-full sm:w-auto self-start"
      >
        <Link to={`/workout/${workout.id}`}>
          {t("homepage:home.today.openWorkout")}
        </Link>
      </Button>
    </div>
  );
}

function PrepareField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[9px] md:text-[10px] tracking-[0.14em] uppercase text-background/60">
        {label}
      </p>
      <p
        className={cn(
          "border-b-2 border-background/30 pb-2 pt-2 text-base md:text-lg",
          mono && "font-mono text-sm md:text-base",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Illustrative 12-week progression bars — see `PROGRESSION_WEEKS`. */
function TwelveWeekChart({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-end gap-1", className)} aria-hidden="true">
      {PROGRESSION_WEEKS.map((w, i) => (
        <div
          key={i}
          className={cn("flex-1", ZONE_BAR_BG[w.zone])}
          style={{ height: `${w.pct}%` }}
        />
      ))}
    </div>
  );
}

function ManifestoTile({
  kicker,
  count,
  title,
  body,
  cta,
  to,
  className,
  children,
}: {
  kicker: string;
  count: string;
  title: string;
  body: string;
  cta: string;
  to: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("p-6 md:p-9", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
          {kicker}
        </span>
        <span className="font-mono text-xs text-muted-foreground shrink-0">
          {count}
        </span>
      </div>
      <h3 className="font-sans font-bold uppercase leading-[0.98] tracking-[-0.03em] text-2xl md:text-4xl mt-3.5">
        {title}
      </h3>
      <p className="mt-3 text-[15px] leading-[1.6] text-foreground/75 max-w-[46ch]">
        {body}
      </p>
      {children}
      <Link
        to={to}
        className="inline-block mt-5 font-mono text-[11px] tracking-[0.08em] uppercase border-b-2 border-foreground pb-0.5 hover:text-primary hover:border-primary transition-colors"
      >
        {cta} →
      </Link>
    </div>
  );
}

function ExampleStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl md:text-[26px] font-bold tabular-nums">{value}</p>
      <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground mt-1">
        {label}
      </p>
    </div>
  );
}

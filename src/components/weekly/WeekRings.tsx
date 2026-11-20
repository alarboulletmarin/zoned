import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Check, ChevronDown } from "@/components/icons";
import { Segmented } from "@/components/ui/segmented";
import { formatDurationMinutes } from "@/components/visualization";
import { cn } from "@/lib/utils";
import {
  ringState,
  type RingData,
  type RingMetric,
  type RingReference,
  type RingState,
  type WeekRingsModel,
} from "@/lib/weekRings";

/**
 * Les anneaux de la semaine : Endurance (Z1-Z2), Qualité (Z3+), Renfo, le
 * fait contre le prévu. Le modèle vient de `lib/weekRings.ts`, qui porte les
 * règles et leurs raisons ; ce fichier dessine et formate, rien d'autre.
 *
 * Deux présentations, le même contenu :
 *
 * - `card`, la carte complète : en-tête, sélecteur de mesure, trois anneaux de
 *   96 px, total et charge, puis le hors plan ;
 * - `strip`, la bande repliée du téléphone, une `zn-disclosure` comme
 *   `WeekSummaryStrip` : trois anneaux de 36 px dans le `summary`, la carte
 *   sans son en-tête dans le panneau.
 *
 * L'information ne passe jamais par la seule couleur : chaque anneau porte
 * son libellé et son code de zone, le Renfo se reconnaît à ses segments, et
 * l'excédent de Qualité porte un triangle.
 */

// ── La géométrie ─────────────────────────────────────────────────────

const CENTER = 48;
const R = 38;
const R_ORBIT = 46;
const C = 2 * Math.PI * R;
const C_ORBIT = 2 * Math.PI * R_ORBIT;
/** L'écart entre deux séances de renfo, en unités du viewBox. */
const SEGMENT_GAP = 6;

const fixed = (n: number) => n.toFixed(2);

type RingKind = RingData["kind"];

export interface WeekRingProps {
  kind: RingKind;
  state: RingState;
  reference: RingReference;
  /** Le nombre de séances prévues, pour le dessin segmenté du Renfo. */
  segments?: number;
  /** `card` : trait de 9, orbite d'excédent ; `strip` : trait de 15, sans orbite. */
  size?: "card" | "strip";
  className?: string;
}

/**
 * Un anneau. Il part de midi et tourne dans le sens horaire ; la piste est un
 * cercle complet, la progression un `stroke-dasharray`, l'excédent une orbite
 * fine au rayon 46. Purement décoratif pour les lecteurs d'écran : c'est le
 * conteneur qui porte le `role="img"` et la phrase.
 */
export function WeekRing({
  kind,
  state,
  reference,
  segments = 0,
  size = "card",
  className,
}: WeekRingProps) {
  const strip = size === "strip";
  const strength = kind === "strength";

  let trackDash: string | undefined;
  let progressDash: string | null = null;

  if (strength && segments > 0) {
    const seg = Math.max(C / segments - SEGMENT_GAP, 1);
    trackDash = `${fixed(seg)} ${SEGMENT_GAP}`;
    const done = Math.min(Math.round(state.done), segments);
    if (done > 0) {
      progressDash = `${Array.from({ length: done }, () => `${fixed(seg)} ${SEGMENT_GAP}`).join(" ")} 0 ${fixed(C)}`;
    }
  } else {
    if (reference === "average") trackDash = "2 4";
    if (state.progress > 0) progressDash = `${fixed(C * state.progress)} ${fixed(C)}`;
  }

  const showOrbit = !strip && state.excess > 0;

  return (
    <svg
      viewBox="0 0 96 96"
      aria-hidden="true"
      focusable="false"
      className={cn("zn-ring", className)}
      data-kind={kind}
      data-size={size}
    >
      <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
        <circle
          className="zn-ring__track"
          cx={CENTER}
          cy={CENTER}
          r={R}
          strokeDasharray={trackDash}
        />
        {progressDash && (
          <circle
            className="zn-ring__progress"
            cx={CENTER}
            cy={CENTER}
            r={R}
            strokeDasharray={progressDash}
          />
        )}
        {showOrbit && (
          <circle
            className="zn-ring__orbit"
            cx={CENTER}
            cy={CENTER}
            r={R_ORBIT}
            strokeDasharray={`${fixed(C_ORBIT * state.excess)} ${fixed(C_ORBIT)}`}
          />
        )}
      </g>
    </svg>
  );
}

// ── Les formats ──────────────────────────────────────────────────────

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

interface Formats {
  /** La valeur seule, pour le centre de l'anneau. */
  bare: (metric: RingMetric, value: number) => string;
  /** La valeur et son unité. */
  full: (metric: RingMetric, value: number) => string;
}

function useFormats(locale: string): Formats {
  const { t } = useTranslation("today");
  // 430 m se lisait 430 minutes à côté de durées en min : le
  // dénivelé dit ce qu'il est.
  const dplusUnit = t("rings.unit.dplus");
  return useMemo(() => {
    const km = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const meters = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    const bare = (metric: RingMetric, value: number) => {
      if (metric === "time") return formatDurationMinutes(Math.round(value));
      if (metric === "km") return km.format(Math.round(value * 10) / 10);
      return meters.format(Math.round(value));
    };
    const full = (metric: RingMetric, value: number) => {
      if (metric === "time") return bare(metric, value);
      return `${bare(metric, value)}\u00a0${metric === "km" ? "km" : dplusUnit}`;
    };
    return { bare, full };
  }, [locale, dplusUnit]);
}

// ── Les anneaux, lus ─────────────────────────────────────────────────

interface RingView {
  kind: RingKind;
  state: RingState;
  segments: number;
  label: string;
  short: string;
  code: string;
  center: string;
  sub: string;
  over: string | null;
  aria: string;
}

function useRingViews(model: WeekRingsModel, metric: RingMetric): RingView[] {
  const { t, i18n } = useTranslation("today");
  const formats = useFormats(i18n.language?.startsWith("en") ? "en-GB" : "fr-FR");
  const avg = model.reference === "average";

  return useMemo(() => {
    const views: RingView[] = [];
    for (const ring of [model.endurance, model.quality] as const) {
      const state = ringState(ring, metric, model.reference);
      const label = t(`rings.${ring.kind}.label`);
      const code = t(`rings.${ring.kind}.code`);
      const target = formats.full(metric, state.target);
      const over = state.excess > 0 ? formats.full(metric, state.done - state.target) : null;
      views.push({
        kind: ring.kind,
        state,
        segments: 0,
        label,
        short: t(`rings.${ring.kind}.short`),
        code,
        center: formats.bare(metric, state.done),
        sub: t(avg ? "rings.avg" : "rings.of", { value: target }),
        over: over ? t("rings.over", { value: over }) : null,
        aria:
          t(avg ? "rings.aria.zoneAvg" : "rings.aria.zone", {
            label,
            code: t(`rings.${ring.kind}.spoken`),
            done: formats.full(metric, state.done),
            target,
          }) + (over ? t("rings.aria.over", { value: over }) : ""),
      });
    }

    const s = model.strength;
    const state = ringState(s, metric, model.reference);
    const label = t("rings.strength.label");
    let sub: string;
    if (metric === "time") {
      sub = `${formatDurationMinutes(Math.round(s.doneMinutes))} ${t(avg ? "rings.avg" : "rings.of", {
        value: formatDurationMinutes(Math.round(s.targetMinutes)),
      })}`;
    } else if (s.targetSessions === 0) {
      sub = t("rings.strength.none");
    } else {
      sub = t(avg ? "rings.strength.average" : "rings.strength.planned", { count: s.targetSessions });
    }
    views.push({
      kind: "strength",
      state,
      segments: avg ? 0 : s.targetSessions,
      label,
      short: t("rings.strength.short"),
      code: t("rings.strength.code"),
      center: `${s.doneSessions}/${s.targetSessions}`,
      sub,
      over: null,
      aria: t(avg ? "rings.aria.strengthAvg" : "rings.aria.strength", {
        done: s.doneSessions,
        count: s.targetSessions,
      }),
    });
    return views;
  }, [model, metric, avg, formats, t]);
}

// ── La carte ─────────────────────────────────────────────────────────

export interface WeekRingsProps {
  model: WeekRingsModel;
  metric: RingMetric;
  onMetricChange: (metric: RingMetric) => void;
  /** `card` toujours ouverte, `strip` repliée derrière une `zn-disclosure`. */
  variant?: "card" | "strip";
  /**
   * L'en-tête de la carte (semaine ISO et jour). Faux là où la semaine est
   * déjà nommée au-dessus, comme sur la page d'un plan.
   */
  showHead?: boolean;
  className?: string;
}

export function WeekRings({
  model,
  metric,
  onMetricChange,
  variant = "card",
  showHead = true,
  className,
}: WeekRingsProps) {
  const { t, i18n } = useTranslation("today");
  const en = i18n.language?.startsWith("en");
  const locale = en ? "en-GB" : "fr-FR";
  const views = useRingViews(model, metric);

  const monday = useMemo(() => new Date(`${model.range.from}T00:00:00`), [model.range.from]);
  const head = useMemo(() => {
    const sunday = new Date(`${model.range.to}T00:00:00`);
    const sameMonth = monday.getMonth() === sunday.getMonth();
    const month = (d: Date) => d.toLocaleDateString(locale, { month: "short" });
    const dates = sameMonth
      ? `${monday.getDate()}-${sunday.getDate()} ${month(sunday)}`
      : `${monday.getDate()} ${month(monday)}-${sunday.getDate()} ${month(sunday)}`;
    const today = new Date(monday);
    today.setDate(monday.getDate() + model.dayIndex);
    const short = today.toLocaleDateString(locale, { weekday: "short" });
    const dayName = short.charAt(0).toUpperCase() + short.slice(1);
    return {
      week: t("rings.week", { n: isoWeekNumber(monday), dates }),
      day: t("rings.day", { day: dayName, n: model.dayIndex + 1 }),
      strip: t("rings.strip", { n: model.dayIndex + 1 }),
    };
  }, [monday, model.range.to, model.dayIndex, locale, t]);

  const body = (
    <CardBody
      model={model}
      metric={metric}
      onMetricChange={onMetricChange}
      views={views}
      locale={locale}
    />
  );

  if (variant === "strip") {
    return (
      <details className={cn("zn-disclosure zn-rings zn-rings--strip", className)}>
        <summary className="zn-disclosure__summary zn-rings__summary">
          <span className="zn-rings__summary-line">
            <span className="zn-rings__kicker">{head.strip}</span>
            <span className="zn-rings__more zn-rings__kicker">
              <span className="zn-rings__more-closed">{t("rings.details")}</span>
              <span className="zn-rings__more-open">{t("rings.fold")}</span>
              <ChevronDown className="zn-disclosure__chevron" />
            </span>
          </span>
          <span className="zn-rings__mini-row">
            {views.map((view) => (
              <span key={view.kind} role="img" aria-label={view.aria} className="zn-rings__mini" data-kind={view.kind}>
                <WeekRing
                  kind={view.kind}
                  state={view.state}
                  reference={model.reference}
                  segments={view.segments}
                  size="strip"
                  className="zn-rings__mini-ring"
                />
                <span className="zn-rings__mini-text">
                  <span className="zn-rings__mini-label">
                    {view.short}
                    {view.state.warn && <AlertTriangle className="zn-rings__glyph zn-rings__glyph--warn" />}
                    {view.state.complete && <Check className="zn-rings__glyph" />}
                  </span>
                  <span className="zn-rings__mini-value">{view.center}</span>
                </span>
              </span>
            ))}
          </span>
        </summary>
        <div className="zn-disclosure__panel zn-rings__panel">{body}</div>
      </details>
    );
  }

  return (
    <section className={cn("zn-rings zn-rings--card", className)} aria-label={t("rings.label")}>
      {showHead && (
        <div className="zn-rings__head">
          <span className="zn-rings__kicker">{head.week}</span>
          <span className="zn-rings__kicker zn-rings__kicker--ink">{head.day}</span>
        </div>
      )}
      {body}
    </section>
  );
}

function CardBody({
  model,
  metric,
  onMetricChange,
  views,
  locale,
}: {
  model: WeekRingsModel;
  metric: RingMetric;
  onMetricChange: (metric: RingMetric) => void;
  views: RingView[];
  locale: string;
}) {
  const { t } = useTranslation(["today", "activity"]);
  const formats = useFormats(locale);
  const totals = model.total;
  const off = model.offPlan;
  const offLabel = useMemo(() => {
    if (!off) return "";
    const lead = off.purposeKey
      ? `${t(`activity:purpose.${off.purposeKey}`)} ×${off.count}`
      : t("today:rings.offPlan.count", { count: off.count });
    return [lead, formatDurationMinutes(Math.round(off.minutes)), off.km != null ? formats.full("km", off.km) : null]
      .filter(Boolean)
      .join(" · ");
  }, [off, formats, t]);

  return (
    <div className="zn-rings__body">
      {model.reference === "average" && <p className="zn-rings__reference">{t("today:rings.reference")}</p>}

      <Segmented<RingMetric>
        value={metric}
        onChange={onMetricChange}
        label={t("today:rings.metric.label")}
        className="zn-rings__metric"
        options={model.metrics.map((m) => ({ value: m, label: t(`today:rings.metric.${m}`) }))}
      />

      <div className="zn-rings__grid">
        {views.map((view) => (
          <div key={view.kind} role="img" aria-label={view.aria} className="zn-rings__cell" data-kind={view.kind}>
            <span className="zn-rings__dial">
              <WeekRing
                kind={view.kind}
                state={view.state}
                reference={model.reference}
                segments={view.segments}
                className="zn-rings__ring"
              />
              <span className="zn-rings__center">{view.center}</span>
            </span>
            <span className="zn-rings__sub">{view.sub}</span>
            <span className="zn-rings__label">
              {view.state.complete && <Check className="zn-rings__glyph" />}
              {view.label}
            </span>
            <span className="zn-rings__code">{view.code}</span>
            {view.over && (
              <span className="zn-rings__over" data-warn={view.state.warn || undefined}>
                {view.state.warn && <AlertTriangle className="zn-rings__glyph" />}
                {view.over}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="zn-rings__totals">
        <p className="zn-rings__fact">
          <span className="zn-rings__kicker">{t("today:rings.total")}</span>
          <span className="zn-rings__fact-value">
            {formats.bare(metric, totals.done[metric])}{" "}
            <span className="zn-rings__fact-of">/ {formats.full(metric, totals.target[metric])}</span>
          </span>
        </p>
        <p className="zn-rings__fact zn-rings__fact--end">
          <span className="zn-rings__kicker">{t("today:rings.load")}</span>
          <span className="zn-rings__fact-value">
            {model.load.done} <span className="zn-rings__fact-of">/ {model.load.planned}</span>
          </span>
        </p>
      </div>

      {off && (
        <div className="zn-rings__off">
          <p className="zn-rings__off-text">
            <span className="zn-rings__kicker">{t("today:rings.offPlan.title")}</span>
            <span className="zn-rings__off-label">{offLabel}</span>
          </p>
          <span className="zn-rings__off-load">{t("today:rings.offPlan.load", { load: off.load })}</span>
        </div>
      )}
    </div>
  );
}

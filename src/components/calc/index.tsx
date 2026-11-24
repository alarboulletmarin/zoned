/**
 * L'anatomie commune des calculateurs (docs/calculateurs.md) :
 * 1. ce que l'outil prend et ce qu'il rend (`ToolHeader`) ;
 * 2. la saisie, préremplie avec les repères (`StepField`, `StepChrono`) ;
 * 3. la réponse en grand et la phrase qui la situe (`Answer`) ;
 * 4. le détail en vrai tableau dense (classe `zn-calc-table`) ;
 * 5. d'où vient le chiffre (`Provenance`) ;
 * 6. l'outil suivant de la chaîne (`NextSteps`).
 * Une seule implémentation de chaque, la peinture est dans `calc.css`.
 */
import { useEffect, useId, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { ChronoValueInput, type ChronoFormat } from "@/components/ui/chrono-input";
import { cn } from "@/lib/utils";

export function ToolHeader({ kicker, title, lede }: { kicker: string; title: string; lede?: ReactNode }) {
  const { t } = useTranslation("calculators");
  return (
    <header className="zn-calc-head">
      <Link to="/calculators" className="zn-calc-head__back">
        <ArrowLeft size={14} />
        {t("kit.back")}
      </Link>
      <p className="zn-kicker zn-calc-head__kicker">{kicker}</p>
      <h1 className="zn-display zn-calc-head__title" data-level="3">
        {title}
      </h1>
      {lede && <p className="zn-body zn-calc-head__lede">{lede}</p>}
    </header>
  );
}

/** Locale decimal: 16,0 in French, 16.0 in English. */
export function formatDecimal(value: number, decimals: number, lang: string): string {
  const s = value.toFixed(decimals);
  return lang.startsWith("fr") ? s.replace(".", ",") : s;
}

function parseDecimal(raw: string): number | undefined {
  const n = Number(raw.trim().replace(",", "."));
  return raw.trim() !== "" && Number.isFinite(n) ? n : undefined;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function StepButtons({
  label,
  onStep,
  children,
  invalid,
  empty,
  className,
}: {
  label: string;
  onStep: (dir: -1 | 1) => void;
  children: ReactNode;
  invalid?: boolean;
  empty?: boolean;
  className?: string;
}) {
  const { t } = useTranslation("calculators");
  return (
    <div className={cn("zn-calc-step", className)} data-empty={empty || undefined} data-invalid={invalid || undefined}>
      <button type="button" className="zn-calc-step__btn" aria-label={t("kit.less", { label })} onClick={() => onStep(-1)}>
        −
      </button>
      {children}
      <button type="button" className="zn-calc-step__btn" aria-label={t("kit.more", { label })} onClick={() => onStep(1)}>
        +
      </button>
    </div>
  );
}

/**
 * Un nombre, à boutons − / +. Sans valeur, le cadre est en pointillés et dit
 * à poser : jamais un exemple gris qui ressemble à une valeur. Le texte
 * tapé reste un brouillon tant qu'il ne se lit pas comme un nombre.
 */
export function StepField({
  label,
  value,
  onChange,
  step,
  min,
  max,
  decimals = 0,
  unit,
  size = "md",
  fallback,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  step: number;
  min: number;
  max: number;
  decimals?: number;
  unit?: string;
  size?: "md" | "lg";
  /** Where − / + start from when the field is empty. */
  fallback?: number;
}) {
  const { t, i18n } = useTranslation("calculators");
  const id = useId();
  const show = (v: number | undefined) => (v === undefined ? "" : formatDecimal(v, decimals, i18n.language));
  const [draft, setDraft] = useState(() => show(value));
  useEffect(() => {
    setDraft((current) => (parseDecimal(current) === value ? current : show(value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const parsed = parseDecimal(draft);
  const invalid = draft.trim() !== "" && (parsed === undefined || parsed < min || parsed > max);

  return (
    <div className="zn-calc-field" data-size={size}>
      <label htmlFor={id} className="zn-calc-field__label">
        {label}
      </label>
      <StepButtons
        label={label}
        empty={value === undefined && draft === ""}
        invalid={invalid}
        onStep={(dir) => {
          const base = value ?? fallback ?? min;
          const next = clamp(Math.round((base + dir * step) / step) * step, min, max);
          onChange(Number(next.toFixed(decimals)));
        }}
      >
        <input
          id={id}
          className="zn-calc-step__input"
          type="text"
          inputMode={decimals > 0 ? "decimal" : "numeric"}
          value={draft}
          placeholder={t("kit.unset")}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            setDraft(e.target.value);
            const n = parseDecimal(e.target.value);
            if (e.target.value.trim() === "") onChange(undefined);
            else if (n !== undefined && n >= min && n <= max) onChange(n);
          }}
          onBlur={() => !invalid && setDraft(show(value))}
        />
        {unit && <span className="zn-calc-step__unit" aria-hidden="true">{unit}</span>}
      </StepButtons>
    </div>
  );
}

/** Le champ chrono existant (chiffres masqués), encadré de − / +. */
export function StepChrono({
  label,
  format,
  value,
  onChange,
  step,
  min = 1,
  max = 24 * 3600,
  distanceKm,
  size = "md",
  fallback,
  unit,
}: {
  label: string;
  format: ChronoFormat;
  /** Seconds for `ms` and `hms`. */
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  step: number;
  min?: number;
  max?: number;
  distanceKm?: number;
  size?: "md" | "lg";
  fallback?: number;
  unit?: string;
}) {
  const { t } = useTranslation("calculators");
  const id = useId();
  return (
    <div className="zn-calc-field" data-size={size}>
      <label htmlFor={id} className="zn-calc-field__label">
        {label}
      </label>
      <StepButtons
        label={label}
        empty={value === undefined}
        onStep={(dir) => {
          const base = value ?? fallback ?? min;
          onChange(clamp(Math.round((base + dir * step) / step) * step, min, max));
        }}
      >
        <ChronoValueInput
          id={id}
          className="zn-calc-step__input"
          format={format}
          distanceKm={distanceKm}
          value={value}
          onValueChange={onChange}
          placeholder={t("kit.unset")}
        />
        {unit && <span className="zn-calc-step__unit" aria-hidden="true">{unit}</span>}
      </StepButtons>
    </div>
  );
}

/** Le chiffre en grand, puis ce qui le situe. */
export function Answer({
  label,
  value,
  unit,
  children,
  className,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("zn-calc-answer", className)} aria-label={label}>
      <p className="zn-kicker">{label}</p>
      <p className="zn-calc-answer__value">
        {value}
        {unit && <span className="zn-calc-answer__unit"> {unit}</span>}
      </p>
      {children}
    </section>
  );
}

export function Provenance({ children, title }: { children: ReactNode; title?: string }) {
  const { t } = useTranslation("calculators");
  return (
    <details className="zn-calc-why">
      <summary>{title ?? t("kit.why")}</summary>
      <div className="zn-calc-why__body">{children}</div>
    </details>
  );
}

export function NextSteps({ links }: { links: { to: string; label: string }[] }) {
  const { t } = useTranslation("calculators");
  if (links.length === 0) return null;
  return (
    <nav className="zn-calc-next" aria-label={t("kit.next")}>
      <h2 className="zn-kicker">{t("kit.next")}</h2>
      <ul>
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to}>
              {l.label}
              <ArrowRight size={18} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** VMA bounds of each zone, % (lib/zones.ts). */
export const ZONE_BOUNDS: readonly (readonly [number, number])[] = [
  [50, 60],
  [60, 75],
  [75, 85],
  [85, 92],
  [92, 100],
  [100, 120],
];

/**
 * La bande des six zones, largeurs proportionnelles aux % de VMA (50 à
 * 120 %). `markerPct`, s'il est donné, pose le repère qui glisse : sa
 * position transitionne, le chiffre à côté est remplacé net (motion.css).
 */
export function ZoneBand({ markerPct, active }: { markerPct?: number; active?: number }) {
  const lo = ZONE_BOUNDS[0][0];
  const span = ZONE_BOUNDS[5][1] - lo;
  const left = markerPct === undefined ? undefined : (clamp(markerPct, lo, lo + span) - lo) / span;
  return (
    <div className="zn-calc-band" aria-hidden="true">
      <div className="zn-calc-band__row">
        {ZONE_BOUNDS.map(([a, b], i) => (
          <span
            key={i}
            className="zn-calc-band__zone"
            data-zone={i + 1}
            data-active={active === i + 1 || undefined}
            style={{ flexGrow: b - a }}
          >
            Z{i + 1}
          </span>
        ))}
        {left !== undefined && <span className="zn-calc-band__marker" style={{ transform: `translateX(${left * 100}cqw)` }} />}
      </div>
      {/* Each label sits at its real share of the band: 100 % is not the middle. */}
      <div className="zn-calc-band__axis">
        <span style={{ left: "0%" }}>50 %</span>
        <span style={{ left: `${((100 - lo) / span) * 100}%` }}>100 % VMA</span>
        <span style={{ left: "100%" }}>120 %</span>
      </div>
    </div>
  );
}

/** Zone (1-6) of a share of VMA, in %. Below 50 % reads as Z1, above 120 % as Z6. */
export function zoneOfVmaPct(pct: number): number {
  for (let i = 0; i < ZONE_BOUNDS.length; i++) if (pct < ZONE_BOUNDS[i][1]) return i + 1;
  return 6;
}

export interface WristbandRow {
  km: string;
  split: string;
  passage: string;
}

/**
 * La bande-poignet : une bande étroite à imprimer, km, split et passage.
 * Cachée à l'écran ; `printWristband` ne laisse qu'elle à l'impression
 * (calc.css, @media print), sans dépendance.
 */
export function Wristband({ title, rows }: { title: string; rows: WristbandRow[] }) {
  const { t } = useTranslation("calculators");
  return (
    <div className="zn-wristband" aria-hidden="true">
      <p>{title}</p>
      <table>
        <thead>
          <tr>
            <th>{t("kit.km")}</th>
            <th>{t("kit.split")}</th>
            <th>{t("kit.passage")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.km}>
              <td>{r.km}</td>
              <td>{r.split}</td>
              <td>{r.passage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function printWristband() {
  const body = document.body;
  body.classList.add("zn-print-wristband");
  const done = () => {
    body.classList.remove("zn-print-wristband");
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  window.print();
}

/**
 * L'allure kilomètre par kilomètre en barres, deux teintes (première et
 * seconde moitié). La hauteur suit la vitesse sur l'écart réel entre le km le
 * plus lent et le plus rapide : à pleine échelle, 3:59 contre 3:49 ne se
 * verrait pas. La hauteur transitionne quand la saisie change (calc-splits.css).
 */
export function SplitBars({
  paces,
  label,
  axis,
}: {
  /** min/km of each split, in order. */
  paces: number[];
  label: string;
  axis: [string, string, string];
}) {
  if (paces.length === 0) return null;
  const speeds = paces.map((p) => 1 / p);
  const lo = Math.min(...speeds);
  const hi = Math.max(...speeds);
  const height = (s: number) => (hi - lo < 1e-9 ? 70 : 35 + (65 * (s - lo)) / (hi - lo));
  return (
    <div className="zn-splits__chart" role="img" aria-label={label}>
      <div className="zn-splits__bars" data-animate aria-hidden="true">
        {speeds.map((s, i) => (
          <span
            key={i}
            className="zn-splits__bar"
            data-half={i < paces.length / 2 ? "first" : "second"}
            style={{ height: `${height(s)}%` }}
          />
        ))}
      </div>
      <div className="zn-splits__axis" aria-hidden="true">
        <span>{axis[0]}</span>
        <span>{axis[1]}</span>
        <span>{axis[2]}</span>
      </div>
    </div>
  );
}

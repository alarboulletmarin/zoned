import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { Answer, NextSteps, Provenance, ToolHeader, formatDecimal } from "@/components/calc";
import { useMyNumbers } from "@/hooks/useMyNumbers";
import { calculatePaceZones } from "@/lib/zones";
import { clock } from "@/lib/clock";

const MIN = 180; // 3:00/km, right end of the slider
const MAX = 420; // 7:00/km, left end
const STEP = 5;
const MILE_KM = 1.609344;
const DISTANCES: [string, number][] = [
  ["5 km", 5],
  ["10 km", 10],
  ["half", 21.0975],
  ["marathon", 42.195],
];

/** "4:45" or "5" -> seconds; undefined when it does not read as a pace. */
function parseClock(raw: string): number | undefined {
  const m = /^(\d{1,2})(?::([0-5]?\d))?$/.exec(raw.trim());
  return m ? Number(m[1]) * 60 + Number(m[2] ?? 0) : undefined;
}

function parseNumber(raw: string): number | undefined {
  const n = Number(raw.trim().replace(",", "."));
  return raw.trim() !== "" && Number.isFinite(n) && n > 0 ? n : undefined;
}

/** A value you touch to type: a real button that becomes an input. Enter or leaving commits, Escape cancels. */
function EditTile({
  label,
  display,
  initial,
  unit,
  foot,
  onCommit,
}: {
  label: string;
  display: string;
  initial: string;
  unit: string;
  foot?: string;
  onCommit: (raw: string) => void;
}) {
  const { t } = useTranslation("calculators");
  const [draft, setDraft] = useState<string | null>(null);
  const cancelled = useRef(false);
  return (
    <div className="zn-calc-tile">
      <span className="zn-calc-tile__label">{label}</span>
      {draft === null ? (
        <button
          type="button"
          className="zn-allures-val"
          aria-label={t("tools.allures.edit", { label: `${label} ${display} ${unit}` })}
          onClick={() => setDraft(initial)}
        >
          {display}
        </button>
      ) : (
        <input
          className="zn-allures-val"
          aria-label={label}
          autoFocus
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              cancelled.current = true;
              e.currentTarget.blur();
            }
          }}
          onBlur={() => {
            if (!cancelled.current) onCommit(draft);
            cancelled.current = false;
            setDraft(null);
          }}
        />
      )}
      <span className="zn-calc-tile__foot">{foot ?? unit}</span>
    </div>
  );
}

export function PaceCalculatorPage() {
  const { t, i18n } = useTranslation("calculators");
  const lang = i18n.language;
  const { numbers } = useMyNumbers();
  const [params] = useSearchParams();

  // An old calculator link carries the sender's vVO2max: it is the one used for this session.
  const sharedVma = Number(params.get("vma"));
  const vma = sharedVma > 0 ? sharedVma : numbers.vma;

  const zones = useMemo(
    () =>
      vma
        ? calculatePaceZones(vma).map((z) => ({ n: z.zone, fast: z.paceMinPerKm! * 60, slow: z.paceMaxPerKm! * 60 }))
        : null,
    [vma],
  );

  // What the person typed wins; else the link; else the middle of Z4; else 5:00.
  const [typed, setTyped] = useState<number | undefined>();
  const fromLink = (() => {
    const kmh = Number(params.get("kmh"));
    if (kmh > 0) return 3600 / kmh;
    const pace = Number(params.get("pace"));
    return pace > 0 ? pace : undefined;
  })();
  const z4 = zones?.find((z) => z.n === 4);
  const pace = typed ?? fromLink ?? (z4 ? Math.round((z4.fast + z4.slow) / 2 / STEP) * STEP : 300);

  const zone = zones && (zones.slice().reverse().find((z) => pace <= z.slow) ?? zones[0]);
  const speed = 3600 / pace;
  const markerLeft = Math.min(1, Math.max(0, (MAX - pace) / (MAX - MIN)));
  const paceText = clock(pace);

  const set = (seconds: number | undefined) => seconds && seconds >= 60 && seconds <= 3600 && setTyped(seconds);
  const pct = vma ? Math.round((speed / vma) * 100) : undefined;

  return (
    <>
      <SEOHead
        title={t("calculateurs.paces.seoTitle")}
        description={t("calculateurs.paces.seoDescription")}
        canonical="/calculators/allures"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculateurs.paces.seoAppName"),
            description: t("calculateurs.paces.seoAppDescription"),
            url: "https://zoned.run/calculators/allures",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculateurs.paces.seoBreadcrumb") },
            ],
          },
        ]}
      />

      <div className="zn-calc">
        <ToolHeader kicker={t("tools.allures.kicker")} title={t("tools.allures.title")} />

        <Answer label={t("tools.allures.label")} value={paceText} unit="/km">
          <input
            type="range"
            className="zn-allures-range"
            aria-label={t("tools.allures.slider")}
            aria-valuetext={t("tools.allures.valuetext", { pace: paceText })}
            min={MIN}
            max={MAX}
            step={STEP}
            value={MIN + MAX - Math.min(MAX, Math.max(MIN, pace))}
            onChange={(e) => setTyped(MIN + MAX - Number(e.target.value))}
          />
          {zones && zone ? (
            <>
              <div className="zn-calc-band" aria-hidden="true">
                <div className="zn-calc-band__row">
                  {zones.map((z) => (
                    <span
                      key={z.n}
                      className="zn-calc-band__zone"
                      data-zone={z.n}
                      style={{ flexGrow: Math.max(0, Math.min(z.slow, MAX) - Math.max(z.fast, MIN)) }}
                    >
                      Z{z.n}
                    </span>
                  ))}
                  <span className="zn-calc-band__marker" style={{ transform: `translateX(${markerLeft * 100}cqw)` }} />
                </div>
              </div>
              <p className="zn-calc-answer__say">
                {t("tools.allures.zoneLine", {
                  n: zone.n,
                  name: t(`tools.allures.zone${zone.n}`),
                  vma: formatDecimal(vma!, 1, lang),
                  from: clock(zone.fast),
                  to: clock(zone.slow),
                })}
              </p>
            </>
          ) : (
            <p className="zn-calc-answer__say">
              {t("tools.allures.noVma")} <Link to="/calculators/vma">{t("tools.allures.noVmaLink")}</Link>
            </p>
          )}
        </Answer>

        <div className="zn-calc-tiles" data-cols="3">
          <EditTile
            label={t("tools.allures.speed")}
            display={formatDecimal(speed, 1, lang)}
            initial={formatDecimal(speed, 1, lang)}
            unit="km/h"
            onCommit={(raw) => {
              const v = parseNumber(raw);
              if (v) set(3600 / v);
            }}
          />
          <EditTile
            label={t("tools.allures.mile")}
            display={clock(pace * MILE_KM)}
            initial={clock(pace * MILE_KM)}
            unit="/mi"
            onCommit={(raw) => {
              const s = parseClock(raw);
              if (s) set(s / MILE_KM);
            }}
          />
          {vma && pct !== undefined ? (
            <EditTile
              label={t("tools.allures.pct")}
              display={`${pct} %`}
              initial={String(pct)}
              unit="%"
              foot={t("tools.allures.ofVma", { vma: formatDecimal(vma, 1, lang) })}
              onCommit={(raw) => {
                const v = parseNumber(raw);
                if (v) set(3600 / ((vma * v) / 100));
              }}
            />
          ) : (
            <Link to="/calculators/vma" className="zn-calc-tile" data-empty="">
              <span className="zn-calc-tile__label">{t("tools.allures.pct")}</span>
              <span className="zn-calc-tile__value">{t("kit.unset")}</span>
              <span className="zn-calc-tile__foot">{t("tools.allures.setVma")}</span>
            </Link>
          )}
        </div>
        <p className="zn-calc-hint">{t("tools.allures.hint")}</p>

        <section className="zn-calc-section">
          <h2 className="zn-calc-h2">{t("tools.allures.atPace")}</h2>
          <div className="zn-calc-tablebox">
            <table className="zn-calc-table">
              <tbody>
                {DISTANCES.map(([d, km]) => (
                  <tr key={d}>
                    <th scope="row">{d === "half" || d === "marathon" ? t(`tools.allures.${d}`) : d}</th>
                    <td>{clock(pace * km)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to={`/calculators/table-allures?pace=${Math.round(pace)}`} className="zn-allures-tablelink">
            {t("tools.allures.fullTable")}
          </Link>
        </section>

        <Provenance>
          <p>{t("tools.allures.why")}</p>
        </Provenance>
        <NextSteps
          links={[
            { to: "/calculators/splits", label: t("tools.allures.nextSplits") },
            { to: "/calculators/tapis-roulant", label: t("tools.allures.nextTreadmill") },
          ]}
        />
      </div>
    </>
  );
}

import { useState, useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Save } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { PageContainer } from "@/components/layout/PageContainer";
import { SEOHead } from "@/components/seo";
import {
  calculateSwimmingZones,
  estimateCssFrom400And200,
  formatSwimPace,
  formatSwimPaceRange,
  type SwimZone,
} from "@/lib/planGenerator/swimmingPaceEngine";
import { updateSwimmingBaseData } from "@/lib/athleteProfile";

const ZONE_ORDER: SwimZone[] = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6"];

interface TimeInputProps {
  /** Prefix for the two field ids the labels point at. */
  id: string;
  label: string;
  minutes: string;
  seconds: string;
  onMinutesChange: (v: string) => void;
  onSecondsChange: (v: string) => void;
  minutesLabel: string;
  secondsLabel: string;
  /** Outlines both boxes; the written reason is printed by the caller. */
  invalid?: boolean;
  describedBy?: string;
}

/**
 * A duration typed as mm:ss. Two number fields on one baseline, each in its
 * own frame with its unit printed under it, and each unit is the field's
 * real `<label htmlFor>`, not a caption sitting next to an unlabelled box.
 */
function TimeInput({
  id,
  label,
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange,
  minutesLabel,
  secondsLabel,
  invalid,
  describedBy,
}: TimeInputProps) {
  const handle = (value: string, setter: (v: string) => void, max: number) => {
    if (value === "") {
      setter("");
      return;
    }
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 0) return;
    if (num > max) {
      setter(String(max));
      return;
    }
    setter(String(num));
  };

  return (
    <div
      className="zn-ct__field"
      role="group"
      aria-labelledby={`${id}-label`}
      aria-describedby={describedBy}
    >
      <span id={`${id}-label`} className="zn-label">
        {label}
      </span>
      <div className="zn-ct__time">
        <div className="zn-ct__timepart">
          <span
            className="zn-numfield zn-ct__numfield"
            data-invalid={invalid ? "true" : undefined}
          >
            <input
              id={`${id}-min`}
              type="number"
              min={0}
              max={59}
              placeholder="0"
              value={minutes}
              onChange={(e) => handle(e.target.value, onMinutesChange, 59)}
              aria-label={minutesLabel}
              aria-invalid={invalid || undefined}
              className="zn-numfield__input"
            />
          </span>
          <label htmlFor={`${id}-min`} className="zn-ct__timeunit">
            {minutesLabel}
          </label>
        </div>

        <span className="zn-ct__timesep" aria-hidden="true">
          :
        </span>

        <div className="zn-ct__timepart">
          <span
            className="zn-numfield zn-ct__numfield"
            data-invalid={invalid ? "true" : undefined}
          >
            <input
              id={`${id}-sec`}
              type="number"
              min={0}
              max={59}
              placeholder="00"
              value={seconds}
              onChange={(e) => handle(e.target.value, onSecondsChange, 59)}
              aria-label={secondsLabel}
              aria-invalid={invalid || undefined}
              className="zn-numfield__input"
            />
          </span>
          <label htmlFor={`${id}-sec`} className="zn-ct__timeunit">
            {secondsLabel}
          </label>
        </div>
      </div>
    </div>
  );
}

function parseSeconds(minutes: string, seconds: string): number {
  const m = minutes === "" ? 0 : parseInt(minutes, 10);
  const s = seconds === "" ? 0 : parseInt(seconds, 10);
  if (!Number.isFinite(m) || !Number.isFinite(s)) return 0;
  return m * 60 + s;
}

export function CssTestPage() {
  const { t } = useTranslation("calculators");

  const [m400, setM400] = useState<string>("");
  const [s400, setS400] = useState<string>("");
  const [m200, setM200] = useState<string>("");
  const [s200, setS200] = useState<string>("");

  const time400 = parseSeconds(m400, s400);
  const time200 = parseSeconds(m200, s200);

  const cssSecPer100m = useMemo(() => {
    if (time400 <= 0 || time200 <= 0) return 0;
    return estimateCssFrom400And200(time400, time200);
  }, [time400, time200]);

  // Both times typed and the formula still returns nothing: the 400 was not
  // slower than the 200. Said out loud rather than left as an empty screen.
  const orderError = time400 > 0 && time200 > 0 && cssSecPer100m <= 0;

  const zones = useMemo(() => {
    if (cssSecPer100m <= 0) return null;
    return calculateSwimmingZones({ cssSecPer100m });
  }, [cssSecPer100m]);

  const handleSave = () => {
    if (cssSecPer100m <= 0) return;
    updateSwimmingBaseData({ cssSecPer100m });
    toast.success(
      t("calculateurs.css.cssSaved", { css: formatSwimPace(cssSecPer100m) }),
    );
  };

  return (
    <>
      <SEOHead
        title={t("calculateurs.css.seoTitle")}
        description={t("calculateurs.css.seoDescription")}
        canonical="/calculators/css"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculateurs.css.seoAppName"),
            description: t("calculateurs.css.seoAppDescription"),
            url: "https://zoned.run/calculators/css",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculateurs.css.seoBreadcrumb") },
            ],
          },
        ]}
      />

      <PageContainer width="narrow" className="zn-ct">
        <header
          className="zn-ct__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">{t("calculateurs.css.kicker")}</span>
          <h1 className="zn-display" data-level="2">
            {t("calculateurs.css.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-ct__lede">
            {t("calculateurs.css.description")}
          </p>
        </header>

        <section className="zn-ct__band">
          <Card>
            <CardContent
              className="zn-stack"
              style={{ "--gap": "var(--sp-12)" } as CSSProperties}
            >
              <p className="zn-ct__hint">
                {t("calculateurs.css.protocolHelp")}
              </p>

              <TimeInput
                id="time400"
                label={t("calculateurs.css.time400")}
                minutes={m400}
                seconds={s400}
                onMinutesChange={setM400}
                onSecondsChange={setS400}
                minutesLabel={t("calculateurs.css.minutes")}
                secondsLabel={t("calculateurs.css.seconds")}
                invalid={orderError}
                describedBy={orderError ? "css-order-error" : undefined}
              />

              <TimeInput
                id="time200"
                label={t("calculateurs.css.time200")}
                minutes={m200}
                seconds={s200}
                onMinutesChange={setM200}
                onSecondsChange={setS200}
                minutesLabel={t("calculateurs.css.minutes")}
                secondsLabel={t("calculateurs.css.seconds")}
                invalid={orderError}
                describedBy={orderError ? "css-order-error" : undefined}
              />

              {orderError && (
                <p id="css-order-error" className="zn-ct__error">
                  {t("calculateurs.css.invalidOrder")}
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {cssSecPer100m > 0 && zones && (
          <>
            <section className="zn-ct__band">
              <div className="zn-ct__figure">
                <span className="zn-kicker">
                  {t("calculateurs.css.estimatedCss")}
                </span>
                <p className="zn-ct__figure-value">
                  {formatSwimPace(cssSecPer100m)}
                </p>
                <span className="zn-ct__figure-unit">
                  {t("calculateurs.css.per100m")}
                </span>
              </div>
            </section>

            <section
              className="zn-ct__band zn-stack"
              style={{ "--gap": "var(--sp-13)" } as CSSProperties}
              aria-labelledby="css-zones"
            >
              <h2 id="css-zones" className="zn-title" data-level="3">
                {t("calculateurs.css.zonesPreview")}
              </h2>

              {/* The swim ramp names its zones differently from the running
                  one, so the first column is this table's legend and no ink
                  ramp is painted here. */}
              <ResponsiveTable
                data={ZONE_ORDER}
                rowKey={(zone) => zone}
                columns={[
                  {
                    key: "zone",
                    header: t("calculateurs.css.zone"),
                    // The mobile card already prints this as its title.
                    hideOnMobile: true,
                    cell: (zone) => (
                      <span className="zn-ct__zonename">
                        {t(`calculateurs.css.zoneLabel${zone}`)}
                      </span>
                    ),
                  },
                  {
                    key: "pace",
                    header: t("calculateurs.css.pace"),
                    className: "zn-ct__num",
                    cell: (zone) => formatSwimPaceRange(zones.zones[zone]),
                  },
                ]}
                mobileCardTitle={(zone) =>
                  t(`calculateurs.css.zoneLabel${zone}`)
                }
              />

              <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
                <Button onClick={handleSave}>
                  <Save size={15} />
                  {t("calculateurs.css.useThisCss")}
                </Button>
              </div>
            </section>
          </>
        )}
      </PageContainer>
    </>
  );
}

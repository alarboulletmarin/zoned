import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  ArrowRight,
  Footprints,
  Mountain,
  Route as RouteIcon,
  Waves,
  Zap,
} from "@/components/icons";

/**
 * Auto-rotating spotlight that surfaces the headline new features. Lives at
 * the top of the home page so first-time visitors immediately see what's
 * recently shipped without having to scroll the changelog.
 *
 * Each slide links to the relevant feature, includes a short pitch and a
 * 4-bullet list explaining concretely what the user can do. Auto-advances
 * every 6 s; pauses on hover so a curious user can read the bullets.
 */

interface SpotlightSlide {
  key: "routes" | "cycling" | "swimming";
  to: string;
  /** Background gradient applied to the card. */
  gradient: string;
  /** Icon container colour. */
  iconBg: string;
  iconColor: string;
  Icon: React.ComponentType<{ className?: string; size?: number }>;
  /** Large decorative icon, low-opacity, anchored bottom-right. */
  DecorIcon?: React.ComponentType<{ className?: string; size?: number }>;
  /** i18n keys (homepage namespace). */
  i18n: {
    eyebrow: string;
    title: string;
    desc: string;
    cta: string;
  };
}

const SLIDES: SpotlightSlide[] = [
  {
    key: "routes",
    to: "/routes",
    gradient:
      "from-primary/15 via-primary/5 to-zone-4/10 dark:from-primary/25 dark:via-primary/10 dark:to-zone-4/15 border-primary/30",
    iconBg: "bg-primary/20 dark:bg-primary/30",
    iconColor: "text-primary",
    Icon: RouteIcon,
    DecorIcon: Mountain,
    i18n: {
      eyebrow: "home.routesEyebrow",
      title: "home.routesTitle",
      desc: "home.routesDesc",
      cta: "home.routesCta",
    },
  },
  {
    key: "cycling",
    to: "/library?discipline=cycling",
    gradient:
      "from-zone-4/15 via-zone-4/5 to-zone-3/10 dark:from-zone-4/25 dark:via-zone-4/10 dark:to-zone-3/15 border-zone-4/30",
    iconBg: "bg-zone-4/20 dark:bg-zone-4/30",
    iconColor: "text-zone-4",
    Icon: Zap,
    DecorIcon: Footprints,
    i18n: {
      eyebrow: "home.cyclingEyebrow",
      title: "home.cyclingTitle",
      desc: "home.cyclingDesc",
      cta: "home.cyclingCta",
    },
  },
  {
    key: "swimming",
    to: "/library?discipline=swimming",
    gradient:
      "from-zone-2/15 via-zone-2/5 to-zone-1/10 dark:from-zone-2/25 dark:via-zone-2/10 dark:to-zone-1/15 border-zone-2/30",
    iconBg: "bg-zone-2/20 dark:bg-zone-2/30",
    iconColor: "text-zone-2",
    Icon: Waves,
    DecorIcon: Waves,
    i18n: {
      eyebrow: "home.swimmingEyebrow",
      title: "home.swimmingTitle",
      desc: "home.swimmingDesc",
      cta: "home.swimmingCta",
    },
  },
];

const ROTATION_INTERVAL_MS = 6000;

export function NewsSpotlight() {
  const { t } = useTranslation("homepage");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPaused]);

  const slide = SLIDES[activeIndex];
  const { Icon, DecorIcon } = slide;

  return (
    <section
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label={t("home.spotlightLabel")}
    >
      <Link to={slide.to} className="group block">
        <div
          key={slide.key}
          className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${slide.gradient} p-6 md:p-8 transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1 animate-spotlight-fade`}
        >
          {DecorIcon && (
            <DecorIcon
              className={`pointer-events-none absolute -right-6 -bottom-6 size-32 md:size-48 ${slide.iconColor} opacity-10 dark:opacity-15`}
              size={192}
            />
          )}
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div
              className={`flex size-12 md:size-16 items-center justify-center rounded-xl ${slide.iconBg} ${slide.iconColor}`}
            >
              <Icon className="size-7 md:size-9" />
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-white bg-primary`}>
                  {t("home.newBadge")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t(slide.i18n.eyebrow)}
                </span>
              </div>
              <h2 className="text-xl md:text-3xl font-bold leading-tight">
                {t(slide.i18n.title)}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                {t(slide.i18n.desc)}
              </p>
            </div>
            <div className={`flex items-center gap-2 ${slide.iconColor} font-semibold text-sm md:text-base whitespace-nowrap`}>
              {t(slide.i18n.cta)}
              <ArrowRight className="size-4 md:size-5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>

      {/* Slide indicators */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {SLIDES.map((s, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={t("home.spotlightGoto", { index: i + 1 })}
              aria-current={isActive ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? "w-8 bg-foreground"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}

export default NewsSpotlight;

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  ArrowRight,
  Bike,
  Mountain,
  Waves,
} from "@/components/icons";

/**
 * Auto-rotating spotlight that surfaces the headline new features. Lives at
 * the top of the home page so first-time visitors immediately see what's
 * recently shipped without having to scroll the changelog.
 *
 * Each slide links to the relevant feature, includes a short pitch and a
 * 4-bullet list explaining concretely what the user can do. Auto-advances
 * every 6 s; pauses on hover so a curious user can read the bullets.
 *
 * Pointer-driven swipe (touch + mouse drag) navigates between slides; the
 * full strip translates with the gesture so adjacent slides peek in from
 * the side, giving real "carousel" feedback.
 */

interface SpotlightSlide {
  key: "routes" | "cycling" | "swimming";
  to: string;
  /** Background gradient applied to the card. */
  gradient: string;
  /** Accent colour applied to the CTA arrow and decorative icon. */
  iconColor: string;
  /** Large decorative icon, low-opacity, anchored bottom-right. */
  DecorIcon: React.ComponentType<{ className?: string; size?: number }>;
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
    iconColor: "text-primary",
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
    to: "/library?type=cycling",
    gradient:
      "from-zone-4/15 via-zone-4/5 to-zone-3/10 dark:from-zone-4/25 dark:via-zone-4/10 dark:to-zone-3/15 border-zone-4/30",
    iconColor: "text-zone-4",
    DecorIcon: Bike,
    i18n: {
      eyebrow: "home.cyclingEyebrow",
      title: "home.cyclingTitle",
      desc: "home.cyclingDesc",
      cta: "home.cyclingCta",
    },
  },
  {
    key: "swimming",
    to: "/library?type=swimming",
    gradient:
      "from-zone-2/15 via-zone-2/5 to-zone-1/10 dark:from-zone-2/25 dark:via-zone-2/10 dark:to-zone-1/15 border-zone-2/30",
    iconColor: "text-zone-2",
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
const SWIPE_RATIO_THRESHOLD = 0.2; // 20% of viewport width to commit a swipe

export function NewsSpotlight() {
  const { t } = useTranslation("homepage");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const isHorizontalRef = useRef(false);
  const isDraggingRef = useRef(false);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPaused]);

  const goTo = (index: number) => {
    setActiveIndex(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
  };

  const viewportWidth = () => viewportRef.current?.offsetWidth ?? 1;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    isHorizontalRef.current = false;
    isDraggingRef.current = false;
    setIsPaused(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null || pointerStartY.current === null) return;
    const dx = e.clientX - pointerStartX.current;
    const dy = e.clientY - pointerStartY.current;

    // Lock direction once the user has moved enough.
    if (!isHorizontalRef.current && !isDraggingRef.current) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        isHorizontalRef.current = true;
        isDraggingRef.current = true;
        setIsDragging(true);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      } else {
        // Vertical scroll: bail out, do not hijack the gesture.
        pointerStartX.current = null;
        pointerStartY.current = null;
        return;
      }
    }

    if (isDraggingRef.current) {
      // Resist past the edges so it feels bounded.
      const w = viewportWidth();
      let offset = dx;
      const atStart = activeIndex === 0 && dx > 0;
      const atEnd = activeIndex === SLIDES.length - 1 && dx < 0;
      if (atStart || atEnd) offset = dx * 0.35;
      // Clamp to one viewport in either direction.
      offset = Math.max(-w, Math.min(w, offset));
      setDragOffset(offset);
      e.preventDefault();
    }
  };

  const finishDrag = (clientX: number | null) => {
    const start = pointerStartX.current;
    const wasDragging = isDraggingRef.current;
    pointerStartX.current = null;
    pointerStartY.current = null;
    isDraggingRef.current = false;
    isHorizontalRef.current = false;

    if (!wasDragging || start === null || clientX === null) {
      setDragOffset(0);
      setIsDragging(false);
      return;
    }

    const dx = clientX - start;
    const w = viewportWidth();
    if (Math.abs(dx) > w * SWIPE_RATIO_THRESHOLD) {
      goTo(activeIndex + (dx < 0 ? 1 : -1));
      suppressClickRef.current = true;
    }
    setDragOffset(0);
    setIsDragging(false);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(e.clientX);
    setIsPaused(false);
  };

  const handlePointerCancel = () => {
    finishDrag(null);
    setIsPaused(false);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  };

  const trackTransform = `translate3d(calc(${-activeIndex * 100}% + ${dragOffset}px), 0, 0)`;

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
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleClickCapture}
        className="overflow-hidden touch-pan-y select-none cursor-grab active:cursor-grabbing"
      >
        <div
          className="flex"
          style={{
            transform: trackTransform,
            transition: isDragging ? "none" : "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform",
          }}
        >
          {SLIDES.map((s, i) => {
            const DecorIcon = s.DecorIcon;
            const isActive = i === activeIndex;
            return (
              <div
                key={s.key}
                className="w-full shrink-0 grow-0 basis-full"
                aria-hidden={!isActive}
                aria-roledescription="slide"
              >
                <Link
                  to={s.to}
                  className="group block"
                  draggable={false}
                  tabIndex={isActive ? 0 : -1}
                >
                  <div
                    className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${s.gradient} p-6 md:p-8 transition-shadow duration-300 group-hover:shadow-xl`}
                  >
                    <DecorIcon
                      className={`pointer-events-none absolute -right-6 -bottom-6 size-32 md:size-48 ${s.iconColor} opacity-10 dark:opacity-15`}
                      size={192}
                    />
                    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-white bg-primary">
                            {t("home.newBadge")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t(s.i18n.eyebrow)}
                          </span>
                        </div>
                        <h2 className="text-xl md:text-3xl font-bold leading-tight">
                          {t(s.i18n.title)}
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                          {t(s.i18n.desc)}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${s.iconColor} font-semibold text-sm md:text-base whitespace-nowrap`}
                      >
                        {t(s.i18n.cta)}
                        <ArrowRight className="size-4 md:size-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

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

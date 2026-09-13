import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ArrowRight } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

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
        className="zn-spotlight__viewport"
      >
        <div
          className="zn-spotlight__track"
          style={{
            transform: trackTransform,
            transition: isDragging
              ? "none"
              : "transform var(--dur-slow) var(--ease-out)",
          }}
        >
          {SLIDES.map((s, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={s.key}
                className="zn-spotlight__slot"
                aria-hidden={!isActive}
                aria-roledescription="slide"
              >
                <Link
                  to={s.to}
                  className="zn-spotlight__slide"
                  draggable={false}
                  tabIndex={isActive ? 0 : -1}
                >
                  <div className="zn-cluster">
                    <Badge>{t("home.newBadge")}</Badge>
                    <span className="zn-kicker zn-kicker--inline">
                      {t(s.i18n.eyebrow)}
                    </span>
                  </div>
                  <h2 className="zn-spotlight__title">{t(s.i18n.title)}</h2>
                  <p className="zn-spotlight__desc">{t(s.i18n.desc)}</p>
                  <span className="zn-spotlight__cta">
                    {t(s.i18n.cta)}
                    <ArrowRight />
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide indicators */}
      <div className="zn-spotlight__dots">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label={t("home.spotlightGoto", { index: i + 1 })}
            aria-current={i === activeIndex ? "true" : undefined}
            className="zn-spotlight__dot"
          />
        ))}
      </div>
    </section>
  );
}

export default NewsSpotlight;

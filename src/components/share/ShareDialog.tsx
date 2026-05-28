/**
 * ShareDialog — Strava-style activity share sheet.
 *
 * Mobile : bottom sheet pinned to the bottom of the viewport.
 * Desktop : centered modal capped at sm:max-w-2xl.
 *
 * Layout:
 *   Header   ─ Fermer · Partager l'activité
 *   Carousel ─ scroll-snap horizontal, one template per slide, peek of
 *              the next on each side. IntersectionObserver tracks which
 *              slide is centered and exposes it to the actions row.
 *   Caption  ─ label + format + counter (5 / 21)
 *   Toggle   ─ "Fond transparent" only when the active template supports it
 *   Actions  ─ Partager · Enregistrer · Copier · Copier le lien
 *
 * Each template is mounted at its native dimensions inside a CSS-scaled
 * wrapper (`transform: scale(s)`). html-to-image ignores ancestor transforms
 * when capturing — the output PNG is always rendered at native resolution.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Download,
  Copy,
  Share,
  Link2,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "@/components/icons";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  downloadImage,
  copyImage,
  shareImage,
  isCopySupported,
} from "@/lib/export/share";
import type { WorkoutTemplate } from "@/types";
import {
  SHARE_TEMPLATES,
  type ShareTemplateDescriptor,
} from "./shareTemplates";
import { workoutShareUrl } from "./templates/_shared";
import "./templates/_shared.css";

interface ShareDialogProps {
  workout: WorkoutTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ workout, open, onOpenChange }: ShareDialogProps) {
  const { t } = useTranslation("common");
  const [selectedId, setSelectedId] = useState<string>(SHARE_TEMPLATES[0].id);
  const [transparent, setTransparent] = useState(false);
  const [busy, setBusy] = useState<
    null | "download" | "copy" | "share" | "copyLink"
  >(null);
  const wrappersRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const selected = useMemo(
    () =>
      SHARE_TEMPLATES.find((tpl) => tpl.id === selectedId) ??
      SHARE_TEMPLATES[0],
    [selectedId],
  );
  const selectedIndex = SHARE_TEMPLATES.findIndex(
    (tpl) => tpl.id === selected.id,
  );

  // Reset transparent when switching to a template that doesn't support it.
  useEffect(() => {
    if (!selected.supportsTransparent && transparent) {
      setTransparent(false);
    }
  }, [selected, transparent]);

  // When the dialog re-opens, snap the carousel back to the selected slide
  // (otherwise it stays at scrollLeft: 0).
  useLayoutEffect(() => {
    if (!open) return;
    const el = slideRefs.current.get(selected.id);
    if (el) {
      // `auto` (not smooth) so the first paint already shows the right slide.
      el.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
    }
  }, [open, selected.id]);

  // Track which slide is centered by computing the slide closest to the
  // track centre on every scroll. More precise than IntersectionObserver
  // when several slides overlap the viewport at once (peek pattern).
  useEffect(() => {
    if (!open) return;
    const track = trackRef.current;
    if (!track) return;

    let raf: number | null = null;
    const update = () => {
      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;
      let closestId: string | null = null;
      let closestDist = Infinity;
      for (const [id, el] of slideRefs.current) {
        const rect = el.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const dist = Math.abs(center - trackCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = id;
        }
      }
      if (closestId) setSelectedId(closestId);
    };
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [open]);

  // Mouse drag-to-scroll — trackpad horizontal swipe + click-drag with a
  // mouse. Touch is already handled by the browser's native overflow-x
  // scroll. The dragMovedRef flag suppresses the click that would otherwise
  // fire on mouseup at the end of a drag.
  const dragStateRef = useRef<{
    down: boolean;
    moved: boolean;
    startX: number;
    scrollLeft: number;
  }>({ down: false, moved: false, startX: 0, scrollLeft: 0 });
  const dragMovedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const track = trackRef.current;
    if (!track) return;

    function handleDown(e: MouseEvent) {
      // Ignore right-click / middle-click.
      if (e.button !== 0) return;
      dragStateRef.current = {
        down: true,
        moved: false,
        startX: e.pageX,
        scrollLeft: track!.scrollLeft,
      };
      dragMovedRef.current = false;
    }
    function handleMove(e: MouseEvent) {
      if (!dragStateRef.current.down) return;
      const dx = e.pageX - dragStateRef.current.startX;
      if (Math.abs(dx) > 4) {
        dragStateRef.current.moved = true;
        dragMovedRef.current = true;
      }
      track!.scrollLeft = dragStateRef.current.scrollLeft - dx;
    }
    function handleUp() {
      if (!dragStateRef.current.down) return;
      dragStateRef.current.down = false;
      // Keep dragMovedRef true for one click cycle, then reset.
      if (dragStateRef.current.moved) {
        setTimeout(() => {
          dragMovedRef.current = false;
        }, 0);
      }
    }

    track.addEventListener("mousedown", handleDown);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      track.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [open]);

  const copySupported = useMemo(() => isCopySupported(), []);

  function getSelectedNode(): HTMLElement | null {
    const wrapper = wrappersRef.current.get(selected.id);
    return (
      (wrapper?.querySelector("[data-share-template]") as HTMLElement | null) ??
      null
    );
  }

  function filename(): string {
    const suffix = transparent ? "-transparent" : "";
    return `zoned-${selected.id}-${workout.id}${suffix}.png`;
  }

  async function handleDownload() {
    const node = getSelectedNode();
    if (!node) return;
    setBusy("download");
    const toastId = toast.loading(t("share.toast.loading"));
    try {
      await downloadImage(node, filename(), transparent);
      toast.success(t("share.toast.downloaded"), { id: toastId });
    } catch {
      toast.error(t("share.toast.error"), { id: toastId });
    } finally {
      setBusy(null);
    }
  }

  async function handleCopy() {
    if (!copySupported) {
      toast.error(t("share.toast.copyUnsupported"));
      return;
    }
    const node = getSelectedNode();
    if (!node) return;
    setBusy("copy");
    const toastId = toast.loading(t("share.toast.loading"));
    try {
      const ok = await copyImage(node, transparent);
      if (ok) toast.success(t("share.toast.copied"), { id: toastId });
      else toast.error(t("share.toast.copyUnsupported"), { id: toastId });
    } catch {
      toast.error(t("share.toast.error"), { id: toastId });
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    const node = getSelectedNode();
    if (!node) return;
    setBusy("share");
    const toastId = toast.loading(t("share.toast.loading"));
    try {
      const method = await shareImage(node, filename(), transparent);
      toast.success(
        method === "native"
          ? t("share.toast.shared")
          : t("share.toast.downloaded"),
        { id: toastId },
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        toast.dismiss(toastId);
      } else {
        toast.error(t("share.toast.error"), { id: toastId });
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleCopyLink() {
    setBusy("copyLink");
    try {
      await navigator.clipboard.writeText(workoutShareUrl(workout.id));
      toast.success(t("share.toast.linkCopied"));
    } catch {
      toast.error(t("share.toast.error"));
    } finally {
      setBusy(null);
    }
  }

  const scrollToSlide = useCallback((id: string) => {
    const el = slideRefs.current.get(id);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, []);

  function handlePrev() {
    const prev = SHARE_TEMPLATES[selectedIndex - 1];
    if (prev) {
      setSelectedId(prev.id);
      scrollToSlide(prev.id);
    }
  }
  function handleNext() {
    const next = SHARE_TEMPLATES[selectedIndex + 1];
    if (next) {
      setSelectedId(next.id);
      scrollToSlide(next.id);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          // Mobile bottom-sheet → desktop centered modal.
          className={cn(
            "fixed z-50 flex flex-col gap-0 bg-white dark:bg-zinc-950 shadow-2xl outline-none",
            // Mobile defaults: pinned to the bottom, full width, rounded top.
            "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl",
            // Desktop overrides: centered modal, capped width, rounded.
            "sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2",
            "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl",
            "sm:rounded-3xl sm:max-h-[92vh]",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            {t("share.title")}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t("share.subtitle")}
          </DialogPrimitive.Description>

          {/* Drag-handle (mobile only) — visual cue this is a sheet. */}
          <div
            aria-hidden
            className="sm:hidden mx-auto mt-2 mb-1 h-1.5 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800"
          />

          {/* Header */}
          <header
            className={cn(
              "relative flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4",
              "border-b border-zinc-100 dark:border-zinc-900",
            )}
          >
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(
                "absolute left-4 sm:left-6 top-1/2 -translate-y-1/2",
                "text-sm font-medium text-zinc-700 dark:text-zinc-200",
                "hover:text-zinc-900 dark:hover:text-white transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded",
              )}
            >
              {t("share.close")}
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50 truncate max-w-[60%]">
              {t("share.title")}
            </h2>
          </header>

          {/* Carousel */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="relative">
              {/* Desktop chevrons — hidden on touch / mobile */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={selectedIndex === 0}
                aria-label="Previous"
                className={cn(
                  "hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10",
                  "size-10 rounded-full items-center justify-center",
                  "bg-white/85 backdrop-blur shadow-md ring-1 ring-zinc-200",
                  "hover:bg-white transition disabled:opacity-30 disabled:pointer-events-none",
                  "dark:bg-zinc-900/85 dark:ring-zinc-800",
                )}
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={selectedIndex === SHARE_TEMPLATES.length - 1}
                aria-label="Next"
                className={cn(
                  "hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10",
                  "size-10 rounded-full items-center justify-center",
                  "bg-white/85 backdrop-blur shadow-md ring-1 ring-zinc-200",
                  "hover:bg-white transition disabled:opacity-30 disabled:pointer-events-none",
                  "dark:bg-zinc-900/85 dark:ring-zinc-800",
                )}
              >
                <ChevronRight className="size-5" />
              </button>

              {/* Scroll track */}
              <div
                ref={trackRef}
                className={cn(
                  "flex overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory",
                  "gap-3 sm:gap-4 px-[12%] sm:px-[18%] pt-4 pb-3",
                  // Drag-to-scroll affordance on devices with a cursor.
                  "cursor-grab active:cursor-grabbing select-none",
                  // Hide scrollbar but keep functionality
                  "[scrollbar-width:none] [-ms-overflow-style:none]",
                  "[&::-webkit-scrollbar]:hidden",
                )}
              >
                {SHARE_TEMPLATES.map((tpl) => (
                  <CarouselSlide
                    key={tpl.id}
                    descriptor={tpl}
                    workout={workout}
                    transparent={transparent && tpl.supportsTransparent}
                    active={selectedId === tpl.id}
                    wrappersRef={wrappersRef}
                    slideRefs={slideRefs}
                    onSelect={() => {
                      // Suppress click that fires at the end of a drag.
                      if (dragMovedRef.current) return;
                      setSelectedId(tpl.id);
                      scrollToSlide(tpl.id);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Caption — label, format, counter */}
            <div className="px-6 pt-2 pb-3 text-center flex flex-col items-center gap-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
                {t(`share.template.${selected.labelKey}.label`)}
              </p>
              <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {selectedIndex + 1} / {SHARE_TEMPLATES.length}
              </p>
            </div>

            {/* Transparent toggle — only when supported */}
            {selected.supportsTransparent && (
              <div className="px-4 sm:px-6 pb-3">
                <label
                  htmlFor="share-transparent"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer",
                    "bg-zinc-50 dark:bg-zinc-900/60 transition-colors",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-900",
                  )}
                >
                  <Switch
                    id="share-transparent"
                    checked={transparent}
                    onCheckedChange={setTransparent}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 leading-tight">
                      {t("share.transparent.label")}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                      {t("share.transparent.hint")}
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Actions */}
          <footer
            className={cn(
              "border-t border-zinc-100 dark:border-zinc-900",
              "px-4 sm:px-6 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-5",
              "bg-zinc-50/60 dark:bg-zinc-950/60",
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
              {t("share.shareOn")}
            </p>
            <div className="flex items-start justify-around gap-2">
              <ActionButton
                onClick={handleShare}
                disabled={!!busy}
                busy={busy === "share"}
                icon={<Share className="size-5" />}
                label={t("share.action.share")}
                primary
              />
              <ActionButton
                onClick={handleDownload}
                disabled={!!busy}
                busy={busy === "download"}
                icon={<Download className="size-5" />}
                label={t("share.action.download")}
              />
              <ActionButton
                onClick={handleCopy}
                disabled={!!busy || !copySupported}
                busy={busy === "copy"}
                icon={<Copy className="size-5" />}
                label={t("share.action.copy")}
                title={
                  !copySupported ? t("share.toast.copyUnsupported") : undefined
                }
              />
              <ActionButton
                onClick={handleCopyLink}
                disabled={!!busy}
                busy={busy === "copyLink"}
                icon={<Link2 className="size-5" />}
                label={t("share.action.copyLink")}
              />
            </div>
          </footer>

          {/* Top-right close button (desktop convention — alongside the
              left-aligned "Fermer" text button) */}
          <DialogPrimitive.Close
            className={cn(
              "hidden sm:flex absolute top-4 right-4 size-8 rounded-full",
              "items-center justify-center text-zinc-500",
              "hover:bg-zinc-100 hover:text-zinc-900 transition-colors",
              "dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            )}
            aria-label={t("share.close")}
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

interface CarouselSlideProps {
  descriptor: ShareTemplateDescriptor;
  workout: WorkoutTemplate;
  transparent: boolean;
  active: boolean;
  wrappersRef: React.MutableRefObject<Map<string, HTMLDivElement>>;
  slideRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  onSelect: () => void;
}

/**
 * One slide of the carousel. Renders the preview at a CSS-scaled size
 * that fits the available space while preserving aspect ratio. The native
 * 1080×{H} mount inside is what html-to-image captures.
 */
function CarouselSlide({
  descriptor,
  workout,
  transparent,
  active,
  wrappersRef,
  slideRefs,
  onSelect,
}: CarouselSlideProps) {
  const Tpl = descriptor.Component;
  const cellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  // Adapt scale to the cell size while preserving aspect ratio.
  useLayoutEffect(() => {
    const el = cellRef.current;
    if (!el) return;
    const update = () => {
      const cellW = el.clientWidth;
      const cellH = el.clientHeight;
      if (cellW <= 0 || cellH <= 0) return;
      const scaleByW = cellW / descriptor.width;
      const scaleByH = cellH / descriptor.height;
      setScale(Math.min(scaleByW, scaleByH));
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [descriptor.width, descriptor.height]);

  // Checker pattern behind transparent previews — makes the alpha obvious.
  const checkerStyle: React.CSSProperties = transparent
    ? {
        backgroundImage:
          "conic-gradient(at 50% 50%, #e5e7eb 25%, #ffffff 0 50%, #e5e7eb 0 75%, #ffffff 0)",
        backgroundSize: "20px 20px",
      }
    : { backgroundColor: "#f8fafc" };

  const scaledW = descriptor.width * scale;
  const scaledH = descriptor.height * scale;

  return (
    <div
      ref={(el) => {
        if (el) slideRefs.current.set(descriptor.id, el);
        else slideRefs.current.delete(descriptor.id);
      }}
      data-slide-id={descriptor.id}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "snap-center shrink-0 flex items-center justify-center",
        // Slide width — about 70% on mobile, 60% on desktop so a peek of
        // the neighbouring slides is visible on each side.
        "w-[72vw] sm:w-[58%]",
        "transition-transform duration-300",
        active ? "scale-100" : "scale-[0.94] opacity-80",
        // Pointer hint when not active — tells users they can click to
        // focus a peek slide.
        !active && "cursor-pointer",
      )}
    >
      <div
        ref={cellRef}
        className={cn(
          "relative w-full rounded-2xl overflow-hidden pointer-events-none",
          "transition-shadow duration-300",
          active
            ? "shadow-[0_24px_40px_-12px_rgba(15,23,42,0.32)] ring-2 ring-primary"
            : "shadow-[0_8px_18px_-8px_rgba(15,23,42,0.18)] ring-1 ring-zinc-200 dark:ring-zinc-800",
        )}
        style={{
          // Cap height so portrait templates (9:16) don't overflow the
          // dialog vertically on small screens.
          aspectRatio: `${descriptor.width} / ${descriptor.height}`,
          maxHeight: "min(56dvh, 420px)",
          ...checkerStyle,
        }}
      >
        {/* Scaled native-resolution mount — captured by html-to-image */}
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            width: scaledW,
            height: scaledH,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            ref={(el) => {
              if (el) wrappersRef.current.set(descriptor.id, el);
              else wrappersRef.current.delete(descriptor.id);
            }}
            style={{
              width: descriptor.width,
              height: descriptor.height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <Tpl workout={workout} transparent={transparent} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  title?: string;
}

/**
 * Round action button with icon on top and label underneath. Strava-style
 * social row entry.
 */
function ActionButton({
  onClick,
  disabled,
  busy,
  icon,
  label,
  primary,
  title,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex flex-col items-center gap-1.5 min-w-0 flex-1",
        "focus:outline-none group",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center size-12 sm:size-14 rounded-full transition",
          "shadow-sm",
          primary
            ? "bg-primary text-primary-foreground group-hover:opacity-90 group-active:scale-95"
            : "bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200 group-active:scale-95 dark:bg-zinc-800 dark:text-zinc-100 dark:group-hover:bg-zinc-700",
          disabled && "opacity-40 pointer-events-none",
          "group-focus-visible:ring-2 group-focus-visible:ring-primary/50",
        )}
      >
        {busy ? <Loader2 className="size-5 animate-spin" /> : icon}
      </span>
      <span
        className={cn(
          "text-[11px] sm:text-xs font-medium text-zinc-700 dark:text-zinc-300 text-center leading-tight",
          "max-w-[80px] truncate",
        )}
      >
        {label}
      </span>
    </button>
  );
}

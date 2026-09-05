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
  type CSSProperties,
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
      await navigator.clipboard.writeText(workoutShareUrl(workout));
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
          className="zn-share-dialog"
        >
          <DialogPrimitive.Title className="sr-only">
            {t("share.title")}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t("share.subtitle")}
          </DialogPrimitive.Description>

          {/* Drag-handle (mobile only) — visual cue this is a sheet. */}
          <div aria-hidden className="zn-share-dialog__grip" />

          {/* Header */}
          <header className="zn-share-dialog__header">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="zn-share-dialog__dismiss"
            >
              {t("share.close")}
            </button>
            <h2
              className="zn-title zn-truncate zn-share-dialog__title"
              data-level="4"
            >
              {t("share.title")}
            </h2>
          </header>

          {/* Carousel */}
          <div className="zn-share-dialog__body">
            <div className="zn-share-dialog__carousel">
              {/* Desktop chevrons — hidden on touch / mobile */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={selectedIndex === 0}
                aria-label="Previous"
                className="zn-share-dialog__arrow zn-share-dialog__arrow--prev"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={selectedIndex === SHARE_TEMPLATES.length - 1}
                aria-label="Next"
                className="zn-share-dialog__arrow zn-share-dialog__arrow--next"
              >
                <ChevronRight />
              </button>

              {/* Scroll track */}
              <div ref={trackRef} className="zn-share-dialog__track">
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
            <div className="zn-share-dialog__caption">
              <p className="zn-share-dialog__caption-label">
                {t(`share.template.${selected.labelKey}.label`)}
              </p>
              <p className="zn-kicker zn-kicker--inline zn-share-dialog__counter">
                {selectedIndex + 1} / {SHARE_TEMPLATES.length}
              </p>
            </div>

            {/* Transparent toggle — only when supported */}
            {selected.supportsTransparent && (
              <div className="zn-share-dialog__toggle">
                <label
                  htmlFor="share-transparent"
                  className="zn-row zn-card-hover zn-share-dialog__toggle-label"
                >
                  <Switch
                    id="share-transparent"
                    checked={transparent}
                    onCheckedChange={setTransparent}
                  />
                  <div
                    className="zn-stack"
                    style={{ "--gap": "var(--sp-1)" } as CSSProperties}
                  >
                    <span className="zn-label">
                      {t("share.transparent.label")}
                    </span>
                    <span className="zn-share-dialog__toggle-hint">
                      {t("share.transparent.hint")}
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Actions */}
          <footer className="zn-share-dialog__footer">
            <p className="zn-kicker zn-share-dialog__footer-kicker">
              {t("share.shareOn")}
            </p>
            <div className="zn-share-dialog__actions">
              <ActionButton
                onClick={handleShare}
                disabled={!!busy}
                busy={busy === "share"}
                icon={<Share />}
                label={t("share.action.share")}
                primary
              />
              <ActionButton
                onClick={handleDownload}
                disabled={!!busy}
                busy={busy === "download"}
                icon={<Download />}
                label={t("share.action.download")}
              />
              <ActionButton
                onClick={handleCopy}
                disabled={!!busy || !copySupported}
                busy={busy === "copy"}
                icon={<Copy />}
                label={t("share.action.copy")}
                title={
                  !copySupported ? t("share.toast.copyUnsupported") : undefined
                }
              />
              <ActionButton
                onClick={handleCopyLink}
                disabled={!!busy}
                busy={busy === "copyLink"}
                icon={<Link2 />}
                label={t("share.action.copyLink")}
              />
            </div>
          </footer>

          {/* Top-right close button (desktop convention — alongside the
              left-aligned "Fermer" text button) */}
          <DialogPrimitive.Close
            className="zn-dialog__close"
            aria-label={t("share.close")}
          >
            <X />
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
      // The slide width leaves a peek of the neighbours on each side; the
      // selected look reads off aria-pressed, which is already there.
      className="zn-share-dialog__slide"
    >
      <div
        ref={cellRef}
        className={cn(
          "zn-share-dialog__frame",
          // Checkerboard behind a transparent preview — makes the alpha
          // obvious. Both tones are paper tokens, so it inverts with the theme.
          transparent && "zn-share-dialog__frame--alpha",
        )}
        style={{
          // Cap height so portrait templates (9:16) don't overflow the
          // dialog vertically on small screens — the cap itself is in CSS.
          aspectRatio: `${descriptor.width} / ${descriptor.height}`,
        }}
      >
        {/* Scaled native-resolution mount — captured by html-to-image */}
        <div
          className="zn-share-dialog__mount"
          style={{ width: scaledW, height: scaledH }}
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
      className="zn-share-dialog__action"
    >
      <span
        className={cn(
          "zn-share-dialog__action-icon",
          primary && "zn-share-dialog__action-icon--primary",
        )}
      >
        {busy ? <Loader2 className="zn-share-dialog__spinner" /> : icon}
      </span>
      <span className="zn-share-dialog__action-label">{label}</span>
    </button>
  );
}

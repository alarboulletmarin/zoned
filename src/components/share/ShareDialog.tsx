/**
 * ShareDialog — picker + preview + actions.
 *
 * Renders the 5 share templates as a vertical stack (scaled to fit the
 * modal width). User selects one, optionally toggles transparent background,
 * then triggers download / copy / native Web Share.
 *
 * Each template is mounted at its native size inside a CSS-scaled wrapper
 * (`transform: scale(s)`). html-to-image ignores ancestor transforms when
 * capturing — the output PNG is always at full retina resolution.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Download, Copy, Share, Loader2, Check } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const [busy, setBusy] = useState<null | "download" | "copy" | "share">(null);
  const wrappersRef = useRef<Map<string, HTMLDivElement>>(new Map());

  const selected = useMemo(
    () => SHARE_TEMPLATES.find((tpl) => tpl.id === selectedId) ?? SHARE_TEMPLATES[0],
    [selectedId],
  );

  // The transparent toggle resets when switching to a template that can't
  // do transparent (zone-hero). UI shows it disabled in that state.
  useEffect(() => {
    if (!selected.supportsTransparent && transparent) {
      setTransparent(false);
    }
  }, [selected, transparent]);

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
      if (ok) {
        toast.success(t("share.toast.copied"), { id: toastId });
      } else {
        toast.error(t("share.toast.copyUnsupported"), { id: toastId });
      }
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
        method === "native" ? t("share.toast.shared") : t("share.toast.downloaded"),
        { id: toastId },
      );
    } catch (err) {
      // Cancelled native share = silent.
      if (err instanceof DOMException && err.name === "AbortError") {
        toast.dismiss(toastId);
      } else {
        toast.error(t("share.toast.error"), { id: toastId });
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* sm:max-w-3xl overrides the default sm:max-w-[500px] from
          components/ui/dialog.tsx — without the `sm:` prefix tailwind-merge
          keeps the more specific responsive class. */}
      <DialogContent
        className={cn(
          "w-[calc(100vw-1rem)] max-h-[92vh] overflow-hidden flex flex-col gap-0 p-0",
          "sm:w-full sm:max-w-3xl",
        )}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{t("share.title")}</DialogTitle>
          <DialogDescription>{t("share.subtitle")}</DialogDescription>
        </DialogHeader>

        {/* Scrollable template grid — single column on mobile, 2-col on
            tablet+. Each cell adapts its scale to the cell width via a
            ResizeObserver. */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            {SHARE_TEMPLATES.map((tpl) => (
              <TemplateRow
                key={tpl.id}
                descriptor={tpl}
                workout={workout}
                transparent={transparent && tpl.supportsTransparent}
                selected={selectedId === tpl.id}
                onSelect={() => setSelectedId(tpl.id)}
                wrappersRef={wrappersRef}
                labelKey={tpl.labelKey}
              />
            ))}
          </div>
        </div>

        {/* Footer: transparent toggle + actions */}
        <div className="border-t bg-muted/30 px-6 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <Switch
                  id="share-transparent"
                  checked={transparent}
                  onCheckedChange={setTransparent}
                  disabled={!selected.supportsTransparent}
                />
                <label
                  htmlFor="share-transparent"
                  className={cn(
                    "text-sm font-medium cursor-pointer select-none",
                    !selected.supportsTransparent && "opacity-50",
                  )}
                >
                  {t("share.transparent.label")}
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-12">
                {selected.supportsTransparent
                  ? t("share.transparent.hint")
                  : t("share.transparent.notForZoneHero")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!!busy}
              title={!copySupported ? t("share.toast.copyUnsupported") : undefined}
              // Subtle visual cue when unsupported, but the button stays
              // clickable so the user gets a toast explaining why.
              className={cn(!copySupported && "opacity-60")}
            >
              {busy === "copy" ? (
                <Loader2 className="size-4 mr-1.5 animate-spin" />
              ) : (
                <Copy className="size-4 mr-1.5" />
              )}
              {t("share.action.copy")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!!busy}
            >
              {busy === "download" ? (
                <Loader2 className="size-4 mr-1.5 animate-spin" />
              ) : (
                <Download className="size-4 mr-1.5" />
              )}
              {t("share.action.download")}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleShare}
              disabled={!!busy}
            >
              {busy === "share" ? (
                <Loader2 className="size-4 mr-1.5 animate-spin" />
              ) : (
                <Share className="size-4 mr-1.5" />
              )}
              {t("share.action.share")}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            {t("share.privacy")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TemplateRowProps {
  descriptor: ShareTemplateDescriptor;
  workout: WorkoutTemplate;
  transparent: boolean;
  selected: boolean;
  onSelect: () => void;
  wrappersRef: React.MutableRefObject<Map<string, HTMLDivElement>>;
  labelKey: string;
}

function TemplateRow({
  descriptor,
  workout,
  transparent,
  selected,
  onSelect,
  wrappersRef,
  labelKey,
}: TemplateRowProps) {
  const { t } = useTranslation("common");
  const Tpl = descriptor.Component;

  // Adapt the template's display scale to its actual cell width.
  // `useLayoutEffect` so we measure BEFORE paint — avoids the 0-scale flash
  // when the dialog opens. Outer height is locked by `aspect-ratio` so the
  // cell stays correctly sized even before the observer fires for the
  // first time (e.g. on later-scrolled-in items).
  const cellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(descriptor.width === 1200 ? 0.3 : 0.32);
  useLayoutEffect(() => {
    if (!cellRef.current) return;
    const el = cellRef.current;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / descriptor.width);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [descriptor.width]);

  // Render checkerboard behind the preview when transparent so users can
  // see the alpha channel clearly.
  const checkerStyle: React.CSSProperties = transparent
    ? {
        backgroundImage:
          "conic-gradient(at 50% 50%, #e5e7eb 25%, #ffffff 0 50%, #e5e7eb 0 75%, #ffffff 0)",
        backgroundSize: "20px 20px",
      }
    : { backgroundColor: "#f8fafc" };

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative w-full text-left rounded-2xl transition focus:outline-none p-3",
        "border border-border hover:border-primary/40",
        selected && "border-primary",
      )}
      style={{
        // Inset ring stays inside the button (no overflow), unlike `ring-*`.
        boxShadow: selected ? "inset 0 0 0 2px var(--primary)" : undefined,
      }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold leading-tight truncate">
            {t(`share.template.${labelKey}.label`)}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono truncate">
            {t(`share.template.${labelKey}.format`)}
          </span>
        </div>
        {selected && (
          <span className="inline-flex items-center text-primary shrink-0">
            <Check className="size-4" />
          </span>
        )}
      </div>

      {/* Preview container — cellRef measures available width; the inner
          template wrapper renders at native dimensions and is CSS-scaled
          down for display only. html-to-image still captures the native
          1080×{H} version at 2× pixel ratio. */}
      <div
        ref={cellRef}
        className="rounded-xl overflow-hidden border border-border w-full"
        style={{
          // aspect-ratio locks the height to the template's native ratio
          // even before the ResizeObserver fires — no 0-height collapse.
          aspectRatio: `${descriptor.width} / ${descriptor.height}`,
          ...checkerStyle,
        }}
      >
        <div
          ref={(el) => {
            if (el) {
              wrappersRef.current.set(descriptor.id, el);
            } else {
              wrappersRef.current.delete(descriptor.id);
            }
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
    </button>
  );
}

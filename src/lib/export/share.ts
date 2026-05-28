/**
 * Share pipeline for social-style workout images.
 *
 * Three exported actions, all running entirely client-side and sharing the
 * same `nodeToBlob()` helper:
 *  - downloadImage : trigger a browser download (always available)
 *  - copyImage     : write PNG to the system clipboard (Chromium / FF 127+ / Safari 16.4+)
 *  - shareImage    : native iOS/Android share sheet (Web Share API L2), download fallback
 *
 * Templates that support transparent export expose an internal `.bg-layer`
 * background that is hidden when their wrapper carries `data-transparent="true"`.
 * Passing `transparent: true` here just tells html-to-image to skip the white
 * canvas fill — alpha is preserved.
 */

import type { RefObject } from "react";

interface ToPngOptions {
  pixelRatio?: number;
  backgroundColor?: string;
  cacheBust?: boolean;
  skipFonts?: boolean;
}

type Target = HTMLElement | RefObject<HTMLElement | null>;

function resolveElement(target: Target): HTMLElement {
  const el = "current" in target ? target.current : target;
  if (!el) throw new Error("Share target element is not mounted");
  return el;
}

async function nodeToBlob(
  target: Target,
  transparent: boolean,
): Promise<Blob> {
  const element = resolveElement(target);
  const { toPng } = await import("html-to-image");
  const opts: ToPngOptions = {
    pixelRatio: 2,
    cacheBust: true,
    skipFonts: true,
  };
  if (!transparent) {
    opts.backgroundColor = "#f8fafc";
  }
  // When backgroundColor is omitted, html-to-image keeps the PNG alpha
  // channel — exactly what we want for overlays.
  const dataUrl = await toPng(element, opts);
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function downloadImage(
  target: Target,
  filename: string,
  transparent: boolean,
): Promise<void> {
  const blob = await nodeToBlob(target, transparent);
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Returns true when the browser exposes the Clipboard image-write API. */
export function isCopySupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.write === "function" &&
    typeof ClipboardItem !== "undefined"
  );
}

export async function copyImage(
  target: Target,
  transparent: boolean,
): Promise<boolean> {
  if (!isCopySupported()) return false;

  // Safari (iOS + macOS) requires `clipboard.write()` to run inside the same
  // user-activation tick as the click. Awaiting `nodeToBlob()` first (~500ms
  // for html-to-image) drops that activation and the write is rejected as
  // "Document is not focused" / "NotAllowedError".
  //
  // The standard workaround: hand `ClipboardItem` a *Promise<Blob>* directly,
  // so the browser preserves the activation context while waiting for the
  // image to be ready. Chromium and Firefox accept this too; older Safari
  // (<15.4) falls through to the legacy path.
  try {
    const item = new ClipboardItem({
      "image/png": nodeToBlob(target, transparent),
    });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    // Some browsers (older Safari, some Android WebViews) reject a Promise
    // inside ClipboardItem. Fall back to the legacy two-step pattern.
    if (err instanceof DOMException && err.name === "NotAllowedError") {
      throw err;
    }
    const blob = await nodeToBlob(target, transparent);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  }
}

export type ShareMethod = "native" | "download";

export async function shareImage(
  target: Target,
  filename: string,
  transparent: boolean,
): Promise<ShareMethod> {
  const blob = await nodeToBlob(target, transparent);
  const file = new File([blob], filename, { type: "image/png" });

  // Web Share Level 2 — only on HTTPS/mobile most of the time.
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      // Image-only payload: no `title`, no `text`. iOS's share-sheet
      // "Copy" option pastes the *whole* ShareData (title + image), so a
      // title here ends up in the user's clipboard alongside the picture.
      // Instagram Stories goes further and prefers text over the file
      // entirely. Stripping both fields forces every receiving app —
      // copy, Stories, Mail, Messages — to treat the image as the only
      // asset. The filename on the File object (e.g. "zoned-REC-001.png")
      // already gives apps a sensible label.
      await navigator.share({ files: [file] });
      return "native";
    } catch (err) {
      // AbortError = user cancelled the native sheet; surface as cancellation.
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      // Any other failure falls back to download so the user still gets the image.
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
  return "download";
}

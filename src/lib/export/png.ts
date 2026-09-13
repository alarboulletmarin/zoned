/**
 * PNG Export - Image format
 *
 * Captures a DOM element as a high-resolution PNG.
 */

import type { RefObject } from "react";
import { THEME_COLOR, documentTheme } from "@/lib/theme";
import { triggerDownload } from "./download";

/**
 * Le fond de la capture suit le theme peint.
 *
 * Il etait fixe a `#ffffff`, ce qui allait tant que l'app n'avait qu'un
 * theme. En theme sombre, la capture posait une carte sombre sur une page
 * blanche : le titre gris clair de la carte et le texte de ses puces se
 * retrouvaient blanc sur blanc, et l'image exportee etait illisible la ou elle
 * l'etait parfaitement a l'ecran. On rend donc ce que l'utilisateur voit.
 */
function exportBackground(): string {
  return THEME_COLOR[documentTheme()];
}

/**
 * Export an HTML element as a PNG image.
 *
 * @param elementOrRef - HTML element or React ref to capture
 * @param basename - Filename without its extension
 * @returns The filename handed to the browser
 */
export async function exportToPNG(
  elementOrRef: HTMLElement | RefObject<HTMLElement | null>,
  basename: string
): Promise<string> {
  // Handle both direct element and ref
  const element =
    "current" in elementOrRef ? elementOrRef.current : elementOrRef;

  if (!element) {
    throw new Error("Element is not available");
  }

  const { toPng } = await import("html-to-image");

  const dataUrl = await toPng(element, {
    pixelRatio: 2, // 2x resolution for retina quality
    backgroundColor: exportBackground(),
    cacheBust: true,
    skipFonts: true, // Skip font embedding to avoid errors with undefined fonts
    style: {
      // Ensure element is fully visible during capture
      margin: "0",
    },
  });

  return triggerDownload(dataUrl, `${basename}.png`);
}

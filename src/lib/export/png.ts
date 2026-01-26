/**
 * PNG Export - Image format
 *
 * Captures workout visualization as high-resolution PNG
 */

import { toPng } from "html-to-image";
import type { RefObject } from "react";

/**
 * Export an HTML element as PNG image
 *
 * @param elementOrRef - HTML element or React ref to capture
 * @param workoutId - Used for the filename
 * @returns Promise that resolves when download is triggered
 */
export async function exportToPNG(
  elementOrRef: HTMLElement | RefObject<HTMLElement | null>,
  workoutId: string
): Promise<void> {
  // Handle both direct element and ref
  const element =
    "current" in elementOrRef ? elementOrRef.current : elementOrRef;

  if (!element) {
    throw new Error("Element is not available");
  }

  const dataUrl = await toPng(element, {
    pixelRatio: 2, // 2x resolution for retina quality
    backgroundColor: "#ffffff", // Ensure white background
    cacheBust: true,
    skipFonts: true, // Skip font embedding to avoid errors with undefined fonts
    style: {
      // Ensure element is fully visible during capture
      margin: "0",
    },
  });

  // Trigger download
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${workoutId}-workout.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

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

interface ExportToPNGOptions {
  /**
   * Marge interieure, en pixels, posee sur la capture seulement.
   *
   * Un bloc pris dans la page est colle a ses bords une fois isole, alors
   * qu'a l'ecran il respire dans la mise en page autour de lui. Les surfaces
   * qui portent deja leur propre paper (le tableau de splits) n'en ont pas
   * besoin ; un bloc transparent, comme la structure d'une seance, oui.
   */
  padding?: number;
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
  basename: string,
  options: ExportToPNGOptions = {},
): Promise<string> {
  // Handle both direct element and ref
  const element =
    "current" in elementOrRef ? elementOrRef.current : elementOrRef;

  if (!element) {
    throw new Error("Element is not available");
  }

  const { toPng } = await import("html-to-image");
  const padding = options.padding ?? 0;

  const dataUrl = await toPng(element, {
    pixelRatio: 2, // 2x resolution for retina quality
    backgroundColor: exportBackground(),
    cacheBust: true,
    // Les polices SONT embarquees, et c'est ce qui rend la capture fidele.
    // `skipFonts: true` promettait d'eviter des erreurs de police indefinie ;
    // ce qu'il faisait vraiment, c'est rendre chaque export dans la fonte de
    // repli du systeme, plus large que la vraie : le texte se remettait en
    // page dans la capture, les titres de phases passaient sur deux lignes et
    // chevauchaient leur resume. Les trois fontes de l'app sont servies par
    // l'app elle-meme (`public/fonts/`, 130 Ko au total), donc il n'y a ni
    // requete tierce ni CORS a craindre ici.
    skipFonts: false,
    // La toile doit grandir de la marge, sinon la marge la mange.
    // html-to-image dimensionne la capture sur `offsetWidth`/`offsetHeight`
    // mesures AVANT d'appliquer `style` : une marge posee la seulement
    // retrecissait la largeur disponible sans agrandir l'image, donc le bloc
    // se remettait en page dans moins de place et debordait par la droite.
    ...(padding > 0
      ? {
          width: element.offsetWidth + padding * 2,
          height: element.offsetHeight + padding * 2,
        }
      : {}),
    style: {
      // Ensure element is fully visible during capture
      margin: "0",
      ...(padding > 0
        ? {
            padding: `${padding}px`,
            // La marge s'ajoute AUTOUR de la largeur mesuree, elle ne la
            // rogne pas : la mise en page capturee est celle de l'ecran.
            boxSizing: "content-box",
          }
        : {}),
    },
  });

  return triggerDownload(dataUrl, `${basename}.png`);
}

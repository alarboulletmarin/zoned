import QRCode from "qrcode";

/** Un code QR prêt à dessiner : tracé SVG des modules sombres, marge blanche comprise. */
export interface QrImage {
  /** Côté en modules, marge comprise (viewBox). */
  size: number;
  path: string;
}

/** Marge blanche imposée par la norme, en modules. */
const QUIET = 4;

/**
 * Dessine chaque texte avec une correction d'erreur moyenne. Tous les codes
 * ont la même taille, celle du plus gros, pour que l'image ne saute pas d'une
 * trame à l'autre pendant le défilement.
 */
export function qrImages(texts: readonly string[]): QrImage[] {
  const errorCorrectionLevel = "M";
  const version = Math.max(
    1,
    ...texts.map((text) => QRCode.create(text, { errorCorrectionLevel }).version),
  );
  return texts.map((text) => {
    const { modules } = QRCode.create(text, { errorCorrectionLevel, version });
    const n = modules.size;
    let path = "";
    for (let row = 0; row < n; row++) {
      // Une barre par suite de modules sombres : bien moins de tracé qu'un carré par module
      for (let col = 0; col < n; col++) {
        if (!modules.get(row, col)) continue;
        let end = col;
        while (end + 1 < n && modules.get(row, end + 1)) end++;
        path += `M${col + QUIET} ${row + QUIET}h${end - col + 1}v1h${col - end - 1}z`;
        col = end;
      }
    }
    return { size: n + 2 * QUIET, path };
  });
}

/**
 * Shared chrome bits for share templates: the mark, the footer
 * (zoned.run · workout id) and the transparent-aware background layer.
 */

import type { CSSProperties } from "react";
import Logo from "@/assets/logo.svg?react";
import type { WorkoutTemplate } from "@/types";
import { ZONE_HEX_LIGHT } from "@/lib/zoneColors";

/**
 * Le rapport du `viewBox` de `src/assets/logo.svg`, recopié.
 *
 * Il est recopié parce qu'un SVG importé en `?react` est un composant : on ne
 * peut pas lire son cadre à l'exécution. `brand-mark.test.ts` lit le fichier
 * et garde ce nombre — même motif que `src/assets/doodles/frames.test.ts`
 * pour les cadres des dessins.
 */
export const LOGO_RATIO = 3.807;

interface BrandMarkProps {
  /** Hauteur du DESSIN en px. La largeur suit le rapport naturel du mot. */
  height: number;
  /** Encre des lettres. Le SVG suit `currentColor`. */
  color?: string;
  /** Couleur du point. Vermillon par défaut. */
  dot?: string;
  opacity?: number;
  style?: CSSProperties;
}

/**
 * Le logo : le mot « zoned. », vectorisé.
 *
 * Ces gabarits rendent en PNG via `html-to-image` avec `skipFonts: true`
 * (src/lib/shareImage.ts) : un texte stylé y tombe dans la police système du
 * navigateur — c'est pourquoi ils affichaient tous « ZONED » en Arial gras à
 * côté d'un zigzag. Un SVG inliné, lui, passe intact. Le nom est donc DANS le
 * dessin, et plus à côté.
 *
 * On dimensionne par la hauteur seule : donner une largeur ET une hauteur qui
 * ne sont pas au rapport du mot le fait flotter au milieu de sa boîte
 * (`preserveAspectRatio`). Les dix-sept appels d'origine passaient une boîte
 * 2:1 pour un mot qui en fait 3,8.
 */
export function BrandMark({ height, color, dot, opacity, style }: BrandMarkProps) {
  return (
    <Logo
      style={
        {
          width: height * LOGO_RATIO,
          height,
          display: "block",
          flex: "none",
          ...(color ? { color } : null),
          ...(dot ? { "--accent": dot } : null),
          ...(opacity !== undefined ? { opacity } : null),
          ...style,
        } as CSSProperties
      }
    />
  );
}

interface BrandStripProps {
  scale?: number;
  /** Mark in paper white, for use over a dark/coloured background. */
  inverted?: boolean;
}

/**
 * La bande de marque : le mot, et rien d'autre.
 *
 * Elle portait le zigzag ET le mot en texte. Le zigzag est parti avec le logo,
 * et le mot en texte était le doublon du mot dessiné. 34 px de dessin par unité
 * d'échelle donnent la même hauteur d'œil que les 32 px de texte qu'elle
 * portait — la hampe du « d » compte pour le reste du cadre.
 *
 * En renversé, **le point passe au papier lui aussi**. Vu sur le rendu : les
 * cartes qui demandent `inverted` sont posées sur la couleur de zone, et pour
 * la Z5 c'est un rouge sombre — le point vermillon y disparaissait. La règle de
 * la maison (un seul aplat d'accent) est de toute façon déjà dépensée par le
 * fond de ces cartes ; le mot entier en papier est le verrou renversé normal.
 */
export function BrandStrip({ scale = 1, inverted = false }: BrandStripProps) {
  return (
    <BrandMark
      height={34 * scale}
      color={inverted ? "#ffffff" : "#0f172a"}
      dot={inverted ? "#ffffff" : undefined}
    />
  );
}

interface ShareFooterProps {
  workout: WorkoutTemplate;
  /** Font size in px (base ~ 18). */
  size?: number;
  /** Mute when laid over a coloured/zone-hero background. */
  inverted?: boolean;
}

/** Discreet "zoned.run · WORKOUT-ID" footer common to every template. */
export function ShareFooter({ workout, size = 18, inverted = false }: ShareFooterProps) {
  const color = inverted ? "rgba(255,255,255,0.85)" : "#64748b";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "0.04em",
        color,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      <span>zoned.run</span>
      <span>{workout.id}</span>
    </div>
  );
}

/**
 * `bg-zone-N/15` equivalents for use in inline styles. Mirrors the pattern
 * `bg-zone-N/15 + text-zone-N` used throughout the app (HomePage.tsx).
 */
export const ZONE_BG_TINT: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "rgba(148, 163, 184, 0.15)",
  2: "rgba(22, 163, 74, 0.13)",
  3: "rgba(202, 138, 4, 0.14)",
  4: "rgba(249, 115, 22, 0.13)",
  5: "rgba(239, 68, 68, 0.12)",
  6: "rgba(124, 58, 237, 0.13)",
};

/**
 * Public URL for a workout, used by QR codes on share templates.
 *
 * Re-exported rather than reimplemented: a custom workout needs its link to
 * carry the workout itself, and a QR pointing at `/workout/CUSTOM-x` scans to
 * "séance non trouvée" on anyone else's phone.
 */
export { publicWorkoutUrl as workoutShareUrl } from "@/lib/share/workoutShare";

/**
 * Share images render on their own light background regardless of the app
 * theme, so they pin the light ramp deliberately. What was not deliberate was
 * keeping a private copy of the values: this now tracks the shared table, and
 * scripts/qa-zone-colors.ts keeps that table honest against themes.css.
 */
export const ZONE_HEX = ZONE_HEX_LIGHT;

interface BgLayerProps {
  /** Inline background CSS (defaults to `#f8fafc`). */
  background?: string;
}

/**
 * Editorial background that fills its positioned parent. Hidden by the
 * wrapper's `data-transparent="true"` attribute so html-to-image captures
 * with alpha = 0 outside the painted content.
 */
export function BgLayer({ background = "#f8fafc" }: BgLayerProps) {
  return (
    <div
      data-bg-layer
      style={{
        position: "absolute",
        inset: 0,
        background,
        zIndex: 0,
      }}
    />
  );
}

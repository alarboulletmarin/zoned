/**
 * Registry of social share templates.
 *
 * Adding a new template = create a component under ./templates and append
 * an entry here. ShareDialog reads this list to render the picker grid.
 */

import type { ComponentType } from "react";
import type { WorkoutTemplate } from "@/types";

import { StoryHero } from "./templates/StoryHero";
import { SquareStats } from "./templates/SquareStats";
import { LandscapeWide } from "./templates/LandscapeWide";
import { MinimalTypo } from "./templates/MinimalTypo";
import { ZoneHero } from "./templates/ZoneHero";
import { HeartbeatECG } from "./templates/HeartbeatECG";
import { MagazineCover } from "./templates/MagazineCover";
import { DiagonalSplit } from "./templates/DiagonalSplit";
import { ReceiptTicket } from "./templates/ReceiptTicket";
import { QRCard } from "./templates/QRCard";
import { BibCard } from "./templates/BibCard";
import { SpotifyWrap } from "./templates/SpotifyWrap";
import { BoardingPass } from "./templates/BoardingPass";
import { Postcard } from "./templates/Postcard";
import { MoviePoster } from "./templates/MoviePoster";
import { SneakerDrop } from "./templates/SneakerDrop";
import { HighlightBanner } from "./templates/HighlightBanner";
import { CornerStamp } from "./templates/CornerStamp";
import { SpotifyWrapSquare } from "./templates/SpotifyWrapSquare";
import { BadgeChip } from "./templates/BadgeChip";

export interface ShareTemplateProps {
  workout: WorkoutTemplate;
  transparent: boolean;
}

export interface ShareTemplateDescriptor {
  id: string;
  /** i18n key under `share.template.<id>` for label + format. */
  labelKey: string;
  /** Native width in CSS pixels. */
  width: number;
  /** Native height in CSS pixels. */
  height: number;
  /** Whether the template can render without its background layer. */
  supportsTransparent: boolean;
  Component: ComponentType<ShareTemplateProps>;
}

export const SHARE_TEMPLATES: ShareTemplateDescriptor[] = [
  {
    id: "story-hero",
    labelKey: "storyHero",
    width: 1080,
    height: 1920,
    supportsTransparent: true,
    Component: StoryHero,
  },
  {
    id: "square-stats",
    labelKey: "squareStats",
    width: 1080,
    height: 1080,
    supportsTransparent: true,
    Component: SquareStats,
  },
  {
    id: "landscape-wide",
    labelKey: "landscapeWide",
    width: 1200,
    height: 675,
    supportsTransparent: true,
    Component: LandscapeWide,
  },
  {
    id: "minimal-typo",
    labelKey: "minimalTypo",
    width: 1080,
    height: 1080,
    supportsTransparent: true,
    Component: MinimalTypo,
  },
  {
    id: "zone-hero",
    labelKey: "zoneHero",
    width: 1080,
    height: 1920,
    supportsTransparent: false,
    Component: ZoneHero,
  },
  {
    id: "heartbeat-ecg",
    labelKey: "heartbeatEcg",
    width: 1080,
    height: 1920,
    supportsTransparent: true,
    Component: HeartbeatECG,
  },
  {
    id: "magazine-cover",
    labelKey: "magazineCover",
    width: 1080,
    height: 1920,
    supportsTransparent: true,
    Component: MagazineCover,
  },
  {
    id: "diagonal-split",
    labelKey: "diagonalSplit",
    width: 1080,
    height: 1080,
    // The colored half (linear-gradient) is part of the visual, so
    // transparent removes only the off-white side. Acceptable overlay.
    supportsTransparent: true,
    Component: DiagonalSplit,
  },
  {
    id: "receipt-ticket",
    labelKey: "receiptTicket",
    width: 1080,
    height: 1920,
    supportsTransparent: true,
    Component: ReceiptTicket,
  },
  {
    id: "qr-card",
    labelKey: "qrCard",
    width: 1080,
    height: 1080,
    supportsTransparent: true,
    Component: QRCard,
  },
  {
    id: "bib-card",
    labelKey: "bibCard",
    width: 1080,
    height: 1080,
    supportsTransparent: true,
    Component: BibCard,
  },
  {
    id: "spotify-wrap",
    labelKey: "spotifyWrap",
    width: 1080,
    height: 1920,
    // Background gradient is the visual signature — transparent would gut it.
    supportsTransparent: false,
    Component: SpotifyWrap,
  },
  {
    id: "boarding-pass",
    labelKey: "boardingPass",
    width: 1080,
    height: 1920,
    supportsTransparent: true,
    Component: BoardingPass,
  },
  {
    id: "postcard",
    labelKey: "postcard",
    width: 1080,
    height: 1920,
    // Parchment background is the look — overlay mode would feel wrong.
    supportsTransparent: false,
    Component: Postcard,
  },
  {
    id: "movie-poster",
    labelKey: "moviePoster",
    width: 1080,
    height: 1920,
    // Dark canvas is the look.
    supportsTransparent: false,
    Component: MoviePoster,
  },
  {
    id: "sneaker-drop",
    labelKey: "sneakerDrop",
    width: 1080,
    height: 1920,
    supportsTransparent: true,
    Component: SneakerDrop,
  },
  // Compact sticker overlays — designed to be pasted on the user's own
  // photo. All transparent-friendly.
  {
    id: "highlight-banner",
    labelKey: "highlightBanner",
    width: 1080,
    height: 360,
    supportsTransparent: true,
    Component: HighlightBanner,
  },
  {
    id: "corner-stamp",
    labelKey: "cornerStamp",
    width: 480,
    height: 480,
    supportsTransparent: true,
    Component: CornerStamp,
  },
  {
    id: "spotify-wrap-square",
    labelKey: "spotifyWrapSquare",
    width: 1080,
    height: 1080,
    supportsTransparent: false,
    Component: SpotifyWrapSquare,
  },
  {
    id: "badge-chip",
    labelKey: "badgeChip",
    width: 480,
    height: 480,
    supportsTransparent: true,
    Component: BadgeChip,
  },
];

export function getTemplate(id: string): ShareTemplateDescriptor | undefined {
  return SHARE_TEMPLATES.find((t) => t.id === id);
}

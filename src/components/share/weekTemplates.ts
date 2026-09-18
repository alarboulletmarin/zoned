/**
 * The week's share images, in the four sizes a week gets posted or sent at.
 * Same shape of registry as `shareTemplates.ts`; `WeekShareDialog` hands the
 * list to the generic sheet.
 */

import type { ShareSheetTemplate } from "./ShareSheet";
import type { WeekShareProps } from "./templates/week/_week";
import { WeekLandscape } from "./templates/week/WeekLandscape";
import { WeekSheet } from "./templates/week/WeekSheet";
import { WeekSquare } from "./templates/week/WeekSquare";
import { WeekStory } from "./templates/week/WeekStory";

export type WeekShareSubject = Omit<WeekShareProps, "transparent">;

export const WEEK_SHARE_TEMPLATES: ShareSheetTemplate<WeekShareSubject>[] = [
  {
    id: "week-sheet",
    labelKey: "weekSheet",
    width: 1080,
    height: 1350,
    supportsTransparent: true,
    Component: WeekSheet,
  },
  {
    id: "week-square",
    labelKey: "weekSquare",
    width: 1080,
    height: 1080,
    supportsTransparent: true,
    Component: WeekSquare,
  },
  {
    id: "week-landscape",
    labelKey: "weekLandscape",
    width: 1200,
    height: 675,
    supportsTransparent: true,
    Component: WeekLandscape,
  },
  {
    id: "week-story",
    labelKey: "weekStory",
    width: 1080,
    height: 1920,
    supportsTransparent: true,
    Component: WeekStory,
  },
];

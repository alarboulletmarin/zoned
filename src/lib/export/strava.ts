/**
 * Strava share-text builder.
 *
 * Produces a plain-text block (title + workout breakdown + canonical link)
 * the user copies to their clipboard and pastes into the description of a
 * Strava activity. No GPS/GPX is included: Strava can't accept a track
 * pasted as text, so that stays out of scope for this MVP.
 */

import type { WorkoutTemplate } from "@/types";
import { pickLang } from "@/lib/i18n-utils";
import { publicWorkoutUrl } from "@/lib/share/workoutShare";
import { formatWorkoutDescription } from "./ics";

/**
 * Build the Strava share text for a running workout: title, then the shared
 * description breakdown, then a `via <url>` footer linking back to the
 * session. Language follows the active i18n locale via `pickLang()`.
 */
export function buildStravaShareText(workout: WorkoutTemplate): string {
  const title = pickLang(workout, "name");
  const body = formatWorkoutDescription(workout);
  const footer = `via ${publicWorkoutUrl(workout)}`;

  return `${title}\n\n${body}\n\n${footer}`;
}

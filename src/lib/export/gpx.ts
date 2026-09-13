/**
 * GPX 1.1 exporter for generated routes. The format is the de-facto
 * standard for runners and cyclists exporting tracks to Garmin, Coros,
 * Strava, Komoot, etc.
 *
 * The output stays minimal, track only, no per-point timestamps,
 * because Brouter doesn't return wall-clock data and Zoned doesn't
 * record activities.
 */

import type { Route, RouteCoordinate } from "@/types/route";
import { triggerDownload } from "./download";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatTrackPoint(point: RouteCoordinate): string {
  const [lon, lat, alt] = point;
  const ele = alt != null ? `      <ele>${alt.toFixed(1)}</ele>\n` : "";
  return `    <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}">\n${ele}    </trkpt>`;
}

/**
 * Serialise a {@link Route} into a GPX 1.1 document string. The route's
 * stored name and discipline are included as track metadata so importers
 * can preserve them.
 */
export function routeToGpx(route: Route): string {
  const points = route.points.map(formatTrackPoint).join("\n");
  const safeName = escapeXml(route.name);
  const time = route.generatedAt;

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Zoned (zoned.run)" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${safeName}</name>
    <time>${time}</time>
    <type>${escapeXml(route.discipline)}</type>
  </metadata>
  <trk>
    <name>${safeName}</name>
    <type>${escapeXml(route.discipline)}</type>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>
`;
}

/**
 * Trigger a download of the GPX file in the browser.
 * @returns the suggested filename used for the download.
 */
export function downloadRouteGpx(route: Route): string {
  const blob = new Blob([routeToGpx(route)], { type: "application/gpx+xml" });
  const safeName = route.name.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 60) || "route";

  return triggerDownload(blob, `${safeName}.gpx`);
}

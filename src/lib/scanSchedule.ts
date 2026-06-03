/**
 * Geometric "scan" schedule shared by the session draw and the week generator.
 *
 * Returns elapsed-ms timestamps whose gaps grow geometrically, so a flashing
 * card animation starts fast and decelerates (ease-out) before settling on the
 * final pick. Extracted from DrawSessionPage's runDraw so the week generator can
 * reuse the exact same timing the draw animation uses.
 */
export function buildScanSchedule(
  total = 1500,
  gap0 = 45,
  growth = 1.14,
): number[] {
  const times: number[] = [];
  let elapsed = 0;
  let gap = gap0;
  while (elapsed < total) {
    times.push(elapsed);
    elapsed += gap;
    gap *= growth;
  }
  return times;
}

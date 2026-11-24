/** About 3 % of effort per % of incline (the formula the page always used). */
const EFFORT_PER_INCLINE_PCT = 0.03;

/** Flat-ground speed (km/h) that costs the same effort as `speedKmh` at `inclinePct`. */
export function treadmillToFlatKmh(speedKmh: number, inclinePct: number): number {
  return speedKmh * (1 + EFFORT_PER_INCLINE_PCT * inclinePct);
}

/** Inverse: the speed to set on the treadmill at `inclinePct` for a given flat speed. */
export function flatToTreadmillKmh(flatKmh: number, inclinePct: number): number {
  return flatKmh / (1 + EFFORT_PER_INCLINE_PCT * inclinePct);
}

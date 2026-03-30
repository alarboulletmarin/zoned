/**
 * Shared plan utilities.
 *
 * getCurrentWeek parses the date string as local midnight to avoid
 * UTC/local timezone mismatches that could shift the result by one day
 * (and therefore one week) near week boundaries.
 */

export function getCurrentWeek(dateStr: string): number {
  // Parse as local date components to avoid UTC offset issues
  const dateOnly = dateStr.split("T")[0];
  const [y, m, d] = dateOnly.split("-").map(Number);
  const start = new Date(y, m - 1, d); // local midnight

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // local midnight

  const diffMs = today.getTime() - start.getTime();
  // Math.round absorbs potential DST transitions (±1 h)
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

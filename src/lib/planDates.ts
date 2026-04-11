export function calculateWeeksBetweenDates(startDate: string, endDate: string): number {
  const [startYear, startMonth, startDay] = startDate.split("T")[0].split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("T")[0].split("-").map(Number);

  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  const diffMs = end.getTime() - start.getTime();

  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

export function buildRacePlanDateRange(startDate: string | undefined, raceDate: string): {
  startDate?: string;
  endDate?: string;
} {
  if (!startDate) return {};

  return {
    startDate,
    endDate: raceDate,
  };
}

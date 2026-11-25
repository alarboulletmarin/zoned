import { describe, expect, test } from "bun:test";

import { generatePlan } from "@/lib/planGenerator";
import {
  buildCatalogueLookup,
  describeIssue,
  formatIssueReport,
  importConfigToPlanConfig,
  loadAgentCatalogue,
  parseDuration,
  parsePace,
  planImportParamsUrl,
  readImportParams,
  validateImportParams,
  type ImportIssue,
  type ImportParams,
  type ValidationResult,
} from "@/lib/agentApi";

const lookup = buildCatalogueLookup(await loadAgentCatalogue());
const opts = { today: "2026-11-25" };

/** The request from the audit: a 10K in 1h10 on 3 January, three runs a week. */
const AUDIT: ImportParams = { distance: "10K", date: "2027-01-03", days: "3", time: "1:10:00" };

function payloadOf(result: ValidationResult) {
  if (!result.ok) throw new Error(`rejected: ${formatIssueReport(result.errors)}`);
  if (result.payload.kind !== "config") throw new Error("expected a config payload");
  return result.payload;
}

function errorsOf(result: ValidationResult): ImportIssue[] {
  if (result.ok) throw new Error("expected the link to be rejected");
  return result.errors;
}

const check = (params: ImportParams) => validateImportParams(params, lookup, opts);

describe("reading the link", () => {
  test("the fragment holds the parameters, keys read case-insensitively", () => {
    expect(readImportParams("#distance=10K&date=2027-01-03&Days=3")).toEqual({
      distance: "10K",
      date: "2027-01-03",
      days: "3",
    });
  });

  test("the query is a fallback, and lang belongs to the page", () => {
    expect(readImportParams("", "?lang=en&distance=semi&date=2027-04-11&days=4")).toEqual({
      distance: "semi",
      date: "2027-04-11",
      days: "4",
    });
    expect(readImportParams("#distance=5K", "?distance=marathon")).toEqual({ distance: "5K" });
    expect(readImportParams("", "?lang=en")).toBeNull();
  });

  test("an encoded link is not a flat one", () => {
    expect(readImportParams("#d=eyJ2IjoxfQ")).toBeNull();
    expect(readImportParams("#j=%7B%7D")).toBeNull();
    expect(readImportParams("")).toBeNull();
  });

  test("a written link reads back to the same parameters", () => {
    const url = planImportParamsUrl({ distance: "10K", date: "2027-01-03", days: 3, time: "1:10:00", name: "10 km de Noël" }, "en");
    expect(url).toBe(
      "https://zoned.run/plan/import?lang=en#distance=10K&date=2027-01-03&days=3&time=1:10:00&name=10%20km%20de%20No%C3%ABl",
    );
    const parsed = new URL(url);
    expect(readImportParams(parsed.hash, parsed.search)).toEqual({
      distance: "10K",
      date: "2027-01-03",
      days: "3",
      time: "1:10:00",
      name: "10 km de Noël",
    });
  });
});

describe("values", () => {
  test("paces", () => {
    expect(parsePace("7")).toBe(7);
    expect(parsePace("6:45")).toBe(6.75);
    expect(parsePace("6'45")).toBe(6.75);
    expect(parsePace("6:45/km")).toBe(6.75);
    expect(parsePace("6:45 min/km")).toBe(6.75);
    expect(parsePace("6,5")).toBe(6.5);
    expect(parsePace("fast")).toBeNull();
    expect(parsePace("6:75")).toBeNull();
  });

  test("durations", () => {
    expect(parseDuration("1:10:00")).toBe(70);
    expect(parseDuration("45:30")).toBe(45.5);
    expect(parseDuration("1h10")).toBe(70);
    expect(parseDuration("1h10m30s")).toBe(70.5);
    expect(parseDuration("3h")).toBe(180);
    expect(parseDuration("45min")).toBe(45);
    // A bare number is minutes or hours: refused rather than guessed.
    expect(parseDuration("70")).toBeNull();
    expect(parseDuration("soon")).toBeNull();
  });
});

describe("params to config", () => {
  test("the audit's request becomes a plan, with the two defaults reported", async () => {
    const result = check(AUDIT);
    const payload = payloadOf(result);
    expect(payload).toMatchObject({
      raceDistance: "10K",
      raceDate: "2027-01-03",
      daysPerWeek: 3,
      level: "intermediate",
      longRunDay: 6,
      goal: "time",
      targetPaceMinKm: 7,
    });
    expect(result.warnings.map((w) => [w.code, w.path])).toEqual([
      ["default_applied", "level"],
      ["default_applied", "longrun"],
    ]);
    expect(describeIssue(result.warnings[1], "fr")).toBe("longrun absent, valeur par défaut : sun.");

    const plan = await generatePlan({ ...importConfigToPlanConfig(payload), id: "t", createdAt: "2026-11-25T00:00:00Z" });
    expect(plan.weeks.length).toBeGreaterThan(0);
  });

  test("lenient spellings", () => {
    const payload = payloadOf(
      check({ distance: "half-marathon", date: "2027-04-11", days: "4", level: "Beginner", longrun: "Samedi", pace: "6'15", strength: "2", vma: "13,5" }),
    );
    expect(payload).toMatchObject({
      raceDistance: "semi",
      level: "beginner",
      longRunDay: 5,
      targetPaceMinKm: 6.25,
      includeStrength: true,
      strengthPerWeek: 2,
      vma: 13.5,
    });
    expect(payloadOf(check({ ...AUDIT, time: undefined as never, strength: "0" })).includeStrength).toBe(false);
  });

  test("every field of the config form has a parameter", () => {
    const payload = payloadOf(
      check({
        distance: "trail",
        date: "2027-06-06",
        days: "5",
        level: "advanced",
        longrun: "6",
        goal: "compete",
        start: "2026-12-07",
        name: "Ecotrail",
        elevation: "1800",
        weeklykm: "45",
        longrunkm: "22",
      }),
    );
    expect(payload).toMatchObject({
      raceDistance: "trail",
      startDate: "2026-12-07",
      raceName: "Ecotrail",
      elevationGain: 1800,
      currentWeeklyKm: 45,
      currentLongRunKm: 22,
      goal: "compete",
    });
  });
});

describe("errors speak the link's language", () => {
  test("a missing parameter is named as written", () => {
    const errors = errorsOf(check({ days: "3" }));
    expect(errors.map((e) => [e.code, e.path])).toEqual([
      ["missing_field", "distance"],
      ["missing_field", "date"],
    ]);
    expect(describeIssue(errors[1], "en")).toBe("required field date is missing.");
  });

  test("validator issues are renamed to the parameter", () => {
    const errors = errorsOf(check({ distance: "ultra", date: "2027-13-01", days: "9", longrun: "someday" }));
    expect(errors.map((e) => [e.code, e.path])).toEqual([
      ["invalid_enum", "distance"],
      ["invalid_date", "date"],
      ["out_of_range", "days"],
      ["invalid_type", "longrun"],
    ]);
    const report = formatIssueReport(errors);
    expect(report).not.toContain("raceDistance");
    expect(report).not.toContain("daysPerWeek");
  });

  test("the race too close names date, not raceDate", () => {
    const [issue] = errorsOf(check({ ...AUDIT, date: "2026-12-06" }));
    expect(issue).toMatchObject({ code: "weeks_out_of_range", path: "date" });
    expect(describeIssue(issue, "en")).toContain("and date,");
  });

  test("unknown parameters list the known ones", () => {
    const [issue] = errorsOf(check({ ...AUDIT, frequency: "3" }));
    expect(issue).toMatchObject({ code: "unknown_field", path: "frequency" });
    expect(String(issue.params.allowed)).toContain("days");
  });

  test("time: format, distance, range, and never with pace", () => {
    expect(errorsOf(check({ ...AUDIT, time: "70" }))[0]).toMatchObject({ code: "invalid_format", path: "time" });
    expect(errorsOf(check({ ...AUDIT, distance: "trail", date: "2027-06-06" }))[0]).toMatchObject({
      code: "time_needs_road_distance",
      path: "time",
    });
    const [tooFast] = errorsOf(check({ ...AUDIT, time: "0:20:00" }));
    expect(tooFast).toMatchObject({ code: "out_of_range", path: "time", params: { min: "0:25:00", max: "2:00:00" } });
    expect(errorsOf(check({ ...AUDIT, pace: "7:00" }))[0]).toMatchObject({ code: "conflicting_fields", path: "time" });
  });

  test("pace in a bad format", () => {
    const [issue] = errorsOf(check({ distance: "10K", date: "2027-01-03", days: "3", pace: "quick" }));
    expect(issue).toMatchObject({ code: "invalid_format", path: "pace" });
    expect(describeIssue(issue, "fr")).toBe("pace vaut quick, format attendu : M:SS per km, e.g. 6:45.");
  });
});

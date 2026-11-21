/**
 * La matrice de dates du parcours de création.
 *
 * Toutes les distances proposées, aujourd'hui = chacun des sept jours, une
 * course au minimum, au milieu et au maximum de la fourchette recommandée et
 * un jour de course qui parcourt la semaine, 3 à 6 séances, sortie longue le
 * samedi ou le dimanche, avec ou sans renfo, avec une course de préparation,
 * départ par défaut puis commencer cette semaine. L'horloge est figée à
 * chaque cas : rien ne dépend du jour réel.
 */
import { afterAll, describe, expect, setSystemTime, test } from "bun:test";
import { generatePlan } from "./index";
import { RECOMMENDED_PLAN_WEEKS } from "./constants";
import {
  addDaysToDate,
  calculatePlanWeekCount,
  getPlanMonday,
  getSessionCalendarDate,
  isoDateOnly,
  isoDayOfWeek,
} from "@/lib/planDates";
import {
  buildAssistedConfig,
  emptyPlanForm,
  planMondayOf,
  planStartOf,
  planWeeksOf,
  PURPOSE_DEFAULTS,
  OPEN_WEEK_OPTIONS,
  type OpenPurpose,
  type PlanForm,
} from "@/lib/planCreate";
import type { RaceDistance, TrainingPlan } from "@/types/plan";

afterAll(() => setSystemTime());

/** Lundi 16 novembre 2026 ; aujourd'hui = ce lundi + 0..6. */
const WEEK_MONDAY = "2026-11-16";
const DISTANCES: RaceDistance[] = ["5K", "10K", "semi", "marathon", "trail_short", "trail", "ultra"];

function datedSessions(plan: TrainingPlan) {
  const monday = getPlanMonday(plan);
  return plan.weeks.flatMap((w) =>
    w.sessions.map((s) => ({
      session: s,
      date: isoDateOnly(getSessionCalendarDate(monday, w.weekNumber, s.dayOfWeek)),
    })),
  );
}

async function generateAt(form: PlanForm, today: string) {
  setSystemTime(new Date(`${today}T09:00:00`));
  return generatePlan(buildAssistedConfig(form, today));
}

function checkStart(plan: TrainingPlan, form: PlanForm, today: string) {
  const start = planStartOf(form, today);
  const monday = getPlanMonday(plan);
  // 4. La semaine 1 commence un lundi, celui qu'on attend.
  expect(monday.getDay()).toBe(1);
  expect(isoDateOnly(monday)).toBe(planMondayOf(form, today));
  if (!form.startThisWeek) expect(isoDateOnly(monday) >= today).toBe(true);
  // 3. Aucune séance avant le départ, donc avant aujourd'hui.
  const early = datedSessions(plan).filter((d) => d.date < start || d.date < today);
  expect(early.map((d) => `${d.date} ${d.session.workoutId}`)).toEqual([]);
}

type RaceCase = {
  distance: RaceDistance;
  today: string;
  weeks: number;
  raceDate: string;
  form: PlanForm;
};

function raceCases(): RaceCase[] {
  const cases: RaceCase[] = [];
  let n = 0;
  for (const [di, distance] of DISTANCES.entries()) {
    const rec = RECOMMENDED_PLAN_WEEKS[distance];
    const lengths = [rec.min, Math.round((rec.min + rec.max) / 2), rec.max];
    for (let t = 0; t < 7; t++) {
      const today = addDaysToDate(WEEK_MONDAY, t);
      for (const [li, weeks] of lengths.entries()) {
        for (const startThisWeek of [false, true]) {
          n++;
          const form: PlanForm = {
            ...emptyPlanForm(),
            raceDistance: distance,
            startThisWeek,
            daysPerWeek: 3 + (n % 4),
            longRunDay: n % 2 ? 5 : 6,
            includeStrength: n % 3 === 0,
            strengthFrequency: n % 2 ? 1 : 2,
          };
          const monday = planMondayOf(form, today);
          const raceDow = (t + li + di) % 7;
          const raceDate = addDaysToDate(monday, (weeks - 1) * 7 + raceDow);
          form.raceDate = raceDate;
          if (n % 5 === 0) {
            // Une course de préparation au milieu du plan, plus courte que l'objectif.
            const prepWeek = Math.max(2, Math.floor(weeks / 2));
            form.intermediateGoals = [
              {
                raceDistance: "5K",
                raceDate: addDaysToDate(monday, (prepWeek - 1) * 7 + 5),
                raceName: "Prépa",
                priority: "B",
              },
            ];
          }
          cases.push({ distance, today, weeks, raceDate, form });
        }
      }
    }
  }
  return cases;
}

describe("matrice de dates : plans de course sur mesure", () => {
  for (const c of raceCases()) {
    const label = `${c.distance} · aujourd'hui ${c.today} · course ${c.raceDate} (${c.weeks} sem.) · ${
      c.form.startThisWeek ? "cette semaine" : "lundi prochain"
    } · ${c.form.daysPerWeek} séances, longue j${c.form.longRunDay}${
      c.form.includeStrength ? ", renfo" : ""
    }${c.form.intermediateGoals.length ? ", prépa" : ""}`;

    test(label, async () => {
      const plan = await generateAt(c.form, c.today);
      const dated = datedSessions(plan);

      // 1. Exactement une course, à sa date.
      const races = dated.filter((d) => d.session.workoutId === "__race_day__");
      expect(races.map((r) => r.date)).toEqual([c.raceDate]);
      // 2. Rien après la course.
      expect(dated.filter((d) => d.date > c.raceDate).map((d) => d.date)).toEqual([]);
      // 3 et 4.
      checkStart(plan, c.form, c.today);
      // 5. Du lundi de départ au lundi de la semaine de course, plus un.
      expect(plan.totalWeeks).toBe(c.weeks);
      expect(plan.totalWeeks).toBe(
        calculatePlanWeekCount(planMondayOf(c.form, c.today), c.raceDate),
      );
      expect(plan.weeks).toHaveLength(plan.totalWeeks);
      // 6. Le nombre affiché dans le parcours est celui du plan.
      expect(planWeeksOf(c.form, c.today)).toBe(plan.totalWeeks);
    });
  }

  test("course le 16 : un dimanche 16 mai, départ un jeudi", async () => {
    const today = "2026-11-19";
    const form: PlanForm = { ...emptyPlanForm(), raceDistance: "semi", raceDate: "2027-05-16" };
    const plan = await generateAt(form, today);
    const race = datedSessions(plan).filter((d) => d.session.workoutId === "__race_day__");
    expect(race.map((r) => r.date)).toEqual(["2027-05-16"]);
    expect(isoDateOnly(getPlanMonday(plan))).toBe("2026-11-23");
    expect(plan.totalWeeks).toBe(planWeeksOf(form, today));
  });

  test("le bug mesuré : un samedi, le départ par défaut est lundi prochain", async () => {
    const today = "2026-11-21";
    const form: PlanForm = { ...emptyPlanForm(), raceDistance: "trail_short", raceDate: "2027-03-14" };
    const plan = await generateAt(form, today);
    expect(plan.config.startDate).toBe("2026-11-23");
    expect(plan.totalWeeks).toBe(16);
    checkStart(plan, form, today);
  });

  test("un départ reçu en milieu de semaine ne pose rien avant lui", async () => {
    setSystemTime(new Date("2026-11-21T09:00:00"));
    const config = buildAssistedConfig(
      { ...emptyPlanForm(), raceDistance: "10K", raceDate: "2027-03-14", daysPerWeek: 6 },
      "2026-11-21",
    );
    const plan = await generatePlan({ ...config, startDate: "2026-11-19" });
    const firstDay = isoDayOfWeek("2026-11-19");
    expect(plan.weeks[0].sessions.every((s) => s.dayOfWeek >= firstDay)).toBe(true);
  });
});

describe("matrice de dates : plans sans course", () => {
  const purposes = Object.keys(PURPOSE_DEFAULTS) as OpenPurpose[];
  let n = 0;
  for (const purpose of purposes) {
    for (let t = 0; t < 7; t++) {
      const today = addDaysToDate(WEEK_MONDAY, t);
      for (const weeks of OPEN_WEEK_OPTIONS) {
        for (const startThisWeek of [false, true]) {
          n++;
          const form: PlanForm = {
            ...emptyPlanForm(),
            planPurpose: purpose,
            practice: "road",
            ...PURPOSE_DEFAULTS[purpose],
            totalWeeksOverride: weeks,
            startThisWeek,
            longRunDay: n % 2 ? 5 : 6,
            includeStrength: n % 3 === 0,
          };
          test(`${purpose} · aujourd'hui ${today} · ${weeks} sem. · ${
            startThisWeek ? "cette semaine" : "lundi prochain"
          }`, async () => {
            const plan = await generateAt(form, today);
            // 7. Exactement N semaines, la dernière finit un dimanche.
            expect(plan.totalWeeks).toBe(weeks);
            expect(plan.weeks).toHaveLength(weeks);
            expect(planWeeksOf(form, today)).toBe(plan.totalWeeks);
            const end = addDaysToDate(planMondayOf(form, today), weeks * 7 - 1);
            expect(isoDayOfWeek(end)).toBe(6);
            expect(plan.config.endDate).toBe(end);
            const dated = datedSessions(plan);
            expect(dated.filter((d) => d.date > end)).toEqual([]);
            expect(dated.some((d) => d.session.workoutId === "__race_day__")).toBe(false);
            checkStart(plan, form, today);
          });
        }
      }
    }
  }
});

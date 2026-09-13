import { describe, expect, test } from "bun:test";

import {
  BAR_GAP,
  BAR_MAX,
  BLOCK_MIN,
  dayBarBlocks,
  dayStatus,
  focusDayDate,
  focusPlanHref,
  pickTodayFocus,
  planPosition,
  sessionHref,
  weekShortcut,
} from "./cockpit";
import type { PlanSession, PlanWeek, TrainingPlan } from "@/types/plan";

function session(dayOfWeek: number, workoutId = "W-1"): PlanSession {
  return {
    dayOfWeek,
    workoutId,
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 45,
  };
}

function week(weekNumber: number, sessions: PlanSession[]): PlanWeek {
  return { weekNumber, phase: "base", isRecoveryWeek: false, volumePercent: 100, sessions };
}

/** Un plan qui démarre le lundi donné. `startDate` porte le calage. */
function plan(over: {
  id: string;
  startDate: string;
  totalWeeks?: number;
  weeks?: PlanWeek[];
  isSingleWeek?: boolean;
  createdAt?: string;
  raceDate?: string;
  raceName?: string;
}): TrainingPlan {
  const totalWeeks = over.totalWeeks ?? 4;
  return {
    id: over.id,
    config: {
      id: `cfg-${over.id}`,
      daysPerWeek: 4,
      startDate: over.startDate,
      createdAt: over.createdAt ?? "2026-01-01T10:00:00.000Z",
      isSingleWeek: over.isSingleWeek,
      raceDate: over.raceDate,
      raceName: over.raceName,
    },
    weeks: over.weeks ?? [week(1, [session(0)])],
    totalWeeks,
    phases: [{ phase: "base", startWeek: 1, endWeek: totalWeeks }],
    name: over.id,
    nameEn: over.id,
    version: 2,
  };
}

// Lundi 2026-09-07, mercredi 2026-09-09, lundi suivant 2026-09-14.
const MONDAY = new Date(2026, 8, 7);
const WEDNESDAY = new Date(2026, 8, 9);

describe("pickTodayFocus", () => {
  test("sans aucun plan, il n'y a rien à reprendre", () => {
    const focus = pickTodayFocus([], MONDAY);
    expect(focus.state).toBe("none");
    expect(focus.plan).toBeNull();
    expect(focusPlanHref(focus)).toBeNull();
  });

  test("rend la séance du jour", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(0, "LUNDI"), session(2, "MERCREDI")])],
    });
    const focus = pickTodayFocus([p], MONDAY);
    expect(focus.state).toBe("session");
    expect(focus.weekNumber).toBe(1);
    expect(focus.dayOfWeek).toBe(0);
    expect(focus.sessions.map((s) => s.workoutId)).toEqual(["LUNDI"]);
  });

  test("le bon jour de la semaine, pas le premier trouvé", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(0, "LUNDI"), session(2, "MERCREDI")])],
    });
    expect(pickTodayFocus([p], WEDNESDAY).sessions.map((s) => s.workoutId)).toEqual([
      "MERCREDI",
    ]);
  });

  test("un jour sans séance est du repos, pas un trou", () => {
    const p = plan({ id: "p1", startDate: "2026-09-07", weeks: [week(1, [session(2)])] });
    const focus = pickTodayFocus([p], MONDAY);
    expect(focus.state).toBe("rest");
    expect(focus.sessions).toEqual([]);
    // On sait quand même où on en est : c'est ce qui distingue repos et vide.
    expect(focus.plan?.id).toBe("p1");
    expect(focus.weekNumber).toBe(1);
  });

  test("rend plusieurs séances quand la journée en porte deux", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(0, "MATIN"), session(0, "SOIR")])],
    });
    expect(pickTodayFocus([p], MONDAY).sessions).toHaveLength(2);
  });

  test("trouve la bonne semaine, pas seulement la première", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      totalWeeks: 3,
      weeks: [week(1, [session(0, "S1")]), week(2, [session(0, "S2")])],
    });
    // Lundi de la semaine 2.
    const focus = pickTodayFocus([p], new Date(2026, 8, 14));
    expect(focus.weekNumber).toBe(2);
    expect(focus.sessions.map((s) => s.workoutId)).toEqual(["S2"]);
  });

  test("un plan terminé ne se reprend plus", () => {
    const p = plan({ id: "fini", startDate: "2026-01-05", totalWeeks: 2 });
    expect(pickTodayFocus([p], MONDAY).state).toBe("none");
  });

  test("un plan qui n'a pas commencé s'annonce, avec ses jours restants", () => {
    const p = plan({ id: "futur", startDate: "2026-09-14" });
    const focus = pickTodayFocus([p], MONDAY);
    expect(focus.state).toBe("upcoming");
    expect(focus.plan?.id).toBe("futur");
    expect(focus.daysUntilStart).toBe(7);
  });

  test("un plan en cours passe devant un plan à venir", () => {
    const now = plan({ id: "encours", startDate: "2026-09-07" });
    const later = plan({ id: "futur", startDate: "2026-09-14" });
    expect(pickTodayFocus([later, now], MONDAY).plan?.id).toBe("encours");
  });

  test("entre deux plans en cours, le plus récemment créé gagne", () => {
    const older = plan({
      id: "ancien",
      startDate: "2026-09-07",
      createdAt: "2026-01-01T10:00:00.000Z",
    });
    const newer = plan({
      id: "recent",
      startDate: "2026-09-07",
      createdAt: "2026-06-01T10:00:00.000Z",
    });
    expect(pickTodayFocus([older, newer], MONDAY).plan?.id).toBe("recent");
    // Et l'ordre d'entrée ne change rien.
    expect(pickTodayFocus([newer, older], MONDAY).plan?.id).toBe("recent");
  });

  test("entre deux plans à venir, le plus proche de commencer gagne", () => {
    const soon = plan({ id: "bientot", startDate: "2026-09-14" });
    const far = plan({ id: "loin", startDate: "2026-10-19" });
    expect(pickTodayFocus([far, soon], MONDAY).plan?.id).toBe("bientot");
  });

  test("une date de création illisible ne fait pas tomber le tri", () => {
    const broken = plan({ id: "casse", startDate: "2026-09-07", createdAt: "pas une date" });
    const fine = plan({
      id: "bon",
      startDate: "2026-09-07",
      createdAt: "2026-06-01T10:00:00.000Z",
    });
    expect(pickTodayFocus([broken, fine], MONDAY).plan?.id).toBe("bon");
  });
});

describe("la semaine, sept cases", () => {
  test("range les séances par jour, lundi d'abord", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(0, "LUN"), session(2, "MER"), session(6, "DIM")])],
    });
    const { week: byDay } = pickTodayFocus([p], MONDAY);
    expect(byDay).toHaveLength(7);
    expect(byDay[0].map((s) => s.workoutId)).toEqual(["LUN"]);
    expect(byDay[2].map((s) => s.workoutId)).toEqual(["MER"]);
    expect(byDay[6].map((s) => s.workoutId)).toEqual(["DIM"]);
  });

  test("un jour de repos est une case vide, pas une absence", () => {
    const p = plan({ id: "p1", startDate: "2026-09-07", weeks: [week(1, [session(2)])] });
    const { week: byDay } = pickTodayFocus([p], MONDAY);
    // Toujours sept cases : la bande dessine sept jours quoi qu'il arrive.
    expect(byDay).toHaveLength(7);
    expect(byDay[0]).toEqual([]);
    expect(byDay[1]).toEqual([]);
  });

  test("deux séances le même jour tiennent dans la même case", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(3, "MATIN"), session(3, "SOIR")])],
    });
    expect(pickTodayFocus([p], MONDAY).week[3]).toHaveLength(2);
  });

  test("la case du jour est exactement `sessions`", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(0, "LUN"), session(2, "MER")])],
    });
    const focus = pickTodayFocus([p], WEDNESDAY);
    expect(focus.week[focus.dayOfWeek]).toEqual(focus.sessions);
  });

  test("c'est la semaine EN COURS, pas la première", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      totalWeeks: 3,
      weeks: [week(1, [session(0, "S1")]), week(2, [session(0, "S2")])],
    });
    const focus = pickTodayFocus([p], new Date(2026, 8, 14));
    expect(focus.week[0].map((s) => s.workoutId)).toEqual(["S2"]);
  });

  // La bande ne s'affiche que s'il y a une semaine à montrer. Une bande vide
  // vaudrait mieux ne pas exister qu'annoncer une semaine inventée.
  test("aucune semaine à montrer pour un plan qui n'a pas commencé", () => {
    const p = plan({ id: "futur", startDate: "2026-09-14" });
    const focus = pickTodayFocus([p], MONDAY);
    expect(focus.state).toBe("upcoming");
    expect(focus.week).toEqual([]);
  });

  test("aucune semaine à montrer sans aucun plan", () => {
    expect(pickTodayFocus([], MONDAY).week).toEqual([]);
  });
});

describe("un seul tap jusqu'à la séance", () => {
  test("chaque séance de la semaine a son chemin", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(0, "LUNDI"), session(0, "LUNDI-2"), session(3, "MERCREDI")])],
    });
    const focus = pickTodayFocus([p], MONDAY);
    // La pile en donne un par séance, y compris la seconde d'une journée
    // double, qui n'avait aucune sortie du temps du bouton unique.
    expect(focus.sessions.map(sessionHref)).toEqual(["/workout/LUNDI", "/workout/LUNDI-2"]);
    expect(sessionHref(focus.week[3][0])).toBe("/workout/MERCREDI");
  });
});

describe("un bloc par séance dans la bande", () => {
  /** La somme d'une colonne, filets compris : c'est elle qui doit tenir dans
   *  le créneau de hauteur fixe du CSS. */
  const column = (blocks: { height: number }[]) =>
    blocks.reduce((n, b) => n + b.height, 0) + BAR_GAP * Math.max(0, blocks.length - 1);

  test("trois séances font trois blocs, au prorata des minutes", () => {
    // L'exemple du propriétaire : une heure de natation, deux de vélo, trois
    // de course. Une barre unique en faisait six heures et taisait qu'il
    // fallait sortir trois fois.
    const day = [
      { ...session(2), estimatedDurationMin: 60 },
      { ...session(2), estimatedDurationMin: 120 },
      { ...session(2), estimatedDurationMin: 180 },
    ];
    const blocks = dayBarBlocks(day, 360);
    expect(blocks.map((b) => b.height)).toEqual([6, 12, 18]);
    // Le rapport 1 / 2 / 3 est celui des durées, et la colonne remplit son
    // créneau sans le dépasser.
    expect(column(blocks)).toBe(BAR_MAX);
  });

  test("la colonne garde la hauteur de sa journée, découpée ou non", () => {
    const one = dayBarBlocks([{ ...session(0), estimatedDurationMin: 120 }], 360);
    const two = dayBarBlocks(
      [
        { ...session(0), estimatedDurationMin: 60 },
        { ...session(0), estimatedDurationMin: 60 },
      ],
      360,
    );
    // Deux heures en deux séances ne doivent pas paraître plus longues que
    // deux heures en une : sinon la bande dirait le nombre de séances à la
    // place des minutes.
    expect(column(two)).toBe(column(one));
  });

  test("rien ne dépasse jamais le créneau", () => {
    // Le créneau du CSS est fixe : une colonne plus haute que lui déborderait
    // sur la lettre, et la bande cesserait d'avoir une hauteur constante. La
    // journée testée est la plus longue de sa semaine, le pire cas.
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const day = Array.from({ length: n }, () => ({ ...session(0), estimatedDurationMin: 60 }));
      expect(column(dayBarBlocks(day, 60 * n)), `${n} séances`).toBeLessThanOrEqual(BAR_MAX);
    }
    // Et même avec une échelle fausse, où la journée dépasse le jour le plus
    // long : la colonne est bridée plutôt que de déborder.
    expect(column(dayBarBlocks([{ ...session(0), estimatedDurationMin: 600 }], 60)))
      .toBeLessThanOrEqual(BAR_MAX);
  });

  test("une séance minuscule reste visible", () => {
    const day = [
      { ...session(0), estimatedDurationMin: 1 },
      { ...session(0), estimatedDurationMin: 240 },
    ];
    expect(dayBarBlocks(day, 240)[0].height).toBe(BLOCK_MIN);
  });

  test("des séances sans durée se partagent la colonne à parts égales", () => {
    const day = [
      { ...session(0), estimatedDurationMin: 0 },
      { ...session(0), estimatedDurationMin: 0 },
    ];
    const blocks = dayBarBlocks(day, 240);
    expect(blocks[0].height).toBe(blocks[1].height);
    expect(blocks[0].height).toBeGreaterThanOrEqual(BLOCK_MIN);
  });

  test("le statut est pris séance par séance", () => {
    // Une barre unique devait trancher : la journée entière restait prévue
    // tant qu'une séance ne l'était pas. Deux blocs disent les deux.
    const day = [
      { ...session(0), status: "completed" as const },
      { ...session(0), status: "planned" as const },
    ];
    expect(dayBarBlocks(day, 90).map((b) => b.shape)).toEqual(["completed", "planned"]);
    expect(dayStatus(day)).toBe("planned");
  });

  test("un jour de repos n'a aucun bloc", () => {
    // C'est le CSS qui dessine son filet : l'absence de séance n'est pas une
    // séance de hauteur nulle.
    expect(dayBarBlocks([], 90)).toEqual([]);
  });
});

describe("le raccourci de la semaine", () => {
  test("mène à la semaine en cours du plan", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      totalWeeks: 3,
      weeks: [week(1, []), week(2, [session(0)])],
    });
    // C'est le correctif : Ma semaine menait à /weeks/new, l'écran qui en
    // COMPOSE une, donc à une page blanche quand on croyait retrouver la
    // sienne.
    expect(weekShortcut(pickTodayFocus([p], new Date(2026, 8, 14)))).toEqual({
      href: "/plan/p1?week=2",
      mine: true,
    });
  });

  test("une semaine seule garde son propre chemin", () => {
    const w = plan({
      id: "w1",
      startDate: "2026-09-07",
      totalWeeks: 1,
      isSingleWeek: true,
      weeks: [week(1, [session(0, "A"), session(0, "B")])],
    });
    expect(weekShortcut(pickTodayFocus([w], MONDAY))).toEqual({
      href: "/weeks/w1?week=1",
      mine: true,
    });
  });

  test("sans semaine en cours, il retombe sur l'atelier", () => {
    expect(weekShortcut(pickTodayFocus([], MONDAY))).toEqual({
      href: "/weeks/new",
      mine: false,
    });
    // Un plan qui n'a pas commencé n'a pas de semaine en cours : l'ouvrir à
    // la semaine 0 ne voudrait rien dire.
    const later = plan({ id: "p2", startDate: "2026-09-21", weeks: [week(1, [session(0)])] });
    expect(weekShortcut(pickTodayFocus([later], MONDAY)).mine).toBe(false);
  });
});

describe("la date du jour choisi", () => {
  test("suit le choix, en avant comme en arrière", () => {
    const p = plan({ id: "p1", startDate: "2026-09-07", weeks: [week(1, [session(2)])] });
    // Mercredi 9 septembre : le focus est sur le jour 2.
    const focus = pickTodayFocus([p], WEDNESDAY);
    expect(focus.dayOfWeek).toBe(2);
    expect(focusDayDate(focus, 2, WEDNESDAY).getDate()).toBe(9);
    expect(focusDayDate(focus, 0, WEDNESDAY).getDate()).toBe(7);
    expect(focusDayDate(focus, 6, WEDNESDAY).getDate()).toBe(13);
  });

  test("traverse une fin de mois", () => {
    // Mercredi 30 septembre 2026 : dimanche est le 4 octobre.
    const last = new Date(2026, 8, 30);
    const p = plan({ id: "p1", startDate: "2026-09-28", weeks: [week(1, [session(2)])] });
    const focus = pickTodayFocus([p], last);
    const sunday = focusDayDate(focus, 6, last);
    expect(sunday.getMonth()).toBe(9);
    expect(sunday.getDate()).toBe(4);
  });
});

describe("une semaine seule", () => {
  test("se reprend comme une semaine, et pointe /weeks", () => {
    const w = plan({
      id: "w1",
      startDate: "2026-09-07",
      totalWeeks: 1,
      isSingleWeek: true,
    });
    const focus = pickTodayFocus([w], MONDAY);
    expect(focus.isWeek).toBe(true);
    expect(focusPlanHref(focus)).toBe("/weeks/w1");
  });

  test("un plan pointe /plan", () => {
    const p = plan({ id: "p1", startDate: "2026-09-07" });
    const focus = pickTodayFocus([p], MONDAY);
    expect(focus.isWeek).toBe(false);
    expect(focusPlanHref(focus)).toBe("/plan/p1");
  });
});

/* ── L'adresse d'une séance ───────────────────────────────────────────────
 *
 * Une séance n'a pas d'identifiant : `updateSessionCompletion` l'adresse par
 * (planId, weekNumber, INDEX dans `week.sessions`). Le regroupement par jour
 * perdait cet index, donc le cockpit ne pouvait rien clore. Ces tests
 * vérifient que l'index rendu pointe bien la séance rendue, ce qui est la
 * seule chose que deux tableaux parallèles risquent de perdre.
 */
describe("l'index de chaque séance", () => {
  test("sessionIndexes a la même longueur et le même ordre que sessions", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(3, "MER"), session(0, "LUN-A"), session(0, "LUN-B")])],
    });
    const focus = pickTodayFocus([p], MONDAY);
    expect(focus.sessions.map((s) => s.workoutId)).toEqual(["LUN-A", "LUN-B"]);
    expect(focus.sessionIndexes).toEqual([1, 2]);
  });

  test("l'index pointe la séance de la SEMAINE, pas celle du jour", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(0, "LUN"), session(2, "MER-A"), session(2, "MER-B")])],
    });
    const focus = pickTodayFocus([p], WEDNESDAY);
    const stored = p.weeks[0].sessions;
    focus.sessions.forEach((s, k) => {
      expect(stored[focus.sessionIndexes[k]]).toBe(s);
    });
  });

  test("chaque case de la bande se relit dans le plan par son index", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [
        week(1, [
          session(6, "DIM"),
          session(0, "LUN"),
          session(4, "VEN-A"),
          session(4, "VEN-B"),
          session(2, "MER"),
        ]),
      ],
    });
    const focus = pickTodayFocus([p], MONDAY);
    const stored = p.weeks[0].sessions;
    expect(focus.week).toHaveLength(7);
    expect(focus.weekIndexes).toHaveLength(7);
    for (let day = 0; day < 7; day++) {
      expect(focus.weekIndexes[day]).toHaveLength(focus.week[day].length);
      focus.week[day].forEach((s, k) => {
        expect(stored[focus.weekIndexes[day][k]]).toBe(s);
      });
    }
  });

  test("sans rien à reprendre, les deux tableaux sont vides et non absents", () => {
    const none = pickTodayFocus([], MONDAY);
    expect(none.sessionIndexes).toEqual([]);
    expect(none.weekIndexes).toEqual([]);

    // Un plan qui n'a pas commencé : pas de semaine, donc pas d'index.
    const later = pickTodayFocus([plan({ id: "p1", startDate: "2026-10-05" })], MONDAY);
    expect(later.state).toBe("upcoming");
    expect(later.sessionIndexes).toEqual([]);
    expect(later.weekIndexes).toEqual([]);
  });
});

/* ── La forme d'un jour ───────────────────────────────────────────────────
 *
 * C'est ce qui donne enfin un sens aux sept barres : prévu est creux, fait est
 * plein, sauté est hachuré. La règle qui compte est que NON RÉSOLU L'EMPORTE,
 * parce que dire fait trop tôt est le seul mensonge que cette bande puisse
 * commettre.
 */
describe("la forme d'un jour", () => {
  const at = (status: PlanSession["status"]): PlanSession => ({ ...session(0), status });

  test("une journée sans séance est du repos, pas une journée prévue", () => {
    expect(dayStatus([])).toBe("rest");
  });

  test("sans statut, une séance est prévue : le suivi est arrivé après elles", () => {
    expect(dayStatus([session(0)])).toBe("planned");
    expect(dayStatus([at("planned")])).toBe("planned");
  });

  test("tout résolu, le statut de la journée est celui des séances", () => {
    expect(dayStatus([at("completed")])).toBe("completed");
    expect(dayStatus([at("modified")])).toBe("modified");
    expect(dayStatus([at("skipped")])).toBe("skipped");
  });

  test("une seule séance non résolue suffit à garder la journée prévue", () => {
    expect(dayStatus([at("completed"), at("planned")])).toBe("planned");
    expect(dayStatus([at("completed"), session(1)])).toBe("planned");
    expect(dayStatus([at("skipped"), session(1)])).toBe("planned");
  });

  test("entre deux séances résolues, ce qui a été couru l'emporte sur ce qui a sauté", () => {
    expect(dayStatus([at("skipped"), at("completed")])).toBe("completed");
    expect(dayStatus([at("skipped"), at("modified")])).toBe("modified");
  });
});

/* ── La position dans le plan ─────────────────────────────────────────────
 *
 * Un plan ne tient que par sa fin : semaine 1 sans dénominateur et un nom de
 * plan sans échéance laissent la sortie du jour flotter hors contexte.
 */
describe("la position dans le plan", () => {
  test("la semaine courante et son dénominateur", () => {
    const p = plan({ id: "p1", startDate: "2026-09-07", totalWeeks: 12 });
    const pos = planPosition(pickTodayFocus([p], MONDAY), MONDAY);
    expect(pos?.weekNumber).toBe(1);
    expect(pos?.totalWeeks).toBe(12);
  });

  test("le compte à rebours se lit en date LOCALE, pas en UTC", () => {
    // `Date.parse("2026-12-31")` est minuit UTC : à Paris, c'est le 31 à 1 h,
    // et le décompte tombe à faux d'un jour selon l'heure qu'il est.
    const p = plan({ id: "p1", startDate: "2026-09-07", totalWeeks: 20, raceDate: "2026-09-27" });
    const pos = planPosition(pickTodayFocus([p], MONDAY), MONDAY);
    expect(pos?.daysToGoal).toBe(20);
  });

  test("le jour de la course compte : J-0 est une information", () => {
    const raceDay = new Date(2026, 8, 9);
    const p = plan({ id: "p1", startDate: "2026-09-07", totalWeeks: 20, raceDate: "2026-09-09" });
    expect(planPosition(pickTodayFocus([p], raceDay), raceDay)?.daysToGoal).toBe(0);
  });

  test("une échéance passée n'annonce plus rien", () => {
    const p = plan({ id: "p1", startDate: "2026-09-07", totalWeeks: 20, raceDate: "2026-09-08" });
    expect(planPosition(pickTodayFocus([p], WEDNESDAY), WEDNESDAY)?.daysToGoal).toBeNull();
  });

  test("sans raceDate, le repli est le dernier jour du plan", () => {
    // Tout plan repris du catalogue est dans ce cas : le convertisseur ne
    // reporte ni la date ni le nom de la course. Quatre semaines commencées le
    // lundi 7, donc le dimanche 4 octobre, soit 27 jours.
    const p = plan({ id: "p1", startDate: "2026-09-07", totalWeeks: 4 });
    const pos = planPosition(pickTodayFocus([p], MONDAY), MONDAY);
    expect(pos?.daysToGoal).toBe(27);
  });

  test("le nom de la course quand il y en a un, null sinon", () => {
    const named = plan({ id: "p1", startDate: "2026-09-07", raceName: "Marathon de Nice" });
    expect(planPosition(pickTodayFocus([named], MONDAY), MONDAY)?.goalName).toBe("Marathon de Nice");

    const blank = plan({ id: "p2", startDate: "2026-09-07", raceName: "   " });
    expect(planPosition(pickTodayFocus([blank], MONDAY), MONDAY)?.goalName).toBeNull();

    const bare = plan({ id: "p3", startDate: "2026-09-07" });
    expect(planPosition(pickTodayFocus([bare], MONDAY), MONDAY)?.goalName).toBeNull();
  });

  test("une semaine seule n'a pas de dénominateur : 1 sur 1 est du bruit", () => {
    const w = plan({ id: "w1", startDate: "2026-09-07", totalWeeks: 1, isSingleWeek: true });
    expect(planPosition(pickTodayFocus([w], MONDAY), MONDAY)?.totalWeeks).toBe(0);
  });

  test("sans plan, il n'y a pas de position", () => {
    expect(planPosition(pickTodayFocus([], MONDAY), MONDAY)).toBeNull();
    const later = pickTodayFocus([plan({ id: "p1", startDate: "2026-10-05" })], MONDAY);
    expect(planPosition(later, MONDAY)).toBeNull();
  });
});

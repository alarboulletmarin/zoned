import { describe, expect, test } from "bun:test";

import {
  BAR_GAP,
  dayKinds,
  BAR_MAX,
  BLOCK_MIN,
  EXTRA_MAX,
  dayBarBlocks,
  dayStatus,
  extraBlockHeight,
  sessionKind,
  focusDayDate,
  MONTH_ROWS,
  clampMonth,
  compareMonth,
  dateFromIso,
  monthBounds,
  monthCells,
  monthOf,
  monthRange,
  planDay,
  sameMonth,
  shiftMonth,
  focusPlanHref,
  focusSessionsBetween,
  pickTodayFocus,
  weekConflicts,
  planPosition,
  sessionHref,
  weekShortcut,
} from "./cockpit";
import { EMPTY_COMPOSITION, placeWeek, setLayerEnabled } from "./todayComposition";
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

  test("le canal du complément a sa propre échelle, et son plancher", () => {
    // Rien ne se dessine quand rien n'a eu lieu.
    expect(extraBlockHeight(0, 60)).toBe(0);
    // Le jour le plus long du CANAL remplit son créneau, pas celui du plan.
    expect(extraBlockHeight(60, 60)).toBe(EXTRA_MAX);
    // Une échelle fausse est bridée plutôt que de déborder.
    expect(extraBlockHeight(600, 60)).toBe(EXTRA_MAX);
    // Un trajet de dix minutes à côté d'une sortie de trois heures doit se
    // voir : c'est tout l'intérêt d'avoir ce canal.
    expect(extraBlockHeight(10, 180)).toBe(BLOCK_MIN);
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

describe("la famille d'une séance", () => {
  test("la discipline de la séance, et la course par défaut", () => {
    // L'absence du champ vaut course à pied : aucun plan écrit avant qu'il
    // existe ne le porte, et ils courent tous.
    expect(sessionKind(session(0))).toBe("running");
    expect(sessionKind({ ...session(0), discipline: "cycling" })).toBe("cycling");
    expect(sessionKind({ ...session(0), discipline: "swimming" })).toBe("swimming");
  });

  test("le renforcement se lit sur le type, ou sur le préfixe", () => {
    // Deux sources parce que le modèle en a deux : le renforcement n'est pas
    // une `Discipline`, c'est un `sessionType`, et les séances du catalogue
    // le portent en préfixe sans toujours porter le type.
    expect(sessionKind({ ...session(0), sessionType: "strength" })).toBe("strength");
    expect(sessionKind(session(0, "STR-014"))).toBe("strength");
  });

  test("le renforcement l'emporte sur une discipline écrite à côté", () => {
    // Une séance de renforcement à vélo n'existe pas ; si le plan en écrit
    // une, c'est le renforcement qu'il faut annoncer, c'est lui qui décide du
    // sac.
    expect(sessionKind({ ...session(0, "STR-002"), discipline: "cycling" })).toBe("strength");
  });

  test("les familles d'une journée, une fois chacune, dans l'ordre", () => {
    const day = [
      { ...session(2, "SWM-1"), discipline: "swimming" as const },
      { ...session(2, "CYC-1"), discipline: "cycling" as const },
      session(2, "SL-1"),
      session(2, "END-1"),
    ];
    // Deux courses ne font qu'une icône : la rangée répond à quoi, les blocs
    // au-dessus répondent déjà à combien.
    expect(dayKinds(day)).toEqual(["swimming", "cycling", "running"]);
    expect(dayKinds([])).toEqual([]);
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
describe("l'adresse de chaque séance", () => {
  test("sessionRefs a la même longueur et le même ordre que sessions", () => {
    const p = plan({
      id: "p1",
      startDate: "2026-09-07",
      weeks: [week(1, [session(3, "MER"), session(0, "LUN-A"), session(0, "LUN-B")])],
    });
    const focus = pickTodayFocus([p], MONDAY);
    expect(focus.sessions.map((s) => s.workoutId)).toEqual(["LUN-A", "LUN-B"]);
    expect(focus.sessionRefs).toEqual([
      { planId: "p1", weekNumber: 1, index: 1 },
      { planId: "p1", weekNumber: 1, index: 2 },
    ]);
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
      expect(stored[focus.sessionRefs[k].index]).toBe(s);
    });
  });

  test("chaque case de la bande se relit dans le plan par son adresse", () => {
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
    expect(focus.weekRefs).toHaveLength(7);
    for (let day = 0; day < 7; day++) {
      expect(focus.weekRefs[day]).toHaveLength(focus.week[day].length);
      focus.week[day].forEach((s, k) => {
        expect(focus.weekRefs[day][k].planId).toBe("p1");
        expect(stored[focus.weekRefs[day][k].index]).toBe(s);
      });
    }
  });

  test("sans rien à reprendre, les deux tableaux sont vides et non absents", () => {
    const none = pickTodayFocus([], MONDAY);
    expect(none.sessionRefs).toEqual([]);
    expect(none.weekRefs).toEqual([]);
    expect(none.sources).toEqual([]);

    // Un plan qui n'a pas commencé : pas de semaine, donc pas d'adresse.
    const later = pickTodayFocus([plan({ id: "p1", startDate: "2026-10-05" })], MONDAY);
    expect(later.state).toBe("upcoming");
    expect(later.sessionRefs).toEqual([]);
    expect(later.weekRefs).toEqual([]);
  });
});

/* ── La composition ───────────────────────────────────────────────────────
 *
 * Le bug d'origine : une semaine composée pendant un plan faisait disparaître
 * le plan de l'écran du matin, parce qu'elle était le plan d'une semaine le
 * plus récent. Ce qui suit fixe la règle qui le remplace, voir
 * `lib/todayComposition.ts`.
 */
describe("la composition", () => {
  const marathon = plan({
    id: "marathon",
    startDate: "2026-08-31",
    totalWeeks: 4,
    createdAt: "2026-08-01T10:00:00.000Z",
    weeks: [week(2, [session(0, "PLAN-LUN"), session(3, "PLAN-JEU")])],
  });
  /* Composée ce lundi : sans `startDate`, elle est datée sur sa création. */
  const renfo = plan({
    id: "renfo",
    startDate: "2026-09-07",
    totalWeeks: 1,
    isSingleWeek: true,
    createdAt: "2026-09-07T08:00:00.000Z",
    weeks: [week(1, [session(0, "STR-001"), session(4, "STR-002")])],
  });

  test("une semaine composée ne cache plus le plan en cours", () => {
    const focus = pickTodayFocus([marathon, renfo], MONDAY);
    expect(focus.plan?.id).toBe("marathon");
    expect(focus.isWeek).toBe(false);
    expect(focus.sources.map((s) => s.plan.id)).toEqual(["marathon"]);
    expect(focus.sessions.map((s) => s.workoutId)).toEqual(["PLAN-LUN"]);
  });

  test("sans plan en cours, la semaine composée se montre, comme avant", () => {
    const focus = pickTodayFocus([renfo], MONDAY);
    expect(focus.plan?.id).toBe("renfo");
    expect(focus.isWeek).toBe(true);
    expect(focus.sessions.map((s) => s.workoutId)).toEqual(["STR-001"]);
  });

  test("posée, la semaine se lit À CÔTÉ du plan, séance par séance", () => {
    const composition = placeWeek(EMPTY_COMPOSITION, "renfo", MONDAY);
    const focus = pickTodayFocus([marathon, renfo], MONDAY, composition);
    expect(focus.plan?.id).toBe("marathon");
    expect(focus.sources.map((s) => s.plan.id)).toEqual(["marathon", "renfo"]);
    // Le primaire d'abord, puis ce qui est posé.
    expect(focus.sessions.map((s) => s.workoutId)).toEqual(["PLAN-LUN", "STR-001"]);
    expect(focus.sessionRefs).toEqual([
      { planId: "marathon", weekNumber: 2, index: 0 },
      { planId: "renfo", weekNumber: 1, index: 0 },
    ]);
    // Le vendredi n'appartient qu'à la semaine posée, le jeudi qu'au plan.
    expect(focus.week[3].map((s) => s.workoutId)).toEqual(["PLAN-JEU"]);
    expect(focus.week[4].map((s) => s.workoutId)).toEqual(["STR-002"]);
    expect(focus.weekRefs[4]).toEqual([{ planId: "renfo", weekNumber: 1, index: 1 }]);
  });

  test("un plan éteint laisse la semaine posée devenir le primaire", () => {
    let composition = placeWeek(EMPTY_COMPOSITION, "renfo", MONDAY);
    composition = setLayerEnabled(composition, "marathon", false);
    const focus = pickTodayFocus([marathon, renfo], MONDAY, composition);
    expect(focus.plan?.id).toBe("renfo");
    expect(focus.isWeek).toBe(true);
    expect(focus.sessions.map((s) => s.workoutId)).toEqual(["STR-001"]);
  });

  test("une semaine éteinte ne se montre plus, même sans plan", () => {
    const composition = setLayerEnabled(EMPTY_COMPOSITION, "renfo", false);
    expect(pickTodayFocus([renfo], MONDAY, composition).state).toBe("none");
  });

  test("posée sur une autre semaine, elle y attend, et la grille la trouve", () => {
    const nextMonday = new Date(2026, 8, 14);
    const composition = placeWeek(EMPTY_COMPOSITION, "renfo", nextMonday);
    const focus = pickTodayFocus([marathon, renfo], MONDAY, composition);
    // Cette semaine, le plan seul.
    expect(focus.sources.map((s) => s.plan.id)).toEqual(["marathon"]);
    // La semaine prochaine, vue depuis ce lundi : rien à empiler encore.
    expect(planDay(focus, nextMonday).sessions).toEqual([]);
    // Vécue depuis la semaine prochaine : les deux.
    const later = pickTodayFocus([marathon, renfo], nextMonday, composition);
    expect(later.sources.map((s) => s.plan.id)).toEqual(["marathon", "renfo"]);
    expect(later.sessions.map((s) => s.workoutId)).toEqual(["STR-001"]);
    expect(later.weekNumber).toBe(3);
  });

  test("n'importe quel jour de la semaine visée la pose sur son lundi", () => {
    const composition = placeWeek(EMPTY_COMPOSITION, "renfo", new Date(2026, 8, 17));
    expect(composition.layers[0].anchor).toBe("2026-09-14");
  });

  test("une semaine posée après le plan est une journée du cockpit", () => {
    // Le marathon finit le 27 septembre ; la semaine est posée le 5 octobre.
    const october = new Date(2026, 9, 5);
    const composition = placeWeek(EMPTY_COMPOSITION, "renfo", october);
    const focus = pickTodayFocus([marathon, renfo], october, composition);
    expect(focus.plan?.id).toBe("renfo");
    expect(focus.isWeek).toBe(true);
    const day = planDay(focus, october);
    expect(day.inPlan).toBe(true);
    expect(day.sessions.map((s) => s.workoutId)).toEqual(["STR-001"]);
  });

  test("une semaine posée plus tard s'annonce quand rien n'est en cours", () => {
    const composition = placeWeek(EMPTY_COMPOSITION, "renfo", new Date(2026, 8, 21));
    const focus = pickTodayFocus([renfo], MONDAY, composition);
    expect(focus.state).toBe("upcoming");
    expect(focus.daysUntilStart).toBe(14);
  });

  test("les bornes du mois couvrent toutes les sources", () => {
    const composition = placeWeek(EMPTY_COMPOSITION, "renfo", new Date(2026, 10, 2));
    // La semaine posée en novembre n'est pas en cours en septembre : elle
    // n'entre pas dans les sources, donc pas dans les bornes.
    const focus = pickTodayFocus([marathon, renfo], MONDAY, composition);
    expect(monthBounds(focus)).toEqual({ min: { year: 2026, month: 7 }, max: { year: 2026, month: 8 } });
    // Vécue en novembre, la semaine posée est seule, et les bornes sont les siennes.
    const later = pickTodayFocus([marathon, renfo], new Date(2026, 10, 2), composition);
    expect(monthBounds(later)).toEqual({ min: { year: 2026, month: 10 }, max: { year: 2026, month: 10 } });
  });

  test("les séances d'un intervalle viennent de toutes les sources", () => {
    const composition = placeWeek(EMPTY_COMPOSITION, "renfo", MONDAY);
    const focus = pickTodayFocus([marathon, renfo], MONDAY, composition);
    const ids = focusSessionsBetween(focus, "2026-09-07", "2026-09-13").map((s) => s.workoutId);
    expect(ids.sort()).toEqual(["PLAN-JEU", "PLAN-LUN", "STR-001", "STR-002"]);
    // Bornes comprises, et rien d'une autre semaine.
    expect(focusSessionsBetween(focus, "2026-09-10", "2026-09-10").map((s) => s.workoutId)).toEqual([
      "PLAN-JEU",
    ]);
  });

  test("deux séances clés de deux sources le même jour font un conflit", () => {
    const key = (day: number, id: string): PlanSession => ({ ...session(day, id), isKeySession: true });
    const decharge = plan({
      id: "decharge",
      startDate: "2026-09-07",
      totalWeeks: 1,
      isSingleWeek: true,
      weeks: [week(1, [key(3, "QUAL"), session(0, "EASY")])],
    });
    const hard = plan({
      id: "hard",
      startDate: "2026-08-31",
      totalWeeks: 4,
      weeks: [week(2, [key(3, "TEMPO"), key(0, "LONG")])],
    });
    const composition = placeWeek(EMPTY_COMPOSITION, "decharge", MONDAY);
    const focus = pickTodayFocus([hard, decharge], MONDAY, composition);
    // Jeudi : deux clés, deux sources. Lundi : une clé et un footing, rien.
    expect(weekConflicts(focus)).toEqual([{ dayOfWeek: 3, planIds: ["hard", "decharge"] }]);
    // Une seule source n'a rien à se reprocher.
    expect(weekConflicts(pickTodayFocus([hard], MONDAY))).toEqual([]);
  });

  test("deux plans en cours s'empilent, le plus récent en primaire", () => {
    const older = plan({
      id: "ancien",
      startDate: "2026-09-07",
      createdAt: "2026-01-01T10:00:00.000Z",
      weeks: [week(1, [session(0, "OLD")])],
    });
    const newer = plan({
      id: "recent",
      startDate: "2026-09-07",
      createdAt: "2026-06-01T10:00:00.000Z",
      weeks: [week(1, [session(0, "NEW")])],
    });
    const focus = pickTodayFocus([older, newer], MONDAY);
    expect(focus.plan?.id).toBe("recent");
    expect(focus.sessions.map((s) => s.workoutId)).toEqual(["NEW", "OLD"]);
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

describe("le mois : les repères", () => {
  test("un mois se lit et se décale sans traverser l'année de travers", () => {
    expect(monthOf(new Date(2026, 11, 31))).toEqual({ year: 2026, month: 11 });
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
    expect(sameMonth({ year: 2026, month: 8 }, { year: 2026, month: 8 })).toBe(true);
    expect(compareMonth({ year: 2026, month: 8 }, { year: 2027, month: 0 })).toBeLessThan(0);
  });

  test("les bornes d'un mois sont son premier et son dernier jour", () => {
    expect(monthRange({ year: 2026, month: 1 })).toEqual({ from: "2026-02-01", to: "2026-02-28" });
    expect(monthRange({ year: 2028, month: 1 })).toEqual({ from: "2028-02-01", to: "2028-02-29" });
  });

  test("une date ISO se lit à minuit local", () => {
    const d = dateFromIso("2026-09-17");
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 8, 17, 0]);
  });
});

describe("le mois : une journée par sa date", () => {
  const p = plan({
    id: "p1",
    startDate: "2026-09-07",
    totalWeeks: 2,
    weeks: [
      week(1, [session(0, "LUNDI"), session(2, "MERCREDI")]),
      week(2, [session(0, "L2-A"), session(0, "L2-B"), session(6, "DIM")]),
    ],
  });
  const focus = pickTodayFocus([p], MONDAY);

  test("retrouve la séance, sa semaine et son index", () => {
    const day = planDay(focus, new Date(2026, 8, 14));
    expect(day.inPlan).toBe(true);
    expect(day.weekNumber).toBe(2);
    expect(day.dayOfWeek).toBe(0);
    expect(day.sessions.map((s) => s.workoutId)).toEqual(["L2-A", "L2-B"]);
    // Les adresses pointent le tableau de la semaine : la clôture s'adresse par elles.
    expect(day.refs.map((r) => r.index)).toEqual([0, 1]);
    expect(day.refs.every((r) => r.weekNumber === 2)).toBe(true);
    expect(day.date).toBe("2026-09-14");
  });

  test("un jour du plan sans séance est dans le plan, et vide", () => {
    const day = planDay(focus, new Date(2026, 8, 8));
    expect(day.inPlan).toBe(true);
    expect(day.sessions).toEqual([]);
    expect(day.weekNumber).toBe(1);
  });

  test("avant le plan et après le plan, on est hors plan", () => {
    expect(planDay(focus, new Date(2026, 8, 6)).inPlan).toBe(false);
    expect(planDay(focus, new Date(2026, 8, 6)).weekNumber).toBe(0);
    expect(planDay(focus, new Date(2026, 8, 21)).inPlan).toBe(false);
    // Le dernier dimanche, lui, est dedans.
    expect(planDay(focus, new Date(2026, 8, 20)).sessions.map((s) => s.workoutId)).toEqual(["DIM"]);
  });

  test("sans plan, rien n'est dans le plan", () => {
    const day = planDay(pickTodayFocus([], MONDAY), MONDAY);
    expect(day.inPlan).toBe(false);
    expect(day.dayOfWeek).toBe(0);
  });
});

describe("le mois : la grille", () => {
  const p = plan({ id: "p1", startDate: "2026-09-07", totalWeeks: 4 });
  const focus = pickTodayFocus([p], MONDAY);

  test("toujours six rangées de sept, quel que soit le mois", () => {
    const sept = monthCells(focus, { year: 2026, month: 8 }, MONDAY);
    expect(sept).toHaveLength(MONTH_ROWS * 7);
    // Février 2027 tient en quatre rangées : la grille en garde six.
    expect(monthCells(focus, { year: 2027, month: 1 }, MONDAY)).toHaveLength(42);
  });

  test("commence au lundi de la première rangée, et marque le mois et le jour", () => {
    // Septembre 2026 commence un mardi : la première case est le lundi 31 août.
    const cells = monthCells(focus, { year: 2026, month: 8 }, MONDAY);
    expect(cells[0].date).toBe("2026-08-31");
    expect(cells[0].inMonth).toBe(false);
    expect(cells[1].date).toBe("2026-09-01");
    expect(cells[1].inMonth).toBe(true);
    expect(cells.filter((c) => c.isToday).map((c) => c.date)).toEqual(["2026-09-07"]);
    expect(cells.filter((c) => c.inMonth)).toHaveLength(30);
  });

  test("chaque case sait si elle est dans le plan", () => {
    const cells = monthCells(focus, { year: 2026, month: 8 }, MONDAY);
    const byDate = new Map(cells.map((c) => [c.date, c]));
    expect(byDate.get("2026-09-06")?.inPlan).toBe(false);
    expect(byDate.get("2026-09-07")?.inPlan).toBe(true);
    expect(byDate.get("2026-09-07")?.sessions).toHaveLength(1);
    expect(byDate.get("2026-10-04")?.inPlan).toBe(true);
  });
});

describe("le mois : les bornes du plan", () => {
  test("du mois du premier lundi à celui du dernier dimanche", () => {
    const p = plan({ id: "p1", startDate: "2026-09-07", totalWeeks: 8 });
    const bounds = monthBounds(pickTodayFocus([p], MONDAY));
    // Huit semaines depuis le 7 septembre : le dernier dimanche est le 1er novembre.
    expect(bounds).toEqual({ min: { year: 2026, month: 8 }, max: { year: 2026, month: 10 } });
  });

  test("sans plan, pas de bornes", () => {
    expect(monthBounds(pickTodayFocus([], MONDAY))).toBeNull();
  });

  test("un mois hors bornes est ramené dedans", () => {
    const bounds = { min: { year: 2026, month: 8 }, max: { year: 2026, month: 10 } };
    expect(clampMonth({ year: 2026, month: 5 }, bounds)).toEqual(bounds.min);
    expect(clampMonth({ year: 2027, month: 0 }, bounds)).toEqual(bounds.max);
    expect(clampMonth({ year: 2026, month: 9 }, bounds)).toEqual({ year: 2026, month: 9 });
  });
});

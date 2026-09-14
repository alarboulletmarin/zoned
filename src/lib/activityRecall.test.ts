import { describe, expect, test } from "bun:test";

import { RECALL_WINDOW, recallDurations } from "./activityRecall";
import type { ComplementaryActivity } from "@/types/activity";

let seq = 0;

const make = (over: Partial<ComplementaryActivity> = {}): ComplementaryActivity => ({
  id: over.id ?? `a${seq++}`,
  date: "2026-09-14",
  discipline: "cycling",
  purpose: "commute",
  durationMin: 25,
  createdAt: "2026-09-14T08:00:00.000Z",
  ...over,
});

describe("recallDurations", () => {
  test("rend les durées déjà enregistrées, sans doublon", () => {
    const recalls = recallDurations(
      [make({ durationMin: 25 }), make({ durationMin: 25 }), make({ durationMin: 40 })],
      "cycling",
      "commute",
    );
    expect(recalls.map((r) => r.durationMin)).toEqual([25, 40]);
    expect(recalls[0].count).toBe(2);
  });

  test("classe par fréquence, la date départageant les ex aequo", () => {
    const recalls = recallDurations(
      [
        make({ durationMin: 180, date: "2026-09-13" }),
        make({ durationMin: 25, date: "2026-09-12" }),
        make({ durationMin: 25, date: "2026-09-11" }),
        make({ durationMin: 45, date: "2026-09-10" }),
      ],
      "cycling",
      "commute",
    );
    expect(recalls.map((r) => r.durationMin)).toEqual([25, 180, 45]);
  });

  test("ne mélange ni les disciplines ni les motifs", () => {
    const recalls = recallDurations(
      [
        make({ durationMin: 25 }),
        make({ durationMin: 50, discipline: "running" }),
        make({ durationMin: 75, purpose: "training" }),
      ],
      "cycling",
      "commute",
    );
    expect(recalls.map((r) => r.durationMin)).toEqual([25]);
  });

  test("porte les précisions du relevé le plus récent", () => {
    const recalls = recallDurations(
      [
        make({ durationMin: 85, distanceKm: 26.6, elevationGainM: 270, avgWatts: 150 }),
        make({ durationMin: 85, distanceKm: 24, date: "2026-09-01" }),
      ],
      "cycling",
      "commute",
    );
    expect(recalls[0]).toMatchObject({
      durationMin: 85,
      distanceKm: 26.6,
      elevationGainM: 270,
      avgWatts: 150,
      count: 2,
    });
  });

  test("s'arrête à la limite demandée", () => {
    const recalls = recallDurations(
      [make({ durationMin: 10 }), make({ durationMin: 20 }), make({ durationMin: 30 })],
      "cycling",
      "commute",
      2,
    );
    expect(recalls).toHaveLength(2);
  });

  test("ne regarde pas plus loin que la fenêtre", () => {
    const recent = Array.from({ length: RECALL_WINDOW }, () => make({ durationMin: 25 }));
    const old = make({ durationMin: 999, date: "2020-01-01" });
    const recalls = recallDurations([...recent, old], "cycling", "commute");
    expect(recalls.map((r) => r.durationMin)).toEqual([25]);
  });

  test("un journal vide ne propose rien", () => {
    expect(recallDurations([], "cycling", "commute")).toEqual([]);
  });
});

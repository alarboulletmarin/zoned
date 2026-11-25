import { describe, expect, mock, test } from "bun:test";
import type { ZoneBarBlock } from "./ZoneBar";

mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const { condenseBlocks } = await import("./ZoneBar");

/** n répétitions effort / récupération, la dernière sans récupération. */
function reps(n: number, work: number, rest: number, zone: 5 | 6 = 5): ZoneBarBlock[] {
  const out: ZoneBarBlock[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ seconds: work, zone });
    if (i < n - 1) out.push({ seconds: rest, zone: 0 });
  }
  return out;
}

describe("condenseBlocks", () => {
  test("un 30/30 reste une série, mais garde ses répétitions", () => {
    const [set] = condenseBlocks(reps(12, 30, 30));
    expect(set.zone).toBe(5);
    expect(set.seconds).toBe(12 * 30 + 11 * 30);
    expect(set.efforts).toHaveLength(12);
    const work = set.efforts!.reduce((sum, [a, b]) => sum + (b - a), 0);
    expect(work).toBeCloseTo((12 * 30) / set.seconds, 6);
  });

  test("un 45/15 se distingue d'un 30/30 par sa part d'effort", () => {
    const share = (blocks: ZoneBarBlock[]) => {
      const [set] = condenseBlocks(blocks);
      return set.efforts!.reduce((sum, [a, b]) => sum + (b - a), 0);
    };
    expect(share(reps(10, 45, 15))).toBeGreaterThan(share(reps(10, 30, 30)) + 0.2);
  });

  test("les répétitions tombent à leur place dans la série", () => {
    const [set] = condenseBlocks(reps(2, 30, 30));
    expect(set.efforts).toEqual([
      [0, 1 / 3],
      [2 / 3, 1],
    ]);
  });

  test("un effort continu reste plein, sans dents", () => {
    const [set] = condenseBlocks([{ seconds: 480, zone: 5 }]);
    expect(set.efforts).toBeUndefined();
  });

  test("deux efforts voisins font une seule dent", () => {
    const [set] = condenseBlocks([
      { seconds: 60, zone: 5 },
      { seconds: 10, zone: 6 },
      { seconds: 50, zone: 0 },
      { seconds: 60, zone: 5 },
    ]);
    expect(set.zone).toBe(6);
    expect(set.efforts).toHaveLength(2);
  });

  test("la récupération entre les séries reste un bloc à part", () => {
    const blocks = [...reps(4, 30, 30), { seconds: 180, zone: 0 as const }, ...reps(4, 30, 30)];
    const out = condenseBlocks(blocks);
    expect(out.map((b) => b.zone)).toEqual([5, 0, 5]);
    expect(out[1].efforts).toBeUndefined();
  });

  test("l'endurance se fond sans dents", () => {
    const out = condenseBlocks([
      { seconds: 600, zone: 2 },
      { seconds: 600, zone: 2 },
    ]);
    expect(out).toEqual([{ seconds: 1200, zone: 2 }]);
  });
});

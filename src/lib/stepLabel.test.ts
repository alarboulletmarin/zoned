import { describe, expect, test } from "bun:test";
import { parseLeadingDuration, stripLeadingDuration } from "./stepLabel";

describe("parseLeadingDuration", () => {
  test("les formes du catalogue", () => {
    expect(parseLeadingDuration("5min allure course")?.seconds).toBe(300);
    expect(parseLeadingDuration("30s rapide")?.seconds).toBe(30);
    expect(parseLeadingDuration("15' en sweet-spot")?.seconds).toBe(900);
    expect(parseLeadingDuration('30" sprint maximal')?.seconds).toBe(30);
    expect(parseLeadingDuration("2 h en endurance")?.seconds).toBe(7200);
    expect(parseLeadingDuration("1min30 footing")?.seconds).toBe(90);
    expect(parseLeadingDuration("1h30 sortie longue")?.seconds).toBe(5400);
    expect(parseLeadingDuration("60s")?.seconds).toBe(60);
  });

  test("ni distance, ni répétition, ni durée au milieu", () => {
    expect(parseLeadingDuration("400m alterné")).toBeNull();
    expect(parseLeadingDuration("2km à allure 10K")).toBeNull();
    expect(parseLeadingDuration("3x30s rapide")).toBeNull();
    expect(parseLeadingDuration("Footing 45min")).toBeNull();
    expect(parseLeadingDuration("20 secondes")).toBeNull();
  });
});

describe("stripLeadingDuration", () => {
  test("retire la durée qui vaut celle du bloc", () => {
    expect(stripLeadingDuration("5min allure course", 300)).toBe("Allure course");
    expect(stripLeadingDuration("1min footing", 60)).toBe("Footing");
    expect(stripLeadingDuration("30s rapide", 30)).toBe("Rapide");
    expect(stripLeadingDuration("5min at race pace", 300)).toBe("At race pace");
  });

  test("retire le mot de liaison qu'elle laisse", () => {
    expect(stripLeadingDuration("15min de mise en route très progressive", 900)).toBe(
      "Mise en route très progressive",
    );
  });

  test("garde une durée qui dit autre chose que celle du bloc", () => {
    expect(stripLeadingDuration("5min walk then slow jog", 600)).toBe("5min walk then slow jog");
  });

  test("garde un libellé qui ne serait plus rien", () => {
    expect(stripLeadingDuration("60s", 60)).toBe("60s");
  });

  test("garde tout le reste", () => {
    expect(stripLeadingDuration("3x30s rapide", 30)).toBe("3x30s rapide");
    expect(stripLeadingDuration("400m alterné", 600)).toBe("400m alterné");
    expect(stripLeadingDuration("Footing progressif", 900)).toBe("Footing progressif");
    expect(stripLeadingDuration("5min allure course", undefined)).toBe("5min allure course");
  });
});

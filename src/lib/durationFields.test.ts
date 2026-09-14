import { describe, expect, test } from "bun:test";

import {
  DURATION_MAX_MIN,
  durationDigits,
  durationToMinutes,
  formatDurationDigits,
  minutesToDurationDigits,
  normalizeDurationDigits,
} from "./durationFields";

describe("durationDigits", () => {
  /* La valeur brute du champ porte le masque : le retirer est le travail de
     cette fonction, jamais celui de l'appelant. */
  test("retire le masque et ne garde que les chiffres", () => {
    expect(durationDigits("1:25")).toBe("125");
    expect(durationDigits("12:45")).toBe("1245");
    expect(durationDigits("")).toBe("");
    expect(durationDigits("abc")).toBe("");
  });

  test("une frappe à la fin repousse les chiffres vers les heures", () => {
    // Le champ affiche 1:25, on tape un 5 : la valeur brute devient 1:255.
    expect(durationDigits("1:255")).toBe("1255");
  });

  test("ignore le cinquième chiffre plutôt que de chasser le premier", () => {
    expect(durationDigits("12:455")).toBe("1245");
  });

  /* Sans le retrait des zéros de tête, l'effacement ne finit jamais : 0:01
     efface en 0:0, que le masque réaffiche 0:00, qui efface en 0:0... */
  test("le dernier effacement vide le champ au lieu de boucler sur 0:00", () => {
    expect(durationDigits("0:0")).toBe("");
    expect(durationDigits("0:00")).toBe("");
  });

  test("les zéros de tête ne comptent pas dans les quatre chiffres", () => {
    expect(durationDigits("0:045")).toBe("45");
    expect(durationDigits("00:2400")).toBe("2400");
  });
});

describe("formatDurationDigits", () => {
  test("les deux derniers chiffres sont toujours les minutes", () => {
    expect(formatDurationDigits("4")).toBe("0:04");
    expect(formatDurationDigits("45")).toBe("0:45");
    expect(formatDurationDigits("125")).toBe("1:25");
    expect(formatDurationDigits("1245")).toBe("12:45");
  });

  test("un champ vide reste vide, il ne montre pas un 0:00 qui aurait l'air saisi", () => {
    expect(formatDurationDigits("")).toBe("");
  });

  test("les zéros de tête des heures ne s'affichent pas", () => {
    expect(formatDurationDigits("0045")).toBe("0:45");
    expect(formatDurationDigits("0130")).toBe("1:30");
  });
});

describe("durationToMinutes", () => {
  test("rend le total en minutes", () => {
    expect(durationToMinutes("125")).toBe(85);
    expect(durationToMinutes("45")).toBe(45);
    expect(durationToMinutes("1245")).toBe(765);
  });

  test("rien de saisi ne vaut aucune durée", () => {
    expect(durationToMinutes("")).toBeUndefined();
  });

  /* La règle de tolérance : 0:90 est une durée, pas une faute de saisie. */
  test("accepte plus de 59 minutes", () => {
    expect(durationToMinutes("90")).toBe(90);
    expect(durationToMinutes("290")).toBe(210);
  });

  test("un zéro explicite reste une valeur", () => {
    expect(durationToMinutes("0")).toBe(0);
    expect(durationToMinutes("000")).toBe(0);
  });
});

describe("minutesToDurationDigits", () => {
  test("remet des minutes stockées dans le champ", () => {
    expect(minutesToDurationDigits(85)).toBe("125");
    // Forme canonique, sans zéro de tête, comme ce que rend `durationDigits`.
    expect(minutesToDurationDigits(45)).toBe("45");
    expect(formatDurationDigits(minutesToDurationDigits(85))).toBe("1:25");
    expect(formatDurationDigits(minutesToDurationDigits(45))).toBe("0:45");
    expect(formatDurationDigits(minutesToDurationDigits(120))).toBe("2:00");
  });

  test("zéro et les valeurs impossibles donnent un champ vide", () => {
    expect(minutesToDurationDigits(0)).toBe("");
    expect(minutesToDurationDigits(-10)).toBe("");
    expect(minutesToDurationDigits(Number.NaN)).toBe("");
  });

  test("plafonne à une journée", () => {
    expect(formatDurationDigits(minutesToDurationDigits(5000))).toBe("24:00");
  });
});

describe("normalizeDurationDigits", () => {
  test("range les minutes qui débordent dans les heures", () => {
    expect(formatDurationDigits(normalizeDurationDigits("90"))).toBe("1:30");
    expect(formatDurationDigits(normalizeDurationDigits("290"))).toBe("3:30");
  });

  test("ne touche pas à une saisie déjà rangée", () => {
    expect(normalizeDurationDigits("125")).toBe("125");
    expect(normalizeDurationDigits("45")).toBe("45");
  });

  test("plafonne à une journée", () => {
    expect(normalizeDurationDigits("4800")).toBe(minutesToDurationDigits(DURATION_MAX_MIN));
  });

  test("un champ vide ou nul le reste", () => {
    expect(normalizeDurationDigits("")).toBe("");
    expect(normalizeDurationDigits("000")).toBe("");
  });
});

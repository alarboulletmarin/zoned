/**
 * Le retry de la capture PNG, et ce qu'il rattrape.
 *
 * `toPng` passe par un SVG `foreignObject` charge dans une `<img>`, et cette
 * etape echoue par intermittence hors Chromium. L'echec n'est pas
 * deterministe : le meme appel repasse au coup suivant. Ces tests pinnent que
 * le second essai a bien lieu, et que trois echecs de suite remontent la
 * derniere erreur plutot qu'une erreur inventee.
 */

import { beforeEach, describe, expect, mock, test } from "bun:test";

let attempts = 0;
let script: Array<"ok" | "boom"> = [];

mock.module("html-to-image", () => ({
  toPng: async () => {
    const outcome = script[attempts] ?? "ok";
    attempts += 1;
    if (outcome === "boom") throw new Error(`echec ${attempts}`);
    return `data:image/png;base64,essai${attempts}`;
  },
}));

const { renderPng } = await import("./share");

const element = {} as HTMLElement;

describe("renderPng", () => {
  beforeEach(() => {
    attempts = 0;
    script = [];
  });

  test("rend du premier coup quand la capture passe", async () => {
    expect(await renderPng(element, {})).toBe("data:image/png;base64,essai1");
    expect(attempts).toBe(1);
  });

  test("un echec isole est rattrape par l'essai suivant", async () => {
    script = ["boom"];
    expect(await renderPng(element, {})).toBe("data:image/png;base64,essai2");
    expect(attempts).toBe(2);
  });

  test("trois echecs remontent la derniere erreur, sans quatrieme essai", async () => {
    script = ["boom", "boom", "boom"];
    await expect(renderPng(element, {})).rejects.toThrow("echec 3");
    expect(attempts).toBe(3);
  });
});

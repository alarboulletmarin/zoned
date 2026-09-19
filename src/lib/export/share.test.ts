/**
 * La capture PNG : les polices qu'on embarque, et le retry qui les suit.
 *
 * Deux pannes distinctes sont pinnees ici.
 *
 * La premiere etait deterministe et n'a frappe que Firefox : le filtre de
 * html-to-image lit `rule.style.fontFamily` sur une `CSSFontFaceRule`, un
 * raccourci que Firefox rend `undefined`, et la lib appelle `.trim()` dessus.
 * Passer `fontEmbedCSS` nous-memes court-circuite ce filtre. Le test veille
 * donc a ce que l'option arrive bien jusqu'a `toPng`, polices inline dedans.
 *
 * La seconde est aleatoire et touche tout ce qui n'est pas Chromium : le SVG
 * `foreignObject` charge dans une `<img>` echoue au premier passage et repasse
 * au second. Le test veille a ce que le second essai ait lieu, et a ce que
 * trois echecs remontent la derniere erreur plutot qu'une erreur inventee.
 *
 * Bun n'a pas de DOM : la feuille de style et le reseau sont remplaces par le
 * minimum que `buildFontCSS()` traverse.
 */

import { beforeEach, describe, expect, mock, test } from "bun:test";

let attempts = 0;
let script: Array<"ok" | "boom"> = [];
let lastOptions: Record<string, unknown> | undefined;

mock.module("html-to-image", () => ({
  toPng: async (_node: unknown, options: Record<string, unknown>) => {
    lastOptions = options;
    const outcome = script[attempts] ?? "ok";
    attempts += 1;
    if (outcome === "boom") throw new Error(`echec ${attempts}`);
    return `data:image/png;base64,essai${attempts}`;
  },
}));

// ── Le DOM minimal que la collecte des polices traverse ─────────────

class FakeFontFaceRule {
  constructor(readonly cssText: string) {}
}

const WOFF2 = new Uint8Array([0x77, 0x4f, 0x46, 0x32]); // "wOF2"

Object.assign(globalThis, {
  CSSFontFaceRule: FakeFontFaceRule,
  document: {
    baseURI: "https://zoned.run/",
    styleSheets: [
      // Une feuille d'une autre origine : illisible, et elle ne doit pas
      // faire tomber la collecte.
      {
        get cssRules(): never {
          throw new Error("SecurityError");
        },
      },
      {
        cssRules: [
          new FakeFontFaceRule(
            '@font-face { font-family: "Space Grotesk"; src: url("/fonts/space-grotesk-latin.woff2") format("woff2"); }',
          ),
          { cssText: ".zn-paper { color: red; }" },
        ],
      },
    ],
  },
  fetch: async (url: URL) => ({
    ok: String(url).endsWith(".woff2"),
    headers: new Headers({ "content-type": "font/woff2" }),
    arrayBuffer: async () => WOFF2.buffer,
  }),
});

const { renderPng } = await import("./share");

const element = {} as HTMLElement;

describe("renderPng", () => {
  beforeEach(() => {
    attempts = 0;
    script = [];
    lastOptions = undefined;
  });

  test("embarque les polices lui-meme, sans laisser la lib lire les regles", async () => {
    await renderPng(element, { pixelRatio: 2 });
    expect(lastOptions?.fontEmbedCSS).toBe(
      '@font-face { font-family: "Space Grotesk"; src: url("data:font/woff2;base64,d09GMg==") format("woff2"); }',
    );
    expect(lastOptions?.pixelRatio).toBe(2);
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

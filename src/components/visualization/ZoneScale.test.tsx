import { describe, expect, mock, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import frCommon from "@/i18n/locales/fr/common.json";

mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const { ZoneScale } = await import("./ZoneScale");

const i18n = i18next.createInstance();
await i18n.use(initReactI18next).init({
  lng: "fr",
  defaultNS: "common",
  resources: { fr: { common: frCommon } },
});

const render = (props: Parameters<typeof ZoneScale>[0]) =>
  renderToStaticMarkup(createElement(I18nextProvider, { i18n }, createElement(ZoneScale, props)));

describe("ZoneScale", () => {
  test("sans onToggle, une légende : aucun bouton", () => {
    const html = render({});
    expect(html).not.toContain("<button");
    expect(html.match(/zn-zone-badge"/g)).toHaveLength(6);
  });

  test("avec onToggle, six boutons à bascule, un groupe nommé", () => {
    const html = render({ title: "Pic d'intensité", selected: [2], onToggle: () => {} });
    expect(html.match(/<button/g)).toHaveLength(6);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(5);
    expect(html).toContain('role="group" aria-label="Pic d&#x27;intensité"');
    expect(html).toContain("data-filtering");
  });

  test("rien de coché : pas d'atténuation", () => {
    expect(render({ onToggle: () => {} })).not.toContain("data-filtering");
  });
});

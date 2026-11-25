import { describe, expect, mock, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import frLibrary from "@/i18n/locales/fr/library.json";
import frStrength from "@/i18n/locales/fr/strength.json";
import frCommon from "@/i18n/locales/fr/common.json";
import type { AnyWorkoutTemplate, WorkoutTemplate } from "@/types";
import type { StrengthWorkoutTemplate } from "@/types/strength";

// Le module i18n de l'app charge ses langues par import.meta.glob, que le
// runner de Bun n'a pas : les composants lisent la langue de cette instance.
mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const { WorkoutRow } = await import("./WorkoutRow");

const i18n = i18next.createInstance();
await i18n.use(initReactI18next).init({
  lng: "fr",
  fallbackLng: "fr",
  defaultNS: "common",
  resources: { fr: { library: frLibrary, strength: frStrength, common: frCommon } },
  interpolation: { escapeValue: false },
});

const hills = {
  id: "ROWT-HIL",
  name: "Côtes bondissantes",
  nameEn: "Bounding hills",
  description: "",
  descriptionEn: "",
  category: "hills",
  difficulty: "advanced",
  environment: { requiresTrack: true, requiresHills: true },
  warmupTemplate: [],
  cooldownTemplate: [],
  mainSetTemplate: [
    { description: "Footing", descriptionEn: "Jog", durationMin: 20, zone: "Z2", elevationGainM: 120 },
    { description: "Bonds", descriptionEn: "Bounds", durationMin: 5, zone: "Z6" },
  ],
} as unknown as WorkoutTemplate;

const core = {
  id: "ROWT-STR",
  kind: "strength",
  name: "Gainage coureur",
  nameEn: "Runner core",
  description: "",
  descriptionEn: "",
  category: "runner_core",
  difficulty: "beginner",
  typicalDuration: { min: 20, max: 30 },
  equipment: ["none"],
  primaryMuscleGroups: ["core_anterior"],
  intensity: "moderate",
} as unknown as StrengthWorkoutTemplate;

function render(workout: AnyWorkoutTemplate, favorite: boolean): string {
  return renderToStaticMarkup(
    createElement(
      I18nextProvider,
      { i18n },
      createElement(MemoryRouter, null, createElement(WorkoutRow, { workout, favorite })),
    ),
  );
}

const text = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'");
const attr = (html: string, name: string) => html.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? null;

/** Le texte de l'élément qui porte cet id (un span sans span imbriqué). */
function textOfId(html: string, id: string): string {
  const match = html.match(new RegExp(`<span[^>]*id="${id}"[^>]*>([\\s\\S]*?)</span>`));
  return match ? text(match[1]) : "";
}

/** La ligne des faits, jusqu'à la fin du lien. */
function factsOf(html: string): string {
  const start = html.indexOf('class="zn-wrow__facts"');
  return html.slice(start, html.lastIndexOf("</a>"));
}

describe("WorkoutRow", () => {
  for (const [label, workout] of [["course", hills], ["renfo", core]] as const) {
    test(`${label} : un seul lien, rien d'interactif dedans`, () => {
      const html = render(workout, true);
      expect(html.match(/<a[\s>]/g)?.length).toBe(1);
      expect(html.startsWith("<a ")).toBe(true);
      expect(html.trimEnd().endsWith("</a>")).toBe(true);
      expect(html).not.toMatch(/<(button|input|select|textarea)[\s>]/);
      expect(html).not.toMatch(/tabindex=/i);
    });

    test(`${label} : le nom accessible est le nom de la séance`, () => {
      const html = render(workout, false);
      const labelledby = attr(html, "aria-labelledby");
      expect(labelledby).not.toBeNull();
      expect(labelledby!.split(" ")).toHaveLength(1);
      expect(textOfId(html, labelledby!)).toBe(workout.name);
    });
  }

  test("le coeur d'état n'apparaît que pour un favori", () => {
    const fav = render(hills, true);
    expect(fav).toContain('role="img"');
    expect(fav).toContain('aria-label="Dans tes favoris"');
    const markId = fav.match(/<span id="([^"]+)" class="zn-favmark"/)?.[1];
    expect(markId).toBeDefined();
    expect(attr(fav, "aria-describedby")).toContain(markId!);

    const plain = render(hills, false);
    expect(plain).not.toContain("Dans tes favoris");
    expect(plain).not.toContain("zn-favmark");
  });

  test("les faits : pic, durée de la page séance, niveau, D+ et Piste, sans point final", () => {
    const html = render(hills, false);
    const facts = factsOf(html);
    expect(facts).toMatch(/class="zn-zone-badge"[^>]*>Z6</);
    const words = text(facts);
    expect(words).toContain("25\u00a0min");
    expect(words).toContain("Avancé");
    expect(words).toContain("120\u00a0m");
    expect(words).toContain("Piste");
    expect(words.trim().endsWith("·")).toBe(false);
    // Le profil est décoratif : le lien se nomme déjà.
    expect(html).toMatch(/aria-hidden="true" class="zn-zonebar/);
  });

  test("le renfo : ni profil ni badge, sa catégorie et son matériel", () => {
    const html = render(core, false);
    expect(html).not.toContain("zn-zonebar");
    expect(html).not.toContain("zn-zone-badge");
    expect(html).toMatch(/class="zn-wrow__kind">[^<]+ · [^<]+</);
    expect(text(factsOf(html))).toContain("25\u00a0min");
  });
});

import { afterEach, describe, expect, test } from "bun:test";
import { isServerSnapshot } from "./snapshot";

const g = globalThis as Record<string, unknown>;

function page(path: string, search: string) {
  g.document = { documentElement: { getAttribute: (k: string) => (k === "data-prerender-path" ? path : "fr") } };
  g.window = { location: { pathname: path, search } };
  g.localStorage = { getItem: () => null };
}

afterEach(() => {
  delete g.document;
  delete g.window;
  delete g.localStorage;
});

describe("isServerSnapshot", () => {
  test("une page prérendue sans paramètres s'hydrate", () => {
    page("/calculators/allures", "");
    expect(isServerSnapshot()).toBe(true);
  });

  test("un lien avec paramètres ne s'hydrate pas : le HTML a été rendu sans eux", () => {
    page("/calculators/allures", "?kmh=15");
    expect(isServerSnapshot()).toBe(false);
  });

  test("?lang reste le seul paramètre compatible avec le HTML", () => {
    page("/calculators/allures", "?lang=fr");
    expect(isServerSnapshot()).toBe(true);
  });
});

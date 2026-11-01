import { describe, expect, test } from "bun:test";
import { SEO_HUBS, SEO_TARGETS } from "@/data/seo/link-targets";
import { linksFor } from "./hub-links";

const STRIKING = [
  "/calculators/vma",
  "/glossary/surge",
  "/workout/ASS-005",
  "/race-simulator",
  "/learn/zones",
  "/guides",
  "/glossary/zone-4",
  "/learn/testing-vma",
  "/workout/ASS-008",
  "/calculators/equivalence",
  "/calculators/css",
  "/glossary/oscillation-verticale",
  "/glossary/tempo-run",
  "/glossary/cycle-foulee",
  "/glossary/vitesse-critique",
  "/glossary/zone-1",
  "/learn/warmup",
  "/glossary/strides",
  "/learn/supercompensation",
  "/glossary/temps-contact-sol",
  "/glossary/semi-marathon",
  "/workout/ASS-007",
  "/glossary/medio-pied",
  "/glossary/attaque-talon",
  "/workout/FAR-013",
  "/glossary/zone-5",
  "/glossary/peaking",
  "/calculators/table-allures",
  "/calculators/zones",
  "/compare/runna",
];

describe("liens contextuels", () => {
  test("les pages proches de la premiere page sont dans la config", () => {
    const paths = new Set([...SEO_TARGETS, ...SEO_HUBS].map((t) => t.path));
    for (const path of STRIKING) {
      expect(paths.has(path)).toBe(true);
    }
  });

  test("une seance VMA pointe vers le calculateur et l'article, avec une ancre descriptive", () => {
    const links = linksFor(
      { kind: "workout", id: "VMA-001", category: "vma_intervals", zone: 5, discipline: "running" },
      "fr",
    );
    const paths = links.map((l) => l.path);
    expect(paths).toContain("/calculators/vma");
    expect(paths).toContain("/learn/testing-vma");
    expect(paths).toContain("/calculators/zones");
    for (const link of links) {
      expect(link.anchor.toLowerCase()).not.toContain("en savoir plus");
      expect(link.anchor.length).toBeGreaterThan(8);
    }
  });

  test("le meme couple source et cible garde la meme ancre", () => {
    const source = { kind: "glossary" as const, id: "fartlek", category: "sessions", zone: null };
    const a = linksFor(source, "en");
    const b = linksFor(source, "en");
    expect(a).toEqual(b);
    expect(a.some((l) => l.path === "/glossary/surge")).toBe(true);
  });

  test("une page ne se lie pas a elle-meme", () => {
    const links = linksFor({ kind: "article", id: "zones" }, "fr");
    expect(links.some((l) => l.path === "/learn/zones")).toBe(false);
  });

  test("une seance d'endurance en zone 2 pointe vers le test MAF", () => {
    const links = linksFor(
      { kind: "workout", id: "END-001", category: "endurance", zone: 2, discipline: "running" },
      "en",
    );
    expect(links.some((l) => l.path === "/workout/ASS-008")).toBe(true);
    const maf = links.find((l) => l.path === "/workout/ASS-008");
    expect(maf?.anchor.toLowerCase()).toContain("maf");
  });
});

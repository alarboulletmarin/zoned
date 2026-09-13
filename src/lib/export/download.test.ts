/**
 * Le geste de telechargement, et les trois defauts qu'il efface.
 *
 * Ce que ces tests pinnent n'est pas de la mise en forme : c'est la difference
 * entre un fichier qui arrive et un fichier qui n'arrive pas.
 *
 *   - l'ancre doit etre DANS le document au moment du clic (Firefox) ;
 *   - l'URL objet ne doit PAS etre liberee dans le meme tour de boucle
 *     (Safari) ;
 *   - le nom doit etre acceptable par un systeme de fichiers.
 *
 * Bun n'a pas de DOM : le document est remplace par un mouchard qui note
 * l'ordre reel des appels, ce qui est justement ce qu'on veut verifier.
 */

import { afterEach, describe, expect, test } from "bun:test";

import { sanitizeFilename, triggerDownload } from "./download";

// ── Mouchard ────────────────────────────────────────────────────────

type Anchor = { href: string; download: string; rel: string; click: () => void };

type Trace = {
  events: string[];
  anchor: Anchor;
  inDocumentAtClick: boolean;
  revoked: string[];
};

function withFakeDocument(run: () => void): Trace {
  const events: string[] = [];
  const attached = new Set<Anchor>();
  const revoked: string[] = [];
  let inDocumentAtClick = false;

  const anchor: Anchor = {
    href: "",
    download: "",
    rel: "",
    click: () => {
      events.push("click");
      inDocumentAtClick = attached.has(anchor);
    },
  };

  const fakeDocument = {
    createElement: () => anchor,
    body: {
      appendChild: (node: Anchor) => {
        events.push("append");
        attached.add(node);
      },
      removeChild: (node: Anchor) => {
        events.push("remove");
        attached.delete(node);
      },
    },
  };

  const realCreate = URL.createObjectURL;
  const realRevoke = URL.revokeObjectURL;
  Object.defineProperty(globalThis, "document", { value: fakeDocument, configurable: true });
  URL.createObjectURL = () => "blob:zoned-test";
  URL.revokeObjectURL = (url: string) => {
    events.push("revoke");
    revoked.push(url);
  };

  try {
    run();
  } finally {
    URL.createObjectURL = realCreate;
    URL.revokeObjectURL = realRevoke;
    Reflect.deleteProperty(globalThis, "document");
  }

  return { events, anchor, inDocumentAtClick, revoked };
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "document");
});

// ── Tests ───────────────────────────────────────────────────────────

describe("triggerDownload", () => {
  test("clique une ancre qui est dans le document", () => {
    const trace = withFakeDocument(() => {
      triggerDownload(new Blob(["x"]), "seance.pdf");
    });

    // Firefox ne declenche rien sur une ancre detachee : l'ordre compte.
    expect(trace.events.slice(0, 3)).toEqual(["append", "click", "remove"]);
    expect(trace.inDocumentAtClick).toBe(true);
    expect(trace.anchor.download).toBe("seance.pdf");
    expect(trace.anchor.href).toBe("blob:zoned-test");
  });

  test("ne libere pas l'URL objet dans le tour de boucle du clic", async () => {
    const trace = withFakeDocument(() => {
      triggerDownload(new Blob(["x"]), "seance.pdf");
    });

    // Safari annule le transfert si le blob disparait sous lui.
    expect(trace.events).not.toContain("revoke");
    expect(trace.revoked).toEqual([]);
  });

  test("une URL deja formee, data URL comprise, n'est pas a liberer", () => {
    const trace = withFakeDocument(() => {
      triggerDownload("data:image/png;base64,AAAA", "carte.png");
    });

    expect(trace.anchor.href).toBe("data:image/png;base64,AAAA");
    expect(trace.events).not.toContain("revoke");
  });

  test("rend le nom de fichier reellement propose", () => {
    let name = "";
    withFakeDocument(() => {
      name = triggerDownload(new Blob(["x"]), "Boucle 10/10 : le retour.gpx");
    });

    expect(name).toBe("Boucle 10-10 - le retour.gpx");
  });
});

describe("sanitizeFilename", () => {
  test("garde les accents : un plan garde son nom", () => {
    expect(sanitizeFilename("plan-10K-Semi de février.pdf")).toBe("plan-10K-Semi de février.pdf");
  });

  test("remplace ce qu'un systeme de fichiers refuse", () => {
    expect(sanitizeFilename('a/b\\c:d*e?f"g<h>i|j.json')).toBe("a-b-c-d-e-f-g-h-i-j.json");
  });

  test("un nom vide ou reduit a rien retombe sur un nom neutre", () => {
    expect(sanitizeFilename("")).toBe("download");
    expect(sanitizeFilename("   ")).toBe("download");
    expect(sanitizeFilename("...")).toBe("download");
  });

  test("tronque en gardant l'extension, qui porte le type", () => {
    const long = "z".repeat(300) + ".ics";
    const result = sanitizeFilename(long);

    expect(result.length).toBeLessThanOrEqual(120);
    expect(result.endsWith(".ics")).toBe(true);
  });
});

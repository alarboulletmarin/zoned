import { describe, expect, test } from "bun:test";
import jsQR from "jsqr";

import { BACKUP_STORAGE_KEYS, DEVICE_ONLY_KEYS, type BackupData } from "./backup";
import { qrImages, type QrImage } from "./qrImage";
import {
  CHUNK_SIZE,
  MAX_FRAMES,
  Receiver,
  base45Decode,
  base45Encode,
  buildSyncData,
  crc32,
  encodeFrames,
  type Received,
} from "./qrSync";

const bytes = (text: string) => new TextEncoder().encode(text);

/** Résultat final : celui de la dernière trame, ou la fin de séance si elle est déjà arrivée. */
async function feed(receiver: Receiver, frames: readonly string[]): Promise<Received> {
  let last: Received = { kind: "ignored" };
  for (const frame of frames) {
    const result = await receiver.accept(frame);
    if (result.kind === "done" || result.kind === "failed") return result;
    last = result;
  }
  return last;
}

/** Quelques mois de plans, des activités et des profils : un usage courant. */
function sampleBackup(): BackupData {
  const plans = Array.from({ length: 4 }, (_, p) => ({
    id: `plan-${p}`,
    name: `Plan marathon ${p}`,
    weeks: Array.from({ length: 16 }, (_, w) => ({
      week: w + 1,
      sessions: Array.from({ length: 5 }, (_, s) => ({
        id: `S-${p}-${w}-${s}`,
        title: `Séance ${s} de la semaine ${w}`,
        minutes: 40 + ((w * 7 + s * 13) % 50),
        note: "Allure facile, finir par quatre lignes droites.",
      })),
    })),
  }));
  const activities = Array.from({ length: 300 }, (_, i) => ({
    id: `act-${i}`,
    date: `2026-0${(i % 9) + 1}-1${i % 9}`,
    minutes: 20 + (i % 70),
  }));
  return {
    _meta: { version: 2, app: "zoned", exportedAt: "2026-09-30T10:00:00.000Z" },
    localStorage: {
      "zoned-plans": plans,
      "zoned-activities": activities,
      "zoned-runner-profile": { vma: 17.5, fcMax: 190 },
    },
  };
}

describe("base45", () => {
  test("reproduit les vecteurs de la RFC 9285", () => {
    expect(base45Encode(bytes("AB"))).toBe("BB8");
    expect(base45Encode(bytes("Hello!!"))).toBe("%69 VD92EX0");
    expect(base45Encode(bytes("base-45"))).toBe("UJCLQE7W581");
    expect(new TextDecoder().decode(base45Decode("QED8WEX0"))).toBe("ietf!");
  });

  test("aller-retour sur tous les octets, longueur paire et impaire", () => {
    for (const length of [0, 1, 2, 255, 256, 1001]) {
      const input = Uint8Array.from({ length }, (_, i) => (i * 37 + 11) & 0xff);
      expect(base45Decode(base45Encode(input))).toEqual(input);
    }
  });

  test("refuse un caractère hors alphabet, une longueur impossible, une valeur hors borne", () => {
    expect(() => base45Decode("ab")).toThrow();
    expect(() => base45Decode("ABCD")).toThrow();
    expect(() => base45Decode(":::")).toThrow();
  });
});

describe("crc32", () => {
  test("vecteur connu", () => {
    expect(crc32(bytes("123456789"))).toBe(0xcbf43926);
  });
});

describe("buildSyncData", () => {
  test("n'envoie aucun réglage d'appareil", () => {
    const everything = Object.fromEntries(BACKUP_STORAGE_KEYS.map((k) => [k, JSON.stringify(k)]));
    const data = buildSyncData((key) => everything[key] ?? null);
    for (const key of DEVICE_ONLY_KEYS) expect(key in data.localStorage).toBe(false);
    expect("zoned-plans" in data.localStorage).toBe(true);
    expect("zoned-activities" in data.localStorage).toBe(true);
  });
});

describe("encodeFrames et Receiver", () => {
  test("aller-retour : les données arrivent à l'identique", async () => {
    const backup = sampleBackup();
    const frames = await encodeFrames(backup);
    expect(frames.length).toBeGreaterThan(1);
    const result = await feed(new Receiver(), frames);
    expect(result).toEqual({ kind: "done", backup });
  });

  test("chaque trame est lisible en mode alphanumérique et ne dépasse pas la taille visée", async () => {
    const frames = await encodeFrames(sampleBackup());
    for (const frame of frames) {
      expect(frame).toMatch(/^ZND1:[0-9A-F]{8}:\d+:\d+:[0-9A-Z $%*+\-./:]*$/);
      expect(frame.length).toBeLessThanOrEqual("ZND1:00000000:0000:0000:".length + CHUNK_SIZE);
    }
  });

  test("ordre quelconque et trames en double", async () => {
    const backup = sampleBackup();
    const frames = await encodeFrames(backup);
    const shuffled = [...frames.slice(3), ...frames, ...frames.slice(0, 3)].reverse();
    expect(await feed(new Receiver(), shuffled)).toEqual({ kind: "done", backup });
  });

  test("rend la progression tant qu'il manque des trames", async () => {
    const frames = await encodeFrames(sampleBackup());
    const receiver = new Receiver();
    const first = await receiver.accept(frames[0] ?? "");
    expect(first).toMatchObject({ kind: "progress", got: 1, count: frames.length });
    expect(await receiver.accept(frames[0] ?? "")).toMatchObject({ kind: "progress", got: 1 });
  });

  test("ignore sans bruit un texte qui n'est pas une trame", async () => {
    const receiver = new Receiver();
    for (const text of ["", "https://example.org", "TCF1:00000000:0:1:ABC", "ZND1:zz:0:1:A"]) {
      expect(await receiver.accept(text)).toEqual({ kind: "ignored" });
    }
    expect(await receiver.accept("ZND1:00000000:5:3:ABC")).toEqual({ kind: "ignored" });
    expect(await receiver.accept(`ZND1:00000000:0:${MAX_FRAMES + 1}:ABC`)).toEqual({
      kind: "ignored",
    });
  });

  test("repart de zéro quand l'émetteur relance un autre envoi", async () => {
    const a = await encodeFrames(sampleBackup());
    const other = sampleBackup();
    other.localStorage["zoned-runner-profile"] = { vma: 12 };
    const b = await encodeFrames(other);
    const receiver = new Receiver();
    await receiver.accept(a[0] ?? "");
    expect(await feed(receiver, b)).toEqual({ kind: "done", backup: other });
  });

  test("un octet corrompu fait échouer la séance, et elle reste échouée", async () => {
    const frames = await encodeFrames(sampleBackup());
    const broken = [...frames];
    const last = broken.length - 1;
    const frame = broken[last] ?? "";
    // Change le dernier caractère de données pour un autre caractère valide
    broken[last] = frame.slice(0, -1) + (frame.endsWith("A") ? "B" : "A");
    const receiver = new Receiver();
    expect(await feed(receiver, broken)).toEqual({ kind: "failed", reason: "invalid" });
    expect(await receiver.accept(frames[0] ?? "")).toEqual({ kind: "ignored" });
  });

  test("refuse une sauvegarde écrite par une version plus récente", async () => {
    const backup = sampleBackup();
    backup._meta.version = 99;
    expect(await feed(new Receiver(), await encodeFrames(backup))).toEqual({
      kind: "failed",
      reason: "newer",
    });
  });

  test("refuse des données qui ne sont pas une sauvegarde Zoned", async () => {
    const frames = await encodeFrames({ hello: "world" } as unknown as BackupData);
    expect(await feed(new Receiver(), frames)).toEqual({ kind: "failed", reason: "invalid" });
  });
});

describe("qrImages", () => {
  /** Rastérise le tracé SVG en pixels, `scale` pixels par module. */
  function raster(image: QrImage, scale = 4) {
    const side = image.size * scale;
    const pixels = new Uint8ClampedArray(side * side * 4).fill(255);
    for (const m of image.path.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
      const [x, y, w] = [Number(m[1]), Number(m[2]), Number(m[3])];
      for (let py = y * scale; py < (y + 1) * scale; py++) {
        for (let px = x * scale; px < (x + w) * scale; px++) {
          const at = (py * side + px) * 4;
          pixels[at] = pixels[at + 1] = pixels[at + 2] = 0;
        }
      }
    }
    return { pixels, side };
  }

  test("tous les codes ont la même taille", async () => {
    const images = qrImages(await encodeFrames(sampleBackup()));
    expect(new Set(images.map((i) => i.size)).size).toBe(1);
  });

  test("le dernier code est plus court et reste lisible à la même taille", async () => {
    const frames = await encodeFrames(sampleBackup());
    const images = qrImages(frames);
    const last = images[images.length - 1];
    if (!last) throw new Error("aucun code");
    const { pixels, side } = raster(last);
    expect(jsQR(pixels, side, side)?.data).toBe(frames[frames.length - 1]);
  });

  test("bout en bout : les codes lus par jsQR reconstruisent les données", async () => {
    const backup = sampleBackup();
    const frames = await encodeFrames(backup);
    const receiver = new Receiver();
    let result: Received = { kind: "ignored" };
    for (const image of qrImages(frames)) {
      const { pixels, side } = raster(image);
      const text = jsQR(pixels, side, side)?.data;
      expect(text).toBeDefined();
      result = await receiver.accept(text ?? "");
    }
    expect(result).toEqual({ kind: "done", backup });
  });
});

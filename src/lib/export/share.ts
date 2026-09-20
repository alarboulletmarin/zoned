/**
 * Share pipeline for social-style workout images.
 *
 * Three exported actions, all running entirely client-side and sharing the
 * same `nodeToBlob()` helper:
 *  - downloadImage : trigger a browser download (always available)
 *  - copyImage     : write PNG to the system clipboard (Chromium / FF 127+ / Safari 16.4+)
 *  - shareImage    : native iOS/Android share sheet (Web Share API L2), download fallback
 *
 * Templates that support transparent export expose an internal `.bg-layer`
 * background that is hidden when their wrapper carries `data-transparent="true"`.
 * Passing `transparent: true` here just tells html-to-image to skip the white
 * canvas fill, alpha is preserved.
 */

import type { RefObject } from "react";
import { AppFailure } from "@/lib/failure";
import { THEME_COLOR, documentTheme } from "@/lib/theme";
import { triggerDownload } from "./download";

export interface ToPngOptions {
  pixelRatio?: number;
  backgroundColor?: string;
  cacheBust?: boolean;
  skipFonts?: boolean;
  width?: number;
  height?: number;
  style?: Partial<CSSStyleDeclaration>;
  fontEmbedCSS?: string;
}

/**
 * Le CSS des polices, embarque par nous plutot que par la lib.
 *
 * `html-to-image` sait le faire seul, mais son filtre lit
 * `rule.style.fontFamily` sur une `CSSFontFaceRule`. Chrome expose ce
 * raccourci ; Firefox rend `undefined` pour les descripteurs d'un
 * `@font-face`, et la lib appelle `.trim()` dessus. Tout export image
 * echouait donc sur Firefox, a chaque fois, sur
 * "can't access property trim, t is undefined". C'est deterministe, pas
 * intermittent, et amont n'a pas de correctif : 1.11.13 est la derniere.
 *
 * Fournir `fontEmbedCSS` court-circuite ce filtre : `embedWebFonts` pose la
 * chaine telle quelle et ne lit plus aucune regle. On repart donc des memes
 * `@font-face` que la page, lus par l'API qui, elle, marche partout, avec
 * chaque woff2 inline en base64. Lu une fois par session, comme les polices
 * du PDF.
 */
let fontCSS: Promise<string> | null = null;

function embeddedFontCSS(): Promise<string> {
  if (!fontCSS) {
    fontCSS = buildFontCSS();
    // Un echec reseau ne doit pas condamner les exports suivants.
    fontCSS.catch(() => {
      fontCSS = null;
    });
  }
  return fontCSS;
}

async function buildFontCSS(): Promise<string> {
  const faces: Array<Promise<string>> = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRule[];
    try {
      rules = Array.from(sheet.cssRules);
    } catch {
      // Feuille d'une autre origine, illisible. L'app n'en sert aucune.
      continue;
    }
    for (const rule of rules) {
      if (rule instanceof CSSFontFaceRule) faces.push(inlineFontFiles(rule.cssText));
    }
  }

  return (await Promise.all(faces)).join("\n");
}

/** Une regle `@font-face`, ses `url()` remplacees par les fichiers eux-memes. */
async function inlineFontFiles(cssText: string): Promise<string> {
  const urls = new Set(
    Array.from(cssText.matchAll(/url\(["']?([^"')]+)["']?\)/g), (match) => match[1]),
  );
  let result = cssText;

  for (const url of urls) {
    if (url.startsWith("data:")) continue;
    const res = await fetch(new URL(url, document.baseURI));
    // Une police absente degrade l'image ; elle ne doit pas perdre l'export.
    if (!res.ok) continue;
    const bytes = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const type = res.headers.get("content-type") ?? "font/woff2";
    result = result.split(url).join(`data:${type};base64,${btoa(binary)}`);
  }

  return result;
}

/** Au-dela, la capture n'est pas lente, elle est bloquee. */
const CAPTURE_TIMEOUT_MS = 15_000;

/**
 * `toPng`, avec deux secondes chances.
 *
 * La capture passe par un SVG `foreignObject` serialise puis charge dans une
 * `<img>`, et cette etape echoue par intermittence hors Chromium : le README
 * de html-to-image le dit lui-meme, Chrome rend les gros arbres DOM nettement
 * mieux que Firefox et Safari. S'y ajoutent les polices embarquees en base64,
 * pas toujours decodees au premier passage. Le meme appel repasse presque
 * toujours au coup suivant : c'est exactement ce que le message d'erreur
 * demandait a l'utilisateur de faire a la main.
 *
 * Le retry ne rattrape que l'aleatoire. La panne Firefox, elle, etait
 * deterministe et se corrige au-dessus, dans `embeddedFontCSS()`.
 *
 * Le garde-fou de duree n'est pas decoratif. `createImage()` de la lib fait
 * `img.decode().then(...)` sans `.catch` ; quand Firefox rejette ce decode,
 * la promesse ne se resout jamais et le toast "Generation..." tourne dans le
 * vide. Le delai transforme ce blocage en echec, donc en nouvel essai.
 */
export async function renderPng(
  element: HTMLElement,
  options: ToPngOptions,
): Promise<string> {
  const { toPng } = await import("html-to-image");
  let lastError: unknown = new Error("PNG capture failed");

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const fontEmbedCSS = await embeddedFontCSS();
      return await Promise.race([
        toPng(element, { ...options, fontEmbedCSS }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new AppFailure("timeout", "PNG capture timed out")),
            CAPTURE_TIMEOUT_MS,
          );
        }),
      ]);
    } catch (error) {
      lastError = error;
      console.error(`[export] capture PNG, essai ${attempt}/3`, error);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

type Target = HTMLElement | RefObject<HTMLElement | null>;

function resolveElement(target: Target): HTMLElement {
  const el = "current" in target ? target.current : target;
  if (!el) throw new Error("Share target element is not mounted");
  return el;
}

async function nodeToBlob(
  target: Target,
  transparent: boolean,
): Promise<Blob> {
  const element = resolveElement(target);
  const opts: ToPngOptions = {
    pixelRatio: 2,
    cacheBust: true,
    // Embarquees, comme pour `exportToPNG` : les 37 visuels de partage sont
    // du texte compose, ils ne valent rien dans la fonte de repli.
    skipFonts: false,
  };
  if (!transparent) {
    // Le fond suit le theme peint. Il etait fixe a une valeur claire, ce qui
    // posait une carte sombre sur une page claire en theme sombre.
    opts.backgroundColor = THEME_COLOR[documentTheme()];
  }
  // When backgroundColor is omitted, html-to-image keeps the PNG alpha
  // channel, exactly what we want for overlays.
  const dataUrl = await renderPng(element, opts);
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function downloadImage(
  target: Target,
  filename: string,
  transparent: boolean,
): Promise<void> {
  triggerDownload(await nodeToBlob(target, transparent), filename);
}

/** Returns true when the browser exposes the Clipboard image-write API. */
export function isCopySupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.write === "function" &&
    typeof ClipboardItem !== "undefined"
  );
}

export async function copyImage(
  target: Target,
  transparent: boolean,
): Promise<boolean> {
  if (!isCopySupported()) return false;

  // Safari (iOS + macOS) requires `clipboard.write()` to run inside the same
  // user-activation tick as the click. Awaiting `nodeToBlob()` first (~500ms
  // for html-to-image) drops that activation and the write is rejected as
  // "Document is not focused" / "NotAllowedError".
  //
  // The standard workaround: hand `ClipboardItem` a *Promise<Blob>* directly,
  // so the browser preserves the activation context while waiting for the
  // image to be ready. Chromium and Firefox accept this too; older Safari
  // (<15.4) falls through to the legacy path.
  try {
    const item = new ClipboardItem({
      "image/png": nodeToBlob(target, transparent),
    });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    // Some browsers (older Safari, some Android WebViews) reject a Promise
    // inside ClipboardItem. Fall back to the legacy two-step pattern.
    if (err instanceof DOMException && err.name === "NotAllowedError") {
      throw err;
    }
    const blob = await nodeToBlob(target, transparent);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  }
}

export type ShareMethod = "native" | "download";

/**
 * Remet une image deja produite a l'utilisateur, par le chemin que son
 * appareil sait suivre.
 *
 * Sur un telephone, un fichier telecharge ne va PAS dans les photos : il
 * atterrit au mieux dans les fichiers, et sur iOS en navigation autonome il
 * n'atterrit nulle part du tout. La feuille de partage native est la seule
 * porte vers la pellicule, c'est son "Enregistrer l'image" qui l'y met. Sur
 * un ordinateur, l'inverse : un fichier dans le dossier de telechargements
 * est ce qu'on attend, et ouvrir une feuille de partage serait une surprise.
 *
 * Le partage natif exige une activation recente : l'appel doit rester dans
 * les quelques secondes qui suivent le geste. C'est pour cela que la capture
 * qui precede doit rester courte, et qu'aucune confirmation ne s'intercale.
 */
export async function deliverImage(blob: Blob, filename: string): Promise<ShareMethod> {
  const file = new File([blob], filename, { type: "image/png" });

  // Web Share Level 2, only on HTTPS/mobile most of the time.
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      // Image-only payload: no `title`, no `text`. iOS's share-sheet
      // "Copy" option pastes the *whole* ShareData (title + image), so a
      // title here ends up in the user's clipboard alongside the picture.
      // Instagram Stories goes further and prefers text over the file
      // entirely. Stripping both fields forces every receiving app,
      // copy, Stories, Mail, Messages, to treat the image as the only
      // asset. The filename on the File object (e.g. "zoned-REC-001.png")
      // already gives apps a sensible label.
      await navigator.share({ files: [file] });
      return "native";
    } catch (err) {
      // AbortError = user cancelled the native sheet; surface as cancellation.
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      // Any other failure falls back to download so the user still gets the image.
    }
  }

  triggerDownload(blob, filename);
  return "download";
}

export async function shareImage(
  target: Target,
  filename: string,
  transparent: boolean,
): Promise<ShareMethod> {
  return deliverImage(await nodeToBlob(target, transparent), filename);
}

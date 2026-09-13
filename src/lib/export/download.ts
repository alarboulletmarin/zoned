/**
 * Le dernier geste de tous les exports : poser un fichier chez l'utilisateur.
 *
 * Neuf endroits du code recopiaient les six memes lignes (creer une ancre,
 * poser le href, cliquer, liberer l'URL) et trois variantes en avaient
 * derive, chacune avec son defaut :
 *
 *   - l'ancre detachee. `DataExportImport` et `PlanExportMenu` cliquaient une
 *     ancre jamais inseree dans le document. Chromium l'accepte, Firefox non :
 *     un clic sur un noeud hors document n'y declenche rien, et la sauvegarde
 *     comme l'export d'un plan en JSON ne donnaient aucun fichier.
 *
 *   - la liberation immediate. `URL.revokeObjectURL()` appele juste apres le
 *     clic invalide le blob dans le tour de boucle ou le telechargement
 *     demarre a peine. Safari, iOS en tete, annule alors le transfert. Seul
 *     `gpx.ts` differait la liberation, et c'etait le bon geste.
 *
 *   - le nom de fichier brut. Il vient souvent du texte de l'utilisateur (nom
 *     de plan, nom de parcours) et peut porter une barre oblique ou un
 *     caractere que Windows refuse, ce qui donne un enregistrement refuse ou
 *     un nom coupe en deux.
 *
 * Une seule fonction, donc, et le bon geste partout.
 */

/** Longueur maximale d'un nom de fichier, extension comprise. */
const MAX_FILENAME_LENGTH = 120;

/**
 * Delai avant liberation de l'URL objet. Le telechargement est lance par le
 * clic mais le navigateur lit le blob apres le tour de boucle courant ; une
 * seconde lui laisse largement le temps, sans garder la memoire indefiniment.
 */
const REVOKE_DELAY_MS = 1000;

/** Separateurs de chemin et caracteres qu'un systeme de fichiers refuse. */
const FORBIDDEN_IN_FILENAME = /[/\\:*?"<>|]+/g;

/** Caracteres de controle, saut de ligne compris. */
const CONTROL_CHARS = new RegExp("[\\u0000-\\u001f\\u007f]+", "g");

/**
 * Rend un nom de fichier acceptable par les trois familles de systemes de
 * fichiers, sans le denaturer : les accents restent (un plan garde son nom),
 * seuls partent les caracteres qu'un systeme refuse.
 */
export function sanitizeFilename(name: string): string {
  const cleaned = name
    .replace(FORBIDDEN_IN_FILENAME, "-")
    .replace(CONTROL_CHARS, "")
    .replace(/\s+/g, " ")
    // Un nom qui commence par un point est un fichier cache sous Unix.
    .replace(/^\.+/, "")
    .trim();

  if (cleaned.length === 0) return "download";
  if (cleaned.length <= MAX_FILENAME_LENGTH) return cleaned;

  // Tronquer par la gauche en gardant l'extension, qui porte le type.
  const dot = cleaned.lastIndexOf(".");
  const ext = dot > 0 && cleaned.length - dot <= 10 ? cleaned.slice(dot) : "";
  return cleaned.slice(0, MAX_FILENAME_LENGTH - ext.length).trim() + ext;
}

/**
 * Declenche le telechargement d'un contenu deja produit.
 *
 * @param source - Un `Blob` (cas general) ou une URL deja formee, data URL
 *   comprise, pour les exports qui produisent directement une image encodee.
 * @param filename - Nom propose, assaini avant usage.
 * @returns Le nom de fichier reellement propose au navigateur.
 */
export function triggerDownload(source: Blob | string, filename: string): string {
  const safeName = sanitizeFilename(filename);
  const isBlob = typeof source !== "string";
  const url = isBlob ? URL.createObjectURL(source) : source;

  const link = document.createElement("a");
  link.href = url;
  link.download = safeName;
  link.rel = "noopener";
  // L'ancre DOIT etre dans le document : Firefox ignore le clic autrement.
  // Elle est vide, donc sans effet sur la mise en page pendant son passage.
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (isBlob) {
    // Liberation differee, sinon Safari annule le transfert qui demarre.
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
  }

  return safeName;
}

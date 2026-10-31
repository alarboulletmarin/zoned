/**
 * Les masques de saisie du parcours de plan : une allure, un chrono, une VMA.
 *
 * Même règle que `durationFields.ts`, celle du chronomètre : **les chiffres
 * entrent par la droite**. On tape 530 et on lit 5:30 ; on tape 45 et on lit
 * 0:45. Le champ reste `type="text"` avec `inputMode="numeric"` : un champ
 * numérique natif refuse le deux-points du masque, et sur un clavier logiciel
 * il ouvre un pavé qui porte aussi le point et le moins. Le masque donne le
 * pavé de chiffres seuls, sur iOS comme sur Android.
 *
 * Trois règles, les mêmes que pour la durée :
 * 1. le stockage ne change pas, `form.targetPace` reste la chaîne `M:SS` que
 *    `parsePaceToSeconds` lit déjà ;
 * 2. rien n'est refusé pendant la frappe, 5:75 vaut 6:15 et se range quand le
 *    champ est quitté ;
 * 3. le rangement est visible, il réécrit le champ à l'écran.
 */

/** Une allure tient en quatre chiffres : `mm:ss`, jusqu'à 99:59. */
export const PACE_MAX_DIGITS = 4;
/** Un chrono d'arrivée tient en six chiffres : `h:mm:ss`. */
export const TIME_MAX_DIGITS = 6;

function trimLeadingZeros(digits: string): string {
  return digits.replace(/^0+/, "");
}

function onlyDigits(raw: string, max: number): string {
  return trimLeadingZeros(raw.replace(/\D/g, "")).slice(0, max);
}

// ── Allure, `m:ss` ────────────────────────────────────────────────────────

/** Les chiffres d'une frappe d'allure, le masque retiré. */
export function paceDigits(raw: string): string {
  return onlyDigits(raw, PACE_MAX_DIGITS);
}

/** Les chiffres, mis au masque `m:ss`. Vide en entrée, vide en sortie. */
export function formatPaceDigits(digits: string): string {
  if (digits === "") return "";
  const padded = digits.padStart(3, "0");
  const seconds = padded.slice(-2);
  const minutes = Number.parseInt(padded.slice(0, -2), 10);
  return `${minutes}:${seconds}`;
}

/** Le total en secondes par kilomètre, ou `undefined` si rien n'est saisi. */
export function paceDigitsToSeconds(digits: string): number | undefined {
  if (digits === "") return undefined;
  const padded = digits.padStart(3, "0");
  const seconds = Number.parseInt(padded.slice(-2), 10);
  const minutes = Number.parseInt(padded.slice(0, -2), 10);
  if (!Number.isFinite(seconds) || !Number.isFinite(minutes)) return undefined;
  return minutes * 60 + seconds;
}

/** Des secondes, remises dans le champ. `0` donne un champ vide. */
export function secondsToPaceDigits(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "";
  const total = Math.round(totalSeconds);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return trimLeadingZeros(`${minutes}${String(seconds).padStart(2, "0")}`);
}

/**
 * Le champ rangé : les secondes qui débordent passent dans les minutes.
 * Appelé quand le champ est quitté, jamais à chaque frappe.
 */
export function normalizePaceDigits(digits: string): string {
  const total = paceDigitsToSeconds(digits);
  if (total === undefined || total <= 0) return "";
  return secondsToPaceDigits(total);
}

// ── Chrono d'arrivée, `h:mm:ss` ───────────────────────────────────────────

/** Les chiffres d'une frappe de chrono, le masque retiré. */
export function timeDigits(raw: string): string {
  return onlyDigits(raw, TIME_MAX_DIGITS);
}

/**
 * Les chiffres, mis au masque. Jusqu'à quatre chiffres, deux groupes
 * (`52:30`) ; au-delà, trois (`3:30:00`). Le sens des deux groupes se décide
 * à la lecture, voir `timeDigitsToSeconds`.
 */
export function formatTimeDigits(digits: string): string {
  if (digits === "") return "";
  if (digits.length <= 4) {
    const padded = digits.padStart(3, "0");
    return `${Number.parseInt(padded.slice(0, -2), 10)}:${padded.slice(-2)}`;
  }
  const padded = digits.padStart(5, "0");
  const seconds = padded.slice(-2);
  const minutes = padded.slice(-4, -2);
  const hours = Number.parseInt(padded.slice(0, -4), 10);
  return `${hours}:${minutes}:${seconds}`;
}

/** Une allure plausible en course, en secondes par kilomètre. */
const PLAUSIBLE_PACE_MIN = 150;
const PLAUSIBLE_PACE_MAX = 900;

/**
 * Le chrono en secondes, ou `undefined` si rien n'est saisi.
 *
 * Deux groupes sont ambigus : 52:30 est un 10 km en 52 minutes autant qu'un
 * ultra en 52 heures. L'ancienne lecture tranchait toujours pour les heures,
 * et un coureur de 10 km qui tapait son chrono obtenait une allure de cinq
 * heures au kilomètre. Ici la distance départage : on garde la lecture qui
 * donne une allure plausible, et quand les deux le sont, les heures gagnent
 * à partir du semi, les minutes en dessous.
 */
export function timeDigitsToSeconds(digits: string, distanceKm: number): number | undefined {
  if (digits === "") return undefined;
  if (digits.length > 4) {
    const padded = digits.padStart(5, "0");
    const seconds = Number.parseInt(padded.slice(-2), 10);
    const minutes = Number.parseInt(padded.slice(-4, -2), 10);
    const hours = Number.parseInt(padded.slice(0, -4), 10);
    return hours * 3600 + minutes * 60 + seconds;
  }
  const padded = digits.padStart(3, "0");
  const b = Number.parseInt(padded.slice(-2), 10);
  const a = Number.parseInt(padded.slice(0, -2), 10);
  const asHours = a * 3600 + b * 60;
  const asMinutes = a * 60 + b;
  // Sans distance, la lecture du chronomètre : deux groupes sont m:ss, comme
  // le masque les affiche (une durée d'intervalle, un temps sans course).
  if (!(distanceKm > 0)) return asMinutes;
  const plausible = (seconds: number) => {
    const pace = seconds / distanceKm;
    return pace >= PLAUSIBLE_PACE_MIN && pace <= PLAUSIBLE_PACE_MAX;
  };
  const hoursOk = plausible(asHours);
  const minutesOk = plausible(asMinutes);
  if (hoursOk && !minutesOk) return asHours;
  if (minutesOk && !hoursOk) return asMinutes;
  return distanceKm >= 21 ? asHours : asMinutes;
}

/**
 * Des secondes, remises dans le champ du chrono, sous la forme que
 * `timeDigitsToSeconds` relira à l'identique pour CETTE distance.
 *
 * Au-delà de l'heure, trois groupes, sans ambiguïté. En dessous, deux groupes
 * suffisent tant que la distance les lit en minutes ; si elle les lirait en
 * heures (59:00 sur un marathon), le zéro des heures est gardé devant, et le
 * champ affiche 0:59:00. Le rangement est visible, il ne réinterprète rien.
 */
export function secondsToTimeDigits(totalSeconds: number, distanceKm: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "";
  const total = Math.round(totalSeconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) return `${hours}${mm}${ss}`;
  const short = trimLeadingZeros(`${minutes}${ss}`);
  if (timeDigitsToSeconds(short, distanceKm) === total) return short;
  return `0${mm}${ss}`;
}

/**
 * Le chrono rangé : les secondes et les minutes qui débordent remontent
 * (45:75 devient 46:15), et la lecture retenue pour la distance s'écrit en
 * clair (330 sur un marathon devient 3:30:00). Appelé à la sortie du champ.
 */
export function normalizeTimeDigits(digits: string, distanceKm: number): string {
  const total = timeDigitsToSeconds(digits, distanceKm);
  if (total === undefined || total <= 0) return "";
  return secondsToTimeDigits(total, distanceKm);
}

/**
 * Les anciens liens partagés portent le chrono en trois paramètres, `h`, `m`
 * et `s`. Ils restent lisibles : on les additionne à l'entrée, on les
 * redécoupe à la sortie, le champ, lui, n'en a plus qu'un.
 */
export function hmsParamsToSeconds(
  h: string | null,
  m: string | null,
  s: string | null,
): number {
  const read = (v: string | null) => {
    const n = Number.parseInt(v ?? "", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  return read(h) * 3600 + read(m) * 60 + read(s);
}

/** Des secondes, redécoupées en `h`, `m`, `s` pour un lien partagé. */
export function secondsToHmsParams(totalSeconds: number): { h: string; m: string; s: string } {
  const total = Math.max(0, Math.round(totalSeconds));
  return {
    h: String(Math.floor(total / 3600)),
    m: String(Math.floor((total % 3600) / 60)),
    s: String(total % 60),
  };
}

// ── VMA, un décimal ───────────────────────────────────────────────────────

/**
 * La VMA se tape sur le pavé décimal, virgule ou point selon le clavier. On
 * garde les chiffres et UN séparateur, écrit en virgule à l'écran : deux
 * chiffres avant, deux après, c'est plus que la précision d'un test.
 */
export function vmaInput(raw: string): string {
  const unified = raw.replace(/\./g, ",").replace(/[^\d,]/g, "");
  const sep = unified.indexOf(",");
  if (sep === -1) return unified.slice(0, 2);
  const whole = unified.slice(0, sep).slice(0, 2);
  const decimals = unified.slice(sep + 1).replace(/,/g, "").slice(0, 2);
  return `${whole},${decimals}`;
}

/** La VMA en km/h, ou `undefined` : vide, illisible, ou hors de 5 à 30. */
export function parseVma(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const parsed = Number.parseFloat(trimmed.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 5 || parsed > 30) return undefined;
  return parsed;
}

/** Le champ rangé : `14,` devient `14`, `14,50` devient `14,5`, l'illisible se vide. */
export function normalizeVma(value: string): string {
  const parsed = parseVma(value);
  if (parsed === undefined) return "";
  return String(Math.round(parsed * 100) / 100).replace(".", ",");
}

/** Une VMA stockée, remise dans le champ. */
export function vmaToInput(vma: number | undefined | null): string {
  if (vma === undefined || vma === null || !Number.isFinite(vma) || vma <= 0) return "";
  return String(Math.round(vma * 100) / 100).replace(".", ",");
}

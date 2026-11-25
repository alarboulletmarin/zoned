/**
 * Human sentences for import issues, French and English.
 *
 * They live here and not in the i18n bundles because their first reader is
 * an agent, through the page's "copy for your assistant" report or, later,
 * an MCP tool result: both need the text without i18next. The page chrome
 * around them is translated the usual way (`plan.json`, `import.*`).
 */

import type { ImportIssue } from "./importPayload";

export type IssueLang = "fr" | "en";

const DAYS = {
  fr: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
};

/**
 * "week 3, session 1: " when the issue sits inside a week. Read from the
 * params when the validator set them, from the path otherwise, so every
 * issue under `weeks[2].sessions[0]` is placed, whatever its code.
 */
function where(issue: ImportIssue, lang: IssueLang): string {
  const fromPath = /^weeks\[(\d+)\](?:\.sessions\[(\d+)\])?/.exec(issue.path);
  const week = issue.params.week ?? (fromPath ? Number(fromPath[1]) + 1 : undefined);
  const session = issue.params.session ?? (fromPath?.[2] !== undefined ? Number(fromPath[2]) + 1 : undefined);
  if (week === undefined) return "";
  if (lang === "fr") return session !== undefined ? `semaine ${week}, séance ${session} : ` : `semaine ${week} : `;
  return session !== undefined ? `week ${week}, session ${session}: ` : `week ${week}: `;
}

export function describeIssue(issue: ImportIssue, lang: IssueLang): string {
  const p = issue.params;
  const fr = lang === "fr";
  const at = where(issue, lang);
  const field = String(p.field ?? issue.path);

  switch (issue.code) {
    case "not_object":
      return fr
        ? `Le payload doit être un objet JSON, reçu : ${p.got}.`
        : `The payload must be a JSON object, got ${p.got}.`;
    case "unsupported_version":
      return fr
        ? `version ${p.value} non prise en charge, attendu "version": ${p.expected}.`
        : `Unsupported version ${p.value}, expected "version": ${p.expected}.`;
    case "unknown_kind":
      return fr
        ? `kind ${p.value} inconnu, attendu "config" ou "plan".`
        : `Unknown kind ${p.value}, expected "config" or "plan".`;
    case "unknown_field":
      return fr
        ? `${at}champ ${issue.path} inconnu. Champs acceptés ici : ${p.allowed}.`
        : `${at}unknown field ${issue.path}. Allowed here: ${p.allowed}.`;
    case "missing_field":
      return fr ? `${at}champ obligatoire ${issue.path} absent.` : `${at}required field ${issue.path} is missing.`;
    case "invalid_type":
      return fr
        ? `${at}${issue.path || field} doit être de type ${p.expected}, reçu : ${p.got}.`
        : `${at}${issue.path || field} must be ${p.expected}, got ${p.got}.`;
    case "invalid_enum":
      return fr
        ? `${at}${issue.path} vaut ${p.value}, valeurs acceptées : ${p.allowed}.`
        : `${at}${issue.path} is ${p.value}, allowed values: ${p.allowed}.`;
    case "invalid_date":
      return fr
        ? `${issue.path} vaut ${p.value}, attendu une date réelle au format AAAA-MM-JJ.`
        : `${issue.path} is ${p.value}, expected a real date as YYYY-MM-DD.`;
    case "date_in_past":
      return fr
        ? `${issue.path} (${p.value}) est passée, aujourd'hui est le ${p.today}.`
        : `${issue.path} (${p.value}) is in the past, today is ${p.today}.`;
    case "out_of_range":
      return fr
        ? `${at}${issue.path} vaut ${p.value}, attendu ${p.integer ? "un entier " : ""}entre ${p.min} et ${p.max}.`
        : `${at}${issue.path} is ${p.value}, expected ${p.integer ? "an integer " : ""}between ${p.min} and ${p.max}.`;
    case "race_before_start":
      return fr
        ? `${issue.path || "raceDate"} (${p.raceDate}) doit tomber après la date de début (${p.startDate}).`
        : `${issue.path || "raceDate"} (${p.raceDate}) must fall after the start date (${p.startDate}).`;
    case "weeks_out_of_range":
      if (issue.path === "weeks") {
        return fr
          ? `Le plan compte ${p.count} semaines, attendu entre ${p.min} et ${p.max}.`
          : `The plan has ${p.count} weeks, expected between ${p.min} and ${p.max}.`;
      }
      return fr
        ? `Entre ${p.from} et ${issue.path || "raceDate"} il y a ${p.count} semaines, le générateur en accepte entre ${p.min} et ${p.max}.`
        : `There are ${p.count} weeks between ${p.from} and ${issue.path || "raceDate"}, the generator accepts ${p.min} to ${p.max}.`;
    case "text_too_long":
      return fr
        ? `${at}${issue.path} fait ${p.length} caractères, maximum ${p.max}.`
        : `${at}${issue.path} is ${p.length} characters long, maximum ${p.max}.`;
    case "unknown_workout": {
      const hint = p.suggestion
        ? fr
          ? ` Vouliez-vous dire ${p.suggestion} ?`
          : ` Did you mean ${p.suggestion}?`
        : fr
          ? " Les ids valides sont listés dans https://zoned.run/api/v1/workouts.json."
          : " Valid ids are listed in https://zoned.run/api/v1/workouts.json.";
      return fr ? `${at}séance ${p.workoutId} inconnue.${hint}` : `${at}unknown workout ${p.workoutId}.${hint}`;
    }
    case "custom_workout":
      return fr
        ? `${at}${p.workoutId} est une séance personnelle, propre à un navigateur. Utilisez une séance du catalogue.`
        : `${at}${p.workoutId} is a personal workout stored in one browser. Use a catalogue workout.`;
    case "too_many_sessions_day": {
      const day = DAYS[lang][Number(p.day)] ?? String(p.day);
      return fr
        ? `${at}${p.count} séances le ${day} (day ${p.day}), maximum ${p.max} par jour.`
        : `${at}${p.count} sessions on ${day} (day ${p.day}), at most ${p.max} per day.`;
    }
    case "empty_plan":
      return fr ? "Aucune semaine ne contient de séance." : "No week contains a session.";
    case "start_moved_to_monday":
      return fr
        ? `startDate ${p.from} n'est pas un lundi, le plan commence le lundi ${p.to}.`
        : `startDate ${p.from} is not a Monday, the plan starts on Monday ${p.to}.`;
    case "empty_week":
      return fr ? `${at}aucune séance, semaine de repos.` : `${at}no session, a rest week.`;
    case "invalid_format":
      return fr
        ? `${issue.path} vaut ${p.value}, format attendu : ${p.expected}.`
        : `${issue.path} is ${p.value}, expected ${p.expected}.`;
    case "conflicting_fields":
      return fr
        ? `${issue.path} et ${p.other} sont donnés tous les deux. Gardez l'un des deux.`
        : `Both ${issue.path} and ${p.other} are given. Keep one of them.`;
    case "time_needs_road_distance":
      return fr
        ? `${issue.path} demande une distance sur route (5K, 10K, semi, marathon), pas ${p.distance}. Utilisez pace, ou rien.`
        : `${issue.path} needs a road distance (5K, 10K, semi, marathon), not ${p.distance}. Use pace instead, or nothing.`;
    case "default_applied":
      return fr
        ? `${issue.path} absent, valeur par défaut : ${p.value}.`
        : `${issue.path} not given, defaulting to ${p.value}.`;
  }
}

/** Plain-text report an agent can act on, one issue per line, English. */
export function formatIssueReport(errors: readonly ImportIssue[], warnings: readonly ImportIssue[] = []): string {
  const lines = [
    "Zoned rejected the /plan/import payload. Fix every error below and send a new link.",
    ...errors.map((e) => `- error ${e.code}${e.path ? ` at ${e.path}` : ""}: ${describeIssue(e, "en")}`),
    ...warnings.map((w) => `- warning ${w.code}${w.path ? ` at ${w.path}` : ""}: ${describeIssue(w, "en")}`),
  ];
  return lines.join("\n");
}

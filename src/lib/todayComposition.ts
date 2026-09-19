import type { TrainingPlan } from "@/types/plan";
import { dateToWeekAndDay, getPlanMonday, isoDateOnly } from "@/lib/planDates";

/**
 * La composition du cockpit : CE QUE /today SUIT.
 *
 * Le cockpit reprenait UN plan, choisi par une règle d'une phrase : le plan
 * dans lequel on est aujourd'hui, le plus récent à égalité. La règle avait un
 * angle mort qui coûtait cher : une semaine seule (`config.isSingleWeek`) est
 * un plan d'une semaine sans date de début, donc datée sur sa semaine de
 * création, donc en cours, donc la plus récente. Composer une semaine de
 * renforcement pendant un plan marathon faisait DISPARAÎTRE le marathon de
 * l'écran du matin.
 *
 * Le cockpit ne suit donc plus un plan, il suit une COMPOSITION : des couches
 * posées sur le calendrier, que l'on allume et que l'on éteint.
 *
 * - Un plan est une couche datée par lui-même (`startDate`, sinon
 *   `createdAt`). Il est suivi tant qu'on ne l'éteint pas.
 * - Une semaine seule n'a pas de date : c'est un GABARIT. Elle entre dans le
 *   cockpit quand on la POSE sur une semaine du calendrier (`anchor`, le lundi),
 *   et seulement là. Une semaine de décharge posée sur la semaine du plan où
 *   l'on est, une semaine de renforcement posée à côté : c'est l'hybride que
 *   l'écran doit savoir montrer, séance par séance, sans qu'une source en
 *   cache une autre.
 *
 * Ce que le modèle ne dit PAS, à dessein : il n'y a pas de couche par défaut
 * écrite ici. Sans rien d'enregistré, la règle de repli (`resolveTodaySources`)
 * rend le comportement d'avant pour tout le monde, à une exception près, et
 * c'est le bug : une semaine seule ne passe plus devant un plan en cours. Elle
 * ne s'invite que lorsqu'il n'y a aucun plan sous les pieds, sur sa semaine
 * de création, exactement comme avant.
 *
 * Sa propre clé, `zoned-today`, et pas `zoned-plans` : la composition est une
 * vue SUR les plans, elle ne modifie aucun d'eux, et une charge utile cassée
 * ici ne doit jamais toucher aux plans eux-mêmes.
 */

export interface TodayLayer {
  /** L'id du plan ou de la semaine seule (`TrainingPlan.id`). */
  id: string;
  /** Éteinte, la couche reste écrite mais ne se voit plus. */
  enabled: boolean;
  /**
   * Semaines seules : le LUNDI (`YYYY-MM-DD`) sur lequel la semaine est posée.
   * Absent, la semaine de création, ce que le modèle disait déjà. Ignoré pour
   * un plan, qui porte sa propre date.
   */
  anchor?: string;
}

export interface TodayComposition {
  version: 1;
  layers: TodayLayer[];
}

export const EMPTY_COMPOSITION: TodayComposition = Object.freeze({
  version: 1,
  layers: [],
}) as TodayComposition;

const STORAGE_KEY = "zoned-today";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Le lundi de la semaine qui contient la date, à minuit LOCAL. Convention du
 * dépôt : lundi = 0, la même que `getPlanMonday`.
 */
export function mondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const jsDay = d.getDay();
  d.setDate(d.getDate() + (jsDay === 0 ? -6 : 1 - jsDay));
  return d;
}

/** Une date seule lue à minuit local, ou `null` si elle ne se lit pas. */
function parseIsoDate(iso: string): Date | null {
  if (!ISO_DATE.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Le lundi de la semaine d'une date seule, en date seule. */
export function isoMondayOf(iso: string): string | null {
  const date = parseIsoDate(iso);
  return date ? isoDateOnly(mondayOf(date)) : null;
}

/**
 * Lire le stockage sans jamais laisser une charge utile cassée faire tomber
 * l'écran. Champ par champ : une couche illisible est retirée, pas la
 * composition entière. Un `anchor` qui n'est pas un lundi est ramené au lundi
 * de sa semaine, un `anchor` illisible est oublié.
 */
export function parseTodayComposition(raw: string | null): TodayComposition {
  if (!raw) return EMPTY_COMPOSITION;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY_COMPOSITION;
  }
  if (!isObject(parsed) || !Array.isArray(parsed.layers)) return EMPTY_COMPOSITION;

  const seen = new Set<string>();
  const layers: TodayLayer[] = [];
  for (const entry of parsed.layers) {
    if (!isObject(entry) || typeof entry.id !== "string" || entry.id.length === 0) continue;
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    const layer: TodayLayer = { id: entry.id, enabled: entry.enabled !== false };
    if (typeof entry.anchor === "string") {
      const monday = isoMondayOf(entry.anchor);
      if (monday) layer.anchor = monday;
    }
    layers.push(layer);
  }
  return { version: 1, layers };
}

export function loadTodayComposition(): TodayComposition {
  try {
    return parseTodayComposition(localStorage.getItem(STORAGE_KEY));
  } catch {
    // Navigation privée, stockage bloqué : on n'a simplement pas de mémoire.
    return EMPTY_COMPOSITION;
  }
}

export function saveTodayComposition(composition: TodayComposition): boolean {
  try {
    if (composition.layers.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(composition));
    return true;
  } catch {
    return false;
  }
}

export function layerFor(composition: TodayComposition, id: string): TodayLayer | undefined {
  return composition.layers.find((layer) => layer.id === id);
}

function upsert(composition: TodayComposition, layer: TodayLayer): TodayComposition {
  const others = composition.layers.filter((l) => l.id !== layer.id);
  return { version: 1, layers: [...others, layer] };
}

/**
 * Allumer ou éteindre une couche. Pour une semaine seule, allumer sans
 * l'avoir posée la pose sur sa semaine de création : c'est ce que le modèle
 * disait d'elle, et c'est la seule date qu'elle ait.
 */
export function setLayerEnabled(
  composition: TodayComposition,
  id: string,
  enabled: boolean,
): TodayComposition {
  const existing = layerFor(composition, id);
  return upsert(composition, { ...(existing ?? { id }), id, enabled });
}

/**
 * Poser une semaine seule sur une semaine du calendrier. `on` est n'importe
 * quel jour de la semaine visée, le lundi est retrouvé ici. Poser allume.
 */
export function placeWeek(
  composition: TodayComposition,
  id: string,
  on: Date,
): TodayComposition {
  return upsert(composition, { id, enabled: true, anchor: isoDateOnly(mondayOf(on)) });
}

/** Retirer la couche : la source retombe sur la règle de repli. */
export function removeLayer(composition: TodayComposition, id: string): TodayComposition {
  return { version: 1, layers: composition.layers.filter((l) => l.id !== id) };
}

/**
 * Nettoyer les couches dont le plan n'existe plus. Un plan supprimé laissait
 * une couche orpheline, inoffensive mais éternelle.
 */
export function pruneComposition(
  composition: TodayComposition,
  plans: readonly TrainingPlan[],
): TodayComposition {
  const ids = new Set(plans.map((p) => p.id));
  const layers = composition.layers.filter((l) => ids.has(l.id));
  return layers.length === composition.layers.length ? composition : { version: 1, layers };
}

/* ── Les sources ────────────────────────────────────────────────────────── */

/**
 * Une source du cockpit : un plan ou une semaine, et le LUNDI de sa semaine 1
 * sur le calendrier. C'est ce lundi qui date chaque séance, et il n'est pas
 * toujours celui du plan : une semaine posée a le lundi de sa pose.
 */
export interface TodaySource {
  plan: TrainingPlan;
  isWeek: boolean;
  /** Le lundi de la semaine 1, à minuit local. */
  monday: Date;
  /** Vrai quand la personne l'a allumée ou posée elle-même. */
  explicit: boolean;
}

function createdAtMs(plan: TrainingPlan): number {
  const parsed = Date.parse(plan.config.createdAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Le plus récemment créé d'abord, ce sur quoi je travaille en ce moment. */
export function byNewest(a: TrainingPlan, b: TrainingPlan): number {
  return createdAtMs(b) - createdAtMs(a);
}

/**
 * La position d'une date dans une source : sa semaine et son jour, ou `null`
 * hors de la source (avant son lundi, après sa dernière semaine).
 */
export function sourcePosition(
  source: TodaySource,
  date: Date,
): { weekNumber: number; dayOfWeek: number } | null {
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  const position = dateToWeekAndDay(source.monday, midnight);
  if (!position || position.weekNumber > source.plan.totalWeeks) return null;
  return position;
}

/** Vrai quand la source a une semaine en cours à cette date. */
export function isUnderWay(source: TodaySource, date: Date): boolean {
  return sourcePosition(source, date) !== null;
}

/**
 * LES SOURCES que le cockpit suit, dans l'ordre où l'écran les empile : les
 * plans d'abord, du plus récent au plus ancien, puis les semaines posées.
 *
 * La règle, en trois lignes, et quelqu'un doit pouvoir la prédire :
 *
 * 1. **Un plan est suivi tant qu'on ne l'éteint pas.** Aucune couche à écrire
 *    pour qu'un plan compte : créer un plan, c'est le suivre.
 * 2. **Une semaine seule est suivie quand on l'a posée**, sur son lundi de
 *    pose. Éteinte, elle ne l'est plus.
 * 3. **Une semaine seule sans couche** ne se montre que lorsqu'AUCUN plan
 *    suivi n'est en cours à `today`, sur sa semaine de création. C'est le
 *    comportement d'avant pour qui n'a pas de plan, et c'est la fin du bug
 *    pour qui en a un.
 */
export function resolveTodaySources(
  plans: readonly TrainingPlan[],
  composition: TodayComposition,
  today: Date,
): TodaySource[] {
  const planSources: TodaySource[] = [];
  const placedWeeks: TodaySource[] = [];
  const implicitWeeks: TodaySource[] = [];

  for (const plan of plans) {
    const layer = layerFor(composition, plan.id);
    if (layer && !layer.enabled) continue;

    if (plan.config.isSingleWeek !== true) {
      planSources.push({ plan, isWeek: false, monday: getPlanMonday(plan), explicit: layer != null });
      continue;
    }

    const anchor = layer?.anchor ? parseIsoDate(layer.anchor) : null;
    const source: TodaySource = {
      plan,
      isWeek: true,
      monday: anchor ? mondayOf(anchor) : getPlanMonday(plan),
      explicit: layer != null,
    };
    if (layer) placedWeeks.push(source);
    else implicitWeeks.push(source);
  }

  planSources.sort((a, b) => byNewest(a.plan, b.plan));
  placedWeeks.sort((a, b) => byNewest(a.plan, b.plan));
  implicitWeeks.sort((a, b) => byNewest(a.plan, b.plan));

  const planUnderWay = planSources.some((s) => isUnderWay(s, today));
  return [...planSources, ...placedWeeks, ...(planUnderWay ? [] : implicitWeeks)];
}

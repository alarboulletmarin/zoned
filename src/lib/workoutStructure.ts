import type {
  WorkoutBlock,
  WorkoutPhaseKey,
  WorkoutRepeatUnit,
  WorkoutStep,
  WorkoutStepRole,
  WorkoutStepSegment,
  ZoneNumber,
  ZoneSpec,
} from "@/types";

export interface WorkoutStructureSource {
  warmupTemplate?: WorkoutBlock[];
  mainSetTemplate: WorkoutBlock[];
  cooldownTemplate?: WorkoutBlock[];
  warmupStructure?: WorkoutStep[];
  mainSetStructure?: WorkoutStep[];
  cooldownStructure?: WorkoutStep[];
}

const PHASE_FIELDS = {
  warmup: {
    blocks: "warmupTemplate",
    structure: "warmupStructure",
  },
  main: {
    blocks: "mainSetTemplate",
    structure: "mainSetStructure",
  },
  cooldown: {
    blocks: "cooldownTemplate",
    structure: "cooldownStructure",
  },
} as const satisfies Record<WorkoutPhaseKey, { blocks: keyof WorkoutStructureSource; structure: keyof WorkoutStructureSource }>;

const PACE_MIN_PER_KM: Record<ZoneNumber, number> = {
  1: 6.5,
  2: 6,
  3: 5.5,
  4: 5,
  5: 4,
  6: 3.5,
};

export interface FlattenedWorkoutSegment {
  phase: WorkoutPhaseKey;
  description: string;
  descriptionEn?: string;
  durationSec: number;
  zone: ZoneSpec | null;
  role: WorkoutStepRole;
  depth: number;
  repetitionIndex?: number;
  totalRepetitions?: number;
  setIndex?: number;
  totalSets?: number;
  isBetweenRepeat?: boolean;
  betweenUnit?: WorkoutRepeatUnit;
}

interface FlattenContext {
  depth: number;
  repetitionIndex?: number;
  totalRepetitions?: number;
  setIndex?: number;
  totalSets?: number;
}

export function getWorkoutPhaseSteps(workout: WorkoutStructureSource, phase: WorkoutPhaseKey): WorkoutStep[] {
  const fields = PHASE_FIELDS[phase];
  const structured = workout[fields.structure] as WorkoutStep[] | undefined;
  if (structured && structured.length > 0) return structured;

  const blocks = (workout[fields.blocks] as WorkoutBlock[] | undefined) ?? [];
  return blocks.map(convertLegacyBlockToStep);
}

export function flattenWorkoutSegments(workout: WorkoutStructureSource): FlattenedWorkoutSegment[] {
  const segments: FlattenedWorkoutSegment[] = [];

  for (const phase of Object.keys(PHASE_FIELDS) as WorkoutPhaseKey[]) {
    const steps = getWorkoutPhaseSteps(workout, phase);
    segments.push(...flattenSteps(steps, phase, { depth: 0 }));
  }

  return segments;
}

export function getStructuredWorkoutDurationSeconds(workout: WorkoutStructureSource): number {
  return flattenWorkoutSegments(workout).reduce((sum, segment) => sum + segment.durationSec, 0);
}

export function getStructuredWorkoutDurationMinutes(workout: WorkoutStructureSource): number {
  return getStructuredWorkoutDurationSeconds(workout) / 60;
}

export function getWorkoutZoneNumbers(workout: WorkoutStructureSource): ZoneNumber[] {
  const zones = new Set<ZoneNumber>();

  for (const phase of Object.keys(PHASE_FIELDS) as WorkoutPhaseKey[]) {
    collectZoneNumbers(getWorkoutPhaseSteps(workout, phase), zones);
  }

  return [...zones].sort((a, b) => a - b);
}

export function getStructuredWorkoutDominantZone(workout: WorkoutStructureSource): ZoneNumber {
  const mainZones = new Set<ZoneNumber>();
  collectZoneNumbers(getWorkoutPhaseSteps(workout, "main"), mainZones);
  if (mainZones.size > 0) return Math.max(...mainZones) as ZoneNumber;

  const allZones = getWorkoutZoneNumbers(workout);
  return allZones.length > 0 ? (Math.max(...allZones) as ZoneNumber) : 2;
}

export function normalizeWorkoutStructureSource<T extends WorkoutStructureSource>(workout: T): T {
  let next = workout;

  for (const phase of Object.keys(PHASE_FIELDS) as WorkoutPhaseKey[]) {
    next = replaceWorkoutPhaseSteps(next, phase, getWorkoutPhaseSteps(next, phase));
  }

  return next;
}

export function replaceWorkoutPhaseSteps<T extends WorkoutStructureSource>(
  workout: T,
  phase: WorkoutPhaseKey,
  steps: WorkoutStep[],
): T {
  const fields = PHASE_FIELDS[phase];
  return {
    ...workout,
    [fields.structure]: steps,
    [fields.blocks]: buildLegacyBlocksFromSteps(steps),
  } as T;
}

export function buildLegacyBlocksFromSteps(steps: WorkoutStep[]): WorkoutBlock[] {
  return steps.map(buildLegacyBlockFromStep);
}

export function summarizeWorkoutSteps(steps: WorkoutStep[], isEnglish = false): string {
  return formatStepsInline(steps, isEnglish);
}

function convertLegacyBlockToStep(block: WorkoutBlock): WorkoutStep {
  const effort = buildLegacyEffortSegment(block);
  const repetitionBetween = buildTextSegment(block.recovery ?? block.rest, "recovery");
  const setBetween = buildTextSegment(block.restBetweenSets, "recovery")
    ?? buildBetweenSetsSegment(block.description, block.descriptionEn);

  const hasRepeat = (block.repetitions && block.repetitions > 1) || (block.sets && block.sets > 1);
  if (hasRepeat) {
    effort.description = cleanRepeatDescription(effort.description);
    if (effort.descriptionEn) {
      effort.descriptionEn = cleanRepeatDescription(effort.descriptionEn);
    }
  }

  if (block.sets && block.sets > 1) {
    const perSetSteps: WorkoutStep[] = block.repetitions && block.repetitions > 1
      ? [{
        kind: "repeat",
        count: block.repetitions,
        unit: "reps",
        steps: [effort],
        ...(repetitionBetween ? { between: [repetitionBetween] } : {}),
      }]
      : [effort];

    return {
      kind: "repeat",
      count: block.sets,
      unit: "sets",
      steps: perSetSteps,
      ...((setBetween ?? (!block.repetitions || block.repetitions <= 1 ? repetitionBetween : undefined))
        ? { between: [setBetween ?? repetitionBetween!] }
        : {}),
    };
  }

  if (block.repetitions && block.repetitions > 1) {
    return {
      kind: "repeat",
      count: block.repetitions,
      unit: "reps",
      steps: [effort],
      ...(repetitionBetween ? { between: [repetitionBetween] } : {}),
    };
  }

  return effort;
}

function buildLegacyBlockFromStep(step: WorkoutStep): WorkoutBlock {
  if (step.kind === "segment") {
    return {
      description: step.description,
      ...(step.descriptionEn ? { descriptionEn: step.descriptionEn } : {}),
      ...(step.durationSec != null ? { durationMin: step.durationSec / 60 } : {}),
      ...(step.distanceM != null ? { distanceM: step.distanceM } : {}),
      ...(step.distanceKm != null ? { distanceKm: step.distanceKm } : {}),
      ...(step.zone ? { zone: step.zone } : {}),
      ...(step.vmaPercent != null ? { vmaPercent: step.vmaPercent } : {}),
      ...(step.intensityType ? { intensityType: step.intensityType } : {}),
    };
  }

  const simpleBlock = buildSimpleRepeatBlock(step);
  if (simpleBlock) return simpleBlock;

  return {
    description: formatStepsInline([step], false),
    durationMin: getStepsDurationSeconds([step]) / 60,
    ...(findPrimaryZone(step) ? { zone: findPrimaryZone(step) } : {}),
  };
}

function buildLegacyEffortSegment(block: WorkoutBlock): WorkoutStepSegment {
  const durationSec = block.durationMin != null
    ? block.durationMin * 60
    : parseDurationToSeconds(block.description)
      ?? parseDurationToSeconds(block.descriptionEn)
      ?? undefined;

  return {
    kind: "segment",
    description: block.description,
    ...(block.descriptionEn ? { descriptionEn: block.descriptionEn } : {}),
    ...(durationSec ? { durationSec } : {}),
    ...(block.distanceM != null ? { distanceM: block.distanceM } : {}),
    ...(block.distanceKm != null ? { distanceKm: block.distanceKm } : {}),
    ...(block.zone ? { zone: block.zone } : {}),
    ...(block.vmaPercent != null ? { vmaPercent: block.vmaPercent } : {}),
    ...(block.intensityType ? { intensityType: block.intensityType } : {}),
    role: "effort",
  };
}

function buildSimpleRepeatBlock(step: Extract<WorkoutStep, { kind: "repeat" }>): WorkoutBlock | null {
  if (step.unit === "sets" && step.steps.length === 1 && step.steps[0]?.kind === "repeat") {
    const inner = step.steps[0];
    const effort = pickSingleSegment(inner.steps);
    if (!effort) return null;

    const recovery = pickSingleSegment(inner.between ?? []);
    const betweenSets = pickSingleSegment(step.between ?? []);

    return {
      description: `${step.count}x(${inner.count}x ${effort.description}${recovery ? ` / ${recovery.description}` : ""})`,
      ...(effort.durationSec != null ? { durationMin: effort.durationSec / 60 } : {}),
      repetitions: inner.count,
      sets: step.count,
      ...(recovery ? { recovery: recovery.description } : {}),
      ...(betweenSets ? { restBetweenSets: betweenSets.description } : {}),
      ...(effort.zone ? { zone: effort.zone } : {}),
      ...(effort.vmaPercent != null ? { vmaPercent: effort.vmaPercent } : {}),
      ...(effort.intensityType ? { intensityType: effort.intensityType } : {}),
    };
  }

  if (step.unit === "reps") {
    const effort = pickSingleSegment(step.steps);
    if (!effort) return null;

    const recovery = pickSingleSegment(step.between ?? []);
    return {
      description: `${step.count}x ${effort.description}${recovery ? ` / ${recovery.description}` : ""}`,
      ...(effort.durationSec != null ? { durationMin: effort.durationSec / 60 } : {}),
      repetitions: step.count,
      ...(recovery ? { recovery: recovery.description } : {}),
      ...(effort.zone ? { zone: effort.zone } : {}),
      ...(effort.vmaPercent != null ? { vmaPercent: effort.vmaPercent } : {}),
      ...(effort.intensityType ? { intensityType: effort.intensityType } : {}),
    };
  }

  return null;
}

function buildTextSegment(text: string | undefined, role: WorkoutStepRole): WorkoutStepSegment | null {
  if (!text) return null;

  const durationSec = parseDurationToSeconds(text);
  const distanceM = parseDistanceMeters(text);
  const zone = extractPrimaryZone(text) ?? (role === "recovery" ? "Z1" : undefined);

  return {
    kind: "segment",
    description: text,
    ...(durationSec ? { durationSec } : {}),
    ...(distanceM && !durationSec ? { distanceM } : {}),
    ...(zone ? { zone } : {}),
    role,
  };
}

function pickSingleSegment(steps: WorkoutStep[]): WorkoutStepSegment | null {
  return steps.length === 1 && steps[0]?.kind === "segment" ? steps[0] : null;
}

function buildBetweenSetsSegment(description: string, descriptionEn?: string): WorkoutStepSegment | null {
  const source = descriptionEn ? `${description}\n${descriptionEn}` : description;
  const match = source.match(/((?:\d+(?:[.,]\d+)?)(?:\s*-\s*\d+(?:[.,]\d+)?)?\s*(?:min|mn|s|sec|'|"))[^\n]*(?:entre séries|between sets)/i);
  if (!match) return null;

  const label = match[0].includes("between sets") ? match[0] : match[0].replace(/\n.*$/, "");
  const durationSec = parseDurationToSeconds(match[1]);
  if (!durationSec) return null;

  return {
    kind: "segment",
    description: label,
    durationSec,
    zone: "Z1",
    role: "recovery",
  };
}

function cleanRepeatDescription(desc: string): string {
  let cleaned = desc;
  // Remove "10x", "8-10x", "4 × " prefix
  cleaned = cleaned.replace(/^\d+(?:\s*-\s*\d+)?\s*[x×]\s*/i, "");
  // Remove "(…)" wrapper
  cleaned = cleaned.replace(/^\((.+)\)$/, "$1");
  // Remove inner "Nx" prefix after unwrapping
  cleaned = cleaned.replace(/^\d+(?:\s*-\s*\d+)?\s*[x×]\s*/i, "");
  // Remove "avec/with …" suffix
  cleaned = cleaned.replace(/\s+(?:avec|with)\s+.+$/i, "");
  // Remove "/ Ns récup/footing/…" suffix (allows words between number and keyword)
  cleaned = cleaned.replace(/\s*\/\s*\d+\S*\s+.*?(?:récup|recovery|repos|rest|footing|jog|marche|walk).*$/i, "");
  // Remove ", récup/recovery …" suffix
  cleaned = cleaned.replace(/,\s+(?:récup|recovery)\s+.+$/i, "");
  return cleaned.trim();
}

function parseDistanceMeters(text: string): number | null {
  const match = text.match(/(\d+)\s*m\b/i);
  if (!match) return null;
  const value = Number(match[1]);
  return value >= 10 && value <= 5000 ? value : null;
}

function flattenSteps(
  steps: WorkoutStep[],
  phase: WorkoutPhaseKey,
  context: FlattenContext,
  isBetweenRepeat = false,
  betweenUnit?: WorkoutRepeatUnit,
): FlattenedWorkoutSegment[] {
  const segments: FlattenedWorkoutSegment[] = [];

  for (const step of steps) {
    if (step.kind === "segment") {
      const durationSec = getSegmentDurationSeconds(step);
      if (!durationSec || durationSec <= 0) continue;

      segments.push({
        phase,
        description: step.description,
        descriptionEn: step.descriptionEn,
        durationSec,
        zone: step.zone ?? null,
        role: step.role ?? "effort",
        depth: context.depth,
        repetitionIndex: context.repetitionIndex,
        totalRepetitions: context.totalRepetitions,
        setIndex: context.setIndex,
        totalSets: context.totalSets,
        isBetweenRepeat,
        betweenUnit,
      });
      continue;
    }

    for (let index = 0; index < step.count; index += 1) {
      const nextContext: FlattenContext = {
        ...context,
        depth: context.depth + 1,
      };

      if (step.unit === "reps") {
        nextContext.repetitionIndex = index + 1;
        nextContext.totalRepetitions = step.count;
      }

      if (step.unit === "sets") {
        nextContext.setIndex = index + 1;
        nextContext.totalSets = step.count;
      }

      segments.push(...flattenSteps(step.steps, phase, nextContext, false));

      if (index < step.count - 1 && step.between?.length) {
        segments.push(...flattenSteps(step.between, phase, nextContext, true, step.unit));
      }
    }
  }

  return segments;
}

function formatStepsInline(steps: WorkoutStep[], isEnglish: boolean): string {
  return steps.map((step) => formatStepInline(step, isEnglish)).join(" • ");
}

function formatStepInline(step: WorkoutStep, isEnglish: boolean): string {
  if (step.kind === "segment") return formatSegmentToken(step, isEnglish);

  const content = formatLoopContent(step.steps, isEnglish);
  const betweenInline = formatBetweenInline(step.between, isEnglish, false);
  const betweenRecovery = formatBetweenInline(step.between, isEnglish, true);

  if (step.unit === "reps") {
    return `${step.count} x ${content}${betweenInline ? `/${betweenInline}` : ""}`;
  }

  if (step.unit === "sets") {
    return `${step.count} x (${content})${betweenRecovery ? ` + ${betweenRecovery}` : ""}`;
  }

  return `${step.count} ${isEnglish ? "blocks of" : "blocs de"} ${content}${betweenRecovery ? ` + ${betweenRecovery}` : ""}`;
}

function formatLoopContent(steps: WorkoutStep[], isEnglish: boolean): string {
  if (steps.length === 1) {
    const [onlyStep] = steps;
    if (onlyStep.kind === "segment") return formatSegmentToken(onlyStep, isEnglish);
    return formatStepInline(onlyStep, isEnglish);
  }

  return `(${steps.map((step) => formatStepInline(step, isEnglish)).join(" + ")})`;
}

function formatBetweenInline(
  steps: WorkoutStep[] | undefined,
  isEnglish: boolean,
  includeRecoveryWord: boolean,
): string {
  if (!steps || steps.length === 0) return "";

  if (steps.length === 1 && steps[0]?.kind === "segment") {
    return formatRecoveryToken(steps[0], isEnglish, includeRecoveryWord);
  }

  const content = steps.map((step) => formatStepInline(step, isEnglish)).join(" + ");
  return includeRecoveryWord ? `${content} ${isEnglish ? "recovery" : "récup"}` : content;
}

function formatRecoveryToken(
  segment: WorkoutStepSegment,
  isEnglish: boolean,
  includeRecoveryWord: boolean,
): string {
  const base = formatSegmentToken(segment, isEnglish);
  const zoneNumbers = extractZoneNumbers(segment.zone);
  const zoneSuffix = zoneNumbers.length > 0 && !(zoneNumbers.length === 1 && zoneNumbers[0] === 1)
    ? ` ${segment.zone}`
    : "";
  const recoveryWord = includeRecoveryWord ? ` ${isEnglish ? "recovery" : "récup"}` : "";

  return `${base}${recoveryWord}${zoneSuffix}`;
}

function formatSegmentToken(segment: WorkoutStepSegment, isEnglish: boolean): string {
  if (segment.distanceM != null) return `${segment.distanceM}m`;
  if (segment.distanceKm != null) return `${segment.distanceKm}km`;
  if (segment.durationSec != null) return formatDurationToken(segment.durationSec);
  return isEnglish && segment.descriptionEn ? segment.descriptionEn : segment.description;
}

function formatDurationToken(durationSec: number): string {
  if (durationSec < 60) return `${durationSec}"`;

  const hours = Math.floor(durationSec / 3600);
  const remainingAfterHours = durationSec % 3600;
  const minutes = Math.floor(remainingAfterHours / 60);
  const seconds = remainingAfterHours % 60;

  if (hours > 0) {
    if (minutes === 0 && seconds === 0) return `${hours}h`;
    if (seconds === 0) return `${hours}h${minutes.toString().padStart(2, "0")}`;
  }

  if (seconds === 0) return `${Math.round(durationSec / 60)}'`;
  return `${minutes}'${seconds.toString().padStart(2, "0")}`;
}

function getStepsDurationSeconds(steps: WorkoutStep[]): number {
  return flattenSteps(steps, "main", { depth: 0 }).reduce((sum, segment) => sum + segment.durationSec, 0);
}

function findPrimaryZone(step: WorkoutStep): ZoneSpec | undefined {
  if (step.kind === "segment") return step.zone;

  for (const child of step.steps) {
    const zone = findPrimaryZone(child);
    if (zone) return zone;
  }

  if (step.between) {
    for (const child of step.between) {
      const zone = findPrimaryZone(child);
      if (zone) return zone;
    }
  }

  return undefined;
}

function getSegmentDurationSeconds(segment: WorkoutStepSegment): number {
  if (segment.durationSec != null) return segment.durationSec;
  if (segment.distanceKm != null) {
    return estimateSecondsFromDistance(segment.distanceKm, segment.zone);
  }
  if (segment.distanceM != null) {
    return estimateSecondsFromDistance(segment.distanceM / 1000, segment.zone);
  }
  return 0;
}

function estimateSecondsFromDistance(distanceKm: number, zone?: ZoneSpec): number {
  const zoneNumber = extractZoneNumbers(zone)[0] ?? 3;
  return Math.round(distanceKm * PACE_MIN_PER_KM[zoneNumber] * 60);
}

function collectZoneNumbers(steps: WorkoutStep[], sink: Set<ZoneNumber>) {
  for (const step of steps) {
    if (step.kind === "segment") {
      for (const zone of extractZoneNumbers(step.zone)) sink.add(zone);
      continue;
    }

    collectZoneNumbers(step.steps, sink);
    if (step.between) collectZoneNumbers(step.between, sink);
  }
}

function extractZoneNumbers(zone: ZoneSpec | undefined): ZoneNumber[] {
  if (!zone) return [];
  const matches = zone.match(/[1-6]/g) ?? [];
  return [...new Set(matches.map((match) => Number(match) as ZoneNumber))].sort((a, b) => a - b);
}

function extractPrimaryZone(text: string): ZoneSpec | undefined {
  const range = text.match(/Z\d\s*[-→]\s*Z?\d\+?/i);
  if (range) return range[0].replace(/\s+/g, "");

  const single = text.match(/Z\d\+?/i);
  return single?.[0];
}

function parseDurationToSeconds(text: string | undefined): number | null {
  if (!text) return null;

  const match = text.match(/(\d+(?:[.,]\d+)?)(?:\s*-\s*\d+(?:[.,]\d+)?)?\s*(h|heure|heures|min|mn|s|sec|'|")/i);
  if (!match) return null;

  const value = Number(match[1].replace(",", "."));
  const unit = match[2].toLowerCase();

  if (["h", "heure", "heures"].includes(unit)) return Math.round(value * 3600);
  if (["min", "mn", "'"].includes(unit)) return Math.round(value * 60);
  return Math.round(value);
}

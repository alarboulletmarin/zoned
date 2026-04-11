import type { PhaseRange, PlanConfig, PlanSession, PlanWeek, TrainingPlan } from "@/types/plan";

// Domain bounds — defensive guards against pathological imports.
const MAX_WEEKS_PER_PLAN = 104; // 2 years is more than enough for any realistic plan
const MAX_VOLUME_PERCENT = 200;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function asIsoString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function asOptionalIsoDate(value: unknown): string | undefined {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : undefined;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asOptionalNumber(value: unknown): number | undefined {
  return isFiniteNumber(value) ? value : undefined;
}

function normalizeSession(raw: unknown): PlanSession | null {
  if (!isObject(raw)) return null;
  if (!isFiniteNumber(raw.dayOfWeek) || raw.dayOfWeek < 0 || raw.dayOfWeek > 6) return null;
  if (typeof raw.workoutId !== "string" || raw.workoutId.trim().length === 0) return null;
  if (typeof raw.sessionType !== "string" || raw.sessionType.trim().length === 0) return null;
  if (!isFiniteNumber(raw.estimatedDurationMin) || raw.estimatedDurationMin < 0) return null;

  const status = raw.status;
  const normalizedStatus = status === "planned" || status === "completed" || status === "skipped" || status === "modified"
    ? status
    : undefined;

  return {
    dayOfWeek: raw.dayOfWeek,
    workoutId: raw.workoutId,
    sessionType: raw.sessionType as PlanSession["sessionType"],
    isKeySession: asBoolean(raw.isKeySession, false),
    estimatedDurationMin: raw.estimatedDurationMin,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    notesEn: typeof raw.notesEn === "string" ? raw.notesEn : undefined,
    targetDistanceKm: asOptionalNumber(raw.targetDistanceKm),
    targetDurationMin: asOptionalNumber(raw.targetDurationMin),
    loadScore: asOptionalNumber(raw.loadScore),
    scaledRepetitions: asOptionalNumber(raw.scaledRepetitions),
    paceNotes: Array.isArray(raw.paceNotes) ? raw.paceNotes as PlanSession["paceNotes"] : undefined,
    status: normalizedStatus,
    completedAt: typeof raw.completedAt === "string" ? raw.completedAt : undefined,
    actualDurationMin: asOptionalNumber(raw.actualDurationMin),
    actualDistanceKm: asOptionalNumber(raw.actualDistanceKm),
    rpe: asOptionalNumber(raw.rpe),
    isSuggestion: typeof raw.isSuggestion === "boolean" ? raw.isSuggestion : undefined,
  };
}

function normalizeWeek(raw: unknown): PlanWeek | null {
  if (!isObject(raw)) return null;
  if (!isFiniteNumber(raw.weekNumber) || raw.weekNumber < 1) return null;
  if (typeof raw.phase !== "string") return null;
  if (!isFiniteNumber(raw.volumePercent)) return null;
  if (raw.volumePercent < 0 || raw.volumePercent > MAX_VOLUME_PERCENT) return null;
  if (!Array.isArray(raw.sessions)) return null;

  const sessions = raw.sessions
    .map(normalizeSession)
    .filter((session): session is PlanSession => session !== null)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return {
    weekNumber: raw.weekNumber,
    phase: raw.phase as PlanWeek["phase"],
    isRecoveryWeek: asBoolean(raw.isRecoveryWeek, false),
    volumePercent: raw.volumePercent,
    sessions,
    crossTraining: Array.isArray(raw.crossTraining) ? raw.crossTraining as PlanWeek["crossTraining"] : undefined,
    weekLabel: typeof raw.weekLabel === "string" ? raw.weekLabel : undefined,
    weekLabelEn: typeof raw.weekLabelEn === "string" ? raw.weekLabelEn : undefined,
    targetKm: asOptionalNumber(raw.targetKm),
    targetLongRunKm: asOptionalNumber(raw.targetLongRunKm),
    weeklyLoadScore: asOptionalNumber(raw.weeklyLoadScore),
    _originalVolumePercent: asOptionalNumber(raw._originalVolumePercent),
    _originalTargetKm: asOptionalNumber(raw._originalTargetKm),
    _originalIsRecovery: typeof raw._originalIsRecovery === "boolean" ? raw._originalIsRecovery : undefined,
  };
}

function normalizeConfig(raw: unknown, fallbackId: string, fallbackCreatedAt: string): PlanConfig | null {
  if (!isObject(raw)) return null;
  if (!isFiniteNumber(raw.daysPerWeek) || raw.daysPerWeek < 1) return null;

  return {
    id: fallbackId,
    planMode: raw.planMode === "assisted" || raw.planMode === "free" || raw.planMode === "prebuilt"
      ? raw.planMode
      : undefined,
    planName: typeof raw.planName === "string" ? raw.planName : undefined,
    raceDistance: typeof raw.raceDistance === "string" ? raw.raceDistance as PlanConfig["raceDistance"] : undefined,
    raceDate: typeof raw.raceDate === "string" ? raw.raceDate : undefined,
    raceName: typeof raw.raceName === "string" ? raw.raceName : undefined,
    targetPaceMinKm: asOptionalNumber(raw.targetPaceMinKm),
    elevationGain: asOptionalNumber(raw.elevationGain),
    runnerLevel: typeof raw.runnerLevel === "string" ? raw.runnerLevel as PlanConfig["runnerLevel"] : undefined,
    daysPerWeek: raw.daysPerWeek,
    longRunDay: asOptionalNumber(raw.longRunDay),
    vma: asOptionalNumber(raw.vma),
    createdAt: asIsoString(raw.createdAt, fallbackCreatedAt),
    startDate: asOptionalIsoDate(raw.startDate),
    endDate: asOptionalIsoDate(raw.endDate),
    trainingGoal: typeof raw.trainingGoal === "string" ? raw.trainingGoal as PlanConfig["trainingGoal"] : undefined,
    planPurpose: typeof raw.planPurpose === "string" ? raw.planPurpose as PlanConfig["planPurpose"] : undefined,
    totalWeeksOverride: asOptionalNumber(raw.totalWeeksOverride),
    currentWeeklyKm: asOptionalNumber(raw.currentWeeklyKm),
    currentLongRunKm: asOptionalNumber(raw.currentLongRunKm),
    includeStrength: typeof raw.includeStrength === "boolean" ? raw.includeStrength : undefined,
    strengthFrequency: raw.strengthFrequency === 1 || raw.strengthFrequency === 2 || raw.strengthFrequency === 3
      ? raw.strengthFrequency
      : undefined,
  };
}

function normalizePhases(raw: unknown): PhaseRange[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter(isObject).flatMap((phase) => {
    if (typeof phase.phase !== "string") return [];
    if (!isFiniteNumber(phase.startWeek) || !isFiniteNumber(phase.endWeek)) return [];
    return [{
      phase: phase.phase as PhaseRange["phase"],
      startWeek: phase.startWeek,
      endWeek: phase.endWeek,
    }];
  });
}

export function normalizeStoredPlan(raw: unknown): TrainingPlan | null {
  if (!isObject(raw)) return null;

  const fallbackCreatedAt = new Date().toISOString();
  const id = typeof raw.id === "string" && raw.id.trim().length > 0
    ? raw.id
    : isObject(raw.config) && typeof raw.config.id === "string" && raw.config.id.trim().length > 0
      ? raw.config.id
      : crypto.randomUUID();

  const config = normalizeConfig(raw.config, id, fallbackCreatedAt);
  if (!config) return null;

  if (!Array.isArray(raw.weeks)) return null;
  const weeks = raw.weeks
    .map(normalizeWeek)
    .filter((week): week is PlanWeek => week !== null)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  if (weeks.length === 0) return null;
  if (weeks.length > MAX_WEEKS_PER_PLAN) return null;

  const totalWeeks = weeks.length;
  const phases = normalizePhases(raw.phases);

  return {
    id,
    config: {
      ...config,
      id,
    },
    weeks,
    totalWeeks,
    phases,
    raceTimePrediction: typeof raw.raceTimePrediction === "string" ? raw.raceTimePrediction : undefined,
    name: typeof raw.name === "string" && raw.name.trim().length > 0 ? raw.name : (config.planName || "Plan"),
    nameEn: typeof raw.nameEn === "string" && raw.nameEn.trim().length > 0 ? raw.nameEn : (typeof raw.name === "string" && raw.name.trim().length > 0 ? raw.name : (config.planName || "Plan")),
    version: isFiniteNumber(raw.version) ? raw.version : undefined,
    peakWeeklyKm: asOptionalNumber(raw.peakWeeklyKm),
    peakLongRunKm: asOptionalNumber(raw.peakLongRunKm),
  };
}

export function preparePlanForStorage(plan: TrainingPlan): TrainingPlan {
  const normalized = normalizeStoredPlan(plan);
  if (!normalized) {
    throw new Error("Invalid training plan");
  }
  return normalized;
}

export function parseImportedPlanJson(json: string): TrainingPlan | null {
  try {
    const parsed = JSON.parse(json) as unknown;
    const normalized = normalizeStoredPlan(parsed);
    if (!normalized) return null;

    const importedId = crypto.randomUUID();
    return preparePlanForStorage({
      ...normalized,
      id: importedId,
      config: {
        ...normalized.config,
        id: importedId,
        createdAt: new Date().toISOString(),
      },
    });
  } catch {
    return null;
  }
}

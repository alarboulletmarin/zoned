import { calculateFueling } from "@/data/guides/nutrition/calculator";
import type { FuelingResult } from "@/data/guides/nutrition/calculator";
import { warmupRoutines } from "@/data/guides/warmup";
import type { Exercise } from "@/data/guides/warmup/types";
import { racePrepSections } from "@/data/guides/race-prep/data";
import { generateSplits, formatPaceDisplay } from "@/lib/splits";
import type { SplitRow, SplitStrategy } from "@/lib/splits";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RaceSimInput {
  distanceKm: number;
  targetTimeSeconds: number;
  startTime: string; // "HH:mm"
  strategy: SplitStrategy;
  bodyWeightKg?: number;
}

export interface ChecklistItem {
  text: string;
  textEn: string;
  checked: boolean;
}

export interface MealRecommendation {
  time: string;
  carbsG: string;
  description: string;
  descriptionEn: string;
}

export interface MentalCue {
  fromKm: number;
  toKm: number;
  text: string;
  textEn: string;
}

export interface TimelineEvent {
  time: string; // "HH:mm"
  relativeMin: number;
  label: string;
  labelEn: string;
  type: "prep" | "meal" | "warmup" | "race" | "nutrition" | "recovery";
}

export interface RacePlan {
  // Timing
  wakeUpTime: string;
  breakfastTime: string;
  warmupStartTime: string;
  startTime: string;
  estimatedFinishTime: string;

  // Sections
  dayBeforeChecklist: ChecklistItem[];
  raceDayChecklist: ChecklistItem[];
  breakfast: MealRecommendation;
  warmupExercises: Exercise[];
  warmupDurationMin: number;
  splits: SplitRow[];
  fuelingPlan: FuelingResult;
  mentalCues: MentalCue[];
  timeline: TimelineEvent[];

  // Metadata
  paceFormatted: string;
  distanceLabel: string;
  distanceKm: number;
  targetTimeSeconds: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMin = h * 60 + m + minutes;
  const newH = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60);
  const newM = ((totalMin % 1440) + 1440) % 1440 % 60;
  return `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`;
}

function getDistanceLabel(km: number): string {
  if (Math.abs(km - 5) < 0.01) return "5K";
  if (Math.abs(km - 10) < 0.01) return "10K";
  if (Math.abs(km - 21.1) < 0.1) return "Semi-marathon";
  if (Math.abs(km - 42.195) < 0.1) return "Marathon";
  return `${km} km`;
}

function getDistanceLabelEn(km: number): string {
  if (Math.abs(km - 5) < 0.01) return "5K";
  if (Math.abs(km - 10) < 0.01) return "10K";
  if (Math.abs(km - 21.1) < 0.1) return "Half Marathon";
  if (Math.abs(km - 42.195) < 0.1) return "Marathon";
  return `${km} km`;
}

// ---------------------------------------------------------------------------
// Mental cues generator
// ---------------------------------------------------------------------------

// The km range is rendered as a badge next to each cue, so the text itself
// never repeats it ("Km 1-2 : …" would duplicate the badge).
function generateMentalCues(distanceKm: number): MentalCue[] {
  if (distanceKm <= 5) {
    return [
      { fromKm: 0, toKm: 1.5, text: "Trouve ton rythme. Ne pars pas trop vite, laisse le corps se mettre en route.", textEn: "Find your rhythm. Don't start too fast, let your body ease in." },
      { fromKm: 1.5, toKm: 3.5, text: "Installe-toi dans l'effort. Respire régulièrement, reste relâché.", textEn: "Settle into the effort. Breathe steadily, stay relaxed." },
      { fromKm: 3.5, toKm: distanceKm, text: "Vide le réservoir. Accélère progressivement jusqu'à la ligne.", textEn: "Empty the tank. Gradually pick up the pace to the finish." },
    ];
  }

  if (distanceKm <= 10) {
    return [
      { fromKm: 0, toKm: 2, text: "Pars prudemment. La course ne se gagne pas dans le premier kilomètre.", textEn: "Start cautiously. The race isn't won in the first kilometre." },
      { fromKm: 2, toKm: 5, text: "Trouve ton rythme de croisière. Allure régulière, respiration contrôlée.", textEn: "Find your cruising speed. Steady pace, controlled breathing." },
      { fromKm: 5, toKm: 8, text: "La course commence. Reste concentré, maintiens ta forme de course.", textEn: "The race begins. Stay focused, maintain your running form." },
      { fromKm: 8, toKm: distanceKm, text: "Sprint final. Donne tout ce qu'il reste, la ligne est proche.", textEn: "Final push. Give everything you have left, the finish is close." },
    ];
  }

  if (distanceKm <= 22) {
    return [
      { fromKm: 0, toKm: 5, text: "Patience. Retiens-toi, ce n'est que le début. Allure facile et confortable.", textEn: "Patience. Hold back, it's only the beginning. Easy and comfortable pace." },
      { fromKm: 5, toKm: 12, text: "Installe ton rythme de croisière. Profite de l'ambiance, reste régulier.", textEn: "Settle into your cruising pace. Enjoy the atmosphere, stay steady." },
      { fromKm: 12, toKm: 18, text: "La vraie course commence ici. Reste fort mentalement, un kilomètre à la fois.", textEn: "The real race starts here. Stay mentally strong, one kilometre at a time." },
      { fromKm: 18, toKm: distanceKm, text: "Tu y es presque. Accélère si tu peux, la ligne t'attend.", textEn: "You're almost there. Pick up the pace if you can, the finish line awaits." },
    ];
  }

  // Marathon
  return [
    { fromKm: 0, toKm: 10, text: "Le marathon n'a pas encore commencé. Pars LENTEMENT. Chaque seconde grattée ici te coûtera des minutes plus tard.", textEn: "The marathon hasn't started yet. Start SLOWLY. Every second saved here will cost you minutes later." },
    { fromKm: 10, toKm: 20, text: "Rythme de croisière. Tu dois te sentir confortable. Si c'est dur, tu es trop vite.", textEn: "Cruising pace. You should feel comfortable. If it's hard, you're going too fast." },
    { fromKm: 20, toKm: 30, text: "Reste fort et régulier. Fragmente : un kilomètre à la fois, un ravitaillement à la fois.", textEn: "Stay strong and steady. Break it down: one kilometre at a time, one aid station at a time." },
    { fromKm: 30, toKm: 38, text: "Le « mur ». Concentre-toi sur ta technique, raccourcis la foulée si besoin. Pense à pourquoi tu es là.", textEn: "The 'wall'. Focus on your form, shorten your stride if needed. Think about why you're here." },
    { fromKm: 38, toKm: distanceKm, text: "Derniers kilomètres. Donne tout. Chaque pas te rapproche de la ligne. Tu es un marathonien.", textEn: "Final kilometres. Give everything. Every step brings you closer to the finish. You are a marathoner." },
  ];
}

// ---------------------------------------------------------------------------
// Checklists from race-prep data
// ---------------------------------------------------------------------------

function extractChecklists(): { dayBefore: ChecklistItem[]; raceDay: ChecklistItem[] } {
  const dayBefore: ChecklistItem[] = [];
  const raceDay: ChecklistItem[] = [];

  const prepSection = racePrepSections.find(s => s.id === "pre-race-checklist");
  if (!prepSection) return { dayBefore, raceDay };

  for (const block of prepSection.content) {
    if (block.type !== "checklist" || !block.items) continue;

    const isDayBefore = block.text === "La veille";
    const target = isDayBefore ? dayBefore : raceDay;

    for (const item of block.items) {
      target.push({
        text: item.text,
        textEn: item.textEn,
        checked: false,
      });
    }
  }

  return { dayBefore, raceDay };
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateRacePlan(input: RaceSimInput): RacePlan {
  const { distanceKm, targetTimeSeconds, startTime, strategy, bodyWeightKg } = input;
  const weight = bodyWeightKg ?? 70;
  const durationMin = targetTimeSeconds / 60;

  // --- Warmup ---
  const raceDayWarmup = warmupRoutines.find(r => r.id === "race-day-warmup");
  const warmupExercises = raceDayWarmup?.exercises ?? [];
  const warmupDurationMin = raceDayWarmup?.totalDurationMin ?? 28;
  // Finish the routine 2 min before the gun, so the block is scheduled from
  // its real duration instead of a fixed -30 that never matched it.
  const warmupOffsetMin = -(warmupDurationMin + 2);

  // --- Timing ---
  const wakeUpTime = addMinutesToTime(startTime, -210); // -3h30
  const breakfastTime = addMinutesToTime(startTime, -180); // -3h
  const warmupStartTime = addMinutesToTime(startTime, warmupOffsetMin);
  const estimatedFinishTime = addMinutesToTime(startTime, Math.ceil(durationMin));

  // --- Pace ---
  const paceMinPerKm = durationMin / distanceKm;
  const paceFormatted = formatPaceDisplay(paceMinPerKm);

  // --- Splits ---
  const splits = generateSplits(distanceKm, targetTimeSeconds, strategy);

  // --- Nutrition ---
  const fuelingPlan = calculateFueling({
    durationMin,
    distanceKm,
    bodyWeightKg: weight,
  });

  // --- Breakfast ---
  const carbsMin = Math.round(weight * 2);
  const carbsMax = Math.round(weight * 3);
  const breakfast: MealRecommendation = {
    time: breakfastTime,
    carbsG: `${carbsMin}–${carbsMax}`,
    description: `${carbsMin}–${carbsMax}g de glucides : riz, pâtes, pain blanc, confiture, miel, banane. Faible en gras et fibres. Boisson : eau ou thé léger.`,
    descriptionEn: `${carbsMin}–${carbsMax}g carbs: rice, pasta, white bread, jam, honey, banana. Low fat and fiber. Drink: water or light tea.`,
  };

  // --- Checklists ---
  const { dayBefore, raceDay } = extractChecklists();

  // --- Mental cues ---
  const mentalCues = generateMentalCues(distanceKm);

  // --- Timeline ---
  const timeline: TimelineEvent[] = [];

  timeline.push({
    time: wakeUpTime,
    relativeMin: -210,
    label: "Réveil",
    labelEn: "Wake up",
    type: "prep",
  });

  timeline.push({
    time: breakfastTime,
    relativeMin: -180,
    label: `Petit-déjeuner (${carbsMin}–${carbsMax}g glucides)`,
    labelEn: `Breakfast (${carbsMin}–${carbsMax}g carbs)`,
    type: "meal",
  });

  timeline.push({
    time: addMinutesToTime(startTime, -60),
    relativeMin: -60,
    label: "Arrivée sur le site, retrait du dossard, repérage",
    labelEn: "Arrive at venue, pick up bib, scout the area",
    type: "prep",
  });

  timeline.push({
    time: addMinutesToTime(startTime, -15),
    relativeMin: -15,
    label: "Dernière hydratation : 150-200ml d'eau",
    labelEn: "Final hydration: 150-200ml water",
    type: "meal",
  });

  timeline.push({
    time: warmupStartTime,
    relativeMin: warmupOffsetMin,
    label: `Échauffement (${warmupDurationMin} min)`,
    labelEn: `Warm-up (${warmupDurationMin} min)`,
    type: "warmup",
  });

  timeline.push({
    time: startTime,
    relativeMin: 0,
    label: "Départ !",
    labelEn: "Start!",
    type: "race",
  });

  for (const cp of fuelingPlan.timeline) {
    if (cp.timeMin > 0 && cp.timeMin < durationMin) {
      timeline.push({
        time: addMinutesToTime(startTime, Math.round(cp.timeMin)),
        relativeMin: Math.round(cp.timeMin),
        label: cp.action,
        labelEn: cp.actionEn,
        type: "nutrition",
      });
    }
  }

  timeline.push({
    time: estimatedFinishTime,
    relativeMin: Math.ceil(durationMin),
    label: "Arrivée estimée",
    labelEn: "Estimated finish",
    type: "race",
  });

  timeline.push({
    time: addMinutesToTime(startTime, Math.ceil(durationMin) + 10),
    relativeMin: Math.ceil(durationMin) + 10,
    label: "Récupération : marcher, s'étirer légèrement, manger et boire dans les 30 min",
    labelEn: "Recovery: walk, light stretching, eat and drink within 30 min",
    type: "recovery",
  });

  timeline.sort((a, b) => a.relativeMin - b.relativeMin);

  return {
    wakeUpTime,
    breakfastTime,
    warmupStartTime,
    startTime,
    estimatedFinishTime,
    dayBeforeChecklist: dayBefore,
    raceDayChecklist: raceDay,
    breakfast,
    warmupExercises,
    warmupDurationMin,
    splits,
    fuelingPlan,
    mentalCues,
    timeline,
    paceFormatted,
    distanceLabel: getDistanceLabel(distanceKm),
    distanceKm,
    targetTimeSeconds,
  };
}

export { getDistanceLabelEn };

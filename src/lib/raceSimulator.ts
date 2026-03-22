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

function generateMentalCues(distanceKm: number): MentalCue[] {
  if (distanceKm <= 5) {
    return [
      { fromKm: 0, toKm: 1.5, text: "Trouvez votre rythme. Ne partez pas trop vite, laissez le corps se mettre en route.", textEn: "Find your rhythm. Don't start too fast, let your body ease in." },
      { fromKm: 1.5, toKm: 3.5, text: "Installez-vous dans l'effort. Respirez régulièrement, restez relâché.", textEn: "Settle into the effort. Breathe steadily, stay relaxed." },
      { fromKm: 3.5, toKm: distanceKm, text: "Dernier km : videz le réservoir ! Accélérez progressivement jusqu'à la ligne.", textEn: "Final km: empty the tank! Gradually pick up the pace to the finish." },
    ];
  }

  if (distanceKm <= 10) {
    return [
      { fromKm: 0, toKm: 2, text: "Km 1-2 : Partez prudemment. La course ne se gagne pas dans le premier km.", textEn: "Km 1-2: Start cautiously. The race isn't won in the first km." },
      { fromKm: 2, toKm: 5, text: "Km 2-5 : Trouvez votre rythme de croisière. Allure régulière, respiration contrôlée.", textEn: "Km 2-5: Find your cruising speed. Steady pace, controlled breathing." },
      { fromKm: 5, toKm: 8, text: "Km 5-8 : La course commence. Restez concentré, maintenez votre forme de course.", textEn: "Km 5-8: The race begins. Stay focused, maintain your running form." },
      { fromKm: 8, toKm: distanceKm, text: "Km 8-10 : Sprint final ! Donnez tout ce qu'il reste. La ligne est proche.", textEn: "Km 8-10: Final push! Give everything you have left. The finish is close." },
    ];
  }

  if (distanceKm <= 22) {
    return [
      { fromKm: 0, toKm: 5, text: "Km 0-5 : Patience. Retenez-vous, ce n'est que le début. Allure facile et confortable.", textEn: "Km 0-5: Patience. Hold back, it's only the beginning. Easy and comfortable pace." },
      { fromKm: 5, toKm: 12, text: "Km 5-12 : Installez votre rythme de croisière. Profitez de l'ambiance, restez régulier.", textEn: "Km 5-12: Settle into your cruising pace. Enjoy the atmosphere, stay steady." },
      { fromKm: 12, toKm: 18, text: "Km 12-18 : La vraie course commence ici. Restez fort mentalement, un km à la fois.", textEn: "Km 12-18: The real race starts here. Stay mentally strong, one km at a time." },
      { fromKm: 18, toKm: distanceKm, text: "Derniers km : Vous y êtes presque ! Accélérez si possible, la ligne vous attend.", textEn: "Final km: You're almost there! Pick up the pace if you can, the finish line awaits." },
    ];
  }

  // Marathon
  return [
    { fromKm: 0, toKm: 10, text: "Km 0-10 : Le marathon ne commence pas encore. Partez LENTEMENT. Chaque seconde économisée ici vous coûtera des minutes plus tard.", textEn: "Km 0-10: The marathon hasn't started yet. Start SLOWLY. Every second saved here will cost you minutes later." },
    { fromKm: 10, toKm: 20, text: "Km 10-20 : Rythme de croisière. Vous devez vous sentir confortable. Si c'est dur, vous êtes trop vite.", textEn: "Km 10-20: Cruising pace. You should feel comfortable. If it's hard, you're going too fast." },
    { fromKm: 20, toKm: 30, text: "Km 20-30 : Restez fort et régulier. Fragmentez : un km à la fois, un ravitaillement à la fois.", textEn: "Km 20-30: Stay strong and steady. Break it down: one km at a time, one aid station at a time." },
    { fromKm: 30, toKm: 38, text: "Km 30-38 : Le « mur ». Concentrez-vous sur votre technique, raccourcissez la foulée si besoin. Pensez à pourquoi vous êtes là.", textEn: "Km 30-38: The 'wall'. Focus on your form, shorten your stride if needed. Think about why you're here." },
    { fromKm: 38, toKm: distanceKm, text: "Km 38-42 : Derniers kilomètres ! Donnez tout. Chaque pas vous rapproche de la ligne. Vous êtes un marathonien.", textEn: "Km 38-42: Final kilometers! Give everything. Every step brings you closer to the finish. You are a marathoner." },
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

  // --- Timing ---
  const wakeUpTime = addMinutesToTime(startTime, -210); // -3h30
  const breakfastTime = addMinutesToTime(startTime, -180); // -3h
  const warmupStartTime = addMinutesToTime(startTime, -30); // -30min
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

  // --- Warmup ---
  const raceDayWarmup = warmupRoutines.find(r => r.id === "race-day-warmup");
  const warmupExercises = raceDayWarmup?.exercises ?? [];
  const warmupDurationMin = raceDayWarmup?.totalDurationMin ?? 18;

  // --- Checklists ---
  const { dayBefore, raceDay } = extractChecklists();

  // --- Mental cues ---
  const mentalCues = generateMentalCues(distanceKm);

  // --- Timeline ---
  const timeline: TimelineEvent[] = [];

  timeline.push({
    time: wakeUpTime,
    label: "Réveil",
    labelEn: "Wake up",
    type: "prep",
  });

  timeline.push({
    time: breakfastTime,
    label: `Petit-déjeuner (${carbsMin}–${carbsMax}g glucides)`,
    labelEn: `Breakfast (${carbsMin}–${carbsMax}g carbs)`,
    type: "meal",
  });

  timeline.push({
    time: addMinutesToTime(startTime, -60),
    label: "Arrivée sur le site, retrait du dossard, repérage",
    labelEn: "Arrive at venue, pick up bib, scout the area",
    type: "prep",
  });

  timeline.push({
    time: addMinutesToTime(startTime, -15),
    label: "Dernière hydratation : 150-200ml d'eau",
    labelEn: "Final hydration: 150-200ml water",
    type: "meal",
  });

  timeline.push({
    time: warmupStartTime,
    label: `Échauffement (${warmupDurationMin} min)`,
    labelEn: `Warm-up (${warmupDurationMin} min)`,
    type: "warmup",
  });

  timeline.push({
    time: startTime,
    label: "Départ !",
    labelEn: "Start!",
    type: "race",
  });

  // Add fueling checkpoints during race
  for (const cp of fuelingPlan.timeline) {
    if (cp.timeMin > 0 && cp.timeMin < durationMin) {
      timeline.push({
        time: addMinutesToTime(startTime, Math.round(cp.timeMin)),
        label: cp.action,
        labelEn: cp.actionEn,
        type: "nutrition",
      });
    }
  }

  timeline.push({
    time: estimatedFinishTime,
    label: "Arrivée estimée",
    labelEn: "Estimated finish",
    type: "race",
  });

  timeline.push({
    time: addMinutesToTime(startTime, Math.ceil(durationMin) + 10),
    label: "Récupération : marcher, s'étirer légèrement, manger et boire dans les 30 min",
    labelEn: "Recovery: walk, light stretching, eat and drink within 30 min",
    type: "recovery",
  });

  // Sort by time
  timeline.sort((a, b) => {
    const [ah, am] = a.time.split(":").map(Number);
    const [bh, bm] = b.time.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });

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

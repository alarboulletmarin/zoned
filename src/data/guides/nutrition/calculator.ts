import type { FuelingStrategy } from "./types";

export interface FuelingInput {
  durationMin: number;
  distanceKm: number;
  bodyWeightKg?: number;
}

export interface FuelingResult {
  carbsPerHourG: number;
  totalCarbsG: number;
  fluidMlPerHour: number;
  totalFluidMl: number;
  sodiumMgPerHour: number;
  gelCount: number;
  gelFrequencyMin: number;
  electrolyteDrink: boolean;
  timeline: FuelingCheckpoint[];
  tips: { text: string; textEn: string }[];
}

export interface FuelingCheckpoint {
  timeMin: number;
  action: string;
  actionEn: string;
}

/**
 * Fueling stratégies based on Jeukendrup 2014 and ACSM Position Stand.
 * Indexed by duration thresholds.
 */
const STRATEGIES: FuelingStrategy[] = [
  {
    durationRange: [0, 60],
    carbsPerHourG: [0, 0],
    fluidMlPerHour: [400, 600],
    sodiumMgPerHour: [0, 0],
    gelFrequencyMin: 0,
    notes:
      "Eau uniquement. Un rinçage de bouche avec boisson glucidique peut améliorer la performance.",
    notesEn:
      "Water only. A carbohydrate mouth rinse can still improve performance.",
  },
  {
    durationRange: [60, 90],
    carbsPerHourG: [30, 60],
    fluidMlPerHour: [400, 700],
    sodiumMgPerHour: [0, 300],
    gelFrequencyMin: 30,
    notes:
      "Début de l'apport glucidique. Glucides simples (glucose, maltodextrine) suffisants.",
    notesEn:
      "Start carbohydrate intake. Single transportable carbs (glucose, maltodextrin) are sufficient.",
  },
  {
    durationRange: [90, 150],
    carbsPerHourG: [60, 60],
    fluidMlPerHour: [400, 800],
    sodiumMgPerHour: [300, 500],
    gelFrequencyMin: 25,
    notes:
      "Apport régulier indispensable. Commencer tôt, ne pas attendre la faim.",
    notesEn:
      "Regular intake essential. Start early, do not wait until you feel hungry.",
  },
  {
    durationRange: [150, Infinity],
    carbsPerHourG: [60, 90],
    fluidMlPerHour: [500, 800],
    sodiumMgPerHour: [400, 600],
    gelFrequencyMin: 20,
    notes:
      "Utiliser un ratio glucose:fructose 2:1 pour maximiser l'absorption (jusqu'à 90g/h). Entraîner le système digestif.",
    notesEn:
      "Use a 2:1 glucose:fructose ratio to maximize absorption (up to 90g/h). Train your gut.",
  },
];

const CARBS_PER_GEL = 25; // grams, typical gel

function findStrategy(durationMin: number): FuelingStrategy {
  for (const s of STRATEGIES) {
    if (durationMin >= s.durationRange[0] && durationMin < s.durationRange[1]) {
      return s;
    }
  }
  return STRATEGIES[STRATEGIES.length - 1];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate personalized fueling plan based on Jeukendrup 2014 guidelines,
 * ACSM Position Stand, and IOC Consensus on Sports Nutrition.
 */
export function calculateFueling(input: FuelingInput): FuelingResult {
  const { durationMin, distanceKm, bodyWeightKg } = input;
  const durationH = durationMin / 60;
  const strategy = findStrategy(durationMin);
  const weight = bodyWeightKg ?? 70; // default 70kg

  // --- Carbohydrate calculation ---
  // Scale within the strategy range based on intensity (pace proxy)
  const paceMinPerKm = durationMin / distanceKm;
  // Faster pace = higher carb need. Typical range: 3.5 (elite) to 8 (easy).
  const intensityFactor = clamp(1 - (paceMinPerKm - 3.5) / 4.5, 0, 1);
  const carbsPerHourG = Math.round(
    strategy.carbsPerHourG[0] +
      (strategy.carbsPerHourG[1] - strategy.carbsPerHourG[0]) * intensityFactor
  );
  const totalCarbsG = Math.round(carbsPerHourG * durationH);

  // --- Hydration ---
  // Higher weight and intensity = more fluid
  const weightFluidFactor = clamp((weight - 50) / 50, 0, 1); // 50-100kg range
  const fluidMlPerHour = Math.round(
    strategy.fluidMlPerHour[0] +
      (strategy.fluidMlPerHour[1] - strategy.fluidMlPerHour[0]) *
        (intensityFactor * 0.5 + weightFluidFactor * 0.5)
  );
  const totalFluidMl = Math.round(fluidMlPerHour * durationH);

  // --- Sodium ---
  const sodiumMgPerHour = Math.round(
    strategy.sodiumMgPerHour[0] +
      (strategy.sodiumMgPerHour[1] - strategy.sodiumMgPerHour[0]) *
        intensityFactor
  );

  // --- Gel calculation ---
  const gelFrequencyMin =
    carbsPerHourG > 0 ? strategy.gelFrequencyMin : 0;
  const gelCount =
    gelFrequencyMin > 0
      ? Math.ceil(totalCarbsG / CARBS_PER_GEL)
      : 0;

  // Electrolyte drink recommended for > 90 min or significant sodium need
  const electrolyteDrink = durationMin > 90 || sodiumMgPerHour > 0;

  // --- Build timeline ---
  const timeline: FuelingCheckpoint[] = [];

  // Pre-race: T-3h meal
  timeline.push({
    timeMin: -180,
    action: `Repas pré-course : ${Math.round(weight * 2)}–${Math.round(weight * 3)}g de glucides (${Math.round(weight * 2 / 50)}-${Math.round(weight * 3 / 50)} portions de féculents), faible en gras et fibres.`,
    actionEn: `Pre-race meal: ${Math.round(weight * 2)}–${Math.round(weight * 3)}g carbs (${Math.round(weight * 2 / 50)}-${Math.round(weight * 3 / 50)} starchy servings), low fat and fiber.`,
  });

  // T-60min: top-up
  timeline.push({
    timeMin: -60,
    action: `Petite collation optionnelle : banane ou barre énergétique (30-50g glucides).`,
    actionEn: `Optional small snack: banana or energy bar (30-50g carbs).`,
  });

  // T-15min: final hydration
  timeline.push({
    timeMin: -15,
    action: `Hydratation finale : 150-200ml d'eau ou boisson sport. Arrêter de boire pour éviter l'inconfort.`,
    actionEn: `Final hydration: 150-200ml water or sports drink. Stop drinking to avoid discomfort.`,
  });

  // During race
  if (durationMin <= 60) {
    // Short effort: water only
    timeline.push({
      timeMin: 0,
      action: `Départ. Eau disponible, boire selon la soif (400-600ml/h).`,
      actionEn: `Start. Water available, drink to thirst (400-600ml/h).`,
    });
    if (durationMin > 30) {
      timeline.push({
        timeMin: 30,
        action: `Rinçage de bouche avec boisson glucidique (ne pas avaler obligatoirement).`,
        actionEn: `Mouth rinse with carb drink (no need to swallow).`,
      });
    }
  } else {
    // Long effort: build gel/drink schedule
    timeline.push({
      timeMin: 0,
      action: `Départ. Commencer l'hydratation dès les premiers ravitaillements.`,
      actionEn: `Start. Begin hydrating at the first aid stations.`,
    });

    if (gelFrequencyMin > 0) {
      let gelTime = Math.min(gelFrequencyMin, 25); // first gel at 20-25min
      let gelNumber = 1;
      const maxTime = durationMin - 10; // stop 10min before finish

      while (gelTime <= maxTime && gelNumber <= gelCount) {
        const isEvenGel = gelNumber % 2 === 0;
        if (isEvenGel && electrolyteDrink) {
          timeline.push({
            timeMin: gelTime,
            action: `Gel #${gelNumber} (${CARBS_PER_GEL}g glucides) + boisson électrolytes (${Math.round(fluidMlPerHour / 3)}ml avec ${Math.round(sodiumMgPerHour / 3)}mg sodium).`,
            actionEn: `Gel #${gelNumber} (${CARBS_PER_GEL}g carbs) + electrolyte drink (${Math.round(fluidMlPerHour / 3)}ml with ${Math.round(sodiumMgPerHour / 3)}mg sodium).`,
          });
        } else {
          timeline.push({
            timeMin: gelTime,
            action: `Gel #${gelNumber} (${CARBS_PER_GEL}g glucides) + 150-200ml d'eau.`,
            actionEn: `Gel #${gelNumber} (${CARBS_PER_GEL}g carbs) + 150-200ml water.`,
          });
        }
        gelTime += gelFrequencyMin;
        gelNumber++;
      }

      // Add mid-race hydration reminders between gels for very long efforts
      if (durationMin > 150) {
        const midpoint = Math.round(durationMin / 2);
        const existing = timeline.find(
          (c) => Math.abs(c.timeMin - midpoint) < 10
        );
        if (!existing) {
          timeline.push({
            timeMin: midpoint,
            action: `Mi-course : vérifier l'hydratation. Boire même sans soif. Viser ${fluidMlPerHour}ml/h.`,
            actionEn: `Mid-race: check hydration. Drink even without thirst. Target ${fluidMlPerHour}ml/h.`,
          });
        }
      }
    }
  }

  // Post-race recovery checkpoint
  timeline.push({
    timeMin: durationMin,
    action: `Arrivée ! Dans les 30min : ${Math.round(weight * 1)}–${Math.round(weight * 1.2)}g glucides + ${Math.round(weight * 0.3)}–${Math.round(weight * 0.4)}g protéines. Réhydrater : ${Math.round(totalFluidMl * 0.5)}ml minimum.`,
    actionEn: `Finish! Within 30min: ${Math.round(weight * 1)}–${Math.round(weight * 1.2)}g carbs + ${Math.round(weight * 0.3)}–${Math.round(weight * 0.4)}g protein. Rehydrate: ${Math.round(totalFluidMl * 0.5)}ml minimum.`,
  });

  // Sort timeline by time
  timeline.sort((a, b) => a.timeMin - b.timeMin);

  // --- Build tips ---
  const tips: { text: string; textEn: string }[] = [];

  tips.push({
    text: "Testez toujours votre stratégie nutritionnelle à l'entraînement avant la course. Ne jamais rien essayer de nouveau le jour J.",
    textEn: "Always test your nutrition strategy in training before race day. Never try anything new on race day.",
  });

  if (durationMin > 90) {
    tips.push({
      text: "Entraînez votre système digestif : commencez par 30g/h et augmentez progressivement sur 4-6 semaines.",
      textEn: "Train your gut: start at 30g/h and gradually increase over 4-6 weeks.",
    });
  }

  if (durationMin > 150) {
    tips.push({
      text: `Utilisez un ratio glucose:fructose 2:1 pour dépasser 60g/h. Les gels à base de fructose + maltodextrine sont idéaux.`,
      textEn: `Use a 2:1 glucose:fructose ratio to exceed 60g/h. Gels with fructose + maltodextrin are idéal.`,
    });
    tips.push({
      text: "Variez les textures : alterner gels, barres, et boissons pour éviter la lassitude et les nausées.",
      textEn: "Vary textures: alternate gels, bars, and drinks to avoid palate fatigue and nausea.",
    });
  }

  if (carbsPerHourG > 0) {
    tips.push({
      text: "Prenez chaque gel avec de l'eau (jamais avec une boisson énergétique, risque de surdosage glucidique).",
      textEn: "Take each gel with water (never with a sports drink to avoid carbohydrate overload).",
    });
  }

  if (electrolyteDrink) {
    tips.push({
      text: `Visez ${sodiumMgPerHour}mg de sodium/h. En cas de forte chaleur ou transpiration abondante, augmentez de 20-30%.`,
      textEn: `Target ${sodiumMgPerHour}mg sodium/h. In hot weather or heavy sweating, increase by 20-30%.`,
    });
  }

  tips.push({
    text: "Pesez-vous avant et après l'effort pour estimer vos pertes hydriques et affiner votre plan.",
    textEn: "Weigh yourself before and after exercise to estimate fluid losses and refine your plan.",
  });

  return {
    carbsPerHourG,
    totalCarbsG,
    fluidMlPerHour,
    totalFluidMl,
    sodiumMgPerHour,
    gelCount,
    gelFrequencyMin,
    electrolyteDrink,
    timeline,
    tips,
  };
}

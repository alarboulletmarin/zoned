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
 * Fueling strategies based on Jeukendrup 2014, Rowlands 2020,
 * Viribay 2020 (120 g/h), and IOC consensus.
 *
 * Note on ratios:
 *   - Below 90 g/h: glucose alone or 2:1 glucose:fructose works equally well.
 *   - Above 90 g/h: 1:0.8 glucose:fructose ratio is optimal (Rowlands 2020,
 *     +45% oxidation vs glucose alone, fewer GI symptoms).
 *   - 120 g/h achievable only with 8-12 weeks of gut training (Viribay 2020).
 */
const STRATEGIES: FuelingStrategy[] = [
  {
    durationRange: [0, 60],
    carbsPerHourG: [0, 0],
    fluidMlPerHour: [400, 600],
    sodiumMgPerHour: [0, 0],
    gelFrequencyMin: 0,
    notes:
      "Eau uniquement. Un rinçage de bouche avec boisson glucidique peut donner un léger coup de boost (gain ~1-3 %).",
    notesEn:
      "Water only. A carb mouth rinse can give a small boost (~1-3% gain).",
  },
  {
    durationRange: [60, 90],
    carbsPerHourG: [30, 60],
    fluidMlPerHour: [400, 700],
    sodiumMgPerHour: [0, 300],
    gelFrequencyMin: 30,
    notes:
      "Début de l'apport glucidique. Glucose seul ou ratio 2:1 conviennent. Pas besoin de 1:0.8 à ce niveau.",
    notesEn:
      "Start carb intake. Glucose alone or 2:1 ratio both work. No need for 1:0.8 at this level.",
  },
  {
    durationRange: [90, 150],
    carbsPerHourG: [60, 90],
    fluidMlPerHour: [400, 800],
    sodiumMgPerHour: [300, 500],
    gelFrequencyMin: 25,
    notes:
      "Apport régulier indispensable. Au-delà de 60 g/h, ratio 1:0.8 glucose:fructose recommandé.",
    notesEn:
      "Regular intake essential. Above 60 g/h, 1:0.8 glucose:fructose ratio recommended.",
  },
  {
    durationRange: [150, Infinity],
    carbsPerHourG: [60, 90],
    fluidMlPerHour: [500, 800],
    sodiumMgPerHour: [400, 800],
    gelFrequencyMin: 25,
    notes:
      "Cible 60-90 g/h, à atteindre par mix gels + boisson énergétique. Ratio 1:0.8 recommandé au-delà de 60 g/h. Les coureurs élites peuvent monter à 120 g/h après 8-12 sem d'entraînement digestif.",
    notesEn:
      "Target 60-90 g/h, achieved via gels + sports drink mix. 1:0.8 ratio recommended above 60 g/h. Elite runners can reach 120 g/h after 8-12 wks of gut training.",
  },
];

const CARBS_PER_GEL = 25; // grams, typical gel
/** Realistic split: gels cover ~60% of carbs, sports drink the rest (~40%). */
const CARBS_FROM_GELS_RATIO = 0.6;

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

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Calculate personalized fueling plan based on Jeukendrup 2014, Rowlands 2020
 * (1:0.8 ratio), Viribay 2020 (120 g/h ceiling), ACSM Position Stand, and
 * IOC Consensus on Sports Nutrition (2018, 2023).
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
  // Higher weight and intensity = more fluid.
  // Rounded to 50 ml: nobody doses a bottle to the millilitre, and "518 ml"
  // reads as a precision the model does not have.
  const weightFluidFactor = clamp((weight - 50) / 50, 0, 1); // 50-100kg range
  const fluidMlPerHour = roundTo(
    strategy.fluidMlPerHour[0] +
      (strategy.fluidMlPerHour[1] - strategy.fluidMlPerHour[0]) *
        (intensityFactor * 0.5 + weightFluidFactor * 0.5),
    50
  );
  const totalFluidMl = roundTo(fluidMlPerHour * durationH, 50);

  // --- Sodium ---
  const sodiumMgPerHour = Math.round(
    strategy.sodiumMgPerHour[0] +
      (strategy.sodiumMgPerHour[1] - strategy.sodiumMgPerHour[0]) *
        intensityFactor
  );

  // --- Gel calculation ---
  // Realistic: gels provide ~60% of carbs, the rest comes from sports drink.
  // Without this, a 3h30 marathon at 80 g/h would compute as 14 gels — unrealistic.
  const gelFrequencyMin =
    carbsPerHourG > 0 ? strategy.gelFrequencyMin : 0;
  const carbsFromGelsG = totalCarbsG * CARBS_FROM_GELS_RATIO;
  const gelCount =
    gelFrequencyMin > 0
      ? Math.ceil(carbsFromGelsG / CARBS_PER_GEL)
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
  // Note: the "30 min window" myth is largely debunked (Aragon & Schoenfeld 2013,
  // Margolis 2021). Real glycogen window is 4-6h. Quick refill matters mainly if
  // another session is planned within 4h. Otherwise, the next regular meal is fine.
  timeline.push({
    timeMin: durationMin,
    action: `Arrivée ! Dans les 2 h : ${Math.round(weight * 1)}–${Math.round(weight * 1.2)}g glucides + ${Math.round(weight * 0.3)}–${Math.round(weight * 0.4)}g protéines. Réhydrater : ${roundTo(totalFluidMl * 0.5, 50)}ml minimum. La fenêtre 30 min n'est cruciale que si tu enchaînes une autre séance sous 4 h.`,
    actionEn: `Finish! Within 2h: ${Math.round(weight * 1)}–${Math.round(weight * 1.2)}g carbs + ${Math.round(weight * 0.3)}–${Math.round(weight * 0.4)}g protein. Rehydrate: ${roundTo(totalFluidMl * 0.5, 50)}ml minimum. The 30-min window matters mainly if another session is within 4h.`,
  });

  // Sort timeline by time
  timeline.sort((a, b) => a.timeMin - b.timeMin);

  // --- Build tips ---
  const tips: { text: string; textEn: string }[] = [];

  tips.push({
    text: "Teste toujours ta stratégie nutritionnelle à l'entraînement avant la course. Ne jamais rien essayer de nouveau le jour J.",
    textEn: "Always test your nutrition strategy in training before race day. Never try anything new on race day.",
  });

  if (durationMin > 90) {
    tips.push({
      text: "Habitue ton estomac : commence par 30 g/h et augmente progressivement sur 6-12 semaines pour atteindre ta cible.",
      textEn: "Train your gut: start at 30 g/h and gradually increase over 6-12 weeks to reach your target.",
    });
  }

  if (carbsPerHourG > 60) {
    tips.push({
      text: `Au-delà de 60 g/h, utilise un ratio glucose:fructose 1:0.8 (Maurten, Precision Fuel, SiS Beta Fuel l'utilisent). Il améliore l'absorption de 45 % et réduit les troubles digestifs vs le ratio 2:1.`,
      textEn: `Above 60 g/h, use a 1:0.8 glucose:fructose ratio (Maurten, Precision Fuel, SiS Beta Fuel use it). It improves absorption by 45% and reduces GI issues vs 2:1.`,
    });
  }

  if (durationMin > 150) {
    tips.push({
      text: "Varie les textures : alterne gels, barres et boissons pour éviter la lassitude gustative et les nausées.",
      textEn: "Vary textures: alternate gels, bars, and drinks to avoid palate fatigue and nausea.",
    });
  }

  if (carbsPerHourG >= 90) {
    tips.push({
      text: "Atteindre 90-120 g/h demande 8-12 semaines d'entraînement digestif progressif (Viribay 2020). Ne pas forcer le jour J.",
      textEn: "Reaching 90-120 g/h requires 8-12 weeks of progressive gut training (Viribay 2020). Do not force on race day.",
    });
  }

  if (carbsPerHourG > 0) {
    tips.push({
      text: "Prends chaque gel avec de l'eau (jamais avec une boisson énergétique, risque de surdosage glucidique).",
      textEn: "Take each gel with water (never with a sports drink to avoid carbohydrate overload).",
    });
  }

  if (electrolyteDrink) {
    tips.push({
      text: `Vise ${sodiumMgPerHour}mg de sodium/h. En cas de forte chaleur ou transpiration abondante, augmente de 20-30 %.`,
      textEn: `Target ${sodiumMgPerHour}mg sodium/h. In hot weather or heavy sweating, increase by 20-30%.`,
    });
  }

  tips.push({
    text: "Pèse-toi avant et après l'effort pour estimer tes pertes hydriques et affiner ton plan.",
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

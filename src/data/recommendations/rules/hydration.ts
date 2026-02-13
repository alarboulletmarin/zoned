import type { RecommendationItem, WorkoutProfile } from "../types";

interface HydrationRules {
  before: RecommendationItem[];
  during: RecommendationItem[];
  after: RecommendationItem[];
}

/**
 * Returns hydration recommendations for each phase based on the workout profile.
 */
export function getHydrationRules(profile: WorkoutProfile): HydrationRules {
  const before = getBeforeRules();
  const during = getDuringRules(profile);
  const after = getAfterRules(profile);

  return { before, during, after };
}

// ---------------------------------------------------------------------------
// Before
// ---------------------------------------------------------------------------

function getBeforeRules(): RecommendationItem[] {
  return [
    {
      text: "Buvez 400 à 500 ml d'eau dans les 2 heures précédant la séance.",
      textEn: "Drink 400 to 500 ml of water in the 2 hours before the session.",
      priority: 1,
    },
    {
      text: "Compléter avec 200 ml dans les 15 à 30 minutes avant de partir.",
      textEn: "Top up with 200 ml in the 15 to 30 minutes before heading out.",
      priority: 2,
    },
    {
      text: "Évitez les boissons diurétiques (café en excès, alcool) dans les heures qui précèdent.",
      textEn: "Avoid diuretic beverages (excessive coffee, alcohol) in the hours before.",
      priority: 3,
    },
  ];
}

// ---------------------------------------------------------------------------
// During
// ---------------------------------------------------------------------------

function getDuringRules(profile: WorkoutProfile): RecommendationItem[] {
  const items: RecommendationItem[] = [];

  // Short duration: drink if thirsty
  if (profile.duration === "short") {
    items.push({
      text: "Buvez si vous avez soif. Pour les séances courtes, l'eau suffit.",
      textEn: "Drink if you are thirsty. For short sessions, water is enough.",
      priority: 3,
    });
    return items;
  }

  // Medium duration
  if (profile.duration === "medium") {
    items.push({
      text: "Visez 400 à 600 ml d'eau par heure, par petites gorgées régulières.",
      textEn: "Aim for 400 to 600 ml of water per hour, in small regular sips.",
      priority: 1,
    });
    items.push({
      text: "En cas de chaleur ou d'effort intense, une boisson avec électrolytes est conseillée.",
      textEn: "In heat or intense effort, a drink with electrolytes is recommended.",
      priority: 2,
    });
    return items;
  }

  // Long duration
  items.push({
    text: "Visez 500 à 800 ml par heure selon la température et votre taux de transpiration.",
    textEn: "Aim for 500 to 800 ml per hour depending on temperature and your sweat rate.",
    priority: 1,
  });
  items.push({
    text: "Ajoutez des électrolytes (sodium, potassium) après 60 minutes d'effort.",
    textEn: "Add electrolytes (sodium, potassium) after 60 minutes of effort.",
    priority: 1,
  });
  items.push({
    text: "Alternez eau plate et boisson isotonique pour maintenir les niveaux de sodium.",
    textEn: "Alternate between plain water and isotonic drink to maintain sodium levels.",
    priority: 2,
  });
  items.push({
    text: "Ne buvez pas plus de 800 ml/h pour éviter l'hyponatrémie.",
    textEn: "Do not drink more than 800 ml/h to avoid hyponatremia.",
    priority: 2,
  });

  return items;
}

// ---------------------------------------------------------------------------
// After
// ---------------------------------------------------------------------------

function getAfterRules(profile: WorkoutProfile): RecommendationItem[] {
  const items: RecommendationItem[] = [];

  // Universal
  items.push({
    text: "Réhydratez-vous avec 150% du poids perdu pendant l'effort (ex : 750 ml pour 500 g perdus).",
    textEn: "Rehydrate with 150% of the weight lost during exercise (e.g., 750 ml for 500 g lost).",
    priority: 1,
  });

  // Intense or long: electrolyte drink
  if (profile.intensity === "high" || profile.duration === "long") {
    items.push({
      text: "Privilégiez une boisson avec électrolytes pour restaurer les minéraux perdus par la transpiration.",
      textEn: "Choose a drink with electrolytes to restore minerals lost through sweat.",
      priority: 1,
    });
  }

  items.push({
    text: "Vérifiez la couleur de vos urines : jaune clair = bonne hydratation, foncé = buvez davantage.",
    textEn: "Check your urine color: light yellow = good hydration, dark = drink more.",
    priority: 2,
  });

  items.push({
    text: "Continuez à boire régulièrement dans les heures suivant l'effort, même sans soif.",
    textEn: "Keep drinking regularly in the hours after exercise, even without thirst.",
    priority: 2,
  });

  // Low intensity: lighter advice
  if (profile.intensity === "low") {
    items.push({
      text: "Un grand verre d'eau après la séance suffit pour un effort léger.",
      textEn: "A large glass of water after the session is enough for light effort.",
      priority: 3,
    });
  }

  return items;
}

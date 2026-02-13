import type { RecommendationItem, WorkoutProfile } from "../types";

interface NutritionRules {
  before: RecommendationItem[];
  during: RecommendationItem[];
  after: RecommendationItem[];
}

/**
 * Returns nutrition recommendations for each phase based on the workout profile.
 */
export function getNutritionRules(profile: WorkoutProfile): NutritionRules {
  const before = getBeforeRules(profile);
  const during = getDuringRules(profile);
  const after = getAfterRules(profile);

  return { before, during, after };
}

// ---------------------------------------------------------------------------
// Before
// ---------------------------------------------------------------------------

function getBeforeRules(profile: WorkoutProfile): RecommendationItem[] {
  const items: RecommendationItem[] = [];

  // Always: last meal timing
  items.push({
    text: "Dernier repas au moins 3h avant la séance pour une digestion optimale.",
    textEn: "Eat your last meal at least 3 hours before the session for optimal digestion.",
    priority: 1,
  });

  // High intensity: carb snack
  if (profile.intensity === "high") {
    items.push({
      text: "Collation glucidique 1h à 1h30 avant : banane, barre énergétique ou compote.",
      textEn: "Carb snack 1 to 1.5 hours before: banana, energy bar, or applesauce.",
      priority: 2,
    });
  }

  // Long duration: carb loading the night before
  if (profile.duration === "long") {
    items.push({
      text: "Repas riche en glucides complexes la veille (pâtes, riz, patates douces).",
      textEn: "Carb-rich meal the night before (pasta, rice, sweet potatoes).",
      priority: 2,
    });
  }

  // Race pace: test competition nutrition
  if (profile.category === "race_pace") {
    items.push({
      text: "Testez votre stratégie nutritionnelle de compétition pour identifier ce qui fonctionne.",
      textEn: "Test your race-day nutrition strategy to find what works for you.",
      priority: 2,
    });
  }

  // Moderate/high intensity: avoid heavy fibers and fats
  if (profile.intensity === "moderate" || profile.intensity === "high") {
    items.push({
      text: "Évitez les aliments riches en fibres et en graisses avant la séance (légumineuses, fritures).",
      textEn: "Avoid high-fiber and high-fat foods before the session (legumes, fried foods).",
      priority: 3,
    });
  }

  // Moderate intensity: light snack option
  if (profile.intensity === "moderate") {
    items.push({
      text: "Une petite collation facile à digérer 1h30 avant peut améliorer votre énergie (pain blanc, compote).",
      textEn: "A small, easy-to-digest snack 1.5 hours before can boost your energy (white bread, applesauce).",
      priority: 3,
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// During
// ---------------------------------------------------------------------------

function getDuringRules(profile: WorkoutProfile): RecommendationItem[] {
  const items: RecommendationItem[] = [];

  // Short + low: no nutrition needed
  if (profile.duration === "short" && profile.intensity === "low") {
    return [];
  }

  // Short + high: optional small carb source
  if (profile.duration === "short" && profile.intensity === "high") {
    items.push({
      text: "Un petit apport glucidique peut aider (gel énergétique ou boisson sucrée) si sensation de fatigue.",
      textEn: "A small carb source may help (energy gel or sports drink) if feeling fatigued.",
      priority: 3,
    });
    return items;
  }

  // Medium duration
  if (profile.duration === "medium") {
    items.push({
      text: "Eau suffisante. Après 45 min d'effort, un gel ou quelques gorgées de boisson énergétique.",
      textEn: "Water is enough. After 45 min of effort, an energy gel or sips of sports drink.",
      priority: 2,
    });
    return items;
  }

  // Long duration: full fueling strategy
  if (profile.duration === "long") {
    items.push({
      text: "Visez 30 à 60 g de glucides par heure : gels, pâtes de fruits, ou barres énergétiques.",
      textEn: "Aim for 30 to 60 g of carbs per hour: gels, fruit jellies, or energy bars.",
      priority: 1,
    });
    items.push({
      text: "Prenez un gel énergétique toutes les 30 à 45 minutes avec de l'eau.",
      textEn: "Take an energy gel every 30 to 45 minutes with water.",
      priority: 1,
    });
    items.push({
      text: "Utilisez une boisson isotonique pour combiner hydratation et apport glucidique.",
      textEn: "Use an isotonic drink to combine hydration and carb intake.",
      priority: 2,
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// After
// ---------------------------------------------------------------------------

function getAfterRules(profile: WorkoutProfile): RecommendationItem[] {
  const items: RecommendationItem[] = [];

  // Always: recovery window
  items.push({
    text: "Fenêtre de récupération : consommez glucides + protéines dans les 30 à 60 min après l'effort.",
    textEn: "Recovery window: consume carbs + protein within 30 to 60 minutes after exercise.",
    priority: 1,
  });

  // High intensity: fast carbs immediately
  if (profile.intensity === "high") {
    items.push({
      text: "Apport rapide en glucides immédiat : banane, compote, boisson de récupération ou lait chocolaté.",
      textEn: "Immediate fast carbs: banana, applesauce, recovery drink, or chocolate milk.",
      priority: 1,
    });
  }

  // Long duration: complete meal + protein target
  if (profile.duration === "long") {
    items.push({
      text: "Repas complet dans les 2h avec 20 à 40 g de protéines (poulet, œufs, poisson ou légumineuses).",
      textEn: "Complete meal within 2 hours with 20 to 40 g of protein (chicken, eggs, fish, or legumes).",
      priority: 1,
    });
    items.push({
      text: "Privilégiez les glucides complexes pour restaurer les réserves de glycogène (riz, pâtes, quinoa).",
      textEn: "Prioritize complex carbs to restore glycogen reserves (rice, pasta, quinoa).",
      priority: 2,
    });
  }

  // General concrete food examples
  items.push({
    text: "Exemples de collation post-effort : lait chocolaté, yaourt avec granola, tartine de beurre de cacahuètes.",
    textEn: "Post-workout snack ideas: chocolate milk, yogurt with granola, peanut butter toast.",
    priority: 2,
  });

  // Moderate intensity
  if (profile.intensity === "moderate") {
    items.push({
      text: "Un repas équilibré suffit : protéines + glucides + légumes (ex : poulet, riz et brocolis).",
      textEn: "A balanced meal is enough: protein + carbs + vegetables (e.g., chicken, rice, and broccoli).",
      priority: 2,
    });
  }

  // Low intensity: keep it simple
  if (profile.intensity === "low") {
    items.push({
      text: "Pas besoin de nutrition spéciale après un effort léger. Un repas normal suffit.",
      textEn: "No special nutrition needed after light effort. A normal meal is enough.",
      priority: 3,
    });
  }

  return items;
}

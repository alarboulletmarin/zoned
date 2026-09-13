/**
 * Script to regenerate prebuilt plans using the v2 plan generator.
 * Run with: npx tsx scripts/regenerate-prebuilt-plans.ts
 */

import { generatePlan } from "../src/lib/planGenerator/index";
import type { AssistedPlanConfig } from "../src/types/plan";
import type { PrebuiltPlan } from "../src/data/prebuilt-plans/types";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Plan configurations ─────────────────────────────────────────

interface PrebuiltConfig {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  tags: string[];
  config: Omit<AssistedPlanConfig, "id" | "createdAt" | "raceDate"> & {
    totalWeeksOverride: number;
  };
}

const PREBUILT_CONFIGS: PrebuiltConfig[] = [
  {
    slug: "5k-debutant",
    name: "5K débutant",
    nameEn: "5K Beginner",
    description: "Plan de 8 semaines pour préparer votre premier 5K. Progression douce vers la ligne d'arrivée.",
    descriptionEn: "8-week plan to prepare your first 5K. Gentle progression toward the finish line.",
    icon: "Zap",
    tags: ["5k", "beginner", "first-race"],
    config: {
      raceDistance: "5K",
      runnerLevel: "beginner",
      daysPerWeek: 3,
      longRunDay: 6,
      trainingGoal: "finish",
      planPurpose: "race",
      totalWeeksOverride: 8,
    },
  },
  {
    slug: "5k-intermediaire",
    name: "5K intermédiaire",
    nameEn: "5K Intermediate",
    description: "Plan de 10 semaines pour améliorer votre temps sur 5K. Séances de qualité incluses.",
    descriptionEn: "10-week plan to improve your 5K time. Quality sessions included.",
    icon: "Zap",
    tags: ["5k", "intermediate", "pr"],
    config: {
      raceDistance: "5K",
      runnerLevel: "intermediate",
      daysPerWeek: 4,
      longRunDay: 6,
      trainingGoal: "time",
      planPurpose: "race",
      totalWeeksOverride: 10,
    },
  },
  {
    slug: "10k-debutant",
    name: "10K débutant",
    nameEn: "10K Beginner",
    description: "Plan de 10 semaines pour votre premier 10K. Construction progressive de l'endurance.",
    descriptionEn: "10-week plan for your first 10K. Progressive endurance building.",
    icon: "Timer",
    tags: ["10k", "beginner", "first-race"],
    config: {
      raceDistance: "10K",
      runnerLevel: "beginner",
      daysPerWeek: 3,
      longRunDay: 6,
      trainingGoal: "finish",
      planPurpose: "race",
      totalWeeksOverride: 10,
    },
  },
  {
    slug: "10k-intermediaire",
    name: "10K intermédiaire",
    nameEn: "10K Intermediate",
    description: "Plan de 12 semaines pour performer sur 10K. Travail au seuil et VO2max.",
    descriptionEn: "12-week plan to perform on 10K. Threshold and VO2max work.",
    icon: "Timer",
    tags: ["10k", "intermediate", "pr"],
    config: {
      raceDistance: "10K",
      runnerLevel: "intermediate",
      daysPerWeek: 4,
      longRunDay: 6,
      trainingGoal: "time",
      planPurpose: "race",
      totalWeeksOverride: 12,
    },
  },
  {
    slug: "semi-marathon",
    name: "Semi-marathon",
    nameEn: "Half Marathon",
    description: "Plan de 14 semaines pour le semi-marathon. Sorties longues progressives et travail au seuil.",
    descriptionEn: "14-week half marathon plan. Progressive long runs and threshold work.",
    icon: "Route",
    tags: ["half-marathon", "semi", "intermediate"],
    config: {
      raceDistance: "semi",
      runnerLevel: "intermediate",
      daysPerWeek: 4,
      longRunDay: 6,
      trainingGoal: "time",
      planPurpose: "race",
      totalWeeksOverride: 14,
    },
  },
  {
    slug: "marathon",
    name: "Marathon",
    nameEn: "Marathon",
    description: "Plan de 18 semaines pour le marathon, 5 séances par semaine. Sorties longues progressives et travail à allure spécifique.",
    descriptionEn: "18-week marathon plan, 5 sessions per week. Progressive long runs and race-pace work.",
    icon: "Trophy",
    tags: ["marathon", "intermediate", "long-distance"],
    config: {
      raceDistance: "marathon",
      runnerLevel: "intermediate",
      daysPerWeek: 5,
      longRunDay: 6,
      trainingGoal: "time",
      planPurpose: "race",
      totalWeeksOverride: 18,
    },
  },
  {
    /* Le premier plan tout prêt de trail, l'étagère était vide, et l'étape
       prêt-à-l'emploi du parcours annonçait donc une impasse à un tiers
       des pratiques.

       Trail COURT, et pas 40 km comme le plan de refonte l'écrivait :
       RACE_DISTANCE_META modélise `trail_short` à 30 km et `trail` à 60 km.
       Une étiquette 40 km ne correspondrait à aucune table de volume, de
       phases ou d'affûtage du moteur, ce serait un nombre écrit sur la carte
       et démenti par le contenu. 30 km est aussi la première course de trail
       la plus courante.

       Pas de plan ULTRA tout prêt, et c'est délibéré : 16 à 52 semaines de
       structure écrite à la main là où le générateur assisté couvre déjà
       l'ultra correctement. Une UI honnête qui dit le générateur sait le
       construire vaut mieux qu'un plan bâclé. */
    slug: "trail-court-intermediaire",
    name: "Trail court intermédiaire",
    nameEn: "Short Trail Intermediate",
    description: "Plan de 14 semaines pour un trail de 30 km. Dénivelé, marche en montée et descente technique, en plus du volume.",
    descriptionEn: "14-week plan for a 30 km trail race. Elevation, power hiking and technical descents on top of the volume.",
    icon: "Mountain",
    tags: ["trail", "intermediate", "elevation", "30k"],
    config: {
      raceDistance: "trail_short",
      runnerLevel: "intermediate",
      daysPerWeek: 4,
      longRunDay: 6,
      trainingGoal: "finish",
      planPurpose: "race",
      totalWeeksOverride: 14,
    },
  },
  {
    slug: "base-building",
    name: "Construction de base",
    nameEn: "Base Building",
    description: "Plan de 12 semaines pour construire une base aérobie solide. Pas d'objectif de course.",
    descriptionEn: "12-week plan to build a solid aerobic base. No race target.",
    icon: "TrendingUp",
    tags: ["base", "aerobic", "foundation"],
    config: {
      raceDistance: "10K",
      runnerLevel: "intermediate",
      daysPerWeek: 4,
      longRunDay: 6,
      trainingGoal: "time",
      planPurpose: "base_building",
      totalWeeksOverride: 12,
    },
  },
  {
    slug: "retour-blessure",
    name: "Retour de blessure",
    nameEn: "Return from Injury",
    description: "Plan de 8 semaines pour reprendre progressivement après une blessure ou un arrêt prolongé.",
    descriptionEn: "8-week plan for progressive return after injury or extended break.",
    icon: "Heart",
    tags: ["injury", "return", "progressive", "beginner"],
    config: {
      raceDistance: "5K",
      runnerLevel: "beginner",
      daysPerWeek: 3,
      longRunDay: 6,
      trainingGoal: "finish",
      planPurpose: "return_from_injury",
      totalWeeksOverride: 8,
    },
  },
  {
    slug: "reprise-longue-pause",
    name: "Reprise après longue pause",
    nameEn: "Return After Long Break",
    description: "Plan de 10 semaines pour reprendre après plusieurs mois d'arrêt. Reconstruction progressive de l'endurance et des habitudes de course.",
    descriptionEn: "10-week plan to resume running after months off. Progressive rebuilding of endurance and running habits.",
    icon: "RotateCcw",
    tags: ["return", "break", "progressive", "beginner"],
    config: {
      raceDistance: "10K",
      runnerLevel: "beginner",
      daysPerWeek: 3,
      longRunDay: 6,
      trainingGoal: "finish",
      planPurpose: "beginner_start",
      totalWeeksOverride: 10,
    },
  },
];

// ── Generator ───────────────────────────────────────────────────

async function generatePrebuiltPlan(cfg: PrebuiltConfig): Promise<PrebuiltPlan> {
  // Create a fake race date N weeks from now
  const raceDate = new Date();
  raceDate.setDate(raceDate.getDate() + cfg.config.totalWeeksOverride * 7 + 1);

  const assistedConfig: AssistedPlanConfig = {
    id: cfg.slug,
    raceDistance: cfg.config.raceDistance!,
    raceDate: raceDate.toISOString().split("T")[0],
    runnerLevel: cfg.config.runnerLevel!,
    daysPerWeek: cfg.config.daysPerWeek,
    longRunDay: cfg.config.longRunDay!,
    trainingGoal: cfg.config.trainingGoal,
    planPurpose: cfg.config.planPurpose,
    totalWeeksOverride: cfg.config.totalWeeksOverride,
    createdAt: new Date().toISOString(),
    // Strength was hand-patched into the generated files once and would be
    // wiped by any regeneration. Frequency is set so the week keeps two full
    // rest days: strength claims rest days before easy days.
    includeStrength: true,
    strengthFrequency: cfg.config.daysPerWeek <= 3 ? 2 : 1,
  };

  const plan = await generatePlan(assistedConfig);

  return {
    id: cfg.slug,
    slug: cfg.slug,
    name: cfg.name,
    nameEn: cfg.nameEn,
    description: cfg.description,
    descriptionEn: cfg.descriptionEn,
    icon: cfg.icon,
    difficulty: cfg.config.runnerLevel!,
    raceDistance: cfg.config.raceDistance,
    sessionsPerWeek: cfg.config.daysPerWeek,
    totalWeeks: plan.totalWeeks,
    phases: plan.phases,
    weeks: plan.weeks,
    tags: cfg.tags,
    version: 2,
    planPurpose: cfg.config.planPurpose,
    trainingGoal: cfg.config.trainingGoal,
    peakWeeklyKm: plan.peakWeeklyKm,
    peakLongRunKm: plan.peakLongRunKm,
  };
}

function planToTypeScript(plan: PrebuiltPlan, varName: string): string {
  const json = JSON.stringify(plan, null, 2);
  return `import type { PrebuiltPlan } from "../types";\n\nexport const ${varName}: PrebuiltPlan = ${json};\n`;
}

// ── Main ────────────────────────────────────────────────────────

/**
 * Sans argument, le script régénère les onze plans. Avec un ou plusieurs
 * slugs, il ne régénère que ceux-là.
 *
 * Ce filtre n'est pas un confort : `raceDate` et `createdAt` sont calculés
 * depuis AUJOURD'HUI, et `planSeedFromConfig` les fait entrer dans le choix
 * des séances. Relancer le script en entier pour ajouter un plan réécrit donc
 * les dix autres fichiers avec les dates du jour et un tirage différent, un
 * diff de dix mille lignes sans rapport avec ce qu'on voulait changer.
 *
 *   bun run scripts/regenerate-prebuilt-plans.ts trail-court-intermediaire
 */
async function main() {
  const outDir = path.join(__dirname, "../src/data/prebuilt-plans/plans");
  const only = new Set(process.argv.slice(2).filter((a) => !a.startsWith("-")));
  const selected = only.size
    ? PREBUILT_CONFIGS.filter((c) => only.has(c.slug))
    : PREBUILT_CONFIGS;

  const unknown = [...only].filter((slug) => !PREBUILT_CONFIGS.some((c) => c.slug === slug));
  if (unknown.length) {
    console.error(`Unknown slug(s): ${unknown.join(", ")}`);
    process.exit(1);
  }

  console.log(`Generating ${selected.length} prebuilt plan(s)...\n`);

  for (const cfg of selected) {
    try {
      const plan = await generatePrebuiltPlan(cfg);
      const varName = "plan" + cfg.slug
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("");

      const filename = `${cfg.slug}.ts`;
      const content = planToTypeScript(plan, varName);
      fs.writeFileSync(path.join(outDir, filename), content);

      const totalMin = plan.weeks.reduce(
        (sum, w) => sum + w.sessions.reduce((s, sess) => s + sess.estimatedDurationMin, 0),
        0,
      );

      console.log(
        `  ✓ ${cfg.slug}: ${plan.totalWeeks}w ${plan.weeks.reduce((s, w) => s + w.sessions.length, 0)} sessions ` +
        `${Math.round(totalMin / 60)}h | peak ${plan.peakWeeklyKm}km/w SL ${plan.peakLongRunKm}km`,
      );
    } catch (err) {
      console.error(`  ✗ ${cfg.slug}: ${err}`);
    }
  }

  console.log("\nDone! Update index.ts if slugs changed.");
}

main().catch(console.error);

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
    description: "Plan de 18 semaines pour le marathon. Basé sur Pfitzinger avec sorties longues progressives.",
    descriptionEn: "18-week marathon plan. Pfitzinger-based with progressive long runs.",
    icon: "Trophy",
    tags: ["marathon", "intermediate", "long-distance"],
    config: {
      raceDistance: "marathon",
      runnerLevel: "intermediate",
      daysPerWeek: 4,
      longRunDay: 6,
      trainingGoal: "time",
      planPurpose: "race",
      totalWeeksOverride: 18,
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

async function main() {
  const outDir = path.join(__dirname, "../src/data/prebuilt-plans/plans");

  console.log(`Generating ${PREBUILT_CONFIGS.length} prebuilt plans...\n`);

  for (const cfg of PREBUILT_CONFIGS) {
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

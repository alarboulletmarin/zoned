import type {
  ThemeCard,
  DosageChip,
  CaffeineStep,
  RaceWeekDay,
  SupplementEntry,
  CarbsRow,
  ProteinDose,
  GutTrainingPhase,
  MythCard,
  WomenInsight,
  HeatProtocol,
  RatioComparison,
} from "./types";

export const themes: ThemeCard[] = [
  { id: "daily",        iconName: "Utensils",   accent: "primary", titleKey: "hub.themes.daily.title",       taglineKey: "hub.themes.daily.tagline" },
  { id: "carbs",        iconName: "Wheat",      accent: "amber",   titleKey: "hub.themes.carbs.title",       taglineKey: "hub.themes.carbs.tagline" },
  { id: "protein",      iconName: "Activity",   accent: "rose",    titleKey: "hub.themes.protein.title",     taglineKey: "hub.themes.protein.tagline" },
  { id: "caffeine",     iconName: "Coffee",     accent: "amber",   titleKey: "hub.themes.caffeine.title",    taglineKey: "hub.themes.caffeine.tagline" },
  { id: "hydration",    iconName: "Droplets",   accent: "blue",    titleKey: "hub.themes.hydration.title",   taglineKey: "hub.themes.hydration.tagline" },
  { id: "race-week",    iconName: "Flag",       accent: "rose",    titleKey: "hub.themes.raceWeek.title",    taglineKey: "hub.themes.raceWeek.tagline" },
  { id: "before",       iconName: "Clock",      accent: "primary", titleKey: "hub.themes.before.title",      taglineKey: "hub.themes.before.tagline" },
  { id: "during",       iconName: "Zap",        accent: "amber",   titleKey: "hub.themes.during.title",      taglineKey: "hub.themes.during.tagline" },
  { id: "recovery",     iconName: "HeartPulse", accent: "green",   titleKey: "hub.themes.recovery.title",    taglineKey: "hub.themes.recovery.tagline" },
  { id: "supplements",  iconName: "Pill",       accent: "violet",  titleKey: "hub.themes.supplements.title", taglineKey: "hub.themes.supplements.tagline" },
  { id: "cramps",       iconName: "Zap",        accent: "orange",  titleKey: "hub.themes.cramps.title",      taglineKey: "hub.themes.cramps.tagline" },
  { id: "heat",         iconName: "Flame",      accent: "rose",    titleKey: "hub.themes.heat.title",        taglineKey: "hub.themes.heat.tagline" },
  { id: "women",        iconName: "Sparkles",   accent: "violet",  titleKey: "hub.themes.women.title",       taglineKey: "hub.themes.women.tagline" },
  { id: "myths",        iconName: "AlertTriangle", accent: "slate", titleKey: "hub.themes.myths.title",      taglineKey: "hub.themes.myths.tagline" },
];

export const dailyChips: DosageChip[] = [
  { labelKey: "hub.daily.chips.carbs.label",   valueKey: "hub.daily.chips.carbs.value",   helperKey: "hub.daily.chips.carbs.helper" },
  { labelKey: "hub.daily.chips.protein.label", valueKey: "hub.daily.chips.protein.value", helperKey: "hub.daily.chips.protein.helper" },
  { labelKey: "hub.daily.chips.fat.label",     valueKey: "hub.daily.chips.fat.value",     helperKey: "hub.daily.chips.fat.helper" },
  { labelKey: "hub.daily.chips.water.label",   valueKey: "hub.daily.chips.water.value",   helperKey: "hub.daily.chips.water.helper" },
];

export const beforeChips: DosageChip[] = [
  { labelKey: "hub.before.chips.t3h.label",    valueKey: "hub.before.chips.t3h.value",    helperKey: "hub.before.chips.t3h.helper" },
  { labelKey: "hub.before.chips.t1h.label",    valueKey: "hub.before.chips.t1h.value",    helperKey: "hub.before.chips.t1h.helper" },
  { labelKey: "hub.before.chips.t15min.label", valueKey: "hub.before.chips.t15min.value", helperKey: "hub.before.chips.t15min.helper" },
];

export const caffeineSteps: CaffeineStep[] = [
  { timeLabelKey: "hub.caffeine.steps.t90.label", actionKey: "hub.caffeine.steps.t90.action" },
  { timeLabelKey: "hub.caffeine.steps.t60.label", actionKey: "hub.caffeine.steps.t60.action" },
  { timeLabelKey: "hub.caffeine.steps.t30.label", actionKey: "hub.caffeine.steps.t30.action" },
  { timeLabelKey: "hub.caffeine.steps.t0.label",  actionKey: "hub.caffeine.steps.t0.action" },
];

export const raceWeek: RaceWeekDay[] = [
  { day: "j7", iconName: "Calendar", titleKey: "hub.raceWeek.j7.title", detailKey: "hub.raceWeek.j7.detail" },
  { day: "j6", iconName: "Calendar", titleKey: "hub.raceWeek.j6.title", detailKey: "hub.raceWeek.j6.detail" },
  { day: "j5", iconName: "Calendar", titleKey: "hub.raceWeek.j5.title", detailKey: "hub.raceWeek.j5.detail" },
  { day: "j4", iconName: "Calendar", titleKey: "hub.raceWeek.j4.title", detailKey: "hub.raceWeek.j4.detail" },
  { day: "j3", iconName: "Wheat",    titleKey: "hub.raceWeek.j3.title", detailKey: "hub.raceWeek.j3.detail" },
  { day: "j2", iconName: "Wheat",    titleKey: "hub.raceWeek.j2.title", detailKey: "hub.raceWeek.j2.detail" },
  { day: "j1", iconName: "Droplets", titleKey: "hub.raceWeek.j1.title", detailKey: "hub.raceWeek.j1.detail" },
  { day: "j0", iconName: "Flag",     titleKey: "hub.raceWeek.j0.title", detailKey: "hub.raceWeek.j0.detail" },
];

/** Suppléments classés selon le framework AIS (Australian Institute of Sport). */
export const supplements: SupplementEntry[] = [
  // Group A — preuves solides
  { id: "caffeine",    iconName: "Coffee", aisCategory: "A", verdict: "proven", nameKey: "hub.supplements.caffeine.name",    doseKey: "hub.supplements.caffeine.dose",    whenKey: "hub.supplements.caffeine.when",    rationaleKey: "hub.supplements.caffeine.rationale",    glossaryTermId: "cafeine" },
  { id: "creatine",    iconName: "Pill",   aisCategory: "A", verdict: "proven", nameKey: "hub.supplements.creatine.name",    doseKey: "hub.supplements.creatine.dose",    whenKey: "hub.supplements.creatine.when",    rationaleKey: "hub.supplements.creatine.rationale" },
  { id: "bicarbonate", iconName: "Pill",   aisCategory: "A", verdict: "proven", nameKey: "hub.supplements.bicarbonate.name", doseKey: "hub.supplements.bicarbonate.dose", whenKey: "hub.supplements.bicarbonate.when", rationaleKey: "hub.supplements.bicarbonate.rationale" },
  { id: "betaalanine", iconName: "Pill",   aisCategory: "A", verdict: "proven", nameKey: "hub.supplements.betaalanine.name", doseKey: "hub.supplements.betaalanine.dose", whenKey: "hub.supplements.betaalanine.when", rationaleKey: "hub.supplements.betaalanine.rationale" },
  { id: "beetroot",    iconName: "Leaf",   aisCategory: "A", verdict: "proven", nameKey: "hub.supplements.beetroot.name",    doseKey: "hub.supplements.beetroot.dose",    whenKey: "hub.supplements.beetroot.when",    rationaleKey: "hub.supplements.beetroot.rationale" },

  // Group B — preuves modérées
  { id: "collagen",    iconName: "Shield", aisCategory: "B", verdict: "conditional", nameKey: "hub.supplements.collagen.name",    doseKey: "hub.supplements.collagen.dose",    whenKey: "hub.supplements.collagen.when",    rationaleKey: "hub.supplements.collagen.rationale" },
  { id: "tartcherry",  iconName: "Leaf",   aisCategory: "B", verdict: "conditional", nameKey: "hub.supplements.tartcherry.name",  doseKey: "hub.supplements.tartcherry.dose",  whenKey: "hub.supplements.tartcherry.when",  rationaleKey: "hub.supplements.tartcherry.rationale" },
  { id: "curcumin",    iconName: "Sparkles", aisCategory: "B", verdict: "conditional", nameKey: "hub.supplements.curcumin.name",  doseKey: "hub.supplements.curcumin.dose",    whenKey: "hub.supplements.curcumin.when",    rationaleKey: "hub.supplements.curcumin.rationale" },
  { id: "probiotics",  iconName: "Shield", aisCategory: "B", verdict: "conditional", nameKey: "hub.supplements.probiotics.name",  doseKey: "hub.supplements.probiotics.dose",  whenKey: "hub.supplements.probiotics.when",  rationaleKey: "hub.supplements.probiotics.rationale" },
  { id: "omega3",      iconName: "Leaf",   aisCategory: "B", verdict: "conditional", nameKey: "hub.supplements.omega3.name",      doseKey: "hub.supplements.omega3.dose",      whenKey: "hub.supplements.omega3.when",      rationaleKey: "hub.supplements.omega3.rationale" },

  // Micronutriments — utiles si carence
  { id: "vitD",        iconName: "Sun",    aisCategory: "B", verdict: "conditional", nameKey: "hub.supplements.vitD.name",        doseKey: "hub.supplements.vitD.dose",        whenKey: "hub.supplements.vitD.when",        rationaleKey: "hub.supplements.vitD.rationale", glossaryTermId: "vitamine-d" },
  { id: "iron",        iconName: "Pill",   aisCategory: "B", verdict: "conditional", nameKey: "hub.supplements.iron.name",        doseKey: "hub.supplements.iron.dose",        whenKey: "hub.supplements.iron.when",        rationaleKey: "hub.supplements.iron.rationale", glossaryTermId: "fer-coureur" },
  { id: "magnesium",   iconName: "Pill",   aisCategory: "C", verdict: "conditional", nameKey: "hub.supplements.magnesium.name",   doseKey: "hub.supplements.magnesium.dose",   whenKey: "hub.supplements.magnesium.when",   rationaleKey: "hub.supplements.magnesium.rationale" },

  // Group D — marketing / preuves faibles
  { id: "bcaa",        iconName: "Pill",   aisCategory: "D", verdict: "marketing", nameKey: "hub.supplements.bcaa.name",        doseKey: "hub.supplements.bcaa.dose",        whenKey: "hub.supplements.bcaa.when",        rationaleKey: "hub.supplements.bcaa.rationale", glossaryTermId: "bcaa" },
  { id: "lcarnitine",  iconName: "Pill",   aisCategory: "D", verdict: "marketing", nameKey: "hub.supplements.lcarnitine.name",  doseKey: "hub.supplements.lcarnitine.dose",  whenKey: "hub.supplements.lcarnitine.when",  rationaleKey: "hub.supplements.lcarnitine.rationale" },
  { id: "ketones",     iconName: "Pill",   aisCategory: "D", verdict: "marketing", nameKey: "hub.supplements.ketones.name",     doseKey: "hub.supplements.ketones.dose",     whenKey: "hub.supplements.ketones.when",     rationaleKey: "hub.supplements.ketones.rationale" },
  { id: "antioxidants",iconName: "AlertTriangle", aisCategory: "D", verdict: "marketing", nameKey: "hub.supplements.antioxidants.name", doseKey: "hub.supplements.antioxidants.dose", whenKey: "hub.supplements.antioxidants.when", rationaleKey: "hub.supplements.antioxidants.rationale" },
];

/** Glucides par durée d'effort, avec ratio glucose:fructose recommandé. */
export const carbsPerHourRows: CarbsRow[] = [
  { distanceKey: "hub.during.rows.short.distance",    carbsPerHour: "0-30",  ratioKey: "hub.during.rows.short.ratio",    totalKey: "hub.during.rows.short.total" },
  { distanceKey: "hub.during.rows.tenK.distance",     carbsPerHour: "30-60", ratioKey: "hub.during.rows.tenK.ratio",     totalKey: "hub.during.rows.tenK.total" },
  { distanceKey: "hub.during.rows.semi.distance",     carbsPerHour: "60-90", ratioKey: "hub.during.rows.semi.ratio",     totalKey: "hub.during.rows.semi.total" },
  { distanceKey: "hub.during.rows.marathon.distance", carbsPerHour: "90",    ratioKey: "hub.during.rows.marathon.ratio", totalKey: "hub.during.rows.marathon.total" },
  { distanceKey: "hub.during.rows.elite.distance",    carbsPerHour: "120",   ratioKey: "hub.during.rows.elite.ratio",    totalKey: "hub.during.rows.elite.total" },
  { distanceKey: "hub.during.rows.ultra.distance",    carbsPerHour: "60-90", ratioKey: "hub.during.rows.ultra.ratio",    totalKey: "hub.during.rows.ultra.total" },
];

/** Visualisation du ratio glucose:fructose : pourquoi 1:0.8 surperforme à haute dose. */
export const carbRatios: RatioComparison[] = [
  { ratio: "1:0",   labelKey: "hub.carbs.ratios.glucose.label",  capacityKey: "hub.carbs.ratios.glucose.capacity",  highlight: false },
  { ratio: "2:1",   labelKey: "hub.carbs.ratios.classic.label",  capacityKey: "hub.carbs.ratios.classic.capacity",  highlight: false },
  { ratio: "1:0.8", labelKey: "hub.carbs.ratios.modern.label",   capacityKey: "hub.carbs.ratios.modern.capacity",   highlight: true },
];

/** Cibles protéiques 2025 (Witard, Sports Medicine, juin 2025). */
export const proteinTargets: ProteinDose[] = [
  { profileKey: "hub.protein.targets.amateur.profile", hoursPerWeekKey: "hub.protein.targets.amateur.hours", targetKey: "hub.protein.targets.amateur.target", helperKey: "hub.protein.targets.amateur.helper" },
  { profileKey: "hub.protein.targets.serious.profile", hoursPerWeekKey: "hub.protein.targets.serious.hours", targetKey: "hub.protein.targets.serious.target", helperKey: "hub.protein.targets.serious.helper" },
  { profileKey: "hub.protein.targets.elite.profile",   hoursPerWeekKey: "hub.protein.targets.elite.hours",   targetKey: "hub.protein.targets.elite.target",   helperKey: "hub.protein.targets.elite.helper" },
  { profileKey: "hub.protein.targets.ultra.profile",   hoursPerWeekKey: "hub.protein.targets.ultra.hours",   targetKey: "hub.protein.targets.ultra.target",   helperKey: "hub.protein.targets.ultra.helper" },
];

/** Distribution journalière des protéines (Areta 2013, Trommelen 2023). */
export const proteinTimeline: DosageChip[] = [
  { labelKey: "hub.protein.timeline.morning.label",  valueKey: "hub.protein.timeline.morning.value",  helperKey: "hub.protein.timeline.morning.helper" },
  { labelKey: "hub.protein.timeline.lunch.label",    valueKey: "hub.protein.timeline.lunch.value",    helperKey: "hub.protein.timeline.lunch.helper" },
  { labelKey: "hub.protein.timeline.snack.label",    valueKey: "hub.protein.timeline.snack.value",    helperKey: "hub.protein.timeline.snack.helper" },
  { labelKey: "hub.protein.timeline.dinner.label",   valueKey: "hub.protein.timeline.dinner.value",   helperKey: "hub.protein.timeline.dinner.helper" },
  { labelKey: "hub.protein.timeline.bedtime.label",  valueKey: "hub.protein.timeline.bedtime.value",  helperKey: "hub.protein.timeline.bedtime.helper" },
];

/** Train your gut — protocole de 6 à 12 semaines. */
export const gutTraining: GutTrainingPhase[] = [
  { weekRangeKey: "hub.during.gut.phase1.weeks", carbsPerHour: "30",  detailKey: "hub.during.gut.phase1.detail" },
  { weekRangeKey: "hub.during.gut.phase2.weeks", carbsPerHour: "60",  detailKey: "hub.during.gut.phase2.detail" },
  { weekRangeKey: "hub.during.gut.phase3.weeks", carbsPerHour: "90",  detailKey: "hub.during.gut.phase3.detail" },
  { weekRangeKey: "hub.during.gut.phase4.weeks", carbsPerHour: "120", detailKey: "hub.during.gut.phase4.detail" },
];

/** Anti-mythes courants (basés sur méta-analyses 2020-2025). */
export const myths: MythCard[] = [
  { id: "window30",   mythKey: "hub.myths.window30.myth",   truthKey: "hub.myths.window30.truth",   sourceKey: "hub.myths.window30.source" },
  { id: "ratio4to1",  mythKey: "hub.myths.ratio4to1.myth",  truthKey: "hub.myths.ratio4to1.truth",  sourceKey: "hub.myths.ratio4to1.source" },
  { id: "magnesium",  mythKey: "hub.myths.magnesium.myth",  truthKey: "hub.myths.magnesium.truth",  sourceKey: "hub.myths.magnesium.source" },
  { id: "coffee",     mythKey: "hub.myths.coffee.myth",     truthKey: "hub.myths.coffee.truth",     sourceKey: "hub.myths.coffee.source" },
  { id: "thirst",     mythKey: "hub.myths.thirst.myth",     truthKey: "hub.myths.thirst.truth",     sourceKey: "hub.myths.thirst.source" },
  { id: "creatine",   mythKey: "hub.myths.creatine.myth",   truthKey: "hub.myths.creatine.truth",   sourceKey: "hub.myths.creatine.source" },
  { id: "bcaa",       mythKey: "hub.myths.bcaa.myth",       truthKey: "hub.myths.bcaa.truth",       sourceKey: "hub.myths.bcaa.source" },
  { id: "carbload3d", mythKey: "hub.myths.carbload3d.myth", truthKey: "hub.myths.carbload3d.truth", sourceKey: "hub.myths.carbload3d.source" },
  { id: "drinkmore",  mythKey: "hub.myths.drinkmore.myth",  truthKey: "hub.myths.drinkmore.truth",  sourceKey: "hub.myths.drinkmore.source" },
  { id: "antiox",     mythKey: "hub.myths.antiox.myth",     truthKey: "hub.myths.antiox.truth",     sourceKey: "hub.myths.antiox.source" },
];

/** Coureuse — besoins spécifiques (RED-S, Sims 2024, IOC 2023). */
export const womenInsights: WomenInsight[] = [
  { iconName: "Pill",      titleKey: "hub.women.iron.title",     detailKey: "hub.women.iron.detail" },
  { iconName: "Activity",  titleKey: "hub.women.protein.title",  detailKey: "hub.women.protein.detail" },
  { iconName: "Shield",    titleKey: "hub.women.calcium.title",  detailKey: "hub.women.calcium.detail" },
  { iconName: "AlertTriangle", titleKey: "hub.women.reds.title", detailKey: "hub.women.reds.detail" },
];

/** Acclimatation chaleur — protocoles validés 2024. */
export const heatProtocols: HeatProtocol[] = [
  { iconName: "Flame",      titleKey: "hub.heat.sauna.title",      durationKey: "hub.heat.sauna.duration",      detailKey: "hub.heat.sauna.detail" },
  { iconName: "Droplets",   titleKey: "hub.heat.bath.title",       durationKey: "hub.heat.bath.duration",       detailKey: "hub.heat.bath.detail" },
  { iconName: "Snowflake",  titleKey: "hub.heat.icySlush.title",   durationKey: "hub.heat.icySlush.duration",   detailKey: "hub.heat.icySlush.detail" },
  { iconName: "Mountain",   titleKey: "hub.heat.altitude.title",   durationKey: "hub.heat.altitude.duration",   detailKey: "hub.heat.altitude.detail" },
];

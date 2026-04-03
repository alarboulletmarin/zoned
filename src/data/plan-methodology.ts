/**
 * Plan Methodology — The 7 principles behind Zoned's plan generation
 *
 * Each principle maps directly to real values from the plan generator.
 * Content is bilingual (French-first, English second).
 */

export interface PlanPrinciple {
  id: string;
  icon: string;
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  details: string;
  detailsEn: string;
  rules: Array<{ text: string; textEn: string }>;
  references?: Array<{ author: string; year: number; title: string }>;
  relatedArticle?: string;
}

export const PLAN_PRINCIPLES: PlanPrinciple[] = [
  // ── 1. Periodization: Base -> Build -> Peak -> Taper ────────────
  {
    id: "phases",
    icon: "Calendar",
    title: "Périodisation en 4 phases",
    titleEn: "4-Phase Periodization",
    summary:
      "Ton plan est découpé en 4 phases progressives : Base, Build, Peak et Taper. Chaque phase a un objectif précis.",
    summaryEn:
      "Your plan is split into 4 progressive phases: Base, Build, Peak and Taper. Each phase has a specific purpose.",
    details:
      "La périodisation n'est pas arbitraire : elle suit le modèle de Daniels (Phases I-IV) adapté à chaque distance. Un plan 5K consacre 30% à la base et 25% au pic, tandis qu'un plan ultra passe 50% en base et seulement 10% au pic. Les plans courts (< 12 semaines) compriment la base de 8% pour maximiser le travail qualitatif. Les plans longs (> 18 semaines) plafonnent la base à 12 semaines absolues et redistribuent le surplus vers build (60%) et peak (40%).",
    detailsEn:
      "Periodization is not arbitrary: it follows the Daniels model (Phases I-IV) adapted to each distance. A 5K plan dedicates 30% to base and 25% to peak, while an ultra plan spends 50% in base and only 10% in peak. Short plans (< 12 weeks) compress base by 8% to maximize quality work. Long plans (> 18 weeks) cap base at 12 weeks absolute and redistribute the surplus toward build (60%) and peak (40%).",
    rules: [
      {
        text: "5K : Base 30% | Build 30% | Peak 25% | Taper 1 sem.",
        textEn: "5K: Base 30% | Build 30% | Peak 25% | Taper 1 wk",
      },
      {
        text: "10K / Semi : Base 35% | Build 30% | Peak 20% | Taper 2 sem.",
        textEn: "10K / Half: Base 35% | Build 30% | Peak 20% | Taper 2 wks",
      },
      {
        text: "Marathon : Base 40% | Build 30% | Peak 15% | Taper 3 sem.",
        textEn: "Marathon: Base 40% | Build 30% | Peak 15% | Taper 3 wks",
      },
      {
        text: "Ultra : Base 50% | Build 30% | Peak 10% | Taper 3 sem.",
        textEn: "Ultra: Base 50% | Build 30% | Peak 10% | Taper 3 wks",
      },
      {
        text: "Plans courts (< 12 sem.) : base réduite de 8% au profit du build/peak",
        textEn: "Short plans (< 12 wks): base reduced by 8% in favor of build/peak",
      },
    ],
    references: [
      { author: "Daniels, J.", year: 2014, title: "Daniels' Running Formula, 3rd ed." },
      { author: "Pfitzinger, P.", year: 2009, title: "Advanced Marathoning, 2nd ed." },
      { author: "Lydiard, A.", year: 1962, title: "Sequential periodization model" },
    ],
    relatedArticle: "periodization",
  },

  // ── 2. Polarized Training (80/20) ──────────────────────────────
  {
    id: "polarized",
    icon: "Activity",
    title: "Entraînement polarisé (80/20)",
    titleEn: "Polarized Training (80/20)",
    summary:
      "Au moins 75% de tes séances sont en zone facile (Z1-Z2). Le travail intense ne dépasse jamais 25%. Courir lentement pour progresser vite.",
    summaryEn:
      "At least 75% of your sessions are at easy pace (Z1-Z2). Hard work never exceeds 25%. Run slow to get fast.",
    details:
      "Les recherches de Seiler montrent que les athlètes d'endurance d'élite passent 75 à 80% de leur temps en zones basses. Zoned applique ce principe avec un seuil minimum de 75% de séances faciles et un maximum de 25% de séances intenses. La distribution des slots varie selon le nombre de jours : avec 3 jours, tu as 1 séance clé + 1 sortie longue + 1 easy. Avec 5 jours, 2 séances clés + 1 sortie longue + 2 easy. L'objectif « finir » pousse vers un split 85/15 encore plus conservateur, tandis que « performer » autorise un 75/25 pyramidal.",
    detailsEn:
      "Seiler's research shows that elite endurance athletes spend 75-80% of their time in low zones. Zoned applies this principle with a minimum threshold of 75% easy sessions and a maximum of 25% hard sessions. Slot distribution varies by number of days: with 3 days you get 1 key session + 1 long run + 1 easy. With 5 days, 2 key sessions + 1 long run + 2 easy. The \"finish\" goal pushes toward an even more conservative 85/15 split, while \"compete\" allows a pyramidal 75/25.",
    rules: [
      {
        text: "Minimum 75% de séances en zone facile (Z1-Z2)",
        textEn: "Minimum 75% of sessions at easy pace (Z1-Z2)",
      },
      {
        text: "Maximum 25% de séances intenses (Z4+)",
        textEn: "Maximum 25% of hard sessions (Z4+)",
      },
      {
        text: "3 jours/sem. : 1 clé + 1 sortie longue + 1 easy",
        textEn: "3 days/wk: 1 key + 1 long run + 1 easy",
      },
      {
        text: "5 jours/sem. : 2 clés + 1 sortie longue + 2 easy",
        textEn: "5 days/wk: 2 key + 1 long run + 2 easy",
      },
      {
        text: "7 jours/sem. : 2 clés + 1 sortie longue + 3 easy + 1 récup",
        textEn: "7 days/wk: 2 key + 1 long run + 3 easy + 1 recovery",
      },
    ],
    references: [
      { author: "Seiler, S.", year: 2010, title: "What is best practice for training intensity and duration distribution in endurance athletes?" },
      { author: "Stöggl, T. & Sperlich, B.", year: 2014, title: "Polarized training has greater impact than threshold training on endurance" },
    ],
    relatedArticle: "polarized-training",
  },

  // ── 3. Recovery Weeks ──────────────────────────────────────────
  {
    id: "recovery-weeks",
    icon: "RefreshCw",
    title: "Semaines de récupération intelligentes",
    titleEn: "Smart Recovery Weeks",
    summary:
      "Pas de rythme fixe « 1 semaine sur 4 ». La récupération arrive après 3 semaines de charge consécutives, quand ton corps en a vraiment besoin.",
    summaryEn:
      "No fixed \"every 4th week\" pattern. Recovery comes after 3 consecutive load weeks, when your body actually needs it.",
    details:
      "Beaucoup de plans imposent une semaine de récupération toutes les 4 semaines, même quand la charge était faible. Zoned utilise un système basé sur la charge réelle : la récupération se déclenche après 3 semaines de charge consécutives (MAX_CONSECUTIVE_LOAD_WEEKS = 3). Le volume tombe à 65% de la semaine précédente. Une récupération de transition est aussi insérée automatiquement avant la phase peak pour arriver frais au travail spécifique. L'objectif « finir » abaisse la fréquence à toutes les 3 semaines pour plus de prudence.",
    detailsEn:
      "Many plans force a recovery week every 4 weeks, even when the load was low. Zoned uses a load-based system: recovery triggers after 3 consecutive load weeks (MAX_CONSECUTIVE_LOAD_WEEKS = 3). Volume drops to 65% of the previous week. A transition recovery is also automatically inserted before the peak phase to arrive fresh for specific work. The \"finish\" goal lowers the frequency to every 3 weeks for extra caution.",
    rules: [
      {
        text: "Récupération après 3 semaines de charge consécutives",
        textEn: "Recovery after 3 consecutive load weeks",
      },
      {
        text: "Volume à 65% de la semaine précédente (pas 60%, moins agressif)",
        textEn: "Volume at 65% of the previous week (not 60%, less aggressive)",
      },
      {
        text: "Récupération de transition automatique avant la phase peak",
        textEn: "Automatic transition recovery before the peak phase",
      },
      {
        text: "Séances clés remplacées par du facile pendant les semaines de récup",
        textEn: "Key sessions replaced with easy during recovery weeks",
      },
    ],
    references: [
      { author: "Pfitzinger, P.", year: 2009, title: "Advanced Marathoning: mesocycle 3:1 structure" },
      { author: "Gabbett, T.", year: 2016, title: "The training-injury prevention paradox" },
    ],
  },

  // ── 4. Volume Progression ──────────────────────────────────────
  {
    id: "volume",
    icon: "TrendingUp",
    title: "Progression de volume contrôlée",
    titleEn: "Controlled Volume Progression",
    summary:
      "Jamais plus de +10% de volume par semaine. La règle d'or pour progresser sans se blesser.",
    summaryEn:
      "Never more than +10% volume per week. The golden rule for progressing without injury.",
    details:
      "Le générateur calcule des cibles en km réels basées sur ta distance et ton niveau (par ex. un marathonien intermédiaire passe de 55 km/sem. à un pic de 90 km/sem.). La progression respecte strictement la limite de +10% par semaine. Quand le volume atteint 95% du pic, le plan entre en mode « ondulation » : il alterne entre 100% et 93% pour éviter la monotonie et la fatigue cumulée. Le volume de départ est adapté à la durée du plan : 85% pour les plans courts (8-11 sem.), 70% pour les moyens (12-17 sem.), 60% pour les longs (18+ sem.).",
    detailsEn:
      "The generator calculates real km targets based on your distance and level (e.g., an intermediate marathoner goes from 55 km/wk to a peak of 90 km/wk). Progression strictly respects the +10% per week limit. When volume reaches 95% of peak, the plan enters \"undulation\" mode: it alternates between 100% and 93% to avoid monotony and accumulated fatigue. Starting volume adapts to plan duration: 85% for short plans (8-11 wks), 70% for medium (12-17 wks), 60% for long (18+ wks).",
    rules: [
      {
        text: "Maximum +10% de volume hebdomadaire (MAX_WEEKLY_VOLUME_INCREASE)",
        textEn: "Maximum +10% weekly volume increase (MAX_WEEKLY_VOLUME_INCREASE)",
      },
      {
        text: "Ondulation au plateau : alternance 100% / 93% quand volume ≥ 95% du pic",
        textEn: "Plateau undulation: alternating 100% / 93% when volume >= 95% of peak",
      },
      {
        text: "Objectif « finir » : volume réduit de 15% | « performer » : +12%",
        textEn: "Goal \"finish\": volume reduced by 15% | \"compete\": +12%",
      },
      {
        text: "Volume de départ : 85% (court), 70% (moyen), 60% (long)",
        textEn: "Starting volume: 85% (short), 70% (medium), 60% (long)",
      },
    ],
    references: [
      { author: "Gabbett, T.", year: 2016, title: "The training-injury prevention paradox: acute:chronic workload ratio" },
      { author: "Pfitzinger, P.", year: 2009, title: "Advanced Marathoning, 2nd ed." },
    ],
    relatedArticle: "progressive-overload",
  },

  // ── 5. Long Run Progression ────────────────────────────────────
  {
    id: "long-run",
    icon: "Route",
    title: "Sortie longue progressive",
    titleEn: "Progressive Long Run",
    summary:
      "Un cycle de 3 semaines : 2 semaines de montée + 1 step-back à 85%. Le pic arrive 3-4 semaines avant la course, pas avant.",
    summaryEn:
      "A 3-week cycle: 2 build weeks + 1 step-back at 85%. Peak arrives 3-4 weeks before the race, not earlier.",
    details:
      "La sortie longue suit un schéma de step-back toutes les 3 semaines : 2 semaines de construction (+ incrément) puis 1 semaine à 85% du volume précédent. Après le step-back, la reprise se fait au même niveau qu'avant la réduction, pas un saut brutal. L'incrément est calibré pour atteindre le pic exactement au bon moment, pas trop tôt. Chaque distance a un plafond absolu : 15 km pour le 5K, 24 km pour le semi, 35 km pour le marathon, 50 km pour l'ultra. Le pic se situe 2 semaines avant la course pour un 5K/10K, 3 semaines pour un semi, et 4 semaines pour un marathon/ultra.",
    detailsEn:
      "The long run follows a 3-week step-back pattern: 2 build weeks (+ increment) then 1 week at 85% of previous volume. After the step-back, resumption is at the same level as before the reduction, not a brutal jump. The increment is calibrated to reach peak at exactly the right time, not too early. Each distance has an absolute cap: 15 km for 5K, 24 km for half, 35 km for marathon, 50 km for ultra. Peak is 2 weeks before the race for 5K/10K, 3 weeks for half, and 4 weeks for marathon/ultra.",
    rules: [
      {
        text: "Cycle 3 semaines : montée, montée, step-back à 85%",
        textEn: "3-week cycle: build, build, step-back at 85%",
      },
      {
        text: "Plafonds : 15 km (5K), 20 km (10K), 24 km (semi), 35 km (marathon), 50 km (ultra)",
        textEn: "Caps: 15 km (5K), 20 km (10K), 24 km (half), 35 km (marathon), 50 km (ultra)",
      },
      {
        text: "Pic 2-4 semaines avant la course selon la distance",
        textEn: "Peak 2-4 weeks before race depending on distance",
      },
      {
        text: "Reprise post step-back au même niveau, pas de saut brutal (cap +3 km)",
        textEn: "Post step-back resumption at same level, no brutal jump (capped at +3 km)",
      },
    ],
    references: [
      { author: "Pfitzinger, P.", year: 2009, title: "Advanced Marathoning: long run progression model" },
      { author: "Daniels, J.", year: 2014, title: "Daniels' Running Formula, 3rd ed." },
    ],
  },

  // ── 6. Session Types per Phase ─────────────────────────────────
  {
    id: "session-types",
    icon: "Dumbbell",
    title: "Séances adaptées à chaque phase",
    titleEn: "Phase-Specific Session Types",
    summary:
      "Base = fartlek et côtes. Build = VO2max et seuil. Peak = allure spécifique et tempo. Chaque phase cible les qualités qui comptent à ce moment-là.",
    summaryEn:
      "Base = fartlek and hills. Build = VO2max and threshold. Peak = race pace and tempo. Each phase targets the qualities that matter at that point.",
    details:
      "Le choix des séances clés suit le modèle de Daniels : la phase Base construit les fondations aérobies avec du fartlek, des côtes et de l'endurance. La phase Build introduit le vrai travail qualitatif : intervalles VO2max, seuil, côtes et fartlek structuré. La phase Peak affine avec du seuil, de l'allure spécifique et du tempo. Le Taper ne garde que l'allure spécifique et le tempo à volume réduit. Les séances clés sont espacées au maximum des sorties longues pour éviter l'accumulation de fatigue.",
    detailsEn:
      "Key session selection follows Daniels' model: the Base phase builds aerobic foundations with fartlek, hills and endurance. The Build phase introduces real quality work: VO2max intervals, threshold, hills and structured fartlek. The Peak phase refines with threshold, race pace and tempo. The Taper keeps only race-specific and tempo at reduced volume. Key sessions are spaced as far as possible from long runs to avoid fatigue accumulation.",
    rules: [
      {
        text: "Base : fartlek, côtes, endurance",
        textEn: "Base: fartlek, hills, endurance",
      },
      {
        text: "Build : VO2max, seuil, côtes, fartlek",
        textEn: "Build: VO2max, threshold, hills, fartlek",
      },
      {
        text: "Peak : seuil, allure spécifique, tempo",
        textEn: "Peak: threshold, race-specific, tempo",
      },
      {
        text: "Taper : allure spécifique, tempo (volume réduit)",
        textEn: "Taper: race-specific, tempo (reduced volume)",
      },
      {
        text: "Séances clés espacées de la sortie longue (espacement circulaire)",
        textEn: "Key sessions spaced away from long run (circular spacing)",
      },
    ],
    references: [
      { author: "Daniels, J.", year: 2014, title: "Daniels' Running Formula: Phases I-IV model" },
    ],
  },

  // ── 7. Exponential Taper ───────────────────────────────────────
  {
    id: "taper",
    icon: "Timer",
    title: "Taper exponentiel",
    titleEn: "Exponential Taper",
    summary:
      "La réduction pré-course suit un modèle exponentiel (pas linéaire). Résultat : tu arrives frais et affûté le jour J.",
    summaryEn:
      "The pre-race reduction follows an exponential model (not linear). Result: you arrive fresh and sharp on race day.",
    details:
      "Le taper suit le modèle de Mujika & Padilla (2003) : la réduction du volume est exponentielle, pas linéaire. La formule est volume(semaine) = pic × e^(-0.45 × semaine). Concrètement, un taper de 3 semaines donne environ 64%, 41% et 26% du volume pic. C'est plus agressif qu'une réduction linéaire, mais la recherche montre que c'est optimal pour la surcompensation. La durée du taper varie par distance : 1 semaine pour un 5K, 2 semaines pour un 10K/semi, 3 semaines pour un marathon/ultra. La dernière semaine (course) est à 35% du volume pic.",
    detailsEn:
      "The taper follows the Mujika & Padilla (2003) model: volume reduction is exponential, not linear. The formula is volume(week) = peak x e^(-0.45 x week). Concretely, a 3-week taper gives approximately 64%, 41% and 26% of peak volume. This is more aggressive than a linear reduction, but research shows it's optimal for supercompensation. Taper duration varies by distance: 1 week for 5K, 2 weeks for 10K/half, 3 weeks for marathon/ultra. The last week (race) is at 35% of peak volume.",
    rules: [
      {
        text: "Modèle exponentiel : volume = pic × e^(-0.45 × semaine)",
        textEn: "Exponential model: volume = peak x e^(-0.45 x week)",
      },
      {
        text: "5K : 1 semaine de taper | 10K/Semi : 2 semaines | Marathon/Ultra : 3 semaines",
        textEn: "5K: 1 taper week | 10K/Half: 2 weeks | Marathon/Ultra: 3 weeks",
      },
      {
        text: "Semaine de course à 35% du volume pic",
        textEn: "Race week at 35% of peak volume",
      },
      {
        text: "L'intensité est maintenue, seul le volume diminue",
        textEn: "Intensity is maintained, only volume decreases",
      },
    ],
    references: [
      { author: "Mujika, I. & Padilla, S.", year: 2003, title: "Scientific bases for precompetition tapering strategies" },
      { author: "Bosquet, L. et al.", year: 2007, title: "Effects of tapering on performance: a meta-analysis" },
    ],
    relatedArticle: "tapering",
  },
];

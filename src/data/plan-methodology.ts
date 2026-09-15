/**
 * Plan Methodology, The principles behind Zoned's plan generation
 *
 * Each principle describes what the generator actually does, with the values
 * it uses. When the code changes, this file changes with it: the audit of
 * September 2026 found seven claims here the generator did not honour.
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
      "La périodisation suit le modèle de Daniels (Phases I-IV) adapté à chaque distance. Hors affûtage, un plan 5K consacre 35 % des semaines à la base, 35 % au build et 30 % au peak ; un marathon 45 / 33 / 22 ; un ultra 55 / 30 / 15. Les plans courts (< 12 semaines) compriment la base de 8 points au profit du build et du peak. Le bloc spécifique est dimensionné en premier et garde un minimum (2 semaines sur 5K, 10K et semi, 3 sur marathon et ultra) dès que le plan compte 8 semaines hors affûtage : une seule semaine à allure marathon n'est pas une phase de peak. La base est plafonnée à 12 semaines, le surplus va au build (60 %) et au peak (40 %).",
    detailsEn:
      "Periodization follows Daniels' model (Phases I-IV) adapted to each distance. Outside the taper, a 5K plan spends 35% of its weeks in base, 35% in build and 30% in peak; a marathon 45 / 33 / 22; an ultra 55 / 30 / 15. Short plans (< 12 weeks) compress the base by 8 points in favour of build and peak. The specific block is sized first and keeps a minimum (2 weeks for 5K, 10K and half, 3 for marathon and ultra) once the plan has 8 weeks outside the taper: a single week of marathon-pace work is not a peak phase. The base is capped at 12 weeks, the surplus goes to build (60%) and peak (40%).",
    rules: [
      {
        text: "5K : Base 35 % | Build 35 % | Peak 30 % | Taper 1 sem.",
        textEn: "5K: Base 35% | Build 35% | Peak 30% | Taper 1 wk",
      },
      {
        text: "10K / Semi : Base 40 % | Build 35 % | Peak 25 % | Taper 2 sem.",
        textEn: "10K / Half: Base 40% | Build 35% | Peak 25% | Taper 2 wks",
      },
      {
        text: "Marathon : Base 45 % | Build 33 % | Peak 22 % | Taper 3 sem.",
        textEn: "Marathon: Base 45% | Build 33% | Peak 22% | Taper 3 wks",
      },
      {
        text: "Ultra : Base 55 % | Build 30 % | Peak 15 % | Taper 3 sem.",
        textEn: "Ultra: Base 55% | Build 30% | Peak 15% | Taper 3 wks",
      },
      {
        text: "Peak minimum : 2 semaines (5K à semi), 3 semaines (marathon, ultra) ; base plafonnée à 12 semaines",
        textEn: "Peak minimum: 2 weeks (5K to half), 3 weeks (marathon, ultra); base capped at 12 weeks",
      },
    ],
    references: [
      { author: "Daniels, J.", year: 2014, title: "Daniels' Running Formula, 3rd ed." },
      { author: "Pfitzinger, P.", year: 2009, title: "Advanced Marathoning, 2nd ed." },
      { author: "Lydiard, A.", year: 1962, title: "Sequential periodization model" },
    ],
    relatedArticle: "periodization",
  },

  // ── 2. Intensity distribution ──────────────────────────────────
  {
    id: "polarized",
    icon: "Activity",
    title: "Distribution d'intensité pyramidale",
    titleEn: "Pyramidal Intensity Distribution",
    summary:
      "Une séance clé par semaine en base, deux en build et en peak, jamais plus. Le reste est facile : environ 80 % de ton temps de course en Z1-Z2.",
    summaryEn:
      "One key session a week in base, two in build and peak, never more. Everything else is easy: about 80% of your running time in Z1-Z2.",
    details:
      "Le 80/20 de Seiler compte des séances : environ 80 % des séances sont faciles, 2 à 3 séances dures pour 10 à 14. Zoned l'applique par un budget de séances clés : une seule en phase de base jusqu'à 5 jours par semaine (Pfitzinger n'a qu'une séance de seuil dans son bloc d'endurance, Daniels seulement des lignes droites en phase I), deux à partir du build, jamais plus de deux plus la sortie longue. Sur un plan complet, cela donne 25 à 35 % de séances dures et environ 80 % du temps de course en Z1-Z2, avec du tempo et du seuil au milieu : une distribution pyramidale, celle qu'on observe chez les coureurs de fond bien entraînés la plupart de l'année (Casado 2022, Kenneally 2021). L'objectif finir limite à une séance clé par semaine tout le plan.",
    detailsEn:
      "Seiler's 80/20 counts sessions: about 80% of sessions are easy, 2 to 3 hard sessions in 10 to 14. Zoned applies it through a key-session budget: one in the base phase up to 5 days a week (Pfitzinger's endurance block has a single threshold session, Daniels' phase I only strides), two from the build phase on, never more than two plus the long run. Over a full plan that lands at 25-35% hard sessions and about 80% of running time in Z1-Z2, with tempo and threshold in between: a pyramidal distribution, the one well-trained distance runners show most of the year (Casado 2022, Kenneally 2021). The \"finish\" goal keeps one key session a week for the whole plan.",
    rules: [
      {
        text: "Base : 1 séance clé par semaine (2 à partir de 6 jours) ; Build et Peak : 2 séances clés",
        textEn: "Base: 1 key session a week (2 from 6 days); Build and Peak: 2 key sessions",
      },
      {
        text: "Jamais plus de 2 séances clés + la sortie longue, espacées de 48 h",
        textEn: "Never more than 2 key sessions + the long run, 48 h apart",
      },
      {
        text: "3 jours/sem. : 1 clé + 1 sortie longue + 1 facile",
        textEn: "3 days/wk: 1 key + 1 long run + 1 easy",
      },
      {
        text: "5 jours/sem. : 1 puis 2 clés + 1 sortie longue + 2 ou 3 faciles",
        textEn: "5 days/wk: 1 then 2 keys + 1 long run + 2 or 3 easy",
      },
      {
        text: "Objectif finir : 1 seule séance clé par semaine, tout le plan",
        textEn: "\"Finish\" goal: a single key session a week, the whole plan",
      },
    ],
    references: [
      { author: "Seiler, S.", year: 2010, title: "What is best practice for training intensity and duration distribution in endurance athletes?" },
      { author: "Casado, A. et al.", year: 2022, title: "Training periodization, methods, intensity distribution, and volume in highly trained and elite distance runners: a systematic review" },
      { author: "Stöggl, T. & Sperlich, B.", year: 2014, title: "Polarized training has greater impact than threshold training on endurance" },
    ],
    relatedArticle: "polarized-training",
  },

  // ── 3. Recovery Weeks ──────────────────────────────────────────
  {
    id: "recovery-weeks",
    icon: "RefreshCw",
    title: "Semaines de décharge",
    titleEn: "Drop-back Weeks",
    summary:
      "Après 3 semaines de charge, une semaine à 82 % du volume, sans séance dure. Jamais dans les deux semaines qui précèdent l'affûtage.",
    summaryEn:
      "After 3 load weeks, a week at 82% of the volume, with no hard session. Never in the two weeks before the taper.",
    details:
      "La décharge se déclenche après 3 semaines de charge consécutives, et une décharge de transition précède la phase de peak. Le volume descend à 82 % de la semaine de charge précédente, calculé sur les kilomètres réellement programmés : c'est la profondeur des semaines de recul de Pfitzinger (78-85 %) et de Higdon (86-92 %). Les séances clés sont remplacées par du facile, la sortie longue est réduite à 75 %, jamais supprimée. Aucune décharge n'est placée dans les deux semaines précédant l'affûtage : l'affûtage est la décharge. L'objectif finir décharge toutes les 3 semaines à 75 %.",
    detailsEn:
      "The drop-back triggers after 3 consecutive load weeks, and a transition drop-back precedes the peak phase. Volume goes down to 82% of the previous load week, computed on the kilometres actually scheduled: the depth of Pfitzinger's drop-back weeks (78-85%) and Higdon's (86-92%). Key sessions are replaced with easy running, the long run is cut to 75%, never removed. No drop-back is placed in the two weeks before the taper: the taper is the drop-back. The \"finish\" goal drops back every 3 weeks at 75%.",
    rules: [
      {
        text: "Décharge après 3 semaines de charge consécutives, et avant la phase peak",
        textEn: "Drop-back after 3 consecutive load weeks, and before the peak phase",
      },
      {
        text: "Volume à 82 % de la semaine de charge précédente (75 % pour l'objectif finir)",
        textEn: "Volume at 82% of the previous load week (75% for the \"finish\" goal)",
      },
      {
        text: "Séances clés remplacées par du facile, sortie longue à 75 %",
        textEn: "Key sessions replaced with easy running, long run at 75%",
      },
      {
        text: "Jamais de décharge dans les 2 semaines précédant l'affûtage",
        textEn: "No drop-back in the 2 weeks before the taper",
      },
    ],
    references: [
      { author: "Pfitzinger, P.", year: 2009, title: "Advanced Marathoning: drop-back weeks" },
      { author: "Kiely, J.", year: 2018, title: "Periodization theory: confronting an inconvenient truth" },
    ],
  },

  // ── 4. Volume Progression ──────────────────────────────────────
  {
    id: "volume",
    icon: "TrendingUp",
    title: "Progression de volume calculée",
    titleEn: "Computed Volume Progression",
    summary:
      "La pente est calculée pour que le pic tombe 2 à 3 semaines avant l'affûtage. Jamais plus de +10 % par semaine, mais ce n'est qu'un plafond.",
    summaryEn:
      "The slope is computed so the peak lands 2 to 3 weeks before the taper. Never more than +10% a week, but that is only a ceiling.",
    details:
      "Le générateur calcule des cibles en km réels à partir de ta distance, ton niveau, tes jours par semaine et le volume que tu déclares (un marathonien intermédiaire passe de 55 à 90 km par semaine, comme le plan 18/55 de Pfitzinger). L'augmentation hebdomadaire est celle qui mène du départ au pic dans les semaines de charge disponibles, pour que le pic arrive 2 semaines (5K à semi) ou 3 semaines (marathon, ultra) avant l'affûtage, puis ondule entre 93 et 100 %. Le +10 % est un plafond de sécurité, pas une consigne : la règle des 10 % n'a pas de preuve expérimentale (Buist 2008), ce que les données montrent, c'est le risque des sauts de plus de 20 à 30 %. Chaque distance impose aussi un volume de pic minimal (50 km sur marathon, 35 sur semi), que le nombre de jours ou l'objectif finir ne peuvent pas faire descendre.",
    detailsEn:
      "The generator computes real km targets from your distance, level, days per week and the volume you declare (an intermediate marathoner goes from 55 to 90 km a week, like Pfitzinger's 18/55). The weekly increase is the one that gets from start to peak in the load weeks available, so the peak lands 2 weeks (5K to half) or 3 weeks (marathon, ultra) before the taper, then undulates between 93 and 100%. The +10% is a safety ceiling, not a prescription: the 10% rule has no experimental support (Buist 2008), what the data shows is the risk of jumps above 20-30%. Each distance also sets a minimum peak volume (50 km for a marathon, 35 for a half) that the number of days or the \"finish\" goal cannot lower.",
    rules: [
      {
        text: "Pente calculée pour atteindre le pic 2-3 semaines avant l'affûtage ; +10 % par semaine en plafond",
        textEn: "Slope computed to reach the peak 2-3 weeks before the taper; +10% a week as a ceiling",
      },
      {
        text: "Ondulation au pic : alternance 100 % / 93 %",
        textEn: "Undulation at peak: alternating 100% / 93%",
      },
      {
        text: "Objectif finir : volume réduit de 10 % | performer : +12 %",
        textEn: "Goal \"finish\": volume reduced by 10% | \"compete\": +12%",
      },
      {
        text: "Plancher de pic par distance : 15 km (5K), 25 (10K), 35 (semi), 50 (marathon)",
        textEn: "Peak floor per distance: 15 km (5K), 25 (10K), 35 (half), 50 (marathon)",
      },
    ],
    references: [
      { author: "Buist, I. et al.", year: 2008, title: "No effect of a graded training program on the number of running-related injuries in novice runners" },
      { author: "Nielsen, R. et al.", year: 2014, title: "Excessive progression in weekly running distance and risk of running-related injuries" },
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
      "Un cycle de 3 semaines : 2 semaines de montée + 1 step-back à 85 %. Le pic arrive 2 à 4 semaines avant la course, et la sortie suit ton volume.",
    summaryEn:
      "A 3-week cycle: 2 build weeks + 1 step-back at 85%. Peak arrives 2 to 4 weeks before the race, and the run follows your volume.",
    details:
      "La sortie longue suit un schéma de step-back toutes les 3 semaines : 2 semaines de construction puis 1 semaine à 85 %, avec reprise au niveau d'avant. Son pic est le plus grand de deux repères : la cible par distance (78 % du marathon, 90 % du semi, 1,8 fois le 10K) et 27 % de ton volume hebdomadaire de pic (Daniels : 25-30 % de la semaine). Deux plafonds s'appliquent : en km (36 km sur marathon, 30 sur semi) et en durée à allure facile (150 min sur route, 3 h 15 sur marathon, 4 h en trail), pour qu'un coureur lent ne se voie pas prescrire quatre heures de course. Dans la semaine, la sortie longue ne dépasse pas 35 à 40 % du volume, 45 à 50 % sur les petites semaines de marathon (Higdon fait courir 32 km dans 64). En trail, la cible ajoute un dénivelé et une durée ajustée.",
    detailsEn:
      "The long run follows a 3-week step-back pattern: 2 build weeks then 1 week at 85%, resuming at the previous level. Its peak is the larger of two marks: the distance target (78% of the marathon, 90% of the half, 1.8 times the 10K) and 27% of your peak weekly volume (Daniels: 25-30% of the week). Two caps apply: in km (36 km for a marathon, 30 for a half) and in duration at easy pace (150 min on the road, 3 h 15 for a marathon, 4 h on trail), so a slow runner is not prescribed a four-hour outing. Within the week, the long run stays under 35-40% of the volume, 45-50% on small marathon weeks (Higdon runs 32 km inside 64). On trail, the target adds climb and an adjusted duration.",
    rules: [
      {
        text: "Cycle 3 semaines : montée, montée, step-back à 85 %",
        textEn: "3-week cycle: build, build, step-back at 85%",
      },
      {
        text: "Pic = max(cible par distance, 27 % du volume hebdomadaire de pic)",
        textEn: "Peak = max(distance target, 27% of peak weekly volume)",
      },
      {
        text: "Plafonds : 36 km ou 3 h 15 (marathon), 30 km ou 150 min (semi), 4 h (trail)",
        textEn: "Caps: 36 km or 3 h 15 (marathon), 30 km or 150 min (half), 4 h (trail)",
      },
      {
        text: "Pic 2 semaines avant la course (5K/10K), 3 (semi), 4 (marathon/ultra)",
        textEn: "Peak 2 weeks before the race (5K/10K), 3 (half), 4 (marathon/ultra)",
      },
    ],
    references: [
      { author: "Pfitzinger, P.", year: 2009, title: "Advanced Marathoning: long run progression model" },
      { author: "Daniels, J.", year: 2014, title: "Daniels' Running Formula, 3rd ed." },
      { author: "Humphrey, L. & Hanson, K.", year: 2012, title: "Hansons Marathon Method: the 16-mile long run" },
    ],
  },

  // ── 6. Session Types per Phase ─────────────────────────────────
  {
    id: "session-types",
    icon: "Dumbbell",
    title: "Séances adaptées à la distance et à la phase",
    titleEn: "Distance- and Phase-Specific Sessions",
    summary:
      "Le facteur limitant n'est pas le même sur 5K et sur marathon : VO2max pour les distances courtes, seuil et allure de course pour les longues. Chaque séance clé vient de ton niveau.",
    summaryEn:
      "The limiting factor differs between a 5K and a marathon: VO2max for short distances, threshold and race pace for long ones. Every key session comes from your level.",
    details:
      "Sur 5K et 10K, le build travaille VO2max et seuil, le peak garde VO2max et allure de course (Pfitzinger programme du VO2max chaque semaine de la seconde moitié). Sur semi et marathon, le seuil et le tempo précèdent l'allure spécifique, et le VO2max n'arrive qu'en fin de peak (Pfitzinger : seuil avant VO2max, allure marathon comme travail spécifique). En trail, les côtes dominent. La séance à allure spécifique est prise dans le catalogue de ta distance, jamais dans celui d'une autre, et son allure dépend de la distance : allure VMA sur 5K, seuil sur 10K et semi, allure marathon sur marathon. Une séance clé ne vient jamais d'un gabarit d'un niveau supérieur au tien : un débutant reçoit des séances débutant. Les séances clés sont espacées de la sortie longue et entre elles.",
    detailsEn:
      "For 5K and 10K, the build works VO2max and threshold, the peak keeps VO2max and race pace (Pfitzinger schedules VO2max every week of the second half). For half and marathon, threshold and tempo precede race-specific work, and VO2max only arrives late in the peak (Pfitzinger: threshold before VO2max, marathon pace as the specific work). On trail, hills dominate. The race-pace session is drawn from your distance's catalogue, never another one's, and its pace depends on the distance: VO2max pace for a 5K, threshold for 10K and half, marathon pace for a marathon. A key session never comes from a template above your level: a beginner gets beginner sessions. Key sessions are spaced from the long run and from each other.",
    rules: [
      {
        text: "5K / 10K : base fartlek et côtes, build VO2max et seuil, peak VO2max et allure de course",
        textEn: "5K / 10K: base fartlek and hills, build VO2max and threshold, peak VO2max and race pace",
      },
      {
        text: "Semi / Marathon : base tempo et côtes, build seuil et tempo, peak allure spécifique puis VO2max",
        textEn: "Half / Marathon: base tempo and hills, build threshold and tempo, peak race pace then VO2max",
      },
      {
        text: "Trail : côtes en base et en build, allure spécifique et côtes en peak",
        textEn: "Trail: hills in base and build, race pace and hills in peak",
      },
      {
        text: "Séance clé toujours de ton niveau ou en dessous, jamais au-dessus",
        textEn: "Key session always at or below your level, never above",
      },
      {
        text: "Retour de blessure et reprise : marche-course les premières semaines, aucune séance dure avant la 4e ou 5e",
        textEn: "Return from injury and restart: walk-run in the first weeks, no hard session before week 4 or 5",
      },
    ],
    references: [
      { author: "Daniels, J.", year: 2014, title: "Daniels' Running Formula: Phases I-IV model" },
      { author: "Pfitzinger, P. & Latter, P.", year: 2015, title: "Faster Road Racing: 5K to Half Marathon" },
      { author: "Warden, S. et al.", year: 2014, title: "Management and prevention of bone stress injuries in long-distance runners" },
    ],
  },

  // ── 7. Taper ───────────────────────────────────────────────────
  {
    id: "taper",
    icon: "Timer",
    title: "Affûtage progressif",
    titleEn: "Progressive Taper",
    summary:
      "Le volume descend par paliers publiés (78 %, 60 %, puis 40 % en semaine de course sur marathon), l'intensité reste. Tu arrives frais, pas désentraîné.",
    summaryEn:
      "Volume steps down along published ladders (78%, 60%, then 40% in race week for a marathon), intensity stays. You arrive fresh, not detrained.",
    details:
      "La méta-analyse de Bosquet (2007) donne la recette : réduire le volume de 41 à 60 % au total, progressivement plutôt qu'en marche, sur environ deux semaines, en gardant l'intensité et la fréquence. Zoned suit les paliers des plans de référence : sur marathon 78 % du pic à J−21, 60 % à J−14, 40 % en semaine de course (Pfitzinger : 75 / 60 / 40 ; Higdon : 73 / 53 / 23), et un affûtage de trois semaines discipliné, qui est ce qui marche le mieux chez les amateurs (Smyth & Lawlor 2021). Sur 10K et semi, 72 % puis 45 % ; sur 5K, une semaine de course à 55 %. Les séances clés restent, raccourcies ; la sortie longue descend avec le volume. En semaine de course, les footings sont dimensionnés sur la cible, la course elle-même n'est pas comptée.",
    detailsEn:
      "Bosquet's meta-analysis (2007) gives the recipe: cut volume by 41-60% in total, progressively rather than in one step, over about two weeks, keeping intensity and frequency. Zoned follows the ladders of the reference plans: for a marathon 78% of peak at day −21, 60% at day −14, 40% in race week (Pfitzinger: 75 / 60 / 40; Higdon: 73 / 53 / 23), and a disciplined three-week taper, which is what works best for recreational runners (Smyth & Lawlor 2021). For 10K and half, 72% then 45%; for a 5K, a race week at 55%. Key sessions stay, shortened; the long run comes down with the volume. In race week the jogs are sized on the target, the race itself is not counted.",
    rules: [
      {
        text: "Marathon / ultra : 78 % → 60 % → 40 % du pic (semaine de course)",
        textEn: "Marathon / ultra: 78% → 60% → 40% of peak (race week)",
      },
      {
        text: "10K / Semi / Trail : 72 % → 45 % ; 5K : 55 % en semaine de course",
        textEn: "10K / Half / Trail: 72% → 45%; 5K: 55% in race week",
      },
      {
        text: "L'intensité est maintenue, seul le volume diminue",
        textEn: "Intensity is maintained, only volume decreases",
      },
      {
        text: "Veille de course au repos, activation légère à J−2",
        textEn: "Rest the day before, light activation two days out",
      },
    ],
    references: [
      { author: "Bosquet, L. et al.", year: 2007, title: "Effects of tapering on performance: a meta-analysis" },
      { author: "Mujika, I. & Padilla, S.", year: 2003, title: "Scientific bases for precompetition tapering strategies" },
      { author: "Smyth, B. & Lawlor, A.", year: 2021, title: "Longer disciplined tapers improve marathon performance for recreational runners" },
    ],
    relatedArticle: "tapering",
  },

  // ── 8. Paces and prediction ────────────────────────────────────
  {
    id: "paces",
    icon: "Gauge",
    title: "Allures et prédiction selon la durée",
    titleEn: "Paces and Prediction by Duration",
    summary:
      "Le pourcentage de VMA que tu tiens dépend du temps passé à courir et de ton endurance, pas de la distance. Les allures et la prédiction en découlent.",
    summaryEn:
      "The share of VMA you can hold depends on how long you run and on your endurance, not on the distance. Paces and prediction follow from it.",
    details:
      "Les allures E, T, I et R viennent de Daniels (65-76 %, 86-90 %, 95-100 %, 104-108 % de la VMA). L'allure marathon n'est pas un pourcentage fixe : un coureur de 3 h tient environ 80 % de sa VMA, un coureur de 4 h 30 environ 72 %. Zoned la dérive du temps de marathon prédit. La prédiction elle-même suit le modèle de Péronnet et Thibault : %VMA = 100 − E × ln(temps / 7 min), avec un indice d'endurance E de 8 pour un débutant, 6,5 pour un intermédiaire, 5 pour un élite. Une table fixe par distance (97 % sur 5K) donnait un 5K de 31 minutes à un débutant qui en court 34. Le même modèle sert au calculateur de VMA depuis un temps de course et à l'estimation de la faisabilité de ton objectif.",
    detailsEn:
      "E, T, I and R paces come from Daniels (65-76%, 86-90%, 95-100%, 104-108% of VMA). Marathon pace is not a fixed share: a 3-hour runner holds about 80% of VMA, a 4h30 runner about 72%. Zoned derives it from the predicted marathon time. The prediction itself follows Péronnet and Thibault's model: %VMA = 100 − E × ln(time / 7 min), with an endurance index E of 8 for a beginner, 6.5 for an intermediate, 5 for an elite. A fixed table per distance (97% for a 5K) gave a 31-minute 5K to a beginner who runs 34. The same model powers the VMA-from-race-time calculator and the feasibility check of your goal.",
    rules: [
      {
        text: "E 65-76 % | T 86-90 % | I 95-100 % | R 104-108 % de la VMA",
        textEn: "E 65-76% | T 86-90% | I 95-100% | R 104-108% of VMA",
      },
      {
        text: "Allure marathon dérivée du temps prédit (≈ 80 % pour 3 h, ≈ 72 % pour 4 h 30)",
        textEn: "Marathon pace derived from the predicted time (≈ 80% at 3 h, ≈ 72% at 4h30)",
      },
      {
        text: "Prédiction : %VMA = 100 − E × ln(t / 7 min), E = 8 (débutant) à 5 (élite)",
        textEn: "Prediction: %VMA = 100 − E × ln(t / 7 min), E = 8 (beginner) to 5 (elite)",
      },
    ],
    references: [
      { author: "Péronnet, F. & Thibault, G.", year: 1989, title: "Mathematical analysis of running performance and world running records" },
      { author: "Billat, V. & Koralsztein, J.P.", year: 1996, title: "Significance of the velocity at VO2max and time to exhaustion at this velocity" },
      { author: "Daniels, J.", year: 2014, title: "Daniels' Running Formula, 3rd ed." },
    ],
  },
];

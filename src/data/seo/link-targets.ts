/**
 * Maillage interne, une seule liste a editer.
 *
 * Quand Search Console montre une URL entre les positions 8 et 20,
 * on l'ajoute ici (ou on elargit `from`). L'ordre des cibles specifiques
 * compte : une page n'affiche que les premieres qui correspondent.
 *
 * Les ancres sont des libelles reels, jamais "en savoir plus".
 * Plusieurs formulations : chacune est choisie de facon stable selon
 * la page source, pour ne pas repeter le meme texte partout.
 *
 * Les chiffres qui ont motive la liste (export du 1er novembre 2026,
 * 3 mois) ne sont pas recopies ici. Ils vivent dans la description
 * de la pull request.
 */

export interface SeoMatch {
  /** Toute la famille. */
  all?: boolean;
  /** Categories de seance, ou categories de glossaire : le moteur compare des chaines. */
  categories?: string[];
  zones?: number[];
  ids?: string[];
  disciplines?: string[];
  /** Chemins exacts, pour les calculateurs et les pages. */
  paths?: string[];
}

export interface SeoTarget {
  path: string;
  /** Note pour qui edite le fichier. Pas affichee. */
  note: string;
  anchors: { fr: string[]; en: string[] };
  fromWorkouts?: SeoMatch;
  fromGlossary?: SeoMatch;
  fromArticles?: SeoMatch;
  fromCalculators?: SeoMatch;
  fromPages?: SeoMatch;
}

/**
 * Pages deja proches de la premiere page, ou requetes francaises
 * encore loin (VMA, zones, Riegel, MAF, Runna).
 */
export const SEO_TARGETS: SeoTarget[] = [
  {
    path: "/calculators/vma",
    note: "Requetes VMA en anglais deja bien placees, francais encore loin.",
    anchors: {
      fr: [
        "Calculateur de VMA",
        "Calculer sa VMA et son allure",
        "Passer un temps de course en VMA",
      ],
      en: [
        "VMA calculator",
        "VMA pace and time",
        "Convert a run time to VMA speed",
      ],
    },
    fromWorkouts: { categories: ["assessment", "vma_intervals"] },
    fromGlossary: { ids: ["vma", "vo2max", "vitesse-critique", "zone-5"] },
    fromArticles: { ids: ["testing-vma", "zones"] },
    fromCalculators: { paths: ["/calculators/zones", "/calculators/allures", "/calculators/equivalence"] },
  },
  {
    path: "/learn/testing-vma",
    note: "Protocole de test, jumeau du calculateur.",
    anchors: {
      fr: ["Mesurer sa VMA et sa FCmax", "Protocoles pour établir sa VMA"],
      en: ["How to test your VMA", "VO2max speed and max heart rate"],
    },
    fromWorkouts: { categories: ["assessment", "vma_intervals"] },
    fromGlossary: { ids: ["vma", "vo2max"] },
    fromCalculators: { paths: ["/calculators/vma", "/calculators/zones"] },
  },
  {
    path: "/workout/ASS-008",
    note: "Test MAF. Pas de page glossaire dediee : c'est la page du test.",
    anchors: {
      fr: ["Test MAF, 5 km à fréquence cardiaque", "Suivre le progrès aérobie avec le test MAF"],
      en: ["MAF test, heart-rate 5K", "Monthly MAF aerobic test"],
    },
    fromWorkouts: { categories: ["endurance", "recovery"], zones: [1, 2] },
    fromGlossary: { ids: ["zone-1", "zone-2"], categories: ["physiology"] },
    fromArticles: { ids: ["polarized-training", "recovery", "zones"] },
  },
  {
    path: "/workout/ASS-005",
    note: "Test de Cooper, requetes VO2.",
    anchors: {
      fr: ["Test de Cooper, 12 minutes", "Estimer son VO2max sur 12 minutes"],
      en: ["Cooper 12-minute test", "Estimate VO2max in 12 minutes"],
    },
    fromWorkouts: { categories: ["assessment"] },
    fromGlossary: { ids: ["vo2max", "vma"] },
    fromArticles: { ids: ["testing-vma"] },
    fromCalculators: { paths: ["/calculators/vma"] },
  },
  {
    path: "/workout/ASS-007",
    note: "Yasso 800, predicteur marathon.",
    anchors: {
      fr: ["Yasso 800, prédire son marathon", "Dix fois 800 m pour le marathon"],
      en: ["Yasso 800s marathon predictor", "Predict a marathon from 800s"],
    },
    fromWorkouts: { categories: ["race_pace", "long_run"] },
    fromGlossary: { ids: ["marathon", "semi-marathon"] },
    fromArticles: { ids: ["tapering"] },
  },
  {
    path: "/glossary/surge",
    note: "Relance, position proche de la premiere page.",
    anchors: {
      fr: ["La relance, ou surge", "Accélérer 20 à 40 secondes sans récupérer"],
      en: ["What a surge is", "A short surge inside a steady run"],
    },
    fromWorkouts: { categories: ["fartlek", "tempo"] },
    fromGlossary: { ids: ["fartlek", "tempo-run", "intervals", "zone-5"] },
    fromArticles: { ids: ["zones"] },
  },
  {
    path: "/glossary/tempo-run",
    note: "Tempo.",
    anchors: {
      fr: ["La sortie au seuil, le tempo", "Courir au tempo, zone 3"],
      en: ["Tempo run", "Steady tempo, zone 3"],
    },
    fromWorkouts: { categories: ["tempo", "threshold"] },
    fromGlossary: { ids: ["zone-3", "zone-4", "surge"] },
  },
  {
    path: "/glossary/strides",
    note: "Lignes droites.",
    anchors: {
      fr: ["Les lignes droites, ou strides", "Accélérations courtes en fin de footing"],
      en: ["Strides", "Short strides after an easy run"],
    },
    fromWorkouts: { categories: ["recovery", "fartlek", "endurance"] },
    fromGlossary: { ids: ["surge", "fartlek"] },
    fromArticles: { ids: ["warmup"] },
  },
  {
    path: "/glossary/zone-1",
    note: "Zone 1.",
    anchors: {
      fr: ["Zone 1, récupération", "Allure et fréquence en zone 1"],
      en: ["Zone 1, recovery", "Heart rate and pace in zone 1"],
    },
    fromWorkouts: { zones: [1], categories: ["recovery"] },
    fromGlossary: { ids: ["zone-2"], categories: ["zones"] },
  },
  {
    path: "/glossary/zone-4",
    note: "Zone 4, seuil.",
    anchors: {
      fr: ["Zone 4, le seuil", "Tenir le seuil, zone 4"],
      en: ["Zone 4, threshold", "Lactate threshold, zone 4"],
    },
    fromWorkouts: { zones: [4], categories: ["threshold", "tempo"] },
    fromGlossary: { ids: ["zone-3", "zone-5", "tempo-run"], categories: ["zones"] },
  },
  {
    path: "/glossary/zone-5",
    note: "Zone 5, VMA.",
    anchors: {
      fr: ["Zone 5, proche de la VMA", "Fractionné en zone 5"],
      en: ["Zone 5, near VMA", "VO2max intervals, zone 5"],
    },
    fromWorkouts: { zones: [5], categories: ["vma_intervals"] },
    fromGlossary: { ids: ["vma", "vo2max", "zone-4"] },
    fromArticles: { ids: ["testing-vma"] },
  },
  {
    path: "/glossary/vitesse-critique",
    note: "Vitesse critique, pont vers CSS.",
    anchors: {
      fr: ["La vitesse critique", "CSS et vitesse critique"],
      en: ["Critical speed", "Critical swim speed and critical speed"],
    },
    fromWorkouts: { disciplines: ["swimming"], categories: ["threshold"] },
    fromGlossary: { ids: ["vma"] },
    fromCalculators: { paths: ["/calculators/css", "/calculators/vma"] },
  },
  {
    path: "/glossary/oscillation-verticale",
    note: "Biomecanique.",
    anchors: {
      fr: ["L'oscillation verticale", "Limiter le rebond à chaque foulée"],
      en: ["Vertical oscillation", "How much you bounce each stride"],
    },
    fromGlossary: { ids: ["cycle-foulee", "temps-contact-sol", "attaque-talon", "medio-pied"], categories: ["biomechanics"] },
    fromArticles: { ids: ["warmup"] },
  },
  {
    path: "/glossary/cycle-foulee",
    note: "Cycle de foulée.",
    anchors: {
      fr: ["Le cycle de foulée", "Pose du pied et cycle de jambe"],
      en: ["The running stride cycle", "Footstrike and the stride cycle"],
    },
    fromGlossary: { categories: ["biomechanics"] },
    fromArticles: { ids: ["warmup"] },
  },
  {
    path: "/glossary/temps-contact-sol",
    note: "Temps de contact.",
    anchors: {
      fr: ["Le temps de contact au sol", "Combien de temps le pied reste posé"],
      en: ["Ground contact time", "How long the foot stays down"],
    },
    fromGlossary: { ids: ["cycle-foulee", "oscillation-verticale", "strides"] },
  },
  {
    path: "/glossary/medio-pied",
    note: "Attaque medio-pied.",
    anchors: {
      fr: ["L'attaque médio-pied", "Poser le pied à plat, pas sur le talon"],
      en: ["Midfoot strike", "Landing under the hip"],
    },
    fromGlossary: { ids: ["attaque-talon", "cycle-foulee"] },
  },
  {
    path: "/glossary/attaque-talon",
    note: "Attaque talon.",
    anchors: {
      fr: ["L'attaque talon", "Ce que change une pose par le talon"],
      en: ["Heel strike", "What a heel-first landing changes"],
    },
    fromGlossary: { ids: ["medio-pied", "cycle-foulee"] },
  },
  {
    path: "/glossary/semi-marathon",
    note: "Semi.",
    anchors: {
      fr: ["Préparer un semi-marathon", "Allure et séances pour le semi"],
      en: ["Half marathon training", "Pacing a half marathon"],
    },
    fromWorkouts: { categories: ["long_run", "race_pace"] },
    fromGlossary: { ids: ["marathon"] },
    fromArticles: { ids: ["tapering", "nutrition"] },
  },
  {
    path: "/glossary/peaking",
    note: "Pic de forme.",
    anchors: {
      fr: ["Le pic de forme", "Arriver au sommet le jour de la course"],
      en: ["Peaking for race day", "Timing the peak"],
    },
    fromWorkouts: { categories: ["race_pace"] },
    fromGlossary: { ids: ["semi-marathon", "marathon"] },
    fromArticles: { ids: ["tapering", "periodization", "supercompensation"] },
  },
  {
    path: "/learn/warmup",
    note: "Echauffement.",
    anchors: {
      fr: ["Construire son échauffement", "Échauffement avant un fractionné ou une course"],
      en: ["How to warm up", "Warm-up before intervals or a race"],
    },
    fromWorkouts: { categories: ["vma_intervals", "threshold", "race_pace", "fartlek"] },
    fromGlossary: { ids: ["strides"] },
    fromPages: { paths: ["/guides/warmup"] },
  },
  {
    path: "/learn/supercompensation",
    note: "Surcompensation.",
    anchors: {
      fr: ["La surcompensation", "Pourquoi la forme monte après la fatigue"],
      en: ["Supercompensation", "Why fitness rises after fatigue"],
    },
    fromArticles: { ids: ["recovery", "periodization", "progressive-overload"] },
    fromGlossary: { ids: ["peaking"] },
  },
  {
    path: "/learn/zones",
    note: "Article pivot sur les 6 zones.",
    anchors: {
      fr: ["Les 6 zones d'entraînement", "À quoi sert chaque zone"],
      en: ["The 6 training zones", "What each zone is for"],
    },
    fromWorkouts: { categories: ["tempo", "threshold", "endurance", "recovery"] },
    fromGlossary: { categories: ["zones"] },
    fromCalculators: { paths: ["/calculators/zones", "/calculators/vma"] },
  },
  {
    path: "/race-simulator",
    note: "Simulateur, requete marathon simulator.",
    anchors: {
      fr: ["Simulateur d'allure et de ravitaillement", "Prévoir son marathon kilomètre par kilomètre"],
      en: ["Marathon pace simulator", "Plan splits, gels and drink stops"],
    },
    fromWorkouts: { categories: ["race_pace", "long_run"] },
    fromGlossary: { ids: ["marathon", "semi-marathon"] },
    fromArticles: { ids: ["tapering", "nutrition"] },
    fromCalculators: { paths: ["/calculators/splits", "/calculators/equivalence", "/calculators/allures"] },
  },
  {
    path: "/guides",
    note: "Hub des guides.",
    anchors: {
      fr: ["Guides d'échauffement, de course et de nutrition", "Les guides pratiques"],
      en: ["Warm-up, race and nutrition guides", "Practical training guides"],
    },
    fromArticles: { ids: ["warmup", "nutrition", "tapering"] },
    fromPages: { paths: ["/guides/nutrition", "/guides/race-prep", "/guides/warmup", "/nutrition"] },
  },
  {
    path: "/calculators/equivalence",
    note: "Formule de Riegel, pas de page dediee ailleurs.",
    anchors: {
      fr: ["Formule de Riegel, équivalences de distance", "Passer d'un 10 km à un marathon"],
      en: ["Riegel formula race equivalents", "Predict a marathon from a 10K"],
    },
    fromWorkouts: { categories: ["race_pace"] },
    fromGlossary: { ids: ["marathon", "semi-marathon"] },
    fromCalculators: { paths: ["/calculators/vma", "/calculators/splits"] },
    fromArticles: { ids: ["tapering"] },
  },
  {
    path: "/calculators/css",
    note: "CSS natation.",
    anchors: {
      fr: ["Calculateur de vitesse critique en natation", "Tester sa CSS"],
      en: ["Critical swim speed calculator", "CSS test"],
    },
    fromWorkouts: { disciplines: ["swimming"] },
    fromGlossary: { ids: ["vitesse-critique"] },
    fromCalculators: { paths: ["/calculators"] },
  },
  {
    path: "/calculators/allures",
    note: "La page existe, le hub pointe vers le convertisseur. Elle restait sans lien entrant.",
    anchors: {
      fr: ["Calculateur d'allures", "Passer d'un chrono à une allure"],
      en: ["Pace calculator", "Turn a finish time into a pace"],
    },
    fromCalculators: {
      paths: ["/calculators", "/calculators/convertisseur", "/calculators/table-allures", "/calculators/vma", "/calculators/splits"],
    },
    fromWorkouts: { categories: ["tempo", "race_pace"] },
  },
  {
    path: "/calculators/table-allures",
    note: "Beaucoup d'impressions, encore au-dela de la page 2.",
    anchors: {
      fr: ["Tableau d'allures", "Lire son allure au kilomètre"],
      en: ["Pace table", "Minutes per kilometre, in a table"],
    },
    fromWorkouts: { categories: ["tempo", "threshold", "race_pace"] },
    fromCalculators: { paths: ["/calculators/allures", "/calculators/vma", "/calculators/equivalence"] },
  },
  {
    path: "/workout/FAR-013",
    note: "Fartlek long.",
    anchors: {
      fr: ["Fartlek 2/1 longue distance", "Alterner 2 minutes vite, 1 minute souple"],
      en: ["Long 2/1 fartlek", "Two minutes on, one minute easy"],
    },
    fromWorkouts: { categories: ["fartlek", "long_run"] },
    fromGlossary: { ids: ["fartlek", "surge"] },
  },
  {
    path: "/compare/runna",
    note: "Requete runna alternatives.",
    anchors: {
      fr: ["Alternative à Runna, sans abonnement", "Zoned face à Runna"],
      en: ["A Runna alternative without a subscription", "Zoned compared with Runna"],
    },
    fromArticles: { ids: ["periodization", "polarized-training"] },
    fromPages: { paths: ["/plan/new", "/plan/new/prebuilt", "/compare", "/plans/methodology"] },
  },
  {
    path: "/compare/kiprun-pacer",
    note: "Requete runna vs kiprun.",
    anchors: {
      fr: ["Runna, Kiprun Pacer et Zoned", "Comparer Kiprun Pacer"],
      en: ["Runna, Kiprun Pacer and Zoned", "Kiprun Pacer compared"],
    },
    fromPages: { paths: ["/compare", "/compare/runna"] },
  },
];

/**
 * Hubs qui doivent recevoir des liens depuis presque tout le catalogue.
 * Ajoutes apres les cibles specifiques, pour ne pas les chasser.
 */
export const SEO_HUBS: SeoTarget[] = [
  {
    path: "/calculators/zones",
    note: "Requetes francaises zones et frequence cardiaque, encore loin.",
    anchors: {
      fr: [
        "Calculateur de zones et de fréquence cardiaque",
        "Zones d'entraînement à partir de la VMA",
        "Calculer ses zones cardio",
      ],
      en: [
        "Heart-rate zone calculator",
        "Training zones from VMA",
        "Calculate your heart-rate zones",
      ],
    },
    fromWorkouts: { all: true },
    fromGlossary: { all: true },
    fromArticles: { all: true },
    fromCalculators: { paths: ["/calculators/vma", "/calculators", "/calculators/allures"] },
  },
  {
    path: "/learn/zones",
    note: "Hub editorial des zones. Deja liste plus haut pour les seances seuil ; ici pour le reste du catalogue.",
    anchors: {
      fr: ["Comprendre les 6 zones", "Quelle zone pour quelle séance"],
      en: ["Understanding the 6 zones", "Which zone a session belongs to"],
    },
    fromWorkouts: { all: true },
    fromGlossary: { categories: ["zones", "physiology", "metrics"] },
    fromCalculators: { all: true },
  },
  {
    path: "/calculators/vma",
    note: "Rappel pour les seances qui n'entraient pas dans la regle stricte.",
    anchors: {
      fr: ["Calculateur de VMA", "Allure à un pourcentage de VMA"],
      en: ["VMA calculator", "Pace at a percent of VMA"],
    },
    fromWorkouts: { categories: ["assessment", "vma_intervals", "fartlek"] },
    fromGlossary: { ids: ["vma", "vo2max", "zone-5"] },
  },
  {
    path: "/calculators/equivalence",
    note: "Formule de Riegel. Rappel pour les sorties longues, si la cible specifique a ete ecartee.",
    anchors: {
      fr: ["Formule de Riegel, équivalences entre distances", "Projeter un chrono sur une autre distance"],
      en: ["Riegel formula, race equivalents", "Project a time onto another distance"],
    },
    fromWorkouts: { categories: ["long_run", "race_pace"] },
    fromGlossary: { ids: ["marathon", "semi-marathon"] },
  },
  {
    path: "/calculators/table-allures",
    note: "Beaucoup d'impressions au-dela de la page 2.",
    anchors: {
      fr: ["Tableau d'allures de 3:00 à 10:00/km", "Chronos de référence selon l'allure"],
      en: ["Pace table from 3:00 to 10:00 per km", "Reference times at each pace"],
    },
    fromWorkouts: { categories: ["tempo", "threshold", "race_pace", "endurance"] },
  },
];

import type { Tip } from "./types";

export const tips: Tip[] = [
  // === TRAINING ===
  {
    id: "training-001",
    text: "La règle 80/20 : environ 80% de votre volume d'entraînement devrait être en Z1-Z2 (facile), et seulement 20% en haute intensité.",
    textEn:
      "The 80/20 rule: about 80% of your training volume should be in Z1-Z2 (easy), and only 20% at high intensity.",
    category: "training",
    relatedZones: [1, 2],
    relatedCategories: ["endurance", "recovery"],
  },
  {
    id: "training-002",
    text: "Un échauffement de 10-15 minutes en Z1-Z2 prépare progressivement vos muscles et votre système cardiovasculaire à l'effort.",
    textEn:
      "A 10-15 minute warm-up in Z1-Z2 gradually prepares your muscles and cardiovascular system for effort.",
    category: "training",
    relatedZones: [1, 2],
  },
  {
    id: "training-003",
    text: "Les séances de VMA (Z5) sont efficaces par blocs de 3-4 semaines, suivis d'une semaine de récupération.",
    textEn:
      "VO2max sessions (Z5) are most effective in 3-4 week blocks, followed by a recovery week.",
    category: "training",
    relatedZones: [5],
    relatedCategories: ["vma_intervals"],
  },
  {
    id: "training-004",
    text: "Le fartlek permet de travailler plusieurs zones dans une même séance tout en restant ludique et adaptable au terrain.",
    textEn:
      "Fartlek allows you to work multiple zones in one session while staying playful and adapting to terrain.",
    category: "training",
    relatedCategories: ["fartlek"],
  },
  {
    id: "training-005",
    text: "Pour progresser au seuil (Z4), privilégiez des intervalles de 8-20 minutes plutôt que des efforts continus trop longs.",
    textEn:
      "To improve threshold (Z4), favor 8-20 minute intervals rather than overly long continuous efforts.",
    category: "training",
    relatedZones: [4],
    relatedCategories: ["threshold"],
  },
  {
    id: "training-006",
    text: "Les côtes renforcent naturellement vos jambes tout en limitant l'impact articulaire par rapport à la course sur plat.",
    textEn:
      "Hills naturally strengthen your legs while reducing joint impact compared to flat running.",
    category: "training",
    relatedCategories: ["hills"],
  },
  {
    id: "training-007",
    text: "La sortie longue hebdomadaire ne devrait pas dépasser 25-30% de votre volume total pour éviter le surentraînement.",
    textEn:
      "Your weekly long run should not exceed 25-30% of your total volume to avoid overtraining.",
    category: "training",
    relatedCategories: ["long_run"],
  },
  {
    id: "training-008",
    text: "Augmentez votre volume d'entraînement de maximum 10% par semaine pour permettre à votre corps de s'adapter.",
    textEn:
      "Increase your training volume by a maximum of 10% per week to allow your body to adapt.",
    category: "training",
  },
  {
    id: "training-009",
    text: "Les gammes et éducatifs avant une séance de VMA améliorent l'efficacité de votre foulée et réduisent le risque de blessure.",
    textEn:
      "Running drills before a VO2max session improve your stride efficiency and reduce injury risk.",
    category: "training",
    relatedZones: [5],
    relatedCategories: ["vma_intervals"],
  },
  {
    id: "training-010",
    text: "Courir trop vite en Z2 est l'erreur la plus courante. Si vous ne pouvez pas tenir une conversation, ralentissez !",
    textEn:
      "Running too fast in Z2 is the most common mistake. If you can't hold a conversation, slow down!",
    category: "training",
    relatedZones: [2],
    relatedCategories: ["endurance"],
  },

  // === PHYSIOLOGY ===
  {
    id: "physio-001",
    text: "Votre VMA représente la vitesse à laquelle vous atteignez votre consommation maximale d'oxygène (VO2max).",
    textEn:
      "Your MAS (Maximal Aerobic Speed) represents the speed at which you reach your maximal oxygen consumption (VO2max).",
    category: "physiology",
    relatedZones: [5],
    relatedTermId: "vma",
  },
  {
    id: "physio-002",
    text: "Le seuil lactique (Z4) correspond au point où l'acide lactique s'accumule plus vite qu'il n'est éliminé.",
    textEn:
      "The lactate threshold (Z4) is the point where lactic acid accumulates faster than it is cleared.",
    category: "physiology",
    relatedZones: [4],
    relatedTermId: "seuil-lactique",
  },
  {
    id: "physio-003",
    text: "L'entraînement en Z2 développe les mitochondries, les 'centrales énergétiques' de vos cellules musculaires.",
    textEn:
      "Z2 training develops mitochondria, the 'power plants' of your muscle cells.",
    category: "physiology",
    relatedZones: [2],
    relatedTermId: "mitochondries",
  },
  {
    id: "physio-004",
    text: "La fréquence cardiaque maximale diminue d'environ 1 battement par an après 30 ans - c'est normal !",
    textEn:
      "Maximum heart rate decreases by about 1 beat per year after age 30 - that's normal!",
    category: "physiology",
    relatedTermId: "fc-max",
  },
  {
    id: "physio-005",
    text: "L'adaptation cardiovasculaire (cœur plus fort) se produit plus vite que l'adaptation des tendons. Patience !",
    textEn:
      "Cardiovascular adaptation (stronger heart) happens faster than tendon adaptation. Be patient!",
    category: "physiology",
  },
  {
    id: "physio-006",
    text: "En Z1-Z2, votre corps utilise principalement les graisses comme carburant. En Z5-Z6, ce sont les glucides.",
    textEn:
      "In Z1-Z2, your body primarily uses fat as fuel. In Z5-Z6, it's carbohydrates.",
    category: "physiology",
    relatedZones: [1, 2, 5, 6],
  },
  {
    id: "physio-007",
    text: "Les fibres musculaires lentes (type I) sont recrutées en premier. Les fibres rapides (type II) interviennent à haute intensité.",
    textEn:
      "Slow-twitch muscle fibers (type I) are recruited first. Fast-twitch fibers (type II) engage at high intensity.",
    category: "physiology",
    relatedZones: [5, 6],
  },
  {
    id: "physio-008",
    text: "Votre volume d'éjection systolique (sang pompé par battement) augmente avec l'entraînement en endurance.",
    textEn:
      "Your stroke volume (blood pumped per beat) increases with endurance training.",
    category: "physiology",
    relatedZones: [2, 3],
  },
  {
    id: "physio-009",
    text: "L'EPO naturelle produite par vos reins stimule la production de globules rouges lors de l'entraînement en altitude.",
    textEn:
      "Natural EPO produced by your kidneys stimulates red blood cell production during altitude training.",
    category: "physiology",
  },
  {
    id: "physio-010",
    text: "La capillarisation (création de nouveaux vaisseaux sanguins) prend 6-8 semaines d'entraînement régulier.",
    textEn:
      "Capillarization (creation of new blood vessels) takes 6-8 weeks of regular training.",
    category: "physiology",
    relatedZones: [2],
  },

  // === NUTRITION ===
  {
    id: "nutrition-001",
    text: "Pour une séance de plus de 90 minutes, visez 30-60g de glucides par heure pour maintenir votre performance.",
    textEn:
      "For sessions over 90 minutes, aim for 30-60g of carbs per hour to maintain performance.",
    category: "nutrition",
    relatedCategories: ["long_run"],
  },
  {
    id: "nutrition-002",
    text: "La fenêtre de récupération optimale est de 30-60 minutes après l'effort pour reconstituer les réserves de glycogène.",
    textEn:
      "The optimal recovery window is 30-60 minutes post-exercise to replenish glycogen stores.",
    category: "nutrition",
  },
  {
    id: "nutrition-003",
    text: "L'hydratation influence directement la performance : une perte de 2% du poids en eau réduit les capacités de 10-20%.",
    textEn:
      "Hydration directly affects performance: a 2% body weight loss from water reduces capacity by 10-20%.",
    category: "nutrition",
  },
  {
    id: "nutrition-004",
    text: "Les protéines après l'entraînement (20-40g) favorisent la réparation musculaire et l'adaptation à l'effort.",
    textEn:
      "Post-workout protein (20-40g) promotes muscle repair and adaptation to exercise.",
    category: "nutrition",
  },
  {
    id: "nutrition-005",
    text: "Le fer est essentiel pour le transport de l'oxygène. Les coureurs, surtout les femmes, doivent surveiller leur apport.",
    textEn:
      "Iron is essential for oxygen transport. Runners, especially women, should monitor their intake.",
    category: "nutrition",
  },
  {
    id: "nutrition-006",
    text: "La caféine peut améliorer les performances de 2-4% en réduisant la perception de l'effort.",
    textEn:
      "Caffeine can improve performance by 2-4% by reducing the perception of effort.",
    category: "nutrition",
  },
  {
    id: "nutrition-007",
    text: "Évitez les repas riches en fibres 2-3 heures avant une séance intense pour prévenir les troubles digestifs.",
    textEn:
      "Avoid high-fiber meals 2-3 hours before an intense session to prevent digestive issues.",
    category: "nutrition",
    relatedCategories: ["vma_intervals", "threshold"],
  },
  {
    id: "nutrition-008",
    text: "Les électrolytes (sodium, potassium, magnésium) perdus dans la sueur doivent être remplacés lors des efforts longs.",
    textEn:
      "Electrolytes (sodium, potassium, magnesium) lost in sweat must be replaced during long efforts.",
    category: "nutrition",
    relatedCategories: ["long_run"],
  },

  // === RECOVERY ===
  {
    id: "recovery-001",
    text: "Le sommeil est la période où votre corps produit le plus d'hormone de croissance pour réparer les muscles.",
    textEn:
      "Sleep is when your body produces the most growth hormone to repair muscles.",
    category: "recovery",
  },
  {
    id: "recovery-002",
    text: "Une séance en Z1 le lendemain d'un effort intense accélère la récupération en favorisant la circulation sanguine.",
    textEn:
      "A Z1 session the day after an intense effort speeds up recovery by promoting blood circulation.",
    category: "recovery",
    relatedZones: [1],
    relatedCategories: ["recovery"],
  },
  {
    id: "recovery-003",
    text: "7-9 heures de sommeil par nuit sont recommandées pour une récupération optimale chez les sportifs.",
    textEn:
      "7-9 hours of sleep per night are recommended for optimal recovery in athletes.",
    category: "recovery",
  },
  {
    id: "recovery-004",
    text: "Le stress mental impacte la récupération autant que le stress physique. Prenez soin de votre équilibre.",
    textEn:
      "Mental stress impacts recovery as much as physical stress. Take care of your balance.",
    category: "recovery",
  },
  {
    id: "recovery-005",
    text: "Les étirements statiques sont plus efficaces après l'entraînement qu'avant, quand les muscles sont chauds.",
    textEn:
      "Static stretching is more effective after training than before, when muscles are warm.",
    category: "recovery",
  },
  {
    id: "recovery-006",
    text: "La variabilité de la fréquence cardiaque (VFC) au repos est un bon indicateur de votre état de récupération.",
    textEn:
      "Heart rate variability (HRV) at rest is a good indicator of your recovery state.",
    category: "recovery",
    relatedTermId: "vfc",
  },
  {
    id: "recovery-007",
    text: "Une semaine de récupération toutes les 3-4 semaines (volume réduit de 30-50%) optimise les adaptations.",
    textEn:
      "A recovery week every 3-4 weeks (30-50% reduced volume) optimizes adaptations.",
    category: "recovery",
  },
  {
    id: "recovery-008",
    text: "L'immersion en eau froide (10-15°C pendant 10-15 min) peut réduire les courbatures après un effort intense.",
    textEn:
      "Cold water immersion (10-15°C for 10-15 min) can reduce soreness after intense effort.",
    category: "recovery",
  },
  {
    id: "recovery-009",
    text: "Les massages ou le foam rolling aident à relâcher les tensions musculaires et améliorer la circulation.",
    textEn:
      "Massage or foam rolling helps release muscle tension and improve circulation.",
    category: "recovery",
  },
  {
    id: "recovery-010",
    text: "Écoutez votre corps : une fatigue persistante ou une baisse de performance sont des signaux d'alarme.",
    textEn:
      "Listen to your body: persistent fatigue or performance decline are warning signs.",
    category: "recovery",
  },

  // === CULTURE ===
  {
    id: "culture-001",
    text: "Le marathon tire son nom de la légende de Philippidès, messager grec qui aurait couru d'Athènes à Marathon en 490 av. J-C.",
    textEn:
      "The marathon takes its name from the legend of Pheidippides, a Greek messenger who reportedly ran from Athens to Marathon in 490 BC.",
    category: "culture",
  },
  {
    id: "culture-002",
    text: "La distance officielle du marathon (42.195 km) a été fixée aux JO de Londres 1908 pour que la course finisse devant la loge royale.",
    textEn:
      "The official marathon distance (42.195 km) was set at the 1908 London Olympics so the race would finish in front of the royal box.",
    category: "culture",
  },
  {
    id: "culture-003",
    text: "Eliud Kipchoge est le premier humain à avoir couru un marathon en moins de 2 heures (1:59:40 à Vienne en 2019).",
    textEn:
      "Eliud Kipchoge was the first human to run a marathon in under 2 hours (1:59:40 in Vienna, 2019).",
    category: "culture",
  },
  {
    id: "culture-004",
    text: "Le record du monde masculin du marathon est de 2:00:35 par Kelvin Kiptum (Chicago 2023).",
    textEn:
      "The men's marathon world record is 2:00:35 by Kelvin Kiptum (Chicago 2023).",
    category: "culture",
  },
  {
    id: "culture-005",
    text: "Le record du monde féminin du marathon est de 2:09:56 par Ruth Chepngetich (Chicago 2024).",
    textEn:
      "The women's marathon world record is 2:09:56 by Ruth Chepngetich (Chicago 2024).",
    category: "culture",
  },
  {
    id: "culture-006",
    text: "Le 'fartlek' est un mot suédois signifiant 'jeu de vitesse', inventé par l'entraîneur Gösta Holmér dans les années 1930.",
    textEn:
      "Fartlek is a Swedish word meaning 'speed play', invented by coach Gösta Holmér in the 1930s.",
    category: "culture",
    relatedCategories: ["fartlek"],
  },
  {
    id: "culture-007",
    text: "Les Tarahumaras du Mexique sont célèbres pour courir des ultra-marathons en sandales traditionnelles (huaraches).",
    textEn:
      "The Tarahumara people of Mexico are famous for running ultra-marathons in traditional sandals (huaraches).",
    category: "culture",
  },
  {
    id: "culture-008",
    text: "Le marathon de Boston est le plus ancien marathon annuel au monde, créé en 1897.",
    textEn:
      "The Boston Marathon is the world's oldest annual marathon, established in 1897.",
    category: "culture",
  },
  {
    id: "culture-009",
    text: "Usain Bolt détient le record du 100m (9.58s) et du 200m (19.19s), établis aux Mondiaux de Berlin 2009.",
    textEn:
      "Usain Bolt holds the 100m (9.58s) and 200m (19.19s) world records, set at the 2009 Berlin World Championships.",
    category: "culture",
    relatedZones: [6],
  },
  {
    id: "culture-010",
    text: "Roger Bannister fut le premier à courir le mile en moins de 4 minutes (3:59.4) le 6 mai 1954 à Oxford.",
    textEn:
      "Roger Bannister was the first to run a mile in under 4 minutes (3:59.4) on May 6, 1954 in Oxford.",
    category: "culture",
  },
  {
    id: "culture-011",
    text: "Les chaussures à plaque carbone ont révolutionné la course depuis 2017, améliorant l'économie de course de 4%.",
    textEn:
      "Carbon plate shoes have revolutionized running since 2017, improving running economy by 4%.",
    category: "culture",
  },
  {
    id: "culture-012",
    text: "Le parkrun, né en 2004 à Londres, rassemble aujourd'hui des millions de coureurs chaque samedi dans le monde.",
    textEn:
      "Parkrun, born in 2004 in London, now brings together millions of runners every Saturday worldwide.",
    category: "culture",
  },
  {
    id: "culture-013",
    text: "L'UTMB (Ultra-Trail du Mont-Blanc) est considéré comme le championnat du monde officieux de l'ultra-trail.",
    textEn:
      "The UTMB (Ultra-Trail du Mont-Blanc) is considered the unofficial world championship of ultra-trail running.",
    category: "culture",
    relatedCategories: ["long_run"],
  },
  {
    id: "culture-014",
    text: "Emil Zátopek, 'la locomotive tchèque', a remporté le 5000m, 10000m et marathon aux JO d'Helsinki 1952.",
    textEn:
      "Emil Zátopek, 'the Czech Locomotive', won the 5000m, 10000m and marathon at the 1952 Helsinki Olympics.",
    category: "culture",
  },
  {
    id: "culture-015",
    text: "Le Kenya et l'Éthiopie dominent la course de fond grâce à l'altitude (2000m+), la culture de course et la génétique.",
    textEn:
      "Kenya and Ethiopia dominate distance running thanks to altitude (2000m+), running culture, and genetics.",
    category: "culture",
  },

  // === MORE TRAINING ===
  {
    id: "training-011",
    text: "Le 'negative split' (seconde moitié plus rapide) est la stratégie optimale pour la plupart des courses.",
    textEn:
      "The 'negative split' (faster second half) is the optimal strategy for most races.",
    category: "training",
    relatedCategories: ["race_pace"],
  },
  {
    id: "training-012",
    text: "Varier les surfaces (route, trail, piste) sollicite différemment vos muscles et réduit le risque de blessure.",
    textEn:
      "Varying surfaces (road, trail, track) works your muscles differently and reduces injury risk.",
    category: "training",
  },
  {
    id: "training-013",
    text: "La cadence optimale se situe généralement entre 170-180 pas/minute pour réduire l'impact sur les articulations.",
    textEn:
      "Optimal cadence is generally between 170-180 steps/minute to reduce joint impact.",
    category: "training",
  },
  {
    id: "training-014",
    text: "Le taper (réduction du volume avant une course) améliore les performances de 2-3% en permettant une récupération complète.",
    textEn:
      "Tapering (reducing volume before a race) improves performance by 2-3% by allowing complete recovery.",
    category: "training",
    relatedCategories: ["race_pace"],
  },
  {
    id: "training-015",
    text: "Les doubles séances (2 entraînements/jour) ne sont utiles qu'au-delà de 80-100 km/semaine.",
    textEn:
      "Double sessions (2 workouts/day) are only useful beyond 80-100 km/week.",
    category: "training",
  },

  // === MORE NUTRITION ===
  {
    id: "nutrition-009",
    text: "Les betteraves (ou jus de betterave) contiennent des nitrates qui peuvent améliorer l'endurance de 1-3%.",
    textEn:
      "Beetroot (or beetroot juice) contains nitrates that can improve endurance by 1-3%.",
    category: "nutrition",
    relatedCategories: ["endurance"],
  },
  {
    id: "nutrition-010",
    text: "Le 'carb loading' (surcharge glucidique) 2-3 jours avant un marathon peut augmenter vos réserves de glycogène de 20-40%.",
    textEn:
      "Carb loading 2-3 days before a marathon can increase your glycogen stores by 20-40%.",
    category: "nutrition",
    relatedCategories: ["long_run", "race_pace"],
  },
  {
    id: "nutrition-011",
    text: "La vitamine D joue un rôle crucial dans la santé osseuse et musculaire. Surveillez vos niveaux, surtout en hiver.",
    textEn:
      "Vitamin D plays a crucial role in bone and muscle health. Monitor your levels, especially in winter.",
    category: "nutrition",
  },
  {
    id: "nutrition-012",
    text: "Les oméga-3 ont des propriétés anti-inflammatoires qui peuvent aider à la récupération musculaire.",
    textEn:
      "Omega-3s have anti-inflammatory properties that can help with muscle recovery.",
    category: "nutrition",
  },

  // === MORE PHYSIOLOGY ===
  {
    id: "physio-011",
    text: "Le 'runner's high' est causé par la libération d'endocannabinoïdes, pas seulement d'endorphines comme on le pensait.",
    textEn:
      "The 'runner's high' is caused by endocannabinoid release, not just endorphins as previously thought.",
    category: "physiology",
  },
  {
    id: "physio-012",
    text: "Votre cœur peut pomper jusqu'à 30-40 litres de sang par minute pendant un effort maximal.",
    textEn:
      "Your heart can pump up to 30-40 liters of blood per minute during maximal effort.",
    category: "physiology",
    relatedZones: [5, 6],
  },
  {
    id: "physio-013",
    text: "Les tendons mettent 6-12 mois à s'adapter complètement à un nouveau stimulus d'entraînement.",
    textEn:
      "Tendons take 6-12 months to fully adapt to a new training stimulus.",
    category: "physiology",
  },
  {
    id: "physio-014",
    text: "La température corporelle peut atteindre 40°C lors d'un effort intense, d'où l'importance de la thermorégulation.",
    textEn:
      "Body temperature can reach 40°C during intense effort, hence the importance of thermoregulation.",
    category: "physiology",
    relatedZones: [5, 6],
  },

  // === MORE RECOVERY ===
  {
    id: "recovery-011",
    text: "La compression (chaussettes, manchons) peut accélérer la récupération en améliorant le retour veineux.",
    textEn:
      "Compression gear (socks, sleeves) can speed up recovery by improving venous return.",
    category: "recovery",
  },
  {
    id: "recovery-012",
    text: "La sieste de 20-30 minutes peut compenser partiellement un déficit de sommeil et améliorer la récupération.",
    textEn:
      "A 20-30 minute nap can partially compensate for sleep deficit and improve recovery.",
    category: "recovery",
  },
  {
    id: "recovery-013",
    text: "Le sauna finlandais (15-20 min à 80-100°C) peut améliorer la récupération et simuler certains effets de l'altitude.",
    textEn:
      "Finnish sauna (15-20 min at 80-100°C) can improve recovery and simulate some altitude effects.",
    category: "recovery",
  },
];

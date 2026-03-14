import type { WarmupSection, WarmupRoutine } from "./types";

export const warmupSections: WarmupSection[] = [
  {
    id: "dynamic-warmup-principles",
    title: "Principes de l'échauffement dynamique",
    titleEn: "Dynamic Warm-up Principles",
    icon: "Zap",
    content: [
      {
        type: "paragraph",
        text: "L'échauffement prépare le corps à l'effort en augmentant progressivement la température corporelle, le débit sanguin vers les muscles et l'activation du système neuromusculaire. Un bon échauffement réduit le risque de blessure et améliore la performance.",
        textEn: "Warming up prepares the body for exercise by progressively raising body temperature, increasing blood flow to muscles, and activating the neuromuscular system. A proper warm-up reduces injury risk and improves performance.",
      },
      {
        type: "list",
        text: "Pourquoi s'échauffer",
        textEn: "Why warm up",
        items: [
          {
            text: "Augmenter la température corporelle : les muscles chauds sont plus élastiques et réactifs",
            textEn: "Raise body temperature: warm muscles are more elastic and responsive",
          },
          {
            text: "Accroître le débit sanguin : meilleur apport en oxygène et nutriments aux muscles sollicités",
            textEn: "Increase blood flow: better oxygen and nutrient delivery to working muscles",
          },
          {
            text: "Activer le système neuromusculaire : améliorer la coordination et le recrutement des fibres musculaires",
            textEn: "Activate the neuromuscular system: improve coordination and muscle fiber recruitment",
          },
          {
            text: "Préparer les articulations : augmenter la production de liquide synovial pour lubrifier les articulations",
            textEn: "Prepare joints: increase synovial fluid production to lubricate joints",
          },
        ],
      },
      {
        type: "list",
        text: "Règles fondamentales",
        textEn: "Fundamental rules",
        items: [
          {
            text: "Durée : 10 à 20 minutes selon l'intensité de la séance à venir",
            textEn: "Duration: 10-20 minutes depending on upcoming session intensity",
          },
          {
            text: "Progression : commencer lentement, monter graduellement, terminer par des mouvements à allure de course",
            textEn: "Progression: start slow, build gradually, finish with race-pace movements",
          },
          {
            text: "Ne jamais faire d'étirements statiques sur des muscles froids — ils réduisent la force et la puissance",
            textEn: "Never static stretch cold muscles — it reduces strength and power output",
          },
          {
            text: "Adapter au contexte : par temps froid, allonger l'échauffement ; par temps chaud, le raccourcir légèrement",
            textEn: "Adapt to conditions: in cold weather, extend the warm-up; in hot weather, shorten it slightly",
          },
        ],
      },
      {
        type: "tip",
        text: "Un bon indicateur que l'échauffement est suffisant : vous commencez à transpirer légèrement. C'est le signe que la température corporelle est montée.",
        textEn: "A good indicator that the warm-up is sufficient: you start to sweat lightly. This signals that body temperature has risen.",
      },
    ],
  },
  {
    id: "pre-race-warmup-protocol",
    title: "Protocole d'échauffement avant course",
    titleEn: "Pre-Race Warm-up Protocol",
    icon: "Trophy",
    content: [
      {
        type: "paragraph",
        text: "L'échauffement d'avant-course suit une structure précise et doit être terminé 5 à 10 minutes avant le coup de pistolet. L'objectif est d'être physiologiquement prêt sans entamer les réserves d'énergie.",
        textEn: "The pre-race warm-up follows a precise structure and should be completed 5-10 minutes before gun time. The goal is to be physiologically ready without depleting energy reserves.",
      },
      {
        type: "list",
        text: "Structure recommandée",
        textEn: "Recommended structure",
        items: [
          {
            text: "Footing facile (5-15 min selon la distance) : commencer très lentement et augmenter progressivement",
            textEn: "Easy jog (5-15 min depending on distance): start very slowly and progressively increase",
          },
          {
            text: "Gammes dynamiques (3-5 min) : montées de genoux, talons-fesses, pas chassés, skipping",
            textEn: "Dynamic drills (3-5 min): high knees, butt kicks, lateral shuffles, skipping",
          },
          {
            text: "Lignes droites (accélérations progressives de 80-100 m) : monter jusqu'à l'allure de course",
            textEn: "Strides (progressive accelerations of 80-100m): build up to race pace",
          },
          {
            text: "Repos et positionnement : 5-10 min avant le départ, se placer dans le sas",
            textEn: "Rest and positioning: 5-10 min before the start, get into position in the corral",
          },
        ],
      },
      {
        type: "list",
        text: "Ajustements par distance",
        textEn: "Distance-specific adjustments",
        items: [
          {
            text: "5 km : échauffement agressif (15-20 min), nombreuses lignes droites, gammes complètes — le départ est rapide",
            textEn: "5K: aggressive warm-up (15-20 min), many strides, full drills — the start is fast",
          },
          {
            text: "10 km : échauffement modéré (10-15 min), quelques lignes droites",
            textEn: "10K: moderate warm-up (10-15 min), a few strides",
          },
          {
            text: "Semi / Marathon : échauffement minimal (5-10 min), conserver le glycogène, les premiers km font office d'échauffement",
            textEn: "Half / Marathon: minimal warm-up (5-10 min), conserve glycogen, the first km serve as warm-up",
          },
        ],
      },
      {
        type: "tip",
        text: "Utilisez l'échauffement comme moment de préparation mentale. Visualisez votre course, répétez votre plan d'allure, et connectez-vous avec votre mantra.",
        textEn: "Use the warm-up as a mental preparation moment. Visualize your race, review your pacing plan, and connect with your mantra.",
      },
    ],
  },
  {
    id: "cooldown-routines",
    title: "Routines de retour au calme",
    titleEn: "Cool-down Routines",
    icon: "Wind",
    content: [
      {
        type: "paragraph",
        text: "Le retour au calme (cool-down) facilite la transition de l'effort vers le repos. Il aide à éliminer les déchets métaboliques, réduit les courbatures et ramène progressivement la fréquence cardiaque au repos.",
        textEn: "The cool-down facilitates the transition from effort to rest. It helps clear metabolic waste, reduces soreness, and gradually brings heart rate back to resting levels.",
      },
      {
        type: "list",
        text: "Composantes du cool-down",
        textEn: "Cool-down components",
        items: [
          {
            text: "Footing facile de 5-10 min en ralentissant progressivement jusqu'à la marche",
            textEn: "Easy 5-10 min jog, gradually slowing down to a walk",
          },
          {
            text: "Mouvements dynamiques légers : balancements de jambes, rotations de hanches, cercles de chevilles",
            textEn: "Light dynamic movements: leg swings, hip rotations, ankle circles",
          },
          {
            text: "Étirements statiques UNIQUEMENT après l'effort : maintenir chaque position 15-30 secondes",
            textEn: "Static stretching ONLY after exercise: hold each position 15-30 seconds",
          },
          {
            text: "Rouleau de massage (foam rolling) : 30-60 secondes par groupe musculaire pour favoriser la récupération",
            textEn: "Foam rolling: 30-60 seconds per muscle group to promote recovery",
          },
        ],
      },
      {
        type: "warning",
        text: "Ne sautez jamais le cool-down après une séance intense (fractionné, seuil, compétition). L'arrêt brutal de l'effort peut provoquer des vertiges et augmente significativement les courbatures du lendemain.",
        textEn: "Never skip the cool-down after an intense session (intervals, threshold, race). Abruptly stopping exercise can cause dizziness and significantly increases next-day soreness.",
      },
      {
        type: "tip",
        text: "Le cool-down est aussi un excellent moment pour faire le bilan de la séance : notez vos sensations, allures, et points d'amélioration pendant que c'est frais.",
        textEn: "The cool-down is also an excellent time to review the session: note your feelings, paces, and areas for improvement while it's fresh.",
      },
    ],
  },
  {
    id: "dynamic-vs-static-stretching",
    title: "Étirements dynamiques vs statiques",
    titleEn: "Dynamic vs Static Stretching",
    icon: "ArrowLeftRight",
    content: [
      {
        type: "paragraph",
        text: "La science du stretching a considérablement évolué. Le consensus actuel est clair : les étirements dynamiques avant l'effort et les étirements statiques après. Mélanger les deux au mauvais moment nuit à la performance.",
        textEn: "The science of stretching has evolved considerably. The current consensus is clear: dynamic stretches before exercise and static stretches after. Mixing them at the wrong time hurts performance.",
      },
      {
        type: "list",
        text: "Étirements dynamiques (avant l'effort)",
        textEn: "Dynamic stretching (before exercise)",
        items: [
          {
            text: "Basés sur le mouvement : balancements de jambes, fentes marchées, rotations du tronc",
            textEn: "Movement-based: leg swings, walking lunges, trunk rotations",
          },
          {
            text: "Améliorent la performance : augmentent l'amplitude de mouvement sans réduire la force",
            textEn: "Improve performance: increase range of motion without reducing strength",
          },
          {
            text: "Activent les muscles de manière spécifique au mouvement à venir",
            textEn: "Activate muscles in a way specific to the upcoming movement",
          },
          {
            text: "Durée : 5-10 secondes par mouvement, 8-12 répétitions",
            textEn: "Duration: 5-10 seconds per movement, 8-12 repetitions",
          },
        ],
      },
      {
        type: "list",
        text: "Étirements statiques (après l'effort uniquement)",
        textEn: "Static stretching (after exercise only)",
        items: [
          {
            text: "Maintien d'une position étirée 15-30 secondes : quadriceps, ischio-jambiers, mollets, hanches",
            textEn: "Hold a stretched position for 15-30 seconds: quads, hamstrings, calves, hips",
          },
          {
            text: "Améliorent la flexibilité à long terme quand pratiqués régulièrement",
            textEn: "Improve long-term flexibility when practiced regularly",
          },
          {
            text: "Favorisent la relaxation et le retour au calme",
            textEn: "Promote relaxation and cool-down",
          },
          {
            text: "Consensus scientifique : les étirements statiques AVANT l'effort RÉDUISENT la performance (force, puissance, vitesse)",
            textEn: "Scientific consensus: static stretching BEFORE exercise REDUCES performance (strength, power, speed)",
          },
        ],
      },
      {
        type: "warning",
        text: "Étirements balistiques (rebonds) : à éviter. Le mouvement de rebond peut provoquer des micro-déchirures musculaires et augmenter le risque de blessure, surtout sur muscles froids.",
        textEn: "Ballistic stretching (bouncing): avoid. The bouncing motion can cause muscle micro-tears and increase injury risk, especially on cold muscles.",
      },
    ],
  },
  {
    id: "activation-drills",
    title: "Activation et éducatifs",
    titleEn: "Activation & Drills",
    icon: "Activity",
    content: [
      {
        type: "paragraph",
        text: "Les éducatifs de course et exercices d'activation ciblent les muscles clés et les schémas moteurs spécifiques à la course. Pratiqués régulièrement, ils améliorent l'économie de course et préviennent les blessures.",
        textEn: "Running drills and activation exercises target key muscles and movement patterns specific to running. Practiced regularly, they improve running economy and prevent injuries.",
      },
      {
        type: "exercise",
        text: "Éducatifs de course",
        textEn: "Running-specific drills",
        exercises: [
          {
            name: "A-skip (skip avec montée de genou)",
            nameEn: "A-skip (skip with knee drive)",
            description: "Skipping en montant alternativement un genou haut avec un mouvement de griffé au sol. Travaille la fréquence et le placement du pied.",
            descriptionEn: "Skipping while alternately driving one knee high with a pawing ground contact. Works cadence and foot placement.",
            repetitions: 2,
            sets: 1,
          },
          {
            name: "B-skip (skip avec extension)",
            nameEn: "B-skip (skip with extension)",
            description: "Comme le A-skip mais avec une extension de la jambe avant le retour au sol. Travaille les ischio-jambiers et la mécanique de foulée.",
            descriptionEn: "Like A-skip but with a leg extension before returning to the ground. Works hamstrings and stride mechanics.",
            repetitions: 2,
            sets: 1,
          },
          {
            name: "Montées de genoux (high knees)",
            nameEn: "High knees",
            description: "Course sur place ou en avançant avec les genoux montés à hauteur des hanches. Rythme rapide, contact au sol bref.",
            descriptionEn: "Running in place or moving forward with knees driven to hip height. Fast rhythm, brief ground contact.",
            durationSeconds: 20,
            sets: 2,
          },
          {
            name: "Talons-fesses (butt kicks)",
            nameEn: "Butt kicks",
            description: "Course en ramenant les talons vers les fesses. Travaille la phase de retour de la jambe et la souplesse des quadriceps.",
            descriptionEn: "Running while bringing heels up to the glutes. Works the leg recovery phase and quadriceps flexibility.",
            durationSeconds: 20,
            sets: 2,
          },
        ],
      },
      {
        type: "exercise",
        text: "Activation des fessiers",
        textEn: "Glute activation",
        exercises: [
          {
            name: "Monster walks (marche en crabe avec élastique)",
            nameEn: "Monster walks (banded lateral walks)",
            description: "Élastique autour des chevilles, marche latérale en position semi-accroupie. Active le moyen fessier, stabilisateur clé du bassin.",
            descriptionEn: "Band around ankles, lateral walk in half-squat position. Activates the gluteus medius, a key pelvic stabilizer.",
            repetitions: 10,
            sets: 2,
          },
          {
            name: "Clamshells (ouvertures de hanche)",
            nameEn: "Clamshells (hip openers)",
            description: "Allongé sur le côté, genoux pliés, ouvrir le genou supérieur en gardant les pieds joints. Cible le moyen fessier.",
            descriptionEn: "Lying on side, knees bent, open the top knee while keeping feet together. Targets the gluteus medius.",
            repetitions: 12,
            sets: 2,
          },
          {
            name: "Pont sur une jambe (single leg bridge)",
            nameEn: "Single leg bridge",
            description: "Allongé sur le dos, un pied au sol, l'autre jambe tendue. Monter le bassin en serrant le fessier. Cible le grand fessier.",
            descriptionEn: "Lying on back, one foot on the ground, other leg extended. Raise hips by squeezing the glute. Targets the gluteus maximus.",
            repetitions: 10,
            sets: 2,
          },
        ],
      },
      {
        type: "exercise",
        text: "Activation du core",
        textEn: "Core activation",
        exercises: [
          {
            name: "Dead bugs",
            nameEn: "Dead bugs",
            description: "Allongé sur le dos, bras tendus vers le plafond, genoux à 90°. Étendre alternativement un bras et la jambe opposée sans cambrer le dos.",
            descriptionEn: "Lying on back, arms extended toward ceiling, knees at 90°. Alternately extend one arm and the opposite leg without arching the back.",
            repetitions: 8,
            sets: 2,
          },
          {
            name: "Bird dogs",
            nameEn: "Bird dogs",
            description: "À quatre pattes, étendre simultanément un bras et la jambe opposée. Maintenir le dos plat et le bassin stable.",
            descriptionEn: "On all fours, simultaneously extend one arm and the opposite leg. Keep the back flat and pelvis stable.",
            repetitions: 8,
            sets: 2,
          },
          {
            name: "Planche (plank)",
            nameEn: "Plank",
            description: "En appui sur les avant-bras et les orteils, corps aligné de la tête aux pieds. Serrer les abdominaux et les fessiers.",
            descriptionEn: "Supported on forearms and toes, body aligned from head to feet. Engage abs and glutes.",
            durationSeconds: 30,
            sets: 2,
          },
        ],
      },
      {
        type: "tip",
        text: "Les éducatifs améliorent l'économie de course de 2 à 8% selon les études. Intégrez 5 minutes de gammes après votre footing d'échauffement, 2 à 3 fois par semaine.",
        textEn: "Drills improve running economy by 2-8% according to studies. Include 5 minutes of drills after your warm-up jog, 2-3 times per week.",
      },
    ],
  },
];

export const warmupRoutines: WarmupRoutine[] = [
  {
    id: "easy-run-warmup",
    name: "Échauffement sortie facile",
    nameEn: "Easy Run Warm-up",
    targetSessionType: "easy",
    totalDurationMin: 10,
    exercises: [
      {
        name: "Marche rapide puis footing très facile",
        nameEn: "Brisk walk then very easy jog",
        description: "Commencer par 2 min de marche rapide puis passer à un footing très léger. Laisser le corps se réveiller naturellement.",
        descriptionEn: "Start with 2 min brisk walk then transition to a very light jog. Let the body wake up naturally.",
        durationSeconds: 300,
      },
      {
        name: "Balancements de jambes (avant-arrière)",
        nameEn: "Leg swings (front-to-back)",
        description: "Debout, en appui sur une jambe, balancer l'autre d'avant en arrière en augmentant progressivement l'amplitude.",
        descriptionEn: "Standing on one leg, swing the other forward and backward, gradually increasing the range of motion.",
        repetitions: 10,
        sets: 2,
      },
      {
        name: "Cercles de hanches",
        nameEn: "Hip circles",
        description: "Debout sur une jambe, faire des cercles avec le genou opposé levé. Alterner le sens et la jambe.",
        descriptionEn: "Standing on one leg, make circles with the opposite raised knee. Alternate direction and leg.",
        repetitions: 8,
        sets: 2,
      },
      {
        name: "Cercles de chevilles",
        nameEn: "Ankle circles",
        description: "Pied levé, faire tourner la cheville dans les deux sens. Prépare l'articulation de la cheville et le tendon d'Achille.",
        descriptionEn: "Foot raised, rotate the ankle in both directions. Prepares the ankle joint and Achilles tendon.",
        repetitions: 10,
        sets: 2,
      },
      {
        name: "Lignes droites douces",
        nameEn: "Gentle strides",
        description: "2 accélérations progressives de 60-80 m, sans forcer. Monter jusqu'à une allure confortable puis ralentir.",
        descriptionEn: "2 progressive accelerations of 60-80m, without forcing. Build to a comfortable pace then slow down.",
        repetitions: 2,
      },
    ],
  },
  {
    id: "interval-session-warmup",
    name: "Échauffement séance de fractionné",
    nameEn: "Interval Session Warm-up",
    targetSessionType: "intervals",
    totalDurationMin: 18,
    exercises: [
      {
        name: "Footing progressif",
        nameEn: "Progressive jog",
        description: "10 min de footing en augmentant progressivement l'allure : commencer en Z1 et terminer en Z2 haut.",
        descriptionEn: "10 min jog progressively increasing pace: start in Z1 and finish in upper Z2.",
        durationSeconds: 600,
      },
      {
        name: "Balancements de jambes (avant-arrière et latéral)",
        nameEn: "Leg swings (front-to-back and lateral)",
        description: "10 balancements avant-arrière puis 10 balancements latéraux par jambe. Amplitude croissante.",
        descriptionEn: "10 front-to-back swings then 10 lateral swings per leg. Increasing range of motion.",
        repetitions: 10,
        sets: 2,
      },
      {
        name: "A-skip",
        nameEn: "A-skip",
        description: "Skipping en montant alternativement un genou haut. 2 longueurs de 30 m.",
        descriptionEn: "Skipping while alternately driving one knee high. 2 lengths of 30m.",
        repetitions: 2,
      },
      {
        name: "B-skip",
        nameEn: "B-skip",
        description: "Comme le A-skip avec extension de la jambe. 2 longueurs de 30 m.",
        descriptionEn: "Like A-skip with leg extension. 2 lengths of 30m.",
        repetitions: 2,
      },
      {
        name: "Montées de genoux",
        nameEn: "High knees",
        description: "Course sur place avec genoux montés à hauteur des hanches. Rythme rapide.",
        descriptionEn: "Running in place with knees driven to hip height. Fast rhythm.",
        durationSeconds: 20,
        sets: 2,
      },
      {
        name: "Talons-fesses",
        nameEn: "Butt kicks",
        description: "Course en ramenant les talons vers les fesses. Maintenir un rythme soutenu.",
        descriptionEn: "Running while bringing heels to glutes. Maintain a brisk rhythm.",
        durationSeconds: 20,
        sets: 2,
      },
      {
        name: "Lignes droites progressives",
        nameEn: "Progressive strides",
        description: "4 accélérations de 100 m en montant progressivement jusqu'à l'allure Z4. Récupération en marchant entre chaque.",
        descriptionEn: "4 accelerations of 100m building progressively to Z4 pace. Walk recovery between each.",
        repetitions: 4,
      },
    ],
  },
  {
    id: "long-run-warmup",
    name: "Échauffement sortie longue",
    nameEn: "Long Run Warm-up",
    targetSessionType: "long_run",
    totalDurationMin: 10,
    exercises: [
      {
        name: "Marche puis footing très facile",
        nameEn: "Walk then very easy jog",
        description: "5 min de marche facile progressant vers un footing très léger. L'objectif est de réveiller le corps sans dépenser d'énergie.",
        descriptionEn: "5 min easy walk progressing to a very light jog. The goal is to wake the body up without spending energy.",
        durationSeconds: 300,
      },
      {
        name: "Balancements de jambes",
        nameEn: "Leg swings",
        description: "Balancements avant-arrière, 8-10 par jambe. Amplitude modérée, pas besoin de forcer.",
        descriptionEn: "Front-to-back swings, 8-10 per leg. Moderate range of motion, no need to force.",
        repetitions: 10,
        sets: 2,
      },
      {
        name: "Cercles de hanches",
        nameEn: "Hip circles",
        description: "Cercles du genou levé, 6-8 par jambe dans chaque sens. Mobilise les hanches pour la longue distance.",
        descriptionEn: "Raised knee circles, 6-8 per leg in each direction. Mobilizes hips for the long distance.",
        repetitions: 8,
        sets: 2,
      },
      {
        name: "Lignes droites douces",
        nameEn: "Gentle strides",
        description: "2 accélérations très légères de 50-60 m. Juste assez pour activer les jambes, sans intensité.",
        descriptionEn: "2 very light accelerations of 50-60m. Just enough to activate the legs, without intensity.",
        repetitions: 2,
      },
    ],
  },
  {
    id: "race-day-warmup",
    name: "Échauffement jour de course",
    nameEn: "Race Day Warm-up",
    targetSessionType: "race",
    totalDurationMin: 18,
    exercises: [
      {
        name: "Footing facile",
        nameEn: "Easy jog",
        description: "10 min de footing facile et régulier en Z1-Z2. Trouver un rythme confortable pour élever la température corporelle.",
        descriptionEn: "10 min easy and steady jog in Z1-Z2. Find a comfortable rhythm to raise body temperature.",
        durationSeconds: 600,
      },
      {
        name: "Balancements de jambes (avant-arrière et latéral)",
        nameEn: "Leg swings (front-to-back and lateral)",
        description: "10 balancements avant-arrière et 10 latéraux par jambe. Bien mobiliser les hanches.",
        descriptionEn: "10 front-to-back and 10 lateral swings per leg. Thoroughly mobilize the hips.",
        repetitions: 10,
        sets: 2,
      },
      {
        name: "A-skip",
        nameEn: "A-skip",
        description: "2 longueurs de 30 m. Montée de genou explosive avec contact au sol dynamique.",
        descriptionEn: "2 lengths of 30m. Explosive knee drive with dynamic ground contact.",
        repetitions: 2,
      },
      {
        name: "B-skip",
        nameEn: "B-skip",
        description: "2 longueurs de 30 m. Extension complète de la jambe, retour griffé au sol.",
        descriptionEn: "2 lengths of 30m. Full leg extension, pawing return to the ground.",
        repetitions: 2,
      },
      {
        name: "Montées de genoux",
        nameEn: "High knees",
        description: "2 séries de 15-20 secondes. Fréquence élevée, amplitude maximale.",
        descriptionEn: "2 sets of 15-20 seconds. High frequency, maximum range of motion.",
        durationSeconds: 20,
        sets: 2,
      },
      {
        name: "Talons-fesses",
        nameEn: "Butt kicks",
        description: "2 séries de 15-20 secondes. Talons rapides vers les fesses, maintenir le buste droit.",
        descriptionEn: "2 sets of 15-20 seconds. Quick heels to glutes, keep torso upright.",
        durationSeconds: 20,
        sets: 2,
      },
      {
        name: "Pas chassés",
        nameEn: "Lateral shuffles",
        description: "2 longueurs de 20 m dans chaque direction. Activer les adducteurs et abducteurs.",
        descriptionEn: "2 lengths of 20m in each direction. Activate adductors and abductors.",
        repetitions: 2,
        sets: 2,
      },
      {
        name: "Lignes droites à allure de course",
        nameEn: "Strides at race pace",
        description: "4-6 accélérations de 80 m à allure de course cible. Récupération en marchant 60-90 s entre chaque.",
        descriptionEn: "4-6 accelerations of 80m at target race pace. Walk recovery 60-90s between each.",
        repetitions: 5,
      },
      {
        name: "Repos avant départ",
        nameEn: "Rest before start",
        description: "5 min de repos en marchant doucement. Hydratation, positionnement dans le sas, concentration mentale.",
        descriptionEn: "5 min rest with gentle walking. Hydration, positioning in the corral, mental focus.",
        durationSeconds: 300,
      },
    ],
  },
];

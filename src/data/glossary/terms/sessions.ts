// src/data/glossary/terms/sessions.ts
// Training session types

import type { GlossaryTerm } from "../types";

export const sessionsTerms: GlossaryTerm[] = [
  {
    id: "tempo-run",
    term: "Tempo Run",
    termEn: "Tempo Run",
    category: "sessions",
    shortDefinition:
      "Course soutenue à allure 'confortablement difficile' au seuil aérobie.",
    shortDefinitionEn:
      "Sustained run at a 'comfortably hard' pace near aerobic threshold.",
    fullDefinition:
      "Le tempo run est une séance continue à une allure soutenue mais contrôlée, généralement autour de 75-85% de la VMA ou en zone 3. L'effort doit être 'confortablement difficile' : tu peux parler par phrases courtes mais pas tenir une conversation. C'est un excellent travail pour améliorer l'endurance au seuil et l'économie de course.",
    fullDefinitionEn:
      "A tempo run is a continuous session at a sustained but controlled pace, typically around 75-85% of MAS or in zone 3. The effort should be 'comfortably hard': you can speak in short phrases but cannot hold a conversation. It is excellent for improving threshold endurance and running economy.",
    example:
      "Tempo classique : 15 min échauffement, 20-40 min à allure tempo (environ 15-20 sec/km plus lent que ton allure 10 km), 10 min retour au calme.",
    exampleEn:
      "Classic tempo: 15 min warm-up, 20-40 min at tempo pace (about 15-20 sec/km slower than your 10K pace), 10 min cool-down.",
    relatedTerms: ["threshold", "zone-3", "seuil-aerobie"],
    zone: 3,
    keywords: ["tempo", "continu", "seuil", "soutenu", "allure"],
  },
  {
    id: "threshold",
    term: "Threshold",
    termEn: "Threshold",
    category: "sessions",
    shortDefinition:
      "Travail au seuil lactique, allure maximale soutenable 45-60 min.",
    shortDefinitionEn:
      "Lactate threshold work, maximum sustainable pace for 45-60 minutes.",
    fullDefinition:
      "Les séances threshold travaillent spécifiquement au niveau du seuil lactique (environ 85-90% VMA, zone 4). C'est l'intensité maximale à laquelle le lactate produit est encore évacué efficacement. Ces séances améliorent la capacité à maintenir une allure rapide sur de longues durées et sont essentielles pour les distances du 10 km au marathon.",
    fullDefinitionEn:
      "Threshold sessions specifically target lactate threshold intensity (approximately 85-90% MAS, zone 4). This is the maximum intensity at which lactate produced is still efficiently cleared. These sessions improve the ability to maintain a fast pace over long durations and are essential for distances from 10K to marathon.",
    example:
      "Séance threshold : 3x10 min au seuil avec 3 min de récupération trot. L'allure correspond approximativement à ton allure 15 km ou semi-marathon.",
    exampleEn:
      "Threshold session: 3x10 min at threshold with 3 min jog recovery. The pace roughly corresponds to your 15K or half-marathon pace.",
    relatedTerms: ["tempo-run", "zone-4", "seuil-lactique", "ftp"],
    zone: 4,
    keywords: ["seuil", "lactique", "intensité", "soutenu"],
  },
  {
    id: "intervals",
    term: "Intervals",
    termEn: "Intervals",
    category: "sessions",
    shortDefinition:
      "Alternance d'efforts intenses et de récupérations pour développer la VO2max.",
    shortDefinitionEn:
      "Alternating intense efforts and recoveries to develop VO2max.",
    fullDefinition:
      "Les intervalles (ou fractionné) alternent des périodes d'effort intense (90-105% VMA, zone 5) avec des périodes de récupération active ou passive. Le but est d'accumuler du temps à haute intensité pour stimuler les adaptations cardiovasculaires et neuromusculaires. La durée des intervalles varie selon l'objectif : courts (200-400m) pour la vitesse, moyens (800-1000m) pour la VO2max, longs (1500-2000m) pour le seuil.",
    fullDefinitionEn:
      "Intervals alternate periods of intense effort (90-105% MAS, zone 5) with active or passive recovery periods. The goal is to accumulate time at high intensity to stimulate cardiovascular and neuromuscular adaptations. Interval duration varies by objective: short (200-400m) for speed, medium (800-1000m) for VO2max, long (1500-2000m) for threshold.",
    example:
      "Séance VO2max classique : 6x1000m à 100% VMA avec 2 min de récupération trot. Pour un athlète avec 15 km/h de VMA, chaque 1000m se fait en 4:00.",
    exampleEn:
      "Classic VO2max session: 6x1000m at 100% MAS with 2 min jog recovery. For an athlete with 15 km/h MAS, each 1000m is run in 4:00.",
    relatedTerms: ["vo2max", "zone-5", "vma", "active-recovery"],
    zone: 5,
    keywords: ["fractionné", "intense", "répétitions", "récupération", "VO2max"],
  },
  {
    id: "fartlek",
    term: "Fartlek",
    termEn: "Fartlek",
    category: "sessions",
    shortDefinition:
      "Jeu de vitesse avec variations d'allure non structurées.",
    shortDefinitionEn: "Speed play with unstructured pace variations.",
    fullDefinition:
      "Le fartlek (suédois pour 'jeu de vitesse') est une forme d'entraînement libre où l'athlète varie son allure selon les sensations ou le terrain, sans structure rigide. C'est excellent pour travailler plusieurs zones énergétiques dans la même séance, développer la capacité à changer de rythme, et rompre la monotonie des séances structurées.",
    fullDefinitionEn:
      "Fartlek (Swedish for 'speed play') is a free-form training where the athlete varies pace according to feel or terrain, without rigid structure. It is excellent for working multiple energy systems in the same session, developing the ability to change rhythm, and breaking the monotony of structured workouts.",
    example:
      "Fartlek en nature : pendant 45 min, accélère sur chaque côte, récupère dans les descentes, fais des accélérations de 30 sec quand tu en as envie. Laisse tes sensations guider l'intensité.",
    exampleEn:
      "Trail fartlek: for 45 min, accelerate on every hill, recover on descents, do 30-sec surges when you feel like it. Let your sensations guide the intensity.",
    relatedTerms: ["intervals", "tempo-run"],
    keywords: ["jeu", "vitesse", "libre", "variations", "suédois"],
  },
  {
    id: "brick",
    term: "Brick Workout",
    termEn: "Brick Workout",
    category: "sessions",
    shortDefinition:
      "Enchaînement de deux disciplines sans pause, typique du triathlon.",
    shortDefinitionEn:
      "Back-to-back two-discipline workout without rest, typical in triathlon.",
    fullDefinition:
      "Le brick est un entraînement spécifique au triathlon et duathlon qui enchaîne deux disciplines sans ou avec très peu de récupération. Le plus courant est le brick vélo-course à pied. L'objectif est d'habituer le corps à la transition, particulièrement les jambes qui doivent passer du pédalage à la foulée. Le nom viendrait de la sensation de 'jambes de briques' lors des premières transitions.",
    fullDefinitionEn:
      "A brick is a triathlon and duathlon-specific workout that chains two disciplines with little or no recovery between them. The most common is the bike-run brick. The goal is to accustom the body to transition, particularly the legs which must switch from pedaling to running. The name reportedly comes from the 'brick legs' feeling during early transitions.",
    example:
      "Brick standard : 1h30 de vélo en endurance, puis enchaînement immédiat avec 20-30 min de course à pied. Les premiers kilomètres à pied seront inconfortables, c'est normal.",
    exampleEn:
      "Standard brick: 1h30 endurance bike, then immediately transition to 20-30 min run. The first kilometers running will feel uncomfortable, that's normal.",
    relatedTerms: ["long-run", "tempo-run"],
    keywords: ["triathlon", "enchaînement", "transition", "vélo", "course"],
  },
  {
    id: "recovery-run",
    term: "Recovery Run",
    termEn: "Recovery Run",
    category: "sessions",
    shortDefinition:
      "Footing très lent pour favoriser la récupération active.",
    shortDefinitionEn: "Very slow jog to promote active recovery.",
    fullDefinition:
      "Le recovery run (ou footing de récupération) est une sortie très facile, en zone 1, dont le seul but est de favoriser la récupération en augmentant légèrement le flux sanguin sans créer de stress supplémentaire. L'allure doit permettre de parler facilement. Si tu ne peux pas tenir une conversation, tu vas trop vite.",
    fullDefinitionEn:
      "A recovery run is a very easy outing in zone 1, with the sole purpose of promoting recovery by slightly increasing blood flow without creating additional stress. The pace should allow easy conversation. If you cannot hold a conversation, you are going too fast.",
    example:
      "Le lendemain d'une séance de fractionné intense : 30-40 min de footing très lent (60-70% FC max), en se concentrant sur la relaxation et la récupération.",
    exampleEn:
      "The day after an intense interval session: 30-40 min very slow jog (60-70% max HR), focusing on relaxation and recovery.",
    relatedTerms: ["zone-1", "recovery", "endurance-fondamentale"],
    zone: 1,
    keywords: ["récupération", "facile", "lent", "actif", "repos"],
  },
  {
    id: "long-run",
    term: "Long Run",
    termEn: "Long Run",
    category: "sessions",
    shortDefinition:
      "Sortie longue développant l'endurance et les adaptations aérobies.",
    shortDefinitionEn:
      "Extended run developing endurance and aerobic adaptations.",
    fullDefinition:
      "La sortie longue est la séance clé pour le développement de l'endurance, particulièrement importante pour le semi-marathon et le marathon. Elle développe les adaptations aérobies (capillarisation, densité mitochondriale), améliore l'utilisation des graisses comme carburant, et prépare mentalement aux efforts prolongés. L'allure est généralement en zone 2, parfois avec une partie finale plus rapide (progressive).",
    fullDefinitionEn:
      "The long run is the key session for endurance development, particularly important for half-marathon and marathon. It develops aerobic adaptations (capillarization, mitochondrial density), improves fat utilization as fuel, and mentally prepares for prolonged efforts. The pace is generally in zone 2, sometimes with a faster finishing segment (progressive).",
    example:
      "Sortie longue marathon : 2h30-3h en zone 2, soit environ 1 min/km plus lent que ton allure marathon. Profite pour tester ta nutrition et ton hydratation.",
    exampleEn:
      "Marathon long run: 2h30-3h in zone 2, approximately 1 min/km slower than your marathon pace. Use it to test your nutrition and hydration.",
    relatedTerms: ["zone-2", "endurance-fondamentale", "marathon"],
    zone: 2,
    keywords: ["longue", "endurance", "marathon", "aérobie", "volume"],
  },
  {
    id: "race-pace",
    term: "Race Pace",
    termEn: "Race Pace",
    category: "sessions",
    shortDefinition:
      "Travail à l'allure spécifique de compétition visée.",
    shortDefinitionEn: "Training at target race-specific pace.",
    fullDefinition:
      "Les séances race pace sont des entraînements à l'allure exacte visée en compétition. Elles permettent de calibrer le rythme, d'habituer le corps à cet effort spécifique, et de développer la confiance. La durée totale à allure course augmente progressivement au fil du plan.",
    fullDefinitionEn:
      "Race pace sessions are workouts at the exact target race pace. They help calibrate rhythm, accustom the body to this specific effort, and build confidence. The total duration at race pace increases progressively throughout the training plan.",
    example:
      "Race pace marathon : après échauffement, 3x3 km à ton allure marathon cible avec 1 km de récupération trot. Si tu vises 3h30, chaque segment de 3 km doit être en 15:00.",
    exampleEn:
      "Marathon race pace: after warm-up, 3x3 km at your target marathon pace with 1 km jog recovery. If targeting 3h30, each 3 km segment should be 15:00.",
    relatedTerms: ["threshold", "tempo-run", "peaking"],
    keywords: ["spécifique", "compétition", "allure", "cible"],
  },
  {
    id: "hill-repeats",
    term: "Hill Repeats",
    termEn: "Hill Repeats",
    category: "sessions",
    shortDefinition:
      "Répétitions en côte pour développer force et puissance.",
    shortDefinitionEn: "Hill repetitions to develop strength and power.",
    fullDefinition:
      "Les hill repeats (ou répétitions en côte) consistent à courir des montées à haute intensité puis à redescendre en récupération. Elles développent la force musculaire spécifique à la course, la puissance, et améliorent l'économie de course. C'est aussi un excellent travail cardiovasculaire avec moins de stress articulaire que le fractionné sur plat.",
    fullDefinitionEn:
      "Hill repeats consist of running uphill at high intensity then descending for recovery. They develop running-specific muscle strength, power, and improve running economy. It is also excellent cardiovascular work with less joint stress than flat intervals.",
    example:
      "Séance côtes : 8-10 x 60-90 sec de montée à effort soutenu (RPE 8-9), redescente en trottant pour récupérer. Cherche une côte avec 6-10% de pente.",
    exampleEn:
      "Hill session: 8-10 x 60-90 sec uphill at sustained effort (RPE 8-9), jog down to recover. Look for a hill with 6-10% gradient.",
    relatedTerms: ["intervals", "zone-5"],
    zone: 5,
    keywords: ["côte", "montée", "force", "puissance", "pente"],
  },
  {
    id: "strides",
    term: "Strides",
    termEn: "Strides",
    category: "sessions",
    shortDefinition:
      "Accélérations courtes et fluides pour travailler la technique et la vitesse.",
    shortDefinitionEn:
      "Short, fluid accelerations to work on technique and speed.",
    fullDefinition:
      "Les strides (ou accélérations, lignes droites) sont des courses courtes (80-100m, 15-20 sec) à vitesse sub-maximale (~90-95% du max) avec une technique relâchée. Elles se font généralement après l'échauffement ou en fin de footing. Elles maintiennent les qualités de vitesse, améliorent l'économie de course et préparent le corps aux efforts intenses sans créer de fatigue significative.",
    fullDefinitionEn:
      "Strides are short runs (80-100m, 15-20 sec) at sub-maximal speed (~90-95% of max) with relaxed technique. They are typically done after warm-up or at the end of an easy run. They maintain speed qualities, improve running economy, and prepare the body for intense efforts without creating significant fatigue.",
    example:
      "En fin de footing de récupération : 4-6 x 80m d'accélérations progressives, en se concentrant sur une foulée fluide et relâchée. Récupération complète entre chaque (marche ou trot lent).",
    exampleEn:
      "At the end of a recovery jog: 4-6 x 80m progressive accelerations, focusing on a fluid and relaxed stride. Complete recovery between each (walk or slow jog).",
    relatedTerms: ["running-economy", "cadence"],
    keywords: ["accélération", "vitesse", "technique", "court", "fluide"],
  },
  {
    id: "negative-split",
    term: "Negative Split",
    termEn: "Negative Split",
    category: "sessions",
    shortDefinition:
      "Stratégie où la deuxième moitié est courue plus vite que la première.",
    shortDefinitionEn:
      "Strategy where the second half is run faster than the first.",
    fullDefinition:
      "Le negative split est une stratégie de course où la deuxième moitié est courue plus rapidement que la première. C'est considéré comme la stratégie optimale pour les courses d'endurance car elle permet une meilleure gestion énergétique et évite de partir trop vite. En entraînement, c'est aussi un excellent exercice de discipline et de lecture des sensations.",
    fullDefinitionEn:
      "Negative split is a racing strategy where the second half is run faster than the first. It is considered the optimal strategy for endurance races as it allows better energy management and avoids starting too fast. In training, it is also an excellent exercise in discipline and reading sensations.",
    example:
      "Sortie longue de 2h en negative split : première heure à 5:30/km, deuxième heure à 5:15/km. Tu devrais te sentir mieux dans la deuxième partie.",
    exampleEn:
      "2-hour long run with negative split: first hour at 5:30/km, second hour at 5:15/km. You should feel better in the second half.",
    relatedTerms: ["progressive-run", "race-pace"],
    keywords: ["stratégie", "moitié", "accélération", "gestion"],
  },
  {
    id: "progressive-run",
    term: "Progressive Run",
    termEn: "Progressive Run",
    category: "sessions",
    shortDefinition:
      "Course avec augmentation graduelle de l'allure du début à la fin.",
    shortDefinitionEn:
      "Run with gradual pace increase from start to finish.",
    fullDefinition:
      "La sortie progressive (ou progression run) commence lentement et accélère graduellement jusqu'à une allure soutenue. Elle enseigne la patience en début de sortie, développe la capacité à accélérer sur fatigue, et permet de travailler plusieurs zones dans la même séance de manière naturelle.",
    fullDefinitionEn:
      "A progressive run starts slowly and gradually accelerates to a sustained pace. It teaches patience at the start, develops the ability to accelerate on fatigue, and allows working multiple zones in the same session naturally.",
    example:
      "Progressive 1h : 20 min en zone 2, 20 min en zone 3, 20 min en zone 4. Chaque partie est un peu plus rapide que la précédente.",
    exampleEn:
      "1-hour progressive: 20 min in zone 2, 20 min in zone 3, 20 min in zone 4. Each part is slightly faster than the previous.",
    relatedTerms: ["negative-split", "tempo-run"],
    keywords: ["progressive", "accélération", "graduel", "zones"],
  },
  {
    id: "sweet-spot",
    term: "Sweet Spot",
    termEn: "Sweet Spot",
    category: "sessions",
    shortDefinition:
      "Zone d'intensité juste sous le seuil, offrant un excellent rapport effort/bénéfice.",
    shortDefinitionEn:
      "Intensity zone just below threshold, offering excellent effort-to-benefit ratio.",
    fullDefinition:
      "Le sweet spot est une zone d'intensité située entre 84-97% du FTP (ou 88-93% du seuil en course). Elle offre un excellent compromis entre stress d'entraînement et récupérabilité : assez intense pour stimuler des adaptations significatives, mais pas assez pour nécessiter une récupération prolongée. Particulièrement populaire en cyclisme.",
    fullDefinitionEn:
      "Sweet spot is an intensity zone between 84-97% of FTP (or 88-93% of threshold in running). It offers an excellent compromise between training stress and recoverability: intense enough to stimulate significant adaptations, but not enough to require prolonged recovery. Particularly popular in cycling.",
    example:
      "Séance sweet spot vélo : 2x20 min à 90% FTP avec 5 min de récupération. C'est dur mais soutenable, et tu peux refaire une séance de qualité 48h après.",
    exampleEn:
      "Sweet spot cycling session: 2x20 min at 90% FTP with 5 min recovery. It's hard but sustainable, and you can do another quality session 48 hours later.",
    relatedTerms: ["threshold", "ftp", "zone-3", "zone-4"],
    zone: 3,
    keywords: ["intensité", "seuil", "cyclisme", "efficace"],
  },
  {
    id: "over-unders",
    term: "Over-Unders",
    termEn: "Over-Unders",
    category: "sessions",
    shortDefinition:
      "Intervalles alternant juste au-dessus et en-dessous du seuil.",
    shortDefinitionEn:
      "Intervals alternating just above and below threshold.",
    fullDefinition:
      "Les over-unders sont des intervalles qui alternent des périodes légèrement au-dessus du seuil avec des périodes légèrement en-dessous, sans vraie récupération. Cette séance développe la capacité à évacuer le lactate tout en maintenant un effort élevé, simulant les variations de rythme en course ou les relances après les côtes.",
    fullDefinitionEn:
      "Over-unders are intervals alternating periods slightly above threshold with periods slightly below, without true recovery. This session develops the ability to clear lactate while maintaining high effort, simulating race-pace variations or surges after climbs.",
    example:
      "Over-under vélo : 3x12 min alternant 2 min à 105% FTP / 1 min à 90% FTP, sans pause. Récupération de 5 min entre les blocs.",
    exampleEn:
      "Over-under cycling: 3x12 min alternating 2 min at 105% FTP / 1 min at 90% FTP, without pause. 5 min recovery between blocks.",
    relatedTerms: ["threshold", "ftp", "intervals"],
    zone: 4,
    keywords: ["seuil", "alternance", "lactate", "cyclisme"],
  },
  {
    id: "surge",
    term: "Surge",
    termEn: "Surge",
    category: "sessions",
    shortDefinition:
      "Accélération brève et franche insérée dans un effort continu, généralement 20-40 secondes.",
    shortDefinitionEn:
      "Brief, sharp acceleration inserted within a continuous effort, typically 20-40 seconds.",
    fullDefinition:
      "Un surge est une accélération brève (20-40 secondes) à haute intensité insérée au sein d'un effort continu (tempo, sortie longue, course). Contrairement à un intervalle classique, le surge ne s'accompagne pas d'une récupération facile : le coureur revient immédiatement à l'allure de base. Les surges entraînent le cycle production-résorption du lactate en charge et simulent les changements de rythme en course (relances après virage, accélérations tactiques, montées).",
    fullDefinitionEn:
      "A surge is a brief (20-40 second) high-intensity acceleration inserted within a continuous effort (tempo, long run, race). Unlike a classic interval, a surge is not followed by easy recovery: the runner immediately returns to base pace. Surges train the lactate production-clearance cycle under load and simulate race pace changes (accelerations after turns, tactical surges, climbs).",
    example:
      "Tempo avec surges : pendant un tempo de 25 min en Z3, insérer un surge de 30s à allure 5K toutes les 5 minutes, puis revenir immédiatement au tempo.",
    exampleEn:
      "Tempo with surges: during a 25 min Z3 tempo, insert a 30s surge at 5K pace every 5 minutes, then immediately return to tempo pace.",
    relatedTerms: ["tempo-run", "fartlek", "intervals"],
    zone: 5,
    keywords: ["surge", "accélération", "relance", "lactate", "changement de rythme"],
  },
  {
    id: "sprint",
    term: "Sprint",
    termEn: "Sprint",
    category: "sessions",
    shortDefinition:
      "Effort maximal très court développant la puissance neuromusculaire.",
    shortDefinitionEn:
      "Very short maximal effort developing neuromuscular power.",
    fullDefinition:
      "Les sprints sont des efforts maximaux de quelques secondes à 30 secondes, en zone 6. Ils développent la puissance neuromusculaire, la capacité anaérobie et l'explosivité. Bien qu'ils semblent éloignés des besoins de l'endurance, ils améliorent l'économie de course et la capacité à finir fort. La récupération entre les sprints doit être complète (2-3 min minimum).",
    fullDefinitionEn:
      "Sprints are maximal efforts of a few seconds to 30 seconds, in zone 6. They develop neuromuscular power, anaerobic capacity, and explosiveness. Although they seem far from endurance needs, they improve running economy and the ability to finish strong. Recovery between sprints must be complete (2-3 min minimum).",
    example:
      "Séance sprints : 8x100m à fond avec 2-3 min de récupération marche/trot. L'allure doit être réellement maximale sur chaque répétition.",
    exampleEn:
      "Sprint session: 8x100m all-out with 2-3 min walk/jog recovery. The pace should be truly maximal on each repetition.",
    relatedTerms: ["zone-6", "capacite-anaerobie", "strides"],
    zone: 6,
    keywords: ["maximal", "explosif", "court", "puissance", "vitesse"],
  },
  {
    id: "pyramide",
    term: "Pyramide",
    termEn: "Pyramid Workout",
    category: "sessions",
    shortDefinition:
      "Intervalles de durée croissante puis décroissante (ou l'inverse).",
    shortDefinitionEn:
      "Intervals with increasing then decreasing duration (or vice versa).",
    fullDefinition:
      "Une séance pyramide varie la durée des intervalles de façon progressive : montée (200m-400m-600m-800m) puis descente (600m-400m-200m), ou l'inverse. Cette structure apporte de la variété mentale, permet de travailler différentes allures dans la même séance, et enseigne la gestion de l'effort. Les pyramides peuvent cibler différentes zones selon l'objectif.",
    fullDefinitionEn:
      "A pyramid session varies interval duration progressively: ascending (200m-400m-600m-800m) then descending (600m-400m-200m), or vice versa. This structure provides mental variety, allows working different paces in the same session, and teaches effort management. Pyramids can target different zones depending on the objective.",
    example:
      "Pyramide classique VO2max : 200m-400m-600m-800m-600m-400m-200m à 100-105% VMA. Récupération = moitié du temps d'effort.",
    exampleEn:
      "Classic VO2max pyramid: 200m-400m-600m-800m-600m-400m-200m at 100-105% MAS. Recovery = half the effort time.",
    relatedTerms: ["intervals", "zone-5", "vma"],
    zone: 5,
    keywords: ["pyramide", "intervalles", "variété", "croissant", "décroissant"],
  },
  {
    id: "sortie-longue-progressive",
    term: "Sortie Longue Progressive",
    termEn: "Progressive Long Run",
    category: "sessions",
    shortDefinition:
      "Sortie longue avec accélération vers l'allure marathon en fin de séance.",
    shortDefinitionEn:
      "Long run with acceleration towards marathon pace at the end.",
    fullDefinition:
      "La sortie longue progressive combine le volume de la sortie longue classique avec un travail spécifique à allure marathon. Elle commence en zone 2 et termine les 30-60 dernières minutes à allure marathon ou légèrement plus vite. Cette séance simule les conditions de fin de marathon (fatigue + allure) et développe la confiance.",
    fullDefinitionEn:
      "The progressive long run combines the volume of a classic long run with specific marathon-pace work. It starts in zone 2 and finishes the last 30-60 minutes at marathon pace or slightly faster. This session simulates end-of-marathon conditions (fatigue + pace) and builds confidence.",
    example:
      "SLP marathon : 2h30 total avec 1h30 en zone 2, puis les 60 dernières minutes à allure marathon. Idéal 3-4 semaines avant la course.",
    exampleEn:
      "Progressive long run for marathon: 2h30 total with 1h30 in zone 2, then the last 60 minutes at marathon pace. Ideal 3-4 weeks before the race.",
    relatedTerms: ["long-run", "marathon", "race-pace", "progressive-run"],
    zone: 2,
    keywords: ["longue", "marathon", "progressive", "spécifique", "simulation"],
  },
];

// src/data/glossary/terms/physiology.ts
// Physiological concepts and mechanisms

import type { GlossaryTerm } from "../types";

export const physiologyTerms: GlossaryTerm[] = [
  {
    id: "vo2max",
    term: "VO2max",
    termEn: "VO2max",
    termIt: "VO2max",
    category: "physiology",
    shortDefinition:
      "Consommation maximale d'oxygène, indicateur de la capacité aérobie.",
    shortDefinitionEn:
      "Maximum oxygen consumption, indicator of aerobic capacity.",
    shortDefinitionIt:
      "Massimo consumo di ossigeno, indicatore della capacità aerobica.",
    fullDefinition:
      "La VO2max (Volume d'Oxygène Maximal) représente la quantité maximale d'oxygène que le corps peut utiliser par minute pendant un effort intense. Exprimée en ml/kg/min, c'est un indicateur majeur de la capacité aérobie. Elle dépend de facteurs centraux (débit cardiaque) et périphériques (extraction musculaire de l'O2). Elle est en grande partie génétique mais peut être améliorée de 15-25% par l'entraînement.",
    fullDefinitionEn:
      "VO2max (Maximum Oxygen Volume) represents the maximum amount of oxygen the body can use per minute during intense effort. Expressed in ml/kg/min, it is a major indicator of aerobic capacity. It depends on central factors (cardiac output) and peripheral factors (muscle O2 extraction). It is largely genetic but can be improved by 15-25% through training.",
    fullDefinitionIt:
      "La VO2max (Volume Massimo di Ossigeno) rappresenta la quantità massima di ossigeno che il corpo può utilizzare al minuto durante uno sforzo intenso. Espressa in ml/kg/min, è un indicatore chiave della capacità aerobica. Dipende da fattori centrali (gittata cardiaca) e periferici (estrazione muscolare di O2). È in gran parte genetica ma può essere migliorata del 15-25% con l'allenamento.",
    example:
      "Un sédentaire a une VO2max de 35-40 ml/kg/min, un coureur amateur entraîné 50-60, et un élite mondial 80-90+. Kipchoge est estimé à ~85 ml/kg/min.",
    exampleEn:
      "A sedentary person has a VO2max of 35-40 ml/kg/min, a trained amateur runner 50-60, and a world-class elite 80-90+. Kipchoge is estimated at ~85 ml/kg/min.",
    exampleIt:
      "Un sedentario ha una VO2max di 35-40 ml/kg/min, un runner amatore allenato 50-60, e un élite mondiale 80-90+. Kipchoge è stimato intorno a ~85 ml/kg/min.",
    relatedTerms: ["vma", "zone-5", "intervals"],
    zone: 5,
    keywords: ["oxygène", "capacité", "aérobie", "maximum", "consommation"],
    externalLinks: [
      {
        label: "Limiting factors for VO2max and endurance performance",
        url: "https://pubmed.ncbi.nlm.nih.gov/10647532/",
        author: "Bassett & Howley",
      },
    ],
  },
  {
    id: "lactate-threshold",
    term: "Seuil Lactique",
    termEn: "Lactate Threshold",
    termIt: "Soglia Lattacida",
    category: "physiology",
    shortDefinition:
      "Intensité où le lactate commence à s'accumuler plus vite qu'il n'est éliminé.",
    shortDefinitionEn:
      "Intensity where lactate starts accumulating faster than it is cleared.",
    shortDefinitionIt:
      "Intensità oltre la quale il lattato inizia ad accumularsi più velocemente di quanto venga smaltito.",
    fullDefinition:
      "Le seuil lactique représente l'intensité d'exercice au-delà de laquelle le lactate sanguin s'accumule de manière exponentielle. À cette intensité (environ 4 mmol/L), la production de lactate par les muscles dépasse la capacité d'élimination. C'est un meilleur prédicteur de performance en endurance que la VO2max car il indique la fraction de la capacité aérobie soutenable longtemps.",
    fullDefinitionEn:
      "Lactate threshold represents the exercise intensity beyond which blood lactate accumulates exponentially. At this intensity (approximately 4 mmol/L), lactate production by muscles exceeds clearance capacity. It is a better predictor of endurance performance than VO2max as it indicates the fraction of aerobic capacity sustainable for long periods.",
    fullDefinitionIt:
      "La soglia lattacida (o soglia anaerobica) rappresenta l'intensità di esercizio oltre la quale il lattato ematico si accumula in modo esponenziale. A questa intensità (circa 4 mmol/L), la produzione di lattato da parte dei muscoli supera la capacità di smaltimento. È un predittore di prestazione negli sport di resistenza migliore della VO2max perché indica la frazione di capacità aerobica sostenibile a lungo.",
    example:
      "Un athlète peut avoir un seuil lactique à 85% de sa VO2max, lui permettant de maintenir cette intensité 45-60 min. Améliorer ce pourcentage est clé pour la performance.",
    exampleEn:
      "An athlete may have a lactate threshold at 85% of their VO2max, allowing them to maintain this intensity for 45-60 min. Improving this percentage is key to performance.",
    exampleIt:
      "Un atleta può avere la soglia lattacida all'85% della propria VO2max, riuscendo a mantenere questa intensità per 45-60 minuti. Migliorare questa percentuale è fondamentale per la prestazione.",
    relatedTerms: ["threshold", "zone-4", "seuil-lactique"],
    zone: 4,
    keywords: ["lactate", "seuil", "accumulation", "endurance"],
    externalLinks: [
      {
        label: "Lactate Threshold Concepts: How Valid Are They?",
        url: "https://pubmed.ncbi.nlm.nih.gov/19453206/",
        author: "Faude et al.",
      },
    ],
  },
  {
    id: "aerobic-capacity",
    term: "Capacité Aérobie",
    termEn: "Aerobic Capacity",
    termIt: "Capacità Aerobica",
    category: "physiology",
    shortDefinition:
      "Aptitude à produire de l'énergie via le système aérobie utilisant l'oxygène.",
    shortDefinitionEn:
      "Ability to produce energy via the aerobic system using oxygen.",
    shortDefinitionIt:
      "Capacità di produrre energia attraverso il sistema aerobico utilizzando l'ossigeno.",
    fullDefinition:
      "La capacité aérobie représente l'ensemble des aptitudes du corps à produire de l'énergie en utilisant l'oxygène. Elle dépend de plusieurs facteurs : le système cardiovasculaire (apport d'O2), la densité capillaire (distribution), les mitochondries (utilisation) et la disponibilité des substrats (glycogène, graisses). C'est la base de toute performance en endurance.",
    fullDefinitionEn:
      "Aerobic capacity represents the body's overall ability to produce energy using oxygen. It depends on several factors: the cardiovascular system (O2 delivery), capillary density (distribution), mitochondria (utilization), and substrate availability (glycogen, fat). It is the foundation of all endurance performance.",
    fullDefinitionIt:
      "La capacità aerobica rappresenta l'insieme delle attitudini del corpo a produrre energia utilizzando l'ossigeno. Dipende da diversi fattori: il sistema cardiovascolare (apporto di O2), la densità capillare (distribuzione), i mitocondri (utilizzo) e la disponibilità dei substrati (glicogeno, grassi). È la base di ogni prestazione di resistenza.",
    example:
      "Améliorer sa capacité aérobie se fait principalement par le volume d'entraînement en zone 2, qui développe les mitochondries et la capillarisation musculaire.",
    exampleEn:
      "Improving aerobic capacity is primarily done through zone 2 training volume, which develops mitochondria and muscle capillarization.",
    exampleIt:
      "Migliorare la capacità aerobica avviene principalmente tramite il volume di allenamento in zona 2, che sviluppa i mitocondri e la capillarizzazione muscolare.",
    relatedTerms: ["vo2max", "zone-2", "endurance-fondamentale"],
    zone: 2,
    keywords: ["aérobie", "oxygène", "mitochondries", "endurance"],
  },
  {
    id: "running-economy",
    term: "Économie de Course",
    termEn: "Running Economy",
    termIt: "Economia di Corsa",
    category: "physiology",
    shortDefinition:
      "Efficacité énergétique à une vitesse donnée, moins d'O2 = meilleure économie.",
    shortDefinitionEn:
      "Energy efficiency at a given speed, less O2 = better economy.",
    shortDefinitionIt:
      "Efficienza energetica a una determinata velocità: meno O2 consumato = migliore economia.",
    fullDefinition:
      "L'économie de course mesure la quantité d'oxygène (et donc d'énergie) nécessaire pour maintenir une vitesse donnée. Deux coureurs avec la même VO2max peuvent avoir des performances très différentes si l'un a une meilleure économie. Elle dépend de la biomécanique, de l'élasticité tendineuse, du poids corporel et des fibres musculaires. Elle s'améliore avec les années de pratique et le travail technique.",
    fullDefinitionEn:
      "Running economy measures the amount of oxygen (and therefore energy) needed to maintain a given speed. Two runners with the same VO2max can have very different performances if one has better economy. It depends on biomechanics, tendon elasticity, body weight, and muscle fiber type. It improves with years of practice and technical work.",
    fullDefinitionIt:
      "L'economia di corsa misura la quantità di ossigeno (e quindi di energia) necessaria per mantenere una determinata velocità. Due runner con la stessa VO2max possono avere prestazioni molto diverse se uno ha una migliore economia. Dipende dalla biomeccanica, dall'elasticità tendinea, dal peso corporeo e dalle fibre muscolari. Migliora con gli anni di pratica e il lavoro tecnico.",
    example:
      "Les coureurs kényans ont souvent une excellente économie de course grâce à des jambes légères, une foulée efficace, et des années de course pieds nus pendant l'enfance.",
    exampleEn:
      "Kenyan runners often have excellent running economy thanks to light legs, efficient stride, and years of barefoot running during childhood.",
    exampleIt:
      "I runner kenioti hanno spesso un'eccellente economia di corsa grazie a gambe leggere, una falcata efficiente e anni di corsa a piedi nudi durante l'infanzia.",
    relatedTerms: ["vo2max", "cadence", "strides"],
    keywords: ["efficacité", "biomécanique", "oxygène", "foulée"],
    externalLinks: [
      {
        label: "Factors Affecting Running Economy in Trained Distance Runners",
        url: "https://pubmed.ncbi.nlm.nih.gov/15233599/",
        author: "Saunders et al.",
      },
    ],
  },
  {
    id: "cadence",
    term: "Cadence",
    termEn: "Cadence",
    termIt: "Cadenza",
    category: "physiology",
    shortDefinition:
      "Nombre de pas par minute en course, ou de tours de pédale par minute en vélo.",
    shortDefinitionEn:
      "Steps per minute when running, or pedal revolutions per minute when cycling.",
    shortDefinitionIt:
      "Numero di passi al minuto nella corsa, o di pedalate al minuto nel ciclismo.",
    fullDefinition:
      "La cadence représente la fréquence des mouvements cycliques : pas/min en course (typiquement 160-190 spm pour les coureurs efficaces), ou tours/min en vélo (généralement 80-100 rpm). Une cadence plus élevée réduit généralement le stress articulaire et améliore l'économie, mais la cadence optimale varie selon les individus et les situations.",
    fullDefinitionEn:
      "Cadence represents the frequency of cyclic movements: steps/min when running (typically 160-190 spm for efficient runners), or revolutions/min when cycling (generally 80-100 rpm). Higher cadence generally reduces joint stress and improves economy, but optimal cadence varies by individual and situation.",
    fullDefinitionIt:
      "La cadenza rappresenta la frequenza dei movimenti ciclici: passi/min nella corsa (tipicamente 160-190 spm per i runner efficienti), o giri/min nel ciclismo (generalmente 80-100 rpm). Una cadenza più elevata riduce generalmente lo stress articolare e migliora l'economia, ma la cadenza ottimale varia in base all'individuo e alla situazione.",
    example:
      "La cadence 'idéale' de 180 spm est un mythe : elle varie selon la vitesse et l'anatomie. L'important est d'éviter les cadences très basses (< 160 spm) qui augmentent l'impact.",
    exampleEn:
      "The 'ideal' 180 spm cadence is a myth: it varies by speed and anatomy. The important thing is to avoid very low cadences (< 160 spm) which increase impact.",
    exampleIt:
      "La cadenza 'ideale' di 180 spm è un mito: varia in base alla velocità e all'anatomia. L'importante è evitare cadenze molto basse (< 160 spm) che aumentano l'impatto.",
    relatedTerms: ["running-economy", "strides"],
    keywords: ["fréquence", "pas", "pédale", "rpm", "spm"],
  },
  {
    id: "power-to-weight",
    term: "Rapport Puissance/Poids",
    termEn: "Power-to-Weight Ratio",
    termIt: "Rapporto Potenza/Peso",
    category: "physiology",
    shortDefinition:
      "Ratio entre la puissance produite et le poids corporel, clé en montée.",
    shortDefinitionEn:
      "Ratio between power output and body weight, key for climbing.",
    shortDefinitionIt:
      "Rapporto tra la potenza espressa e il peso corporeo, fondamentale in salita.",
    fullDefinition:
      "Le rapport puissance/poids (W/kg) est un indicateur crucial de la performance, particulièrement dans les sports où il faut déplacer son propre poids (course à pied, vélo en montée). À puissance égale, un athlète plus léger sera plus rapide en côte. En cyclisme, un FTP de 4 W/kg est un bon niveau amateur, 5-6 W/kg au niveau pro.",
    fullDefinitionEn:
      "Power-to-weight ratio (W/kg) is a crucial performance indicator, particularly in sports where you must move your own body weight (running, uphill cycling). At equal power, a lighter athlete will be faster uphill. In cycling, an FTP of 4 W/kg is a good amateur level, 5-6 W/kg at pro level.",
    fullDefinitionIt:
      "Il rapporto potenza/peso (W/kg) è un indicatore cruciale della prestazione, in particolare negli sport in cui bisogna spostare il proprio peso corporeo (corsa, ciclismo in salita). A parità di potenza, un atleta più leggero sarà più veloce in salita. Nel ciclismo, una FTP di 4 W/kg è un buon livello amatoriale, 5-6 W/kg a livello professionistico.",
    example:
      "Un cycliste de 75 kg avec un FTP de 300W a un ratio de 4 W/kg. Pour monter l'Alpe d'Huez en moins d'1h, il faut environ 5 W/kg.",
    exampleEn:
      "A 75 kg cyclist with an FTP of 300W has a ratio of 4 W/kg. To climb Alpe d'Huez in under 1 hour requires approximately 5 W/kg.",
    exampleIt:
      "Un ciclista di 75 kg con una FTP di 300W ha un rapporto di 4 W/kg. Per scalare l'Alpe d'Huez in meno di un'ora servono circa 5 W/kg.",
    formula: "Ratio = Puissance (W) / Poids corporel (kg)",
    relatedTerms: ["ftp", "vo2max"],
    keywords: ["puissance", "poids", "watts", "montée", "ratio"],
  },
  {
    id: "mitochondries",
    term: "Mitochondries",
    termEn: "Mitochondria",
    termIt: "Mitocondri",
    category: "physiology",
    shortDefinition:
      "Centrales énergétiques des cellules, produisant l'ATP par oxydation.",
    shortDefinitionEn:
      "Energy powerhouses of cells, producing ATP through oxidation.",
    shortDefinitionIt:
      "Centrali energetiche delle cellule, che producono ATP attraverso l'ossidazione.",
    fullDefinition:
      "Les mitochondries sont les organites cellulaires responsables de la production d'énergie (ATP) par voie aérobie. Plus tu as de mitochondries dans tes muscles et plus elles sont efficaces, plus tu peux produire d'énergie aérobie. L'entraînement en endurance, particulièrement en zone 2, augmente significativement la densité mitochondriale et l'activité des enzymes oxydatives.",
    fullDefinitionEn:
      "Mitochondria are cellular organelles responsible for aerobic energy (ATP) production. The more mitochondria you have in your muscles and the more efficient they are, the more aerobic energy you can produce. Endurance training, particularly in zone 2, significantly increases mitochondrial density and oxidative enzyme activity.",
    fullDefinitionIt:
      "I mitocondri sono gli organelli cellulari responsabili della produzione di energia (ATP) per via aerobica. Più mitocondri hai nei muscoli e più sono efficienti, maggiore è l'energia aerobica che puoi produrre. L'allenamento di resistenza, in particolare in zona 2, aumenta significativamente la densità mitocondriale e l'attività degli enzimi ossidativi.",
    example:
      "Après plusieurs mois d'entraînement en endurance, la densité mitochondriale peut augmenter de 50-100%. C'est une des principales adaptations à l'entraînement zone 2.",
    exampleEn:
      "After several months of endurance training, mitochondrial density can increase by 50-100%. This is one of the main adaptations to zone 2 training.",
    exampleIt:
      "Dopo diversi mesi di allenamento di resistenza, la densità mitocondriale può aumentare del 50-100%. È uno dei principali adattamenti all'allenamento in zona 2.",
    relatedTerms: ["zone-2", "aerobic-capacity", "vo2max"],
    keywords: ["énergie", "cellule", "ATP", "aérobie", "oxydation"],
  },
  {
    id: "capillarisation",
    term: "Capillarisation",
    termEn: "Capillarization",
    termIt: "Capillarizzazione",
    category: "physiology",
    shortDefinition:
      "Densité des petits vaisseaux sanguins irriguant les muscles.",
    shortDefinitionEn:
      "Density of small blood vessels supplying muscles.",
    shortDefinitionIt:
      "Densità dei piccoli vasi sanguigni che irrorano i muscoli.",
    fullDefinition:
      "La capillarisation désigne le développement du réseau capillaire (les plus petits vaisseaux sanguins) autour des fibres musculaires. Une meilleure capillarisation permet un apport accru d'oxygène et de nutriments aux muscles, ainsi qu'une meilleure évacuation des déchets métaboliques. Elle s'améliore principalement avec l'entraînement en endurance à basse intensité.",
    fullDefinitionEn:
      "Capillarization refers to the development of the capillary network (smallest blood vessels) around muscle fibers. Better capillarization allows increased oxygen and nutrient delivery to muscles, as well as better removal of metabolic waste. It improves mainly through low-intensity endurance training.",
    fullDefinitionIt:
      "La capillarizzazione indica lo sviluppo della rete capillare (i vasi sanguigni più piccoli) attorno alle fibre muscolari. Una migliore capillarizzazione consente un maggiore apporto di ossigeno e nutrienti ai muscoli, oltre a una migliore rimozione delle scorie metaboliche. Migliora principalmente con l'allenamento di resistenza a bassa intensità.",
    example:
      "Un athlète endurant peut avoir 2-3 fois plus de capillaires par fibre musculaire qu'un sédentaire. Cette adaptation prend des mois à se développer.",
    exampleEn:
      "An endurance athlete can have 2-3 times more capillaries per muscle fiber than a sedentary person. This adaptation takes months to develop.",
    exampleIt:
      "Un atleta di resistenza può avere 2-3 volte più capillari per fibra muscolare rispetto a un sedentario. Questo adattamento richiede mesi per svilupparsi.",
    relatedTerms: ["zone-2", "base-building", "aerobic-capacity"],
    keywords: ["capillaires", "vaisseaux", "oxygène", "sang", "muscles"],
  },
  {
    id: "fibre-musculaire",
    term: "Types de Fibres Musculaires",
    termEn: "Muscle Fiber Types",
    termIt: "Tipi di Fibre Muscolari",
    category: "physiology",
    shortDefinition:
      "Fibres lentes (type I) vs rapides (type II), déterminant les aptitudes.",
    shortDefinitionEn:
      "Slow-twitch (type I) vs fast-twitch (type II), determining abilities.",
    shortDefinitionIt:
      "Fibre lente (tipo I) contro fibre rapide (tipo II), che determinano le attitudini atletiche.",
    fullDefinition:
      "Les muscles contiennent deux types principaux de fibres : les fibres de type I (lentes, aérobies, résistantes à la fatigue) et les fibres de type II (rapides, puissantes, fatigables). La proportion est largement génétique mais peut être légèrement modifiée par l'entraînement. Les athlètes d'endurance ont souvent 70-90% de fibres type I, tandis que les sprinters ont plus de type II.",
    fullDefinitionEn:
      "Muscles contain two main fiber types: type I (slow, aerobic, fatigue-resistant) and type II (fast, powerful, fatigable). The proportion is largely genetic but can be slightly modified by training. Endurance athletes often have 70-90% type I fibers, while sprinters have more type II.",
    fullDefinitionIt:
      "I muscoli contengono due tipi principali di fibre: le fibre di tipo I (lente, aerobiche, resistenti alla fatica) e le fibre di tipo II (rapide, potenti, affaticabili). La proporzione è in gran parte genetica ma può essere leggermente modificata dall'allenamento. Gli atleti di resistenza hanno spesso il 70-90% di fibre di tipo I, mentre i velocisti hanno più fibre di tipo II.",
    example:
      "Kipchoge a probablement >90% de fibres type I dans ses jambes. Un sprinter comme Usain Bolt a majoritairement des fibres type II.",
    exampleEn:
      "Kipchoge likely has >90% type I fibers in his legs. A sprinter like Usain Bolt has predominantly type II fibers.",
    exampleIt:
      "Kipchoge ha probabilmente >90% di fibre di tipo I nelle gambe. Un velocista come Usain Bolt ha prevalentemente fibre di tipo II.",
    relatedTerms: ["running-economy", "capacite-anaerobie"],
    keywords: ["fibres", "lent", "rapide", "type I", "type II", "génétique"],
  },
];

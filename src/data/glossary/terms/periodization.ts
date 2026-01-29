// src/data/glossary/terms/periodization.ts
// Training periodization concepts

import type { GlossaryTerm } from "../types";

export const periodizationTerms: GlossaryTerm[] = [
  {
    id: "macrocycle",
    term: "Macrocycle",
    termEn: "Macrocycle",
    category: "periodization",
    shortDefinition:
      "Période de planification à long terme, généralement une saison complète.",
    shortDefinitionEn:
      "Long-term planning period, typically a complete season.",
    fullDefinition:
      "Le macrocycle est la plus grande unité de planification de l'entraînement, couvrant généralement une saison complète ou une année. Il englobe toutes les phases de préparation menant à un ou plusieurs objectifs majeurs. Un macrocycle typique comprend des phases de base, de construction, de pic et de récupération.",
    fullDefinitionEn:
      "The macrocycle is the largest unit of training planning, typically covering a complete season or year. It encompasses all preparation phases leading to one or more major goals. A typical macrocycle includes base, build, peak, and recovery phases.",
    example:
      "Pour un marathon en avril, ton macrocycle de 20 semaines pourrait inclure 8 semaines de base, 8 semaines de build, 3 semaines de peak et 1 semaine de taper.",
    exampleEn:
      "For an April marathon, your 20-week macrocycle might include 8 weeks of base, 8 weeks of build, 3 weeks of peak, and 1 week of taper.",
    relatedTerms: ["mesocycle", "microcycle", "base-building", "peaking"],
    keywords: ["planification", "saison", "cycle", "long terme", "Bompa"],
    externalLinks: [
      {
        label: "Periodization: Theory and Methodology of Training",
        url: "https://www.amazon.com/Periodization-Theory-Methodology-Training-Bompa/dp/1492544809",
        author: "Bompa",
      },
    ],
  },
  {
    id: "mesocycle",
    term: "Mésocycle",
    termEn: "Mesocycle",
    category: "periodization",
    shortDefinition:
      "Bloc d'entraînement de 3-6 semaines avec un objectif spécifique.",
    shortDefinitionEn:
      "3-6 week training block with a specific objective.",
    fullDefinition:
      "Le mésocycle est un bloc d'entraînement de 3 à 6 semaines ayant un objectif de développement spécifique. Chaque mésocycle se concentre sur une qualité particulière (endurance de base, seuil, puissance, etc.) et suit généralement un pattern de progression avec une semaine de récupération (3:1 ou 2:1).",
    fullDefinitionEn:
      "A mesocycle is a 3-6 week training block with a specific development objective. Each mesocycle focuses on a particular quality (base endurance, threshold, power, etc.) and typically follows a progression pattern with a recovery week (3:1 or 2:1).",
    example:
      "Un mésocycle de développement du seuil de 4 semaines : 3 semaines de charge progressive avec 2 séances seuil/semaine, puis 1 semaine de récupération.",
    exampleEn:
      "A 4-week threshold development mesocycle: 3 weeks of progressive load with 2 threshold sessions/week, then 1 recovery week.",
    relatedTerms: ["macrocycle", "microcycle", "deload"],
    keywords: ["bloc", "semaines", "progression", "charge"],
  },
  {
    id: "microcycle",
    term: "Microcycle",
    termEn: "Microcycle",
    category: "periodization",
    shortDefinition: "Semaine d'entraînement type avec ses séances planifiées.",
    shortDefinitionEn: "Typical training week with planned sessions.",
    fullDefinition:
      "Le microcycle est l'unité de base de la planification, généralement une semaine. Il définit l'agencement des séances, leur type, leur intensité et les jours de repos. Un bon microcycle alterne intelligemment les séances de qualité, d'endurance et de récupération pour optimiser les adaptations.",
    fullDefinitionEn:
      "The microcycle is the basic planning unit, typically one week. It defines session arrangement, type, intensity, and rest days. A good microcycle intelligently alternates quality, endurance, and recovery sessions to optimize adaptations.",
    example:
      "Microcycle marathon typique : Lundi repos, Mardi fractionné, Mercredi footing, Jeudi tempo, Vendredi repos, Samedi footing, Dimanche sortie longue.",
    exampleEn:
      "Typical marathon microcycle: Monday rest, Tuesday intervals, Wednesday easy run, Thursday tempo, Friday rest, Saturday easy run, Sunday long run.",
    relatedTerms: ["macrocycle", "mesocycle"],
    keywords: ["semaine", "séances", "organisation", "repos"],
  },
  {
    id: "taper",
    term: "Taper",
    termEn: "Taper",
    category: "periodization",
    shortDefinition:
      "Réduction progressive du volume avant une compétition pour arriver frais.",
    shortDefinitionEn:
      "Progressive volume reduction before competition to arrive fresh.",
    fullDefinition:
      "Le taper (ou affûtage) est une réduction planifiée du volume d'entraînement dans les 1-3 semaines précédant une compétition majeure. L'objectif est de dissiper la fatigue tout en maintenant la forme acquise. Le volume est réduit de 40-60%, mais l'intensité des séances clés est maintenue pour conserver les adaptations neuromusculaires.",
    fullDefinitionEn:
      "Tapering is a planned reduction in training volume during the 1-3 weeks before a major competition. The goal is to dissipate fatigue while maintaining acquired fitness. Volume is reduced by 40-60%, but intensity of key sessions is maintained to preserve neuromuscular adaptations.",
    example:
      "Pour un marathon, un taper de 3 semaines : S1 -30% volume, S2 -50% volume, S3 -70% volume, avec 2 séances spécifiques par semaine.",
    exampleEn:
      "For a marathon, a 3-week taper: W1 -30% volume, W2 -50% volume, W3 -70% volume, with 2 specific sessions per week.",
    relatedTerms: ["peaking", "tsb", "mesocycle"],
    keywords: ["affûtage", "réduction", "repos", "compétition", "fraîcheur"],
    externalLinks: [
      {
        label: "Tapering and Peaking for Optimal Performance",
        url: "https://www.amazon.com/Tapering-Peaking-Optimal-Performance-Mujika/dp/0736074848",
        author: "Mujika",
      },
    ],
  },
  {
    id: "peaking",
    term: "Peaking",
    termEn: "Peaking",
    category: "periodization",
    shortDefinition:
      "Phase finale de préparation visant la performance maximale le jour J.",
    shortDefinitionEn:
      "Final preparation phase targeting maximum performance on race day.",
    fullDefinition:
      "Le peaking est l'art d'arriver au sommet de sa forme pour une compétition précise. Il combine les dernières semaines de travail spécifique avec le taper pour optimiser simultanément la forme (CTL) et la fraîcheur (TSB positif). Un bon peak ne peut être maintenu que 1-2 semaines, d'où l'importance de bien cibler ses objectifs.",
    fullDefinitionEn:
      "Peaking is the art of reaching top form for a specific competition. It combines the final weeks of specific work with taper to simultaneously optimize fitness (CTL) and freshness (positive TSB). A good peak can only be maintained for 1-2 weeks, hence the importance of properly targeting objectives.",
    example:
      "Pour un Ironman, le peak se planifie sur la dernière semaine : séances très courtes mais à allure course, beaucoup de repos, nutrition optimisée.",
    exampleEn:
      "For an Ironman, peaking is planned for the final week: very short sessions but at race pace, lots of rest, optimized nutrition.",
    relatedTerms: ["taper", "tsb", "macrocycle"],
    keywords: ["pic", "forme", "performance", "compétition", "timing"],
  },
  {
    id: "base-building",
    term: "Base Building",
    termEn: "Base Building",
    category: "periodization",
    shortDefinition:
      "Phase de construction de l'endurance fondamentale et de la capacité aérobie.",
    shortDefinitionEn:
      "Phase building fundamental endurance and aerobic capacity.",
    fullDefinition:
      "La phase de base (ou préparation générale) est la fondation de tout plan d'entraînement. Elle développe la capacité aérobie, l'économie de course, et renforce les structures (tendons, muscles, os). Le volume est important mais l'intensité reste basse (80-85% en zone 2). Cette phase dure généralement 8-12 semaines et conditionne la qualité du travail ultérieur.",
    fullDefinitionEn:
      "The base phase (or general preparation) is the foundation of any training plan. It develops aerobic capacity, running economy, and strengthens structures (tendons, muscles, bones). Volume is high but intensity stays low (80-85% in zone 2). This phase typically lasts 8-12 weeks and conditions the quality of subsequent work.",
    example:
      "Pendant une phase de base marathon de 8 semaines, 80% du volume est en endurance fondamentale, avec augmentation progressive de la sortie longue (de 1h30 à 2h30).",
    exampleEn:
      "During an 8-week marathon base phase, 80% of volume is in fundamental endurance, with progressive increase in long run (from 1h30 to 2h30).",
    relatedTerms: ["zone-2", "endurance-fondamentale", "macrocycle"],
    zone: 2,
    keywords: ["fondation", "aérobie", "volume", "préparation"],
    externalLinks: [
      {
        label: "The importance of aerobic base training",
        url: "https://www.researchgate.net/publication/267403799",
        author: "Seiler",
      },
    ],
  },
  {
    id: "surcompensation",
    term: "Surcompensation",
    termEn: "Supercompensation",
    category: "periodization",
    shortDefinition:
      "Phénomène d'adaptation où le corps devient plus fort après récupération d'un stress.",
    shortDefinitionEn:
      "Adaptation phenomenon where the body becomes stronger after recovering from stress.",
    fullDefinition:
      "La surcompensation est le principe fondamental de l'entraînement : après un stress (séance), le corps ne revient pas simplement à son état initial mais s'adapte pour être légèrement plus performant. Ce phénomène nécessite un temps de récupération adéquat. Enchaîner les séances sans laisser ce temps empêche la surcompensation et mène au surmenage.",
    fullDefinitionEn:
      "Supercompensation is the fundamental principle of training: after stress (workout), the body doesn't simply return to its initial state but adapts to become slightly more capable. This phenomenon requires adequate recovery time. Chaining sessions without allowing this time prevents supercompensation and leads to overreaching.",
    example:
      "Après une séance de fractionné intense, la surcompensation optimale se produit généralement 48-72h plus tard. C'est le moment idéal pour la prochaine séance de qualité.",
    exampleEn:
      "After an intense interval session, optimal supercompensation typically occurs 48-72 hours later. This is the ideal time for the next quality session.",
    relatedTerms: ["adaptation", "recovery", "overtraining"],
    keywords: ["adaptation", "stress", "récupération", "progression"],
  },
  {
    id: "progressive-overload",
    term: "Progressive Overload",
    termEn: "Progressive Overload",
    category: "periodization",
    shortDefinition:
      "Principe d'augmentation graduelle du stress d'entraînement pour progresser.",
    shortDefinitionEn:
      "Principle of gradual training stress increase to progress.",
    fullDefinition:
      "Le progressive overload (surcharge progressive) est le principe selon lequel l'entraînement doit augmenter graduellement en difficulté pour continuer à stimuler des adaptations. Cette augmentation peut porter sur le volume, l'intensité, la fréquence ou la densité. Une règle commune est de ne pas augmenter la charge de plus de 10% par semaine.",
    fullDefinitionEn:
      "Progressive overload is the principle that training must gradually increase in difficulty to continue stimulating adaptations. This increase can be in volume, intensity, frequency, or density. A common rule is not to increase load by more than 10% per week.",
    example:
      "Si tu cours 40 km cette semaine, la semaine prochaine ne devrait pas dépasser 44 km (+10%). L'augmentation peut aussi être qualitative : même volume mais une séance de plus en zone 3.",
    exampleEn:
      "If you run 40 km this week, next week should not exceed 44 km (+10%). The increase can also be qualitative: same volume but one more session in zone 3.",
    relatedTerms: ["surcompensation", "mesocycle", "acwr"],
    keywords: ["progression", "augmentation", "charge", "adaptation"],
  },
  {
    id: "deload",
    term: "Deload Week",
    termEn: "Deload Week",
    category: "periodization",
    shortDefinition:
      "Semaine de récupération avec réduction de la charge d'entraînement.",
    shortDefinitionEn:
      "Recovery week with reduced training load.",
    fullDefinition:
      "Une semaine de deload (ou récupération) est une réduction planifiée de la charge d'entraînement pour permettre au corps de récupérer et de consolider les adaptations. Typiquement, le volume est réduit de 30-50% et l'intensité maintenue ou légèrement réduite. Ces semaines sont essentielles pour éviter le surentraînement et maintenir la progression à long terme.",
    fullDefinitionEn:
      "A deload week (or recovery week) is a planned reduction in training load to allow the body to recover and consolidate adaptations. Typically, volume is reduced by 30-50% and intensity is maintained or slightly reduced. These weeks are essential for avoiding overtraining and maintaining long-term progression.",
    example:
      "Pattern classique 3:1 : 3 semaines de charge progressive puis 1 semaine de deload. Pendant le deload, on garde 1-2 séances de qualité mais on réduit le volume global de 40%.",
    exampleEn:
      "Classic 3:1 pattern: 3 weeks of progressive load then 1 deload week. During deload, keep 1-2 quality sessions but reduce overall volume by 40%.",
    relatedTerms: ["mesocycle", "recovery", "overtraining"],
    keywords: ["récupération", "repos", "décharge", "semaine"],
  },
  {
    id: "periodization-ondulee",
    term: "Périodisation Ondulée",
    termEn: "Undulating Periodization",
    category: "periodization",
    shortDefinition:
      "Variation des intensités au sein d'une même semaine plutôt que par blocs.",
    shortDefinitionEn:
      "Intensity variation within the same week rather than by blocks.",
    fullDefinition:
      "La périodisation ondulée (ou non-linéaire) varie les stimuli d'entraînement au sein d'un même microcycle plutôt que de consacrer des blocs entiers à une qualité. Chaque semaine inclut des séances de types différents (endurance, seuil, vitesse). Cette approche peut mieux convenir aux amateurs avec peu de temps et maintient une variété qui réduit la monotonie.",
    fullDefinitionEn:
      "Undulating (or non-linear) periodization varies training stimuli within the same microcycle rather than dedicating entire blocks to one quality. Each week includes different session types (endurance, threshold, speed). This approach may suit amateurs with limited time better and maintains variety that reduces monotony.",
    example:
      "Semaine ondulée : Mardi VO2max (5x1000m), Jeudi tempo (20min au seuil), Dimanche sortie longue (2h zone 2). Toutes les qualités sont travaillées chaque semaine.",
    exampleEn:
      "Undulating week: Tuesday VO2max (5x1000m), Thursday tempo (20min at threshold), Sunday long run (2h zone 2). All qualities are worked each week.",
    relatedTerms: ["block-periodization", "microcycle"],
    keywords: ["variation", "non-linéaire", "intensité", "semaine"],
  },
  {
    id: "block-periodization",
    term: "Block Periodization",
    termEn: "Block Periodization",
    category: "periodization",
    shortDefinition:
      "Concentration des efforts sur une qualité spécifique par blocs successifs.",
    shortDefinitionEn:
      "Focusing efforts on specific qualities through successive blocks.",
    fullDefinition:
      "La périodisation par blocs concentre l'entraînement sur le développement d'une qualité spécifique pendant 2-4 semaines avant de passer à la suivante. Chaque bloc 'accumule' du travail ciblé (ex: bloc endurance, puis bloc seuil, puis bloc vitesse). Cette méthode peut être plus efficace pour les athlètes avancés cherchant à maximiser des qualités spécifiques.",
    fullDefinitionEn:
      "Block periodization concentrates training on developing a specific quality for 2-4 weeks before moving to the next. Each block 'accumulates' targeted work (e.g., endurance block, then threshold block, then speed block). This method may be more effective for advanced athletes seeking to maximize specific qualities.",
    example:
      "Préparation marathon : Bloc 1 (4 sem) = volume endurance, Bloc 2 (4 sem) = travail seuil, Bloc 3 (3 sem) = allure spécifique marathon, puis taper.",
    exampleEn:
      "Marathon preparation: Block 1 (4 wks) = endurance volume, Block 2 (4 wks) = threshold work, Block 3 (3 wks) = marathon-specific pace, then taper.",
    relatedTerms: ["periodization-ondulee", "mesocycle"],
    keywords: ["bloc", "concentration", "spécifique", "Issurin"],
    externalLinks: [
      {
        label: "Block Periodization",
        url: "https://www.amazon.com/Block-Periodization-Breakthrough-Sport-Training/dp/0966297318",
        author: "Issurin",
      },
    ],
  },
  {
    id: "entrainement-polarise",
    term: "Entraînement Polarisé",
    termEn: "Polarized Training",
    category: "periodization",
    shortDefinition:
      "Distribution 80/20 : beaucoup de volume facile, peu d'intensité élevée, en évitant le milieu.",
    shortDefinitionEn:
      "80/20 distribution: lots of easy volume, little high intensity, avoiding the middle.",
    fullDefinition:
      "L'entraînement polarisé est une distribution d'intensité où ~80% du volume se fait en zone 1-2 (facile) et ~20% en zone 4-5 (intense), en évitant au maximum la zone 3 'grise'. Cette approche, étudiée par Stephen Seiler chez les athlètes élites d'endurance, maximise les adaptations aérobies tout en permettant une récupération adéquate. Elle s'oppose à l'approche 'threshold' qui accumule du temps en zone 3.",
    fullDefinitionEn:
      "Polarized training is an intensity distribution where ~80% of volume is done in zones 1-2 (easy) and ~20% in zones 4-5 (intense), avoiding zone 3 'gray zone' as much as possible. This approach, studied by Stephen Seiler in elite endurance athletes, maximizes aerobic adaptations while allowing adequate recovery. It contrasts with the 'threshold' approach that accumulates time in zone 3.",
    example:
      "Sur une semaine de 10h d'entraînement polarisé : 8h en endurance fondamentale (zone 2), 2h d'intervalles intenses (zone 4-5), et presque rien en zone 3.",
    exampleEn:
      "In a 10-hour polarized training week: 8h in fundamental endurance (zone 2), 2h of intense intervals (zones 4-5), and almost nothing in zone 3.",
    relatedTerms: ["zone-2", "zone-5", "periodization-ondulee", "zones-entrainement"],
    keywords: ["polarisé", "80/20", "Seiler", "distribution", "intensité"],
    externalLinks: [
      {
        label: "Polarized training has greater impact on key endurance variables",
        url: "https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2014.00033/full",
        author: "Stöggl & Sperlich",
      },
    ],
  },
  {
    id: "marathon",
    term: "Marathon",
    termEn: "Marathon",
    category: "periodization",
    shortDefinition:
      "Course de 42.195 km, épreuve reine de l'endurance en course à pied.",
    shortDefinitionEn:
      "42.195 km race, the flagship endurance event in running.",
    fullDefinition:
      "Le marathon est une course de 42.195 km, nécessitant une préparation spécifique de 12-20 semaines minimum. Les facteurs clés de performance sont la VO2max, le seuil lactique, l'économie de course et la capacité à utiliser les graisses. L'allure marathon correspond environ à 75-85% de la VMA ou à une intensité juste sous le seuil lactique pour les élites.",
    fullDefinitionEn:
      "The marathon is a 42.195 km race requiring a minimum of 12-20 weeks of specific preparation. Key performance factors are VO2max, lactate threshold, running economy, and fat utilization ability. Marathon pace corresponds to approximately 75-85% of MAS or an intensity just below lactate threshold for elites.",
    example:
      "Pour un coureur avec une VMA de 16 km/h, l'allure marathon est environ 12-13 km/h (4:35-5:00/km). L'objectif est de finir avec les réserves de glycogène au plus bas.",
    exampleEn:
      "For a runner with 16 km/h MAS, marathon pace is approximately 12-13 km/h (4:35-5:00/km). The goal is to finish with glycogen reserves at their lowest.",
    relatedTerms: ["long-run", "bonk", "carb-loading", "taper", "race-pace"],
    keywords: ["42km", "course", "endurance", "préparation", "allure"],
  },
  {
    id: "semi-marathon",
    term: "Semi-marathon",
    termEn: "Half Marathon",
    category: "periodization",
    shortDefinition:
      "Course de 21.1 km, excellent compromis entre vitesse et endurance.",
    shortDefinitionEn:
      "21.1 km race, excellent compromise between speed and endurance.",
    fullDefinition:
      "Le semi-marathon (21.0975 km) est souvent considéré comme la distance idéale : assez longue pour tester l'endurance, assez courte pour maintenir une intensité élevée. L'allure semi correspond à environ 85-90% de la VMA, proche du seuil lactique. La préparation est plus courte qu'un marathon (8-12 semaines) et moins exigeante sur le ravitaillement.",
    fullDefinitionEn:
      "The half marathon (21.0975 km) is often considered the ideal distance: long enough to test endurance, short enough to maintain high intensity. Half marathon pace corresponds to approximately 85-90% of MAS, close to lactate threshold. Preparation is shorter than a marathon (8-12 weeks) and less demanding on fueling.",
    example:
      "Pour un coureur avec une VMA de 16 km/h, l'allure semi est environ 13.5-14 km/h (4:15-4:30/km). Moins de risque de 'mur' qu'au marathon.",
    exampleEn:
      "For a runner with 16 km/h MAS, half marathon pace is approximately 13.5-14 km/h (4:15-4:30/km). Less risk of 'hitting the wall' than in a marathon.",
    relatedTerms: ["marathon", "threshold", "zone-4", "race-pace"],
    keywords: ["21km", "semi", "course", "seuil", "allure"],
  },
];

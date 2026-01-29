// src/data/glossary/terms/zones.ts
// Training zones and intensity levels

import type { GlossaryTerm } from "../types";

export const zonesTerms: GlossaryTerm[] = [
  {
    id: "zones-entrainement",
    term: "Zones d'entraînement",
    termEn: "Training Zones",
    category: "zones",
    shortDefinition:
      "Système de classification des intensités d'effort basé sur la fréquence cardiaque ou l'allure.",
    shortDefinitionEn:
      "Intensity classification system based on heart rate or pace.",
    fullDefinition:
      "Les zones d'entraînement sont un système de classification qui divise l'intensité de l'effort en 5 à 6 niveaux distincts. Chaque zone correspond à des adaptations physiologiques spécifiques. Le modèle le plus courant utilise 5 zones basées sur la fréquence cardiaque (méthode Karvonen) ou l'allure (% de la VMA). L'entraînement polarisé recommande de passer 80% du temps en zone 1-2 (facile) et 20% en zone 4-5 (intense), en évitant la zone 3 'grise'.",
    fullDefinitionEn:
      "Training zones are a classification system that divides exercise intensity into 5 to 6 distinct levels. Each zone corresponds to specific physiological adaptations. The most common model uses 5 zones based on heart rate (Karvonen method) or pace (% of MAS). Polarized training recommends spending 80% of time in zones 1-2 (easy) and 20% in zones 4-5 (intense), avoiding the 'gray' zone 3.",
    example:
      "Planr utilise 6 zones : Z1 (récupération), Z2 (endurance), Z3 (tempo), Z4 (seuil), Z5 (VO2max), Z6 (anaérobie). Tes zones sont calculées automatiquement à partir de ta FC max, FC repos et VMA.",
    exampleEn:
      "Planr uses 6 zones: Z1 (recovery), Z2 (endurance), Z3 (tempo), Z4 (threshold), Z5 (VO2max), Z6 (anaerobic). Your zones are automatically calculated from your max HR, resting HR, and MAS.",
    relatedTerms: [
      "zone-1",
      "zone-2",
      "zone-3",
      "zone-4",
      "zone-5",
      "zone-6",
      "fc-max",
      "vma",
    ],
    keywords: [
      "zones",
      "intensité",
      "classification",
      "Karvonen",
      "polarisé",
    ],
    externalLinks: [
      {
        label: "The training intensity distribution among elite athletes",
        url: "https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2015.00295/full",
        author: "Seiler",
      },
    ],
  },
  {
    id: "zone-1",
    term: "Zone 1",
    termEn: "Zone 1",
    category: "zones",
    shortDefinition:
      "Récupération active - Effort très facile, conversation aisée.",
    shortDefinitionEn:
      "Active recovery - Very easy effort, effortless conversation.",
    fullDefinition:
      "La zone 1 correspond à un effort de récupération active, très facile. La fréquence cardiaque est basse (50-60% FC max, ou 50-60% de la réserve cardiaque). Tu peux parler facilement sans aucun essoufflement. Cette zone est utilisée pour les footings de récupération, l'échauffement et le retour au calme.",
    fullDefinitionEn:
      "Zone 1 corresponds to active recovery effort, very easy. Heart rate is low (50-60% max HR, or 50-60% of heart rate reserve). You can speak easily without any breathlessness. This zone is used for recovery jogs, warm-ups, and cool-downs.",
    example:
      "FC en zone 1 : si ta FC max est 185 et ta FC repos 50, ta zone 1 est environ 117-131 bpm (méthode Karvonen). En course, c'est une allure où tu pourrais presque marcher vite.",
    exampleEn:
      "Zone 1 HR: if your max HR is 185 and resting HR is 50, your zone 1 is approximately 117-131 bpm (Karvonen method). When running, it's a pace where you could almost power-walk.",
    relatedTerms: ["recovery-run", "fc-max", "fc-repos"],
    zone: 1,
    keywords: ["récupération", "facile", "repos", "actif"],
  },
  {
    id: "zone-2",
    term: "Zone 2",
    termEn: "Zone 2",
    category: "zones",
    shortDefinition:
      "Endurance fondamentale - Allure conversationnelle soutenue.",
    shortDefinitionEn:
      "Fundamental endurance - Sustained conversational pace.",
    fullDefinition:
      "La zone 2 est la zone d'endurance fondamentale, le cœur de l'entraînement en endurance (60-70% de la réserve cardiaque, 70-80% VMA). C'est l'allure où tu peux tenir une conversation par phrases complètes. Cette zone développe la base aérobie, l'efficacité métabolique et la capacité à utiliser les graisses comme carburant. Elle devrait représenter 80% du volume d'entraînement.",
    fullDefinitionEn:
      "Zone 2 is the fundamental endurance zone, the heart of endurance training (60-70% of heart rate reserve, 70-80% MAS). It's the pace where you can hold a conversation in complete sentences. This zone develops the aerobic base, metabolic efficiency, and the ability to use fat as fuel. It should represent 80% of training volume.",
    example:
      "Pour quelqu'un avec une VMA de 15 km/h, la zone 2 correspond à environ 10.5-12 km/h, soit 5:00-5:45/km. Tu dois pouvoir parler en courant.",
    exampleEn:
      "For someone with a 15 km/h MAS, zone 2 corresponds to approximately 10.5-12 km/h, or 5:00-5:45/km. You should be able to talk while running.",
    relatedTerms: ["endurance-fondamentale", "long-run", "base-building"],
    zone: 2,
    keywords: ["endurance", "aérobie", "fondamental", "conversation"],
    externalLinks: [
      {
        label: "Polarized training has greater impact on key endurance variables",
        url: "https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2014.00033/full",
        author: "Stöggl & Sperlich",
      },
    ],
  },
  {
    id: "zone-3",
    term: "Zone 3",
    termEn: "Zone 3",
    category: "zones",
    shortDefinition:
      "Tempo - Zone intermédiaire 'grise', modérément difficile.",
    shortDefinitionEn:
      "Tempo - Intermediate 'gray' zone, moderately difficult.",
    fullDefinition:
      "La zone 3 est une zone intermédiaire souvent appelée 'zone grise' ou zone tempo (70-80% de la réserve cardiaque, 80-87% VMA). L'effort est modérément difficile : tu peux parler par phrases courtes. C'est une zone utile pour les séances tempo, mais l'entraînement polarisé recommande de limiter le temps passé dans cette zone au profit des zones 2 et 4-5.",
    fullDefinitionEn:
      "Zone 3 is an intermediate zone often called the 'gray zone' or tempo zone (70-80% of heart rate reserve, 80-87% MAS). The effort is moderately difficult: you can speak in short phrases. It's useful for tempo sessions, but polarized training recommends limiting time in this zone in favor of zones 2 and 4-5.",
    example:
      "Une séance tempo de 30 min en zone 3 représente un effort soutenu mais contrôlé. Tu sens que tu travailles, mais tu pourrais maintenir cet effort 1h-1h30.",
    exampleEn:
      "A 30-min tempo session in zone 3 represents sustained but controlled effort. You feel you're working, but could maintain this effort for 1-1.5 hours.",
    relatedTerms: ["tempo-run", "sweet-spot", "seuil-aerobie"],
    zone: 3,
    keywords: ["tempo", "modéré", "intermédiaire", "gris"],
  },
  {
    id: "zone-4",
    term: "Zone 4",
    termEn: "Zone 4",
    category: "zones",
    shortDefinition:
      "Seuil lactique - Effort dur, limite de soutenabilité prolongée.",
    shortDefinitionEn:
      "Lactate threshold - Hard effort, limit of prolonged sustainability.",
    fullDefinition:
      "La zone 4 correspond au seuil lactique (80-90% de la réserve cardiaque, 87-93% VMA). C'est l'intensité maximale soutenable pendant 45-60 minutes pour un athlète entraîné. À ce niveau, le lactate produit est juste évacué. Tu ne peux parler que par mots isolés. C'est la zone des séances threshold et des courses de 10 km à semi-marathon.",
    fullDefinitionEn:
      "Zone 4 corresponds to lactate threshold (80-90% of heart rate reserve, 87-93% MAS). It's the maximum intensity sustainable for 45-60 minutes by a trained athlete. At this level, lactate produced is just being cleared. You can only speak in isolated words. This is the zone for threshold sessions and 10K to half-marathon races.",
    example:
      "En zone 4, ta respiration est profonde et rapide, tu sens l'effort dans les muscles. C'est ton allure semi-marathon si tu es bien entraîné.",
    exampleEn:
      "In zone 4, your breathing is deep and rapid, you feel the effort in your muscles. This is your half-marathon pace if well trained.",
    relatedTerms: ["threshold", "seuil-lactique", "ftp"],
    zone: 4,
    keywords: ["seuil", "dur", "lactique", "soutenable"],
  },
  {
    id: "zone-5",
    term: "Zone 5",
    termEn: "Zone 5",
    category: "zones",
    shortDefinition:
      "VO2max - Effort très intense, développement de la puissance maximale aérobie.",
    shortDefinitionEn:
      "VO2max - Very intense effort, developing maximum aerobic power.",
    fullDefinition:
      "La zone 5 est la zone de développement de la VO2max (90-100% de la réserve cardiaque, 93-100% VMA). L'effort est très intense, soutenable seulement 3-8 minutes en continu. Tu ne peux pas parler. Cette zone stimule les adaptations cardiovasculaires maximales et est travaillée principalement par des intervalles. Elle représente environ 10-15% du volume d'entraînement dans un modèle polarisé.",
    fullDefinitionEn:
      "Zone 5 is the VO2max development zone (90-100% of heart rate reserve, 93-100% MAS). The effort is very intense, sustainable only 3-8 minutes continuously. You cannot talk. This zone stimulates maximum cardiovascular adaptations and is primarily worked through intervals. It represents approximately 10-15% of training volume in a polarized model.",
    example:
      "Les intervalles 5x1000m à 100% VMA se font en zone 5. Chaque répétition est dure, et la récupération entre les séries est nécessaire.",
    exampleEn:
      "5x1000m intervals at 100% MAS are done in zone 5. Each repetition is hard, and recovery between sets is necessary.",
    relatedTerms: ["vo2max", "intervals", "vma"],
    zone: 5,
    keywords: ["intense", "VO2max", "puissance", "fractionné"],
  },
  {
    id: "zone-6",
    term: "Zone 6",
    termEn: "Zone 6",
    category: "zones",
    shortDefinition:
      "Anaérobie - Effort maximal, sprints et puissance pure.",
    shortDefinitionEn:
      "Anaerobic - Maximal effort, sprints and pure power.",
    fullDefinition:
      "La zone 6 est la zone anaérobie, au-delà de la VO2max (> 100% VMA). C'est un effort maximal soutenable seulement quelques secondes à 2 minutes. Le système anaérobie est dominant, produisant beaucoup de lactate. Cette zone développe la puissance neuromusculaire, la capacité de sprint et la tolérance au lactate. Elle est travaillée par des sprints courts et des intervalles très courts.",
    fullDefinitionEn:
      "Zone 6 is the anaerobic zone, beyond VO2max (> 100% MAS). It's a maximal effort sustainable only for a few seconds to 2 minutes. The anaerobic system is dominant, producing lots of lactate. This zone develops neuromuscular power, sprint capacity, and lactate tolerance. It's worked through short sprints and very short intervals.",
    example:
      "Un sprint de 200m en fin de course ou des accélérations de 30 secondes à fond sont en zone 6. L'effort est maximal et la récupération doit être complète.",
    exampleEn:
      "A 200m sprint at the end of a race or 30-second all-out accelerations are in zone 6. The effort is maximal and recovery must be complete.",
    relatedTerms: ["capacite-anaerobie", "sprint"],
    zone: 6,
    keywords: ["maximal", "sprint", "anaérobie", "puissance"],
  },
  {
    id: "endurance-fondamentale",
    term: "Endurance Fondamentale",
    termEn: "Fundamental Endurance",
    category: "zones",
    shortDefinition:
      "Base de l'entraînement aérobie, allure facile et soutenable longtemps.",
    shortDefinitionEn:
      "Base of aerobic training, easy pace sustainable for long periods.",
    fullDefinition:
      "L'endurance fondamentale est le socle de tout entraînement en endurance. Elle correspond principalement à la zone 2 et se caractérise par une allure facile, soutenable plusieurs heures. C'est dans cette zone que se développent les adaptations physiologiques essentielles : augmentation du volume d'éjection systolique, densité capillaire et mitochondriale, efficacité métabolique des graisses.",
    fullDefinitionEn:
      "Fundamental endurance is the foundation of all endurance training. It primarily corresponds to zone 2 and is characterized by an easy pace, sustainable for several hours. This is the zone where essential physiological adaptations develop: increased stroke volume, capillary and mitochondrial density, and fat metabolic efficiency.",
    example:
      "80% de ton kilométrage hebdomadaire devrait être en endurance fondamentale. Si tu cours 50 km/semaine, 40 km devraient être en zone 2.",
    exampleEn:
      "80% of your weekly mileage should be in fundamental endurance. If you run 50 km/week, 40 km should be in zone 2.",
    relatedTerms: ["zone-2", "base-building", "long-run"],
    zone: 2,
    keywords: ["base", "aérobie", "facile", "volume"],
  },
  {
    id: "seuil-aerobie",
    term: "Seuil Aérobie",
    termEn: "Aerobic Threshold",
    category: "zones",
    shortDefinition:
      "Première augmentation du lactate au-dessus des valeurs de repos.",
    shortDefinitionEn:
      "First lactate increase above resting values.",
    fullDefinition:
      "Le seuil aérobie (ou VT1, premier seuil ventilatoire) marque la première augmentation significative du lactate sanguin au-dessus des valeurs de repos (environ 2 mmol/L). Il correspond approximativement à la limite supérieure de la zone 2. En-dessous de ce seuil, l'effort peut être maintenu très longtemps car le métabolisme est principalement aérobie avec une utilisation importante des graisses.",
    fullDefinitionEn:
      "The aerobic threshold (or VT1, first ventilatory threshold) marks the first significant increase in blood lactate above resting values (approximately 2 mmol/L). It roughly corresponds to the upper limit of zone 2. Below this threshold, effort can be maintained for a very long time as metabolism is primarily aerobic with significant fat utilization.",
    example:
      "Le seuil aérobie correspond généralement à 75-80% de ta FC max ou 70-75% de ta VMA. C'est l'intensité où tu passes de 'facile' à 'modéré'.",
    exampleEn:
      "The aerobic threshold typically corresponds to 75-80% of your max HR or 70-75% of your MAS. It's the intensity where you transition from 'easy' to 'moderate'.",
    relatedTerms: ["zone-2", "zone-3", "seuil-lactique"],
    keywords: ["seuil", "aérobie", "lactate", "VT1"],
  },
  {
    id: "seuil-lactique",
    term: "Seuil Lactique",
    termEn: "Lactate Threshold",
    category: "zones",
    shortDefinition:
      "Intensité maximale où le lactate reste stable, limite d'endurance prolongée.",
    shortDefinitionEn:
      "Maximum intensity where lactate remains stable, limit of prolonged endurance.",
    fullDefinition:
      "Le seuil lactique (ou MLSS - Maximal Lactate Steady State, ou VT2) est l'intensité maximale à laquelle la production de lactate est égale à son élimination (environ 4 mmol/L). Au-delà, le lactate s'accumule rapidement. C'est l'intensité approximative d'un effort d'une heure (10 km - semi-marathon selon le niveau) et la référence pour les séances threshold.",
    fullDefinitionEn:
      "Lactate threshold (or MLSS - Maximal Lactate Steady State, or VT2) is the maximum intensity at which lactate production equals elimination (approximately 4 mmol/L). Beyond this, lactate accumulates rapidly. It's the approximate intensity of a one-hour effort (10K to half-marathon depending on level) and the reference for threshold sessions.",
    example:
      "Ton seuil lactique est probablement ton allure sur 10 km pour un coureur moyen, ou semi-marathon pour un coureur bien entraîné.",
    exampleEn:
      "Your lactate threshold is probably your 10K pace for an average runner, or half-marathon pace for a well-trained runner.",
    relatedTerms: ["threshold", "zone-4", "ftp", "seuil-aerobie"],
    zone: 4,
    keywords: ["seuil", "lactate", "MLSS", "VT2"],
  },
  {
    id: "capacite-anaerobie",
    term: "Capacité Anaérobie",
    termEn: "Anaerobic Capacity",
    category: "zones",
    shortDefinition:
      "Capacité à produire de l'énergie sans oxygène pour les efforts maximaux courts.",
    shortDefinitionEn:
      "Capacity to produce energy without oxygen for short maximal efforts.",
    fullDefinition:
      "La capacité anaérobie représente la quantité totale d'énergie disponible via les systèmes anaérobies (phosphocréatine et glycolyse anaérobie). Elle détermine la performance sur les efforts courts et intenses (sprints, fins de course). Elle est relativement limitée mais peut être améliorée par des entraînements spécifiques de type sprints répétés et intervalles très courts à intensité maximale.",
    fullDefinitionEn:
      "Anaerobic capacity represents the total energy available through anaerobic systems (phosphocreatine and anaerobic glycolysis). It determines performance in short, intense efforts (sprints, race finishes). It is relatively limited but can be improved through specific training like repeated sprints and very short intervals at maximum intensity.",
    example:
      "Les 400m et 800m en athlétisme sollicitent fortement la capacité anaérobie. Un finish explosif sur les 200 derniers mètres d'un 5 km aussi.",
    exampleEn:
      "The 400m and 800m in track heavily rely on anaerobic capacity. An explosive finish over the last 200 meters of a 5K does too.",
    relatedTerms: ["zone-6", "vo2max", "sprint"],
    zone: 6,
    keywords: ["anaérobie", "sprint", "puissance", "glycolyse"],
  },
];

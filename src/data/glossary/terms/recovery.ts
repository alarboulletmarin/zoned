// src/data/glossary/terms/recovery.ts
// Recovery and adaptation concepts

import type { GlossaryTerm } from "../types";

export const recoveryTerms: GlossaryTerm[] = [
  {
    id: "active-recovery",
    term: "Récupération Active",
    termEn: "Active Recovery",
    category: "recovery",
    shortDefinition:
      "Activité légère post-effort pour favoriser l'élimination des déchets métaboliques.",
    shortDefinitionEn:
      "Light post-exercise activity to promote metabolic waste elimination.",
    fullDefinition:
      "La récupération active consiste à pratiquer une activité physique légère (footing très lent, vélo facile, natation douce) plutôt que le repos complet après un effort intense. Elle favorise la circulation sanguine, accélère l'élimination des déchets métaboliques et peut réduire les courbatures. L'intensité doit rester très basse (zone 1) pour être bénéfique.",
    fullDefinitionEn:
      "Active recovery involves performing light physical activity (very slow jog, easy cycling, gentle swimming) rather than complete rest after intense exercise. It promotes blood circulation, accelerates metabolic waste elimination, and may reduce muscle soreness. Intensity must remain very low (zone 1) to be beneficial.",
    example:
      "Le lendemain d'un semi-marathon, 20-30 minutes de footing très lent ou de vélo facile peuvent aider à récupérer plus vite qu'un repos complet.",
    exampleEn:
      "The day after a half-marathon, 20-30 minutes of very slow jogging or easy cycling can help recover faster than complete rest.",
    relatedTerms: ["recovery-run", "zone-1", "doms"],
    zone: 1,
    keywords: ["récupération", "active", "légère", "circulation"],
  },
  {
    id: "foam-rolling",
    term: "Foam Rolling",
    termEn: "Foam Rolling",
    category: "recovery",
    shortDefinition:
      "Auto-massage avec rouleau pour relâcher les tensions musculaires.",
    shortDefinitionEn:
      "Self-massage with roller to release muscle tension.",
    fullDefinition:
      "Le foam rolling (ou auto-massage au rouleau) est une technique de relâchement myofascial qui consiste à rouler sur un rouleau en mousse pour masser les muscles tendus. Il peut améliorer la mobilité, réduire les tensions et potentiellement accélérer la récupération. Son efficacité scientifique est modérée mais beaucoup d'athlètes le trouvent subjectivement bénéfique.",
    fullDefinitionEn:
      "Foam rolling (or self-myofascial release) is a technique involving rolling on a foam roller to massage tight muscles. It can improve mobility, reduce tension, and potentially accelerate recovery. Its scientific efficacy is moderate, but many athletes find it subjectively beneficial.",
    example:
      "10-15 minutes de foam rolling sur les quadriceps, mollets et IT band après une séance de côtes peut aider à prévenir les tensions.",
    exampleEn:
      "10-15 minutes of foam rolling on quadriceps, calves, and IT band after a hill session can help prevent tension buildup.",
    relatedTerms: ["doms", "active-recovery"],
    keywords: ["massage", "rouleau", "fascia", "mobilité", "tension"],
  },
  {
    id: "compression",
    term: "Compression",
    termEn: "Compression",
    category: "recovery",
    shortDefinition:
      "Vêtements ou dispositifs compressifs pour améliorer la récupération.",
    shortDefinitionEn:
      "Compressive garments or devices to improve recovery.",
    fullDefinition:
      "Les vêtements de compression (chaussettes, manchons, collants) exercent une pression graduée sur les muscles, censée améliorer le retour veineux et réduire les oscillations musculaires. Les preuves scientifiques sont mitigées pour la performance, mais plus favorables pour la récupération perçue et la réduction des DOMS. Les bottes de pressothérapie (type NormaTec) sont plus efficaces.",
    fullDefinitionEn:
      "Compression garments (socks, sleeves, tights) apply graduated pressure to muscles, intended to improve venous return and reduce muscle oscillation. Scientific evidence is mixed for performance but more favorable for perceived recovery and DOMS reduction. Pneumatic compression boots (like NormaTec) are more effective.",
    example:
      "Porter des chaussettes de compression pendant un vol long-courrier avant une compétition, ou utiliser des bottes de pressothérapie après une séance dure.",
    exampleEn:
      "Wearing compression socks during a long-haul flight before a competition, or using pneumatic compression boots after a hard session.",
    relatedTerms: ["doms", "active-recovery"],
    keywords: ["compression", "vêtements", "récupération", "circulation"],
  },
  {
    id: "adaptation",
    term: "Adaptation",
    termEn: "Adaptation",
    category: "recovery",
    shortDefinition:
      "Processus par lequel le corps devient plus performant suite à l'entraînement.",
    shortDefinitionEn:
      "Process by which the body becomes more capable through training.",
    fullDefinition:
      "L'adaptation est le processus physiologique par lequel le corps répond au stress de l'entraînement en devenant plus fort et plus efficace. Les adaptations peuvent être structurelles (densité osseuse, mitochondries), fonctionnelles (débit cardiaque, capacité tampon) ou neuromusculaires (coordination, recrutement). L'adaptation nécessite le cycle stress → récupération → surcompensation.",
    fullDefinitionEn:
      "Adaptation is the physiological process by which the body responds to training stress by becoming stronger and more efficient. Adaptations can be structural (bone density, mitochondria), functional (cardiac output, buffering capacity), or neuromuscular (coordination, recruitment). Adaptation requires the cycle of stress → recovery → supercompensation.",
    example:
      "Après plusieurs semaines de sorties longues, ton corps s'adapte : plus de mitochondries, meilleure capillarisation, plus grande capacité à stocker le glycogène.",
    exampleEn:
      "After several weeks of long runs, your body adapts: more mitochondria, better capillarization, greater glycogen storage capacity.",
    relatedTerms: ["surcompensation", "progressive-overload", "deload"],
    keywords: ["adaptation", "progression", "physiologique", "stress"],
  },
  {
    id: "overtraining",
    term: "Surentraînement",
    termEn: "Overtraining Syndrome",
    category: "recovery",
    shortDefinition:
      "État de fatigue chronique dû à un déséquilibre prolongé entre charge et récupération.",
    shortDefinitionEn:
      "Chronic fatigue state due to prolonged imbalance between load and recovery.",
    fullDefinition:
      "Le surentraînement (ou syndrome de surentraînement, OTS) est un état de fatigue chronique résultant d'un déséquilibre prolongé entre la charge d'entraînement et la récupération. Les symptômes incluent : baisse de performance durable, fatigue persistante, troubles du sommeil, irritabilité, susceptibilité aux infections. La récupération peut prendre plusieurs mois. C'est différent du surmenage fonctionnel (fatigue normale qui se résout en quelques jours).",
    fullDefinitionEn:
      "Overtraining syndrome (OTS) is a chronic fatigue state resulting from prolonged imbalance between training load and recovery. Symptoms include: sustained performance decline, persistent fatigue, sleep disturbances, irritability, and increased susceptibility to infections. Recovery can take several months. It differs from functional overreaching (normal fatigue that resolves in a few days).",
    example:
      "Un athlète qui augmente brutalement son volume, ignore la fatigue, dort mal, et voit ses performances chuter malgré plus d'entraînement est possiblement en surentraînement.",
    exampleEn:
      "An athlete who abruptly increases volume, ignores fatigue, sleeps poorly, and sees performance decline despite more training may be overtrained.",
    relatedTerms: ["overreaching-fonctionnel", "overreaching-non-fonctionnel", "acwr", "hrv"],
    keywords: ["fatigue", "chronique", "récupération", "performance", "OTS"],
    externalLinks: [
      {
        label: "Prevention, diagnosis and treatment of OTS (ECSS/ACSM)",
        url: "https://pubmed.ncbi.nlm.nih.gov/23247672/",
        author: "Meeusen et al.",
      },
    ],
  },
  {
    id: "overreaching-fonctionnel",
    term: "Surmenage Fonctionnel",
    termEn: "Functional Overreaching",
    category: "recovery",
    shortDefinition:
      "Fatigue temporaire planifiée qui mène à une surcompensation après repos.",
    shortDefinitionEn:
      "Planned temporary fatigue leading to supercompensation after rest.",
    fullDefinition:
      "Le surmenage fonctionnel (Functional Overreaching, FOR) est une phase de fatigue accumulée intentionnelle pendant une période de charge élevée. Contrairement au surentraînement, c'est une étape normale et planifiée qui précède la surcompensation. Après quelques jours de récupération (5-14 jours), l'athlète revient plus fort. C'est le principe des blocs de charge suivis de deload.",
    fullDefinitionEn:
      "Functional Overreaching (FOR) is a phase of intentionally accumulated fatigue during a high-load period. Unlike overtraining, it is a normal and planned stage that precedes supercompensation. After a few days of recovery (5-14 days), the athlete returns stronger. This is the principle behind loading blocks followed by deload.",
    example:
      "Pendant les 3 semaines de charge avant un deload, tu accumules de la fatigue (FOR). Après la semaine de récupération, tu surcompenses et es plus performant.",
    exampleEn:
      "During the 3 weeks of loading before a deload, you accumulate fatigue (FOR). After the recovery week, you supercompensate and are more capable.",
    relatedTerms: ["surcompensation", "deload", "overreaching-non-fonctionnel"],
    keywords: ["surmenage", "fonctionnel", "fatigue", "planifié"],
  },
  {
    id: "overreaching-non-fonctionnel",
    term: "Surmenage Non-Fonctionnel",
    termEn: "Non-Functional Overreaching",
    category: "recovery",
    shortDefinition:
      "Fatigue excessive nécessitant plusieurs semaines de récupération.",
    shortDefinitionEn:
      "Excessive fatigue requiring several weeks of recovery.",
    fullDefinition:
      "Le surmenage non-fonctionnel (Non-Functional Overreaching, NFOR) est un état intermédiaire entre le surmenage fonctionnel et le surentraînement. La fatigue est plus profonde et nécessite plusieurs semaines (2-8) de récupération pour retrouver le niveau de performance. C'est le signal d'alarme qu'il faut écouter pour éviter de basculer dans le vrai surentraînement.",
    fullDefinitionEn:
      "Non-Functional Overreaching (NFOR) is an intermediate state between functional overreaching and overtraining syndrome. The fatigue is deeper and requires several weeks (2-8) of recovery to regain performance level. It is a warning signal that must be heeded to avoid progressing to true overtraining.",
    example:
      "Si après 2 semaines de repos tu ne retrouves pas tes sensations et tes performances, tu es probablement en NFOR et il faut prolonger la récupération.",
    exampleEn:
      "If after 2 weeks of rest you haven't regained your sensations and performance, you are probably in NFOR and need to extend recovery.",
    relatedTerms: ["overreaching-fonctionnel", "overtraining", "deload"],
    keywords: ["surmenage", "non-fonctionnel", "fatigue", "récupération"],
  },
];

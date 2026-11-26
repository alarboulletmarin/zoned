// src/data/glossary/terms/metrics.ts
// Training metrics and performance indicators

import type { GlossaryTerm } from "../types";

export const metricsTerms: GlossaryTerm[] = [
  {
    id: "vma",
    term: "Vitesse Maximale Aérobie",
    termEn: "Maximal Aerobic Speed",
    termIt: "Velocità Aerobica Massimale",
    acronym: "VMA",
    category: "metrics",
    shortDefinition:
      "Vitesse de course à laquelle la consommation d'oxygène atteint son maximum.",
    shortDefinitionEn:
      "Running speed at which oxygen consumption reaches its maximum.",
    shortDefinitionIt:
      "Velocità di corsa alla quale il consumo di ossigeno raggiunge il suo massimo.",
    fullDefinition:
      "La VMA représente la vitesse de déplacement à laquelle un athlète atteint sa consommation maximale d'oxygène (VO2max). C'est un indicateur clé de la performance en endurance, particulièrement en course à pied. Elle sert de référence pour calibrer les allures d'entraînement et permet de personnaliser les intensités de travail.",
    fullDefinitionEn:
      "Maximal Aerobic Speed (MAS) represents the running velocity at which an athlete reaches their maximum oxygen consumption (VO2max). It is a key indicator of endurance performance, particularly in running. It serves as a reference for calibrating training paces and allows for personalizing training intensities.",
    fullDefinitionIt:
      "La VAM (Velocità Aerobica Massimale) rappresenta la velocità di corsa alla quale un atleta raggiunge il proprio massimo consumo di ossigeno (VO2max). È un indicatore chiave della prestazione di resistenza, soprattutto nella corsa, e serve come riferimento per calibrare i ritmi di allenamento e personalizzare le intensità di lavoro.",
    example:
      "Si ta VMA est de 16 km/h, une séance à 85% VMA se fera à 13.6 km/h, soit environ 4:25/km.",
    exampleEn:
      "If your MAS is 16 km/h, a session at 85% MAS will be at 13.6 km/h, approximately 4:25/km.",
    exampleIt:
      "Se la tua VAM è di 16 km/h, una seduta all'85% della VAM si svolgerà a 13,6 km/h, ovvero circa 4:25/km.",
    formula: "VMA (km/h) = Distance parcourue / Temps (en heures)",
    relatedTerms: ["vo2max", "zone-5", "intervals"],
    keywords: ["vitesse", "aérobie", "test", "allure", "performance"],
    externalLinks: [
      {
        label: "Test VMA Léger-Boucher",
        url: "https://www.sciencedirect.com/science/article/abs/pii/0765159188901369",
        author: "Léger & Boucher",
      },
    ],
  },
  {
    id: "ftp",
    term: "Functional Threshold Power",
    termEn: "Functional Threshold Power",
    termIt: "Potenza di Soglia Funzionale (FTP)",
    acronym: "FTP",
    category: "metrics",
    shortDefinition:
      "Puissance maximale soutenable pendant une heure en cyclisme.",
    shortDefinitionEn:
      "Maximum power sustainable for approximately one hour in cycling.",
    shortDefinitionIt:
      "Potenza massima sostenibile per circa un'ora nel ciclismo.",
    fullDefinition:
      "Le FTP représente la puissance (en watts) qu'un cycliste peut maintenir pendant environ une heure sans accumulation excessive de lactate. C'est l'équivalent du seuil lactique pour le vélo et sert de base pour définir les zones d'entraînement en puissance. Le FTP est généralement estimé à 95% de la puissance moyenne d'un test de 20 minutes.",
    fullDefinitionEn:
      "FTP represents the power output (in watts) a cyclist can sustain for approximately one hour without excessive lactate accumulation. It is the cycling equivalent of lactate threshold and serves as the basis for defining power-based training zones. FTP is typically estimated at 95% of the average power from a 20-minute test.",
    fullDefinitionIt:
      "La FTP (Functional Threshold Power) rappresenta la potenza (in watt) che un ciclista può mantenere per circa un'ora senza un accumulo eccessivo di lattato. È l'equivalente ciclistico della soglia lattacida e funge da base per definire le zone di allenamento basate sulla potenza. Viene generalmente stimata al 95% della potenza media di un test di 20 minuti.",
    example:
      "Avec un FTP de 250W, ta zone d'endurance (Z2) serait entre 137-187W, et ta zone de seuil (Z4) entre 237-262W.",
    exampleEn:
      "With an FTP of 250W, your endurance zone (Z2) would be 137-187W, and your threshold zone (Z4) would be 237-262W.",
    exampleIt:
      "Con una FTP di 250W, la tua zona di resistenza (Z2) sarebbe tra 137 e 187W, e la tua zona di soglia (Z4) tra 237 e 262W.",
    formula: "FTP ≈ Puissance moyenne sur 20 min × 0.95",
    relatedTerms: ["tss", "if", "np", "sweet-spot"],
    zone: 4,
    keywords: ["puissance", "watts", "cyclisme", "seuil", "vélo"],
    externalLinks: [
      {
        label: "What is Functional Threshold Power?",
        url: "https://www.trainingpeaks.com/learn/articles/what-is-threshold-power",
        author: "Coggan",
      },
    ],
  },
  {
    id: "tss",
    term: "Training Stress Score",
    termEn: "Training Stress Score",
    termIt: "Training Stress Score (TSS)",
    acronym: "TSS",
    category: "metrics",
    shortDefinition:
      "Score quantifiant la charge d'une séance basée sur l'intensité et la durée.",
    shortDefinitionEn:
      "Score quantifying session training load based on intensity and duration.",
    shortDefinitionIt:
      "Punteggio che quantifica il carico di una seduta in base a intensità e durata.",
    fullDefinition:
      "Le TSS est une métrique développée par Andrew Coggan qui combine la durée et l'intensité d'une séance pour quantifier la charge d'entraînement. Un TSS de 100 correspond à une heure d'effort au seuil fonctionnel (FTP). Cette métrique permet de comparer des séances de natures différentes et de planifier la charge hebdomadaire.",
    fullDefinitionEn:
      "TSS is a metric developed by Andrew Coggan that combines session duration and intensity to quantify training load. A TSS of 100 corresponds to one hour of effort at functional threshold power (FTP). This metric enables comparison of different session types and planning weekly training load.",
    fullDefinitionIt:
      "Il TSS è una metrica sviluppata da Andrew Coggan che combina durata e intensità di una seduta per quantificare il carico di allenamento. Un TSS di 100 corrisponde a un'ora di sforzo alla soglia funzionale (FTP). Consente di confrontare sedute di natura diversa e pianificare il carico settimanale.",
    example:
      "Une sortie longue de 3h en endurance peut générer 150 TSS, tandis qu'une séance de fractionné intense d'1h peut donner 80 TSS.",
    exampleEn:
      "A 3-hour endurance ride may generate 150 TSS, while an intense 1-hour interval session might yield 80 TSS.",
    exampleIt:
      "Un'uscita lunga di 3 ore in resistenza può generare 150 TSS, mentre una seduta intensa di ripetute di 1 ora può produrre 80 TSS.",
    formula: "TSS = (Durée en sec × NP × IF) / (FTP × 3600) × 100",
    relatedTerms: ["ftp", "if", "np", "ctl", "atl", "tsb"],
    keywords: ["charge", "stress", "entraînement", "quantification"],
    externalLinks: [
      {
        label: "What is TSS?",
        url: "https://www.trainingpeaks.com/learn/articles/what-is-tss",
        author: "TrainingPeaks",
      },
    ],
  },
  {
    id: "trimp",
    term: "Training Impulse",
    termEn: "Training Impulse",
    termIt: "Training Impulse (TRIMP)",
    acronym: "TRIMP",
    category: "metrics",
    shortDefinition:
      "Méthode de quantification de la charge basée sur la fréquence cardiaque.",
    shortDefinitionEn:
      "Training load quantification method based on heart rate.",
    shortDefinitionIt:
      "Metodo di quantificazione del carico basato sulla frequenza cardiaca.",
    fullDefinition:
      "Le TRIMP (Training Impulse) est une méthode de quantification de la charge d'entraînement développée par Banister. Il utilise la durée de l'effort et l'intensité relative de la fréquence cardiaque pour calculer un score. Contrairement au TSS qui nécessite un capteur de puissance, le TRIMP peut être calculé avec un simple cardiofréquencemètre.",
    fullDefinitionEn:
      "TRIMP (Training Impulse) is a training load quantification method developed by Banister. It uses exercise duration and relative heart rate intensity to calculate a score. Unlike TSS which requires a power meter, TRIMP can be calculated with a simple heart rate monitor.",
    fullDefinitionIt:
      "Il TRIMP (Training Impulse) è un metodo di quantificazione del carico di allenamento sviluppato da Banister. Utilizza la durata dello sforzo e l'intensità relativa della frequenza cardiaca per calcolare un punteggio. A differenza del TSS, che richiede un misuratore di potenza, il TRIMP può essere calcolato con un semplice cardiofrequenzimetro.",
    example:
      "Une séance de 60 minutes à 75% de ta FC de réserve générera un TRIMP d'environ 100 unités.",
    exampleEn:
      "A 60-minute session at 75% of your heart rate reserve will generate approximately 100 TRIMP units.",
    exampleIt:
      "Una seduta di 60 minuti al 75% della tua FC di riserva genererà un TRIMP di circa 100 unità.",
    formula: "TRIMP = Durée (min) × ΔFC ratio × facteur de pondération",
    relatedTerms: ["tss", "fc-max", "fc-repos"],
    keywords: ["charge", "cardiaque", "impulsion", "Banister"],
    externalLinks: [
      {
        label: "Banister's TRIMP model explained",
        url: "https://www.trainingimpulse.com/banisters-trimp-0",
        author: "Banister",
      },
    ],
  },
  {
    id: "if",
    term: "Intensity Factor",
    termEn: "Intensity Factor",
    termIt: "Fattore di Intensità (IF)",
    acronym: "IF",
    category: "metrics",
    shortDefinition: "Ratio entre la puissance normalisée et le FTP.",
    shortDefinitionEn: "Ratio between normalized power and FTP.",
    shortDefinitionIt: "Rapporto tra la potenza normalizzata e la FTP.",
    fullDefinition:
      "L'Intensity Factor (IF) mesure l'intensité relative d'une séance par rapport au seuil fonctionnel. Un IF de 1.0 signifie que la séance a été réalisée exactement au niveau du FTP. Cette métrique permet de comparer rapidement l'intensité de séances de durées différentes.",
    fullDefinitionEn:
      "Intensity Factor (IF) measures the relative intensity of a session compared to functional threshold. An IF of 1.0 means the session was performed exactly at FTP level. This metric allows for quick comparison of intensity across sessions of different durations.",
    fullDefinitionIt:
      "L'Intensity Factor (IF) misura l'intensità relativa di una seduta rispetto alla soglia funzionale. Un IF pari a 1,0 indica che la seduta è stata svolta esattamente al livello della FTP. Questa metrica permette di confrontare rapidamente l'intensità di sedute di durata diversa.",
    example:
      "Une course de critérium intense peut avoir un IF de 1.05-1.10, tandis qu'une sortie d'endurance aura un IF de 0.65-0.75.",
    exampleEn:
      "An intense criterium race may have an IF of 1.05-1.10, while an endurance ride will have an IF of 0.65-0.75.",
    exampleIt:
      "Una gara in circuito intensa può avere un IF di 1,05-1,10, mentre un'uscita di resistenza avrà un IF di 0,65-0,75.",
    formula: "IF = NP / FTP",
    relatedTerms: ["ftp", "np", "tss"],
    keywords: ["intensité", "facteur", "puissance", "ratio"],
  },
  {
    id: "rpe",
    term: "Rate of Perceived Exertion",
    termEn: "Rate of Perceived Exertion",
    termIt: "Scala di Sforzo Percepito (RPE)",
    acronym: "RPE",
    category: "metrics",
    shortDefinition: "Échelle subjective de perception de l'effort de 1 à 10.",
    shortDefinitionEn: "Subjective effort perception scale from 1 to 10.",
    shortDefinitionIt: "Scala soggettiva di percezione dello sforzo da 1 a 10.",
    fullDefinition:
      "Le RPE est une échelle de perception subjective de l'effort, généralement de 1 à 10 (échelle de Borg modifiée). Elle permet d'évaluer l'intensité ressentie indépendamment des données physiologiques. C'est un outil précieux car il intègre tous les facteurs de stress (physique, mental, fatigue accumulée).",
    fullDefinitionEn:
      "RPE is a subjective effort perception scale, typically from 1 to 10 (modified Borg scale). It allows for evaluating perceived intensity independently of physiological data. It is a valuable tool as it integrates all stress factors (physical, mental, accumulated fatigue).",
    fullDefinitionIt:
      "L'RPE è una scala di percezione soggettiva dello sforzo, generalmente da 1 a 10 (scala di Borg modificata). Consente di valutare l'intensità percepita indipendentemente dai dati fisiologici ed è uno strumento prezioso perché integra tutti i fattori di stress (fisico, mentale, fatica accumulata).",
    example:
      "RPE 6-7 correspond à un effort 'dur mais soutenable' typique d'une séance tempo. RPE 9-10 est réservé aux efforts maximaux courts.",
    exampleEn:
      "RPE 6-7 corresponds to a 'hard but sustainable' effort typical of a tempo session. RPE 9-10 is reserved for short maximal efforts.",
    exampleIt:
      "Un RPE 6-7 corrisponde a uno sforzo 'duro ma sostenibile', tipico di una seduta tempo. Un RPE 9-10 è riservato agli sforzi massimali brevi.",
    relatedTerms: ["zones-entraînement", "threshold"],
    keywords: ["perception", "effort", "Borg", "subjectif", "échelle"],
    externalLinks: [
      {
        label: "Perceived Exertion Scale",
        url: "https://pubmed.ncbi.nlm.nih.gov/7154893/",
        author: "Borg",
      },
    ],
  },
  {
    id: "doms",
    term: "Delayed Onset Muscle Soreness",
    termEn: "Delayed Onset Muscle Soreness",
    termIt: "Indolenzimento Muscolare a Insorgenza Ritardata (DOMS)",
    acronym: "DOMS",
    category: "metrics",
    shortDefinition:
      "Douleurs musculaires apparaissant 24-72h après l'effort.",
    shortDefinitionEn: "Muscle soreness appearing 24-72 hours after exercise.",
    shortDefinitionIt: "Dolori muscolari che compaiono 24-72 ore dopo lo sforzo.",
    fullDefinition:
      "Les DOMS sont des douleurs musculaires retardées qui apparaissent typiquement 24 à 72 heures après un effort inhabituel, particulièrement après des contractions excentriques (descentes, fractionné). Elles sont causées par des micro-lésions musculaires et font partie du processus d'adaptation. Elles ne sont pas un indicateur fiable de la qualité de l'entraînement.",
    fullDefinitionEn:
      "DOMS are delayed muscle soreness that typically appears 24 to 72 hours after unaccustomed exercise, particularly following eccentric contractions (downhill running, intervals). They are caused by micro-damage to muscle fibers and are part of the adaptation process. They are not a reliable indicator of training quality.",
    fullDefinitionIt:
      "I DOMS sono dolori muscolari ritardati che compaiono tipicamente 24-72 ore dopo uno sforzo insolito, in particolare dopo contrazioni eccentriche (discese, ripetute). Sono causati da microlesioni muscolari e fanno parte del processo di adattamento, ma non sono un indicatore affidabile della qualità dell'allenamento.",
    example:
      "Après une première séance de côtes ou un trail avec beaucoup de descentes, les DOMS dans les quadriceps sont fréquents pendant 2-3 jours.",
    exampleEn:
      "After a first hill session or a trail run with many descents, DOMS in the quadriceps are common for 2-3 days.",
    exampleIt:
      "Dopo una prima seduta in salita o un trail con molte discese, i DOMS ai quadricipiti sono frequenti per 2-3 giorni.",
    relatedTerms: ["recovery", "adaptation", "overtraining"],
    keywords: ["douleur", "courbature", "muscle", "récupération"],
  },
  {
    id: "hrv",
    term: "Heart Rate Variability",
    termEn: "Heart Rate Variability",
    termIt: "Variabilità della Frequenza Cardiaca (HRV)",
    acronym: "HRV",
    category: "metrics",
    shortDefinition:
      "Variabilité du temps entre les battements cardiaques, indicateur de récupération.",
    shortDefinitionEn:
      "Variability in time between heartbeats, indicator of recovery status.",
    shortDefinitionIt:
      "Variabilità del tempo tra i battiti cardiaci, indicatore dello stato di recupero.",
    fullDefinition:
      "La HRV mesure les variations du temps entre chaque battement cardiaque (intervalles R-R). Une HRV élevée indique généralement un bon état de récupération et une dominance parasympathique, tandis qu'une HRV basse peut signaler fatigue, stress ou surentraînement. Elle doit être mesurée dans des conditions standardisées (au réveil, allongé) et analysée sur plusieurs jours.",
    fullDefinitionEn:
      "HRV measures variations in time between each heartbeat (R-R intervals). High HRV generally indicates good recovery status and parasympathetic dominance, while low HRV may signal fatigue, stress, or overtraining. It should be measured under standardized conditions (upon waking, lying down) and analyzed over several days.",
    fullDefinitionIt:
      "L'HRV misura le variazioni di tempo tra un battito cardiaco e il successivo (intervalli R-R). Un'HRV elevata indica generalmente un buon recupero e dominanza parasimpatica, mentre un'HRV bassa può segnalare fatica, stress o sovrallenamento. Va misurata in condizioni standardizzate (al risveglio, da sdraiati) e analizzata su più giorni.",
    example:
      "Si ta HRV moyenne est de 65ms et qu'elle chute à 45ms pendant plusieurs jours, c'est un signal d'alerte indiquant un besoin de récupération.",
    exampleEn:
      "If your average HRV is 65ms and it drops to 45ms for several days, this is a warning signal indicating a need for recovery.",
    exampleIt:
      "Se la tua HRV media è di 65 ms e scende a 45 ms per diversi giorni, è un segnale d'allarme che indica la necessità di recupero.",
    relatedTerms: ["overtraining", "recovery", "fc-repos"],
    keywords: ["variabilité", "cardiaque", "récupération", "stress", "repos"],
    externalLinks: [
      {
        label: "Training Adaptation and HRV in Elite Endurance Athletes",
        url: "https://pubmed.ncbi.nlm.nih.gov/23852425/",
        author: "Plews et al.",
      },
    ],
  },
  {
    id: "acwr",
    term: "Acute:Chronic Workload Ratio",
    termEn: "Acute:Chronic Workload Ratio",
    termIt: "Rapporto Carico Acuto:Cronico (ACWR)",
    acronym: "ACWR",
    category: "metrics",
    shortDefinition:
      "Ratio entre la charge récente et la charge habituelle, indicateur de risque de blessure.",
    shortDefinitionEn:
      "Ratio between recent and habitual training load, injury risk indicator.",
    shortDefinitionIt:
      "Rapporto tra il carico recente e quello abituale, indicatore del rischio di infortunio.",
    fullDefinition:
      "L'ACWR compare la charge d'entraînement de la semaine en cours (charge aiguë) à la moyenne des 4 dernières semaines (charge chronique). Un ratio entre 0.8 et 1.3 est considéré comme optimal. Au-delà de 1.5, le risque de blessure augmente significativement. Ce ratio aide à planifier les augmentations de charge de manière progressive.",
    fullDefinitionEn:
      "ACWR compares the current week's training load (acute load) to the average of the past 4 weeks (chronic load). A ratio between 0.8 and 1.3 is considered optimal. Above 1.5, injury risk increases significantly. This ratio helps plan progressive load increases.",
    fullDefinitionIt:
      "L'ACWR confronta il carico di allenamento della settimana in corso (carico acuto) con la media delle ultime 4 settimane (carico cronico). Un rapporto tra 0,8 e 1,3 è considerato ottimale; oltre 1,5 il rischio di infortunio aumenta sensibilmente. Questo rapporto aiuta a pianificare incrementi di carico progressivi.",
    example:
      "Si ta charge moyenne des 4 dernières semaines est de 400 TSS et que cette semaine tu fais 600 TSS, ton ACWR est de 1.5, ce qui est dans la zone de danger.",
    exampleEn:
      "If your average load over the past 4 weeks is 400 TSS and this week you do 600 TSS, your ACWR is 1.5, which is in the danger zone.",
    exampleIt:
      "Se il tuo carico medio delle ultime 4 settimane è di 400 TSS e questa settimana fai 600 TSS, il tuo ACWR è 1,5, ovvero nella zona di rischio.",
    formula: "ACWR = Charge semaine actuelle / Moyenne charge 4 semaines",
    relatedTerms: ["tss", "ctl", "atl", "overtraining"],
    keywords: ["ratio", "charge", "blessure", "prévention", "Gabbett"],
    externalLinks: [
      {
        label: "The training-injury prevention paradox",
        url: "https://bjsm.bmj.com/content/50/5/273",
        author: "Gabbett",
      },
    ],
  },
  {
    id: "ctl",
    term: "Chronic Training Load",
    termEn: "Chronic Training Load",
    termIt: "Carico di Allenamento Cronico (CTL)",
    acronym: "CTL",
    category: "metrics",
    shortDefinition:
      "Charge d'entraînement chronique, représente la forme/fitness à long terme.",
    shortDefinitionEn:
      "Chronic training load, represents long-term fitness.",
    shortDefinitionIt:
      "Carico di allenamento cronico, rappresenta la forma fisica a lungo termine.",
    fullDefinition:
      "Le CTL représente la moyenne mobile exponentielle de la charge d'entraînement sur environ 42 jours. C'est un indicateur de la 'fitness' ou forme acquise sur le long terme. Un CTL élevé indique une bonne base d'entraînement, mais doit être construit progressivement pour éviter les blessures.",
    fullDefinitionEn:
      "CTL represents the exponential moving average of training load over approximately 42 days. It is an indicator of fitness acquired over the long term. A high CTL indicates a good training base, but must be built progressively to avoid injuries.",
    fullDefinitionIt:
      "Il CTL rappresenta la media mobile esponenziale del carico di allenamento su circa 42 giorni. È un indicatore della forma fisica (fitness) acquisita nel lungo periodo. Un CTL elevato indica una buona base di allenamento, ma va costruito progressivamente per evitare infortuni.",
    example:
      "Un coureur débutant peut avoir un CTL de 30-40, un amateur sérieux 60-80, et un élite 100-150+.",
    exampleEn:
      "A beginner runner may have a CTL of 30-40, a serious amateur 60-80, and an elite athlete 100-150+.",
    exampleIt:
      "Un runner principiante può avere un CTL di 30-40, un amatore evoluto 60-80 e un atleta d'élite 100-150+.",
    relatedTerms: ["atl", "tsb", "tss"],
    keywords: ["charge", "chronique", "fitness", "forme", "PMC"],
    externalLinks: [
      {
        label: "What is the Performance Management Chart?",
        url: "https://www.trainingpeaks.com/learn/articles/what-is-the-performance-management-chart",
        author: "TrainingPeaks",
      },
    ],
  },
  {
    id: "atl",
    term: "Acute Training Load",
    termEn: "Acute Training Load",
    termIt: "Carico di Allenamento Acuto (ATL)",
    acronym: "ATL",
    category: "metrics",
    shortDefinition:
      "Charge d'entraînement aiguë, représente la fatigue récente.",
    shortDefinitionEn: "Acute training load, represents recent fatigue.",
    shortDefinitionIt: "Carico di allenamento acuto, rappresenta la fatica recente.",
    fullDefinition:
      "L'ATL représente la moyenne mobile exponentielle de la charge d'entraînement sur environ 7 jours. C'est un indicateur de la fatigue accumulée récemment. Un ATL élevé par rapport au CTL indique une période de charge importante qui nécessitera de la récupération.",
    fullDefinitionEn:
      "ATL represents the exponential moving average of training load over approximately 7 days. It is an indicator of recently accumulated fatigue. A high ATL relative to CTL indicates a heavy loading period that will require recovery.",
    fullDefinitionIt:
      "L'ATL rappresenta la media mobile esponenziale del carico di allenamento su circa 7 giorni. È un indicatore della fatica accumulata di recente. Un ATL elevato rispetto al CTL segnala un periodo di carico intenso che richiederà recupero.",
    example:
      "Pendant un bloc d'entraînement intensif, ton ATL peut monter à 80-100 TSS/jour, générant une fatigue importante.",
    exampleEn:
      "During an intensive training block, your ATL can rise to 80-100 TSS/day, generating significant fatigue.",
    exampleIt:
      "Durante un blocco di allenamento intensivo, il tuo ATL può salire a 80-100 TSS/giorno, generando una fatica significativa.",
    relatedTerms: ["ctl", "tsb", "tss"],
    keywords: ["charge", "aiguë", "fatigue", "récent"],
  },
  {
    id: "tsb",
    term: "Training Stress Balance",
    termEn: "Training Stress Balance",
    termIt: "Bilancio dello Stress di Allenamento (TSB)",
    acronym: "TSB",
    category: "metrics",
    shortDefinition:
      "Différence entre fitness (CTL) et fatigue (ATL), indique la fraîcheur.",
    shortDefinitionEn:
      "Difference between fitness (CTL) and fatigue (ATL), indicates freshness.",
    shortDefinitionIt:
      "Differenza tra forma (CTL) e fatica (ATL), indica lo stato di freschezza.",
    fullDefinition:
      "Le TSB est la différence entre le CTL et l'ATL (TSB = CTL - ATL). Un TSB positif indique que l'athlète est 'frais' et potentiellement en forme pour performer. Un TSB négatif indique de la fatigue accumulée. Pour une compétition importante, on vise généralement un TSB entre +10 et +25.",
    fullDefinitionEn:
      "TSB is the difference between CTL and ATL (TSB = CTL - ATL). A positive TSB indicates the athlete is 'fresh' and potentially ready to perform. A negative TSB indicates accumulated fatigue. For an important competition, a TSB between +10 and +25 is typically targeted.",
    fullDefinitionIt:
      "Il TSB è la differenza tra CTL e ATL (TSB = CTL - ATL). Un TSB positivo indica che l'atleta è 'fresco' e pronto a esprimersi al meglio; un TSB negativo indica fatica accumulata. Per una gara importante si punta generalmente a un TSB tra +10 e +25.",
    example:
      "Après 3 semaines de charge progressive, ton TSB peut être à -20. Après 10 jours de taper, il remonte à +15, idéal pour une course.",
    exampleEn:
      "After 3 weeks of progressive loading, your TSB may be at -20. After 10 days of taper, it rises to +15, ideal for a race.",
    exampleIt:
      "Dopo 3 settimane di carico progressivo, il tuo TSB può essere a -20. Dopo 10 giorni di tapering risale a +15, ideale per una gara.",
    formula: "TSB = CTL - ATL",
    relatedTerms: ["ctl", "atl", "taper", "peaking"],
    keywords: ["balance", "fraîcheur", "forme", "fatigue", "pic"],
  },
  {
    id: "np",
    term: "Normalized Power",
    termEn: "Normalized Power",
    termIt: "Potenza Normalizzata (NP)",
    acronym: "NP",
    category: "metrics",
    shortDefinition:
      "Puissance normalisée tenant compte de la variabilité de l'effort.",
    shortDefinitionEn:
      "Normalized power accounting for effort variability.",
    shortDefinitionIt:
      "Potenza normalizzata che tiene conto della variabilità dello sforzo.",
    fullDefinition:
      "La Normalized Power est une estimation de la puissance qu'un cycliste aurait pu maintenir de façon constante pour produire le même coût physiologique qu'un effort variable. Elle est toujours supérieure ou égale à la puissance moyenne et reflète mieux le stress réel de la séance, surtout pour les parcours vallonnés ou les critériums.",
    fullDefinitionEn:
      "Normalized Power is an estimate of the power a cyclist could have maintained steadily to produce the same physiological cost as a variable effort. It is always equal to or greater than average power and better reflects the actual session stress, especially for hilly courses or criteriums.",
    fullDefinitionIt:
      "La Normalized Power (NP) è una stima della potenza che un ciclista avrebbe potuto mantenere in modo costante per produrre lo stesso costo fisiologico di uno sforzo variabile. È sempre maggiore o uguale alla potenza media e riflette meglio lo stress reale della seduta, soprattutto su percorsi ondulati o in circuito.",
    example:
      "Sur une sortie avec beaucoup de relances, tu peux avoir une puissance moyenne de 180W mais une NP de 220W, reflétant l'effort réel.",
    exampleEn:
      "On a ride with many surges, you might have an average power of 180W but an NP of 220W, reflecting the actual effort.",
    exampleIt:
      "In un'uscita con molti rilanci puoi avere una potenza media di 180W ma una NP di 220W, che riflette lo sforzo reale.",
    relatedTerms: ["ftp", "if", "vi"],
    keywords: ["puissance", "normalisée", "cyclisme", "variabilité"],
  },
  {
    id: "vi",
    term: "Variability Index",
    termEn: "Variability Index",
    termIt: "Indice di Variabilità (VI)",
    acronym: "VI",
    category: "metrics",
    shortDefinition:
      "Ratio entre puissance normalisée et moyenne, indique la régularité de l'effort.",
    shortDefinitionEn:
      "Ratio between normalized and average power, indicates pacing consistency.",
    shortDefinitionIt:
      "Rapporto tra potenza normalizzata e potenza media, indica la regolarità dello sforzo.",
    fullDefinition:
      "Le Variability Index mesure à quel point l'effort a été régulier pendant une séance. Un VI de 1.0 signifie un effort parfaitement constant. Plus le VI est élevé, plus l'effort a été variable (accélérations, côtes, relances). Pour un contre-la-montre optimal, on vise un VI proche de 1.05.",
    fullDefinitionEn:
      "The Variability Index measures how steady the effort was during a session. A VI of 1.0 means perfectly constant effort. The higher the VI, the more variable the effort (accelerations, climbs, surges). For an optimal time trial, a VI close to 1.05 is targeted.",
    fullDefinitionIt:
      "Il Variability Index (VI) misura quanto sia stato regolare lo sforzo durante una seduta. Un VI di 1,0 indica uno sforzo perfettamente costante; più il VI è alto, più lo sforzo è stato variabile (accelerazioni, salite, rilanci). Per una cronometro ottimale si punta a un VI vicino a 1,05.",
    example:
      "Un contre-la-montre bien géré aura un VI de 1.02-1.05, tandis qu'une course en peloton peut avoir un VI de 1.15-1.25.",
    exampleEn:
      "A well-paced time trial will have a VI of 1.02-1.05, while a bunch race may have a VI of 1.15-1.25.",
    exampleIt:
      "Una cronometro ben gestita avrà un VI di 1,02-1,05, mentre una gara in gruppo può avere un VI di 1,15-1,25.",
    formula: "VI = NP / Puissance moyenne",
    relatedTerms: ["np"],
    keywords: ["variabilité", "index", "régularité", "pacing"],
  },
  {
    id: "css",
    term: "Critical Swim Speed",
    termEn: "Critical Swim Speed",
    termIt: "Velocità Critica di Nuoto (CSS)",
    acronym: "CSS",
    category: "metrics",
    shortDefinition:
      "Vitesse critique de nage, équivalent du seuil lactique en natation.",
    shortDefinitionEn:
      "Critical swimming speed, the swimming equivalent of lactate threshold.",
    shortDefinitionIt:
      "Velocità critica di nuoto, equivalente della soglia lattacida nel nuoto.",
    fullDefinition:
      "La CSS est la vitesse de nage théoriquement soutenable indéfiniment sans accumulation de lactate. En pratique, c'est l'allure que tu peux tenir sur 1500m-2000m. Elle sert de base pour définir les zones d'entraînement en natation, tout comme la VMA en course ou le FTP en vélo.",
    fullDefinitionEn:
      "CSS is the swimming speed theoretically sustainable indefinitely without lactate accumulation. In practice, it is the pace you can hold for 1500m-2000m. It serves as the basis for defining swimming training zones, just like MAS in running or FTP in cycling.",
    fullDefinitionIt:
      "La CSS è la velocità di nuoto teoricamente sostenibile indefinitamente senza accumulo di lattato. In pratica corrisponde al ritmo che riesci a mantenere sui 1500m-2000m e serve da base per definire le zone di allenamento nel nuoto, proprio come la VAM nella corsa o la FTP nel ciclismo.",
    example:
      "Avec une CSS de 1:40/100m, ta zone d'endurance serait autour de 1:50/100m et tes intervalles seuil autour de 1:35-1:40/100m.",
    exampleEn:
      "With a CSS of 1:40/100m, your endurance zone would be around 1:50/100m and your threshold intervals around 1:35-1:40/100m.",
    exampleIt:
      "Con una CSS di 1:40/100m, la tua zona di resistenza sarebbe intorno a 1:50/100m e le tue ripetute alla soglia intorno a 1:35-1:40/100m.",
    formula: "CSS = (Distance 400m - Distance 200m) / (Temps 400m - Temps 200m)",
    relatedTerms: ["threshold", "ftp", "vma"],
    keywords: ["natation", "vitesse", "critique", "seuil", "piscine"],
  },
  {
    id: "fc-max",
    term: "Fréquence Cardiaque Maximale",
    termEn: "Maximum Heart Rate",
    termIt: "Frequenza Cardiaca Massima",
    acronym: "FC Max",
    category: "metrics",
    shortDefinition:
      "Nombre maximal de battements cardiaques par minute atteignable.",
    shortDefinitionEn:
      "Maximum number of heartbeats per minute achievable.",
    shortDefinitionIt:
      "Numero massimo di battiti cardiaci al minuto raggiungibile.",
    fullDefinition:
      "La FC Max est le nombre maximum de battements par minute que ton cœur peut atteindre lors d'un effort maximal. Elle est relativement stable et diminue légèrement avec l'âge (environ 1 bpm/an). Elle sert de référence pour calculer les zones d'entraînement cardiaques. Les formules d'estimation (220-âge) sont très imprécises ; un test terrain est préférable.",
    fullDefinitionEn:
      "Max HR is the maximum number of beats per minute your heart can achieve during maximal effort. It is relatively stable and decreases slightly with age (approximately 1 bpm/year). It serves as a reference for calculating heart rate training zones. Estimation formulas (220-age) are very imprecise; a field test is preferable.",
    fullDefinitionIt:
      "La FC Max è il numero massimo di battiti al minuto che il cuore può raggiungere durante uno sforzo massimale. È relativamente stabile e diminuisce leggermente con l'età (circa 1 bpm/anno). Serve come riferimento per calcolare le zone cardiache; le formule teoriche (220-età) sono imprecise ed è preferibile un test sul campo.",
    example:
      "Avec une FC Max de 185 bpm, ta zone 2 (endurance) serait environ 120-145 bpm selon la méthode Karvonen.",
    exampleEn:
      "With a Max HR of 185 bpm, your zone 2 (endurance) would be approximately 120-145 bpm using the Karvonen method.",
    exampleIt:
      "Con una FC Max di 185 bpm, la tua zona 2 (resistenza) sarebbe circa 120-145 bpm secondo il metodo Karvonen.",
    formula: "Estimation : 220 - âge (peu fiable, ±10-15 bpm)",
    relatedTerms: ["fc-repos", "zones-entraînement", "hrv"],
    keywords: ["cardiaque", "maximum", "battements", "cœur", "test"],
  },
  {
    id: "fc-repos",
    term: "Fréquence Cardiaque de Repos",
    termEn: "Resting Heart Rate",
    termIt: "Frequenza Cardiaca a Riposo",
    acronym: "FC Repos",
    category: "metrics",
    shortDefinition:
      "Nombre de battements cardiaques par minute au repos complet.",
    shortDefinitionEn: "Number of heartbeats per minute at complete rest.",
    shortDefinitionIt: "Numero di battiti cardiaci al minuto in condizioni di riposo completo.",
    fullDefinition:
      "La FC de repos est mesurée au réveil, allongé, avant de se lever. Elle reflète l'efficacité cardiaque et le niveau d'entraînement en endurance. Une FC repos basse (40-50 bpm chez les athlètes entraînés) indique un cœur efficace. Elle est utilisée dans la méthode Karvonen pour calculer les zones d'entraînement plus précisément.",
    fullDefinitionEn:
      "Resting HR is measured upon waking, lying down, before getting up. It reflects cardiac efficiency and endurance training level. A low resting HR (40-50 bpm in trained athletes) indicates an efficient heart. It is used in the Karvonen method to calculate training zones more precisely.",
    fullDefinitionIt:
      "La FC a riposo si misura al risveglio, da sdraiati, prima di alzarsi. Riflette l'efficienza cardiaca e il livello di allenamento aerobico: valori bassi (40-50 bpm negli atleti allenati) indicano un cuore efficiente. È utilizzata nel metodo Karvonen per calcolare con maggiore precisione le zone di allenamento.",
    example:
      "Un débutant peut avoir une FC repos de 70-80 bpm, tandis qu'un athlète endurant bien entraîné peut descendre à 40-50 bpm.",
    exampleEn:
      "A beginner may have a resting HR of 70-80 bpm, while a well-trained endurance athlete can go as low as 40-50 bpm.",
    exampleIt:
      "Un principiante può avere una FC a riposo di 70-80 bpm, mentre un atleta di endurance ben allenato può scendere a 40-50 bpm.",
    relatedTerms: ["fc-max", "hrv", "overtraining"],
    keywords: ["cardiaque", "repos", "récupération", "Karvonen"],
  },
  {
    id: "vitesse-critique",
    term: "Vitesse Critique",
    termEn: "Critical Velocity",
    termIt: "Velocità Critica (CV)",
    acronym: "CV",
    category: "metrics",
    shortDefinition:
      "Vitesse maximale soutenable sans accumulation continue de fatigue, frontière entre les domaines lourd et sévère.",
    shortDefinitionEn:
      "Maximum sustainable speed without continuous fatigue accumulation, boundary between heavy and severe exercise domains.",
    shortDefinitionIt:
      "Velocità massima sostenibile senza accumulo continuo di fatica, confine tra dominio intenso e severo.",
    fullDefinition:
      "La vitesse critique (CV) représente la frontière entre le domaine d'exercice lourd et sévère. C'est l'allure maximale à laquelle la consommation d'oxygène et le lactate sanguin se stabilisent. Au-dessus de la CV, les réserves anaérobies (D') sont progressivement épuisées et l'arrêt devient inévitable. En pratique, la CV correspond approximativement à l'allure de course sur 30-40 minutes. Elle est un prédicteur de performance en endurance plus précis que la VO2max seule.",
    fullDefinitionEn:
      "Critical velocity (CV) represents the boundary between the 'heavy' and 'severe' exercise domains. It is the maximum pace at which oxygen consumption and blood lactate stabilize. Above CV, anaerobic reserves (D') are progressively depleted and cessation becomes inevitable. In practice, CV roughly corresponds to 30-40 minute race pace. It is a more precise endurance performance predictor than VO2max alone.",
    fullDefinitionIt:
      "La velocità critica (CV) rappresenta il confine tra il dominio di esercizio intenso e quello severo. È il passo massimo al quale il consumo di ossigeno e il lattato ematico si stabilizzano; al di sopra della CV le riserve anaerobiche (D') si esauriscono progressivamente. In pratica corrisponde circa al ritmo gara sui 30-40 minuti ed è un predittore di prestazione più preciso della sola VO2max.",
    example:
      "Si ta CV est de 15 km/h, tu peux théoriquement maintenir cette allure (4:00/km) pendant 30-40 min. Les entraînements à allure CV développent spécifiquement les fibres musculaires de Type IIa.",
    exampleEn:
      "If your CV is 15 km/h, you can theoretically sustain this pace (4:00/km) for 30-40 min. Training at CV pace specifically develops Type IIa muscle fibers.",
    exampleIt:
      "Se la tua CV è 15 km/h, puoi teoricamente mantenere questo ritmo (4:00/km) per 30-40 min. Gli allenamenti a ritmo CV sviluppano specificamente le fibre muscolari di tipo IIa.",
    formula: "CV = (Distance longue - Distance courte) / (Temps long - Temps court)",
    relatedTerms: ["vma", "lactate-threshold", "vo2max"],
    zone: 4,
    keywords: ["vitesse", "critique", "CV", "seuil", "domaine", "sévère", "Tinman", "D'"],
    externalLinks: [
      {
        label: "Critical Speed and its Implications for Exercise Physiology",
        url: "https://pubmed.ncbi.nlm.nih.gov/27480763/",
        author: "Jones et al.",
      },
    ],
  },
];

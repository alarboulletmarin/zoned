import type { TargetSystemScienceMap } from "./types";

export const TARGET_SYSTEM_SCIENCE: TargetSystemScienceMap = {
  aerobic_base: {
    rationale:
      "L'entraînement en endurance fondamentale stimule la biogenèse mitochondriale et le développement du réseau capillaire autour des fibres musculaires de type I. En maintenant une intensité basse (sous le premier seuil ventilatoire), le corps optimise l'oxydation des acides gras comme substrat énergétique, ce qui préserve le glycogène musculaire et hépatique pour les efforts plus intenses.",
    rationaleEn:
      "Foundational endurance training stimulates mitochondrial biogenesis and capillary network development around type I muscle fibers. By maintaining a low intensity (below the first ventilatory threshold), the body optimizes fatty acid oxidation as an energy substrate, sparing muscle and hepatic glycogen for higher-intensity efforts.",
    zoneRationale: [
      {
        zone: 1,
        why: "La Z1 favorise la récupération active et augmente le flux sanguin vers les muscles sans générer de fatigue significative, permettant un volume d'entraînement élevé.",
        whyEn:
          "Z1 promotes active recovery and increases blood flow to muscles without generating significant fatigue, allowing for high training volume.",
      },
      {
        zone: 2,
        why: "La Z2 est l'intensité optimale pour maximiser l'oxydation lipidique et stimuler la prolifération mitochondriale. C'est le cœur de l'entraînement polarisé, représentant 75-80% du volume total.",
        whyEn:
          "Z2 is the optimal intensity to maximize fat oxidation and stimulate mitochondrial proliferation. It is the core of polarized training, representing 75-80% of total volume.",
      },
    ],
    adaptations: [
      "Augmentation de la densité mitochondriale dans les fibres de type I (+40-60% après 6-8 semaines)",
      "Développement du réseau capillaire péri-musculaire (angiogenèse)",
      "Amélioration de l'activité des enzymes oxydatives (citrate synthase, succinate déshydrogénase)",
      "Augmentation de la capacité d'oxydation des acides gras (lipolyse intramusculaire)",
      "Renforcement du volume d'éjection systolique au repos et à l'effort",
    ],
    adaptationsEn: [
      "Increased mitochondrial density in type I fibers (+40-60% after 6-8 weeks)",
      "Development of peri-muscular capillary network (angiogenesis)",
      "Improved oxidative enzyme activity (citrate synthase, succinate dehydrogenase)",
      "Increased fatty acid oxidation capacity (intramuscular lipolysis)",
      "Enhanced resting and exercise stroke volume",
    ],
    references: [
      {
        authors: "Seiler S",
        year: 2010,
        title:
          "What is best practice for training intensity and duration distribution in endurance athletes?",
        journal:
          "International Journal of Sports Physiology and Performance, 5(3), 276-291",
        link: "https://doi.org/10.1123/ijspp.5.3.276",
      },
      {
        authors: "San-Millán I, Brooks GA",
        year: 2018,
        title:
          "Assessment of metabolic flexibility by means of measuring blood lactate, fat, and carbohydrate oxidation responses to exercise in professional endurance athletes and less-fit individuals",
        journal: "Sports Medicine, 48(2), 467-479",
        link: "https://doi.org/10.1007/s40279-017-0751-x",
      },
    ],
  },

  aerobic_power: {
    rationale:
      "La puissance aérobie maximale correspond au débit d'oxygène maximal que l'organisme peut utiliser (VO2max). Les séances ciblant ce système sollicitent le cœur à son débit cardiaque maximal, augmentant le volume d'éjection systolique et la différence artério-veineuse en oxygène. L'accumulation de temps passé à VO2max (tlim) est le stimulus principal de ces adaptations.",
    rationaleEn:
      "Maximal aerobic power corresponds to the maximum rate of oxygen the body can utilize (VO2max). Sessions targeting this system push the heart to its maximal cardiac output, increasing stroke volume and arteriovenous oxygen difference. Accumulating time spent at VO2max (tlim) is the primary stimulus for these adaptations.",
    zoneRationale: [
      {
        zone: 5,
        why: "La Z5 correspond à l'intensité associée à VO2max (vVO2max). Les intervalles de 2-5 minutes à cette intensité maximisent le temps passé au plateau de consommation d'oxygène.",
        whyEn:
          "Z5 corresponds to the intensity associated with VO2max (vVO2max). Intervals of 2-5 minutes at this intensity maximize time spent at the oxygen consumption plateau.",
      },
      {
        zone: 1,
        why: "La récupération en Z1 entre les intervalles permet la resynthèse partielle de phosphocréatine et la clairance du lactate, rendant possible la répétition d'efforts à haute intensité.",
        whyEn:
          "Z1 recovery between intervals allows partial phosphocreatine resynthesis and lactate clearance, making it possible to repeat high-intensity efforts.",
      },
    ],
    adaptations: [
      "Augmentation du volume d'éjection systolique maximal (hypertrophie excentrique du ventricule gauche)",
      "Amélioration du débit cardiaque maximal (Q = VES x FC)",
      "Augmentation de la capacité oxydative musculaire (activité enzymatique mitochondriale)",
      "Amélioration de la cinétique de VO2 (temps d'atteinte du plateau réduit)",
    ],
    adaptationsEn: [
      "Increased maximal stroke volume (eccentric left ventricular hypertrophy)",
      "Improved maximal cardiac output (Q = SV x HR)",
      "Increased muscle oxidative capacity (mitochondrial enzyme activity)",
      "Improved VO2 kinetics (reduced time to reach plateau)",
    ],
    references: [
      {
        authors: "Billat LV",
        year: 2001,
        title: "Interval training for performance: a scientific and empirical practice",
        journal: "Sports Medicine, 31(1), 13-31",
        link: "https://doi.org/10.2165/00007256-200131010-00002",
      },
      {
        authors: "Billat VL, Slawinski J, Bocquet V, Demarle A, Lafitte L, Chassaing P, Koralsztein JP",
        year: 2000,
        title:
          "Intermittent runs at the velocity associated with maximal oxygen uptake enables subjects to remain at maximal oxygen uptake for a longer time than intense but submaximal runs",
        journal: "European Journal of Applied Physiology, 81(3), 188-196",
        link: "https://doi.org/10.1007/s004210050029",
      },
    ],
  },

  vo2max: {
    rationale:
      "Le VO2max représente le plafond de la capacité aérobie. L'entraînement spécifique vise à maximiser le temps cumulé passé entre 90 et 100% de VO2max lors de chaque séance. Les adaptations sont à la fois centrales (débit cardiaque) et périphériques (extraction d'oxygène musculaire). Le format intermittent court-court (30/30) ou long (3-5 min) permet d'accumuler 10-15 minutes effectives à VO2max par séance.",
    rationaleEn:
      "VO2max represents the ceiling of aerobic capacity. Specific training aims to maximize cumulative time spent between 90-100% of VO2max per session. Adaptations are both central (cardiac output) and peripheral (muscle oxygen extraction). Short-short intermittent (30/30) or long interval (3-5 min) formats allow accumulating 10-15 effective minutes at VO2max per session.",
    zoneRationale: [
      {
        zone: 5,
        why: "La Z5 est la zone cible principale : elle correspond à 95-100% de la fréquence cardiaque maximale et à la vitesse associée à VO2max. Le système cardio-respiratoire fonctionne à son maximum.",
        whyEn:
          "Z5 is the primary target zone: it corresponds to 95-100% of maximal heart rate and the velocity associated with VO2max. The cardiorespiratory system operates at its maximum.",
      },
      {
        zone: 4,
        why: "La Z4 est utilisée en début d'intervalle ou dans les formats pyramidaux. Elle permet d'élever progressivement la consommation d'oxygène vers le plateau de VO2max.",
        whyEn:
          "Z4 is used at the beginning of intervals or in pyramid formats. It progressively elevates oxygen consumption toward the VO2max plateau.",
      },
      {
        zone: 1,
        why: "La récupération active en Z1 maintient un débit sanguin élevé, accélérant la clairance métabolique entre les répétitions intenses.",
        whyEn:
          "Active recovery in Z1 maintains high blood flow, accelerating metabolic clearance between intense repetitions.",
      },
    ],
    adaptations: [
      "Augmentation du VO2max de 5-15% selon le niveau initial (gains plus importants chez les moins entraînés)",
      "Hypertrophie cardiaque excentrique : augmentation du volume télédiastolique du ventricule gauche",
      "Amélioration de la densité capillaire et de l'extraction périphérique d'oxygène (a-vO2 diff)",
      "Augmentation de l'activité des enzymes de la chaîne de transport d'électrons mitochondriale",
      "Amélioration de la capacité tampon du muscle squelettique",
    ],
    adaptationsEn: [
      "VO2max increase of 5-15% depending on baseline fitness (greater gains in less trained individuals)",
      "Eccentric cardiac hypertrophy: increased left ventricular end-diastolic volume",
      "Improved capillary density and peripheral oxygen extraction (a-vO2 diff)",
      "Increased mitochondrial electron transport chain enzyme activity",
      "Improved skeletal muscle buffering capacity",
    ],
    references: [
      {
        authors: "Billat VL, Slawinski J, Bocquet V, Demarle A, Lafitte L, Chassaing P, Koralsztein JP",
        year: 2000,
        title:
          "Intermittent runs at the velocity associated with maximal oxygen uptake enables subjects to remain at maximal oxygen uptake for a longer time than intense but submaximal runs",
        journal: "European Journal of Applied Physiology, 81(3), 188-196",
        link: "https://doi.org/10.1007/s004210050029",
      },
      {
        authors: "Midgley AW, McNaughton LR, Wilkinson M",
        year: 2006,
        title:
          "Is there an optimal training intensity for enhancing the maximal oxygen uptake of distance runners?",
        journal: "Sports Medicine, 36(2), 117-132",
        link: "https://doi.org/10.2165/00007256-200636020-00003",
      },
    ],
  },

  aerobic_threshold: {
    rationale:
      "Le seuil aérobie (SV1, premier seuil ventilatoire) correspond à l'intensité où le lactate sanguin commence à s'élever au-dessus des valeurs de repos (~2 mmol/L). L'entraînement à cette intensité améliore la capacité de clairance du lactate et développe l'endurance spécifique aux allures marathon/semi-marathon. C'est l'intensité la plus élevée soutenable pendant plusieurs heures.",
    rationaleEn:
      "The aerobic threshold (VT1, first ventilatory threshold) corresponds to the intensity where blood lactate begins to rise above resting values (~2 mmol/L). Training at this intensity improves lactate clearance capacity and develops endurance specific to marathon/half-marathon paces. It is the highest intensity sustainable for several hours.",
    zoneRationale: [
      {
        zone: 3,
        why: "La Z3 correspond précisément au seuil aérobie : l'intensité où la production de lactate est équilibrée par sa clairance. Elle développe l'endurance métabolique sans accumuler de fatigue excessive.",
        whyEn:
          "Z3 corresponds precisely to the aerobic threshold: the intensity where lactate production is balanced by its clearance. It develops metabolic endurance without accumulating excessive fatigue.",
      },
      {
        zone: 2,
        why: "La Z2 est utilisée dans les portions de récupération et les échauffements prolongés, préparant le métabolisme à travailler efficacement au seuil.",
        whyEn:
          "Z2 is used in recovery portions and extended warm-ups, preparing the metabolism to work efficiently at threshold.",
      },
    ],
    adaptations: [
      "Amélioration de la capacité de clairance du lactate (MCT1 transporteurs monocarboxylates)",
      "Augmentation de l'utilisation du lactate comme substrat énergétique par les fibres oxydatives",
      "Développement de l'endurance spécifique aux allures de compétition longue distance",
      "Amélioration de l'économie de course à des intensités modérées",
    ],
    adaptationsEn: [
      "Improved lactate clearance capacity (MCT1 monocarboxylate transporters)",
      "Increased lactate utilization as energy substrate by oxidative fibers",
      "Development of specific endurance at long-distance race paces",
      "Improved running economy at moderate intensities",
    ],
    references: [
      {
        authors: "Faude O, Kindermann W, Meyer T",
        year: 2009,
        title:
          "Lactate threshold concepts: how valid are they?",
        journal: "Sports Medicine, 39(6), 469-490",
        link: "https://doi.org/10.2165/00007256-200939060-00003",
      },
      {
        authors: "Joyner MJ, Coyle EF",
        year: 2008,
        title: "Endurance exercise performance: the physiology of champions",
        journal: "Journal of Physiology, 586(1), 35-44",
        link: "https://doi.org/10.1113/jphysiol.2007.143834",
      },
    ],
  },

  lactate_threshold: {
    rationale:
      "Le seuil lactique (SV2, deuxième seuil ventilatoire, ~4 mmol/L) représente le point de bascule métabolique au-delà duquel l'accumulation de lactate sanguin devient exponentielle. Entraîner ce seuil repousse l'intensité à laquelle le coureur peut maintenir un état stable de lactate, ce qui est le déterminant principal de la performance sur 10 km à semi-marathon.",
    rationaleEn:
      "The lactate threshold (VT2, second ventilatory threshold, ~4 mmol/L) represents the metabolic tipping point beyond which blood lactate accumulation becomes exponential. Training this threshold shifts upward the intensity at which a runner can maintain a lactate steady state, which is the primary determinant of performance from 10K to half-marathon.",
    zoneRationale: [
      {
        zone: 4,
        why: "La Z4 correspond à l'intensité du seuil lactique. Les efforts tempo de 20-40 minutes à cette intensité provoquent les adaptations métaboliques spécifiques au seuil : upregulation des MCT4 et amélioration de la capacité tampon.",
        whyEn:
          "Z4 corresponds to lactate threshold intensity. Tempo efforts of 20-40 minutes at this intensity trigger threshold-specific metabolic adaptations: MCT4 upregulation and improved buffering capacity.",
      },
      {
        zone: 3,
        why: "La Z3 est utilisée en échauffement progressif et dans les blocs de récupération active entre les intervalles au seuil, maintenant un flux métabolique élevé.",
        whyEn:
          "Z3 is used in progressive warm-up and in active recovery blocks between threshold intervals, maintaining high metabolic flux.",
      },
    ],
    adaptations: [
      "Augmentation de l'expression des transporteurs MCT4 (export du lactate hors des fibres musculaires)",
      "Amélioration de la capacité tampon musculaire (carnosine, bicarbonate)",
      "Élévation du seuil lactique en pourcentage de VO2max (de ~75% à ~85% chez les élites)",
      "Augmentation de l'activité de la lactate déshydrogénase dans sa forme oxydative",
      "Amélioration de la tolérance psychologique à l'effort soutenu au seuil",
    ],
    adaptationsEn: [
      "Increased MCT4 transporter expression (lactate export from muscle fibers)",
      "Improved muscle buffering capacity (carnosine, bicarbonate)",
      "Elevation of lactate threshold as percentage of VO2max (from ~75% to ~85% in elites)",
      "Increased lactate dehydrogenase activity in its oxidative form",
      "Improved psychological tolerance to sustained threshold effort",
    ],
    references: [
      {
        authors: "Faude O, Kindermann W, Meyer T",
        year: 2009,
        title: "Lactate threshold concepts: how valid are they?",
        journal: "Sports Medicine, 39(6), 469-490",
        link: "https://doi.org/10.2165/00007256-200939060-00003",
      },
      {
        authors: "Mader A, Liesen H, Heck H, Philippi H, Rost R, Schürch P, Hollmann W",
        year: 1976,
        title:
          "Zur Beurteilung der sportartspezifischen Ausdauerleistungsfähigkeit im Labor",
        journal: "Sportarzt und Sportmedizin, 27, 80-88; 109-112",
      },
    ],
  },

  lactate_tolerance: {
    rationale:
      "La tolérance au lactate vise à améliorer la capacité de l'organisme à fonctionner malgré des concentrations élevées de lactate et d'ions H+. Ce type d'entraînement sollicite intensément la glycolyse anaérobie et développe les systèmes tampons intramusculaires. Les séances de type répétitions courtes à intensité supramaximale (> vVO2max) avec récupération incomplète sont les plus efficaces.",
    rationaleEn:
      "Lactate tolerance training aims to improve the body's ability to function despite high concentrations of lactate and H+ ions. This type of training heavily solicits anaerobic glycolysis and develops intramuscular buffering systems. Short repetitions at supramaximal intensity (> vVO2max) with incomplete recovery are the most effective sessions.",
    zoneRationale: [
      {
        zone: 5,
        why: "La Z5 génère une production de lactate élevée (8-12 mmol/L) qui stimule l'adaptation des systèmes tampons musculaires et sanguins.",
        whyEn:
          "Z5 generates high lactate production (8-12 mmol/L) that stimulates adaptation of muscle and blood buffering systems.",
      },
      {
        zone: 6,
        why: "La Z6 maximise la sollicitation glycolytique et la production d'ions H+. Les sprints courts (20-40s) à intensité maximale créent le stimulus le plus puissant pour la tolérance à l'acidose.",
        whyEn:
          "Z6 maximizes glycolytic demand and H+ ion production. Short sprints (20-40s) at maximal intensity create the most powerful stimulus for acidosis tolerance.",
      },
    ],
    adaptations: [
      "Augmentation de la capacité tampon musculaire (carnosine, phosphates inorganiques)",
      "Amélioration de l'activité des enzymes glycolytiques (phosphofructokinase, lactate déshydrogénase)",
      "Augmentation de la tolérance à l'acidose intramusculaire (baisse de pH jusqu'à 6.8)",
      "Développement de la puissance glycolytique anaérobie",
      "Amélioration de la capacité à maintenir la vitesse malgré l'accumulation métabolique",
    ],
    adaptationsEn: [
      "Increased muscle buffering capacity (carnosine, inorganic phosphates)",
      "Improved glycolytic enzyme activity (phosphofructokinase, lactate dehydrogenase)",
      "Increased tolerance to intramuscular acidosis (pH drop to 6.8)",
      "Development of anaerobic glycolytic power",
      "Improved ability to maintain speed despite metabolic accumulation",
    ],
    references: [
      {
        authors: "Tabata I, Nishimura K, Kouzaki M, Hirai Y, Ogita F, Miyachi M, Yamamoto K",
        year: 1996,
        title:
          "Effects of moderate-intensity endurance and high-intensity intermittent training on anaerobic capacity and VO2max",
        journal: "Medicine & Science in Sports & Exercise, 28(10), 1327-1330",
        link: "https://doi.org/10.1097/00005768-199610000-00018",
      },
      {
        authors: "Edge J, Bishop D, Goodman C",
        year: 2006,
        title:
          "The effects of training intensity on muscle buffer capacity in females",
        journal: "European Journal of Applied Physiology, 96(1), 97-105",
        link: "https://doi.org/10.1007/s00421-005-0068-6",
      },
    ],
  },

  neuromuscular: {
    rationale:
      "L'entraînement neuromusculaire cible le recrutement des unités motrices à seuil élevé (fibres de type IIa et IIx), la coordination intermusculaire et l'économie de course par l'amélioration de la raideur musculo-tendineuse. Les côtes courtes à intensité élevée et les exercices pliométriques améliorent la capacité du système nerveux à produire de la force rapidement (rate of force development).",
    rationaleEn:
      "Neuromuscular training targets the recruitment of high-threshold motor units (type IIa and IIx fibers), inter-muscular coordination, and running economy through improved musculotendinous stiffness. Short hills at high intensity and plyometric exercises improve the nervous system's ability to produce force rapidly (rate of force development).",
    zoneRationale: [
      {
        zone: 5,
        why: "La Z5 en côte recrute les fibres rapides de type IIa tout en limitant la vitesse de course, ce qui réduit le risque de blessure musculaire par rapport aux sprints sur plat.",
        whyEn:
          "Z5 on hills recruits type IIa fast-twitch fibers while limiting running speed, reducing the risk of muscle injury compared to flat sprints.",
      },
      {
        zone: 6,
        why: "La Z6 active les unités motrices à seuil le plus élevé (fibres IIx), nécessaires pour les accélérations et le sprint final. Les répétitions très courtes (8-15s) en côte raide développent la puissance neuromusculaire.",
        whyEn:
          "Z6 activates the highest-threshold motor units (type IIx fibers), necessary for accelerations and final sprint. Very short repetitions (8-15s) on steep hills develop neuromuscular power.",
      },
      {
        zone: 2,
        why: "La Z2 entre les répétitions permet la récupération complète du système nerveux, condition nécessaire pour maintenir la qualité de recrutement moteur à chaque répétition.",
        whyEn:
          "Z2 between repetitions allows complete nervous system recovery, a necessary condition to maintain motor recruitment quality in each repetition.",
      },
    ],
    adaptations: [
      "Amélioration du recrutement des unités motrices à seuil élevé (fibres de type II)",
      "Augmentation du taux de développement de la force (rate of force development)",
      "Amélioration de la raideur musculo-tendineuse et du cycle étirement-détente",
      "Amélioration de l'économie de course de 3-5% (réduction du coût énergétique)",
      "Optimisation de la coordination intermusculaire agoniste-antagoniste",
    ],
    adaptationsEn: [
      "Improved recruitment of high-threshold motor units (type II fibers)",
      "Increased rate of force development",
      "Improved musculotendinous stiffness and stretch-shortening cycle",
      "Improved running economy by 3-5% (reduced energy cost)",
      "Optimized agonist-antagonist inter-muscular coordination",
    ],
    references: [
      {
        authors: "Paavolainen L, Häkkinen K, Hämäläinen I, Nummela A, Rusko H",
        year: 1999,
        title:
          "Explosive-strength training improves 5-km running time by improving running economy and muscle power",
        journal: "Journal of Applied Physiology, 86(5), 1527-1533",
        link: "https://doi.org/10.1152/jappl.1999.86.5.1527",
      },
      {
        authors: "Berryman N, Mujika I, Arvisais D, Roubeix M, Berthoin S, Bosquet L",
        year: 2018,
        title:
          "Strength training for middle- and long-distance performance: a meta-analysis",
        journal:
          "International Journal of Sports Physiology and Performance, 13(1), 57-63",
        link: "https://doi.org/10.1123/ijspp.2017-0032",
      },
    ],
  },

  speed: {
    rationale:
      "L'entraînement de vitesse maximale vise à optimiser la fréquence et l'amplitude de foulée à des intensités supramaximales. Il sollicite le système phosphagène (ATP-PCr) et améliore la coordination neuromusculaire à haute vélocité. Le travail de vitesse pure (sprints de 6-15 secondes avec récupération complète) développe la vitesse de contraction des fibres rapides et la transmission de l'influx nerveux.",
    rationaleEn:
      "Maximal speed training aims to optimize stride frequency and length at supramaximal intensities. It solicits the phosphagen system (ATP-PCr) and improves neuromuscular coordination at high velocity. Pure speed work (6-15 second sprints with complete recovery) develops fast-twitch fiber contraction speed and neural impulse transmission.",
    zoneRationale: [
      {
        zone: 6,
        why: "La Z6 est la seule zone qui sollicite pleinement le système ATP-PCr et recrute 100% des unités motrices. Les efforts de 6-15 secondes à intensité maximale développent la vitesse pure sans accumulation de lactate significative.",
        whyEn:
          "Z6 is the only zone that fully solicits the ATP-PCr system and recruits 100% of motor units. Efforts of 6-15 seconds at maximal intensity develop pure speed without significant lactate accumulation.",
      },
      {
        zone: 2,
        why: "La Z2 de récupération (3-5 min entre sprints) permet la resynthèse quasi-complète de la phosphocréatine, indispensable pour maintenir la qualité de vitesse maximale à chaque répétition.",
        whyEn:
          "Z2 recovery (3-5 min between sprints) allows near-complete phosphocreatine resynthesis, essential for maintaining maximal speed quality in each repetition.",
      },
    ],
    adaptations: [
      "Augmentation de la vitesse de contraction des fibres de type IIx",
      "Amélioration de la fréquence de décharge des motoneurones (firing rate)",
      "Optimisation du ratio fréquence/amplitude de foulée à haute vitesse",
      "Augmentation des réserves intramusculaires de phosphocréatine",
      "Amélioration du temps de contact au sol et de la force réactive",
    ],
    adaptationsEn: [
      "Increased contraction speed of type IIx fibers",
      "Improved motor neuron firing rate",
      "Optimized stride frequency/length ratio at high speed",
      "Increased intramuscular phosphocreatine stores",
      "Improved ground contact time and reactive force",
    ],
    references: [
      {
        authors: "Ross A, Leveritt M, Riek S",
        year: 2001,
        title:
          "Neural influences on sprint running: training adaptations and acute responses",
        journal: "Sports Medicine, 31(6), 409-425",
        link: "https://doi.org/10.2165/00007256-200131060-00002",
      },
      {
        authors: "Haugen T, Seiler S, Sandbakk O, Tonnessen E",
        year: 2019,
        title: "The training and development of elite sprint performance: an integration of scientific and best practice literature",
        journal: "Sports Medicine - Open, 5(1), 44",
        link: "https://doi.org/10.1186/s40798-019-0221-0",
      },
    ],
  },

  strength: {
    rationale:
      "L'endurance musculaire spécifique à la course développe la capacité des muscles à résister à la fatigue lors d'efforts prolongés en côte ou à allure seuil. Le travail en côte à intensité modérée-élevée (Z4-Z5) augmente la force de propulsion par foulée et réduit le temps de contact au sol. Cela améliore l'économie de course en permettant de maintenir une foulée efficace malgré la fatigue périphérique.",
    rationaleEn:
      "Running-specific muscular endurance develops the muscles' ability to resist fatigue during sustained hill efforts or threshold-pace running. Hill work at moderate-to-high intensity (Z4-Z5) increases propulsive force per stride and reduces ground contact time. This improves running economy by maintaining an efficient stride despite peripheral fatigue.",
    zoneRationale: [
      {
        zone: 4,
        why: "La Z4 en côte longue (2-6 min) développe l'endurance de force : la capacité à maintenir une force de propulsion élevée malgré l'accumulation de métabolites. C'est le stimulus principal pour l'économie de course en terrain vallonné.",
        whyEn:
          "Z4 on long hills (2-6 min) develops strength endurance: the ability to maintain high propulsive force despite metabolite accumulation. It is the primary stimulus for running economy on hilly terrain.",
      },
      {
        zone: 5,
        why: "La Z5 en côte courte (30s-2 min) cible la force maximale spécifique : les muscles doivent produire plus de force par foulée contre la gravité tout en maintenant une cadence élevée.",
        whyEn:
          "Z5 on short hills (30s-2 min) targets specific maximal strength: muscles must produce more force per stride against gravity while maintaining high cadence.",
      },
      {
        zone: 2,
        why: "Le retour en Z2 lors des descentes favorise la récupération musculaire et permet d'enchaîner les répétitions avec une qualité de force maintenue.",
        whyEn:
          "Z2 return on downhills promotes muscular recovery and allows chaining repetitions with maintained force quality.",
      },
    ],
    adaptations: [
      "Augmentation de la force de propulsion par foulée (force verticale et horizontale)",
      "Réduction du temps de contact au sol (-5 à -10%)",
      "Amélioration de la raideur musculo-tendineuse des extenseurs de hanche et de cheville",
      "Augmentation de l'endurance de force (résistance à la fatigue neuromusculaire)",
      "Prévention des blessures par renforcement des structures tendineuses et articulaires",
    ],
    adaptationsEn: [
      "Increased propulsive force per stride (vertical and horizontal force)",
      "Reduced ground contact time (-5 to -10%)",
      "Improved musculotendinous stiffness of hip and ankle extensors",
      "Increased strength endurance (resistance to neuromuscular fatigue)",
      "Injury prevention through tendon and joint structure strengthening",
    ],
    references: [
      {
        authors: "Beattie K, Carson BP, Lyons M, Rossiter A, Kenny IC",
        year: 2017,
        title:
          "The effect of strength training on performance indicators in distance runners",
        journal: "Journal of Strength and Conditioning Research, 31(1), 9-23",
        link: "https://doi.org/10.1519/JSC.0000000000001464",
      },
      {
        authors: "Blagrove RC, Howatson G, Hayes PR",
        year: 2018,
        title:
          "Effects of strength training on the physiological determinants of middle- and long-distance running performance: a systematic review",
        journal: "Sports Medicine, 48(5), 1117-1149",
        link: "https://doi.org/10.1007/s40279-017-0835-7",
      },
    ],
  },

  race_specific: {
    rationale:
      "Le principe de spécificité (SAID - Specific Adaptation to Imposed Demands) dicte que l'entraînement le plus efficace reproduit les exigences métaboliques, biomécaniques et psychologiques de l'épreuve cible. Les séances à allure de course développent l'automatisation du rythme (pacing), la calibration de l'effort perçu et les adaptations métaboliques spécifiques à la durée et l'intensité de la compétition.",
    rationaleEn:
      "The specificity principle (SAID - Specific Adaptation to Imposed Demands) dictates that the most effective training reproduces the metabolic, biomechanical, and psychological demands of the target event. Race-pace sessions develop pace automation (pacing), perceived effort calibration, and metabolic adaptations specific to the competition's duration and intensity.",
    zoneRationale: [
      {
        zone: 3,
        why: "Pour le marathon, la Z3 correspond à l'allure de course. Les sorties longues avec des portions à allure marathon développent l'endurance métabolique spécifique et la gestion nutritionnelle en course.",
        whyEn:
          "For the marathon, Z3 corresponds to race pace. Long runs with marathon-pace portions develop specific metabolic endurance and in-race nutritional management.",
      },
      {
        zone: 4,
        why: "Pour le semi-marathon et le 10 km, la Z4 reproduit l'intensité de course. Les séances tempo et les intervalles longs à allure cible calibrent le système métabolique et l'effort perçu.",
        whyEn:
          "For half-marathon and 10K, Z4 reproduces race intensity. Tempo sessions and long intervals at target pace calibrate the metabolic system and perceived effort.",
      },
      {
        zone: 5,
        why: "Pour le 5 km, la Z5 est l'allure de compétition. Les répétitions de 800-1600m à allure cible développent la tolérance à l'inconfort spécifique de cette distance.",
        whyEn:
          "For 5K, Z5 is race pace. Repetitions of 800-1600m at target pace develop the discomfort tolerance specific to this distance.",
      },
    ],
    adaptations: [
      "Automatisation du schéma de foulée à l'allure cible (économie de course spécifique)",
      "Calibration de la perception de l'effort (RPE) à l'intensité de compétition",
      "Adaptations métaboliques spécifiques à la durée de l'épreuve (substrats, tampons)",
      "Développement de la stratégie d'allure (pacing) et de la gestion de l'effort",
      "Renforcement de la confiance psychologique par la familiarisation à l'allure cible",
    ],
    adaptationsEn: [
      "Automation of stride pattern at target pace (specific running economy)",
      "Calibration of perceived effort (RPE) at competition intensity",
      "Metabolic adaptations specific to event duration (substrates, buffers)",
      "Development of pacing strategy and effort management",
      "Psychological confidence reinforcement through target pace familiarization",
    ],
    references: [
      {
        authors: "Daniels J",
        year: 2013,
        title: "Daniels' Running Formula (3rd edition)",
        journal: "Human Kinetics",
      },
      {
        authors: "Hausswirth C, Lehénaff D",
        year: 2001,
        title:
          "Physiological demands of running during long distance runs and triathlons",
        journal: "Sports Medicine, 31(9), 679-689",
        link: "https://doi.org/10.2165/00007256-200131090-00004",
      },
    ],
  },

  mixed: {
    rationale:
      "L'entraînement mixte combine plusieurs stimuli physiologiques au sein d'une même séance ou microcycle, suivant les principes de périodisation de Lydiard et de l'entraînement polarisé. En sollicitant alternativement différents systèmes énergétiques, il développe une condition physique polyvalente et prévient la stagnation liée à la monotonie de l'entraînement. Ce type de séance est particulièrement adapté aux phases de préparation générale.",
    rationaleEn:
      "Mixed training combines multiple physiological stimuli within a single session or microcycle, following Lydiard's periodization principles and polarized training concepts. By alternately soliciting different energy systems, it develops well-rounded fitness and prevents stagnation from training monotony. This type of session is particularly suited to general preparation phases.",
    zoneRationale: [
      {
        zone: 2,
        why: "La Z2 constitue la base aérobie de la séance, permettant d'accumuler du volume d'entraînement tout en récupérant entre les blocs d'intensité plus élevée.",
        whyEn:
          "Z2 constitutes the aerobic base of the session, allowing training volume accumulation while recovering between higher-intensity blocks.",
      },
      {
        zone: 4,
        why: "Les blocs en Z4 stimulent le seuil lactique et apportent un stress métabolique modéré, contribuant aux adaptations du système tampon sans épuisement complet.",
        whyEn:
          "Z4 blocks stimulate the lactate threshold and provide moderate metabolic stress, contributing to buffer system adaptations without complete exhaustion.",
      },
      {
        zone: 5,
        why: "Les insertions en Z5 (surchanges ou accélérations) ajoutent un stimulus neuromusculaire et cardiovasculaire maximal, améliorant VO2max et recrutement moteur dans le contexte de pré-fatigue.",
        whyEn:
          "Z5 insertions (surges or accelerations) add a maximal neuromuscular and cardiovascular stimulus, improving VO2max and motor recruitment in a pre-fatigued context.",
      },
    ],
    adaptations: [
      "Développement simultané de plusieurs filières énergétiques (aérobie, seuil, VO2max)",
      "Amélioration de la flexibilité métabolique (capacité à basculer entre substrats)",
      "Prévention du surentraînement par la variété des stimuli",
      "Développement de la capacité à changer de rythme en course (surchanges)",
      "Amélioration globale de la condition physique en phase de préparation générale",
    ],
    adaptationsEn: [
      "Simultaneous development of multiple energy pathways (aerobic, threshold, VO2max)",
      "Improved metabolic flexibility (ability to switch between substrates)",
      "Overtraining prevention through stimulus variety",
      "Development of pace-changing ability during races (surges)",
      "Overall fitness improvement during general preparation phase",
    ],
    references: [
      {
        authors: "Lydiard A, Gilmour G",
        year: 1962,
        title: "Run to the Top",
        journal: "A.H. & A.W. Reed, Wellington",
      },
      {
        authors: "Seiler S",
        year: 2010,
        title:
          "What is best practice for training intensity and duration distribution in endurance athletes?",
        journal:
          "International Journal of Sports Physiology and Performance, 5(3), 276-291",
        link: "https://doi.org/10.1123/ijspp.5.3.276",
      },
      {
        authors: "Stöggl TL, Sperlich B",
        year: 2014,
        title:
          "Polarized training has greater impact on key endurance variables than threshold, high intensity, or high volume training",
        journal: "Frontiers in Physiology, 5, 33",
        link: "https://doi.org/10.3389/fphys.2014.00033",
      },
    ],
  },
};

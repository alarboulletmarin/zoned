import type { Tip } from "./types";

export const tips: Tip[] = [
  // === TRAINING ===
  {
    id: "training-001",
    text: "La règle 80/20 : environ 80% de votre volume d'entraînement devrait être en Z1-Z2 (facile), et seulement 20% en haute intensité.",
    textEn:
      "The 80/20 rule: about 80% of your training volume should be in Z1-Z2 (easy), and only 20% at high intensity.",
    textIt:
      "La regola 80/20: circa l'80% del volume di allenamento dovrebbe essere in Z1-Z2 (facile) e solo il 20% ad alta intensità.",
    category: "training",
    relatedZones: [1, 2],
    relatedCategories: ["endurance", "recovery"],
  },
  {
    id: "training-002",
    text: "Un échauffement de 10-15 minutes en Z1-Z2 prépare progressivement vos muscles et votre système cardiovasculaire à l'effort.",
    textEn:
      "A 10-15 minute warm-up in Z1-Z2 gradually prepares your muscles and cardiovascular system for effort.",
    textIt:
      "Un riscaldamento di 10-15 minuti in Z1-Z2 prepara gradualmente i muscoli e il sistema cardiovascolare allo sforzo.",
    category: "training",
    relatedZones: [1, 2],
  },
  {
    id: "training-003",
    text: "Les séances de VMA (Z5) sont efficaces par blocs de 3-4 semaines, suivis d'une semaine de récupération.",
    textEn:
      "VO2max sessions (Z5) are most effective in 3-4 week blocks, followed by a recovery week.",
    textIt:
      "Le sedute di VAM/VO2max (Z5) sono più efficaci in blocchi di 3-4 settimane, seguiti da una settimana di recupero.",
    category: "training",
    relatedZones: [5],
    relatedCategories: ["vma_intervals"],
  },
  {
    id: "training-004",
    text: "Le fartlek permet de travailler plusieurs zones dans une même séance tout en restant ludique et adaptable au terrain.",
    textEn:
      "Fartlek allows you to work multiple zones in one session while staying playful and adapting to terrain.",
    textIt:
      "Il fartlek permette di allenare più zone nella stessa seduta rimanendo divertente e adattabile al terreno.",
    category: "training",
    relatedCategories: ["fartlek"],
  },
  {
    id: "training-005",
    text: "Pour progresser au seuil (Z4), privilégiez des intervalles de 8-20 minutes plutôt que des efforts continus trop longs.",
    textEn:
      "To improve threshold (Z4), favor 8-20 minute intervals rather than overly long continuous efforts.",
    textIt:
      "Per migliorare la soglia (Z4), prediligi intervalli di 8-20 minuti piuttosto che sforzi continui troppo lunghi.",
    category: "training",
    relatedZones: [4],
    relatedCategories: ["threshold"],
  },
  {
    id: "training-006",
    text: "Les côtes renforcent naturellement vos jambes tout en limitant l'impact articulaire par rapport à la course sur plat.",
    textEn:
      "Hills naturally strengthen your legs while reducing joint impact compared to flat running.",
    textIt:
      "Le salite rinforzano naturalmente le gambe riducendo l'impatto articolare rispetto alla corsa in pianura.",
    category: "training",
    relatedCategories: ["hills"],
  },
  {
    id: "training-007",
    text: "La sortie longue hebdomadaire ne devrait pas dépasser 25-30% de votre volume total pour éviter le surentraînement.",
    textEn:
      "Your weekly long run should not exceed 25-30% of your total volume to avoid overtraining.",
    textIt:
      "Il lungo settimanale non dovrebbe superare il 25-30% del volume totale per evitare il sovrallenamento.",
    category: "training",
    relatedCategories: ["long_run"],
  },
  {
    id: "training-008",
    text: "Augmentez votre volume d'entraînement de maximum 10% par semaine pour permettre à votre corps de s'adapter.",
    textEn:
      "Increase your training volume by a maximum of 10% per week to allow your body to adapt.",
    textIt:
      "Aumenta il volume di allenamento al massimo del 10% a settimana per permettere al corpo di adattarsi.",
    category: "training",
  },
  {
    id: "training-009",
    text: "Les gammes et éducatifs avant une séance de VMA améliorent l'efficacité de votre foulée et réduisent le risque de blessure.",
    textEn:
      "Running drills before a VO2max session improve your stride efficiency and reduce injury risk.",
    textIt:
      "Gli esercizi di tecnica di corsa prima di una seduta di VO2max migliorano l'efficienza della falcata e riducono il rischio di infortuni.",
    category: "training",
    relatedZones: [5],
    relatedCategories: ["vma_intervals"],
  },
  {
    id: "training-010",
    text: "Courir trop vite en Z2 est l'erreur la plus courante. Si vous ne pouvez pas tenir une conversation, ralentissez !",
    textEn:
      "Running too fast in Z2 is the most common mistake. If you can't hold a conversation, slow down!",
    textIt:
      "Correre troppo forte in Z2 è l'errore più comune. Se non riesci a sostenere una conversazione, rallenta!",
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
    textIt:
      "La tua VAM (Velocità Aerobica Massima) rappresenta la velocità alla quale raggiungi il massimo consumo di ossigeno (VO2max).",
    category: "physiology",
    relatedZones: [5],
    relatedTermId: "vma",
  },
  {
    id: "physio-002",
    text: "Le seuil lactique (Z4) correspond au point où l'acide lactique s'accumule plus vite qu'il n'est éliminé.",
    textEn:
      "The lactate threshold (Z4) is the point where lactic acid accumulates faster than it is cleared.",
    textIt:
      "La soglia del lattato (Z4) corrisponde al punto in cui l'acido lattico si accumula più velocemente di quanto venga smaltito.",
    category: "physiology",
    relatedZones: [4],
    relatedTermId: "seuil-lactique",
  },
  {
    id: "physio-003",
    text: "L'entraînement en Z2 développe les mitochondries, les 'centrales énergétiques' de vos cellules musculaires.",
    textEn:
      "Z2 training develops mitochondria, the 'power plants' of your muscle cells.",
    textIt:
      "L'allenamento in Z2 sviluppa i mitocondri, le 'centrali energetiche' delle cellule muscolari.",
    category: "physiology",
    relatedZones: [2],
    relatedTermId: "mitochondries",
  },
  {
    id: "physio-004",
    text: "La fréquence cardiaque maximale diminue d'environ 1 battement par an après 30 ans - c'est normal !",
    textEn:
      "Maximum heart rate decreases by about 1 beat per year after age 30 - that's normal!",
    textIt:
      "La frequenza cardiaca massima diminuisce di circa 1 battito all'anno dopo i 30 anni: è normale!",
    category: "physiology",
    relatedTermId: "fc-max",
  },
  {
    id: "physio-005",
    text: "L'adaptation cardiovasculaire (cœur plus fort) se produit plus vite que l'adaptation des tendons. Patience !",
    textEn:
      "Cardiovascular adaptation (stronger heart) happens faster than tendon adaptation. Be patient!",
    textIt:
      "L'adattamento cardiovascolare (cuore più forte) avviene più rapidamente rispetto a quello dei tendini. Sii paziente!",
    category: "physiology",
  },
  {
    id: "physio-006",
    text: "En Z1-Z2, votre corps utilise principalement les graisses comme carburant. En Z5-Z6, ce sont les glucides.",
    textEn:
      "In Z1-Z2, your body primarily uses fat as fuel. In Z5-Z6, it's carbohydrates.",
    textIt:
      "In Z1-Z2 il corpo utilizza principalmente i grassi come carburante. In Z5-Z6 usa i carboidrati.",
    category: "physiology",
    relatedZones: [1, 2, 5, 6],
  },
  {
    id: "physio-007",
    text: "Les fibres musculaires lentes (type I) sont recrutées en premier. Les fibres rapides (type II) interviennent à haute intensité.",
    textEn:
      "Slow-twitch muscle fibers (type I) are recruited first. Fast-twitch fibers (type II) engage at high intensity.",
    textIt:
      "Le fibre muscolari lente (tipo I) vengono reclutate per prime. Le fibre rapide (tipo II) intervengono ad alta intensità.",
    category: "physiology",
    relatedZones: [5, 6],
  },
  {
    id: "physio-008",
    text: "Votre volume d'éjection systolique (sang pompé par battement) augmente avec l'entraînement en endurance.",
    textEn:
      "Your stroke volume (blood pumped per beat) increases with endurance training.",
    textIt:
      "La gittata sistolica (sangue pompato per battito) aumenta con l'allenamento di resistenza.",
    category: "physiology",
    relatedZones: [2, 3],
  },
  {
    id: "physio-009",
    text: "L'EPO naturelle produite par vos reins stimule la production de globules rouges lors de l'entraînement en altitude.",
    textEn:
      "Natural EPO produced by your kidneys stimulates red blood cell production during altitude training.",
    textIt:
      "L'EPO naturale prodotta dai reni stimola la produzione di globuli rossi durante l'allenamento in altura.",
    category: "physiology",
  },
  {
    id: "physio-010",
    text: "La capillarisation (création de nouveaux vaisseaux sanguins) prend 6-8 semaines d'entraînement régulier.",
    textEn:
      "Capillarization (creation of new blood vessels) takes 6-8 weeks of regular training.",
    textIt:
      "La capillarizzazione (creazione di nuovi vasi sanguigni) richiede 6-8 settimane di allenamento regolare.",
    category: "physiology",
    relatedZones: [2],
  },

  // === NUTRITION ===
  {
    id: "nutrition-001",
    text: "Pour une séance de plus de 90 minutes, visez 30-60g de glucides par heure pour maintenir votre performance.",
    textEn:
      "For sessions over 90 minutes, aim for 30-60g of carbs per hour to maintain performance.",
    textIt:
      "Per sedute oltre i 90 minuti, punta a 30-60 g di carboidrati all'ora per mantenere la prestazione.",
    category: "nutrition",
    relatedCategories: ["long_run"],
  },
  {
    id: "nutrition-002",
    text: "La fenêtre de récupération optimale est de 30-60 minutes après l'effort pour reconstituer les réserves de glycogène.",
    textEn:
      "The optimal recovery window is 30-60 minutes post-exercise to replenish glycogen stores.",
    textIt:
      "La finestra di recupero ottimale è di 30-60 minuti dopo lo sforzo per ripristinare le scorte di glicogeno.",
    category: "nutrition",
  },
  {
    id: "nutrition-003",
    text: "L'hydratation influence directement la performance : une perte de 2% du poids en eau réduit les capacités de 10-20%.",
    textEn:
      "Hydration directly affects performance: a 2% body weight loss from water reduces capacity by 10-20%.",
    textIt:
      "L'idratazione influisce direttamente sulla prestazione: una perdita del 2% del peso corporeo in acqua riduce le capacità del 10-20%.",
    category: "nutrition",
  },
  {
    id: "nutrition-004",
    text: "Les protéines après l'entraînement (20-40g) favorisent la réparation musculaire et l'adaptation à l'effort.",
    textEn:
      "Post-workout protein (20-40g) promotes muscle repair and adaptation to exercise.",
    textIt:
      "Le proteine dopo l'allenamento (20-40 g) favoriscono la riparazione muscolare e l'adattamento allo sforzo.",
    category: "nutrition",
  },
  {
    id: "nutrition-005",
    text: "Le fer est essentiel pour le transport de l'oxygène. Les coureurs, surtout les femmes, doivent surveiller leur apport.",
    textEn:
      "Iron is essential for oxygen transport. Runners, especially women, should monitor their intake.",
    textIt:
      "Il ferro è essenziale per il trasporto dell'ossigeno. I runner, soprattutto le donne, dovrebbero monitorarne l'apporto.",
    category: "nutrition",
  },
  {
    id: "nutrition-006",
    text: "La caféine peut améliorer les performances de 2-4% en réduisant la perception de l'effort.",
    textEn:
      "Caffeine can improve performance by 2-4% by reducing the perception of effort.",
    textIt:
      "La caffeina può migliorare le prestazioni del 2-4% riducendo la percezione dello sforzo.",
    category: "nutrition",
  },
  {
    id: "nutrition-007",
    text: "Évitez les repas riches en fibres 2-3 heures avant une séance intense pour prévenir les troubles digestifs.",
    textEn:
      "Avoid high-fiber meals 2-3 hours before an intense session to prevent digestive issues.",
    textIt:
      "Evita pasti ricchi di fibre 2-3 ore prima di una seduta intensa per prevenire disturbi digestivi.",
    category: "nutrition",
    relatedCategories: ["vma_intervals", "threshold"],
  },
  {
    id: "nutrition-008",
    text: "Les électrolytes (sodium, potassium, magnésium) perdus dans la sueur doivent être remplacés lors des efforts longs.",
    textEn:
      "Electrolytes (sodium, potassium, magnesium) lost in sweat must be replaced during long efforts.",
    textIt:
      "Gli elettroliti (sodio, potassio, magnesio) persi con il sudore devono essere reintegrati durante gli sforzi lunghi.",
    category: "nutrition",
    relatedCategories: ["long_run"],
  },

  // === RECOVERY ===
  {
    id: "recovery-001",
    text: "Le sommeil est la période où votre corps produit le plus d'hormone de croissance pour réparer les muscles.",
    textEn:
      "Sleep is when your body produces the most growth hormone to repair muscles.",
    textIt:
      "Il sonno è il momento in cui il corpo produce la maggior quantità di ormone della crescita per riparare i muscoli.",
    category: "recovery",
  },
  {
    id: "recovery-002",
    text: "Une séance en Z1 le lendemain d'un effort intense accélère la récupération en favorisant la circulation sanguine.",
    textEn:
      "A Z1 session the day after an intense effort speeds up recovery by promoting blood circulation.",
    textIt:
      "Una seduta in Z1 il giorno dopo uno sforzo intenso accelera il recupero favorendo la circolazione sanguigna.",
    category: "recovery",
    relatedZones: [1],
    relatedCategories: ["recovery"],
  },
  {
    id: "recovery-003",
    text: "7-9 heures de sommeil par nuit sont recommandées pour une récupération optimale chez les sportifs.",
    textEn:
      "7-9 hours of sleep per night are recommended for optimal recovery in athletes.",
    textIt:
      "Per un recupero ottimale negli atleti si raccomandano 7-9 ore di sonno per notte.",
    category: "recovery",
  },
  {
    id: "recovery-004",
    text: "Le stress mental impacte la récupération autant que le stress physique. Prenez soin de votre équilibre.",
    textEn:
      "Mental stress impacts recovery as much as physical stress. Take care of your balance.",
    textIt:
      "Lo stress mentale influisce sul recupero quanto lo stress fisico. Prenditi cura del tuo equilibrio.",
    category: "recovery",
  },
  {
    id: "recovery-005",
    text: "Les étirements statiques sont plus efficaces après l'entraînement qu'avant, quand les muscles sont chauds.",
    textEn:
      "Static stretching is more effective after training than before, when muscles are warm.",
    textIt:
      "Lo stretching statico è più efficace dopo l'allenamento che prima, quando i muscoli sono caldi.",
    category: "recovery",
  },
  {
    id: "recovery-006",
    text: "La variabilité de la fréquence cardiaque (VFC) au repos est un bon indicateur de votre état de récupération.",
    textEn:
      "Heart rate variability (HRV) at rest is a good indicator of your recovery state.",
    textIt:
      "La variabilità della frequenza cardiaca (HRV) a riposo è un buon indicatore del tuo stato di recupero.",
    category: "recovery",
    relatedTermId: "vfc",
  },
  {
    id: "recovery-007",
    text: "Une semaine de récupération toutes les 3-4 semaines (volume réduit de 30-50%) optimise les adaptations.",
    textEn:
      "A recovery week every 3-4 weeks (30-50% reduced volume) optimizes adaptations.",
    textIt:
      "Una settimana di recupero ogni 3-4 settimane (volume ridotto del 30-50%) ottimizza gli adattamenti.",
    category: "recovery",
  },
  {
    id: "recovery-008",
    text: "L'immersion en eau froide (10-15°C pendant 10-15 min) peut réduire les courbatures après un effort intense.",
    textEn:
      "Cold water immersion (10-15°C for 10-15 min) can reduce soreness after intense effort.",
    textIt:
      "L'immersione in acqua fredda (10-15 °C per 10-15 min) può ridurre i dolori muscolari dopo uno sforzo intenso.",
    category: "recovery",
  },
  {
    id: "recovery-009",
    text: "Les massages ou le foam rolling aident à relâcher les tensions musculaires et améliorer la circulation.",
    textEn:
      "Massage or foam rolling helps release muscle tension and improve circulation.",
    textIt:
      "I massaggi o il foam rolling aiutano a sciogliere le tensioni muscolari e a migliorare la circolazione.",
    category: "recovery",
  },
  {
    id: "recovery-010",
    text: "Écoutez votre corps : une fatigue persistante ou une baisse de performance sont des signaux d'alarme.",
    textEn:
      "Listen to your body: persistent fatigue or performance decline are warning signs.",
    textIt:
      "Ascolta il tuo corpo: stanchezza persistente o calo delle prestazioni sono segnali d'allarme.",
    category: "recovery",
  },

  // === CULTURE ===
  {
    id: "culture-001",
    text: "Le marathon tire son nom de la légende de Philippidès, messager grec qui aurait couru d'Athènes à Marathon en 490 av. J-C.",
    textEn:
      "The marathon takes its name from the legend of Pheidippides, a Greek messenger who reportedly ran from Athens to Marathon in 490 BC.",
    textIt:
      "La maratona prende il nome dalla leggenda di Fidippide, il messaggero greco che avrebbe corso da Maratona ad Atene nel 490 a.C.",
    category: "culture",
  },
  {
    id: "culture-002",
    text: "La distance officielle du marathon (42.195 km) a été fixée aux JO de Londres 1908 pour que la course finisse devant la loge royale.",
    textEn:
      "The official marathon distance (42.195 km) was set at the 1908 London Olympics so the race would finish in front of the royal box.",
    textIt:
      "La distanza ufficiale della maratona (42,195 km) fu fissata alle Olimpiadi di Londra del 1908 affinché la gara terminasse davanti al palco reale.",
    category: "culture",
  },
  {
    id: "culture-003",
    text: "Eliud Kipchoge est le premier humain à avoir couru un marathon en moins de 2 heures (1:59:40 à Vienne en 2019).",
    textEn:
      "Eliud Kipchoge was the first human to run a marathon in under 2 hours (1:59:40 in Vienna, 2019).",
    textIt:
      "Eliud Kipchoge è stato il primo essere umano a correre una maratona sotto le 2 ore (1:59:40 a Vienna nel 2019).",
    category: "culture",
  },
  {
    id: "culture-004",
    text: "Le record du monde masculin du marathon est de 2:00:35 par Kelvin Kiptum (Chicago 2023).",
    textEn:
      "The men's marathon world record is 2:00:35 by Kelvin Kiptum (Chicago 2023).",
    textIt:
      "Il record del mondo maschile di maratona è di 2:00:35, stabilito da Kelvin Kiptum (Chicago 2023).",
    category: "culture",
  },
  {
    id: "culture-005",
    text: "Le record du monde féminin du marathon est de 2:09:56 par Ruth Chepngetich (Chicago 2024).",
    textEn:
      "The women's marathon world record is 2:09:56 by Ruth Chepngetich (Chicago 2024).",
    textIt:
      "Il record del mondo femminile di maratona è di 2:09:56, stabilito da Ruth Chepngetich (Chicago 2024).",
    category: "culture",
  },
  {
    id: "culture-006",
    text: "Le 'fartlek' est un mot suédois signifiant 'jeu de vitesse', inventé par l'entraîneur Gösta Holmér dans les années 1930.",
    textEn:
      "Fartlek is a Swedish word meaning 'speed play', invented by coach Gösta Holmér in the 1930s.",
    textIt:
      "Il 'fartlek' è una parola svedese che significa 'gioco di velocità', ideata dall'allenatore Gösta Holmér negli anni '30.",
    category: "culture",
    relatedCategories: ["fartlek"],
  },
  {
    id: "culture-007",
    text: "Les Tarahumaras du Mexique sont célèbres pour courir des ultra-marathons en sandales traditionnelles (huaraches).",
    textEn:
      "The Tarahumara people of Mexico are famous for running ultra-marathons in traditional sandals (huaraches).",
    textIt:
      "I Tarahumara del Messico sono famosi per correre ultramaratone con sandali tradizionali (huaraches).",
    category: "culture",
  },
  {
    id: "culture-008",
    text: "Le marathon de Boston est le plus ancien marathon annuel au monde, créé en 1897.",
    textEn:
      "The Boston Marathon is the world's oldest annual marathon, established in 1897.",
    textIt:
      "La maratona di Boston è la maratona annuale più antica del mondo, istituita nel 1897.",
    category: "culture",
  },
  {
    id: "culture-009",
    text: "Usain Bolt détient le record du 100m (9.58s) et du 200m (19.19s), établis aux Mondiaux de Berlin 2009.",
    textEn:
      "Usain Bolt holds the 100m (9.58s) and 200m (19.19s) world records, set at the 2009 Berlin World Championships.",
    textIt:
      "Usain Bolt detiene i record mondiali dei 100 m (9,58 s) e dei 200 m (19,19 s), stabiliti ai Mondiali di Berlino 2009.",
    category: "culture",
    relatedZones: [6],
  },
  {
    id: "culture-010",
    text: "Roger Bannister fut le premier à courir le mile en moins de 4 minutes (3:59.4) le 6 mai 1954 à Oxford.",
    textEn:
      "Roger Bannister was the first to run a mile in under 4 minutes (3:59.4) on May 6, 1954 in Oxford.",
    textIt:
      "Roger Bannister fu il primo a correre il miglio sotto i 4 minuti (3:59.4) il 6 maggio 1954 a Oxford.",
    category: "culture",
  },
  {
    id: "culture-011",
    text: "Les chaussures à plaque carbone ont révolutionné la course depuis 2017, améliorant l'économie de course de 4%.",
    textEn:
      "Carbon plate shoes have revolutionized running since 2017, improving running economy by 4%.",
    textIt:
      "Le scarpe con piastra in carbonio hanno rivoluzionato la corsa dal 2017, migliorando l'economia di corsa del 4%.",
    category: "culture",
  },
  {
    id: "culture-012",
    text: "Le parkrun, né en 2004 à Londres, rassemble aujourd'hui des millions de coureurs chaque samedi dans le monde.",
    textEn:
      "Parkrun, born in 2004 in London, now brings together millions of runners every Saturday worldwide.",
    textIt:
      "Il parkrun, nato nel 2004 a Londra, riunisce oggi milioni di runner ogni sabato in tutto il mondo.",
    category: "culture",
  },
  {
    id: "culture-013",
    text: "L'UTMB (Ultra-Trail du Mont-Blanc) est considéré comme le championnat du monde officieux de l'ultra-trail.",
    textEn:
      "The UTMB (Ultra-Trail du Mont-Blanc) is considered the unofficial world championship of ultra-trail running.",
    textIt:
      "L'UTMB (Ultra-Trail du Mont-Blanc) è considerato il campionato del mondo ufficioso dell'ultra-trail.",
    category: "culture",
    relatedCategories: ["long_run"],
  },
  {
    id: "culture-014",
    text: "Emil Zátopek, 'la locomotive tchèque', a remporté le 5000m, 10000m et marathon aux JO d'Helsinki 1952.",
    textEn:
      "Emil Zátopek, 'the Czech Locomotive', won the 5000m, 10000m and marathon at the 1952 Helsinki Olympics.",
    textIt:
      "Emil Zátopek, 'la locomotiva ceca', vinse 5000 m, 10000 m e maratona alle Olimpiadi di Helsinki 1952.",
    category: "culture",
  },
  {
    id: "culture-015",
    text: "Le Kenya et l'Éthiopie dominent la course de fond grâce à l'altitude (2000m+), la culture de course et la génétique.",
    textEn:
      "Kenya and Ethiopia dominate distance running thanks to altitude (2000m+), running culture, and genetics.",
    textIt:
      "Kenya ed Etiopia dominano la corsa di fondo grazie all'altitudine (2000 m+), alla cultura della corsa e alla genetica.",
    category: "culture",
  },

  // === MORE TRAINING ===
  {
    id: "training-011",
    text: "Le 'negative split' (seconde moitié plus rapide) est la stratégie optimale pour la plupart des courses.",
    textEn:
      "The 'negative split' (faster second half) is the optimal strategy for most races.",
    textIt:
      "Il 'negative split' (seconda metà più veloce) è la strategia ottimale per la maggior parte delle gare.",
    category: "training",
    relatedCategories: ["race_pace"],
  },
  {
    id: "training-012",
    text: "Varier les surfaces (route, trail, piste) sollicite différemment vos muscles et réduit le risque de blessure.",
    textEn:
      "Varying surfaces (road, trail, track) works your muscles differently and reduces injury risk.",
    textIt:
      "Variare le superfici (strada, trail, pista) sollecita diversamente i muscoli e riduce il rischio di infortuni.",
    category: "training",
  },
  {
    id: "training-013",
    text: "La cadence optimale se situe généralement entre 170-180 pas/minute pour réduire l'impact sur les articulations.",
    textEn:
      "Optimal cadence is generally between 170-180 steps/minute to reduce joint impact.",
    textIt:
      "La cadenza ottimale si colloca generalmente tra 170 e 180 passi/minuto per ridurre l'impatto sulle articolazioni.",
    category: "training",
  },
  {
    id: "training-014",
    text: "Le taper (réduction du volume avant une course) améliore les performances de 2-3% en permettant une récupération complète.",
    textEn:
      "Tapering (reducing volume before a race) improves performance by 2-3% by allowing complete recovery.",
    textIt:
      "Il tapering (riduzione del volume prima di una gara) migliora le prestazioni del 2-3% consentendo un recupero completo.",
    category: "training",
    relatedCategories: ["race_pace"],
  },
  {
    id: "training-015",
    text: "Les doubles séances (2 entraînements/jour) ne sont utiles qu'au-delà de 80-100 km/semaine.",
    textEn:
      "Double sessions (2 workouts/day) are only useful beyond 80-100 km/week.",
    textIt:
      "Le doppie sedute (2 allenamenti/giorno) sono utili solo oltre gli 80-100 km a settimana.",
    category: "training",
  },

  // === MORE NUTRITION ===
  {
    id: "nutrition-009",
    text: "Les betteraves (ou jus de betterave) contiennent des nitrates qui peuvent améliorer l'endurance de 1-3%.",
    textEn:
      "Beetroot (or beetroot juice) contains nitrates that can improve endurance by 1-3%.",
    textIt:
      "Le barbabietole (o il succo di barbabietola) contengono nitrati che possono migliorare la resistenza dell'1-3%.",
    category: "nutrition",
    relatedCategories: ["endurance"],
  },
  {
    id: "nutrition-010",
    text: "Le 'carb loading' (surcharge glucidique) 2-3 jours avant un marathon peut augmenter vos réserves de glycogène de 20-40%.",
    textEn:
      "Carb loading 2-3 days before a marathon can increase your glycogen stores by 20-40%.",
    textIt:
      "Il 'carb loading' (carico di carboidrati) 2-3 giorni prima di una maratona può aumentare le scorte di glicogeno del 20-40%.",
    category: "nutrition",
    relatedCategories: ["long_run", "race_pace"],
  },
  {
    id: "nutrition-011",
    text: "La vitamine D joue un rôle crucial dans la santé osseuse et musculaire. Surveillez vos niveaux, surtout en hiver.",
    textEn:
      "Vitamin D plays a crucial role in bone and muscle health. Monitor your levels, especially in winter.",
    textIt:
      "La vitamina D svolge un ruolo cruciale per la salute ossea e muscolare. Controllane i livelli, soprattutto in inverno.",
    category: "nutrition",
  },
  {
    id: "nutrition-012",
    text: "Les oméga-3 ont des propriétés anti-inflammatoires qui peuvent aider à la récupération musculaire.",
    textEn:
      "Omega-3s have anti-inflammatory properties that can help with muscle recovery.",
    textIt:
      "Gli omega-3 hanno proprietà antinfiammatorie che possono favorire il recupero muscolare.",
    category: "nutrition",
  },

  // === MORE PHYSIOLOGY ===
  {
    id: "physio-011",
    text: "Le 'runner's high' est causé par la libération d'endocannabinoïdes, pas seulement d'endorphines comme on le pensait.",
    textEn:
      "The 'runner's high' is caused by endocannabinoid release, not just endorphins as previously thought.",
    textIt:
      "Il 'runner's high' è causato dal rilascio di endocannabinoidi, non solo di endorfine come si pensava in passato.",
    category: "physiology",
  },
  {
    id: "physio-012",
    text: "Votre cœur peut pomper jusqu'à 30-40 litres de sang par minute pendant un effort maximal.",
    textEn:
      "Your heart can pump up to 30-40 liters of blood per minute during maximal effort.",
    textIt:
      "Il cuore può pompare fino a 30-40 litri di sangue al minuto durante uno sforzo massimale.",
    category: "physiology",
    relatedZones: [5, 6],
  },
  {
    id: "physio-013",
    text: "Les tendons mettent 6-12 mois à s'adapter complètement à un nouveau stimulus d'entraînement.",
    textEn:
      "Tendons take 6-12 months to fully adapt to a new training stimulus.",
    textIt:
      "I tendini impiegano 6-12 mesi per adattarsi completamente a un nuovo stimolo di allenamento.",
    category: "physiology",
  },
  {
    id: "physio-014",
    text: "La température corporelle peut atteindre 40°C lors d'un effort intense, d'où l'importance de la thermorégulation.",
    textEn:
      "Body temperature can reach 40°C during intense effort, hence the importance of thermoregulation.",
    textIt:
      "La temperatura corporea può raggiungere i 40 °C durante uno sforzo intenso, da qui l'importanza della termoregolazione.",
    category: "physiology",
    relatedZones: [5, 6],
  },

  // === MORE RECOVERY ===
  {
    id: "recovery-011",
    text: "La compression (chaussettes, manchons) peut accélérer la récupération en améliorant le retour veineux.",
    textEn:
      "Compression gear (socks, sleeves) can speed up recovery by improving venous return.",
    textIt:
      "L'abbigliamento a compressione (calze, manicotti) può accelerare il recupero migliorando il ritorno venoso.",
    category: "recovery",
  },
  {
    id: "recovery-012",
    text: "La sieste de 20-30 minutes peut compenser partiellement un déficit de sommeil et améliorer la récupération.",
    textEn:
      "A 20-30 minute nap can partially compensate for sleep deficit and improve recovery.",
    textIt:
      "Un riposino di 20-30 minuti può compensare parzialmente un deficit di sonno e migliorare il recupero.",
    category: "recovery",
  },
  {
    id: "recovery-013",
    text: "Le sauna finlandais (15-20 min à 80-100°C) peut améliorer la récupération et simuler certains effets de l'altitude.",
    textEn:
      "Finnish sauna (15-20 min at 80-100°C) can improve recovery and simulate some altitude effects.",
    textIt:
      "La sauna finlandese (15-20 min a 80-100 °C) può migliorare il recupero e simulare alcuni effetti dell'altitudine.",
    category: "recovery",
  },
];

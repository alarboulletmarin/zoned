// src/data/glossary/terms/injuries.ts
// Running injuries, prevention and treatment

import type { GlossaryTerm } from "../types";

export const injuriesTerms: GlossaryTerm[] = [
  {
    id: "periostite-tibiale",
    term: "Periostite Tibiale",
    termEn: "Shin Splints",
    category: "injuries",
    shortDefinition:
      "Douleur le long de la face interne du tibia causee par un stress repetitif sur l'os et les tissus conjonctifs.",
    shortDefinitionEn:
      "Pain along the inner shinbone caused by repetitive stress on the bone and connective tissues.",
    fullDefinition:
      "La periostite tibiale (syndrome de stress tibial medial) est une inflammation du perioste, la membrane qui entoure le tibia. Elle se manifeste par une douleur diffuse le long de la face interne du tibia, generalement sur le tiers moyen ou inferieur. C'est l'une des blessures les plus fréquentes chez les coureurs debutants ou apres une augmentation brutale du volume d'entraînement. Les causes incluent : augmentation trop rapide du kilometrage, course sur surfaces dures, chaussures usees ou inadaptees, et faiblesse des muscles du pied et du mollet. La prevention passe par une progression graduelle (regle des 10%), le renforcement des muscles tibiaux, le port de chaussures adaptees et la variation des surfaces de course. En cas de douleur persistante, il est essentiel de consulter un medecin pour ecarter une fracture de stress.",
    fullDefinitionEn:
      "Shin splints (medial tibial stress syndrome, MTSS) is an inflammation of the periosteum, the membrane surrounding the tibia. It presents as diffuse pain along the inner edge of the shinbone, typically on the middle or lower third. It is one of the most common injuries in new runners or after a sudden increase in training volume. Causes include: too-rapid mileage increase, running on hard surfaces, worn or unsuitable shoes, and weakness of the foot and calf muscles. Prevention involves gradual progression (10% rule), tibial muscle strengthening, proper footwear, and varying running surfaces. If pain persists, it is essential to see a doctor to rule out a stress fracture.",
    example:
      "Apres avoir double ton kilometrage en deux semaines, tu ressens une douleur sourde le long du tibia pendant la course. Reduis le volume, applique de la glace apres l'effort, et reprends progressivement.",
    exampleEn:
      "After doubling your mileage in two weeks, you feel a dull ache along your shinbone during runs. Reduce volume, ice after exercise, and resume gradually.",
    relatedTerms: ["fracture-stress", "active-recovery", "progressive-overload"],
    keywords: ["periostite", "tibia", "shin", "douleur", "inflammation", "debutant"],
  },
  {
    id: "fasciite-plantaire",
    term: "Fasciite Plantaire",
    termEn: "Plantar Fasciitis",
    category: "injuries",
    shortDefinition:
      "Inflammation du fascia plantaire provoquant une douleur vive au talon, surtout le matin.",
    shortDefinitionEn:
      "Inflammation of the plantar fascia causing sharp heel pain, especially in the morning.",
    fullDefinition:
      "La fasciite plantaire est une inflammation du fascia plantaire, une bande epaisse de tissu conjonctif qui relie le talon aux orteils et soutient la voute du pied. Elle se manifeste par une douleur aigue sous le talon, particulierement intense aux premiers pas le matin ou apres une periode d'immobilite. Les facteurs de risque incluent : surutilisation (volume eleve de course), mollets et tendons d'Achille tendus, pieds plats ou voute tres cambree, surpoids, et chaussures manquant de soutien. Le traitement repose sur les etirements du fascia et du mollet, le massage de la voute plantaire (balle de tennis), le renforcement du pied, et parfois des ortheses. La guerison peut prendre plusieurs mois. Consulter un podologue ou un medecin du sport si la douleur persiste au-dela de quelques semaines.",
    fullDefinitionEn:
      "Plantar fasciitis is an inflammation of the plantar fascia, a thick band of connective tissue connecting the heel to the toes and supporting the foot arch. It presents as sharp pain under the heel, particularly intense with first steps in the morning or after a period of inactivity. Risk factors include: overuse (high running volume), tight calves and Achilles tendons, flat feet or high arches, excess weight, and shoes lacking support. Treatment involves fascia and calf stretching, plantar massage (tennis ball), foot strengthening, and sometimes orthotics. Recovery can take several months. See a podiatrist or sports medicine doctor if pain persists beyond a few weeks.",
    example:
      "Chaque matin, tes premiers pas au sol provoquent une douleur aigue sous le talon. Fais rouler une balle de tennis sous le pied pendant 5 minutes et etire tes mollets avant de courir.",
    exampleEn:
      "Every morning, your first steps cause sharp pain under the heel. Roll a tennis ball under your foot for 5 minutes and stretch your calves before running.",
    relatedTerms: ["foam-rolling", "active-recovery", "tendinite-achille"],
    keywords: ["fascia", "plantaire", "talon", "voute", "douleur", "matin"],
  },
  {
    id: "syndrome-essuie-glace",
    term: "Syndrome de l'Essuie-Glace",
    termEn: "Iliotibial Band Syndrome",
    category: "injuries",
    shortDefinition:
      "Douleur sur la face externe du genou causee par la friction de la bandelette ilio-tibiale.",
    shortDefinitionEn:
      "Pain on the outer side of the knee caused by friction of the iliotibial band.",
    fullDefinition:
      "Le syndrome de l'essuie-glace (ou syndrome de la bandelette ilio-tibiale, SBIT) est une blessure de surutilisation ou la bandelette ilio-tibiale (IT band) frotte contre le condyle femoral lateral, provoquant une douleur sur la face externe du genou. La douleur apparait typiquement apres un certain temps de course et s'aggrave en descente. Les facteurs de risque incluent : faiblesse des muscles fessiers (surtout le moyen fessier), augmentation rapide du kilometrage, course en descente repetee, cambrure excessive des chaussures usees, et desequilibres musculaires. Le traitement combine le repos relatif, le renforcement des abducteurs de hanche et des fessiers, le foam rolling de l'IT band, et la correction des facteurs biomecaniques. Une consultation medicale est recommandee si la douleur empeche de courir.",
    fullDefinitionEn:
      "Iliotibial band syndrome (ITBS) is an overuse injury where the iliotibial band (IT band) rubs against the lateral femoral condyle, causing pain on the outer side of the knee. Pain typically appears after a certain running duration and worsens on downhills. Risk factors include: weak gluteal muscles (especially gluteus medius), rapid mileage increase, repeated downhill running, worn shoe camber, and muscular imbalances. Treatment combines relative rest, hip abductor and glute strengthening, IT band foam rolling, and correction of biomechanical factors. Medical consultation is recommended if pain prevents running.",
    example:
      "A chaque descente, tu ressens une douleur piquante sur l'exterieur du genou au bout de 20 minutes. Integre des exercices de renforcement des fessiers comme le clamshell et le monster walk.",
    exampleEn:
      "On every downhill, you feel a sharp pain on the outside of your knee after 20 minutes. Add glute strengthening exercises like clamshells and monster walks.",
    relatedTerms: ["foam-rolling", "syndrome-rotulien", "long-run"],
    keywords: ["bandelette", "ilio-tibiale", "genou", "externe", "fessiers", "IT band"],
  },
  {
    id: "tendinite-achille",
    term: "Tendinite d'Achille",
    termEn: "Achilles Tendinitis",
    category: "injuries",
    shortDefinition:
      "Inflammation ou degenerescence du tendon d'Achille provoquant une douleur a l'arriere du talon.",
    shortDefinitionEn:
      "Inflammation or degeneration of the Achilles tendon causing pain at the back of the heel.",
    fullDefinition:
      "La tendinite d'Achille (ou plus precisement tendinopathie d'Achille) est une blessure de surutilisation du tendon d'Achille, le plus gros tendon du corps, reliant les muscles du mollet au calcaneum. Elle se manifeste par une douleur et une raideur a l'arriere du talon ou du bas du mollet, surtout au demarrage de l'activite. Les causes incluent : augmentation rapide de l'intensite ou du volume (surtout les seances de vitesse), mollets tendus, drop de chaussure insuffisant pour la transition, et terrain vallonne. Le traitement de reference est le protocole d'exercices excentriques (Alfredson) : descentes lentes sur les pointes depuis un step. La guerison peut prendre 3 a 6 mois. Une rupture du tendon d'Achille est une urgence medicale necessitant une prise en charge immediate.",
    fullDefinitionEn:
      "Achilles tendinitis (more accurately Achilles tendinopathy) is an overuse injury of the Achilles tendon, the body's largest tendon connecting the calf muscles to the calcaneus. It presents as pain and stiffness at the back of the heel or lower calf, especially at the start of activity. Causes include: rapid increase in intensity or volume (especially speed sessions), tight calves, insufficient shoe drop for transition, and hilly terrain. The gold-standard treatment is the eccentric exercise protocol (Alfredson): slow heel drops from a step. Recovery can take 3 to 6 months. An Achilles tendon rupture is a medical emergency requiring immediate care.",
    example:
      "Apres avoir ajoute deux seances de fractionne par semaine, tu ressens une douleur au tendon d'Achille le matin. Commence le protocole excentrique et reduis temporairement l'intensite.",
    exampleEn:
      "After adding two interval sessions per week, you feel Achilles tendon pain in the morning. Start the eccentric protocol and temporarily reduce intensity.",
    relatedTerms: ["fasciite-plantaire", "active-recovery", "avant-pied"],
    keywords: ["achille", "tendon", "talon", "mollet", "excentrique", "tendinopathie"],
  },
  {
    id: "syndrome-rotulien",
    term: "Syndrome Rotulien",
    termEn: "Runner's Knee",
    category: "injuries",
    shortDefinition:
      "Douleur sourde autour ou derriere la rotule, aggravee par les escaliers et la position assise prolongee.",
    shortDefinitionEn:
      "Dull ache around or behind the kneecap, worsened by stairs and prolonged sitting.",
    fullDefinition:
      "Le syndrome rotulien (ou syndrome femoro-patellaire, SFP) est l'une des causes les plus fréquentes de douleur au genou chez les coureurs. Il se manifeste par une douleur diffuse autour ou derriere la rotule, aggravee par la montee et la descente d'escaliers, les squats, et la position assise prolongee (signe du cinema). Les causes sont multifactorielles : faiblesse du quadriceps (surtout le vaste medial), faiblesse des muscles fessiers, mauvais alignement de la rotule, surcharge d'entraînement, et raideur des ischio-jambiers ou du quadriceps. Le traitement repose principalement sur le renforcement musculaire cible : quadriceps (exercices isometriques puis progressifs), fessiers, et travail de proprioception. La douleur peut prendre plusieurs semaines a se resoudre. Consulter un kinesitherapeute specialise en sport pour un programme personnalise.",
    fullDefinitionEn:
      "Runner's knee (patellofemoral pain syndrome, PFPS) is one of the most common causes of knee pain in runners. It presents as diffuse pain around or behind the kneecap, worsened by going up and down stairs, squats, and prolonged sitting (movie theater sign). Causes are multifactorial: quadriceps weakness (especially vastus medialis), gluteal weakness, patellar malalignment, training overload, and hamstring or quadriceps tightness. Treatment primarily involves targeted strengthening: quadriceps (isometric then progressive exercises), glutes, and proprioception work. Pain may take several weeks to resolve. See a sports physiotherapist for a personalized program.",
    example:
      "Tu ressens une douleur sourde derriere la rotule en descendant les escaliers et apres etre reste assis longtemps. Renforce tes quadriceps et tes fessiers avec des squats sur une jambe et des pont fessiers.",
    exampleEn:
      "You feel a dull ache behind the kneecap going down stairs and after sitting for a long time. Strengthen your quads and glutes with single-leg squats and glute bridges.",
    relatedTerms: ["syndrome-essuie-glace", "active-recovery", "hill-repeats"],
    keywords: ["rotule", "genou", "patellaire", "quadriceps", "fessiers", "escaliers"],
  },
  {
    id: "fracture-stress",
    term: "Fracture de Stress",
    termEn: "Stress Fracture",
    category: "injuries",
    shortDefinition:
      "Microfissure osseuse causee par des impacts repetitifs, necessitant plusieurs semaines de repos complet.",
    shortDefinitionEn:
      "Tiny bone crack caused by repetitive impacts, requiring several weeks of complete rest.",
    fullDefinition:
      "La fracture de stress est une microfissure dans l'os causee par l'accumulation de contraintes mecaniques repetees sans temps de récupération suffisant. Chez les coureurs, les localisations les plus fréquentes sont le tibia, les metatarses, le femur et le calcaneum. La douleur est localisee, s'aggrave avec l'activite et finit par persister au repos. Les facteurs de risque incluent : augmentation trop rapide du volume d'entraînement, deficit energetique relatif (RED-S), faible densite osseuse, carence en calcium et vitamine D, trouble du cycle menstruel chez les femmes, et surfaces de course trop dures. Le diagnostic necessite souvent une IRM (les radiographies sont souvent normales au debut). Le traitement impose un arret complet de la course pendant 6 a 12 semaines selon la localisation. C'est une blessure serieuse : consulter immediatement un medecin du sport en cas de suspicion.",
    fullDefinitionEn:
      "A stress fracture is a tiny crack in the bone caused by accumulated repetitive mechanical stress without sufficient recovery time. In runners, the most common locations are the tibia, metatarsals, femur, and calcaneus. Pain is localized, worsens with activity, and eventually persists at rest. Risk factors include: too-rapid volume increase, relative energy deficiency (RED-S), low bone density, calcium and vitamin D deficiency, menstrual irregularities in women, and running on very hard surfaces. Diagnosis often requires an MRI (X-rays are often normal initially). Treatment mandates complete running cessation for 6 to 12 weeks depending on location. This is a serious injury: see a sports medicine doctor immediately if suspected.",
    example:
      "Une douleur precise sur le dessus du pied qui s'aggrave en courant et ne disparait plus au repos peut etre une fracture de stress du metatarse. Arrete de courir et consulte un medecin.",
    exampleEn:
      "A pinpoint pain on the top of the foot that worsens with running and no longer resolves at rest could be a metatarsal stress fracture. Stop running and see a doctor.",
    relatedTerms: ["periostite-tibiale", "overtraining", "acwr"],
    externalLinks: [
      {
        label: "Stress fractures in runners (BJSM)",
        url: "https://pubmed.ncbi.nlm.nih.gov/28684389/",
        author: "Warden et al.",
      },
    ],
    keywords: ["fracture", "stress", "os", "tibia", "metatarse", "repos", "IRM"],
  },
  {
    id: "crampe",
    term: "Crampe Musculaire",
    termEn: "Muscle Cramp",
    category: "injuries",
    shortDefinition:
      "Contraction musculaire soudaine et involontaire pendant ou apres l'exercice.",
    shortDefinitionEn:
      "Sudden involuntary muscle contraction during or after exercise.",
    fullDefinition:
      "Les crampes musculaires associees a l'exercice (EAMC) sont des contractions involontaires, douloureuses et temporaires d'un muscle pendant ou juste apres un effort. Elles touchent le plus souvent les mollets, les ischio-jambiers et les quadriceps chez les coureurs. Les mecanismes exacts restent debattus en science. Deux theories principales coexistent : la theorie de la deshydratation et du desequilibre electrolytique (perte de sodium, potassium, magnesium), et la theorie neuromusculaire (fatigue alterant le controle nerf-muscle). La fatigue musculaire est probablement le facteur le plus important. La prevention passe par un entraînement adapte au niveau de compétition, une hydratation adequate avec des electrolytes, et un échauffement suffisant. En cas de crampe, l'etirement doux et le massage du muscle touche sont les gestes immediats les plus efficaces.",
    fullDefinitionEn:
      "Exercise-associated muscle cramps (EAMC) are involuntary, painful, and temporary muscle contractions during or shortly after exertion. They most commonly affect the calves, hamstrings, and quadriceps in runners. The exact mechanisms remain scientifically debated. Two main theories coexist: the dehydration and electrolyte imbalance theory (loss of sodium, potassium, magnesium), and the neuromuscular theory (fatigue altering nerve-muscle control). Muscle fatigue is likely the most significant factor. Prevention involves training appropriate to compétition level, adequate hydration with electrolytes, and sufficient warm-up. During a cramp, gentle stretching and massage of the affected muscle are the most effective immediate responses.",
    example:
      "Au 35e kilometre d'un marathon, ton mollet se contracte violemment. Arrete-toi, etire doucement le muscle, masse-le, et prends des electrolytes avant de repartir progressivement.",
    exampleEn:
      "At kilometer 35 of a marathon, your calf seizes up violently. Stop, gently stretch the muscle, massage it, and take electrolytes before gradually resuming.",
    relatedTerms: ["electrolytes", "hydratation", "doms"],
    keywords: ["crampe", "muscle", "contraction", "electrolytes", "fatigue", "mollet"],
  },
  {
    id: "ampoule",
    term: "Ampoule",
    termEn: "Blister",
    category: "injuries",
    shortDefinition:
      "Poche de liquide sous la peau causee par le frottement entre le pied et la chaussure.",
    shortDefinitionEn:
      "Fluid-filled pocket under the skin caused by friction between foot and shoe.",
    fullDefinition:
      "Les ampoules sont des lesions cutanees tres courantes chez les coureurs, causees par la friction repetee entre la peau et la chaussure ou la chaussette. Elles se forment quand les couches superficielles de la peau se separent et que du liquide s'accumule dans l'espace cree. Les zones les plus touchees sont les orteils, le talon et la plante du pied. Les facteurs favorisants incluent : chaussures mal ajustees (trop grandes ou trop petites), chaussettes en coton qui retiennent l'humidite, longues distances, chaleur et transpiration excessive. La prevention est la meilleure strategie : porter des chaussettes techniques anti-ampoules (en fibres synthetiques ou laine merinos), ajuster correctement ses chaussures, appliquer de la vaseline ou un lubrifiant anti-frottement sur les zones sensibles, et tester son equipement sur les longues sorties avant une compétition. Ne jamais percer une ampoule avec un instrument non sterile pour eviter l'infection.",
    fullDefinitionEn:
      "Blisters are very common skin lesions in runners, caused by repeated friction between skin and the shoe or sock. They form when the superficial skin layers separate and fluid accumulates in the created space. The most affected areas are the toes, heel, and sole of the foot. Contributing factors include: poorly fitted shoes (too large or too small), cotton socks that retain moisture, long distances, heat, and excessive sweating. Prevention is the best strategy: wear technical anti-blister socks (synthetic fibers or merino wool), properly fit shoes, apply petroleum jelly or anti-friction lubricant on hot spots, and test equipment on long runs before compétition. Never puncture a blister with a non-sterile instrument to avoid infection.",
    example:
      "Pendant ta premiere sortie longue avec de nouvelles chaussures, une ampoule se forme sur le petit orteil. La prochaine fois, applique de la vaseline et porte des chaussettes en laine merinos.",
    exampleEn:
      "During your first long run with new shoes, a blister forms on your little toe. Next time, apply petroleum jelly and wear merino wool socks.",
    relatedTerms: ["drop-chaussure", "long-run", "marathon"],
    keywords: ["ampoule", "friction", "chaussure", "chaussette", "pied", "prevention"],
  },
  {
    id: "ongle-noir",
    term: "Ongle Noir",
    termEn: "Black Toenail",
    category: "injuries",
    shortDefinition:
      "Hematome sous l'ongle du pied cause par les impacts repetes de l'orteil contre la chaussure.",
    shortDefinitionEn:
      "Subungual hematoma caused by repeated impact of the toe against the shoe.",
    fullDefinition:
      "L'ongle noir du coureur (hematome sous-ungueal) est une accumulation de sang sous l'ongle de l'orteil, causee par les microtraumatismes repetes du bout de l'orteil contre le dessus ou l'avant de la chaussure. L'ongle prend une coloration bleu-noir caracteristique. C'est une blessure tres fréquente chez les coureurs de longue distance, surtout lors de descentes prolongees ou de courses sur route. Les facteurs de risque principaux sont : chaussures trop petites (il faut environ une demi-pointure de plus que sa taille habituelle pour la course), lacage trop lache permettant au pied de glisser vers l'avant, ongles trop longs, et courses longues en descente. La prevention consiste a choisir des chaussures avec un espace suffisant a l'avant (largeur du pouce entre l'orteil et le bout de la chaussure), couper les ongles regulierement, et ajuster le lacage. L'ongle tombe generalement de lui-meme et repousse en quelques mois. Consulter un medecin en cas de douleur intense ou de signes d'infection.",
    fullDefinitionEn:
      "Runner's black toenail (subungual hematoma) is a blood accumulation under the toenail caused by repeated microtrauma of the toe tip against the top or front of the shoe. The nail develops a characteristic blue-black discoloration. It is a very common injury in long-distance runners, especially during prolonged downhills or road races. The main risk factors are: shoes that are too small (you need about a half size larger than your regular size for running), loose lacing allowing the foot to slide forward, long toenails, and long downhill runs. Prevention involves choosing shoes with enough room at the front (thumb-width between the longest toe and the shoe tip), trimming nails regularly, and adjusting lacing. The nail usually falls off on its own and regrows in a few months. See a doctor if there is intense pain or signs of infection.",
    example:
      "Apres ton premier marathon, ton gros orteil a un ongle completement noir. Pour les prochaines courses, prends des chaussures une demi-pointure au-dessus et coupe tes ongles la veille.",
    exampleEn:
      "After your first marathon, your big toe has a completely black nail. For future races, get shoes a half size up and trim your nails the day before.",
    relatedTerms: ["ampoule", "marathon", "long-run"],
    keywords: ["ongle", "noir", "hematome", "orteil", "chaussure", "taille"],
  },
  {
    id: "syndrome-loges",
    term: "Syndrome des Loges",
    termEn: "Compartment Syndrome",
    category: "injuries",
    shortDefinition:
      "Augmentation de la pression dans un compartiment musculaire causant douleur et tension a l'effort.",
    shortDefinitionEn:
      "Increased pressure within a muscle compartment causing pain and tightness during exercise.",
    fullDefinition:
      "Le syndrome des loges (ou syndrome compartimental) est une pathologie dans laquelle la pression a l'interieur d'un compartiment musculaire (enveloppe de fascia inextensible entourant un groupe musculaire) augmente de maniere excessive. Il existe deux formes : le syndrome chronique d'effort (le plus fréquent chez les coureurs) et le syndrome aigu (urgence chirurgicale). La forme chronique se manifeste par une douleur croissante, une sensation de tension extreme et parfois des engourdissements dans la jambe pendant l'effort, qui disparaissent au repos en 15-30 minutes. La loge anterieure de la jambe est la plus souvent touchee. Les causes exactes sont mal comprises, mais l'augmentation du flux sanguin a l'effort dans un espace confine semble jouer un role central. Le diagnostic se confirme par une mesure de pression intra-compartimentale. Le traitement conservateur (modification de l'entraînement, technique de course, ortheses) est tente en premier. En cas d'echec, une fasciotomie chirurgicale peut etre proposee. Consulter un medecin du sport devant toute douleur de jambe reproductible a l'effort et cedant au repos.",
    fullDefinitionEn:
      "Compartment syndrome is a condition in which pressure within a muscle compartment (an inextensible fascial envelope surrounding a muscle group) increases excessively. Two forms exist: chronic exertional compartment syndrome (most common in runners) and acute compartment syndrome (surgical emergency). The chronic form presents as escalating pain, a sensation of extreme tightness, and sometimes numbness in the leg during exercise, which resolves with rest in 15-30 minutes. The anterior compartment of the leg is most commonly affected. Exact causes are poorly understood, but increased blood flow during exercise within a confined space appears to play a central role. Diagnosis is confirmed by intracompartmental pressure measurement. Conservative treatment (training modification, running technique, orthotics) is tried first. If unsuccessful, surgical fasciotomy may be offered. See a sports medicine doctor for any reproducible exercise-induced leg pain that resolves with rest.",
    example:
      "A chaque fois que tu cours plus de 15 minutes, tu ressens une tension extreme dans l'avant de la jambe avec des fourmillements, et tout disparait 20 minutes apres l'arret. C'est un tableau typique de syndrome des loges chronique.",
    exampleEn:
      "Every time you run more than 15 minutes, you feel extreme tightness in the front of your leg with tingling, and everything resolves 20 minutes after stopping. This is a typical presentation of chronic compartment syndrome.",
    relatedTerms: ["periostite-tibiale", "active-recovery", "compression"],
    keywords: ["loges", "compartiment", "pression", "fascia", "tension", "chirurgie"],
  },
];

// src/data/glossary/terms/nutrition.ts
// Running nutrition concepts

import type { GlossaryTerm } from "../types";

export const nutritionTerms: GlossaryTerm[] = [
  {
    id: "glycogene",
    term: "Glycogène",
    termEn: "Glycogen",
    category: "nutrition",
    shortDefinition:
      "Forme de stockage du glucose dans les muscles et le foie, carburant principal de l'effort.",
    shortDefinitionEn:
      "Stored form of glucose in muscles and liver, the primary fuel for exercise.",
    fullDefinition:
      "Le glycogène est un polysaccharide constitué de longues chaînes de glucose, stocké principalement dans les muscles (~400-500 g) et le foie (~100 g). C'est le carburant principal pour les efforts d'intensité modérée à élevée (zones 3-6). Les réserves totales représentent environ 2000 kcal, ce qui couvre grosso modo 90 à 120 minutes d'effort soutenu. Lorsque ces réserves s'épuisent, le corps bascule vers l'oxydation des graisses, un processus plus lent qui impose de réduire l'allure. Le glycogène est reconstitué par l'alimentation en glucides, avec une resynthèse optimale dans les heures suivant l'effort.",
    fullDefinitionEn:
      "Glycogen is a polysaccharide made of long chains of glucose, stored primarily in muscles (~400-500 g) and the liver (~100 g). It is the primary fuel for moderate-to-high intensity exercise (zones 3-6). Total stores represent approximately 2000 kcal, roughly covering 90 to 120 minutes of sustained effort. When these stores are depleted, the body shifts to fat oxidation, a slower process that forces pace reduction. Glycogen is replenished through carbohydrate intake, with optimal resynthesis occurring in the hours following exercise.",
    example:
      "Après une sortie longue de 2h en zone 2, tes réserves de glycogène musculaire sont significativement entamées. Un repas riche en glucides (pâtes, riz, patates) dans les 2h qui suivent accélère la reconstitution.",
    exampleEn:
      "After a 2-hour long run in zone 2, your muscle glycogen stores are significantly depleted. A carbohydrate-rich meal (pasta, rice, potatoes) within 2 hours accelerates replenishment.",
    relatedTerms: ["mur-marathon", "charge-glucidique", "long-run"],
    keywords: ["glycogène", "glucose", "énergie", "glucides", "stockage", "carburant"],
  },
  {
    id: "mur-marathon",
    term: "Mur du Marathon",
    termEn: "Hitting the Wall (Bonking)",
    category: "nutrition",
    shortDefinition:
      "Coup de fatigue brutal lié à l'épuisement du glycogène, typiquement vers le 30e km.",
    shortDefinitionEn:
      "Sudden onset of fatigue caused by glycogen depletion, typically around km 30.",
    fullDefinition:
      "Le « mur du marathon » désigne un effondrement soudain de la performance survenant généralement entre le 30e et le 35e kilomètre d'un marathon. Il résulte de l'épuisement des réserves de glycogène musculaire et hépatique, forçant le corps à dépendre quasi exclusivement de l'oxydation des graisses, un processus énergétique plus lent qui ne peut soutenir une allure élevée. Les symptômes incluent : jambes lourdes, fatigue extrême, difficulté de concentration, parfois confusion. La prévention repose sur trois piliers : une charge glucidique adéquate avant la course, un ravitaillement régulier en glucides pendant l'effort (30-60 g/h), et un plan de course conservateur qui préserve le glycogène.",
    fullDefinitionEn:
      "The 'marathon wall' or 'bonking' refers to a sudden performance collapse typically occurring between km 30 and 35 of a marathon. It results from the depletion of muscle and liver glycogen stores, forcing the body to rely almost exclusively on fat oxidation, a slower energy process that cannot sustain a fast pace. Symptoms include: heavy legs, extreme fatigue, difficulty concentrating, sometimes confusion. Prevention relies on three pillars: adequate carbo-loading before the race, regular carbohydrate intake during the effort (30-60 g/h), and a conservative race plan that preserves glycogen.",
    example:
      "Un coureur qui part trop vite sur un marathon et ne s'alimente pas régulièrement risque de « prendre le mur » au 32e km : l'allure chute brutalement de 30 à 60 secondes au kilomètre.",
    exampleEn:
      "A runner who starts too fast in a marathon and doesn't fuel regularly risks 'hitting the wall' at km 32: pace suddenly drops by 30 to 60 seconds per kilometer.",
    relatedTerms: ["glycogene", "gels-energetiques", "charge-glucidique"],
    keywords: ["mur", "marathon", "épuisement", "glycogène", "bonk", "fatigue"],
  },
  {
    id: "fenetre-anabolique",
    term: "Fenêtre Anabolique",
    termEn: "Anabolic Window",
    category: "nutrition",
    shortDefinition:
      "Période post-effort (30-60 min) où le corps absorbe le mieux les nutriments de récupération.",
    shortDefinitionEn:
      "Post-exercise period (30-60 min) when the body is most receptive to recovery nutrients.",
    fullDefinition:
      "La fenêtre anabolique désigne la période suivant immédiatement l'effort (traditionnellement 30 à 60 minutes) pendant laquelle la sensibilité à l'insuline est accrue et la resynthèse du glycogène est la plus rapide. Les recherches récentes nuancent ce concept : la fenêtre est probablement plus large (jusqu'à 2h) et son importance dépend du contexte (elle compte davantage si tu t'entraînes à jeun ou si tu as un deuxième effort dans la journée). L'idéal est de consommer un mélange de glucides (1-1,2 g/kg) et de protéines (20-40 g) dans les 2 heures suivant l'effort pour maximiser la récupération.",
    fullDefinitionEn:
      "The anabolic window refers to the period immediately following exercise (traditionally 30 to 60 minutes) during which insulin sensitivity is heightened and glycogen resynthesis is fastest. Recent research nuances this concept: the window is likely wider (up to 2h) and its importance depends on context (it matters more if you trained fasted or have a second session the same day). Ideally, consume a mix of carbohydrates (1-1.2 g/kg) and protein (20-40 g) within 2 hours post-exercise to maximize recovery.",
    example:
      "Après une séance de fractionné intense, prends une collation avec 40-50 g de glucides et 20 g de protéines (ex: lait chocolaté, yaourt + banane) dans l'heure qui suit.",
    exampleEn:
      "After an intense interval session, have a snack with 40-50 g of carbohydrates and 20 g of protein (e.g., chocolate milk, yogurt + banana) within the hour.",
    relatedTerms: ["glycogene", "proteines-recuperation", "active-recovery"],
    keywords: ["fenêtre", "anabolique", "récupération", "post-effort", "nutriments"],
  },
  {
    id: "electrolytes",
    term: "Électrolytes",
    termEn: "Electrolytes",
    category: "nutrition",
    shortDefinition:
      "Minéraux (sodium, potassium, magnésium) perdus dans la sueur, essentiels à la fonction musculaire.",
    shortDefinitionEn:
      "Minerals (sodium, potassium, magnesium) lost in sweat, essential for muscle function.",
    fullDefinition:
      "Les électrolytes sont des minéraux porteurs de charge électrique dissous dans les liquides corporels. Les principaux sont le sodium (Na+), le potassium (K+), le magnésium (Mg2+) et le calcium (Ca2+). Ils jouent un rôle crucial dans la contraction musculaire, la transmission nerveuse, l'équilibre hydrique et la régulation du pH. La sueur contient principalement du sodium (moyenne ~900 mg/L) et du potassium (~200 mg/L). Pour les efforts de moins de 60-90 minutes, l'eau suffit généralement. Au-delà, un apport en électrolytes (boisson, pastille, pincée de sel) aide à maintenir la performance, prévenir les crampes et favoriser l'absorption d'eau.",
    fullDefinitionEn:
      "Electrolytes are electrically charged minerals dissolved in body fluids. The main ones are sodium (Na+), potassium (K+), magnesium (Mg2+), and calcium (Ca2+). They play crucial roles in muscle contraction, nerve transmission, fluid balance, and pH regulation. Sweat primarily contains sodium (average ~900 mg/L) and potassium (~200 mg/L). For efforts under 60-90 minutes, water is generally sufficient. Beyond that, electrolyte supplementation (sports drink, tablet, pinch of salt) helps maintain performance, prevent cramps, and promote water absorption.",
    example:
      "Lors d'une sortie longue de 2h+ en été, ajoute une pastille d'électrolytes ou une pincée de sel dans ta gourde pour compenser les pertes sudorales.",
    exampleEn:
      "During a 2h+ long run in summer, add an electrolyte tablet or a pinch of salt to your water bottle to compensate for sweat losses.",
    relatedTerms: ["hydratation", "sodium", "long-run"],
    keywords: ["électrolytes", "sodium", "potassium", "magnésium", "sueur", "minéraux"],
  },
  {
    id: "hydratation",
    term: "Hydratation",
    termEn: "Hydration",
    category: "nutrition",
    shortDefinition:
      "Maintien de l'équilibre hydrique avant, pendant et après l'effort pour préserver la performance.",
    shortDefinitionEn:
      "Maintaining fluid balance before, during, and after exercise to preserve performance.",
    fullDefinition:
      "L'hydratation en course à pied consiste à maintenir un niveau adéquat de fluides corporels pour soutenir les fonctions thermorégulatrices et cardiovasculaires. Une déshydratation de 2% du poids corporel entraîne déjà une baisse mesurable de la performance (augmentation de la fréquence cardiaque, réduction du débit sanguin, altération de la thermorégulation). Cependant, la surhydratation (hyponatrémie) est également dangereuse : boire trop d'eau sans électrolytes dilue le sodium sanguin et peut provoquer nausées, confusion, voire un coma. La recommandation actuelle est de boire « à la soif » plutôt que de suivre un plan rigide, en ajustant selon la température, l'humidité et l'intensité de l'effort.",
    fullDefinitionEn:
      "Hydration in running means maintaining adequate body fluid levels to support thermoregulatory and cardiovascular functions. A 2% body weight dehydration already causes measurable performance decline (increased heart rate, reduced blood flow, impaired thermoregulation). However, overhydration (hyponatremia) is also dangerous: drinking too much water without electrolytes dilutes blood sodium and can cause nausea, confusion, or even coma. The current recommendation is to drink 'to thirst' rather than following a rigid plan, adjusting for temperature, humidity, and exercise intensity.",
    example:
      "Avant un marathon par temps chaud, pèse-toi avant et après un entraînement similaire pour estimer ton taux de sudation. En course, bois à ta soif avec une boisson contenant du sodium.",
    exampleEn:
      "Before a hot-weather marathon, weigh yourself before and after a similar training run to estimate your sweat rate. During the race, drink to thirst with a sodium-containing beverage.",
    relatedTerms: ["electrolytes", "sodium"],
    keywords: ["hydratation", "eau", "déshydratation", "hyponatrémie", "soif", "fluides"],
  },
  {
    id: "gels-energetiques",
    term: "Gels Énergétiques",
    termEn: "Energy Gels",
    category: "nutrition",
    shortDefinition:
      "Suppléments concentrés en glucides à prendre pendant les efforts longs pour maintenir l'énergie.",
    shortDefinitionEn:
      "Concentrated carbohydrate supplements taken during long efforts to maintain energy.",
    fullDefinition:
      "Les gels énergétiques sont des sachets de glucides concentrés (généralement 20-25 g de glucides par gel) conçus pour être consommés pendant l'effort. Ils fournissent une source d'énergie rapidement assimilable sans nécessiter de mastication. La plupart utilisent du maltodextrine et/ou du fructose. Les gels à double source (glucose + fructose dans un ratio ~2:1) permettent une absorption maximale de 60-90 g de glucides/heure. Règle d'or : toujours tester en entraînement avant la compétition, car les problèmes gastro-intestinaux sont fréquents. Prendre avec de l'eau, généralement toutes les 30-45 minutes pendant les efforts de plus de 60-90 minutes.",
    fullDefinitionEn:
      "Energy gels are concentrated carbohydrate packets (typically 20-25 g of carbs per gel) designed to be consumed during exercise. They provide a rapidly absorbable energy source without requiring chewing. Most use maltodextrin and/or fructose. Dual-source gels (glucose + fructose in a ~2:1 ratio) allow maximum absorption of 60-90 g of carbohydrates per hour. Golden rule: always test in training before racing, as gastrointestinal issues are common. Take with water, generally every 30-45 minutes during efforts lasting more than 60-90 minutes.",
    example:
      "En marathon, commence à prendre un gel dès le 5e km puis un toutes les 30 min. Avec des gels double source, tu peux viser 60-90 g de glucides/heure pour un effort optimal.",
    exampleEn:
      "In a marathon, start taking a gel at km 5, then one every 30 min. With dual-source gels, you can aim for 60-90 g of carbs/hour for optimal performance.",
    relatedTerms: ["glycogene", "mur-marathon", "long-run"],
    keywords: ["gel", "énergie", "glucides", "ravitaillement", "maltodextrine", "fructose"],
  },
  {
    id: "index-glycemique",
    term: "Index Glycémique",
    termEn: "Glycemic Index (GI)",
    category: "nutrition",
    shortDefinition:
      "Échelle (0-100) mesurant la vitesse à laquelle un aliment élève la glycémie.",
    shortDefinitionEn:
      "Scale (0-100) measuring how quickly a food raises blood sugar.",
    fullDefinition:
      "L'index glycémique (IG) classe les aliments glucidiques sur une échelle de 0 à 100 selon la rapidité avec laquelle ils élèvent la glycémie après ingestion. Les aliments à IG élevé (>70 : pain blanc, miel, dattes) provoquent une hausse rapide du sucre sanguin et sont utiles pendant et juste après l'effort pour un apport énergétique rapide et une resynthèse rapide du glycogène. Les aliments à IG bas (<55 : flocons d'avoine, lentilles, patate douce) libèrent leur énergie progressivement et sont préférables en repas pré-course (2-4h avant) pour une énergie soutenue sans pic d'insuline. L'IG modéré (55-70 : riz basmati, banane) convient en transition.",
    fullDefinitionEn:
      "The glycemic index (GI) ranks carbohydrate-containing foods on a scale of 0 to 100 based on how quickly they raise blood sugar after consumption. High-GI foods (>70: white bread, honey, dates) cause rapid blood sugar rise and are useful during and right after exercise for quick energy and fast glycogen resynthesis. Low-GI foods (<55: oats, lentils, sweet potato) release energy gradually and are preferable for pre-run meals (2-4h before) for sustained energy without an insulin spike. Moderate GI (55-70: basmati rice, banana) works as a transition.",
    example:
      "Le matin d'une compétition, choisis un petit-déjeuner à IG bas-modéré (flocons d'avoine, banane) 3h avant le départ. Pendant la course, passe à des glucides à IG élevé (gels, boisson isotonique).",
    exampleEn:
      "On race morning, choose a low-to-moderate GI breakfast (oats, banana) 3h before the start. During the race, switch to high-GI carbohydrates (gels, sports drink).",
    relatedTerms: ["glycogene", "charge-glucidique", "gels-energetiques"],
    keywords: ["index", "glycémique", "IG", "glucides", "sucre", "énergie"],
  },
  {
    id: "charge-glucidique",
    term: "Charge Glucidique",
    termEn: "Carbo-Loading",
    category: "nutrition",
    shortDefinition:
      "Stratégie d'augmentation des apports en glucides avant une longue compétition pour maximiser les réserves de glycogène.",
    shortDefinitionEn:
      "Strategy of increasing carbohydrate intake before a long race to maximize glycogen stores.",
    fullDefinition:
      "La charge glucidique (ou surcompensation glycogénique) est une stratégie nutritionnelle visant à maximiser les réserves de glycogène musculaire avant une compétition d'endurance. Le protocole moderne consiste à augmenter la part de glucides à 8-12 g/kg/jour pendant les 2-3 jours précédant la course, tout en réduisant le volume d'entraînement (taper). Cela peut augmenter les réserves de glycogène de 25 à 50% par rapport à une alimentation normale. Cette stratégie n'est bénéfique que pour les efforts de plus de 90 minutes ; pour des distances plus courtes, les réserves habituelles suffisent. Attention à ne pas confondre avec « manger trop » : il s'agit de modifier la proportion de glucides, pas de doubler les calories.",
    fullDefinitionEn:
      "Carbo-loading (or glycogen supercompensation) is a nutritional strategy aimed at maximizing muscle glycogen stores before an endurance competition. The modern protocol involves increasing carbohydrate intake to 8-12 g/kg/day for the 2-3 days before the race, while reducing training volume (taper). This can increase glycogen stores by 25-50% compared to a normal diet. This strategy is only beneficial for efforts lasting over 90 minutes; for shorter distances, normal stores suffice. Be careful not to confuse it with 'eating more': it's about changing the carbohydrate proportion, not doubling calories.",
    example:
      "Les 3 jours avant ton marathon, passe à ~10 g de glucides/kg/jour : pâtes, riz, pain, fruits. Un coureur de 70 kg visera ~700 g de glucides/jour. Réduis les fibres et graisses pour compenser.",
    exampleEn:
      "The 3 days before your marathon, switch to ~10 g of carbs/kg/day: pasta, rice, bread, fruit. A 70 kg runner would aim for ~700 g of carbs/day. Reduce fiber and fat to compensate.",
    relatedTerms: ["glycogene", "mur-marathon", "index-glycemique"],
    keywords: ["charge", "glucidique", "carbo-loading", "glycogène", "surcompensation", "marathon"],
  },
  {
    id: "cafeine",
    term: "Caféine",
    termEn: "Caffeine",
    category: "nutrition",
    shortDefinition:
      "Aide ergogénique légale améliorant la performance en endurance de 2-4%.",
    shortDefinitionEn:
      "Legal ergogenic aid that improves endurance performance by 2-4%.",
    fullDefinition:
      "La caféine est l'aide ergogénique légale la plus étudiée et la plus efficace pour la performance en endurance. Elle agit principalement en bloquant les récepteurs d'adénosine dans le cerveau, réduisant la perception de l'effort et retardant la fatigue centrale. Elle augmente également la mobilisation des acides gras et peut améliorer la contractilité musculaire. La dose optimale est de 3-6 mg/kg de poids corporel, prise 30-60 minutes avant l'effort. Pour un coureur de 70 kg, cela représente 210-420 mg (environ 2-4 cafés expresso). Au-delà de 6 mg/kg, les effets secondaires (nervosité, troubles digestifs, tachycardie) l'emportent sur les bénéfices. La tolérance est individuelle et la sensibilité diminue avec la consommation habituelle.",
    fullDefinitionEn:
      "Caffeine is the most studied and effective legal ergogenic aid for endurance performance. It works primarily by blocking adenosine receptors in the brain, reducing perceived exertion and delaying central fatigue. It also increases fatty acid mobilization and may improve muscle contractility. The optimal dose is 3-6 mg/kg of body weight, taken 30-60 minutes before exercise. For a 70 kg runner, this represents 210-420 mg (approximately 2-4 espressos). Above 6 mg/kg, side effects (nervousness, digestive issues, tachycardia) outweigh benefits. Tolerance is individual and sensitivity decreases with habitual consumption.",
    example:
      "Prends 3-4 mg/kg de caféine (un double expresso ou un gel caféiné) 45 min avant ta compétition. Teste toujours à l'entraînement d'abord pour évaluer ta tolérance gastrique.",
    exampleEn:
      "Take 3-4 mg/kg of caffeine (a double espresso or a caffeinated gel) 45 min before your race. Always test in training first to assess your gastric tolerance.",
    relatedTerms: ["gels-energetiques", "rpe"],
    keywords: ["caféine", "ergogénique", "performance", "stimulant", "adénosine"],
  },
  {
    id: "fer-coureur",
    term: "Fer du Coureur",
    termEn: "Runner's Iron (Iron Deficiency)",
    category: "nutrition",
    shortDefinition:
      "Besoins accrus en fer chez le coureur, avec risque de carence impactant la performance.",
    shortDefinitionEn:
      "Increased iron needs in runners, with deficiency risk impacting performance.",
    fullDefinition:
      "Les coureurs ont des besoins en fer supérieurs à la population générale en raison de plusieurs mécanismes : l'hémolyse par impact au sol (destruction des globules rouges dans les capillaires du pied), les pertes gastro-intestinales liées à l'effort, les pertes sudorales, et la dilution par augmentation du volume plasmatique (pseudo-anémie du sportif). Une carence en fer, même sans anémie franche (ferritine <30-50 ng/mL), entraîne fatigue, baisse de performance, réduction de la VO2max et récupération altérée. Les femmes en âge de procréer sont particulièrement à risque (menstruations). Le dépistage régulier (ferritine, hémoglobine) est recommandé, surtout en cas de fatigue inexpliquée. La supplémentation doit se faire sous contrôle médical.",
    fullDefinitionEn:
      "Runners have higher iron needs than the general population due to several mechanisms: foot-strike hemolysis (red blood cell destruction in foot capillaries), exercise-related gastrointestinal losses, sweat losses, and dilution from increased plasma volume (sports pseudoanemia). Iron deficiency, even without frank anemia (ferritin <30-50 ng/mL), causes fatigue, performance decline, reduced VO2max, and impaired recovery. Premenopausal women are particularly at risk (menstruation). Regular screening (ferritin, hemoglobin) is recommended, especially with unexplained fatigue. Supplementation should be done under medical supervision.",
    example:
      "Si tu ressens une fatigue persistante et que tes performances stagnent malgré un bon entraînement, fais vérifier ta ferritine. Beaucoup de coureurs découvrent une carence en fer à la prise de sang.",
    exampleEn:
      "If you experience persistent fatigue and your performance stagnates despite good training, get your ferritin checked. Many runners discover iron deficiency through a blood test.",
    relatedTerms: ["vo2max", "overtraining"],
    externalLinks: [
      {
        label: "Iron deficiency in athletes: a narrative review",
        url: "https://pubmed.ncbi.nlm.nih.gov/31146655/",
        author: "Clénin et al.",
      },
    ],
    keywords: ["fer", "carence", "anémie", "ferritine", "hémoglobine", "hémolyse"],
  },
  {
    id: "proteines-recuperation",
    term: "Protéines de Récupération",
    termEn: "Recovery Proteins",
    category: "nutrition",
    shortDefinition:
      "Apport protéique après l'effort pour soutenir la réparation musculaire et l'adaptation.",
    shortDefinitionEn:
      "Post-exercise protein intake to support muscle repair and adaptation.",
    fullDefinition:
      "Les protéines jouent un rôle clé dans la récupération du coureur en fournissant les acides aminés nécessaires à la réparation des micro-lésions musculaires et aux adaptations structurelles induites par l'entraînement. La recommandation est de consommer 20-40 g de protéines de haute qualité dans les 2 heures suivant l'effort, idéalement combinées avec des glucides. La qualité protéique compte : les sources riches en leucine (whey, œufs, soja) stimulent le plus efficacement la synthèse protéique musculaire. Pour un coureur en entraînement régulier, l'apport protéique quotidien optimal est de 1,4-1,8 g/kg/jour, réparti sur 3-5 repas. Les besoins augmentent pendant les périodes de charge élevée et de restriction calorique.",
    fullDefinitionEn:
      "Proteins play a key role in runner recovery by providing the amino acids needed for muscle micro-damage repair and structural adaptations induced by training. The recommendation is to consume 20-40 g of high-quality protein within 2 hours post-exercise, ideally combined with carbohydrates. Protein quality matters: leucine-rich sources (whey, eggs, soy) most effectively stimulate muscle protein synthesis. For a regularly training runner, optimal daily protein intake is 1.4-1.8 g/kg/day, spread across 3-5 meals. Needs increase during high-load periods and caloric restriction.",
    example:
      "Après une séance de côtes, prends un verre de lait chocolaté (protéines + glucides) ou un yaourt grec avec une banane. C'est simple, efficace et pas cher.",
    exampleEn:
      "After a hill session, have a glass of chocolate milk (protein + carbs) or Greek yogurt with a banana. It's simple, effective, and inexpensive.",
    relatedTerms: ["fenetre-anabolique", "adaptation", "active-recovery"],
    keywords: ["protéines", "récupération", "leucine", "synthèse", "musculaire", "réparation"],
  },
  {
    id: "sodium",
    term: "Sodium",
    termEn: "Sodium",
    category: "nutrition",
    shortDefinition:
      "Électrolyte principal de la sueur, essentiel à la rétention hydrique et la fonction musculaire.",
    shortDefinitionEn:
      "Primary electrolyte in sweat, essential for fluid retention and muscle function.",
    fullDefinition:
      "Le sodium est l'électrolyte le plus abondant dans la sueur (concentration moyenne ~900 mg/L, mais variant de 200 à 1600 mg/L selon les individus). Il joue un rôle fondamental dans le maintien du volume plasmatique, la rétention hydrique, la transmission nerveuse et la contraction musculaire. Les gros sueurs (« salty sweaters ») reconnaissables aux traces blanches sur leurs vêtements peuvent perdre 1-2 g de sodium par heure d'effort intense. Lors d'efforts prolongés (>2-3h), un apport en sodium (300-600 mg/h) est recommandé via boissons sportives, pastilles ou gélules de sel. Un déficit important en sodium (hyponatrémie) est une urgence médicale potentiellement mortelle, souvent causée par une surhydratation à l'eau pure.",
    fullDefinitionEn:
      "Sodium is the most abundant electrolyte in sweat (average concentration ~900 mg/L, but ranging from 200 to 1600 mg/L depending on the individual). It plays a fundamental role in maintaining plasma volume, fluid retention, nerve transmission, and muscle contraction. Heavy sweaters ('salty sweaters'), recognizable by white marks on their clothing, can lose 1-2 g of sodium per hour of intense exercise. During prolonged efforts (>2-3h), sodium intake (300-600 mg/h) is recommended via sports drinks, tablets, or salt capsules. Significant sodium deficit (hyponatremia) is a potentially fatal medical emergency, often caused by overhydration with plain water.",
    example:
      "Si tu vois des traces blanches sur ton maillot après l'effort, tu es probablement un « gros sueur salé ». Ajoute du sodium dans ta boisson d'effort (500-700 mg/L) et utilise des gélules de sel en compétition longue.",
    exampleEn:
      "If you see white marks on your shirt after exercise, you're probably a 'salty sweater.' Add sodium to your sports drink (500-700 mg/L) and use salt capsules during long races.",
    relatedTerms: ["electrolytes", "hydratation"],
    keywords: ["sodium", "sel", "sueur", "hyponatrémie", "électrolyte", "rétention"],
  },
  {
    id: "boisson-isotonique",
    term: "Boisson Isotonique",
    termEn: "Isotonic Drink",
    category: "nutrition",
    shortDefinition:
      "Boisson dont la concentration en particules est proche de celle du sang, optimisant l'absorption hydrique.",
    shortDefinitionEn:
      "Drink with a particle concentration close to blood, optimizing fluid absorption.",
    fullDefinition:
      "Une boisson isotonique a une osmolalité similaire à celle du plasma sanguin (~280-320 mOsm/kg), ce qui permet une absorption rapide au niveau de l'intestin grêle. Elle contient typiquement 6-8% de glucides (60-80 g/L) et des électrolytes (sodium 400-800 mg/L). C'est le type de boisson de l'effort le plus recommandé pour les sorties de plus de 60-90 minutes : elle hydrate, fournit de l'énergie et replace les électrolytes simultanément. Les boissons hypotoniques (<6% glucides) hydratent plus vite mais apportent moins d'énergie. Les boissons hypertoniques (>8% glucides, comme les jus de fruits purs) ralentissent la vidange gastrique et peuvent causer des troubles digestifs à l'effort.",
    fullDefinitionEn:
      "An isotonic drink has an osmolality similar to blood plasma (~280-320 mOsm/kg), allowing rapid absorption in the small intestine. It typically contains 6-8% carbohydrates (60-80 g/L) and electrolytes (sodium 400-800 mg/L). It is the most recommended exercise drink type for sessions over 60-90 minutes: it hydrates, provides energy, and replaces electrolytes simultaneously. Hypotonic drinks (<6% carbs) hydrate faster but provide less energy. Hypertonic drinks (>8% carbs, like pure fruit juice) slow gastric emptying and can cause digestive issues during exercise.",
    example:
      "Prépare ta boisson isotonique maison : 500 ml d'eau + 30-40 g de maltodextrine + une pincée de sel (1-2 g) + un trait de jus de citron pour le goût. Teste-la en entraînement avant la compétition.",
    exampleEn:
      "Make your own isotonic drink: 500 ml water + 30-40 g maltodextrin + a pinch of salt (1-2 g) + a squeeze of lemon for taste. Test it in training before race day.",
    relatedTerms: ["electrolytes", "hydratation", "maltodextrine", "sodium"],
    keywords: ["isotonique", "boisson", "osmolalité", "effort", "hydratation", "sport"],
  },
  {
    id: "maltodextrine",
    term: "Maltodextrine",
    termEn: "Maltodextrin",
    category: "nutrition",
    shortDefinition:
      "Polymère de glucose rapidement absorbé, ingrédient principal des boissons et gels d'effort.",
    shortDefinitionEn:
      "Rapidly absorbed glucose polymer, the main ingredient in sports drinks and gels.",
    fullDefinition:
      "La maltodextrine est un glucide complexe obtenu par hydrolyse partielle de l'amidon (maïs, blé ou pomme de terre). Malgré son nom de « glucide complexe », elle a un index glycémique très élevé (IG 85-105) et est absorbée presque aussi vite que le glucose pur. Son avantage par rapport au glucose simple : à concentration égale, elle a une osmolalité beaucoup plus basse, ce qui permet de concentrer plus de glucides dans une boisson sans provoquer de troubles digestifs. La maltodextrine est transportée via le transporteur SGLT1 (intestin). En la combinant avec du fructose (transporteur GLUT5), on peut dépasser la limite d'absorption d'un seul transporteur et atteindre 90-120 g de glucides/heure (ratio maltodextrine:fructose de 1:0.8 à 2:1).",
    fullDefinitionEn:
      "Maltodextrin is a complex carbohydrate obtained from partial hydrolysis of starch (corn, wheat, or potato). Despite being called a 'complex carbohydrate,' it has a very high glycemic index (GI 85-105) and is absorbed almost as fast as pure glucose. Its advantage over simple glucose: at equal concentration, it has much lower osmolality, allowing more carbohydrates to be packed into a drink without causing digestive issues. Maltodextrin is transported via the SGLT1 transporter (intestine). By combining it with fructose (GLUT5 transporter), one can exceed the absorption limit of a single transporter and reach 90-120 g of carbs/hour (maltodextrin:fructose ratio of 1:0.8 to 2:1).",
    example:
      "Pour une boisson d'effort maison économique : 60 g de maltodextrine en poudre + 30 g de fructose + 1 g de sel dans 750 ml d'eau. Tu obtiens ~90 g de glucides/heure si tu bois la bouteille en 1h.",
    exampleEn:
      "For an economical homemade sports drink: 60 g maltodextrin powder + 30 g fructose + 1 g salt in 750 ml water. You get ~90 g carbs/hour if you drink the bottle in 1h.",
    relatedTerms: ["gels-energetiques", "boisson-isotonique", "glycogene", "index-glycemique"],
    keywords: ["maltodextrine", "malto", "glucose", "polymère", "amidon", "SGLT1"],
  },
  {
    id: "ratio-glucose-fructose",
    term: "Ratio Glucose-Fructose",
    termEn: "Glucose-Fructose Ratio",
    category: "nutrition",
    shortDefinition:
      "Proportion optimale de glucose et fructose dans les boissons d'effort pour maximiser l'absorption des glucides.",
    shortDefinitionEn:
      "Optimal proportion of glucose and fructose in sports drinks to maximize carbohydrate absorption.",
    fullDefinition:
      "Le ratio glucose-fructose désigne la proportion entre ces deux sucres dans les produits de nutrition sportive. Le glucose (ou maltodextrine) et le fructose utilisent des transporteurs intestinaux différents (SGLT1 et GLUT5 respectivement). En combinant les deux, on « ouvre deux voies » d'absorption simultanées, permettant de dépasser la limite de ~60 g/h du glucose seul pour atteindre 90-120 g/h. Le ratio optimal, validé par la recherche, est d'environ 1:0.8 (maltodextrine:fructose) selon les dernières études, bien que le ratio classique 2:1 soit encore largement utilisé. Ce principe est au cœur des gels et boissons « double source » modernes. L'avantage : plus d'énergie absorbée, meilleure tolérance digestive, et gain de performance démontré sur les efforts de plus de 2h30.",
    fullDefinitionEn:
      "The glucose-fructose ratio refers to the proportion between these two sugars in sports nutrition products. Glucose (or maltodextrin) and fructose use different intestinal transporters (SGLT1 and GLUT5 respectively). By combining both, you 'open two absorption pathways' simultaneously, allowing you to exceed the ~60 g/h limit of glucose alone and reach 90-120 g/h. The optimal ratio, validated by research, is approximately 1:0.8 (maltodextrin:fructose) according to latest studies, though the classic 2:1 ratio is still widely used. This principle is at the heart of modern 'dual-source' gels and drinks. The advantage: more energy absorbed, better digestive tolerance, and demonstrated performance gains for efforts over 2h30.",
    example:
      "Les gels Maurten, SiS Beta Fuel ou Precision Fuel utilisent ce ratio glucose-fructose optimisé. En préparation marathon, vise 80-120 g/h de glucides double source en course.",
    exampleEn:
      "Maurten gels, SiS Beta Fuel, and Precision Fuel use this optimized glucose-fructose ratio. For marathon prep, aim for 80-120 g/h of dual-source carbs during the race.",
    relatedTerms: ["maltodextrine", "gels-energetiques", "boisson-isotonique", "mur-marathon"],
    keywords: ["glucose", "fructose", "ratio", "double source", "transporteur", "SGLT1", "GLUT5", "absorption"],
    externalLinks: [
      {
        label: "Multiple transportable carbohydrates and performance",
        url: "https://pubmed.ncbi.nlm.nih.gov/20091182/",
        author: "Jeukendrup",
      },
    ],
  },
  {
    id: "bcaa",
    term: "BCAA",
    termEn: "Branched-Chain Amino Acids",
    acronym: "BCAA",
    category: "nutrition",
    shortDefinition:
      "Acides aminés ramifiés (leucine, isoleucine, valine) souvent utilisés en complément, mais peu utiles avec un apport protéique suffisant.",
    shortDefinitionEn:
      "Branched-chain amino acids (leucine, isoleucine, valine) often used as supplements, but of limited use with adequate protein intake.",
    fullDefinition:
      "Les BCAA (Branched-Chain Amino Acids) sont trois acides aminés essentiels — leucine, isoleucine et valine — qui représentent environ 35% des acides aminés dans le muscle. La leucine est le plus important : elle active la voie mTOR, signalant au corps de démarrer la synthèse protéique musculaire. Les BCAA ont été massivement marketés comme compléments de récupération, mais la recherche montre que leur supplémentation isolée est peu utile si l'apport protéique quotidien est suffisant (1,4-1,8 g/kg/jour) car les protéines complètes (whey, œufs, viande) contiennent déjà des BCAA en abondance. Ils peuvent avoir un intérêt marginal pendant des efforts très longs (ultra-endurance) ou en période de restriction calorique sévère.",
    fullDefinitionEn:
      "BCAAs (Branched-Chain Amino Acids) are three essential amino acids — leucine, isoleucine, and valine — representing about 35% of amino acids in muscle. Leucine is the most important: it activates the mTOR pathway, signaling the body to start muscle protein synthesis. BCAAs have been massively marketed as recovery supplements, but research shows that isolated supplementation is of limited use when daily protein intake is adequate (1.4-1.8 g/kg/day) since complete proteins (whey, eggs, meat) already contain abundant BCAAs. They may have marginal benefit during very long efforts (ultra-endurance) or during severe caloric restriction.",
    example:
      "Plutôt que d'acheter des BCAA en poudre, investis dans une bonne whey protéine ou mange simplement des œufs/yaourt grec après l'effort. Tu auras tous les BCAA nécessaires plus les autres acides aminés essentiels.",
    exampleEn:
      "Rather than buying BCAA powder, invest in a good whey protein or simply eat eggs/Greek yogurt after exercise. You'll get all necessary BCAAs plus the other essential amino acids.",
    relatedTerms: ["proteines-recuperation", "fenetre-anabolique", "adaptation"],
    keywords: ["BCAA", "leucine", "isoleucine", "valine", "acides aminés", "ramifiés", "mTOR"],
  },
  {
    id: "vitamine-d",
    term: "Vitamine D",
    termEn: "Vitamin D",
    category: "nutrition",
    shortDefinition:
      "Vitamine essentielle pour les os, l'immunité et la fonction musculaire, souvent déficiente chez les coureurs.",
    shortDefinitionEn:
      "Essential vitamin for bones, immunity, and muscle function, often deficient in runners.",
    fullDefinition:
      "La vitamine D est une hormone stéroïdienne synthétisée par la peau sous l'action des UVB, cruciale pour l'absorption du calcium, la santé osseuse, la fonction immunitaire et la contractilité musculaire. Une carence (taux sanguin <30 ng/mL) est très fréquente, surtout chez les coureurs s'entraînant en intérieur ou vivant à des latitudes élevées (nord de la France, Belgique, Canada). Les conséquences pour le coureur sont significatives : risque accru de fractures de stress, récupération plus lente, fonction musculaire altérée et susceptibilité accrue aux infections des voies respiratoires supérieures. En l'absence d'exposition solaire suffisante (15-30 min/jour, bras et jambes exposés), une supplémentation de 1000-2000 UI/jour est généralement recommandée, idéalement après dosage sanguin.",
    fullDefinitionEn:
      "Vitamin D is a steroid hormone synthesized by the skin under UVB exposure, crucial for calcium absorption, bone health, immune function, and muscle contractility. Deficiency (blood level <30 ng/mL) is very common, especially in runners training indoors or living at high latitudes (northern France, Belgium, Canada). The consequences for runners are significant: increased risk of stress fractures, slower recovery, impaired muscle function, and increased susceptibility to upper respiratory tract infections. Without sufficient sun exposure (15-30 min/day, arms and legs exposed), supplementation of 1000-2000 IU/day is generally recommended, ideally after blood level testing.",
    example:
      "Fais doser ta vitamine D en automne. Si ton taux est <30 ng/mL, supplémente à 1000-2000 UI/jour d'octobre à avril. C'est l'un des compléments les plus utiles pour un coureur en climat tempéré.",
    exampleEn:
      "Get your vitamin D tested in fall. If your level is <30 ng/mL, supplement with 1000-2000 IU/day from October to April. It's one of the most useful supplements for a runner in a temperate climate.",
    relatedTerms: ["fracture-stress", "fer-coureur", "adaptation"],
    keywords: ["vitamine D", "calcium", "os", "soleil", "immunité", "carence", "UVB"],
  },
];

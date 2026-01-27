export interface Article {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: "fundamentals" | "training" | "lifestyle";
  readTime: number;
  content: string;
  contentEn: string;
}

export const articles: Article[] = [
  {
    id: "zones",
    slug: "zones",
    title: "Comprendre les 6 zones d'entraînement",
    titleEn: "Understanding the 6 Training Zones",
    description:
      "La science derrière l'entraînement par zones et comment l'appliquer à votre pratique",
    descriptionEn:
      "The science behind zone training and how to apply it to your practice",
    category: "fundamentals",
    readTime: 10,
    content: `## Votre corps est une machine à plusieurs vitesses

Imaginez votre corps comme une voiture hybride dotée de plusieurs moteurs. À basse vitesse, vous roulez à l'électrique : c'est économique, silencieux, vous pouvez tenir des heures. Quand vous accélérez, le moteur thermique prend le relais : plus puissant, mais la consommation grimpe et l'autonomie chute. Poussez à fond, et vous passez en mode boost : des performances maximales, mais impossibles à maintenir plus de quelques secondes.

Votre métabolisme fonctionne exactement de la même façon. Selon l'intensité de l'effort, votre corps recrute différents systèmes énergétiques, chacun avec ses avantages et ses limites. Comprendre ces mécanismes, c'est la clé pour progresser efficacement sans vous épuiser.

---

## Les trois filières énergétiques

Avant de parler de zones, il faut comprendre comment votre corps produit l'énergie nécessaire à la course. Trois systèmes cohabitent, se relayant selon l'intensité et la durée de l'effort.

### La filière aérobie : votre moteur d'endurance

C'est le système principal pour les efforts prolongés. Il utilise l'oxygène pour transformer les graisses et les glucides en énergie. Le processus est lent mais extrêmement efficace : vous pouvez courir des heures tant que l'oxygène arrive en quantité suffisante aux muscles.

La filière aérobie se développe en Zone 1 et Zone 2, là où l'intensité reste modérée. C'est pourquoi les marathoniens passent 80% de leur temps d'entraînement à ces allures "faciles". Ils construisent leur moteur d'endurance.

### La filière anaérobie lactique : le turbo

Quand l'intensité augmente, le système aérobie ne suffit plus. Votre corps active alors la filière anaérobie lactique, capable de produire de l'énergie sans oxygène. C'est rapide et puissant, mais il y a un prix : la production d'acide lactique.

Cet acide s'accumule dans les muscles et provoque cette sensation de brûlure caractéristique. Vous connaissez bien ce moment où vos jambes deviennent lourdes et où chaque foulée devient un combat. C'est le système lactique à l'œuvre, principalement sollicité en Zone 4 et Zone 5.

### La filière anaérobie alactique : l'explosion

Pour les efforts maximaux de quelques secondes, un troisième système entre en jeu. Il puise dans les réserves de créatine phosphate, une molécule stockée directement dans les muscles. C'est l'énergie immédiate, celle du sprint pur.

Cette filière s'épuise en 8 à 10 secondes, mais elle n'a besoin que de 2 à 3 minutes pour se reconstituer. C'est la Zone 6, celle des accélérations fulgurantes et des fins de course au sprint.

---

## Les six zones en détail

### Zone 1 — Récupération (50-60% FCmax)

La Zone 1, c'est le footing de récupération au sens strict. Vous devez pouvoir tenir une conversation complète sans aucun essoufflement. Si vous ne pouvez pas raconter votre week-end à votre partenaire d'entraînement, vous allez trop vite.

À cette intensité, votre corps brûle essentiellement des graisses. Le flux sanguin augmenté accélère l'élimination des déchets métaboliques accumulés lors des séances intenses. C'est pourquoi un footing lent le lendemain d'une grosse séance récupère mieux que le repos complet.

**Sensation typique** : effort quasi imperceptible, vous pourriez continuer indéfiniment.

### Zone 2 — Endurance fondamentale (60-70% FCmax)

La Zone 2 est le cœur de l'entraînement de tout coureur sérieux. C'est ici que se construit votre base aérobie, cette fondation sur laquelle repose toute performance durable.

À cette intensité, vos cellules musculaires développent davantage de mitochondries — les centrales énergétiques qui transforment l'oxygène en mouvement. Votre réseau capillaire s'étend, améliorant l'irrigation des muscles. Votre cœur devient plus efficace, pompant plus de sang à chaque battement.

La conversation reste aisée, même si vous préférez peut-être des phrases plus courtes. Vous transpirez, la respiration est présente mais contrôlée. Beaucoup de coureurs commettent l'erreur de négliger cette zone, la jugeant "trop facile". C'est pourtant là que se forge l'endurance qui vous portera sur vos plus longues distances.

**Sensation typique** : effort confortable mais réel, vous sentez que vous courez.

### Zone 3 — Tempo (70-80% FCmax)

La Zone 3 est une zone de transition, parfois appelée "zone grise" car elle ne développe pas aussi efficacement une filière spécifique. Elle correspond à une allure soutenue mais tenable sur une longue durée — typiquement votre allure marathon ou semi-marathon.

Ici, vous commencez à produire de l'acide lactique, mais votre corps parvient encore à l'éliminer au fur et à mesure. C'est l'équilibre : vous pouvez parler par phrases courtes, mais la discussion devient moins naturelle.

Cette zone est utile pour les sorties longues rythmées et pour apprendre à "gérer" un effort prolongé. Elle prépare le mental autant que le physique.

**Sensation typique** : effort soutenu, concentration nécessaire pour maintenir l'allure.

### Zone 4 — Seuil (80-90% FCmax)

Le seuil lactique est un concept clé en physiologie de l'effort. C'est l'intensité à laquelle l'acide lactique commence à s'accumuler plus vite que votre corps ne peut l'éliminer. Passé ce point, la fatigue devient exponentielle.

Travailler en Zone 4, c'est repousser ce seuil. Plus il est élevé, plus vous pouvez courir vite longtemps. Les séances de seuil sont exigeantes : 20 à 40 minutes à une allure où vous ne pouvez dire que quelques mots entre deux respirations.

C'est l'allure de votre 10 km, peut-être un peu plus rapide. Inconfortable mais gérable sur une durée limitée.

**Sensation typique** : effort difficile, vous comptez les minutes.

### Zone 5 — VMA (90-95% FCmax)

La Vitesse Maximale Aérobie représente la vitesse à laquelle vous atteignez votre consommation maximale d'oxygène (VO2max). C'est le sommet de votre capacité aérobie, la frontière entre ce que vos poumons peuvent fournir et ce que vos muscles réclament.

Le travail en Zone 5 se fait par intervalles : 30 secondes à 3 minutes d'effort intense, suivies de récupération. Ces séances de fractionné — les fameux "30/30" ou "1000m" — sont celles qui font le plus progresser votre vitesse pure.

Mais attention : ce type d'entraînement est très sollicitant. Deux séances par semaine maximum, avec au moins 48 heures de récupération entre chaque.

**Sensation typique** : respiration maximale, impossible de parler, durée limitée.

### Zone 6 — Sprint (95-100% FCmax)

La Zone 6 est le domaine de l'effort maximal, celui où toutes les fibres musculaires sont recrutées. On ne parle plus de minutes mais de secondes : 10, 20, 30 secondes de sprint pur.

Ce travail développe la coordination neuromusculaire — la capacité de votre cerveau à activer efficacement les muscles — et la puissance pure. Il est particulièrement utile pour améliorer votre finish de course ou votre capacité d'accélération.

Les séances de côtes courtes et les sprints en fin de footing sollicitent cette zone.

**Sensation typique** : effort total, la fin est presque un soulagement.

---

## Déterminer vos zones personnelles

Les pourcentages de fréquence cardiaque maximale (FCmax) donnés ci-dessus sont des moyennes. Pour un entraînement précis, vous devez connaître votre propre FCmax.

### Le test de terrain

La méthode la plus fiable reste le test. Après un échauffement complet de 15-20 minutes, enchaînez 3 à 4 côtes de 2-3 minutes en accélérant progressivement. Sur la dernière, donnez tout ce que vous avez. Le pic affiché sur votre montre sera proche de votre FCmax réelle.

### Les formules

La formule classique "220 - âge" est simple mais imprécise, avec un écart-type de 10-12 battements. La formule de Tanaka (208 - 0.7 × âge) est légèrement plus fiable. Mais gardez en tête qu'aucune formule ne remplace une mesure directe.

### L'échelle de perception

En complément du cardio, l'échelle de Borg (RPE de 1 à 10) vous aide à calibrer vos sensations :

| Zone | RPE | Description |
|------|-----|-------------|
| Z1 | 2-3 | Très facile, récupération |
| Z2 | 3-4 | Confortable, peut durer longtemps |
| Z3 | 5-6 | Modérément difficile |
| Z4 | 7-8 | Difficile, inconfortable |
| Z5 | 8-9 | Très difficile, respiration maximale |
| Z6 | 10 | Effort maximal, quelques secondes |

Avec l'expérience, vous apprendrez à corréler vos sensations avec les données de votre montre.

---

## Appliquer les zones à votre entraînement

La répartition classique chez les coureurs de fond suit la règle du 80/20 : 80% du volume d'entraînement en Zone 1-2, 20% en Zone 4 et au-dessus. Cette polarisation, validée par des décennies de recherche, maximise les adaptations tout en limitant la fatigue.

Concrètement, sur 4 sorties hebdomadaires :
- 3 sorties en Zone 1-2 (footings, sortie longue)
- 1 séance avec de l'intensité (seuil, fractionné, ou tempo)

Le piège classique est de courir trop vite les jours faciles et trop lentement les jours durs. Résultat : vous êtes constamment dans la Zone 3, ni assez léger pour récupérer, ni assez intense pour progresser. C'est ce qu'on appelle l'entraînement en "zone grise" — beaucoup d'efforts pour peu de résultats.

---

## Passez à la pratique

Vous connaissez maintenant la théorie. L'étape suivante est de calculer vos zones personnelles et de les appliquer à vos séances. Notre calculateur vous permet d'obtenir vos plages précises basées sur votre FCmax et votre VMA.`,
    contentEn: `## Your body is a multi-speed machine

Picture your body as a hybrid car with multiple engines. At low speeds, you run on electric: economical, quiet, you can go for hours. When you accelerate, the combustion engine takes over: more powerful, but fuel consumption rises and range drops. Push to the max, and you switch to boost mode: peak performance, but impossible to maintain for more than a few seconds.

Your metabolism works exactly the same way. Depending on exercise intensity, your body recruits different energy systems, each with its advantages and limits. Understanding these mechanisms is the key to progressing efficiently without burning out.

---

## The three energy pathways

Before discussing zones, we need to understand how your body produces the energy needed for running. Three systems coexist, taking turns based on effort intensity and duration.

### The aerobic pathway: your endurance engine

This is the main system for prolonged efforts. It uses oxygen to transform fats and carbohydrates into energy. The process is slow but extremely efficient: you can run for hours as long as enough oxygen reaches your muscles.

The aerobic pathway develops in Zone 1 and Zone 2, where intensity remains moderate. This is why marathon runners spend 80% of their training time at these "easy" paces. They're building their endurance engine.

### The anaerobic lactic pathway: the turbo

When intensity increases, the aerobic system isn't enough. Your body then activates the anaerobic lactic pathway, capable of producing energy without oxygen. It's fast and powerful, but there's a price: lactic acid production.

This acid accumulates in muscles and causes that characteristic burning sensation. You know that moment well when your legs become heavy and every stride becomes a battle. That's the lactic system at work, primarily engaged in Zone 4 and Zone 5.

### The anaerobic alactic pathway: the explosion

For maximum efforts of a few seconds, a third system kicks in. It draws from creatine phosphate reserves, a molecule stored directly in muscles. This is immediate energy, the pure sprint.

This pathway depletes in 8 to 10 seconds but only needs 2 to 3 minutes to replenish. This is Zone 6, the zone of lightning accelerations and sprint finishes.

---

## The six zones in detail

### Zone 1 — Recovery (50-60% HRmax)

Zone 1 is recovery jogging in the strictest sense. You should be able to hold a complete conversation without any breathlessness. If you can't tell your training partner about your weekend, you're going too fast.

At this intensity, your body burns essentially fat. Increased blood flow accelerates the elimination of metabolic waste accumulated during intense sessions. This is why a slow jog the day after a hard session recovers better than complete rest.

**Typical sensation**: barely perceptible effort, you could continue indefinitely.

### Zone 2 — Fundamental endurance (60-70% HRmax)

Zone 2 is the heart of any serious runner's training. This is where your aerobic base is built, the foundation upon which all lasting performance rests.

At this intensity, your muscle cells develop more mitochondria — the energy powerhouses that transform oxygen into movement. Your capillary network expands, improving muscle irrigation. Your heart becomes more efficient, pumping more blood with each beat.

Conversation remains easy, though you might prefer shorter sentences. You're sweating, breathing is present but controlled. Many runners make the mistake of neglecting this zone, judging it "too easy." Yet this is where the endurance that will carry you through your longest distances is forged.

**Typical sensation**: comfortable but real effort, you feel like you're running.

### Zone 3 — Tempo (70-80% HRmax)

Zone 3 is a transition zone, sometimes called the "gray zone" because it doesn't develop a specific pathway as efficiently. It corresponds to a sustained but sustainable pace over a long duration — typically your marathon or half-marathon pace.

Here, you start producing lactic acid, but your body can still eliminate it as fast as it accumulates. It's a balance: you can speak in short sentences, but conversation becomes less natural.

This zone is useful for paced long runs and learning to "manage" prolonged effort. It prepares the mind as much as the body.

**Typical sensation**: sustained effort, concentration needed to maintain pace.

### Zone 4 — Threshold (80-90% HRmax)

Lactate threshold is a key concept in exercise physiology. It's the intensity at which lactic acid starts accumulating faster than your body can clear it. Past this point, fatigue becomes exponential.

Working in Zone 4 means pushing this threshold higher. The higher it is, the faster you can run for longer. Threshold sessions are demanding: 20 to 40 minutes at a pace where you can only say a few words between breaths.

This is your 10K pace, maybe slightly faster. Uncomfortable but manageable for a limited duration.

**Typical sensation**: hard effort, you're counting the minutes.

### Zone 5 — VO2max (90-95% HRmax)

Maximal Aerobic Speed represents the pace at which you reach your maximum oxygen consumption (VO2max). It's the peak of your aerobic capacity, the boundary between what your lungs can supply and what your muscles demand.

Zone 5 work is done through intervals: 30 seconds to 3 minutes of intense effort, followed by recovery. These interval sessions — the famous "30/30s" or "1000m repeats" — are what most improve your pure speed.

But beware: this type of training is very demanding. Two sessions per week maximum, with at least 48 hours of recovery between each.

**Typical sensation**: maximal breathing, impossible to talk, limited duration.

### Zone 6 — Sprint (95-100% HRmax)

Zone 6 is the domain of maximum effort, where all muscle fibers are recruited. We're no longer talking minutes but seconds: 10, 20, 30 seconds of pure sprint.

This work develops neuromuscular coordination — your brain's ability to efficiently activate muscles — and pure power. It's particularly useful for improving your race finish or acceleration capacity.

Short hill sprints and end-of-jog sprints engage this zone.

**Typical sensation**: total effort, the end feels almost like relief.

---

## Determining your personal zones

The maximum heart rate (HRmax) percentages given above are averages. For precise training, you need to know your own HRmax.

### The field test

The most reliable method remains testing. After a complete warm-up of 15-20 minutes, chain 3 to 4 hills of 2-3 minutes with progressive acceleration. On the last one, give everything you have. The peak shown on your watch will be close to your actual HRmax.

### The formulas

The classic "220 - age" formula is simple but imprecise, with a standard deviation of 10-12 beats. The Tanaka formula (208 - 0.7 × age) is slightly more reliable. But keep in mind that no formula replaces direct measurement.

### The perception scale

Alongside heart rate, the Borg scale (RPE from 1 to 10) helps calibrate your sensations:

| Zone | RPE | Description |
|------|-----|-------------|
| Z1 | 2-3 | Very easy, recovery |
| Z2 | 3-4 | Comfortable, can last long |
| Z3 | 5-6 | Moderately hard |
| Z4 | 7-8 | Hard, uncomfortable |
| Z5 | 8-9 | Very hard, maximal breathing |
| Z6 | 10 | Maximum effort, few seconds |

With experience, you'll learn to correlate your sensations with your watch data.

---

## Applying zones to your training

The classic distribution among distance runners follows the 80/20 rule: 80% of training volume in Zone 1-2, 20% in Zone 4 and above. This polarization, validated by decades of research, maximizes adaptations while limiting fatigue.

Concretely, over 4 weekly runs:
- 3 runs in Zone 1-2 (jogs, long run)
- 1 session with intensity (threshold, intervals, or tempo)

The classic trap is running too fast on easy days and too slow on hard days. Result: you're constantly in Zone 3, neither light enough to recover nor intense enough to progress. This is called "gray zone" training — lots of effort for little results.

---

## Put it into practice

You now know the theory. The next step is to calculate your personal zones and apply them to your sessions. Our calculator allows you to get your precise ranges based on your HRmax and VO2max speed.`,
  },
  {
    id: "testing-vma",
    slug: "testing-vma",
    title: "Mesurer sa VMA et sa FCmax",
    titleEn: "Measuring Your VO2max Speed and HRmax",
    description:
      "Protocoles de tests et méthodes pour établir vos références d'entraînement",
    descriptionEn:
      "Test protocols and methods to establish your training benchmarks",
    category: "fundamentals",
    readTime: 12,
    content: `## Connaître ses chiffres pour mieux s'entraîner

Deux valeurs dominent la planification de l'entraînement en course à pied : la VMA (Vitesse Maximale Aérobie) et la FCmax (Fréquence Cardiaque Maximale). La première détermine vos allures de travail, la seconde définit vos zones d'intensité. Sans ces références, vous courez à l'aveugle — trop vite certains jours, pas assez d'autres.

Mais attention : ces valeurs sont personnelles. La VMA de votre voisin de peloton ne vous dit rien sur la vôtre, et les formules générales masquent des variations individuelles importantes. Seule une mesure directe vous donnera des données fiables.

---

## La VMA : votre plafond aérobie

### Ce que mesure vraiment la VMA

La Vitesse Maximale Aérobie correspond à la vitesse de course à laquelle votre consommation d'oxygène atteint son maximum. C'est le point où votre système aérobie tourne à plein régime — au-delà, seuls les systèmes anaérobies peuvent fournir plus d'énergie, mais pour une durée très limitée.

En laboratoire, on mesure directement le VO2max (volume d'oxygène consommé par minute) avec un masque et un tapis roulant. Sur le terrain, on estime plutôt la VMA : la vitesse à laquelle vous atteignez ce VO2max. Pour les coureurs, c'est une donnée plus pratique car elle se traduit directement en allures d'entraînement.

Concrètement, la VMA est la vitesse maximale que vous pouvez maintenir environ 4 à 7 minutes. Un coureur avec une VMA de 15 km/h court donc à 15 km/h sur un test de 5-6 minutes à fond, mais ne tiendra cette allure qu'une poignée de minutes avant de devoir ralentir.

### Pourquoi c'est fondamental

Toutes les allures d'entraînement découlent de la VMA. Une séance de seuil se court autour de 85% de VMA. Un 30/30 se fait à 100-105% de VMA. Votre allure marathon tourne autour de 75-80% de VMA.

Sans connaître votre VMA, vous ne pouvez que deviner ces allures. Et les estimations sont souvent fausses : soit vous vous sous-estimez et stagnez, soit vous vous surestimez et accumulez la fatigue.

---

## Les tests de terrain pour la VMA

### Le test demi-Cooper (6 minutes)

C'est le test le plus simple et le plus répandu. Le protocole est élémentaire : après un échauffement complet, courez le plus loin possible en exactement 6 minutes.

**Préparation :**
Échauffez-vous pendant 15 à 20 minutes avec un footing progressif, quelques gammes (montées de genoux, talons-fesses), et 2-3 accélérations progressives. Vous devez arriver au départ du test avec les muscles chauds et le cardio activé, mais sans fatigue.

**Exécution :**
Lancez votre chronomètre et partez. Le piège classique est de partir trop vite — les premières minutes semblent faciles, puis la dette d'oxygène se paie cash. Visez un effort régulier, difficile dès le départ mais soutenable. Les deux dernières minutes doivent être une lutte.

**Calcul :**
VMA (km/h) = distance parcourue (en mètres) / 100

Si vous avez parcouru 1 620 mètres, votre VMA est de 16,2 km/h.

### Le test VAMEVAL

Ce test progressif par paliers est plus précis mais demande une piste de 400m avec des plots tous les 20 mètres, ainsi qu'un enregistrement audio pour les signaux.

Le principe : vous démarrez à 8 km/h et la vitesse augmente de 0,5 km/h chaque minute. Des bips réguliers vous indiquent quand passer chaque plot. Quand vous ne parvenez plus à suivre le rythme, le test est terminé.

Votre VMA correspond au dernier palier complété entièrement. Ce test a l'avantage d'imposer une allure progressive, évitant le problème du départ trop rapide.

### Le test des 5 minutes

Similaire au demi-Cooper, mais sur 5 minutes. Après échauffement, courez au maximum de vos capacités pendant exactement 5 minutes.

**Calcul :**
VMA (km/h) = distance (m) × 12 / 1000

Ce test est légèrement plus court et donc plus intense. Certains coureurs le préfèrent car il limite la composante mentale — 5 minutes de souffrance semblent plus gérables que 6.

### Tests de distance (1500m ou 2000m)

Si vous préférez raisonner en distance plutôt qu'en temps, ces tests sont une alternative. L'idée : courir 1500m ou 2000m le plus vite possible.

**Calcul :**
VMA (km/h) = distance (m) / temps (s) × 3,6

Pour 1500m en 5:30 (330 secondes) : VMA = 1500 / 330 × 3,6 = 16,4 km/h

---

## Mesurer sa FCmax

### Pourquoi les formules sont insuffisantes

La formule "220 - âge" a été établie dans les années 1970 sur une population limitée. Son écart-type est de 10-12 battements par minute. Autrement dit, pour une personne de 40 ans, la FCmax "théorique" de 180 bpm peut en réalité être n'importe où entre 168 et 192 bpm.

La formule de Tanaka (208 - 0,7 × âge) est légèrement meilleure mais reste une approximation. Si vous basez vos zones sur une FCmax erronée de 10 battements, toutes vos plages seront décalées.

### Le test de terrain pour la FCmax

Le protocole le plus fiable combine progressivité et effort maximal final.

**Échauffement (20 minutes) :**
Commencez par 10 minutes de footing très facile, puis 5 minutes à allure modérée. Ajoutez quelques gammes et 2-3 accélérations progressives sur 50m.

**Phase de montée (10-15 minutes) :**
Trouvez une côte de 200-400 mètres avec une pente de 5-8%. Enchaînez 3 à 4 montées de 2-3 minutes en augmentant progressivement l'intensité :
- 1re montée : allure tempo, respiration contrôlée
- 2e montée : allure seuil, respiration plus soutenue
- 3e montée : allure VMA, respiration maximale
- 4e montée : tout ce qu'il vous reste, sprint final dans les 100 derniers mètres

**Lecture :**
Consultez le pic de fréquence cardiaque sur votre montre juste après la dernière montée. Ce pic sera très proche de votre FCmax réelle.

**Précautions :**
Ce test est physiologiquement exigeant. Ne le faites que si vous êtes en bonne santé, sans antécédent cardiaque, et habitué aux efforts intenses. En cas de doute, optez pour un test d'effort médicalisé.

---

## Interpréter et utiliser vos résultats

### Calculer vos zones cardiaques

Une fois votre FCmax connue, vos zones se calculent simplement :

| Zone | Plage |
|------|-------|
| Zone 1 | 50-60% FCmax |
| Zone 2 | 60-70% FCmax |
| Zone 3 | 70-80% FCmax |
| Zone 4 | 80-90% FCmax |
| Zone 5 | 90-95% FCmax |
| Zone 6 | 95-100% FCmax |

Pour une FCmax de 185 bpm, la Zone 2 (endurance fondamentale) se situe entre 111 et 130 bpm.

### Calculer vos allures d'entraînement

À partir de votre VMA, vous pouvez définir vos allures cibles :

| Type de séance | % VMA | Exemple (VMA 15 km/h) |
|----------------|-------|----------------------|
| Récupération | 60-65% | 9-9,8 km/h |
| Endurance fondamentale | 65-75% | 9,8-11,3 km/h |
| Tempo / Allure marathon | 75-85% | 11,3-12,8 km/h |
| Seuil / Allure 10km | 85-90% | 12,8-13,5 km/h |
| VMA | 95-105% | 14,3-15,8 km/h |

### Quand refaire les tests

Vos valeurs évoluent avec l'entraînement. Prévoyez un nouveau test :
- Tous les 2-3 mois en période de progression active
- Après une coupure de plus de 2 semaines
- Avant de préparer un nouvel objectif

Attention : testez-vous dans de bonnes conditions (reposé, pas trop chaud, surface adaptée) pour obtenir des résultats comparables.

---

## Les pièges à éviter

**Partir trop vite.** C'est l'erreur numéro un sur les tests chronométrés. Les premières secondes semblent faciles, mais le départ rapide se paie toujours dans les dernières minutes.

**Tester fatigué.** Un test après une semaine chargée sous-estimera vos capacités réelles. Prévoyez 48 heures de repos relatif avant.

**Ignorer les conditions.** Chaleur, vent de face, ou terrain vallonné fausseront vos résultats. Choisissez une surface plane, un jour tempéré, et si possible sans vent.

**Se comparer aux autres.** Votre VMA est personnelle. Une VMA de 14 km/h chez quelqu'un qui court depuis 3 mois est excellente. La même valeur chez un coureur de 10 ans d'expérience indique une marge de progression.

---

## Passez à l'action

Les tests sont un moment de vérité : 6 minutes de lucidité sur votre condition physique actuelle. L'important n'est pas le chiffre absolu, mais ce que vous en faites. Avec votre VMA et votre FCmax en poche, vous pouvez maintenant configurer vos zones et commencer un entraînement véritablement personnalisé.`,
    contentEn: `## Know your numbers to train better

Two values dominate running training planning: VO2max speed (Maximal Aerobic Speed, or MAS) and HRmax (Maximum Heart Rate). The first determines your training paces, the second defines your intensity zones. Without these benchmarks, you're running blind — too fast some days, not enough on others.

But be careful: these values are personal. Your running buddy's MAS tells you nothing about yours, and general formulas mask significant individual variations. Only direct measurement will give you reliable data.

---

## VO2max speed: your aerobic ceiling

### What MAS actually measures

Maximal Aerobic Speed corresponds to the running pace at which your oxygen consumption reaches its maximum. It's the point where your aerobic system runs at full capacity — beyond that, only anaerobic systems can provide more energy, but for a very limited time.

In a laboratory, VO2max (volume of oxygen consumed per minute) is measured directly with a mask and treadmill. In the field, we estimate MAS instead: the speed at which you reach this VO2max. For runners, this is more practical data because it translates directly into training paces.

Concretely, MAS is the maximum speed you can maintain for about 4 to 7 minutes. A runner with a MAS of 15 km/h runs at 15 km/h during an all-out 5-6 minute test, but will only hold this pace for a handful of minutes before having to slow down.

### Why it's fundamental

All training paces derive from MAS. A threshold session runs at around 85% of MAS. A 30/30 workout is done at 100-105% of MAS. Your marathon pace hovers around 75-80% of MAS.

Without knowing your MAS, you can only guess these paces. And guesses are often wrong: either you underestimate yourself and stagnate, or you overestimate and accumulate fatigue.

---

## Field tests for VO2max speed

### The half-Cooper test (6 minutes)

This is the simplest and most common test. The protocol is elementary: after a complete warm-up, run as far as possible in exactly 6 minutes.

**Preparation:**
Warm up for 15 to 20 minutes with progressive jogging, some drills (high knees, butt kicks), and 2-3 progressive accelerations. You should arrive at the test start with warm muscles and activated cardio, but without fatigue.

**Execution:**
Start your timer and go. The classic trap is starting too fast — the first minutes seem easy, then the oxygen debt is paid in full. Aim for a steady effort, difficult from the start but sustainable. The last two minutes should be a struggle.

**Calculation:**
MAS (km/h) = distance covered (in meters) / 100

If you covered 1,620 meters, your MAS is 16.2 km/h.

### The VAMEVAL test

This progressive step test is more precise but requires a 400m track with cones every 20 meters, plus an audio recording for signals.

The principle: you start at 8 km/h and speed increases by 0.5 km/h every minute. Regular beeps indicate when to pass each cone. When you can no longer keep up with the pace, the test is over.

Your MAS corresponds to the last level completed entirely. This test has the advantage of imposing a progressive pace, avoiding the problem of starting too fast.

### The 5-minute test

Similar to the half-Cooper, but over 5 minutes. After warm-up, run at maximum capacity for exactly 5 minutes.

**Calculation:**
MAS (km/h) = distance (m) × 12 / 1000

This test is slightly shorter and therefore more intense. Some runners prefer it because it limits the mental component — 5 minutes of suffering seems more manageable than 6.

### Distance tests (1500m or 2000m)

If you prefer reasoning in distance rather than time, these tests are an alternative. The idea: run 1500m or 2000m as fast as possible.

**Calculation:**
MAS (km/h) = distance (m) / time (s) × 3.6

For 1500m in 5:30 (330 seconds): MAS = 1500 / 330 × 3.6 = 16.4 km/h

---

## Measuring your HRmax

### Why formulas are insufficient

The "220 - age" formula was established in the 1970s on a limited population. Its standard deviation is 10-12 beats per minute. In other words, for a 40-year-old, the "theoretical" HRmax of 180 bpm could actually be anywhere between 168 and 192 bpm.

The Tanaka formula (208 - 0.7 × age) is slightly better but remains an approximation. If you base your zones on an HRmax that's off by 10 beats, all your ranges will be shifted.

### The field test for HRmax

The most reliable protocol combines progressivity with a final maximum effort.

**Warm-up (20 minutes):**
Start with 10 minutes of very easy jogging, then 5 minutes at moderate pace. Add some drills and 2-3 progressive accelerations over 50m.

**Climbing phase (10-15 minutes):**
Find a 200-400 meter hill with a 5-8% grade. Chain 3 to 4 climbs of 2-3 minutes, progressively increasing intensity:
- 1st climb: tempo pace, controlled breathing
- 2nd climb: threshold pace, more sustained breathing
- 3rd climb: VO2max pace, maximal breathing
- 4th climb: everything you have left, final sprint in the last 100 meters

**Reading:**
Check the peak heart rate on your watch just after the last climb. This peak will be very close to your actual HRmax.

**Precautions:**
This test is physiologically demanding. Only do it if you're healthy, with no cardiac history, and used to intense efforts. If in doubt, opt for a medically supervised stress test.

---

## Interpreting and using your results

### Calculating your heart rate zones

Once your HRmax is known, your zones are calculated simply:

| Zone | Range |
|------|-------|
| Zone 1 | 50-60% HRmax |
| Zone 2 | 60-70% HRmax |
| Zone 3 | 70-80% HRmax |
| Zone 4 | 80-90% HRmax |
| Zone 5 | 90-95% HRmax |
| Zone 6 | 95-100% HRmax |

For an HRmax of 185 bpm, Zone 2 (fundamental endurance) is between 111 and 130 bpm.

### Calculating your training paces

From your MAS, you can define your target paces:

| Session type | % MAS | Example (MAS 15 km/h) |
|--------------|-------|----------------------|
| Recovery | 60-65% | 9-9.8 km/h |
| Fundamental endurance | 65-75% | 9.8-11.3 km/h |
| Tempo / Marathon pace | 75-85% | 11.3-12.8 km/h |
| Threshold / 10K pace | 85-90% | 12.8-13.5 km/h |
| VO2max | 95-105% | 14.3-15.8 km/h |

### When to retest

Your values evolve with training. Plan a new test:
- Every 2-3 months during active progression
- After a break of more than 2 weeks
- Before preparing for a new goal

Note: test yourself in good conditions (rested, not too hot, suitable surface) to get comparable results.

---

## Pitfalls to avoid

**Starting too fast.** This is the number one error on timed tests. The first seconds seem easy, but a fast start always costs you in the final minutes.

**Testing tired.** A test after a heavy week will underestimate your true capabilities. Plan for 48 hours of relative rest beforehand.

**Ignoring conditions.** Heat, headwind, or hilly terrain will skew your results. Choose a flat surface, a temperate day, and if possible no wind.

**Comparing yourself to others.** Your MAS is personal. A MAS of 14 km/h for someone who's been running for 3 months is excellent. The same value for a runner with 10 years of experience indicates room for improvement.

---

## Take action

Tests are a moment of truth: 6 minutes of clarity on your current physical condition. What matters isn't the absolute number, but what you do with it. With your MAS and HRmax in hand, you can now configure your zones and start truly personalized training.`,
  },
  {
    id: "warmup",
    slug: "warmup",
    title: "L'échauffement du coureur",
    titleEn: "The Runner's Warm-up",
    description:
      "Préparer son corps à l'effort : physiologie, protocoles et erreurs courantes",
    descriptionEn:
      "Preparing your body for effort: physiology, protocols and common mistakes",
    category: "training",
    readTime: 8,
    content: `## Un rituel souvent bâclé

Regardez les coureurs au départ d'une course populaire. Certains arrivent en trottinant depuis 20 minutes, font quelques accélérations, paraissent détendus. D'autres débarquent de leur voiture, enfilent leurs chaussures, et se placent directement sur la ligne. Les premiers termineront probablement mieux que les seconds — non pas parce qu'ils sont plus forts, mais parce qu'ils ont préparé leur corps à l'effort.

L'échauffement n'est pas une formalité. C'est une séquence physiologique qui prépare chaque système de votre corps : muscles, articulations, système cardiovasculaire, métabolisme. Bien exécuté, il améliore votre performance et réduit le risque de blessure. Négligé ou mal fait, il vous place dans les pires conditions pour courir.

---

## Ce qui se passe dans votre corps

### L'élévation de température

Vos muscles fonctionnent mieux chauds. Littéralement. Une augmentation de 1°C de la température musculaire améliore leur capacité de contraction de 2 à 5%. Les enzymes qui produisent l'énergie travaillent plus efficacement, la viscosité musculaire diminue, les fibres glissent mieux les unes sur les autres.

C'est pourquoi le mot "échauffement" est approprié : vous cherchez vraiment à élever la température de vos tissus. Un footing de 10-15 minutes augmente la température centrale d'environ 1°C et celle des muscles actifs de 2 à 3°C.

### L'activation cardiovasculaire

Au repos, votre cœur bat doucement et le sang circule lentement dans vos muscles. Passer brutalement à l'effort intense crée un décalage : vos muscles réclament de l'oxygène que le système cardiovasculaire n'est pas encore prêt à fournir. Résultat : vous accumulez une dette d'oxygène dès les premières minutes, et la sensation d'essoufflement arrive trop tôt.

L'échauffement progressif permet au cœur d'accélérer graduellement, aux vaisseaux sanguins de se dilater, au flux sanguin vers les muscles de s'amplifier. Quand l'effort réel commence, le système est déjà en régime.

### La lubrification articulaire

Vos articulations sont entourées de liquide synovial, un lubrifiant naturel qui réduit la friction entre les surfaces osseuses. Ce liquide s'épaissit au repos et se fluidifie avec le mouvement. Les premières minutes de footing léger "réveillent" vos articulations : chevilles, genoux, hanches gagnent en amplitude et en fluidité.

### L'activation neuromusculaire

Courir n'est pas qu'une affaire de muscles. C'est une coordination complexe entre votre cerveau et des dizaines de groupes musculaires qui doivent se contracter et se relâcher au bon moment, dans le bon ordre, avec la bonne intensité.

Les gammes athlétiques — montées de genoux, talons-fesses, pas chassés — "réveillent" ces circuits nerveux. Elles préparent votre système neuromusculaire aux mouvements spécifiques de la course.

---

## Protocole d'échauffement complet

### Phase 1 : Footing léger (10-15 minutes)

Commencez par un trot très lent, en Zone 1. Les premières minutes doivent sembler ridiculement faciles. Si vous avez une montre cardio, visez 50-60% de votre FCmax.

Augmentez progressivement l'allure au fil des minutes, sans jamais dépasser la Zone 2. À la fin de cette phase, vous devez sentir une légère chaleur, une respiration un peu plus marquée, mais aucune fatigue.

L'objectif n'est pas de "se préparer à être fatigué". C'est de préparer tous les systèmes à fonctionner ensemble efficacement.

### Phase 2 : Gammes athlétiques (5-8 minutes)

Sur une ligne droite de 30-40 mètres, enchaînez ces exercices avec retour en trottinant :

**Montées de genoux** : levez les genoux haut devant vous, un pas après l'autre, comme si vous montiez un escalier exagérément. Gardez le buste droit, les bras actifs. Deux passages de 30m.

**Talons-fesses** : ramenez vos talons vers vos fessiers à chaque foulée. Le mouvement doit être vif, le contact au sol bref. Deux passages de 30m.

**Pas chassés** : déplacez-vous latéralement, pieds parallèles, sans croiser les jambes. Un passage de chaque côté.

**Jambes tendues** : avancez en gardant les jambes presque tendues, comme une marche de soldat exagérée. Cet exercice étire les ischio-jambiers tout en activant les fléchisseurs de hanche. Deux passages de 20m.

**Foulées bondissantes** : exagérez chaque foulée avec une poussée verticale marquée. L'idée est de "rebondir" d'un pied sur l'autre. Deux passages de 20m.

### Phase 3 : Accélérations progressives (3-5 minutes)

Avant les exercices de vitesse ou une compétition, ajoutez 3 à 4 accélérations progressives de 60-80 mètres.

Le principe : partez à allure modérée et accélérez progressivement jusqu'à 85-90% de votre vitesse maximale. Ne sprintez pas à fond — le but est de préparer vos muscles aux vitesses élevées, pas de vous épuiser.

Récupération complète entre chaque accélération : revenez en marchant ou en trottinant très léger.

---

## Adapter l'échauffement à la séance

### Avant un footing facile

Un long échauffement serait contre-productif. Partez simplement très lentement, et les 10 premières minutes de votre sortie feront office d'échauffement naturel. Aucune gamme nécessaire.

### Avant une sortie longue

Même logique que le footing, mais avec 5-10 minutes de trot vraiment lent avant de vous installer dans votre rythme de croisière. Votre corps a besoin de temps pour mobiliser ses réserves énergétiques.

### Avant une séance de seuil ou tempo

L'échauffement complet devient important. Comptez 15-20 minutes : footing progressif, quelques gammes simplifiées, et 2-3 accélérations à l'allure cible de la séance. Vous devez arriver au premier bloc de travail avec le cardio "prêt à monter".

### Avant du fractionné VMA

C'est là que l'échauffement est le plus crucial. Les efforts très intenses sollicitent brutalement les muscles et les tendons — un démarrage à froid multiplie le risque de blessure.

Prévoyez 20-25 minutes : footing progressif de 15 minutes, gammes complètes, et 3-4 accélérations dont la dernière proche de votre allure VMA.

### Avant une compétition

L'échauffement pré-course est un art en soi. Il doit être complet sans être fatigant, et se terminer juste avant le départ (5-10 minutes maximum).

Sur un 10 km ou moins, l'échauffement est déterminant : vous serez dans le dur dès les premières minutes. Comptez 25-30 minutes avec le protocole complet.

Sur un marathon, l'échauffement peut être plus léger : 10-15 minutes de trot et quelques gammes suffisent. Les premiers kilomètres de course serviront de fin d'échauffement.

---

## Les erreurs qui sabotent votre échauffement

### Les étirements statiques avant l'effort

Pendant des décennies, on a conseillé de s'étirer avant de courir. Les études récentes montrent l'inverse : les étirements statiques (maintenir une position 20-30 secondes) réduisent temporairement la force et la puissance musculaire de 5 à 10%.

Réservez les étirements statiques pour après la séance, quand les muscles sont chauds et que la récupération commence. Avant l'effort, préférez les mouvements dynamiques des gammes athlétiques.

### L'échauffement trop court

"Je n'ai pas le temps" est l'excuse classique. Mais courir 5 km de plus dans de mauvaises conditions est moins efficace que courir 3 km bien préparé.

Un échauffement bâclé vous fait partir en dette d'oxygène, avec des muscles raides et des articulations mal lubrifiées. Les premières minutes de la séance servent alors d'échauffement forcé — mais le mal est fait.

### L'échauffement trop intense

À l'inverse, certains coureurs transforment l'échauffement en pré-fatigue. Si vous êtes déjà essoufflé avant de commencer la vraie séance, c'est raté. L'échauffement doit activer, pas épuiser.

Restez en Zone 1-2, sauf pour les accélérations finales qui restent brèves.

### Le timing mal calculé

En compétition, terminer son échauffement 30 minutes avant le départ annule tous les bénéfices. La température musculaire redescend, le système cardiovasculaire se "rendort".

Idéalement, les dernières accélérations doivent se faire 5-10 minutes avant le départ. Pas toujours facile avec les sas et les consignes organisateurs, mais visez ce timing.

---

## Conditions particulières

**Par temps froid** : les muscles mettent plus longtemps à chauffer. Ajoutez 5-10 minutes de footing, et portez des vêtements chauds que vous retirerez juste avant le départ.

**Par temps chaud** : le risque n'est plus le froid mais la surchauffe. Réduisez l'intensité de l'échauffement, restez à l'ombre si possible, et hydratez-vous.

**Le matin tôt** : votre corps sort de plusieurs heures d'immobilité. Les disques vertébraux sont gorgés de liquide, les muscles raides. Prévoyez quelques minutes supplémentaires et démarrez encore plus progressivement.

---

## En résumé

L'échauffement n'est pas du temps perdu — c'est du temps investi. Quinze à vingt minutes de préparation peuvent faire la différence entre une séance réussie et une blessure, entre une course où vous vous sentez léger et une autre où vous luttez dès le premier kilomètre.

Transformez-le en rituel. Avec l'habitude, vous sentirez la différence : un corps prêt à l'effort répond différemment qu'un corps lancé à froid.`,
    contentEn: `## An often rushed ritual

Watch the runners at the start of a popular race. Some arrive jogging for 20 minutes, do a few accelerations, look relaxed. Others jump out of their car, put on their shoes, and head straight to the line. The former will probably finish better than the latter — not because they're stronger, but because they've prepared their body for effort.

Warm-up isn't a formality. It's a physiological sequence that prepares every system in your body: muscles, joints, cardiovascular system, metabolism. Done well, it improves your performance and reduces injury risk. Neglected or poorly done, it puts you in the worst conditions for running.

---

## What happens in your body

### Temperature elevation

Your muscles work better warm. Literally. A 1°C increase in muscle temperature improves their contraction capacity by 2 to 5%. The enzymes that produce energy work more efficiently, muscle viscosity decreases, fibers slide better against each other.

This is why "warm-up" is the right word: you're actually trying to raise your tissue temperature. A 10-15 minute jog increases core temperature by about 1°C and active muscle temperature by 2 to 3°C.

### Cardiovascular activation

At rest, your heart beats slowly and blood circulates slowly through your muscles. Jumping suddenly into intense effort creates a mismatch: your muscles demand oxygen that the cardiovascular system isn't yet ready to supply. Result: you accumulate an oxygen debt from the first minutes, and the breathless feeling arrives too early.

Progressive warm-up allows the heart to accelerate gradually, blood vessels to dilate, blood flow to muscles to amplify. When the real effort begins, the system is already running.

### Joint lubrication

Your joints are surrounded by synovial fluid, a natural lubricant that reduces friction between bone surfaces. This fluid thickens at rest and becomes more fluid with movement. The first minutes of light jogging "wake up" your joints: ankles, knees, hips gain range and fluidity.

### Neuromuscular activation

Running isn't just about muscles. It's a complex coordination between your brain and dozens of muscle groups that must contract and relax at the right time, in the right order, with the right intensity.

Athletic drills — high knees, butt kicks, lateral shuffles — "wake up" these neural circuits. They prepare your neuromuscular system for the specific movements of running.

---

## Complete warm-up protocol

### Phase 1: Light jogging (10-15 minutes)

Start with a very slow jog, in Zone 1. The first minutes should feel ridiculously easy. If you have a heart rate monitor, aim for 50-60% of your HRmax.

Gradually increase the pace over the minutes, never exceeding Zone 2. By the end of this phase, you should feel slight warmth, slightly more pronounced breathing, but no fatigue.

The goal isn't to "prepare to be tired." It's to prepare all systems to work together efficiently.

### Phase 2: Athletic drills (5-8 minutes)

On a straight line of 30-40 meters, chain these exercises with a jogging return:

**High knees**: raise your knees high in front of you, one step after another, as if climbing an exaggerated staircase. Keep your torso upright, arms active. Two passes of 30m.

**Butt kicks**: bring your heels toward your glutes with each stride. The movement should be quick, ground contact brief. Two passes of 30m.

**Lateral shuffles**: move sideways, feet parallel, without crossing your legs. One pass on each side.

**Straight leg runs**: advance keeping legs almost straight, like an exaggerated soldier's march. This exercise stretches hamstrings while activating hip flexors. Two passes of 20m.

**Bounding strides**: exaggerate each stride with marked vertical push. The idea is to "bounce" from one foot to the other. Two passes of 20m.

### Phase 3: Progressive accelerations (3-5 minutes)

Before speed exercises or competition, add 3 to 4 progressive accelerations of 60-80 meters.

The principle: start at moderate pace and progressively accelerate to 85-90% of your maximum speed. Don't sprint all-out — the goal is to prepare your muscles for high speeds, not exhaust yourself.

Complete recovery between each acceleration: return walking or very light jogging.

---

## Adapting warm-up to the session

### Before an easy run

A long warm-up would be counterproductive. Simply start very slowly, and the first 10 minutes of your outing will serve as natural warm-up. No drills needed.

### Before a long run

Same logic as the easy run, but with 5-10 minutes of really slow jogging before settling into your cruising rhythm. Your body needs time to mobilize its energy reserves.

### Before a threshold or tempo session

Complete warm-up becomes important. Count 15-20 minutes: progressive jogging, some simplified drills, and 2-3 accelerations at the session's target pace. You should arrive at the first work block with cardio "ready to climb."

### Before VO2max intervals

This is where warm-up is most crucial. Very intense efforts brutally stress muscles and tendons — a cold start multiplies injury risk.

Plan 20-25 minutes: 15 minutes of progressive jogging, complete drills, and 3-4 accelerations with the last one close to your VO2max pace.

### Before competition

Pre-race warm-up is an art in itself. It must be complete without being tiring, and end just before the start (5-10 minutes maximum).

On a 10K or shorter, warm-up is decisive: you'll be working hard from the first minutes. Count 25-30 minutes with the complete protocol.

On a marathon, warm-up can be lighter: 10-15 minutes of jogging and some drills are enough. The first kilometers of the race will serve as the end of warm-up.

---

## Mistakes that sabotage your warm-up

### Static stretching before effort

For decades, people advised stretching before running. Recent studies show the opposite: static stretches (holding a position 20-30 seconds) temporarily reduce muscle strength and power by 5 to 10%.

Save static stretches for after the session, when muscles are warm and recovery begins. Before effort, prefer the dynamic movements of athletic drills.

### Too short warm-up

"I don't have time" is the classic excuse. But running 5 km more in poor conditions is less effective than running 3 km well prepared.

A rushed warm-up makes you start in oxygen debt, with stiff muscles and poorly lubricated joints. The first minutes of the session then serve as forced warm-up — but the damage is done.

### Too intense warm-up

Conversely, some runners turn warm-up into pre-fatigue. If you're already out of breath before starting the real session, you've failed. Warm-up should activate, not exhaust.

Stay in Zone 1-2, except for final accelerations which remain brief.

### Poorly calculated timing

In competition, finishing your warm-up 30 minutes before the start cancels all benefits. Muscle temperature drops, the cardiovascular system "falls back asleep."

Ideally, the last accelerations should be done 5-10 minutes before the start. Not always easy with corrals and organizer instructions, but aim for this timing.

---

## Special conditions

**In cold weather**: muscles take longer to warm up. Add 5-10 minutes of jogging, and wear warm clothes that you'll remove just before the start.

**In hot weather**: the risk is no longer cold but overheating. Reduce warm-up intensity, stay in the shade if possible, and hydrate.

**Early morning**: your body has been immobile for several hours. Spinal discs are full of fluid, muscles stiff. Plan a few extra minutes and start even more gradually.

---

## In summary

Warm-up isn't time lost — it's time invested. Fifteen to twenty minutes of preparation can make the difference between a successful session and an injury, between a race where you feel light and one where you struggle from kilometer one.

Turn it into a ritual. With habit, you'll feel the difference: a body ready for effort responds differently than a body launched cold.`,
  },
  {
    id: "recovery",
    slug: "recovery",
    title: "La récupération : là où tout se joue",
    titleEn: "Recovery: Where It All Comes Together",
    description:
      "Comprendre pourquoi la progression se fait au repos et comment optimiser votre récupération",
    descriptionEn:
      "Understanding why progression happens at rest and how to optimize your recovery",
    category: "lifestyle",
    readTime: 10,
    content: `## Le paradoxe de l'entraînement

Voici une vérité contre-intuitive : vous ne progressez pas pendant que vous courez. Vous progressez pendant que vous récupérez.

L'entraînement est un stress. Chaque séance inflige à votre corps des micro-traumatismes : fibres musculaires endommagées, réserves de glycogène vidées, système nerveux sollicité. C'est pendant le repos qui suit que la magie opère. Votre corps ne se contente pas de réparer les dégâts — il surcompense, devenant un peu plus fort, un peu plus endurant qu'avant.

Ce phénomène s'appelle la supercompensation. Mais il ne fonctionne qu'à une condition : laisser au corps le temps de compléter son travail de reconstruction. Couper ce processus par une nouvelle séance trop précoce, c'est construire sur des fondations inachevées.

---

## Les deux types de récupération

### La récupération active

Après un effort intense, le sang est chargé de déchets métaboliques : lactate, ions hydrogène, radicaux libres. Ces substances, normales et inévitables, contribuent à la sensation de fatigue et de raideur musculaire.

Un mouvement léger — footing très lent, vélo à faible intensité, marche — accélère leur élimination. Le flux sanguin augmenté "nettoie" les tissus, apporte oxygène et nutriments frais. C'est pourquoi une sortie de 20-30 minutes en Zone 1 le lendemain d'une grosse séance récupère souvent mieux que le repos total.

L'astuce : résister à la tentation d'accélérer. Si vous transformez votre récupération active en vraie séance, vous ajoutez du stress au lieu d'en éliminer.

### La récupération passive

Parfois, le corps a besoin de ne rien faire. Après un effort particulièrement violent — compétition, séance de seuil éprouvante, sortie très longue — ou en cas d'accumulation de fatigue, le repos complet prime.

Cela signifie : pas de course, pas de cross-training intense, juste des activités quotidiennes normales. Le sommeil, les étirements doux, peut-être une marche tranquille. Votre corps dispose alors de toute son énergie pour la reconstruction.

---

## Le sommeil : votre arme secrète

Si vous ne deviez retenir qu'une chose de cet article, ce serait celle-ci : le sommeil est le facteur de récupération le plus puissant et le plus sous-estimé.

### Ce qui se passe la nuit

Pendant le sommeil profond, votre corps libère massivement l'hormone de croissance (GH). Cette hormone est le chef d'orchestre de la reconstruction : elle stimule la synthèse protéique, répare les fibres musculaires, renforce les tendons, consolide les adaptations de l'entraînement.

Le système immunitaire aussi travaille la nuit. Les cellules de défense se multiplient, les inflammations se résorbent, les micro-blessures se soignent. Un coureur qui dort mal compromet ces processus essentiels.

### Les besoins du coureur

La recommandation standard de 7-8 heures s'applique aux sédentaires. Un coureur qui s'entraîne régulièrement a besoin de davantage : 8-9 heures pour récupérer de manière optimale. Les athlètes d'élite dorment souvent 9-10 heures, siestes comprises.

Au-delà de la durée, la régularité compte. Se coucher et se lever à heures fixes synchronise votre horloge biologique, améliorant la qualité du sommeil même à durée égale.

### Optimiser votre sommeil

**L'environnement** : chambre fraîche (18-20°C), obscure (stores ou masque), silencieuse. La température corporelle doit baisser pour s'endormir — une pièce surchauffée l'empêche.

**Les écrans** : leur lumière bleue inhibe la mélatonine, l'hormone du sommeil. Évitez-les au moins 30 minutes avant de vous coucher, idéalement une heure.

**L'alimentation** : un repas trop copieux ou trop tardif perturbe l'endormissement. Mais se coucher le ventre vide aussi — une légère collation glucidique peut aider.

**La caféine** : sa demi-vie est de 5-6 heures. Un café à 16h signifie encore de la caféine dans le sang à 22h. Fixez-vous une limite en début d'après-midi.

### Les signaux d'alerte

Un manque de sommeil chronique se manifeste par des symptômes identifiables :

- Fréquence cardiaque au repos plus élevée que d'habitude
- Difficulté à atteindre vos allures habituelles
- Moral en berne, motivation absente
- Récupération plus lente entre les séances
- Sensibilité accrue aux infections

Si ces signes apparaissent, avant de modifier votre entraînement, examinez d'abord votre sommeil.

---

## La nutrition de récupération

### La fenêtre métabolique

Dans les 30 à 60 minutes suivant un effort, votre corps est dans un état de réceptivité particulière. Les enzymes qui stockent le glycogène sont suractivées. Les transporteurs de glucose dans les muscles sont à leur maximum. C'est le moment idéal pour reconstituer vos réserves.

Cette "fenêtre anabolique" n'est pas un mythe — les études la confirment. Manquer ce créneau ne vous empêchera pas de récupérer, mais vous récupérerez moins vite.

### Ce dont votre corps a besoin

**Des glucides** pour reconstituer le glycogène musculaire. Après une séance longue ou intense, vos réserves sont partiellement ou totalement vidées. Les glucides à index glycémique moyen-élevé (fruits, pain, riz) sont bien absorbés.

**Des protéines** pour réparer les fibres musculaires endommagées. 20-30 grammes suffisent ; davantage n'apporte pas de bénéfice supplémentaire immédiat.

**De l'eau** pour compenser les pertes hydriques. La sueur emporte aussi des électrolytes (sodium, potassium) — une boisson légèrement salée ou un aliment salé aide à la réhydratation.

### Exemples pratiques

Une collation simple post-entraînement :
- Un verre de lait chocolaté (naturellement équilibré en glucides/protéines)
- Une banane avec du yaourt grec
- Un sandwich au jambon sur pain complet
- Un smoothie fruits + protéine en poudre

Le repas principal, 2-3 heures après, peut être plus complet : pâtes ou riz, protéine de qualité (poulet, poisson, œufs), légumes, et une source de bonnes graisses (huile d'olive, avocat).

---

## Planifier la récupération

### À l'échelle de la semaine

Un plan d'entraînement bien conçu intègre la récupération. Sur 5-6 sorties hebdomadaires, seules 2-3 doivent être vraiment sollicitantes. Les autres sont des séances faciles en Zone 1-2 ou des jours de repos complet.

Le piège classique : enchaîner deux séances de haute intensité. Votre corps n'a pas le temps de s'adapter entre les deux. Une règle simple : toujours séparer les séances VMA ou seuil d'au moins 48-72 heures.

### À l'échelle du mois

Accumuler de la fatigue semaine après semaine mène au surentraînement. La solution : la semaine de décharge.

Toutes les 3-4 semaines, réduisez votre volume d'entraînement de 30-40%. Gardez une ou deux séances qualitatives mais raccourcies. Cette pause contrôlée permet au corps de "digérer" les adaptations accumulées.

Les coureurs qui négligent les semaines de décharge stagnent ou régressent — tout le contraire de ce qu'ils recherchent en s'entraînant plus.

### À l'échelle de l'année

Même les meilleurs ont besoin de coupures. Après un objectif majeur (marathon, compétition importante), prévoyez 2-4 semaines de repos actif : pas de plan, pas d'objectif, juste bouger pour le plaisir.

Cette coupure régénère le mental autant que le physique. Elle prévient l'usure psychologique qui accompagne les années d'entraînement continu.

---

## Reconnaître le surentraînement

Le surentraînement n'est pas de la simple fatigue. C'est un état pathologique où votre corps n'arrive plus à récupérer, même avec du repos. En arriver là demande des mois d'erreurs — et en sortir peut prendre des mois également.

### Les signes physiques

- Performances qui stagnent ou régressent malgré l'entraînement
- Fatigue persistante qui ne disparaît pas après le repos
- Fréquence cardiaque au repos anormalement élevée ou basse
- Blessures à répétition (tendinites, fractures de fatigue)
- Troubles du sommeil (insomnie ou hypersomnie)
- Perte d'appétit, perte de poids involontaire
- Infections fréquentes (système immunitaire affaibli)

### Les signes psychologiques

- Motivation en chute libre
- Irritabilité accrue
- Difficultés de concentration
- Anxiété liée à l'entraînement
- Perte du plaisir de courir

### Que faire si vous vous reconnaissez

Si vous présentez plusieurs de ces symptômes, la première réponse est contre-intuitive : arrêtez. Pas une semaine facile — un arrêt complet de la course pendant 1-2 semaines minimum.

Consultez un médecin du sport si les symptômes persistent. Le surentraînement peut masquer d'autres problèmes (anémie, déficits nutritionnels, troubles thyroïdiens).

La prévention reste la meilleure stratégie : respecter les semaines de décharge, ne pas augmenter le volume trop vite, et surtout écouter son corps quand il réclame du repos.

---

## Le mot de la fin

La récupération n'est pas une faiblesse, c'est une intelligence. Les coureurs qui progressent le plus ne sont pas ceux qui s'entraînent le plus dur — ce sont ceux qui maîtrisent l'équilibre entre stress et repos.

Intégrez la récupération comme une partie de votre entraînement, pas comme une absence d'entraînement. Dormez suffisamment, mangez correctement après l'effort, respectez les jours faciles. Votre corps vous le rendra en performances.`,
    contentEn: `## The training paradox

Here's a counterintuitive truth: you don't improve while running. You improve while recovering.

Training is stress. Each session inflicts micro-trauma on your body: damaged muscle fibers, depleted glycogen stores, taxed nervous system. It's during the rest that follows that the magic happens. Your body doesn't just repair the damage — it overcompensates, becoming a little stronger, a little more enduring than before.

This phenomenon is called supercompensation. But it only works under one condition: giving the body time to complete its rebuilding work. Cutting this process short with a premature new session is building on unfinished foundations.

---

## The two types of recovery

### Active recovery

After intense effort, the blood is loaded with metabolic waste: lactate, hydrogen ions, free radicals. These substances, normal and inevitable, contribute to the feeling of fatigue and muscle stiffness.

Light movement — very slow jogging, low-intensity cycling, walking — accelerates their elimination. Increased blood flow "cleans" the tissues, brings fresh oxygen and nutrients. This is why a 20-30 minute outing in Zone 1 the day after a hard session often recovers better than total rest.

The trick: resist the temptation to speed up. If you turn your active recovery into a real session, you add stress instead of eliminating it.

### Passive recovery

Sometimes, the body needs to do nothing. After particularly violent effort — competition, grueling threshold session, very long run — or in case of accumulated fatigue, complete rest takes precedence.

This means: no running, no intense cross-training, just normal daily activities. Sleep, gentle stretching, maybe a quiet walk. Your body then has all its energy available for reconstruction.

---

## Sleep: your secret weapon

If you could retain only one thing from this article, it would be this: sleep is the most powerful and underestimated recovery factor.

### What happens at night

During deep sleep, your body massively releases growth hormone (GH). This hormone is the conductor of reconstruction: it stimulates protein synthesis, repairs muscle fibers, strengthens tendons, consolidates training adaptations.

The immune system also works at night. Defense cells multiply, inflammation subsides, micro-injuries heal. A runner who sleeps poorly compromises these essential processes.

### The runner's needs

The standard recommendation of 7-8 hours applies to sedentary people. A runner who trains regularly needs more: 8-9 hours to recover optimally. Elite athletes often sleep 9-10 hours, including naps.

Beyond duration, regularity matters. Going to bed and waking up at fixed times synchronizes your biological clock, improving sleep quality even at equal duration.

### Optimizing your sleep

**Environment**: cool room (64-68°F/18-20°C), dark (blinds or mask), quiet. Body temperature must drop to fall asleep — an overheated room prevents it.

**Screens**: their blue light inhibits melatonin, the sleep hormone. Avoid them at least 30 minutes before bed, ideally an hour.

**Food**: too large or too late a meal disrupts falling asleep. But going to bed on an empty stomach too — a light carbohydrate snack can help.

**Caffeine**: its half-life is 5-6 hours. A coffee at 4pm means caffeine still in your blood at 10pm. Set yourself a limit in early afternoon.

### Warning signs

Chronic sleep deprivation manifests through identifiable symptoms:

- Resting heart rate higher than usual
- Difficulty reaching your usual paces
- Low morale, absent motivation
- Slower recovery between sessions
- Increased susceptibility to infections

If these signs appear, before modifying your training, examine your sleep first.

---

## Recovery nutrition

### The metabolic window

In the 30 to 60 minutes following effort, your body is in a state of particular receptivity. Enzymes that store glycogen are overactivated. Glucose transporters in muscles are at maximum. It's the ideal time to replenish your reserves.

This "anabolic window" isn't a myth — studies confirm it. Missing this window won't prevent you from recovering, but you'll recover more slowly.

### What your body needs

**Carbohydrates** to replenish muscle glycogen. After a long or intense session, your reserves are partially or totally depleted. Medium-high glycemic index carbohydrates (fruits, bread, rice) are well absorbed.

**Protein** to repair damaged muscle fibers. 20-30 grams is enough; more doesn't provide additional immediate benefit.

**Water** to compensate for fluid losses. Sweat also carries electrolytes (sodium, potassium) — a slightly salted drink or salty food helps rehydration.

### Practical examples

A simple post-workout snack:
- A glass of chocolate milk (naturally balanced in carbs/protein)
- A banana with Greek yogurt
- A ham sandwich on whole grain bread
- A fruit + protein powder smoothie

The main meal, 2-3 hours later, can be more complete: pasta or rice, quality protein (chicken, fish, eggs), vegetables, and a source of good fats (olive oil, avocado).

---

## Planning recovery

### At the weekly scale

A well-designed training plan integrates recovery. Out of 5-6 weekly outings, only 2-3 should be truly demanding. The others are easy sessions in Zone 1-2 or complete rest days.

The classic trap: chaining two high-intensity sessions. Your body doesn't have time to adapt between them. A simple rule: always separate VO2max or threshold sessions by at least 48-72 hours.

### At the monthly scale

Accumulating fatigue week after week leads to overtraining. The solution: the recovery week.

Every 3-4 weeks, reduce your training volume by 30-40%. Keep one or two quality sessions but shortened. This controlled break allows the body to "digest" accumulated adaptations.

Runners who neglect recovery weeks stagnate or regress — the exact opposite of what they're seeking by training more.

### At the yearly scale

Even the best need breaks. After a major goal (marathon, important competition), plan 2-4 weeks of active rest: no plan, no goal, just moving for pleasure.

This break regenerates the mind as much as the body. It prevents the psychological wear that accompanies years of continuous training.

---

## Recognizing overtraining

Overtraining isn't simple fatigue. It's a pathological state where your body can no longer recover, even with rest. Getting there takes months of mistakes — and getting out can take months too.

### Physical signs

- Performance that stagnates or regresses despite training
- Persistent fatigue that doesn't disappear after rest
- Resting heart rate abnormally high or low
- Recurring injuries (tendinitis, stress fractures)
- Sleep disorders (insomnia or hypersomnia)
- Loss of appetite, involuntary weight loss
- Frequent infections (weakened immune system)

### Psychological signs

- Motivation in free fall
- Increased irritability
- Concentration difficulties
- Training-related anxiety
- Loss of running enjoyment

### What to do if you recognize yourself

If you have several of these symptoms, the first response is counterintuitive: stop. Not an easy week — a complete running stop for at least 1-2 weeks.

See a sports medicine doctor if symptoms persist. Overtraining can mask other problems (anemia, nutritional deficits, thyroid disorders).

Prevention remains the best strategy: respect recovery weeks, don't increase volume too fast, and above all listen to your body when it asks for rest.

---

## Final word

Recovery isn't weakness, it's intelligence. The runners who progress most aren't those who train hardest — they're those who master the balance between stress and rest.

Integrate recovery as part of your training, not as an absence of training. Sleep enough, eat properly after effort, respect easy days. Your body will repay you in performance.`,
  },
  {
    id: "nutrition",
    slug: "nutrition",
    title: "Nutrition du coureur",
    titleEn: "The Runner's Nutrition",
    description:
      "Alimenter la performance : avant, pendant et après l'effort",
    descriptionEn:
      "Fueling performance: before, during and after effort",
    category: "lifestyle",
    readTime: 12,
    content: `## Courir, c'est brûler

La course à pied est l'une des activités les plus énergivores qui soient. Un coureur de 70 kg brûle environ 700 calories par heure à allure modérée — bien plus que la natation, le vélo ou la musculation. Cette dépense énergétique considérable fait de la nutrition un levier de performance majeur, souvent sous-exploité.

Mal vous alimenter, c'est comme partir en roadtrip avec un réservoir à moitié vide : vous n'irez pas très loin, et l'expérience sera pénible. Bien vous alimenter, c'est disposer du carburant optimal au bon moment — et faire la différence entre une séance subie et une séance maîtrisée.

---

## Avant l'effort : charger sans alourdir

### Le timing est crucial

Votre système digestif et votre système musculaire sont en compétition pour le flux sanguin. Pendant la digestion, le sang afflue vers l'estomac et les intestins. Pendant l'effort, il file vers les muscles. Manger trop près d'une séance crée un conflit : crampes, nausées, inconfort.

La règle générale : plus le repas est copieux, plus il doit être éloigné de l'effort.

**3-4 heures avant** : repas complet normal. C'est votre dernier "vrai" repas avant une séance importante ou une compétition. Privilégiez les glucides complexes (pâtes, riz, pain complet), une source de protéines maigres (poulet, poisson, œufs), des légumes cuits plutôt que crus. Évitez les graisses en excès qui ralentissent la vidange gastrique.

**2-3 heures avant** : repas léger si vous n'avez pas eu le temps de manger plus tôt. Un bol de riz avec un peu de poulet, un sandwich simple, des pâtes avec une sauce légère.

**1-2 heures avant** : collation légère uniquement. Une banane, une compote, quelques biscuits secs. L'estomac doit être pratiquement vide au départ.

**30 minutes - 1 heure avant** : juste de l'eau, ou une petite poignée de fruits secs si vous sentez une légère faim. Rien qui demande une vraie digestion.

### Ce qu'il faut éviter

**Les fibres en excès.** Salades, légumes crus, céréales complètes riches en son — excellents pour la santé au quotidien, problématiques avant l'effort. Ils fermentent dans l'intestin et peuvent provoquer ballonnements, gaz, urgences fâcheuses.

**Les graisses lourdes.** Fromage, friture, viande grasse — leur digestion prend des heures. Elles restent sur l'estomac pendant que vous essayez de courir.

**Les aliments non testés.** Ce n'est pas le matin de la compétition qu'il faut essayer un nouveau gel ou une nouvelle barre. Chaque changement doit être validé à l'entraînement d'abord.

**L'excès de café.** Un café 1-2 heures avant peut améliorer la vigilance et la performance. Trois cafés juste avant le départ risquent de vous rendre nerveux et d'accélérer le transit intestinal.

---

## Pendant l'effort : maintenir le moteur

### Efforts courts (moins d'une heure)

Pour une sortie de moins de 60 minutes, votre corps dispose de suffisamment de réserves. L'eau suffit — et encore, par temps frais et pour une sortie facile, même l'eau n'est pas indispensable.

### Efforts modérés (1-2 heures)

L'hydratation devient importante. Buvez régulièrement : 150-200 ml toutes les 15-20 minutes, sans attendre d'avoir soif (la soif indique déjà un début de déshydratation).

L'eau pure suffit généralement. Si l'effort est intense ou par forte chaleur, une boisson sportive avec des électrolytes (sodium principalement) aide à maintenir l'équilibre hydrique.

Manger pendant un effort de cette durée est optionnel. Un gel ou quelques fruits secs vers 1h15-1h30 peuvent vous donner un coup de boost, mais ne sont pas indispensables si vous avez correctement mangé avant.

### Efforts longs (plus de 2 heures)

Au-delà de 90 minutes d'effort, vos réserves de glycogène musculaire commencent à s'épuiser. Si vous ne les rechargez pas, vous allez "frapper le mur" — cette sensation brutale où les jambes deviennent du plomb et chaque foulée demande un effort démesuré.

**Glucides à prévoir :** 30-60 grammes par heure d'effort, selon l'intensité et votre tolérance digestive. Cela représente 1-2 gels énergétiques, ou l'équivalent en barres, pâtes de fruits, fruits secs.

**Stratégie de ravitaillement :** commencez à manger tôt, vers 45 minutes d'effort, quand vous vous sentez encore bien. N'attendez pas d'avoir faim — à ce stade, vous êtes déjà en déficit.

**Variez les formats :** certains estomacs supportent mal les gels après plusieurs heures. Alterner gels, barres, bananes, permet de soutenir l'effort sans lasser les papilles.

**Hydratation renforcée :** par temps chaud ou effort très long, passez à une boisson sportive avec électrolytes pour compenser les pertes en sel. Une déshydratation de 2% du poids corporel diminue les performances de 10-20%.

### Le piège du test le jour J

Chaque organisme réagit différemment. Un gel qui passe très bien chez votre partenaire d'entraînement peut vous donner des crampes d'estomac. La seule façon de savoir, c'est de tester à l'entraînement.

Avant une compétition importante, reproduisez exactement votre stratégie de ravitaillement lors d'une sortie longue. Même marques, mêmes quantités, mêmes timings. Pas de mauvaises surprises le jour J.

---

## Après l'effort : reconstruire

### La fenêtre métabolique existe

Dans les 30-60 minutes suivant l'effort, votre corps est en mode reconstruction. Les transporteurs de glucose dans les muscles sont à leur maximum d'activité. Les enzymes de synthèse du glycogène tournent à plein régime. C'est le moment optimal pour ravitailler.

Cette "fenêtre anabolique" n'est pas un mythe commercial — les études le confirment. Manger dans ce créneau n'est pas indispensable (vous récupérerez quand même), mais c'est plus efficace.

### Le ratio idéal

Les études pointent vers un ratio 3:1 ou 4:1 entre glucides et protéines pour une récupération optimale.

**Les glucides** reconstituent le glycogène musculaire. Après une sortie longue ou intense, vos réserves sont vidées — vous partez pour votre prochaine séance avec un réservoir à moitié plein si vous ne les rechargez pas.

**Les protéines** fournissent les briques pour réparer les fibres musculaires endommagées. 20-30 grammes suffisent ; au-delà, l'excès n'apporte pas de bénéfice supplémentaire immédiat.

### Exemples concrets

**Le champion inattendu : le lait chocolaté.** Ce classique des vestiaires n'est pas qu'une tradition — c'est un rapport qualité-prix imbattable. Un grand verre de lait chocolaté apporte ~30g de glucides et ~10g de protéines dans un format liquide facile à absorber. Ajoutez une banane et vous avez une collation de récupération quasi parfaite.

**Autres options efficaces :**
- Yaourt grec + fruits + miel
- Sandwich au thon ou au jambon
- Smoothie fruits + lait + protéine en poudre
- Bol de fromage blanc + céréales

### Le repas principal (2-3 heures après)

La collation de récupération ne remplace pas un vrai repas. Quelques heures après l'effort, prenez un repas complet et équilibré :

- **Glucides complexes** : pâtes, riz, pommes de terre, quinoa
- **Protéines de qualité** : poulet, poisson, œufs, légumineuses
- **Légumes** : pour les vitamines, minéraux et fibres
- **Bonnes graisses** : huile d'olive, avocat, oléagineux

Après un effort très long (marathon, sortie de 3h+), ce repas est particulièrement important. Vos réserves sont profondément entamées — il faut plusieurs repas pour les reconstituer complètement.

---

## L'hydratation au quotidien

### Vos besoins de base

Avant même de penser à l'effort, assurez-vous d'être correctement hydraté au quotidien. Un coureur devrait viser :

- **1,5-2 litres d'eau par jour** en temps normal
- **+500 ml à 1 litre** par heure d'entraînement
- **+30%** par temps chaud ou en altitude

### L'indicateur le plus fiable

Oubliez les calculs complexes. La couleur de vos urines vous dit tout ce que vous avez besoin de savoir :

| Couleur | Interprétation |
|---------|----------------|
| Transparente | Légère surhydratation possible |
| Jaune pâle | Parfait |
| Jaune foncé | Commencez à boire |
| Ambre/orange | Déshydratation significative |

Le premier réflexe au réveil et avant chaque séance : vérifier votre urine. Partir s'entraîner avec une urine foncée, c'est partir avec un handicap.

### Les électrolytes

L'eau seule ne suffit pas toujours. La sueur emporte des sels minéraux — principalement du sodium, mais aussi du potassium et du magnésium. Lors d'efforts longs (>2h) ou par forte chaleur, ces pertes peuvent devenir significatives.

Une boisson sportive, un comprimé d'électrolytes dans votre gourde, ou simplement des aliments légèrement salés après l'effort permettent de compenser.

---

## Les erreurs classiques

### Manger trop juste avant

L'estomac plein qui fait "splash" à chaque foulée, c'est non seulement inconfortable mais aussi inefficace. Ce que vous mangez 30 minutes avant ne sera pas digéré à temps pour fournir de l'énergie.

### Tester en compétition

Nouveau gel, nouvelle marque, nouvelle stratégie — testez toujours à l'entraînement d'abord. Les troubles digestifs en course transforment une belle journée en calvaire.

### Sous-estimer l'hydratation

Une perte hydrique de seulement 2% du poids corporel diminue les performances de 10-20%. Sur un semi-marathon par temps chaud, c'est la différence entre votre objectif et dix minutes de plus.

### Oublier la fenêtre de récupération

Vous rentrez de votre sortie, prenez une douche, faites deux-trois trucs, et soudain il est 14h. Vous avez raté la fenêtre optimale. Gardez toujours une collation prête pour les minutes qui suivent l'effort.

### Les régimes restrictifs

Certains coureurs, surtout en quête de perte de poids, coupent drastiquement les glucides ou les calories totales. Résultat : fatigue chronique, performances en chute libre, blessures à répétition. Un coureur a besoin de carburant — beaucoup de carburant si l'entraînement est conséquent.

Si la perte de poids est un objectif, le déficit calorique doit être modéré et jamais créé en coupant avant/pendant/après l'entraînement.

---

## En résumé

La nutrition n'est pas accessoire — c'est une variable de performance au même titre que l'entraînement. Bien manger, c'est :

- Planifier vos repas autour de vos séances
- Tester votre stratégie de ravitaillement avant les compétitions
- Ne jamais partir à l'effort sans avoir vérifié votre hydratation
- Profiter de la fenêtre de récupération pour reconstruire
- Écouter votre corps et ajuster en fonction de vos sensations

Chaque coureur est différent. Ces principes sont des bases — à vous de les adapter à votre métabolisme, vos goûts, et vos réactions individuelles.`,
    contentEn: `## Running is burning

Running is one of the most energy-demanding activities there is. A 70 kg runner burns about 700 calories per hour at moderate pace — far more than swimming, cycling, or weight training. This considerable energy expenditure makes nutrition a major performance lever, often underutilized.

Poor nutrition is like starting a road trip with a half-empty tank: you won't get very far, and the experience will be painful. Good nutrition means having optimal fuel at the right time — and making the difference between a suffered session and a mastered one.

---

## Before effort: load without weighing down

### Timing is crucial

Your digestive system and muscular system compete for blood flow. During digestion, blood flows to the stomach and intestines. During effort, it rushes to the muscles. Eating too close to a session creates a conflict: cramps, nausea, discomfort.

The general rule: the larger the meal, the further it should be from the effort.

**3-4 hours before**: normal complete meal. This is your last "real" meal before an important session or competition. Favor complex carbohydrates (pasta, rice, whole grain bread), a source of lean protein (chicken, fish, eggs), cooked vegetables rather than raw. Avoid excess fats that slow gastric emptying.

**2-3 hours before**: light meal if you didn't have time to eat earlier. A bowl of rice with some chicken, a simple sandwich, pasta with light sauce.

**1-2 hours before**: light snack only. A banana, applesauce, some dry cookies. The stomach should be practically empty at start.

**30 minutes - 1 hour before**: just water, or a small handful of dried fruit if you feel slight hunger. Nothing that requires real digestion.

### What to avoid

**Excess fiber.** Salads, raw vegetables, bran-rich whole grains — excellent for daily health, problematic before effort. They ferment in the intestine and can cause bloating, gas, unfortunate emergencies.

**Heavy fats.** Cheese, fried food, fatty meat — their digestion takes hours. They sit on the stomach while you're trying to run.

**Untested foods.** Competition morning isn't the time to try a new gel or bar. Every change should be validated in training first.

**Excess coffee.** A coffee 1-2 hours before can improve alertness and performance. Three coffees right before start risk making you nervous and speeding up intestinal transit.

---

## During effort: keeping the engine running

### Short efforts (less than one hour)

For an outing under 60 minutes, your body has enough reserves. Water is enough — and even water isn't essential for a cool day and easy outing.

### Moderate efforts (1-2 hours)

Hydration becomes important. Drink regularly: 150-200 ml every 15-20 minutes, without waiting to feel thirsty (thirst already indicates early dehydration).

Plain water generally suffices. If effort is intense or in high heat, a sports drink with electrolytes (mainly sodium) helps maintain hydration balance.

Eating during effort of this duration is optional. A gel or some dried fruit around 1h15-1h30 can give you a boost, but isn't essential if you ate properly before.

### Long efforts (more than 2 hours)

Beyond 90 minutes of effort, your muscle glycogen reserves begin to deplete. If you don't replenish them, you'll "hit the wall" — that brutal sensation where legs become lead and every stride demands disproportionate effort.

**Carbs to plan:** 30-60 grams per hour of effort, depending on intensity and your digestive tolerance. That represents 1-2 energy gels, or the equivalent in bars, fruit paste, dried fruit.

**Fueling strategy:** start eating early, around 45 minutes of effort, when you still feel good. Don't wait until you're hungry — at that point, you're already in deficit.

**Vary formats:** some stomachs don't tolerate gels well after several hours. Alternating gels, bars, bananas lets you sustain effort without tiring taste buds.

**Enhanced hydration:** in hot weather or very long effort, switch to a sports drink with electrolytes to compensate for salt losses. A 2% body weight dehydration decreases performance by 10-20%.

### The race day testing trap

Every organism reacts differently. A gel that goes down perfectly for your training partner might give you stomach cramps. The only way to know is to test in training.

Before an important competition, exactly reproduce your fueling strategy during a long run. Same brands, same quantities, same timing. No bad surprises on race day.

---

## After effort: rebuilding

### The metabolic window exists

In the 30-60 minutes following effort, your body is in rebuilding mode. Glucose transporters in muscles are at maximum activity. Glycogen synthesis enzymes are running full throttle. It's the optimal time to refuel.

This "anabolic window" isn't a commercial myth — studies confirm it. Eating in this window isn't essential (you'll recover anyway), but it's more efficient.

### The ideal ratio

Studies point to a 3:1 or 4:1 ratio between carbohydrates and protein for optimal recovery.

**Carbohydrates** replenish muscle glycogen. After a long or intense outing, your reserves are depleted — you start your next session with a half-full tank if you don't reload them.

**Protein** provides the building blocks to repair damaged muscle fibers. 20-30 grams is enough; beyond that, excess doesn't provide additional immediate benefit.

### Concrete examples

**The unexpected champion: chocolate milk.** This locker room classic isn't just tradition — it's unbeatable value. A large glass of chocolate milk provides ~30g carbs and ~10g protein in an easy-to-absorb liquid format. Add a banana and you have a nearly perfect recovery snack.

**Other effective options:**
- Greek yogurt + fruit + honey
- Tuna or ham sandwich
- Fruit + milk + protein powder smoothie
- Cottage cheese bowl + cereal

### The main meal (2-3 hours after)

The recovery snack doesn't replace a real meal. A few hours after effort, have a complete, balanced meal:

- **Complex carbs**: pasta, rice, potatoes, quinoa
- **Quality protein**: chicken, fish, eggs, legumes
- **Vegetables**: for vitamins, minerals and fiber
- **Good fats**: olive oil, avocado, nuts

After very long effort (marathon, 3h+ outing), this meal is particularly important. Your reserves are deeply depleted — it takes several meals to fully replenish them.

---

## Daily hydration

### Your basic needs

Before even thinking about effort, make sure you're properly hydrated daily. A runner should aim for:

- **1.5-2 liters of water per day** normally
- **+500 ml to 1 liter** per hour of training
- **+30%** in hot weather or at altitude

### The most reliable indicator

Forget complex calculations. Your urine color tells you everything you need to know:

| Color | Interpretation |
|-------|----------------|
| Clear | Possible slight overhydration |
| Pale yellow | Perfect |
| Dark yellow | Start drinking |
| Amber/orange | Significant dehydration |

First reflex upon waking and before each session: check your urine. Starting to train with dark urine means starting with a handicap.

### Electrolytes

Water alone isn't always enough. Sweat carries away mineral salts — mainly sodium, but also potassium and magnesium. During long efforts (>2h) or in high heat, these losses can become significant.

A sports drink, an electrolyte tablet in your bottle, or simply slightly salty foods after effort help compensate.

---

## Classic mistakes

### Eating too much right before

A full stomach that goes "splash" with every stride is not only uncomfortable but also ineffective. What you eat 30 minutes before won't be digested in time to provide energy.

### Testing in competition

New gel, new brand, new strategy — always test in training first. Digestive troubles during a race transform a beautiful day into an ordeal.

### Underestimating hydration

A fluid loss of only 2% of body weight decreases performance by 10-20%. In a half-marathon in hot weather, that's the difference between your goal and ten extra minutes.

### Forgetting the recovery window

You come back from your outing, take a shower, do a few things, and suddenly it's 2pm. You've missed the optimal window. Always keep a snack ready for the minutes following effort.

### Restrictive diets

Some runners, especially seeking weight loss, drastically cut carbs or total calories. Result: chronic fatigue, plummeting performance, recurring injuries. A runner needs fuel — lots of fuel if training is substantial.

If weight loss is a goal, the caloric deficit should be moderate and never created by cutting before/during/after training.

---

## In summary

Nutrition isn't an accessory — it's a performance variable just like training. Eating well means:

- Planning your meals around your sessions
- Testing your fueling strategy before competitions
- Never starting effort without checking your hydration
- Taking advantage of the recovery window to rebuild
- Listening to your body and adjusting based on your sensations

Every runner is different. These principles are foundations — it's up to you to adapt them to your metabolism, your tastes, and your individual reactions.`,
  },
  {
    id: "faq",
    slug: "faq",
    title: "Questions fréquentes",
    titleEn: "Frequently Asked Questions",
    description:
      "Réponses aux interrogations courantes des coureurs",
    descriptionEn:
      "Answers to common runner questions",
    category: "fundamentals",
    readTime: 8,
    content: `## Sur les zones d'entraînement

### Ma montre indique Zone 4 mais je me sens en Zone 2. Qui croire ?

Faites confiance à vos sensations. La fréquence cardiaque peut être faussée par de nombreux facteurs : chaleur, stress, fatigue, caféine, position du capteur. Un capteur optique de poignet est particulièrement sujet aux erreurs lors des mouvements répétitifs de la course.

La règle d'or pour la Zone 2 : vous devez pouvoir tenir une conversation normale. Si vous pouvez parler sans effort, vous êtes dans la bonne zone — peu importe ce qu'affiche votre montre.

Avec l'expérience, vous apprendrez à calibrer vos sensations avec vos données. Mais en cas de doute, l'intention de la séance prime sur le chiffre affiché.

### Dois-je rester exactement dans ma zone ?

Non, les zones sont des plages indicatives, pas des cibles au battement près. Être à 3-5 bpm au-dessus ou en-dessous de la limite n'a aucune importance physiologique significative.

Ce qui compte, c'est de respecter l'objectif de la séance. Une sortie "facile" doit vraiment être facile — si vous terminez essoufflé, vous avez raté la cible même si votre montre affichait Z2 tout du long. Une séance "intense" doit vraiment vous solliciter — si vous finissez frais comme une rose, vous n'avez pas assez poussé.

### Comment savoir si mes zones sont bien calibrées ?

Vos zones sont correctes si :
- La Zone 2 vous permet de parler normalement
- La Zone 4 (seuil) vous laisse dire quelques mots, mais pas tenir une conversation
- La Zone 5 (VMA) est tenable 3-6 minutes à fond, pas plus

Si ces correspondances ne collent pas, vos valeurs de référence (FCmax ou VMA) sont probablement inexactes. Refaites un test.

---

## Sur le volume d'entraînement

### Combien de fois par semaine dois-je courir ?

Il n'y a pas de réponse universelle — cela dépend de votre niveau, vos objectifs, et votre récupération.

**Débutants (< 1 an de pratique)** : 2-3 sorties par semaine suffisent. Votre corps n'est pas encore adapté aux contraintes de la course ; lui laisser des jours de récupération entre chaque sortie prévient les blessures.

**Coureurs réguliers** : 3-5 sorties couvrent la plupart des objectifs, du 10 km au marathon. L'important n'est pas le nombre de sorties mais leur distribution : alternez jours durs et jours faciles.

**Coureurs avancés** : 5-7 sorties, parfois avec du biquotidien, permettent d'accumuler du volume sans épuiser le corps. Mais ce niveau demande des années de progression graduelle.

### La règle des 10%, c'est un mythe ou une réalité ?

La règle (n'augmentez pas votre volume hebdomadaire de plus de 10%) est un garde-fou utile, pas une loi physiologique absolue.

Son mérite : elle force la progressivité. Le corps s'adapte aux contraintes, mais il lui faut du temps. Passer de 20 km à 40 km par semaine en deux semaines est une recette pour la blessure.

Sa limite : elle ne tient pas compte de votre historique. Un coureur qui reprend après une blessure, avec 10 ans d'expérience, peut probablement remonter plus vite qu'un débutant absolu.

Utilisez-la comme principe directeur, pas comme règle rigide.

### Quand vais-je voir des progrès ?

Les premiers changements cardiovasculaires apparaissent dès 2-3 semaines d'entraînement régulier. Vous ne le verrez pas forcément sur vos chronos, mais vous sentirez que l'effort devient plus facile.

Les progrès mesurables sur un test ou une course arrivent généralement après 6-12 semaines de travail cohérent. C'est le temps nécessaire aux adaptations musculaires, métaboliques et neuromusculaires.

La patience est cruciale. Les coureurs qui changent de programme toutes les 3 semaines ne laissent jamais le temps aux adaptations de s'installer.

---

## Sur les blessures

### J'ai mal pendant la course. Je continue ou j'arrête ?

Distinguez l'inconfort de la douleur :

**Inconfort** (lourdeur, légère raideur, courbatures) : souvent normal, surtout en début de séance. Continuez en surveillant — ça passe généralement après 10-15 minutes.

**Douleur** (aiguë, localisée, qui augmente ou qui fait boiter) : arrêtez immédiatement. Forcer sur une vraie douleur transforme une blessure légère en blessure grave.

Dans le doute, écoutez votre corps. Une séance manquée par prudence est toujours préférable à des semaines d'arrêt forcé.

### Quand dois-je consulter ?

Consultez un professionnel de santé si :
- La douleur persiste plus de 3-4 jours au repos
- Il y a gonflement, rougeur, chaleur locale
- Vous ne pouvez pas marcher normalement
- La douleur revient systématiquement à la course
- Vous soupçonnez une fracture de fatigue (douleur osseuse localisée)

N'attendez pas que ça s'aggrave. Plus une blessure est prise tôt, plus vite elle guérit.

### Comment éviter les blessures ?

La prévention repose sur quelques principes simples :

**Progresser graduellement.** La majorité des blessures de course viennent d'un volume ou d'une intensité augmentés trop vite.

**Varier les stimuli.** Terrains différents, chaussures différentes (en rotation), allures différentes — la variété répartit les contraintes.

**Renforcement musculaire.** Des ischio-jambiers, quadriceps, mollets et fessiers solides absorbent mieux les chocs. 15-20 minutes de renforcement 2 fois par semaine font une différence énorme.

**Écouter les signaux.** Une légère gêne qui revient à chaque sortie est un avertissement. La traiter à ce stade prend quelques jours ; l'ignorer peut coûter des mois.

---

## Questions pratiques

### Matin ou soir, qu'est-ce qui est mieux ?

Physiologiquement, le soir a un léger avantage : température corporelle plus élevée, articulations plus mobiles, temps de réaction meilleur. Certaines études montrent des performances légèrement supérieures en fin de journée.

Mais la vraie réponse est : le meilleur moment est celui où vous courez réellement. Si vous êtes du matin et que les sorties du soir se transforment en canapé, courez le matin. La constance bat l'optimisation théorique.

### Puis-je courir tous les jours ?

C'est possible, mais avec des précautions :

- Alternez impérativement jours faciles et jours durs
- Au moins 1-2 jours par semaine doivent être très légers ou en cross-training (vélo, natation)
- Écoutez votre corps — la fatigue accumulée se manifeste tôt ou tard

Beaucoup de coureurs prospèrent avec 5-6 jours par semaine et 1-2 jours de repos complet. Le repos fait partie de l'entraînement.

### Comment gérer la chaleur ?

La chaleur est l'ennemie du coureur. Votre corps doit à la fois produire l'énergie pour courir et évacuer la chaleur générée — en été, ces deux besoins entrent en compétition.

**Adaptez vos horaires.** Courez tôt le matin ou tard le soir, quand le soleil est bas et la température plus clémente.

**Réduisez vos attentes.** Vos zones cardiaques montent naturellement de 5-15 bpm par temps chaud. Courir en Z2 l'été peut donner l'allure de Z1 l'hiver — acceptez-le.

**Hydratez-vous plus.** Commencez hydraté, buvez pendant si l'effort dépasse 45 minutes, compensez après.

**Protégez-vous.** Casquette, vêtements clairs et légers, crème solaire sur les zones exposées.

**Soyez patient.** L'acclimatation prend 10-14 jours d'exposition régulière. Les premières sorties par grosse chaleur sont difficiles — ça s'améliore.

### Comment gérer le froid ?

Le froid est moins problématique que la chaleur, mais demande une adaptation vestimentaire.

**Superposez les couches.** Une couche technique près du corps pour évacuer la transpiration, une couche intermédiaire isolante, une couche extérieure coupe-vent si nécessaire. Vous devez avoir légèrement froid au départ — vous vous réchaufferez vite.

**Protégez les extrémités.** Gants, bonnet ou bandeau, chaussettes plus épaisses si besoin. Les mains et les oreilles se refroidissent vite.

**Allongez l'échauffement.** Les muscles froids sont moins souples. Prévoyez quelques minutes supplémentaires avant d'accélérer.

**Gardez le mouvement.** Évitez les longues pauses à l'arrêt pendant les séances. Le refroidissement est rapide quand la transpiration mouille les vêtements.`,
    contentEn: `## On training zones

### My watch shows Zone 4 but I feel like I'm in Zone 2. Who should I trust?

Trust your sensations. Heart rate can be skewed by many factors: heat, stress, fatigue, caffeine, sensor position. A wrist optical sensor is particularly prone to errors during the repetitive movements of running.

The golden rule for Zone 2: you should be able to hold a normal conversation. If you can talk effortlessly, you're in the right zone — regardless of what your watch displays.

With experience, you'll learn to calibrate your sensations with your data. But when in doubt, the session's intention takes precedence over the displayed number.

### Should I stay exactly in my zone?

No, zones are indicative ranges, not beat-precise targets. Being 3-5 bpm above or below the limit has no significant physiological importance.

What matters is respecting the session's objective. An "easy" outing should really be easy — if you finish breathless, you missed the target even if your watch showed Z2 throughout. An "intense" session should really challenge you — if you finish fresh as a daisy, you didn't push enough.

### How do I know if my zones are properly calibrated?

Your zones are correct if:
- Zone 2 lets you talk normally
- Zone 4 (threshold) lets you say a few words, but not hold a conversation
- Zone 5 (VO2max) is sustainable 3-6 minutes at full effort, no more

If these correspondences don't match, your reference values (HRmax or MAS) are probably inaccurate. Redo a test.

---

## On training volume

### How many times per week should I run?

There's no universal answer — it depends on your level, goals, and recovery.

**Beginners (< 1 year of practice)**: 2-3 outings per week are enough. Your body isn't yet adapted to running's demands; giving it recovery days between each outing prevents injuries.

**Regular runners**: 3-5 outings cover most goals, from 10K to marathon. What matters isn't the number of outings but their distribution: alternate hard and easy days.

**Advanced runners**: 5-7 outings, sometimes with doubles, allow accumulating volume without exhausting the body. But this level requires years of gradual progression.

### Is the 10% rule a myth or reality?

The rule (don't increase your weekly volume by more than 10%) is a useful guardrail, not an absolute physiological law.

Its merit: it forces progressivity. The body adapts to demands, but it needs time. Going from 20 km to 40 km per week in two weeks is a recipe for injury.

Its limitation: it doesn't account for your history. A runner returning after injury, with 10 years of experience, can probably ramp up faster than an absolute beginner.

Use it as a guiding principle, not a rigid rule.

### When will I see progress?

The first cardiovascular changes appear as early as 2-3 weeks of regular training. You won't necessarily see it in your times, but you'll feel that effort becomes easier.

Measurable progress on a test or race generally arrives after 6-12 weeks of consistent work. That's the time needed for muscular, metabolic, and neuromuscular adaptations.

Patience is crucial. Runners who change programs every 3 weeks never let adaptations settle.

---

## On injuries

### I'm in pain during the run. Continue or stop?

Distinguish discomfort from pain:

**Discomfort** (heaviness, slight stiffness, soreness): often normal, especially early in a session. Continue while monitoring — it usually passes after 10-15 minutes.

**Pain** (sharp, localized, increasing or causing limping): stop immediately. Forcing through real pain transforms a minor injury into a serious one.

When in doubt, listen to your body. A session missed out of caution is always preferable to weeks of forced rest.

### When should I see a doctor?

See a healthcare professional if:
- Pain persists more than 3-4 days at rest
- There's swelling, redness, local heat
- You can't walk normally
- Pain systematically returns when running
- You suspect a stress fracture (localized bone pain)

Don't wait for it to worsen. The earlier an injury is caught, the faster it heals.

### How do I prevent injuries?

Prevention rests on a few simple principles:

**Progress gradually.** Most running injuries come from volume or intensity increased too quickly.

**Vary stimuli.** Different terrains, different shoes (in rotation), different paces — variety distributes stress.

**Strength training.** Strong hamstrings, quads, calves, and glutes absorb impact better. 15-20 minutes of strengthening twice a week makes an enormous difference.

**Listen to signals.** A slight discomfort that returns every outing is a warning. Treating it at this stage takes a few days; ignoring it can cost months.

---

## Practical questions

### Morning or evening, what's better?

Physiologically, evening has a slight advantage: higher body temperature, more mobile joints, better reaction time. Some studies show slightly superior performance in late day.

But the real answer is: the best time is when you actually run. If you're a morning person and evening outings turn into couch time, run in the morning. Consistency beats theoretical optimization.

### Can I run every day?

It's possible, but with precautions:

- Imperatively alternate easy and hard days
- At least 1-2 days per week should be very light or cross-training (cycling, swimming)
- Listen to your body — accumulated fatigue manifests sooner or later

Many runners thrive with 5-6 days per week and 1-2 days of complete rest. Rest is part of training.

### How do I handle heat?

Heat is the runner's enemy. Your body must both produce energy for running and evacuate generated heat — in summer, these two needs compete.

**Adapt your schedule.** Run early morning or late evening, when the sun is low and temperature more clement.

**Lower your expectations.** Your heart rate zones naturally rise 5-15 bpm in hot weather. Running in Z2 in summer might give winter Z1 pace — accept it.

**Hydrate more.** Start hydrated, drink during if effort exceeds 45 minutes, compensate after.

**Protect yourself.** Cap, light-colored and lightweight clothing, sunscreen on exposed areas.

**Be patient.** Acclimatization takes 10-14 days of regular exposure. First outings in extreme heat are difficult — it improves.

### How do I handle cold?

Cold is less problematic than heat but requires clothing adaptation.

**Layer up.** A technical layer close to the body to wick perspiration, an intermediate insulating layer, an outer wind-breaking layer if needed. You should feel slightly cold at start — you'll warm up quickly.

**Protect extremities.** Gloves, hat or headband, thicker socks if needed. Hands and ears cool down fast.

**Extend warm-up.** Cold muscles are less supple. Plan a few extra minutes before accelerating.

**Keep moving.** Avoid long stationary pauses during sessions. Cooling is rapid when sweat wets clothing.`,
  },
];

// Helper functions
export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(
  category: Article["category"]
): Article[] {
  return articles.filter((a) => a.category === category);
}

export function getAdjacentArticles(
  slug: string
): { prev: Article | null; next: Article | null } {
  const index = articles.findIndex((a) => a.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? articles[index - 1] : null,
    next: index < articles.length - 1 ? articles[index + 1] : null,
  };
}

export const articleCategories: Article["category"][] = [
  "fundamentals",
  "training",
  "lifestyle",
];

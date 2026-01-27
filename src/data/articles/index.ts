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
    title: "Comprendre les 6 zones d'entrainement",
    titleEn: "Understanding the 6 Training Zones",
    description:
      "Pourquoi s'entrainer par zones ameliore vos performances et comment determiner vos propres zones",
    descriptionEn:
      "Why zone-based training improves your performance and how to determine your own zones",
    category: "fundamentals",
    readTime: 8,
    content: `## Pourquoi s'entrainer par zones ?

L'entrainement par zones permet de cibler precisement les adaptations physiologiques souhaitees. Chaque zone sollicite differents systemes energetiques et provoque des adaptations specifiques.

**Avantages de l'entrainement par zones :**
- Progression structuree et mesurable
- Prevention du surentrainement
- Optimisation du temps d'entrainement
- Recuperation adaptee

---

## Les 6 zones d'entrainement

### Zone 1 - Recuperation (50-60% FCmax)

**Sensation :** Effort tres leger, conversation facile
**Physiologie :** Utilisation predominante des graisses, regeneration musculaire
**Benefices :** Recuperation active, augmentation du flux sanguin
**Exemples :** Footing de recuperation, marche rapide

### Zone 2 - Endurance (60-70% FCmax)

**Sensation :** Effort modere, conversation possible
**Physiologie :** Developpement de la base aerobie, efficacite des mitochondries
**Benefices :** Endurance fondamentale, economie de course
**Exemples :** Sortie longue, footing facile

### Zone 3 - Tempo (70-80% FCmax)

**Sensation :** Effort soutenu, phrases courtes possibles
**Physiologie :** Amelioration du seuil aerobie
**Benefices :** Vitesse de croisiere, endurance musculaire
**Exemples :** Allure marathon, tempo run

### Zone 4 - Seuil (80-90% FCmax)

**Sensation :** Effort difficile, quelques mots seulement
**Physiologie :** Travail au seuil lactique, tolerance a l'acide lactique
**Benefices :** Vitesse au seuil, capacite a maintenir l'effort
**Exemples :** Seances au seuil, allure 10km

### Zone 5 - VMA (90-95% FCmax)

**Sensation :** Effort tres intense, respiration difficile
**Physiologie :** VO2max, puissance aerobie maximale
**Benefices :** Vitesse maximale aerobie, puissance
**Exemples :** Intervalles courts, fractionne 30/30

### Zone 6 - Sprint (95-100% FCmax)

**Sensation :** Effort maximal, quelques secondes seulement
**Physiologie :** Systeme anaerobie alactique, puissance pure
**Benefices :** Vitesse de pointe, coordination neuromusculaire
**Exemples :** Sprints, cotes courtes

---

## Comment determiner ses zones ?

### Methode 1 : Test de terrain

Le test le plus fiable est un test VMA ou un test d'effort en laboratoire. Plusieurs protocoles existent :
- **Test demi-Cooper** : courir le plus loin possible en 6 minutes
- **Test VAMEVAL** : test progressif sur piste
- **Test 5 minutes** : courir le plus loin possible

### Methode 2 : Formule FCmax

Une estimation rapide : **FCmax = 220 - age**

Cette formule est approximative (ecart-type de 10-12 bpm). Pour plus de precision, effectuez un test terrain.

### Methode 3 : Perception de l'effort

L'echelle de Borg (RPE 1-10) peut completer les donnees cardiaques :
- Z1 : RPE 2-3
- Z2 : RPE 3-4
- Z3 : RPE 5-6
- Z4 : RPE 7-8
- Z5 : RPE 8-9
- Z6 : RPE 10

---

## Personnalisez vos zones

Utilisez notre calculateur pour determiner vos zones personnalisees basees sur votre FCmax et/ou VMA.`,
    contentEn: `## Why Train by Zones?

Zone-based training allows you to precisely target desired physiological adaptations. Each zone engages different energy systems and triggers specific adaptations.

**Benefits of zone training:**
- Structured and measurable progression
- Overtraining prevention
- Optimized training time
- Appropriate recovery

---

## The 6 Training Zones

### Zone 1 - Recovery (50-60% HRmax)

**Sensation:** Very light effort, easy conversation
**Physiology:** Predominant fat utilization, muscle regeneration
**Benefits:** Active recovery, increased blood flow
**Examples:** Recovery jog, brisk walking

### Zone 2 - Endurance (60-70% HRmax)

**Sensation:** Moderate effort, conversation possible
**Physiology:** Aerobic base development, mitochondrial efficiency
**Benefits:** Fundamental endurance, running economy
**Examples:** Long run, easy jog

### Zone 3 - Tempo (70-80% HRmax)

**Sensation:** Sustained effort, short sentences possible
**Physiology:** Aerobic threshold improvement
**Benefits:** Cruising speed, muscular endurance
**Examples:** Marathon pace, tempo run

### Zone 4 - Threshold (80-90% HRmax)

**Sensation:** Hard effort, only a few words
**Physiology:** Lactate threshold work, acid tolerance
**Benefits:** Threshold speed, sustained effort capacity
**Examples:** Threshold sessions, 10K pace

### Zone 5 - VO2max (90-95% HRmax)

**Sensation:** Very intense effort, difficult breathing
**Physiology:** VO2max, maximal aerobic power
**Benefits:** Maximal aerobic speed, power
**Examples:** Short intervals, 30/30 workouts

### Zone 6 - Sprint (95-100% HRmax)

**Sensation:** Maximum effort, only a few seconds
**Physiology:** Alactic anaerobic system, pure power
**Benefits:** Top speed, neuromuscular coordination
**Examples:** Sprints, short hills

---

## How to Determine Your Zones?

### Method 1: Field Test

The most reliable test is a VO2max test or lab effort test. Several protocols exist:
- **Half-Cooper test**: run as far as possible in 6 minutes
- **VAMEVAL test**: progressive track test
- **5-minute test**: run as far as possible

### Method 2: HRmax Formula

A quick estimate: **HRmax = 220 - age**

This formula is approximate (standard deviation of 10-12 bpm). For more accuracy, perform a field test.

### Method 3: Perceived Effort

The Borg scale (RPE 1-10) can complement heart rate data:
- Z1: RPE 2-3
- Z2: RPE 3-4
- Z3: RPE 5-6
- Z4: RPE 7-8
- Z5: RPE 8-9
- Z6: RPE 10

---

## Personalize Your Zones

Use our calculator to determine your personalized zones based on your HRmax and/or VO2max.`,
  },
  {
    id: "testing-vma",
    slug: "testing-vma",
    title: "Comment determiner sa VMA et FCmax",
    titleEn: "How to Determine Your VO2max and HRmax",
    description:
      "Tests de terrain et formules pour connaitre vos valeurs de reference",
    descriptionEn:
      "Field tests and formulas to know your reference values",
    category: "fundamentals",
    readTime: 10,
    content: `## Qu'est-ce que la VMA ?

La **Vitesse Maximale Aerobie (VMA)** est la vitesse de course a laquelle votre consommation d'oxygene atteint son maximum (VO2max). C'est un indicateur cle de votre potentiel aerobie.

**Pourquoi c'est important :**
- Base de calcul pour toutes les allures d'entrainement
- Indicateur de progression objectif
- Permet de personnaliser les seances

---

## Qu'est-ce que la FCmax ?

La **Frequence Cardiaque Maximale (FCmax)** est le nombre maximal de battements par minute que votre coeur peut atteindre. Elle sert de reference pour definir vos zones cardiaques.

**Caracteristiques :**
- Genetiquement determinee (varie peu avec l'entrainement)
- Diminue avec l'age (environ 1 bpm/an)
- Individuelle (les formules sont des moyennes)

---

## Tests de terrain pour la VMA

### Test demi-Cooper (6 minutes)

**Protocole :**
1. Echauffement de 15-20 minutes
2. Courir le plus loin possible pendant 6 minutes
3. Noter la distance parcourue

**Calcul :** VMA = Distance (m) / 100

**Exemple :** 1500m en 6 min = VMA 15 km/h

### Test VAMEVAL

**Protocole :**
1. Sur piste de 400m avec plots tous les 20m
2. Depart a 8 km/h, augmentation de 0.5 km/h/minute
3. Signal sonore pour maintenir l'allure
4. Test jusqu'a epuisement

**VMA :** Dernier palier complete

### Test 5 minutes

**Protocole :**
1. Echauffement complet
2. Courir a allure maximale tenable pendant 5 min
3. Noter la distance

**Calcul :** VMA = Distance (m) x 12 / 1000

### Test 1500m ou 2000m

**Protocole :**
1. Echauffement complet
2. Courir la distance le plus vite possible
3. Noter le temps

**Calcul 1500m :** VMA = 1500 / (temps en secondes) x 3.6
**Calcul 2000m :** VMA = 2000 / (temps en secondes) x 3.6

---

## Estimation de la FCmax

### Formule classique

**FCmax = 220 - age**

Simple mais peu precise (ecart-type +/- 12 bpm)

### Formule de Tanaka (plus fiable)

**FCmax = 208 - (0.7 x age)**

### Test terrain pour FCmax

**Protocole :**
1. Echauffement progressif de 20 min
2. Enchainer 3-4 cotes de 2-3 min a allure croissante
3. Sprint final sur la derniere cote
4. Verifier le pic FC sur votre montre

**Important :** Ce test est exigeant. Ne le faites que si vous etes en bonne sante et habitue a l'effort intense.

---

## Seances d'evaluation dans Zoned

Consultez nos seances de la categorie "Evaluation" pour des protocoles de test structures :
- Test VMA 6 minutes
- Test VMA piste
- Test FCmax progressif

---

## Conseils pratiques

1. **Reposez-vous** avant un test (48h sans seance intense)
2. **Echauffez-vous** correctement (15-20 min progressif)
3. **Conditions ideales** : pas trop chaud, surface plane
4. **Repetez** le test tous les 2-3 mois pour suivre la progression
5. **Soyez honnete** : un test mal execute fausse toutes vos zones`,
    contentEn: `## What is VO2max Speed?

**Maximal Aerobic Speed (MAS)** is the running speed at which your oxygen consumption reaches its maximum (VO2max). It's a key indicator of your aerobic potential.

**Why it matters:**
- Base for calculating all training paces
- Objective progression indicator
- Allows personalized sessions

---

## What is HRmax?

**Maximum Heart Rate (HRmax)** is the maximum number of beats per minute your heart can reach. It serves as a reference for defining your heart rate zones.

**Characteristics:**
- Genetically determined (varies little with training)
- Decreases with age (about 1 bpm/year)
- Individual (formulas are averages)

---

## Field Tests for VO2max Speed

### Half-Cooper Test (6 minutes)

**Protocol:**
1. Warm up for 15-20 minutes
2. Run as far as possible for 6 minutes
3. Note the distance covered

**Calculation:** MAS = Distance (m) / 100

**Example:** 1500m in 6 min = MAS 15 km/h

### VAMEVAL Test

**Protocol:**
1. On a 400m track with cones every 20m
2. Start at 8 km/h, increase 0.5 km/h/minute
3. Audio signal to maintain pace
4. Test until exhaustion

**MAS:** Last completed level

### 5-Minute Test

**Protocol:**
1. Complete warm-up
2. Run at maximum sustainable pace for 5 min
3. Note the distance

**Calculation:** MAS = Distance (m) x 12 / 1000

### 1500m or 2000m Test

**Protocol:**
1. Complete warm-up
2. Run the distance as fast as possible
3. Note the time

**1500m Calculation:** MAS = 1500 / (time in seconds) x 3.6
**2000m Calculation:** MAS = 2000 / (time in seconds) x 3.6

---

## Estimating HRmax

### Classic Formula

**HRmax = 220 - age**

Simple but imprecise (standard deviation +/- 12 bpm)

### Tanaka Formula (more reliable)

**HRmax = 208 - (0.7 x age)**

### Field Test for HRmax

**Protocol:**
1. Progressive warm-up of 20 min
2. Chain 3-4 hills of 2-3 min at increasing pace
3. Final sprint on the last hill
4. Check peak HR on your watch

**Important:** This test is demanding. Only do it if you're healthy and used to intense effort.

---

## Assessment Sessions in Zoned

Check our "Assessment" category sessions for structured test protocols:
- 6-minute VO2max test
- Track VO2max test
- Progressive HRmax test

---

## Practical Tips

1. **Rest** before a test (48h without intense session)
2. **Warm up** properly (15-20 min progressive)
3. **Ideal conditions**: not too hot, flat surface
4. **Repeat** the test every 2-3 months to track progress
5. **Be honest**: a poorly executed test skews all your zones`,
  },
  {
    id: "warmup",
    slug: "warmup",
    title: "Guide de l'echauffement",
    titleEn: "Warm-up Guide",
    description:
      "Structure d'un bon echauffement et erreurs a eviter",
    descriptionEn:
      "Structure of a good warm-up and mistakes to avoid",
    category: "training",
    readTime: 6,
    content: `## Pourquoi s'echauffer ?

L'echauffement prepare le corps a l'effort en :
- Augmentant la temperature musculaire
- Activant le systeme cardiovasculaire
- Preparant les articulations
- Optimisant la coordination neuromusculaire

**Un bon echauffement reduit le risque de blessure de 50%** selon les etudes.

---

## Structure d'un echauffement complet

### 1. Footing leger (10-15 min)

Commencez par un trot lent en Zone 1-2 :
- Respiration facile
- Augmentation progressive du rythme
- Attention a la posture

### 2. Gammes athletiques (5-10 min)

Exercices educatifs pour activer les muscles :
- **Montees de genoux** : 2x20m
- **Talons-fesses** : 2x20m
- **Pas chasses** : 2x20m de chaque cote
- **Jambes tendues** : 2x20m
- **Foulees bondissantes** : 2x20m

### 3. Accelerations progressives (3-5 min)

Preparez-vous a l'intensite de la seance :
- 3-4 accelerations de 60-80m
- Commencez a 60% et terminez a 90%
- Recuperation complete entre chaque

---

## Duree selon le type de seance

| Type de seance | Duree echauffement |
|----------------|-------------------|
| Footing facile | 5-10 min (demarre lentement) |
| Sortie longue | 10-15 min |
| Seance tempo | 15-20 min |
| Fractionne VMA | 20-25 min |
| Competition | 25-30 min |

---

## Erreurs courantes a eviter

### 1. Etirements statiques avant l'effort

Les etirements statiques **reduisent temporairement la force musculaire**. Reservez-les pour apres la seance.

### 2. Echauffement trop court

Sauter les gammes ou les accelerations laisse vos muscles mal prepares pour l'effort intense.

### 3. Echauffement trop intense

Si vous etes deja essouffle avant la seance, c'est trop. L'echauffement doit etre progressif.

### 4. Pas assez de temps avant une course

En competition, l'echauffement doit se terminer 5-10 minutes avant le depart (pas 30 min avant).

---

## Conseils pratiques

- **Par temps froid** : prolongez l'echauffement de 5-10 min
- **Par temps chaud** : reduisez l'intensite, hydratez-vous
- **Le matin** : ajoutez quelques minutes, le corps est plus raide
- **Avant un fractionne** : incluez 2-3 accelerations a l'allure cible`,
    contentEn: `## Why Warm Up?

Warming up prepares the body for effort by:
- Increasing muscle temperature
- Activating the cardiovascular system
- Preparing joints
- Optimizing neuromuscular coordination

**A good warm-up reduces injury risk by 50%** according to studies.

---

## Structure of a Complete Warm-up

### 1. Light Jogging (10-15 min)

Start with a slow jog in Zone 1-2:
- Easy breathing
- Progressive pace increase
- Attention to posture

### 2. Athletic Drills (5-10 min)

Educational exercises to activate muscles:
- **High knees**: 2x20m
- **Butt kicks**: 2x20m
- **Lateral shuffles**: 2x20m each side
- **Straight leg runs**: 2x20m
- **Bounding strides**: 2x20m

### 3. Progressive Accelerations (3-5 min)

Prepare for the session's intensity:
- 3-4 accelerations of 60-80m
- Start at 60% and finish at 90%
- Complete recovery between each

---

## Duration by Session Type

| Session Type | Warm-up Duration |
|--------------|------------------|
| Easy run | 5-10 min (start slowly) |
| Long run | 10-15 min |
| Tempo session | 15-20 min |
| VO2max intervals | 20-25 min |
| Competition | 25-30 min |

---

## Common Mistakes to Avoid

### 1. Static Stretching Before Effort

Static stretches **temporarily reduce muscle strength**. Save them for after the session.

### 2. Too Short Warm-up

Skipping drills or accelerations leaves your muscles unprepared for intense effort.

### 3. Too Intense Warm-up

If you're already out of breath before the session, it's too much. Warm-up should be progressive.

### 4. Not Enough Time Before a Race

In competition, warm-up should end 5-10 minutes before start (not 30 min before).

---

## Practical Tips

- **In cold weather**: extend warm-up by 5-10 min
- **In hot weather**: reduce intensity, stay hydrated
- **In the morning**: add a few minutes, body is stiffer
- **Before intervals**: include 2-3 accelerations at target pace`,
  },
  {
    id: "recovery",
    slug: "recovery",
    title: "Recuperation et repos",
    titleEn: "Recovery and Rest",
    description:
      "L'importance de la recuperation et comment optimiser votre repos",
    descriptionEn:
      "The importance of recovery and how to optimize your rest",
    category: "lifestyle",
    readTime: 7,
    content: `## L'importance de la recuperation

La progression se fait pendant la recuperation, pas pendant l'entrainement. L'effort cree un stress, le repos permet l'adaptation.

**Sans recuperation adequate :**
- Stagnation des performances
- Risque accru de blessure
- Fatigue chronique
- Baisse de motivation

---

## Recuperation active vs passive

### Recuperation active

Mouvement leger pour accelerer la regeneration :
- Footing tres lent (Z1)
- Velo a faible intensite
- Natation legere
- Marche

**Avantages :** Favorise la circulation sanguine, elimine les dechets metaboliques

### Recuperation passive

Repos complet :
- Sommeil
- Sieste
- Relaxation
- Etirements doux

**Quand privilegier :** Apres des seances tres intenses ou en cas de fatigue importante

---

## Sommeil : le pilier de la recuperation

Le sommeil est le moment ou votre corps se regenere le plus efficacement.

**Recommandations pour les coureurs :**
- **7-9 heures** par nuit minimum
- **Regularite** des horaires de coucher/lever
- **Qualite** : chambre fraiche, sombre, sans ecrans

**Signes de manque de sommeil :**
- FC au repos elevee
- Difficulte a atteindre les allures habituelles
- Motivation en berne
- Recuperation plus lente

---

## Nutrition et recuperation

### La fenetre metabolique (30-60 min post-effort)

Le corps est particulierement receptif juste apres l'effort :
- **Glucides** : reconstituer les reserves de glycogene
- **Proteines** : reparer les fibres musculaires
- **Hydratation** : compenser les pertes

**Collation type :** Banane + yaourt ou pain + fromage blanc

### Hydratation quotidienne

- **1.5-2L d'eau** par jour minimum
- **+500ml-1L** pour chaque heure d'entrainement
- Surveillez la couleur de vos urines (jaune clair = bien hydrate)

---

## Signes de surentrainement

Soyez attentif a ces signaux d'alarme :

**Physiques :**
- Fatigue persistante malgre le repos
- Performances en baisse
- Blessures a repetition
- Troubles du sommeil
- Perte d'appetit ou de poids

**Mentaux :**
- Perte de motivation
- Irritabilite
- Difficulte de concentration
- Anxiete liee a l'entrainement

**Que faire :** Reduire le volume de 50%, prendre 3-7 jours de repos complet si necessaire

---

## Planifier la recuperation

### Dans la semaine

- 1-2 jours de repos complet
- Alterner seances intenses et faciles
- Ne jamais enchainer 2 seances VMA

### Dans le mois

- 1 semaine allegee toutes les 3-4 semaines
- Volume reduit de 30-40%
- Intensite reduite ou supprimee

### Dans l'annee

- 2-4 semaines de coupure totale
- Periode de transition apres les objectifs`,
    contentEn: `## The Importance of Recovery

Progression happens during recovery, not during training. Effort creates stress, rest allows adaptation.

**Without adequate recovery:**
- Performance stagnation
- Increased injury risk
- Chronic fatigue
- Decreased motivation

---

## Active vs Passive Recovery

### Active Recovery

Light movement to accelerate regeneration:
- Very slow jogging (Z1)
- Low-intensity cycling
- Easy swimming
- Walking

**Benefits:** Promotes blood circulation, eliminates metabolic waste

### Passive Recovery

Complete rest:
- Sleep
- Napping
- Relaxation
- Gentle stretching

**When to prioritize:** After very intense sessions or significant fatigue

---

## Sleep: The Recovery Pillar

Sleep is when your body regenerates most effectively.

**Recommendations for runners:**
- **7-9 hours** per night minimum
- **Consistency** in sleep/wake schedules
- **Quality**: cool, dark room, no screens

**Signs of sleep deprivation:**
- Elevated resting HR
- Difficulty reaching usual paces
- Low motivation
- Slower recovery

---

## Nutrition and Recovery

### The Metabolic Window (30-60 min post-effort)

The body is particularly receptive right after effort:
- **Carbohydrates**: replenish glycogen stores
- **Proteins**: repair muscle fibers
- **Hydration**: compensate for losses

**Typical snack:** Banana + yogurt or bread + cottage cheese

### Daily Hydration

- **1.5-2L of water** per day minimum
- **+500ml-1L** for each hour of training
- Monitor urine color (light yellow = well hydrated)

---

## Signs of Overtraining

Watch for these warning signs:

**Physical:**
- Persistent fatigue despite rest
- Declining performance
- Recurring injuries
- Sleep disorders
- Loss of appetite or weight

**Mental:**
- Loss of motivation
- Irritability
- Difficulty concentrating
- Training-related anxiety

**What to do:** Reduce volume by 50%, take 3-7 days of complete rest if necessary

---

## Planning Recovery

### Weekly

- 1-2 complete rest days
- Alternate intense and easy sessions
- Never chain 2 VO2max sessions

### Monthly

- 1 lighter week every 3-4 weeks
- Volume reduced by 30-40%
- Intensity reduced or removed

### Yearly

- 2-4 weeks of complete break
- Transition period after goal events`,
  },
  {
    id: "nutrition",
    slug: "nutrition",
    title: "Nutrition du coureur",
    titleEn: "Runner's Nutrition",
    description:
      "Quoi manger avant, pendant et apres l'effort",
    descriptionEn:
      "What to eat before, during and after exercise",
    category: "lifestyle",
    readTime: 8,
    content: `## Avant l'effort

### Timing

| Delai avant seance | Type d'alimentation |
|-------------------|---------------------|
| 3-4h | Repas complet normal |
| 2-3h | Repas leger (glucides complexes) |
| 1-2h | Collation legere |
| 30min-1h | Petit snack si necessaire |

### Quoi manger

**3-4h avant :**
- Pates, riz, pain complet
- Proteines maigres (poulet, poisson)
- Legumes cuits
- Evitez les graisses lourdes

**1-2h avant :**
- Banane, compote
- Pain d'epices, barre de cereales
- Quelques fruits secs

**A eviter avant l'effort :**
- Fibres en exces (risque digestif)
- Aliments gras (digestion lente)
- Nouveaux aliments (testez en entrainement)

---

## Pendant l'effort

### Hydratation

| Duree effort | Hydratation |
|--------------|-------------|
| < 1h | Eau suffit |
| 1-2h | Eau + boisson sportive possible |
| > 2h | Boisson sportive recommandee |

**Quantite :** 150-250ml toutes les 15-20 minutes

### Alimentation solide

Necessaire pour les efforts > 1h30 :
- **Gels energetiques** : 1 toutes les 30-45 min
- **Barres** : plus longues a digerer
- **Fruits secs** : alternative naturelle
- **Pates de fruits** : energie rapide

**Conseil :** Testez vos produits a l'entrainement, jamais en competition !

---

## Apres l'effort

### La fenetre metabolique

Dans les 30-60 minutes post-effort, votre corps absorbe mieux les nutriments.

**Objectifs :**
1. Rehydrater
2. Reconstituer le glycogene (glucides)
3. Reparer les muscles (proteines)

### Collation de recuperation

**Ratio ideal :** 3:1 glucides/proteines

**Exemples :**
- Lait chocolate (naturellement bien equilibre !)
- Banane + yaourt grec
- Sandwich jambon
- Smoothie fruits + proteine

### Repas de recuperation (2-3h apres)

- Glucides complexes (pates, riz, quinoa)
- Proteines de qualite (poulet, poisson, oeufs, legumineuses)
- Legumes (vitamines, mineraux)
- Bonnes graisses (huile d'olive, avocat)

---

## Hydratation quotidienne

### Besoins de base

- **1.5-2L** d'eau par jour
- **+500ml** par heure d'entrainement
- **+30%** par temps chaud

### Indicateurs d'hydratation

| Couleur urine | Etat |
|---------------|------|
| Transparente | Surhydratation possible |
| Jaune clair | Bien hydrate |
| Jaune fonce | Deshydrate |
| Ambre | Deshydratation importante |

### Electrolyts

Importants pour les efforts longs (> 2h) ou par forte chaleur :
- Sodium, potassium, magnesium
- Boissons sportives ou comprimes

---

## Erreurs courantes

1. **Manger trop juste avant** : risque de troubles digestifs
2. **Tester en competition** : toujours valider a l'entrainement
3. **Negliger l'hydratation** : -2% poids en eau = -20% performance
4. **Oublier la recuperation** : la fenetre metabolique est reelle
5. **Regime restrictif** : les coureurs ont besoin de carburant`,
    contentEn: `## Before Exercise

### Timing

| Time before session | Type of food |
|--------------------|--------------|
| 3-4h | Normal complete meal |
| 2-3h | Light meal (complex carbs) |
| 1-2h | Light snack |
| 30min-1h | Small snack if needed |

### What to Eat

**3-4h before:**
- Pasta, rice, whole grain bread
- Lean proteins (chicken, fish)
- Cooked vegetables
- Avoid heavy fats

**1-2h before:**
- Banana, applesauce
- Gingerbread, cereal bar
- Some dried fruits

**Avoid before exercise:**
- Excess fiber (digestive risk)
- Fatty foods (slow digestion)
- New foods (test during training)

---

## During Exercise

### Hydration

| Exercise duration | Hydration |
|-------------------|-----------|
| < 1h | Water is enough |
| 1-2h | Water + sports drink possible |
| > 2h | Sports drink recommended |

**Quantity:** 150-250ml every 15-20 minutes

### Solid Food

Necessary for efforts > 1h30:
- **Energy gels**: 1 every 30-45 min
- **Bars**: longer to digest
- **Dried fruits**: natural alternative
- **Fruit paste**: quick energy

**Tip:** Test your products during training, never in competition!

---

## After Exercise

### The Metabolic Window

In the 30-60 minutes post-effort, your body absorbs nutrients better.

**Goals:**
1. Rehydrate
2. Replenish glycogen (carbohydrates)
3. Repair muscles (proteins)

### Recovery Snack

**Ideal ratio:** 3:1 carbs/protein

**Examples:**
- Chocolate milk (naturally well balanced!)
- Banana + Greek yogurt
- Ham sandwich
- Fruit + protein smoothie

### Recovery Meal (2-3h after)

- Complex carbohydrates (pasta, rice, quinoa)
- Quality proteins (chicken, fish, eggs, legumes)
- Vegetables (vitamins, minerals)
- Good fats (olive oil, avocado)

---

## Daily Hydration

### Basic Needs

- **1.5-2L** of water per day
- **+500ml** per hour of training
- **+30%** in hot weather

### Hydration Indicators

| Urine color | Status |
|-------------|--------|
| Clear | Possible overhydration |
| Light yellow | Well hydrated |
| Dark yellow | Dehydrated |
| Amber | Significant dehydration |

### Electrolytes

Important for long efforts (> 2h) or in hot weather:
- Sodium, potassium, magnesium
- Sports drinks or tablets

---

## Common Mistakes

1. **Eating too much right before**: risk of digestive issues
2. **Testing in competition**: always validate during training
3. **Neglecting hydration**: -2% body weight in water = -20% performance
4. **Forgetting recovery**: the metabolic window is real
5. **Restrictive diet**: runners need fuel`,
  },
  {
    id: "faq",
    slug: "faq",
    title: "Questions frequentes",
    titleEn: "Frequently Asked Questions",
    description:
      "Reponses aux questions les plus courantes sur l'entrainement",
    descriptionEn:
      "Answers to the most common training questions",
    category: "fundamentals",
    readTime: 5,
    content: `## Questions sur les zones

### Comment savoir si je suis dans la bonne zone ?

Utilisez la combinaison de plusieurs indicateurs :
- **Frequence cardiaque** : la plus objective
- **Perception de l'effort** (echelle 1-10)
- **Test de conversation** : pouvez-vous parler ?
- **Respiration** : controlee ou haletante ?

### Ma montre affiche une zone differente de mes sensations, que croire ?

Les sensations sont souvent plus fiables que la montre, surtout pour les zones basses. La FC peut etre influencee par la chaleur, le stress, la fatigue. Avec l'experience, vous apprendrez a calibrer les deux.

### Dois-je rester strictement dans la zone indiquee ?

Non, les zones sont des plages. Etre a +/- 5 bpm de la limite n'est pas un probleme. L'important est de respecter l'intention de la seance : facile = vraiment facile, intense = vraiment intense.

---

## Questions sur la progression

### Combien de fois par semaine dois-je courir ?

| Niveau | Seances/semaine |
|--------|-----------------|
| Debutant | 2-3 |
| Intermediaire | 3-4 |
| Avance | 5-6 |
| Elite | 6-10+ (biquotidien) |

### Quand vais-je voir des progres ?

Les premieres adaptations arrivent en 3-4 semaines. Les progres significatifs sur la VMA prennent 6-12 semaines de travail specifique. La patience est cle !

### Comment augmenter mon volume d'entrainement ?

**Regle des 10%** : n'augmentez pas votre volume hebdomadaire de plus de 10% par semaine. Toutes les 3-4 semaines, faites une semaine allegee.

---

## Questions sur les blessures

### J'ai mal, dois-je courir ?

**Arretez immediatement si :**
- Douleur aigue pendant la course
- Boiterie
- Douleur qui augmente au fil des kilometres

**Consultez un specialiste si :**
- Douleur persistante > 3 jours
- Gonflement, rougeur
- Douleur au repos

### Comment eviter les blessures ?

1. Progresser graduellement (regle des 10%)
2. Echauffement systematique
3. Varier les surfaces et les chaussures
4. Ecouter son corps
5. Renforcement musculaire complementaire

---

## Questions pratiques

### Vaut-il mieux courir le matin ou le soir ?

Les deux ont des avantages :
- **Matin** : metabolisme boostee, seance faite, moins de chaleur en ete
- **Soir** : corps plus echauffe, potentiellement meilleures performances

Le meilleur moment est celui qui vous convient et que vous tiendrez !

### Puis-je courir tous les jours ?

Possible pour les coureurs experimentes, mais :
- Alternez jours faciles et intenses
- Incluez au moins 1 jour de repos actif (velo, natation)
- Ecoutez votre corps

### Comment gerer la chaleur ?

- Courez tot le matin ou tard le soir
- Reduisez l'intensite (les zones montent naturellement)
- Hydratez-vous plus frequemment
- Portez des vetements clairs et respirants
- Acceptez que les performances baissent temporairement`,
    contentEn: `## Questions About Zones

### How do I know if I'm in the right zone?

Use a combination of indicators:
- **Heart rate**: most objective
- **Perceived effort** (scale 1-10)
- **Talk test**: can you speak?
- **Breathing**: controlled or gasping?

### My watch shows a different zone than my sensations, which to trust?

Sensations are often more reliable than the watch, especially for low zones. HR can be influenced by heat, stress, fatigue. With experience, you'll learn to calibrate both.

### Should I stay strictly in the indicated zone?

No, zones are ranges. Being +/- 5 bpm from the limit is not a problem. What matters is respecting the session's intent: easy = really easy, intense = really intense.

---

## Questions About Progression

### How many times per week should I run?

| Level | Sessions/week |
|-------|---------------|
| Beginner | 2-3 |
| Intermediate | 3-4 |
| Advanced | 5-6 |
| Elite | 6-10+ (twice daily) |

### When will I see progress?

First adaptations come in 3-4 weeks. Significant VO2max improvements take 6-12 weeks of specific work. Patience is key!

### How to increase my training volume?

**10% rule**: don't increase your weekly volume by more than 10% per week. Every 3-4 weeks, do a lighter week.

---

## Questions About Injuries

### I'm in pain, should I run?

**Stop immediately if:**
- Sharp pain during running
- Limping
- Pain increasing over kilometers

**See a specialist if:**
- Persistent pain > 3 days
- Swelling, redness
- Pain at rest

### How to avoid injuries?

1. Progress gradually (10% rule)
2. Systematic warm-up
3. Vary surfaces and shoes
4. Listen to your body
5. Complementary strength training

---

## Practical Questions

### Is it better to run morning or evening?

Both have advantages:
- **Morning**: boosted metabolism, session done, less heat in summer
- **Evening**: warmer body, potentially better performance

The best time is what suits you and what you'll stick to!

### Can I run every day?

Possible for experienced runners, but:
- Alternate easy and intense days
- Include at least 1 active rest day (cycling, swimming)
- Listen to your body

### How to manage heat?

- Run early morning or late evening
- Reduce intensity (zones naturally rise)
- Hydrate more frequently
- Wear light, breathable clothing
- Accept that performance temporarily decreases`,
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

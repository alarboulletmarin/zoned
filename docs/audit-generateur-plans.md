# Audit du générateur de plans et des plans prêts à l'emploi

Date : 15 septembre 2026 · Branche : `claude/audit-plan-generator-vj9hcl` · Périmètre : `src/lib/planGenerator/`, `src/data/prebuilt-plans/`, `src/data/plan-methodology.ts`, `scripts/regenerate-prebuilt-plans.ts`.

## 0. Méthode

- Lecture intégrale du moteur (phases, volume, gabarit hebdo, sélection, allures, sortie longue, semaine de course, affûtage, renfo, audit) et du script qui produit les dix plans prêts à l'emploi. Les plans **sont** des sorties brutes du générateur : auditer l'un, c'est auditer l'autre.
- Mesures : deux scripts de session ont rejoué le générateur sur une matrice distance × niveau × durée × jours, et décomposé chaque plan prêt à l'emploi semaine par semaine (km, sortie longue, séances clés, niveau des gabarits, répétitions, part de séances dures). Les tableaux en annexe viennent de là, pas d'une lecture à l'œil.
- Confrontation aux sources : méta-analyses, revues et essais (Bosquet 2007, Wang 2023, Mujika & Padilla 2003, Smyth & Lawlor 2021, Buist 2008, Nielsen 2014, Damsted 2018 et 2019, Impellizzeri 2020, Seiler & Kjerland 2006, Seiler 2010, Stöggl & Sperlich 2014, Casado 2022, Kenneally 2021, Burnley 2022, Billat & Koralsztein 1996, Péronnet & Thibault 1989, Nikolaidis 2020, Beattie 2017, Rønnestad & Mujika 2014, Blagrove 2018, Lauersen 2014, Warden 2014, George 2024) et manuels de référence (Daniels 3e éd., Pfitzinger *Advanced Marathoning* et *Faster Road Racing*, Hansons, Higdon, Koop). Le proxy de la session bloquait le texte intégral des revues ; les chiffres cités proviennent des résumés indexés et des barèmes publiés, recoupés sur plusieurs sources. Un point est signalé comme non vérifié quand c'est le cas.
- Les 124 tests existants de `planGenerator` passaient au moment de l'audit. Le diagnostic (sections 1 à 8) décrit l'état avant correction ; la section 9 donne l'état des corrections.

## 1. Synthèse

**Verdict global.** L'architecture est saine et plus rigoureuse que la plupart des générateurs grand public : périodisation en phases, cibles en km réels, semaines de décharge, step-back de sortie longue, allures dérivées de la VMA, audit de cohérence, renfo périodisé. Les intentions sont bonnes et le plus souvent correctement sourcées. Mais entre le modèle et le plan livré, plusieurs maillons cassent la promesse, et certaines constantes ne tiennent pas face à la littérature. Quatre problèmes sont assez sérieux pour être traités avant tout le reste.

### Les quatre points bloquants (P0)

| # | Problème | Où | Effet concret |
|---|---|---|---|
| 1 | **Les débutants reçoivent des séances clés de niveau intermédiaire, souvent « effort maximal », dès la semaine 1.** Le filtre de charge exige `hard`/`key` alors que presque tous les gabarits débutants sont `moderate` : ils sont éliminés avant le filtre de niveau. | `selector.ts:54`, `selector.ts:200` | 5K débutant « premier 5K, progression douce » : S1 = HIL-001 « 8×100 m en côte effort maximal » (intermédiaire, hard). 10K débutant : idem. Aucun plan débutant de référence (Higdon, NHS Couch-to-5K, Galloway, Daniels *White*) ne contient de séance dure en semaine 1. |
| 2 | **« Retour de blessure » et « Reprise après longue pause » ne progressent pas** (14 → 17 km et 14 → 18 km, en dents de scie), et contiennent des sorties de 53 min issues d'un gabarit intermédiaire `hard` dès la semaine 1, puis un fartlek intermédiaire en semaine 2. Le slot clé reçoit `endurance` comme type *avec* le filtre `hard`. | `index.ts:358-369`, `weeklyVolumeFit.ts:17-27` | Les protocoles publiés (Warden 2014, George 2024, Daniels) démarrent en marche/course, sans intensité pendant au moins 2-3 semaines. Ce sont les deux plans destinés aux personnes les plus fragiles. |
| 3 | **La séance « allure spécifique » d'un 5K est une sortie marathon.** `race_specific` retombe sur la catégorie `tempo` quand aucun gabarit `race_pace` taggé `5k` ne survit aux filtres, et son intensité est codée en dur sur M (allure marathon) quelle que soit la distance. | `selector.ts:222`, `paceEngine.ts:121` | 5K débutant S7 : TMP-019 « Hanson Strength Run, 10-13 km à allure marathon » comme séance spécifique 5K, notée « Allure marathon ». |
| 4 | **L'affûtage marathon descend trop bas à J−14** : 64 % → 41 % → 20 % (hors course), avec une marche de −36 % dès la première semaine. Le commentaire du code annonce « ~75 %, ~58 %, ~40 % », la formule donne 64/41/26. | `constants.ts:88`, `volume.ts:153` | Bosquet 2007 : réduction totale de 41-60 %, progressive. Pfitzinger : 75/60/40. Higdon : 73/53/23. Hansons : 86/42. Aucune source ne descend à 41 % deux semaines avant. |

### Ce qui est correct et doit être conservé

- La structure Base → Build → Peak → Taper, et les durées d'affûtage par distance (1/2/2/3 semaines) : un affûtage d'une semaine sur 5K est la pratique des élites (Spilsbury 2015 : 6 ± 1 j), et trois semaines « disciplinées » sur marathon sont ce qui marche le mieux chez les amateurs (Smyth & Lawlor 2021, 158 000 coureurs).
- Les allures E, T, I en % VMA sont dans les fourchettes de Daniels (E 65-78 %, T 86-90 %, I 96-100 % de vVO₂max) et de l'usage français. Seule M est contestable (3.3).
- Le +10 %/semaine comme *garde-fou* (mais pas comme *pente*, voir 2.2), l'interdiction de coller une séance clé à la sortie longue, l'espacement circulaire des jours : conformes au consensus (Daniels, Pfitzinger, Hansons : 48-72 h entre séances dures).
- Le step-back de sortie longue et le pic 3-4 semaines avant le marathon (Pfitzinger : dernière grosse sortie à J−21).
- L'ordre des qualités par distance : VO₂max en fin de 5K/10K (Pfitzinger *Faster Road Racing* : VO₂max chaque semaine de la seconde moitié), seuil avant VO₂max et allure marathon comme travail spécifique sur marathon (Pfitzinger, Daniels 2Q).
- L'audit de plan (`audit.ts`) et ses seuils, notamment le refus des sauts > 20 % (Damsted 2019 : les sauts de 20-60 % blessent plus dans les trois premières semaines).
- La périodisation du renfo (force → puissance → maintien, 2 puis 1 séance/semaine) : c'est exactement Beattie 2017 et Rønnestad & Mujika 2014.

## 2. Modèle de charge

### 2.1 Distribution des phases : le code ne fait pas ce que la doc annonce

`PHASE_DISTRIBUTION` (`constants.ts:22`) somme à 0,85 (5K, marathon) ou 0,90 (ultra), pas à 1. Le reliquat est versé intégralement à la base (`phases.ts:130`). Résultat mesuré (base/build/peak/taper) :

| Distance | Annoncé | 16 sem. | 24 sem. | 30 sem. |
|---|---|---|---|---|
| 5K | 30/30/25 % | 6/5/4/1 | 10/7/6/1 | 13/9/7/1 |
| Marathon | 40/30/15 % | 7/4/2/3 | **12**/6/3/3 | **15**/8/4/3 |
| Ultra | 50/30/10 % | 8/4/1/3 | 13/6/2/3 | 14/9/4/3 |

- Le plafond « base ≤ 12 semaines pour les plans > 18 semaines » (`phases.ts:111`) est contourné : il s'applique aux pourcentages, puis le reliquat de l'arrondi regonfle la base. Marathon 30 semaines = 15 semaines de base, 4 de peak. La page méthodologie (`plan-methodology.ts:25-66`) affirme le contraire.
- Marathon 10 à 14 semaines : **1 à 2 semaines de peak**, parce que 3 semaines d'affûtage sont retirées d'abord. Chez Pfitzinger la préparation spécifique (allure marathon, VO₂max, courses de préparation) dure 5 à 6 semaines.
- Ultra 14-16 semaines : 1 semaine de peak.

**Recommandation.** Normaliser les pourcentages à 1, appliquer le plafond de 12 semaines *après* l'arrondi, et garantir un minimum absolu de peak (3 semaines marathon, 2 semaines semi/10K) avant de dimensionner la base.

### 2.2 Progression de volume : le +10 % sert de pente, donc les plans plafonnent tôt puis stagnent

Le modèle (`volume.ts:198-200`) monte de +10 % chaque semaine de charge jusqu'au pic, puis ondule entre 93 et 100 %. Marathon intermédiaire 18 semaines (plan prêt à l'emploi), modèle interne :

```
S1 55  S2 61  S3 67  S4 44R  S5 74  S6 75  S7 81  S8 53R  S9 81  S10 75  S11 81  S12 53R  S13 81  S14 75  S15 81  S16 52  S17 33  S18 28
```

Le pic est atteint en semaine 7 sur 18, puis neuf semaines de plateau. Le 5K intermédiaire plafonne en semaine 5 sur 10. Pfitzinger 18/55 monte de 50-58 km à 84-95 km avec le pic en semaine 11 ; Daniels enchaîne des semaines à 0,8 / 0,9 / 1,0 du pic ; ni l'un ni l'autre ne plafonne à mi-plan.

La règle des 10 % n'est de toute façon pas une donnée scientifique : Buist 2008 (essai randomisé, 532 novices) ne trouve aucun effet protecteur d'un programme gradué à 10 % (20,8 % vs 20,3 % de blessés) ; Nielsen 2014 (874 novices) ne voit qu'un signal non significatif au-delà de +30 % ; Damsted 2018 conclut qu'il n'existe pas de preuve compilée d'une association entre variation de charge et blessure. Ce qui est défendable, c'est « éviter les sauts > 20-30 % ». Un plafond, pas une pente.

**Recommandation.** Calculer la pente comme `(pic − départ) / semaines de charge disponibles`, bornée à 10 %, pour que le pic tombe 3-5 semaines avant la course. Garder l'ondulation uniquement au voisinage du pic.

### 2.3 Semaines de décharge

- 65 % du volume précédent (`constants.ts:79`) est justifié par « Mujika », qui traite de l'affûtage, pas des semaines de décharge. Dans les plans de référence, la décharge est bien plus légère : Pfitzinger 18/55, semaines 6 et 10, à ~78-85 % de la semaine précédente ; Higdon Novice 1, step-back tous les trois semaines à 86-92 % ; Daniels ne réduit pas le volume, il tient un palier 3-4 semaines. Aucune étude ne teste un cycle 3:1 ni une réduction de 35 % ; Kiely 2012 et 2018 rappellent que les gabarits de mésocycle à durée fixe ne reposent sur aucune preuve, et Seiler estime que la fréquence exacte des semaines faciles compte peu. À 65 %, la remontée fait +48 à +68 % d'une semaine à l'autre (marathon S4 → S5 : 44 → 74 km), ce que l'audit doit exempter. C'est plus agressif que les sources citées, pas moins.
- **Le plan livré ignore parfois la décharge.** Semi-marathon prêt à l'emploi : S3 39 km → S4 (décharge) 39 km ; S7 42 km → S8 (décharge) 42 km. Les fenêtres des gabarits (`MAX_SHRINK = 0.7`, `MIN_EASY_KM = 3`) empêchent les sorties faciles de descendre alors que la sortie longue est déjà réduite à 70 %. La semaine « récupération » devient une semaine normale sans séances dures.
- **Une décharge tombe régulièrement juste avant l'affûtage** : 10K débutant S8 (décharge) puis S9-S10 (taper) ; semi S12 (décharge) puis S13-S14 ; 5K intermédiaire S8 (décharge), S9 charge, S10 course. Trois semaines allégées d'affilée et une phase de peak effective d'une semaine. Il faut interdire une décharge dans les deux semaines précédant l'affûtage : l'affûtage *est* la décharge.
- Le compteur `consecutiveLoadWeeks` ne connaît que le nombre de semaines, pas la charge. La méthodologie parle de « système basé sur la charge réelle » et cite Gabbett (ACWR) ; il n'y a ni ACWR ni charge dans la décision. Et l'ACWR est aujourd'hui rejeté comme outil de prescription : Impellizzeri 2020 et 2021 (« aucune preuve soutenant son usage… conjecture et surinterprétation »), Lolli 2019 (couplage mathématique), Wang 2020 (le « sweet spot » disparaît quand on retire les valeurs extrêmes). Retirer la citation.

**Recommandation.** Décharge à 80-85 % (ou 75 % pour `finish`), placée aussi avant le bloc spécifique, jamais dans les deux semaines précédant l'affûtage ; la faire réellement livrer (voir 4.4).

### 2.4 Affûtage

Formule `exp(−0,45 × i)` : 64 %, 41 %, 26 % ; semaine de course forcée à 35 % du pic (`constants.ts:95`) et réellement livrée à ~20 % hors course (marathon : 16 km, quatre footings de 25 min).

Ce que disent les sources :
- Bosquet et al. 2007 (méta-analyse, 27 études) : meilleur résultat pour un affûtage de **2 semaines**, volume réduit de **41 à 60 %** au total, **de façon exponentielle/progressive** (plutôt qu'en marche), **intensité et fréquence maintenues**. Mise à jour Wang 2023 (PLOS ONE) : mêmes conclusions, affûtage progressif (SMD −0,51) supérieur à l'affûtage en marche (−0,38).
- Mujika & Padilla 2003 : réduction non linéaire progressive ; l'exponentielle « rapide » (constante de temps 4 j, Banister 1999) surpasse la lente (8 j).
- Pratique : Pfitzinger (marathon) réduit de 20-25 % à J−21, 40 % à J−14, 60 % en semaine de course, soit 75/60/40 ; Higdon Novice 1 : 73/53/23 ; Hansons : 86 % puis 42 % (affûtage de 10 jours) ; élites britanniques (Spilsbury 2015) : 14 ± 8 j sur marathon, volume continu à 53 %.
- Smyth & Lawlor 2021 : chez les amateurs, un affûtage de **3 semaines** monotone donne le gain le plus grand (2,6 %, soit 5 min 32 s), et 64 % des coureurs affûtent trop court ou de façon désordonnée.

La durée de 3 semaines est donc défendable. Ce qui ne l'est pas : la première marche de −36 % (Bosquet et Wang montrent que la marche est moins efficace que la pente), et la semaine J−14 à 41 % que personne ne pratique (fourchette 53-86 %). La semaine de course à 20-35 % est dans la bande basse (Higdon 23 %, Pfitzinger 33-40 %). Pour un 5K, une seule semaine réduite est standard ; pour 10K/semi, 64 % puis 20-25 % est tolérable mais raide.

**Recommandation.** Viser 75-80 / 55-65 / 35-45 % (marathon, hors course), 75 / 45-50 % (semi/10K), 55-60 % (5K), sortir la constante d'un commentaire qui la contredit, et relever `TAPER_WEEK_HEAVY` (`audit.ts:217`, seuil 70 %) à ~85 % pour que l'audit ne contredise pas le nouveau barème.

### 2.5 Cibles de volume hebdomadaire

`WEEKLY_KM_TARGETS` (`constants.ts:110`) est dans les ordres de grandeur des plans de référence pour l'intermédiaire (marathon 55 → 90 km = Pfitzinger 18/55, 50-58 → 84-95 km). Deux exceptions :

- **Le point de départ des débutants est trop haut.** Marathon débutant 40 → 65 km ; Higdon Novice 1 fait 24 → 64 km, Hansons Beginner 19-24 → 93 km. Semi débutant 30 → 50 ; Higdon Half Novice 1 fait 19 → 37 km. 5K débutant 20 → 30 (livré 17 → 22) ; Higdon Novice 5K fait 7 → 13 km et Couch-to-5K démarre à 3 × 8 min de course. Le pic est correct, le départ est celui d'un coureur déjà entraîné, alors que les fiches disent « premier 5K », « premier 10K ».
- **Le profil le plus courant produit un plan que le moteur juge lui-même insuffisant.** Marathon 4 j/semaine « finir », 25 km déclarés, 20 semaines : le multiplicateur `finish` (0,85) et la part par jours (`DAYS_VOLUME_SHARE` 0,78) empilés donnent un pic de **43 km** et une sortie longue de **17 km** (mesuré). L'audit renvoie alors `WEEKLY_VOLUME_TOO_LOW_FOR_DISTANCE` et `LONG_RUN_TOO_SHORT_FOR_DISTANCE`. La cause est la part maximale de sortie longue (40 % marathon) combinée à un plafond de volume trop bas : Higdon fait courir 32 km dans une semaine de 64 km (50 %), Pfitzinger 32-35 km dans 55-88 km. À faible volume, la sortie longue marathon dépasse mécaniquement 40 % de la semaine.

**Recommandation.** Départs débutant : 5K 10-12 km, 10K 13-15 km, semi 20 km, marathon 25 km (Higdon), avec marche/course optionnelle. Marathon 4 jours : relever le plafond `DAYS_VOLUME_SHARE[4]` pour cette distance ou autoriser 45-50 % de part de sortie longue sous ~60 km/semaine.

### 2.6 Sortie longue

Les plafonds absolus (`longRunProgression.ts:46`) sont écrits pour des coureurs loisir et ne s'adaptent pas au volume :

| Cas mesuré | Volume pic | SL pic | Part | Durée |
|---|---|---|---|---|
| Semi avancé, 6 j, compete | 107 km | 19 km | 18 % | ~85 min |
| 5K élite, 7 j | 141 km | 12,5 km | 9 % | ~50 min |
| Marathon intermédiaire, 18 sem. | 80 km | 31 km | 39 % | 205 min |
| Marathon débutant, 4 j, finish | 43 km | 17 km | 40 % | 130 min |

Règles publiées : Daniels, sortie longue ≤ 30 % de la semaine sous 64 km/semaine, puis ≤ min(25 %, **150 min**) ; Hansons, 25-30 % et **≤ 3 h** ; Pfitzinger *Faster Road Racing*, 26 km sur semi à 75-100 km/semaine ; Hansons semi, 19 km à ~80 km/semaine. Deux conséquences :

- **Trop courte quand le volume est élevé.** Un semi-marathonien à 107 km/semaine avec 19 km, ou un 5000 m à 141 km avec 12,5 km, ne correspond à aucune source (Daniels autoriserait 27 km et 35 km). La sortie longue devrait valoir `max(config distance, 25 % du volume)`.
- **Trop longue en temps quand le coureur est lent.** Le moteur raisonne en km sans plafond de durée : 31 km à 6:36/km = 3 h 25 pour l'intermédiaire, et pour un débutant à VMA 12 (E ≈ 7:45/km) la même logique donnerait 4 h. Daniels coupe à 150 min, Hansons à 3 h : ajouter un plafond de durée qui réduit la cible en km pour les allures lentes.

Point mineur : plancher de 8 km pour la sortie longue d'affûtage (`longRunProgression.ts:208`), supérieur au pic de certains plans 5K/10K débutants ; le plafond de part le rattrape par accident.

## 3. Intensité et allures

### 3.1 Le 80/20 annoncé n'est ni implémenté ni respecté, et le code le définit à l'envers

- La méthodologie (`plan-methodology.ts:69-110`) promet « au moins 75 % de tes **séances** en zone facile, maximum 25 % de séances intenses ». C'est une lecture fidèle de Seiler & Kjerland 2006 (75 % / 8 % / 17 % des séances par objectif de séance) et de Seiler 2010 (« ~80 % des **séances** à basse intensité, 2-3 séances dures sur 10-14 »). Mais les constantes `POLARIZED_*` (`constants.ts:276`) ne sont **lues nulle part**.
- Le commentaire de `weekTemplate.ts` affirme que « le 80/20 est une part de *temps*, pas de séances » : c'est l'inverse de Seiler. En temps passé en zone, les élites sont à 85-92 % en Z1 (Seiler & Kjerland ; Kenneally 2021 : 88 / 7 / 4 % chez sept coureurs mondiaux). Appliquer 25 % de *minutes* au-dessus du premier seuil serait bien plus intense que tout ce que font les élites.
- Mesure sur les plans prêts à l'emploi (séances dures / séances de course) : 5K intermédiaire **36 %**, 10K intermédiaire **38 %**, semi **36 %**, base building **38 %**, marathon 31 %, débutants 24-26 %. Aucun plan 4 jours ne respecte l'annonce ; en semaine de charge un plan 4 jours est à 50/50 (2 clés + SL + 1 facile), et c'est ce que l'onglet Stats affiche puisqu'il compte par séance (`PlanStatsSection.tsx:181`).
- Les coureurs de fond bien entraînés sont plus souvent **pyramidaux** que polarisés hors période de compétition (Casado 2022, Kenneally 2018 et 2021), et Burnley, Bearden & Jones 2022 contestent que le polarisé soit optimal. Le moteur, riche en tempo/seuil (marathon 24 sem. : 12 tempos, 5 seuils, 6 spécifiques sur 36 clés), est de fait pyramidal. Ce n'est pas un défaut ; c'est l'étiquette « polarisé » qui ne correspond pas.

**Recommandation.** Garder la définition de Seiler (part de séances), l'appliquer dans le gabarit hebdo (≥ 75 % de séances faciles sur le plan, ce qui pour 4 jours veut dire 1 clé + SL + 2 faciles en base, 2 clés à partir du build, ou compter la sortie longue à finish rapide comme deuxième séance de qualité, comme Daniels), afficher la distribution par zones en temps à titre d'information (`planStats.ts` le calcule déjà), et écrire « pyramidal » dans la méthodologie là où c'est le cas.

### 3.2 % VMA de course : les valeurs sont celles d'un coureur entraîné, et ne dépendent pas de la durée

`VMA_RACE_PERCENTAGES` (`constants.ts:250`, dupliqué dans `paceEngine.ts` et `paceCalculator.ts`) : 5K 97 %, 10K 92 %, semi 82 %, marathon 77 %. Le pourcentage soutenable décroît avec la **durée** de l'effort et dépend de l'endurance du coureur, pas de la distance (Billat & Koralsztein 1996 ; Péronnet & Thibault 1989 : `%VMA = 100 − E × ln(t / 7 min)`, avec un indice d'endurance E ≈ 5 chez l'élite, 6-7 chez le coureur de club, 8 chez le débutant). La « table de Léger-Mercier » (100 % à 7 min, 95 % à 15, 90 % à 30, 85 % à 1 h, 80 % à 2 h) circule sans source primaire retrouvée ; elle correspond à Péronnet-Thibault avec E entre 6 et 8.

| Profil | Prédiction du moteur | Péronnet-Thibault E = 6 | E = 8 |
|---|---|---|---|
| 5K, VMA 10 (débutant) | 30:56 (97 %) | ~33:00 (91 %) | ~34:20 (87 %) |
| 10K, VMA 12 | 54:20 (92 %) | ~57:15 (87 %) | ~60:30 (83 %) |
| Marathon, VMA 15 | 3:39 (77 %) | ~3:32 (80 %) | ~3:55 (72 %) |
| Marathon, VMA 12 | 4:34 (77 %) | ~4:31 (78 %) | ~5:02 (70 %) |

Nikolaidis 2020 (marathon d'Athènes) mesure ~73 % de la VMA chez les finishers sous 4 h et ~61-69 % au-delà. Lecture du tableau : pour un coureur de club (E ≈ 6) le moteur est juste sur marathon et optimiste de 6-7 % sur 5K/10K ; pour un débutant (E ≈ 8) il est optimiste de 7 à 10 % sur toutes les distances. Le 97 % sur 5K n'existe qu'au niveau élite (Péronnet-Thibault E = 5 à 15 min : 96 %). Le biais frappe donc surtout les coureurs lents, c'est-à-dire la cible principale des plans débutant/finir. Il se propage à trois endroits : la prédiction affichée, `goalDemandFactor` (qui sous-détecte les objectifs irréalistes), et le calculateur « VMA depuis un temps de course », qui sous-estime d'autant la VMA (donc toutes les allures) d'un coureur lent.

**Recommandation.** Remplacer la table par distance par une fonction du temps prévu (Péronnet-Thibault avec E dérivé du niveau, ou la courbe de Daniels-Gilbert), résolue par itération, et l'utiliser aux trois endroits.

### 3.3 Allures d'entraînement

`DANIELS_VMA_PERCENTAGES` (`paceEngine.ts:39`) : E 65-75, M 78-80, T 85-88, I 95-100, R 105-110. Converties en % vVO₂max avec l'équation d'économie de Daniels, les zones de Daniels valent E 65-78, M 79-87, T 86-90, I 96-100, R ≈ 102-108.

- E, I : conformes. T : 2 points bas en haut de fourchette (88-90 % chez Daniels), acceptable comme « seuil » au sens français (Lacour 1990 : vitesse à 4 mmol = 87,5 % de la VMA). R : 110 % est une allure de mile d'élite ; 105-108 % suffit pour l'amateur.
- **M fixe à 78-80 % VMA est faux aux deux bouts.** Chez Daniels, M vaut 84-87 % pour un marathonien de 3 h-3 h 30 ; chez un coureur à 4 h 30, l'allure marathon réelle est ~70-73 % (Péronnet-Thibault E = 8, Nikolaidis 2020). Comme `tempo` et `race_specific` sont annotés en M, un marathonien lent reçoit ses séances « allure marathon » 7-10 % trop vite, et un rapide trop lentement. Dériver M du temps prédit (3.2) règle les deux problèmes.
- Les facteurs de charge `ZONE_INTENSITY_FACTORS` (0,5 à 2,0) sont linéaires alors que le TRIMP de Banister est exponentiel ; les séances dures sont un peu sous-pondérées dans `weeklyLoadScore`. Acceptable si documenté.

### 3.4 Ordre des qualités par phase

`KEY_SESSION_TYPES_BY_PROFILE` est une bonne idée et son contenu tient la route face aux sources :

- Profil « short », VO₂max en tête du peak : cohérent avec Pfitzinger *Faster Road Racing* (VO₂max chaque semaine de la seconde moitié, jusqu'à la dernière) ; Daniels met T en premier en phase IV, I en second, c'est une nuance. Ce qui ne tient pas, c'est la rotation avec un tempo marathon (P0 n°3).
- Profil « long » : seuil avant VO₂max, VO₂max en dernier dans le peak, allure marathon comme spécifique : c'est Pfitzinger.
- En revanche, profil « long », base = `["tempo", "fartlek", "hills"]` avec **deux séances clés dès la semaine 1 pendant 8 à 12 semaines** : Pfitzinger n'a qu'une séance de seuil par semaine dans son bloc endurance, Daniels (phase I) ne fait que du volume et des lignes droites. La base du moteur est un build.

## 4. Sélection des séances

### 4.1 Filtre de charge avant filtre de niveau (P0 n°1)

`getLoadFilter("key_quality")` = `["hard", "key"]`. Inventaire du catalogue :

| Catégorie | Gabarits débutant | dont `hard`/`key` |
|---|---|---|
| hills | 2 | 0 |
| fartlek | 2 | 0 |
| tempo | 2 | 0 |
| threshold | 2 | 1 |
| vma | 3 | 0 |
| race_pace | 6 | 0 |

Tout slot clé d'un débutant tombe donc sur un gabarit intermédiaire (tolérance ±1 niveau, `selector.ts:200`). Mesuré sur les quatre plans débutants : **100 % des séances clés** sont des gabarits intermédiaires (`HIL-001`, `FAR-006`, `VMA-019`, `VMA-012`, `TMP-019`, `RP-002`). Symétriquement, les intermédiaires reçoivent `TMP-002` (débutant) quatre fois par plan, parce qu'aucun tempo intermédiaire n'est taggé `base`.

**Recommandation.** Charge attendue par *niveau* (débutant → `moderate`/`hard`, intermédiaire → `hard`, avancé → `key`), et jamais un gabarit d'un niveau au-dessus du coureur pour un slot clé. Compléter le catalogue : tempo/seuil intermédiaires en phase base, clés `hard` de niveau débutant.

### 4.2 Séance spécifique = tempo marathon (P0 n°3)

`race_specific` cherche dans `["race_pace", "tempo"]` puis filtre par tag distance seulement « si ça laisse des candidats » (`selector.ts:222`). Pour un 5K débutant, `RP-017` (5K, débutant, moderate) est éliminé par la charge, `RP-004` (5K, avancé) par le niveau ; il ne reste que des tempos, et `TMP-019` (Hanson, marathon) gagne. Le tag distance doit être un filtre dur pour `race_specific`, avec repli sur un tempo court, jamais sur un gabarit taggé pour une autre distance. Et `sessionTypeToIntensity("race_specific")` doit dépendre de la distance (5K → I, 10K → T, semi → T/M, marathon → M).

### 4.3 Répétition et taille des pools

Marathon 18 semaines : `SL-005` × 7, `SL-001` × 6, `HIL-001` × 4, `TMP-002` × 4. Le pool de sorties longues intermédiaires compte 5 gabarits ; en base, le pool de tempos intermédiaires est vide. Le mécanisme « moins utilisé d'abord » fonctionne ; c'est le catalogue qui manque de largeur là où le moteur en a besoin.

### 4.4 Sorties faciles surdimensionnées sur les petits plans

Pour un slot facile de ~25 min, l'élargissement de bande (`selector.ts:263`, jusqu'à +45 min pour garantir 4 candidats) retient des gabarits de 75-95 min ensuite rétrécis à 70 % (`MAX_SHRINK`), d'où des sorties de 53 min nommées « Extended Base Endurance » en semaine 1 d'un retour de blessure. Le nom, le niveau et la charge du gabarit ne correspondent plus à ce que le coureur fait, et le plancher qui en résulte empêche les semaines de décharge de descendre (2.3).

## 5. Plans prêts à l'emploi, un par un

Les mesures complètes sont en annexe A.

**5K débutant (8 sem., 3 j, finir).** 17 → 22 km, plat. Semaine 1 : 37 min + côtes « effort maximal » + 55 min de sortie longue (6 km, déjà plus que la course). Higdon Novice 5K démarre à 7 km/semaine, plafonne à 13 km et une sortie de 5 km, sans aucune séance dure ; NHS Couch-to-5K fait cinq semaines de marche/course ; Daniels (*White*) ne met que des lignes droites en phase I. Séances clés 100 % intermédiaires. Séance « spécifique » S7 = tempo marathon de 8 km dans une semaine de 22 km. Part de séances dures 26 %.

**10K débutant (10 sem., 3 j, finir).** 21 → 27 km (Higdon Novice 10K : 13 → 21 km, plus longue sortie 9 km, zéro séance dure). HIL-001 en S1. Décharge S8 immédiatement suivie de l'affûtage : trois semaines allégées, une seule semaine de peak. VO₂max (`VMA-020`) en semaine d'affûtage pour un profil « finir ».

**5K intermédiaire (10 sem., 4 j).** 30 → 39 km, pic atteint S5. 36 % de séances dures. Cohérent par ailleurs ; `TMP-002` (débutant) en S1-S2.

**10K intermédiaire (12 sem., 4 j).** 37 → 48 km, progression correcte, clés bien variées (seuil, VO₂max, spécifique 10K). 38 % de séances dures. Cinq gabarits débutants en clé pendant la base. Le plan le plus solide de la série.

**Semi-marathon (14 sem., 4 j).** 40 → 50 km. Base **plate** de S1 à S6 (38-42 km), deux décharges (S4, S8) au **même volume** que la semaine précédente. Décharge S12 puis affûtage : phase peak effective d'une semaine (S11). Sortie longue 19 km à S11 (38 % de la semaine) : bien placée et dans la norme des plans à ~50 km/semaine (Hansons semi : 19 km). Six gabarits débutants en clé.

**Marathon (18 sem., 5 j).** 52 → 80 km, mais pic atteint S7 puis plateau. Sortie longue 31 km à S13 (J−35), 30 km S14, 28 km S15 : trois sorties ≥ 28 km d'affilée à 3 h 05-3 h 25 chacune, plus dense que Pfitzinger (qui espace ses 32 km) et au-delà des plafonds de durée de Daniels (150 min) et Hansons (3 h). Affûtage 46 / 33 / 16 km (57 / 41 / 20 %) : J−14 trop bas (2.4). `HIL-001` × 4 et `TMP-002` × 4 en base. 20 % du temps en séances dures : c'est le plan le mieux équilibré de la série.

**Trail court intermédiaire (14 sem., 4 j, finir).** 38 → 49 km, sortie longue 19,5 km à S10. La distance est dans la norme des plans publiés pour un 30 km (plans commerciaux à 19 km ; Koop : « pas de distance magique », la sortie la plus longue compte peu). Ce qui manque est ailleurs : toutes les sources trail prescrivent la sortie longue **en temps et en D+** (Koop, Salomon, Vert.run : une sortie de 2-3 h sur terrain vallonné, 200-400 m de D+ au début), parce que l'allure varie du simple au double selon le terrain. Ici `elevationGain` n'apparaît que dans une note, aucune cible de D+ ni de durée n'est produite. Décharges S4, S8, S11 puis affûtage : quatre semaines allégées sur les sept dernières. Une seule séance clé par semaine, souvent aucune (S2, S5) : le slot clé « endurance » est retombé en facile.

**Construction de base (12 sem., 4 j).** 28 → 43 km, 38 % de séances dures, `HIL-001` × 4 et `TMP-002` × 4. Pour un plan qui « construit une base aérobie », deux séances dures par semaine dès S1 contredit le titre. Seiler et Daniels (phase I) feraient ici du volume, des lignes droites, un fartlek léger.

**Retour de blessure (8 sem., 3 j).** 14 / 13 / 14 / 9 / 16 / 15 / 10 / 17 km : pas de progression, un fartlek intermédiaire en S2, une sortie de 53 min « hard » en S1. Le modèle interne prévoyait 11 → 17, le plancher des gabarits l'a écrasé. Les protocoles publiés sont unanimes : Warden 2014 (blessure osseuse) démarre par 30 min de marche un jour sur deux en substituant progressivement du footing à 50 % de l'allure habituelle, sans vitesse ni côtes avant le stade 4 ; George 2024 (revue de 50 études) : marche/course, distance avant vitesse ; Daniels : après 4-8 semaines d'arrêt reprendre à 33 % puis 50 % puis 75 %, après plus de 8 semaines « traiter comme un nouveau coureur » ; guides cliniques : 30-50 % du volume antérieur, intensité seulement après retour à ~75 % sans douleur. Ce plan est un plan débutant plat avec un autre nom, et c'est le plus risqué de la série.

**Reprise après longue pause (10 sem., 3 j).** Même diagnostic : 14 → 18 km, plat, fartlek intermédiaire en S2, sortie de 53 min « hard » en S1.

## 6. Renfo

- Périodisation force → puissance → maintien, 2 puis 1 séance/semaine : conforme à Beattie 2017 (2 × 60 min pendant 20 semaines puis 1/semaine) et Rønnestad & Mujika 2014 (2/semaine pour développer, 1 tous les 7-10 jours pour maintenir). 1 séance/semaine en affûtage : soutenu par extrapolation de Rønnestad 2010 et 2011 (maintien à 1/semaine, perte à 1/2 semaines). Bien.
- **Plyométrie introduite en phase peak** (`strengthIntegration.ts:72`), c'est-à-dire dans les 2 à 5 dernières semaines avant la course. Blagrove 2018 fait de la pliométrie sur 6-14 semaines, 2-3 fois/semaine, donc bien avant ; et la règle d'affûtage (Mujika, Rønnestad) est « garder l'intensité, couper les séries, **pas d'exercice nouveau** ». Il faut l'introduire en build et la *maintenir* en peak.
- Plans 3 jours : 2 séances de renfo (`strengthFrequency = 2` quand `daysPerWeek ≤ 3`) sur les jours de repos, soit 5 jours d'activité pour un « premier 5K ». Défendable (Lauersen 2014 : blessures de surutilisation quasi divisées par deux, chiffre tous sports) si le renfo est léger ; `STR-002` (45 min) la veille d'une séance de côtes maximales ne l'est pas.

## 7. Documentation et méthodologie : ce qui est affirmé et faux

| Affirmation (`plan-methodology.ts`) | Réalité |
|---|---|
| « Base 30/35/40/50 % selon la distance » | La base reçoit le reliquat : 45-55 % en pratique. |
| « Plans longs : base plafonnée à 12 semaines » | 15 semaines à 30 sem., 17 à 36 sem. |
| « Au moins 75 % de séances faciles » | 62-64 % sur les plans 4 jours ; constante jamais lue ; commentaire du code qui contredit Seiler. |
| « Système de récupération basé sur la charge réelle (Gabbett) » | Compteur de semaines ; aucune charge ; ACWR réfuté (Impellizzeri 2020). |
| « Volume de départ 85/70/60 % selon la durée » | `getStartingVolume` n'est plus appelée. |
| « 65 %, moins agressif que 60 % (Mujika) » | Mujika ne traite pas des décharges ; Pfitzinger et Higdon déchargent à 78-92 %. |
| « Taper 64/41/26 % » puis « semaine de course à 35 % » | Les deux sont dits ; la réalité livrée est 57/41/20. |
| « Pic de sortie longue 3-4 semaines avant » | Vrai. |
| « +10 % max par semaine, règle d'or » | Vrai comme plafond ; utilisé comme pente ; pas de preuve (Buist 2008). |

## 8. Recommandations priorisées

**P0, à corriger avant de republier les plans prêts à l'emploi**
1. Filtre de charge par niveau dans `selector.ts`, jamais de gabarit d'un niveau supérieur en slot clé ; catalogue : clés `hard` débutant, tempos/seuils intermédiaires taggés `base`.
2. `race_specific` : tag distance en filtre dur, intensité dépendante de la distance.
3. Purposes non-course : retirer `endurance` des `softKeyTypes` (ou basculer le slot en `easy` quand le type tiré est `endurance`), démarrer en marche/course, aucune intensité avant S4 (`return_from_injury`) ou S3 (`beginner_start`), et laisser le modèle de volume (11 → 17) s'appliquer en autorisant des sorties de 20 min sans rétrécir un gabarit de 90.
4. Affûtage : 75-80 / 55-65 / 35-45 (marathon), 75 / 45-50 (semi, 10K), 55-60 (5K) ; corriger le commentaire ; relever `TAPER_WEEK_HEAVY`.

**P1, cohérence du modèle**
5. Pente de volume calculée pour que le pic tombe à J−21/J−35, +10 % en plafond seulement.
6. Pas de décharge dans les deux semaines précédant l'affûtage ; peak ≥ 3 semaines marathon, ≥ 2 semaines semi/10K, calculé avant la base ; décharge à 80-85 % réellement livrée.
7. Sortie longue = `max(table, 25-30 % du volume)`, plafond de durée (150 min route, 3 h marathon), part maximale relevée à 45-50 % sous 60 km/sem. pour le marathon.
8. % VMA de course et allure M dérivés de la durée prévue (Péronnet-Thibault), partagés entre prédiction, `goalDemandFactor` et le calculateur VMA.
9. Départs débutant alignés sur Higdon/NHS (5K 10-12 km, 10K 13-15 km, semi 20 km, marathon 25 km), marche/course en option.
10. Une seule définition du 80/20 (part de séances, Seiler), appliquée dans le gabarit hebdo, affichée telle quelle ; distribution en temps par zones en complément ; « pyramidal » dans la méthodologie.

**P2, finitions**
11. Pliométrie en build, maintien en peak ; renfo à J−1 d'une clé limité à mobilité/gainage.
12. Trail : sorties longues en temps et en D+ ; utiliser `elevationGain` dans la sélection et les cibles.
13. Nettoyer ou brancher les constantes mortes (`POLARIZED_*`, `STARTING_VOLUME_PCT`, `TAPER_VOLUME_REDUCTION`, `PHASE_SESSION_TYPES`, `weekPositions`) ; dédupliquer `VMA_RACE_PERCENTAGES`.
14. Réécrire `plan-methodology.ts` à partir du comportement mesuré, pas des constantes ; retirer Gabbett.
15. Tests de propriété sur le générateur : monotonie de la progression hors décharges, part de séances dures ≤ 25 %, niveau des gabarits ≤ niveau du coureur, pas de décharge à moins de 2 semaines de l'affûtage, sortie longue ≥ 25 % du volume au-delà de 70 km/sem., aucune séance dure avant S4 en retour de blessure.

## 9. Statut des corrections (15 septembre 2026, même branche)

Toutes les recommandations ont été appliquées dans le commit qui suit ce rapport ; les numéros de ligne cités plus haut décrivent l'état *avant* correction.

| Reco | État | Où |
|---|---|---|
| 1. Charge par niveau, jamais au-dessus du niveau en slot clé ; catalogue | Fait | `selector.ts` (`getLoadFilter(slotType, difficulty)`, filtre de niveau descendant) ; tags `base` sur TMP-005, TMP-012, THR-014 |
| 2. `race_specific` par distance | Fait | `selector.ts` (tag distance en filtre dur, repli `RACE_SPECIFIC_FALLBACK`) ; `paceEngine.sessionTypeToIntensity(type, distance)` |
| 3. Purposes non-course | Fait | `PURPOSE_CONFIGS.firstKeySessionWeek` / `walkRunWeeks` ; `index.ts` (plus d'`endurance` en clé, gabarits `walk-run` les premières semaines) ; tag `walk-run` sur REC-002, END-001, END-003 |
| 4. Affûtage | Fait | `TAPER_VOLUME_PCT` et `RACE_WEEK_VOLUME_PCT` par distance (marathon 78 / 60 / 40) ; semaine de course dimensionnée sur la cible (`raceWeek.ts`) ; `TAPER_WEEK_HEAVY` à 85 % |
| 5. Pente de volume calculée | Fait | `volume.ts` (`PEAK_WEEKS_BEFORE_TAPER`, taux = racine n-ième de pic/départ, +10 % en plafond, +3 % en plancher) |
| 6. Décharges et phases | Fait | `NO_RECOVERY_WEEKS_BEFORE_TAPER = 2`, décharge à 82 % (75 % finish) ancrée sur les km livrés (`index.ts`) ; `PHASE_DISTRIBUTION` normalisée, `MIN_PEAK_WEEKS`, `MAX_BASE_WEEKS` appliqué après arrondi (`phases.ts`) |
| 7. Sortie longue | Fait | `longRunProgression.ts` : pic = max(cible distance, 27 % du volume), plafond de durée (`MAX_LONG_RUN_MINUTES`), part max relevée sous 65 km/sem. (`maxLongRunShare`), plancher d'affûtage borné |
| 8. % VMA et allure M selon la durée | Fait | `src/lib/racePerformance.ts` (Péronnet-Thibault, indice d'endurance par niveau) branché sur `predictRaceTime`, `calculateTrainingPaces` (M), `goalCalibration`, `paceCalculator`, `VmaCalculatorPage` |
| 9. Départs débutant | Fait | `WEEKLY_KM_TARGETS` (5K 12 → 25, 10K 15 → 32, semi 22 → 45, marathon 28 → 64) ; départ mis à l'échelle des jours ; `WEEKLY_VOLUME_FLOOR_KM` partagé avec l'audit et appliqué au pic |
| 10. Définition unique de l'intensité | Fait | `weekTemplate.ts` : 1 clé en base (≤ 5 j), 2 en build/peak ; constantes `POLARIZED_*` retirées, `MAX_KEY_SESSION_FRACTION = 0.40` testé ; méthodologie réécrite en « pyramidal » |
| 11. Renfo | Fait | `strengthIntegration.ts` : pliométrie en build, veille de séance dure limitée à mobilité / gainage / prehab |
| 12. Trail | Fait | `sessionBuilder.ts` : cible de D+ (80 % du D+/km de la course) et durée ajustée (+6 min / 100 m) sur la sortie longue |
| 13. Constantes mortes | Fait | `STARTING_VOLUME_PCT`, `TAPER_DECAY_RATE`, `TAPER_VOLUME_REDUCTION`, `PHASE_SESSION_TYPES`, `BASE/BUILD/PEAK_PHASE_PCT`, `VMA_RACE_PERCENTAGES` (3 copies) supprimés |
| 14. Méthodologie | Fait | `plan-methodology.ts` réécrit à partir du comportement, 8 principes, Gabbett retiré ; références de la page mises à jour |
| 15. Tests de propriété | Fait | `generator.properties.test.ts` (11 propriétés sur 11 configurations), `racePerformance.test.ts` |

Plans prêts à l'emploi régénérés (`scripts/regenerate-prebuilt-plans.ts`). Après correction :

| Plan | Volume | SL pic | Séances dures | Clés hors niveau |
|---|---|---|---|---|
| 5K débutant | 12 → 16 km | 6,5 km | 26 % | 0 (était 100 %) |
| 10K débutant | 14 → 19 km | 7,5 km | 28 % | 0 |
| 5K intermédiaire | 30 → 39 km | 12,5 km | 36 % | 0 |
| 10K intermédiaire | 39 → 47 km | 18 km | 32 % | 0 |
| Semi-marathon | 39 → 51 km, décharges à 32 et 37 km | 19 km | 33 % | 0 |
| Marathon | 50 → 81 km, pic S15, affûtage 45 / 38 / 31 km | 29,5 km | 25 % | 0 |
| Trail court | 41 → 49 km | 21 km | 20 % | 0 |
| Construction de base | 28 → 42 km, 1 clé/sem. en base | 16 km | 25 % | 0 |
| Retour de blessure | 12 → 17 km, marche-course S1-S3, aucune séance dure avant S5 | 6,5 km | 13 % | 0 |
| Reprise après longue pause | 12 → 18 km, marche-course S1-S2, aucune séance dure avant S4 | 7 km | 17 % | 0 |

Vérifications : `tsc` propre, 876 tests verts (dont 18 nouveaux), `check:workouts`, `check:i18n`, `check:typography` OK.

## 10. Tests de bout en bout (15 septembre 2026)

Une batterie de session a généré **146 plans** et vérifié sur chacun une trentaine d'invariants, puis a appliqué les mêmes invariants aux dix plans prêts à l'emploi. Les invariants durables sont repris dans `generator.properties.test.ts` (32 tests : 11 propriétés sur onze configurations, 21 cas limites).

**Matrice** : 7 distances × 4 niveaux × 4 fréquences (3 à 6 jours), durée et objectif typiques par distance et par niveau (112 plans).

**Cas limites** (34 plans) : plan de 4 semaines (minimum) et de 52 semaines (maximum) ; marathon en 6 et 8 semaines ; 7 jours par semaine ; marathon débutant sur 3 jours ; 5 km/semaine déclarés pour un 5K ; 150 km/semaine déclarés pour un 5K ; 200 km/semaine déclarés sur 3 jours ; sortie longue déclarée de 40 km pour un 10K, de 0,5 km pour un marathon ; VMA absente, VMA 7, VMA 26 ; objectif irréaliste (sub-3 h avec VMA 13) et objectif très prudent ; trail avec 3 000 m de D+, trail sans D+, marathon avec D+ ; sortie longue le lundi et le mercredi ; renfo 3 fois par semaine sur 3 et sur 7 jours ; deux courses intermédiaires (10K B, semi A) et une course C en semaine 3 ; les trois purposes non-course à leur durée minimale et maximale.

**Invariants** : structure (semaines, phases contiguës, durée d'affûtage par distance, absence d'affûtage et de jour de course hors purpose course), sessions (un seul run par jour, gabarits existants, durées et charges finies, pas de séance clé au-dessus du niveau, pas de clé en semaine de décharge, pas de gabarit marathon en spécifique 5K/10K), espacement (deux clés jamais à un jour d'écart, sortie longue le jour demandé, veille de course au repos, jour de course sur le jour de sortie longue), volume (sauts ≤ 25 %, décharge plus légère que la semaine de charge précédente, jamais de décharge dans les 2 semaines avant l'affûtage, affûtage décroissant et ouvert au-dessus de 50 % du pic, pic atteint dans la seconde moitié des semaines de charge), sortie longue (part de la semaine, durée), renfo (jamais un jour de clé, jamais deux le même jour, léger la veille d'une séance dure), part de séances dures ≤ 40 %, déterminisme (deux générations identiques), et l'audit interne sans erreur bloquante.

**Résultat** : 0 erreur sur 146 plans, 897 tests verts. Six défauts trouvés par la batterie et corrigés dans la foulée :

| Défaut | Correction |
|---|---|
| Sur 3 jours, un gabarit de récupération de 10-15 min (REC-008) était tiré pour une sortie facile de 60 min par la règle « le moins utilisé d'abord », et ne pouvait pas s'allonger : semaines de charge en dents de scie, décharge plus lourde que la charge | `selector.ts` : un gabarit doit pouvoir atteindre 60 % de la durée visée une fois allongé |
| Base 5K : le tempo de base était une séance à allure marathon | `KEY_SESSION_TYPES_BY_PROFILE.short.base` : seuil à la place du tempo (Pfitzinger) |
| Surcouche courses intermédiaires : une séance clé convertie en « endurance » gardait l'identifiant d'une séance de seuil | `intermediateRaceWeek.ts` : `demoteToEasy` remplace aussi le gabarit |
| Semaine post-course suivie d'une décharge du modèle : deux semaines allégées d'affilée | `volume.ts` : le modèle connaît les semaines de course intermédiaire, jamais de décharge dessus ni juste après, le compteur de charge repart de là |
| Trail avec gros D+ : sortie longue de 4 h 37 (plafond km + minutes de dénivelé) | `sessionBuilder.ts` : le dénivelé compte dans le plafond de durée, les km sont réduits |
| Audit : `RACE_DAY_MISSING` et faisabilité sur les purposes non-course dès qu'une date traîne dans la config | `audit.ts` : contrôles course ignorés hors purpose course |

Ajustements de calibrage issus de la même passe : part de sortie longue relevée sur 3-4 jours (+10 / +5 points, plafond 45 % route, 60 % trail), récupération et sorties faciles tirées dans tous les niveaux (les avancés n'avaient que deux gabarits de récupération, répétés jusqu'à 17 fois), planchers 10K ramenés à 18 km / 9 km de sortie longue (Higdon Novice 10K : 21 km / 9 km).

**Avertissements restants, attendus** : plans très courts (4-5 semaines) signalés comme trop courts ; plans débutant sur 3 jours signalés sous le plancher de volume (le plan dit au coureur d'ajouter un jour, c'est le comportement voulu) ; répétition de gabarits faciles sur les plans de 30-36 semaines à 6 jours (le catalogue compte 2 sorties faciles avancées, 2 de récupération avancées : à étoffer) ; sorties longues de plus de 4 h 20 sur ultra sans D+ déclaré (plafond ultra 5 h, par conception).

**Plans prêts à l'emploi après cette passe** : les dix passent la batterie sans erreur ni avertissement, sauf le 10K débutant qui reste 1 km sous l'ancien plancher ; le plancher a été aligné sur Higdon.

## Annexe A. Mesures des plans prêts à l'emploi

Colonnes : semaine, phase, décharge (R), km livrés, saut vs semaine précédente, sortie longue (part de la semaine), nb de clés ; puis séances (jour:gabarit, `*` = clé, `[B/I/A]` = niveau du gabarit).

### 5K débutant
```
S1 base      17km +0%   LR=6(35%)   k=1  Lun REC-001[B] 37' · Jeu HIL-001*[I] 54' · Dim LR-013[B] 55'
S2 base      19km +12%  LR=6.5(34%) k=1  REC-010[B] · TMP-002*[B] · SL-008[B]
S3 base      21km +11%  LR=7(33%)   k=1  END-008[B] · FAR-001*[B] · SL-008[B]
S4 build R   14km -33%  LR=5(36%)   k=0
S5 build     21km +50%  LR=7.5(36%) k=1  END-008[B] · FAR-006*[I] · LR-013[B]
S6 peak      20km -5%   LR=7(35%)   k=1  REC-004[B] · VMA-019*[I] · LR-014[B]
S7 peak      22km +10%  LR=7.5(34%) k=1  REC-010[B] · TMP-019*[I] (Hanson marathon) · LR-014[B]
S8 taper      6km -73%  course
dures 6/23 = 26 % · clés de niveau ≠ plan : S1 HIL-001, S5 FAR-006, S6 VMA-019, S7 TMP-019
```

### 10K débutant
```
S1 21 · S2 22 · S3 23 · S4R 16 · S5 23 (+44%) · S6 25 · S7 27 · S8R 18 · S9 taper 16 (VMA-020*) · S10 6 + course
SL 7.5 → 9.5 km · dures 7/29 = 24 % · clés ≠ plan : HIL-001, FAR-006, VMA-012, RP-002, VMA-020
```

### 5K intermédiaire
```
S1 30 · S2 33 · S3 36 · S4R 24 · S5 38 · S6 36 · S7 39 · S8R 25 · S9 39 · S10 12 + course
SL 7 → 11 km · dures 14/39 = 36 % · TMP-002[B] en S1 et S2
```

### 10K intermédiaire
```
S1 37 · S2 39 · S3 42 · S4R 31 · S5 41 · S6 41 · S7 42 · S8R 34 · S9 45 · S10 48 · S11 taper 31 · S12 12 + course
SL 10 → 17 km · dures 18/47 = 38 % · 5 clés de niveau débutant en base
```

### Semi-marathon
```
S1 40 · S2 38 · S3 39 · S4R 39 (=S3) · S5 42 · S6 38 · S7 42 · S8R 42 (=S7) · S9 46 · S10 46 · S11 50 · S12R 42 · S13 taper 32 · S14 12 + course
SL 9.5 → 19 km (S11) · dures 20/55 = 36 % · 6 clés de niveau débutant
```

### Marathon
```
S1 52 · S2 56 · S3 62 · S4R 44 · S5 65 · S6 65 · S7 69 · S8R 54 · S9 74 · S10 72 · S11 79 · S12R 53 · S13 80 · S14 74 · S15 77 · S16 46 · S17 33 · S18 16 + course
SL 14 → 31 (S13, 205'), 30 (S14, 199'), 28 (S15, 186'), 21 (S16), 13 (S17) · dures 28/89 = 31 %, 20 % du temps
répétitions : SL-005 ×7, SL-001 ×6, HIL-001 ×4, TMP-002 ×4
```

### Trail court intermédiaire
```
S1 38 · S2 42 · S3 45 · S4R 30 · S5 48 · S6 45 · S7 49 · S8R 33 · S9 43 · S10 46 · S11R 33 · S12 49 · S13 taper 30 · S14 12 + course
SL 9.5 → 19.5 km (S10, 129') · dures 8/55 = 15 % · clés : 0 en S2 et S5 · aucune cible de D+
```

### Construction de base
```
S1 28 · S2 31 · S3 34 · S4R 22 · S5 37 · S6 36 · S7 40 · S8R 29 · S9 43 · S10 41 · S11R 29 · S12 43
SL 10 → 15.5 km · dures 18/48 = 38 % · HIL-001 ×4, TMP-002 ×4
```

### Retour de blessure
```
S1 14 (END-011[I] hard 53') · S2 13 (FAR-002*[I]) · S3 14 · S4R 9 · S5 16 (+78%) · S6 15 (FAR-006*[I]) · S7R 10 · S8 17 (FAR-014*[I])
modèle interne : 11 12 13 9R 14 15 10R 17
```

### Reprise après longue pause
```
S1 14 (END-011[I] hard 53') · S2 12 (FAR-007*[I]) · S3 15 · S4R 9 · S5 15 (+67%) · S6 16 (FAR-002*[I]) · S7 17 · S8R 11 · S9 18 · S10 17 (FAR-009*[I])
```

## Annexe B. Matrice générateur (extraits)

```
marathon beginner 4d 20w finish (25 km déclarés)  → pic 43 km, SL 17 km → audit : VOLUME_TOO_LOW, LONG_RUN_TOO_SHORT
marathon intermediate 5d 24w time                  → base 12 sem., pic 81 km atteint S13, SL 31.5
marathon advanced 6d 30w compete                   → base 15 sem., pic 125 km, SL 33 (26 %)
semi advanced 6d 16w compete                       → pic 107 km, SL 19 km (18 %)
5K elite 7d 12w compete                            → pic 141 km, SL 12.5 km (9 %)
ultra intermediate 5d 40w finish                   → base 14 / build 16 / peak 7 / taper 3, pic 70 km, SL 34.5
```

## Annexe C. Barèmes de référence utilisés

| Source | Départ → pic hebdo | Sortie longue max | Décharge | Affûtage |
|---|---|---|---|---|
| Higdon Novice 5K (8 sem., 3 j) | 7 → 13 km | 5 km | | |
| NHS Couch-to-5K (9 sem., 3 j) | 3 × 8 min → 3 × 30 min de course | 30 min | | |
| Higdon Novice 10K (8 sem., 3 j) | 13 → 21 km | 9 km | | |
| Higdon Half Novice 1 (12 sem.) | 19 → 37 km | 16 km | | 14 km en semaine de course |
| Higdon Marathon Novice 1 (18 sem.) | 24 → 64 km | 32 km (50 % de la semaine) | 86-92 % | 73 / 53 / 23 % |
| Pfitzinger 18/55 | 50-58 → 84-95 km | 32 km, trois fois, dernière à J−21 | 78-85 % | 80 / 60 / 33 % ; guide 75 / 60 / 40 |
| Hansons Beginner (18 sem.) | 19-24 → 93 km | 26 km (25-30 %, ≤ 3 h) | | 86 / 42 % (10 jours) |
| Daniels 2Q | paliers 0,8-0,9-1,0 du pic | ≤ 30 % (< 64 km/sem.), ≤ min(25 %, 150 min) au-delà | palier 3-4 sem. | court, peu agressif |

## Références

- Bosquet L, Montpetit J, Arvisais D, Mujika I. *Effects of tapering on performance: a meta-analysis.* Med Sci Sports Exerc. 2007;39(8):1358-65. doi:10.1249/mss.0b013e31806010e0
- Wang Z et al. *Effects of tapering on performance in endurance athletes: a systematic review and meta-analysis.* PLOS ONE. 2023;18(5):e0282838.
- Mujika I, Padilla S. *Scientific bases for precompetition tapering strategies.* Med Sci Sports Exerc. 2003;35(7):1182-7. Banister EW, Carter JB, Zarkadas PC. Eur J Appl Physiol. 1999;79:182-91.
- Spilsbury KL et al. *Tapering strategies in elite British endurance runners.* Eur J Sport Sci. 2015;15(5):367-73.
- Smyth B, Lawlor A. *Longer disciplined tapers improve marathon performance for recreational runners.* Front Sports Act Living. 2021;3:735220.
- Buist I et al. *No effect of a graded training program on the number of running-related injuries in novice runners: a randomized controlled trial.* Am J Sports Med. 2008;36(1):33-9. doi:10.1177/0363546507307505
- Nielsen RØ et al. *Excessive progression in weekly running distance and risk of running-related injuries.* J Orthop Sports Phys Ther. 2014;44(10):739-47. doi:10.2519/jospt.2014.5164
- Damsted C et al. *Is there evidence for an association between changes in training load and running-related injuries? A systematic review.* Int J Sports Phys Ther. 2018;13(6):931-42. Damsted C et al. J Orthop Sports Phys Ther. 2019;49(4):230-8.
- Ramskov D et al. *Run Clever: no difference in risk of injury when comparing progression in running volume and running intensity.* BMJ Open Sport Exerc Med. 2018;4:e000333.
- Impellizzeri FM et al. *Acute:chronic workload ratio: conceptual issues and fundamental pitfalls.* Int J Sports Physiol Perform. 2020;15(6):907-13. Impellizzeri FM et al. Sports Med. 2021;51:581-92. Lolli L et al. Br J Sports Med. 2019;53(15):921-2. Wang C et al. Front Physiol. 2020;11:1034.
- Kiely J. *Periodization theory: confronting an inconvenient truth.* Sports Med. 2018;48:753-64.
- Seiler KS, Kjerland GØ. Scand J Med Sci Sports. 2006;16(1):49-56. Seiler S. *What is best practice for training intensity and duration distribution in endurance athletes?* Int J Sports Physiol Perform. 2010;5(3):276-91.
- Stöggl T, Sperlich B. Front Physiol. 2014;5:33. Rosenblat MA et al. J Strength Cond Res. 2019;33(12):3491-500. Treff G et al. *The polarization-index.* Front Physiol. 2019;10:707.
- Kenneally M, Casado A, Santos-Concejero J. Int J Sports Physiol Perform. 2018;13(9):1114-21. Kenneally M et al. Eur J Sport Sci. 2021;21(6):819-26. Casado A et al. *Training periodization, methods, intensity distribution, and volume in highly trained and elite distance runners: a systematic review.* Int J Sports Physiol Perform. 2022;17(6):820-33.
- Burnley M, Bearden SE, Jones AM. *Polarized training is not optimal for endurance athletes.* Med Sci Sports Exerc. 2022;54(6):1032-4 (et réponse de Foster et al., 1028-31).
- Billat VL, Koralsztein JP. *Significance of the velocity at VO2max and time to exhaustion at this velocity.* Sports Med. 1996;22(2):90-108.
- Péronnet F, Thibault G. *Mathematical analysis of running performance and world running records.* J Appl Physiol. 1989;67(1):453-65. Lacour JR et al. Eur J Appl Physiol. 1990;60:38-43. Mercier D, Léger L, Desjardins M. Médecine du Sport. 1984;58(4):181-7 (nomogramme).
- Nikolaidis PT et al. *Physiological and race pace characteristics of medium and low-level Athens marathon runners.* Sports (Basel). 2020;8(9):116.
- Daniels J. *Daniels' Running Formula.* 3e éd., Human Kinetics, 2014.
- Pfitzinger P, Douglas S. *Advanced Marathoning.* 2e éd. 2009, 4e éd. 2024. Pfitzinger P, Latter P. *Faster Road Racing.* 2015.
- Humphrey L, Hanson K, Hanson K. *Hansons Marathon Method.* 2012/2016 ; *Hansons Half-Marathon Method.* 2014.
- Higdon H. Novice 5K, Novice 10K, Half Marathon Novice 1, Marathon Novice 1 (halhigdon.com).
- Koop J. *Training Essentials for Ultrarunning.* 2e éd., VeloPress, 2021.
- Beattie K et al. *The effect of strength training on performance indicators in distance runners.* J Strength Cond Res. 2017;31(1):9-23.
- Rønnestad BR, Mujika I. *Optimizing strength training for running and cycling endurance performance: a review.* Scand J Med Sci Sports. 2014;24(4):603-12. Rønnestad BR, Hansen EA, Raastad T. Eur J Appl Physiol. 2010;110:1269-82. Rønnestad BR, Nymark BS, Raastad T. J Strength Cond Res. 2011;25(10):2653-60.
- Blagrove RC, Howatson G, Hayes PR. Sports Med. 2018;48(5):1117-49. Denadai BS et al. Sports Med. 2017;47(3):545-54.
- Lauersen JB, Bertelsen DM, Andersen LB. Br J Sports Med. 2014;48(11):871-7.
- Warden SJ, Davis IS, Fredericson M. *Management and prevention of bone stress injuries in long-distance runners.* J Orthop Sports Phys Ther. 2014;44(10):749-65. George E, Sheerin K, Reid D. *Criteria and guidelines for returning to running following a tibial bone stress injury: a scoping review.* Sports Med. 2024.

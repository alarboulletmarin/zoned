# Les pratiques : route et trail

Ce document existe pour une raison précise : **que le prochain chantier ne
rejoue pas ces décisions**. Elles ont été tranchées par le propriétaire ou
imposées par une mesure, et les défaire demande une nouvelle décision, pas une
initiative.

## Deux pratiques, et seulement deux

```
Practice = "road" | "trail"
```

**25 novembre 2026, décision du propriétaire : l'ultra et le triathlon sont
retirés, définitivement.** Ils avaient été nommés puis marqués « bientôt »
(le triathlon depuis toujours, l'ultra depuis le 12 septembre 2026, quand ce
que le générateur produisait à cette distance n'avait pas été jugé assez
fiable). Une pratique qu'on peut toucher mais qui ne mène à rien est une
promesse que l'écran ne tient pas : elles ne sont plus nommées nulle part, ni
pastille, ni carte, ni étape de parcours, ni réglage, ni annonce.

Ce qui reste, et pourquoi :

- **Les séances.** Une longue sortie ou une séance de trail écrite pour l'ultra
  reste au catalogue, sous route ou trail selon son terrain. Le vélo et la
  natation sont sous Autres sports dans la bibliothèque, et leurs calculateurs
  (FTP, CSS) restent.
- **La distance `ultra` dans le moteur.** `RaceDistance` la garde, avec ses
  tables de volume et d'affûtage, parce que des plans, des liens de partage et
  des records déjà enregistrés la portent et doivent continuer de s'ouvrir.
  Elle ne se **choisit** plus : `OFFERED_RACE_DISTANCES` (`types/plan.ts`) est
  la liste que lisent le parcours, les objectifs intermédiaires et le profil,
  et l'API agents ne l'accepte plus à l'import. Un ancien plan ultra se range
  sous le trail (`practiceFromRaceDistance`).
- **Les données stockées.** `enabledPractices`, `zoned:practice` et
  `PlanConfig.practice` d'une ancienne version qui disent ultra ou triathlon
  retombent à la lecture (`settingsSchema`, `practicePrefs`, `planSchema`) :
  rien à migrer.
- **Le relevé multi-disciplines.** Les activités complémentaires gardent
  course, vélo et natation (`docs/activites-complementaires.md`) : c'est un
  journal, pas une pratique.
- **L'éditorial.** Les articles, astuces, le glossaire (le brick) et la
  nutrition parlent d'ultra-trail et de triathlon comme du sport qu'ils sont ;
  ce n'est pas l'app qui propose une option.

La collection Objectif ultra-trail est devenue **Objectif trail long**
(`/collections/objectif-trail-long`), mêmes séances, avec une redirection
permanente depuis l'ancienne adresse (`vercel.json`).

## La pratique surplombe la modalité

La bibliothèque rangeait le catalogue par **modalité**,
`all | running | cycling | swimming | strength`. Quelqu'un qui s'entraîne,
lui, pense en **pratique** : je cours sur route, je fais du trail.

**La pratique ne remplace pas la modalité, elle la surplombe.** Remplacer
orphelinerait les séances vélo, natation et renforcement. La pratique est la
bande primaire de la bibliothèque ; la modalité est dans le panneau de filtres
et dans Autres sports.

## Zéro migration, parce que la pratique se déduit

```
5K · 10K · semi · marathon       → route
trail_short · trail · (ultra)    → trail
```

`practiceFromRaceDistance` (`src/types/practice.ts`) est un `switch`
**exhaustif sans `default`** : ajouter une `RaceDistance` un jour casse `tsc`
au lieu de tomber silencieusement dans route. `PlanConfig` porte un seul champ
optionnel, `practice?`, qui ne sert que sans course visée (base, reprise,
débuter).

`Practice` est l'axe **produit**, `DistanceProfile` l'axe **moteur** : ils ont
le droit de ne pas coïncider, la route couvre à elle seule les profils court et
long.

## Une seule définition de ce qui est trail

`src/lib/practiceIndex.ts`. La bande de la bibliothèque, les compteurs et les
états vides lisent **tous** ce module.

1. le renforcement est **transversal** : liste vide, il passe sous les deux
   pratiques. Un coureur sur route ne perd pas son gainage ;
2. le vélo et la natation sont **hors pratique** : ils ne passent sous aucune,
   on les atteint par Autres sports, qui court-circuite la pratique ;
3. une séance peut se **ranger elle-même** via un champ racine `practices?` ;
4. `category === "trail"` **ou** un segment en `trail_runnable` /
   `trail_technical` / `mountain` → trail ; route sinon.

**Le piège de comptage, à ne pas refaire.** `terrainType` vit sur les
**segments**, pas à la racine du template. Se fier à `category === "trail"` en
rate les deux tiers.

**La mémoïsation est par id, pas une `Map` de module.** Le catalogue est
découpé en chunks chargés à la demande : il n'existe aucun instant où toutes
les séances sont là.

Mesuré, jamais écrit en dur (`practiceIndex.test.ts` le garde) : 197 séances
de route, 33 de trail, qui partitionnent les 230 de course.

**Ids brûlés.** TRL-013, TRL-014 et TRL-016 ont été écrits puis retirés le
même jour, parce qu'ils doublaient des archétypes déjà au catalogue ; un
identifiant ne se réemploie pas. Avant d'écrire une séance, chercher
l'archétype dans tout le catalogue.

## Un rayon vide le dit

Règle valable au-delà des pratiques : **un zéro ne rend jamais une grille vide
en silence.** L'étagère des plans prêts nomme une pratique qui n'en a pas, dit
pourquoi, et donne ce qui marche à la place, le générateur pré-réglé sur la
pratique. Aucune n'est dans ce cas aujourd'hui.

## Où vit la pratique en cours

| question | nature | logement |
|---|---|---|
| quelles pratiques l'app me montre ? | config, opt-out, par appareil | `UserSettings.enabledPractices` |
| quelle pratique je regarde là ? | état de contenu, partageable | `?practice=` + écho dans `zoned:practice` |

**`zoned-settings` n'accueille pas d'état de contenu.** `index.html` le lit dans
un script inline, avant tout bundle : cet objet doit rester minuscule.

Et **aucune question au premier lancement.** Par défaut les deux pratiques sont
montrées ; la pratique est apprise au premier choix.

## Les figures

Une par pratique, dans `src/components/domain/practice-art.ts` :

| | |
|---|---|
| route | `runners-duo`, le dessin approuvé du projet |
| trail | `door-today`, la foulée penchée, genou haut |

Deux réemplois : une figure de plus ne se juge pas sur la place disponible mais
sur ce qu'elle retire (`docs/doodles.md`).

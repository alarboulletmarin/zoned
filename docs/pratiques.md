# Les pratiques — le modèle, et la position sur le triathlon

Ce document existe pour une raison précise : **que le prochain chantier ne
rejoue pas ces décisions**. Elles ont été tranchées par le propriétaire ou
imposées par une mesure, et les défaire demande une nouvelle décision, pas une
initiative.

## L'axe qui manquait

La bibliothèque rangeait le catalogue par **modalité** —
`all | running | cycling | swimming | strength`. Quelqu'un qui s'entraîne, lui,
pense en **pratique** : je fais du trail, je prépare un ultra. Cet axe
n'existait nulle part.

```
Practice = "road" | "trail" | "ultra" | "triathlon"
```

**La pratique ne remplace pas la modalité, elle la surplombe.** Remplacer
orphelinerait les 10 séances vélo, les 10 de natation et les 17 de
renforcement, plus `/calculators/ftp` et `/calculators/css` qui sont adossés à
`cyclingPaceEngine.ts` et `swimmingPaceEngine.ts`. La pratique est donc la
bande primaire de la bibliothèque, et la modalité est descendue dans le panneau
de filtres — où elle atteint toujours tout.

## Zéro migration, parce que la pratique se déduit

```
5K · 10K · semi · marathon   → route
trail_short · trail          → trail
ultra                        → ultra
(aucune distance)            → triathlon, annoncé
```

`practiceFromRaceDistance` (`src/types/practice.ts`) est un `switch`
**exhaustif sans `default`** : ajouter une `RaceDistance` un jour casse `tsc`
au lieu de tomber silencieusement dans « route ». C'est le seul garde-fou qui
compte sur cette fonction.

Tout plan déjà enregistré porte déjà sa `raceDistance`, donc sa pratique se lit
sans rien migrer. `PlanConfig` ne gagne **qu'un** champ optionnel,
`practice?`, et il ne sert que quand `raceDistance` est absente — plan de
construction de base, retour de blessure, débuter la course. Pas de montée de
version du schéma, pas de code de migration, aucun risque de perdre un plan.

### Deux axes de granularités différentes, et c'est correct

`trail` et `ultra` pointent tous deux le profil moteur `"trail"`.

| | |
|---|---|
| `Practice` | l'axe **produit** — ce que la personne prépare |
| `DistanceProfile` | l'axe **moteur** — comment le plan se construit |

Ils ont le droit de ne pas coïncider : l'ultra se différencie déjà par ses
tables de volume, de phases et d'affûtage (`planGenerator/constants.ts`). Un
test qui exigerait l'égalité des deux axes serait faux — et il a d'ailleurs été
écarté pendant ce chantier pour cette raison : la route couvre à elle seule les
profils « court » et « long ».

## Une seule définition de « ce qui est trail »

`src/lib/practiceIndex.ts`. La bande de la bibliothèque, les compteurs des
cartes de pratique et les états vides lisent **tous** ce module. S'ils
recalculaient chacun leur critère, une carte annoncerait 33 séances et la
bibliothèque en montrerait 12.

Le critère, dans l'ordre :

1. le renforcement est **transversal** — liste vide, donc valable sous les
   quatre pratiques. Un coureur sur route ne perd pas son gainage parce qu'il a
   choisi « route » ;
2. vélo et natation → `triathlon`, parce que c'est tout ce qui existe de tri ;
3. une séance peut se **ranger elle-même** via un champ racine `practices?` ;
4. `category === "trail"` **ou** un segment en `trail_runnable` /
   `trail_technical` / `mountain` → trail ;
5. l'ultra puise dans le trail et dans le volume : trail, `long_run`, ou un tag
   d'ultra. On ne montre pas 16 séances à quelqu'un pour qui 49 sont utiles.

**Le piège de comptage, à ne pas refaire.** `terrainType` vit sur les
**segments**, pas à la racine du template. Se fier à `category === "trail"` en
rate les deux tiers : le premier relevé du chantier a trouvé 28 séances
trail-compatibles là où la catégorie n'en comptait que 12. Et il y a ~75
**occurrences** de segment en terrain trail pour 28 **séances** — c'est 28
qu'on affiche.

**La mémoïsation est par id, pas une `Map` de module.** Le catalogue est
découpé en chunks chargés à la demande : il n'existe aucun instant où « toutes
les séances » sont là.

## Les chiffres, et d'où ils viennent

Mesurés, jamais écrits en dur — `useAppStats` les dérive du même index, et
`practiceIndex.test.ts` les garde.

| | premier relevé | aujourd'hui |
|---|---|---|
| route | 197 | 197 |
| trail | 28 | 33 |
| ultra | 44 (dont 11 spécifiques) | 49 (dont 16) |
| triathlon | 20 séances, 0 plan | inchangé |

Les 28 et 44 du premier relevé ne devaient **rien** au chantier : le terrain et
les tags étaient déjà renseignés, c'est le critère qui manquait. Les cinq
séances ajoutées (TRL-015, TRL-017…TRL-020) sont, elles, écrites pour l'ultra :
marche rapide en montée longue, sortie de nuit, répétition ravitaillement,
montées de dix minutes, double sortie sur la journée.

**Trois autres avaient été écrites puis retirées le même jour**, parce qu'elles
doublaient des archétypes déjà au catalogue — LR-016 « Ultra time-on-feet »,
TRL-009/TRL-010 « Back-to-back jour 1/2 », TRL-005 « Descente technique
contrôlée ». Les ids TRL-013, TRL-014 et TRL-016 restent **brûlés** : un
identifiant ne se réemploie pas. La leçon est plus large que ces trois cartes :
**avant d'écrire une séance, chercher l'archétype dans tout le catalogue, pas
seulement dans le fichier de sa catégorie.** Une séance ultra peut très bien
vivre dans `long_run.json`.

### Pas de catégorie `"ultra"` dans `WorkoutCategory`

Décidé, et à ne pas rejouer. `ID_PREFIX_REGISTRY`
(`scripts/qa-workout-schema.ts`) est indexé par catégorie ; un membre de plus
dans l'union voudrait dire éditer ce registre, l'union elle-même, **chaque**
`Record<WorkoutCategory, …>` exhaustif en aval, et les clés i18n `category.*`
dans les deux langues. L'ultra-ité est une propriété de **durée, de terrain et
de tag**, et l'index lit déjà les trois.

## Le triathlon est annoncé, pas livré

`PRACTICE_META.triathlon.status === "announced"`, et c'est le **seul** endroit
qui le dit. Un test échoue le jour où quelqu'un le bascule sans les plans.

Ce qui existe et marche déjà : les 20 séances vélo et natation sont
consultables, et les tests FTP et CSS calculent leurs zones. Ce qui manque, ce
sont les **plans** — créneaux par discipline, enchaînements, briques. C'est un
chantier à part et il n'est pas commencé.

Donc, concrètement :

- la bande de la bibliothèque montre ses séances, avec « bientôt » sur la
  pastille ;
- `stepsFor` du parcours renvoie `["practice"]` : l'étape 1 propose ce qui
  marche déjà et s'arrête là. Ni demi-parcours, ni champ en trompe-l'œil ;
- la carte de pratique n'affiche **aucun compteur** — « bientôt », et rien
  d'autre. Un chiffre sur une étagère qui n'est pas ouverte est une promesse ;
- `WeekSlot` de `weekTemplate.ts` **reste sans discipline**.

## Un rayon vide le dit

Règle de ce chantier, valable au-delà des pratiques : **un zéro ne rend jamais
une grille vide en silence.** L'étagère des plans prêts nomme les pratiques
vivantes qui n'en ont pas, dit pourquoi (des dizaines de semaines de structure
à écrire à la main, et un plan bâclé serait pire que pas de plan) et donne ce
qui marche à la place — le générateur, pré-réglé sur la pratique. Rien n'est en
dur : le jour où un plan ultra est écrit, le bloc disparaît tout seul.

## Où vit « la pratique en cours »

Deux questions différentes, qui ne partagent pas de logement :

| question | nature | logement |
|---|---|---|
| quelles pratiques l'app me montre ? | config, opt-out, par appareil | `UserSettings.enabledPractices` |
| quelle pratique je regarde là ? | état de contenu, partageable | `?practice=` + écho dans `zoned:practice` |

**`zoned-settings` n'accueille pas d'état de contenu.** `index.html` le lit dans
un script inline, avant tout bundle : cet objet doit rester minuscule et
présentationnel. La pratique courante vit donc dans l'URL d'abord, avec une
clé propre `zoned:practice` pour le dernier choix — même motif que
`loadUserZonePrefs` et `loadRunnerProfile`.

Et **aucune question au premier lancement.** Par défaut toutes les pratiques
sont montrées ; la pratique est *apprise* au premier choix, puis affichée comme
puce retirable pour ne jamais devenir un filtre invisible. Une app locale sans
compte n'a pas gagné le droit d'exiger une décision avant de montrer quoi que
ce soit.

## Les figures

Une par pratique, dans `src/components/domain/practice-art.ts` — une seule
table, pour que les trois surfaces qui en montrent une ne divergent pas.

| | |
|---|---|
| route | `runners-duo` — le dessin approuvé du projet |
| trail | `climbing` — le seul dessiné pour ce chantier |
| ultra | `walking-away` — du temps sur les pieds, et on avance |
| triathlon | `standing` — la figure de « rien de commencé », qui est le statut |

Trois réemplois, un dessin : « une figure de plus ne se juge pas sur la place
disponible mais sur ce qu'elle retire » (`docs/doodles.md`). Et la pose que le
plan proposait pour l'ultra — les mains sur les cuisses — avait **déjà** été
dessinée sous le nom `catching-breath` et rejetée en revue : le gréement ne
courbe pas le rachis.

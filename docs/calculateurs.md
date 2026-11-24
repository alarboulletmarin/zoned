# Les calculateurs et le jour de course

Ce document fixe ce que sont les calculateurs depuis novembre 2026, pourquoi,
et ce qui a été écarté. Lire avant de toucher `src/pages/CalculateursPage.tsx`,
une page d'outil (`*CalculatorPage.tsx`, `TreadmillConverterPage.tsx`,
`SplitGeneratorPage.tsx`, `PaceTablePage.tsx`), `src/components/calc/`,
`src/lib/myNumbers.ts` ou le simulateur (`RaceSimulatorPage.tsx`,
`src/components/domain/raceSim/`, `src/lib/raceDay.ts`).

## Le principe : tes repères d'abord

Un calculateur part de ce que la personne a déjà posé (VMA, FC max, courses
du plan) et répond avant qu'elle tape. Tout passe par `useMyNumbers()`
(`src/hooks/useMyNumbers.ts`), qui lit le profil et les plans et rend :

- `vma`, `fcMax`, `threshold` (la Z4, en min/km, tirée de la VMA) ;
- `races` : les courses à venir des plans de course, objectifs intermédiaires
  compris, triées par date, sans doublon. Chaque course a une `key`
  (`planId|date|distance`) qui sert de lien : `/race-simulator?race=<key>`,
  `/calculators/splits?race=<key>`.

Le hook suit la règle de prérendu : premier rendu vide, comme le HTML, lecture
du stockage dans un effet. Une valeur absente s'affiche `à poser`, en
pointillés, jamais un exemple inventé.

## Six outils, trois familles

| Famille | Outil | Route |
|---|---|---|
| Poser tes repères | Zones | `/calculators/zones` |
| | Depuis un chrono | `/calculators/vma` |
| Convertir | Allures | `/calculators/allures` |
| | Tapis roulant | `/calculators/tapis-roulant` |
| Préparer une course | Splits | `/calculators/splits` |
| | Jour de course | `/race-simulator` |

La table des allures reste une page (`/calculators/table-allures`), en tableau
dense, ouverte depuis Allures. FTP et CSS (vélo, natation) gardent leurs
routes mais sortent de la grille : une ligne en bas du hub.

`scripts/site-stats.ts` compte les lignes `id:` de `CALCULATEURS` : une par
outil, pas plus.

## Un seul modèle de performance

Péronnet-Thibault, profil intermédiaire (`src/lib/racePerformance.ts`) :
`predictRaceMinutes` (VMA vers chrono), `vmaFromRaceTime` (chrono vers VMA),
`equivalentRaceMinutes` (chrono vers chrono, en passant par la VMA). Riegel
a disparu du code et des textes : deux modèles donnaient deux réponses à la
même question.

## L'anatomie d'un outil

Les primitives de `src/components/calc/index.tsx` :

- `ToolHeader` : retour vers le hub, petit titre, titre.
- `StepField` / `StepChrono` : saisie encadrée de - et +, brouillon local ;
  une saisie invalide se signale, et la sortie du champ rend la dernière
  valeur valide.
- `Answer` : le chiffre en grand, puis ce qui le situe.
- `ZoneBand` : la bande des zones en % de VMA, avec le marqueur.
- `SplitBars` : une barre par kilomètre, hauteur selon l'écart réel de vitesse.
- `Wristband` + `printWristband()` : la bande-poignet imprimable.
- `Provenance` (d'où vient le calcul), `NextSteps` (où aller ensuite).

Le style vit dans `calc.css` et une feuille par outil (`calc-zones.css`,
`calc-chrono.css`...).

## Jour de course

Le simulateur ouvre la prochaine course du plan. Des pastilles changent de
course, `Autre` ouvre le formulaire libre. Le plan connaît la distance et
souvent l'objectif, jamais l'heure de départ : la bande Objectif / Allure /
Départ se règle, et ces saisies sont gardées par course
(`zoned-race-sim-entries`).

Deux vues :

- **Préparer** : un document chronologique en cinq chapitres (la veille, le
  matin, l'échauffement en quatre temps, la course, après), chacun avec son
  horaire et un titre qui dit l'intention. Sur bureau, trois colonnes : la
  course et les chapitres à gauche, le document, les passages et les actions
  à droite.
- **Jour J** : Maintenant (l'étape en cours, sa fenêtre, sa barre, `C'est
  fait`) et Ensuite, puis la journée. L'horloge n'est la vraie que le jour
  de la course, où l'écran est gardé allumé (wake lock). Les autres jours,
  c'est une répétition, dite comme telle, avec un curseur d'heure.

La logique est pure et testée dans `src/lib/raceDay.ts`.

Le trail est listé mais sans splits au kilomètre : l'objectif est en temps,
et une ligne dit que les allures en trail arrivent. Le dénivelé décide de
tout ; découper au kilomètre plat donnerait des chiffres faux.

Paramètres d'URL : `?race=<key>`, `?km&h&m&s&strat&start=HHMM` (depuis
Splits), `?d=` (simulation partagée).

## Liens anciens

Redirections permanentes, dans `vercel.json`, `nginx.conf` et le routeur
(qui garde la requête et l'ancre) :

- `/calculators/equivalence` vers `/calculators/vma`
- `/calculators/age-graded` vers `/calculators/vma`
- `/calculators/convertisseur` vers `/calculators/allures`

Un lien qui porte des paramètres n'hydrate pas le HTML prérendu, qui a été
rendu sans eux (`isServerSnapshot`) : le client repeint.

## Écarté, et pourquoi

- **Allures en trail** : il faut un modèle de dénivelé (montée, descente,
  terrain). Reporté.
- **Filtre de zone sur la bibliothèque** : `/library` n'en a pas en URL ;
  Zones mène à la bibliothèque sans filtre.
- **Réserver la place des résultats avant la lecture du profil** sur
  Allures et Depuis un chrono : avec une VMA enregistrée, la bande ou les
  résultats apparaissent après l'effet. Le budget Lighthouse (profil vide)
  n'est pas touché ; le décalage reste pour qui a un profil.
- **Effacer un repère depuis un calculateur** : effacer un champ ne supprime
  pas la valeur enregistrée, la page cesse seulement de dire `enregistré`.
  La suppression se fait dans le profil.

# Les anneaux de la semaine

Ce document fixe ce que montrent les anneaux du cockpit et pourquoi, pour que
le prochain chantier ne rejoue pas ces décisions. Lire avant de toucher
`src/lib/weekRings.ts`, `src/components/weekly/WeekRings.tsx` ou leur place
dans `src/pages/TodayPage.tsx`.

## Ce que c'est

Trois anneaux en vue Semaine de `/today`, chacun comparant le fait au prévu de
la semaine calendaire en cours :

| Anneau | Ce qu'il mesure | Classement |
|---|---|---|
| Endurance | course en Z1-Z2 | le côté facile du 80/20 |
| Qualité | course en Z3 et plus | le côté dur du 80/20, tempo compris |
| Renfo | séances de renforcement | un arc par séance prévue |

Un sélecteur Temps / Km / D+ change la mesure d'Endurance, de Qualité et du
total. Le Renfo reste en séances. Le dessin de référence est
`docs/design/week-rings.reference.html`, le composant d'un canevas Claude
Design : il donne la géométrie et les états, pas le code, qui est en styles
inline et en couleurs en dur là où Zoned a ses tokens et ses feuilles `zn-`.
Il écrit encore Z1-Z3 et Z4+ : la frontière a bougé depuis, voir plus bas.

## Par intensité, et pas par sport

L'idée vient des anneaux prévu/réalisé par sport de Transition et Stamina.
Copiée telle quelle, elle donnerait à un coureur un anneau course qui porte
toute la semaine et deux anneaux vides. La question qu'un coureur se pose le
jeudi n'est pas combien de sports, c'est : ai-je fait mon facile, ai-je fait
mon dur, et le renfo a-t-il eu lieu. Le découpage suit donc l'intensité.

### Sur la frontière du 80/20, pas sur `--zone-threshold`

La première version coupait à Z4, la frontière que le design system pose
(`--zone-threshold: 4`) et qu'applique `isHardWorkout`. Elle contredisait la
jauge 80/20 (`PolarizationGauge`, `computeWeekStats`, `WeekSummaryStrip`),
qui range Z3, le tempo, du côté dur : la même semaine pouvait se lire trop
dure sur la page de la semaine et sous le prévu en Qualité sur le cockpit.

Tranché par le propriétaire le 19 novembre 2026 : **les anneaux suivent le
80/20.** Endurance est Z1-Z2, Qualité Z3 et plus (`QUALITY_FROM_ZONE`). Deux
écrans de la même app ne classent plus la même minute de deux façons. Le
seuil du design system garde son rôle, qui est graphique (la rampe des
zones), et `isHardWorkout` le sien (le défaut souple ou fixé d'une séance,
le compte des séances dures).

## Ce qui compte, et l'hypothèse qu'on assume

**Le prévu**, séance par séance du plan dans la semaine, jour de course exclu :

- la durée est celle que `lib/sessionPrecision.ts` fait compter : le milieu de
  la fourchette pour une séance souple, la durée posée pour une séance fixée ;
- les minutes se répartissent entre Endurance et Qualité **bloc par bloc**,
  avec la répartition par zone de `planStats` (`addSessionZoneMinutes`, la
  même fonction pour la page du plan et pour les anneaux). Les durées
  viennent du moteur de structure, répétitions déroulées et récupérations
  comptées dans leur zone. Un échauffement va en Endurance, des blocs au
  seuil en Qualité. Une plage `Z2-Z3` se partage à parts égales ;
- les km sont ceux de la séance, sinon l'estimation à l'allure de son type ;
  le D+ est celui du gabarit, une séance du plan n'en porte pas. Les deux se
  répartissent au prorata des minutes ;
- le renfo compte en séances et en minutes, jamais dans Endurance ni Qualité ;
- une séance de vélo ou de natation du plan, ou une activité posée dans une
  semaine, n'est ni de la course ni du renfo : elle sort des anneaux et du
  total, et ne pèse que dans la charge.

**Le fait** : seules les séances `completed` ou `modified`. Une durée ou une
distance réelle remplace la prévue.

**L'hypothèse** : la répartition du fait garde les proportions du prévu. Sans
fichier FIT, on ne sait pas combien de temps une séance a vraiment passé
au-dessus du seuil. Un seuil prévu à 40 % de Qualité et couru 10 minutes plus
long compte 40 % de Qualité sur sa durée réelle. C'est faux dans le détail et
juste en ordre de grandeur, et c'est écrit dans le commentaire de
`buildWeekRings` pour que personne ne le prenne pour une mesure.

**Le total** : en Temps, Endurance + Qualité + Renfo ; en Km et en D+, la course
seule, parce que des kilomètres de renfo ne veulent rien dire. **La charge** est
celle des séances du plan, en TSS, l'unité du reste de l'app, et l'écran le
dit (`Charge · TSS`).

## Pourquoi le hors plan n'entre pas dans les anneaux

Un anneau compare un fait à un prévu. Le vélotaf n'a pas de prévu : le mettre
dans l'anneau Endurance le remplirait avec un volume que le plan n'a jamais
demandé, et la coche dirait semaine faite à quelqu'un qui n'a pas couru. C'est
le mensonge que `docs/activites-complementaires.md` refuse dans l'autre sens.

Il n'est pas caché pour autant : une ligne **Hors plan · hors anneaux** sous le
total donne le nombre de relevés, les minutes, les km et une pastille en
pointillé avec sa charge, en TSS elle aussi. Le libellé est le motif quand toutes
les activités le partagent (`Vélotaf ×3`). Les km ne s'affichent que si toutes
les activités sont du même sport : 30 km de vélo et 10 km de course ne font
pas 40 km, ici comme ailleurs.

## Une seule unité de charge

La première version mettait côte à côte la charge du plan en TSS
(`114 / 186`) et celle du journal en session-RPE (`+270 charge`), deux unités
qui ne se comparent pas : trois vélotafs semblaient peser plus que la moitié
de la semaine. Le hors plan est maintenant converti en TSS par le chemin
qu'emprunte déjà une activité posée dans une semaine (`lib/activitySession.ts`) :
l'effort perçu, saisi ou déduit du motif, donne une zone (`zoneFromRpe`), la
zone donne le TSS (`runTssFromZone`). Les trois mêmes vélotafs de 30 minutes
pèsent 72 TSS. Le journal et les statistiques du plan gardent leur
session-RPE : le cockpit est le seul écran où les deux charges se rencontrent,
c'est donc là qu'il fallait une seule unité.

## Pourquoi Qualité n'a jamais de coche

Endurance et Renfo à 100 % reçoivent une coche, parce qu'atteindre son volume
facile ou faire ses deux séances de renfo est le but. Qualité ne la reçoit
jamais, même à 100 % : la coche dirait que plus d'intensité est mieux, ce qui
est l'erreur la plus fréquente de l'entraînement amateur. Au-delà du prévu,
Qualité prend au contraire un arc vermillon sur l'orbite extérieure, une
pastille `+18min` et un triangle. L'excédent d'Endurance se dessine aussi,
en encre atténuée et sans glyphe : c'est du volume en plus, pas une alerte.

L'information ne passe jamais par la seule couleur : libellé et code de zone
sous chaque anneau, segments pour le Renfo, triangle pour l'excédent de Qualité.

## Sans plan

Le modèle sait le faire : sans séance du plan dans la semaine, la référence
devient la moyenne du fait des quatre semaines calendaires précédentes
(`reference: "average"`), avec une piste en pointillé, ni coche ni alerte, et
`null` sans historique. C'est testé.

**Le cockpit ne le montre pas, et c'est voulu.** Les anneaux vivent dans
`.zn-cockpit__split`, qui ne se rend que s'il y a une semaine à parcourir.
Surtout, le hors plan n'entrant pas dans les anneaux, une semaine sans plan
aurait un fait à zéro tous les jours, comparé à une moyenne : trois anneaux
vides qui ne disent rien. La page ne passe donc pas d'historique, et une
semaine de plan sans séance (une semaine de repos) ne montre rien. Rebrancher
le mode demande d'abord de décider ce que fait veut dire sans plan.

## Selon la largeur

Un seul emplacement dans le DOM, en fin de `.zn-cockpit__split-side`, juste
après la liste ou la bande des sept jours :

- **sous 900 px**, la **bande** repliée, une `zn-disclosure` : trois anneaux de
  36 px avec libellé court, glyphe et valeur, la carte sans son en-tête dans
  le panneau. Sous 375 px de téléphone, le texte passe sous chaque anneau
  (requête de conteneur) plutôt que d'être coupé ;
- **à partir de 900 px**, la **carte** toujours ouverte, en bas de la colonne
  de droite. Le seuil est celui de la grille de `cockpit.css` (`desk`, pas
  `wide` qui est à 901).

Les anneaux portent sur la semaine qu'on vit : choisir un autre jour ne les
change pas, et ils ne sont pas rendus en vue Mois. La mesure choisie est
retenue dans `settings.cockpit.ringsMetric`, champ optionnel réparé comme les
autres par `sanitizeSettings`, donc sans migration. Absente, elle vaut D+ pour
un plan trail ou ultra quand la semaine porte du dénivelé, Temps sinon.
L'onglet D+ n'existe que si la semaine porte du dénivelé, prévu ou fait.

Au bureau, la colonne de droite (liste plus carte) est désormais la plus
haute : c'est elle qui fixe la hauteur réservée de `.zn-cockpit__hold`.

## La répartition par zone comptait mal le fractionné

`planStats` lisait `durationMin` sur chaque bloc sans le multiplier par ses
répétitions : `3 × 8 min Z4` pesait 8 minutes, et la mise à l'échelle sur la
durée de la séance rendait le reste à l'échauffement. Un seuil de 55 minutes
donnait 12 minutes de Z4 au lieu de 24, dans les anneaux comme dans la
répartition par zone de la page du plan. `addSessionZoneMinutes` lit
maintenant les segments du moteur de structure (`flattenWorkoutSegments`), le
même qui donne leur durée aux séances partout ailleurs, et les récupérations
entre répétitions comptent dans leur propre zone. Les conventions
(échauffement moitié Z1 moitié Z2, retour au calme en Z1, segment sans zone en
Z2, mise à l'échelle sur la durée de la séance) n'ont pas bougé.

## Le doublon avec le bilan du dimanche

Le dimanche, `WeekReviewPanel` s'affiche toujours sous les deux colonnes. Sa
barre de volume (fait, en plus, repère du prévu) dit en partie ce que le total
des anneaux dit déjà. Il n'est pas modifié ici ; le jour où on y touche, sa
barre est la première candidate à partir.

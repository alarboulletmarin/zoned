# La page Plans

Ce document fixe ce que montre `/plans` et pourquoi, pour que le prochain
chantier ne rejoue pas ces décisions. Lire avant de toucher
`src/pages/PlansPage.tsx`, `src/lib/planCardModel.ts`, les composants
`PlanCard`, `PlanTimeline`, `PlanHistory`, `PlanActionsMenu` de
`src/components/domain/`, ou leur feuille `src/styles/components/plans.css`.

Le dessin de référence est dans `docs/design/plan-card.reference.html` et
`docs/design/plan-history.reference.html`, les deux composants d'un canevas
Claude Design. Ils donnent la structure, la géométrie et les états, pas le
code : leurs styles sont inline et leurs couleurs en dur, là où Zoned a ses
tokens et ses feuilles `zn-`.

## Ce que c'est

Un en-tête (le compte, `4 plans · 2 en cours`, le titre, Importer et Créer un
plan), puis deux sections :

| Section | Forme | Ce qu'elle dit |
|---|---|---|
| En cours · N | une carte par plan | où j'en suis, ce que j'ai fait, ce qui vient |
| Terminés · N | une ligne par plan, dans un seul bloc | ce que le plan a été |

Le sous-titre, la `HubNav` et le lien vers la science ne restent que dans
l'état vide : une étagère vide se présente, une étagère pleine parle par ses
plans. La science y passe sous le bouton de création, jamais avant : posée
avant, elle le repoussait sous le pli. Le compteur `2 plans` en bas de page
est parti, l'en-tête le donne.

## À date, pas au calendrier

L'ancienne carte disait quatre fois la même chose. La sparkline, la jauge,
`Semaine 2 / 5` et `40 %` mesuraient tous l'avancement du **calendrier**, et
aucun ne disait si les séances avaient eu lieu. Le 100 % d'un plan terminé
voulait seulement dire que ses dates étaient passées, même sans une séance
faite.

La carte porte désormais deux chiffres, **fait sur prévu, à date** :

- **Séances à date** : séances faites sur séances prévues dont le jour est
  aujourd'hui ou avant.
- **Volume à date** : minutes faites sur minutes prévues, sur les mêmes
  séances.

À date parce qu'une séance de demain n'est pas en retard : comparer le
fait au prévu de tout le plan donnerait 10 % la deuxième semaine à quelqu'un
qui a tout couru.

Les règles sont celles des anneaux et du bilan, pas des règles neuves :

- le jour de course (`__race_day__`) et les jours de repos (`rest`,
  `rest_day`) ne sont pas des séances ;
- faite veut dire `completed` ou `modified` ; une séance non close n'est pas
  faite, sans être sautée ;
- la durée prévue suit la précision de la séance (`plannedMinutesOf`, la
  fonction des anneaux) : le milieu de la fourchette pour une souple, la durée
  posée pour une fixée ;
- la durée faite est la durée réelle saisie, sinon la prévue ;
- les dates viennent de `planDates` (`getPlanMonday`,
  `getSessionCalendarDate`), la semaine en cours de `getCurrentWeek`, la fin
  de `isPlanEnded`. Ces deux dernières prennent maintenant l'instant de
  référence en dernier argument, l'horloge par défaut, pour que le modèle
  reste une fonction pure et testée.

Le modèle (`buildPlanCardModel(plan, today, workoutOf)`) ne rend aucun mot :
des nombres, des pastilles typées, un identifiant de gabarit pour la
prochaine séance. Les libellés sont dans `plan.json`, les noms dans le
catalogue.

## Une seule frise

`PlanTimeline` remplace la sparkline, la jauge et le pourcentage. Une colonne
par semaine, toutes de la même largeur, sur trois étages :

1. **Les repères** : un triangle plein au-dessus de la semaine en cours, un
   drapeau au trait au-dessus de la semaine de course (sur la dernière
   semaine quand le générateur a posé la course au-delà).
2. **Les barres**. La hauteur est le prévu de la semaine rapporté au plus gros
   du plan. Le contour dit où l'on est : le filet de la maison pour une
   semaine passée, 2,5 px d'encre pour celle en cours, un pointillé à 40 %
   pour une à venir. Le remplissage, depuis le bas, en `--zone-4`, est le
   fait. Ce qui n'a pas été fait reste vide, et c'est voulu : ça se voit.
3. **Les phases** : un segment par phase, à la largeur de ses semaines, sur la
   rampe des zones (base `--zone-1`, construction `--zone-3`, pic `--zone-5`,
   affûtage `--zone-2`). Le libellé s'abrège (`Constr.`, `Aff.`) quand son
   segment fait moins de 96 px, par requête de conteneur. Celui de la phase
   en cours est en encre pleine.

Une frise dit tout ce que les quatre disaient, plus ce qu'aucun ne disait :
le fait de chaque semaine contre son prévu. La version large ajoute une
ligne `S1…Sn`.

La classe est `.zn-planline`, pas `.zn-timeline` : ce nom est déjà la frise
des zones d'une séance (`visualization.css`), et les deux se peignaient l'une
l'autre.

## Plus aucun vermillon dans les cartes

La règle du dépôt est un accent par écran, et sur `/plans` c'est Créer un
plan. L'ancienne sparkline peignait la semaine en cours en vermillon, un
deuxième accent, à côté de la corbeille vermillon au survol. La frise
n'utilise que l'encre et la rampe des zones, et la semaine en cours se
distingue par trois canaux qui ne sont pas des couleurs : son trait épais,
son triangle, son libellé de phase en encre pleine. L'information ne passe
jamais par la couleur seule.

Le seul vermillon restant dans une carte est dans le menu, Supprimer en
`--accent-press`, une fois le menu ouvert.

## Le menu ···

Voir et la corbeille sont partis. Voir doublait le lien de la carte, et la
corbeille, toujours visible au poids du reste, mettait le geste le plus rare
et le plus destructeur au niveau du contenu. Les gestes rares sont dans un
bouton ··· de 44 px, posé sur la carte mais hors du lien, avec une étiquette
qui nomme le plan (`Actions du plan Marathon de Séville`) :

- **Exporter…** ouvre un sous-menu PDF, calendrier, JSON à partir de
  640 px. Sous 640 px, il n'y a pas de sous-menu : il n'avait de place ni à
  droite ni à gauche du menu, et Radix le poussait hors de l'écran. Les trois
  formats sont alors une rangée de trois cibles dans le menu même, sous
  l'intitulé Exporter, l'icône au-dessus du mot. Une rangée et pas trois
  lignes : empilés, ils portaient le menu à 330 px, plus que la place sous
  le bouton, et il s'ouvrait vers le haut, Supprimer caché sous un
  défilement. En rangée, il fait 258 px et s'ouvre en entier. Les trois
  fonctions sont celles de `PlanExportMenu`, extraites dans `usePlanExport`
  pour que le bouton de la page du plan et ce menu ne divergent pas.
- **Dupliquer** passe par `duplicatePlan`, sans limite de nombre (décision du
  propriétaire). La copie prend le suffixe `(copie)`. Elle garde les dates de
  l'original : la copie d'un plan terminé est un plan terminé, et rejoint
  l'historique.
- **Renommer** édite le nom **en place**, dans la carte : Entrée ou la sortie
  du champ enregistrent, Échap annule. Pas de boîte de dialogue, jugée trop
  intrusive pour un geste de cette taille. `savePlan` le permet sans logique
  neuve, comme la page du plan, qui écrit déjà `config.planName`. La page
  `/plans` lit désormais ce nom en premier, comme la page du plan, alors que
  l'ancienne carte l'ignorait pour un plan généré.
- **Supprimer…**, sous un séparateur, ouvre la boîte de confirmation qui
  existait déjà.

Radix porte le clavier : flèches, Entrée, Échap, retour du focus au bouton,
sauf après Renommer, où le focus va dans le champ.

## La prochaine séance

En pied de carte, sous un filet : la première séance non close dont le jour
est aujourd'hui ou plus tard (`Ven. 20 · Sortie aérobie légère · 36min`). Une
séance faite ou sautée n'est plus à venir. Le lien mène à
`/plan/:id?week=N`, la semaine de la séance dans la vue du plan : `/today` ne
prend pas de date en paramètre, alors que `?week=` est lu par la page du plan.
Le nom vient du catalogue, chargé paresseusement ; en attendant, ou pour une
activité, un libellé générique.

## Les pastilles

Au plus trois, dans cet ordre : la distance, la pratique, l'objectif, le mode
(libre ou préconstruit). L'ancien badge mélangeait deux axes, un mode et une
distance, en une seule pastille ; elles sont maintenant séparées. Une distance
Trail ne s'accompagne pas d'une pratique Trail, ce serait deux fois le même
mot.

## L'historique compact

Un plan terminé n'a ni compte à rebours ni prochaine séance, et il prenait
pourtant autant de place qu'un plan en cours. Les plans terminés tiennent
dans une seule section, `Terminés · N`, sur le fond `--surface-band` avec le
filet d'encre et le rayon `--r-xl`, une ligne par plan : le nom (le lien), la
période et la nature, une frise miniature (mêmes contours et remplissages,
sans repères ni phases, décorative puisque les chiffres sont écrits à côté),
les séances faites sur prévues, et le même menu ···.

## Selon la largeur

| Largeur | Plans en cours | Plans terminés |
|---|---|---|
| < 640 px | cartes empilées | liste |
| 640 à 1023 px | cartes sur deux colonnes, alignées en haut | liste pleine largeur |
| ≥ 1024 px | une carte large par plan, empilées | tableau |

Les seuils sont ceux de la typographie (640) et de la barre du haut (1024).
La carte large est une grille `minmax(0, 340px) 1fr` : à gauche les
pastilles, le nom, le compte à rebours et les deux chiffres, à droite la
ligne `Semaine 2/5 · Construction` avec le ··· et la frise en 132 px, la
prochaine séance en pleine largeur dessous. Le tableau est un vrai `<table>`,
six colonnes (Plan, Période, Séances, Volume, Semaines, ···) : 
`ResponsiveTable` ne convenait pas, il bascule à 768 px et en cartes.

Carte ou large, liste ou tableau : c'est la page qui choisit, par
`useMediaQuery("(min-width: 1024px)")`, et pas deux arbres masqués en CSS,
qui doubleraient les liens et les étiquettes pour un lecteur d'écran.
L'en-tête passe ses actions sous le titre sous 1024 px.

## Alignements

Relevés sur les captures et corrigés, mesures à l'appui (positions relatives
de chaque étage, prises dans le DOM) :

- **Deux cartes côte à côte, entre 640 et 1023 px, s'alignent étage par
  étage.** Chaque carte est une sous-grille (`grid-template-rows: subgrid`)
  de six rangées prises dans la grille de la page : pastilles, nom, compte à
  rebours, frise, chiffres, prochaine séance. Des pastilles sur deux lignes
  dans une carte agrandissent l'étage des deux, au lieu de tout décaler dans
  une seule. Avant : 463 et 455 px de haut, chaque étage décalé de 27 px.
  Après : 481 px toutes les deux, mêmes décalages au pixel. Les pieds font la
  même hauteur, leur texte calé en haut et leur flèche au milieu.
- **Les cartes larges empilées ont la même hauteur** (`grid-auto-rows: 1fr`).
  Les chiffres à date se posent au pied de la colonne de gauche et la frise
  au pied de celle de droite : le bas des chiffres et celui des libellés de
  phases sont sur une même ligne.
- **Le compte à rebours et la semaine** sont quatre cellules sur deux
  rangées : les grands chiffres partagent leur ligne de pied, les libellés
  leur ligne de tête, quel que soit le nombre de lignes de chacun.
- **Les libellés à point médian** (`Course · dim. 10 janv.`,
  `Semaine · Construction`, la période d'un plan terminé) ne passent à la
  ligne qu'entre deux segments, jamais dedans. Le point est dessiné en CSS
  dans l'écart et rogné quand le segment suivant ouvre une ligne : il ne
  reste jamais seul en bout de ligne (`Segs`, `.zn-segs`).
- **Les phases tombent sur les bords des semaines.** Les quatre étages de
  la frise (repères, barres, numéros, phases) sont une même grille de N
  colonnes au même écart, et une phase occupe les colonnes de ses semaines
  (`grid-column: start / span n`, `start` donné par le modèle). Avant, les
  segments étaient en flex au prorata des semaines : ils ne comptaient qu'un
  écart entre deux phases, là où les barres en comptent un par semaine, et
  chaque frontière dérivait de 1 à 2 px. Mesuré après : 0 px à chaque bord,
  à 390, 800 et 1280 px.
- **L'historique sous 480 px** passe la frise et le compte sous la période.
  Les trois colonnes de la liste ne laissaient que 155 px au nom : un nom de
  vingt lettres et sa période passaient chacun sur deux lignes.
- **La mini-frise de la liste** dessine le prévu en teinte claire
  (`--zone-2`) et le fait en `--zone-4`, sans contour. Onze semaines dans
  44 px laissent 3 px par barre, et un contour de 1 px de chaque côté n'y
  laissait rien à remplir : la frise se lisait comme une rangée de traits.
  Le tableau, à 150 px, garde le contour.

Ce qui reste volontaire : sur un téléphone, deux cartes empilées gardent
chacune leur hauteur, puisqu'aucune ligne ne les compare ; et une frise de
quatre semaines a des barres larges, parce que toutes les frises occupent la
même largeur.

## Thèmes et contrastes

Clair et sombre par les seuls tokens. Les libellés mono de 10 et 11 px sont en
`--text-faint` : 5,4:1 sur la carte et 4,65:1 sur le fond de l'historique en
clair, 5,0:1 et 5,9:1 en sombre. Supprimer en `--accent-press` : 7,2:1 en
clair, 5,4:1 en sombre.

## Les autres étagères : semaines, séances, simulations

Le bouton ··· est un composant partagé, `ActionsMenu`
(`src/components/ui/actions-menu.tsx`, styles `.zn-more` dans
`dropdown-menu.css`) : une cible de 44 px, une étiquette qui nomme l'objet,
une marge de 16 px contre les bords de l'écran, la destructive en dernier sous
un séparateur. `PlanActionsMenu` le compose pour un plan ou une semaine
(export, partage, duplication, renommage, suppression). Il sert à trois
étagères de plus, qui portaient toutes la même rangée de boutons et la même
corbeille toujours visible :

- **`/weeks`**. La carte de semaine EST la carte de plan (`.zn-plancard
  .zn-weekcard`, plans.css), à quatre étages : catégorie, nom, faits, rythme.
  Voir, le bouton Exporter et le ⋮ de 32 px sont partis pour le bouton ···
  posé sur la carte (Exporter…, Partager, Dupliquer, Renommer, Supprimer…).
  Renommer écrit `planName`, `name` et `nameEn`, comme la page de la semaine.
  Les cartes d'une rangée sont des sous-grilles de la grille : avant, un nom
  sur trois lignes descendait les faits, le rythme et les boutons de 23 px
  par rapport aux voisines ; après, chaque étage tombe au même pixel. Les
  faits sont des segments, qui ne laissent plus un point en bout de ligne.
  Sur un téléphone, Partager rejoint la rangée d'export (Exporter ou
  partager : PDF, ICS, JSON, Lien) : avec une ligne de plus, le menu
  dépassait la place sur un iPhone SE et cachait Supprimer sous un
  défilement. Il fait 258 px et s'ouvre en entier sur les deux téléphones
  mesurés.
- **Mes séances** (`/workout/builder`). L'export JSON et la corbeille passent
  dans le bouton ···. Le favori reste dehors : c'est un état, pas une action.
  Sous 480 px la flèche de la ligne, redondante avec la ligne-lien, rend sa
  place au nom, et les faits sont des segments (`1` et `blocs` se
  coupaient).
- **Les simulations sauvegardées** (`/race-simulator`). Charger reste dehors,
  c'est l'action de la ligne ; Partager et Supprimer… passent dans le bouton
  ···. Partager réutilise la fonction de la page, élargie à une simulation
  sauvegardée. La liste déclare sa colonne : sa colonne implicite prenait la
  largeur naturelle de la ligne, qui débordait de 16 px sur un téléphone de
  320 px.

Les menus restent dans l'écran à 320, 393, 640, 800, 1024 et 1280 px, mesuré.


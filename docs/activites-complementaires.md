# Les activités complémentaires, et le terrain préparé pour le triathlon

Ce document existe pour la même raison que `docs/pratiques.md` : **que le
prochain chantier ne rejoue pas ces décisions**. Elles ont été tranchées par le
propriétaire ou imposées par la forme des données, et les défaire demande une
nouvelle décision, pas une initiative.

## Le trou

Quelqu'un prépare un marathon et va au travail à vélo quatre fois par semaine.
Ces quatre trajets sont du temps, de la fatigue et du dénivelé, et le plan n'en
savait rien : il annonçait 4 h de semaine là où la personne en vivait 6, et la
charge qu'il calculait était fausse dans le seul sens qui blesse, elle
sous-estimait.

Dit par le propriétaire : *« des fois je fais du vélotaf et ce n'est pas
forcément inclus dans mon plan, et le volume n'est pas forcément bien compris,
les efforts et caetera »*.

## Trois façons de ne pas le boucher, et pourquoi elles sont écartées

| | pourquoi non |
|---|---|
| une séance de plus dans le plan (`__activity_cycling__`) | C'était une séance VIDE, sans métrique, à poser à la main dans la bonne semaine. Et elle disparaît avec le plan, alors que le vélotaf, lui, ne s'arrête pas entre deux cycles. Elle porte depuis une durée et un effort, pour la semaine type, voir plus bas. |
| le motif récurrent (`CommutePattern`) | Il dit ce qu'on fait D'HABITUDE, pas ce qu'on a fait mardi. C'est une hypothèse, pas un relevé. Il reste utile pour ça, et pour ça seulement : il **pré-remplit** le formulaire. |
| ne rien faire et arrondir | L'état d'avant. |

Une activité est donc un **relevé daté**, dans sa propre clé
`zoned-activities`, qui vit hors des plans. Elle existe sans plan, elle survit
au plan, et un plan la retrouve **par ses dates**. C'est tout le couplage entre
les deux, et il va dans un seul sens : `PlanStatsSection` lit le journal, le
journal ne sait pas qu'il existe des plans.

Aucune migration, aucune montée de version de schéma : une clé nouvelle,
absente chez tout le monde, et absente vaut journal vide.

## Un seul champ obligatoire, et c'est la durée

Ce n'est pas une facilité. C'est la seule métrique qui existe TOUJOURS, on sait
toujours combien de temps on a pédalé et pas toujours combien de kilomètres,
et c'est la seule dont la charge se calcule.

La distance, le dénivelé et les watts sont des précisions. Rendre la distance
obligatoire aurait paru anodin et aurait fermé la porte au cas le plus
fréquent : le trajet quotidien dont on connaît le temps par cœur et jamais le
kilométrage exact. **Un relevé approximatif enregistré vaut infiniment mieux
qu'un relevé exact jamais saisi.**

Les watts sont derniers et jamais exigés : ils demandent un capteur.

### Et l'écran le dit, il ne se contente pas de l'écrire

La première version alignait les six champs au même poids sous une ligne qui
annonçait qu'un seul comptait : l'écran démentait la phrase posée juste
au-dessus. Trois choses le remettent d'accord avec elle.

**La durée se saisit dans un champ, au masque `h:mm`.** Le champ en minutes
demandait une conversion mentale avant la première frappe, on pense 1 h 25 et
on tapait 85. Le masque la supprime sans ajouter de case : un champ, un
clavier numérique, et les chiffres qui entrent par la DROITE comme sur un
chronomètre, les deux derniers tapés sont toujours les minutes. On tape 45 et
on lit 0:45, on tape 125 et on lit 1:25.

L'autre sens, remplir les heures puis les minutes, aurait rendu la saisie
courte ambiguë et coûteuse à la fois : 45 voudrait dire 45 h autant que
45 min, et un trajet d'une demi-heure se serait tapé 0030. Le cas le plus
fréquent de l'écran est une durée de moins d'une heure, c'est lui qui doit
coûter deux frappes.

Le parsing reste tolérant : 0:90 vaut 1 h 30, et se RANGE à l'écran au moment
où le champ est quitté plutôt que d'être refusé (`lib/durationFields.ts`). Le
stockage, lui, ne bouge pas : `durationMin` reste des minutes, la conversion
vit à la frontière du formulaire.

**Les précisions sont repliées** derrière un `<details>`. Le repli s'ouvre tout
seul dans les deux cas où le fermer mentirait : quand on modifie une activité
qui en porte déjà, et quand un rappel vient d'en poser. Rien ne s'enregistre
que l'écran ne montre.

**Le journal répond à la place de l'utilisateur.** Le vélotaf se répète, et la
durée cherchée était déjà trois lignes plus haut. Une rangée de trois durées
déjà enregistrées, même sport et même motif, la repose d'un appui
(`lib/activityRecall.ts`), classées par fréquence et non par date pour que le
trajet de tous les matins passe devant la sortie exceptionnelle de dimanche.
C'est de la reconnaissance au lieu du rappel de mémoire.

Un rappel ne PRÉ-REMPLIT rien, il se propose. La distinction n'est pas
cosmétique : un relevé posé par la machine et enregistré sans être regardé est
un chiffre inventé qui compte ensuite dans la charge. Le motif récurrent du
profil, lui, pré-remplit, parce que c'est une valeur explicitement déclarée.

## Déplacement contre entraînement, et pourquoi c'est en première classe

`ActivityPurpose` vaut `commute`, `transport` ou `training`. Ce n'est pas une
étiquette de rangement, c'est une information d'entraînement.

Un trajet domicile-travail et une sortie longue de vélo ne se lisent pas
pareil : le premier est du volume et de la fatigue sans être un stimulus
(allure basse, arrêts, sac sur le dos), la seconde est une séance. Les
confondre ferait dire au plan qu'on a fait six heures de qualité dans la
semaine, ce qui est le mensonge inverse de celui qu'on corrige.

`commute` et `transport` sont deux déplacements, et se comptent ensemble
partout où un écran dit déplacement (`isTravel`). Ils sont quand même
distingués parce que le premier se répète, donc se pré-remplit, et pas le
second.

## Par où l'on note, et pourquoi c'est une seule saisie

Trois portes, et elles ne peuvent pas diverger : elles ouvrent le MÊME panneau
(`ActivityLogPanel`), branché par le MÊME hameçon (`useActivityLog`).

| Porte | Où | Le jour visé |
| --- | --- | --- |
| `J'ai fait autre chose` | cockpit, sous la bande des sept jours | le jour CHOISI de la bande, pas aujourd'hui : on note souvent la veille au soir |
| `J'ai fait autre chose` | page du plan, bloc de la semaine en cours | aujourd'hui quand la semaine en vue est celle qu'on vit, son lundi sinon |
| `Ajouter une activité` | page du plan (onglet statistiques) et journal | aujourd'hui |

Le hameçon porte tout ce qui entoure la saisie : l'ouverture, le jour visé, la
distinction entre création et correction, l'écriture, le toast, la fermeture,
et la lecture du motif récurrent qui pré-remplit. Une quatrième copie de ce
travail aurait fini par demander autre chose que les trois premières.

### La marque de la saisie : un cadre et un plus

Les deux premières portes ont porté quelque temps la marque des SORTIES du
cockpit, un texte suivi d'une flèche. C'était une erreur de catégorie, et la
rangée du cockpit l'enseignait elle-même : sa flèche dit deux choses à la
fois, c'est un geste ET il emmène ailleurs. Tirer une séance tient les deux,
elle navigue vers `/library/draw`. La saisie ne tient que la première : elle
ouvre un panneau sur place et elle écrit. La flèche promettait donc une page
qui ne venait jamais, et un texte fléché au milieu de deux liens se lisait
comme une légende plutôt que comme un contrôle.

Trois registres, trois marques, et la marque seule les distingue :

| Marque | Ce qu'elle promet | Exemple |
| --- | --- | --- |
| cadre + `+` | ça agit ICI, et ça écrit | la saisie d'une activité |
| texte + flèche | un geste, et il emmène ailleurs | tirer une séance |
| texte souligné | un lieu | Ma semaine |

Le `+` est celui du bouton du journal : un seul signe pour ajouter une
activité, où que l'on soit. Les mots, eux, restent à la première personne
(`J'ai fait autre chose`) là où ils répondent à la séance du jour affichée
juste au-dessus ; c'est le cadre qui dit que c'est un contrôle, les mots n'ont
pas à le faire.

### Une seule liste en mémoire

`useActivities` tient un magasin de MODULE derrière `useSyncExternalStore`, et
non un état par composant. La page d'un plan en porte deux lecteurs, le bloc de
la semaine qui saisit et le bloc de statistiques qui affiche : avec un état par
composant, noter un trajet depuis le premier n'aurait pas bougé le second, et
l'écran aurait dit à la fois 1 h 25 et rien du tout.

### Une porte ne disparaît pas parce qu'elle est vide

Le bloc du complément, sur l'onglet statistiques, ne s'affichait que s'il avait
des chiffres. C'est la bonne règle pour une donnée et la mauvaise pour une
porte : c'est précisément l'écran où l'on vient constater que son volume ne
colle pas, et il ne disait nulle part que le vélotaf se note. Quand la saisie
est offerte, le bloc reste, et l'invitation prend la place que les chiffres
n'occupent pas encore. En lecture seule (l'aperçu d'un plan pré-construit, qui
n'est pas le sien), il disparaît comme avant.

## Ce qui s'additionne, et ce qui ne s'additionne pas

Une règle porte tout `activityStats.ts` :

- **le TEMPS s'additionne** entre disciplines. Une heure de vélo et une heure
  de course font deux heures d'entraînement. C'est le chiffre qui manquait ;
- **les KILOMÈTRES ne s'additionnent pas.** 30 km de vélo et 10 km de course ne
  font pas 40 km, et 40 est exactement le genre de chiffre qui se retient et se
  répète. La distance est rendue PAR DISCIPLINE, et **il n'existe aucune
  fonction qui en fasse un total** ;
- **le DÉNIVELÉ s'additionne** : un mètre monté est un mètre monté.

### Et la règle doit se VOIR, sinon la carte a l'air de se contredire

La première version du bilan de semaine appliquait la règle sans la dire, et
affichait donc, l'un au-dessus de l'autre, `KM 0 / 56` et une ligne
`Vélo 1h25 · 26,6 km`. Les deux chiffres étaient justes. Le premier ne disait
simplement pas qu'il comptait des kilomètres de COURSE seuls
(`plannedSessionKm` rend zéro dès qu'une séance n'en est pas), et rien ne
disait pourquoi les kilomètres de vélo n'y entraient pas. Un écran qui a l'air
de se contredire n'est pas cru sur le reste.

Deux corrections, et aucune n'est une phrase :

1. **Le fait porte son sport**, `km course`.
2. **Le détail devient un tableau du volume de la semaine**
   (`WeekReview.byDiscipline`), séances du plan comprises : une ligne par
   sport, une colonne par grandeur, le plus de temps d'abord. Les séances et
   les activités d'un MÊME sport s'y additionnent, puisque c'est exactement ce
   que la règle autorise.

Le tableau **n'a pas de ligne de total**, et c'est le propos : le temps total
est déjà dans les faits au-dessus, et les kilomètres ne se totalisent nulle
part. La règle est dans la forme plutôt que dans une note de bas de page.

## La charge : session-RPE, et rien d'inventé

`charge = durée x RPE` (session-RPE, Foster 2001). C'est la méthode que le
dépôt utilise déjà pour ses séances, et elle a le mérite de valoir pour tous
les sports **sans coefficient de conversion entre eux**. Une conversion
vélo-vers-course par la distance aurait demandé un facteur inventé ; celle-ci
ne demande que les deux champs qu'on a.

L'unité est arbitraire et n'est comparable qu'à elle-même, d'une semaine à
l'autre. C'est ce qu'on lui demande.

Une activité sans RPE saisi en reçoit un **du motif** (`defaultRpe` : 3 pour un
déplacement, 5 pour un entraînement). Il FAUT une valeur : sans elle la charge
vaudrait zéro, c'est-à-dire disparaîtrait de la charge tout en apparaissant
dans le volume, et deux chiffres qui se contredisent valent moins qu'un seul.
Les défauts sont bas, ce qui est le bon sens d'un défaut : se tromper vers le
bas coûte moins que gonfler la charge de tout le monde.

Les **watts ne comptent pas dans la charge**. Ils n'existent qu'à vélo et
seulement chez qui a un capteur : les y faire entrer donnerait deux charges
incomparables selon l'équipement. Ils sont rendus à part, moyennés au prorata
du temps (une moyenne de moyennes donnerait autant de poids à un trajet de dix
minutes qu'à une sortie de trois heures).

## La bande des sept jours gagne un second canal

La bande du cockpit ne dessinait que le plan, donc **une journée passée à
pédaler jusqu'au bureau s'y lisait REPOS**, c'est-à-dire le contraire de ce qui
s'était passé. C'est le seul mensonge qu'une bande de sept jours puisse
commettre, et une bande qui ment ne sert plus à rien.

Le complément descend **sous le sol** plutôt que de s'ajouter à la pile. Deux
raisons, et la seconde est la vraie :

1. partager le budget de la colonne ferait rétrécir les blocs du plan les jours
   de vélotaf, et sept hauteurs qui ne mesurent plus la même chose d'un jour à
   l'autre ne se comparent plus ;
2. **ce n'est pas la même grandeur.** Une heure de vélotaf n'est pas une heure
   de séance, et les empiler dirait qu'elles le sont. Au-dessus du sol, ce que
   le plan demande ; en dessous, ce que la vie a ajouté.

L'échelle du canal lui est donc **propre** (`extraBlockHeight`, `longestExtra`) :
les compléments se comparent entre eux, et jamais à une séance.

Trois réglages trouvés en regardant le rendu, et pas en l'écrivant :

- **le sol est plus large que la barre.** À largeur égale il se lisait comme un
  bloc de plus : on voyait trois barres empilées un jour de repos, le filet du
  repos, le sol, et le complément. Débordant, et repris à l'identique sur les
  sept colonnes, il devient une ligne que les écarts interrompent ;
- **deux pixels entre la barre et le sol**, sinon le filet d'un jour de repos et
  le sol font un trait unique de quatre pixels, et un jour de repos semble
  porter quelque chose ;
- **le canal est plus étroit que la barre**, dix pixels contre dix-huit. À
  largeur égale le complément pesait autant qu'une séance, ce que la position
  seule ne corrigeait pas.

## Le bilan du dimanche

`weekReview.ts` rend des nombres et un verdict. **Aucune phrase** : les mots
sont dans les traductions, le seul endroit où ils peuvent exister en deux
langues.

### Des chiffres, pas des adjectifs

La première version du panneau était **un paragraphe et une liste de
définitions** : une phrase qui jugeait la semaine (*la semaine a fait son
travail*), puis cinq couples étiquette-valeur. De l'éditorial dans une app qui
dessine, et redondant par-dessus le marché : la phrase ne disait rien que
`3 / 4` ne dise déjà, en trente mots de plus.

Le système a une règle pour ça, et elle est littérale. Le bilan l'applique :

- **le rapport EST le titre**, au corps d'affichage, avec son micro-label
  dessous. Aucune phrase ne le commente, parce qu'aucune n'en dit plus. Les six
  verdicts rédigés (*ratée*, *à moitié*, *solide*…) ont disparu de l'écran ;
- **le volume est une barre**, dans la grammaire que le reste de l'app emploie
  déjà (`.zn-pstats__progress`) : un contour pour le créneau, un plein pour ce
  qui a eu lieu. Trois grandeurs sur un seul axe, ce qui les rend comparables
  d'un coup d'oeil là où trois nombres demandent une soustraction.

  ```
  |==========++++++  |
   fait      en plus ^ prévu
  ```

  Dépasser le repère se **voit**, et c'est exactement la semaine que l'app ne
  savait pas décrire : quatre heures annoncées, six heures vécues ;
- **une phrase ne survit que là où il n'y a pas de chiffre à montrer** : rien
  n'est clos, ou il n'y avait pas de plan cette semaine. Deux cas, deux lignes
  courtes, et c'est tout ce qui reste de prose.

Deux détails que seul le rendu a révélés : le repère du prévu **siège hors de la
piste**, qui est en `overflow: hidden` (dedans, il était un filet d'encre posé
sur un segment d'encre, donc le repère le plus important du dessin était le seul
qu'on ne voyait pas) ; et un segment de zéro **n'a pas de légende**, sinon une
semaine dont rien n'est clos affiche `0s fait` à côté d'une pastille verte qui
ne peint rien.

**Aucun vermillon dans ce bloc.** L'accent de l'écran est pris par son appel
primaire, *voir le détail* sur le cockpit, *ajouter une activité* sur le
journal. Un repère en accent en ferait un second, et deux accents ne font plus
d'accent.

**Et pas de doodle.** Le dessin de ce bloc, c'est la barre ; le cockpit porte
déjà la figure de sa porte, et `docs/doodles.md` juge une figure sur ce qu'elle
retire, pas sur la place disponible.

Deux honnêtetés qui coûtent, et qu'on paie :

1. **Une séance non close n'est pas une séance sautée.** Compter tout ce qui
   n'est pas coché comme raté donnerait 0 % d'observance à quelqu'un qui a tout
   couru sans rien cocher, et un bilan qui accuse à tort ne se relit pas deux
   fois. Tant qu'aucune séance n'a été tranchée, le verdict est `pending` et le
   bilan REFUSE de juger.
2. **L'observance se mesure sur ce qui était prévu**, pas sur ce qui a été
   tranché. Clore une séance sur cinq et l'avoir faite ne fait pas 100 %.

Le bilan n'a **pas d'écran à lui, et n'en veut pas** : la bande des sept jours
du cockpit CHOISIT déjà un jour, donc choisir dimanche est le geste qui demande
le bilan. Il ne s'affiche pas les autres jours, et jamais s'il n'a rien à dire.
Il est aussi en tête de `/activities`, où quelqu'un qui ouvre la page un
dimanche soir vient pour lui.

Sans plan en cours il porte sur la **semaine calendaire** : le vélotaf n'attend
pas d'avoir un plan pour compter.

## Où ça se saisit, et pourquoi pas dans la nav

| surface | ce qu'elle fait |
|---|---|
| `/today` | La saisie en dix secondes, sur le JOUR CHOISI de la bande et non sur aujourd'hui : on note souvent la veille au soir. Plus la liste des activités du jour, qui est l'accusé de réception. |
| `/activities` | Le journal : relire, corriger, totaliser. Aucun de ces trois gestes n'a sa place sur un écran qu'on ouvre debout avant de sortir. |
| `/plan/:id`, onglet statistiques | Ce qui a été fait en plus, sur les dates du plan. |
| `/profile`, onglet vélotaf | Le motif récurrent dit explicitement qu'il est une habitude et renvoie au journal. |

Les deux premières partagent le **même** panneau (`ActivityLogPanel`), donc
elles ne peuvent pas diverger.

`/activities` **n'a pas d'entrée dans la navigation**, et c'est délibéré : le
budget des portes est de 18 entrées (`nav-coverage.test.ts`), il tient, et
« 28 décisions avant la première séance » est le défaut que ce budget existe
pour empêcher. La page se joint par le pied de page, par Cmd+K, depuis le
cockpit quand il y a quelque chose à relire, et depuis le profil. Le préfixe
`/activities` marque quand même la porte Mes chiffres : la page appartient à
cette famille, elle n'y a simplement pas de ligne.

## La semaine type : un gabarit, pas un relevé

Le journal est daté, et c'est sa force. C'est aussi ce qui le rend muet sur la
**semaine type** (`/weeks`, un plan d'une semaine sans dates) : on ne peut pas
y « noter mardi », il n'y a pas de mardi. Le propriétaire a rencontré le trou
exactement là : *« je me suis ajouté des séances de vélo qui sont en réalité
du vélo taff mais tu le vois bien c'est pas bien représentatif »*. Trois
`__activity_cycling__` sur le tableau, et la semaine annonçait 3 séances,
3,1 h, un rythme à plat les trois jours de vélo et une polarisation « trop
d'intensité 65 / 35 », parce que trois cartes sans durée pèsent zéro.

La réponse n'est PAS d'apporter le journal dans la semaine type : un gabarit
dit ce qu'on prévoit, un relevé dit ce qu'on a fait, et les mélanger
referait la confusion que ce document passe son temps à défaire. La réponse
est que la carte posée porte ce qu'un gabarit sait dire, et rien de plus
(`lib/activitySession.ts`) :

- **une durée**, dans `estimatedDurationMin`, le champ que toute séance a
  déjà, et le seul obligatoire, même règle que le journal ;
- **un effort prévu**, `intensity`, en trois mots (facile, modéré, dur) et
  pas dix paliers. On prévoit un vélotaf facile, on ne le prévoit pas à 3/10 ;
  l'échelle fine est celle de l'après-coup.

L'effort devient une zone (Z2, Z3, Z4), et la zone fait le reste par les
chemins qui existaient : la polarisation classe l'activité par sa zone comme
n'importe quelle séance (`weekStats.ts`), le rythme lui donne sa hauteur et
sa couleur, et la charge est le TSS de la zone, `runTssFromZone`, la même
unité que les séances de course. Le renforcement, le yoga et le repos actif
n'ont pas de zone : ils comptent en temps, jamais dans la polarisation.

Le vélotaf a son entrée dans le panneau, `__activity_commute__`, en premier
parce que c'est lui qu'on pose trois fois. Il se pré-remplit de la durée du
profil (`CommutePattern`), reprise telle quelle : c'est une valeur déclarée,
et doubler pour un aller-retour que personne n'a annoncé serait inventer un
chiffre. L'écran le dit et se corrige d'un geste. Une carte sans durée reste
possible, elle annonce « Durée à régler » et pèse zéro : elle n'est pas une
séance, c'est une séance en attente de sa seule question.

## Souple ou fixée : comment une séance de la semaine compte

Le propriétaire, sur la semaine type : *« je ne sais pas si c'est pertinent
vraiment de mettre des valeurs fixes pour les séances. Encore pour les trucs
de VMA, ok, mais pour les footings [...] si tu fais ton footing, comment toi
tu le sens »*. Le modèle figeait tout : chaque séance posée gelait une durée,
même celles que personne n'avait décidées, et une semaine type portait le même
chiffre faux qu'une semaine actée.

Chaque séance porte donc une **précision** (`PlanSession.precision`,
`lib/sessionPrecision.ts`) :

| | ce qui compte | la forme |
|---|---|---|
| `loose`, souple | le MILIEU de la fourchette du gabarit ; les km sont une estimation à l'allure, jamais une donnée | la semaine type |
| `fixed`, fixée | la durée et les km posés | la semaine actée, ou partagée à quelqu'un qui doit la suivre |

Absente, elle vaut `fixed` : c'est ce que toute séance déjà enregistrée
était, sans le dire. Le défaut à la pose suit ce qu'on décide vraiment : une
séance Z4 et plus se prévoit au chrono, elle naît fixée ; un footing ou une
sortie longue se court à la sensation, il naît souple. Le renfo reste fixé.

Ce qui en découle, et qui a été corrigé au passage : la semaine comptait la
durée du GABARIT (`getAnyWorkoutDuration`) et non celle de la séance, donc
une séance fixée à 32 min pesait toujours ses 45 de catalogue. Le créneau
(`WeekSlot.durationMin`) porte désormais la durée de la séance, et la charge
est le TSS du gabarit mis à l'échelle de cette durée.

Le lien de partage porte la précision et les kilomètres dans deux positions
de plus du tuple, en fin, avec la règle habituelle : une position écrite
entraîne l'écriture de toutes celles d'avant à leur valeur « absente », et un
lien ancien décode sans changement.

## La page de la semaine sur un téléphone

Le tableau et le générateur côte à côte, ça marche sur un écran large. Les
mêmes briques empilées sur 390px cassaient la hiérarchie : le résumé prenait
le premier écran entier et la semaine commençait un écran et demi plus bas ;
le dock criait « Générer » en permanence ; l'échelle d'intensité apparaissait
deux fois ; le `+` de chaque jour était petit, calé à droite et masqué par le
dock sur les derniers jours ; le menu contextuel à la position du doigt était
un geste de souris. Sous 900px, donc :

- le **tableau vient d'abord** et le résumé se replie en une ligne
  (`WeekSummaryStrip`) : les chiffres, le verdict 80/20, une vignette du
  rythme, et le résumé complet derrière « Détails » ;
- le **dock porte l'action du moment** : Ajouter une séance en vermillon, le
  tirage et les réglages en pastilles à côté ;
- une **seule échelle**, sous le tableau ;
- un appui sur une carte ouvre **sa feuille** (`WeekSessionSheet`), en bas :
  souple ou fixée, durée et km, ou durée et effort pour une activité, puis
  les gestes du menu, voir, re-tirer, verrouiller, déplacer, retirer. Sur un
  écran large la même feuille vient du bord ;
- le panneau d'ajout remplace son menu déroulant par une **rangée de puces**
  qui expose tous les catalogues (course par famille, renfo, vélo, natation,
  activités, les siennes), choisit le **jour** quand il s'ouvre depuis le dock,
  et met **« Créer une séance »** en tête : le constructeur s'ouvre avec le
  chemin du retour, et la séance enregistrée se pose sur le jour choisi.

Deux pièges payés une fois. La feuille s'ouvre sur `touchend`, et le
navigateur rejoue ensuite le même appui en `mousedown` sur ce qui est
maintenant sous le doigt, la scène, qui la refermait avant qu'on la voie : la
première demi-seconde de `mousedown` est cet écho, jamais un renvoi. Et un
`mock.module` de bun vaut pour tout le processus de test : le test du partage
remplaçait `weekToPlan` par un bouchon, et ce bouchon servait aussi aux autres
fichiers du même run.

## Le terrain préparé pour le triathlon

Le propriétaire : *« à la fin, le but, ce sera vraiment de faire du triathlon
[...] il faudrait aussi préparer le terrain pour prendre en compte à la fois la
course à pied, à la fois la natation et à la fois le vélo, avec si déplacement
transport, si entraînement »*.

Ce qui est prêt, et ce qui ne l'est pas :

- `ActivityDiscipline` **est** l'union `Discipline` du dépôt, course, vélo,
  natation, plus `other`. Le jour où l'objectif est un triathlon, ce même relevé
  porte les trois disciplines **sans changer de forme** ;
- `ActivityPurpose` continue alors de distinguer le déplacement de
  l'entraînement, ce qui est précisément la question que se pose un triathlète
  qui va au travail à vélo ;
- `ACTIVITY_DISCIPLINE_META` est la seule table qui dise ce qu'une discipline
  sait porter (unité de distance, dénivelé, watts). Une discipline de plus, ou
  un champ de plus, s'y ajoutent une fois. La natation se SAISIT en mètres et
  se stocke en kilomètres comme le reste : une seule unité en mémoire, une
  conversion à la frontière du formulaire, et nulle part ailleurs ;
- la charge en session-RPE vaut déjà pour les trois disciplines, sans
  coefficient à écrire.

**Ce que ça ne fait pas, et ne prétend pas faire** : `PRACTICE_META.triathlon`
reste `announced`, et un test échoue le jour où quelqu'un le bascule sans les
plans (`docs/pratiques.md`). Ce chantier-ci ne livre **pas** de plan triathlon,
pas d'enchaînement, pas de créneau par discipline. Il livre le RELEVÉ
multi-disciplines, qui est la couche sous les plans, et il la livre utile tout
de suite pour un coureur qui fait du vélotaf. C'est la seule façon de préparer
un terrain sans écrire du code qui n'a pas d'utilisateur.

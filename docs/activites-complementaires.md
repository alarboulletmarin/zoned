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
| une séance de plus dans le plan (`__activity_cycling__`) | C'est une séance VIDE, sans métrique, à poser à la main dans la bonne semaine. Et elle disparaît avec le plan, alors que le vélotaf, lui, ne s'arrête pas entre deux cycles. |
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

## Ce qui s'additionne, et ce qui ne s'additionne pas

Une règle porte tout `activityStats.ts` :

- **le TEMPS s'additionne** entre disciplines. Une heure de vélo et une heure
  de course font deux heures d'entraînement. C'est le chiffre qui manquait ;
- **les KILOMÈTRES ne s'additionnent pas.** 30 km de vélo et 10 km de course ne
  font pas 40 km, et 40 est exactement le genre de chiffre qui se retient et se
  répète. La distance est rendue PAR DISCIPLINE, et **il n'existe aucune
  fonction qui en fasse un total** ;
- **le DÉNIVELÉ s'additionne** : un mètre monté est un mètre monté.

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

## Le bilan du dimanche

`weekReview.ts` rend des nombres et un verdict. **Aucune phrase** : les mots
sont dans les traductions, le seul endroit où ils peuvent exister en deux
langues.

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

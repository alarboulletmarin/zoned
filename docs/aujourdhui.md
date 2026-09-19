# Aujourd'hui : la composition du cockpit

Ce document fixe ce que `/today` suit, pourquoi, et ce qui reste à faire pour
qu'un plan, des semaines et le cockpit vivent des mêmes données. Lire avant de
toucher `src/lib/todayComposition.ts`, `src/lib/cockpit.ts` ou
`src/pages/TodayPage.tsx`.

## Le problème d'origine

Le cockpit reprenait UN plan, choisi par une règle d'une phrase : le plan dans
lequel on est aujourd'hui, le plus récent à égalité. Une semaine seule
(`config.isSingleWeek`, cf. `lib/weekToPlan.ts`) est stockée comme un plan
d'une semaine sans `startDate`, donc datée sur sa semaine de création, donc en
cours, donc la plus récente. Composer une semaine de renforcement pendant un
plan marathon faisait disparaître le marathon de l'écran du matin.

Le symptôme était un bug. La cause était un modèle : le cockpit ne savait
suivre qu'une chose à la fois, alors que l'entraînement réel en empile deux ou
trois, un plan qui court, une semaine de renforcement à côté, une semaine de
décharge posée par-dessus.

## Le modèle

**Le cockpit ne suit pas un plan, il suit une composition** : des couches
posées sur le calendrier, que l'on allume et que l'on éteint.

```ts
interface TodayLayer {
  id: string;        // TrainingPlan.id, plan ou semaine seule
  enabled: boolean;  // éteinte, la couche reste écrite mais ne se voit plus
  anchor?: string;   // semaines seules : le LUNDI (YYYY-MM-DD) où elle est posée
}
interface TodayComposition { version: 1; layers: TodayLayer[] }
```

Clé `zoned-today`, à part de `zoned-plans` : la composition est une vue SUR
les plans, elle n'en modifie aucun. Elle est dans la sauvegarde (`lib/backup.ts`).

Deux objets, deux façons d'entrer dans le cockpit :

- **un plan est daté par lui-même** (`startDate`, sinon `createdAt`). Il est
  suivi tant qu'on ne l'éteint pas, aucune couche à écrire ;
- **une semaine seule est un gabarit**, sans date. Elle entre dans le cockpit
  quand on la **pose** sur une semaine du calendrier (`anchor`), et seulement
  là. La même semaine peut être reposée ailleurs plus tard.

### La règle de résolution (`resolveTodaySources`)

Trois lignes, et quelqu'un doit pouvoir la prédire :

1. Un plan est suivi tant qu'on ne l'éteint pas.
2. Une semaine seule est suivie quand on l'a posée, sur son lundi de pose.
3. Une semaine seule **sans couche** ne se montre que lorsqu'aucun plan suivi
   n'est en cours aujourd'hui, sur sa semaine de création.

La ligne 3 est la compatibilité : pour qui n'a pas de plan, rien ne change
(composer une semaine la met dans le cockpit). Pour qui en a un, c'est la fin
du bug : la semaine n'écrase plus le plan, elle attend qu'on la pose.

### Ce que le cockpit rend (`pickTodayFocus`)

- `sources` : les sources **en cours** aujourd'hui, plans d'abord (du plus
  récent au plus ancien), puis les semaines posées. Vide si rien n'est en cours.
- `plan` : le **primaire**, le premier de `sources`. Il donne la ligne de
  position (semaine 6 / 16 · J-70) et le chemin du lien. Une semaine posée
  n'est primaire que sans plan en cours.
- `week[7]` et `weekRefs[7]` : la semaine calendaire en cours, chaque case
  étant la concaténation, primaire en tête, de ce que chaque source y porte.
- Chaque séance est adressée par une **`SessionRef`** `{ planId, weekNumber,
  index }`. C'est la seule adresse qu'ait une séance (`updateSessionCompletion`
  n'en connaît pas d'autre), et sans le `planId` clore la séance de
  renforcement écrirait dans le plan marathon.
- `planDay(focus, date)`, `focusSessionsBetween(focus, from, to)` et
  `monthBounds(focus)` lisent toutes les sources, chacune depuis SON lundi.

Toutes les sources partagent le calendrier : `getPlanMonday` normalise au
lundi, une semaine posée l'est sur un lundi. Une semaine du cockpit est donc
toujours une semaine calendaire, et `calendarWeekRange` suffit pour les bilans.

## Ce qui est fait

- `src/lib/todayComposition.ts` : le modèle, la lecture tolérante du stockage,
  les gestes (`placeWeek`, `setLayerEnabled`, `removeLayer`,
  `pruneComposition`), la règle de résolution. Testé.
- `src/lib/cockpit.ts` : plusieurs sources, `SessionRef`, bornes en union.
  Testé, y compris le scénario du bug.
- `src/hooks/useTodayComposition.ts` : lecture, écriture, nettoyage des
  couches orphelines une fois les plans chargés.
- `src/components/domain/TodayComposePanel.tsx` : la feuille **Composer le
  cockpit**. Un interrupteur par plan (en cours ou à venir) et par semaine.
  Allumer une semaine la pose sur la semaine **regardée** dans le cockpit, pas
  forcément celle qu'on vit : depuis la grille du mois, on pose une semaine de
  décharge trois semaines plus loin sans quitter l'écran. Les interrupteurs
  disent l'état réel rendu par `resolveTodaySources`, pas ce que la
  composition a écrit.
- `src/pages/TodayPage.tsx` : la pile du jour empile les sources, la clôture
  passe par la `SessionRef`, la ligne de position reste celle du primaire et
  les autres sources se listent sous elle. Bilan de la semaine et du mois
  sur toutes les sources.
- `/weeks/new` reçoit `state.placeOn` (un lundi) depuis la feuille : une
  semaine composée depuis le cockpit se pose d'elle-même sur la semaine
  regardée. Seules les deux portes qui créent directement le portent ; la
  porte du catalogue passe par deux écrans et ne le transmet pas encore.
- `src/pages/ActivitiesPage.tsx` : le bilan lit la même composition.

## Ce qui reste, dans l'ordre où ça vaut le coup

### 1. Poser depuis la semaine elle-même

`WeekViewPage` n'a pas encore de geste Poser dans le cockpit. Aujourd'hui on
compose la semaine, on revient dans `/today`, on ouvre Composer, on l'allume.
Un bouton dans la rangée d'actions de la semaine (à côté du partage) qui
appelle `placeWeek` sur la semaine en cours, ou ouvre un choix de lundi,
raccourcit le chemin à un tap. Même geste sur la porte catalogue
(`PrebuiltWeekDetailPage`), en transmettant `placeOn` à travers la liste.

### 2. Écrire depuis le cockpit vers une source

Le cockpit lit plusieurs sources ; il n'écrit encore dans aucune, hormis la
clôture. Ajouter une séance depuis `/today` demande de **choisir la source**
qui la reçoit, parce que c'est ce choix qui décide où elle vit :

- dans le plan (semaine N du plan, `addSessionToPlan`) : elle suit le plan ;
- dans une semaine posée : elle suit la semaine, et se repose avec elle ;
- dans une nouvelle semaine seule, créée et posée à la volée sur cette semaine.

Le panneau `PlanWorkoutPanel` et `sessionFromWorkout` existent déjà ; il manque
le sélecteur de source (une ligne de `Segmented` avec les sources en cours)
et le point d'entrée dans la pile. Le jour sans séance a déjà un primaire
vide qui peut le porter.

### 3. Fusionner une semaine dans le plan

Poser une semaine à côté du plan la lit ; la **fusionner** l'écrit dans le
plan, semaine N, et retire la couche. C'est une fonction de `planStorage`
(copier les séances de `week.weeks[0]` dans `plan.weeks[N]`, en gardant la
précision et la discipline, statut remis à prévu), sous `withUndoSnapshot`
pour que ce soit annulable, plus un geste dans la feuille Composer. À
décider : fusionner remplace ou ajoute (ajouter par défaut, le plan garde
ses séances ; remplacer est le cas décharge, et il doit être explicite).

### 4. Répéter une semaine

`anchor` pose une semaine une fois. Une semaine de renforcement que l'on veut
**chaque** semaine demanderait `repeat: true`. Ce n'est pas fait, et pas par
oubli : la clôture s'adresse par `(plan, semaine 1, index)`, donc marquer
faite la séance du lundi la marquerait faite pour toutes les répétitions. Il
faut d'abord soit un journal de clôture par date, soit matérialiser la
répétition en copies. Le journal par date est la bonne voie (il sert aussi
au point 5) ; en attendant, reposer la semaine chaque lundi est un geste
d'un tap dans Composer.

### 5. Les autres écrans lisent la composition

- `PlanViewPage` (`/plan/:id`) montre le plan seul. Il devrait au moins dire
  qu'une semaine est posée sur telle de ses semaines, et l'audit de charge
  (`planGenerator/audit`) devrait compter ce que la semaine posée ajoute :
  une semaine de renforcement posée sur la semaine de pic est précisément le
  genre de chose qu'un audit doit voir.
- `WeeksListPage` (`/weeks`) devrait marquer les semaines posées et où.
- `HomePage` ne lit pas le cockpit ; rien à faire tant qu'elle ne le lit pas.

### 6. Les conflits

Deux sources le même jour ne sont pas un conflit, c'est le cas nominal (course
le matin, renforcement le soir). Deux sources qui **posent la même séance
clé** le même jour, ou dépassent un budget de charge, le sont. Rien ne
l'annonce aujourd'hui. Le bon endroit est le bilan de la semaine
(`weekReview`), qui compte déjà les séances clés, et la jauge de
polarisation, qui voit déjà l'intensité.

## Ce qu'il ne faut pas refaire

- Ne pas remettre un sélecteur de plan à l'arrivée du cockpit. La règle de
  résolution répond sans question, et Composer est à un tap.
- Ne pas dater les semaines seules dans `zoned-plans`. Une semaine est un
  gabarit, sa date est une propriété de la pose, pas de la semaine.
- Ne pas faire écrire le cockpit dans une source sans nommer la source.

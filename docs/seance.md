# La page de séance

Ce document fixe ce que montre la page d'une séance de course
(`/workout/:id`), pourquoi, et comment Ajouter à… la relie au reste de
l'app. Lire avant de toucher `src/pages/WorkoutDetailPage.tsx`, les
composants de `src/components/domain/session/`, `src/lib/sessionFacts.ts`
ou `src/lib/addToSchedule.ts`.

Le dessin de référence est `docs/design/seance.reference.html`, le composant
d'un canevas Claude Design (séance MIX-010) : il donne la structure, les
états et les proportions, pas le code, qui est en styles inline et en
couleurs en dur là où Zoned a ses tokens et ses feuilles `zn-`. Il écrit
encore Endurance Z1-Z3 et Qualité Z4+, et `Z5 · 30 s` pour le pic : les
deux ont été tranchés autrement, voir plus bas.

La page de renforcement (même route, `StrengthWorkoutDetail`) n'est pas
concernée, hormis les marques encre des conseils qu'elle partage.

## Ce qui n'allait pas

1. Le vermillon était partout (l'identifiant, Exporter, Je ne connais pas ma
   VMA, Voir mes allures, les tirets des conseils, les croix des erreurs, la
   séance suggérée). Il ne signalait plus rien.
2. `Z5 VO2max` en tête de MIX-010, qui passe 22 min 30 en Z1 et 1 min 30 en
   Z5 : `getDominantZone` rendait la zone maximale.
3. Cinq étiquettes empilées dans l'en-tête, en quatre styles, et l'objectif
   Mixte qui répétait la catégorie.
4. La durée écrite quatre fois, et la répartition en troisième
   représentation du profil et des blocs.
5. Trois formats de durée (`37min`, `22min30`, `2 h 05`).
6. Sur bureau, trois cartes de phases de hauteurs inégales, et des
   étiquettes de zone longues qui débordaient.
7. Un glossaire sans rapport, en anglais (FTP, CV, Threshold, Over-unders
   pour MIX-010).
8. Une seule séance suggérée.

## Les choix

### Un seul vermillon par écran

Il est réservé à Ajouter à…, l'action principale. Exporter devient un
bouton contour. Tout le reste est en encre : l'identifiant (dans la ligne de
métadonnées, en `--ink-3`), les puces des conseils (un petit carré) et des
erreurs (une croix), le lien Je ne connais pas ma VMA (souligné), l'encart
VMA (pointillés `--border-dashed`, bouton contour), les séances liées, le
glossaire, la carte d'astuce. Dans la feuille Ajouter à…, le seul vermillon
est le bouton de confirmation.

### Le pic, pas une dominante

`getDominantZone` s'appelle désormais `getPeakZone`, sans changement de
comportement : ses trente appelants (tri qualité ou facile, badges des
cartes, PDF, ICS, générateur) voulaient tous la zone maximale. L'ancien nom
a disparu, plus personne n'avait besoin d'une zone dominante : la
répartition donne les minutes.

La bande de chiffres dit **Pic**, la zone la plus haute du corps de séance,
avec sa durée **cumulée** : `Z5 · 1 min 30` pour MIX-010, trois fois 30 s.
Le canevas écrivait `Z5 · 30 s`, la durée d'une répétition ; la spécification
demande la durée cumulée, c'est elle qui dit le coût.

### L'intensité sur la règle des anneaux

La barre Endurance / Qualité, sous le titre Structure, est le résumé du
profil qui la suit. Elle coupe **exactement là où coupent les anneaux de la
semaine** (`QUALITY_FROM_ZONE = 3`, la frontière du 80/20, voir
`docs/anneaux.md`) : Endurance Z1-Z2, Qualité Z3+. Le canevas et la demande
d'origine disaient Z1-Z3 / Z4+ (32 min 30 / 4 min pour MIX-010) ; c'était
contredire les anneaux, et deux écrans de la même app ne doivent pas classer
la même minute de deux façons. MIX-010 se lit donc 30 min / 6 min 30.

Les minutes se comptent bloc par bloc par la fonction des anneaux,
`enduranceQualityMinutes` (`lib/weekRings.ts`), que `qualityShareOf` lit
aussi. Ses conventions sont celles de `addSessionZoneMinutes` (échauffement
moitié Z1 moitié Z2, retour au calme Z1, bloc sans zone en Z2). La
répartition par zone, elle, garde `transformSessionBlocks`, qui suit les
zones écrites : pour une séance dont l'échauffement est en Z1 seul, les deux
peuvent différer de quelques minutes en Z2. C'est voulu : la barre se
compare aux anneaux, le tableau aux blocs qu'il a au-dessus de lui.

### Une liste unique

Les phases sont une seule liste dans un seul cadre, à toutes les largeurs.
Une étape est une grille `56px 1fr auto` d'au moins 48 px : une puce de zone
compacte (`Z1`, `Z1-Z2`, `Z5`, teinte de la zone la plus haute couverte, code
toujours écrit), le libellé avec la cible dessous, la durée. Les
répétitions gardent leur crochet et leur `3 ×`.

Sans zones enregistrées, la ligne de cible dit `Allure · VMA requise` en
`--ink-3` : on voit ce qu'il manque. Avec une VMA, `6:40 → 5:40 /km`, du plus
lent au plus rapide ; avec seulement une FC max, la plage en bpm.

Le libellé perd la durée qu'il répète (`5min allure course` devient
`Allure course`) par `stripLeadingDuration` (`lib/stepLabel.ts`), à
l'affichage seulement, et seulement quand la durée en tête vaut exactement
celle du bloc. Le catalogue n'est pas réécrit. Une règle QA qui empêcherait
ce préfixe a été proposée, pas activée.

### Les durées

Un seul format, `formatDurationMinutes` : `37 min`, `22 min 30`, `1 h 05`,
`1 h`, `30 s`, avec une espace insécable U+00A0, arrondi une fois à la
seconde. La forme serrée (`37min`, `1h05`) reste disponible par
`{ compact: true }`, pour les cartes de partage PNG et les libellés SVG des
frises, peints à largeur fixe. Les exports FIT, GPX, ICS, PDF et le texte
Strava n'appelaient pas ce formateur.

La durée n'est plus écrite qu'aux endroits où elle sert : la bande de
chiffres, le kicker `3 phases · 37 min`, la durée de chaque phase et de
chaque étape. La ligne Total de la répartition et l'axe sous le profil sont
partis.

### Le glossaire et les séances liées

Les termes viennent de la séance elle-même (`findGlossaryForWorkout`,
`lib/content-relationships.ts`) : la mesure qui donne ses allures (VMA en
course, FTP à vélo, CSS en natation), sa zone de pic, son type de séance
puis sa catégorie, ses étiquettes, les zones qu'elle traverse. Un terme
d'une autre discipline est écarté. MIX-010 donne VMA, Zone 5, Allure
spécifique, Affûtage. Neuf termes portaient leur nom anglais en français
(Taper, Race Pace, Long Run...) ; ils ont leur nom français, l'identifiant
et l'URL ne changent pas.

Trois séances liées : les variantes déclarées, puis la même catégorie, puis
la même zone de pic, dans la même discipline, classées par étiquettes
partagées puis durée proche.

## Selon la largeur

| Largeur | Disposition | Actions |
|---|---|---|
| jusqu'à 640 px | une colonne : en-tête, chiffres 2 × 2, structure (intensité, profil, encart VMA, phases), répartition, conseils, replis, liens | dock du pouce, Ajouter à… en tête et pleine largeur, Exporter en glyphe |
| 641-1023 px | une colonne aérée : chiffres 4 × 1, conseils sur 2, liens sur 2 | dans la page |
| dès 1024 px | grille `1.45fr 1fr` dans `--page-max` : en-tête / chiffres et actions, puis structure / répartition et conseils, puis replis et liens sur toute la largeur | dans la page, Exporter en glyphe jusqu'à 1199 px |

Le seuil du dock est celui que la page avait déjà (`isPhone`, 640 px).

## Ajouter à…

### Le parcours

Une `Sheet` du bas sur un téléphone, du côté au-delà, comme le sélecteur de
séance du cockpit. De haut en bas : le titre et la séance avec sa durée, un
groupe radio (`fieldset` et `legend`) de quatre choix, puis un bouton
vermillon pleine largeur dont le texte suit le choix.

1. **Aujourd'hui**, avec la date et le nom de la source qui recevra la
   séance (ou nouvelle semaine).
2. **Un autre jour de cette semaine** : Lun à Dim (`aria-pressed`), le jour
   courant présélectionné.
3. **Dans mon plan** : n'existe que si un plan suivi est en cours ou à venir
   (`followedPlans`). Un sélecteur de plan quand il y en a plusieurs, la
   semaine (celle en cours par défaut) et le jour.
4. **Dans une semaine type** : une semaine de Mes semaines et un jour. La
   semaine est un gabarit, on y écrit sans la poser. Sans semaine
   enregistrée, un lien vers la création.

### Le branchement

Aucun nouveau format de stockage (`lib/addToSchedule.ts`) :

- la séance est composée par `sessionFromWorkout`, comme depuis le cockpit
  et la page de la semaine ;
- elle est écrite dans `zoned-plans` sous `withUndoSnapshot`, avec une
  nouvelle valeur `add_session` du `kind` existant ;
- une **date** va dans la source **principale** qui la couvre, dans l'ordre
  du cockpit (`resolveTodaySources` : les plans du plus récent au plus
  ancien, puis les semaines posées). Le nom de cette source est écrit sous
  le choix, avant de confirmer ;
- **sans source** sur cette date, une semaine neuve est créée
  (`createEmptyWeekPlan`), nommée par son lundi, et posée sur ce lundi dans
  `zoned-today` (`placeWeek`) : c'est ce que fait Une nouvelle semaine,
  posée ici dans le cockpit, et la séance est donc visible dans `/today`.

Le retour est un toast : `Ajoutée à mardi 17`, un lien vers le cockpit (ou
vers la semaine du plan, ou vers la semaine type) et **Annuler**. Annuler
rend le plan tel qu'il était (`undoLastChange`) ; pour une semaine créée à
l'occasion, la semaine et sa couche sont supprimées. Le cockpit n'a pas de
lien direct vers un jour : le lien mène à `/today`, qui s'ouvre sur
aujourd'hui.

Tests : `src/lib/addToSchedule.test.ts` (aujourd'hui dans le plan suivi, un
autre jour, une semaine type, l'annulation, la semaine neuve et son
annulation, l'absence de Dans mon plan sans plan suivi).

## Accessibilité

- La barre d'intensité porte un `aria-label` qui la résume, la barre de
  répartition est décorative et doublée d'un vrai `<table>` avec sa légende.
- Les cibles font au moins 44 px (étapes, puces du glossaire, jours,
  boutons du dock, Modifier).
- L'information ne passe jamais par la couleur seule : le code de zone est
  toujours écrit, et Endurance / Qualité sont nommées au-dessus de leur barre.

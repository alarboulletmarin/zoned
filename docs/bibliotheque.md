# La bibliothèque de séances

Ce document fixe ce que montre `/library`, pourquoi, et la forme de ses URL.
Lire avant de toucher `src/pages/LibraryPage.tsx`,
`src/components/domain/WorkoutRow.tsx`, `WorkoutTable.tsx`,
`WorkoutFilters.tsx`, `src/lib/libraryFilters.ts` ou
`src/styles/components/library.css`.

La référence visuelle est le canevas Claude Design de la bibliothèque, page
Version 1 améliorée. Il a été suivi sauf sur cinq points, tranchés ici : la
recherche sur bureau montre `/` (le vrai raccourci de `useKeyboardShortcuts`)
et non Ctrl+K ; `aria-sort` va sur les `<th>`, pas sur les boutons de tri ;
Sport vient en premier dans le panneau et propose aussi Vélo et Natation ; la
légende des zones est présente une fois ; ses chiffres (247 séances, 30
résultats) étaient des exemples, tout compte vient du catalogue.

## Les décisions

1. **Une ligne, une action : ouvrir la séance.** La rangée était un lien
   qui contenait le bouton favori : un contenu interactif dans un autre (HTML
   invalide, lecteurs d'écran perdus) et deux cibles par ligne, dont une de
   32 px collée au badge. Le bouton favori vit sur la page séance, dans sa
   barre d'actions. Dans la liste, un coeur plein vermillon de 13 px après le
   nom dit seulement que la séance est en favori (`role="img"`, Dans tes
   favoris). On filtre les favoris avec la puce Favoris.
2. **Une seule présentation, la rangée.** Grille, compact et liste
   montraient le même catalogue trois fois, la grille par défaut avec une
   carte de 200 px par séance, et le réglage était caché dans le panneau.
   `ViewModeSelector` et `useViewMode` sont retirés ; la clé
   `zoned-viewMode` n'est plus lue (elle reste dans la liste de
   `lib/backup.ts`, pour les sauvegardes déjà faites). `WorkoutCard` et
   `WorkoutCardCompact` restent pour l'accueil, les favoris, les collections
   et le contenu lié.
3. **Le vocabulaire de l'app, sans variante locale.** `ZoneBadge` pour le
   pic, `ZoneBar` de la page séance (condensée), `DifficultyIcon` et son
   libellé au lieu du badge texte, `formatDurationMinutes(getWorkoutDuration(w))`
   (la rangée écrivait 63 min, la page séance 1 h 03), `Mountain` et le D+ de
   `computeTrailMetrics`, la pastille de zone partagée (`.zn-zone-swatch`,
   `zone.css`).
4. **Les familles sont l'entrée.** C'est la première façon dont un coureur
   cherche (une séance de seuil). Index sur téléphone, colonne latérale sur
   bureau. Une famille, c'est le paramètre `category` existant.
5. **Pic d'intensité au lieu de Système ciblé.** Base aérobie, seuil
   lactique : un vocabulaire de physiologiste dans une app construite autour
   des zones. Le filtre lit `getPeakZone`, Z1 à Z6, plusieurs à la fois.
6. **La durée en tranches**, à choix unique, sur la durée réelle : 30 min ou
   moins, 30 à 45, 45 à 60, 1 h à 1 h 30, plus long. Le curseur de 0 à 300
   min était imprécis au pouce, et 300 min ne correspond à aucune séance.
   Une borne basse est exclusive, une borne haute inclusive.
7. **Terrain réécrit.** Côtes requises gardait toute séance qui n'exigeait
   pas de piste, plat compris ; Piste requise, toute séance qui n'exigeait
   pas de côtes. Désormais : Sans piste (`!requiresTrack`), Avec D+ (D+ > 0
   ou `requiresHills`), Sans côte (ni l'un ni l'autre). Les puces se cumulent
   (ET) ; Avec D+ et Sans côte s'excluent (`toggleTerrain`). Hors course il
   n'y a ni piste ni D+ : Sans piste et Sans côte laissent passer le renfo,
   Avec D+ non.
8. **Tri** : durée (défaut), intensité (pic puis durée, le renfo en
   dernier), niveau (débutant à élite, puis durée). L'identifiant départage.
9. **Une fin visible.** Voir les N autres (par 24) remplace le défilement
   infini, qui rendait le pied de page inaccessible. `24 sur 30 séances`
   reste dessous. `useInfiniteScroll`, qui ne servait qu'ici, est retiré.
10. **Gardés** : la bande collante, devenue recherche + Filtres (voir plus
    bas), le compteur de Filtres,
    `HubNav` (le tirage y revient, Favoris en est omis puisqu'il a sa puce),
    l'index caché pour les robots (`zn-crawl`), le SEO, `?search=` et `?q=`,
    l'état vide qui nomme sa cause avec la figure de la pratique, la
    transition partagée du nom vers la séance, et la légende `ZoneScale`,
    une fois, sous l'en-tête des résultats (hors renfo, qui ne peint pas de
    zone).
11. **La légende est le filtre de pic.** Ses six puces ressemblaient à des
    boutons et ne faisaient rien. Toucher Z2 garde les séances qui
    culminent en Z2 (`peak=2`), exactement comme la rangée Pic d'intensité
    du panneau, qui reste synchronisée ; un second toucher retire le filtre.
    La zone choisie porte un anneau d'encre, les autres s'estompent.
    `ZoneScale` ne devient cliquable qu'avec `onToggle` : ailleurs elle
    reste une légende. Elle reste affichée quand le pic vide la liste, pour
    pouvoir le défaire d'ici.

## La rangée

`WorkoutRow`, une seule pour course, vélo, natation et renfo. Tout le bloc
est un `<Link>`, sans rien d'interactif dedans.

- Ligne 1 : le nom (500, 17 px, il passe à la ligne plutôt que de tronquer),
  puis le coeur d'état.
- Ligne 2 : la `ZoneBar` pleine largeur, 28 px, `condense`, `decorative`
  (`aria-hidden`, le lien se nomme déjà).
- Ligne 3 : `ZoneBadge` du pic, la durée en mono, la jauge de niveau en 14 px
  et son libellé, le D+ avec `Mountain` s'il y en a, Piste si exigée. Pas de
  séparateur : un point médian final est ce qu'on obtient dès qu'un fait
  manque.
- Renfo : pas de profil ni de badge ; la ligne 2 dit la catégorie et le
  matériel. Durée (milieu de `typicalDuration`) et jauge comme les autres.

Le nom accessible du lien est le nom de la séance (`aria-labelledby`), le
coeur et les faits sont sa description (`aria-describedby`). Un filet fin
sépare les rangées, pas de carte ; au moins 44 px de haut, le focus encadre
tout le bloc.

Sur bureau la même séance est une ligne de `<table>` (`WorkoutTable`) :
Séance | Profil (200 px) | Pic | Durée | Niveau | D+. Le lien est sur le nom,
étendu à la ligne par un pseudo-élément ; survol et focus se voient sur la
ligne. Tri par `<th aria-sort>` avec un `<button>` dedans. Le renfo écrit sa
catégorie dans Profil et laisse Pic et D+ vides.

## Téléphone et bureau, une seule page

La bascule est à 1024 px, la ligne où la barre du haut montre ses menus.
Une page prérendue doit rendre au premier passage ce que le serveur a rendu,
et le serveur ne connaît pas l'écran : `useWideLayout` rend les deux
présentations (rangées et tableau, index et colonne) tant que le premier
effet n'a pas tranché, et `library.css` en montre une. Ensuite seule la
bonne est montée.

- **Téléphone** : compteur et titre, `HubNav`, puis la bande collante
  `.zn-lib__find` : la recherche et Filtres côte à côte, les deux gestes qui
  trouvent une séance, qui tiennent le haut de l'écran pendant tout le
  défilement (sous 480 px, Filtres n'a plus que son icône et son compteur).
  Dessous, Toutes / Route / Trail, qui se choisit une fois et se retient,
  puis les raccourcis qui défilent (`.zn-lib__tools`), puis l'index des
  familles au repos ou les résultats. `.zn-lib__side` y est en
  `display: contents`. La bande portait avant la pratique et Filtres : avec
  cinq pratiques le rail défilait sous le bouton et coupait la dernière
  pastille, et la recherche, plus utilisée que la pratique, partait avec la
  page.
- **Bureau** : grille de deux colonnes. À gauche, collante, 280 px :
  pratiques, familles (Toutes en tête, `aria-pressed`), autres sports en une
  rangée de puces. Elle tient dans l'écran d'un coup d'œil et ne défile
  jamais à elle seule : seule la liste des séances défile (sous 800 px de
  haut, elle défile avec la page plutôt que de cacher son bas). À droite :
  la recherche et Filtres sur une rangée, les raccourcis juste dessous,
  l'en-tête des résultats, la légende, le tableau. Les raccourcis
  étaient au bas de la colonne et obligeaient à la faire défiler. Pas
  d'index de repos : la colonne est l'index, et sans famille le tableau
  montre tout.

Le repos, c'est ni famille, ni recherche, ni filtre (le sport compte comme
un filtre). L'index liste les familles non vides dans la pratique et le
sport regardés (`familyIndex`) : nombre de séances, durée réelle la plus
courte et la plus longue, plage de pics en `ZoneBadge`. Dessous, Autres
sports (Vélo, Natation, Renforcement) pose le sport.

## Le panneau de filtres

Dans l'ordre : Sport (Tout, Course, Vélo, Natation, Renfo, avec leur compte,
en radios : il décide des autres rangées, donc il passe en premier), Pic
d'intensité (endurance), Durée, Niveau, Terrain (Tout ou Course), puis les
filtres de renfo quand le sport l'est. Partis : Système ciblé, le curseur,
l'interrupteur Favoris, le sélecteur d'affichage, et les familles, qui sont
sur la page.

Le compteur du bouton Filtres compte ce qui se pose dans le panneau, sport
compris ; ni la famille (le titre des résultats la nomme) ni la recherche.
Les quatre raccourcis (30 min ou moins, Débutant, Sans piste, Favoris)
écrivent dans le même état : les cocher coche le panneau, et le compteur
suit.

## L'URL

L'état vit dans React, l'URL en est l'écho, écrit par
`serializeLibraryParams` et lu par `parseLibraryParams`.

| Paramètre | Valeurs | Défaut |
|---|---|---|
| `type` | `running`, `cycling`, `swimming`, `strength` | absent : tout |
| `practice` | une pratique gardée dans les réglages | absent : toutes |
| `category` | familles séparées par des virgules ; une famille ouverte en porte une | absent |
| `peak` | `1` à `6`, séparés par des virgules | absent |
| `minDuration`, `maxDuration` | minutes ; `maxDuration` seul marche | absent : pas de borne |
| `difficulty` | `beginner,intermediate,advanced,elite` | absent |
| `terrain` | `no_track,climb,no_hills` | absent |
| `favorites` | `1` | absent |
| `sort` | `duration`, `intensity`, `level` | absent : durée |
| `strengthCategory`, `equipment`, `muscleGroup` | comme avant | absent |
| `search` (ou `q` en lecture) | texte | absent |

Convertis à la lecture : `terrain=flat` devient `no_hills,no_track`,
`terrain=hills` devient `climb`, `terrain=track` est ignoré (un filtre qui ne
gardait que les séances de piste n'a jamais existé malgré son nom).
`maxDuration=30` est la tranche 30 min ou moins ; une autre valeur filtre
toujours, sans cocher de tranche. `?q=` est réécrit en `?search=`.

Ouvrir ou fermer une famille, ou choisir un autre sport depuis l'index,
**pousse** une entrée d'historique : le geste retour du téléphone ramène à
l'index. Tout le reste remplace l'entrée courante. Au retour arrière (POP
seulement), l'état relit l'URL ; l'écho de nos propres écritures n'est jamais
relu, sans quoi une frappe rapide perdrait sa dernière lettre.

## Le mouvement

Dans la doctrine de `motion.css`, sans durée ni dépendance de plus : les
puces changent d'état en `--dur-fast`, une rangée s'enfonce d'un pixel. Une
liste refiltrée ou retriée est remplacée net, sans cascade, et un profil de
rangée ne glisse jamais d'une forme à une autre. Ouvrir une famille ramène le
haut des résultats sous la bande collante, sans transition de page. La
transition partagée du nom vers la page séance est gardée. Rien ne bouge au
chargement.

## Les données

`scripts/qa-workout-schema.ts` refuse un segment d'effort de
`mainSetStructure` sans zone : il était dessiné comme de la récupération et
le pic retombait à Z2. Ce qui n'est pas de la course prend
`role: "transition"`. Les échauffements et retours au calme ne sont pas
tenus à cette règle : 90 de leurs segments (83 d'échauffement, 7 de retour
au calme, dans 87 séances) sont des gammes ou de la mobilité sans zone, un
chantier à part.

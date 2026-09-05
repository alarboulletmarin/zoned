# Zoned — vidéos marketing (Remotion)

Quatre familles de films, chacune déclinée en **16:9 (1920×1080)** et **9:16 (1080×1920)**,
en **français et en anglais**, à 30 fps.

Le code des compositions ne connaît jamais son format : `useLayout()` le déduit du canevas,
donc une seule arborescence de composants sert les deux coupes. La langue, elle, ne se déduit
de rien : elle arrive en prop, `<Stage>` la publie, et les feuilles la lisent avec `useLang()`.

Ce paquet est **isolé du projet** : il a son propre `package.json` et ses propres
dépendances, pour que Remotion et son Chrome headless n'entrent jamais dans le build
Vercel de l'application.

## Démarrage

```bash
cd video
bun install
bun run sync              # chiffres réels depuis les données de l'app → src/data/facts.json
bun run shots --lang all  # captures FR et EN depuis zoned.run         → public/shots/<lang>/
bun run studio            # aperçu interactif avec timeline
```

`sync` et `shots` produisent des fichiers **gitignorés** : ils se régénèrent, ils ne se
versionnent pas. `studio` lance `sync` automatiquement.

## Les films

| Composition | Durée | Propos |
|---|---|---|
| `Teaser` | 6 s | La question, ce qui y répond, l'adresse. Pré-roll, bannière. |
| `Spot` | 14 s | Le bruit → la promesse → ce qui l'appuie → ce que ça coûte → l'adresse. |
| `Overview` | 32 s | Sept actes : l'origine, la liberté, la bibliothèque, les plans, le contrôle, la compréhension, fin. |
| `Feature-*` | 13 s | Une fonctionnalité : on la nomme, on la montre en mouvement, on la montre dans l'app. |

Neuf `Feature-*` : `Liberte`, `Science`, `Polarise`, `Adapt`, `Plans`, `Library`,
`Zones`, `Racesim`, `Routes`.

Chaque composition est enregistrée quatre fois — deux coupes × deux langues — selon
`<Film>-<Format>-<LANGUE>` : `Overview-Wide-FR`, `Feature-Science-Story-EN`.
`bun run compositions` liste les 48.

La langue est écrite sur les deux, français compris. Laisser le français sans suffixe
aurait fait passer une langue pour l'originale et l'autre pour un export.

## Les deux langues

L'anglais n'est pas le français passé au dictionnaire : il est **réécrit**. Il est plus
court, il tombe autrement, donc les titres sont recomposés plutôt que traduits. Ce qui ne
bouge pas, c'est la ligne éditoriale — liberté, contrôle, compréhension, la bibliothèque et
les plans au milieu — et les interdits : aucun concurrent nommé, aucune fonctionnalité
inexistante.

Trois pièces :

| Pièce | Rôle |
|---|---|
| `src/lang.tsx` | Type `Lang`, contexte, `useLang()`, et les formats de nombre (`7,7` contre `7.7`, `75 %` contre `75%`) |
| `src/copy.tsx` | Tout ce que les films disent, en FR et EN. Les valeurs peuvent être des fonctions des faits, donc les chiffres restent ceux de `sync` et les fragments `<Em>` restent placés à la main |
| `src/data/facts.ts` | `factsFor(lang)` / `useFacts()` : la vue des faits déjà résolue dans la bonne langue |

Les deux dictionnaires sont typés `Copy`. **C'est ce qui tient la parité** : une clé ajoutée
d'un côté et oubliée de l'autre échoue à `npx tsc --noEmit` au lieu de sortir un film anglais
avec une ligne française dedans.

L'**Overview a été validé** : ses sept actes et leurs minutages ne sont pas rouverts. La
version anglaise est le même film dans une autre langue, pas un autre film.

## Ce que les films racontent

La colonne vertébrale : **liberté, contrôle, compréhension**, avec les deux
piliers produit — la bibliothèque et les plans — au milieu.

1. **D'où ça vient** — « une bibliothèque d'entraînement, faite par un coureur,
   pour les coureurs », née du besoin d'un outil simple basé sur les zones, sans
   dépendre d'une plateforme propriétaire. Texte repris de la page `/about`.
2. **Liberté** — gratuit, open source MIT, sans compte, sans tracking, hors
   ligne. Les données restent dans le navigateur.
3. **La bibliothèque** — 256 séances écrites bloc par bloc.
4. **Les plans** — la charge qui monte et redescend, et un plan qui s'audite
   lui-même et annonce ses propres faiblesses.
5. **Contrôle** — ajuster n'importe quelle séance sans toucher à l'originale ;
   une recommandation n'est pas un mur.
6. **Compréhension** — pas de boîte noire : 20 chercheurs cités, 23 publications,
   chaque séance explique pourquoi elle marche.

### Deux versions écartées

La première vendait un catalogue (256 / 9 / 12) : n'importe quelle app
d'abonnement affiche des compteurs plus gros.

La seconde ouvrait sur un tableau comparatif face à Runna, Kiprun Pacer et
Campus Coach. Elle rendait le film **à propos des produits des autres**. Ce que
Zoned coûte et ce qu'il demande est une propriété de Zoned : **aucun concurrent
n'est nommé nulle part**. `src/data/competitors.ts` n'est plus lu par le
pipeline.

En français, la voix est le vouvoiement, comme le cœur de l'app (`calculators` 54/10,
`common` 49/6, `homepage` 36/4). L'anglais n'a pas cette distinction : « you » couvre les
deux, donc la question ne se pose pas de ce côté. Les surfaces récentes et les visuels sociaux
tutoient — si la marque bascule, c'est une passe de réécriture sur les
compositions, pas une refonte.

### Une chose que les films ne disent pas

`GOAL_MODIFIERS.hardFraction` et `POLARIZED_EASY_MIN_FRACTION` existent dans
`src/lib/planGenerator/constants.ts` mais ne sont **référencés nulle part
ailleurs** : le générateur n'applique ni ne vérifie de répartition d'intensité.
Ce qu'un plan mesure, il le mesure par accident.

Mesuré sur un vrai plan marathon (`polarised.measured` dans `facts.json`) :
~77 % Z1-Z2, 18 % Z3, 5 % Z4+. Cela passe les deux seuils du code (plancher
75 % facile, plafond 25 % dur), mais la forme est **pyramidale, pas
polarisée** — Seiler veut un Z3 minimal et 15-20 % de dur, et on a exactement
l'inverse.

Les films présentent donc le modèle polarisé comme le **principe que Zoned
documente**, jamais comme une propriété d'un plan généré. Le jour où le
générateur appliquera une répartition, `scripts/sync-data.ts` sait déjà la
mesurer.

Les intervalles de zones (« Z1-Z2 ») se résolvent à leur **borne haute**, comme
`parseZoneSpan(zone)?.max` dans `src/components/visualization/transforms.ts` —
l'app colore un échauffement Z1-Z2 en vert, pas en gris. Prendre la borne basse
donnait 86/14/0,5 et une conclusion fausse.

## Rendu

```bash
bun run render                             # les 48
bun run render fr                          # seulement le français
bun run render en wide                     # seulement l'anglais en 16:9
bun run render wide                        # seulement le 16:9, les deux langues
bun run render Spot-Wide-FR Teaser-Story-EN  # à la carte
bun run render Overview-Wide-EN --frames 90  # aperçu rapide
```

Une langue ou un format seul restreint ; nommer les deux restreint deux fois, donc
`render en wide` donne les douze films anglais en paysage, pas tout l'anglais plus tout
le paysage.

Sortie dans `out/<id>.mp4` — H.264, CRF 18, yuv420p. Le script vérifie d'abord que les
captures nécessaires **de la ou des langues demandées** existent, puis affiche ce que
`ffprobe` a réellement obtenu.

## D'où viennent les chiffres

Aucun chiffre n'est saisi à la main. `scripts/sync-data.ts` écrit `src/data/facts.json`
en interrogeant les sources de vérité de l'application :

| Donnée à l'écran | Source |
|---|---|
| 256 séances · 9 plans · 12 calculateurs | `scripts/site-stats.ts` |
| Barres de volume hebdomadaire | `src/lib/planGenerator` — un vrai plan marathon 15 semaines |
| Chronologie de la séance « 30/30 classique » | `src/data/workouts/vma.json`, arbre `WorkoutStep` aplati |
| Splits du semi en 1 h 45 | `src/lib/raceSimulator` + `src/lib/splits` |
| Allures par zone | `calculatePaceZones(16)` de `src/lib/zones.ts`, figées dans `src/theme.ts` |
| 20 chercheurs · 23 publications · 11 systèmes | `src/data/science/data.ts` — nom, système et année par carte |
| Bornes du modèle polarisé (75 % / 25 %) | `POLARIZED_*_FRACTION` de `src/lib/planGenerator/constants.ts` |
| 12 répétitions 56 min → 8 répétitions 48 min | `scaling` de VMA-001, durées recalculées sur le même arbre de blocs |
| Le constat d'audit affiché sur les plans | `auditPlan()` de `src/lib/planGenerator/audit.ts`, lancé sur le plan généré |
| Bandeau des noms de séances | échantillon à pas fixe sur tous les fichiers de `src/data/workouts` |

Quand le catalogue ou le générateur bougent, `bun run sync` met les films à jour. Les
couleurs de zone dans `src/theme.ts` recopient `src/styles/themes.css` — le garde-fou
côté application reste `scripts/qa-zone-colors.ts`.

**Tout ce qui contient des mots est émis deux fois**, le français dans le champ de base et
l'anglais dans un jumeau `…En`, comme le fait l'app elle-même (`nameEn`, `descriptionEn`,
`messageEn`) :

| Champ | Source anglaise |
|---|---|
| `workout.nameEn` / `summaryEn` | `nameEn` et `descriptionEn` du gabarit |
| `audit[].messageEn` | `messageEn` de `PlanFinding` — l'audit est déjà bilingue |
| `race.distanceLabelEn` | `getDistanceLabelEn()` de `src/lib/raceSimulator.ts` |
| `adjust.workoutEn` | `nameEn` du gabarit |
| `workoutNames.fr` / `.en` | mêmes séances, même ordre, même pas d'échantillonnage |
| `science.cards[].systemEn` | `SYSTEM_LABEL_EN`, écrit à la main dans le script |

Le seul endroit sans source anglaise en amont est `SYSTEM_LABEL` : `TARGET_SYSTEM_SCIENCE`
est indexé par l'énumération brute et ne porte aucun libellé d'affichage. Les deux tables
sont côte à côte dans `scripts/sync-data.ts`, à tenir ensemble — une carte sans libellé
retombe sur la clé brute et afficherait `aerobic_base` à l'écran plutôt que d'échouer.

## Les captures

`scripts/capture-shots.ts` photographie zoned.run, thème clair, en deux gabarits :
bureau 1440×900 @2x et téléphone 390×844 @3x. Le film choisit tout seul — cadre navigateur
en 16:9, cadre téléphone en 9:16 — et lit toujours `public/shots/<lang>/`.

```bash
bun run shots                          # français
bun run shots --lang en                # anglais
bun run shots --lang all               # les deux, une passe chacune
bun run shots --lang en library racesim  # seulement ces surfaces
ZONED_BASE_URL=http://localhost:4173 bun run shots   # depuis un build local
```

**Le dossier par langue n'est pas cosmétique.** Les deux coupes lisent `shots/<lang>/…` :
sans lui, une passe anglaise écrase les images françaises et les films français reviennent
avec des écrans anglais dedans, sans un mot.

**La langue vient de l'URL.** `?lang=en` est ce que l'application lit réellement —
`detection.order` dans `src/i18n/index.ts` vaut `querystring, localStorage, htmlTag` avec
`lookupQuerystring: "lang"`. Les clés localStorage restent posées en second filet, mais
seules elles n'avaient jamais été exercées en anglais, et l'en-tête `Accept-Language` ne
fait rien du tout puisque `navigator` est délibérément hors de la chaîne de détection.

Deux surfaces sont pilotées avant le déclenchement, parce que leur état vide ne dit rien :
le simulateur génère son plan de course, et le générateur de parcours pose un départ
géolocalisé puis attend le tracé (une dizaine de secondes, service de routage réel).
La page parcours ne rend rien d'exploitable en gabarit téléphone : son film utilise le
cadre navigateur dans les deux coupes.

Les sélecteurs sont des libellés, donc bilingues, et regroupés en tête de fichier. Deux ne
se traduisent pas comme on l'attend : la puce de filtre **VMA s'appelle « VO2max »** en
anglais, et le bouton de parcours est **« Generate route »**, pas « Generate a route ». Une
regex qui rate échoue la capture plutôt que d'en produire une fausse — c'est le bon mode de
défaillance, mais ça coûte quand même une passe.

## Le système de mouvement

Tout vit dans `src/motion.ts`. La première version de ces films a été rejetée
comme « plate », et la cause était mesurable : chaque élément entrait de la même
façon — fondu plus montée de 30 px — puis se figeait. Sur un acte de quatre
secondes, cela faisait 0,8 s de mouvement et 3,2 s d'image fixe.

Quatre règles corrigent ça, et tout le module les sert :

1. **Rien n'est jamais immobile.** Chaque acte porte un mouvement de caméra lent
   (`useCamera`), le fond a trois halos qui dérivent sur des périodes premières
   entre elles, et les blocs gardent une respiration après leur arrivée
   (`useBreath`). Une interface figée est un échec, pas une sobriété.
2. **La typo joue.** Les titres s'écrivent en lignes (`<Headline lines={[...]}>`),
   chacune découpée par son propre masque et remontant de derrière sa ligne de
   base (`useMask`). Les mots arrivent, ils n'apparaissent pas.
3. **Le mouvement a une masse.** `useSpring` pour ce qui doit se poser avec du
   poids (chiffres, barres, pastilles), `CURVE.glide` pour ce qui glisse. Rien
   ne décélère uniformément.
4. **Les coupes ont de la profondeur.** `<Act handover="push" | "focus" | "drift">`
   fait reculer et flouter l'acte sortant pendant que le suivant avance et se
   précise. Un fondu enchaîné entre deux images fixes, c'est un diaporama.

S'y ajoutent deux signatures : le `ZoneSweep`, un balayage du dégradé de la
marque qui ponctue une coupe par film, et le `Marquee`, un bandeau des vrais
noms de séances qui ne s'arrête jamais — l'acte dont le sujet est le volume
finit par en avoir la sensation.

**Interdits maintenus malgré tout ça** : pas de tête de lecture sur la
chronologie de séance, pas de curseur qui parcourt un parcours après son tracé.
Ces mouvements-là raconteraient un lecteur d'intervalles ou un suivi GPS en
direct, deux choses que Zoned ne fait pas.

## Règles d'écriture

Reprises du pipeline de stories existant (`scripts/stories/motion/`), elles valent ici :

- **La première image est pleine.** Un film qui s'ouvre sur du vide puis fait apparaître
  un logo est lu comme une publicité. Les actes d'ouverture démarrent avec `fadeIn={0}`
  et un `at` négatif, donc l'entrée est déjà jouée à la frame 0. La marque arrive à la fin.
- **Expliquer avant de montrer.** Les 256 séances ne veulent rien dire tant que le
  spectateur ne sait pas ce qu'est une zone : la méthode passe avant le catalogue.
- **Ne jamais suggérer une fonctionnalité inexistante.** Zoned n'a pas de minuteur, pas de
  guidage pendant l'effort, pas de compte, pas de fil social, pas de suivi GPS d'activité,
  pas d'abonnement, pas d'IA conversationnelle.
- **Positionnement :** Zoned traite la **décision**, pas l'exécution. « L'entraînement
  structuré, sans bruit ».
- **Typo :** pas de point final sur les titres, pas de tirets cadratins, rien sous 25 px
  de texte courant — une coupe verticale se lit sur 360 px de large.
- **L'anglais est plus court, et ça se voit.** Un titre calibré pour le français y laisse
  un trou ou déborde. Trois l'ont fait et sont corrigés : « A training library / built by /
  one runner » posait une demi-ligne d'air sur 1080 px, « and comes back down » débordait
  la colonne de gauche en 16:9 et lâchait « down » seul, et « What do you run » orphelinait
  « run ». La mesure utile en 9:16 est d'environ **16 signes par ligne de titre**, moins en
  colonne de gauche paysage. Regarder l'image, pas compter les caractères.
- **La ponctuation suit la langue.** Le français espace avant `?` et `%`, l'anglais non ;
  la virgule décimale devient un point. `decimal()` et `percent()` de `src/lang.tsx` sont
  là pour ça — il y avait deux `.replace(".", ",")` en dur, qui mettaient une virgule
  française au milieu d'une phrase anglaise.

## Contrôler avant de livrer

```bash
npx tsc --noEmit
bun run qa:motion                 # échoue si un plan reste figé plus de 0,4 s
npx remotion still Overview-Story-EN out/check.png --frame=340
```

Deux contrôles complémentaires, et il faut les deux.

**`qa:motion`** passe `freezedetect` de ffmpeg sur chaque rendu et signale toute
plage où les images consécutives sont identiques. C'est le seul garde-fou contre
le défaut qui a coulé la première version : une image fixe et une image figée
sont indiscernables sur une capture, seule la vidéo les distingue.

**Les images fixes** restent nécessaires pour la mise en page. Regarder l'instant
le plus vide et le plus chargé de chaque acte : c'est ce qui a rattrapé le cadre
téléphone aux proportions de tablette, les barres étirées sur 1400 px en
vertical, les questions rognées hors champ et le tracé qui débordait en 16:9.

**Contrôler l'anglais contre le français au même instant**, pas dans l'absolu. C'est la
seule façon de séparer une régression anglaise d'une mise en page déjà admise en français :
« kilomètre par kilomètre » revient sur trois lignes dans les deux langues, c'est le
rendu accepté ; « built by » seul sur sa ligne n'existait qu'en anglais, c'était un défaut.

## Pièges rencontrés

- **TypeScript 7** (le portage natif) casse le loader esbuild de Remotion : rester en 5.x.
- **`zod`** se résout depuis le `node_modules` du projet parent (v3) alors que Remotion
  exige la 4.4.3 — d'où la dépendance explicite ici.
- **Pas de `Math.random()`** dans un composant : le rendu appelle chaque composant une fois
  par image, un tirage non graine relayoute la scène 30 fois par seconde. Utiliser
  `rand(seed)` de `src/anim.ts`.
- **Les hooks dans un `.map()`** : extraire un composant par élément plutôt qu'appeler
  `useProgress` dans une boucle.
- **`aspect-ratio`** : le cadre téléphone se dimensionne par la hauteur, le cadre navigateur
  par la largeur. L'inverse déforme le châssis et rogne la capture.
- **Une caméra adoucie s'arrête.** `useCamera` a d'abord utilisé une courbe
  ease-in-out dont la rampe se terminait exactement à la fin de l'acte : vitesse
  nulle sur la dernière demi-seconde de chaque acte, donc image figée. La caméra
  est maintenant **linéaire** et court sur 1,8 × la durée de l'acte — elle
  n'atteint jamais sa destination, donc elle ne s'arrête jamais.
- **Une respiration trop discrète ne compte pas.** Des bandes qui oscillent de
  1 % bougent techniquement et se lisent comme figées. Viser une amplitude
  visible (3-5 %) sur ce qui doit rester vivant.
- **Un pourcentage n'est pas une amplitude.** `PolarModel` respirait déjà à
  3,5 et 5 %, dans la fourchette recommandée — sauf que 3,5 % d'une bande de
  128 px en 9:16 fait quatre pixels étalés sur cinq secondes, sous le plancher de
  bruit du détecteur. Le bloc dérive maintenant aussi, en **pixels** comme
  `AdjustDial` (9 et 6 px), ce qui est la seule mesure qui tienne quel que soit
  le format. Raisonner en pixels parcourus par image, pas en pourcentage d'un
  élément court.
- **Un clip cache aussi ce qui devait remplir l'image.** La chronologie de séance
  portait son `clipPath` sur le conteneur, donc la piste grise disparaissait avec
  les blocs : entre l'ouverture de l'acte et le départ du balayage, douze images
  de canevas vide — un trou, et un trou où rien ne bouge. Le clip est descendu
  sur un calque interne, la piste tient l'image et dérive pendant que les blocs
  se découvrent.
- **Le français peut passer et l'anglais non, au même endroit.** Les deux gels
  ci-dessus étaient marginaux : 0,37 s en français, 0,40 s en anglais, sur des
  plans de composition identique. Un contrôle qui ne tourne que sur une langue
  laisse la faiblesse en place jusqu'à ce qu'un texte plus court la révèle.
- **Un sinus s'arrête à ses extrêmes.** `useBreath` ralentit jusqu'à zéro à
  chaque point de rebroussement ; quand les trois halos du fond s'y trouvaient
  ensemble, tout le sol s'immobilisait. Ce qui doit *garantir* qu'une image est
  vivante utilise `useTriangle` — vitesse constante, inversion instantanée,
  jamais deux images identiques.
- **Composer les `transform`, ne jamais les écraser.** `useEnter` renvoie déjà un
  `transform` ; ajouter une dérive dans le même objet de style supprime
  l'animation d'entrée sans rien signaler.
- **Les hauteurs de la chronologie de séance viennent de l'app** :
  `30 + (zone − 1) × 14 %`, blocs alignés en bas, récup à 70 % d'opacité, et un
  intervalle « Z1-Z2 » se résout à sa **borne haute**
  (`parseZoneSpan(zone)?.max`). Tout à hauteur égale donne un drapeau, pas une
  séance.
- **`bun run render X Y` avalait le premier argument** quand `--frames` était
  absent (`i !== framesIndex + 1` devient `i !== 0`). Corrigé, mais c'est le
  genre de bug qui fait croire qu'un film a été re-rendu alors qu'il ne l'a pas
  été — comparer la liste attendue au nombre de `✓`. `capture-shots.ts` a
  maintenant `--lang` et le même piège, gardé de la même façon.
- **`REQUIRED_SHOTS` avait dérivé dans les deux sens** : `about` était référencé par
  `Feature-Liberte` et absent de la liste, tandis que `compare` y restait après la coupe
  de l'acte concurrentiel. Un manque laisse un rendu échouer à mi-parcours, un surplus
  bloque un rendu sur un fichier que personne ne lit. La liste est maintenant exactement
  les `shot` de `FeatureDemo.tsx` plus celui de l'Overview.
- **Une capture ratée ne faisait pas échouer la passe** : le fichier précédent restait en
  place et le film sortait avec un écran périmé. `capture-shots.ts` compte désormais les
  échecs et rend un code de sortie non nul.
- **Le titre d'une séance ajustée reste français en anglais.**
  `src/lib/workoutAdjust.ts:596` code en dur `` `${source.name} (ajusté)` ``. La capture
  `adjust` en anglais affiche donc « 30/30 classique (ajusté) » dans une interface
  autrement anglaise. C'est un défaut de l'application, pas du pipeline : les films n'y
  peuvent rien, `Feature-Adapt-*-EN` le montre tel quel.

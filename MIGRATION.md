# MIGRATION — refonte « minimal doodles », vers du CSS pur

Journal de la migration de la couche de présentation vers le design system
« minimal doodles » (papier crème, encre, un seul accent vermillon), et de la
sortie de Tailwind et shadcn/ui au profit de CSS écrit à la main.

Branche : `refonte-design`. Un commit par lot.

## Ce qui change, ce qui ne change pas

**Change** — tout ce qui produit du markup ou du style : `src/components/**`,
`src/pages/**`, `src/styles/**`, `index.html`, la configuration Vite côté thème.

**Ne change pas** — `src/lib/**` (hors couleurs), `src/hooks/**`, `src/data/**`,
`src/i18n/**` (clés), `src/types/**`, les générateurs d'export. Les clés i18n,
le schéma `localStorage`, les 70 routes, les liens de partage et les fichiers
produits (`.fit`, `.ics`, `.pdf`, CSV) sont inchangés.

Deux fichiers de `src/lib/` sont dans le périmètre parce qu'ils sont de la
couleur déguisée en logique : `zoneColors.ts` et `sessionColors.ts` existent
uniquement parce que les exports PDF/PNG ne résolvent pas les variables CSS.

## Écarts assumés par rapport au bundle de design

| Écart | Pourquoi |
|---|---|
| Polices auto-hébergées au lieu de Google Fonts | Zoned est une PWA hors connexion sous budget Lighthouse. Une feuille de style tierce bloquante casse les deux. Mêmes trois familles, mêmes graisses, transport différent : `public/fonts/*.woff2`, sous-ensemble latin, OFL 1.1. |
| Un thème sombre existe, alors que le bundle est clair uniquement | L'app expose un réglage de thème que la refonte ne supprime pas. Le sombre est dérivé du système, pas inventé à côté : la relation papier/encre s'inverse, la famille de teintes chaude est conservée, et l'accent garde sa teinte (il atteint 4,8:1 sur la page sombre contre 4,0:1 sur le crème). L'inversion vit **entièrement dans la couche de tokens** : aucun composant ne porte de branche sombre. |
| CSS écrit à la main plutôt que classes utilitaires | Demande explicite : ni Tailwind ni shadcn. Les composants de référence stylent en `style` inline, ce qui ne sait exprimer ni `:hover`, ni `:focus-visible`, ni une media query — ils contournent avec des gestionnaires JS (`onMouseDown`). Le portage les remplace par de vraies règles CSS. |
| Les couleurs de groupes musculaires restent telles quelles | Elles sont catégorielles (12 valeurs), et le système n'a pas de vocabulaire pour douze catégories. Traitées dans le lot « force », où l'implication (principal / secondaire) sera encodée par densité d'encre plutôt que l'identité du muscle par teinte. |

## Ce que la refonte n'a pas eu besoin de faire

Le bundle livre un composant `Icon` et un fichier `assets/icon-paths.js` de 123
glyphes. Vérification faite, **les 123 tracés sont déjà dans
`src/components/icons/index.tsx`, à l'octet près** — le kit les avait extraits de
l'app. Le fichier est généré depuis `scripts/data/icon-mapping.csv` et vérifié au
build par `generate-icons --check`, il suit déjà `currentColor` et porte déjà
`aria-hidden`. Rien à porter : le système d'icônes de l'app *est* celui du design.

## Lots

### Lot 1 — Tokens et bascule visuelle ✅

Aucun composant réécrit : l'app entière change d'apparence par la seule couche
de variables.

**Ajouté** — `src/styles/design/` : `fonts`, `colors`, `zones`, `typography`,
`spacing`, `borders`, `motion`. Valeurs reprises telles quelles du bundle, sans
réarrondi (26 px de padding de carte, 22 px de pile, grille de 2 px).
`src/styles/base.css` : reset minimal, focus vermillon 2,5 px jamais supprimé.

**Réécrit** — `src/styles/themes.css` devient une couche de compatibilité
shadcn : chaque variable du contrat (`--background`, `--primary`, `--border`…)
pointe vers un token du design. Elle rétrécit à chaque lot et disparaît avec
Tailwind au dernier.

Deux collisions de noms résolues :
- `--accent` : chez shadcn c'est la surface discrète sous une ligne survolée,
  dans le design c'est le vermillon. `--color-accent` (la clé Tailwind) pointe
  vers `--surface-band` ; `--accent` garde son sens du design.
- `--zone-1..6` : mêmes noms, nouvelles valeurs — c'est le changement voulu.

**Encodage des zones** — les six couleurs deviennent une rampe d'encre
(`rgba(22,19,14,.14)` → aplat), doublée par la hauteur de bloc. Seuils, numéros
et calculs inchangés. Les trois disciplines partagent une seule rampe : un
effort en Z4 est un effort en Z4, et la discipline est déjà nommée en toutes
lettres à côté de chaque graphique.

`src/lib/zoneColors.ts` porte la rampe déjà composée sur le papier, pour les
surfaces sans DOM (pdfmake, html-to-image). `scripts/qa-zone-colors.ts` ne
compare plus deux listes de hex : il **refait le compositing** depuis
`design/zones.css` et échoue si un octet diffère. C'est un invariant plus fort
que l'ancien — l'échelle d'alpha, l'encre et le papier doivent tous concorder.

**Supprimé** — `src/styles/palettes-a11y.css` (palettes daltonisme). La rampe
d'encre est lisible en niveaux de gris par construction : c'est l'argument du
système, et il rend ces palettes sans objet. Le réglage correspondant part au
lot « réglages ». `src/styles/fonts.css` fusionné dans `design/fonts.css`.

**Chrome du navigateur** — `theme-color`, le manifeste PWA et le CSS critique
de `index.html` passent au papier crème. Ils affichaient encore du slate sombre
qui ne correspondait à aucun thème de l'app.

Vérifié : `tsc --noEmit`, `bun test` (598/598), `vite build`, `qa-zone-colors`,
`qa-workout-schema`, `qa-zone-audit`.

### Lot 2 — Les 20 primitives en CSS écrit à la main ✅

`src/components/ui/*` ne contient plus une seule classe utilitaire. Chaque
primitive a sa feuille dans `src/styles/components/`, dont les conventions sont
écrites dans `components/README.md`.

**Peinture d'abord, comportement ensuite.** Les primitives se stylaient déjà via
les attributs que Radix émet — `data-state`, `data-side`, `data-variant`,
`data-slot`, `data-highlighted`, `data-placeholder`. Ce sont des sélecteurs CSS
valides, donc ils se portent tels quels. Radix reste en place dans ce lot :
aucune API publique ne bouge, aucun piège de focus ni aucune navigation clavier
n'est réécrite, et le risque d'accessibilité est nul. Le retrait de Radix est un
lot séparé.

**Deux fondations partagées.** `_layout.css` et `_type.css` posent le vocabulaire
que les écrans réutiliseront : la rangée, la pile, la grille de cartes, la marge
d'écran, la section séparée par un filet d'encre — et les rôles typographiques
kicker → display → corps → données. Ce n'est pas un Tailwind maison : la
variation passe par des propriétés personnalisées (`--gap`, `--cols`) plutôt que
par une classe par valeur, et ce sont les faits que le design system énonce
lui-même.

**Deux corrections faites au passage, parce qu'on était dans le fichier :**

- `segmented.tsx` exposait un `role="radiogroup"` dont chaque `role="radio"`
  était tabulable séparément, sans gestion des flèches. C'était un vrai défaut
  clavier. Il a maintenant un seul arrêt de tabulation et répond à
  ArrowLeft/ArrowRight/Home/End. Les props sont inchangées.
- `skeleton.tsx` perd `react-loading-skeleton`, dont le miroitement est un
  `linear-gradient` balayé — le système interdit les dégradés. Le squelette est
  désormais un bloc de papier cerné qui pulse, à la forme du contenu attendu.
- `dialog.tsx` codait `bg-white dark:bg-zinc-950` en dur au lieu d'un token.

Vérifié : `tsc --noEmit`, `bun test` (598/598), `vite build`, contrôle visuel de
`/library` à 1440 px, console sans erreur.

### Lot 3 — États manquants ✅

C'était le trou principal : l'app n'exposait aucun composant maison d'erreur, de
succès ni d'attente. Une erreur était soit un toast `sonner` qui s'efface, soit
rien.

`Alert` comble ça. Les quatre genres partagent une forme ; seuls le disque du
glyphe et le papier changent, parce qu'un aplat vermillon pleine largeur
dépenserait sur un message l'unique accent de l'écran. Le genre est écrit en
toutes lettres au-dessus du titre : aucun état ne repose sur la couleur seule.

`Spinner` ne sert que là où la forme de l'attente est inconnue — ailleurs c'est
un squelette — et prend un libellé, parce qu'un anneau qui tourne seul ne dit
rien.

Les toasts gardent `sonner` comme transport et changent de rendu. C'est le bon
échange : `toast.*` est appelé depuis une quarantaine de fichiers, et sonner
tient déjà la file, l'empilement, le balayage, les minuteries et la région
`aria-live`. Il expose sa palette en propriétés personnalisées et ses états en
attributs `data`, donc la refonte tient dans une feuille de style et aucun site
d'appel ne bouge.

### Lot 4 — Mouvement décoratif ✅

`heart-bounce` (400 ms de mise à l'échelle sur un changement d'état), `blink`
(sans site d'appel) et le balayage `zone-shimmer` (un dégradé sur les six
anciennes couleurs) sont supprimés. Le système est explicite : le mouvement dit
d'où vient une chose ou qu'une attente est réelle, rien d'autre ne bouge.

`FavoriteButton` violait trois règles — un `text-red-500` qui était un second
accent, un glyphe rempli alors que le jeu d'icônes n'en a pas, et le rebond.
L'état est porté par `aria-pressed` et le vermillon : annoncé, pas seulement
coloré.

### Lot 5 — La coquille et les cinq portes ✅

L'en-tête était translucide et flouté ; les deux sont interdits. Il est
maintenant opaque, sur un filet d'encre pleine largeur, et porte le wordmark.

Cinq portes, libellés seuls, la porte active en inversion d'encre pleine.
**Aucune route ne bouge** : la table de `src/App.tsx` est identique à l'octet
près. Les routes qui étaient orphelines de la navigation — favoris, profil, mes
zones, simulateur, parcours, à propos, contribuer, changelog — ont désormais
chacune un point d'entrée nommé.

Trois choix qui méritent d'être discutés :

- **L'en-tête repasse dans le flux.** À 80 px, une barre fixe occulterait autant
  de chaque page en permanence, et passerait par-dessus les sous-en-têtes que le
  glossaire et le simulateur épinglent à 56 px. C'est un changement perceptible.
- **La feuille mobile perd ses icônes**, conformément à la règle du système : le
  jeu n'a pas de glyphe non ambigu pour distinguer « Séances » de « Mon plan ».
- **`PageContainer` n'était utilisé que par une page**, pas soixante comme le
  supposait le brief. Les autres tiennent leur colonne du `<main>` de `App.tsx`.

### Lot 6 — Accueil et bibliothèque ✅

Les deux premiers écrans maquettés, plus les six composants du kit qu'ils
introduisent et que les écrans suivants réutiliseront : `DoorCard`,
`IllustrationSlot`, `StatBlock`, `ZoneRow`, `ZoneBar`, `ZoneScale`.

**Accueil.** Kicker mono → titre display 88 px → chapô → données, dans cet
ordre. L'emplacement d'illustration est un trou cerné en tirets sur une trame
crème, avec le brief imprimé dedans : le système ne génère aucune illustration,
les doodles seront dessinés à la main et déposés là.

Trois retraits volontaires : le mot d'accent qui tournait dans le hero, le
chevron « défiler pour découvrir » et l'animation de comptage des chiffres.
Rien ne bouge pour décorer. Les clés i18n correspondantes sont conservées, elles
ne sont simplement plus rendues.

Un arbitrage à noter : le kit affiche le bloc « 14 % au-dessus du seuil » en
aplat vermillon. L'écran dépense déjà son vermillon sur l'action primaire, et la
règle « un seul aplat par écran » prime — le bloc passe en inversion d'encre.

L'atlas des zones abandonne son double markup bureau/mobile pour la primitive
`ResponsiveTable` : un seul balisage, et le clic de ligne devient un vrai
`<button>` là où c'était un `<tr onClick>` sans accès clavier.

**Bibliothèque.** Onglets typographiques sur un filet d'encre, chips en pilule
dont l'état retenu est une inversion d'encre pleine, la légende `ZoneScale`
montrée une fois, et les cartes portant le profil de séance : un bloc par
phase, largeur = temps, intensité codée deux fois par la densité d'encre **et**
la hauteur de bloc. Une récupération n'est pas une zone : c'est une hachure 45°
à 26 % de hauteur.

La gouttière des libellés de filtre passe de 88 px (valeur du kit, calibrée sur
« Catégorie » et « Niveau ») à 104 px : l'app filtre aussi par famille de
renforcement, et « RENFORCEMENT » débordait sur la première chip.

**Manques signalés, non inventés.** Il n'existe pas de moteur « séance du
jour » dans l'app ; la porte correspondante du kit a été rabattue sur la
bibliothèque plutôt que d'inventer un sélecteur. `IllustrationSlot` n'a pas de
branche « image remplie » tant qu'aucun doodle n'existe.

### Lot 7 — Le texte ramené à l'essentiel ✅

Le système énonce des longueurs — sous-titre d'une phrase et vingt mots maximum,
description de deux lignes, libellé de bouton réduit à un verbe et son objet — et
les écrans refaits les dépassaient tous. Les cartes de porte tombent de 19-29
mots à 12-15, calibrées sur celles du kit, qui portent chacune un chiffre plutôt
qu'un adjectif. Les réponses de la FAQ perdent la moitié de leur longueur sans
perdre un fait.

Mais raccourcir ne réglait pas le vrai surplus. Le kit tient l'accueil en quatre
sections ; l'écran en avait douze, et trois d'entre elles revendaient plus bas ce
que les portes offrent déjà en haut.

- **La section « plans » disparaît.** La porte « Suivre un plan structuré » la
  portait déjà, trois écrans plus haut.
- **Les douze cartes de calculateurs deviennent une porte.** Le hub les liste,
  et une page d'accueil n'a pas besoin de les nommer toutes pour dire qu'elles
  existent. La grille passe à quatre portes.
- **Les huit fiches de chercheurs deviennent huit lignes de citation.** La règle
  du système est que la science est *citée*, pas invoquée : ce qui survit est la
  citation elle-même, en mono, qui est exactement la forme prescrite. Chaque nom,
  chaque source et chaque lien reste sur la page ; seul le paragraphe autour
  disparaît.

Aucun lien interne n'est perdu : `/plans` et les douze calculateurs restent dans
la navigation, le pied de page et la palette. Douze sections deviennent dix.

`homepage.json` passe entièrement au tutoiement. Le fichier mélangeait les deux —
le chapô disait déjà « ton navigateur » pendant que la section voisine vouvoyait.
Le handoff demande que ce basculement se fasse fichier par fichier, en une fois :
c'est fait pour celui-ci.

**Règle retenue pour la suite :** chaque écran refait ramène ses textes aux
longueurs du système dans le même lot, plutôt qu'une passe de rédaction séparée
à la fin.

### Lot 8 — Les 106 composants de domaine ✅

Le gros levier : les pages composent ces composants, donc chaque famille refaite
allège toutes les pages qui l'utilisent. **8 461 utilitaires Tailwind tombent à
65** dans `src/components/domain/` ; sur l'app entière, 24 298 → 13 966.

Dix familles, dix feuilles de style, une revue adversariale chacune. Ce qui en
ressort et qui mérite d'être su :

**Les couleurs de phase de plan disparaissent.** `PHASE_BG` peignait cinq
teintes pour base/construction/pic/affûtage/récupération. Le système n'a qu'un
accent et aucune teinte de phase — et de toute façon huit tables en désaccord
se disputaient cette couleur sans source de vérité (#114). La phase se lit
maintenant par son libellé mono déjà imprimé dans la gouttière, plus un filet
d'encre pleine largeur sur la semaine qui l'ouvre.

**Les types de séance sans zone aérobie** (renforcement, yoga, repos, vélo,
natation) se ressemblaient tous une fois la rampe d'encre en place. Ils prennent
le traitement « hors zone » — papier creusé et filet d'encre — plutôt qu'une
teinte inventée.

**Les 12 couleurs de groupes musculaires restent.** Elles sont catégorielles et
le système n'a pas de vocabulaire pour douze catégories. `MuscleMap` peint des
attributs `fill` SVG bruts, que les variables CSS n'atteignent pas de toute
façon. L'écart est tracé plutôt que masqué.

**Un `Stepper` est né** dans le lot « contribuer » et servira au générateur de
plan en cinq étapes.

Sept défauts corrigés après revue, dont trois réels et non des préférences :
un `:hover:not(:disabled)` qui surspécifiait l'état sélectionné et repeignait
du crème sur du crème ; un `overflow: hidden` qui faisait du tableau du
calendrier un conteneur de défilement et cassait donc la gouttière collante
(remplacé par `clip-path`) ; et le libellé d'étape masqué en `display: none`
sous 640 px, qui privait de nom accessible chaque bouton de retour du
formulaire de contribution.

Plus quatre violations du système : une deuxième pastille vermillon sur l'écran
du wizard et sur la carte des trajets, une rotation à 1 s là où la maison tourne
en 700 ms, et un jour hors plan grisé par `filter: grayscale()` + `opacity` —
deux choses que le système interdit, remplacées par le papier creusé.

**Reste signalé, non corrigé :** `fr/plan.json` mélange tutoiement et
vouvoiement (33 occurrences de « vous » contre 1 de « tu »). Aucune chaîne de ce
lot ne dépassait les longueurs, donc aucune n'a été réécrite, et le handoff
demande que la bascule d'un fichier se fasse en une fois. À faire avec l'écran
« plan ».

### Lot 9 — Les atomes éditoriaux ✅

Un trou dans le découpage : `src/components/editorial/` n'était dans aucun lot,
et **56 fichiers** en dépendent. `EditorialTitle` codait en dur
`font-sans font-semibold italic` — l'ancien display de l'app. Un seul correctif
a basculé les 56 pages sur Bricolage Grotesque.

Tout ce dossier était du mouvement décoratif : titre qui monte au défilement,
grilles en cascade, compteurs animés, et une `InteractiveCard` qui soulevait la
carte de 3 px, l'agrandissait de 2 % et promenait un dégradé radial sous le
curseur. Le système interdit les quatre. Les composants restent, signatures
intactes — c'est ce qui évite d'éditer 56 sites d'appel — et rendent du DOM
simple. **`framer-motion` disparaît de l'app.**

### Lot 10 — La palette ✅

Le crème kraft du bundle a été neutralisé à la demande : page `#F6F5F2`, cartes
en blanc franc, encre `#171614`. La refonte tient sur le trait, pas sur la
teinte du fond, donc rien du système ne bouge. Les hex exportés de la rampe sont
recalculés sur le nouveau papier.

### Lot 11 — Les cinq écrans maquettés ✅

Séance, plan (générateur / calendrier / prêt-à-l'emploi), comprendre, chiffres,
réglages — 21 pages. `pages/` passe de 9 923 utilitaires Tailwind à 4 517 ;
l'app entière de 13 966 à 10 327.

`fr/plan.json` est passé entièrement au tutoiement, comme le handoff le demande
— en une fois, sans renommer ni supprimer une clé.

Cinq régressions rattrapées après revue, dont deux qui comptaient vraiment :

- **La page réglages affirmait « pas de tracker » et « aucune donnée ne quitte
  l'appareil »**, alors que `<Analytics />` de Vercel est monté dans `App.tsx`.
  La refonte avait supprimé la mention existante. C'était une fausse promesse de
  confidentialité ; elle est rétablie, et le titre ne surpromet plus.
- **`FreePlanCreatePage` posait `role="radiogroup"` sur des boutons** sans les
  flèches ni l'arrêt de tabulation unique que ce rôle promet — exactement le
  défaut corrigé sur `segmented` au lot 2. Un lecteur d'écran annonçait une
  touche qui ne faisait rien.

Plus une interpolation cassée qui imprimait `{{tools}}` littéralement sur le hub
des calculateurs.

### Lot 13 — Le menu plein écran ✅

La navigation mobile était un bouton icône en haut à gauche ouvrant un tiroir
Radix. Le coin haut-gauche est le point le plus loin du pouce, et le tiroir
affichait les cinq portes dans la même typographie que le reste : rien ne disait
qu'on avait changé de plan.

Un seul bouton, en bas à droite, nommé MENU, et un panneau plein écran sur fond
encre où les cinq destinations sont en display type. C'est un `<dialog>` natif
piloté par `showModal()` : la couche supérieure, le piège de focus, Échap et le
retour du focus au déclencheur viennent de la plateforme. **Un consommateur
Radix en moins**, et `Sidebar.tsx` supprimé. Le verrou de défilement, lui, est
écrit — le natif ne le donne pas.

La revue a trouvé cinq défauts réels, dont un qui n'était pas dans le brief :
**le verrou de défilement fuyait en franchissant 1024 px.** Retirer le `<dialog>`
du DOM n'émet aucun événement `close`, donc le nettoyage ne jouait jamais et
`body { overflow: hidden }` restait posé pour toujours sur le bureau. Plus : le
focus arraché à la palette de commandes, la pilule qui recouvrait quatre barres
d'action collantes, un `z-index` qui perçait toutes les modales, et une bande
crème sous le pied de page inversé.

### Lot 14 — Les doodles comme identité ✅

Le déblocage n'est pas un dessin, c'est un **gréement**. Le duo approuvé est une
traversée de 78 ancres lissée en Catmull-Rom : elle se découpe en douze
articulations et se repose. `scripts/doodles/rig.mjs` est commité avec les
dessins — un SVG sans son générateur est un cul-de-sac.

**22 dessins** entrent dans l'app, tous dans l'écriture exacte du dessin validé.

Les dix-neuf états vides se ramènent à **trois situations** — un filtre qui ne
trouve rien, quelque chose jamais commencé, une panne. Le dessin vit donc dans
`EmptyState` et se choisit sur la variante : une décision au lieu de dix-neuf, et
aucun site d'appel modifié.

L'accueil reçoit trois registres et pas un de plus : le duo en tête, un visage
par porte, et la planche des six zones — le même corps six fois, chaque figure
encrée de sa zone dans la rampe, l'effort lisible deux fois, par la posture et
par le poids du trait.

**Les annotations sont neuves et n'étaient pas au plan.** Une flèche tracée à la
main n'est pas un objet dessiné au sens de la règle 2 : c'est une marque, du même
ordre que la ligne de sol, et aucun glyphe Material ne fait ce travail. La figure
qui montre remet un personnage au départ du trait. Une par écran au plus.

Ce qui a échoué : **le gainage, deux fois.** Contour fermé d'abord ; puis une
pose dont le vermillon peignait l'avant-bras à six unités au-dessus du sol —
l'inverse exact de la règle qu'il portait. Un solveur numérique sur onze angles
n'a rien donné de mieux : le gréement ne sait pas faire un bras d'appui vertical.
C'est une limite, pas un réglage, et elle est écrite dans `docs/doodles.md`.

### Lot 15 — Les verdicts du lot pages ✅

Le lot 12 avait été interrompu en pleine revue. Six juges adversariaux ont rendu
leur verdict, un seul agent a appliqué les constats confirmés.

Le plus grave n'était pas cosmétique : **cinq des sept calculateurs d'allure
avaient été restructurés**, colonne unique de 672 px devenue split deux colonnes
pleine largeur, alors que le handoff impose de garder l'arrangement de ces pages
— et l'en-tête de la feuille affirmait le contraire de ce qu'elle faisait. Les
cinq sont revenus à leur colonne unique.

Deux fausses promesses de confidentialité trouvées en parallèle, l'une par la
revue dans la table de comparaison (`dataCollection: "no"`), l'autre par moi sur
l'accueil (« 00 tracker tiers », « sans tracker ») — alors que `<Analytics />` de
Vercel est monté sans condition. Les deux disent maintenant « cookie », ce qui
est vrai et vérifiable.

Enfin le pied de page mobile, signalé comme un mur : douze liens empilés à 44 px
de plancher tactile faisaient huit cents pixels. Les liens coulent en deux
colonnes, sept rangées au lieu de douze. Le plancher tactile ne bouge pas — c'est
lui qui dit où est la ressource, et sur un téléphone c'est la largeur.

### Lot 16 — Les quatre derniers répertoires, et deux gabarits ✅

Visualization, weekly, skeletons, search : les quatre que personne n'avait
couverts, tombés à zéro utilitaire. Le portage a trouvé quatre défauts que
personne ne cherchait : la frise coupait la fin des séances denses (segments en
pourcentage PLUS deux pixels de marge, donc 100 % + 200 px sur un 30/30) ;
l'étiquette de survol était découpée par un `overflow: hidden` depuis toujours ;
le dégradé du profil altimétrique avait un identifiant fixe que deux graphiques
sur la même page se disputaient ; et le texte secondaire de l'infobulle était de
l'encre sombre sur fond d'encre.

Deux gabarits de partage ajoutés — « Papier » et « Planche des zones » — sans en
convertir un seul des trente-sept existants. Ce sont les premiers dessins qui
sortent de l'app.

### Lot 17 — Zéro utilitaire ✅

`ShareDialog` était le dernier fichier. 24 298 utilitaires au départ de la
refonte, 0 aujourd'hui ; la seule classe non préfixée qui reste est `sr-only`,
et elle est à nous.

Une collision de classe corrigée, introduite par le lot 13 : `.zn-menu` était
portée à la fois par le `<dialog>` plein écran et par tous les
`DropdownMenuContent`. Même couche, même spécificité, feuille du menu importée
après : chaque menu déroulant de l'app s'affichait en plein écran sur fond
encre, à 176 px hors du viewport. Deux revues l'ont mesurée indépendamment.

### Lot 18 — Tailwind s'en va ✅

Le framework est retiré, avec `tailwind-merge`, `class-variance-authority`, le
`@theme` de tokens.css et la couche de compatibilité de themes.css. `clsx`
reste : c'est le corps de `cn()`, dont la signature ne bouge pas.

Le risque de ce lot n'était pas la compilation mais **le reset perdu** — une app
qui perd son preflight ne casse pas, elle dérive. La revue a monté un second
arbre de travail détaché à HEAD, y a réinstallé Tailwind, bâti les deux
productions, servi chacune sur son port, et comparé huit écrans à deux largeurs
et deux thèmes : dix-neuf paires sur vingt identiques au pixel.

Cinq paquets Radix partent au total (slot, switch, tabs, dialog, slider). Les
dialogues passent à l'élément natif sur le modèle du menu plein écran ; le
slider devient un `<input type="range">`, et pour le filtre de durée qui est une
plage, DEUX inputs superposés plutôt qu'un contrôle réimplémenté — chaque
poignée garde ainsi son contrat clavier natif.

Restent quatre paquets sans équivalent natif : dropdown-menu, popover, select,
tooltip.

### Lot 19 — La passe mobile, à 390 px ✅

Lot conduit sur retours directs du propriétaire, écran par écran, chaque verdict
mesuré avant et après. Trois sessions travaillaient la branche en parallèle ;
ce lot est celui de la session « mobile ».

**Le bug de fond, trouvé en cherchant un scroll latéral.**
`grid-template-columns: 1fr` est un raccourci pour `minmax(auto, 1fr)`, et cet
`auto` est un plancher **min-content** : la piste refuse d'être plus étroite que
l'élément le plus incompressible qu'elle contient, et c'est la grille qui
déborde de son conteneur au lieu de se comprimer. Les **27** règles
d'effondrement mobile du projet étaient écrites sous cette forme. Silencieux là
où le min-content est petit — une carte de séance mesure 223 px en Chrome, ce
qui tient dans un téléphone — et fatal dès qu'un moteur calcule cette taille
autrement. C'est ce qui mettait une barre de défilement horizontale sur
l'accueil en Firefox et pas en Chrome. Vérifié en forçant l'ancienne forme dans
Chrome : la piste saute de 342 px à 662.

Le diagnostic a coûté cher parce qu'il a été cherché dans le mauvais moteur :
55 largeurs balayées de 320 à 1400 px en Chrome, zéro débordement. C'est la
console du propriétaire — `SVGAnimatedString`, `debugger eval code` — qui a
révélé qu'il testait sous Firefox.

**Ce que le lot a changé, par surface.**

- *Coquille* — les trois contrôles de l'en-tête perdent leurs cercles : posés
  nus sur le papier, séparés par des filets, cible de 44 px conservée mais plus
  dessinée. Le menu plein écran remplace sa coulée de 21 liens mono par un
  `<details>` natif par porte, ouvert seulement là où l'on se trouve.
- *Accueil* — 10 → 7 sections. Partent : Fig. 01 (qui redisait en barres ce que
  l'atlas dit en dessins), la bande des quatre chiffres (qui répétait l'accroche
  **et** débordait), les huit chercheurs. Les quatre portes passent en 2×2 :
  1 290 → 444 px. Le formulaire « calcule tes zones » quitte l'atlas — c'était la
  seule chose de la page qui demandait quelque chose avant d'avoir rien montré.
  **10 011 → 6 317 px** sur téléphone.
- *Bibliothèque* — neuf rangées de puces derrière un bouton `Filtres · N`, dans
  un panneau (plein écran sous 640, latéral au-dessus). Zéro nouvelle clé i18n :
  `filters.title`, `clearFilters` et `meta.results` existaient.
- *Séance* — le gros du lot. Une étape par ligne au lieu de trois ; les actions
  regroupées puis descendues dans une bande sous le pouce ; le terrain sorti du
  bloc de faits ; le cœur d'un favori enfin plein. **Frise à 708 px au lieu de
  1 200**, dans le premier écran d'un téléphone de 844.

**Les décisions qui ne se relisent pas dans le code.**

- *Le doodle de la séance ne rétrécit pas, il se déplace.* Remis à 140 px dans
  le héros, il repoussait la frise de 732 à 896 px — hors du premier écran, ce
  que le lot venait de corriger. Sous 640 px il ferme donc la séance au lieu de
  l'introduire.
- *La zone du pouce n'est pas une barre, c'est un sol sous des pastilles.* Le
  premier essai — un bandeau plat à filet, la pilule du menu flottant à côté —
  mettait quatre traitements dans une rangée. La pilule du menu est l'objet le
  plus ancien et flotte sur tous les écrans : c'est elle qui donne la langue,
  les autres prennent sa hauteur, son rayon, son anneau et son ombre. Le second
  essai, des pastilles sans fond, était illisible : après la forme, ce qu'il
  faut à un contrôle flottant, c'est un sol. Papier à 96 % — 92 laissait lire
  « 30s footing Z1 » au travers.
- *Le cœur d'un favori est plein.* Le composant justifiait le contour par « le
  jeu d'icônes n'a pas de variante remplie ». C'est faux : `Heart` prend une
  prop `filled`, comme une douzaine de ses voisines.
- *Le terrain n'est pas un chiffre.* `envRequirements` est un `string[]`
  qu'un `join(" · ")` aplatissait pour le faire entrer dans le bloc de faits,
  où il s'imprimait en display 20 px comme `1h03`. Les libellés retenus sont
  ceux de la bibliothèque (`Piste requise`) et non ceux de la séance
  (`Nécessite une piste`) : courts, et gardant la distinction requis/préféré
  qu'un `Piste` nu perdrait. La paire longue s'enroulait sur deux lignes à
  81 px, la courte tient sur une à 32.

**Trois couplages fragiles, à ne pas casser sans mesurer.**

1. `.zn-session__figure` tient par un **accord chiffré** : sa marge basse
   négative annule exactement le `padding-block` que `.zn-section` prend sous
   640 px. Si l'une bouge sans l'autre, le pied du dessin ne tombe plus sur le
   filet. `position: relative` + `z-index: 1` mettent le trait au-dessus.
2. Le **2×2 des portes** dépendait du dessin : la phrase explicative était
   masquée parce que le doodle portait la reconnaissance à sa place. Le chantier
   « doodles = identité » ayant dénudé les portes, la phrase est revenue —
   mesuré à 375 px : par deux 570 px, empilées 704, donc le 2×2 tient.
3. Le **nombre de faits d'une séance varie de 3 à 5** — dénivelé en trail,
   distance en contexte de plan. Deux règles d'orphelin le tiennent : une cellule
   sans voisine ne tire plus de filet dans le vide, une cellule seule sur sa
   rangée prend la rangée.

**Une coupe, et ce qui l'a rattrapée.** Un remplacement de bloc dans
`session.css` allait d'un commentaire de section à un autre et a emporté
**344 lignes** — dont la gouttière de tout un écran. Le défaut n'a pas été vu
par `tsc`, ni par les tests, ni par le build : c'est une session voisine qui
l'a mesuré et signalé. Réparé en repartant du fichier commité, puis en
réappliquant les deux seuls changements voulus, avec un diff des sélecteurs
avant/après pour preuve. Les deux pièges qui en sortent sont au journal de
`docs/refonte-etat.md`.

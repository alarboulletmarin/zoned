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

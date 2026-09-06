# Refonte « minimal doodles » — état et reprise

Document de passation. Branche `refonte-design`, **rien n'est poussé**.
Le journal lot par lot est dans `MIGRATION.md` ; la direction artistique des
dessins est dans `docs/doodles.md`. Ce fichier-ci dit où on en est, ce qui a été
décidé, et ce qui reste.

## En un coup d'œil

| | |
|---|---|
| Utilitaires Tailwind, au départ | **24 298** |
| Utilitaires Tailwind, aujourd'hui | **0** |
| Tailwind | **retiré** — avec `tailwind-merge` et `class-variance-authority` |
| Paquets Radix | **9 → 4** (restent dropdown-menu, popover, select, tooltip) |
| CSS écrit à la main | 74 feuilles |
| Dessins | **23**, tous issus du gréement |
| Commits | 29, aucun poussé |
| Vert à chaque commit | `tsc`, 610 tests, `bun run build`, 3 portails QA, parité i18n |

Il ne reste aucun utilitaire Tailwind dans `src/`. La seule classe non préfixée
est `sr-only`, et elle est à nous depuis le lot 2
(`src/styles/components/_layout.css`).

## Décisions prises — ne pas les rejouer

Ces choix ont été tranchés par le propriétaire ou justifiés par le système.
Les revenir en arrière demande une nouvelle décision, pas une initiative.

**Palette A, pas le crème du bundle.** Le papier kraft d'origine a été neutralisé
à la demande : page `#F6F5F2`, cartes en blanc franc, encre `#171614`. Le sombre
suit la même neutralisation. Le vermillon `#E8452A` ne bouge pas — c'est la
marque. La refonte tient sur le trait (tout est cerné à 1,5 px), pas sur la
teinte du fond, donc rien du système n'a bougé avec la palette.

**Le thème sombre est conservé**, dérivé au niveau des tokens uniquement. Le
bundle est clair seulement ; l'app expose un réglage que la refonte ne supprime
pas. **Aucun composant ne porte de branche sombre** — l'inversion vit entièrement
dans `src/styles/design/colors.css`. Si tu te retrouves à écrire une règle
`.dark` dans un composant, c'est que le token manque.

**Les palettes discipline et daltonisme sont supprimées.** La rampe d'encre est
lisible en niveaux de gris par construction, ce qui est l'argument même du
système. Les trois disciplines partagent une rampe.

**Pas de couleurs de phase de plan.** Cinq teintes peignaient base /
construction / pic / affûtage / récupération ; huit tables en désaccord se les
disputaient sans source de vérité (#114). La phase se lit par son libellé mono et
un filet d'encre.

**L'en-tête n'est plus fixe.** À 80 px, une barre fixe occultait autant de chaque
page et passait par-dessus les sous-en-têtes épinglés du glossaire et du
simulateur. C'est un changement perceptible, assumé.

**Tutoiement.** `homepage.json` et `plan.json` ont été basculés entièrement,
fichier par fichier comme le handoff le demande. Les autres namespaces sont à
vérifier au fil des lots.

**Les 12 couleurs de groupes musculaires restent.** Catégorielles, et `MuscleMap`
peint des `fill` SVG bruts que les variables CSS n'atteignent pas.

**Les doodles : contour continu, personnages seulement, vermillon sur l'appui.**
Voir `docs/doodles.md`. Et surtout : **un dessin validé ne se corrige plus.**

**Le gréement est la source, pas le SVG.** `scripts/doodles/rig.mjs` porte la
traversée du dessin approuvé découpée en douze articulations. Un dessin de la
famille se pose avec lui, pas à la main : c'est ce qui garantit la même écriture.
Chaque SVG livré a son générateur commité à côté.

**Les annotations sont un registre, pas une décoration.** Flèche tracée à la
main, légende en mono, et parfois la figure qui montre. Trois garde-fous : encre
et jamais vermillon, une figure par écran au plus, jamais en position absolue.

**Les gabarits de partage ne s'aplatissent pas.** Les 37 pastiches gardent leurs
dégradés et leur variété — c'est la fonctionnalité. On en a AJOUTÉ deux dans la
langue du système, avec un doodle.

## Architecture, pour reprendre sans se tromper

**Les tokens** sont dans `src/styles/design/` — `fonts`, `colors`, `zones`,
`typography`, `spacing`, `borders`, `motion`. Valeurs reprises du bundle sans
réarrondi : la grille est de 2 px, pas de 4. Ne rien recalculer.

**Le vocabulaire partagé** est dans `src/styles/components/_layout.css` et
`_type.css`. On **compose avec**, on ne redéclare pas : `zn-row`, `zn-stack`,
`zn-cluster`, `zn-grid`, `zn-split`, `zn-screen`, `zn-section`, `zn-fill`,
`zn-push`, `zn-measure`, `zn-scroll-x`, `zn-divider`, `zn-card-hover`,
`zn-disclosure` ; `zn-display`, `zn-title`, `zn-body`, `zn-kicker`, `zn-mono`,
`zn-source`, `zn-muted`, `zn-faint`, `zn-accent`. La variation passe par des
propriétés personnalisées : `style={{ "--gap": "var(--sp-4)", "--cols": 3 }}`.

**Les conventions** sont écrites dans `src/styles/components/README.md`. Elles
ont tenu sur 200 fichiers ; les lire avant d'écrire une feuille.

**La cascade.** Les feuilles de composants sont importées dans
`@layer components` depuis `src/styles/index.css`. Tailwind parti, il n'y a plus
d'utilitaire au-dessus d'elles ; ce qui départage deux règles de même
spécificité, c'est donc **l'ordre des imports**, et il est alphabétique. Du CSS
hors couche bat toutes les couches — piège déjà payé une fois.

**Une feuille non importée est morte, et rien ne te le dit.** `tsc`, les tests et
le build passent tous sans elle : le composant rend simplement sans peinture.
Quand tu crées une feuille, câble-la dans `index.css` à sa place alphabétique, et
vérifie la liste :
`ls src/styles/components/*.css | while read f; do grep -q "$(basename $f)" src/styles/index.css || echo "NON CÂBLÉE: $f"; done`

**Le miroir JS de la rampe.** `src/lib/zoneColors.ts` porte la rampe déjà
composée sur le papier, pour pdfmake et html-to-image qui ne résolvent pas les
variables CSS. `scripts/qa-zone-colors.ts` **refait le compositing** depuis le CSS
et échoue si un octet diffère — il a déjà attrapé un écart d'arrondi. Si tu
touches au papier ou à la rampe, ce portail te le dira.

## Ce qui reste

**1. Quatre paquets Radix** — `dropdown-menu`, `popover`, `select`, `tooltip`.
Aucun n'a d'équivalent natif. Les remplacer veut dire écrire quatre contrats
clavier complets, et ce projet a déjà livré deux fois un `role` sans son
clavier : c'est un lot, pas un port. Le select a été examiné et refusé pour une
raison précise, consignée par l'agent : un de ses sites d'appel met autre chose
que du texte dans un item, et `<option>` ne rend que du texte.

**2. La palette de commandes ne déclare aucun `role`.** Aucun contrat clavier
n'est donc dû aujourd'hui — mais les flèches ne déplacent qu'un surlignage
visuel, et un lecteur d'écran ne sait jamais quelle ligne est retenue. Le
corriger demande `combobox` / `listbox` / `option` et des identifiants, donc de
changer le DOM.

**3. Le carrousel de partage a trente-sept arrêts de tabulation.** Chaque
diapositive est un `div role="button" tabIndex={0}`. C'est le motif « un role
sans son clavier », antérieur à la refonte, et il demande un tabindex glissant
avec des flèches.

**4. Le pied du gainage.** Le dessin est en page avec un défaut nommé : les
jambes s'arrêtent au sol sans pied dessiné. Une reprise de vingt tours a produit
pire. Voir `docs/doodles.md`.

**5. Trois chaînes françaises en dur** dans l'infobulle de `SessionTimeline`, et
deux `aria-label` en français en dur sur les graphiques de dénivelé. Antérieurs.

**6. `env(safe-area-inset-*)` ne vaut rien** tant que `index.html` n'a pas
`viewport-fit=cover`. Le code du menu et des quatre docks l'utilise déjà ;
l'ajouter fait passer le contenu sous l'encoche et demande une passe de zone
sûre sur l'en-tête et le pied. Non fait, délibérément.

**7. Deux pièges armés** : `zoneClass()` dans `lib/zoneColors.ts` et
`sessionColorClass()` dans `lib/sessionColors.ts` fabriquent encore des noms de
classes Tailwind (`bg-zone-1`, `text-zone-3`) qui n'existent plus dans le CSS
bâti. Aucun appelant aujourd'hui ; le prochain obtiendra une classe inerte.

## Pièges rencontrés, pour ne pas les repayer

- **`generate-icons --check` garde `src/components/icons/index.tsx`** au bit près.
  Éditer le générateur, jamais la sortie.
- **Le budget Lighthouse bloque à CLS exactement 0.** Les trois polices ont des
  doublures aux métriques calculées ; Bricolage est préchargée car elle dessine
  le titre display, donc l'élément LCP.
- **Une classe qui nomme un composant doit nommer CE composant.** Le préfixe
  `zn-` évite les collisions avec Tailwind, pas entre nos propres feuilles.
  `.zn-menu` a été portée à la fois par le dialogue plein écran et par tous les
  `DropdownMenuContent` : pendant un commit, chaque menu déroulant de l'app
  s'affichait en plein écran sur fond encre, hors du viewport. Grep un nom avant
  de le prendre.
- **Le vermillon ne se pose que sur un contact RÉEL avec le sol.** Un accent
  peint sur une semelle qui flotte dix pixels au-dessus de la ligne est une
  faute, pas une licence. Vérifie en chiffres, pas à l'œil : ça s'est produit.
- **Un `<dialog>` retiré du DOM n'émet aucun `close`.** Le nettoyage ne joue
  donc jamais, et un verrou de défilement posé à l'ouverture reste posé pour
  toujours. Écris le nettoyage sur le démontage ET sur le changement de la
  condition de montage.
- **`generate-route-meta` casse le build** si `index.html` perd un attribut
  `data-default-seo`. Ce bloc est intouchable.
- **Python arrondit au pair, `Math.round` arrondit au supérieur.** Un octet
  d'écart sur une rampe composée vient de là.
- **Ne pas lancer deux agents sur le même fichier i18n.** Un seul propriétaire
  par fichier et par lot ; les autres rapportent les clés dont ils ont besoin.
- **À spécificité égale, c'est l'ordre d'import de `styles/index.css` qui
  tranche — et cet ordre n'est ni alphabétique, ni « primitives d'abord ».**
  Vérifié : `button.css` est ligne 43, donc AVANT `library.css` (65) et
  `session.css` (85) — une feuille d'écran bat celle du bouton. Mais `sheet.css`
  (88) et `zone.css` (107) viennent APRÈS, donc une règle d'écran qui vise un
  élément portant aussi `.zn-zonebar` ou `.zn-sheet` ne rend rien. Il n'y a pas
  de règle générale à retenir : lis les numéros de ligne dans `index.css` avant
  d'écrire un sélecteur d'écran sur un élément qui porte une classe de
  primitive. Et rien ne t'avertira : ni `tsc`, ni les tests, ni le build ne
  voient une règle perdante.
  Quatre cas payés en une session :
  - `.zn-phase__bar { display: none }` contre `.zn-zonebar { display: flex }` ;
  - `.zn-session__profile { padding-inline: 5px }` contre `.zn-zonebar`, jamais
    appliquée depuis son écriture — 3 px et 6 px de rayon au lieu de 5 et 10 ;
  - `.zn-lib__filters-panel` contre `.zn-sheet[data-side="right"]` ;
  - `.zn-session__trail` et `.zn-session__fact`, perdantes contre **elles-mêmes**
    parce que leur bloc `@media` était écrit plus haut dans le fichier que la
    règle de base.

  Le réflexe : mesurer la valeur calculée après avoir écrit la règle, jamais
  supposer qu'elle s'applique. Le correctif n'est pas toujours de monter la
  spécificité — quand la valeur perdante n'a jamais rendu un pixel et que le
  rendu réel a été relu et validé, on retire la règle. Une règle qui ne
  s'applique pas se lit comme une intention et livre du vide.
- **Une classe sans règle n'est pas une classe morte.** `.zn-session__split` et
  `.zn-session__half` n'ont rien renvoyé à un `grep` sur leur feuille pendant
  une réécriture ; conclure au code mort et les réinventer a supprimé 344 lignes
  de `session.css`, dont la gouttière de tout un écran. Avant de conclure,
  cherche la règle dans **toutes** les feuilles, et compare les sélecteurs du
  fichier avant/après une réécriture de bloc :
  `git show HEAD:<f> | grep -oE "^\s*\.[a-z-]+.*\{"` des deux côtés, puis
  `comm`. Ça prend dix secondes et ça a rattrapé la coupe.

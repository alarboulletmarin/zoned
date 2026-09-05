# Refonte « minimal doodles » — état et reprise

Document de passation. Branche `refonte-design`, **rien n'est poussé**.
Le journal lot par lot est dans `MIGRATION.md` ; la direction artistique des
dessins est dans `docs/doodles.md`. Ce fichier-ci dit où on en est, ce qui a été
décidé, et ce qui reste.

## En un coup d'œil

| | |
|---|---|
| Utilitaires Tailwind, au départ | **24 298** |
| Utilitaires Tailwind, aujourd'hui | **6 653** |
| CSS écrit à la main | 21 141 lignes, 61 feuilles |
| Commits | 14, aucun poussé |
| Vert à chaque commit | `tsc`, 598 tests, `vite build`, 3 portails QA, parité i18n FR/EN |

Reste par répertoire :

```
components/share            676   ← gabarits de partage, style inline, hex en dur
components/visualization    331
components/weekly           222
components/skeletons        141
components/search           137
pages/                      104   ← 26 des 33 pages à zéro
components/domain            65
components/layout            38
components/editorial          8
components/ui                 2
```

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
`@layer components`, *sous* les utilitaires Tailwind, pour que le `className`
qu'un site d'appel passe continue de gagner tant que Tailwind est là. Du CSS hors
couche bat toutes les couches — c'est un piège qui a déjà coûté un correctif.

**Le miroir JS de la rampe.** `src/lib/zoneColors.ts` porte la rampe déjà
composée sur le papier, pour pdfmake et html-to-image qui ne résolvent pas les
variables CSS. `scripts/qa-zone-colors.ts` **refait le compositing** depuis le CSS
et échoue si un octet diffère — il a déjà attrapé un écart d'arrondi. Si tu
touches au papier ou à la rampe, ce portail te le dira.

## Ce qui reste

**1. Finir les revues du lot pages.** Six familles ont été écrites puis le lot a
été interrompu à la demande, en pleine phase de revue. Le code est vert mais les
revues adversariales n'ont pas rendu leur verdict. À reprendre avant de
considérer le lot clos — les revues des lots précédents ont trouvé des choses
réelles (une fausse promesse de confidentialité, deux `role` ARIA sans clavier).

**2. Les gabarits de partage — 676 utilitaires, le plus gros reste.** 35 fichiers
sous `src/components/share/templates/`. Particularité : **zéro `className`, 100 %
de style inline avec des hex en dur**. Ni Tailwind ni les tokens ne les
atteignent. Ils rendent en PNG via `html-to-image` avec `skipFonts: true`. C'est
une passe de couleur manuelle, et c'est aussi la surface où les doodles auraient
le plus d'effet (voir `docs/doodles.md`).

**3. Visualization, weekly, skeletons, search** — 831 utilitaires au total, quatre
répertoires que les lots précédents n'ont pas couverts.

**4. La passe mobile 390 px** sur l'ensemble.

**5. Le retrait de Radix** — 9 paquets. À faire en laissant le natif reprendre la
main plutôt qu'en réimplémentant : `<input type=range>`, `<select>`,
`<dialog>.showModal()`. Attention aux miroirs de formulaire cachés que Radix rend
(`switch`, `slider`, `select`) et au piège documenté : **si tu déclares un `role`,
tu dois son contrat clavier** — un `radiogroup` sans flèches ni arrêt de
tabulation unique est pire que pas de rôle. Ce bug a été trouvé deux fois.

**6. Le retrait de Tailwind** — dernier lot, possible seulement à zéro. Part avec
`cva`, `tailwind-merge`, `clsx`, le `vendor-radix` de `vite.config.ts`, la couche
de compatibilité `themes.css` et `@theme` dans `tokens.css`.

**7. La campagne de doodles.** Une vingtaine de dessins, placés selon
`docs/doodles.md`. À ne lancer qu'une fois les trois premiers validés en page.

## Pièges rencontrés, pour ne pas les repayer

- **`generate-icons --check` garde `src/components/icons/index.tsx`** au bit près.
  Éditer le générateur, jamais la sortie.
- **Le budget Lighthouse bloque à CLS exactement 0.** Les trois polices ont des
  doublures aux métriques calculées ; Bricolage est préchargée car elle dessine
  le titre display, donc l'élément LCP.
- **Une classe Tailwind interpolée n'existe pas** — le scanner lit du texte
  source. En CSS écrit à la main, interpoler *nos* noms de classes est sûr.
- **`generate-route-meta` casse le build** si `index.html` perd un attribut
  `data-default-seo`. Ce bloc est intouchable.
- **Python arrondit au pair, `Math.round` arrondit au supérieur.** Un octet
  d'écart sur une rampe composée vient de là.
- **Ne pas lancer deux agents sur le même fichier i18n.** Un seul propriétaire
  par fichier et par lot ; les autres rapportent les clés dont ils ont besoin.

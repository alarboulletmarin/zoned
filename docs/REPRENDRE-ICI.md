# Prompt de reprise — refonte Zoned

> Copier tout ce qui suit dans une nouvelle conversation Claude Code, à la racine
> du dépôt `zoned`.

---

Tu reprends une refonte graphique complète de cette application (Zoned, React 19 +
Vite + TypeScript, i18n FR/EN, PWA locale-first). Le travail est avancé, il est
sur la branche `refonte-design`, **rien n'a jamais été poussé**, et tout est vert
à chaque commit.

**Tu as carte blanche pour aller jusqu'au bout, en autonomie.** Le propriétaire
dort. Il ne veut pas être réveillé pour des questions dont la réponse est déjà
écrite ci-dessous ou dans les documents cités.

## Lis ça d'abord, dans cet ordre

1. `docs/refonte-etat.md` — l'état complet : chiffres, décisions déjà tranchées
   qu'il ne faut **pas** rejouer, architecture, pièges déjà payés une fois.
2. `docs/doodles.md` — la direction artistique des illustrations. **C'est devenu
   le cœur du projet**, lire attentivement.
3. `MIGRATION.md` — le journal lot par lot de ce qui a été fait et pourquoi.
4. `src/styles/components/README.md` — les conventions CSS, non négociables.
5. Le design source : `design_handoff/design/` (gitignoré, présent sur le disque).
   Son `readme.md` décrit le système ; `ui_kits/web/*.jsx` sont les écrans cibles.

## Ce qui a été fait

La couche de présentation passe de Tailwind + shadcn/ui + Radix à du **CSS écrit
à la main**, en même temps qu'elle adopte le design system « minimal doodles ».

**24 298 → 6 654 utilitaires Tailwind.** 21 000+ lignes de CSS maison,
61 feuilles. 18 commits.

Faits, dans l'ordre : les tokens et la bascule visuelle · les 20 primitives
`ui/` · les états manquants (Alert, Spinner, Toast) · le mouvement décoratif
retiré · la coquille et la navigation à cinq portes · l'accueil et la
bibliothèque · la coupe des textes aux longueurs du système · la fusion des
sections redondantes · les 106 composants de domaine · la palette neutralisée ·
les cinq écrans maquettés · 26 des 33 pages restantes · les trois premiers
doodles.

## Ce qui reste, par étapes

Fais-les dans cet ordre. Chaque étape = un ou plusieurs commits, **jamais de
push**.

### Étape 1 — Finir les doodles (priorité absolue)

Deux dessins sont à refaire. Le brief exact est prêt et **le workflow a échoué
sur une limite de session**, pas sur le fond :
`~/.claude/projects/.../workflows/scripts/zoned-doodles-crossing-wf_40282253-5bd.js`
— relance-le, ou réécris-le depuis `docs/doodles.md`.

`src/assets/doodles/runner.svg` et `plank.svg` sont des **contours fermés** et
ont été rejetés pour ça. `runners-duo.svg` est approuvé et adoré : c'est un trait
**qui se croise**. Voir la règle 1 de `docs/doodles.md`. Les redessiner dans la
manière du duo, puis les poser aux deux emplacements de `WorkoutDetailPage`.

Rappels qui ont déjà coûté cher :
- **Un dessin validé ne se corrige plus.** Ne « répare » pas l'anatomie du duo.
- Boucle obligatoire : écrire → rastériser → **relire le PNG et le regarder** →
  corriger une chose → recommencer. Huit tours minimum. Un dessin écrit à
  l'aveugle est un bonhomme-bâton.
- Un SVG sans `width`/`height` s'effondre dans un bloc qui ne fixe que la
  hauteur. Un rendu blanc est un harnais cassé, pas un dessin vide.
- Resserrer le `viewBox` sur le contenu réel : un cadre avec une bande morte
  gâche la moitié d'un écran de téléphone.

### Étape 2 — Faire des doodles l'identité de Zoned

**C'est la demande la plus récente et la plus importante du propriétaire**, dans
ses mots : *« des doodles qui sont maintenant le point central du projet, donc
peut-être modifier le design existant afin de faire vivre les doodles et que ce
soit une vraie identité Zoned »*.

Tu as donc le droit — et le mandat — de **faire évoluer le design system** pour
que les dessins portent l'identité, au lieu de les caser dans des trous prévus
pour eux. Le système reste le cadre (papier, encre, un accent, tout cerné), mais
sa hiérarchie peut bouger si ça sert les doodles.

Par ordre de rendement, la carte est dans `docs/doodles.md` :

1. **Les états vides.** `EmptyState` est importé par 19 fichiers et affiche
   encore un glyphe de 22 px. Six ou sept dessins. Le plus fort levier.
2. **Les cinq portes de l'accueil.** Un dessin par porte.
3. **Le 404**, que le handoff nomme explicitement comme non maquetté.
4. **Les en-têtes de section** des guides et de la méthodologie — du dessin
   explicatif, pas décoratif.
5. **Les 35 cartes de partage et l'image OG.** C'est ce que les gens voient
   *avant* d'installer : c'est là que « reconnaissable » se joue vraiment.

Prends aussi position sur ce qu'aucune consigne ne couvre : est-ce qu'un doodle
mérite d'apparaître dans l'en-tête, dans les chargements, sur le manifeste PWA,
dans les captures du store ? Le propriétaire attend une proposition, pas une
question.

### Étape 3 — Finir les revues du lot pages

Six familles de pages ont été écrites puis le lot a été **interrompu en pleine
phase de revue**. Le code est vert mais les verdicts adversariaux manquent. Les
revues des autres lots ont trouvé des choses réelles — une fausse promesse de
confidentialité, deux `role` ARIA sans contrat clavier. Ne considère pas ce lot
clos sans les avoir passées.

### Étape 4 — Les gabarits de partage (676 utilitaires)

35 fichiers sous `src/components/share/templates/`. Particularité : **zéro
`className`, 100 % de style inline avec des hex en dur**. Ni Tailwind ni les
tokens ne les atteignent. Ils rendent en PNG via `html-to-image` avec
`skipFonts: true` — donc un SVG y passe alors qu'un texte stylé n'y passerait
pas. C'est la meilleure surface pour les doodles *et* une passe de couleur
manuelle.

### Étape 5 — Les quatre répertoires non couverts

`visualization` (331), `weekly` (222), `skeletons` (141), `search` (137).

### Étape 6 — La passe mobile 390 px

Sur l'ensemble. Vérifier les cibles tactiles à 44 px et les emplacements
d'illustration, qui sont dimensionnés en pixels par leurs appelants.

### Étape 7 — Le retrait de Radix

9 paquets. **Laisser le natif reprendre la main** plutôt que réimplémenter :
`<input type=range>`, `<select>`, `<dialog>.showModal()`. Attention aux miroirs
de formulaire cachés que Radix rend (`switch`, `slider`, `select`) et à la règle
qui a déjà été violée deux fois : **si tu déclares un `role`, tu dois son contrat
clavier** — un `radiogroup` sans flèches ni arrêt de tabulation unique est pire
que pas de rôle du tout.

### Étape 8 — Le retrait de Tailwind

Dernier lot, possible seulement à zéro utilitaire. Part avec `cva`,
`tailwind-merge`, `clsx`, le `vendor-radix` de `vite.config.ts`, la couche de
compatibilité `themes.css` et le `@theme` de `tokens.css`.

## Règles de travail

- **Un commit par étape**, message en français, corps qui explique *pourquoi* et
  pas seulement *quoi*. **Jamais de push.**
- **Vert avant chaque commit** : `bun run tsc --noEmit`, `bun test` (598),
  `bunx vite build`, `bun run check:i18n`, et les trois portails
  `scripts/qa-{zone-colors,workout-schema,zone-audit}.ts`.
- **Tenir `MIGRATION.md` à jour** à chaque lot, et `docs/refonte-etat.md` quand
  les chiffres bougent.
- **Ne touche pas** à `src/lib/**` (hors couleurs), `src/hooks/**`, `src/data/**`,
  `src/types/**`, ni aux générateurs d'export. Les clés i18n, le schéma
  `localStorage`, les routes, les liens de partage et les fichiers produits sont
  intouchables.
- **i18n** : jamais de texte en dur. Ajouter une clé = l'ajouter en FR **et** EN,
  par ajout en fin de fichier, sans réordonner ni reformater. Un seul agent
  propriétaire par fichier i18n et par lot.
- **Le français est au tutoiement.** Si un fichier mélange les deux, bascule-le
  entièrement, en une fois.
- Utilise des workflows parallèles avec une **revue adversariale par famille** :
  c'est ce qui a trouvé tous les vrais défauts jusqu'ici.

## Les décisions déjà prises — ne pas les rejouer

Palette neutralisée (page `#F6F5F2`, cartes blanches, encre `#171614`, vermillon
`#E8452A` inchangé) · thème sombre conservé mais dérivé **uniquement** au niveau
des tokens, aucun composant ne porte de branche `.dark` · palettes discipline et
daltonisme supprimées · pas de couleurs de phase de plan · en-tête non fixe ·
tutoiement · les 12 couleurs de groupes musculaires restent · doodles en contour
qui se croise, personnages seulement, vermillon sur l'appui.

Le détail et la justification de chacune sont dans `docs/refonte-etat.md`.

## Quand tu auras fini

Laisse la branche prête à être relue : `MIGRATION.md` à jour, un état final dans
`docs/refonte-etat.md`, et un résumé de ce que le propriétaire doit regarder en
priorité au réveil — en particulier les arbitrages que tu auras pris seul sur
l'identité visuelle.

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

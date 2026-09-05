# Doodles — la direction artistique

Ce document décrit le trait, ses règles, et où les dessins doivent aller pour que
l'app soit reconnaissable. Il complète `design_handoff/design/readme.md`, qui
décrit le système visuel mais s'interdit de produire des illustrations.

## Le trait

**Contour continu.** Un seul trait ininterrompu qui suit la silhouette, comme
une main qui dessine sans lever le stylo. Courbes cubiques, pas de segments.

Ce choix a été fait contre une alternative construite au squelette, dont
l'anatomie était meilleure mais qui *avait l'air construite*. Le trait qui
tremble un peu vaut mieux que le trait juste : c'est ce qui distingue un dessin
d'un diagramme, et c'est toute la raison d'avoir des doodles plutôt que des
pictogrammes.

```
stroke-width: 2 · stroke-linecap: round · stroke-linejoin: round · fill: none
```

L'encre est `currentColor`, donc un dessin suit le thème sans variante sombre.
Pas de remplissage, pas d'ombrage, pas de hachure, pas de dégradé, pas de filtre,
pas de `<text>`, pas de raster. `viewBox` carré, aucun attribut `width`/`height`
— c'est l'appelant qui dimensionne.

Une ligne de sol ondule légèrement. Une ligne mathématiquement droite se lit
comme un schéma technique.

## Les trois règles qui font la signature

**1. Le trait se croise.**

C'est la distinction qui sépare un dessin d'une découpe, et elle a coûté deux
dessins à comprendre.

Un **contour fermé** trace le bord extérieur de la silhouette : techniquement un
seul trait, visuellement un pochoir, une forme pleine qu'on aurait évidée. Un
**trait qui se croise** entre dans la figure, passe par-dessus lui-même là où les
membres se chevauchent, et ressort. Le bras passe *devant* le torse et on voit
les deux lignes se croiser, au lieu de les fondre en un seul bord.

Le duo de coureurs approuvé est du second type. Les deux premiers coureur et
gainage étaient du premier, et ont été rejetés pour ça exactement.

Les chevauchements se dessinent, ils ne s'évitent pas.

**2. Des personnages, jamais d'objets.**

Pas de chronomètre, pas de calendrier, pas de pictogramme. L'app embarque déjà
123 glyphes Material Symbols : un dessin qui représente un objet entre en
concurrence avec eux et perd. Ce qui rend cette DA reconnaissable, c'est **la
figure** — un corps en mouvement, dessiné d'un trait.

Un premier essai avait produit un chronomètre et un calendrier techniquement
propres. Ils ont été rejetés pour cette raison exacte : à 400 px, ils étaient
indistinguables d'un glyphe Material agrandi.

**3. Le vermillon marque l'appui.**

C'est la règle qui fait tenir la famille ensemble. Sur chaque dessin, **le point
où le corps touche le sol** est tracé en `var(--accent)` ; tout le reste est en
encre. Le pied qui frappe, l'avant-bras et les orteils d'un gainage.

C'est petit, délibéré, jamais un second point focal — et ça se répète, donc
l'œil comprend au deuxième dessin qu'il regarde la même main.

Cette règle prolonge celle du système : un seul aplat vermillon par écran,
l'accent porte l'action primaire. Ici il porte le contact avec le sol, ce qui
est le sujet même d'une app de course.

## Le caractère prime sur l'exactitude

Une leçon apprise en manquant de la casser. Le duo de coureurs approuvé a une
allure souple, un peu dégingandée, presque tranquille — techniquement il
« marche » plus qu'il ne court : la jambe arrière ne se plie pas beaucoup, les
bras pendent bas, l'inclinaison est douce.

Un brief de correction avait qualifié ça de défaut principal et demandé une
posture de sprint. **C'était une erreur**, arrêtée avant exécution. Ce
relâchement *est* le doodle. Un coureur anatomiquement juste aurait été un
pictogramme sportif de plus ; celui-ci a une présence.

La règle qui en découle, pour tout dessin futur de cette famille :

> Quand un dessin est validé, il ne se corrige plus. On ne « répare » pas une
> anatomie qui a plu.

Les points ci-dessous servent donc à **construire un nouveau dessin**, pas à
retoucher un dessin approuvé.

### Liste de contrôle pour un nouveau personnage

Trouvés en échouant dessus, lors des premières tentatives qui produisaient des
bonshommes-bâtons.

- **Une seule ligne de sol.** Deux figures à des échelles différentes, flottant
  séparément, se lisent comme du clipart collé, pas comme une scène.
- **La tête touche le cou.** Deux pixels d'écart et ça se lit décapité.
- **Les pieds sont des segments**, pas des virgules. Une virgule au bout d'un
  membre se lit comme une brindille cassée.
- **Opposition** : bras droit devant quand jambe gauche devant. À revérifier
  après chaque correction, ça casse facilement.
- **Proportions vérifiées comme des nombres** avant de tracer : avant-bras ≈
  bras, tibia ≈ cuisse, tête ≈ 1/7 de la hauteur.

Ce qui n'est **pas** sur cette liste, volontairement : la profondeur de la
flexion du genou, la hauteur des bras, l'angle d'inclinaison. Ce sont des
réglages de caractère, pas des règles. Ils se jugent à l'œil, sur le rendu.

## La méthode, qui n'est pas négociable

Un SVG écrit à l'aveugle depuis des coordonnées donne un bonhomme-bâton. La
correction n'est pas plus de soin sur les nombres, c'est **regarder**.

```
1. écrire le SVG
2. rastériser en PNG à la taille réelle ET à 120 px, sur #F6F5F2
3. relire le PNG et le regarder — recadrer à 3x sur la jonction qu'on corrige
4. nommer le défaut concrètement
5. corriger cette seule chose, recommencer
```

**Huit tours minimum.** Le premier essai en faisait un et produisait des
bonshommes-bâtons ; le second en a fait huit et a produit des dessins qui se
lisent. C'est toute la différence.

Puppeteer est déjà une dépendance de développement et Chrome est téléchargé ;
`scripts/generate-og.ts` montre comment ce dépôt le pilote. Des scripts de rendu
utilisables traînent dans le répertoire de travail des runs précédents.

Et **regarder dans la page** avant de valider : un dessin peut tenir seul et
échouer à côté de la vraie typo, à la vraie taille. Vérifier aussi le thème
sombre — l'encre suit `currentColor`, l'accent doit rester lisible.

## Où les dessins doivent aller

Les trois emplacements actuels ne sont qu'un point de départ. Par ordre de
rendement :

**Les états vides — le plus fort levier.** `EmptyState` est importé par 19
fichiers et affiche aujourd'hui un glyphe Material de 22 px. Un doodle à la
place et l'app change de registre d'un coup, sur des écrans que les gens voient
vraiment. Six ou sept dessins : bibliothèque sans résultat, aucun favori, aucun
plan, aucun parcours, aucune semaine, aucun test enregistré.

**Les cinq portes de l'accueil.** Un dessin par porte — aujourd'hui, séances,
plan, comprendre, chiffres. C'est ce qui rend une page d'accueil reconnaissable
au premier coup d'œil.

**Le 404.** Le handoff le nomme explicitement comme non maquetté et suggère
`Alert kind="error"` dans une page vide. Un dessin y est presque obligatoire.

**Les en-têtes de section** des guides et de la méthodologie : les six zones,
l'échauffement, la nutrition. Du dessin *explicatif*, pas décoratif — c'est là
que le trait continu vaut mieux qu'une icône.

**Hors de l'app, et c'est là que « reconnaissable » se joue vraiment :** les 35
cartes de partage et l'image OG. C'est ce que les gens voient **avant**
d'installer. Ces gabarits rendent en PNG via `html-to-image` avec `skipFonts`,
donc un dessin SVG y passe alors qu'un texte stylé n'y passerait pas — le doodle
est le bon véhicule pour ces surfaces.

## Le composant

`src/components/domain/IllustrationSlot.tsx` porte le trou réservé : contour en
tirets sur une trame, avec le brief de production imprimé dedans. C'est
délibéré — un rectangle vide se lit comme un bug, un brief imprimé se lit comme
une page encore sous presse.

La branche « dessin présent » doit :

- rendre l'œuvre à la place du brief, en gardant `brief` comme repli quand rien
  n'est fourni, pour que les emplacements non pourvus soient inchangés ;
- laisser `role="img"` et le nom accessible `label` intacts, avec ou sans
  dessin — le nom accessible ne doit jamais dépendre de la présence d'une image ;
- retirer le contour en tirets et la trame **uniquement** quand un dessin est là ;
- laisser l'œuvre hériter de `currentColor`, et laisser un élément tracé en
  `var(--accent)` garder son accent.

Vite embarque `vite-plugin-svgr` : un SVG s'importe comme composant avec
`?react` (voir comment `src/assets/logo.svg` est importé).

## Ce qui a été essayé et écarté

**Les jeux d'illustrations sous licence.** OpenMoji est géométriquement le
cahier des charges au pixel près — `viewBox 72×72`, `fill: none`,
`stroke-width: 2` — mais c'est du **CC BY-SA 4.0**, donc copyleft : remplacer la
couleur par `currentColor` est une adaptation, et l'obligation de partage à
l'identique s'accrocherait aux fichiers dans un dépôt MIT. Et ce sont des glyphes
dessinés pour 18 px : agrandis à 400 px, ils se lisent comme un emoji collé dans
une page éditoriale.

Open Doodles, Open Peeps et Humaaans sont en CC0 mais remplis et à plat, avec une
voix d'auteur très reconnaissable qui se poserait *sur* le système au lieu d'y
entrer. unDraw, Storyset, DrawKit et Blush interdisent tous la redistribution en
dépôt — rédhibitoire pour un projet clonable. **DrawKit n'est plus MIT** : la
mention qui circule partout est périmée.

Conclusion : rien à sourcer, tout à dessiner.

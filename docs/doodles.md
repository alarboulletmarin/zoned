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

## Le gréement

Le premier atelier écrivait chaque dessin à la main, en coordonnées. Il a produit
des bonshommes-bâtons, puis, après huit tours de correction, trois dessins qui
tiennent. Cette méthode ne passe pas à l'échelle : vingt dessins, c'est vingt
fois huit tours, et rien ne garantit qu'ils partagent la même écriture.

Le dessin approuvé, lui, est une **traversée de 78 ancres lissée en
Catmull-Rom**. On peut donc la découper en articulations et la reposer. C'est ce
que fait `scripts/doodles/rig.mjs` : toute figure produite avec lui hérite de
l'écriture exacte du duo — mêmes boucles de main, même tête, même pied, même
tremblement. Le trait n'est plus à retrouver à chaque dessin, il est acquis ; il
ne reste que la pose à juger.

```js
import { Figure, svg, ground } from "./rig.mjs";

const f = new Figure();                       // la figure approuvée
f.pose({ leadHip: 20, frontArm: -30, head: 6 });   // degrés, horaire positif
f.plantLead({ knee: -5 });                    // pose le pied avant au sol
f.flip();                                     // elle regarde à gauche
```

Douze articulations, de la plus proximale à la plus distale — une rotation de
hanche emporte le genou, qui emporte le pied : `torso`, `head`, `backArm` /
`backElbow` / `backHand`, `frontArm` / `frontElbow` / `frontHand`, `leadHip` /
`leadKnee` / `leadFoot`, `standHip` / `standKnee` / `standFoot`.

`f.paths(accents)` découpe la traversée en sous-chemins qui partagent leurs
extrémités : le trait reste continu, seule la couleur change. C'est exactement ce
que le dessin approuvé fait pour sa semelle.

**Ne devine pas les signes de rotation** : rends une planche avec la même pose à
±20° et regarde-la. Deux minutes contre une heure.

### Ce que le gréement fait bien, et ce qu'il ne fait pas

Trouvé en le poussant, pas en le lisant.

- **La famille debout marche.** Marcher, courir, se tenir droit, se pencher,
  lever un bras, porter la main au visage : le trait se croise proprement, les
  membres se lisent.
- **Les poses pliées échouent.** Assis genoux repliés, accroupi : au-delà d'une
  flexion d'environ 90°, les deux bords d'un membre se rejoignent et le trait
  fait un nœud au lieu d'un chevauchement. Deux dessins ont été jetés pour ça.
  Ce n'est pas un réglage à trouver, c'est une limite : choisir une autre pose.
- **Le gainage n'entre pas dans le gréement.** Basculer la figure de 80° donne
  un coureur couché, pas un gainage : les bras restent en position de foulée et
  ne descendent pas au sol. Il demande une traversée écrite pour lui, en
  reprenant les boucles de tête, de main et de pied de `BASE`.

## Le sol est la règle de la page (6 septembre 2026)

Décision du propriétaire, qui remplace la section suivante : **le sol dessiné
quitte les fichiers**. Une figure ne porte plus sa ligne de sol ondulée ; son
`viewBox` s'arrête à la semelle, et c'est une règle droite de la page qui lui
sert de sol — filet de section, bord bas d'une carte, ligne de base des
boutons, axe d'une frise. Le bas du cadre SVG EST la ligne d'appui : poser la
figure sur un filet, c'est aligner le bas de sa boîte sur ce filet, calcul fait
depuis le `viewBox`, pas à l'œil.

Ce que ça change pour les règles ci-dessus : la règle 3 tient toujours, le
vermillon marque l'appui, et l'appui touche désormais une ligne qui existe
déjà dans la mise en page. La liste de contrôle « une seule ligne de sol » est
satisfaite par construction.

Et une règle de placement, dans les mots du propriétaire : **à côté, au-dessus
ou en dessous, jamais au travers ni par-dessus.** Un doodle occupe sa propre
ligne ou sa propre colonne et touche l'élément par son sol. Il ne chevauche ni
un texte, ni une frise, ni une carte, ni un bouton.

Les 21 fichiers de figures ont été coupés par un script (le trait des figures
est identique au byte près, seul le chemin du sol et le `viewBox` changent).
Les générateurs de `scripts/doodles/` doivent suivre : `svg()` n'émet plus de
sol, et une régénération doit reproduire ces fichiers à l'identique.

## Le cadre est en paysage, la figure est verticale — remplacé le 6 sept. 2026

*(Conservé pour l'historique ; voir la section précédente.)*

Une silhouette debout serrée dans son propre gabarit fait un trait perdu au
milieu d'une carte large — vu en page, sur l'état vide de `/plans`, et c'est
sans appel. Le dessin approuvé est en 440×323 : c'est **le sol, prolongé de part
et d'autre, qui fait le dessin**. Cadre autour de 1,3:1, avec un peu plus de sol
devant la figure que derrière.

## Le vermillon ne se pose que sur un contact réel

La règle 3 dit « le point où le corps touche le sol ». Il faut la lire au pied de
la lettre : un accent peint sur une semelle qui flotte à dix pixels au-dessus de
la ligne de sol est une faute, pas une licence. Elle arrive dès qu'on repose une
jambe sans revérifier — c'est arrivé ici. Regarde le contact, pas le code.

Et **regarder dans la page** avant de valider : un dessin peut tenir seul et
échouer à côté de la vraie typo, à la vraie taille. Vérifier aussi le thème
sombre — l'encre suit `currentColor`, l'accent doit rester lisible.

## Les annotations — le trait qui montre

Un registre ajouté après coup, à la demande du propriétaire, sur le modèle des
notices annotées à la main : une phrase courte en mono, une flèche tracée, et
parfois quelqu'un qui montre.

**Pourquoi ça ne contredit pas la règle 2.** Une flèche n'est pas un objet
représenté, c'est une marque d'annotation — du même ordre que la ligne de sol,
qui n'a jamais compté comme un objet. Elle n'entre en concurrence avec aucun
glyphe Material, parce qu'aucun ne fait ce travail : montrer un endroit précis
d'une page. Et la variante avec figure remet un personnage au départ du trait,
ce qui est le sujet même de la DA.

**La flèche est en encre, jamais en vermillon.** L'accent reste réservé au
contact avec le sol ; une flèche rouge ferait un second point focal sur chaque
écran qui en porte une.

**Une figure par écran, au plus.** Les flèches peuvent se répéter, la figure non
— deux narrateurs se disputent la page. C'est la même discipline que l'aplat
vermillon unique.

**Jamais en position absolue.** L'annotation se pose dans le flux, juste avant
ou juste après le bloc qu'elle désigne. Une annotation calée en pixels sur une
cible qui bouge se retrouve à désigner le vide dès que la colonne change de
largeur — et la colonne change à chaque largeur d'écran.

Le composant est `src/components/domain/Annotation.tsx`, les quatre flèches sont
produites par `scripts/doodles/arrows.mjs`.

## Le gainage, deux échecs et une limite

Consigné parce que c'est le seul dessin nommé par le propriétaire qui n'est
toujours pas livré, et que trois approches ont été essayées.

1. **Contour fermé.** Rejeté par le propriétaire, comme le premier coureur.
2. **Gréement basculé de 74°.** Rejeté en revue, chiffres à l'appui : le tronçon
   vermillon de l'avant-bras courait de y=233 à y=251 alors que la ligne de sol
   était à y=257 — il peignait un membre en l'air. Et la pose lisait « chien tête
   en bas » : hanches au point haut, épaules retombées.
3. **Solveur numérique** sur onze angles du gréement, avec les contacts au sol
   comme contraintes chiffrées et quarante redémarrages. Il satisfait les
   contraintes et produit quand même une figure couchée.

La cause est structurelle : le bras du gréement part vers l'arrière et son
avant-bras remonte. Aucune rotation ne lui donne un **bras d'appui vertical**
sans casser les proportions.

4. **Traversée écrite à la main**, 83 ancres, en transplantant les boucles de
   tête, de main et de pied de `BASE` par rotation et translation, sans jamais
   d'échelle. Dix-sept tours. **C'est celle qui est en page.** Le corps est en
   ligne des épaules aux talons, les deux accents mordent le sol de 0,2 à 3,9 px
   — le duo approuvé mord de 3,07 — et le trait se croise treize fois.

Elle garde **un défaut nommé** : les jambes s'arrêtent au sol sans pied dessiné.
Une reprise de vingt tours a été faite pour l'ajouter et **le résultat était
pire** : la palette de pied de `BASE` s'effile de 14 à 5 px, posée à plat elle
s'enterre, posée verticale elle fait un biseau, et la colonne de cheville
nécessaire pour la relever noue les deux pieds en une seule masse. L'effilement
propre des jambes était perdu pour un détail que personne ne voit.

La leçon vaut au-delà du gainage : **un défaut nommé vaut mieux qu'un correctif
qui déplace le problème**. À 260 px, la taille du bloc qui l'affiche, le pied
manquant est invisible ; le nœud, lui, se voyait.

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

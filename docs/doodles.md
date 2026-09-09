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
pas de `<text>`, pas de raster. Aucun attribut `width`/`height` — c'est
l'appelant qui dimensionne. Le `viewBox` est serré sur le trait et coupé à la
semelle, donc en portrait pour une figure debout ; il fut carré, puis en
paysage autour d'un sol dessiné (voir « Le sol est la règle de la page »).

~~Une ligne de sol ondule légèrement.~~ Remplacé le 6 septembre 2026 : le sol
dessiné a quitté les fichiers, c'est une règle droite de la page qui sert de
sol (voir « Le sol est la règle de la page »).

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
`scripts/doodles/render.mjs` rend une planche de dessins côte à côte, à
plusieurs largeurs, sur le papier ou sur l'encre.

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
import { Figure, svg } from "./rig.mjs";

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

### La coupe, trois fois le 6 septembre

Le trait des 21 figures n'a pas bougé d'un byte ; seul l'attribut `viewBox` a
changé, trois fois dans la journée. Les deux premières coupes sont consignées
parce qu'elles se reproduiraient.

1. **14:57 (3ce7617)** : bas du cadre 0,2 sous l'ordonnée du dessous du pied
   d'appui, `groundY`. Raté : l'arc de la semelle plonge de 2 à 10 unités plus
   bas selon la figure, il sortait du cadre — le pied coupé.
2. **15:13 (efcea06)** : bas du cadre sur le nombre le plus bas du chemin,
   points de contrôle compris. Raté dans l'autre sens : sur sept figures un
   point de contrôle descend 3 à 5 unités sous la courbe, et la figure flottait
   au-dessus du filet — le gainage à 4 px, les portes du menu à 3.
3. **16:46 (4004451)**, la règle en vigueur : gauche, droite et haut à 6 unités
   des nombres émis, points de contrôle compris ; bas à 1,2 sous le point le
   plus bas du **trait rendu** — `strokeBottom` dans `scripts/doodles/rig.mjs`,
   qui échantillonne chaque cubique, demi-épaisseur du trait comprise. La
   semelle est entière, et c'est elle, et elle seule, qui touche la règle de
   la page.

`scripts/doodles/recut.mjs` est cette règle : il l'applique à tous les fichiers
de `src/assets/doodles/` (les flèches exceptées, elles n'ont pas de sol), ne
touche qu'au `viewBox`, et repasser dessus ne change rien. `svg()` du gréement
n'émet plus de sol et cadre de la même façon ; `groundY` ne sert plus au cadre.
Standing, wondering, pointing, easy-run et plank se régénèrent au byte près.

Quatre endroits du code recopient un cadre en dur : les sept rapports d'aspect
du ruban du plan (`PlanViewPage.tsx`), les six largeurs de la planche
(`ZoneFigures.tsx`), la hauteur de sa scène (`zone-figures.css`) et le duo
inliné dans `index.html`. `src/assets/doodles/frames.test.ts` lit les SVG et
les vérifie : trois de ces constantes avaient dérivé le 6 septembre. Une
recoupe fait échouer le test tant qu'elles ne suivent pas.

## La coquille court (9 septembre 2026)

Décision du propriétaire : **la coquille de chargement reçoit une figure qui
court sur place, image par image**. Six poses de 110 ms — 660 ms le cycle, soit
182 pas par minute, une allure facile — à neuf images par seconde.

Elle est **seule**. Le duo a tenu la coquille pendant une journée à côté d'elle,
puis en est sorti : le coureur remplace, il ne s'ajoute pas, et un écran de
chargement porte une figure. Le duo n'a pas quitté le projet pour autant — hero
de la page d'accueil, menu mobile, feuille de partage, image Open Graph.

Le sol ne défile pas, et le bassin de la figure ne bouge pas d'un pixel
horizontalement : elle court sur un tapis. La règle traverse toute la largeur et
la figure se pose en son centre — mais elle s'ouvre **depuis ce centre**, en
240 ms, c'est-à-dire depuis la semelle vers les deux bords.

Ce détail n'est pas décoratif. Elle se traçait de la gauche, en 400 ms, et la
figure attendait ces 400 ms avant de partir pour ne pas courir sur du vide.
Faire partir la figure à l'instant zéro sans rien changer d'autre aurait laissé
son vermillon marquer un contact avec rien pendant 200 ms, le temps que le trait
atteigne le milieu — la faute que la règle 3 interdit. En partant du centre, le
sol existe sous la semelle dès la première image et se déroule sous ses pas.

Ce que ça dit que rien d'autre ne disait : que l'attente **avance**. Un trait
figé pendant trois secondes de réseau lent dit qu'on attend, pas qu'il se passe
quelque chose.

### Les deux entorses, assumées

Elles sont écrites ici parce qu'un jour quelqu'un lira les règles et trouvera
la coquille en infraction. Elle l'est, sciemment, et deux fois — toutes deux sur
le mouvement, aucune sur le dessin.

Il y en eut une troisième pendant une journée : le coureur s'était **ajouté** au
duo, trois figures sur l'écran de chargement. Elle est réparée. Ce qu'elle aura
appris, et qui vaut d'être noté : une figure de plus ne se juge pas sur la place
disponible mais sur ce qu'elle retire, et « un dessin remplace » n'est pas une
préférence de mise en page — c'est ce qui empêche un écran de devenir une
vitrine.

**Une seconde animation.** `src/styles/design/motion.css` dit « Motion says
where something came from, or that a wait is real. Nothing else moves », et
`index.html` disait « The one animation allowed: the rule draws itself ». Il y
en a deux maintenant. La seconde est **la seconde moitié de la même phrase** :
elle dit qu'une attente est réelle, ce qui est précisément le seul autre motif
que la règle autorise. Aucune autre surface n'y a droit — une figure qui court
ailleurs que sur une attente serait un ornement, et l'ornement reste interdit.

**Une attente fabriquée (9 septembre 2026, le soir).** C'est la plus sérieuse
des deux, et elle mérite d'être lue deux fois. `motion.css` autorise le
mouvement pour dire « qu'une attente est réelle » ; la coquille est désormais
**retenue** une foulée complète avant de s'effacer, donc l'attente qu'elle
signale, on la fabrique. Elle cesse d'être un indicateur pour devenir une
ouverture de marque.

Ce qui l'a motivée est un défaut mesuré, pas un goût. La coquille était retirée
à `requestAnimationFrame`, c'est-à-dire à la première image après l'exécution du
bundle. Sur le build de production servi depuis le cache, React monte à
**182 ms**. Le coureur ne faisait donc **jamais un seul pas** — et à l'époque il
attendait encore 400 ms que la règle se trace, si bien que la coquille
disparaissait avant même le premier pas. Personne n'a jamais vu l'animation, pas
« à peine ».

`src/main.tsx` retient donc **1980 ms**, soit trois foulées entières à partir de
`--rc-start` (zéro : la figure part avec la page), puis un fondu de 240 ms.
2,2 secondes en tout. Le nombre de foulées est le réglage du propriétaire ; ce
qui n'est pas négociable, et que `frames.test.ts` vérifie, c'est qu'il soit
ENTIER — une durée arrondie à la seconde couperait la figure en plein pas. C'est un **minimum**, pas un délai : sur un chargement
réellement lent (mesuré à 2627 ms) la retenue ajoute zéro, elle ne complète
qu'une attente déjà en cours. Et sous `prefers-reduced-motion` elle ne retient
rien du tout — la figure est figée sur la pose 1, il n'y a rien à regarder, et
retenir un dessin immobile serait du délai acheté pour personne.

Ce que ça coûte, en chiffres et sans arrondi : **LCP passe de 5940 à 7357 ms**
(médiane de 3, même machine, de part et d'autre du changement). La surcouche
masque l'élément le plus grand de l'app jusqu'au fondu, donc Lighthouse
l'enregistre 1,4 s plus tard — par construction. Le budget de
`.lighthouserc.json` est passé de 8500 à 10000 ms, avec l'arithmétique écrite
dans l'en-tête de `.github/workflows/lighthouse.yml`. Le site ne met pas plus
longtemps à se construire ; il montre délibérément une ouverture pendant 1,3 s.
Si un jour cette ouverture saute, le budget se remet où il était.

### Ce que le cycle a appris du gréement

Trouvé en le poussant, comme le reste de ce document.

- **Le bassin est un point fixe.** Les ancres 3 et 53 n'apparaissent dans aucun
  `idx` de `JOINTS` : aucune pose ne les déplace. La figure court donc sur place
  par construction, et le cadre commun n'a rien à recentrer. La contrepartie :
  **le gréement ne peut pas rebondir tout seul**. Poser un pied au sol à hauteur
  fixe fait tout absorber par le genou et le bassin reste à 240,0 sur les six
  poses. Et la cheville ne rattrape rien — le pied avant plie (`leadFoot` +30
  descend la pointe de 6,8, donc soulève le corps d'autant) mais le pied d'appui
  ne plie pas, son pivot [0, 71] est dans l'arc de semelle et +30 ne déplace la
  pointe que de 2,3. Un rebond par la cheville ne marcherait donc que sur une
  demi-foulée sur deux, ce qui est une claudication. Le rebond est aux images en
  vol, et à elles seules : deux niveaux, comme le dessin animé limité.

- **Le genou avant s'inverse en dessous de −58°.** `leadKnee` part de 58,5° de
  flexion en `BASE` ; à −58 la jambe est droite, en dessous elle plie **à
  l'envers**. Trois images du premier jet avaient un genou cassé vers l'arrière.
  Bornes mesurées : `leadKnee` de −56 à +30, `standKnee` de −98 à 0. Le nœud à
  90° de la section « ce que le gréement ne fait pas » est l'autre bout de la
  même plage — les deux se contrôlent d'un seul chiffre, la flexion signée.

- **Le demi-cycle ne se retourne pas.** Un cycle de course est symétrique ; ce
  gréement ne l'est pas. Le bras arrière a 126 unités de portée, le bras avant
  90 ; le pied avant est une palette de neuf ancres sans semelle, le pied
  d'appui en a sept plus les sept de `SOLE`. Les six poses sont écrites une par
  une, sans `flip`. Ce n'est pas une paresse d'outillage, c'est le dessin
  approuvé.

- **L'assise commune se mesure, elle ne s'écrit pas.** Les deux jambes ne
  descendent pas aussi loin sous le bassin : portée verticale du bas de
  l'accent, pied avant 372,1 en avant mais **363,8 en arrière**, pied d'appui
  368,9 en avant et 375,6 en arrière. Onze unités d'écart — la hanche avant
  pivote à x=120,4, la jambe avant y pend vers l'avant et arrive en bout de
  course dès qu'on la tire derrière. Viser une hauteur fixe donnait deux
  demi-foulées qui rebondissaient **en sens contraire**. Le générateur prend
  donc le minimum des quatre portées, moins trois unités de marge : au bout de
  sa course la jambe ne répond plus, et le calage qui corrige en 1:1 n'y
  converge pas.

- **Le vermillon disparaît en vol.** Deux images sur six n'ont aucun contact,
  donc aucun accent. `paths()` peignait la semelle en vermillon sans condition ;
  elle prend maintenant `{ sole: false }`. Un accent sur une semelle en l'air
  est la faute que la règle 3 interdit, et une figure qui court la commettrait
  un tiers du temps.

- **Le cadre est commun, et c'est `strokeBottom` qui le tient.** Une translation
  verticale décale `strokeBottom` d'exactement autant : une mesure, une
  translation, et les quatre images d'appui posent leur trait au même dixième
  d'unité. On épingle sur le bas de l'**accent**, pas sur le bas de la figure —
  sinon une jambe libre qui descend plus bas que la semelle plantée laisse le
  vermillon en l'air. C'est arrivé, à 2,8 unités.

- **Six images, pas huit.** Six coûtent 6,0 ko gzip ; huit en coûteraient 8.
  Inlinées à côté du duo, `index.html` passe de 6,6 à 13,5 ko gzip — sous les
  ~14,6 ko qu'un serveur en initcwnd 10 délivre au premier aller-retour, mais
  sans beaucoup de marge. Si le budget se resserre, on descend à **quatre
  images** avant de toucher au reste ; on ne passe **pas** les coordonnées en
  entier, ça sortirait le cycle de l'écriture des vingt-et-un autres dessins.
  Six images à neuf par seconde, c'est aussi la cadence du dessin animé à la
  main : le saccadé est voulu.

### Ce que la relecture a coûté, en huit tours

La méthode de ce document appliquée à une animation. Les nombres ne voient rien
de ça ; `scripts/doodles/run-sheet.mjs` rend trois planches — la bande des six
images sur la ligne de sol commune, la pelure d'oignon, et le flip à la cadence
réelle — parce que chacune montre un défaut que les deux autres cachent.

1. Les bras sortaient **à l'horizontale comme des perches** : les coudes à 60-84
   les dépliaient. Le dessin approuvé les tient à 150. C'était le défaut le plus
   laid et le plus vite corrigé.
2. La jambe libre **reculait dans le temps** sur les images 1 et 4 — plus en
   arrière qu'à l'image précédente, alors qu'elle revient déjà vers l'avant. Le
   pas bégayait. Aucun contrôle de hauteur ne l'attrapait.
3. Le pied libre **croisait le tibia d'appui à hauteur de cheville** et les deux
   pieds se confondaient en nœud. Il doit passer à hauteur de **genou**.
4. L'opposition ne se lit **pas dans une image isolée** : sous coude replié le
   poing avant est devant le bassin à tous les angles. Elle se mesure entre les
   images, par corrélation entre l'abscisse d'un pied et celle du poing de son
   côté.

Neuf contrôles vivent maintenant dans le générateur et le font échouer :
hauteur du crâne relative au bassin, ligne de sol unique, recul du pied planté,
flexion des deux genoux, opposition, symétrie des hauteurs, symétrie de la
foulée, chronologie de la jambe libre, immobilité du bassin en x. Ils ont tous
été écrits **après** avoir vu le défaut qu'ils décrivent.

### Le repli sans mouvement

Sous `prefers-reduced-motion`, c'est **la pose 1, l'appui du pied avant** : la
seule pose figée qui garde un contact au sol, donc son vermillon. Une image en
vol y serait sans accent et flotterait au-dessus de la règle.

Et le mécanisme mérite d'être su, parce qu'il échouerait en silence : le cycle
tourne **sans `animation-fill-mode`**. Le clamp global de `motion.css` ramène
toute animation à 1 ms et une itération sans toucher au fill-mode ; sans fill,
chaque groupe revient alors à sa déclaration de base — image 1 visible, 2 à 6
masquées. Un `forwards` les laisserait toutes sur leur dernière image clé,
`opacity: 0`, et **la figure disparaîtrait entièrement**.

### Poser une figure sur une règle

Le parent trace la règle en `border-block-end` et aligne la figure sur son bord
bas. La figure descend ensuite de l'épaisseur **rendue** de la règle, pour la
mordre : c'est le jeton `--rule-bite`, 1 px, dans
`src/styles/design/borders.css`. Pas `--bw-rule` : le jeton de la règle dit
1,5 px, mais Chrome ramène une bordure au pixel CSS entier à tout ratio d'écran
(mesuré à 1x, 2x et 3x), et avec 1,5 px de marge la semelle passait un
demi-pixel sous le trait. Firefox trace bien 1,5 px ; la boîte s'arrête alors
un demi-pixel dans le trait, ce qui est encore dessus. Une seule convention
pour toutes les semelles. La figure passe devant dans l'ordre de peinture
(`z-index`), sinon la bande suivante, plus tard dans le DOM, trace son filet
par-dessus le vermillon.

Les tailles se disent **en hauteur**, depuis la coupe à la semelle. Les cadres
sont verticaux ; une largeur décrivait l'ancien cadre en paysage qui embarquait
le sol, et 220 px de large sur une porte coupée en donneraient jusqu'à 490 de
haut. Entre 120 et 240 px de haut, une figure explique : 144 px sur téléphone
et 208 sur bureau pour un état vide, 148 pour l'échauffement, 128 et 172 sur le
ruban du plan, 200 dans le menu.

Sous **84 px de large pour un cadre paysage**, sous **120 px de haut environ
pour un cadre portrait**, pas de figure : le trait qui se croise devient un
pictogramme et concurrence les glyphes Material, ce que la règle 2 interdit. En
dessous, la figure s'efface, elle ne rétrécit pas — le menu la retire sous
120 px de place, la table des zones garde la flèche seule sur téléphone.

Une figure par écran. Et un dessin **remplace**, il ne s'ajoute pas : le
spinner de la coquille, le glyphe d'un état vide, l'alerte du 404 et le disque
« tu es ici » du menu sont partis avec leur CSS.

**Et la règle qui aurait évité la foulée de la séance** (6 sept. 2026) : avant
de poser une figure, nommer ce qu'elle retire et ce qu'elle est seule à dire.
Un dessin a sa propre ligne, se pose sur un filet que la mise en page trace
déjà pour une autre raison, remplace un ornement qui existait, et change avec
un état que rien d'autre n'énonce. Une figure posée là où il restait de la
place, et qui répète ce que la page dit ailleurs, est un dessin pour mettre un
dessin : la foulée de la séance redisait une quatrième fois la zone dominante,
et la place qui restait était à l'intérieur d'un graphique.

Le calage se calcule depuis le `viewBox`, jamais à l'œil, et se vérifie mesuré
en page, en clair et en sombre.

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

## Où les dessins sont (6 septembre 2026)

Cette liste remplace le plan d'origine — états vides, portes, 404, en-têtes,
partage. Chaque emplacement pose sa figure sur une règle de la page.

**Le héros de l'accueil.** Le duo se tient sur le filet pleine largeur qui
ferme le héros ; à gauche, la rangée des boutons finit sur la même règle. 460 px
de large sur bureau, 240 sur téléphone, sous les boutons, pour que la pastille
MENU ne le recouvre pas au premier écran.

**Les portes sont nues.** Décision du 6 septembre, qui remplace « un dessin par
porte » : à 64-88 px dans un coin de carte, le trait devenait un pictogramme.
`DoorCard` n'a plus de prop `art`, et ne doit pas la retrouver. La figure de la
porte où l'on est vit dans le **menu plein écran**, à 200 px de haut sur un
filet sous les six lignes ; le duo tient la place quand aucune porte n'est
active.

**Les états vides.** `EmptyState` choisit la figure par variante, voir « Le
composant ».

**Le 404.** La règle part du bord gauche et s'arrête vers 60 % de l'écran ;
walking-away marche vers le vide à son bout, retourné par CSS — une
orientation de scène, pas une correction du dessin. Le « 404 » est une cote en
mono posée après la fin du sol. L'alerte et son glyphe sont partis.

**Le ruban du plan.** Une figure se tient sur le bord haut du ruban des phases,
au milieu de la semaine en cours ; la pose dit la phase sous les pieds — marche
de Z2 en base, foulée de Z3 en construction, sprint de Z5 au pic, allure de Z4
en affûtage, étirement en récupération. Décision du propriétaire : le trait
vermillon « maintenant » reste, sous la semelle. Un plan pas commencé attend
debout sur la ligne de départ, un plan terminé s'en va par le bout.

**La planche des six**, sur la méthodologie et les deux pages de chiffres : six
figures sur une règle d'un bord à l'autre de la colonne, le même corps à la
même échelle — une figure penchée est plus large, pas plus grande —, le code et
le nom en graduations dessous. Elle remplace la bande de pastilles. Dans la
table, entre Z3 et Z4, une annotation avec figure sur bureau, flèche seule sur
téléphone.

**La séance.** *La foulée par zone dominante est retirée le 6 septembre 2026 —
décision du propriétaire, qui remplace l'entrée précédente.* Elle disait la zone
que le ZoneBadge, le FactStrip, la teinte de la frise et la table de répartition
énoncent déjà quatre fois : un dessin qui s'ajoute au lieu de remplacer. Et sur
téléphone elle se posait entre la frise et son axe — 185 px mesurés entre une
courbe et sa légende, et une semelle calée sur une abscisse de temps, qui se lit
comme un curseur quoi qu'en dise le commentaire du code. Le sol, lui, était
juste : l'axe d'une frise reste un sol légitime, ce n'est pas ce qui a été
retiré.

La figure de l'écran est maintenant **la figure qui montre, au départ du trait
de l'annotation du profil**, à 200 px de haut sur le bord haut de la ZoneBar —
le seul filet que cette bande trace déjà. Elle s'efface sous 640 px avec toutes
les figures d'annotation : le téléphone garde le texte et la flèche. C'est le
premier appelant de la variante `figure`, restée sans emploi depuis sa création.

**Le gainage reste au renforcement**, sur le filet du héros. **Vélo et natation
n'ont pas de figure** : le gréement ne dessine pas de cycliste, et un coureur
contredirait la page. En attente, pas un oubli.

**L'échauffement** (`/guides/warmup`) : l'étirement sur le filet de la bande
qui suit l'en-tête, 200 px de haut (160 sur téléphone) — la valeur du CSS, qui a
corrigé les 148 px prescrits ici, le trait rendant alors 0,95 px (`guides.css`).

**La nutrition** (`/nutrition`) : `easy-run` sur le filet de la bande qui suit
l'en-tête, au même calage que l'échauffement. Le dessin avait sa destination
écrite dans son générateur (`scripts/doodles/effort.mjs`) et n'y avait jamais
été posé. Une page de nutrition attrape mécaniquement une gourde ou une
assiette, que la règle 2 interdit ; l'allure tenue dit le POURQUOI au lieu du
QUOI, avec un corps. Un seul guide et un seul hub portent une figure : c'est la
répétition qui ferait collection, pas la classe CSS.

**Hors de l'app** : la coquille de chargement (le duo inliné dans `index.html`,
sur une règle qui s'ouvre en 240 ms), les images Open Graph
(`scripts/generate-og-image.ts`, le duo injecté tel quel) et la bannière du
README, claire et sombre, générée depuis le même gabarit.

**Le partage est reporté.** Deux des quarante cartes (`PaperSheet`,
`ZonePlate`) portent déjà le duo et les six, mais elles datent d'avant la
coupe : la figure y est centrée dans sa boîte, pas posée sur une règle. La
passe sur les cartes de partage viendra après. Ces gabarits rendent en PNG via
`html-to-image` avec `skipFonts`, donc un SVG y passe alors qu'un texte stylé
n'y passerait pas — le doodle reste le bon véhicule pour ces surfaces.

## Le composant

`src/components/domain/IllustrationSlot.tsx` porte le trou réservé : contour en
tirets sur une trame, avec le brief de production imprimé dedans. C'est
délibéré — un rectangle vide se lit comme un bug, un brief imprimé se lit comme
une page encore sous presse.

Quand un dessin est là — prop `art`, un SVG importé avec `?react` ; Vite
embarque `vite-plugin-svgr`, voir comment `src/assets/logo.svg` est importé :

- l'œuvre remplace le brief ; `brief` reste le repli, pour que les emplacements
  non pourvus soient inchangés ;
- `role="img"` et le nom accessible `label` ne changent pas, avec ou sans
  dessin ;
- le contour en tirets et la trame partent, dans ce seul cas ;
- l'œuvre hérite de `currentColor`, et un élément tracé en `var(--accent)`
  garde son accent ;
- **un dessin ne prend jamais de hauteur.** `height` ne sert qu'au brief. Le
  slot fixe la largeur — prop `width`, ou `--slot-w` en CSS, parce qu'un style
  inline ne se surcharge pas par media query — et le `viewBox` donne le ratio.
  Une hauteur en pixels ferait centrer le dessin (`preserveAspectRatio`) et
  flotter la semelle dans la boîte ;
- `ground="rule"` pose le slot sur la bordure basse de son parent, descendu de
  `--rule-bite`.

`src/components/ui/empty-state.tsx` prend un dessin par variante : standing
pour ce qui n'est pas commencé, wondering pour ce qui n'a rien trouvé et pour
une panne ; `art` surcharge, `default` garde le glyphe. Une décision au lieu de
dix-neuf, et le même état porte toujours la même figure. La carte en tirets a
disparu : ce contour est la texture du trou réservé, et une étagère vide n'est
pas un trou. La figure se tient à gauche sur une règle qui court sur toute la
largeur du conteneur ; les mots sous la règle sur téléphone, à côté sur un
écran large, où le bouton pose sa base sur la même règle.

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

import type { ChangelogVersion } from "./types";

export const changelogVersions: ChangelogVersion[] = [
  {
    version: "1.0.1",
    date: "2026-09-19",
    changes: {
      added: [
        {
          text: "Un lien de séance partagé montre la séance. Les 250 URLs `/workout/<id>` servaient toutes la même carte, celle de la bibliothèque : envoyer un 30/30 dans une conversation et envoyer la bibliothèque entière donnaient exactement le même aperçu, sans le nom de la séance ni ce qu'elle demande. Chaque séance a maintenant sa carte en 1200 × 630, son titre en vedette, sa durée, sa zone dominante et son niveau, dessinée dans le style de la maison, papier, encre, le filet de sol et les deux coureurs. Les cartes reprennent le gabarit des six cartes de section par une variante, pour que la charte reste à un seul endroit, et le nom d'une séance y prend l'encre et la place que le logo prend ailleurs. Elles sont peintes au build par un Chrome sans interface, jamais à la demande, l'app n'ayant pas de serveur : `generate-route-meta` ne pointe une carte que si son PNG existe et retombe sinon sur la carte de la bibliothèque, donc ajouter une séance sans repeindre dégrade au lieu de servir un 404. Les 250 fichiers sont hors du précache du service worker, puisque seuls les robots des réseaux les lisent et que les précacher ajoutait 16 Mo à chaque installation",
          textEn: "A shared session link shows the session. All 250 `/workout/<id>` URLs served the same card, the library one: sending a 30/30 into a conversation and sending the whole library produced exactly the same preview, with neither the session's name nor what it asks of you. Each session now has its own 1200 × 630 card, its title as the headline, its duration, its dominant zone and its level, drawn in the house style, paper, ink, the ground rule and the two runners. The cards reuse the template of the six section cards through a variant, so the house style stays in one place, and a session's name takes the ink and the room the wordmark takes elsewhere. They are painted at build time by a headless Chrome, never on demand, the app having no server: `generate-route-meta` points a route at its card only when the PNG exists and falls back to the library card otherwise, so adding a session without repainting degrades instead of serving a 404. The 250 files sit outside the service worker's precache, since only the social crawlers read them and precaching them added 16MB to every install",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
    },
  },
  {
    version: "1.0.0",
    date: "2026-09-19",
    changes: {
      added: [
        {
          text: "Une séance se partage en image dans le style de la maison, dans les quatre tailles que la semaine avait déjà, en tête du carrousel. Les quarante pastiches restent, mais la planche dessinée dans la langue propre de l'app, papier, encre, chaque arête filetée, la rampe pour les zones et l'unique point vermillon du logo, n'était qu'un gabarit portrait avec un dessin et aucune structure. Les quatre nouvelles planches impriment ce qu'est une séance, et rien de plus : le nom, ses faits en mono (catégorie, difficulté, durée, zone dominante, charge), le profil en grand sur la rampe avec son axe, puis trois lignes filetées, une par phase, chaque bloc une puce sur la teinte de sa zone portant sa durée et son code (`2' Z5`, `15' Z1-Z2`, une plage restant une plage), une répétition écrite comme le résumé de la page l'écrit (`2 × ( 12 × 30\" Z5 / 30\" Z1 ) + 3' Z1`, la récupération en pointillé), la durée de la phase à droite et, sous une phase de trois blocs au plus, les mots des blocs. Le temps en zones suit en barre filetée, et la première astuce avec les deux coureurs prennent la place qu'une séance courte laisse. `Sheet` (1080 × 1350), `Square` (1080 × 1080), `Landscape` (1200 × 675, les puces seules) et `Story` (1080 × 1920). Une planche ne peut pas grandir, donc une séance dense prend sa place sur le corps des puces, par paliers. Vérifié sur une sortie vélo de récupération à un bloc, un footing d'endurance à quatre blocs, un 30/30 à séries imbriquées, une séance mixte tempo et VMA et un fartlek de treize blocs, dans les quatre tailles",
          textEn: "A session shares as an image in the house style, in the four sizes the week already has, first in the picker. The forty pastiches stay, but the sheet drawn in the app's own language, paper, ink, every edge ruled, the ramp for the zones and the wordmark's one vermillon dot, was one portrait template with a drawing and no structure. The four new sheets print what a session is, and no more: the name, its facts in mono (category, difficulty, duration, dominant zone, load), the profile large on the ramp with its axis, then three ruled lines, one per phase, each block a chip on its zone's tint carrying its duration and its code (`2' Z5`, `15' Z1-Z2`, a range kept as a range), a repeat written the way the page's summary writes it (`2 × ( 12 × 30\" Z5 / 30\" Z1 ) + 3' Z1`, the recovery dashed), the phase's duration on the right and, under a phase of three blocks at most, the blocks' words. The time in zones follows as a ruled bar, and the first tip with the two runners take the room a short session leaves. `Sheet` (1080 × 1350), `Square` (1080 × 1080), `Landscape` (1200 × 675, chips alone) and `Story` (1080 × 1920). A sheet cannot grow, so a dense session takes its room from the chips' type in steps. Verified on a one-block recovery ride, a four-block endurance run, a 30/30 with nested sets, a mixed tempo and VMA session and a thirteen-block fartlek, in the four sizes",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Une semaine se partage en image, en quatre tailles, depuis le bouton de partage de sa page : la même feuille façon Strava que les séances (carrousel, enregistrer, copier, partage natif, copier le lien), avec quatre planches dessinées dans le style de la maison, papier, encre, chaque arête filetée, la rampe pour les zones et l'unique point vermillon du logo. `Sheet` (1080 × 1350, celle qu'on envoie à quelqu'un qui va la lire) imprime lundi à dimanche en rangées avec chaque nom en entier et une barre filetée sous chaque séance, le rythme se lisant en descendant la page ; `Square` (1080 × 1080) et `Landscape` (1200 × 675) fondent le rythme et le tableau en un seul objet, sept barres et sous chaque barre les cartes du jour ; `Story` (1080 × 1920) met le rythme en premier et en grand, puis les séances. Chaque planche porte le nom de la semaine, ses faits (séances, heures sur le budget, charge) et la répartition 80/20 en toutes lettres, et les portraits les deux coureurs à l'encre. Les chiffres du rythme viennent d'un seul utilitaire que le graphique de la page lit maintenant aussi, donc l'image montre la semaine que le tableau montre. La feuille de partage elle-même est devenue générique (`ShareSheet`), le dialogue d'une séance en étant la première instance ; son rail cale maintenant la dernière diapositive au centre, faute de quoi, avec quatre gabarits proposés, elle ne pouvait jamais être choisie",
          textEn: "A week shares as an image, in four sizes, from the share button of its page: the same Strava-style sheet the sessions use (carousel, save, copy, native share, copy the link), with four sheets drawn in the house style, paper, ink, every edge ruled, the ramp for the zones and the wordmark's one vermillon dot. `Sheet` (1080 × 1350, the one to send to someone who will read it) prints Monday to Sunday as rows with every name in full and a ruled bar under each session, the rhythm read down the page; `Square` (1080 × 1080) and `Landscape` (1200 × 675) fuse the rhythm and the board into one object, seven bars and under each bar the day's cards; `Story` (1080 × 1920) puts the rhythm first and tall, then the sessions. Every sheet carries the week's name, its facts (sessions, hours against the budget, load) and the 80/20 split in words, and the portrait ones the two runners in ink. The rhythm's figures come from one helper the page's chart now reads too, so the image shows the week the board shows. The share sheet itself became generic (`ShareSheet`), the workout dialog being its first instance; its track now pads to centre the last slide, which with four templates on offer could never be selected",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Le cockpit dit quand il n'est pas sur aujourd'hui, et y ramène. Une page nommée `Today` pouvait montrer le 2 septembre avec un point de trois pixels pour seul indice d'où était aujourd'hui : la ligne de date porte maintenant l'écart (`15 days ago`) sur une deuxième ligne réservée avec un lien `Back to today`, vide le jour même pour que rien ne bouge au premier choix, et aujourd'hui, dans la grille du mois, porte un anneau autour de son numéro, la convention de tous les calendriers, plus forte que le trait sous le jour choisi. La grille gagne une légende d'une ligne en dessous (fait, prévu, sauté, repos, hors plan) dessinée avec les vraies marques, agrandies à dix pixels, parce que plein contre creux à huit pixels était sous ce qu'un coup d'œil distingue. Les deux périodes de l'écran sont nommées, `22 sessions planned` dans l'en-tête de la grille pour le mois entier et `Review to 17 Sept.` pour le mois vécu jusqu'ici, et la légende du bilan nomme sa règle par l'origine plutôt que par le mérite : `from the plan` et `as complement`, puisque le renforcement comptait comme fait quand le vélo comptait comme extra et que rien ne disait que la ligne était plan contre journal, et non course à pied contre le reste. La jauge du cockpit abandonne son verdict : la pastille 80/20 jugeait dix-sept jours avec une heure de renforcement hors des zones, et le seul endroit où l'écran juge est le seul endroit où il ne doit pas se tromper, donc elle montre la répartition en chiffres et met à part ce qui n'a pas de zone (le renforcement, rien à qualifier) et ce qui n'a pas de gabarit connu. Sur un écran large, le bilan et la jauge se posent côte à côte sous les deux colonnes au lieu d'allonger celle de gauche",
          textEn: "The cockpit says when it is not on today, and brings you back. A page named `Today` could show the 2nd of September with only a three-pixel dot to say where today was: the date line now carries the gap (`15 days ago`) on a reserved second line with a `Back to today` link, blank on today so nothing moves at the first pick, and today in the month grid wears a ring around its number, the convention of every calendar, stronger than the rule under the picked day. The grid gains a one-line legend under it (done, planned, skipped, rest, off plan) drawn with the real marks, enlarged to ten pixels, since filled against hollow at eight pixels was below what a scan can tell apart. The two periods on the screen are named, `22 sessions planned` in the grid header for the whole month and `Review to 17 Sept.` for the month lived so far, and the review's legend names its rule by origin rather than merit: `from the plan` and `as complement`, since strength counted as done while cycling counted as extra and nothing said the line was plan against journal, not running against the rest. The cockpit's gauge drops its verdict: the 80/20 badge judged seventeen days with an hour of strength outside the zones, and the one place the screen passed judgement is the one place it must not be wrong, so it shows the split as numbers and says apart what has no zone (strength, nothing to qualify) from what has no known template. On a wide screen the review and the gauge sit side by side under the two columns instead of lengthening the left one",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Sous le bilan du mois, sur le cockpit, ce que le mois vécu a pesé en INTENSITÉ : facile, tempo, intense, dans la jauge de polarisation que la semaine autonome utilise déjà. Elle est calculée comme cette semaine la calcule et pour la même raison, PAR SÉANCE selon sa zone caractéristique plutôt que par temps en zone, puisqu'une séance de VO2 est de l'intensité même quand la plupart de ses minutes sont de l'échauffement. Une séance faite prend la zone dominante de son gabarit sur ses minutes réelles, une activité de semaine prend son effort prévu, et une entrée du journal prend son effort perçu (donné, ou déduit de son motif : un trajet domicile-travail sans RPE se lit facile), sur les mêmes bandes que la clôture d'une séance. Le renforcement et un gabarit sans charge ne sont pas devinés : leurs minutes sont comptées à part et la jauge le dit. La ligne de conseil reste éteinte, c'est le passé et le mot du verdict suffit",
          textEn: "Under the month's review on the cockpit, what the month lived weighed in INTENSITY: easy, tempo, intense, in the polarisation gauge the standalone week already uses. It is computed the way that week computes it and for the same reason, PER SESSION by its characteristic zone rather than by time in zone, since a VO2 session is intensity even when most of its minutes are warm-up. A completed session takes its template's dominant zone at its actual minutes, a week activity takes its planned effort, and a journal entry takes its perceived effort (given, or deduced from its purpose: a commute without an RPE reads easy), on the same bands the session close uses. Strength and an unloaded template are not guessed: their minutes are counted apart and the gauge says so. The advice line stays off, this is the past and the verdict word is enough",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Le cockpit (`/today`) gagne un MOIS, à côté de la semaine, sans rien changer d'autre. Un sélecteur `Week / Month` se pose au-dessus de la bande des sept jours ; le mois est le même instrument un cran plus loin, une grille de dates dont le choix recharge la pile en dessous exactement comme la bande le fait, donc une séance de n'importe quelle semaine du plan se lit et se clôture d'ici. Chaque case porte ce que la colonne de la bande porte déjà, en plus petit : les glyphes de sport, une marque par séance dont la FORME dit le statut (contour prévue, pleine faite, hachurée sautée, un trait pour le repos) et le tiret des compléments sous le filet de sol, avec les deux mêmes marques pour le jour choisi (encre sur le numéro) et aujourd'hui (un point rond). La grille réserve toujours six rangées, donc feuilleter d'un mois à cinq rangées vers un mois à six ne déplace rien sous le pouce ; les flèches sont bornées aux mois du plan, et les cases hors du plan sont inertes. Sous la grille, le bilan du mois reprend mot pour mot le bilan de la semaine, borné à AUJOURD'HUI pour le mois en cours : un mois en cours porte des séances qui n'ont pas encore eu lieu, et les compter comme non clôturées accuserait à tort (douze non clôturées le 17, onze simplement à venir) ; ce que le mois prévoit en entier, l'en-tête de la grille le dit (`22 sessions · 20h48`), ce qu'il a vécu jusqu'ici, le bilan le dit. Les kilomètres restent par sport, comme partout. Le mode n'est pas retenu : l'écran d'arrivée est la semaine, tous les matins, et y revenir ramène à aujourd'hui. À partir de 900 px le mois se pose en DEUX COLONNES, la grille et son bilan à gauche et le jour choisi à droite, pour que le mois et la séance se lisent sans défilement : le cockpit est une colonne de 620 px dessinée pour le téléphone et gardée telle quelle sur ordinateur, ce qui est juste pour un écran de dix secondes et faux pour une consultation qui y empilait une grille de six rangées, un bilan et une jauge, 2 100 px de haut avec la moitié de la largeur vide. Sous 900 px la grille garde la colonne unique et l'ordre validé sur téléphone ; le mode semaine ne change pas de forme",
          textEn: "The cockpit (`/today`) gains a MONTH, beside the week, with nothing else changed. A `Week / Month` switch sits above the seven-day strip; the month is the same instrument one step further, a grid of dates whose pick reloads the stack below it exactly as the strip does, so a session of any week of the plan can be read and closed from here. Each cell carries what the strip's column already carries, scaled down: the sport glyphs, one mark per session whose SHAPE says its status (outline planned, filled done, hatched skipped, a rule for rest) and the complement tick under the ground rule, with the same two marks for the picked day (ink on the number) and today (a round dot). The grid always reserves six rows, so leafing from a five-row month to a six-row one moves nothing under the thumb; the arrows are bounded to the plan's months, and cells outside the plan are inert. Under the grid, the month's review reuses the week review verbatim, bounded to TODAY for the month being lived: a month in progress carries sessions that have not happened yet, and counting them as unclosed would accuse wrongly (twelve unclosed on the 17th, eleven of them simply ahead); what the month plans in full, the grid header says (`22 sessions · 20h48`), what it lived so far, the review says. Kilometres stay per sport, as everywhere. The mode is not remembered: the arrival screen is the week, every morning, and switching back to it returns to today. From 900px the month lays out in TWO COLUMNS, the grid and its review on the left and the picked day on the right, so the month and the session read without scrolling: the cockpit is a 620px column drawn for the phone and kept as such on desktop, which is right for a ten-second screen and wrong for a consultation that stacked a six-row grid, a review and a gauge in it, 2100px tall with half the width empty. Under 900px the grid keeps the single column and the order validated on the phone; the week mode does not change shape",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Une séance d'une semaine autonome dit comment elle compte : souple ou ferme. Le modèle figeait une durée sur chaque séance posée, y compris celles que personne n'avait décidées, donc une semaine modèle portait le même faux chiffre qu'une semaine réellement vécue. Une séance SOUPLE garde la plage de son gabarit et la semaine la compte au milieu de cette plage, avec des kilomètres en estimation à son allure et jamais en donnée ; une séance FERME compte la durée et les kilomètres posés sur elle, la forme d'une semaine vécue ou partagée avec quelqu'un qui doit la suivre. Absente, la précision se lit ferme, ce qu'était chaque séance stockée sans le dire. Le défaut à la pose suit ce qui est vraiment décidé : une séance Z4+ se prévoit au chronomètre et arrive ferme, un footing facile ou une sortie longue se court aux sensations et arrive souple, le renforcement reste ferme. Le lien de partage porte la précision et les kilomètres dans deux positions de tuple de plus, ajoutées à la fin, donc les liens plus anciens se décodent sans changement",
          textEn: "A session of a standalone week says how it counts: loose or fixed. The model froze a duration on every session placed, even the ones nobody had decided, so a template week carried the same false figure as a week actually lived. A LOOSE session keeps the range of its template and the week counts it at the middle of that range, with kilometres as an estimate at its pace and never as data; a FIXED one counts the duration and kilometres set on it, the shape of a week lived or shared with someone who must follow it. Absent, the precision reads fixed, which is what every stored session was without saying so. The default at placement follows what is really decided: a Z4+ session is planned at the stopwatch and lands fixed, an easy or long run is run by feel and lands loose, strength stays fixed. The share link carries the precision and the kilometres in two more tuple positions, appended, so older links decode unchanged",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Une feuille de séance sur la semaine autonome : un tap sur une carte ouvre la feuille propre à la séance par le bas d'un téléphone (par le côté sur un écran plus large), au lieu d'un menu contextuel au doigt, qui est un geste de souris. Elle tient la seule décision qu'une séance de semaine demande, souple ou ferme avec la durée et les kilomètres, ou la durée et l'effort d'une activité, et sous elle les gestes du menu : voir, refaire un tirage, verrouiller, déplacer sur un autre jour, retirer",
          textEn: "A session sheet on the standalone week: a tap on a card opens the session's own sheet from the bottom of a phone (from the side on a wider screen), instead of a context menu at the finger, which is a mouse gesture. It holds the one decision a week session asks, loose or fixed with the duration and kilometres, or the duration and effort of an activity, and under it the menu's gestures: view, re-draw, lock, move to another day, remove",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Le sélecteur de séances atteint tous les catalogues et l'atelier. Les séances de vélo et de natation ne pouvaient pas du tout être ajoutées à une semaine depuis sa page, seules les activités le pouvaient ; le `<select>` du sélecteur devient une rangée de puces, une par catalogue (footings, qualité, longues, renforcement, vélo, natation, activités, les miennes), il choisit le jour quand on l'ouvre depuis la barre du bas, et `Create a session` vient en premier : l'atelier s'ouvre avec le chemin du retour, et la séance qu'il enregistre se pose sur le jour choisi",
          textEn: "The session picker reaches every catalog and the builder. Cycling and swimming sessions could not be added to a week from its page at all, only activities could; the picker's `<select>` becomes a row of chips, one per catalog (easy runs, quality, long, strength, cycling, swimming, activities, mine), it chooses the day when opened from the dock, and `Create a session` sits first: the builder opens with the way back, and the session it saves lands on the chosen day",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Une activité de semaine porte une durée et un effort prévu, pour qu'un trajet à vélo pèse quelque chose dans une semaine autonome. Le journal d'activités est daté, ce qui fait sa force et ce qui le rend muet sur un modèle `Ma semaine` : il n'y a pas de mardi contre lequel s'inscrire. Trois cartes `Vélo` sur le tableau annonçaient donc 3 séances, 3,1 h, un rythme plat sur les trois jours de trajet et un verdict `too much intensity 65 / 35`, parce que trois cartes sans durée pèsent zéro. Poser ou taper une activité demande maintenant les deux choses qu'un modèle peut dire honnêtement, combien de temps (le même champ `h:mm` que le journal) et à quel point c'est dur, en trois mots plutôt qu'en dix étapes, puisqu'on PRÉVOIT un trajet facile et qu'on ne le prévoit pas à 3/10. L'effort devient une zone (facile Z2, modéré Z3, dur Z4) et la zone fait le reste par les chemins qui existaient déjà : la polarisation classe l'activité comme n'importe quelle séance, le rythme lui donne une hauteur et une couleur, la charge est le TSS de la zone, la même unité que les séances de course. Le renforcement, le yoga et le repos actif ne gardent aucune zone et comptent en temps seulement. Une entrée `Vélotaf` vient en tête du sélecteur, préremplie depuis le schéma de trajets déclaré dans le profil, jamais doublée pour un retour que personne n'a annoncé ; une carte sans durée dit `Duration to set` et ne pèse rien tant qu'elle n'en a pas une. Les liens partagés portent l'effort dans une sixième case de tuple, et les activités voyagent maintenant avec une semaine partagée au lieu d'être jetées comme séances inconnues",
          textEn: "A week activity carries a duration and a planned effort, so a bike commute weighs something in a standalone week. The activity log is dated, which is its strength and what makes it mute on a `Ma semaine` template: there is no Tuesday to log against. Three `Vélo` cards on the board therefore announced 3 sessions, 3.1 h, a flat rhythm on the three commuting days and a `too much intensity 65 / 35` verdict, because three cards without a duration weigh zero. Placing or tapping an activity now asks the two things a template can honestly say, how long (the same `h:mm` field as the log) and how hard, in three words rather than ten steps, since one PLANS a commute easy and does not plan it at 3/10. The effort becomes a zone (easy Z2, moderate Z3, hard Z4) and the zone does the rest through the paths that already existed: the polarisation classes the activity like any session, the rhythm gives it a height and a colour, the load is the zone's TSS, the same unit as the running sessions. Strength, yoga and active rest keep no zone and count in time only. A `Vélotaf` entry sits first in the picker, pre-filled from the profile's commute pattern as declared, never doubled for a return trip nobody announced; a card without a duration says `Duration to set` and weighs nothing until it has one. Shared links carry the effort in a sixth tuple slot, and activities now travel with a shared week instead of being dropped as unknown workouts",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Un journal d'activités complémentaires : trajets à vélo, sorties, et séances faites hors du plan. Il répond à un défaut que l'app n'avait aucun moyen de seulement voir : quelqu'un qui prépare un marathon en allant au travail à vélo quatre fois par semaine vivait six heures d'entraînement quand son plan en annonçait quatre, et la charge calculée était fausse dans le seul sens qui fait mal. Une activité est un ENREGISTREMENT daté dans sa propre clé, pas une séance du plan : elle existe sans plan, elle survit au plan, et un plan la retrouve par ses dates. Le seul champ obligatoire est la DURÉE, délibérément, c'est la seule mesure qui existe toujours et la seule dont la charge se calcule ; la distance, le dénivelé et les watts moyens affinent et n'exigent jamais. Un motif `commute | trip | training` est de première classe parce que c'est un fait d'entraînement et non une étiquette de classement : un trajet est du volume et de la fatigue sans être un stimulus, et le compter comme une séance serait l'image inversée du mensonge qu'on corrige",
          textEn: "A log of complementary activities: bike commutes, trips, and sessions done outside the plan. It answers a fault the app had no way of even seeing: someone preparing a marathon who rides to work four times a week was living six hours of training while their plan announced four, and the load it computed was wrong in the one direction that hurts. An activity is a dated RECORD in its own key, not a session in the plan: it exists without a plan, it survives the plan, and a plan finds it back by its dates. The only required field is the DURATION, deliberately, it is the one metric that always exists and the only one load is computed from; distance, elevation and average watts refine and never demand. A `commute | trip | training` purpose sits in first class because it is a training fact, not a filing label: a commute is volume and fatigue without being a stimulus, and counting it as a session would be the mirror image of the lie being fixed",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Un bilan de semaine le dimanche, sur le cockpit et en tête du journal. Il est DESSINÉ, pas écrit : le ratio est le titre (3/4, au corps d'affiche), et le volume est une barre qui met trois quantités sur un seul axe, ce qui a été fait, ce qui a été fait en plus, et une graduation à l'endroit du prévu, pour qu'une semaine qui a dépassé sa cible se voie au lieu de se calculer à partir de trois nombres. Dépasser la marque est exactement la semaine que l'app ne savait pas décrire avant : quatre heures annoncées, six heures vécues. Une phrase ne survit que là où il n'y a pas de nombre à montrer, rien de clôturé, ou pas de plan cette semaine-là. Il n'a pas d'écran à lui et n'en veut pas : la bande des sept jours choisit déjà un jour, donc choisir dimanche est le geste qui demande le bilan. Deux honnêtetés qu'il paie, une séance non clôturée n'est pas une séance sautée (elle a son propre compteur, et le bilan refuse de juger une semaine où rien n'a été clôturé), et l'observance se mesure contre ce qui était PRÉVU, pas contre ce qui a été clôturé. Sans plan en cours, il retombe sur la semaine calendaire, puisque les trajets n'attendent pas un plan pour compter",
          textEn: "A Sunday week review, on the cockpit and at the head of the log. It is DRAWN, not written: the ratio is the title (3/4, at display size), and the volume is a bar putting three quantities on one axis, what was done, what was done on top, and a graduation at what was planned, so a week that ran past its target is seen rather than computed from three numbers. Overshooting the mark is exactly the week the app could not describe before: four hours announced, six hours lived. A sentence survives only where there is no number to show, nothing closed yet, or no plan that week. It has no screen of its own and wants none: the seven-day strip already picks a day, so picking Sunday is the gesture that asks for the review. Two honesties it pays for, an unclosed session is not a skipped one (it has its own count, and the review refuses to judge a week where nothing was closed), and adherence is measured against what was PLANNED, not against what was closed. With no plan running it falls back to the calendar week, since commuting does not wait for a plan to count",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Les statistiques d'un plan portent le volume complémentaire, sur les dates du plan : temps, charge, dénivelé, et la part du temps total que cela représente. Le temps s'additionne entre disciplines parce que le temps est la seule chose qui s'additionne ; les kilomètres restent dans leur discipline, et aucune fonction nulle part ne les totalise, puisque 30 km de vélo et 10 km de course ne font pas 40 km. La charge est la durée multipliée par l'effort perçu (session-RPE, Foster 2001), qui est la méthode que le dépôt emploie déjà pour ses séances et la seule qui traverse les sports sans facteur de conversion inventé",
          textEn: "Plan statistics carry the complementary volume, over the plan's dates: time, load, elevation, and the share of total time it represents. Time is summed across disciplines because time is the one thing that sums; kilometres stay inside their discipline, and no function anywhere totals them, since 30 km of cycling and 10 km of running do not make 40 km. Load is duration times perceived effort (session-RPE, Foster 2001), which is the method the repository already uses for its sessions and the only one that spans sports without an invented conversion factor",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Le terrain est préparé pour le triathlon, sans prétendre le livrer : l'enregistrement d'activité porte l'union `Discipline` du dépôt, donc le jour où l'objectif est un triathlon le même enregistrement tient la natation, le vélo et la course sans changer de forme, et `purpose` continue de distinguer un trajet d'une séance. `PRACTICE_META.triathlon` reste `announced`, et le test qui le garde échoue toujours si quelqu'un le bascule sans les plans",
          textEn: "Ground prepared for triathlon, without pretending to deliver it: the activity record carries the repository's own `Discipline` union, so the day the goal is a triathlon the same record holds swim, bike and run with no change of shape, and `purpose` keeps telling a commute from a session. `PRACTICE_META.triathlon` stays `announced`, and the test that guards it still fails if anyone flips it without the plans",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "La structure d'une séance s'enregistre en image à part entière, entière ou une phase à la fois. Les cartes de phase, étape par étape, sont le bloc que les gens capturent pour l'emporter en séance ou l'envoyer à quelqu'un, et le PNG de séance existant rendait la carte entière à la place : le titre, le profil et la table des zones, mais pas ce découpage. Un menu `Download the structure` se pose sous les phases. Le bloc entier capture ce qui est VIVANT sur la page, allures personnalisées comprises ; une phase seule rend plutôt une copie hors écran à la largeur d'un téléphone, dans la présentation étroite (badges sans leur libellé, pas de profil de 96 px), pour que la carte portrait soit la même image qu'elle soit demandée depuis un ordinateur ou un téléphone",
          textEn: "The session structure saves as an image of its own, whole or one phase at a time. The phase cards, step by step, are the block people screenshot to take to a session or send to someone, and the existing session PNG renders the whole card instead: the title, the profile and the zone table, but not that breakdown. A `Download the structure` menu sits under the phases. The whole block captures what is LIVE on the page, personalised paces included; a single phase renders an off-screen copy at a phone's width instead, in the narrow presentation (badges without their label, no 96px profile), so the portrait card is the same image whether it is asked for from a desktop or a phone",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Un générateur pour les trois vignettes \"In motion\" du README (`video/scripts/readme-gifs.ts`, `bun run gifs`). Elles n'en avaient aucun, ce qui est exactement pourquoi elles ont pourri : une refonte plus tard elles portaient encore l'ancien logo, l'accent orange et les six couleurs de zone, sous des légendes citant une version de `copy.tsx` qui n'existait plus, et rien ne pouvait le signaler parce que rien ne savait d'où elles venaient. Ce sont maintenant les coupes 9:16 de `Feature-Polarise`, `Feature-Zones` et `Feature-Library`, carton de fin retiré, en anglais comme le README. Le budget de poids commande l'encodage : le fond des films dérive exprès, un dégradé qui dérive est la pire chose qu'un GIF puisse compresser, donc 6 images par seconde, 300 px, 64 couleurs et aucun tramage, le tramage fabrique du bruit exactement là où le film est plat",
          textEn: "A generator for the three \"In motion\" thumbnails of the README (`video/scripts/readme-gifs.ts`, `bun run gifs`). They had none, which is exactly why they rotted: one redesign later they still carried the old wordmark, the orange accent and the six zone colours, under captions quoting a version of `copy.tsx` that no longer existed, and nothing could flag it because nothing knew where they came from. They are now the 9:16 cuts of `Feature-Polarise`, `Feature-Zones` and `Feature-Library`, end card trimmed, in English like the README. The weight budget drives the encoding: the films' ground drifts on purpose, a drifting gradient is the worst thing a GIF can compress, so 6fps, 300px, 64 colours and no dithering at all, dithering manufactures noise exactly where the film is flat",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Le profil d'une séance atteint les deux formats denses de la bibliothèque. La carte de grille dessine la forme d'une séance depuis la refonte, une ZoneBar de 36 px de haut ; la carte compacte et la ligne de liste ne disaient que des mots, donc deux séances de trente minutes en Z2 se ressemblaient qu'il s'agisse d'un footing régulier ou d'un 30/30. Les deux portent maintenant la même barre et le même resserrement, dans une vignette de 18 px : sous le titre d'une carte compacte, et entre les faits et le favori d'une ligne de liste, sur une colonne fixe de 56 px (72 px quand les colonnes de faits reviennent) pour que les largeurs, qui sont du temps, s'alignent en descendant la liste. Une séance de renforcement porte sa rampe d'intensité à la même taille et au même endroit, puisque les deux disciplines partagent la grille et la liste",
          textEn: "The session profile reaches the two dense formats of the library. The grid card has drawn the shape of a session since the redesign, a ZoneBar 36px tall; the compact card and the list row said nothing but words, so two thirty-minute Z2 sessions looked identical whether they were a steady run or a 30/30. Both now carry the same bar and the same condensing, in an 18px thumbnail: under the title in a compact card, and between the facts and the favourite in a list row, on a fixed 56px column (72px once the fact columns come back) so the widths, which are time, line up down the list. A strength session carries its intensity ramp at the same size and in the same place, since the two disciplines share the grid and the list",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "Les pratiques deviennent un axe à part entière : chaque séance, collection, plan et parcours dit s'il est route, trail ou ultra, et toute l'app filtre dessus. L'axe est DÉDUIT du catalogue au lieu d'être stocké, donc il ne peut pas diverger de ce qui existe vraiment",
          textEn: "Practices become a real axis: every session, collection, plan and route declares whether it is road, trail or ultra, and the whole app filters on it. The axis is DERIVED from the catalogue rather than stored, so it cannot drift out of sync with what is actually there",
          category: "Pratiques",
          categoryEn: "Practices",
        },
        {
          text: "Huit séances écrites pour l'ultra, TRL-013 à TRL-020 : temps sur les pieds, marche rapide en côte, back-to-back, descente technique, nutrition en course",
          textEn: "Eight sessions written for ultra distance, TRL-013 to TRL-020: time on feet, power hiking, back-to-back days, technical descent, race-day fuelling",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Un plan trail tout prêt. L'étagère des plans prêts était vide pour le trail et l'ultra, donc un tiers des pratiques ouvrait sur une impasse. C'est un trail court de 30 km, la distance que le moteur modélise vraiment, et non un 40 km qui n'aurait correspondu à aucune table de volume ni d'affûtage",
          textEn: "A ready-made trail plan. The ready-made shelf was empty for trail and ultra, so a third of the practices opened onto a dead end. It is a 30 km short trail, the distance the engine actually models, rather than a 40 km label matching no volume, phase or taper table",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Les cartes de pratique disent ce qu'il y a derrière : combien de séances et de plans attendent, déduits du même index que la bibliothèque. Elles annonçaient une propriété du modèle, pas du contenu. Un rayon vide le dit maintenant au lieu de laisser croire",
          textEn: "Practice cards say what is behind them: how many sessions and plans are waiting, derived from the same index the library uses. They used to announce a property of the model rather than of the content. An empty shelf now says so instead of implying otherwise",
          category: "Pratiques",
          categoryEn: "Practices",
        },
        {
          text: "Les quinze collections portent leur pratique, et perdent un champ mort. Une curation comme Objectif ultra était invisible dans le nouvel axe. Pas de pratique veut dire transversale, donc valable partout : c'est le cas de dix des quinze",
          textEn: "The fifteen collections carry their practice, and lose a dead field. Curation like Ultra goal was invisible in the new axis. No practice means cross-cutting, so valid everywhere, which is the case for ten of the fifteen",
          category: "Collections",
          categoryEn: "Collections",
        },
        {
          text: "Une figure par pratique, réemployée dans la bibliothèque, le plan et les écrans vides. Trois des quatre existaient déjà : un dessin remplace, il ne s'ajoute pas",
          textEn: "One figure per practice, reused across the library, the plan and the empty states. Three of the four already existed: a drawing replaces, it does not accumulate",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Le logo est le mot lui-même, vectorisé. Le signe dessiné prévu a été construit, regardé, puis écarté : toutes les poses à portée du gréement des doodles donnaient une personne qui court, quand le brief demandait le sport en général",
          textEn: "The wordmark is the word itself, vectorised. The drawn sign that was planned got built, looked at, and dropped: every pose within reach of the doodle rig produced a person running, where the brief asked for sport in general",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "La coquille court pendant que l'app démarre : six images par foulée, deux foulées, et elle est retenue le temps d'une foulée pour que rien ne clignote. Un réglage permet de couper l'ouverture",
          textEn: "The shell runs while the app boots: six frames per stride, two strides, held for one stride so nothing flashes. A setting turns the opening off",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Des réglages qui masquent au lieu de supprimer : deux listes, les pratiques qu'on suit et les surfaces qu'on veut voir. L'app a 61 pages et personne n'en veut 61. Ce sont des listes d'opt-out, donc un réglage écrit avant ce lot gagne les nouveaux champs à la lecture, sans une ligne de migration",
          textEn: "Settings that hide instead of deleting: two lists, the practices you follow and the surfaces you want to see. The app has 61 pages and nobody wants 61. They are opt-out lists, so a settings object written before this release picks up the new fields on read, with no migration code",
          category: "Paramètres",
          categoryEn: "Settings",
        },
        {
          text: "Un stockage qui ne fait plus tomber l'app quand il échoue",
          textEn: "A storage layer that no longer takes the app down when it fails",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Le menu d'une séance dans la vue liste du plan : voir, trouver un parcours, clôturer, remplacer, substituer, retirer. C'est celui que le tableau de la semaine ouvrait déjà, désormais partagé par les deux vues au lieu d'être écrit deux fois",
          textEn: "The session menu in the plan's list view: view, find a route, close out, replace, substitute, remove. It is the menu the week board already opened, now shared by both views instead of written twice",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Le glisser-pour-fermer passe dans la primitive et sert sur les cinq tiroirs du bas : réglages du simulateur, générateur de semaine, indisponibilités, fin de séance, ajout de séance. Il n'existait que sur le dernier",
          textEn: "Drag-to-close moves into the primitive and now serves all five bottom sheets: simulator settings, week generator, unavailability, session close-out, add a session. It only existed on the last one",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Une porte typographique dans l'intégration continue, à côté de la parité FR/EN",
          textEn: "A typography gate in CI, next to the FR/EN parity check",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      changed: [
        {
          text: "Chaque PDF que l'app écrit est composé dans le style de la maison, sur un seul kit. La feuille de séance, le plan de course et le plan d'entraînement étaient trois documents Roboto avec des en-têtes de table noirs, un bandeau ardoise, des tuiles de stats bleues et une ligne de course rouge, chacun avec ses propres fontes, son pied et sa géométrie de page ; le PDF de la semaine venait d'être redessiné en papier et encre et les trois autres se lisaient comme un autre produit. Ils partagent maintenant `pdfHouse` : les caractères de l'app (Bricolage Grotesque et JetBrains Mono, embarquées depuis `public/fonts/pdf` et chargées seulement quand un PDF est demandé, Roboto en repli), le logo et un kicker mono en tête de chaque page, le titre en caractères d'affiche avec une ligne de faits dessous, des tables filetées à en-têtes mono et des filets entre les rangées, les zones sur la rampe d'encre, et un pied avec le compte des pages. La feuille de séance dessine son profil comme la frise que l'app montre, ses trois phases en tables filetées et ses astuces et erreurs en lignes filetées. Le plan de course imprime la distance en titre et l'allure cible, le départ et l'arrivée en faits, puis la chronologie, les splits, la nutrition, le petit-déjeuner, les repères et les listes de contrôle. Les phases du plan tiennent en une table, chaque semaine une table filetée sous une ligne mono (`S1 · Base · 2h24 · 11 km · SL 5 km`) avec le jour, la séance, son type, sa zone, sa durée et son résumé, une marque `key` sur les séances clés et la note d'allure sous sa rangée ; le lexique de fin imprime la structure de chaque séance comme le PDF de la semaine le fait, course et renforcement compris, et les exposants qui y renvoyaient ont disparu. Une semaine autonome garde son propre document",
          textEn: "Every PDF the app writes is set in the house style, on one kit. The session sheet, the race-day plan and the training plan were three Roboto documents with black table heads, a slate banner, blue stat tiles and a red race row, each with its own fonts, footer and page geometry; the week's PDF had just been redrawn as paper and ink and the other three read like another product. They now share `pdfHouse`: the app's own type (Bricolage Grotesque and JetBrains Mono, embedded from `public/fonts/pdf` and fetched only when a PDF is asked for, Roboto as the fallback), the wordmark and a mono kicker at the head of every page, the title in display type with a facts line under it, ruled tables with mono heads and hairlines between rows, the zones on the ink ramp, and a footer with the page count. The session sheet draws its profile as the same frieze the app shows, its three phases as ruled tables and its tips and mistakes as ruled lines. The race plan prints the distance as its title and the target pace, start and finish as its facts, then the timeline, splits, fuelling, breakfast, cues and checklists. The plan's phases are one table, each week a ruled table under a mono line (`S1 · Base · 2h24 · 11 km · SL 5 km`) with the day, the session, its type, zone, duration and summary, a `key` mark on the key sessions and the pace note under its row; the lexicon at the end prints every session's structure the way the week's PDF does, running and strength alike, and the superscripts that pointed to it are gone. A standalone week keeps its own document",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "La page d'une semaine autonome met le tableau en premier sur tous les écrans, et range le générateur. Sur un ordinateur, le tableau partageait sa colonne avec un rail de 340 px qui tenait toujours le générateur, ce qui laissait 95 px à chacun des sept jours, trois mots d'un nom et les actions au survol imprimées par-dessus la marque de zone, pendant que la moitié de la fenêtre restait vide ; et quelqu'un qui compose une semaine à la main l'éditait à côté d'un formulaire dont il ne se servait jamais. Le tableau prend maintenant toute la colonne, élargie à la mesure de 1 360 px, seul par défaut ; le générateur et le sélecteur de séances sont des OUTILS, ouverts depuis deux bascules de l'en-tête (`Generate`, et `Add a session` dans l'unique aplat vermillon) dans un rail qui se ferme quand on range l'outil, l'accent passant à l'appel propre de l'outil ouvert. Le résumé se replie sur la même bande d'une ligne que le téléphone avait déjà, les chiffres, le verdict 80/20 et la vignette du rythme, avec la barre complète derrière `Details`, pour que la semaine commence au-dessus de la ligne de flottaison. L'échelle d'intensité est imprimée une fois, repliée sous le tableau, au lieu d'une fois au-dessus et une fois en dessous. Les actions au survol d'une carte sont adossées au papier de la carte, donc sur une carte étroite elles couvrent proprement la marque de zone au lieu d'entrer en collision avec elle. Sur téléphone, la barre du bas garde `Add a session` et UNE pilule de tirage, qui ouvre les réglages dont l'appel propre génère, au lieu de deux, l'une qui tirait sur-le-champ avec des réglages que personne n'avait vus et l'autre qui les ouvrait. Entre 768 et 900 px le sélecteur n'ouvrait rien du tout, le rail étant replié et la feuille déjà masquée : la feuille tient maintenant jusqu'à ce que le rail existe. Recharger une semaine ne rouvre plus le générateur, l'état de navigation qui le demandait est consommé à l'arrivée",
          textEn: "The standalone week page puts the board first on every screen, and the generator away. On a desktop the board shared its column with a 340px rail that always held the generator, which left each of the seven days 95px, three words of a name and the hover actions printed over the zone mark, while half the viewport stayed empty; and someone composing a week by hand edited it beside a form they never used. The board now takes the whole column, widened to the 1360px measure, alone by default; the generator and the session picker are TOOLS, opened from two toggles in the header (`Generate`, and `Add a session` in the one vermillon fill) into a rail that closes when the tool is put away, with the accent moving to the open tool's own call. The summary folds to the same one-line strip the phone already had, the figures, the 80/20 verdict and the rhythm thumbnail, with the full bar behind `Details`, so the week begins above the fold. The intensity scale is printed once, folded under the board, instead of once above and once below. The hover actions on a card are backed with the card's own paper, so on a narrow card they cover the zone mark cleanly instead of colliding with it. On a phone the dock keeps `Add a session` and ONE draw pill, which opens the settings whose own call generates, in place of two, one that drew on the spot with settings nobody had seen and one that opened them. Between 768 and 900px the picker opened nothing at all, the rail being folded and the sheet already hidden: the sheet now holds until the rail exists. Reloading a week no longer reopens the generator, the navigation state that asked for it is consumed on arrival",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Le rythme de la semaine prend la moitié du résumé sur un écran large. La bande du téléphone met déjà la forme de la semaine à côté des chiffres ; à partir de 1 024 px la barre complète donnait au graphique une colonne de 18 rem contre tout le reste pour les chiffres et la jauge 80/20, et il se lisait comme une note de bas de page des zones. La barre se coupe maintenant en deux moitiés égales, les chiffres et la jauge d'un côté, le rythme de l'autre, avec le graphique plus haut et ses colonnes plus larges pour remplir sa moitié ; la bande repliée coupe sa ligne de la même façon entre les chiffres et la vignette",
          textEn: "The week's rhythm takes half the summary on a wide screen. The phone strip already puts the shape of the week beside the figures; from 1024px the full bar gave the chart an 18rem column against the rest for the figures and the 80/20 gauge, and it read as a footnote to the zones. The bar now splits in two equal halves, the figures and the gauge on one side, the rhythm on the other, with the chart taller and its columns wider to fill its half; the folded strip splits its line the same way between the figures and the thumbnail",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Le budget de volume appartient à la semaine, et il est facultatif. Les `6 h` contre lesquelles le résumé mesurait chaque semaine étaient le curseur du générateur, un réglage de formulaire, donc une semaine composée à la main lisait `12.1 / 6 h` et `Over the 6 h budget` contre un chiffre que personne n'avait choisi, et le seul moyen de le changer ou de le taire était les réglages du générateur. Le budget est maintenant stocké sur la semaine elle-même : une semaine faite à la main n'en a pas, et son résumé imprime le volume seul, sans barre et sans avertissement ; le générateur enregistre la cible sur laquelle il a composé, comme les semaines toutes prêtes ; et il se règle là où se règle la catégorie de la semaine, depuis une pastille `Budget` à côté d'elle dans l'en-tête de la page, d'où le générateur repartira la fois suivante ; le résumé ne fait que le lire. Les plans stockés gardent le champ à la normalisation",
          textEn: "The volume budget belongs to the week, and is optional. The `6 h` the summary measured every week against was the generator's slider, a setting of a form, so a week composed by hand read `12.1 / 6 h` and `Over the 6 h budget` against a figure nobody had chosen, and the only way to change or silence it was the generator's settings. The budget is now stored on the week itself: a week built by hand has none, and its summary prints the volume alone, with no bar and no warning; the generator records the target it composed to, as do the ready-made weeks; and it is set where the week's category is, from a `Budget` badge beside it in the page header (none, or so many hours), from which the generator starts next time; the summary only reads it. Stored plans keep the field through normalisation",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "La création d'une semaine offre trois portes au lieu de deux. La première servait à la fois le générateur et la composition à la main, et ouvrait toujours sur les réglages du générateur : `From scratch` (à la main) crée maintenant la semaine vide et ouvre le tableau seul, `Generate a week` la crée et ouvre le générateur, `Pre-built week` ne change pas",
          textEn: "Week creation offers three doors instead of two. The first door served both the generator and composing by hand, and always opened on the generator's settings: `From scratch` (by hand) now creates the empty week and opens the board alone, `Generate a week` creates it and opens the generator, `Pre-built week` is unchanged",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Une semaine partagée se prévisualise sur le tableau de l'éditeur lui-même, en lecture seule, au lieu d'une liste. La liste posait le nom de la séance à un bord d'une rangée de 1 070 px et ses marques à l'autre, imprimait `0s` pour une activité sans durée, et ne montrait jamais la forme de la semaine, qui est ce à quoi sert une semaine partagée ; la page dépensait en plus une carte de résumé entière pour elle. Elle montre maintenant la bande de résumé repliée et les mêmes sept jours que l'éditeur, cartes, marques de zone et légende repliée comprises, avec un jour de repos nommé `Rest` ; une carte ouvre la séance qu'elle nomme. `Add to my weeks` ne change pas",
          textEn: "A shared week is previewed on the editor's own board, read-only, instead of a list. The list put the session's name at one edge of a 1070px row and its marks at the other, printed `0s` for an activity without a duration, and never showed the shape of the week, which is what a shared week is for; the page also spent a full summary card on it. It now shows the folded summary strip and the same seven days as the editor, cards, zone marks and folded legend included, with a rest day named `Rest`; a card opens the workout it names. `Add to my weeks` is unchanged",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Le formulaire d'activité complémentaire ne propose plus `Bike commute` sous la course ou la natation. La rangée des motifs était une liste fixe, `Bike commute / Trip / Training`, quelle que soit la discipline : un mot de vélo sur une course à pied jusqu'au travail, et un trajet à la nage, ce qui n'était pas seulement absurde mais un faux chiffre à un tap, puisqu'une nage enregistrée en sortie pèse 3/10 au lieu de 5/10 dans la charge. Les motifs suivent maintenant la discipline, depuis la table qui dit déjà qu'il n'y a pas de dénivelé en piscine : le vélo, la course et les autres gardent les trois, avec le mot propre à la discipline (`Bike commute` à vélo, `Commute` à pied), et la natation perd la rangée entière, l'entraînement étant la seule chose que peut être une longueur. Passer un brouillon en natation ramène son motif, et l'effort par défaut qui le suit, sur l'entraînement ; une nage stockée portant une sortie se lit en entraînement à l'édition et s'enregistre ainsi. Le journal et le cockpit nomment un motif par la même fonction que le formulaire",
          textEn: "The complementary activity form no longer offers `Bike commute` under running or swimming. The purpose row was one fixed list, `Bike commute / Trip / Training`, whatever the discipline: a cycling word on a run to work, and a commute by swimming, which was not only absurd but a wrong number one tap away, since a swim logged as a trip weighs 3/10 instead of 5/10 in the load. The purposes now follow the discipline, from the same table that already says there is no elevation in the pool: cycling, running and other keep the three, with the discipline's own word (`Bike commute` on a bike, `Commute` on foot), and swimming drops the row altogether, training being the only thing a length can be. Switching a draft to swimming brings its purpose, and the default effort that follows it, back to training; a stored swim carrying a trip reads as training when edited and is saved that way. The log and the cockpit label a purpose through the same function as the form",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "La page d'une semaine autonome met le tableau en premier sur téléphone. Le résumé complet prenait le premier écran en entier et la semaine commençait un écran et demi plus bas ; le tableau est l'objet et le résumé sa conséquence, donc sous 900 px le résumé se replie en une bande (les chiffres, le verdict 80/20, une vignette du rythme) et s'ouvre à la demande. La barre du bas porte l'action du moment, `Add a session` dans l'unique aplat vermillon avec le tirage et les réglages en pilules à côté, puisqu'une fois la semaine sur le tableau, ce qu'on fait est ajouter ou ajuster une séance, pas la tirer de nouveau. L'échelle d'intensité est imprimée une fois, sous le tableau, là où elle l'était deux fois. Un jour de repos est une case en pointillé de la largeur de sa rangée, et le petit `+` en fin de journée remplie disparaît, la barre du bas le dit en toutes lettres et il couvrait les dernières rangées. La disposition sur ordinateur, le tableau à côté de son rail, ne change pas",
          textEn: "The standalone week page on a phone puts the board first. The full summary took the first screen entire and the week began a screen and a half lower; the board is the object and the summary its consequence, so under 900px the summary folds to one strip (the figures, the 80/20 verdict, a thumbnail of the rhythm) and opens on demand. The dock carries the action of the moment, `Add a session` in the one vermillon fill with the draw and the settings as pills beside it, since once a week is on the board the thing one does is add or adjust a session, not draw it again. The intensity scale is printed once, under the board, where it was printed twice. A rest day is one dashed slot the width of its row, and the small `+` at the end of a filled day goes, the dock states it in words and covered it on the last rows. The desktop layout, board beside its rail, is unchanged",
          category: "Expérience mobile",
          categoryEn: "Mobile",
        },
        {
          text: "Le résumé de la semaine compte la durée de la séance elle-même, pas celle de son gabarit : une séance fixée à 32 min pesait ses 45 min de catalogue dans le volume, le rythme et la charge. La case porte la durée de la séance et la charge est le TSS du gabarit ramené à cette durée",
          textEn: "The week summary counts the session's own duration, not its template's: a session fixed at 32 min weighed its 45 min of catalog in the volume, the rhythm and the load. The slot carries the session's duration and the load is the template's TSS scaled to it",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Le formulaire d'activité complémentaire pose sa seule question obligatoire en un geste. La durée était un champ unique en MINUTES, qui exigeait une conversion mentale avant la première frappe : personne ne pense son trajet à vélo en 85 minutes, on pense 1h25. Elle devient UN champ sous un masque `h:mm`, avec un pavé de chiffres seuls, et les chiffres entrent par la DROITE comme se remplit un chronomètre : les deux derniers tapés sont toujours les minutes, donc 45 se lit 0:45 et 125 se lit 1:25. Remplir les heures d'abord aurait rendu la saisie courte à la fois ambiguë et coûteuse, 45 valant 45h autant que 45min et un trajet d'une demi-heure coûtant 0030, et une durée de moins d'une heure est le cas le plus fréquent sur cet écran. L'analyse reste tolérante plutôt que stricte, 0:90 est une durée valide et se normalise en 1:30 à la sortie du champ au lieu d'être refusée. Le stockage ne bouge pas : `durationMin` est toujours en minutes, la conversion vit au bord du formulaire et nulle part ailleurs",
          textEn: "The complementary activity form asks its one required question in one gesture. The duration was a single field in MINUTES, which demanded a mental conversion before the first keystroke: nobody thinks of their bike commute as 85 minutes, they think 1h25. It becomes ONE field under an `h:mm` mask, with a digits-only keypad, and the digits enter from the RIGHT the way a stopwatch fills: the last two typed are always the minutes, so 45 reads 0:45 and 125 reads 1:25. Filling hours first would have made the short entry both ambiguous and expensive, 45 meaning 45h as much as 45min and a half-hour trip costing 0030, and a sub-hour duration is the most frequent case on this screen. The parsing stays tolerant rather than strict, 0:90 is a valid duration and normalises to 1:30 on blur instead of being refused. Storage does not move: `durationMin` is still minutes, the conversion lives at the form's edge and nowhere else",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Les champs facultatifs du formulaire se replient. La distance, le dénivelé, les watts et la note avaient le même poids visuel que la durée, sous une ligne annonçant que seule la durée était obligatoire, donc l'écran contredisait la phrase juste au-dessus. Ils passent derrière un dépliant `Add details`, qui s'ouvre tout seul dans les deux cas où le garder fermé mentirait : l'édition d'une activité qui les porte déjà, et une puce de rappel qui vient de les remplir. Rien n'est enregistré que l'écran ne montre pas",
          textEn: "The form's optional fields fold away. Distance, elevation, watts and the note sat at the same visual weight as the duration, under a line announcing that only the duration was required, so the screen contradicted the sentence right above it. They move behind an `Add details` disclosure, which opens on its own in the two cases where keeping it shut would lie: editing an activity that already carries them, and a recall chip that has just filled them. Nothing is saved that the screen does not show",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Le formulaire répond depuis le journal au lieu de redemander. Un trajet à vélo se répète, et la durée demandée était déjà trois lignes plus haut dans le journal : une rangée de trois durées déjà enregistrées au plus, même discipline et même motif, en repose une d'un seul tap, avec la distance, le dénivelé et les watts qui venaient avec. Elles sont classées par FRÉQUENCE et non par date, pour que le trajet fait tous les matins passe avant la sortie exceptionnelle du dimanche. Un rappel est proposé, jamais prérempli : un enregistrement posé par la machine et sauvegardé sans être lu est un chiffre inventé qui compte ensuite dans la charge",
          textEn: "The form answers from the log rather than asking again. A bike commute repeats, and the duration being asked for was already three lines up in the journal: a row of up to three already-recorded durations, same discipline and same purpose, puts one back with a single tap, along with the distance, elevation and watts that came with it. They are ranked by FREQUENCY and not by date, so the trip made every morning comes before Sunday's exceptional ride. A recall is offered, never pre-filled: a record placed by the machine and saved without being read is an invented number that then counts towards load",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Ouvrir le formulaire ne pointe la durée que là où pointer ne coûte rien. Le focus démarrait sur la date, qui est déjà juste, donc l'anneau de focus posait un deuxième appel vermillon face au bouton d'enregistrement pour désigner la seule chose dont il n'y avait rien à faire ; le déplacer sur la durée, le seul champ vide de l'écran, était juste à la souris et faux sous un pouce. Un clavier logiciel se levait sur la feuille à la seconde où elle s'ouvrait, couvrant sa moitié basse (la discipline, le motif, le bouton d'enregistrement) et mettant la date et les deux rangées de choix hors d'atteinte tant qu'il n'était pas renvoyé, donc le geste que le formulaire demandait en premier était de se débarrasser d'un clavier plutôt que de répondre à sa question. Le focus n'est plus posé que sous `pointer: fine` : au doigt le panneau s'ouvre entier et le pavé monte quand on tape la durée, un tap qui n'a jamais été la partie coûteuse. À l'édition rien ne prend le focus sur aucun pointeur, puisqu'on vient corriger un champ précis et que le clavier couvrirait ceux qu'on relit",
          textEn: "Opening the form points at the duration only where pointing costs nothing. Focus started on the date, which is already right, so the focus ring posted a second vermillon call opposite the save button to designate the one thing there was nothing to do about; moving it to the duration, the screen's one empty field, was right on a mouse and wrong under a thumb. A soft keyboard rose over the sheet at the second the sheet opened, covering its lower half (the discipline, the purpose, the save button) and putting the date and both rows of choices out of reach until it was dismissed, so the gesture the form asked for first was getting rid of a keyboard rather than answering its question. Focus is now posted under `pointer: fine` only: on touch the panel opens whole and the keypad comes up when the duration is tapped, one tap that was never the expensive part. Editing focuses nothing on either pointer, since one comes to correct a precise field and the keyboard would cover the ones being re-read",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Enregistrer une activité ressemble à une action, parce que c'en est une. Le contrôle portait la marque de SORTIE du cockpit, une ligne de texte suivie d'une flèche, et cette rangée enseigne sa propre règle : sa flèche dit deux choses à la fois, ceci est un geste ET cela vous emmène ailleurs. Dessiner une séance tient les deux, cela navigue vers `/library/draw`. Enregistrer ne tient que la première : cela ouvre un panneau sur place et écrit. La flèche promettait donc une page qui ne venait jamais, et une ligne de texte fléché entre deux liens se lisait comme une légende plutôt que comme un contrôle. Elle devient un bouton cerclé avec un `+` sur les deux surfaces, le même `+` que porte le bouton du journal, ce qui laisse à la rangée du cockpit trois marques distinctes pour ses trois promesses distinctes : un cadre et un plus agit ici et écrit, du texte et une flèche est un geste qui vous emmène, du texte souligné est un lieu. Les mots restent à la première personne (`I did something else`) là où ils répondent à la séance du jour imprimée juste au-dessus ; c'est le cadre qui dit contrôle, les mots n'ont plus à le faire",
          textEn: "Logging an activity looks like an action, because it is one. The control carried the cockpit's EXIT mark, a line of text followed by an arrow, and that row teaches its own rule: its arrow says two things at once, this is a gesture AND it takes you elsewhere. Drawing a workout holds both, it navigates to `/library/draw`. Logging holds only the first: it opens a panel in place and writes. So the arrow promised a page that never came, and a line of arrowed text between two links read as a caption rather than a control. It becomes an outlined button with a `+` on both surfaces, the same `+` the log's own button carries, which leaves the cockpit row with three distinct marks for its three distinct promises: a frame and a plus acts here and writes, text and an arrow is a gesture that takes you away, underlined text is a place. The words stay in the first person (`I did something else`) where they answer the day's session printed right above; the frame is what says control, the words no longer have to",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Enregistrer une activité complémentaire atteint la page du plan, où cela manquait : le cockpit avait la porte et le plan non, donc le seul écran où l'on remarque que son volume est faux était le seul écran incapable de le corriger. Deux entrées maintenant, et chacune répond à un moment différent : `I did something else` se pose dans le bloc de la semaine en cours, à côté de la séance du jour, et vise aujourd'hui (le lundi de la semaine quand on regarde une semaine qu'on ne vit pas) ; `Add an activity` se pose dans l'onglet des statistiques, dans le bloc des compléments lui-même. Ce bloc cesse aussi de disparaître quand il est vide : cacher une DONNÉE qui n'existe pas est juste, cacher une PORTE parce que personne n'y est encore passé ne l'est pas, donc avec l'enregistrement offert il reste et l'invitation prend la place que les chiffres n'ont pas réclamée. Sur l'aperçu d'un plan tout prêt, qui n'est pas le vôtre, il disparaît exactement comme avant",
          textEn: "Logging a complementary activity reaches the plan's own page, where it was missing: the cockpit had the door and the plan did not, so the one screen where you notice your volume is wrong was the one screen that could not fix it. Two ways in now, and each answers a different moment: `I did something else` sits in the current-week block, next to the day's session, and targets today (the week's Monday when you are looking at a week you are not living); `Add an activity` sits in the statistics tab, in the complementary block itself. That block also stops vanishing when it is empty: hiding a DATUM that does not exist is right, hiding a DOOR because nothing came through it yet is not, so with logging offered it stays and the invitation takes the room the figures have not claimed. On a prebuilt plan's preview, which is not yours, it disappears exactly as before",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Un seul journal d'activités en mémoire au lieu d'un par composant. `useActivities` gardait son propre `useState` et relisait `localStorage` à chaque montage, ce qui marchait tant qu'un seul composant par écran s'en servait. La page d'un plan en a deux, le bloc de la semaine qui ÉCRIT et le bloc des statistiques qui AFFICHE : enregistrer un trajet depuis le premier n'aurait pas bougé le second, et l'écran aurait dit à la fois 1h25 et rien du tout. C'est un magasin de module derrière `useSyncExternalStore` maintenant, donc chaque écriture réveille chaque lecteur et deux composants d'un même rendu ne peuvent pas lire des listes différentes",
          textEn: "One activity log in memory instead of one per component. `useActivities` kept its own `useState` and re-read `localStorage` on every mount, which worked while a single component per screen used it. The plan page has two, the week block that WRITES and the statistics block that DISPLAYS: logging a commute from the first would not have moved the second, and the screen would have said both 1h25 and nothing at all. It is a module store behind `useSyncExternalStore` now, so every write wakes every reader and two components of one render cannot read different lists",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Les trois entrées du formulaire d'activité partagent leur plomberie (`useActivityLog`) : tenir le panneau ouvert, le jour visé, distinguer un nouvel enregistrement d'une correction, écrire, rendre compte, fermer, et lire le schéma de trajets récurrents qui préremplit. Deux écrans en portaient chacun leur copie et un troisième aurait été celui de trop, puisque la première divergence aurait voulu dire qu'enregistrer depuis le plan ne demande plus ce qu'enregistrer depuis le cockpit demande",
          textEn: "The three ways into the activity form share their plumbing (`useActivityLog`): holding the panel open, the day being targeted, telling a new record from a correction, writing, reporting, closing, and reading the recurring commute pattern that pre-fills. Two screens each carried their own copy and a third would have been the one too many, since the first divergence would have meant logging from the plan no longer asked what logging from the cockpit asks",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Le bilan de la semaine n'a plus l'air de se contredire. Il affichait `KM 0/56` juste au-dessus d'une ligne lisant `Cycling 1h25 . 26.6 km` : les deux chiffres étaient justes, mais le premier ne disait jamais qu'il ne comptait que les kilomètres de COURSE (`plannedSessionKm` renvoie zéro dès qu'une séance n'en est pas une), et rien ne disait pourquoi les kilomètres de vélo restaient dehors. Le temps s'additionne entre sports parce qu'une heure de vélo et une heure de course font deux heures d'entraînement ; les kilomètres non, parce que 30 km de vélo et 10 km de course ne font pas 40 km, et 40 est exactement le genre de total qu'on retient et qu'on répète. Deux corrections, et aucune n'est une phrase : le fait porte son sport (`run km`), et la demi-liste des compléments devient une vraie TABLE du volume de la semaine, séances du plan comprises, une rangée par sport et une colonne par quantité, la plus grosse en premier. Les séances et les activités du MÊME sport s'additionnent dans une rangée, ce que la règle autorise précisément. La table n'a pas de rangée de total : le temps total est déjà dans les faits au-dessus, et les kilomètres ne se totalisent nulle part, donc la règle vit dans la forme plutôt que dans une note de bas de page. Elle reste cachée pour le coureur qui n'a fait que courir, à plat, avec un plan, puisque les faits au-dessus portent déjà ces deux nombres",
          textEn: "The week review no longer looks like it contradicts itself. It showed `KM 0/56` directly above a line reading `Cycling 1h25 . 26.6 km`: both figures were right, but the first never said it counted RUNNING kilometres only (`plannedSessionKm` returns zero as soon as a session is not one), and nothing said why the cycling kilometres stayed out. Time sums across sports because an hour of cycling and an hour of running are two hours of training; kilometres do not, because 30 km of cycling and 10 km of running do not make 40 km, and 40 is exactly the kind of total that gets remembered and repeated. Two fixes, neither of them a sentence: the fact carries its sport (`run km`), and the complement's half-list becomes a real TABLE of the week's volume, the plan's own sessions included, one row per sport and one column per quantity, biggest first. Sessions and activities of the SAME sport add up inside a row, which is precisely what the rule allows. The table has no total row: the total time is already in the facts above, and kilometres are totalled nowhere, so the rule lives in the shape rather than in a footnote. It stays hidden for the runner who only ran, on the flat, with a plan, since the facts above already carry those two numbers",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "La page des activités complémentaires porte une sortie. Elle est atteinte depuis quatre endroits (le menu, le cockpit, la palette de commandes, les statistiques d'un plan), donc la sortie ne peut pas être un lien vers une destination fixe sans être fausse pour trois personnes sur quatre : elle renvoie à la page PRÉCÉDENTE, quelle qu'elle soit. Elle ne s'affiche que s'il y a une page précédente dans l'app, et le test est la clé de position du routeur plutôt que `history.length`, qui ment dans les deux sens, comptant les entrées des sites visités avant celui-ci et affichant déjà 2 dans un onglet neuf sur plusieurs moteurs. Ouverte depuis un favori, un résultat de recherche ou l'écran d'accueil d'une app installée, un Retour qui ne mène nulle part, ou pire hors de l'app, vaut moins que pas de Retour du tout",
          textEn: "The complementary activities page carries a way out. It is reached from four places (the menu, the cockpit, the command palette, a plan's statistics), so the exit cannot be a link to one fixed destination without being wrong for three people in four: it returns the PREVIOUS page, whatever it was. It only shows when there is an in-app previous page, and the test is the router's location key rather than `history.length`, which lies in both directions, counting entries from sites visited before this one and already reading 2 in a fresh tab on several engines. Opened from a bookmark, a search result or an installed app's home screen, a Back that leads nowhere, or worse out of the app, is less than no Back at all",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "L'effort perçu se lit avec un mot, pas un nombre nu : la tête affiche `Easy 3/10` plutôt que `3/10`, depuis la table qu'emploie la clôture d'une séance (`rpeWordKey`), parce qu'un 7 nu sur une échelle de dix oblige à se rappeler ce que vaut un 7. L'échelle elle-même passe aussi SOUS la durée : sa valeur est déjà juste par défaut, donc elle n'a rien à faire à retarder le seul champ vide de l'écran",
          textEn: "Perceived effort reads with a word, not a bare number: the head shows `Easy 3/10` rather than `3/10`, off the same table the session close uses (`rpeWordKey`), because a bare 7 on a scale of ten forces you to remember what a 7 is worth. The scale itself also moves BELOW the duration: its value is already correct by default, so it has no business delaying the one empty field on the screen",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "La bande des sept jours du cockpit gagne un second canal, sous le filet de sol : ce qui s'est passé HORS du plan. Elle ne dessinait jamais que le plan, donc un jour passé à aller au travail à vélo se lisait REPOS, l'inverse de ce qui s'est passé, et c'est le seul mensonge qu'une bande de sept jours puisse dire. Le complément va SOUS le filet plutôt que sur la pile, pour deux raisons dont la seconde est la vraie : partager le budget de la colonne rétrécirait les blocs du plan les jours de trajet, et sept hauteurs qui ne mesurent plus la même chose cessent d'être comparables ; et ce n'est pas la même quantité, une heure de trajet n'est pas une heure de séance, et les empiler dirait que si. Au-dessus du filet, ce que le plan demande ; en dessous, ce que la vie a ajouté. Le canal a sa propre échelle, donc les compléments se comparent entre eux et jamais à une séance",
          textEn: "The cockpit's seven-day strip gains a second channel, under the ground rule: what happened OUTSIDE the plan. It only ever drew the plan, so a day spent riding to work read as REST, the opposite of what happened, and that is the one lie a seven-day strip can tell. The complement goes BELOW the rule rather than onto the stack, for two reasons and the second is the real one: sharing the column's budget would shrink the plan's blocks on commuting days, and seven heights that no longer measure the same thing stop being comparable; and it is not the same quantity, an hour of commuting is not an hour of session, and stacking them would say it is. Above the rule, what the plan asks; below it, what life added. The channel has its own scale, so complements compare to each other and never to a session",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Le schéma de trajets récurrents du profil dit maintenant ce qu'il est, une HABITUDE et non un enregistrement, et pointe vers le journal. C'était ce que l'app avait de plus proche d'un décompte des trajets, et il ne pouvait jamais qu'énoncer ce qui arrive d'habitude : il sert maintenant de valeurs par défaut au formulaire du journal au lieu d'en tenir lieu",
          textEn: "The recurring commute pattern in the profile now says what it is, an HABIT and not a record, and points at the log. It was the closest thing the app had to counting a commute, and it could only ever state what usually happens: it now serves as the default values of the log form instead of standing in for it",
          category: "Paramètres",
          categoryEn: "Settings",
        },
        {
          text: "Les films de présentation tournent sur la couche de design de l'app. Le paquet vidéo portait sa propre palette, restée d'avant la refonte : une ardoise bleue, un accent orange, six couleurs de zone, trois familles de fontes hébergées par Google. `video/src/theme.ts` reflète maintenant `src/styles/design/` : le papier, l'encre et le vermillon de `colors.css`, la rampe d'effort de `zones.css`, les trois familles de `fonts.css`, et, le plus visible, le contour d'encre et l'ombre portée DURE de `borders.css`. Les cartes grises en filet et le flou de 110 px sous les captures étaient ce qui datait le plus les films",
          textEn: "The marketing films run on the app's design layer. The video package carried its own palette, left over from before the redesign: a blue slate, an orange accent, six zone colours, three families' worth of Google-hosted fonts. `video/src/theme.ts` now mirrors `src/styles/design/`: paper, ink and vermillion from `colors.css`, the effort ramp from `zones.css`, the three families from `fonts.css`, and, most visibly, the ink outline and the HARD offset shadow from `borders.css`. The hairline grey cards and the 110px blur under the screenshots were the single thing that most dated the films",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "La rampe d'effort des films passe de six teintes à une seule rampe d'encre, comme l'app. Ce n'est pas un échange de valeurs : six couleurs disaient \"six catégories\", la rampe dit \"un seul axe, et vous êtes quelque part dessus\". Trois endroits imprimaient du blanc sur une zone, ce qui marchait tant que chaque teinte était sombre et imprime maintenant pâle sur pâle, donc `zoneInk()` porte la règle de seuil de l'app : encre jusqu'à Z3, crème à partir de Z4. Le grand chiffre du modèle polarisé revient à l'encre et laisse la règle au-dessus porter la zone : un chiffre imprimé en gris pâle est un chiffre que personne ne lit",
          textEn: "The effort ramp in the films goes from six hues to one ink ramp, like the app. Not a swap of values: six colours said \"six categories\", the ramp says \"one axis, and you are somewhere on it\". Three places printed white on a zone, which worked while every hue was dark and now prints pale on pale, so `zoneInk()` carries the app's threshold rule: ink up to Z3, cream from Z4. The polarised model's big figure goes back to ink and lets the rule above it carry the zone: a figure printed in pale grey is a figure nobody reads",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Deux effets quittent les films, parce que le système les refuse : le lustre blanc qui balayait la liste des zones, et les ombres floues. Ce à quoi ils répondaient, un panneau qui a fini de s'animer doit garder de la vie, tient toujours, et trouve toujours sa réponse dans la respiration déphasée de chaque rangée, ce que `bun run qa:motion` vérifie",
          textEn: "Two effects leave the films, because the system refuses them: the white sheen sweeping the zone list, and the blurred shadows. What they were answering, a panel that has finished animating must keep some life, still holds, and is still answered, by each row's own phase-shifted breath, which is what `bun run qa:motion` checks",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Les fontes des films quittent Google. Elles étaient chargées à chaque rendu, et un réseau coupé ne fait pas échouer un rendu : il le livre dans la fonte de repli, quarante-huit films dans la mauvaise typographie, sans un mot. `bun run sync` copie les trois fichiers de l'app et `video/src/fonts.ts` les sert depuis le paquet",
          textEn: "The films' fonts leave Google. They were fetched on every render, and a cut network does not fail a render: it ships it in the fallback face, forty-eight films in the wrong typography, without a word. `bun run sync` copies the app's own three files and `video/src/fonts.ts` serves them from the package",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Le contrôle préalable des captures du rendu ne demande que ce que lisent les films sélectionnés (`FILM_SHOTS`), donc rendre trois films n'attend plus une capture du générateur de parcours, qui a besoin d'un service de routage vivant pour dire quoi que ce soit",
          textEn: "The render's screenshot preflight asks only for what the selected films read (`FILM_SHOTS`), so rendering three films no longer waits on a capture of the route generator, which needs a live routing service to say anything",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Le bouton du menu quitte le coin bas-droit pour la tête de la barre du haut, sur téléphone et tablette. Il y flottait au-dessus de chaque page, et ce sont les pages qui le payaient : huit surfaces lui réservaient de la place, le pied de page cédait une colonne, les barres d'action des séances, des plans, des semaines et des tests s'arrêtaient avant lui, le bouton de remontée se décalait, la planche des zones changeait d'ordre et le duo de l'accueil rétrécissait. Tout cela est parti avec lui : plus rien ne recouvre le bas de l'écran, et le menu ouvert gagne 32 px pour sa figure",
          textEn: "The menu button leaves the bottom-right corner for the head of the top bar, on phone and tablet. It used to float over every page, and the pages were what paid for it: eight surfaces kept room clear for it, the footer gave up a column, the action bars on sessions, plans, weeks and tests stopped short of it, the back-to-top button shifted up, the zone plate changed order and the home duo shrank. All of that went with it: nothing covers the bottom of the screen any more, and the open menu gains 32px for its figure",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "L'architecture passe de cinq portes à quatre : le cockpit, les séances, les plans, les chiffres. La navigation demandait 28 décisions avant la première séance. Les 35 destinations sorties GARDENT toutes leur route, restent indexées, prérendues et partageables, et se retrouvent au pied de page, dans la palette et dans la liste du menu mobile",
          textEn: "The architecture goes from five doors to four: the cockpit, sessions, plans, figures. Navigation asked for 28 decisions before the first session. The 35 destinations that left KEEP every route, stay indexed, prerendered and shareable, and land in the footer, the palette and the mobile menu list",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Le cockpit d'Aujourd'hui est la réponse et non un menu : cinq boîtes de la même forme sont devenues la forme de la semaine, la séance du jour est à un tap de la bande, et son profil s'aperçoit sur place. La colonne est centrée, et le titre EST la réponse",
          textEn: "The cockpit at Today is the answer rather than a menu: five boxes of the same shape became the shape of the week, the day's session is one tap from the strip, and its profile is previewed in place. The column is centred, and the headline IS the answer",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "La bibliothèque range par PRATIQUE d'abord, la modalité passe dessous. Quelqu'un qui s'entraîne pense en pratique, pas en discipline. La modalité reste, et c'est un choix : la retirer aurait orphelin les 10 séances de vélo, les 10 de natation, les 17 de renforcement et les deux calculateurs adossés aux moteurs FTP et CSS",
          textEn: "The library sorts by PRACTICE first, with modality below. Someone training thinks in practices, not disciplines. Modality stays, and that is a choice: dropping it would have orphaned the 10 cycling sessions, the 10 swimming ones, the 17 strength ones and the two calculators built on the FTP and CSS engines",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "Le tirage au sort sort du menu, les commandes de la bibliothèque passent de cinq rangées à trois, et les toasts d'aide partent. Ils se levaient tout seuls sur quatre pages, une seconde et demie après l'arrivée, et se posaient sur le kicker de la page",
          textEn: "The random draw comes out of the menu, the library controls go from five rows to three, and the help toasts are gone. They raised themselves on four pages, a second and a half after arrival, and landed on the page kicker",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "Le rail des filtres tient sur une ligne, et les formats passent de quatre à trois. Le mode focus n'était pas un mode : son attribut n'était stylé nulle part, et sur téléphone il ne différait de la grille que par 20 px de gouttière",
          textEn: "The filter rail fits on one line, and the formats go from four to three. Focus mode was not a mode: its attribute was styled nowhere, and on a phone it differed from the grid by 20px of gutter",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "La page d'un plan ouvre sur CETTE SEMAINE et non sur quatre compteurs du plan entier : la séance du jour avec son nom entier et sa case de clôture, les séances faites sur le total, le temps posé sur le prévu, et la prochaine séance clé",
          textEn: "A plan page opens on THIS WEEK rather than four counters about the whole plan: the day's session with its full name and its close-out box, sessions done out of the total, time logged against time planned, and the next key session",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Le parcours de création de plan demande la PRATIQUE d'abord. Il affichait les sept distances à plat dans une seule grille, et tout le traitement du trail tenait dans un booléen qui ne gouvernait qu'une phrase d'aide : on pouvait choisir ultra et se faire demander une allure au kilomètre, jamais un dénivelé",
          textEn: "The plan wizard asks for the PRACTICE first. It used to show all seven distances flat in a single grid, with the whole trail treatment held in a boolean that governed one hint sentence: you could choose ultra and be asked for a pace per kilometre, never for elevation",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Le dénivelé n'est demandé qu'à qui court dessus. Le champ existait, mais il était posé sur l'écran d'allure et rendait SANS CONDITION : quelqu'un qui préparait un 5 km sur route se faisait demander un D+",
          textEn: "Elevation is asked only of those who run it. The field existed, but it sat on the pace screen and rendered UNCONDITIONALLY: someone preparing a road 5K was asked for a climb",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Le parcours de plan, 1 609 lignes en un fichier, devient un registre d'étapes. Aucun comportement ne change : mêmes étapes, même ordre, mêmes libellés, même plan produit. C'est ce qui rend lisible le lot qui suit",
          textEn: "The plan wizard, 1,609 lines in one file, becomes a step registry. No behaviour changes: same steps, same order, same labels, same plan produced. That is what makes the next batch readable",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Le calendrier du parcours s'ouvre en tiroir, et le bouton Suivant part des questions fermées. Plafonné à la place mesurée entre le champ et le bord de la fenêtre, il valait 293 px pour une grille qui en fait 356 : le mois se lisait par une fenêtre de six lignes sur sept",
          textEn: "The wizard's calendar opens as a drawer, and the Next button leaves the closed questions. Capped to the space measured between the field and the window edge, it came to 293px for a grid that needs 356: a month was read through a window six rows out of seven",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Le calendrier d'un plan passe à une ligne par jour sous 640 px, la grille de sept colonnes s'efface. Sept colonnes dans 390 px donnaient des cartes de 42 à 60 px. Mesuré à 320, 375 et 390 px : plus aucun titre tronqué, contre 5, 4 et 3 avant",
          textEn: "A plan's calendar goes to one row per day below 640px, and the seven-column grid retires. Seven columns in 390px gave cards of 42 to 60px. Measured at 320, 375 and 390px: no truncated titles left, against 5, 4 and 3 before",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Le vermillon ne dit plus qu'une chose, et une seule : maintenant. Une carte choisie prend un anneau d'encre, un onglet ouvert prend une pilule d'encre, et une phase de plan n'a plus de couleur à elle",
          textEn: "Vermillon says one thing now, and only one: now. A chosen card takes an ink ring, an open tab takes an ink pill, and a plan phase gets no colour of its own",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Six cartes portaient un liseré coloré sur une seule arête, qui longeait un coin arrondi puis mourait contre un filet gris. Toutes passent à l'anneau interne sur les quatre côtés, qui suit le rayon des coins sans déplacer un pixel. La semaine en cours n'était marquée que par sa couleur : son numéro passe en gras",
          textEn: "Six cards carried a coloured edge on one side, running along a rounded corner then dying against a grey rule. All move to an inset ring on four sides, which follows the corner radius without moving a pixel. The current week was marked by colour alone, so its number now goes bold",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Les bandes de page se séparent par l'espace seul. Les filets entre elles sont partis, et quatre frontières ont cessé de payer l'écart deux fois",
          textEn: "Bands are separated by space alone. The rules between them are gone, and four boundaries stopped paying the gap twice",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Les sommaires perdent leur bande vermillon à gauche. Le hub nutrition marquait déjà le titre courant par une pilule d'encre : deux vocabulaires pour la même chose, et c'est le second qui gagne. Le simulateur faisait pire, il changeait de langage en changeant de largeur",
          textEn: "Tables of contents lose their vermillon edge. The nutrition hub already marked the current heading with an ink pill: two vocabularies for one thing, and the second wins. The simulator was worse, it changed language when it changed width",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Le pied de page se replie en groupes sous 900 px : de 1,65 écran à 0,59. Douze liens au plancher tactile de 44 px faisaient 1 100 px de pied sur un téléphone. Le plancher ne bouge pas, c'est le nombre de rangées qui bouge",
          textEn: "The footer folds into groups below 900px: 1.65 screens down to 0.59. Twelve links at the 44px touch floor made 1,100px of footer on a phone. The floor does not move, the number of rows does",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "La barre d'encre du pied perd 90 px sur téléphone, le pied 128. Elle faisait 219 px, soit 31 % d'un écran pour cinq lignes de mentions légales",
          textEn: "The footer's ink bar loses 90px on a phone, the footer 128. It measured 219px, 31% of a screen for five lines of legal notices",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Un geste par étape sur téléphone : les champs de date s'ouvrent sur le premier mois qui contient un jour choisissable et non sur le mois courant, les filtres collent, et le calendrier s'ouvre là où il faut",
          textEn: "One gesture per step on a phone: date fields open on the first month that holds a selectable day rather than on the current month, filters stick, and the calendar opens where it should",
          category: "Expérience mobile",
          categoryEn: "Mobile",
        },
        {
          text: "Le panneau d'ajout d'une séance passe devant la pilule MENU au lieu d'être traversé par elle, respire, et se ferme au doigt",
          textEn: "The add-a-session panel comes in front of the MENU pill instead of being pierced by it, breathes, and closes with a finger",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "La foulée par zone dominante quitte l'écran d'une séance : le badge, la bande de faits et la table de répartition disaient déjà la zone. Sa semelle était calée sur une abscisse de l'axe des temps, où une marque se lit comme un curseur, et celui-là ne mesurait rien. La figure qui montre prend sa place",
          textEn: "The dominant-zone stride leaves the session screen: the badge, the facts row and the distribution table already said the zone. Its sole was aligned to a point on the time axis, where a mark reads as a cursor, and that one measured nothing. The figure that points takes its place",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Une séance de la vue liste est une ligne, plus une carte dans une carte dans une carte. La pastille de type devient une légende mono discrète, et sur téléphone les quatre glyphes d'action deviennent un bouton qui les nomme",
          textEn: "A session in the list view is a line, not a card inside a card inside a card. The type badge becomes a quiet mono caption, and on a phone the four action glyphs become one button that names them",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Une journée du tableau de la semaine est une ligne aussi. Dix-neuf rectangles dessinés pour cinq séances sont devenus neuf, et le seul rang encadré de l'écran est aujourd'hui",
          textEn: "A day on the week board is a line too. Nineteen drawn rectangles for five sessions became nine, and the only framed row left on the screen is today",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "L'ultra passe annoncé : ce que le générateur produit sur cette distance n'est pas jugé assez fiable pour être proposé. Une pratique annoncée se voit maintenant avant d'être choisie, au lieu d'un rayon vide sans le dire",
          textEn: "Ultra becomes announced: what the generator produces at that distance is not judged reliable enough to offer. An announced practice is now visible before it can be chosen, instead of a silently empty shelf",
          category: "Pratiques",
          categoryEn: "Practices",
        },
        {
          text: "Les pas d'affiche descendent d'un cran sur téléphone. Le corps de texte, le mono et la grille d'espacement ne bougent pas, donc les longueurs de ligne et les cibles au doigt sont intactes",
          textEn: "The display steps drop one step on mobile. Body text, mono and the spacing grid do not move, so line lengths and hit targets are unchanged",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Revue finale : sur les trois écrans du chantier, la question devient le titre, et le tutoiement est passé partout",
          textEn: "Final review pass: on the three screens that carry the work, the question becomes the title, and the informal voice is applied throughout",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Typographie : ni chevrons, ni cadratin, ni demi-cadratin, dans le texte visible comme dans le code",
          textEn: "Typography: no guillemets, no em dash, no en dash, in visible text and in the source alike",
          category: "Design",
          categoryEn: "Design",
        },
      ],
      fixed: [
        {
          text: "Ouvrir `Add a session` sur une semaine autonome ne donne plus de barre de défilement à la page. Le rail à côté du tableau tenait un sélecteur dimensionné sur la fenêtre, `100vh - 160px`, et une rangée de grille est aussi haute que son plus grand élément : sur un écran où le tableau tenait, la rangée dépassait la ligne de flottaison et le seul écran qui parle de composer une semaine défilait pour un panneau qui défile tout seul. Le rail prend maintenant la hauteur de la rangée et rien de plus, le tableau ou l'écran quand le tableau est plus court, et l'outil à l'intérieur, sélecteur ou générateur, colle sous l'en-tête pendant qu'un tableau haut défile et ne dépasse jamais le rail ni la fenêtre. Entre 768 et 900 px le sélecteur s'ouvrait déjà en feuille, mais le voile partait à 768 et le verrou de défilement avec lui, donc la feuille se levait sur une page qui n'était ni assombrie ni tenue ; les deux suivent maintenant les 900 px de la feuille elle-même",
          textEn: "Opening `Add a session` on a standalone week no longer gives the page a scrollbar. The rail beside the board held a picker sized to the viewport, `100vh - 160px`, and a grid row is as tall as its tallest item: on a screen where the board fit, the row grew past the fold and the one screen about composing a week scrolled for a panel that scrolls itself. The rail now takes the height of the row and nothing more, the board or the screen when the board is shorter, and the tool inside it, picker or generator, sticks under the header while a tall board scrolls and never runs past the rail or the viewport. Between 768 and 900px the picker already opened as a sheet, but the scrim left at 768 and the scroll lock with it, so the sheet rose over a page that was neither dimmed nor held; both now follow the sheet's own 900px",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Une semaine autonome s'exporte dans son propre PDF, dans le style de la maison. Elle sortait par le document du plan, dessiné pour un programme de plusieurs semaines : un bandeau ardoise lisant \"Plan libre\", une table de phases lisant \"S1-S1\", des tuiles de stats bleues, une note sur les exposants, un lexique, et les activités imprimées par leurs identifiants internes (`__activity_commute__`, `0min`), puisque l'export cherchait les noms dans le catalogue et qu'un trajet à vélo n'y est pas. La feuille de la semaine est papier et encre, composée dans les caractères de l'app (Bricolage Grotesque et JetBrains Mono, embarquées depuis `public/fonts/pdf` et chargées seulement quand un PDF est demandé) : le logo, le nom de la semaine, ses faits (catégorie, séances, heures sur le budget, charge), le rythme dessiné en sept barres, les sept jours en rangées filetées avec la zone, la durée et la structure de chaque séance sur une ligne, une marque `key` sur les séances clés, la répartition 80/20 avec son verdict, puis une seconde page avec la structure de chaque séance du catalogue, course et renforcement, pour l'entraîneur qui la lit. Les noms que la page transmet à l'export l'emportent maintenant sur ceux du catalogue, donc les activités sont nommées dans le PDF comme dans le calendrier",
          textEn: "A standalone week exports to its own PDF, in the house style. It went out through the plan's document, drawn for a programme of many weeks: a slate banner reading \"Plan libre\", a phase table reading \"S1-S1\", blue stat tiles, a note about superscripts, a lexicon, and the activities printed by their internal ids (`__activity_commute__`, `0min`), since the export looked the names up in the catalogue and a bike commute is not in it. The week's sheet is paper and ink, set in the app's own type (Bricolage Grotesque and JetBrains Mono, embedded from `public/fonts/pdf` and fetched only when a PDF is asked for): the wordmark, the week's name, its facts (category, sessions, hours against the budget, load), the rhythm drawn as seven bars, the seven days as ruled rows with each session's zone, duration and structure in one line, a `key` mark on the key sessions, the 80/20 split with its verdict, then a second page with the structure of every catalogue session, running and strength, for the coach who reads it. The names the page hands the export now win over the catalogue's, so the activities are named in the PDF and the calendar alike",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Les images de partage d'une semaine tiennent une semaine à plusieurs séances par jour. Les quatre planches étaient dessinées pour une séance par jour et coupaient tout le reste : une deuxième carte tombait hors du bas des planches carrée et paysage, et les rangées de la planche et de la story passaient sous la répartition. Une planche ne peut pas grandir, donc elle rétrécit par paliers, selon ce que la semaine porte : à deux ou trois séances sur un même jour les barres cèdent de la hauteur et les cartes passent à deux lignes, puis à une, finissant par des points de suspension plutôt que par un mot coupé ; au-delà de huit rangées la liste s'imprime en plus petit avec des barres plus fines, au-delà de quatorze les barres disparaissent, et les deux coureurs ne prennent que la place qui reste. Vérifié à deux et trois séances tous les jours, vingt et une en tout, dans les quatre tailles",
          textEn: "The week's share images hold a week of several sessions a day. The four sheets were drawn for one session per day and clipped everything past that: a second card fell off the bottom of the square and the landscape sheets, and the rows of the sheet and the story ran under the split. A sheet cannot grow, so it shrinks in steps instead, by what the week holds: with two or three sessions on one day the bars give up height and the cards go to two lines, then one, ending in an ellipsis rather than a broken word; past eight rows the list prints smaller type and thinner bars, past fourteen the bars go, and the two runners take only the room that is left. Verified at two and three sessions every day, twenty-one in all, in the four sizes",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Les dialogues de report et d'aperçu d'adaptation avaient les deux mêmes barres de défilement, pour la même raison : le dialogue se plafonne à 85vh et défile, et la liste des séances touchées portait son propre plafond dur de 40vh, donc une longue liste engageait les deux. Deux barres côte à côte, et le titre du dialogue sorti par le haut pendant que la liste défilait toute seule. Les 40vh sont un maximum, pas un plancher : la liste rétrécit maintenant en dessous quand le dialogue manque de place, ce qui est la règle que les dialogues de sélection voisins (`.zn-pdialog--list`) appliquaient déjà à leurs propres listes. Reproduit sur un plan avec 25 jours bloqués en 390x600, sur un iPhone 13 et sur un ordinateur en 1280x700 ; une seule barre sur les trois après",
          textEn: "The reschedule and adaptation preview dialogs had the same two scrollbars, for the same reason: the dialog caps itself at 85vh and scrolls, and the list of affected sessions carried a hard 40vh cap of its own, so a long list engaged both. Two bars side by side, and the dialog's title out of the top while the list scrolled on its own. The 40vh is a maximum, not a floor: the list now shrinks under it when the dialog runs out of room, which is the rule the picker dialogs next door (`.zn-pdialog--list`) already applied to their own lists. Reproduced on a plan with 25 blocked days at 390x600, on an iPhone 13 and on a 1280x700 desktop; one scrollbar on all three after",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Le dialogue de date de départ d'un plan ne pouvait pas être fait défiler jusqu'à son propre bouton d'enregistrement. Il ne portait ni plafond de hauteur ni défilement (un dialogue est en `overflow: visible` exprès, pour que la bulle du sélecteur de date ne soit pas coupée), et mesurait 710 px : 46 px au-delà du bas d'un iPhone 13, et 110 px en 390x600, où le titre sortait par le haut et `Save` par le bas sans retour possible, puisque la page derrière une modale est verrouillée au défilement. Cela n'apparaissait que sur une date de départ passée, dont le bandeau d'avertissement est ce qui pousse le panneau au-delà. Le plafond va sur le dialogue et la barre de défilement sur son corps, jamais l'inverse : `popover.tsx` monte la bulle de date dans le dialogue, donc un dialogue qui défile couperait le calendrier, alors que le corps n'est pas le parent de la bulle. Vérifié sur quatre tailles : rien de coupé, titre et boutons en place, et le dialogue d'ordinateur inchangé",
          textEn: "The plan's start-date dialog could not be scrolled to its own save button. It carried no height cap and no scroll (a dialog is `overflow: visible` on purpose, so the date picker's popover is not clipped), and measured 710px: 46px past the bottom of an iPhone 13, and 110px at 390x600, where the title left through the top and `Save` through the bottom with no way back, since the page behind a modal is scroll-locked. It only showed on a past start date, whose warning banner is what pushes the panel over. The cap goes on the dialog and the scrollbar on its body, never the reverse: `popover.tsx` mounts the date popover inside the dialog, so a dialog that scrolls would clip the calendar, while the body is not the popover's parent. Checked on four sizes: nothing cut, title and buttons in place, and the desktop dialog unchanged",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Le formulaire d'activité complémentaire avait deux barres de défilement dans la feuille. La feuille est un conteneur de défilement plafonné à 82 % de l'écran (`sheet.css`), et le corps du formulaire portait son propre plafond, `min(56vh, 520px)`, écrit pour le dialogue d'ordinateur, qui n'en a aucun. Les deux s'engageaient : deux barres côte à côte, le milieu du formulaire défilant tout seul, et le titre, la poignée et le bouton de fermeture glissant hors du haut. La prise du glisser-pour-fermer est les 64 px du haut du panneau (`useSheetDrag.ts`), donc une fois la feuille glissée elle se posait sur les champs plutôt que sur la tête, et un pouce qui visait le formulaire tirait le panneau. Le corps prend maintenant la place que son hôte lui laisse et rend le reste, donc la tête et le pied ne bougent pas et le corps est la seule chose qui défile ; le plafond ne survit que là où l'hôte n'en a pas, le dialogue d'ordinateur",
          textEn: "The complementary activity form had two scrollbars inside the sheet. The sheet is a scroll container capped at 82% of the screen (`sheet.css`), and the form's body carried a cap of its own, `min(56vh, 520px)`, written for the desktop dialog, which has no cap at all. Both engaged: two bars side by side, the middle of the form scrolling on its own, and the title, the grab handle and the close button sliding out of the top. The drag-to-close grip is the panel's top 64px (`useSheetDrag.ts`), so once the sheet had slid it sat on the fields rather than on the head, and a thumb reaching for the form pulled the panel. The body now takes the room its host leaves it and gives the rest back, so the head and the foot stay put and the body is the one thing that scrolls; the cap survives only where the host has none, the desktop dialog",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Le bandeau de notification passait derrière la barre du haut sur téléphone. Deux fautes, et la première est la plus ancienne : la couche qui porte les notifications est en `position: fixed`, ce qui ouvre un contexte d'empilement qu'un z-index soit nommé ou non, donc le `z-index: 999999999` de sonner était scellé dedans et ce qui concourait vraiment avec la page était la couche elle-même, à `auto`. Elle perdait contre le 40 de la barre du haut collante. Elle porte maintenant 1300, au-dessus de tout ce que ce document empile. Et le décalage du haut était posé par la propriété `offset` de sonner, que la bibliothèque ignore sous 600 px au profit de `mobileOffset` : sur téléphone la notification retombait sur les 16 px par défaut, donc ni la barre ni l'encoche n'étaient dégagées. Le placement passe dans `toast.css`, où il peut aussi dire la seule chose que des propriétés ne peuvent pas, qu'une notification déclenchée pendant qu'une feuille modale est ouverte ne doit PAS dégager une barre que cette feuille couvre, sinon elle se pose sur le titre de la feuille",
          textEn: "The toast banner sat behind the top bar on a phone. Two faults, and the first is the older: the layer that carries the toasts is `position: fixed`, which opens a stacking context whether or not a z-index is named, so sonner's `z-index: 999999999` was sealed inside it and what actually competed with the page was the layer itself, at `auto`. It lost to the sticky top bar's 40. It now carries 1300, above everything this document stacks. And the top offset was set through sonner's `offset` prop, which the library ignores below 600px in favour of `mobileOffset`: on a phone the toast fell back to the default 16px, so neither the bar nor the notch was cleared. The placement moves into `toast.css`, where it can also say the one thing props cannot, that a toast fired while a modal sheet is open must NOT clear a bar that sheet is covering, or it lands on the sheet's own title",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Exporter une image ne faisait rien du tout sur téléphone. `toPng` renvoie une URL de données et c'est ce qui était passé à l'ancre de téléchargement : un navigateur d'ordinateur l'accepte, un téléphone non, et refuse une URL de données de quelques centaines de kilooctets sans erreur ni message. Le bouton disait \"Image exportée\" et rien ne se passait. La capture devient un blob, comme les huit autres exports. Sur un appareil de poche elle passe aussi par la feuille de partage native plutôt que par un téléchargement, parce qu'un fichier téléchargé n'atteint jamais la pellicule : `Save image` dans cette feuille en est la seule porte",
          textEn: "Exporting an image did nothing at all on a phone. `toPng` returns a data URL and that is what was handed to the download anchor: a desktop browser accepts it, a phone does not, and refuses a few-hundred-kilobyte data URL without an error or a message. The button said \"Image exported\" and nothing happened. The capture becomes a blob, like the eight other exports. On a handheld it also goes through the native share sheet rather than a download, because a downloaded file never reaches the camera roll: `Save image` in that sheet is the only door to it",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Chaque export PNG se rendait dans la fonte de repli du système. `skipFonts: true` promettait d'éviter les erreurs sur des fontes indéfinies ; ce qu'il faisait, c'est retirer les trois caractères de l'app de la capture, donc le texte se recomposait dans l'image : les titres de phase passaient sur deux lignes et entraient en collision avec leur résumé. Les caractères sont servis par l'app elle-même (130 Ko dans `public/fonts/`), donc il n'y a aucune requête tierce à craindre, et ils sont embarqués maintenant",
          textEn: "Every PNG export rendered in the system's fallback font. `skipFonts: true` promised to avoid errors over undefined fonts; what it did was drop the app's three faces from the capture, so the text re-flowed inside the image: phase titles wrapped onto two lines and collided with their summary. The faces are served by the app itself (130 KB in `public/fonts/`), so there is no third-party request to fear, and they are embedded now",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Deux des trois tables de phase d'un PDF de séance imprimaient leur en-tête en barre noire vide. Les trois tables partageaient une seule rangée d'en-tête, construite une fois et passée trois fois à pdfmake, et pdfmake écrit ses mesures de mise en page *dans* les cellules qu'on lui donne : l'échauffement les consommait, le corps de séance et le retour au calme récupéraient des objets déjà mesurés et ne dessinaient aucun titre de colonne. Une rangée d'en-tête neuve est construite par table maintenant",
          textEn: "Two of the three phase tables in a workout PDF printed their header as a blank black bar. The three tables shared one header row, built once and handed to pdfmake three times, and pdfmake writes its layout measurements *into* the cells it is given: the warm-up consumed them, the main set and the cool-down got back objects already measured and drew no column titles at all. A fresh header row is built per table now",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Les caractères que la fonte du PDF ne sait pas dessiner sortaient en carrés vides au milieu d'une phrase. pdfmake embarque Roboto, qui s'arrête au latin étendu : l'étoile des séances clés sur chaque semaine d'un plan, les flèches des conseils de RP-013, l'exposant ordinal de TRL-018. Chaque chaîne passe maintenant par `pdfText()` en chemin vers pdfmake, qui traduit ce qui a un équivalent lisible (une flèche devient `->`, `20e` garde son `e`) et retire ce qui n'en a pas, comme un emoji dans le nom d'une séance personnalisée. `pdfText.test.ts` interroge la fonte livrée avec fontkit sur tout le catalogue et les deux langues, donc un conseil écrit demain avec une flèche dedans fait échouer l'intégration continue plutôt que le PDF d'un lecteur",
          textEn: "Characters the PDF font cannot draw came out as empty boxes in the middle of a sentence. pdfmake embeds Roboto, which stops at extended Latin: the key-session star on every week of a plan, the arrows in RP-013's coaching tips, the ordinal superscript in TRL-018. Every string now goes through `pdfText()` on its way to pdfmake, which translates what has a readable equivalent (an arrow becomes `->`, `20e` keeps its `e`) and drops what does not, such as an emoji in a custom session's name. `pdfText.test.ts` interrogates the shipped font with fontkit over the whole catalogue and both locales, so a tip written tomorrow with an arrow in it fails CI rather than a reader's PDF",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Les séances Garmin s'exportaient sans leur zone de fréquence cardiaque. Chaque pas déclarait une cible de fréquence cardiaque et ne portait aucune valeur de cible, parce que la zone était écrite `targetHrZone`, qui est un *sous-champ* de `target_value` dans le profil FIT : l'encodeur du SDK acceptait la clé et n'écrivait rien. Les pas portent maintenant `target_value`, et un sprint en Z6 est ramené à Z5, la zone la plus haute que le format connaisse",
          textEn: "Garmin workouts exported without their heart-rate zone. Every step declared a heart-rate target and carried no target value, because the zone was written as `targetHrZone`, which is a *sub-field* of `target_value` in the FIT profile: the SDK encoder accepted the key and wrote nothing. Steps now carry `target_value`, and a Z6 sprint clamps to Z5, the highest zone the format knows",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Une image exportée en thème sombre était illisible. Les deux chemins de capture peignaient un fond clair fixe sous ce qui était à l'écran, donc le titre et le texte pâles d'une carte sombre sortaient blancs sur blanc. Le fond suit maintenant le thème réellement peint",
          textEn: "An image exported in dark mode was illegible. Both capture paths painted a fixed light background under whatever was on screen, so a dark card's pale title and text came out white on white. The background now follows the theme actually painted",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "La sauvegarde de l'écran des réglages et un plan exporté en JSON ne faisaient rien dans Firefox. Les deux cliquaient une ancre qui n'était jamais insérée dans le document, ce que Firefox ignore. Les neuf endroits qui téléchargent passent maintenant par un seul `triggerDownload()`, qui cesse aussi de révoquer l'URL du blob dans le même tick que le clic (Safari annule le transfert dessous) et rend le nom de fichier sûr pour un système de fichiers",
          textEn: "The backup on the settings screen and a plan exported as JSON did nothing in Firefox. Both clicked an anchor that was never inserted into the document, which Firefox ignores. All nine download sites now go through one `triggerDownload()`, which also stops revoking the blob URL in the same tick as the click (Safari cancels the transfer under it) and makes the filename safe for a filesystem",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Le fichier calendrier d'un plan était nommé d'après son UUID quand son PDF et son JSON étaient nommés d'après le plan. Les trois formats partagent un seul nom maintenant",
          textEn: "A plan's calendar file was named after its UUID while its PDF and JSON were named after the plan. The three formats share one name now",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "La table des splits s'enregistrait sous `splits-10-workout.png`, et ne disait rien du tout quand elle avait fini, ou échoué. `exportToPNG` n'ajoute plus un suffixe destiné aux séances au nom que son appelant lui donne, et l'export rend compte de son succès et de son échec comme tous les autres exports de l'app",
          textEn: "The splits table saved as `splits-10-workout.png`, and said nothing at all when it had finished, or failed. `exportToPNG` no longer appends a suffix meant for sessions to the name its caller gives, and the export reports success and failure like every other export in the app",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Chaque capture d'écran et chaque GIF de démonstration du README et du manifeste PWA montraient l'app telle qu'elle était en juillet, avant la refonte : l'ardoise bleue, les six teintes de zone, l'ancien logo. Les treize sont réenregistrées contre le dépôt plutôt que contre la production, pour qu'une capture montre ce que le dépôt contient. Les scénarios de démonstration ont dû être recâblés d'abord : les filtres de la bibliothèque ont quitté la page pour une feuille de droite dont le bouton principal porte le nombre de résultats et ferme le panneau, le menu du téléphone est devenu un dialogue plein écran fait de portes `<details>`, et la distance du calculateur de VMA est devenue une liste déroulante",
          textEn: "Every screenshot and demo GIF in the README and in the PWA manifest showed the app as it was in July, before the redesign: the blue slate, the six-hue zones, the old wordmark. All thirteen are re-recorded against the repository rather than production, so a capture shows what the repository contains. The demo scenarios had to be rewired first: the library's filters left the page for a right-hand sheet whose primary button carries the result count and closes the panel, the phone menu became a full-screen dialog of `<details>` doors, and the VMA calculator's distance became a listbox",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "`bun run qa:motion` a attrapé une vraie faute pendant le portage des films : la piste de la chronologie d'une séance était un lavis gris, et sur une rampe d'encre un bloc Z1 EST un lavis gris, donc les deux premières secondes du balayage sortaient invisibles. La piste est une carte maintenant, comme dans l'app, et la récupération dedans est hachurée plutôt que fanée : un bloc de récupération n'est pas un effort plus faible sur la rampe, il est hors de la rampe",
          textEn: "`bun run qa:motion` caught a real fault while the films were being ported: the session timeline's track was a grey wash, and on an ink ramp a Z1 block IS a grey wash, so the first two seconds of the sweep came out invisible. The track is a card now, like in the app, and recovery inside it is hatched rather than faded: a recovery block is not a weaker effort on the ramp, it is off the ramp",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "La fenêtre d'installation enrichie de Chrome montrait l'app d'avant la refonte, avec un carton d'astuce planté dans l'une des images. Ces captures étaient aussi censées être en anglais, comme les chaînes du manifeste, mais la langue était semée sous `i18nextLng` quand l'app lit `zoned-language`. La préparation que les trois scripts de capture avaient chacun recopiée, et sur laquelle ils avaient divergé, vit maintenant une seule fois, dans `scripts/lib/capture-prep.ts`, et la langue passe par `?lang=`, qui est ce que la chaîne de détection lit en premier",
          textEn: "Chrome's rich install prompt showed the app from before the redesign, with a hint toast stuck in one of the frames. Those screenshots were also meant to be English, like the manifest strings, but the language was seeded under `i18nextLng` while the app reads `zoned-language`. The preparation the three capture scripts had each copied, and diverged on, now lives once, in `scripts/lib/capture-prep.ts`, and the language goes through `?lang=`, which is what the detection chain reads first",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "Une capture manquée ne passe plus en silence. Elle laissait en place le fichier du passage précédent, donc un passage à moitié échoué remettait discrètement une vieille image dans le README",
          textEn: "A missed capture no longer passes silently. It left the previous run's file in place, so a half-failed pass quietly put an old image back in the README",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Les comptes du catalogue dans le README avaient dérivé derrière l'app : 230 séances de course, 10 plans, 16 collections et 116 termes de glossaire. Les captures rafraîchies se posaient à côté d'une table qui les contredisait",
          textEn: "The README's catalogue counts had drifted behind the app: 230 running sessions, 10 plans, 16 collections and 116 glossary terms. The refreshed screenshots sat next to a table contradicting them",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Le menu mobile cesse de glisser en s'ouvrant. Son contenu portait une montée de 8 px par-dessus le fondu du panneau lui-même, donc les six portes voyageaient encore sous le pouce quand l'encre se posait. Une feuille latérale glisse parce qu'elle vient d'un bord, et un dialogue monte de 8 px parce qu'il se détache de la page ; ce panneau n'a ni bord ni page derrière lui, il EST l'écran, donc il se pose simplement maintenant. Le fondu reste",
          textEn: "The mobile menu stops sliding as it opens. Its content carried an 8px rise on top of the panel's own fade, so the six doors were still travelling under the thumb while the ink was settling. A side sheet slides because it comes in from an edge, and a dialog rises 8px because it detaches from the page; this panel has neither edge nor page behind it, it IS the screen, so it now just settles. The fade stays",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Le rail des pratiques de la bibliothèque ne défile plus que sur un axe sur téléphone. `overflow-x: auto` ne restreint pas le défilement à x : l'autre axe est calculé de `visible` à `auto`, donc le rail était aussi un conteneur de défilement vertical, 44 px de fenêtre pour 44 px de contenu, et un geste vertical parti d'une puce était attrapé par le rail au lieu d'atteindre la page. L'axe vertical est fermé, le geste revient à la page, et 6 px de marge interne (repris en marge négative, pour que la hauteur de la bande ne bouge pas) gardent l'anneau de focus dans la zone de défilement au lieu d'être coupé par elle. Un balayage horizontal ne s'enchaîne plus non plus sur le geste de retour du navigateur",
          textEn: "The library's practice rail only scrolls on one axis on a phone. `overflow-x: auto` does not restrict scrolling to x: the other axis computes from `visible` to `auto`, so the rail was also a vertical scroll container, 44px of viewport for 44px of content, and a vertical gesture starting on a pill was caught by the rail instead of reaching the page. The vertical axis is closed, the gesture goes back to the page, and 6px of inner padding (taken back as a negative margin, so the band's height does not move) keeps the focus ring inside the scrollport instead of clipped by it. A horizontal swipe no longer chains to the browser's back gesture either",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "L'icône de l'écran d'accueil, encore, et cette fois sur le manifeste plutôt que sur le dessin. La correction précédente avait redessiné l'icône correctement mais listait `app-icon.svg` en premier parmi les `icons` du manifeste, et cela faisait disparaître la tuile entièrement : depuis iOS 16.4 un manifeste qui déclare des `icons` est *préféré* à `<link rel=\"apple-touch-icon\">` au lieu de lui servir de repli, et un écran d'accueil iOS ne pose pas un vecteur. `sizes: \"any\"` répond à toutes les tailles que Safari demande, donc Safari a élu le SVG, échoué à le rasteriser, et installé un substitut gris estampillé de la première lettre du `<title>`, sans jamais atteindre le PNG en dessous. Le manifeste ne déclare plus que des icônes matricielles, et `src/lib/pwaIcons.test.ts` fait échouer la construction si un vecteur y est remis. `public/app-icon.svg` est toujours généré et toujours vérifié par l'intégration continue : c'est le dessin de référence d'où sortent les PNG, pas une icône qu'une plateforme peut servir",
          textEn: "The home-screen icon, again, and this time on the manifest rather than on the drawing. The previous fix redrew the icon correctly but listed `app-icon.svg` first among the manifest `icons`, and that made the tile vanish entirely: since iOS 16.4 a manifest that declares `icons` is *preferred* to `<link rel=\"apple-touch-icon\">` instead of being a fallback for it, and an iOS home screen does not lay down a vector. `sizes: \"any\"` answers every size Safari asks for, so Safari elected the SVG, failed to rasterise it, and installed a grey placeholder stamped with the `<title>`'s first letter, never reaching the PNG below. The manifest now declares raster icons only, and `src/lib/pwaIcons.test.ts` fails the build if a vector is put back. `public/app-icon.svg` is still generated and still checked by CI: it is the reference drawing the PNG come out of, not an icon a platform can serve",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "L'icône de l'écran d'accueil. Installée en PWA, Zoned arrivait sur l'écran d'accueil en tuile presque blanche : le générateur d'assets PWA prenait `favicon.svg`, une plaque papier `#F6F5F2` faite pour un onglet de navigateur, la rentrait de 30 % et la posait sur du blanc pur. Mesuré sur l'apple-touch-icon : 52 % de la tuile était du `#FFFFFF` et la marque couvrait 52 % par 38 %. L'icône de l'app est maintenant son propre dessin, `public/app-icon.svg`, produit par le même script que le logo : le même `z.`, en papier sur un carré d'encre, à fond perdu, sans arrondi intérieur puisque le système applique son propre masque",
          textEn: "The home-screen icon. Installed as a PWA, Zoned landed on the home screen as a near-blank white tile: the PWA asset generator took `favicon.svg`, a paper `#F6F5F2` plate meant for a browser tab, padded it by 30% and set it on pure white. Measured on the apple-touch-icon: 52% of the tile was `#FFFFFF` and the mark spanned 52% by 38%. The app icon is now its own drawing, `public/app-icon.svg`, produced by the same script as the wordmark: the same `z.`, in paper on an ink square, full bleed, no inner rounding since the system applies its own mask",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "Les icônes ne portent plus de transparence. Les anciennes `pwa-*.png` étaient transparentes à 13 % dans les coins laissés libres par la plaque arrondie, et iOS peint la transparence en noir",
          textEn: "Icons carry no transparency any more. The old `pwa-*.png` were 13% transparent in the corners left free by the rounded plate, and iOS paints transparency black",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "L'icône masquable reste dans sa zone de sécurité, et le générateur le prouve maintenant au lieu de le supposer : la marque est un rectangle couché, donc c'est sa DIAGONALE qui doit tenir dans le cercle inscrit à 80 % du côté, et la vérification part des contours réels à chaque passage, `--check` compris",
          textEn: "The maskable icon stays inside its safe zone, and the generator now proves it rather than assuming it: the mark is a lying rectangle, so it is its DIAGONAL that has to fit the circle inscribed at 80% of the side, and the check runs from the real outlines on every run, `--check` included",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "`favicon.svg` et `logo.svg` étaient périmés par rapport à leur générateur depuis la passe typographique. Seul un commentaire différait, mais `--check` échouait sur main",
          textEn: "`favicon.svg` and `logo.svg` were stale against their generator since the typography pass. Only a comment differed, but `--check` was failing on main",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Le formulaire d'activité complémentaire se traînait latéralement sur téléphone. Son corps plafonne sa hauteur pour que le titre et les boutons ne bougent pas pendant que les champs défilent, et `overflow-y: auto` seul ne ferme pas l'autre axe : CSS transforme le `visible` sur x en `auto`, donc le corps était aussi un défileur horizontal. Dix pixels de course, exactement le débord que le résumé `Add details` tire hors de son texte pour sa bande de survol, et un pouce trouve dix pixels : n'importe quel balayage un peu diagonal emportait le formulaire entier de travers, libellés coupés à gauche et champ de date à droite, sous un en-tête qui ne bougeait pas. Le débord garde son dépassement, payé À L'INTÉRIEUR du conteneur maintenant (marge interne en ligne, reprise en marge négative), donc les champs restent alignés avec l'en-tête et le pied et la bande y regagne même sa symétrie, son débord de gauche étant jusqu'ici tombé hors de la zone de défilement et coupé. L'axe reste fermé pour ce qui débordera ensuite",
          textEn: "The complementary activity form dragged sideways on a phone. Its body caps its height so the title and the buttons stay put while the fields scroll, and `overflow-y: auto` alone does not close the other axis: CSS turns the `visible` on x into `auto`, so the body was also a horizontal scroller. Ten pixels of travel, exactly the bleed the `Add details` summary pulls outside its text for its hover band, and a thumb finds ten pixels: any slightly diagonal swipe carried the whole form off square, labels cut on the left and the date field on the right, under a header that did not move. The bleed keeps its overhang, paid for INSIDE the container now (inline padding, taken back with a negative margin), so the fields stay aligned with the header and footer and the band even regains its symmetry, its left overhang having until now fallen outside the scroll area and been clipped. The axis stays shut for whatever overflows next",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "La fenêtre d'installation de Chrome montrait encore l'app d'avant la refonte : ses captures dataient de juillet, et un carton d'astuce était resté planté dans l'une d'elles. Elles étaient aussi censées être en anglais, comme le manifeste, mais la langue était semée sous une clé que l'app ne lit pas",
          textEn: "Chrome's install prompt still showed the app from before the redesign: its screenshots dated from July, and one of them had a hint toast stuck in the frame. They were also meant to be in English, like the manifest, but the language was seeded under a key the app does not read",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "La vue liste d'un plan faisait tenir 388 px de contenu dans une carte de 350. Le nom de la séance était écrasé à 3 px et se peignait par-dessus la pastille voisine : deux séances sur cinq étaient illisibles sur un téléphone de 390 px",
          textEn: "The plan's list view fitted 388px of content into a 350px card. The session's name was crushed to 3px and painted over the badge beside it: two of five sessions were unreadable on a 390px phone",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Le menu d'une séance se dépliait de huit pixels par image depuis le bord droit au lieu d'apparaître, et s'ouvrait à moitié hors écran près du bord d'un téléphone",
          textEn: "The session menu unfurled 8px per frame from the right edge instead of appearing, and opened half off-screen when tapped near the right of a phone",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Changer un filtre renvoyait en haut de page. Une navigation qui réécrit son propre état n'est pas un changement de page : le glossaire, les collections et les parcours en profitent par le même geste",
          textEn: "Changing a filter sent you back to the top of the page. A navigation that rewrites its own state is not a page change: the glossary, the collections and the routes all benefit from the same fix",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "Neuf colonnes défilantes écrasaient ce qu'elles portaient",
          textEn: "Nine scrolling columns crushed what they carried",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Les cartes d'un tiroir étaient écrasées et sortaient de leur cadre",
          textEn: "Cards inside a sheet were squashed and escaped their frame",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "La pilule MENU flottante recouvrait la barre du pouce",
          textEn: "The floating MENU pill covered the thumb bar",
          category: "Expérience mobile",
          categoryEn: "Mobile",
        },
        {
          text: "Les deux bandeaux PWA s'empilaient au lieu de se recouvrir",
          textEn: "The two PWA banners stacked instead of overlapping",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "L'ouverture du menu envoyait le focus sur la première porte plutôt que sur le panneau",
          textEn: "Opening the menu moved focus to the first door rather than to the panel",
          category: "Accessibilité",
          categoryEn: "Accessibility",
        },
        {
          text: "Le chunk vendor-radix nommait des paquets qui ne sont pas installés",
          textEn: "The vendor-radix chunk named packages that are not installed",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Trois séances ultra qui doublaient le catalogue ont été retirées",
          textEn: "Three ultra sessions that duplicated the catalogue were removed",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
    },
  },
  {
    version: "0.8.0",
    date: "2026-07-29",
    changes: {
      added: [
        {
          text: "Ajuster une séance du catalogue : un bouton ouvre une copie modifiable où les répétitions, les séries, les durées d'effort et de récupération se règlent au curseur ou se saisissent au clavier, avec un aperçu qui se recalcule en direct. La séance d'origine n'est jamais touchée, la copie arrive dans Mes séances et renvoie vers celle dont elle vient",
          textEn: "Adjust a catalogue workout: a button opens an editable copy where repetitions, sets, effort and recovery durations are set with a slider or typed in, with a preview that recomputes live. The source workout is never touched, the copy lands in My Workouts and links back to where it came from",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Les bornes de réglage viennent de la séance elle-même : la plage que déclare son scaling, ou la moitié à une fois et demie ce qu'elle prescrit. Le curseur couvre cette recommandation, le champ à côté accepte n'importe quelle valeur, et seul l'aberrant est refusé",
          textEn: "Parameter bounds read from the template itself, the range its scaling declares, or half to one and a half times what it prescribes. The slider spans that recommendation, the field beside it takes any value, and only the absurd is refused",
          category: "Seances",
          categoryEn: "Workouts",
        },
      ],
      changed: [
        {
          text: "Un glissement de curseur ne remplit plus la pile d'annulation : un geste vaut un cran, quelle que soit sa longueur",
          textEn: "Dragging a slider no longer floods the undo stack: one gesture is one step, however long the drag",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Les curseurs annoncent enfin aux lecteurs d'écran ce qu'ils règlent et la valeur qu'ils portent",
          textEn: "Sliders now announce what they control and the value they hold to screen readers",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Un bouton Modifier sur la page d'une séance personnelle. Arrivé par les favoris ou un signet, on ne pouvait rejoindre l'éditeur qu'en repassant par Mes séances",
          textEn: "An Edit button on a personal workout's page. Reached from favourites or a bookmark, the editor was otherwise only accessible by going back through My Workouts",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Le lien d'une séance personnelle ne menait nulle part chez son destinataire : la copie du lien, les QR codes des quatre visuels de partage et le pied du texte Strava pointaient tous vers un identifiant qui n'existe que dans le navigateur de son auteur. Le lien transporte désormais la séance elle-même",
          textEn: "A personal workout's link led nowhere for its recipient: the copy-link action, the QR codes on the four share visuals and the Strava footer all pointed at an id that exists only in its author's browser. The link now carries the workout itself",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Le nom anglais d'une séance copiée n'est plus effacé dès la première frappe dans le champ de nom",
          textEn: "A copied workout's English name is no longer wiped by the first keystroke in the name field",
          category: "Seances",
          categoryEn: "Workouts",
        },
      ],
    },
  },
  {
    version: "0.7.6",
    date: "2026-07-29",
    changes: {
      added: [
        {
          text: "Les licences des composants tiers sont publiées sur /licenses.txt, avec un lien en pied de page, et régénérées à chaque build depuis les 209 paquets réellement embarqués",
          textEn: "Third-party licence notices published at /licenses.txt, linked from the footer and regenerated at every build from the 209 packages the bundle actually ships",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Un validateur du format des séances, qui fait échouer le build et la CI sur une séance mal formée. Un mode --file répond en deux secondes sur un seul fichier, au lieu d'attendre un déploiement raté",
          textEn: "A validator for the workout format that fails the build and CI on a malformed session. A --file mode answers in two seconds on a single file instead of waiting for a failed deploy",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Une vérification automatique sur les pull requests : types, tests, parité FR/EN et schéma des séances. Rien ne contrôlait une contribution avant qu'elle n'arrive sur la branche principale",
          textEn: "An automated check on pull requests: typecheck, tests, FR/EN parity and the workout schema. Nothing verified a contribution before it reached the main branch",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Une référence complète du format des séances : forme des fichiers, préfixes d'identifiants, les trois axes de classement, l'arbre des blocs, les specs de zone, les champs trail et un exemple commenté de bout en bout",
          textEn: "A full workout format reference: file shapes, id prefixes, the three classification axes, the step tree, zone specs, trail fields and a fully worked example",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
      changed: [
        {
          text: "Les 239 séances portent désormais une structure lisible par machine sur leurs trois phases, contre 34 sur le seul corps de séance. La chronologie n'a plus à relire une phrase en français pour savoir de quoi la séance est faite",
          textEn: "All 239 workouts now carry a machine-readable structure across their three phases, up from 34 on the main set alone. The timeline no longer has to re-read a French sentence to know what a session is made of",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Le multiplicateur s'écrit 7 × 400m partout, là où deux conventions concurrentes coexistaient",
          textEn: "The multiplier reads 7 × 400m everywhere, where two competing conventions were in use",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Les conditions des composants tiers sont documentées, dont le SDK Garmin FIT, qui est propriétaire et non libre, et dont l'accord restreint la redistribution",
          textEn: "Third-party terms are documented, including the Garmin FIT SDK, which is proprietary rather than open source and whose agreement restricts redistribution",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      fixed: [
        {
          text: "Les récupérations s'affichaient en français sur les pages anglaises : le champ n'existait qu'en français et la structure dérivée n'avait pas de jumeau anglais",
          textEn: "Recovery texts rendered in French on English pages: the field existed in French only and the derived structure had no English twin",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "La répartition des zones gardait ses libellés jusqu'au rechargement lors d'une bascule FR/EN, alors que le titre changeait immédiatement",
          textEn: "The zone distribution kept its labels until a reload when switching FR/EN, while the title changed immediately",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "/licenses.txt et les autres fichiers statiques étaient interceptés par le routage de l'application",
          textEn: "/licenses.txt and other static files were swallowed by the single-page routing fallback",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Sept séances annonçaient une fourchette de répétitions que leur propre donnée contredisait : 6-8x pour un 7 enregistré. La fourchette est passée dans les conseils, où elle relève du coaching",
          textEn: "Seven workouts announced a repetition range their own data contradicted: \"6-8x\" against a stored 7. The range moved to the coaching tips, where it belongs",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "END-022 durait 76min pour 60-75 annoncées : ses lignes droites de 20 secondes étaient enregistrées comme une minute pleine",
          textEn: "END-022 ran to 76min against a declared 60-75: its 20-second strides were stored as a full minute",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Dénivelé, pente, type de terrain et textes anglais disparaissaient à l'enregistrement d'une séance personnelle",
          textEn: "Elevation, gradient, terrain type and English descriptions were dropped when a custom workout was saved",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "La langue est déduite de l'URL et chaque page se canonicalise sur elle-même",
          textEn: "Language is now derived from the URL and every page canonicalises to itself",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Les compteurs annoncés ne correspondaient plus au catalogue réel",
          textEn: "The advertised catalogue counts no longer matched the real one",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
    },
  },
  {
    version: "0.7.5",
    date: "2026-07-26",
    changes: {
      added: [
        {
          text: "Aperçus sociaux pour les robots qui n'exécutent pas JavaScript, avec des métadonnées propres à chaque page clé : un lien vers zoned.run s'affichait jusqu'ici sans image ni description sur X, LinkedIn, Slack, Facebook et Discord",
          textEn: "Social previews for crawlers that never run JavaScript, with metadata specific to each key page: a link to zoned.run previously appeared with no image and no description on X, LinkedIn, Slack, Facebook and Discord",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Six cartes de partage en anglais, une par section : générale, bibliothèque, calculateurs, plans, apprendre et simulateur de course",
          textEn: "Six English share cards, one per section: site-wide, library, calculators, plans, learn and race simulator",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Fichiers communauté sur GitHub : politique de sécurité avec signalement privé des vulnérabilités, code de conduite, bouton de soutien et sélecteur d'issues",
          textEn: "Community health files on GitHub: security policy with private vulnerability reporting, code of conduct, Sponsor button and an issue chooser",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Captures d'installation de l'app pour ordinateur et mobile, et catégories dans le manifeste : Chrome affiche enfin sa fiche d'installation complète",
          textEn: "App install screenshots for desktop and mobile, plus manifest categories, so Chrome finally shows its rich install prompt",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
      ],
      changed: [
        {
          text: "Jeu d'icônes migré vers Material Symbols Sharp en graisse 600, avec une source unique pour les glyphes de catégorie et une jauge graduée pour la difficulté",
          textEn: "Icon set migrated to Material Symbols Sharp at weight 600, with a single source of truth for category glyphs and a graded gauge for difficulty",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Manifeste de l'app et captures du README passés en anglais ; l'app continue de suivre la langue du navigateur",
          textEn: "App manifest and README screenshots switched to English; the app still follows the browser locale",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Compteurs et liste de fonctionnalités du README remis en accord avec le produit : 219 séances de course, partage par lien, les dix semaines prêtes à l'emploi, le déroulé du jour de course et les pages de comparaison",
          textEn: "README counts and feature list brought back in line with the product: 219 running sessions, share-by-link, the ten curated weeks, the race-day run sheet and the comparison pages",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
      fixed: [
        {
          text: "Les robots sociaux ne voyaient aucune métadonnée : les balises ne sont posées qu'une fois la page exécutée côté navigateur, et la passe de pré-rendu ne tourne pas en production",
          textEn: "Social crawlers saw no metadata at all: the tags are only set once the page runs in the browser, and the prerender pass does not run in production",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Le plan du site listait des adresses écrites à la main qui avaient dérivé : deux pages mortes étaient soumises à Google pendant que neuf pages réelles ne l'étaient jamais",
          textEn: "The sitemap listed hand-written addresses that had drifted: two dead pages were submitted to Google while nine real ones never were",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Les semaines prêtes à l'emploi, le tirage de séance, le générateur de parcours et la recherche de piste manquaient au plan du site",
          textEn: "The curated weeks, the workout draw, the route generator and the track finder were missing from the sitemap",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "L'aide du tableau de semaine décrivait un geste que rien n'implémente, et choisissait sa formulation d'après la largeur d'écran au lieu du type de pointeur",
          textEn: "The week board hint named a gesture nothing implements, and picked its wording from viewport width rather than pointer capability",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Icônes : états pleins de l'étoile et du cœur, indicateur de sélection des menus, et glyphes du fartlek et du haut du corps",
          textEn: "Icons: solid star and heart states, the dropdown selection indicator, and the fartlek and upper-body glyphs",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.7.4",
    date: "2026-07-25",
    changes: {
      added: [
        {
          text: "Quatre semaines prêtes à l'emploi : premiers pas, bloc côtes, semaine pic et allure spécifique",
          textEn: "Four curated weeks: first steps, hill block, peak week and race-pace week",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Neuf séances au catalogue : endurance volume pour confirmés et élite, endurance en négative split et avec lignes droites, récupération confirmés et élite, et les deux premières séances de trail débutant",
          textEn: "Nine catalogue sessions: volume endurance for advanced and elite, negative-split and strides endurance, recovery for advanced and elite, and the first two beginner trail sessions",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Publication automatique des releases GitHub à la pose d'un tag de version, à partir de la section correspondante du changelog",
          textEn: "GitHub Releases published automatically when a version tag is pushed, from the matching changelog section",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      changed: [
        {
          text: "Le générateur de plans pilote le volume hebdomadaire par son modèle au lieu d'additionner les séances tirées : la progression prévue arrive enfin jusqu'au coureur",
          textEn: "The plan generator drives weekly volume from its own model instead of summing whatever sessions were drawn, so the planned progression reaches the runner",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Le travail de qualité est pondéré par la distance visée : VMA sur 5K et 10K, seuil et allure spécifique sur semi et marathon, côtes sur trail",
          textEn: "Quality work is weighted by race distance: VO2max for 5K and 10K, threshold and race pace for half marathon and marathon, hills for trail",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Les plans à quatre séances programment deux séances de qualité par semaine au lieu d'une seule",
          textEn: "Four-day plans schedule two quality sessions per week instead of one",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Le plan marathon passe à cinq séances par semaine, ce qu'exige un pic à 80 km avec une sortie longue de 31 km",
          textEn: "The marathon plan moves to five sessions per week, what an 80 km peak alongside a 31 km long run requires",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Les plans de reprise progressent réellement sur leur cycle au lieu de démarrer à leur propre pic",
          textEn: "Return-to-running plans progress across their cycle instead of starting at their own peak",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Les semaines prêtes à l'emploi annoncent le volume que leurs séances totalisent vraiment",
          textEn: "Curated weeks declare the volume their sessions actually add up to",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      fixed: [
        {
          text: "Les séances de VMA étaient annotées et calculées à l'allure endurance : les zones écrites Z5+ retombaient silencieusement en Z2",
          textEn: "VO2max sessions were annotated and costed at easy pace: zone strings such as \"Z5+\" silently fell back to Z2",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "La page séance se contredisait sur les zones, les durées et les titres ; un seul analyseur de zone les alimente désormais (166 séances sur 230 concernées)",
          textEn: "The session page contradicted itself on zones, durations and headings; a single zone parser now backs all of them (166 of 230 templates affected)",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Les semaines de pic ne pouvaient pas porter leur volume et finissaient plus légères que les semaines de base",
          textEn: "Peak weeks could not carry their volume and ended up lighter than base weeks",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "La semaine de course ne prescrit plus de footings de 9 minutes, et aucune semaine ne répète deux fois la même séance",
          textEn: "Race week no longer prescribes 9-minute jogs, and no week repeats the same session twice",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "L'audit de plan contrôle le volume en kilomètres au lieu d'un pourcentage théorique qui progressait proprement quoi que le plan livre",
          textEn: "Plan audit checks weekly volume in kilometres instead of a model percentage that progressed smoothly whatever the plan delivered",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
    },
  },
  {
    version: "0.7.3",
    date: "2026-07-25",
    changes: {
      added: [
        {
          text: "Partage par lien pour les séances personnalisées, les plans, les simulations de course et les calculateurs",
          textEn: "URL sharing for custom workouts, training plans, race simulations and calculators",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Verrouillage d'une séance et retirage du reste de la semaine ; suppression d'une séance rendue visible",
          textEn: "Lock a session and re-roll the rest of the week; session removal made discoverable",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Vue Jour J du simulateur : déroulé chronologique, prochaine étape avec compte à rebours et marqueur maintenant dans la timeline",
          textEn: "\"Race day\" view on the race simulator: chronological run sheet, next-up card with countdown, and a \"now\" marker in the timeline",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Sommaire d'ancres avec suivi du défilement sur le simulateur",
          textEn: "Anchor navigation with scroll-spy on the race simulator",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Courbe d'allure pour les stratégies négative et positive",
          textEn: "Pace curve for negative and positive split strategies",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Checklist Sac et logistique sur le simulateur, jusque-là générée pour le PDF seulement",
          textEn: "Kit bag checklist on the race simulator, until now generated for the PDF only",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
      changed: [
        {
          text: "Simulateur repensé en deux colonnes : réglages sticky repliés en barre de résumé, plan en grille de cards, export PDF passé en action principale",
          textEn: "Race simulator reworked into two columns: sticky settings folding into a summary bar, plan in a card grid, PDF export promoted to the primary action",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Tableau d'allure adaptatif : une ligne de résumé pour l'allure régulière, tableau et courbe pour négative et positive",
          textEn: "Split table adapts to the strategy: one summary line for even pacing, table plus curve for negative and positive",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Échauffement du simulateur en checklist chronométrée ; durées par exercice ajoutées et total du bloc corrigé de 18 à 28 min",
          textEn: "Race simulator warm-up is now a timed checklist; per-exercise durations added and the block total corrected from 18 to 28 min",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Un seul champ de temps objectif (mm:ss ou h:mm:ss) à la place des trois steppers natifs",
          textEn: "Single target-time field (mm:ss / h:mm:ss) replacing three native steppers",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Nutrition : l'absence d'apport glucidique s'affiche comme un conseil et non comme 0 g / 0 gels ; hydratation arrondie à 50 ml",
          textEn: "Nutrition states the no-carb case as advice instead of \"0 g / 0 gels\"; hydration rounded to 50 ml",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Tableau de la semaine sur desktop retravaillé : colonnes à hauteur naturelle, cards Repos explicites, zone et charge sur chaque séance",
          textEn: "Desktop week board reworked: natural column heights, explicit Rest cards, zone and load on every session card",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Couleurs d'intensité unifiées dans une table unique partagée par le tableau hebdo, le calendrier de plan et le sélecteur de séances",
          textEn: "Intensity colours unified into one table shared by the week board, the plan calendar and the workout picker",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Copy coach du simulateur unifiée au tutoiement",
          textEn: "Coach copy on the race simulator unified on tutoiement",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
      fixed: [
        {
          text: "Le header sticky du tableau d'allure ne recouvre plus les premières lignes",
          textEn: "Split table sticky header no longer covers the first rows",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "L'échauffement était planifié à un -30 min en dur qui ne correspondait pas à sa durée réelle",
          textEn: "Warm-up was scheduled at a hardcoded -30 min that did not match its real duration",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Les cues mentaux ne répètent plus leur plage de kilomètres dans le texte",
          textEn: "Mental cues no longer repeat their km range in the text",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Le bouton de génération du rail desktop reste ancré en bas du panneau au lieu de tomber hors écran",
          textEn: "Desktop week generator CTA stays anchored at the bottom of the rail instead of falling off screen",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "La génération de plan est amorcée depuis sa config, donc un plan partagé se régénère à l'identique pour chaque destinataire",
          textEn: "Plan generation is now seeded from its config, so a shared plan regenerates identically for every recipient",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
    },
  },
  {
    version: "0.7.2",
    date: "2026-07-20",
    changes: {
      added: [
        {
          text: "Categories sur les semaines enregistrees (heritees des semaines pre-construites), avec badge et filtres sur Mes semaines",
          textEn: "Categories on saved weeks (inherited from prebuilt weeks), with a badge and filter chips on My weeks",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Duplication d'une semaine depuis la liste (suivi de completion remis a zero sur la copie)",
          textEn: "Duplicate a saved week from the list (completion tracking reset on the copy)",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Partage d'une semaine par lien encode compact, avec page d'apercu et Ajouter a mes semaines",
          textEn: "Share a week as a compact encoded link, with a preview page and \"Add to my weeks\"",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Import d'une semaine depuis un fichier JSON sur Mes semaines",
          textEn: "Import a week from a JSON file on My weeks",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
      ],
      changed: [
        {
          text: "Actions des cartes de semaine regroupees dans un menu ; en-tete de la page semaine reorganise autour d'un badge categorie",
          textEn: "Week card actions grouped into an overflow menu; week page header reworked around a category badge",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Les seances multiples d'un meme jour comptent dans les stats hebdo et s'empilent dans le rythme de la semaine",
          textEn: "Multiple sessions on the same day now count in weekly stats and stack in the rhythm chart",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Les semaines dupliquees ou importees apparaissent immediatement, sans rafraichir la page",
          textEn: "Duplicated or imported weeks appear immediately without a page refresh",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.7.1",
    date: "2026-07-20",
    changes: {
      added: [
        {
          text: "Bouton Partager sur Strava (copie en un clic) sur les pages seance",
          textEn: "\"Share on Strava\" copy-to-clipboard button on session pages",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Palette de commandes etendue a davantage de surfaces produit",
          textEn: "Command Palette extended to more product surfaces",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
      ],
      changed: [
        {
          text: "Page d'accueil reorganisee autour de la generation de plans : accroche orientee benefice, Generer mon plan en action principale, section Plans remontee juste apres les points d'entree",
          textEn: "Homepage reordered around plan generation: benefit-led hero copy, \"Generate my plan\" as primary CTA, Plans section moved right after the entry points",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Tableau de bord des plans : les plans termines sont separes des plans actifs",
          textEn: "Plans dashboard separates ended plans from active ones",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Grilles de cartes animees mobile-first (retour tactile, lift et glow au survol)",
          textEn: "Card grids gain mobile-first interactive motion (tap feedback, hover lift and glow)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Raccourcis clavier affiches selon le systeme (Ctrl sur Windows/Linux, Cmd sur macOS)",
          textEn: "Keyboard shortcut hints follow the OS (Ctrl on Windows/Linux, Cmd on macOS)",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Barre de navigation : bascule en menu hamburger sous 1024 px, plus aucun debordement aux largeurs intermediaires",
          textEn: "Top bar collapses to the hamburger below 1024px, no more overflow at mid-size viewports",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Cartes calculateurs de la page d'accueil a hauteur egale, lien d'ouverture ancre en bas",
          textEn: "Homepage calculator cards share equal heights, explore link pinned to the bottom",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Serie de correctifs issus de l'audit mobile-first (#96-#106)",
          textEn: "Mobile-first audit issues resolved (#96-#106)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "En-tetes de tableau colles a leur carte plutot qu'au viewport",
          textEn: "Sticky table headers pin inside their card instead of the viewport",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      performance: [
        {
          text: "Police Space Grotesk auto-hebergee, chaine Google Fonts bloquante supprimee",
          textEn: "Space Grotesk self-hosted, render-blocking Google Fonts chain removed",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Bundle d'entree scinde : locales, react-dom et palette de commandes en chunks separes",
          textEn: "Entry bundle split: locales, react-dom and command palette in separate chunks",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Chargement de la bibliotheque differe hors de la fenetre LCP, toutes les animations composited",
          textEn: "Library fetch deferred out of the LCP window, all animations composited",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Budgets de performance Lighthouse en CI, CLS du footer corrige sur les pages courtes",
          textEn: "Lighthouse CI performance budgets, footer CLS fixed on short pages",
          category: "Performance",
          categoryEn: "Performance",
        },
      ],
    },
  },
  {
    version: "0.7.0",
    date: "2026-06-03",
    changes: {
      added: [
        {
          text: "Mode Ma semaine : generateur de semaine polarisee 80/20 qui compose 3 a 6 seances complementaires, avec un editeur de semaine (board 7 jours, jauge d'equilibre 80/20, rythme de la semaine) et une generation automatique animee",
          textEn: "My week mode: a polarised 80/20 week generator composing 3-6 complementary sessions, with a week editor (7-day board, 80/20 balance gauge, week rhythm) and an animated automatic generation",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Semaines pre-construites : semaines types sourcees (base aerobie 80/20, bloc seuil, affutage VO2, recuperation, gros volume, reprise douce) avec un contenu pedagogique pourquoi cette semaine et pourquoi cette seance",
          textEn: "Pre-built weeks: sourced template weeks (aerobic base 80/20, threshold block, VO2 sharpening, recovery, high volume, easy return) with pedagogical why this week and why this session notes",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Page Tirer une seance : tirage aleatoire d'une seance selon des filtres (discipline, zones, duree, niveau) avec une animation de recherche",
          textEn: "Draw a session page: random session draw from filters (discipline, zones, duration, level) with a searching animation",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
      ],
      changed: [
        {
          text: "La page des semaines (/weeks) et sa creation s'alignent sur le design des plans (cartes, badges, mini-stats, boutons Voir/Exporter)",
          textEn: "The weeks page (/weeks) and its creation flow now match the plans design (cards, badges, mini-stats, View/Export actions)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Editeur de semaine mobile-first : bandeau resume au-dessus du board, reglages toujours accessibles, board jamais comprime",
          textEn: "Mobile-first week editor: summary strip above the board, settings always accessible, board never compressed",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Pages Articles et Collections alignees sur la mise en page du hub Calculateurs",
          textEn: "Learn and Collections pages aligned with the Calculators hub layout",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Page de detail d'une seance aeree pour une meilleure lisibilite mobile",
          textEn: "Session detail page given more breathing room for better mobile readability",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "i18n FR/EN et SEO finalises sur les pages semaine",
          textEn: "FR/EN i18n and SEO finalised on the week pages",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      fixed: [
        {
          text: "Le filtre de duree de la bibliotheque ne masque plus les seances longues",
          textEn: "The library duration filter no longer hides long sessions",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "La seance tiree est conservee lors de la navigation",
          textEn: "The drawn session is kept across navigation",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Liens de pied de page de la sidebar : plus de debordement sur mobile (grille 2x2)",
          textEn: "Sidebar footer links: no more overflow on mobile (2x2 grid)",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.6.1",
    date: "2026-05-28",
    changes: {
      added: [
        {
          text: "Dialog de partage avec carrousel style Strava et 17 templates de seance (export PNG bilingue)",
          textEn: "Share dialog with Strava-style template carousel and 17 workout templates (bilingual PNG export)",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Carte OG editoriale avec stats live au format carre, optimisee pour les previews sociales",
          textEn: "Editorial OG share card with live stats in a square format optimised for social previews",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "SEO : enrichissement JSON-LD sur toutes les pages et ajout de llms.txt pour les crawlers IA",
          textEn: "SEO: enriched JSON-LD across all pages and added llms.txt for AI crawlers",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Migration vers le meta hoisting natif de React 19 (remplace react-helmet-async)",
          textEn: "React 19 native meta hoisting (replaces react-helmet-async)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Generateur de sitemap reecrit et prerender durci pour React 19",
          textEn: "Sitemap generator rewritten and prerender hardened for React 19",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      changed: [
        {
          text: "CTA hero de la home bascule sur 'Voir mes plans' quand l'utilisateur a deja des plans sauvegardes",
          textEn: "Home hero CTA swaps to 'View my plans' when the user has saved plans",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Strategie de deploiement : Vercel build au runtime au lieu de servir un dist/ commite",
          textEn: "Deploy strategy: Vercel builds at runtime instead of serving a committed dist/",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Dependance react-helmet-async supprimee (bundle allege)",
          textEn: "Dropped react-helmet-async dependency (lighter bundle)",
          category: "Performance",
          categoryEn: "Performance",
        },
      ],
      fixed: [
        {
          text: "Toast positionne top-center sur mobile pour ne plus chevaucher les boutons d'action",
          textEn: "Toast pinned top-center on mobile so it no longer overlaps action buttons",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Vercel SPA rewrite /(.*) vers / pour que les routes client ne renvoient plus 404",
          textEn: "Vercel SPA rewrite /(.*) → / so client routes stop returning 404",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Share sur iOS Safari : Promise<Blob> dans ClipboardItem et title retire du native share (Instagram)",
          textEn: "Share on iOS Safari: Promise<Blob> in ClipboardItem and title dropped from native share (Instagram)",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "PWA : skipWaiting et clientsClaim forces pour que mobile recoive le contenu frais immediatement",
          textEn: "PWA: skipWaiting + clientsClaim so mobile clients receive fresh content immediately",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Accessibilite : ordre des headings, aria labels et contraste WCAG AA ajustes",
          textEn: "Accessibility: heading order, aria labels and WCAG AA contrast tweaks",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Learn page : la grille stagger se remonte au changement de filtre pour que les cards restent visibles",
          textEn: "Learn page: stagger grid remounts on filter change so cards stay visible",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Build : sitemap genere avant vite build pour qu'il soit shippe dans dist/",
          textEn: "Build: sitemap generated before vite build so it ships in dist/",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Prerender ne tombe plus dans une boucle de retry sur Vercel (HTML capture utilise au lieu de waitForFunction)",
          textEn: "Prerender no longer hits a retry storm on Vercel (trusts captured HTML instead of waitForFunction)",
          category: "Performance",
          categoryEn: "Performance",
        },
      ],
    },
  },
  {
    version: "0.6.0",
    date: "2026-05-27",
    changes: {
      added: [
        {
          text: "Refonte editoriale de la home : journal d'entrainement, sections pleine largeur, sources de chercheurs reelles, FAQ en accordeon et primitives de cards reutilisables",
          textEn: "Editorial landing rewrite: home redesigned as a training journal with full-bleed sections, real researcher sources, accordion FAQ, and reusable card primitives",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Citation rotative quotidienne sur la home, signee par de vrais athletes et coachs (deterministe selon le jour)",
          textEn: "Daily rotating quote on home from real athletes & coaches (deterministic by day)",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Nouvelle navigation haute avec menus deroulants au survol et menu mobile redessine",
          textEn: "Top navigation rework with hover dropdowns and a redesigned mobile sheet",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Sidebar avec groupes repliables et etat ouvert/ferme conserve d'une session a l'autre",
          textEn: "Sidebar with collapsible groups and persisted open/closed state across sessions",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Footer global promu depuis la landing : switcher FR/EN visible sur mobile, layout 3 colonnes compact",
          textEn: "Global Footer promoted from the landing page (FR/EN switcher visible on mobile, compact 3-column layout)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "README open-source avec stats GitHub live (etoiles, issues, dernier commit) et badge de version",
          textEn: "Open-source README with live GitHub stats (stars, issues, last commit) and version badge",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
      changed: [
        {
          text: "Header editorial propage a l'ensemble de l'app en 6 vagues : pages calculateurs, pages hub (vague 1), pages article-like (vague 3), pages detail (vague 4), pages utilitaires (vague 5), formulaires et builders",
          textEn: "Editorial header propagated across the whole app in 6 waves: calculator pages, hub pages (wave 1), article-like pages (wave 3), detail pages (wave 4), utility pages (wave 5), forms/builders",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Fiche seance refondue avec divulgation progressive : ton editorial, moins de bruit visuel",
          textEn: "Workout detail page refactored with progressive disclosure (editorial tone, less visual noise)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Passe couleur sur la home : hero plus marque, cards signalees par accents, bordures decoratives supprimees",
          textEn: "Home colour pass: punchier hero, signalled cards, decorative borders removed",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Hub calculateurs regroupe en 3 sections avec layout aere en colonne unique sur mobile",
          textEn: "Calculators hub grouped into 3 sections with an airy single-column layout on mobile",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Atomes de la HomePage extraits et reutilises sur la LibraryPage pour cohesion visuelle",
          textEn: "HomePage atoms extracted and reused on LibraryPage for consistency",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Compaction mobile de la home : §04 et §05 alignes sur le pattern de grille de §06 ; motion subtile, points finaux abandonnes sur les titres, em dashes generalises",
          textEn: "Home mobile compaction: §04/§05 now match the §06 grid pattern; subtle motion polish, trailing periods dropped on section titles, em dashes adopted",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Le compteur de seances sur la page About inclut maintenant les sessions velo et natation (pas seulement le running)",
          textEn: "About workouts count now includes cycling + swimming sessions (not only running)",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Stats live de la page About cablees sur les vrais compteurs du catalogue",
          textEn: "About page live stats wired to the actual catalogue counts",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Layout 3 colonnes du footer ne casse plus sur les ecrans mobiles etroits",
          textEn: "Footer 3-column layout no longer breaks on narrow mobile screens",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.5.4",
    date: "2026-05-11",
    changes: {
      added: [
        {
          text: "Nouvelle categorie 'Trail' avec 10 seances (TRL-001 → TRL-010) basees sur protocoles Koop / Vernillo / Uphill Athlete : sprints en cote, VMA cote, force-endurance, tempo en montee prolongee, descente technique, endurance en montee soutenue, endurance vallonnee, sortie longue trail, back-to-back jour 1 et jour 2",
          textEn: "New 'Trail' category with 10 sessions (TRL-001 → TRL-010) based on Koop / Vernillo / Uphill Athlete protocols: hill sprints, VO2max hills, power hills, sustained tempo climb, controlled downhill, sustained climbing endurance, rolling endurance, specific long run, back-to-back day 1 and 2",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Champs D+, pente et terrain sur les blocs de seance (4 types de terrain : route, sentier roulant, sentier technique, montagne)",
          textEn: "elevationGainM, gradientPercent and terrainType fields on workout blocks (4 terrain types: road, runnable trail, technical trail, mountain)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Mini profil altimetrique SVG sur les fiches seance et les cards Trail avec detection intelligente des oscillations (montee/descente repetees)",
          textEn: "Mini elevation profile SVG on workout detail pages and Trail cards with smart oscillation detection for hill repeats",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Helper workoutMetrics : calcul du D+, D-, pente moyenne, terrain dominant et densite verticale (m/km)",
          textEn: "workoutMetrics helper: computes D+, D-, average gradient, dominant terrain and vertical density (m/km)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Enrichissement D+/pente/terrain sur les 15 seances 'Cotes' et 10 autres seances vallonnees (Endurance vallonnee, Sortie longue trail, Ultra time-on-feet, Tempo vallonne, Allure trail, Seuil vallonne...)",
          textEn: "D+/gradient/terrain backfill on all 15 'Hills' workouts and 10 other hilly endurance workouts (rolling endurance, trail long run, ultra time-on-feet, hilly tempo, trail race pace, hilly threshold...)",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Bandeau Trail sur les fiches seance : D+ total, D- total, densite verticale, pente moyenne, terrain dominant",
          textEn: "Trail stats banner on workout detail pages: total D+, total D-, vertical density, average gradient, dominant terrain",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Badges D+ et terrain sur les cards de la bibliotheque (Grid + Focus), D+ chiffre sur les vues Compact et Liste",
          textEn: "D+ and terrain badges on library cards (Grid + Focus), numeric D+ on Compact and List views",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Generateur de plan : priorite +100 pour les seances 'trail' lors d'une course trail_short / trail / ultra",
          textEn: "Plan generator: +100 priority boost for 'trail' workouts when race is trail_short / trail / ultra",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Quiz 'cotes' inclut maintenant les seances trail (en plus de la categorie hills)",
          textEn: "Quiz 'hills' environment now includes trail workouts in addition to hills category",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Generateur de parcours : detecte category=trail et override surface, terrain et target D+ depuis les metriques de la seance",
          textEn: "Route generator: detects category=trail and overrides surface, terrain preference and elevation target from workout metrics",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Durees explicites parsables ajoutees aux phases de recuperation des seances de cotes et mixtes",
          textEn: "Explicit parsable durations added to recovery phases of hills and mixed workouts",
          category: "Seances",
          categoryEn: "Workouts",
        },
      ],
      fixed: [
        {
          text: "Scroll infini bibliotheque bloque a 24 elements quand le sentinel se monte apres isLoading",
          textEn: "Library infinite scroll stuck at 24 items when sentinel mounts after isLoading",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "D+/km et pente moyenne plus honnetes : prennent en compte tout l'echauffement et le retour au calme (distance estimee via duree × allure de zone)",
          textEn: "D+/km and average gradient more honest: include warmup and cooldown blocks (distance estimated via duration × zone-pace)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "D- (denivele negatif) affiche pour les seances de descente ou oscillantes (cotes avec recuperation en descente)",
          textEn: "D- (elevation loss) displayed for downhill or oscillating sessions (hill repeats with descending recovery)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Bandeau 'Cotes requises' supprime quand les metriques Trail sont visibles (suppression de la redondance)",
          textEn: "'Hills required' environment label removed when trail metrics are displayed (deduplication)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Descentes HIL-015 zonees en Z2 pour distinguer visuellement montees (orange) et descentes (vert) dans la timeline",
          textEn: "HIL-015 descents zoned Z2 (instead of Z3) so SessionTimeline visually distinguishes climbs (orange) from descents (green)",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Recovery 'Remontee trottee souple' de TRL-005 affiche maintenant sa duree explicite (12 min)",
          textEn: "TRL-005 recovery 'Remontee trottee souple' now displays its explicit duration (12 min)",
          category: "Seances",
          categoryEn: "Workouts",
        },
      ],
    },
  },
  {
    version: "0.5.3",
    date: "2026-05-10",
    changes: {
      added: [
        {
          text: "Wizard de plan : sauvegarde automatique du brouillon avec banniere Reprendre / Repartir de zero au reload",
          textEn: "Plan wizard autosave with Resume / Start fresh banner on reload",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Undo/Redo dans l'editeur de seance avec raccourcis Cmd+Z / Shift+Cmd+Z",
          textEn: "Undo/Redo in workout builder with Cmd+Z / Shift+Cmd+Z keyboard shortcuts",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Hooks reutilisables : useZoneColors (multi-discipline), useUndoRedo, usePlanDraft",
          textEn: "Reusable hooks: useZoneColors (multi-discipline), useUndoRedo, usePlanDraft",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Composants ResponsiveTable (table desktop -> cards mobile) et PageContainer pour des layouts coherents",
          textEn: "ResponsiveTable component (desktop table → mobile cards) and PageContainer layout primitive",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Skeletons composites contextuels (WorkoutCard, PlanWeek, Table, Article) avec effet shimmer",
          textEn: "Contextual skeleton composites (WorkoutCard, PlanWeek, Table, Article) with shimmer effect",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Variants d'EmptyState : no-results, not-started, error, offline",
          textEn: "EmptyState variants: no-results, not-started, error, offline",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Breakpoint Tailwind tablet: (900px) et variables CSS pour les zones cycling/swimming + accents par discipline",
          textEn: "Tailwind tablet: breakpoint (900px) plus CSS vars for cycling/swimming zones and discipline accents",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      changed: [
        {
          text: "HomePage : animation des mots accent migree vers framer-motion (rotation plus fluide, suppression du jank setTimeout)",
          textEn: "HomePage hero accent words migrated to framer-motion (smoother rotation, no setTimeout jank)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Recherche /library + /glossary : non-bloquante via useDeferredValue (60 fps en tapant)",
          textEn: "Library and glossary search runs non-blocking via useDeferredValue",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Exports PDF / PNG / FIT / ICS : toast.loading durant la generation",
          textEn: "PDF / PNG / FIT / ICS exports show toast.loading during generation",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Sidebar : 'Creer' -> 'Creer une seance' pour plus de clarte",
          textEn: "Sidebar entry 'Create' → 'Create workout' for clarity",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Touch targets WCAG : boutons icon-* atteignent 44x44 px sur les devices tactiles",
          textEn: "WCAG touch targets: icon buttons reach 44×44 px on coarse-pointer devices",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "index.css scinde en 5 modules focused (tokens / themes / palettes-a11y / animations / overrides)",
          textEn: "index.css split into 5 focused modules (tokens / themes / palettes-a11y / animations / overrides)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Tableaux scrollables : sticky thead; VMA et equivalence affichent des cards sur mobile",
          textEn: "Sticky thead on scrollable tables; VMA and race-equivalence tables render as cards on mobile",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Brouillon de plan ecrase au mount sous React Strict Mode (silent data loss)",
          textEn: "Plan draft was wiped on mount under React Strict Mode (silent data loss)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Couleurs hex cycling/swimming hardcodees migrees vers CSS vars (multisport-ready)",
          textEn: "Hardcoded cycling/swimming hex colors migrated to CSS vars (multisport-ready)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Auto-zoom iOS sur les inputs corrige architecturalement via pointer:coarse",
          textEn: "iOS input auto-zoom mitigated architecturally via pointer:coarse media query",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Logo 'Zoned' visible des la largeur tablette (md:inline) au lieu de >= 1024 px",
          textEn: "'Zoned' logo now visible from tablet width (md:inline) instead of ≥ 1024 px",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Suppression de Header.tsx orphelin (537 lignes, plus aucun importeur)",
          textEn: "Removed orphan Header.tsx (537 lines, no importers)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      performance: [
        {
          text: "Skeletons avec effet shimmer via react-loading-skeleton (~5 kB gz)",
          textEn: "Shimmer skeletons via react-loading-skeleton (~5 kB gz)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Pas de regression LCP : /library a 1572 ms, CLS 0.00",
          textEn: "No LCP regression: /library at 1572 ms, CLS 0.00",
          category: "Performance",
          categoryEn: "Performance",
        },
      ],
    },
  },
  {
    version: "0.5.2",
    date: "2026-05-10",
    changes: {
      added: [
        {
          text: "Hub nutrition sur /nutrition avec 14 sections vulgarisees (ratio 1:0.8, proteines 1,8 g/kg, supplements classes AIS A-D, crampes, chaleur, coureuses, 10 idees recues, FAQ)",
          textEn: "Nutrition hub at /nutrition with 14 beginner-friendly sections (1:0.8 carb ratio, protein 1.8 g/kg, AIS-classified supplements, cramps science, heat, female runners, 10 debunked myths, FAQ)",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "17 supplements classes selon le framework de l'Institut Australien du Sport (niveaux A a D) avec dose, timing et explication",
          textEn: "17 supplements ranked by Australian Institute of Sport framework (A through D) with dose, timing and rationale",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "10 idees recues demontees dans un accordeon interactif (fenetre 30 min, ratio 4:1, magnesium-crampes, cafe deshydrate, etc.)",
          textEn: "10 false beliefs dismantled in an interactive accordion (30-min window, 4:1 ratio, magnesium for cramps, coffee dehydrates, etc.)",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Entree 'Nutrition' dans la sidebar Apprendre, entre Articles et Glossaire",
          textEn: "'Nutrition' sidebar entry under Learn, between Articles and Glossary",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Nouveaux composants visuels : RatioGauge, MythBuster, ProteinTimingChart, GutTrainingTimeline, SupplementGrid avec badges AIS, CrampsScience, WomenInsightGrid, HeatGrid",
          textEn: "New visual primitives: RatioGauge, MythBuster, ProteinTimingChart, GutTrainingTimeline, SupplementGrid with AIS badges, CrampsScience, WomenInsightGrid, HeatGrid",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Recommandations proteines mises a jour : 1,4-2,2 g/kg/jour selon le volume d'entrainement (Witard 2025, Sports Medicine), anciennement 1,2-1,8",
          textEn: "Protein recommendations updated: 1.4-2.2 g/kg/day based on training volume (Witard 2025, Sports Medicine), previously 1.2-1.8",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Ratio glucose:fructose modernise : 1:0.8 au-dela de 60 g/h (Rowlands 2020), anciennement 2:1",
          textEn: "Glucose:fructose ratio modernized: 1:0.8 above 60 g/h (Rowlands 2020), previously 2:1",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Charge glucidique : 36-48 h a 10-12 g/kg (protocole moderne), la methode 3 jours est obsolete",
          textEn: "Carb loading: 36-48 h at 10-12 g/kg (modern protocol), 3-day method obsolete",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Demythification de la fenetre 30 min post-effort dans le calculator et le guide : vraie fenetre 4-6 h glycogene / 24-48 h proteines",
          textEn: "Post-effort recovery window debunked in calculator and guide: real window is 4-6 h glycogen / 24-48 h protein, not 30 min",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Le ratio 4:1 glucides:proteines en recuperation est un mythe (Margolis 2021) : l'effet apparent vient des calories ajoutees",
          textEn: "4:1 carb:protein recovery ratio noted as myth (Margolis 2021): the apparent benefit comes from added calories",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
      fixed: [
        {
          text: "Calculateur de ravitaillement : nombre de gels desormais realiste via un split 60 % gels / 40 % boisson energetique (avant : 14 gels comptes pour un marathon a 80 g/h, desormais 7)",
          textEn: "Fueling calculator gel count now realistic: split 60% gels / 40% sports drink (previously counted 14 gels for a 3h30 marathon at 80 g/h, now 7)",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Sources mises a jour dans le guide et la FAQ : Rowlands 2020, Witard 2025, Aragon 2013, Margolis 2021, Schwellnus, Paulsen, Trommelen 2023",
          textEn: "Sources updated across guide and FAQ to cite Rowlands 2020, Witard 2025, Aragon 2013, Margolis 2021, Schwellnus, Paulsen, Trommelen 2023",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
    },
  },
  {
    version: "0.5.1",
    date: "2026-05-10",
    changes: {
      added: [
        {
          text: "Editeur de trace en ligne : waypoints draggables, clic pour inserer/supprimer, poignees plus denses et marqueurs distincts depart/arrivee pour aller-retour vs boucle",
          textEn: "On-line trace editor: draggable waypoints, click to insert/remove, denser handles and distinct start/end markers for out-and-back vs loop",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Page Track Finder : liste les pistes d'athletisme a proximite et propose un aller-retour, avec boost VMA dans le moteur de recommandation",
          textEn: "Track Finder page: lists nearby athletics tracks and routes a there-and-back leg, with VMA-aware boost in the recommendation engine",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Affordances carte : chevrons de direction, clic pour choisir le point de depart, cap boussole, expand et reverse",
          textEn: "Map editing affordances: direction chevrons, click-to-pick start, compass bearing, expand and reverse",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Cible de denivele avec moteur de recommandation par discipline et pistes d'athletisme comme POI pour les seances VO2max/VMA",
          textEn: "Elevation target with discipline-aware recommendation engine and athletics tracks as POI for VO2max/VMA sessions",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Lancement du generateur de parcours depuis une seance planifiee ou un workout, avec le preset discipline pre-rempli",
          textEn: "Launch the route generator from a planned session or workout with the discipline preset already filled",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Spotlight d'actualites swipeable sur la home (tactile + drag souris, strip glissant, pointer events)",
          textEn: "Swipeable news spotlight on the homepage (touch + mouse drag, sliding strip, pointer events)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Section 'Comment ca marche' detaillee sur la page du generateur de parcours",
          textEn: "How-it-works details on the route generator page",
          category: "Contenu",
          categoryEn: "Content",
        },
      ],
      changed: [
        {
          text: "Layout desktop one-page premium pour les parcours (strip Strava-style, details repliables, CTA sticky, toolbar dense), sans scroll, footer masque",
          textEn: "Premium desktop one-page layout for routes (Strava-style strip, collapsible details, sticky CTA, dense top toolbar), no scroll, footer hidden",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "UX mobile reconstruite autour d'une carte persistante avec cartes candidats, top bar slim 3 lignes (chips + adresse + CTA) et search row Strava-style",
          textEn: "Mobile UX rebuilt around a map-first persistent card with candidate cards, slim 3-row top bar (chips + address + CTA) and Strava-style search row",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Estimation de duree par discipline a la place du total Brouter, avec un cap a 200 km en cyclisme",
          textEn: "Discipline-aware duration estimate replaces Brouter total-time, with a 200 km cap on cycling",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Chip de distance unique, action bar separee, stats h3, tooltip d'altitude et sous-items dans la sidebar du generateur",
          textEn: "Single distance chip, action bar split, h3 stats, elevation tooltip and sidebar sub-items in the route generator UI",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Rejet des trajets traversant la mer et message d'erreur specifique quand Brouter renvoie 400 sur un waypoint inaccessible",
          textEn: "Reject sea-bound legs and surface a specific error when Brouter returns 400 on an unreachable waypoint",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Restauration du sizing des tuiles Leaflet sous le preflight Tailwind v4",
          textEn: "Restore Leaflet tile sizing under Tailwind v4 preflight",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Anti-zoom iOS renforce sur les formulaires mobiles, dropdown d'adresse remontee au-dessus de la carte",
          textEn: "iOS input zoom hardened across mobile route forms; address dropdown lifted above the map",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Distance preset exacte au tap pour que 21.1 km et 42.2 km restent marques actifs",
          textEn: "Exact preset distance on tap so 21.1 km and 42.2 km stay marked active",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Select-all au focus sur les inputs distance et denivele",
          textEn: "Select-all on focus for distance and elevation inputs",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Profil d'altitude reste proportionnel via aspect-ratio CSS au lieu de s'etirer plat sur les containers larges",
          textEn: "Elevation chart stays proportional via CSS aspect-ratio instead of stretching flat on wide containers",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Cles i18n manquantes sur la page about et view.findWeekRoute",
          textEn: "Missing i18n keys on the about page and view.findWeekRoute",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Icone velo coherent pour les onglets et slides cyclisme, routage du filtre ?type= corrige",
          textEn: "Bike icon used consistently for cycling tabs and slides; ?type= filter routing fixed",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      performance: [
        {
          text: "Parallelisation des candidats avec timeout/retry Brouter et validation runtime, debounce du re-routage au drag (123 s -> 10 s)",
          textEn: "Parallelize route candidates with Brouter timeout/retry and runtime validation; debounce drag re-route (123 s -> 10 s)",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Cache LRU Brouter et dedup Overpass avec persistance idb-keyval (TTL 7 jours)",
          textEn: "Brouter LRU cache and Overpass dedup with idb-keyval persistence (TTL 7 days)",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Stockage des parcours migre vers IndexedDB, colonne carte desktop bornee au viewport",
          textEn: "Routes storage migrated to IndexedDB; desktop map column capped to viewport",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Extraction des helpers convergence/PRNG/scoring et hook useRouteEditor (RouteGeneratorPage 1100 -> 952, recommendation 669 -> 560)",
          textEn: "Extract convergence/PRNG/scoring helpers and useRouteEditor hook (RouteGeneratorPage 1100 -> 952, recommendation 669 -> 560)",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
    },
  },
  {
    version: "0.5.0",
    date: "2026-05-06",
    changes: {
      added: [
        {
          text: "Generateur de parcours : creez une boucle ou un aller-retour reel depuis votre position avec routage Brouter, export GPX et sauvegarde locale",
          textEn: "Route Generator: build a real-world loop or out-and-back from your position with Brouter routing, GPX export and local save",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Routage POI-aware : waypoints choisis depuis les parcs, promenades, voies vertes, plages et sentiers via Overpass (fallback triangulation en zone rurale)",
          textEn: "POI-aware routing: waypoints picked from parks, promenades, greenways, beaches and trails via Overpass (triangulation fallback for rural areas)",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "3 propositions de parcours par generation avec markers POI nommes et profil altimetrique",
          textEn: "3 route candidates per request with named POI markers and elevation profile",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Toggle 'Activer le generateur de parcours' dans les Reglages pour ne plus envoyer aucune coordonnee a un service tiers",
          textEn: "Privacy toggle in Settings to opt-out of the route generator entirely",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Fondation multi-discipline : seances cyclisme et natation, zones FTP/CSS et substitution inter-discipline dans les plans",
          textEn: "Multi-discipline foundation: cycling and swimming workouts, FTP/CSS zones and cross-discipline substitution in plans",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "10 seances cyclisme et 10 seances natation : endurance longue, sweet spot, seuil, intervalles, technique et pyramides",
          textEn: "10 cycling templates and 10 swimming templates spanning long endurance, sweet spot, threshold, intervals, technique work and pyramids",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Pages de test guidees FTP et CSS avec apercu des zones Coggan / CSS",
          textEn: "FTP and CSS guided test pages with Coggan / CSS zone previews",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Onglet velotaf dans le profil pour declarer ses kilometres de domicile-travail",
          textEn: "Vélotaf settings tab in profile for commute kilometres",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
      ],
      changed: [
        {
          text: "Multi-trace overlay : les 3 candidats s'affichent dans des couleurs et motifs distincts pour rester lisibles quand les traces se chevauchent",
          textEn: "Multi-trace overlay: candidates render in distinct colours and dash patterns to stay distinguishable when tracks overlap",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Tri des propositions par precision de distance (meilleure correspondance en premier), rejet automatique des candidats > 20% hors cible",
          textEn: "Candidates sorted by distance accuracy (best match first); off-target results (>20%) are rejected",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Filtres discipline dans la bibliotheque qui passent a la ligne sur mobile au lieu de defiler horizontalement",
          textEn: "Discipline filter tabs in library wrap on mobile to avoid horizontal scroll",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Propositions de parcours qui tombaient toutes sur les memes waypoints, diversification par seed pour garantir des tracés distincts",
          textEn: "Route candidates were falling on the same waypoints, seed-driven diversification now ensures distinct proposals",
          category: "Fonctionnalite",
          categoryEn: "Feature",
        },
        {
          text: "Messages d'erreur clairs quand la geolocalisation est bloquee, refusee ou en timeout",
          textEn: "Geolocation errors surface clear messages when blocked, denied or timed out",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Zones Z>6 clampees a Z6 et allures sport-specifiques pour les segments distance-only",
          textEn: "Z>6 zones clamp to Z6 and use sport-specific paces for distance-only segments",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Substitution de seance preserve la discipline a travers le round-trip localStorage",
          textEn: "Substitute session preserves discipline through localStorage round-trip",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
    },
  },
  {
    version: "0.4.4",
    date: "2026-04-13",
    changes: {
      added: [
        {
          text: "Objectifs intermediaires dans les plans d'entrainement avec priorite A/B/C et coaching adapte a la distance (#44)",
          textEn: "Intermediate race goals in training plans with priority A/B/C and distance-aware coaching (#44)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Auto-correction des avertissements du plan en un clic (espacement seances, volume, recuperation, affutage)",
          textEn: "One-click auto-fix for plan audit warnings (session spacing, volume, recovery, taper)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Detection de sessions dupliquees sur le meme jour et saut de volume post-recuperation",
          textEn: "Duplicate day session detection and post-recovery volume jump check",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Phases structurees dans le detail des seances (intervalles imbriques)",
          textEn: "Structured workout phases with nested interval details in session view",
          category: "Seances",
          categoryEn: "Workouts",
        },
        {
          text: "Estimation de la duree des courses intermediaires (distance + niveau + penalite trail)",
          textEn: "Race duration estimation for intermediate races (distance + runner level + trail penalty)",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      fixed: [
        {
          text: "Faux positifs dans l'audit de coherence (sessions de course comptees comme seances cles)",
          textEn: "False positives in plan audit (race sessions counted as key sessions)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Volume de recuperation affiche a 65% fixe au lieu du ratio reel vs peak",
          textEn: "Recovery week volumePercent showing fixed 65% instead of actual ratio to peak",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Seuil de volume jump trop strict (arrondi, plans a faible volume)",
          textEn: "Volume jump threshold too strict (rounding artifacts, low-volume plans)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Kilometrages hebdomadaires non arrondis dans les statistiques",
          textEn: "Weekly km not rounded in stats chart",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Emoji remplaces par des icones dans le panneau de coherence",
          textEn: "Emoji replaced with colored dot icons in audit panel",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.4.3",
    date: "2026-04-12",
    changes: {
      added: [
        {
          text: "Plans libres guidés avec checklist par phase, conseils contextuels et navigation entre semaines sur toutes les vues",
          textEn: "Guided free plans with phase-aware checklist, contextual tips, and week navigation across all views",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Page profil coureur unifiée avec historique d'entraînement, records personnels et aperçu forme",
          textEn: "Runner profile page with unified training history, personal records, and fitness overview",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Sheet de clôture de séance avec 3 choix (comme prévu / modifiée / sautée) et suivi durée/distance/RPE réels",
          textEn: "Session completion sheet with 3 choices (as planned / modified / skipped) and actual duration/distance/RPE tracking",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Indisponibilités (jours bloqués) avec sélecteur de plage de dates et replanification automatique",
          textEn: "Unavailabilities (blocked days) with date range picker and automatic skip-based rescheduling",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Annulation en un clic des changements majeurs du plan via bandeau LastChangePanel et toast",
          textEn: "One-click undo for major plan changes via LastChangePanel banner and toast action",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Moteur d'adaptation multi-semaines avec dialog de prévisualisation et analyse sur 3 semaines glissantes",
          textEn: "Multi-week adaptation engine with preview dialog and 3-week sliding window analysis",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Audit automatique de cohérence du plan avec 8 vérifications (espacement, sauts de volume, intégrité récup/affûtage)",
          textEn: "Automatic plan coherence audit with 8 checks: spacing, volume jumps, recovery/taper integrity",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Recherche insensible aux accents dans la bibliothèque et la palette de commandes",
          textEn: "Accent-insensitive search across library and command palette",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Workouts custom intégrés dans les favoris (ajout, affichage, nettoyage à la suppression)",
          textEn: "Custom workouts fully integrated into favorites (add, display, cleanup on delete)",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "UX PWA : prompt d'installation, indicateur hors ligne, notification de mise à jour",
          textEn: "PWA UX: install prompt, offline indicator, update notification",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Clôture de séance remplacée par un popover ancré (desktop/tablette) et mini sheet compact (mobile) pour une UX moins intrusive",
          textEn: "Session completion replaced with anchored popover (desktop/tablet) and compact bottom sheet (mobile) for less intrusive UX",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Badges RPE et distance masqués sur les cartes de séance mobile pour éviter le débordement",
          textEn: "RPE and distance badges hidden on mobile session cards to prevent overflow",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Les statistiques utilisent la durée/distance réelle quand disponible au lieu des valeurs planifiées",
          textEn: "Stats now use actual duration/distance when available instead of planned values",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Jours bloqués visibles sur toutes les vues (calendrier, semaine, mois, liste) avec fond hachuré",
          textEn: "Blocked days visible across all views (calendar, weekly, monthly, list) with hatched background",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "L'adaptation affiche un dialog de prévisualisation avant application au lieu d'un apply silencieux",
          textEn: "Adaptation shows a preview dialog before applying instead of silent auto-apply",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Blocage de l'ajout/déplacement/drop sur les jours indisponibles sur toutes les vues du plan",
          textEn: "Block add/move/drop on unavailable days across all plan views",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Accents français dans les traductions indisponibilité/replanification",
          textEn: "French accents in unavailability/reschedule translations",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Persistance correcte des indisponibilités après replanification et annulation",
          textEn: "Unavailabilities persisting correctly after rescheduling and undo",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Ordre chronologique de la timeline du simulateur pour les départs très tôt ou tard",
          textEn: "Race simulator timeline order for early morning or late-night race starts",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Affichage et saisie des dates alignés sur la langue de l'app avec DatePicker custom",
          textEn: "Date display and input aligned with app language using custom DatePicker",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.4.2",
    date: "2026-04-11",
    changes: {
      added: [
        {
          text: "Date de début explicite dans la création de plan assisté (Commencer maintenant / Choisir une date), réellement respectée de la génération aux exports",
          textEn: "Explicit start date in assisted plan creation (Start now / Choose a date), properly honored end-to-end from generation to exports",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Backup/restore complet avec choix explicite Fusionner/Remplacer, couvrant les race simulations et les scénarios what-if",
          textEn: "Full backup/restore with explicit Merge/Replace choice, covering race simulations and what-if scenarios",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Récapitulatif des séances non renseignées à la validation d'une semaine, avec choix explicite Marquer comme passées / Laisser non renseignées",
          textEn: "Unresolved sessions recap when validating a week, with explicit Mark as skipped / Leave unresolved choice",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Suppression de la limite de 5 plans et validation d'import renforcée avec bornes de domaine sur le schéma (volume, nombre de semaines)",
          textEn: "Removed the 5-plan cap and tightened import validation with schema domain guards (volume percent, max weeks)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Les stats kilométriques hebdomadaires utilisent en priorité les données les plus fiables (réel > cible > estimation)",
          textEn: "Weekly mileage stats now prefer the most reliable distance data available (actual > target > estimation)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Architecture i18n : migration complète des ternaires isEn vers i18next t()/pickLang, extraction des namespaces homepage, content et calculators, script de vérification de parité FR/EN",
          textEn: "i18n architecture: full migration from isEn ternaries to i18next t()/pickLang, extraction of homepage, content and calculators namespaces, FR/EN parity check script",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
      ],
      fixed: [
        {
          text: "Le générateur de plan assisté respecte désormais la date de début choisie pour calculer le nombre total de semaines (utilisait la date du jour avant)",
          textEn: "The assisted plan generator now respects the chosen start date when computing total weeks (previously used today's date)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Modale de validation de semaine responsive sur mobile/tablette/desktop : les boutons ne débordent plus du cadre sur les écrans étroits ou moyens",
          textEn: "Week validation modal responsive on mobile/tablet/desktop: buttons no longer overflow the container on narrow or medium viewports",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Les séances marquées comme passées ne gonflent plus les stats kilométriques hebdomadaires",
          textEn: "Skipped sessions no longer inflate weekly mileage stats",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Restauration de sauvegarde : rollback atomique en cas d'échec (quota localStorage) au lieu d'un état partiel et d'un toast de succès trompeur",
          textEn: "Backup restore: atomic rollback on failure (e.g. localStorage quota) instead of a partial state and misleading success toast",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Sauvegarde de plan : gestion gracieuse des erreurs de quota localStorage avec toast d'erreur clair au lieu d'un échec silencieux",
          textEn: "Plan save: graceful handling of localStorage quota errors with a clear error toast instead of silent failure",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
    },
  },
  {
    version: "0.4.1",
    date: "2026-04-10",
    changes: {
      added: [
        {
          text: "Export PDF professionnel des plans : tableaux compacts 6 colonnes avec zones colorées, appendice dédupliqué avec liens cliquables, bannière titre et métadonnées structurées",
          textEn: "Professional plan PDF export: compact 6-column weekly tables with colored zone cells, deduplication appendix with clickable internal links, dark title banner, and structured metadata",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Affichage de la distance (km) à côté de la durée dans les séances de plan",
          textEn: "Display distance (km) alongside duration in plan sessions",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      changed: [
        {
          text: "Format de durée h:mm (ex: 1h59) pour les valeurs >= 60 minutes dans toute l'application",
          textEn: "Use h:mm duration format (e.g., 1h59) for values >= 60 minutes across the entire app",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Filtres à puces multi-sélection avec affichage progressif dans la bibliothèque",
          textEn: "Multi-select chip filters with progressive disclosure in library",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Calcul incorrect du volumePercent dans les durées de séances",
          textEn: "Incorrect volumePercent scaling in workout duration calculations",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Ajustement du volume du générateur de plans pour les jours/semaine et réduction du taux de progression",
          textEn: "Plan generator volume adjustment for days/week and reduced progression rate",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Mapping des jours dans l'export ICS et gestion des séances de renforcement",
          textEn: "ICS plan export day mapping and strength session handling",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Bug d'interaction toggle + changement de semaine",
          textEn: "Toggle + week change interaction bug",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Séparateur de sidebar et renommage de la page méthodologie en guide",
          textEn: "Sidebar separator and plan methodology page renamed to guide",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.4.0",
    date: "2026-04-06",
    changes: {
      added: [
        {
          text: "Renforcement musculaire pour coureurs : 46 exercices (5 catégories) avec images, carte musculaire et points clés de forme",
          textEn: "Strength training for runners: 46 exercises (5 categories) with A/B images, muscle maps, and form cues",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "17 séances de renforcement structurées : full body, jambes, core, pliométrie, mobilité et prévention blessures",
          textEn: "17 structured strength sessions: full body, legs, core, plyometrics, mobility, and injury prevention",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Toggle Course / Renforcement / Tout dans la bibliothèque avec filtres adaptatifs par type d'activité",
          textEn: "Running / Strength / All toggle in library with adaptive filters per activity type",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Page de détail des séances de renforcement : timeline musculaire, carte anatomique interactive, images d'exercices, badges d'intensité",
          textEn: "Strength workout detail page: muscle timeline, interactive body map, exercise images, intensity badges",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Intégration du renforcement dans le générateur de plans avec périodisation scientifique (Rønnestad 2014, Beattie 2017)",
          textEn: "Strength integration in plan generator with scientific periodization (Rønnestad 2014, Beattie 2017)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Séances de renforcement dans les 9 plans prêts à l'emploi (143 séances au total)",
          textEn: "Strength sessions added to all 9 prebuilt plans (143 sessions total)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "3 collections de renforcement : Force pour coureurs, Core stability, Prévention blessures",
          textEn: "3 strength collections: Strength for Runners, Core Stability, Injury Prevention",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Section renforcement sur la page d'accueil avec 3 séances en vedette",
          textEn: "Strength section on homepage with 3 featured sessions",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Onglet Renforcement dans le panel d'ajout de séances des plans",
          textEn: "Strength tab in plan workout addition panel",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Modal d'agrandissement des images d'exercices au clic",
          textEn: "Click-to-zoom modal for exercise images",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Correction du loader infini dans les statistiques de plan contenant des séances de renforcement",
          textEn: "Fixed infinite loader in plan stats when plan contains strength sessions",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Correction de la barre de filtre sticky sur la page bibliothèque",
          textEn: "Fixed sticky filter bar on library page",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.3.4",
    date: "2026-04-04",
    changes: {
      added: [
        {
          text: "SEO : données structurées (Organization, FAQPage, HowTo, ExercisePlan), meta descriptions enrichies, BreadcrumbList sur toutes les pages, prerendering nginx pour les bots",
          textEn: "SEO: structured data (Organization, FAQPage, HowTo, ExercisePlan), enriched meta descriptions, BreadcrumbList on all pages, nginx bot prerendering",
          category: "Infrastructure",
          categoryEn: "Infrastructure",
        },
        {
          text: "Mini-timeline sticky sur la page détail de séance : barre compacte avec nom, zone dominante et durée qui suit le scroll",
          textEn: "Sticky mini-timeline on workout detail page: compact zone bar follows scroll with workout name and duration",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Plan prébuilt Reprise après longue pause : 10 semaines de reconstruction progressive après plusieurs mois d'arrêt",
          textEn: "Prebuilt plan \"Return After Long Break\": 10-week progressive plan for returning after months off",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Liens croisés entre contenus : articles, séances et termes glossaire liés sur chaque page détail",
          textEn: "Cross-content links on workout, article, and glossary detail pages",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Recherche unifiée dans la palette de commandes : séances, articles et glossaire avec headers de section",
          textEn: "Unified search in command palette: workouts, articles, and glossary with section headers",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Sparkline de progression des plans : mini-graphique SVG du volume hebdomadaire coloré par phase d'entraînement",
          textEn: "Plan progress sparkline: SVG weekly volume chart colored by training phase on plan cards",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Légende interactive des zones dans le calculateur : accordéon avec sensations, bénéfices et exemples de séances par zone",
          textEn: "Interactive zone legend on calculator: expandable accordion with sensations, benefits, and example workouts per zone",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Fil d'Ariane contextuel sur la page détail de séance avec accent coloré par zone et conscience du parcours",
          textEn: "Contextual breadcrumb trail on workout detail page with zone-colored accent and journey awareness",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Aperçu des cartes : mini-timeline toujours visible sur les cartes de séances",
          textEn: "Card peek preview: always-visible compact session timeline on workout cards",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Feedback RPE post-complétion avec barre dégradée colorée par zones (échelle 1-10)",
          textEn: "Post-completion RPE feedback with zone-colored gradient bar (1-10 scale)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Skeleton loading avec animation shimmer aux couleurs des zones",
          textEn: "Skeleton loading states with zone-shimmer animation",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Empty states animés pour les pages Plans, Favoris et Bibliothèque",
          textEn: "Animated empty states for Plans, Favorites, and Library pages",
          category: "UX",
          categoryEn: "UX",
        },
      ],
    },
  },
  {
    version: "0.3.3",
    date: "2026-04-03",
    changes: {
      added: [
        {
          text: "Page méthodologie des plans : explique les 7 principes scientifiques derrière la génération de plans (périodisation, 80/20, semaines de récupération, progression du volume, sortie longue, types de séances, affûtage)",
          textEn: "Plan methodology page: explains the 7 evidence-based principles behind plan generation (periodization, 80/20, recovery weeks, volume progression, long run, session types, taper)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Simulateur what-if : comparez deux scénarios d'entraînement côte à côte avec volume, répartition des zones et insights qualitatifs",
          textEn: "What-if training scenario simulator: compare two training scenarios side by side with volume, zone distribution, and qualitative insights",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Édition inline du nom de plan et refonte du menu d'export (#39)",
          textEn: "Inline plan name editing and refactored plan export menu (#39)",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      fixed: [
        {
          text: "La visualisation de la timeline de séance estime correctement la durée des blocs basés sur la distance (distanceM), corrigeant 69 blocs dans 6 fichiers de séances",
          textEn: "Session timeline visualization now correctly estimates duration from distance-based blocks (distanceM), fixing 69 blocks across 6 workout files",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Normalisation de la date de début de plan au lundi dans getCurrentWeek",
          textEn: "Normalize plan start date to Monday in getCurrentWeek",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
    },
  },
  {
    version: "0.3.2",
    date: "2026-03-28",
    changes: {
      added: [
        {
          text: "Mode de saisie du temps visé dans la création de plan : basculer entre allure cible (min/km) et temps d'arrivée (H:MM:SS), avec conversion automatique (#29)",
          textEn: "Finish time input mode in plan creation: toggle between target pace and target finish time with automatic conversion (#29)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Descriptions de niveau à travers l'app : chaque niveau (débutant, intermédiaire, avancé, élite) affiche la fréquence et le volume hebdomadaire attendus (#28)",
          textEn: "Level descriptions across the app: each difficulty level now shows concrete frequency and weekly volume expectations (#28)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Bandeau de contexte plan sur la fiche séance : affiche la durée adaptée selon le pourcentage de volume de la semaine (#32)",
          textEn: "Plan context banner on workout detail page: shows scaled duration based on the week's volume percentage (#32)",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      changed: [
        {
          text: "Avertissement de durée de plan redesigné : affiche les risques spécifiques et suggère des alternatives (#27)",
          textEn: "Plan duration warning redesigned: shows specific risks and suggests alternatives (#27)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Section stats renommée : Kilométrage hebdomadaire et Temps d'entraînement hebdomadaire avec sous-titres descriptifs (#30)",
          textEn: "Stats section renamed with descriptive subtitles (#30)",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Le retour depuis une fiche séance revient à la bonne semaine dans la vue plan (#31)",
          textEn: "Navigating back from workout detail now returns to the correct week in weekly plan view (#31)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "La fiche séance affiche la durée adaptée au plan au lieu de la durée de base (#32)",
          textEn: "Workout detail page displays plan-scaled duration instead of base duration (#32)",
          category: "Séances",
          categoryEn: "Workouts",
        },
      ],
    },
  },
  {
    version: "0.3.1",
    date: "2026-03-28",
    changes: {
      added: [
        {
          text: "Section Pourquoi ça marche sur chaque fiche séance : explication physiologique, rôle de chaque zone, adaptations attendues et références scientifiques (Billat, Seiler, Daniels...)",
          textEn: "\"Why it works\" science section on each workout detail page: physiological rationale, zone explanations, expected adaptations and scientific references (Billat, Seiler, Daniels...)",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Conseils d'entraînement déplacés dans la barre latérale pour une meilleure hiérarchie du contenu",
          textEn: "Coaching tips moved to sidebar for better content hierarchy",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Pages de comparaison SEO (Zoned vs Runna, Kiprun Pacer, Campus Coach)",
          textEn: "SEO comparison pages (Zoned vs Runna, Kiprun Pacer, Campus Coach)",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Calculateurs ajoutés dans la navigation header et le menu mobile",
          textEn: "Calculators added to header navigation and mobile menu",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Page bibliothèque : grille responsive, modes compact/focus et filtres rapides",
          textEn: "Library page: responsive grid, compact/focus view modes and quick filters",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Avertissement avant de quitter le workout builder avec des modifications non sauvegardées",
          textEn: "Unsaved changes warning before leaving workout builder",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Amélioration des zones de touch, de la responsivité mobile et de la cohérence des interactions",
          textEn: "Improved touch targets, mobile responsiveness and interaction consistency",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "scaledReps ne s'applique qu'aux blocs avec répétitions, évite l'explosion de durée",
          textEn: "scaledReps only applies to blocks with repetitions, prevents duration explosion",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "Le tap mobile ouvre correctement le menu contextuel, correction de la sélection de texte au long-press, RPE visible en vue semaine",
          textEn: "Mobile tap opens context menu correctly, prevented text selection on long-press, show RPE in weekly view",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
    },
  },
  {
    version: "0.3.0",
    date: "2026-03-26",
    changes: {
      added: [
        {
          text: "4 modes de vue pour les plans : Calendrier (table complète), Semaine (agenda navigable), Mois (calendrier mensuel avec dates réelles) et Liste",
          textEn: "4 plan view modes: Calendar (full table), Weekly (navigable agenda), Monthly (real-date calendar) and List",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Vue Semaine : agenda navigable semaine par semaine avec grille 7 colonnes sur desktop et 4+3 sur mobile, drag-and-drop et context menu",
          textEn: "Weekly view: navigable week-by-week agenda with 7-column grid on desktop and 4+3 on mobile, drag-and-drop and context menu",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Vue Mois : même rendu que le calendrier complet mais filtré par mois avec navigation, jours hors-mois grisés",
          textEn: "Monthly view: same rendering as full calendar but filtered by month with navigation, out-of-month days grayed out",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Numéros de jours et marqueur de mois inline dans les cellules du calendrier avec mise en évidence du jour actuel",
          textEn: "Day-of-month numbers and inline month marker in calendar cells with current day highlighting",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Générateur de plan v2 : moteur d'allures basé sur Daniels, progression sortie longue Pfitzinger, taper exponentiel Mujika",
          textEn: "Plan generator v2: Daniels-based pace engine, Pfitzinger long run progression, Mujika exponential taper model",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Suivi de complétion des séances : cycle planned/completed/skipped avec saisie RPE, validation de semaine et adaptation automatique du volume",
          textEn: "Session completion tracking: planned/completed/skipped cycle with RPE input, week validation and automatic volume adaptation",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "5 nouveaux plans pré-construits : 5K débutant, 5K intermédiaire, 10K débutant, 10K intermédiaire, retour de blessure",
          textEn: "5 new prebuilt plans: 5K beginner, 5K intermediate, 10K beginner, 10K intermediate, return from injury",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Plans non-course : construction de base, retour de blessure et démarrage débutant avec objectifs adaptés",
          textEn: "Non-race plans: base building, return from injury and beginner start with adapted goals",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Statistiques enrichies : distance hebdomadaire, répartition easy/hard 80/20, charge d'entraînement, progression sortie longue, taux de complétion",
          textEn: "Enhanced statistics: weekly distance chart, 80/20 easy/hard split, training load, long run progression, completion rate",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Annotations d'allure (paceNotes) sur chaque séance avec zones Daniels et plages min/max en min/km",
          textEn: "Pace annotations (paceNotes) on each session with Daniels zones and min/max ranges in min/km",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Scaling progressif (intensityType, weeklyFrequencyMax, minimumRecoveryDays) sur les 200 séances d'entraînement",
          textEn: "Progressive scaling (intensityType, weeklyFrequencyMax, minimumRecoveryDays) across all 200 workout templates",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
      ],
      changed: [
        {
          text: "Wizard de création de plan repensé avec étapes dynamiques selon l'objectif (course, base, blessure, débutant)",
          textEn: "Plan creation wizard redesigned with dynamic steps based on goal (race, base building, injury return, beginner)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Plans pré-construits marathon, semi-marathon et base building enrichis avec allures, load scores et distances cibles",
          textEn: "Marathon, half-marathon and base building prebuilt plans enriched with paces, load scores and distance targets",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Optimisation des performances : memo() sur les composants lourds, thème géré par ref + custom event",
          textEn: "Performance optimization: memo() on heavy components, theme managed via ref + custom event",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Le sélecteur de vue est persisté en localStorage et adapté au responsive (Calendrier et Mois desktop uniquement)",
          textEn: "View mode selector persisted in localStorage and responsive-aware (Calendar and Monthly desktop only)",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      fixed: [
        {
          text: "Correction des sessionType invalides dans les données (vma, mixed, hills, race_pace)",
          textEn: "Fixed invalid sessionType values in workout data (vma, mixed, hills, race_pace)",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Le kilométrage hebdomadaire se met désormais à jour dynamiquement à l'ajout, suppression ou déplacement de séances",
          textEn: "Weekly km now updates dynamically when sessions are added, deleted or moved",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Correction de l'ancrage des dates : les jours du calendrier sont alignés sur le lundi de la semaine de début du plan",
          textEn: "Fixed date anchoring: calendar days now align to the Monday of the plan start week",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
    },
  },
  {
    version: "0.2.3",
    date: "2026-03-22",
    changes: {
      added: [
        {
          text: "Simulateur jour de course : distance, temps cible et heure de départ pour un plan complet (réveil, petit-déjeuner, échauffement, allure km par km, nutrition, checklists) avec export PDF",
          textEn: "Race day simulator: enter distance, target time and start time to get a complete race day plan (wake-up, breakfast, warmup, km-by-km pacing, nutrition, checklists) with PDF export",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Onboarding mobile repensé : carte inline au lieu de bulles positionnées, indices contextuels à la première visite de la bibliothèque, du calendrier de plan et de l'éditeur de séances",
          textEn: "Mobile onboarding reworked: inline card replaces broken positioned bubbles, contextual toast hints on first visit to library, plan calendar and workout builder",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Appui long (mobile) et clic droit (desktop) sur les séances du calendrier de plan : menu contextuel Voir la séance et Supprimer avec vibration haptique",
          textEn: "Long press (mobile) and right-click (desktop) context menu on plan calendar sessions with 'View session' and 'Delete' actions, haptic vibration on mobile",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Termes du glossaire auto-liés (cliquables) dans la page méthodologie et les recommandations nutritionnelles",
          textEn: "Glossary terms auto-linked (clickable) in methodology page and nutrition recommendation sections",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Bouton de suppression avec dialogue de confirmation dans la liste des séances de l'éditeur",
          textEn: "Delete button with confirmation dialog on workout list view in builder",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Import/export de séances personnalisées en JSON, bouton Créer renommé pour plus de clarté",
          textEn: "Import/export custom workouts as JSON files, 'Create' button renamed for clarity",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Rechargement automatique de l'app lors d'une mise à jour du service worker PWA",
          textEn: "App automatically reloads when a new version is available (PWA service worker update)",
          category: "Performance",
          categoryEn: "Performance",
        },
      ],
      changed: [
        {
          text: "Navigation latérale réorganisée en groupes orientés tâches : Découvrir, Entraînement, Séances, Plan",
          textEn: "Sidebar navigation restructured into task-oriented groups: Discover, Training, Sessions, Plan",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Section récupération ouverte par défaut dans le simulateur de course",
          textEn: "Recovery section open by default in race simulator",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Taille de l'en-tête de la page favoris alignée avec les autres pages de liste",
          textEn: "Favorites page header size aligned with other listing pages",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Amélioration de la qualité des exports PDF et ICS des plans",
          textEn: "Improved plan PDF and ICS export quality",
          category: "Bug",
          categoryEn: "Bug",
        },
      ],
    },
  },
  {
    version: "0.2.2",
    date: "2026-03-20",
    changes: {
      added: [
        {
          text: "Export et import de données : sauvegardez tous vos favoris, plans et paramètres en JSON, restaurez depuis un fichier",
          textEn: "Data export and import: backup all your data (favorites, plans, settings) as JSON, restore from backup file",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Avertissement de persistance : dialogue explicatif lors de la première sauvegarde de favori ou de plan",
          textEn: "Storage persistence warning: first-time dialog when saving favorites or plans explaining local-only storage",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Positionnement vie privée : badges sur la page d'accueil, mention dans le footer, section dédiée dans les paramètres",
          textEn: "Privacy positioning: visible badges on homepage hero, privacy note in footer, and privacy section in settings",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Bouton de soutien Ko-fi dans le footer et la page À propos",
          textEn: "Ko-fi support link in footer and about page",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "SEO : contenu textuel et JSON-LD WebApplication sur les pages Zones et Allures",
          textEn: "SEO: H1 heading, intro text and JSON-LD WebApplication schema on Zones and Pace calculator pages",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "SEO : 53 nouvelles routes dans le sitemap (collections, plans pré-construits, calculateurs), 318 → 371 URLs",
          textEn: "SEO: 53 new routes in sitemap, collections, prebuilt plans, calculators (318 → 371 URLs)",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "SEO : JSON-LD WebApplication sur les 9 pages calculateurs",
          textEn: "SEO: JSON-LD WebApplication schema on all 9 calculator pages",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "SEO : fil d'Ariane JSON-LD sur les pages Article, Collection et Plan pré-construit",
          textEn: "SEO: BreadcrumbList JSON-LD on Article, Collection and Prebuilt Plan detail pages",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "SEO : schema Article enrichi avec auteur, éditeur et dates de publication",
          textEn: "SEO: enriched Article JSON-LD with author, publisher, datePublished and dateModified",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "SEO : image OG par défaut mise à jour (200 séances, 9 calculateurs, No Account Needed)",
          textEn: "SEO: updated default OG image with current stats (200 workouts, 9 calculators, 'No Account Needed')",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "SEO : pré-rendu des pages anglaises et liens hreflang dans le sitemap",
          textEn: "SEO: prerender English pages and hreflang alternate links in sitemap",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "Page À propos repensée avec section personnelle, stats à jour et liens de contact (email, Strava, GitHub)",
          textEn: "About page redesigned with personal section, updated stats and contact links (Strava, GitHub)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Éditeur de séances personnalisées : créez, modifiez, sauvegardez et exportez vos propres séances",
          textEn: "Custom workout builder: create, edit, save and export your own workouts",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Séances personnalisées intégrées dans la bibliothèque, la recherche, les favoris et les plans",
          textEn: "Custom workouts integrated into library, search, favorites and training plans",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Guide de transfert FIT : instructions pas à pas après l'export Garmin, avec détection OS et alternatives non-Garmin",
          textEn: "FIT export guide: step-by-step transfer instructions after Garmin export with OS detection",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Quiz amélioré de 3 à 5 questions : niveau d'expérience et point faible, 6 résultats affichés",
          textEn: "Quiz improved from 3 to 5 questions: experience level and weakness, 6 results shown",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Activités cross-training (renforcement, vélo, natation, yoga, repos) dans le panel d'ajout de séances des plans",
          textEn: "Cross-training activities (strength, cycling, swimming, yoga, rest) available in plan workout panel",
          category: "Fonctionnalité",
          categoryEn: "Feature",
        },
        {
          text: "Onboarding première visite : 3 bulles guidées mettant en avant la bibliothèque, le quiz et les plans",
          textEn: "First-visit onboarding: 3-step guided bubbles highlighting library, quiz, and plans",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "README mis à jour avec 200 séances, nouvelles fonctionnalités et philosophie de confidentialité",
          textEn: "README updated to reflect 200 workouts, new features, and privacy-first philosophy",
          category: "Documentation",
          categoryEn: "Documentation",
        },
      ],
      fixed: [
        {
          text: "Champs de date sur mobile : cibles tactiles de 44px, police text-base pour éviter le zoom iOS, option Commencer maintenant",
          textEn: "Date inputs on mobile: adequate touch targets (44px), text-base font to prevent iOS zoom, 'Start now' option for plan dates",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Filtre de durée étendu à 0-240min pour inclure toutes les séances (les ultra étaient exclues)",
          textEn: "Duration filter range extended to 0-240min to include all workouts (ultra sessions were excluded)",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Éditeur de séances : les boutons exporter et supprimer apparaissent immédiatement après la première sauvegarde",
          textEn: "Workout builder: export and delete buttons now appear immediately after first save",
          category: "Bug",
          categoryEn: "Bug",
        },
      ],
    },
  },
  {
    version: "0.2.1",
    date: "2026-03-19",
    changes: {
      added: [
        {
          text: "Vue calendrier interactive pour les plans d'entraînement avec grille semaine × 7 jours, navigation par semaine sur mobile, et phases colorées",
          textEn: "Interactive calendar view for training plans with week × 7 days grid, mobile week navigation, and colored phases",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Drag & drop natif pour déplacer les séances entre jours (desktop et mobile avec ghost visuel)",
          textEn: "Native drag & drop to move sessions between days (desktop and mobile with visual ghost)",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Panel bibliothèque latéral pour ajouter des séances par drag (desktop/tablette) ou tap (mobile) avec recherche et filtres par catégorie",
          textEn: "Workout library side panel to add sessions via drag (desktop/tablet) or tap (mobile) with search and category filters",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Mode plan libre : créez un plan vierge (nom + nombre de semaines) et placez vos séances manuellement",
          textEn: "Free plan mode: create a blank plan (name + week count) and place workouts manually",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Import/export de plans en JSON pour partager ou sauvegarder ses plans",
          textEn: "Plan import/export as JSON to share or backup your plans",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Suppression de séances depuis les vues calendrier et liste avec bouton corbeille",
          textEn: "Delete sessions from both calendar and list views with trash button",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Boutons \"+\" intégrés dans chaque cellule jour (mobile) et chaque semaine (liste) pour ajouter des séances rapidement",
          textEn: "Inline \"+\" buttons in each day cell (mobile) and each week (list) to quickly add sessions",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Indices contextuels dans le panel bibliothèque : drag, clic ou tap selon le mode d'affichage",
          textEn: "Contextual hints in library panel: drag, click or tap depending on display mode",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "19 nouvelles séances scientifiques pour atteindre 200 au total : Norvégien 4×4 (Helgerud), Tabata, R-Pace (Daniels), CV Tinman, Over/Under, Canova Progressive, Hanson Strength Run, Tempo avec surges, acclimatation chaleur, Train Low, DFA alpha1, durabilité cardiaque, ultra time-on-feet, broken race, Canova extensif, circuit pliométrique, Hudson 1-2-3-2-1, test 3min all-out, test par paliers",
          textEn: "19 new science-based workouts to reach 200 total: Norwegian 4×4 (Helgerud), Tabata, R-Pace (Daniels), CV Tinman, Over/Under, Canova Progressive, Hanson Strength Run, Tempo with surges, heat acclimatization, Train Low, DFA alpha1, cardiac drift durability, ultra time-on-feet, broken race, Canova extensive, plyometric circuit, Hudson 1-2-3-2-1, 3-min all-out test, lactate step test",
          category: "Séances",
          categoryEn: "Workouts",
        },
        {
          text: "2 nouveaux termes au glossaire : Vitesse Critique (CV) et Surge, avec auto-linking dans les descriptions de séances",
          textEn: "2 new glossary terms: Critical Velocity (CV) and Surge, with auto-linking in workout descriptions",
          category: "Glossaire",
          categoryEn: "Glossary",
        },
        {
          text: "8 plans pré-construits prêt-à-l'emploi : 5K débutant/intermédiaire, 10K débutant/intermédiaire, semi-marathon, marathon, construction de base, retour de blessure",
          textEn: "8 pre-built ready-to-use plans: 5K beginner/intermediate, 10K beginner/intermediate, half-marathon, marathon, base building, return from injury",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Dates de début/fin optionnelles sur les plans libres et pré-construits, modifiables à la création et après coup",
          textEn: "Optional start/end dates on free and pre-built plans, editable at creation and afterwards",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Section statistiques enrichie avec 8 métriques, graphique de volume par semaine, distribution par zone (Z1-Z6), répartition des systèmes ciblés, et accordéon repliable",
          textEn: "Enhanced statistics section with 8 metrics, weekly volume chart, zone distribution (Z1-Z6), target system breakdown, and collapsible accordion",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Filtre favoris dans le panel bibliothèque des plans avec message d'état vide adapté",
          textEn: "Favorites filter in plan workout library panel with adapted empty state message",
          category: "Plans",
          categoryEn: "Plans",
        },
        {
          text: "Phases d'entraînement et semaines de récupération dans les plans libres (Base, Build, Peak, Taper)",
          textEn: "Training phases and recovery weeks in free plans (Base, Build, Peak, Taper)",
          category: "Plans",
          categoryEn: "Plans",
        },
      ],
      changed: [
        {
          text: "Quiz et création de plan refactorés en étapes plein écran (une question par vue, pas de scroll sur mobile)",
          textEn: "Quiz and plan creation refactored to full-viewport steps (one question per view, no scrolling on mobile)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Bouton supprimer le plan remplacé par un menu d'actions (export JSON + supprimer)",
          textEn: "Delete plan button replaced by action menu (export JSON + delete)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Espacement des sections de la page d'accueil réduit pour un meilleur rythme visuel",
          textEn: "Homepage section spacing reduced for better visual rhythm",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Préchargement des pages du sidebar en arrière-plan pour une navigation instantanée",
          textEn: "Background preloading of sidebar pages for instant navigation",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Indicateur de limite de 5 plans avec masquage des boutons de création quand la limite est atteinte",
          textEn: "5-plan limit indicator with hidden creation buttons when limit is reached",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Compatibilité dark mode : couleurs de la timeline, segments sans zone, et sessions de récupération",
          textEn: "Dark mode compatibility: timeline colors, segments without zones, and recovery sessions",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Flash de navigation mobile éliminé en différant la fermeture du sidebar après le rendu de la page",
          textEn: "Mobile navigation flash eliminated by deferring sidebar close to after page render",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Correction de l'index de session en vue liste triée (supprimer/remplacer ciblait le mauvais élément)",
          textEn: "Fixed session index in sorted list view (delete/replace targeted the wrong element)",
          category: "Bug",
          categoryEn: "Bug",
        },
      ],
    },
  },
  {
    version: "0.2.0",
    date: "2026-03-19",
    changes: {
      added: [
        {
          text: "Page Méthodologie : fondements scientifiques du système 6 zones avec 8 chercheurs, 6 études (liens PubMed), livres, blogs et podcasts de référence",
          textEn: "Methodology page: scientific foundations of the 6-zone system with 8 researchers, 6 studies (PubMed links), reference books, blogs and podcasts",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Nouveau design éditorial inspiré de Google Stitch : page d'accueil avec hero asymétrique, stats en bento grid, cartes avec border-top coloré par zone",
          textEn: "New editorial design inspired by Google Stitch: homepage with asymmetric hero, bento grid stats, cards with zone-colored top border",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Page détail de séance : header bento avec grille de métriques (durée, difficulté, système cible, environnement), boutons d'export proéminents, favori en haut à droite",
          textEn: "Workout detail page: bento header with metrics grid (duration, difficulty, target system, environment), prominent export buttons, favorite in top right",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Séance du jour repensée : layout bento avec durée en grand, conseils du coach dans la colonne droite, card entièrement cliquable",
          textEn: "Redesigned Workout of the Day: bento layout with large duration, coaching tips in right column, fully clickable card",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Visualisation de la timeline agrandie (h-40/h-56) avec labels de zone au survol et meilleur contraste des segments",
          textEn: "Enlarged session timeline visualization (h-40/h-56) with zone labels on hover and better segment contrast",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Remplacement du zone-stripe (bande colorée à gauche) par des border-top colorés sur toutes les cartes (séances, collections, articles)",
          textEn: "Replaced zone-stripe (left colored border) with colored top borders on all cards (workouts, collections, articles)",
          category: "Design",
          categoryEn: "Design",
        },
        {
          text: "Responsive mobile : tailles réduites sur mobile pour le hero, les stats, les boutons et la séance du jour",
          textEn: "Mobile responsive: reduced sizes on mobile for hero, stats, buttons and workout of the day",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Suppression de la carte Détails redondante dans le sidebar de la page de séance",
          textEn: "Removed redundant Details card from workout page sidebar",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      fixed: [
        {
          text: "Affichage de la récupération entre les répétitions dans le détail des phases (3x30s, fartlek, etc.) sans redondance avec la description",
          textEn: "Display recovery between repetitions in phase details (3x30s, fartlek, etc.) without redundancy with description",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Indication du repos inter-séries pour les blocs multi-séries (ex: 2x(10x 45s VMA / 15s récup) → ~3 min footing entre les séries)",
          textEn: "Inter-series rest indication for multi-set blocks (e.g. 2x(10x 45s VO2max / 15s recovery) → ~3 min jog between sets)",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Collection Séances mythiques manquante sur la page d'accueil (accent manquant dans le slug)",
          textEn: "Missing 'Mythic Workouts' collection on homepage (missing accent in slug)",
          category: "Bug",
          categoryEn: "Bug",
        },
        {
          text: "Segments sans zone (gammes, transitions) invisibles dans la timeline, couleur de fallback corrigée",
          textEn: "Segments without zone (drills, transitions) invisible in timeline, fallback color fixed",
          category: "Bug",
          categoryEn: "Bug",
        },
      ],
    },
  },
  {
    version: "0.1.7",
    date: "2026-03-18",
    changes: {
      added: [
        {
          text: "Auto-liens style Wikipedia : les 200+ termes du glossaire et les 12 articles deviennent cliquables partout dans l'app (séances, articles, guides, glossaire, collections, tips) avec aperçu au survol",
          textEn: "Wikipedia-style auto-linking: all 200+ glossary terms and 12 articles become clickable throughout the entire app (workouts, articles, guides, glossary, collections, tips) with hover previews",
          category: "SEO & UX",
          categoryEn: "SEO & UX",
        },
        {
          text: "Liens automatiques vers les articles d'apprentissage (périodisation, surcompensation, échauffement…) avec aperçu intégré",
          textEn: "Automatic links to learning articles (periodization, supercompensation, warm-up…) with inline preview",
          category: "SEO & UX",
          categoryEn: "SEO & UX",
        },
        {
          text: "Popover d'aperçu unifié desktop et mobile : croix pour fermer, lien vers la page complète",
          textEn: "Unified preview popover for desktop and mobile: close button, link to full page",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Blocs callout dans les 12 articles : conseils, avertissements, points clés et statistiques",
          textEn: "Callout blocks in all 12 articles: tips, warnings, key takeaways and statistics",
          category: "Contenu",
          categoryEn: "Content",
        },
        {
          text: "Barre de progression de lecture et table des matières (sidebar desktop, dropdown mobile) dans les articles",
          textEn: "Reading progress bar and table of contents (desktop sidebar, mobile dropdown) in articles",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Suppression de dangerouslySetInnerHTML dans les articles au profit de composants React sécurisés",
          textEn: "Replaced dangerouslySetInnerHTML in articles with secure React components",
          category: "Sécurité",
          categoryEn: "Security",
        },
      ],
      fixed: [
        {
          text: "Le bouton retour sur les pages glossaire ramène maintenant à la page précédente (et non toujours au glossaire)",
          textEn: "Back button on glossary pages now returns to the previous page (not always to the glossary)",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Zones tactiles des boutons mobile agrandies à 44px (standard Apple HIG) sans débordement visuel",
          textEn: "Mobile button touch targets enlarged to 44px (Apple HIG standard) without visual overflow",
          category: "Accessibilité",
          categoryEn: "Accessibility",
        },
        {
          text: "Correction complète des accents et de l'orthographe française sur l'ensemble de l'application",
          textEn: "Comprehensive French accent and spelling corrections across the entire application",
          category: "i18n",
          categoryEn: "i18n",
        },
        {
          text: "Amélioration du layout footer et sidebar (alignement, responsive)",
          textEn: "Improved footer and sidebar layout (alignment, responsive)",
          category: "UI",
          categoryEn: "UI",
        },
      ],
    },
  },
  {
    version: "0.1.6",
    date: "2026-03-17",
    changes: {
      added: [
        {
          text: "3 nouvelles catégories de glossaire : Biomécanique (12 termes), Blessures & Prévention (10 termes), Nutrition (17 termes)",
          textEn: "3 new glossary categories: Biomechanics (12 terms), Injuries & Prevention (10 terms), Nutrition (17 terms)",
          category: "Glossaire",
          categoryEn: "Glossary",
        },
        {
          text: "39 termes bilingues couvrant la mécanique de foulée, les blessures courantes et la nutrition sportive",
          textEn: "39 bilingual terms covering stride mechanics, common running injuries, and sports nutrition",
          category: "Glossaire",
          categoryEn: "Glossary",
        },
        {
          text: "Page hub /calculators avec 7 outils de calcul pour coureurs",
          textEn: "Calculator hub page /calculators with 7 running calculator tools",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Calculateur d'équivalence de course (prédire ses temps sur différentes distances)",
          textEn: "Race equivalence calculator (predict times across distances)",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Calculateur de performance ajustée à l'âge (comparer ses performances entre différents âges)",
          textEn: "Age-graded performance calculator (compare performances across ages)",
          category: "Calculateurs",
          categoryEn: "Calculators",
        },
        {
          text: "Pré-rendu de 318 pages au build pour les moteurs de recherche (SEO)",
          textEn: "Post-build prerendering of 318 pages for search engine crawlers (SEO)",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "Données structurées JSON-LD enrichies (ExercisePlan, DefinedTerm, BreadcrumbList, WebSite, SearchAction)",
          textEn: "Enriched JSON-LD structured data (ExercisePlan, DefinedTerm, BreadcrumbList, WebSite, SearchAction)",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "Bouton copier le lien sur la page détail d'un entraînement",
          textEn: "Copy link button on workout detail page",
          category: "Fonctionnalités",
          categoryEn: "Features",
        },
      ],
      fixed: [
        {
          text: "Le générateur de sitemap lit maintenant les fichiers glossaire .ts (cherchait des .json, 0 termes trouvés)",
          textEn: "Sitemap generator now correctly reads glossary .ts files (was looking for .json, finding 0 terms)",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "Sitemap étendu de 175 à 318 URLs (ajout des guides, collections, calculateurs et tous les termes glossaire)",
          textEn: "Sitemap expanded from 175 to 318 URLs (added guides, collections, calculators, all glossary terms)",
          category: "SEO",
          categoryEn: "SEO",
        },
        {
          text: "Séance du jour : sélection stable grâce à un seed basé sur un hash (ne change plus quand le catalogue évolue)",
          textEn: "Workout of the day: stable selection with hash-based seed (no longer shifts when catalog changes)",
        },
        {
          text: "Génération de plan : vérification de la limite avant la génération au lieu d'après",
          textEn: "Plan generation: limit check now runs before generation instead of after",
        },
      ],
    },
  },
  {
    version: "0.1.5",
    date: "2026-03-14",
    changes: {
      added: [
        {
          text: "Nouvelle navigation sidebar collapsible style Notion/Linear avec 3 états (expanded, collapsed, mobile sheet)",
          textEn: "New collapsible sidebar navigation Notion/Linear-style with 3 states (expanded, collapsed, mobile sheet)",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Top bar minimaliste avec logo, recherche centrée et actions rapides",
          textEn: "Minimal top bar with logo, centered search and quick actions",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Sidebar avec sections groupées (Entraînement, Découvrir, Outils) et tooltips en mode collapsed",
          textEn: "Sidebar with grouped sections (Training, Discover, Tools) and tooltips in collapsed mode",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Animation fluide de collapse/expand avec transitions CSS unifiées",
          textEn: "Smooth collapse/expand animation with unified CSS transitions",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Persistance de l'état sidebar (collapsed/expanded) dans localStorage",
          textEn: "Sidebar state persistence (collapsed/expanded) in localStorage",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Formulaire de contribution communautaire avec deux modes (idée rapide / séance complète)",
          textEn:
            "Community contribution form with two modes (quick idea / full workout)",
          category: "Contribution",
          categoryEn: "Contribution",
        },
        {
          text: "Wizard 4 étapes pour créer une séance détaillée avec prévisualisation en temps réel",
          textEn:
            "4-step wizard to create a detailed workout with real-time preview",
          category: "Contribution",
          categoryEn: "Contribution",
        },
        {
          text: "Génération automatique d'issues GitHub pré-remplies depuis le formulaire",
          textEn:
            "Automatic generation of pre-filled GitHub issues from the form",
          category: "Contribution",
          categoryEn: "Contribution",
        },
        {
          text: "Templates d'issues GitHub pour les soumissions de séances (idée rapide et détaillée)",
          textEn:
            "GitHub issue templates for workout submissions (quick idea and detailed)",
          category: "Contribution",
          categoryEn: "Contribution",
        },
        {
          text: "Guide de contribution (CONTRIBUTING.md) avec conventions et instructions",
          textEn:
            "Contribution guide (CONTRIBUTING.md) with conventions and instructions",
          category: "Contribution",
          categoryEn: "Contribution",
        },
        {
          text: "17 nouvelles séances scientifiquement fondées (181 au total)",
          textEn: "17 new scientifically-grounded workouts (181 total)",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "4 nouveaux tests d'évaluation : Cooper, Conconi, Yasso 800s, MAF Maffetone",
          textEn:
            "4 new assessment tests: Cooper, Conconi, Yasso 800s, MAF Maffetone",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "5 nouveaux fartleks : kényan 1/1, dégressif, 2/1 longue distance, escalier montant, whistle",
          textEn:
            "5 new fartleks: Kenyan 1/1, descending, long distance 2/1, ascending ladder, whistle",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "4 nouvelles séances de récupération : pieds nus, aqua jogging, mobilité articulaire, régénération nature",
          textEn:
            "4 new recovery sessions: barefoot, aqua jogging, joint mobility, nature regeneration",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "4 nouvelles séances de côtes : sprints explosifs, gradient progressif, rolling hills, technique de descente",
          textEn:
            "4 new hill sessions: explosive sprints, progressive gradient, rolling hills, downhill technique",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "Générateur de plans d'entraînement personnalisés avec wizard multi-étapes, gestion des phases et volume progressif",
          textEn:
            "Personalized training plan generator with multi-step wizard, phase management and progressive volume",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Export des plans d'entraînement en PDF et ICS (calendrier)",
          textEn: "Training plan export to PDF and ICS (calendar)",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "3 guides pratiques bilingues : nutrition du coureur, préparation avant course, et routines d'échauffement",
          textEn:
            "3 bilingual practical guides: runner's nutrition, race preparation, and warm-up routines",
          category: "Guides",
          categoryEn: "Guides",
        },
        {
          text: "Page changelog avec timeline des versions et indicateur 'Quoi de neuf'",
          textEn:
            "Changelog page with version timeline and 'What's New' indicator",
          category: "Fonctionnalités",
          categoryEn: "Features",
        },
        {
          text: "Page 404 personnalisée avec suggestions de navigation",
          textEn: "Custom 404 page with navigation suggestions",
          category: "Fonctionnalités",
          categoryEn: "Features",
        },
        {
          text: "Notifications toast pour les retours d'actions (exports, favoris, etc.)",
          textEn:
            "Toast notifications for action feedback (exports, favorites, etc.)",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Composant Error Boundary pour la gestion gracieuse des erreurs",
          textEn: "Error Boundary component for graceful error handling",
          category: "Fonctionnalités",
          categoryEn: "Features",
        },
        {
          text: "Défilement infini sur la bibliothèque remplaçant le bouton 'Voir plus'",
          textEn:
            "Infinite scroll on library replacing 'Show more' button",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "CTA Plans d'entraînement sur la page d'accueil avec comportement adaptatif",
          textEn:
            "Training plan CTA on homepage with adaptive behavior",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Support trail : short trail (30km), trail (60km), ultra trail (100km) avec entraînement adapté au terrain",
          textEn: "Trail race support: short trail (30km), trail (60km), ultra trail (100km) with terrain-adapted training",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Statistiques du plan : séances totales, heures, moyenne/semaine, séances clés, barre de répartition par type",
          textEn: "Plan statistics overview: total sessions, hours, avg/week, key sessions, session type distribution bar",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Remplacement de séances dans le plan par une autre de la bibliothèque (recherche + filtres par type)",
          textEn: "Swap/replace any session in a plan with another workout from the library (search + type filters)",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Dialog d'export ICS : choix des jours d'entraînement et du jour de sortie longue avant export calendrier",
          textEn: "ICS export dialog: choose your training days and long run day before calendar export",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Export PDF enrichi avec blocs complets (échauffement, corps de séance, retour au calme, conseils coaching)",
          textEn: "Enriched PDF export with full workout blocks (warm-up, main set, cool-down, coaching tips)",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Export ICS enrichi avec détails complets de la séance et conseils coaching",
          textEn: "Enriched ICS export with full session details and coaching tips",
          category: "Export",
          categoryEn: "Export",
        },
        {
          text: "Notes d'allure cible générées pour les séances tempo/seuil/VO2max/sortie longue",
          textEn: "Pace target notes generated for tempo/threshold/VO2max/long run sessions",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Notes d'élévation pour les sorties longues quand la course a du dénivelé",
          textEn: "Elevation notes for long run sessions when race has elevation gain",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Suppression de plans directement depuis la liste avec dialog de confirmation",
          textEn: "Delete plans directly from the plans list page with confirmation dialog",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Indicateur de volume ajusté sur la durée des séances (tooltip explicatif et pourcentage)",
          textEn: "Volume adjustment indicator on session duration (explanatory tooltip and percentage)",
          category: "UX",
          categoryEn: "UX",
        },
      ],
      changed: [
        {
          text: "Design des pages collections unifié avec style plat et minimaliste",
          textEn: "Collections pages unified with flat minimal design",
          category: "UI",
          categoryEn: "UI",
        },
        {
          text: "Imports dynamiques pour toutes les pages (lazy loading)",
          textEn: "Dynamic imports for all pages (lazy loading)",
          category: "Performance",
          categoryEn: "Performance",
        },
        {
          text: "Validation améliorée du calculateur de zones",
          textEn: "Improved zone calculator validation",
          category: "Outils",
          categoryEn: "Tools",
        },
        {
          text: "Pagination ajoutée à la bibliothèque",
          textEn: "Pagination added to library",
          category: "Bibliothèque",
          categoryEn: "Library",
        },
        {
          text: "Suppression des boutons thème/langue de la sidebar (déjà présents dans la top bar)",
          textEn: "Removed theme/language toggles from sidebar (already in top bar)",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Réduction de la taille du logo dans la top bar pour un meilleur équilibre visuel",
          textEn: "Reduced logo size in top bar for better visual balance",
          category: "UX",
          categoryEn: "UX",
        },
        {
          text: "Remplacement de la navigation horizontale par une sidebar verticale responsive",
          textEn: "Replaced horizontal navigation with a responsive vertical sidebar",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Suppression de l'attribution de jour fixe : les coureurs choisissent librement leurs jours d'entraînement",
          textEn: "Removed day-of-week assignment: runners are free to choose their own training days",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Séances affichées par priorité (sortie longue → clé → endurance → récupération) sans labels de jour",
          textEn: "Sessions displayed by priority (long run → key → endurance → recovery) without day labels",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
      ],
      fixed: [
        {
          text: "Centrage de la barre de recherche et du logo dans la top bar (alignement correct sur mobile, tablette et desktop)",
          textEn: "Center search bar and logo in top bar (correct alignment on mobile, tablet and desktop)",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Centrage des icônes dans la sidebar en mode collapsed (suppression du gap fantôme)",
          textEn: "Center icons in collapsed sidebar (removed ghost gap)",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Correction du label \"Base, Base\" dupliqué dans les en-têtes de semaine",
          textEn: "Fixed \"Base, Base\" duplicate label in week headers (phase shown twice)",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Calcul de durée basé sur les blocs réels au lieu des métadonnées typicalDuration inexactes",
          textEn: "Duration calculation now uses actual workout blocks instead of inaccurate typicalDuration metadata",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Les séances trail ne sont plus sélectionnées pour les courses sur route",
          textEn: "Trail workouts no longer selected for road races (even with elevation)",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Réduction du corps de séance proportionnelle au volume de la semaine (échauffement/retour au calme inchangés)",
          textEn: "Main set duration scaled by volume %, warm-up/cool-down kept at full duration",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Meilleure variété dans la sélection des séances faciles/récupération",
          textEn: "Improved variety in easy/recovery session selection",
          category: "Plans d'entraînement",
          categoryEn: "Training Plans",
        },
        {
          text: "Navigation retour contextuelle : retour vers le plan (et non la bibliothèque) quand on vient d'un plan",
          textEn: "Contextual back navigation: returns to plan (not library) when coming from a plan",
          category: "Navigation",
          categoryEn: "Navigation",
        },
        {
          text: "Espacement corrigé dans les séances de la vue hebdomadaire du plan",
          textEn: "Fixed spacing in plan weekly view sessions",
          category: "UI",
          categoryEn: "UI",
        },
      ],
    },
  },
  {
    version: "0.1.4",
    date: "2026-02-13",
    changes: {
      added: [
        {
          text: "12 collections thématiques de séances (débutant, anti-stress, retour de blessure, pré/post-course, objectifs 5K/10K/semi/marathon/ultra, séances légendaires, progression VO2max)",
          textEn:
            "12 curated thematic workout collections (beginner, anti-stress, injury comeback, pre/post-race, 5K/10K/half/marathon/ultra goals, legendary workouts, VO2max progression)",
          category: "Collections",
          categoryEn: "Collections",
        },
        {
          text: "Page de listing des collections avec grille responsive",
          textEn: "Collections listing page with responsive grid layout",
          category: "Collections",
          categoryEn: "Collections",
        },
        {
          text: "Page de détail de collection avec hero en gradient et numérotation des étapes",
          textEn:
            "Collection detail page with gradient hero, step numbering for progression paths",
          category: "Collections",
          categoryEn: "Collections",
        },
        {
          text: "Section collections mises en avant sur la page d'accueil",
          textEn: "Featured collections section on homepage",
          category: "Collections",
          categoryEn: "Collections",
        },
        {
          text: "Lien de navigation dans le header (desktop + mobile)",
          textEn: "Navigation link in header (desktop + mobile)",
          category: "Collections",
          categoryEn: "Collections",
        },
        {
          text: "Support Progressive Web App avec cache hors-ligne via Workbox",
          textEn:
            "Progressive Web App support with offline caching via Workbox",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "Service worker avec stratégie de mise à jour automatique",
          textEn: "Service worker with auto-update strategy",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "Manifeste d'application avec icônes et couleurs du thème",
          textEn: "App manifest with icons and theme colors",
          category: "PWA",
          categoryEn: "PWA",
        },
        {
          text: "Recommandations nutritionnelles dynamiques basées sur la durée et l'intensité",
          textEn:
            "Dynamic nutrition recommendations based on workout duration and intensity",
          category: "Détail séance",
          categoryEn: "Workout Detail",
        },
        {
          text: "Conseils d'hydratation adaptés au type de séance",
          textEn: "Hydration guidelines adapted to session type",
          category: "Détail séance",
          categoryEn: "Workout Detail",
        },
        {
          text: "Recommandations de récupération avec chronologie et conseils",
          textEn: "Recovery recommendations with timeline and tips",
          category: "Détail séance",
          categoryEn: "Workout Detail",
        },
      ],
      changed: [
        {
          text: "Actions du header consolidées avec grille et menu déroulant",
          textEn:
            "Header actions consolidated with grid layout and dropdown menu",
        },
      ],
    },
  },
  {
    version: "0.1.3",
    date: "2026-01-31",
    changes: {
      added: [
        {
          text: "Hub de connaissances avec 12 articles bilingues sur les principes d'entraînement",
          textEn:
            "Knowledge hub with 12 bilingual articles on training principles",
          category: "Contenu éducatif",
          categoryEn: "Educational Content",
        },
        {
          text: "Page glossaire avec 50+ termes et définitions d'entraînement",
          textEn: "Glossary page with 50+ training terms and definitions",
          category: "Contenu éducatif",
          categoryEn: "Educational Content",
        },
        {
          text: "Système de conseils éducatifs avec 69 conseils contextuels (accueil et détails des séances)",
          textEn:
            "Educational tips system with 69 contextual tips (shown on homepage and workout details)",
          category: "Contenu éducatif",
          categoryEn: "Educational Content",
        },
        {
          text: "Nouveaux articles : zones, test VMA, échauffement, récupération, nutrition, FAQ, périodisation, surcompensation, affûtage, entraînement polarisé, surcharge progressive, régularité",
          textEn:
            "New articles: zones, testing-vma, warmup, recovery, nutrition, faq, periodization, supercompensation, tapering, polarized-training, progressive-overload, consistency",
          category: "Contenu éducatif",
          categoryEn: "Educational Content",
        },
        {
          text: "Bouton de séance aléatoire dans le header avec icône de dé",
          textEn: "Random workout button in header with dice icon",
          category: "Séance aléatoire",
          categoryEn: "Random Workout",
        },
        {
          text: "Carte CTA de séance aléatoire sur la page d'accueil",
          textEn: "Random workout CTA card on homepage",
          category: "Séance aléatoire",
          categoryEn: "Random Workout",
        },
        {
          text: "Accès rapide pour découvrir de nouvelles séances",
          textEn: "Quick access to discover new workouts",
          category: "Séance aléatoire",
          categoryEn: "Random Workout",
        },
        {
          text: "Page de paramètres avec préférences de thème et d'unités",
          textEn: "Settings page with theme and unit preferences",
          category: "Paramètres",
          categoryEn: "Settings & Personalization",
        },
        {
          text: "Palettes accessibles pour les daltoniens (deutéranopie, protanopie, tritanopie)",
          textEn:
            "Color blind accessible palettes (deuteranopia, protanopia, tritanopia)",
          category: "Paramètres",
          categoryEn: "Settings & Personalization",
        },
        {
          text: "Conversion d'unités entre métrique (km/h, min/km) et impérial (mph, min/mi)",
          textEn:
            "Unit conversion between metric (km/h, min/km) and imperial (mph, min/mi)",
          category: "Paramètres",
          categoryEn: "Settings & Personalization",
        },
        {
          text: "Calculateurs de pace et de zones avec support des unités",
          textEn: "Pace and zone calculators with unit support",
          category: "Paramètres",
          categoryEn: "Settings & Personalization",
        },
        {
          text: "Sélecteur de mode d'affichage (grille/liste)",
          textEn: "View mode selector (grid/list views)",
          category: "Bibliothèque",
          categoryEn: "Library Enhancements",
        },
        {
          text: "Recherche par palette de commandes avec Cmd+K / Ctrl+K",
          textEn: "Command palette search with Cmd+K / Ctrl+K",
          category: "Bibliothèque",
          categoryEn: "Library Enhancements",
        },
        {
          text: "14 nouvelles séances d'entraînement (150 au total)",
          textEn: "14 new workout sessions (150 total)",
          category: "Bibliothèque",
          categoryEn: "Library Enhancements",
        },
        {
          text: "Bouton de filtre mobile avec badge de filtres actifs",
          textEn: "Mobile filter button with active filter badge",
          category: "Bibliothèque",
          categoryEn: "Library Enhancements",
        },
        {
          text: "Mise en page compacte mobile pour les CTAs de la page d'accueil (Quiz et Aléatoire côté à côté)",
          textEn:
            "Compact mobile layout for homepage CTAs (Quiz and Random side by side)",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Bannière de conseils sans bouton de fermeture (toujours visible)",
          textEn: "Tips banner without dismiss button (always visible)",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Soulignement animé de la navigation",
          textEn: "Animated navigation underline",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Animation de rebond du coeur sur le bouton favori",
          textEn: "Heart bounce animation on favorite button",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Transitions de vue entre les pages",
          textEn: "View transitions between pages",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Header responsive avec point d'arrêt intermédiaire",
          textEn: "Responsive header with intermediate breakpoint",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Modal de détail de zone avec liens cliquables vers les séances",
          textEn: "Zone detail modal with clickable workout links",
          category: "UI/UX",
          categoryEn: "UI/UX Improvements",
        },
        {
          text: "Infrastructure SEO complète avec meta tags",
          textEn: "Comprehensive SEO infrastructure with meta tags",
          category: "SEO & Analytics",
          categoryEn: "SEO & Analytics",
        },
        {
          text: "Données structurées (JSON-LD) pour les séances",
          textEn: "Structured data (JSON-LD) for workouts",
          category: "SEO & Analytics",
          categoryEn: "SEO & Analytics",
        },
        {
          text: "Intégration Vercel Analytics",
          textEn: "Vercel Analytics integration",
          category: "SEO & Analytics",
          categoryEn: "SEO & Analytics",
        },
        {
          text: "Page à propos avec informations du projet",
          textEn: "About page with project information",
          category: "SEO & Analytics",
          categoryEn: "SEO & Analytics",
        },
      ],
      changed: [
        {
          text: "Les CTAs de la page d'accueil utilisent une grille compacte à 2 colonnes sur mobile",
          textEn:
            "Homepage CTAs use compact 2-column grid layout on mobile",
        },
        {
          text: "Remplacement de lucide-react par des icônes SVG inline (65 icônes)",
          textEn: "Replaced lucide-react with inline SVG icons (65 icons)",
        },
        {
          text: "Les couleurs de zone utilisent maintenant des variables CSS pour le théming",
          textEn: "Zone colors now use CSS variables for theming",
        },
        {
          text: "Zones personnalisées affichées sur la page de détail de séance",
          textEn: "Personalized zones displayed on workout detail page",
        },
        {
          text: "Les résultats du quiz s'intègrent aux filtres de la bibliothèque",
          textEn: "Quiz results integrate with library filters",
        },
      ],
      fixed: [
        {
          text: "La détection de langue gère les variantes de locale (en-US, fr-CA)",
          textEn:
            "Language detection handles locale variants (en-US, fr-CA)",
        },
        {
          text: "Les cartes du glossaire se re-rendent au changement de langue",
          textEn: "Glossary cards re-render on language change",
        },
        {
          text: "Le menu mobile se ferme au changement de route",
          textEn: "Mobile menu closes on route change",
        },
        {
          text: "Amélioration du parsing d'intervalles pour l'extraction de la zone de récupération",
          textEn:
            "Interval parsing improved for recovery zone extraction",
        },
        {
          text: "Calculs de durée alignés entre la timeline et les métadonnées",
          textEn:
            "Duration calculations aligned between timeline and metadata",
        },
        {
          text: "L'export PDF utilise un téléchargement blob asynchrone",
          textEn: "PDF export uses async blob download",
        },
        {
          text: "Corrections diverses des arrière-plans de modales/dialogues",
          textEn: "Various modal/dialog background fixes",
        },
        {
          text: "Durée minimale de filtre abaissée à 10 minutes",
          textEn: "Minimum filter duration lowered to 10 minutes",
        },
      ],
      performance: [
        {
          text: "Chargement différé des articles et données du glossaire",
          textEn: "Lazy-load articles and glossary data",
        },
        {
          text: "Découpe du code pour les données de séance par catégorie",
          textEn: "Code-splitting for workout data by category",
        },
        {
          text: "Bundle principal réduit de 1 Mo à 88 Ko gzip",
          textEn: "Main bundle reduced from 1MB to 88KB gzip",
        },
        {
          text: "Élimination du code mort",
          textEn: "Dead code elimination",
        },
      ],
    },
  },
  {
    version: "0.1.2",
    date: "2026-01-26",
    changes: {
      added: [
        {
          text: "Logo du projet avec design pulse intégré dans le header",
          textEn: "Project logo with pulse design integrated in header",
          category: "Branding",
          categoryEn: "Branding",
        },
        {
          text: "Variantes de favicon optimisées (16x16, 32x32, 180x180, 192x192, 512x512)",
          textEn:
            "Optimized favicon variants (16x16, 32x32, 180x180, 192x192, 512x512)",
          category: "Branding",
          categoryEn: "Branding",
        },
        {
          text: "Support d'import SVG pour les assets du logo",
          textEn: "SVG import support for logo assets",
          category: "Branding",
          categoryEn: "Branding",
        },
        {
          text: "Composant d'état vide avec support i18n",
          textEn: "Empty state component with i18n support",
          category: "Composants UI",
          categoryEn: "UI Components",
        },
        {
          text: "Bouton flottant de retour en haut de page",
          textEn: "Scroll-to-top floating button",
          category: "Composants UI",
          categoryEn: "UI Components",
        },
        {
          text: "Indicateur de chargement sur le bouton d'export",
          textEn: "Loading spinner on export button for better feedback",
          category: "Composants UI",
          categoryEn: "UI Components",
        },
        {
          text: "Raccourcis clavier pour la fonctionnalité de recherche",
          textEn: "Keyboard shortcuts for search functionality",
          category: "Accessibilité",
          categoryEn: "Accessibility",
        },
        {
          text: "Attributs ARIA modal au tiroir de filtres pour les lecteurs d'écran",
          textEn:
            "ARIA modal attributes to filter drawer for screen readers",
          category: "Accessibilité",
          categoryEn: "Accessibility",
        },
        {
          text: "Label ARIA sur le champ de recherche pour l'accessibilité",
          textEn: "ARIA label to search input for accessibility",
          category: "Accessibilité",
          categoryEn: "Accessibility",
        },
        {
          text: "Zones tactiles agrandies dans le header mobile pour une interaction facilitée",
          textEn:
            "Increased touch targets in mobile header for easier interaction",
          category: "Accessibilité",
          categoryEn: "Accessibility",
        },
        {
          text: "Système de filtres modal avec actions appliquer/annuler sur mobile",
          textEn:
            "Modal filter system with apply/cancel actions on mobile",
          category: "Expérience mobile",
          categoryEn: "Mobile Experience",
        },
        {
          text: "Barre de recherche déplacée hors du tiroir de filtres pour une meilleure découverte",
          textEn:
            "Search bar moved outside filter drawer for better discoverability",
          category: "Expérience mobile",
          categoryEn: "Mobile Experience",
        },
        {
          text: "Améliorations rapides de l'interface intégrées dans la bibliothèque",
          textEn: "Quick wins UI improvements integrated in library",
          category: "Expérience utilisateur",
          categoryEn: "User Experience",
        },
        {
          text: "Écouteur en temps réel des préférences de thème système",
          textEn: "Real-time system theme preference listener",
          category: "Expérience utilisateur",
          categoryEn: "User Experience",
        },
        {
          text: "Retour automatique en haut de page lors de la navigation",
          textEn: "Automatic scroll to top on page navigation",
          category: "Expérience utilisateur",
          categoryEn: "User Experience",
        },
      ],
      changed: [
        {
          text: "Tiroir de filtre mobile renommé en \"Filtres\" pour plus de clarté",
          textEn:
            'Renamed mobile filter drawer to "Filters" for clarity',
        },
      ],
      fixed: [
        {
          text: "Correction du débordement mobile dans le header du détail de séance",
          textEn:
            "Prevented mobile overflow in workout detail header",
          category: "Mise en page mobile",
          categoryEn: "Mobile Layout",
        },
        {
          text: "Correction du débordement mobile par réorganisation des actions du header",
          textEn:
            "Prevented mobile overflow by reorganizing header actions",
          category: "Mise en page mobile",
          categoryEn: "Mobile Layout",
        },
        {
          text: "Traduction du message d'erreur de séance introuvable",
          textEn: "Translated workout not found error message",
          category: "Internationalisation",
          categoryEn: "Internationalization",
        },
        {
          text: "Ajout des traductions pour les actions du filtre modal (appliquer/annuler)",
          textEn:
            "Added translations for modal filter actions (apply/cancel)",
          category: "Internationalisation",
          categoryEn: "Internationalization",
        },
      ],
    },
  },
  {
    version: "0.1.1",
    date: "2026-01-26",
    changes: {
      added: [
        {
          text: "Export des séances en 4 formats depuis la page de détail",
          textEn: "Export workouts to 4 formats from detail page",
          category: "Système d'export",
          categoryEn: "Export System",
        },
        {
          text: "ICS (Calendrier) : ajouter une séance à Google Calendar, Apple Calendar, Outlook",
          textEn:
            "ICS (Calendar): Add workout to Google Calendar, Apple Calendar, Outlook",
          category: "Système d'export",
          categoryEn: "Export System",
        },
        {
          text: "PNG (Image) : export haute résolution avec la carte complète de séance (nom, description, timeline, zones, blocs)",
          textEn:
            "PNG (Image): High-resolution export with full workout card (name, description, timeline, zones, blocks)",
          category: "Système d'export",
          categoryEn: "Export System",
        },
        {
          text: "PDF (Document) : document imprimable avec structure de séance, conseils et erreurs courantes",
          textEn:
            "PDF (Document): Printable document with workout structure, coaching tips, and common mistakes",
          category: "Système d'export",
          categoryEn: "Export System",
        },
        {
          text: "Garmin FIT : fichier natif pour appareils Garmin avec zones FC et intensité des étapes",
          textEn:
            "Garmin FIT: Native workout file for Garmin devices with HR zones and step intensity",
          category: "Système d'export",
          categoryEn: "Export System",
        },
        {
          text: "Composant de menu déroulant (basé sur Radix)",
          textEn: "Dropdown menu component (Radix-based)",
          category: "Composants UI",
          categoryEn: "UI Components",
        },
        {
          text: "Sélecteur de date/heure pour l'export calendrier",
          textEn: "Date/time picker for calendar export",
          category: "Composants UI",
          categoryEn: "UI Components",
        },
        {
          text: "Carte de séance exportable avec résumé complet",
          textEn: "Exportable workout card with complete workout summary",
          category: "Composants UI",
          categoryEn: "UI Components",
        },
      ],
      changed: [
        {
          text: "Le pied de page affiche maintenant le nombre dynamique de séances et catégories",
          textEn:
            "Footer now displays dynamic workout and category counts",
        },
        {
          text: "Ajout du lien vers le dépôt GitHub dans le pied de page",
          textEn: "Added GitHub repository link in footer",
        },
      ],
    },
  },
  {
    version: "0.1.0",
    date: "2026-01-26",
    changes: {
      added: [
        {
          text: "Projet initial React 19 + Vite + Tailwind 4",
          textEn: "Initial React 19 + Vite + Tailwind 4 project setup",
          category: "Application principale",
          categoryEn: "Core Application",
        },
        {
          text: "Système d'entraînement à 6 zones avec base scientifique (Z1-Z6)",
          textEn:
            "6-zone training system with scientific basis (Z1-Z6)",
          category: "Application principale",
          categoryEn: "Core Application",
        },
        {
          text: "136 modèles de séances répartis en 11 catégories",
          textEn: "136 workout templates across 11 categories",
          category: "Application principale",
          categoryEn: "Core Application",
        },
        {
          text: "Navigation multi-pages : Accueil, Bibliothèque, Détail séance, Paramètres, Favoris",
          textEn:
            "Multi-page routing: Home, Library, Workout Detail, Settings, Favorites",
          category: "Application principale",
          categoryEn: "Core Application",
        },
        {
          text: "Configuration de déploiement Docker",
          textEn: "Docker deployment configuration",
          category: "Application principale",
          categoryEn: "Core Application",
        },
        {
          text: "Catégories : récupération, endurance, tempo, seuil, VMA, sortie longue, côtes, fartlek, allure course, mixte, évaluation",
          textEn:
            "Categories: recovery, endurance, tempo, threshold, VMA, long run, hills, fartlek, race pace, mixed, assessment",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Catégorie évaluation avec test de Cooper, VAMEVAL, demi-Cooper et Léger-Boucher",
          textEn:
            "Assessment category with Cooper test, VAMEVAL, half-Cooper, and Leger-Boucher tests",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Séances de double seuil norvégien",
          textEn: "Norwegian double threshold sessions",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Séances méthode Bangsbo 10-20-30",
          textEn: "Bangsbo 10-20-30 method sessions",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Séances VMA Billat 30/30, SET et NRRs",
          textEn: "Billat 30/30, SET and NRRs VMA sessions",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Séances Yasso 800, Rosario et cutdown",
          textEn: "Yasso 800s, Rosario, and cutdown sessions",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Séances de sortie longue de régénération et yoga-run",
          textEn: "Long regeneration and yoga-run sessions",
          category: "Bibliothèque de séances",
          categoryEn: "Workout Library",
        },
        {
          text: "Timeline interactive montrant la structure de la séance",
          textEn: "Interactive timeline showing workout structure",
          category: "Visualisation",
          categoryEn: "Visualization",
        },
        {
          text: "Affichage de la distribution des zones",
          textEn: "Zone distribution display",
          category: "Visualisation",
          categoryEn: "Visualization",
        },
        {
          text: "Indicateur de barre d'intensité",
          textEn: "Intensity bar indicator",
          category: "Visualisation",
          categoryEn: "Visualization",
        },
        {
          text: "Support des patterns d'intervalles complexes (ex : 2x12x30s)",
          textEn:
            "Support for complex interval patterns (e.g., 2x12x30s)",
          category: "Visualisation",
          categoryEn: "Visualization",
        },
        {
          text: "Calculateur de zones avec entrées FCmax/VMA",
          textEn: "Zone calculator with FCmax/VMA inputs",
          category: "Personnalisation",
          categoryEn: "Personalization",
        },
        {
          text: "Préférences de zones personnelles avec persistence localStorage",
          textEn:
            "Personal zone preferences with localStorage persistence",
          category: "Personnalisation",
          categoryEn: "Personalization",
        },
        {
          text: "Système de favoris avec page /favorites dédiée",
          textEn: "Favorites system with dedicated /favorites page",
          category: "Personnalisation",
          categoryEn: "Personalization",
        },
        {
          text: "Filtres avancés : type de terrain, système cible, favoris uniquement",
          textEn:
            "Advanced filters: terrain type, target system, favorites only",
          category: "Personnalisation",
          categoryEn: "Personalization",
        },
        {
          text: "Quiz de recommandation de séances basé sur les objectifs et contraintes",
          textEn:
            "Workout recommendation quiz based on goals and constraints",
          category: "Découverte",
          categoryEn: "Discovery",
        },
        {
          text: "Calculateur de pace pour les temps cibles",
          textEn: "Pace calculator for target times",
          category: "Découverte",
          categoryEn: "Discovery",
        },
        {
          text: "Séance du jour avec sélection quotidienne déterministe",
          textEn:
            "Workout of the Day with deterministic daily selection",
          category: "Découverte",
          categoryEn: "Discovery",
        },
        {
          text: "Français par défaut avec support complet de l'anglais",
          textEn: "French-first with full English support",
          category: "Internationalisation",
          categoryEn: "Internationalization",
        },
        {
          text: "Tous les blocs de séance traduits dans les deux langues",
          textEn: "All workout blocks translated in both languages",
          category: "Internationalisation",
          categoryEn: "Internationalization",
        },
        {
          text: "Détection de langue via localStorage, navigator ou balise HTML",
          textEn:
            "Language detection via localStorage, navigator, or HTML tag",
          category: "Internationalisation",
          categoryEn: "Internationalization",
        },
        {
          text: "Composants shadcn/ui avec primitives Radix",
          textEn: "shadcn/ui components with Radix primitives",
          category: "UI/UX",
          categoryEn: "UI/UX",
        },
        {
          text: "Icônes Lucide dans toute l'application (remplacement des emojis)",
          textEn: "Lucide icons throughout (replaced emoji icons)",
          category: "UI/UX",
          categoryEn: "UI/UX",
        },
        {
          text: "Composants CategoryIcon pour la catégorisation visuelle",
          textEn: "CategoryIcon components for visual categorization",
          category: "UI/UX",
          categoryEn: "UI/UX",
        },
        {
          text: "Tooltips tactiles pour l'accessibilité mobile",
          textEn: "Tap-to-reveal tooltips for mobile accessibility",
          category: "UI/UX",
          categoryEn: "UI/UX",
        },
      ],
      fixed: [
        {
          text: "Parsing des patterns d'intervalles multi-séries (2x12x30s)",
          textEn: "Multi-set interval pattern parsing (2x12x30s)",
        },
        {
          text: "Résultats de secours du quiz triés par durée la plus proche",
          textEn: "Quiz fallback results sorted by closest duration",
        },
        {
          text: "Affichage du message quand aucune correspondance exacte de durée dans le quiz",
          textEn:
            "Message display when no exact duration match in quiz",
        },
        {
          text: "Estimations de durée utilisant le champ typicalDuration",
          textEn: "Duration estimates using typicalDuration field",
        },
        {
          text: "Titres français dans les traductions de la visualisation",
          textEn: "French titles in visualization translations",
        },
        {
          text: "Mappages de types de catégories (vma -> vma_intervals)",
          textEn: "Category type mappings (vma -> vma_intervals)",
        },
      ],
    },
  },
];

/**
 * La navigation, en donnée pure.
 *
 * Elle vivait dans `TopBar.tsx`, ce qui la rendait inaccessible à un test :
 * importer le composant tire `react-i18next` puis `@/i18n`, dont le
 * `import.meta.glob` n'existe pas hors de Vite. Or c'est précisément cette
 * donnée qu'il faut vérifier, parce que la refonte relègue ~35 destinations
 * hors des portes tout en leur gardant leurs routes : sans garde-fou,
 * reléguer est une machine à orpheliner en silence. Voir
 * `nav-coverage.test.ts`.
 *
 * Aucun import React ici, et c'est la contrainte à tenir. Le seul import est
 * un TYPE des réglages, effacé à la compilation.
 */

import type { ModuleId } from "@/types/settings";

export interface NavChild {
  to: string;
  labelKey: string;
  /** Short caption shown under the label in the dropdown. Optional. */
  descKey?: string;
  /** L'état de navigation que le lien transmet à la route, au sens de
   *  react-router. Seul l'accueil en a besoin, voir `HOME_LINK_STATE`. */
  state?: Record<string, unknown>;
}

/**
 * L'état que porte tout lien interne vers `/`.
 *
 * La racine mène au cockpit dès qu'un plan est en cours (voir `RootPage`
 * dans `App.tsx`) : c'est ce qu'on veut en ouvrant l'app, pas en appuyant
 * sur le logo ou sur Accueil, où l'on demande précisément la landing. Ces
 * liens le disent par cet état, et la racine le lit avant de rediriger. Une
 * arrivée directe, tapée ou suivie depuis le web, n'a pas d'état et garde le
 * comportement d'ouverture.
 */
export const HOME_LINK_STATE = { landing: true } as const;

export interface NavSection {
  /** Stable id, the door's name in the design kit. */
  id: string;
  to: string;
  labelKey: string;
  /** Pathname prefixes that should mark this door as active. */
  prefix: string[];
  children?: NavChild[];
  /** Le module des réglages qui, masqué, retire cette entrée de la
   *  navigation. Les réglages promettent que masquer retire de la nav sans
   *  rien supprimer ; c'est ici que la promesse est tenue. */
  module?: ModuleId;
}

/**
 * Les cinq portes.
 *
 * Il y en a eu cinq, puis quatre avec 14 entrées derrière, puis cinq à
 * nouveau. Une app d'entraînement dont la navigation demande 28 décisions
 * avant la première séance a un problème d'architecture, pas de design. Ce
 * qui est ici, c'est ce que quelqu'un qui s'entraîne ouvre vraiment : le
 * cockpit, le plan, la semaine, les séances, les chiffres.
 *
 * L'ORDRE RACONTE LE PRODUIT, et il a été revu le 18 septembre 2026 : ce que
 * je fais aujourd'hui, ce que j'ai prévu, ce que je peux faire, ce que j'ai
 * mesuré. Le plan passait après les séances, alors qu'il est la fonction
 * centrale de Zoned et ce qui donne un sens à la séance du jour.
 *
 * MES SEMAINES EST UNE PORTE, décidé par le propriétaire le même soir. Elle
 * était une page de Mon plan, parce qu'en stockage une semaine est un plan
 * d'une seule semaine ; mais la personne qui compose des semaines est
 * précisément celle qui n'a pas de plan, donc celle qui n'ouvre pas cette
 * porte. Une taxonomie du système ne fait pas une navigation. La semaine est
 * l'un des deux gestes courts de l'app, et elle se voit au premier niveau.
 *
 * Les ~35 destinations retirées **gardent toutes leur route** : elles restent
 * indexées, prérendues, partageables, et joignables par Cmd+K
 * (`src/data/command-surfaces.ts`), le pied de page et des liens contextuels.
 * Reléguer n'est pas supprimer, et `nav-coverage.test.ts` échoue si l'une
 * d'elles devient joignable de nulle part.
 *
 * Les `children` sont les pages d'une porte. Sur un écran large ils sont le
 * menu déroulant de la barre ; sous 1024px ils ne sont PLUS dans le menu,
 * ils sont sur la page d'accueil de la porte, en rail (`HubNav.tsx`). Une
 * entrée du menu = une destination ; le détail d'une porte vit chez elle.
 *
 * Deux entrées sont là parce qu'elles répondent aux deux seuls moments où
 * l'on ne veut pas décider : tire-moi une séance et ma semaine. Elles
 * étaient au fond d'un menu déroulant.
 */
export const PRIMARY_NAV: NavSection[] = [
  {
    id: "today",
    to: "/today",
    labelKey: "nav.today",
    // Le cockpit est une page : il ne revendique que son propre chemin.
    prefix: [],
  },
  {
    id: "plan",
    to: "/plans",
    labelKey: "nav.myPlan",
    prefix: ["/plan", "/plans"],
    children: [
      { to: "/plans", labelKey: "topnav.plansMine", descKey: "topnav.plansMineDesc" },
      { to: "/plan/new", labelKey: "topnav.plansNew", descKey: "topnav.plansNewDesc" },
      { to: "/plan/new/prebuilt", labelKey: "topnav.plansPrebuilt", descKey: "topnav.plansPrebuiltDesc" },
    ],
  },
  {
    id: "weeks",
    to: "/weeks",
    labelKey: "topnav.weeks",
    /* Sans enfant : la planche des semaines porte elle-même la composition
       et les semaines prêtes à l'emploi, et un menu déroulant d'une seule
       ligne serait une porte qui fait semblant. */
    prefix: ["/weeks"],
  },
  {
    id: "sessions",
    to: "/library",
    labelKey: "nav.sessions",
    prefix: ["/library", "/workout", "/collections", "/favorites"],
    children: [
      { to: "/library", labelKey: "topnav.libraryAll", descKey: "topnav.libraryAllDesc" },
      { to: "/library/draw", labelKey: "topnav.drawSession", descKey: "topnav.drawSessionDesc" },
      { to: "/collections", labelKey: "topnav.collections", descKey: "topnav.collectionsDesc" },
      { to: "/workout/builder", labelKey: "topnav.builder", descKey: "topnav.builderDesc" },
      { to: "/favorites", labelKey: "nav.favorites", descKey: "topnav.favoritesDesc" },
    ],
  },
  {
    id: "numbers",
    to: "/calculators",
    labelKey: "nav.myNumbers",
    /* `/activities` marque cette porte sans y avoir d'entrée : le journal est
       bien un de mes chiffres, mais le budget de la nav est de 18 entrées et
       il tient. Il se joint par le pied de page, par Cmd+K, depuis le cockpit
       et depuis le profil, qui porte déjà le motif de vélotaf. */
    prefix: ["/calculators", "/profile", "/my-zones", "/activities"],
    children: [
      { to: "/calculators", labelKey: "topnav.calculatorsAll", descKey: "topnav.calculatorsAllDesc" },
      { to: "/my-zones", labelKey: "nav.myZones", descKey: "topnav.myZonesDesc" },
      { to: "/profile", labelKey: "nav.profile", descKey: "topnav.profileDesc" },
      { to: "/calculators/zones", labelKey: "topnav.calcZones" },
      { to: "/calculators/vma", labelKey: "topnav.calcVma" },
    ],
  },
];

/**
 * Les outils, sous les portes du menu plein écran.
 *
 * C'est ce qui remplace Le reste, un dépliant de seize lignes dont le nom ne
 * disait rien : un libellé de regroupement n'est pas une destination, et une
 * personne qui ouvre le menu cherche où aller, pas ce qui reste. Deux
 * instruments qu'on n'ouvre pas tous les jours mais qu'on ouvre pour de
 * vrai, chacun une destination directe : simuler sa course, lire ce qui
 * explique l'entraînement.
 *
 * Chacun est un module que les réglages peuvent masquer, d'où le champ
 * `module` : masquer retire la ligne, la route reste (`ModuleGate.tsx`).
 *
 * Ce qui n'est PAS ici, et pourquoi : le générateur de parcours a quitté
 * la nav le 18 septembre 2026 puis l'app le 20, sur décision du
 * propriétaire (8 visiteurs en un mois, aucun retour). Les comparatifs,
 * les nouveautés, la contribution et le dépôt sont des pages du projet, pas
 * de l'entraînement ; elles vivent dans le pied de page, dans la palette et
 * dans le menu de compte du bureau. La liste des écartées de
 * `nav-coverage.test.ts` ne change pas, parce que tout cela garde ces
 * chemins.
 *
 * Comprendre a des enfants comme une porte : la méthodologie, les guides, la
 * nutrition et le lexique sont ses pages, et le rail de `/learn` les montre.
 * Ils étaient six lignes plates du Reste, à la même hauteur que Paramètres.
 */
export const TOOLS_NAV: NavSection[] = [
  {
    id: "raceSim",
    to: "/race-simulator",
    labelKey: "topnav.raceSim",
    prefix: ["/race-simulator"],
    module: "raceSimulator",
  },
  {
    id: "understand",
    to: "/learn",
    labelKey: "nav.understand",
    /* `/plans/methodology` n'est pas ici : il tombe sous Mon plan, qui le
       relie déjà, et deux points vermillon ne diraient plus où l'on est. */
    prefix: ["/learn", "/methodology", "/guides", "/nutrition", "/glossary"],
    module: "learn",
    children: [
      { to: "/learn", labelKey: "topnav.learnArticles", descKey: "topnav.learnArticlesDesc" },
      { to: "/methodology", labelKey: "topnav.methodScience", descKey: "topnav.methodScienceDesc" },
      { to: "/plans/methodology", labelKey: "topnav.methodPlans", descKey: "topnav.methodPlansDesc" },
      { to: "/guides", labelKey: "topnav.learnGuides", descKey: "topnav.learnGuidesDesc" },
      { to: "/nutrition", labelKey: "topnav.learnNutrition", descKey: "topnav.learnNutritionDesc" },
      { to: "/glossary", labelKey: "topnav.learnGlossary", descKey: "topnav.learnGlossaryDesc" },
    ],
  },
];

/**
 * Le sol du menu plein écran, sous le filet : ce qui n'est pas une
 * destination d'entraînement mais qu'on doit pouvoir atteindre sans
 * chercher. Trois lignes, discrètes. La langue et le thème n'y sont plus :
 * la barre du haut les garde sur tous les écrans, et les réglages les
 * portent avec leur nom entier ; les répéter ici au même poids que les
 * portes était le bruit que la relecture du 18 septembre a nommé.
 *
 * L'accueil est ici depuis le 21 septembre 2026 : depuis que la racine mène
 * au cockpit, le logo était le seul chemin vers la landing, et il y
 * échouait aussi. La ligne porte `HOME_LINK_STATE` pour passer la
 * redirection.
 */
export const MENU_FOOT_LINKS: NavChild[] = [
  { to: "/", labelKey: "nav.home", state: HOME_LINK_STATE },
  { to: "/settings", labelKey: "nav.settings" },
  { to: "/about", labelKey: "nav.about" },
];

export function isNavActive(pathname: string, section: NavSection): boolean {
  if (pathname === section.to) return true;
  return section.prefix.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Le pied de page, en donnée pure, pour la même raison.
 *
 * C'est lui qui rattrape les familles sorties des portes, et un robot n'a que
 * ça et le sitemap pour atteindre les hubs. Quatre colonnes : ce qu'on
 * utilise, les outils, ce qui explique, le projet.
 */
export interface FooterLink {
  labelKey: string;
  to?: string;
  href?: string;
}

export const GITHUB_URL = "https://github.com/alarboulletmarin/zoned";

export const FOOTER_GROUPS: { titleKey: string; links: FooterLink[] }[] = [
  {
    titleKey: "homepage:home.footer.groups.product",
    links: [
      { labelKey: "homepage:home.footer.product.library", to: "/library" },
      { labelKey: "homepage:home.footer.product.plans", to: "/plans" },
      { labelKey: "common:topnav.weeks", to: "/weeks" },
      { labelKey: "common:topnav.drawSession", to: "/library/draw" },
      { labelKey: "homepage:home.footer.product.calculators", to: "/calculators" },
      { labelKey: "common:topnav.activities", to: "/activities" },
    ],
  },
  {
    titleKey: "homepage:home.footer.groups.tools",
    links: [
      { labelKey: "common:topnav.plansPrebuilt", to: "/plan/new/prebuilt" },
      { labelKey: "common:topnav.weeksPrebuilt", to: "/weeks/new/prebuilt" },
      { labelKey: "common:topnav.collections", to: "/collections" },
      { labelKey: "common:topnav.raceSim", to: "/race-simulator" },
    ],
  },
  {
    titleKey: "homepage:home.footer.groups.science",
    links: [
      { labelKey: "homepage:home.footer.science.methodology", to: "/methodology" },
      { labelKey: "common:topnav.methodPlans", to: "/plans/methodology" },
      { labelKey: "common:topnav.learnArticles", to: "/learn" },
      { labelKey: "homepage:home.footer.science.guides", to: "/guides" },
      { labelKey: "common:topnav.learnNutrition", to: "/nutrition" },
      { labelKey: "homepage:home.footer.science.glossary", to: "/glossary" },
    ],
  },
  {
    titleKey: "homepage:home.footer.groups.project",
    links: [
      { labelKey: "homepage:home.footer.project.about", to: "/about" },
      { labelKey: "common:compare.title", to: "/compare" },
      { labelKey: "common:nav.contribute", to: "/contribute" },
      { labelKey: "homepage:home.footer.project.changelog", to: "/changelog" },
      { labelKey: "common:nav.settings", to: "/settings" },
      { labelKey: "homepage:home.footer.project.github", href: GITHUB_URL },
    ],
  },
];

/**
 * Une section par son id, portes et outils confondus. Pour les pages
 * d'accueil qui montent leur rail (`HubNav.tsx`) : elles nomment la section
 * qu'elles sont, et la donnée fait le reste. Lever plutôt que rendre
 * `undefined` : un id qui ne résout plus est une faute d'écriture, pas un
 * état.
 */
export function navSection(id: string): NavSection {
  const section = [...PRIMARY_NAV, ...TOOLS_NAV].find((s) => s.id === id);
  if (!section) throw new Error(`navigation: no section "${id}"`);
  return section;
}

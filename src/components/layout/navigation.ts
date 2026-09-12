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
 * Aucun import React ici, et c'est la contrainte à tenir.
 */

export interface NavChild {
  to: string;
  labelKey: string;
  /** Short caption shown under the label in the dropdown. Optional. */
  descKey?: string;
}

export interface NavSection {
  /** Stable id — the door's name in the design kit. */
  id: string;
  to: string;
  labelKey: string;
  /** Pathname prefixes that should mark this door as active. */
  prefix: string[];
  children?: NavChild[];
}

/**
 * Les quatre portes.
 *
 * Il y en avait cinq, et 28 entrées derrière. Une app d'entraînement dont la
 * navigation demande 28 décisions avant la première séance a un problème
 * d'architecture, pas de design. Ce qui reste ici, c'est ce que quelqu'un qui
 * s'entraîne ouvre vraiment : le cockpit, les séances, les plans, les
 * chiffres.
 *
 * Les ~35 destinations retirées **gardent toutes leur route** : elles restent
 * indexées, prérendues, partageables, et joignables par Cmd+K
 * (`src/data/command-surfaces.ts`), le pied de page et des liens contextuels.
 * Reléguer n'est pas supprimer — et `nav-coverage.test.ts` échoue si l'une
 * d'elles devient joignable de nulle part.
 *
 * Deux entrées sont là parce qu'elles répondent aux deux seuls moments où
 * l'on ne veut pas décider : « tire-moi une séance » et « ma semaine ». Elles
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
    id: "plan",
    to: "/plans",
    labelKey: "nav.myPlan",
    prefix: ["/plan", "/plans", "/weeks"],
    children: [
      { to: "/plans", labelKey: "topnav.plansMine", descKey: "topnav.plansMineDesc" },
      { to: "/plan/new", labelKey: "topnav.plansNew", descKey: "topnav.plansNewDesc" },
      { to: "/plan/new/prebuilt", labelKey: "topnav.plansPrebuilt", descKey: "topnav.plansPrebuiltDesc" },
      { to: "/weeks", labelKey: "topnav.weeks", descKey: "topnav.weeksDesc" },
    ],
  },
  {
    id: "numbers",
    to: "/calculators",
    labelKey: "nav.myNumbers",
    prefix: ["/calculators", "/profile", "/my-zones"],
    children: [
      { to: "/calculators", labelKey: "topnav.calculatorsAll", descKey: "topnav.calculatorsAllDesc" },
      { to: "/my-zones", labelKey: "nav.myZones", descKey: "topnav.myZonesDesc" },
      { to: "/profile", labelKey: "nav.profile", descKey: "topnav.profileDesc" },
      { to: "/calculators/zones", labelKey: "topnav.calcZones" },
      { to: "/calculators/vma", labelKey: "topnav.calcVma" },
    ],
  },
];

export function isNavActive(pathname: string, section: NavSection): boolean {
  if (pathname === section.to) return true;
  return section.prefix.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Le pied de page, en donnée pure, pour la même raison.
 *
 * C'est lui qui rattrape les familles sorties des portes — et un robot n'a que
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
    ],
  },
  {
    titleKey: "homepage:home.footer.groups.tools",
    links: [
      { labelKey: "common:topnav.plansPrebuilt", to: "/plan/new/prebuilt" },
      { labelKey: "common:topnav.weeksPrebuilt", to: "/weeks/new/prebuilt" },
      { labelKey: "common:topnav.collections", to: "/collections" },
      { labelKey: "common:topnav.raceSim", to: "/race-simulator" },
      { labelKey: "homepage:home.footer.product.routes", to: "/routes" },
      { labelKey: "common:topnav.tracks", to: "/routes/tracks" },
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

/**
 * Mobile menu, the five doors as a full-screen ink panel.
 *
 * Below 1024px the header has no room for the doors, so navigation becomes one
 * glyph at the START of the header bar, before the wordmark, and a panel that
 * takes the whole screen.
 *
 * Le déclencheur a vécu jusqu'au 13 septembre 2026 en pastille flottante au
 * coin bas-droit, là où le pouce est déjà. Il en est parti, et la raison
 * n'est pas le pouce : un objet FIXE traverse toute l'application. Huit
 * feuilles payaient son encombrement en réserves d'espace, `--fab-clear` en
 * bas et `--fab-w` sur le côté, et chacune était une exception à écrire, à
 * mesurer et à maintenir : le pied de page cédait une colonne, les quatre
 * barres d'action ancrées au sol s'arrêtaient avant lui, le bouton de remontée
 * se décalait, la planche des zones changeait d'ordre et le duo de l'accueil
 * rétrécissait. En haut de la barre, il ne recouvre rien, donc plus personne
 * ne lui doit de place : les huit réserves sont parties avec lui.
 *
 * Ce n'est plus un objet à part, c'est un OUTIL DE LA BARRE : il porte
 * `.zn-topbar__tool`, la même boîte de 44px, le même aplat de papier au
 * survol et le même appui que la recherche, la langue et le thème. La seule
 * chose que ce fichier ajoute est sa PLACE, en tête de la barre plutôt que
 * dans la grappe de droite, parce que c'est la seule convention que tout le
 * monde connaît déjà sur téléphone.
 *
 * Le composant est donc rendu DANS `<TopBar>` et non plus à côté (App.tsx) :
 * le déclencheur doit être un enfant de la barre pour en être un élément
 * flex. Le `<dialog>` qui le suit, lui, monte dans la top layer dès
 * showModal() et ignore le contexte d'empilement de l'en-tête, donc rien
 * n'est perdu à le descendre là.
 *
 * It is a native <dialog> driven by showModal(), not a Radix Sheet: the top
 * layer, the focus trap, Escape and the focus returning to the trigger all come
 * from the platform. The one thing the platform does not give is the scroll
 * lock, so this file writes it.
 *
 * The trigger and the panel live in the same component on purpose, the browser
 * hands focus back to whatever was focused before showModal(), and keeping the
 * two together is what makes that "whatever" be the trigger.
 *
 * ── LA RELECTURE DU 13 SEPTEMBRE 2026, AU SOIR ────────────────────────────
 *
 * Le panneau tenait debout, mais il donnait sa zone de pouce et son seul aplat
 * de couleur à la SORTIE plutôt qu'à la navigation. Cinq points en sont
 * sortis, et chacun a changé quelque chose ici ou dans mobile-menu.css :
 *
 * 1. LES PORTES DESCENDENT. Elles étaient ancrées en haut, la figure occupait
 *    la zone du pouce et ~300px de vide les séparaient. La scène est
 *    maintenant AU-DESSUS des portes : elle prend le vide, qui n'est donc plus
 *    du vide, et les cinq destinations tombent sous le pouce, juste au-dessus
 *    du pied. L'écran se lit fermer, figure, navigation, outils.
 *
 * 2. LA FERMETURE N'EST PLUS UN APLAT VERMILLON. Elle était le seul objet
 *    coloré de l'écran, donc le premier balayé, pour l'action qu'on veut le
 *    moins. Elle passe en contour avec une croix ; le vermillon est réservé au
 *    point de la porte où l'on se trouve. Elle gagne deux sorties de plus, le
 *    glissé vers le bas et l'appui dans la scène, voir plus bas.
 *
 * 3. LA PORTE OÙ L'ON EST SE VOIT. Rien ne la marquait : à chaque ouverture il
 *    fallait reconstruire où l'on est au lieu de le lire. Un point vermillon
 *    la suit, et il est doublé d'`aria-current`, donc l'état n'est pas porté
 *    par la seule couleur.
 *
 * 4. UNE LIGNE, DEUX GESTES, DEUX BOÎTES. Le `<details name="door">` faisait
 *    de la ligne entière un dépliant : la même liste mélangeait des lignes qui
 *    naviguent (Aujourd'hui, sans chevron) et des lignes qui déplient, sans
 *    qu'on sache avant d'appuyer. Le libellé est maintenant un LIEN vers la
 *    page d'accueil de la porte, et le chevron un BOUTON de 44px qui déplie,
 *    à côté. C'est ce qui coûte le contrat natif de `<details>` : l'ouverture
 *    est tenue ici, dans `openDoor`, avec `aria-expanded` et `aria-controls`
 *    écrits à la main. Le marché est explicite, une balise ne sait pas
 *    séparer ses deux zones tactiles, et deux zones valaient mieux que la
 *    gratuité du contrat. L'exclusivité, elle, survit : un seul id tenu, donc
 *    ouvrir une porte referme celle d'avant, comme le faisait le `name`.
 *
 * 5. LE RESTE est le seul libellé qui ne mène nulle part, donc sa ligne reste
 *    un bouton entier. C'est la seule ligne de la liste qui déplie sans
 *    naviguer, et c'est parce qu'elle n'a pas de page.
 *
 * Nothing is lost against the old drawer: the five doors are the screen, and
 * every child page and account page hangs under the door it belongs to, closed
 * until you ask for it. That replaces the flat run of twenty-five mono links
 * that used to sit at the floor of the panel, the routes were all there, but in
 * no order anyone could read.
 */

import type { FunctionComponent, PointerEvent as ReactPointerEvent, SVGProps } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DoorNumbers from "@/assets/doodles/door-numbers.svg?react";
import DoorPlan from "@/assets/doodles/door-plan.svg?react";
import DoorSessions from "@/assets/doodles/door-sessions.svg?react";
import DoorToday from "@/assets/doodles/door-today.svg?react";
import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { ChevronDown, Menu, Search, X } from "@/components/icons";
import { useCommandPalette } from "@/components/search";
import { useScrollLock } from "@/components/ui/native-dialog";
import { Segmented } from "@/components/ui/segmented";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTheme } from "@/hooks/useTheme";
import { changeLanguage, getCurrentLanguage } from "@/i18n";
// Directement depuis la donnée, et pas via TopBar qui les réexporte : c'est
// TopBar qui monte ce composant maintenant, et passer par lui refermerait
// le cycle d'import.
import { PRIMARY_NAV, isNavActive } from "./navigation";

/** One figure per door, keyed by the PRIMARY_NAV id. A page no door owns,
 *  settings, about, contribute, gets the duo instead, so the panel always
 *  has exactly one figure and never two. */
const DOOR_FIGURES: Record<string, FunctionComponent<SVGProps<SVGElement>>> = {
  today: DoorToday,
  sessions: DoorSessions,
  plan: DoorPlan,
  numbers: DoorNumbers,
};

/** L'id du groupe qui n'est pas une porte. Il n'a pas de page, donc pas de
 *  section dans PRIMARY_NAV, mais il partage l'exclusivité des autres. */
const MORE_ID = "more";

/** Le glissé qui referme, en pixels de doigt.
 *
 *  120px est à peu près un tiers d'écran de téléphone : assez pour qu'un
 *  glissé de lecture ne referme jamais par accident, assez peu pour que le
 *  geste aboutisse sans traverser l'écran. Le panneau suit le doigt à moitié
 *  vitesse (mobile-menu.css ne s'en mêle pas, c'est écrit ici), ce qui est la
 *  résistance habituelle d'une feuille qu'on repousse. */
const CLOSE_DRAG = 120;

/** Au-delà, le geste est un glissé et non un appui. Deux choses en dépendent :
 *  le panneau ne commence à suivre le doigt qu'ici, donc un appui ne le fait
 *  pas frémir, et le clic qui suit est avalé, sinon un doigt posé sur une
 *  porte y navigue en repoussant le panneau. 16px, c'est au-dessus du
 *  tremblement d'un appui et très en dessous des 120 du geste. */
const DRAG_SLOP = 16;

/** Le reste, en un groupe au pied des portes.
 *
 *  Seulement ce qu'aucune porte ne tient déjà : le profil, les zones, les
 *  favoris et l'éditeur sont des enfants de Mes chiffres et Séances, et
 *  les imprimer à deux endroits est ce qui rendait l'ancienne liste plate
 *  illisible. Le filtre est automatique, donc retirer une entrée d'une porte la
 *  fait apparaître ici sans qu'on y pense.
 *
 *  C'est ici qu'ont atterri les destinations que les quatre portes ne portent
 *  plus, comprendre, méthodologie, guides, nutrition, lexique, parcours,
 *  simulateur, comparatifs. Elles gardent leurs routes ; elles ne sont plus
 *  dans le chemin de quelqu'un qui vient s'entraîner. */
const MORE_LINKS: { to: string; labelKey: string }[] = (() => {
  const underADoor = new Set<string>();
  for (const section of PRIMARY_NAV) {
    underADoor.add(section.to);
    for (const child of section.children ?? []) underADoor.add(child.to);
  }
  return [
    { to: "/settings", labelKey: "nav.settings" },
    { to: "/profile", labelKey: "nav.profile" },
    { to: "/my-zones", labelKey: "nav.myZones" },
    { to: "/favorites", labelKey: "nav.favorites" },
    { to: "/workout/builder", labelKey: "nav.builder" },
    { to: "/weeks/new/prebuilt", labelKey: "topnav.weeksPrebuilt" },
    { to: "/learn", labelKey: "topnav.learnArticles" },
    { to: "/methodology", labelKey: "topnav.methodScience" },
    { to: "/plans/methodology", labelKey: "topnav.methodPlans" },
    { to: "/guides", labelKey: "topnav.learnGuides" },
    { to: "/nutrition", labelKey: "topnav.learnNutrition" },
    { to: "/glossary", labelKey: "topnav.learnGlossary" },
    { to: "/race-simulator", labelKey: "topnav.raceSim" },
    { to: "/routes", labelKey: "topnav.routes" },
    { to: "/compare", labelKey: "compare.title" },
    { to: "/contribute", labelKey: "nav.contribute" },
    { to: "/changelog", labelKey: "nav.changelog" },
    { to: "/about", labelKey: "nav.about" },
  ].filter((item) => !underADoor.has(item.to));
})();

export function MobileMenu() {
  const { t } = useTranslation("common");
  const { pathname } = useLocation();
  const { openPalette } = useCommandPalette();
  // La PRÉFÉRENCE et non la couleur résolue : le segment doit pouvoir
  // afficher `système`, qui n'est pas une couleur.
  const { preference, setPreference } = useTheme();
  // The same 1024px line the header uses to decide it cannot show the doors.
  const isCompact = useMediaQuery("(max-width: 1023px)");
  const currentLang = getCurrentLanguage();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // A mirror of the dialog's own state, kept only so aria-expanded can be
  // honest. The dialog element remains the source of truth.
  const [open, setOpen] = useState(false);
  // La porte ouverte, et il n'y en a qu'une : c'est ce qui remplace le
  // `name="door"` du temps où les portes étaient des <details>. Remise à null
  // à la fermeture, sinon la prochaine ouverture montrerait la liste que la
  // visite précédente avait laissée dépliée au lieu des six lignes.
  const [openDoor, setOpenDoor] = useState<string | null>(null);

  /* La porte où l'on se trouve. Les préfixes des quatre portes sont
     disjoints, donc il y en a au plus une.

     Le reste ne porte le point que si AUCUNE ne le porte, et c'est
     exactement ce que son nom veut dire. Deux de ses quatorze routes tombent
     aussi sous une porte (`/plans/methodology` sous Mon plan,
     `/weeks/new/prebuilt` de même) : sans cette condition, l'écran afficherait
     deux points vermillon et ne dirait plus où l'on est, il dirait où l'on
     pourrait être. */
  const hasCurrentDoor = PRIMARY_NAV.some((section) => isNavActive(pathname, section));
  const inMore =
    !hasCurrentDoor &&
    MORE_LINKS.some((link) => pathname === link.to || pathname.startsWith(link.to + "/"));

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Raised for the one close that hands the user on rather than dismisses
  // them: the search button closes the panel to open the command palette, and
  // the `close` event fires as a task, after the palette has taken focus.
  // Pulling focus back to the trigger there would rip it out of the palette.
  const handoff = useRef(false);

  // Le glissé qui referme : l'ordonnée de départ du doigt, et le drapeau qui
  // dit que le geste a dépassé l'appui.
  const dragFrom = useRef<number | null>(null);
  const dragged = useRef(false);

  // Escape, the close pill, a navigation and the swipe all end up firing
  // `close` on the element, so this is the single place the mirror is updated
  // and the focus handed back to the glyph that opened the panel.
  useEffect(() => {
    const dialog = dialogRef.current;
    // Above 1024px nothing is rendered, so no `close` event will ever come.
    // The mirror has to be reset by hand or it stays true: aria-expanded would
    // lie, and the scroll lock below would never run its cleanup, leaving the
    // desktop page permanently unscrollable after a resize with the panel open.
    if (!dialog) {
      setOpen(false);
      return;
    }
    const onClose = () => {
      setOpen(false);
      // Toutes les portes se referment avec le panneau.
      setOpenDoor(null);
      // Et le panneau retrouve sa place : un glissé qui aboutit ferme le
      // dialogue en le laissant décalé, et la translation survivrait à la
      // prochaine ouverture.
      dialog.style.transform = "";
      dialog.style.transition = "";
      dragFrom.current = null;
      if (handoff.current) {
        handoff.current = false;
        return;
      }
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [isCompact]);

  // The scroll lock, the one modal behaviour <dialog> does not provide. It is
  // the shared, refcounted one: the search button hands off to the command
  // palette, which is a <dialog> of its own, and the two locks overlap while
  // this one's `close` event is still queued. Two private locks would each
  // have saved the body's overflow at a moment the other had already changed
  // it, and the last one out would have restored `hidden` for good.
  useScrollLock(open);

  // Close on navigation. `close()` on an already-closed dialog is a no-op and
  // fires nothing, so the run on mount costs nothing.
  useEffect(() => {
    close();
  }, [pathname, close]);

  // ── le glissé vers le bas ───────────────────────────────────────────────
  //
  // Une sortie de plus, et la plus attendue sur une feuille plein écran. Elle
  // n'est jamais la seule : Escape, la pilule et l'appui dans la scène font le
  // même travail, donc rien ne dépend d'un geste que personne n'annonce.
  //
  // La garde qui compte est `scrollTop`. Le panneau défile dès qu'une porte
  // est ouverte, et un doigt qui remonte la liste tire aussi vers le bas ; on
  // n'arme donc le geste qu'en HAUT de la course, là où le panneau n'a plus
  // rien à défiler et où la seule chose que le doigt peut vouloir est le
  // repousser. La souris est exclue, elle a la pilule.
  const onPointerDown = (event: ReactPointerEvent<HTMLDialogElement>) => {
    dragged.current = false;
    if (event.pointerType === "mouse") return;
    if ((innerRef.current?.scrollTop ?? 0) > 0) return;
    dragFrom.current = event.clientY;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDialogElement>) => {
    const from = dragFrom.current;
    const dialog = dialogRef.current;
    if (from === null || !dialog) return;
    const dy = event.clientY - from;
    if (Math.abs(dy) > DRAG_SLOP) dragged.current = true;
    // Rien ne bouge tant que le geste est un appui.
    if (!dragged.current) return;
    // Pas de transition pendant que le doigt est posé : le panneau est
    // exactement où on le tient, à moitié vitesse.
    dialog.style.transition = "none";
    dialog.style.transform = dy > 0 ? `translateY(${dy * 0.5}px)` : "";
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDialogElement>) => {
    const from = dragFrom.current;
    const dialog = dialogRef.current;
    dragFrom.current = null;
    if (from === null || !dialog) return;
    const dy = event.clientY - from;
    dialog.style.transition = "";
    dialog.style.transform = "";
    if (dy > CLOSE_DRAG) close();
  };

  if (!isCompact) return null;

  // The door you are standing in, read once for the whole panel: the figure
  // changes with the door, not with the page under it.
  const door = PRIMARY_NAV.find((section) => isNavActive(pathname, section));
  const Figure = (door && DOOR_FIGURES[door.id]) || RunnersDuo;

  return (
    <>
      {/* Un outil de la barre, pas un objet à part : `.zn-topbar__tool` porte
          la boîte de 44px, l'aplat de papier au survol et l'appui, exactement
          comme la recherche à l'autre bout. `.zn-menu-trigger` ne fait plus
          que le placer en tête de barre (mobile-menu.css).

          Glyphe NU, sans le mot MENU qu'il portait en pastille : dans la
          grappe d'outils, un libellé écrit serait le seul de la barre, et le
          hamburger en tête de barre est la convention que personne n'a besoin
          qu'on lui explique. Le nom passe donc en aria-label, qui est de toute
          façon ce que la pastille annonçait aux lecteurs d'écran. */}
      <button
        ref={triggerRef}
        type="button"
        className="zn-topbar__tool zn-menu-trigger"
        aria-label={t("actions.menu")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => {
          dialogRef.current?.showModal();
          // showModal() ne pose pas le focus sur le dialogue : il le pose sur
          // le premier descendant tabbable, c'est-à-dire la porte
          // Aujourd'hui. Le navigateur y peint alors l'anneau vermillon de
          // base.css dès que la dernière interaction comptabilisée était au
          // clavier, la frappe dans la palette de recherche suffit, alors que
          // l'ouverture vient d'un doigt. On vise donc le panneau qui défile :
          // un conteneur ne porte pas d'anneau (le reset est dans base.css,
          // hors couche, parce que son tabindex le fait entrer dans la règle de
          // focus globale), et PageDown et les flèches continuent de faire
          // défiler, ce que le <dialog>, lui, ne saurait pas faire : c'est son
          // enfant qui a l'overflow. Le premier Tab rend l'anneau à la première
          // porte.
          innerRef.current?.focus();
          setOpen(true);
        }}
      >
        <Menu />
      </button>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        className="zn-mobile-menu"
        aria-label={t("actions.menu")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        // Le clic qui suit un glissé est avalé avant d'atteindre la porte sous
        // le doigt : on repousse le panneau, on ne navigue pas.
        onClickCapture={(event) => {
          if (!dragged.current) return;
          dragged.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {/* tabIndex -1 : cible du focus d'ouverture (voir le déclencheur),
            sans arrêt de tabulation supplémentaire. */}
        <div className="zn-menu__inner" ref={innerRef} tabIndex={-1}>
          {/* La scène, et elle est passée AU-DESSUS des portes.
              Elle tenait le bas du panneau, donc la figure occupait la zone du
              pouce pendant que les cinq destinations restaient hors d'atteinte
              en haut, avec le vide entre les deux. Le vide et la figure sont
              maintenant le même objet : la scène prend toute la place libre,
              quelle qu'elle soit, et les portes tombent sous le pouce.

              Muette pour un lecteur d'écran, l'aria-current des portes dit
              déjà où l'on est, et un appui dedans referme : c'est le hors
              panneau d'une feuille qui, elle, n'en a pas, puisqu'elle EST
              l'écran. Rien ne dépend de ce raccourci, la pilule et Escape
              sont toujours là. */}
          <div className="zn-menu__scene" aria-hidden="true" onClick={close}>
            <Figure className="zn-menu__figure" focusable="false" />
          </div>

          <div className="zn-menu__nav">
            {/* Le libellé de la liste, collé à la liste : il flottait 32px
                au-dessus, assez loin pour se lire comme un titre d'écran
                plutôt que comme l'étiquette de ce qui suit. */}
            <p className="zn-kicker zn-menu__eyebrow">{t("mobileMenu.goTo")}</p>

            {/* Une ligne, deux boîtes. Le libellé est un lien vers la page
                d'accueil de la porte, le chevron un bouton de 44px qui
                déplie : on sait ce que fait un appui avant de le faire, et
                Aujourd'hui, qui n'a rien à déplier, est la même ligne en
                moins le chevron. L'ouverture est tenue en React
                (`openDoor`), une seule à la fois. */}
            <nav aria-label={t("nav.primary")}>
              <ul className="zn-menu__doors">
                {PRIMARY_NAV.map((section) => {
                  const label = t(section.labelKey);
                  const here = isNavActive(pathname, section);
                  const children = section.children ?? [];
                  const panelId = `zn-menu-${section.id}`;
                  const expanded = openDoor === section.id;
                  return (
                    <li key={section.id}>
                      <div className="zn-menu__door-row">
                        <Link
                          to={section.to}
                          viewTransition
                          className="zn-display zn-menu__door"
                          data-level="2"
                          data-current={here || undefined}
                          aria-current={
                            pathname === section.to ? "page" : here ? "true" : undefined
                          }
                        >
                          {label}
                        </Link>
                        {children.length > 0 && (
                          <button
                            type="button"
                            className="zn-menu__disclose"
                            aria-expanded={expanded}
                            aria-controls={panelId}
                            aria-label={t("mobileMenu.disclose", { door: label })}
                            onClick={() =>
                              setOpenDoor((current) =>
                                current === section.id ? null : section.id,
                              )
                            }
                          >
                            <ChevronDown className="zn-menu__door-chevron" />
                          </button>
                        )}
                      </div>
                      {children.length > 0 && (
                        <ul className="zn-menu__sub" id={panelId} hidden={!expanded}>
                          {children.map((child) => (
                            <li key={child.to}>
                              <Link
                                to={child.to}
                                viewTransition
                                className="zn-menu__sub-link"
                                aria-current={pathname === child.to ? "page" : undefined}
                              >
                                {t(child.labelKey)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}

                {/* La seule ligne qui déplie sans naviguer, parce qu'elle est
                    la seule qui n'a pas de page. Sa boîte entière est donc le
                    dépliant, chevron compris. */}
                <li>
                  <div className="zn-menu__door-row">
                    <button
                      type="button"
                      className="zn-display zn-menu__door zn-menu__door--toggle"
                      data-level="2"
                      data-current={inMore || undefined}
                      /* Jamais "page" : cette ligne n'a pas de page à elle. */
                      aria-current={inMore ? "true" : undefined}
                      aria-expanded={openDoor === MORE_ID}
                      aria-controls="zn-menu-more"
                      onClick={() =>
                        setOpenDoor((current) => (current === MORE_ID ? null : MORE_ID))
                      }
                    >
                      {t("mobileMenu.more")}
                      <ChevronDown className="zn-menu__door-chevron" />
                    </button>
                  </div>
                  <ul className="zn-menu__sub" id="zn-menu-more" hidden={openDoor !== MORE_ID}>
                    {MORE_LINKS.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          viewTransition
                          className="zn-menu__sub-link"
                          aria-current={pathname === item.to ? "page" : undefined}
                        >
                          {t(item.labelKey)}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <a
                        href="https://github.com/alarboulletmarin/zoned"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="zn-menu__sub-link"
                      >
                        GitHub
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>
          </div>

          {/* Le sol : la recherche et les deux réglages, sous le filet qui
              traverse le panneau. C'est le filet qui dit que ce qui suit
              n'est plus de la navigation. */}
          <div className="zn-menu__foot">
            {/* Search is the command palette, opened from here rather than
                re-implemented. The panel closes first: the palette is a modal
                of its own and would otherwise open under this one's top
                layer. */}
            <button
              type="button"
              className="zn-menu__search"
              onClick={() => {
                handoff.current = true;
                close();
                openPalette();
              }}
            >
              <Search />
              {/* Rechercher une séance vendait le quart de ce que la palette
                  cherche : elle rend aussi les guides, les articles, le
                  glossaire, les collections, les calculateurs et les pages.
                  Son propre placeholder les énumère, ce qui est juste dans un
                  champ large et déborde sur deux lignes ici, 43 caractères
                  pour 33 de place. Ce libellé dit la même chose, la PORTÉE, et
                  n'aura pas à suivre la palette quand elle gagnera un type. */}
              {t("mobileMenu.search")}
            </button>

            {/* Deux réglages, UNE grammaire, et les deux disent l'ÉTAT.
                La langue montrait déjà ses deux valeurs avec l'active
                remplie ; le thème ne montrait que l'action. Côte à côte, on
                lisait la pastille pleine de FR comme la seule cliquable, et
                surtout : le panneau est à l'ENCRE dans les deux thèmes
                (`--panel-ink`, posé une fois à `:root`), donc PASSER EN
                SOMBRE s'affichait sur fond noir. Un contrôle dont on ne peut
                pas déduire l'état courant devient un pari, et on cesse de
                s'en servir.

                Le segment rend au passage le TROISIÈME mode : `toggle` ne
                faisait que basculer clair/sombre, donc ouvrir le menu en
                `système` épinglait silencieusement une valeur explicite, et
                `système` n'était plus récupérable que depuis les réglages.
                Le `Segmented` maison porte déjà le radiogroup, les flèches et
                le plancher tactile ; il ne manquait que l'encre, qui est dans
                mobile-menu.css. */}
            <div className="zn-menu__settings">
              <Segmented
                value={currentLang}
                onChange={changeLanguage}
                label={t("mobileMenu.language")}
                options={[
                  // Les initiales sont pour l'oeil, `title` porte le nom entier
                  // pour le nom accessible.
                  { value: "fr", label: "FR", title: t("language.fr") },
                  { value: "en", label: "EN", title: t("language.en") },
                ]}
              />
              <Segmented
                value={preference}
                onChange={setPreference}
                label={t("mobileMenu.theme")}
                options={[
                  { value: "light", label: t("theme.light") },
                  { value: "dark", label: t("theme.dark") },
                  { value: "system", label: t("theme.system") },
                ]}
              />
            </div>
          </div>
        </div>

        {/* On referme là où on a ouvert : la pilule de fermeture est posée
            aux coordonnées exactes du déclencheur, en tête de barre.

            EN CONTOUR, et c'est le point de la relecture : en aplat vermillon,
            elle était le seul objet coloré du panneau, donc le premier que
            l'oeil trouve, pour l'action qu'on veut le moins. Le vermillon est
            descendu sur le point de la porte où l'on se trouve, qui est
            l'information, et la fermeture garde sa boîte, son mot et gagne la
            croix. */}
        <button type="button" className="zn-menu__close" onClick={close}>
          <X size={16} />
          {t("actions.close")}
        </button>
      </dialog>
    </>
  );
}

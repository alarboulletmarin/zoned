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
 * Nothing is lost against the old drawer: the five doors are the screen, and
 * every child page and account page hangs under the door it belongs to, in a
 * native <details> that is closed until you ask for it. That replaces the flat
 * run of twenty-five mono links that used to sit at the floor of the panel,
 * the routes were all there, but in no order anyone could read.
 *
 * Under the six lines, the figure of the door you are standing in stands on a
 * rule that crosses the panel. It replaces the vermillon disc that used to mark
 * the active line: the doors of the home page and the guides are bare, and
 * this is where their figures live now, at a size where the stroke reads as a
 * drawing, not as one more pictogram.
 */

import type { FunctionComponent, SVGProps } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DoorNumbers from "@/assets/doodles/door-numbers.svg?react";
import DoorPlan from "@/assets/doodles/door-plan.svg?react";
import DoorSessions from "@/assets/doodles/door-sessions.svg?react";
import DoorToday from "@/assets/doodles/door-today.svg?react";
import RunnersDuo from "@/assets/doodles/runners-duo.svg?react";
import { ChevronDown, Menu, Search } from "@/components/icons";
import { useCommandPalette } from "@/components/search";
import { useScrollLock } from "@/components/ui/native-dialog";
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
  const { resolved: theme, toggle: toggleTheme } = useTheme();
  // The same 1024px line the header uses to decide it cannot show the doors.
  const isCompact = useMediaQuery("(max-width: 1023px)");
  const currentLang = getCurrentLanguage();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // A mirror of the dialog's own state, kept only so aria-expanded can be
  // honest. The dialog element remains the source of truth.
  const [open, setOpen] = useState(false);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Raised for the one close that hands the user on rather than dismisses
  // them: the search button closes the panel to open the command palette, and
  // the `close` event fires as a task, after the palette has taken focus.
  // Pulling focus back to the trigger there would rip it out of the palette.
  const handoff = useRef(false);

  // Escape, the close pill and a navigation all end up firing `close` on the
  // element, so this is the single place the mirror is updated and the focus
  // handed back to the glyph that opened the panel.
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
      // Every door shuts with the panel. The element outlives its dialog, so
      // without this the next opening would show the list of pages the last
      // visit left open, instead of the six lines.
      dialog.querySelectorAll("details").forEach((door) => {
        door.open = false;
      });
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
      >
        {/* tabIndex -1 : cible du focus d'ouverture (voir le déclencheur),
            sans arrêt de tabulation supplémentaire. */}
        <div className="zn-menu__inner" ref={innerRef} tabIndex={-1}>
          <p className="zn-kicker zn-menu__eyebrow">{t("mobileMenu.goTo")}</p>

          {/* One door per line. A door with children is a native <details>,
              always closed when the panel opens, the figure under the lines
              says which door you are standing in, without unfolding it, so
              the panel is six lines on opening, and the twenty-five routes are
              one tap away under the door that owns them. <details> also means
              the disclosure contract
              (Enter, Space, the open state) is the platform's, not ours, and
              one `name` shared by every door makes them an exclusive accordion:
              opening a door closes the one that was open, so the panel never
              holds two lists of pages at once. */}
          <nav aria-label={t("nav.primary")}>
            <ul className="zn-menu__doors">
              {PRIMARY_NAV.map((section) => {
                if (!section.children?.length) {
                  return (
                    <li key={section.id}>
                      <Link
                        to={section.to}
                        viewTransition
                        className="zn-display zn-menu__door"
                        data-level="2"
                        aria-current={pathname === section.to ? "page" : undefined}
                      >
                        {t(section.labelKey)}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={section.id}>
                    <details className="zn-menu__group" name="door">
                      <summary className="zn-display zn-menu__door" data-level="2">
                        {t(section.labelKey)}
                        <ChevronDown className="zn-menu__chevron" aria-hidden="true" />
                      </summary>
                      <ul className="zn-menu__sub">
                        {section.children.map((child) => (
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
                    </details>
                  </li>
                );
              })}

              <li>
                <details className="zn-menu__group" name="door">
                  <summary className="zn-display zn-menu__door" data-level="2">
                    {t("mobileMenu.more")}
                    <ChevronDown className="zn-menu__chevron" aria-hidden="true" />
                  </summary>
                  <ul className="zn-menu__sub">
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
                </details>
              </li>
            </ul>
          </nav>

          {/* The ground. A rule across the whole panel, and the figure of the
              door you are in standing on it, sole on the line, the bottom of
              the SVG's viewBox is its sole, so the box is aligned on the rule
              and nothing is placed by eye. Muet for a screen reader: the
              aria-current on the links already says where you are, and the
              disc it replaces was aria-hidden too. It takes the room left
              between the doors and the foot and never more (mobile-menu.css),
              so it can shrink, then go, but never overlap a line. */}
          <div className="zn-menu__scene" aria-hidden="true">
            <Figure className="zn-menu__figure" focusable="false" />
          </div>

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
              {t("mobileMenu.searchPlaceholder")}
            </button>

            <div className="zn-menu__pills">
              <button
                type="button"
                className="zn-menu__pill"
                aria-label={t("mobileMenu.language")}
                onClick={() => changeLanguage(currentLang === "fr" ? "en" : "fr")}
              >
                <span className="zn-menu__lang" data-on={currentLang === "fr" || undefined}>
                  FR
                </span>
                /
                <span className="zn-menu__lang" data-on={currentLang === "en" || undefined}>
                  EN
                </span>
              </button>

              <button type="button" className="zn-menu__pill" onClick={toggleTheme}>
                {theme === "light" ? t("mobileMenu.themeDark") : t("mobileMenu.themeLight")}
              </button>
            </div>

          </div>
        </div>

        {/* On referme là où on a ouvert : la pilule de fermeture est posée
            aux coordonnées exactes du déclencheur, en tête de barre, plutôt
            qu'au coin bas-droit qu'il a quitté. Elle garde son mot et son
            aplat vermillon : elle est la seule action d'un menu ouvert qui ne
            soit pas une destination, et rien ne la sépare de la page en
            dessous, alors que le déclencheur, lui, a la barre pour cadre. */}
        <button type="button" className="zn-menu__close" onClick={close}>
          {t("actions.close")}
        </button>
      </dialog>
    </>
  );
}

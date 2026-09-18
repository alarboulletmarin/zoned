/**
 * Mobile menu, the doors as a full-screen ink panel.
 *
 * Below 1024px the header has no room for the doors, so navigation becomes one
 * glyph at the START of the header bar, before the wordmark, and a panel that
 * takes the whole screen.
 *
 * Le déclencheur est un OUTIL DE LA BARRE : il porte `.zn-topbar__tool`, la
 * même boîte de 44px, le même aplat de papier au survol et le même appui que
 * la recherche, la langue et le thème. La seule chose que ce fichier ajoute
 * est sa PLACE, en tête de la barre plutôt que dans la grappe de droite,
 * parce que c'est la seule convention que tout le monde connaît déjà sur
 * téléphone. Il a vécu en pastille flottante au coin bas-droit jusqu'au
 * 13 septembre 2026 ; ce qu'un objet fixe coûtait aux huit feuilles qui lui
 * réservaient de la place est raconté en tête de mobile-menu.css.
 *
 * Le composant est rendu DANS `<TopBar>` et non à côté (App.tsx) : le
 * déclencheur doit être un enfant de la barre pour en être un élément flex.
 * Le `<dialog>` qui le suit, lui, monte dans la top layer dès showModal() et
 * ignore le contexte d'empilement de l'en-tête, donc rien n'est perdu à le
 * descendre là.
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
 * ── L'ARCHITECTURE, REVUE LE 18 SEPTEMBRE 2026 ────────────────────────────
 *
 * Le panneau était un plan de site. Quatre portes dont trois dépliaient
 * quatre ou cinq pages, puis Le reste, un dépliant de seize lignes où
 * Paramètres, Nutrition et GitHub se suivaient au même poids ; et sous un
 * filet, la recherche, la langue et le thème, dessinés aussi gros que la
 * navigation. Plus la moitié de l'écran vide au-dessus, parce que les portes
 * étaient tenues en bas. Le menu montrait tout ce que l'app sait faire au
 * lieu de répondre à la seule question qu'on lui pose : où veux-tu aller ?
 *
 * Il répond maintenant en trois blocs, lus de haut en bas.
 *
 * 1. ALLER À, les quatre portes, et chacune est UN LIEN. Plus de chevron ni
 *    de dépliant : appuyer sur Séances emmène sur la bibliothèque, qui porte
 *    elle-même ses pages en rail (`HubNav.tsx`). Une entrée du menu est une
 *    destination ; le détail d'une porte vit chez elle. L'ordre est celui
 *    de `navigation.ts`, et il raconte le produit : aujourd'hui, mon plan,
 *    les séances, mes chiffres.
 *
 * 2. OUTILS, trois destinations directes, en corps de texte sous les portes
 *    en display : simuler sa course, se tracer un parcours, comprendre. C'est
 *    tout ce qui reste du Reste, et ce sont des instruments, pas un
 *    regroupement. Chacun est un module que les réglages peuvent masquer, et
 *    masquer le retire d'ici, comme les réglages le promettent.
 *
 * 3. LE SOL, sous le filet : la recherche, en pilule, parce qu'elle est le
 *    geste de qui ne sait pas où aller ; puis Réglages et À propos, en petit.
 *    La langue et le thème n'y sont plus : la barre du haut les garde sur
 *    tous les écrans, et les réglages les portent avec leur nom entier. Les
 *    répéter ici, au même poids que les portes, était le bruit.
 *
 * LA LISTE EST ANCRÉE EN HAUT, sous la pilule de fermeture, et c'est l'inverse
 * du 13 septembre au soir, qui tenait les portes sous le pouce au prix d'un
 * demi-écran vide au-dessus d'elles. Le vide se lisait avant les portes, et
 * il se lisait comme une page qui n'a pas fini de charger. La place libre,
 * quand il y en a, descend maintenant ENTRE la navigation et le sol : la
 * recherche reste sous le pouce, les portes se lisent d'abord, et un appui
 * dans le vide referme toujours.
 *
 * LA PORTE OÙ L'ON EST SE VOIT. Un point vermillon la suit, doublé
 * d'`aria-current`, donc l'état n'est pas porté par la seule couleur ; c'est
 * le seul aplat de couleur du panneau, la fermeture étant en contour.
 *
 * Ce qui est parti avec les dépliants : `openDoor` et l'exclusivité qu'il
 * tenait à la main, les `aria-expanded` et `aria-controls` écrits pour
 * remplacer un `<details>`, les deux Segmented et leur encre, et le filtre
 * qui recalculait Le reste depuis les portes. Rien ne se déplie plus ici.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, Search, X } from "@/components/icons";
import { useCommandPalette } from "@/components/search";
import { useScrollLock } from "@/components/ui/native-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSettings } from "@/hooks/useSettings";
import { isModuleHidden } from "@/lib/settingsSchema";
// Directement depuis la donnée, et pas via TopBar qui les réexporte : c'est
// TopBar qui monte ce composant maintenant, et passer par lui refermerait
// le cycle d'import.
import { MENU_FOOT_LINKS, PRIMARY_NAV, TOOLS_NAV, isNavActive } from "./navigation";

export function MobileMenu() {
  const { t } = useTranslation("common");
  const { pathname } = useLocation();
  const { openPalette } = useCommandPalette();
  const { settings } = useSettings();
  // The same 1024px line the header uses to decide it cannot show the doors.
  const isCompact = useMediaQuery("(max-width: 1023px)");

  const dialogRef = useRef<HTMLDialogElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // A mirror of the dialog's own state, kept only so aria-expanded can be
  // honest. The dialog element remains the source of truth.
  const [open, setOpen] = useState(false);

  // Les outils que les réglages n'ont pas masqués. Le filtre est ici et non
  // dans la donnée, parce que la donnée ne connaît pas les réglages.
  const tools = TOOLS_NAV.filter(
    (section) => !section.module || !isModuleHidden(settings, section.module),
  );

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Levé pour les fermetures qui PASSENT LA MAIN plutôt qu'elles ne congédient,
  // et il y en a deux. La recherche ferme le panneau pour ouvrir la palette, et
  // l'évènement `close` arrive en tâche, après que la palette a pris le focus :
  // y ramener le focus sur le déclencheur l'arracherait à la palette. Une porte
  // tapée, elle, emmène sur une autre page : le déclencheur n'a plus rien à
  // dire, et le lui rendre par script rallume l'anneau vermillon de base.css
  // (voir l'effet de fermeture plus bas).
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
      if (handoff.current) {
        handoff.current = false;
        return;
      }
      // Escape et la pilule RENDENT la main : le focus repart d'où il venait.
      // Ce `focus()` est écrit parce que la restitution de la plate-forme ne
      // suffit pas ici : WebKit ne donne pas le focus à un bouton qu'on TAPE,
      // donc il n'y a souvent rien à restituer. Il porte en revanche l'état
      // focus-visible de l'élément qu'il remplace, et cet élément est
      // `.zn-menu__inner`, focusé par script à l'ouverture : son anneau est
      // masqué (base.css, hors couche), pas éteint. Le rendre au déclencheur,
      // qui n'a pas ce reset, c'est le rallumer sur le hamburger. D'où la
      // sortie ci-dessus pour les fermetures qui passent la main.
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

  // Close on navigation. Le drapeau dit que cette fermeture-là passe la main à
  // la page qui arrive : le déclencheur ne reprend pas le focus, sinon il
  // s'afficherait cerclé de vermillon sur la page d'après (voir `handoff`).
  //
  // La garde `open` porte tout le poids. Sans elle, la passe de montage, comme
  // toute navigation faite hors du panneau, lèverait un drapeau qu'aucun
  // `close` ne viendrait abaisser, et c'est la fermeture SUIVANTE, au clavier,
  // qui perdrait son retour de focus. `close()` sur un dialogue déjà fermé est
  // un no-op qui n'émet rien, donc le drapeau ne doit se lever que quand il y a
  // vraiment quelque chose à fermer.
  useEffect(() => {
    if (!dialogRef.current?.open) return;
    handoff.current = true;
    close();
  }, [pathname, close]);

  if (!isCompact) return null;

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
          {/* Un seul repère de navigation pour les deux listes : les portes
              et les outils sont la même réponse à la même question, à deux
              poids. Chaque liste est nommée par son étiquette, celle qu'on
              lit au-dessus d'elle. */}
          <nav className="zn-menu__nav" aria-label={t("nav.primary")}>
            {/* Le libellé de la liste, collé à la liste : il flottait 32px
                au-dessus, assez loin pour se lire comme un titre d'écran
                plutôt que comme l'étiquette de ce qui suit. */}
            <p className="zn-kicker zn-menu__eyebrow" id="zn-menu-doors-label">
              {t("mobileMenu.goTo")}
            </p>

            {/* Les portes. Chacune est un lien, et rien d'autre : la ligne
                entière emmène, et l'on sait ce que fait un appui avant de le
                faire. Aujourd'hui ne se distingue plus des trois autres par
                l'absence d'un chevron, parce qu'il n'y a plus de chevron. */}
            <ul className="zn-menu__doors" aria-labelledby="zn-menu-doors-label">
              {PRIMARY_NAV.map((section) => {
                const here = isNavActive(pathname, section);
                return (
                  <li key={section.id}>
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
                      {t(section.labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Les outils, si les réglages en ont laissé. Même point, même
                attribut pour dire où l'on est : un seul marqueur dans tout le
                panneau, quel que soit le poids de la ligne. */}
            {tools.length > 0 && (
              <>
                <p
                  className="zn-kicker zn-menu__eyebrow zn-menu__eyebrow--tools"
                  id="zn-menu-tools-label"
                >
                  {t("mobileMenu.tools")}
                </p>
                <ul className="zn-menu__tools" aria-labelledby="zn-menu-tools-label">
                  {tools.map((section) => {
                    const here = isNavActive(pathname, section);
                    return (
                      <li key={section.id}>
                        <Link
                          to={section.to}
                          viewTransition
                          className="zn-menu__tool"
                          data-current={here || undefined}
                          aria-current={
                            pathname === section.to ? "page" : here ? "true" : undefined
                          }
                        >
                          {t(section.labelKey)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </nav>

          {/* La scène : la place libre du panneau, ENTRE la navigation et le
              sol depuis le 18 septembre. Elle prend tout ce qui reste
              (`flex: 1`), donc la liste tient le haut, sous la pilule de
              fermeture, et le sol tient le bas, sous le pouce, quelle que
              soit la hauteur de l'écran ; sur un petit écran elle fait zéro
              et le panneau défile. Un appui dedans referme : c'est le hors
              panneau d'une feuille qui, elle, n'en a pas, puisqu'elle EST
              l'écran. Rien ne dépend de ce raccourci, la pilule et Escape
              sont toujours là.

              Muette pour un lecteur d'écran : elle n'a jamais rien dit, et
              l'aria-current des portes dit déjà où l'on est. */}
          <div className="zn-menu__scene" aria-hidden="true" onClick={close} />

          {/* Le sol : la recherche et deux liens de service, sous le filet
              qui traverse le panneau. C'est le filet qui dit que ce qui suit
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
                  Ce libellé dit la PORTÉE, et n'aura pas à suivre la palette
                  quand elle gagnera un type. */}
              {t("mobileMenu.search")}
            </button>

            {/* Réglages et À propos, en petit et en gris : on doit pouvoir
                les atteindre sans les chercher, pas les voir avant les
                portes. Le point vermillon les suit aussi quand on y est,
                même marqueur que plus haut. */}
            <ul className="zn-menu__foot-links">
              {MENU_FOOT_LINKS.map((link) => {
                const here = pathname === link.to;
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      viewTransition
                      className="zn-menu__foot-link"
                      data-current={here || undefined}
                      aria-current={here ? "page" : undefined}
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* On referme là où on a ouvert : la pilule de fermeture est posée
            aux coordonnées exactes du déclencheur, en tête de barre.

            EN CONTOUR : en aplat vermillon, elle était le seul objet coloré
            du panneau, donc le premier que l'oeil trouve, pour l'action qu'on
            veut le moins. Le vermillon est descendu sur le point de la porte
            où l'on se trouve, qui est l'information, et la fermeture garde sa
            boîte, son mot et la croix. */}
        <button type="button" className="zn-menu__close" onClick={close}>
          <X size={16} />
          {t("actions.close")}
        </button>
      </dialog>
    </>
  );
}

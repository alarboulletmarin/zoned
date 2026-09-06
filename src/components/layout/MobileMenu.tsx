/**
 * Mobile menu — the five doors as a full-screen ink panel.
 *
 * Below 1024px the header has no room for the doors, so navigation becomes one
 * floating pill in the bottom-right corner ("where the thumb already is") and a
 * panel that takes the whole screen.
 *
 * It is a native <dialog> driven by showModal(), not a Radix Sheet: the top
 * layer, the focus trap, Escape and the focus returning to the trigger all come
 * from the platform. The one thing the platform does not give is the scroll
 * lock, so this file writes it.
 *
 * The trigger and the panel live in the same component on purpose — the browser
 * hands focus back to whatever was focused before showModal(), and keeping the
 * two together is what makes that "whatever" be the pill.
 *
 * Nothing is lost against the old drawer: the five doors are the screen, and
 * every child page and account page hangs under the door it belongs to, in a
 * native <details> that is closed until you ask for it. That replaces the flat
 * run of twenty-five mono links that used to sit at the floor of the panel —
 * the routes were all there, but in no order anyone could read.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, Menu, Search } from "@/components/icons";
import { useCommandPalette } from "@/components/search";
import { useScrollLock } from "@/components/ui/native-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTheme } from "@/hooks/useTheme";
import { changeLanguage, getCurrentLanguage } from "@/i18n";
import { PRIMARY_NAV, isNavActive } from "./TopBar";

/** The account pages, as their own group at the foot of the doors.
 *
 *  Only the ones no door already holds: profile, my zones, favorites and the
 *  builder are children of "Mes chiffres" and "Séances", and printing them in
 *  two places is what made the old flat list unreadable. */
const ACCOUNT_LINKS: { to: string; labelKey: string }[] = (() => {
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  // A mirror of the dialog's own state, kept only so aria-expanded can be
  // honest. The dialog element remains the source of truth.
  const [open, setOpen] = useState(false);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Raised for the one close that hands the user on rather than dismisses
  // them: the search button closes the panel to open the command palette, and
  // the `close` event fires as a task — after the palette has taken focus.
  // Pulling focus back to the pill there would rip it out of the palette.
  const handoff = useRef(false);

  // Escape, the close pill and a navigation all end up firing `close` on the
  // element, so this is the single place the mirror is updated and the focus
  // handed back to the pill that opened the panel.
  useEffect(() => {
    const dialog = dialogRef.current;
    // Above 1024px nothing is rendered, so no `close` event will ever come.
    // The mirror has to be reset by hand or it stays true: aria-expanded would
    // lie, and the scroll lock below would never run its cleanup — leaving the
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="zn-menu-fab"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
      >
        <Menu />
        {t("actions.menu")}
      </button>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        className="zn-mobile-menu"
        aria-label={t("actions.menu")}
      >
        <div className="zn-menu__inner">
          <p className="zn-kicker zn-menu__eyebrow">{t("mobileMenu.goTo")}</p>

          {/* One door per line. A door with children is a native <details>,
              closed unless you are standing in it — so the panel is six lines
              on opening, and the twenty-five routes are one tap away under the
              door that owns them. <details> also means the disclosure contract
              (Enter, Space, the open state) is the platform's, not ours. */}
          <nav aria-label={t("nav.primary")}>
            <ul className="zn-menu__doors">
              {PRIMARY_NAV.map((section) => {
                const here = isNavActive(pathname, section);
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
                        {here && <span className="zn-menu__dot" aria-hidden="true" />}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={section.id}>
                    <details className="zn-menu__group" open={here || undefined}>
                      <summary className="zn-display zn-menu__door" data-level="2">
                        {t(section.labelKey)}
                        {here && <span className="zn-menu__dot" aria-hidden="true" />}
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
                <details className="zn-menu__group">
                  <summary className="zn-display zn-menu__door" data-level="2">
                    {t("topnav.account")}
                    <ChevronDown className="zn-menu__chevron" aria-hidden="true" />
                  </summary>
                  <ul className="zn-menu__sub">
                    {ACCOUNT_LINKS.map((item) => (
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

        <button type="button" className="zn-menu__close" onClick={close}>
          {t("actions.close")}
        </button>
      </dialog>
    </>
  );
}

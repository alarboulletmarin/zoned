/**
 * Le rail d'une porte : ses pages, sur sa page d'accueil, sous 1024px.
 *
 * C'est la contrepartie de la refonte du menu du 18 septembre 2026. Le menu
 * plein écran dépliait les pages de chaque porte sous la porte, et la
 * relecture a tranché : une entrée du menu est une destination, et le détail
 * d'une porte vit chez elle. Les pages ne sont pas perdues pour autant, elles
 * sont ICI, sur la page où la porte emmène, une rangée de liens sous le
 * titre. La même donnée les alimente que le menu déroulant du bureau
 * (`navigation.ts`), donc ajouter une page à une porte l'ajoute aux deux.
 *
 * Il n'existe que sous 1024px, la ligne où la barre cesse de montrer ses
 * menus déroulants : au-dessus, ces pages sont déjà à un survol, et les
 * répéter sous le titre ferait deux navigations pour la même chose.
 *
 * DES LIENS, PAS DES PILULES. Le premier jet les dessinait en pilules de
 * contour, et à 390px la bibliothèque alignait alors trois rangées de la
 * même forme pour trois gestes différents : le rail qui emmène, les
 * pratiques qui filtrent, les boutons qui agissent. La page des plans en
 * empilait six. Un lien en corps de libellé, suivi d'un chevron, dit ce
 * qu'il est, une sous-navigation, et ne se confond avec rien de ce que la
 * page fait par ailleurs.
 *
 * La page où l'on est n'y figure pas : on y est. Et une page peut en omettre
 * d'autres, quand elle porte déjà l'entrée sous une autre forme, un bouton
 * primaire, une pilule à elle ; le doublon est le seul cas où le rail ment.
 */

import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "@/components/icons";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { NavSection } from "./navigation";

export function HubNav({
  section,
  omit = [],
}: {
  section: NavSection;
  /** Les pages que la page porte déjà autrement, à ne pas répéter. */
  omit?: string[];
}) {
  const { t } = useTranslation("common");
  const { pathname } = useLocation();
  // The same 1024px line the header uses to decide it cannot show the doors.
  const isCompact = useMediaQuery("(max-width: 1023px)");

  if (!isCompact) return null;

  const pages = (section.children ?? []).filter(
    (page) => page.to !== section.to && !omit.includes(page.to),
  );
  if (pages.length === 0) return null;

  return (
    <nav className="zn-hubnav" aria-label={t("hubNav.label")}>
      <ul className="zn-hubnav__list">
        {pages.map((page) => (
          <li key={page.to}>
            <Link
              to={page.to}
              viewTransition
              className="zn-hubnav__link"
              aria-current={pathname === page.to ? "page" : undefined}
            >
              {t(page.labelKey)}
              <ChevronRight size={16} className="zn-hubnav__chevron" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { HubLang, HubLink } from "@/lib/seo/hub-links";

/**
 * Liste de liens contextuels, sous le contenu de la page.
 * Les ancres viennent de la config, pas d'un libelle generique.
 */
export function HubLinks({ links, lang }: { links: HubLink[]; lang: HubLang }) {
  const { t } = useTranslation("common");
  if (links.length === 0) return null;

  return (
    <nav className="zn-hub" aria-label={t("hubLinks.label")}>
      <h2 className="zn-kicker">{t("hubLinks.title")}</h2>
      <ul className="zn-hub__list">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={lang === "en" ? { pathname: link.path, search: "?lang=en" } : link.path}
            >
              {link.anchor}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Le pied de page. Un seul, le même partout.
 *
 * Une ligne d'encre pleine largeur, au bas de chaque page : la licence, les
 * licences tierces, le dépôt, le plan du site, la version. Elle ne change pas
 * d'une route à l'autre, et sur téléphone elle se replie en deux rangées
 * centrées, jamais en cinq.
 *
 * Il y en avait deux, et ils ne disaient pas la même chose. Sur les pages
 * publiques, un tableau de quatre colonnes de liens surmontait une barre de
 * cinq éléments qui, dans la colonne d'un téléphone, se dépliait en cinq
 * rangées : le pied de page fermait la page en criant plus fort qu'elle. Sur
 * le cockpit, il ne restait que la licence, en encre claire. Deux pieds de
 * page, deux contenus, deux traitements, pour la même signature.
 *
 * Le tableau de liens n'est pas perdu, et il ne pouvait pas l'être : c'est la
 * seule surface d'où un robot atteint les ~24 hubs. Les portes du haut sont
 * des menus déroulants, absents du HTML statique, et l'accueil ne pointe que
 * cinq routes. Il est donc toujours dans le HTML, replié derrière Plan du
 * site, et il se déplie dans la même encre que la ligne, sous elle.
 */

import { ChevronDown, GithubIcon } from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FOOTER_GROUPS, GITHUB_URL } from "./navigation";

// Package version is injected at build time by Vite via __APP_VERSION__.
// Falls back to "dev" when the constant is missing (eg. unit tests).
declare const __APP_VERSION__: string | undefined;
const APP_VERSION =
  typeof __APP_VERSION__ === "string" && __APP_VERSION__.length > 0
    ? __APP_VERSION__
    : "dev";

const MAP_ID = "zn-footer-map";

export function Footer() {
  const { t } = useTranslation(["homepage", "common"]);
  const [mapOpen, setMapOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const year = new Date().getFullYear();

  // Le plan du site s'ouvre SOUS la ligne, donc sous le pli : au doigt, sur un
  // téléphone, le bouton n'aurait rien fait de visible. `nearest` remonte le
  // strict nécessaire et ne bouge pas si le panneau tient déjà à l'écran.
  useEffect(() => {
    if (mapOpen) mapRef.current?.scrollIntoView({ block: "nearest" });
  }, [mapOpen]);

  return (
    <footer className="zn-footer">
      <div className="zn-footer__bar">
        <span className="zn-footer__legal">
          {t("homepage:home.footer.license", { year })}
        </span>

        {/* Static file emitted by scripts/generate-licenses.ts, not a route:
            plain <a>, so it escapes the SPA instead of hitting the router. */}
        <a
          className="zn-footer__item"
          href="/licenses.txt"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("homepage:home.footer.licenses")}
        </a>

        <a
          className="zn-footer__item"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubIcon aria-hidden="true" />
          {t("homepage:home.footer.project.github")}
        </a>

        <button
          type="button"
          className="zn-footer__item zn-footer__toggle"
          aria-expanded={mapOpen}
          aria-controls={MAP_ID}
          onClick={() => setMapOpen((open) => !open)}
        >
          {t("homepage:home.footer.sitemap")}
          {/* La taille vient de footer.css, comme celle du logo du dépôt. */}
          <ChevronDown className="zn-footer__chevron" aria-hidden="true" />
        </button>

        <span className="zn-footer__version">
          {t("homepage:home.footer.version", { version: APP_VERSION })}
        </span>
      </div>

      {/* `hidden` et non un démontage : les liens restent dans le HTML
          prérendu, qui est tout ce pour quoi ce tableau existe. */}
      <div id={MAP_ID} ref={mapRef} className="zn-footer__map" hidden={!mapOpen}>
        {FOOTER_GROUPS.map((group) => (
          <div className="zn-footer__col" key={group.titleKey}>
            <span className="zn-footer__col-title">{t(group.titleKey)}</span>
            <ul className="zn-footer__list">
              {group.links.map((link) => (
                <li key={link.labelKey}>
                  {link.to ? (
                    <Link className="zn-footer__link" to={link.to}>
                      {t(link.labelKey)}
                    </Link>
                  ) : (
                    <a
                      className="zn-footer__link"
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t(link.labelKey)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

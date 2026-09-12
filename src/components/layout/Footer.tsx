/**
 * Global footer, on every page that isn't fullscreen (see App.tsx
 * FULLSCREEN_ROUTES).
 *
 * Two parts. The link table stays: it is how a crawler reaches the hubs, and
 * it is restyled onto the system — four columns told apart by ink rules, each
 * headed by a mono uppercase micro-label. Under it, the design's closing ink
 * bar: a full-bleed inversion in mono capitals carrying the licence, the
 * "100 % local" line and the version.
 */

import { ChevronDown, GithubIcon } from "@/components/icons";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Wordmark } from "./Wordmark";
import { FOOTER_GROUPS, GITHUB_URL } from "./navigation";

// Package version is injected at build time by Vite via __APP_VERSION__.
// Falls back to "dev" when the constant is missing (eg. unit tests).
declare const __APP_VERSION__: string | undefined;
const APP_VERSION =
  typeof __APP_VERSION__ === "string" && __APP_VERSION__.length > 0
    ? __APP_VERSION__
    : "dev";

/**
 * @param bare  Ne rend que la barre d'encre, sans les quatre colonnes.
 *
 *   Pour les écrans applicatifs en `noindex` — le cockpit. La table de liens
 *   est là pour qu'un robot atteigne les hubs ; sur une page qu'aucun robot
 *   n'indexe elle ne fait donc AUCUN travail, et elle mesurait 439 px pour
 *   388 px de contenu : le pied de page était plus grand que la page, et
 *   pesait 48 % du défilement.
 *
 *   La barre reste : licence, « 100 % local », version. C'est la signature du
 *   projet libre, et elle tient en deux lignes.
 */
export function Footer({ bare = false }: { bare?: boolean }) {
  const { t } = useTranslation(["homepage", "common"]);
  const year = new Date().getFullYear();

  // Sous 900 px les groupes de liens se replient derrière leur intitulé — même
  // point de rupture que la pile de footer.css, les deux valeurs doivent rester
  // d'accord. Au-dessus, le DOM est celui d'avant au caractère près : le
  // prerender tourne à 1280 × 800 (scripts/prerender.ts), donc le HTML statique
  // que lit le crawler ne change pas d'un octet.
  const stacked = useMediaQuery("(max-width: 900px)");

  return (
    <footer className="zn-footer">
      {!bare && (
      <div className="zn-footer__body">
        <div className="zn-footer__col">
          <Link to="/" className="zn-footer__brand" aria-label={t("common:app.name")}>
            <Wordmark size={22} />
          </Link>
          <p className="zn-body zn-body--sm zn-muted zn-footer__tagline">
            {t("homepage:home.footer.tagline")}
          </p>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <FooterColumn
            key={group.titleKey}
            stacked={stacked}
            title={t(group.titleKey)}
            links={group.links.map((link) => ({
              label: t(link.labelKey),
              to: link.to,
              href: link.href,
            }))}
          />
        ))}
      </div>
      )}

      <div className="zn-footer__bar">
        <span>{t("homepage:home.footer.license", { year })}</span>
        {/* Static file emitted by scripts/generate-licenses.ts, not a route:
            plain <a>, so it escapes the SPA instead of hitting the router. */}
        <a href="/licenses.txt" target="_blank" rel="noopener noreferrer">
          {t("homepage:home.footer.licenses")}
        </a>
        <span>{t("homepage:home.footer.local")}</span>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          <GithubIcon />
          {t("homepage:home.footer.builtInPublic")}
        </a>
        <span className="zn-footer__version">
          {t("homepage:home.footer.version", { version: APP_VERSION })}
        </span>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  stacked,
}: {
  title: string;
  links: Array<{ label: string; to?: string; href?: string }>;
  stacked: boolean;
}) {
  const list = (
    <ul className="zn-footer__list">
      {links.map((link) => (
        <li key={link.label}>
          {link.to ? (
            <Link to={link.to} className="zn-footer__link">
              {link.label}
            </Link>
          ) : (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="zn-footer__link"
            >
              {link.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  );

  // Au-dessus de 900 px l'intitulé est une étiquette, pas une commande : c'est
  // le DOM d'aujourd'hui, à l'identique. Deux objets différents, deux éléments
  // différents — plutôt qu'un seul rendu inerte par du CSS, qui laisserait un
  // <summary> focusable mais sans effet.
  if (!stacked) {
    return (
      <div className="zn-footer__col">
        <span className="zn-kicker zn-footer__col-title">{title}</span>
        {list}
      </div>
    );
  }

  // name= : accordéon exclusif natif, comme les portes du menu mobile
  // (MobileMenu.tsx). Un seul groupe ouvert à la fois — c'est ce qui BORNE la
  // hauteur du pied : 538 px au pire, contre 740 px (111 % de vh) si les trois
  // pouvaient s'ouvrir ensemble.
  // Le <details> n'est pas contrôlé (aucune prop `open`) : React ne réécrit
  // jamais l'attribut, donc un pliage fait au doigt survit à tout re-render.
  return (
    <div className="zn-footer__col">
      <details className="zn-footer__group" name="zn-footer">
        <summary className="zn-kicker zn-footer__col-title">
          {title}
          <ChevronDown className="zn-footer__chevron" aria-hidden="true" />
        </summary>
        {list}
      </details>
    </div>
  );
}

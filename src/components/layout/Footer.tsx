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

import { GithubIcon } from "@/components/icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Wordmark } from "./Wordmark";

// Package version is injected at build time by Vite via __APP_VERSION__.
// Falls back to "dev" when the constant is missing (eg. unit tests).
declare const __APP_VERSION__: string | undefined;
const APP_VERSION =
  typeof __APP_VERSION__ === "string" && __APP_VERSION__.length > 0
    ? __APP_VERSION__
    : "dev";

const GITHUB_URL = "https://github.com/alarboulletmarin/zoned";

export function Footer() {
  const { t } = useTranslation(["homepage", "common"]);
  const year = new Date().getFullYear();

  return (
    <footer className="zn-footer">
      <div className="zn-footer__body">
        <div className="zn-footer__col">
          <Link to="/" className="zn-footer__brand" aria-label={t("common:app.name")}>
            <Wordmark size={22} />
          </Link>
          <p className="zn-body zn-body--sm zn-muted zn-footer__tagline">
            {t("homepage:home.footer.tagline")}
          </p>
        </div>

        <FooterColumn
          title={t("homepage:home.footer.groups.product")}
          links={[
            { label: t("homepage:home.footer.product.library"), to: "/library" },
            { label: t("homepage:home.footer.product.plans"), to: "/plans" },
            { label: t("homepage:home.footer.product.calculators"), to: "/calculators" },
            { label: t("homepage:home.footer.product.routes"), to: "/routes" },
          ]}
        />
        <FooterColumn
          title={t("homepage:home.footer.groups.science")}
          links={[
            { label: t("homepage:home.footer.science.methodology"), to: "/methodology" },
            { label: t("homepage:home.footer.science.glossary"), to: "/glossary" },
            { label: t("homepage:home.footer.science.guides"), to: "/guides" },
          ]}
        />
        <FooterColumn
          title={t("homepage:home.footer.groups.project")}
          links={[
            { label: t("homepage:home.footer.project.about"), to: "/about" },
            { label: t("common:compare.title"), to: "/compare" },
            { label: t("common:nav.contribute"), to: "/contribute" },
            { label: t("homepage:home.footer.project.changelog"), to: "/changelog" },
            { label: t("homepage:home.footer.project.github"), href: GITHUB_URL },
          ]}
        />
      </div>

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
}: {
  title: string;
  links: Array<{ label: string; to?: string; href?: string }>;
}) {
  return (
    <div className="zn-footer__col">
      <span className="zn-kicker zn-footer__col-title">{title}</span>
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
    </div>
  );
}

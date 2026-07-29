/**
 * Global footer — rich 4-column layout, applied to every page that isn't
 * fullscreen (see App.tsx FULLSCREEN_ROUTES).
 *
 * The previous compact 1-line footer lived here. It was promoted to this
 * shape when the landing redesign was propagated app-wide so the bottom
 * of every page reads consistently.
 */

import { GithubIcon } from "@/components/icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Logo from "@/assets/logo.svg?react";

// Package version is injected at build time by Vite via __APP_VERSION__.
// Falls back to "dev" when the constant is missing (eg. unit tests).
declare const __APP_VERSION__: string | undefined;
const APP_VERSION =
  typeof __APP_VERSION__ === "string" && __APP_VERSION__.length > 0
    ? __APP_VERSION__
    : "dev";

export function Footer() {
  const { t } = useTranslation(["homepage", "common"]);
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-screen left-1/2 -ml-[50vw] mt-8 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-10 md:py-16">
        {/* Mobile (md-): brand + tagline span full width on top, the three
            link columns sit side by side underneath. Desktop (md+): the
            brand block and the three columns share a single 4-col grid. */}
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8">
          <div className="max-w-md md:max-w-xs">
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-3 md:mb-4"
              aria-label="Zoned"
            >
              <Logo className="w-9 h-4.5 md:w-10 md:h-5" />
              <span className="font-bold text-base">
                {t("common:app.name")}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("homepage:home.footer.tagline")}
            </p>
          </div>

          {/* On mobile the three columns wrap in a 3-up grid; on md+
              `md:contents` flattens this wrapper so the parent 4-col
              grid takes over. */}
          <div className="grid grid-cols-3 gap-3 md:contents">
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
                {
                  label: t("homepage:home.footer.project.github"),
                  href: "https://github.com/alarboulletmarin/zoned",
                },
                { label: t("homepage:home.footer.project.changelog"), to: "/changelog" },
              ]}
            />
          </div>
        </div>

        <div className="mt-8 md:mt-10 pt-5 md:pt-6 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
          <p className="font-mono text-[10px] tracking-[0.16em] md:tracking-[0.18em] uppercase text-muted-foreground">
            {t("homepage:home.footer.license", { year })}
            <span aria-hidden className="opacity-40 mx-1.5">
              ·
            </span>
            {/* Static file emitted by scripts/generate-licenses.ts, not a route:
                plain <a>, so it escapes the SPA instead of hitting the router. */}
            <a
              href="/licenses.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t("homepage:home.footer.licenses")}
            </a>
          </p>
          <div className="flex items-center gap-3 md:gap-4 font-mono text-[10px] tracking-[0.16em] md:tracking-[0.18em] uppercase text-muted-foreground">
            <a
              href="https://github.com/alarboulletmarin/zoned"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <GithubIcon className="size-3.5" />
              {t("homepage:home.footer.builtInPublic")}
            </a>
            <span aria-hidden className="opacity-40">
              ·
            </span>
            <span>
              {t("homepage:home.footer.version", { version: APP_VERSION })}
            </span>
          </div>
        </div>
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
    <div className="min-w-0">
      <p className="font-mono text-[10px] tracking-[0.16em] md:tracking-[0.18em] uppercase text-muted-foreground mb-2.5 md:mb-3">
        {title}
      </p>
      <ul className="space-y-1.5 md:space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <Link
                to={link.to}
                className="text-xs md:text-sm text-foreground/80 hover:text-primary transition-colors break-words"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs md:text-sm text-foreground/80 hover:text-primary transition-colors break-words"
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

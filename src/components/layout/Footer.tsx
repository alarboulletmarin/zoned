import { GithubIcon } from "@/components/icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { categories } from "@/data/workouts";
import { useWorkouts } from "@/hooks";
import { useWhatsNew } from "@/hooks/useWhatsNew";
import Logo from "@/assets/logo.svg?react";

export function Footer() {
  const { t } = useTranslation("common");
  const currentYear = new Date().getFullYear();
  const { workouts } = useWorkouts();
  const { hasNewVersion } = useWhatsNew();

  return (
    <footer className="border-t py-4 md:py-5">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left: branding + stats */}
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <Logo className="w-12 h-6" />
              <span className="font-semibold text-sm hidden md:inline">{t("app.name")}</span>
            </Link>
            <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
              {workouts.length} {t("units.workouts")} · {categories.length}{" "}
              {t("units.categories")} · 6 {t("units.zones")}
            </span>
            <span className="text-xs text-muted-foreground hidden lg:inline">
              {t("privacy.footerNote")}
            </span>
          </div>

          {/* Right: links */}
          <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
            <span className="hidden lg:inline">© {currentYear}</span>
            <Link to="/about" className="hover:text-foreground transition-colors">
              {t("nav.about")}
            </Link>
            <Link to="/contribute" className="hover:text-foreground transition-colors hidden sm:inline">
              {t("nav.contribute")}
            </Link>
            <Link
              to="/changelog"
              className="hover:text-foreground transition-colors relative"
            >
              {t("nav.changelog")}
              {hasNewVersion && (
                <span className="absolute -top-1 -right-2 size-1.5 bg-primary rounded-full" />
              )}
            </Link>
            <a
              href="https://github.com/alarboulletmarin/zoned"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label={t("actions.viewRepo")}
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

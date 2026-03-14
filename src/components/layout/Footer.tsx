import { GitlabIcon } from "@/components/icons";
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
    <footer className="border-t py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Branding */}
          <Link to="/" className="flex items-center gap-2">
            <Logo className="w-12 h-6" />
            <span className="font-semibold">{t("app.name")}</span>
          </Link>

          {/* Stats */}
          <p className="text-sm text-muted-foreground text-center">
            {workouts.length} {t("units.workouts")} • {categories.length}{" "}
            {t("units.categories")} • 6 {t("units.zones")}
          </p>

          {/* Copyright, About & GitLab */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              © {currentYear} {t("app.name")}
            </p>
            <Link
              to="/about"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.about")}
            </Link>
            <Link
              to="/contribute"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.contribute")}
            </Link>
            <Link
              to="/changelog"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors relative"
            >
              {t("nav.changelog")}
              {hasNewVersion && (
                <span className="absolute -top-1 -right-2 size-1.5 bg-primary rounded-full" />
              )}
            </Link>
            <a
              href="https://gitlab.com/alarboulletmarin-oss/zoned"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t("actions.viewRepo")}
            >
              <GitlabIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

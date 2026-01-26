import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation("common");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <div className="intensity-bar w-4 h-4 rounded-full" />
            <span className="font-semibold">{t("app.name")}</span>
          </div>

          {/* Stats */}
          <p className="text-sm text-muted-foreground text-center">
            118 {t("units.workouts")} • 10 {t("units.categories")} • 6{" "}
            {t("units.zones")}
          </p>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © {currentYear} {t("app.name")}. Based on Planr training library.
          </p>
        </div>
      </div>
    </footer>
  );
}

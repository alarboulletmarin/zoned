import { useTranslation } from "react-i18next";
import { ZoneCalculator, PaceCalculator } from "@/components/domain";

export function SettingsPage() {
  const { t } = useTranslation("common");

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground">{t("settings.description")}</p>
      </div>

      <div className="space-y-6">
        <ZoneCalculator />
        <PaceCalculator />
      </div>
    </div>
  );
}

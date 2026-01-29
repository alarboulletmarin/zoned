import { useTranslation } from "react-i18next";
import { ZoneCalculator, PaceCalculator } from "@/components/domain";
import { SEOHead } from "@/components/seo";

export function MyZonesPage() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language === "en";

  return (
    <>
      <SEOHead
        noindex={true}
        title={isEn ? "My Zones" : "Mes Zones"}
        canonical="/my-zones"
      />
      <div className="py-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("myZones.title")}</h1>
          <p className="text-muted-foreground">{t("myZones.description")}</p>
        </div>

        <div className="space-y-6">
          <ZoneCalculator />
          <PaceCalculator />
        </div>
      </div>
    </>
  );
}

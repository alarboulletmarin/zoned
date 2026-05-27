import { useTranslation } from "react-i18next";
import { ZoneCalculator } from "@/components/domain/ZoneCalculator";
import { PaceCalculator } from "@/components/domain/PaceCalculator";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";

export function MyZonesPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <SEOHead
        noindex={true}
        title={t("seo.myZones")}
        canonical="/my-zones"
      />
      <div className="py-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <EditorialTitle as="h1" size="md">{t("myZones.title")}</EditorialTitle>
          <FadeUp as="p" delay={0.1} className="text-muted-foreground">
            {t("myZones.description")}
          </FadeUp>
        </div>

        <div className="space-y-6">
          <ZoneCalculator />
          <PaceCalculator />
        </div>
      </div>
    </>
  );
}

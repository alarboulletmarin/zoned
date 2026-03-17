import { useTranslation } from "react-i18next";
import { ZoneCalculator } from "@/components/domain/ZoneCalculator";
import { SEOHead } from "@/components/seo";

export function ZonesCalculatorPage() {
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  return (
    <>
      <SEOHead
        title={isEn ? "Training Zones Calculator" : "Calculateur de Zones d'Entraînement"}
        description={
          isEn
            ? "Calculate your heart rate and pace training zones from your VMA or max HR."
            : "Calculez vos zones de fréquence cardiaque et d'allure depuis votre VMA ou FCmax."
        }
        canonical="/calculateurs/zones"
      />
      <div className="py-8 max-w-2xl mx-auto">
        <ZoneCalculator />
      </div>
    </>
  );
}

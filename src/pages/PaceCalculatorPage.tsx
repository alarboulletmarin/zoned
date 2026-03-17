import { useTranslation } from "react-i18next";
import { PaceCalculator } from "@/components/domain/PaceCalculator";
import { SEOHead } from "@/components/seo";

export function PaceCalculatorPage() {
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  return (
    <>
      <SEOHead
        title={isEn ? "Race Pace Calculator" : "Calculateur d'Allures de Course"}
        description={
          isEn
            ? "Estimate your race times from 5K to marathon based on your VMA."
            : "Estimez vos temps de course du 5K au marathon à partir de votre VMA."
        }
        canonical="/calculateurs/allures"
      />
      <div className="py-8 max-w-2xl mx-auto">
        <PaceCalculator />
      </div>
    </>
  );
}

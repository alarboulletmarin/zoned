import { useTranslation } from "react-i18next";
import { Gauge } from "@/components/icons";
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
        canonical="/calculators/allures"
        jsonLd={{
          "@type": "WebApplication",
          name: isEn
            ? "Race Pace Calculator"
            : "Calculateur d'Allures de Course",
          description: isEn
            ? "Estimate your race times from 5K to marathon based on your VMA"
            : "Estimez vos temps de course du 5K au marathon à partir de votre VMA",
          url: "https://zoned.run/calculators/allures",
          applicationCategory: "SportsApplication",
        }}
      />
      <div className="py-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Gauge className="size-8 text-primary" />
            {isEn
              ? "Race Pace Calculator"
              : "Calculateur d'allures de course"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isEn
              ? "Enter your VMA to estimate your race paces and predicted finish times for distances from 5K to marathon."
              : "Entrez votre VMA pour estimer vos allures de course et vos temps prévisionnels du 5 km au marathon."}
          </p>
        </div>

        <PaceCalculator />
      </div>
    </>
  );
}

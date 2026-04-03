import { useTranslation } from "react-i18next";
import { Activity } from "@/components/icons";
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
            ? "Calculate your 6 heart rate and pace training zones from VMA or max HR. Free tool to personalize your running zones with FC ranges and pace targets."
            : "Calculez vos 6 zones d'entraînement course à pied (FC et allure) depuis votre VMA ou FCmax. Outil gratuit pour calculer vos zones de fréquence cardiaque."
        }
        canonical="/calculators/zones"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: isEn
              ? "Training Zones Calculator"
              : "Calculateur de Zones d'Entraînement",
            description: isEn
              ? "Calculate your 6 heart rate and pace training zones from your VMA or max HR"
              : "Calculez vos 6 zones de fréquence cardiaque et d'allure depuis votre VMA ou FCmax",
            url: "https://zoned.run/calculators/zones",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: isEn ? "Calculators" : "Calculateurs", item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: isEn ? "Training Zones" : "Zones d'entraînement" },
            ],
          },
        ]}
      />
      <div className="py-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Activity className="size-8 text-primary" />
            {isEn
              ? "Training Zones Calculator"
              : "Calculateur de zones d'entraînement"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isEn
              ? "Enter your max heart rate (FCmax) or VMA to calculate your 6 personalized training zones with heart rate ranges and pace targets."
              : "Entrez votre fréquence cardiaque maximale (FCmax) ou votre VMA pour calculer vos 6 zones d'entraînement personnalisées avec les plages de fréquence cardiaque et les allures cibles."}
          </p>
        </div>

        <ZoneCalculator />
      </div>
    </>
  );
}

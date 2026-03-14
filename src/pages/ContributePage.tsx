import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { ContributeForm } from "@/components/domain/contribute/ContributeForm";

export function ContributePage() {
  const { t, i18n } = useTranslation("contribute");
  const isEn = i18n.language?.startsWith("en") ?? false;

  return (
    <>
      <SEOHead
        title={isEn ? "Contribute" : "Contribuer"}
        description={
          isEn
            ? "Share your favorite training sessions with the Zoned community"
            : "Partagez vos seances d'entrainement preferees avec la communaute Zoned"
        }
        canonical="/contribute"
      />
      <div className="py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <ContributeForm />
        </div>
      </div>
    </>
  );
}

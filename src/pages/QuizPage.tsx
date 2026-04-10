import { useTranslation } from "react-i18next";
import { WorkoutQuiz } from "@/components/domain/WorkoutQuiz";
import { SEOHead } from "@/components/seo";

export function QuizPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <SEOHead
        title={t("seo.quiz")}
        description={t("seo.quizDesc")}
        canonical="/quiz"
        jsonLd={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
            { "@type": "ListItem", position: 2, name: "Quiz" },
          ],
        }}
      />
      <WorkoutQuiz />
    </>
  );
}

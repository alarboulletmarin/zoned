import { useTranslation } from "react-i18next";
import { WorkoutQuiz } from "@/components/domain/WorkoutQuiz";
import { SEOHead } from "@/components/seo";

export function QuizPage() {
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  return (
    <>
      <SEOHead
        title={isEn ? "Workout Quiz" : "Quiz d'entraînement"}
        description={isEn
          ? "Answer a few questions to find the perfect running workout for your goals and fitness level."
          : "Répondez à quelques questions pour trouver la séance de course parfaite pour vos objectifs."}
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

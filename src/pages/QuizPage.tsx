import { useTranslation } from "react-i18next";
import { WorkoutQuiz } from "@/components/domain/WorkoutQuiz";
import { SEOHead } from "@/components/seo";

export function QuizPage() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  return (
    <>
      <SEOHead
        title={isEn ? "Workout Quiz" : "Quiz d'entraînement"}
        description={isEn
          ? "Answer a few questions to find the perfect running workout for your goals and fitness level."
          : "Répondez à quelques questions pour trouver la séance de course parfaite pour vos objectifs."}
        canonical="/quiz"
      />
      <div className="py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{t("quiz.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("quiz.subtitle")}</p>
        </div>

        {/* Quiz Component */}
        <WorkoutQuiz />
      </div>
    </>
  );
}

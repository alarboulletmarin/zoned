import { useTranslation } from "react-i18next";
import { WorkoutQuiz } from "@/components/domain";

export function QuizPage() {
  const { t } = useTranslation("common");

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{t("quiz.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("quiz.subtitle")}</p>
      </div>

      {/* Quiz Component */}
      <WorkoutQuiz />
    </div>
  );
}

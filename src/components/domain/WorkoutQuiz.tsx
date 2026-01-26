import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, RotateCcw, Target, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkoutCard } from "./WorkoutCard";
import { cn } from "@/lib/utils";
import { allWorkouts } from "@/data/workouts";
import {
  getRecommendedWorkouts,
  isQuizComplete,
  type Goal,
  type TimeAvailable,
  type Environment,
  type QuizAnswers,
} from "@/lib/quizLogic";
import type { WorkoutTemplate } from "@/types";

// Quiz step definition
type QuizStep = 1 | 2 | 3 | "results";

interface QuizOption<T extends string> {
  value: T;
  labelKey: string;
  icon?: React.ReactNode;
}

const GOAL_OPTIONS: QuizOption<Goal>[] = [
  { value: "recover", labelKey: "quiz.recover" },
  { value: "progress", labelKey: "quiz.progress" },
  { value: "perform", labelKey: "quiz.perform" },
];

const TIME_OPTIONS: QuizOption<TimeAvailable>[] = [
  { value: "short", labelKey: "quiz.short" },
  { value: "medium", labelKey: "quiz.medium" },
  { value: "long", labelKey: "quiz.long" },
];

const ENVIRONMENT_OPTIONS: QuizOption<Environment>[] = [
  { value: "anywhere", labelKey: "quiz.anywhere" },
  { value: "track", labelKey: "quiz.track" },
  { value: "hills", labelKey: "quiz.hills" },
];

const QUIZ_STORAGE_KEY = "zoned-quiz-results";

interface StoredQuizState {
  answers: QuizAnswers;
  resultIds: string[];
  isExactMatch: boolean;
}

export function WorkoutQuiz() {
  const { t } = useTranslation("common");
  const [step, setStep] = useState<QuizStep>(1);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [results, setResults] = useState<WorkoutTemplate[]>([]);
  const [isExactMatch, setIsExactMatch] = useState(true);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  // Restore results from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(QUIZ_STORAGE_KEY);
      if (stored) {
        const { answers: storedAnswers, resultIds, isExactMatch: storedIsExactMatch } = JSON.parse(stored) as StoredQuizState;
        const restoredResults = resultIds
          .map((id) => allWorkouts.find((w) => w.id === id))
          .filter((w): w is WorkoutTemplate => w !== undefined);

        if (restoredResults.length > 0) {
          setAnswers(storedAnswers);
          setResults(restoredResults);
          setIsExactMatch(storedIsExactMatch ?? true);
          setStep("results");
        }
      }
    } catch {
      // Ignore parsing errors
    }
  }, []);

  const handleGoalSelect = useCallback((goal: Goal) => {
    setAnswers((prev) => ({ ...prev, goal }));
    setDirection("forward");
    setStep(2);
  }, []);

  const handleTimeSelect = useCallback((time: TimeAvailable) => {
    setAnswers((prev) => ({ ...prev, time }));
    setDirection("forward");
    setStep(3);
  }, []);

  const handleEnvironmentSelect = useCallback(
    (environment: Environment) => {
      const newAnswers = { ...answers, environment };
      setAnswers(newAnswers);
      setDirection("forward");

      if (isQuizComplete(newAnswers)) {
        const { workouts, isExactMatch: exact } = getRecommendedWorkouts(newAnswers, allWorkouts, 3);
        setResults(workouts);
        setIsExactMatch(exact);
        setStep("results");

        // Save to sessionStorage for back navigation
        const toStore: StoredQuizState = {
          answers: newAnswers as QuizAnswers,
          resultIds: workouts.map((w) => w.id),
          isExactMatch: exact,
        };
        sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(toStore));
      }
    },
    [answers]
  );

  const handleBack = useCallback(() => {
    setDirection("backward");
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === "results") {
      setStep(3);
    }
  }, [step]);

  const handleRestart = useCallback(() => {
    setDirection("backward");
    setAnswers({});
    setResults([]);
    setIsExactMatch(true);
    setStep(1);
    sessionStorage.removeItem(QUIZ_STORAGE_KEY);
  }, []);

  const getStepNumber = (): number => {
    if (step === "results") return 3;
    return step;
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <span>
          {t("quiz.step")} {getStepNumber()}/3
        </span>
        {step !== 1 && step !== "results" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-auto p-0 hover:bg-transparent"
          >
            <ArrowLeft className="size-4 mr-1" />
            {t("quiz.back")}
          </Button>
        )}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${(getStepNumber() / 3) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderOptionCard = <T extends string>(
    option: QuizOption<T>,
    isSelected: boolean,
    onClick: () => void,
    icon?: React.ReactNode
  ) => (
    <Card
      key={option.value}
      interactive
      className={cn(
        "cursor-pointer transition-all duration-200",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center gap-4">
        {icon && (
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <span className="font-medium text-lg">{t(option.labelKey)}</span>
      </CardContent>
    </Card>
  );

  const renderStep1 = () => (
    <div
      className={cn(
        "space-y-4",
        direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      <div className="text-center mb-6">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Target className="size-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{t("quiz.goalQuestion")}</h2>
        <p className="text-muted-foreground mt-1">{t("quiz.goalHint")}</p>
      </div>
      {GOAL_OPTIONS.map((option) =>
        renderOptionCard(option, answers.goal === option.value, () =>
          handleGoalSelect(option.value)
        )
      )}
    </div>
  );

  const renderStep2 = () => (
    <div
      className={cn(
        "space-y-4",
        direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      <div className="text-center mb-6">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Clock className="size-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{t("quiz.timeQuestion")}</h2>
        <p className="text-muted-foreground mt-1">{t("quiz.timeHint")}</p>
      </div>
      {TIME_OPTIONS.map((option) =>
        renderOptionCard(option, answers.time === option.value, () =>
          handleTimeSelect(option.value)
        )
      )}
    </div>
  );

  const renderStep3 = () => (
    <div
      className={cn(
        "space-y-4",
        direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      <div className="text-center mb-6">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <MapPin className="size-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{t("quiz.environmentQuestion")}</h2>
        <p className="text-muted-foreground mt-1">{t("quiz.environmentHint")}</p>
      </div>
      {ENVIRONMENT_OPTIONS.map((option) =>
        renderOptionCard(option, answers.environment === option.value, () =>
          handleEnvironmentSelect(option.value)
        )
      )}
    </div>
  );

  const renderResults = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold">{t("quiz.results")}</h2>
        <p className="text-muted-foreground mt-1">
          {isExactMatch ? t("quiz.resultsHint") : t("quiz.resultsHintApprox")}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {results.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {t("quiz.noResults")}
        </div>
      )}

      <div className="flex justify-center">
        <Button onClick={handleRestart} variant="outline">
          <RotateCcw className="size-4 mr-2" />
          {t("quiz.restart")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {step !== "results" && renderProgressBar()}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === "results" && renderResults()}
    </div>
  );
}

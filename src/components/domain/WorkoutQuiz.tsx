import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, RotateCcw, Target, Clock, MapPin, Library, Users, Zap } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkoutCard } from "./WorkoutCard";
import { cn } from "@/lib/utils";
import { useWorkouts } from "@/hooks";
import {
  getRecommendedWorkouts,
  isQuizComplete,
  type Goal,
  type TimeAvailable,
  type Environment,
  type Experience,
  type Weakness,
  type QuizAnswers,
} from "@/lib/quizLogic";
import type { WorkoutTemplate } from "@/types";

const TOTAL_STEPS = 5;
type QuizStep = 1 | 2 | 3 | 4 | 5 | "results";

interface QuizOption<T extends string> {
  value: T;
  labelKey: string;
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

const EXPERIENCE_OPTIONS: QuizOption<Experience>[] = [
  { value: "beginner", labelKey: "quiz.beginner" },
  { value: "intermediate", labelKey: "quiz.intermediate" },
  { value: "advanced", labelKey: "quiz.advanced" },
];

const WEAKNESS_OPTIONS: QuizOption<Weakness>[] = [
  { value: "speed", labelKey: "quiz.speed" },
  { value: "endurance", labelKey: "quiz.enduranceWeakness" },
  { value: "both", labelKey: "quiz.both" },
];

const QUIZ_STORAGE_KEY = "zoned-quiz-results";

interface StoredQuizState {
  answers: QuizAnswers;
  resultIds: string[];
  isExactMatch: boolean;
}

function buildLibraryParams(answers: QuizAnswers): URLSearchParams {
  const params = new URLSearchParams();

  if (answers.goal === "recover") {
    params.set("category", "recovery");
  } else if (answers.goal === "progress") {
    if (answers.weakness === "speed") {
      params.set("category", "tempo");
    } else if (answers.weakness === "endurance") {
      params.set("category", "long_run");
    } else if (answers.time === "short" || answers.time === "medium") {
      params.set("category", "tempo");
    } else {
      params.set("category", "long_run");
    }
  } else if (answers.goal === "perform") {
    if (answers.environment === "track") {
      params.set("category", "vma_intervals");
    } else if (answers.environment === "hills") {
      params.set("category", "hills");
    } else {
      params.set("category", "tempo");
    }
  }

  if (answers.time === "short") {
    params.set("maxDuration", "30");
  } else if (answers.time === "medium") {
    params.set("maxDuration", "60");
  }

  if (answers.environment === "track") {
    params.set("terrain", "track");
  } else if (answers.environment === "hills") {
    params.set("terrain", "hills");
  }

  return params;
}

export function WorkoutQuiz() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { workouts: allWorkouts } = useWorkouts();
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

  const goForward = useCallback((nextStep: QuizStep) => {
    setDirection("forward");
    setStep(nextStep);
  }, []);

  const handleSelect = useCallback(<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K], nextStep: QuizStep | "compute") => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (nextStep === "compute" && isQuizComplete(newAnswers)) {
      const { workouts, isExactMatch: exact } = getRecommendedWorkouts(newAnswers, allWorkouts, 6);
      setResults(workouts);
      setIsExactMatch(exact);
      setDirection("forward");
      setStep("results");

      const toStore: StoredQuizState = {
        answers: newAnswers as QuizAnswers,
        resultIds: workouts.map((w) => w.id),
        isExactMatch: exact,
      };
      sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(toStore));
    } else if (nextStep !== "compute") {
      goForward(nextStep);
    }
  }, [answers, allWorkouts, goForward]);

  const handleBack = useCallback(() => {
    setDirection("backward");
    if (step === "results") setStep(5);
    else if (typeof step === "number" && step > 1) setStep((step - 1) as QuizStep);
  }, [step]);

  const handleRestart = useCallback(() => {
    setDirection("backward");
    setAnswers({});
    setResults([]);
    setIsExactMatch(true);
    setStep(1);
    sessionStorage.removeItem(QUIZ_STORAGE_KEY);
  }, []);

  const handleSeeMore = useCallback(() => {
    if (isQuizComplete(answers)) {
      const params = buildLibraryParams(answers);
      navigate(`/library?${params.toString()}`);
    }
  }, [answers, navigate]);

  const getStepNumber = (): number => {
    if (step === "results") return TOTAL_STEPS;
    return step;
  };

  const renderProgressDots = () => (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
        <div
          key={s}
          className={cn(
            "size-2.5 rounded-full transition-colors",
            getStepNumber() >= s ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
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
      <CardContent className="p-3 md:p-5 flex items-center gap-3 md:gap-4">
        {icon && (
          <div className="size-9 md:size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <span className="font-medium text-base md:text-lg">{t(option.labelKey)}</span>
      </CardContent>
    </Card>
  );

  const renderQuestionStep = (
    stepNumber: number,
    icon: React.ReactNode,
    questionKey: string,
    hintKey: string,
    options: QuizOption<string>[],
    selectedValue: string | undefined,
    onSelect: (value: string) => void
  ) => (
    <div
      className={cn(
        "flex-1 flex flex-col",
        direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"
      )}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="size-12 md:size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-center">{t(questionKey)}</h2>
        <p className="text-sm text-muted-foreground mt-1 text-center">{t(hintKey)}</p>
        <div className="w-full max-w-sm space-y-2 mt-6">
          {options.map((option) =>
            renderOptionCard(option, selectedValue === option.value, () => onSelect(option.value))
          )}
        </div>
      </div>
      {stepNumber > 1 && (
        <div className="py-3 flex justify-center">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="size-4 mr-1" />
            {t("quiz.back")}
          </Button>
        </div>
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

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button onClick={handleSeeMore} variant="outline">
          <Library className="size-4 mr-2" />
          {t("quiz.seeMore")}
        </Button>
        <Button onClick={handleRestart} variant="ghost">
          <RotateCcw className="size-4 mr-2" />
          {t("quiz.restart")}
        </Button>
      </div>
    </div>
  );

  // Results page scrolls normally; quiz steps use full viewport
  if (step === "results") {
    return (
      <div className="max-w-3xl mx-auto py-8">
        {renderResults()}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-8rem)] md:min-h-0 md:py-8 max-w-2xl mx-auto">
      {renderProgressDots()}

      {step === 1 && renderQuestionStep(1,
        <Target className="size-6 md:size-8 text-primary" />,
        "quiz.goalQuestion", "quiz.goalHint",
        GOAL_OPTIONS, answers.goal,
        (v) => handleSelect("goal", v as Goal, 2)
      )}
      {step === 2 && renderQuestionStep(2,
        <Clock className="size-6 md:size-8 text-primary" />,
        "quiz.timeQuestion", "quiz.timeHint",
        TIME_OPTIONS, answers.time,
        (v) => handleSelect("time", v as TimeAvailable, 3)
      )}
      {step === 3 && renderQuestionStep(3,
        <MapPin className="size-6 md:size-8 text-primary" />,
        "quiz.environmentQuestion", "quiz.environmentHint",
        ENVIRONMENT_OPTIONS, answers.environment,
        (v) => handleSelect("environment", v as Environment, 4)
      )}
      {step === 4 && renderQuestionStep(4,
        <Users className="size-6 md:size-8 text-primary" />,
        "quiz.experienceQuestion", "quiz.experienceHint",
        EXPERIENCE_OPTIONS, answers.experience,
        (v) => handleSelect("experience", v as Experience, 5)
      )}
      {step === 5 && renderQuestionStep(5,
        <Zap className="size-6 md:size-8 text-primary" />,
        "quiz.weaknessQuestion", "quiz.weaknessHint",
        WEAKNESS_OPTIONS, answers.weakness,
        (v) => handleSelect("weakness", v as Weakness, "compute")
      )}
    </div>
  );
}

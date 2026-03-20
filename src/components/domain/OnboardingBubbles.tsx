import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "zoned-onboarding-seen";

interface Step {
  titleKey: string;
  descKey: string;
  action?: { labelKey: string; to: string };
  position: "top-center" | "bottom-left";
}

const STEPS: Step[] = [
  {
    titleKey: "onboarding.step1Title",
    descKey: "onboarding.step1Desc",
    position: "top-center",
  },
  {
    titleKey: "onboarding.step2Title",
    descKey: "onboarding.step2Desc",
    action: { labelKey: "onboarding.step2Action", to: "/quiz" },
    position: "top-center",
  },
  {
    titleKey: "onboarding.step3Title",
    descKey: "onboarding.step3Desc",
    action: { labelKey: "onboarding.step3Action", to: "/library" },
    position: "top-center",
  },
  {
    titleKey: "onboarding.step4Title",
    descKey: "onboarding.step4Desc",
    action: { labelKey: "onboarding.step4Action", to: "/plan/new" },
    position: "top-center",
  },
];

export function OnboardingBubbles() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== "true"
  );

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }, []);

  const next = useCallback(() => {
    if (step >= STEPS.length - 1) {
      dismiss();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, dismiss]);

  const goTo = useCallback((to: string) => {
    dismiss();
    navigate(to);
  }, [dismiss, navigate]);

  // Close on Escape
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, dismiss]);

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <>
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={dismiss}
      />

      {/* Bubble */}
      <div className="fixed z-50 top-24 left-1/2 -translate-x-1/2 w-[min(360px,calc(100vw-2rem))] animate-fade-in">
        {/* Arrow pointing up */}
        <div className="flex justify-center mb-1">
          <div className="size-3 rotate-45 bg-card border-l border-t rounded-tl-sm" />
        </div>

        <div className="bg-card border rounded-xl shadow-lg p-5">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <h3 className="font-semibold text-sm mb-1">{t(current.titleKey)}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t(current.descKey)}</p>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={dismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("onboarding.skipAll")}
            </button>

            <div className="flex items-center gap-2">
              {current.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goTo(current.action!.to)}
                >
                  {t(current.action.labelKey)}
                </Button>
              )}
              <Button size="sm" onClick={next}>
                {step >= STEPS.length - 1
                  ? t("onboarding.dismiss")
                  : t("onboarding.next")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

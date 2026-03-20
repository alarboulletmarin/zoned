import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "zoned-onboarding-seen";

interface Step {
  titleKey: string;
  descKey: string;
  target: string; // data-onboarding value
  action?: { labelKey: string; to: string };
}

const STEPS: Step[] = [
  {
    titleKey: "onboarding.step1Title",
    descKey: "onboarding.step1Desc",
    target: "library",
  },
  {
    titleKey: "onboarding.step2Title",
    descKey: "onboarding.step2Desc",
    target: "quiz",
    action: { labelKey: "onboarding.step2Action", to: "/quiz" },
  },
  {
    titleKey: "onboarding.step3Title",
    descKey: "onboarding.step3Desc",
    target: "library",
    action: { labelKey: "onboarding.step3Action", to: "/library" },
  },
  {
    titleKey: "onboarding.step4Title",
    descKey: "onboarding.step4Desc",
    target: "plans",
    action: { labelKey: "onboarding.step4Action", to: "/plan/new" },
  },
];

export function OnboardingBubbles() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== "true"
  );
  const [pos, setPos] = useState<{ top: number; left: number; arrowLeft: number } | null>(null);

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

  // Position bubble next to target element
  useEffect(() => {
    if (!visible) return;

    const updatePosition = () => {
      const current = STEPS[step];
      const el = document.querySelector(`[data-onboarding="${current.target}"]`);
      if (!el) {
        // Fallback: center of screen
        setPos({ top: 80, left: window.innerWidth / 2 - 170, arrowLeft: 170 });
        return;
      }

      const rect = el.getBoundingClientRect();
      const bubbleWidth = 340;

      // Position to the right of the element, vertically centered
      let top = rect.top + rect.height / 2 - 60;
      let left = rect.right + 16;
      let arrowLeft = -6;

      // If no room on the right, position below
      if (left + bubbleWidth > window.innerWidth - 16) {
        left = Math.max(16, rect.left + rect.width / 2 - bubbleWidth / 2);
        top = rect.bottom + 12;
        arrowLeft = Math.min(bubbleWidth / 2, Math.max(20, rect.left + rect.width / 2 - left));
      }

      // Keep in viewport
      top = Math.max(8, Math.min(top, window.innerHeight - 250));
      left = Math.max(8, Math.min(left, window.innerWidth - bubbleWidth - 8));

      setPos({ top, left, arrowLeft });

      // Highlight the target element
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    // Slight delay to let layout settle
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener("resize", updatePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
    };
  }, [visible, step]);

  // Highlight target element
  useEffect(() => {
    if (!visible) return;
    const current = STEPS[step];
    const el = document.querySelector(`[data-onboarding="${current.target}"]`);

    if (el) {
      (el as HTMLElement).style.position = "relative";
      (el as HTMLElement).style.zIndex = "45";
      (el as HTMLElement).style.borderRadius = "8px";
      (el as HTMLElement).style.boxShadow = "0 0 0 4px rgba(var(--primary-rgb, 249 115 22) / 0.3)";
    }

    return () => {
      if (el) {
        (el as HTMLElement).style.position = "";
        (el as HTMLElement).style.zIndex = "";
        (el as HTMLElement).style.boxShadow = "";
      }
    };
  }, [visible, step]);

  // Close on Escape
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, dismiss]);

  if (!visible || !pos) return null;

  const current = STEPS[step];

  return (
    <>
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={dismiss}
      />

      {/* Bubble */}
      <div
        ref={bubbleRef}
        className="fixed z-50 w-[340px] animate-fade-in"
        style={{ top: pos.top, left: pos.left }}
      >
        <div className="bg-card border rounded-xl shadow-xl p-5">
          {/* Progress bar */}
          <div className="flex items-center gap-1 mb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">{step + 1}/{STEPS.length}</span>
          </div>

          <h3 className="font-semibold text-sm mb-1">{t(current.titleKey)}</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t(current.descKey)}</p>

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

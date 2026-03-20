import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardCheck, BookOpen, CalendarRange } from "@/components/icons";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "zoned-onboarding-seen";

export function OnboardingCard() {
  const { t } = useTranslation("common");
  const [visible, setVisible] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== "true"
  );

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  const paths = [
    {
      to: "/quiz",
      icon: ClipboardCheck,
      label: t("onboarding.quiz"),
      hint: t("onboarding.quizHint"),
      color: "border-t-primary",
    },
    {
      to: "/library",
      icon: BookOpen,
      label: t("onboarding.library"),
      hint: t("onboarding.libraryHint"),
      color: "border-t-zone-3",
    },
    {
      to: "/plan/new",
      icon: CalendarRange,
      label: t("onboarding.plan"),
      hint: t("onboarding.planHint"),
      color: "border-t-zone-5",
    },
  ];

  return (
    <section className="rounded-2xl border bg-card p-6 md:p-8 mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-1">
        {t("onboarding.title")}
      </h2>
      <p className="text-muted-foreground mb-6">
        {t("onboarding.description")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {paths.map(({ to, icon: Icon, label, hint, color }) => (
          <Link
            key={to}
            to={to}
            onClick={dismiss}
            className={`rounded-lg border ${color} border-t-4 bg-background p-4 hover:bg-accent/50 transition-colors group`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="font-semibold text-sm">{label}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {hint}
            </p>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Link
          to="/my-zones"
          onClick={dismiss}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("onboarding.zones")}
        </Link>
        <Button
          variant="secondary"
          className="rounded-full"
          onClick={dismiss}
        >
          {t("onboarding.dismiss")}
        </Button>
      </div>
    </section>
  );
}

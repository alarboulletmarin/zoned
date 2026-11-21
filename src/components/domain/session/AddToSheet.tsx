import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useHeld } from "@/components/ui/native-dialog";
import { toast } from "@/components/ui/toast";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { useIsEnglish, usePickLang } from "@/lib/i18n-utils";
import { getAllPlans } from "@/lib/planStorage";
import { loadTodayComposition } from "@/lib/todayComposition";
import {
  addToDate,
  addToPlanWeek,
  dateInWeek,
  destinationForDate,
  followedPlans,
  savedWeeks,
  undoAdd,
  weekdayIndex,
  type AddLabels,
  type AddResult,
} from "@/lib/addToSchedule";
import type { WorkoutTemplate } from "@/types";

type Target = "today" | "day" | "plan" | "template";

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

interface AddToSheetProps {
  workout: WorkoutTemplate;
  durationMin: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Du bas sur un téléphone, du côté au-delà. */
  side: "bottom" | "right";
}

/**
 * La feuille Ajouter à… : où poser la séance, en quatre choix, puis un seul
 * bouton vermillon dont le texte suit le choix. Le branchement est dans
 * `lib/addToSchedule.ts`, la feuille ne fait que choisir.
 *
 * Elle relit les plans et la composition à chaque ouverture : la page de
 * séance ne les tient pas, et ils ont pu changer dans un autre onglet.
 */
export function AddToSheet({ workout, durationMin, open, onOpenChange, side }: AddToSheetProps) {
  const { t } = useTranslation(["session", "plan", "today"]);
  const isEn = useIsEnglish();
  const pick = usePickLang();
  const name = pick(workout, "name");

  // Ce que la feuille sait du monde, relu quand elle s'ouvre.
  const freshWorld = useMemo(() => {
    if (!open) return null;
    const today = new Date();
    const plans = getAllPlans();
    const composition = loadTodayComposition();
    return {
      today,
      plans,
      composition,
      followed: followedPlans(plans, composition, today, isEn),
      templates: savedWeeks(plans),
    };
  }, [open, isEn]);

  // Tenu le temps de la sortie : fermée, la feuille ne relit plus rien.
  const world = useHeld(freshWorld);
  const todayIndex = world ? weekdayIndex(world.today) : 0;
  const [target, setTarget] = useState<Target>("today");
  const [day, setDay] = useState<number | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planWeek, setPlanWeek] = useState<number | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);

  if (!world) return null;

  const chosenDay = day ?? todayIndex;
  const followed = world.followed;
  const plan = followed.find((f) => f.plan.id === planId) ?? followed[0];
  const chosenPlanWeek = planWeek ?? plan?.currentWeek ?? 1;
  const template = world.templates.find((w) => w.id === templateId) ?? world.templates[0];

  const dayName = (index: number) => {
    const label = t(`plan:days.${index}`);
    return isEn ? label : label.toLocaleLowerCase("fr");
  };
  const dateFormat = new Intl.DateTimeFormat(isEn ? "en-GB" : "fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const destinationName = (date: Date) => {
    const destination = destinationForDate(world.plans, world.composition, date, world.today, isEn);
    return destination.kind === "source" ? destination.name : t("session:addTo.freshWeek");
  };

  const options: { value: Target; label: string; sub: string }[] = [
    {
      value: "today",
      label: t("session:addTo.today"),
      sub: `${dateFormat.format(world.today)} · ${destinationName(world.today)}`,
    },
    {
      value: "day",
      label: t("session:addTo.day"),
      sub: t("session:addTo.daySub", { week: isoWeekNumber(world.today) }),
    },
  ];
  if (plan) {
    options.push({
      value: "plan",
      label: t("session:addTo.plan"),
      sub: t("session:addTo.planSub", { name: plan.name, week: plan.currentWeek }),
    });
  }
  options.push({
    value: "template",
    label: t("session:addTo.template"),
    sub: t("session:addTo.templateSub"),
  });

  const templateName = template ? (isEn && template.nameEn) || template.name : "";
  const confirm = {
    today: t("session:addTo.confirmToday"),
    day: t("session:addTo.confirmDay", { day: dayName(chosenDay) }),
    plan: t("session:addTo.confirmPlan", { day: dayName(chosenDay), week: chosenPlanWeek }),
    template: t("session:addTo.confirmTemplate", { day: dayName(chosenDay), name: templateName }),
  }[target];
  const canConfirm = target !== "template" || template != null;

  const reset = () => {
    setTarget("today");
    setDay(null);
    setPlanId(null);
    setPlanWeek(null);
    setTemplateId(null);
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    const labels: AddLabels = {
      label: t("session:addTo.snapshot", { name: workout.name, lng: "fr" }),
      labelEn: t("session:addTo.snapshot", { name: workout.nameEn ?? workout.name, lng: "en" }),
      freshWeekName: "",
    };

    let result: AddResult | null = null;
    let message = "";
    let link: { to: string; label: string } | null = null;

    if (target === "today" || target === "day") {
      const date = target === "today" ? world.today : dateInWeek(world.today, chosenDay);
      const monday = dateInWeek(date, 0);
      labels.freshWeekName = t("today:add.newWeekName", {
        date: monday.toLocaleDateString(isEn ? "en-GB" : "fr-FR", { day: "numeric", month: "short" }),
      });
      result = addToDate(workout, date, labels, world.today);
      message = t("session:addTo.done", {
        day: dayName(weekdayIndex(date)),
        date: date.getDate(),
      });
      link = { to: "/today", label: t("session:addTo.openToday") };
    } else if (target === "plan" && plan) {
      result = addToPlanWeek(workout, plan.plan.id, chosenPlanWeek, chosenDay, labels);
      message = t("session:addTo.donePlan", { name: plan.name, day: dayName(chosenDay), week: chosenPlanWeek });
      link = { to: `/plan/${plan.plan.id}?week=${chosenPlanWeek}`, label: t("session:addTo.openPlan") };
    } else if (target === "template" && template) {
      result = addToPlanWeek(workout, template.id, 1, chosenDay, labels);
      message = t("session:addTo.doneTemplate", { name: templateName, day: dayName(chosenDay) });
      link = { to: `/weeks/${template.id}`, label: t("session:addTo.openWeek") };
    }

    close();
    if (!result) {
      toast.error(t("session:addTo.failed"));
      return;
    }
    const added = result;
    toast.success(message, {
      description: link ? (
        <Link to={link.to} className="zn-addto__toast-link">
          {link.label}
        </Link>
      ) : undefined,
      action: {
        label: t("session:addTo.undo"),
        onClick: () => {
          if (undoAdd(added)) toast.info(t("session:addTo.undone"));
          else toast.error(t("session:addTo.undoFailed"));
        },
      },
    });
  };

  const dayButtons: ReactNode = (
    <div className="zn-addto__days" role="group" aria-label={t("session:addTo.dayGroup")}>
      {[0, 1, 2, 3, 4, 5, 6].map((index) => (
        <button
          key={index}
          type="button"
          className="zn-addto__day"
          aria-pressed={chosenDay === index}
          aria-label={t(`plan:days.${index}`)}
          onClick={() => setDay(index)}
        >
          {t(`plan:daysShort.${index}`)}
        </button>
      ))}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <SheetContent side={side} className="zn-addto">
        <div className="zn-addto__head">
          <SheetTitle className="zn-addto__title">{t("session:addTo.title")}</SheetTitle>
          <SheetDescription className="zn-addto__sub">
            {t("session:addTo.subtitle", { name, duration: formatDurationMinutes(durationMin) })}
          </SheetDescription>
        </div>

        <fieldset className="zn-addto__choices">
          <legend className="sr-only">{t("session:addTo.legend")}</legend>
          {options.map((option) => (
            <label key={option.value} className="zn-addto__choice">
              <input
                type="radio"
                name="add-to-target"
                value={option.value}
                checked={target === option.value}
                onChange={() => {
                  setTarget(option.value);
                  if (option.value === "today") setDay(null);
                }}
              />
              <span className="zn-addto__choice-text">
                <span className="zn-addto__choice-label">{option.label}</span>
                <span className="zn-addto__choice-sub">{option.sub}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {target === "day" && dayButtons}

        {target === "plan" && plan && (
          <div className="zn-addto__pickers">
            {followed.length > 1 && (
              <label className="zn-addto__picker">
                <span>{t("session:addTo.planPick")}</span>
                <select
                  className="zn-pfield"
                  value={plan.plan.id}
                  onChange={(e) => {
                    setPlanId(e.target.value);
                    setPlanWeek(null);
                  }}
                >
                  {followed.map((f) => (
                    <option key={f.plan.id} value={f.plan.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="zn-addto__picker">
              <span>{t("session:addTo.weekPick")}</span>
              <select
                className="zn-pfield"
                value={chosenPlanWeek}
                onChange={(e) => setPlanWeek(Number(e.target.value))}
              >
                {plan.plan.weeks.map((w) => (
                  <option key={w.weekNumber} value={w.weekNumber}>
                    {t("session:addTo.weekOption", { week: w.weekNumber })}
                  </option>
                ))}
              </select>
            </label>
            {dayButtons}
          </div>
        )}

        {target === "template" && (
          <div className="zn-addto__pickers">
            {template ? (
              <>
                {world.templates.length > 1 && (
                  <label className="zn-addto__picker">
                    <span>{t("session:addTo.templatePick")}</span>
                    <select
                      className="zn-pfield"
                      value={template.id}
                      onChange={(e) => setTemplateId(e.target.value)}
                    >
                      {world.templates.map((w) => (
                        <option key={w.id} value={w.id}>
                          {(isEn && w.nameEn) || w.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {dayButtons}
              </>
            ) : (
              <p className="zn-addto__empty">
                {t("session:addTo.templateNone")}{" "}
                <Link to="/weeks/new" className="zn-addto__empty-link" onClick={close}>
                  {t("session:addTo.templateCreate")}
                </Link>
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          className="zn-addto__confirm"
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          {confirm}
        </button>
      </SheetContent>
    </Sheet>
  );
}

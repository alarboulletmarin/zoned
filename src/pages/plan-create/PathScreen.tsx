import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check, Sparkles } from "@/components/icons";
import { usePlanFormats } from "@/components/domain/plan/planFormat";
import { usePickLang } from "@/lib/i18n-utils";
import { anchorPrebuilt } from "@/lib/prebuiltPlanConverter";
import type { PlanForm } from "@/lib/planCreate";
import type { PrebuiltPlan } from "@/data/prebuilt-plans";
import { ScreenHead } from "./ScreenHead";

interface PathScreenProps {
  form: PlanForm;
  today: string;
  prebuilts: PrebuiltPlan[];
  /** Départ et semaines du sur mesure. */
  start: string;
  weeks: number;
  onPickPrebuilt: (slug: string) => void;
  onPickCustom: () => void;
}

/** 2.3 Un plan tout fait, ou sur mesure ? Deux cartes au même poids. */
export function PathScreen({ form, today, prebuilts, start, weeks, onPickPrebuilt, onPickCustom }: PathScreenProps) {
  const { t } = useTranslation("plan");
  const f = usePlanFormats();
  const pick = usePickLang();
  const isRace = form.planPurpose === "race";

  const anchored = useMemo(
    () =>
      prebuilts.map((p) => ({
        prebuilt: p,
        result: anchorPrebuilt(
          p,
          isRace ? { raceDate: form.raceDate, today } : { startDate: start },
        ),
      })),
    [prebuilts, isRace, form.raceDate, today, start],
  );

  return (
    <>
      <ScreenHead
        title={t("parcours.path.title")}
        lede={
          isRace
            ? t("parcours.path.ledeRace", { date: f.dayDate(form.raceDate) })
            : t("parcours.path.ledeOpen", { date: f.dayDate(start) })
        }
      />
      <div className="zn-pc__choices">
        {anchored.map(({ prebuilt: p, result }) => (
          <button
            key={p.slug}
            type="button"
            className="zn-pc__choice"
            disabled={!result.ok}
            onClick={() => onPickPrebuilt(p.slug)}
          >
            <span className="zn-pc__choice-kicker">
              <Sparkles size={16} />
              {t("parcours.path.ready")}
            </span>
            <span className="zn-pc__choice-title">{pick(p, "name")}</span>
            <span className="zn-pc__choice-facts">
              <span>{t("parcours.path.weeks", { count: p.totalWeeks })}</span>
              <span>{t("parcours.path.perWeek", { count: p.sessionsPerWeek })}</span>
            </span>
            <span className="zn-pc__choice-body">{pick(p, "description")}</span>
            <span className="zn-pc__choice-foot">
              {result.ok
                ? t("parcours.path.starts", { date: f.dayDate(result.startDate) })
                : t("parcours.path.tooShort", { needed: result.needed, available: result.available })}
              {result.ok && <ArrowRight size={18} />}
            </span>
          </button>
        ))}
        <button
          type="button"
          className="zn-pc__choice"
          onClick={onPickCustom}
        >
          <span className="zn-pc__choice-kicker">
            <Check size={16} />
            {t("parcours.path.custom")}
          </span>
          <span className="zn-pc__choice-title">{t("parcours.path.customTitle")}</span>
          <span className="zn-pc__choice-facts">
            <span>{t("parcours.path.weeks", { count: weeks })}</span>
            <span>{t("parcours.path.customFacts")}</span>
          </span>
          <span className="zn-pc__choice-body">{t("parcours.path.customBody")}</span>
          <span className="zn-pc__choice-foot">
            {t("parcours.path.starts", { date: f.dayDate(start) })}
            <ArrowRight size={18} />
          </span>
        </button>
      </div>
      <Link to="/plan/new/prebuilt" className="zn-pc__quiet-link">
        {t("parcours.path.all")}
      </Link>
    </>
  );
}

import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Option, OptionStack } from "../Option";
import { DIFFICULTY_META, type Difficulty } from "@/types";
import { normalizeVma, parseVma, vmaInput } from "@/lib/paceFields";
import { suggestLevel } from "../helpers";
import type { StepContext, StepDef } from "../types";

const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];

/**
 * Le niveau, et la VMA qui le suggère.
 *
 * La VMA est le seul chiffre que le générateur lit pour poser les allures.
 * Elle se saisissait à six endroits de l'app, mais jamais ici, dans le seul
 * parcours qui en a besoin : le générateur la prenait dans Mes zones si elle
 * y était, et sinon en inventait une par niveau, sans le dire. La question
 * est donc posée là où sa réponse sert, une fois, facultative, préremplie
 * quand l'app la connaît déjà, et enregistrée au moment du plan pour que Mes
 * zones et le profil la retrouvent.
 *
 * Le pavé décimal, pas le champ numérique natif : il refuse la virgule sur
 * la moitié des claviers et propose le moins. Le masque garde deux chiffres
 * de chaque côté et se range en quittant le champ.
 */
function LevelBody({ form, setForm, patch, uid, t, pick, questionId, derived, commit }: StepContext) {
  const typedVma = parseVma(form.vma);
  const suggestedLevel = typedVma ? suggestLevel(typedVma) : derived.suggestedLevel;

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-10)" } as CSSProperties}>
      <div className="zn-contrib-field">
        <label className="zn-contrib-field__label" htmlFor={`${uid}-vma`}>
          {t("level.vmaLabel")}
        </label>
        <div className="zn-row" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
          <input
            id={`${uid}-vma`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            data-mono="true"
            className="zn-contrib-input zn-wiz__vma"
            placeholder={t("level.vmaPlaceholder")}
            value={form.vma}
            aria-describedby={`${uid}-vma-hint`}
            onChange={(e) => patch({ vma: vmaInput(e.target.value) })}
            onBlur={() => patch({ vma: normalizeVma(form.vma) })}
          />
          <span className="zn-mono zn-faint">km/h</span>
        </div>
        <p id={`${uid}-vma-hint`} className="zn-caption zn-faint">
          {typedVma && suggestedLevel ? (
            <>
              {t("level.vmaSuggestion", { vma: form.vma })}
              <span className="zn-accent">{pick(DIFFICULTY_META[suggestedLevel], "label")}</span>
              {t("level.vmaSuggestionSuffix")}
            </>
          ) : (
            <>
              {t("level.vmaHint")}{" "}
              <Link to="/calculators/vma">{t("level.vmaUnknown")}</Link>
            </>
          )}
        </p>
      </div>

      <OptionStack questionId={questionId}>
        {LEVELS.map((level) => {
          const meta = DIFFICULTY_META[level];
          return (
            <Option
              key={level}
              name={`${uid}-level`}
              checked={form.runnerLevel === level}
              title={pick(meta, "label")}
              body={pick(meta, "desc")}
              data={level === suggestedLevel ? t("level.suggested") : undefined}
              onSelect={() => setForm((f) => ({ ...f, runnerLevel: level }))}
              onCommit={commit}
            />
          );
        })}
      </OptionStack>
    </div>
  );
}

export const levelStep: StepDef = {
  id: "level",
  titleKey: "level.title",
  subtitleKey: "level.subtitle",
  Body: LevelBody,
  autoAdvance: true,
  isComplete: (form) => !!form.runnerLevel,
};

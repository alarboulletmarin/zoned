import type { CSSProperties } from "react";
import { Option, OptionStack } from "../Option";
import { DIFFICULTY_META, type Difficulty } from "@/types";
import type { StepContext, StepDef } from "../types";

const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];

/** Le niveau. Pré-suggéré depuis la VMA mesurée, quand elle existe. */
function LevelBody({ form, setForm, uid, t, pick, questionId, derived }: StepContext) {
  const { userPrefs, suggestedLevel } = derived;

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
      {userPrefs?.vma && suggestedLevel && (
        <p className="zn-mono zn-faint">
          {t("level.vmaSuggestion", { vma: userPrefs.vma })}
          <span className="zn-accent">
            {pick(DIFFICULTY_META[suggestedLevel], "label")}
          </span>
          {t("level.vmaSuggestionSuffix")}
        </p>
      )}
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
  isComplete: (form) => !!form.runnerLevel,
};

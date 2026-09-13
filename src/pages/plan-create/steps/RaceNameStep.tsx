import type { StepContext, StepDef } from "../types";

/** Le nom de la course. Facultatif, d'où le passer. */
function RaceNameBody({ form, setForm, uid, t, goForward }: StepContext) {
  return (
    <div className="zn-contrib-field">
      <label className="zn-contrib-field__label" htmlFor={`${uid}-race-name`}>
        {t("raceName.label")}
      </label>
      <input
        id={`${uid}-race-name`}
        type="text"
        className="zn-contrib-input"
        value={form.raceName}
        onChange={(e) => setForm((f) => ({ ...f, raceName: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === "Enter") goForward();
        }}
        placeholder={t("raceName.placeholder")}
        maxLength={100}
      />
    </div>
  );
}

export const raceNameStep: StepDef = {
  id: "race_name",
  titleKey: "raceName.title",
  subtitleKey: "raceName.subtitle",
  Body: RaceNameBody,
  isComplete: () => true,
  nextLabelKey: "nav.continue",
  showSkip: true,
};

import { useTranslation } from "react-i18next";

/** old belief, current evidence, what to do — in that reading order. */
const CLAIMS = [
  { key: "old", emphasis: undefined },
  { key: "new", emphasis: "ink" },
  { key: "fix", emphasis: undefined },
] as const;

/**
 * Why cramps happen: the century-old story, the current one, the fix.
 *
 * The correct claim is marked by a full ink inversion rather than by a green
 * card next to a red one — a state that rests on colour alone is not a state
 * this system can print.
 */
export function CrampsScience() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="zn-grid" style={{ "--cols": 3 } as React.CSSProperties}>
      {CLAIMS.map(({ key, emphasis }) => (
        <div key={key} className="zn-nut-card" data-emphasis={emphasis}>
          <span className="zn-kicker">{t(`hub.cramps.${key}.label`)}</span>
          <p className="zn-nut-card__title">{t(`hub.cramps.${key}.title`)}</p>
          <p className="zn-nut-card__text">{t(`hub.cramps.${key}.detail`)}</p>
        </div>
      ))}
    </div>
  );
}

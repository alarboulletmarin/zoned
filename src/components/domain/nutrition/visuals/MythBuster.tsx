import { useTranslation } from "react-i18next";
import { myths } from "@/data/nutrition";

/**
 * Ten claims the fitness industry keeps repeating, each opening onto what the
 * evidence says.
 *
 * The red-cross / green-tick pair is gone: "myth" and "truth" are already
 * written out as mono micro-labels, and a state carried by colour alone is not
 * a state this system can print. The disclosure is a plain <details>, so
 * keyboard and screen-reader behaviour is the browser's.
 */
export function MythBuster() {
  const { t } = useTranslation("nutrition");

  return (
    <div className="zn-grid" style={{ "--cols": 2 } as React.CSSProperties}>
      {myths.map((m) => (
        <details key={m.id} className="zn-nut-myth">
          <summary className="zn-nut-myth__summary">
            <span className="zn-nut-myth__head">
              <span className="zn-kicker">{t("hub.myths.mythLabel")}</span>
              <span className="zn-nut-myth__claim">« {t(m.mythKey)} »</span>
            </span>
            <span className="zn-nut-myth__chevron" aria-hidden="true">
              ▾
            </span>
          </summary>
          <div className="zn-nut-myth__body">
            <span className="zn-kicker">{t("hub.myths.truthLabel")}</span>
            <p className="zn-body zn-body--sm">{t(m.truthKey)}</p>
            <p className="zn-source zn-nut-foot">{t(m.sourceKey)}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

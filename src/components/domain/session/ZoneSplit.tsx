import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import type { ZoneBreakdown } from "@/components/visualization/types";
import { ZoneChip } from "./ZoneChip";

const NBSP = " ";

/**
 * Le temps par zone : une barre empilée, puis un vrai tableau. La barre est
 * décorative (`aria-hidden`), le tableau en est l'équivalent texte, avec sa
 * légende pour les lecteurs d'écran. Plus de ligne Total : la durée est dans
 * la bande de chiffres, une fois.
 */
export function ZoneSplit({ rows }: { rows: ZoneBreakdown[] }) {
  const { t } = useTranslation("session");
  const visible = rows.filter((row) => row.durationMin > 0.01);

  return (
    <div className="zn-zsplit">
      <div className="zn-zsplit__bar" aria-hidden="true">
        {visible.map((row) => (
          <span
            key={row.zone ?? "none"}
            className="zn-zsplit__part"
            data-zone={row.zone ?? "none"}
            style={{ "--flex": row.durationMin } as CSSProperties}
          />
        ))}
      </div>
      <table className="zn-zsplit__table">
        <caption className="sr-only">{t("page.distributionCaption")}</caption>
        <tbody>
          {visible.map((row) => (
            <tr key={row.zone ?? "none"}>
              <td className="zn-zsplit__chip">
                <ZoneChip zone={row.zone != null ? `Z${row.zone}` : null} />
              </td>
              <th scope="row" className="zn-zsplit__name">
                {row.zone != null ? row.label : t("page.noZone")}
              </th>
              <td className="zn-zsplit__time">{formatDurationMinutes(row.durationMin)}</td>
              <td className="zn-zsplit__pct">{`${Math.round(row.percent)}${NBSP}%`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

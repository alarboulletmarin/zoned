import { useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import { formatDurationMinutes } from "@/components/visualization";
import { useIsEnglish } from "@/lib/i18n-utils";
import { ACTIVITY_DISCIPLINE_META } from "@/types/activity";
import type { WeekReview } from "@/lib/weekReview";

/**
 * Le bilan du dimanche.
 *
 * ── Des chiffres, pas des adjectifs ──────────────────────────────────────
 *
 * La première version était un paragraphe et une liste de définitions : une
 * phrase qui jugeait la semaine (la semaine a fait son travail), puis cinq
 * couples étiquette-valeur. C'était de l'éditorial dans une app qui DESSINE,
 * et surtout c'était redondant : la phrase ne disait rien que 3 / 4 ne dise
 * déjà, en trente mots de plus.
 *
 * Le système du dépôt a une règle pour ça, et elle est littérale : des
 * chiffres, pas des adjectifs. Le bilan l'applique.
 *
 * - **Le rapport EST le titre.** 3 / 4, au corps d'affichage, avec son
 *   micro-label sous lui. Aucune phrase ne commente ce rapport, parce
 *   qu'aucune n'en dit plus.
 * - **Le volume est une barre**, dans la grammaire que le reste de l'app
 *   emploie déjà : un contour pour le créneau, un plein pour ce qui a eu lieu.
 *   C'est LE dessin de ce bilan, et c'est lui qui répond à la raison d'être de
 *   toute cette fonctionnalité, le volume n'était pas bien compris.
 * - **Une phrase ne survit que là où il n'y a pas de chiffre à montrer** :
 *   rien n'est clos, ou il n'y avait pas de plan cette semaine. Deux cas, deux
 *   lignes courtes, et c'est tout ce qui reste de prose.
 *
 * ── La barre de volume ───────────────────────────────────────────────────
 *
 * Trois grandeurs sur un seul axe, et c'est ce qui les rend comparables d'un
 * coup d'oeil là où trois nombres demandent une soustraction :
 *
 *   |=========++++++++      |
 *    fait      en plus      ^ prévu
 *
 * Le plein est ce qui a été couru, le second segment ce qui a été fait en plus
 * du plan, et le repère est la cible. Dépasser le repère se VOIT, et c'est
 * exactement la semaine que l'app ne savait pas décrire : quatre heures
 * annoncées, six heures vécues.
 *
 * Aucun vermillon ici. L'accent de l'écran est pris par son appel primaire,
 * voir le détail sur le cockpit, ajouter une activité sur le journal ; un
 * repère en accent en ferait un second, et deux accents ne font plus d'accent.
 *
 * ── Le tableau des sports ────────────────────────────────────────────────
 *
 * La carte se contredisait : elle affichait KM 0 / 56 juste au-dessus d'une
 * ligne portant 26,6 km de vélo. Les deux chiffres étaient vrais, le premier
 * ne disait simplement pas qu'il comptait des kilomètres de COURSE, et rien
 * ne disait pourquoi les kilomètres de vélo n'y entraient pas.
 *
 * Deux corrections, et aucune n'est une phrase. Le fait porte son sport, km
 * course. Et le détail du complément, qui était déjà une demi-liste, devient
 * un vrai TABLEAU du volume de la semaine, séances du plan comprises : une
 * ligne par sport, une colonne par grandeur. Les colonnes alignent les
 * chiffres, donc elles se comparent d'un coup d'oeil au lieu d'être lues une à
 * une, et surtout le tableau n'a PAS de ligne de total : le temps total est
 * déjà dans les faits au-dessus, et les kilomètres ne se totalisent nulle part
 * parce qu'ils ne s'additionnent pas d'un sport à l'autre. La règle est dans
 * la forme, elle n'a pas à être écrite.
 */

interface WeekReviewPanelProps {
  review: WeekReview;
  /** Le bilan se plie au contexte : `bare` sur le cockpit, sans cadre. */
  variant?: "bare" | "card";
}

function formatRange(from: string, to: string, isEn: boolean): string {
  const parse = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const locale = isEn ? "en-GB" : "fr-FR";
  return `${parse(from).toLocaleDateString(locale, opts)} - ${parse(to).toLocaleDateString(locale, opts)}`;
}

export function WeekReviewPanel({ review, variant = "bare" }: WeekReviewPanelProps) {
  const { t } = useTranslation("activity");
  const isEn = useIsEnglish();

  const range = useMemo(
    () => formatRange(review.range.from, review.range.to, isEn),
    [review.range.from, review.range.to, isEn],
  );

  const extra = review.activities.minutes;

  /* L'échelle de la barre : le plus grand des deux, ce qui était prévu et ce
     qui a réellement eu lieu. Prendre le seul prévu ferait déborder une
     semaine où l'on a fait plus, et c'est précisément la semaine que ce bloc
     existe pour montrer. */
  const scale = Math.max(review.plannedMinutes, review.doneMinutes + extra, 1);
  const pct = (value: number) => `${Math.min(100, (value / scale) * 100)}%`;

  /* Le bloc a trois têtes possibles, et une seule s'affiche. Le rapport quand
     il y a un rapport ; sinon le chiffre qui EXISTE, avec la seule phrase que
     ce bloc s'autorise. */
  const head =
    review.planned === 0
      ? { value: formatDurationMinutes(extra), label: t("review.headExtra"), note: t("review.noPlan") }
      : review.verdict === "pending"
        ? { value: String(review.planned), label: t("review.headPlanned"), note: t("review.nothingClosed") }
        : {
            value: `${review.completed}/${review.planned}`,
            label: t("review.headDone"),
            note: null,
          };

  /* La barre n'a rien à dessiner quand rien n'a eu lieu ET que rien n'était
     prévu : un contour vide est un cadre vide, et cette app n'en pose pas. */
  const showBar = review.plannedMinutes > 0 || review.doneMinutes > 0 || extra > 0;

  /* Une colonne vide ne se dessine pas. Quelqu'un qui ne note jamais ses
     kilomètres aurait eu un en-tête KM sur une colonne de blancs, c'est-à-dire
     une case à remplir déguisée en donnée manquante. */
  const anyDistance = review.byDiscipline.some((v) => v.distanceKm > 0);
  const anyElevation = review.byDiscipline.some((v) => v.elevationGainM > 0);

  /* Le tableau se dessine dès qu'il dit quelque chose que les faits au-dessus
     ne disent pas déjà. Le seul cas où il ne le fait pas est celui du coureur
     qui n'a fait que courir, à plat, avec un plan : TOTAL et KM COURSE portent
     exactement ses deux chiffres, et une grille d'une ligne qui les répète est
     un cadre autour d'une phrase.

     Dès qu'il y a un second sport, en revanche, il devient le SEUL endroit où
     les kilomètres de ce sport existent, puisque KM COURSE n'en compte pas et
     n'a pas à en compter. C'est la question à laquelle cette carte répondait
     mal. */
  const runningOnly =
    review.byDiscipline.length === 1 && review.byDiscipline[0].discipline === "running";
  const showTable =
    review.byDiscipline.length > 0 &&
    !(runningOnly && review.plannedKm > 0 && !anyElevation);

  /* Un segment de zéro n'a pas de légende : une semaine dont rien n'est clos
     affichait 0s fait à côté d'une pastille verte qui ne peignait rien. On ne
     nomme que ce que le dessin montre. */
  const barLabel = [
    review.doneMinutes > 0
      ? t("review.barDone", { time: formatDurationMinutes(review.doneMinutes) })
      : null,
    extra > 0 ? t("review.barExtra", { time: formatDurationMinutes(extra) }) : null,
    review.plannedMinutes > 0
      ? t("review.barPlanned", { time: formatDurationMinutes(review.plannedMinutes) })
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="zn-wreview" data-variant={variant}>
      <div className="zn-wreview__head">
        <span className="zn-kicker zn-kicker--xs">
          {review.weekNumber > 0
            ? t("review.kickerWeek", { n: review.weekNumber })
            : t("review.kicker")}
        </span>
        <span className="zn-wreview__range zn-mono">{range}</span>
      </div>

      {/* LE RAPPORT, et il est le titre. Un chiffre au corps d'affichage tient
          la place qu'une phrase prenait, et il se lit sans être lu. */}
      <p className="zn-wreview__ratio">
        <span className="zn-wreview__figure">{head.value}</span>
        <span className="zn-kicker zn-kicker--xs">{head.label}</span>
      </p>

      {head.note && <p className="zn-wreview__say">{head.note}</p>}

      {showBar && (
        <div className="zn-wreview__vol">
          <div className="zn-wreview__track" role="img" aria-label={barLabel}>
            <span
              className="zn-wreview__seg"
              data-kind="done"
              style={{ "--w": pct(review.doneMinutes) } as CSSProperties}
            />
            <span
              className="zn-wreview__seg"
              data-kind="extra"
              style={{ "--w": pct(extra) } as CSSProperties}
            />
          </div>

          {/* Le repère du prévu, SIÈGE HORS de la piste, qui est en overflow
              caché : dedans, il était un filet d'encre posé sur un segment
              d'encre, et le repère le plus important du dessin était le seul
              qu'on ne voyait pas. Il dépasse donc de part et d'autre, comme
              une graduation de règle, et se lit sur n'importe quel segment.

              Il ne s'affiche pas quand rien n'était prévu : un repère posé sur
              zéro se lit comme une borne, et une semaine sans plan n'en a
              pas. */}
          {review.plannedMinutes > 0 && (
            <span
              className="zn-wreview__tick"
              style={{ "--x": pct(review.plannedMinutes) } as CSSProperties}
            />
          )}

          {/* La légende porte les marques du dessin, pas seulement ses mots :
              sans elles il faudrait deviner lequel des deux segments est le
              complément. */}
          <p className="zn-wreview__legend zn-mono" aria-hidden="true">
            {review.doneMinutes > 0 && (
              <span className="zn-wreview__key" data-kind="done">
                {formatDurationMinutes(review.doneMinutes)} {t("review.legendDone")}
              </span>
            )}
            {extra > 0 && (
              <span className="zn-wreview__key" data-kind="extra">
                {formatDurationMinutes(extra)} {t("review.legendExtra")}
              </span>
            )}
            {review.plannedMinutes > 0 && (
              <span className="zn-wreview__key" data-kind="tick">
                {formatDurationMinutes(review.plannedMinutes)} {t("review.legendPlanned")}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Les faits qui restent, en mono et sur une ligne : ce sont des
          graduations, pas des annonces. Chacun n'est là que s'il existe, une
          case 0 / 0 ne dit rien que son absence ne dise mieux. */}
      <dl className="zn-wreview__facts">
        {/* Le temps TOTAL, en tête : c'est le chiffre que toute cette
            fonctionnalité existe pour rendre vrai. La barre le dessine, ce
            fait le nomme, et les deux sont le même nombre. */}
        {review.totalMinutes > 0 && (
          <div className="zn-wreview__fact">
            <dt>{t("review.total")}</dt>
            <dd>{formatDurationMinutes(review.totalMinutes)}</dd>
          </div>
        )}
        {review.keyPlanned > 0 && (
          <div className="zn-wreview__fact">
            <dt>{t("review.keySessions")}</dt>
            <dd>
              {review.keyCompleted}/{review.keyPlanned}
            </dd>
          </div>
        )}
        {/* Le km porte son SPORT. `plannedSessionKm` rend zéro dès qu'une
            séance n'est pas de la course, donc ce rapport n'a jamais compté
            que des kilomètres courus : sans le mot, il a l'air de contredire
            la ligne vélo du tableau juste en dessous. */}
        {review.plannedKm > 0 && (
          <div className="zn-wreview__fact">
            <dt>{t("review.kmRun")}</dt>
            <dd>
              {review.doneKm}/{review.plannedKm}
            </dd>
          </div>
        )}
        {review.skipped > 0 && (
          <div className="zn-wreview__fact">
            <dt>{t("review.skipped")}</dt>
            <dd>{review.skipped}</dd>
          </div>
        )}
        {review.avgRpe !== null && (
          <div className="zn-wreview__fact">
            <dt>{t("review.avgRpe")}</dt>
            <dd>{review.avgRpe}</dd>
          </div>
        )}
      </dl>

      {/* Le volume, sport par sport. Une seule ligne ne fait pas un tableau :
          un runner qui n'a rien fait d'autre lit mieux sa semaine dans les
          faits au-dessus, qui portent déjà ce chiffre. */}
      {showTable && (
        <table className="zn-wreview__table">
          <thead>
            <tr>
              <th scope="col">{t("review.sport")}</th>
              <th scope="col">{t("review.colTime")}</th>
              {anyDistance && <th scope="col">{t("review.colDistance")}</th>}
              {anyElevation && <th scope="col">{t("review.colElevation")}</th>}
            </tr>
          </thead>
          <tbody>
            {review.byDiscipline.map((volume) => {
              const meta = ACTIVITY_DISCIPLINE_META[volume.discipline];
              return (
                <tr key={volume.discipline}>
                  <th scope="row">
                    {t(`discipline.${volume.discipline}`)}
                    {/* Ce qui, dans cette ligne, ne venait pas du plan. La
                        barre le dit pour la semaine entière, la colonne le dit
                        par sport, et c'est la question que cette carte existe
                        pour répondre. */}
                    {volume.extraMinutes > 0 && volume.extraMinutes < volume.minutes && (
                      <span className="zn-wreview__from">
                        {t("review.ofWhichExtra", {
                          time: formatDurationMinutes(volume.extraMinutes),
                        })}
                      </span>
                    )}
                  </th>
                  <td>{formatDurationMinutes(volume.minutes)}</td>
                  {anyDistance && (
                    <td>
                      {volume.distanceKm > 0
                        ? meta.distance === "meters"
                          ? `${Math.round(volume.distanceKm * 1000)} m`
                          : `${volume.distanceKm} km`
                        : null}
                    </td>
                  )}
                  {anyElevation && (
                    <td>{volume.elevationGainM > 0 ? `+${volume.elevationGainM} m` : null}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Ce qui reste à trancher. En dernier, et sans alarme : c'est la seule
          chose de ce bloc sur laquelle on peut encore agir. */}
      {review.pending > 0 && review.verdict !== "pending" && (
        <p className="zn-wreview__say">{t("review.pending", { count: review.pending })}</p>
      )}
    </section>
  );
}

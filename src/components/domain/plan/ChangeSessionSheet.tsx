import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronDown, Clock, Dumbbell, Mountain, Route, Run, Search, SlidersHorizontal, Sparkles, Bike, Pool, Gauge } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { ZoneBar, toZoneBarBlocks } from "@/components/visualization/ZoneBar";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { loadAllWorkouts, loadDisciplineWorkouts } from "@/data/workouts";
import { loadAllStrengthSessions } from "@/data/strength";
import { usePickLang } from "@/lib/i18n-utils";
import { plannedSessionKm } from "@/lib/planStats";
import { isSessionSubstitutable, rankSubstitutionCandidates } from "@/lib/planGenerator/substitute";
import {
  durationBandOf,
  familyOf,
  intensityOf,
  isMeasured,
  matchesQuery,
  rankAlternatives,
  type AlternativeFamily,
  type AlternativeSort,
  type DurationBand,
  type IntensityLevel,
  type RankedAlternative,
} from "@/lib/rankAlternatives";
import { isStrengthWorkout, type AnyWorkoutTemplate, type Discipline, type WorkoutTemplate } from "@/types";
import type { PlanSession } from "@/types/plan";
import { usePlanFormats } from "./planFormat";

export interface ChangeTarget {
  week: number;
  index: number;
  session: PlanSession;
  /** `YYYY-MM-DD`, le jour de la séance. */
  date: string;
  /** Les séances déjà posées dans la semaine, que l'on ne propose pas. */
  weekWorkoutIds: string[];
}

interface ChangeSessionSheetProps {
  target: ChangeTarget | null;
  current: AnyWorkoutTemplate | undefined;
  side: "bottom" | "right";
  onClose: () => void;
  /** `discipline` est posé quand la séance passe au vélo ou à la nage. */
  onPick: (workout: AnyWorkoutTemplate, discipline: Exclude<Discipline, "running"> | null) => void;
}

const FAMILY_ICON: Record<AlternativeFamily, typeof Run> = {
  hills_trail: Mountain,
  road: Run,
  strength: Dumbbell,
  cycling: Bike,
  swimming: Pool,
};

interface Catalogues {
  running: WorkoutTemplate[];
  strength: AnyWorkoutTemplate[];
  cycling: WorkoutTemplate[];
  swimming: WorkoutTemplate[];
}

interface Row extends RankedAlternative {
  tss?: number;
}

const NBSP = " ";

/**
 * La feuille Changer de séance : une recherche, des familles en pilules
 * (côtes et trail, route, renfo, et vélo ou natation quand la séance s'y
 * prête), deux filtres et un tri, puis les séances qui peuvent la remplacer,
 * chacune avec sa durée, sa distance estimée et son profil.
 *
 * Elle remplace l'interface de `SwapSessionDialog` et de
 * `SubstituteSessionDialog`. Le classement des séances de course et de renfo
 * est `rankAlternatives` ; celui du vélo et de la natation reste
 * `rankSubstitutionCandidates`, à charge égale.
 */
export function ChangeSessionSheet({ target, current, side, onClose, onPick }: ChangeSessionSheetProps) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const f = usePlanFormats();
  const open = target !== null;
  const session = target?.session ?? null;
  const substitutable = session ? isSessionSubstitutable(session) : false;

  const startFamily: AlternativeFamily = current ? familyOf(current) : "road";
  const [family, setFamily] = useState<AlternativeFamily>(startFamily);
  const [query, setQuery] = useState("");
  const [intensity, setIntensity] = useState<IntensityLevel | null>(null);
  const [duration, setDuration] = useState<DurationBand | null>(null);
  const [sort, setSort] = useState<AlternativeSort>("match");
  const [catalogues, setCatalogues] = useState<Catalogues | null>(null);
  // À l'ouverture, le focus va sur la famille choisie, pas sur la recherche :
  // un champ focalisé ferait surgir le clavier d'un téléphone.
  const familyRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setFamily(startFamily);
    setQuery("");
    setIntensity(null);
    setDuration(null);
    setSort("match");
  }, [open, target?.week, target?.index]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open || catalogues) return;
    let cancelled = false;
    Promise.all([
      loadAllWorkouts(),
      loadAllStrengthSessions(),
      loadDisciplineWorkouts("cycling"),
      loadDisciplineWorkouts("swimming"),
    ])
      .then(([running, strength, cycling, swimming]) => {
        if (!cancelled) setCatalogues({ running, strength, cycling, swimming });
      })
      .catch((error: unknown) => {
        console.error("ChangeSessionSheet: catalogue", error);
        if (!cancelled) setCatalogues({ running: [], strength: [], cycling: [], swimming: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [open, catalogues]);

  const families: AlternativeFamily[] = substitutable
    ? ["hills_trail", "road", "strength", "cycling", "swimming"]
    : ["hills_trail", "road", "strength"];

  const result = useMemo(() => {
    if (!session || !catalogues) return { easier: null as Row | null, list: [] as Row[] };
    if (family === "cycling" || family === "swimming") {
      const ranked = rankSubstitutionCandidates({
        plannedSession: session,
        targetDiscipline: family,
        candidates: catalogues[family],
      });
      let rows: Row[] = ranked
        .filter((c) => isMeasured(c.workout) && matchesQuery(c.workout, query))
        .map((c) => ({
          workout: c.workout,
          durationMin: c.estimatedDurationMin,
          intensity: intensityOf(c.workout),
          score: c.matchDistance,
          tss: c.candidateTss,
        }))
        .filter((r) => intensity == null || r.intensity === intensity)
        .filter((r) => !duration || durationBandOf(r.durationMin) === duration);
      if (sort === "duration") rows = [...rows].sort((a, b) => a.durationMin - b.durationMin);
      return { easier: null, list: rows };
    }
    const catalogue = family === "strength" ? catalogues.strength : catalogues.running;
    return rankAlternatives(session, current, catalogue, {
      family,
      query,
      intensity,
      duration,
      sort,
      excludeIds: target?.weekWorkoutIds,
    });
  }, [session, current, catalogues, family, query, intensity, duration, sort, target?.weekWorkoutIds]);

  const count = result.list.length + (result.easier ? 1 : 0);

  const card = (row: Row, easier: boolean) => {
    const w = row.workout;
    const name = pick(w, "name");
    const Icon = FAMILY_ICON[familyOf(w)];
    const running = !isStrengthWorkout(w) && familyOf(w) !== "cycling" && familyOf(w) !== "swimming";
    const km = running
      ? plannedSessionKm({
          dayOfWeek: 0,
          workoutId: w.id,
          sessionType: (w as WorkoutTemplate).sessionType,
          isKeySession: false,
          estimatedDurationMin: row.durationMin,
        })
      : 0;
    const blocks = isStrengthWorkout(w) ? [] : toZoneBarBlocks(w as WorkoutTemplate);
    const barMin = blocks.reduce((s, b) => s + b.seconds, 0) / 60;
    const ticks = barMin > 0 ? Array.from({ length: Math.floor(barMin / 10) + 1 }, (_, i) => i * 10) : [];
    return (
      <li key={w.id}>
        <button
          type="button"
          className="zn-alt"
          data-easier={easier || undefined}
          aria-label={t("page.change.pick", { name, time: formatDurationMinutes(row.durationMin) })}
          onClick={() => onPick(w, family === "cycling" || family === "swimming" ? family : null)}
        >
          {easier && (
            <span className="zn-alt__easier">
              <Sparkles size={14} />
              {t("page.change.easier")}
            </span>
          )}
          <span className="zn-alt__name">
            <Icon size={18} />
            <span>{name}</span>
          </span>
          <span className="zn-alt__facts">
            <span>
              <Clock size={16} />
              <span>
                <small>{t("page.change.time")}</small>
                {formatDurationMinutes(row.durationMin)}
              </span>
            </span>
            {km > 0 && (
              <span>
                <Route size={16} />
                <span>
                  <small>{t("page.change.distance")}</small>
                  {`${new Intl.NumberFormat(f.locale, { maximumFractionDigits: 1 }).format(Math.round(km * 10) / 10)}${NBSP}km`}
                </span>
              </span>
            )}
            {row.tss != null && (
              <span>
                <Gauge size={16} />
                <span>
                  <small>{t("page.change.load")}</small>
                  {t("page.change.tss", { tss: row.tss })}
                </span>
              </span>
            )}
          </span>
          {blocks.length > 0 && (
            <span className="zn-alt__profile">
              <ZoneBar blocks={blocks} height={56} />
              <span className="zn-alt__ticks" aria-hidden="true">
                {ticks.map((tick) => (
                  <span key={tick} style={{ insetInlineStart: `${(tick / barMin) * 100}%` }}>
                    {tick}&apos;
                  </span>
                ))}
              </span>
            </span>
          )}
        </button>
      </li>
    );
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side={side} className="zn-change" initialFocus={familyRef}>
        <div className="zn-change__head">
          <SheetTitle className="zn-change__title">{t("page.change.title")}</SheetTitle>
          {target && (
            <SheetDescription className="zn-change__when">
              <Calendar size={16} />
              {f.dayDate(target.date)}
            </SheetDescription>
          )}
        </div>

        <label className="zn-change__search">
          <Search size={18} />
          <span className="sr-only">{t("page.change.search")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("page.change.search")}
          />
        </label>

        <div className="zn-change__families" role="group" aria-label={t("page.change.families")}>
          {families.map((fam) => {
            const Icon = FAMILY_ICON[fam];
            return (
              <button
                key={fam}
                type="button"
                ref={fam === startFamily ? familyRef : undefined}
                aria-pressed={family === fam}
                onClick={() => setFamily(fam)}
              >
                <Icon size={16} />
                {t(`page.change.family.${fam}`)}
              </button>
            );
          })}
        </div>

        <div className="zn-change__filters">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button type="button" className="zn-change__filter" data-active={intensity != null || undefined}>
                {intensity == null ? t("page.change.intensity") : t(`page.change.level.${intensity}`)}
                <ChevronDown size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" collisionPadding={16}>
              <DropdownMenuRadioGroup
                value={intensity == null ? "all" : String(intensity)}
                onValueChange={(v) => setIntensity(v === "all" ? null : (Number(v) as IntensityLevel))}
              >
                <DropdownMenuRadioItem value="all">{t("page.change.intensityAll")}</DropdownMenuRadioItem>
                {[0, 1, 2].map((l) => (
                  <DropdownMenuRadioItem key={l} value={String(l)}>
                    {t(`page.change.level.${l}`)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button type="button" className="zn-change__filter" data-active={duration != null || undefined}>
                {duration == null ? t("page.change.duration") : t(`page.change.band.${duration}`)}
                <ChevronDown size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" collisionPadding={16}>
              <DropdownMenuRadioGroup
                value={duration ?? "all"}
                onValueChange={(v) => setDuration(v === "all" ? null : (v as DurationBand))}
              >
                <DropdownMenuRadioItem value="all">{t("page.change.durationAll")}</DropdownMenuRadioItem>
                {(["short", "medium", "long"] as const).map((b) => (
                  <DropdownMenuRadioItem key={b} value={b}>
                    {t(`page.change.band.${b}`)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="zn-change__count" aria-live="polite">
            {catalogues ? t("page.change.count", { count }) : ""}
          </span>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button type="button" className="zn-iconbtn zn-iconbtn--flat" aria-label={t("page.change.sort")}>
                <SlidersHorizontal size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" collisionPadding={16}>
              <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as AlternativeSort)}>
                <DropdownMenuRadioItem value="match">{t("page.change.sortMatch")}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="duration">{t("page.change.sortDuration")}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {session?.sessionType === "long_run" && (family === "cycling" || family === "swimming") && (
          <Alert kind="warning" title={t("view.substituteLongRunWarningTitle")}>
            {t("view.substituteLongRunWarningBody")}
          </Alert>
        )}

        {!catalogues ? (
          <div className="zn-change__wait">
            <Spinner />
            <span className="sr-only">{t("page.change.loading")}</span>
          </div>
        ) : count === 0 ? (
          <p className="zn-change__empty">{t("page.change.empty")}</p>
        ) : (
          <ul className="zn-change__list">
            {result.easier && card(result.easier, true)}
            {result.list.slice(0, 60).map((row) => card(row, false))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}

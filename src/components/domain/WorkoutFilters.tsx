import { useTranslation } from "react-i18next";
import { useRef, useState, type ReactNode } from "react";
import { Mountain } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ZONE_META } from "@/types";
import type { StrengthCategory, StrengthEquipment, MuscleGroup } from "@/types/strength";
import { strengthCategories } from "@/data/strength";
import { usePickLang } from "@/lib/i18n-utils";
import { useRadioRail } from "@/hooks/useRadioRail";
import { DifficultyIcon } from "./DifficultyIcon";
import {
  ACTIVITY_TYPES,
  DIFFICULTIES,
  DURATION_BUCKETS,
  DURATION_OPEN,
  PEAK_ZONES,
  TERRAIN_FILTERS,
  bucketOfRange,
  defaultFilters,
  rangeOfBucket,
  toggleTerrain,
  type ActivityType,
  type DurationBucket,
  type WorkoutFiltersState,
} from "@/lib/libraryFilters";

export { defaultFilters, type ActivityType, type WorkoutFiltersState };

// Equipment options for strength filter
const strengthEquipmentOptions: StrengthEquipment[] = [
  "none",
  "resistance_band",
  "dumbbells",
  "kettlebell",
  "barbell",
  "pull_up_bar",
  "box",
  "foam_roller",
  "medicine_ball",
];

// Muscle group options for strength filter
const muscleGroupOptions: MuscleGroup[] = [
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "hip_flexors",
  "adductors",
  "core_anterior",
  "core_lateral",
  "core_posterior",
  "upper_back",
  "shoulders",
  "chest",
];

interface WorkoutFiltersProps {
  filters: WorkoutFiltersState;
  onFiltersChange: (filters: WorkoutFiltersState) => void;
  className?: string;
  activityType?: ActivityType;
  onActivityTypeChange?: (next: ActivityType) => void;
  sportCounts?: Record<ActivityType, number>;
}

/* ── Chip ──
   A filter value the athlete switches on or off. Selected is a full ink
   inversion, never a tint, the paint lives in `library.css`. A radio chip
   carries the roving tab stop of its rail (`useRadioRail`). */
function Chip({
  label,
  selected,
  onClick,
  role = "checkbox",
  className,
  children,
  dataValue,
}: {
  label?: string;
  selected: boolean;
  onClick: () => void;
  role?: "checkbox" | "radio";
  className?: string;
  children?: ReactNode;
  dataValue?: string;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      tabIndex={role === "radio" ? (selected ? 0 : -1) : undefined}
      data-value={dataValue}
      onClick={onClick}
      className={cn("zn-chip", className)}
    >
      {children ?? label}
    </button>
  );
}

/* ── One filter row: a mono label, then its chips ── */
function FilterRow({
  label,
  children,
  className,
  role = "group",
  railRef,
  onKeyDown,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  role?: "group" | "radiogroup";
  railRef?: React.RefObject<HTMLDivElement | null>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
}) {
  return (
    <div
      ref={railRef}
      className={cn("zn-lib__row", className)}
      role={role}
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {/* The row is already named for assistive tech by the group label. */}
      <span
        className="zn-kicker zn-kicker--inline zn-lib__rowlabel"
        aria-hidden="true"
      >
        {label}
      </span>
      {children}
    </div>
  );
}

/* ── Expandable chip group, progressive disclosure ──
   Renders straight into the row rather than into a box of its own, so a long
   list still reads as one line of chips. */
function ExpandableChipGroup({
  items,
  initialCount = 4,
  renderChip,
  hasSelected,
}: {
  items: readonly string[];
  initialCount?: number;
  renderChip: (item: string) => React.ReactNode;
  hasSelected?: (item: string) => boolean;
}) {
  const [expanded, setExpanded] = useState(() =>
    hasSelected ? items.slice(initialCount).some(hasSelected) : false
  );
  const visible = expanded ? items : items.slice(0, initialCount);
  const hiddenCount = items.length - initialCount;

  return (
    <>
      {visible.map((item) => renderChip(item))}
      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="zn-chip zn-chip--more"
        >
          +{hiddenCount}
        </button>
      )}
    </>
  );
}

/**
 * The filter panel, row by row:
 *
 * 1. Sport FIRST: it decides which other rows make sense (a strength session
 *    has no zone, no family, no terrain), so changing it below the others
 *    would move the panel under the finger. Radios, one sport at a time.
 * 2. Intensity peak (endurance): six chips, each with its rung of the ramp.
 * 3. Duration: five slices, one at a time, on the session page's real duration.
 * 4. Level, with the app's gauge.
 * 5. Terrain (running): No track, With elevation, No hills.
 * 6. Strength (when the sport is): family, equipment, muscles.
 *
 * Gone: the target system (a physiologist's vocabulary in an app built
 * around zones), the 0 to 300 min slider, the favourites switch (a shortcut
 * chip on the page now), the view selector, and the families, which are the
 * page itself.
 */
export function WorkoutFilters({
  filters,
  onFiltersChange,
  className,
  activityType = "all",
  onActivityTypeChange,
  sportCounts,
}: WorkoutFiltersProps) {
  const { t } = useTranslation("library");
  const { t: tStrength } = useTranslation("strength");
  const pick = usePickLang();

  const toggleFilter = <K extends keyof WorkoutFiltersState>(
    key: K,
    value: WorkoutFiltersState[K] extends (infer T)[] ? T : never
  ) => {
    const current = filters[key] as unknown[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: next });
  };

  const sportRailRef = useRef<HTMLDivElement>(null);
  const sportRail = useRadioRail<ActivityType>({
    items: ACTIVITY_TYPES,
    value: activityType,
    onChange: (next) => onActivityTypeChange?.(next),
    railRef: sportRailRef,
  });

  const bucket = bucketOfRange(filters.durationRange);
  const setBucket = (next: DurationBucket | null) =>
    onFiltersChange({
      ...filters,
      durationRange: next ? rangeOfBucket(next) : [0, DURATION_OPEN],
    });
  const bucketIds = DURATION_BUCKETS.map((b) => b.id);
  const durationRailRef = useRef<HTMLDivElement>(null);
  const durationRail = useRadioRail<DurationBucket | null>({
    items: bucketIds,
    value: bucket,
    onChange: setBucket,
    railRef: durationRailRef,
  });

  const showEndurance = activityType !== "strength";
  const showTerrain = activityType === "all" || activityType === "running";
  const showStrengthFilters = activityType === "strength";

  return (
    <section
      className={cn("zn-lib__filters", className)}
      aria-label={t("filters.title")}
    >
      {onActivityTypeChange && (
        <FilterRow
          label={t("filters.sport")}
          role="radiogroup"
          railRef={sportRailRef}
          onKeyDown={sportRail.onKeyDown}
        >
          {ACTIVITY_TYPES.map((type) => (
            <Chip
              key={type}
              role="radio"
              selected={activityType === type}
              onClick={() => onActivityTypeChange(type)}
            >
              {t(`activityToggleShort.${type}`)}
              {sportCounts && (
                <span className="zn-mono zn-lib__chipcount">{sportCounts[type]}</span>
              )}
            </Chip>
          ))}
        </FilterRow>
      )}

      {showEndurance && (
        <FilterRow label={t("filters.peak")} className="zn-lib__row--grid">
          {PEAK_ZONES.map((zone) => (
            <Chip
              key={zone}
              selected={filters.peak.includes(zone)}
              onClick={() => toggleFilter("peak", zone)}
              className="zn-lib__zonechip"
            >
              <span className="zn-zone-swatch" aria-hidden="true">
                <span data-zone={zone} />
              </span>
              <b className="zn-lib__zonecode">Z{zone}</b>
              {pick(ZONE_META[zone], "label")}
            </Chip>
          ))}
        </FilterRow>
      )}

      <FilterRow
        label={t("filters.duration")}
        role="radiogroup"
        railRef={durationRailRef}
        onKeyDown={durationRail.onKeyDown}
      >
        {DURATION_BUCKETS.map(({ id }) => (
          <Chip
            key={id}
            role="radio"
            label={t(`durationBucket.${id}`)}
            selected={bucket === id}
            // Une tranche cochée se décoche : la durée redevient libre.
            onClick={() => setBucket(bucket === id ? null : id)}
          />
        ))}
      </FilterRow>

      <FilterRow label={t("filters.level")} className="zn-lib__row--grid">
        {DIFFICULTIES.map((d) => (
          <Chip
            key={d}
            selected={filters.difficulty.includes(d)}
            onClick={() => toggleFilter("difficulty", d)}
            className="zn-lib__levelchip"
          >
            {t(`difficulty.${d}`)}
            <DifficultyIcon difficulty={d} size={18} />
          </Chip>
        ))}
      </FilterRow>

      {showTerrain && (
        <FilterRow label={t("filters.terrain")}>
          {TERRAIN_FILTERS.map((terrain) => (
            <Chip
              key={terrain}
              selected={filters.terrain.includes(terrain)}
              onClick={() =>
                onFiltersChange({ ...filters, terrain: toggleTerrain(filters.terrain, terrain) })
              }
            >
              {terrain === "climb" && <Mountain size={15} />}
              {t(`terrain.${terrain}`)}
            </Chip>
          ))}
        </FilterRow>
      )}

      {showStrengthFilters && (
        <FilterRow label={tStrength("title")}>
          {strengthCategories.map((cat) => (
            <Chip
              key={cat}
              label={tStrength(`categories.${cat}`)}
              selected={filters.strengthCategory.includes(cat as StrengthCategory)}
              onClick={() => toggleFilter("strengthCategory", cat as StrengthCategory)}
            />
          ))}
        </FilterRow>
      )}

      {showStrengthFilters && (
        <FilterRow label={tStrength("detail.equipmentNeeded")}>
          <ExpandableChipGroup
            items={strengthEquipmentOptions}
            initialCount={4}
            hasSelected={(eq) => filters.equipment.includes(eq as StrengthEquipment)}
            renderChip={(eq) => (
              <Chip
                key={eq}
                label={tStrength(`equipment.${eq}`)}
                selected={filters.equipment.includes(eq as StrengthEquipment)}
                onClick={() => toggleFilter("equipment", eq as StrengthEquipment)}
              />
            )}
          />
        </FilterRow>
      )}

      {showStrengthFilters && (
        <FilterRow label={tStrength("detail.targetMuscles")}>
          <ExpandableChipGroup
            items={muscleGroupOptions}
            initialCount={4}
            hasSelected={(m) => filters.muscleGroup.includes(m as MuscleGroup)}
            renderChip={(m) => (
              <Chip
                key={m}
                label={tStrength(`muscles.${m}`)}
                selected={filters.muscleGroup.includes(m as MuscleGroup)}
                onClick={() => toggleFilter("muscleGroup", m as MuscleGroup)}
              />
            )}
          />
        </FilterRow>
      )}
    </section>
  );
}

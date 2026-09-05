import { useTranslation } from "react-i18next";
import {
  Run,
  Bike,
  Pool,
  Dumbbell,
  Sparkles,
  Loader2,
  LockOpen,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Segmented } from "@/components/ui/segmented";
import { DISCIPLINES, type DrawDiscipline } from "@/lib/workoutFilters";
import { WEEK_PRESETS } from "@/lib/weekPresets";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import { DIFFICULTY_META, type Difficulty } from "@/types";
import {
  type DayIndex,
  type QualityType,
  type SessionCount,
  type WeekSettings,
} from "@/types/week";

const VOLUME_MIN = 3;
const VOLUME_MAX = 12;
const SESSION_OPTIONS: SessionCount[] = [3, 4, 5, 6];
const QUALITY_OPTIONS: QualityType[] = ["random", "tempo", "threshold", "vo2vma"];
const LEVELS: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];
const DAYS: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

const DISCIPLINE_ICONS: Record<
  DrawDiscipline,
  React.ComponentType<{ className?: string }>
> = { running: Run, cycling: Bike, swimming: Pool, strength: Dumbbell };

/**
 * Generator settings for "Ma semaine" (Epic #83) — always expanded (no
 * collapse). Controlled: `settings` + `onSettingsChange` are owned by the page
 * so both the sticky "Générer" button (mobile) and this panel share one state.
 * The Generate button carries an explicit label + helper sub-text.
 *
 * On desktop the panel is capped to the viewport and split into a scrolling
 * body + a pinned action footer: it lives in a `sticky` column, so a panel
 * taller than the screen would put its own CTA permanently out of reach
 * (scrolling the page never brings a stuck element's bottom back). The cap and
 * the surface live in `.zn-wk-gen`; `--bare` drops both.
 */
export function WeekGeneratorPanel({
  settings,
  onSettingsChange,
  busy = false,
  onGenerate,
  weekIsPopulated,
  lockedCount = 0,
  onUnlockAll,
  bare = false,
}: {
  settings: WeekSettings;
  onSettingsChange: (settings: WeekSettings) => void;
  busy?: boolean;
  onGenerate: (settings: WeekSettings) => void;
  weekIsPopulated: boolean;
  /** Sessions locked in the current week — kept as-is on the next generation. */
  lockedCount?: number;
  onUnlockAll?: () => void;
  /** Compact, surface-less variant for the mobile "Régler" sheet (no border,
   *  no padding, no redundant title) so the whole panel fits without scroll. */
  bare?: boolean;
}) {
  const { t } = useTranslation("library");
  const pick = usePickLang();

  const set = (patch: Partial<WeekSettings>) =>
    onSettingsChange({ ...settings, ...patch });
  const toggle = <K extends "disciplines" | "levels">(
    key: K,
    value: WeekSettings[K][number],
  ) => {
    const arr = settings[key] as unknown[];
    const has = arr.includes(value);
    onSettingsChange({
      ...settings,
      [key]: has ? arr.filter((x) => x !== value) : [...arr, value],
    } as WeekSettings);
  };

  return (
    <div className={cn("zn-wk-gen", bare && "zn-wk-gen--bare")}>
      {!bare && (
        <span className="zn-kicker zn-wk-gen__title">
          {t("weekly.generate.title")}
        </span>
      )}

      <div className="zn-wk-gen__body">
        {/* Presets fill in every setting below in one click. They are shortcuts,
            not a selectable state — hence the label and the flat, unselected
            styling, so they never read as "the current phase of the week". */}
        <Field label={t("weekly.presets.label")}>
          <div className="zn-wk-gen__presets">
            {WEEK_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSettingsChange(preset.settings)}
                className="zn-wk-gen__preset"
              >
                {t(`weekly.presets.options.${preset.id}`)}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t("weekly.settings.sessions")}>
          <Segmented
            value={String(settings.sessions)}
            onChange={(v) => set({ sessions: Number(v) as SessionCount })}
            options={SESSION_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
          />
        </Field>

        <div className="zn-wk-gen__vol">
          <div className="zn-wk-gen__volhead">
            <label className="zn-label">{t("weekly.settings.volume")}</label>
            <span className="zn-mono zn-muted">{settings.targetVolumeH} h</span>
          </div>
          <Slider
            min={VOLUME_MIN}
            max={VOLUME_MAX}
            step={1}
            value={[settings.targetVolumeH]}
            onValueChange={([v]) => set({ targetVolumeH: v })}
          />
        </div>

        <Field label={t("weekly.settings.quality")}>
          {/* No column class: .zn-segmented already lays one equal track per
              option, which is exactly what the `grid-cols-2` here used to
              resolve to — four 1fr cells on one row. */}
          <Segmented
            value={settings.quality}
            onChange={(v) => set({ quality: v as QualityType })}
            options={QUALITY_OPTIONS.map((q) => ({
              value: q,
              label: t(`weekly.settings.qualityOptions.${q}`),
            }))}
          />
        </Field>

        <Field label={t("weekly.settings.longRunDay")}>
          {/* One letter per day: a 7-cell row is far too narrow for "Lun". The
              full day name lives in the tooltip and the accessible name.
              .zn-segmented already lays one equal track per option, so seven
              of them need no extra class. */}
          <Segmented
            value={String(settings.longRunDay)}
            onChange={(v) => set({ longRunDay: Number(v) as DayIndex })}
            options={DAYS.map((d) => ({
              value: String(d),
              label: t(`weekly.daysShort.${d}`).charAt(0),
              title: t(`weekly.days.${d}`),
            }))}
          />
        </Field>

        {/* Disciplines and levels are both multi-select filters where "none
            picked" means "all" — so they share one chip treatment, with an
            explicit "All" state instead of a silently empty selection. */}
        <Field label={t("weekly.settings.disciplines")}>
          <div className="zn-wk-gen__chips">
            <Chip
              className="zn-wk-chip--wide"
              active={settings.disciplines.length === 0}
              onClick={() => set({ disciplines: [] })}
            >
              {t("weekly.settings.allDisciplines")}
            </Chip>
            {DISCIPLINES.map((d) => {
              const Icon = DISCIPLINE_ICONS[d];
              return (
                <Chip
                  key={d}
                  active={settings.disciplines.includes(d)}
                  onClick={() => toggle("disciplines", d)}
                >
                  <Icon />
                  <span className="zn-truncate">{t(`activityToggle.${d}`)}</span>
                </Chip>
              );
            })}
          </div>
        </Field>

        <Field label={t("weekly.settings.levels")}>
          <div className="zn-wk-gen__chips">
            <Chip
              className="zn-wk-chip--wide"
              active={settings.levels.length === 0}
              onClick={() => set({ levels: [] })}
            >
              {t("weekly.settings.allLevels")}
            </Chip>
            {LEVELS.map((l) => (
              <Chip key={l} active={settings.levels.includes(l)} onClick={() => toggle("levels", l)}>
                <span className="zn-truncate">{pick(DIFFICULTY_META[l], "label")}</span>
              </Chip>
            ))}
          </div>
        </Field>
      </div>

      {/* Pinned below the scrolling body: the primary action stays on screen
          whatever the settings above are worth reading. */}
      <div className="zn-wk-gen__actions">
        <Button onClick={() => onGenerate(settings)} disabled={busy}>
          {busy ? <Loader2 className="zn-spin" /> : <Sparkles />}
          {busy ? t("weekly.generate.busy") : t("weekly.generate.action")}
        </Button>
        {lockedCount > 0 && onUnlockAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onUnlockAll}
            disabled={busy}
            className="zn-wk-gen__unlock"
          >
            <LockOpen />
            {t("weekly.actions.unlockAll")}
          </Button>
        )}
        {!bare && (
          <p className="zn-wk-gen__hint">
            {lockedCount > 0
              ? t("weekly.generate.hintLocked", { count: lockedCount })
              : weekIsPopulated
                ? t("weekly.generate.hintRegen")
                : t("weekly.generate.hint")}
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="zn-wk-gen__field">
      <label className="zn-label">{label}</label>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("zn-chip zn-wk-chip", className)}
    >
      {children}
    </button>
  );
}

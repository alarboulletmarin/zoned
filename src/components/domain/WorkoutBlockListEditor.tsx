import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { ChevronUp, ChevronDown, Check } from "@/components/icons";
import { WorkoutStepListEditor } from "@/components/domain/contribute/WorkoutStepListEditor";
import { zoneClass } from "@/lib/zoneColors";
import { getZoneNumber } from "@/types";
import { cn } from "@/lib/utils";
import type {
  WorkoutStep,
  WorkoutStepSegment,
  WorkoutStepRepeat,
  WorkoutStepRole,
  ZoneNumber,
} from "@/types";

type SectionKey = "warmup" | "main" | "cooldown";

interface Section {
  key: SectionKey;
  label: string;
  steps: WorkoutStep[];
  onChange: (steps: WorkoutStep[]) => void;
}

interface WorkoutBlockListEditorProps {
  sections: Section[];
}

const ZONE_NUMBERS: ZoneNumber[] = [1, 2, 3, 4, 5, 6];
const STEP_ROLES: WorkoutStepRole[] = ["effort", "recovery", "transition"];

/** `${section}:${index}` — the only block that renders as a full form. */
type ActiveId = `${SectionKey}:${number}`;

function activeId(section: SectionKey, index: number): ActiveId {
  return `${section}:${index}`;
}

function parseActiveId(id: ActiveId): { section: SectionKey; index: number } {
  const [section, index] = id.split(":");
  return { section: section as SectionKey, index: Number(index) };
}

function makeSegment(opts: {
  role?: WorkoutStepRole;
  zone?: string;
  durationSec?: number;
} = {}): WorkoutStepSegment {
  const role = opts.role ?? "effort";
  return {
    kind: "segment",
    description: "",
    durationSec: opts.durationSec ?? (role === "recovery" ? 60 : 300),
    zone: opts.zone ?? (role === "recovery" ? "Z1" : "Z2"),
    role,
  };
}

function makeIntervalRepeat(): WorkoutStepRepeat {
  return {
    kind: "repeat",
    count: 4,
    unit: "reps",
    steps: [makeSegment({ zone: "Z4", durationSec: 180 })],
    between: [makeSegment({ role: "recovery", zone: "Z1", durationSec: 90 })],
  };
}

interface QuickAdd {
  id: "warmup" | "intervals" | "continuous" | "recovery" | "cooldown";
  section: SectionKey;
  build: () => WorkoutStep;
}

const QUICK_ADDS: QuickAdd[] = [
  { id: "warmup", section: "warmup", build: () => makeSegment({ zone: "Z2", durationSec: 600 }) },
  { id: "intervals", section: "main", build: makeIntervalRepeat },
  { id: "continuous", section: "main", build: () => makeSegment({ zone: "Z3", durationSec: 1200 }) },
  { id: "recovery", section: "main", build: () => makeSegment({ role: "recovery", zone: "Z1", durationSec: 300 }) },
  { id: "cooldown", section: "cooldown", build: () => makeSegment({ role: "recovery", zone: "Z1", durationSec: 600 }) },
];

function formatMinSec(durationSec: number | undefined): string {
  const total = durationSec ?? 0;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}min`;
  return `${minutes}min${seconds.toString().padStart(2, "0")}`;
}

function summarizeStep(step: WorkoutStep): string {
  if (step.kind === "segment") {
    const zoneLabel = step.zone ? step.zone.toUpperCase() : "";
    return zoneLabel ? `${formatMinSec(step.durationSec)} en ${zoneLabel}` : formatMinSec(step.durationSec);
  }
  const effort = step.steps[0];
  const duration = effort?.kind === "segment" ? formatMinSec(effort.durationSec) : "";
  const zoneLabel = effort?.kind === "segment" && effort.zone ? effort.zone.toUpperCase() : "";
  return zoneLabel ? `${step.count} × ${duration} en ${zoneLabel}` : `${step.count} × ${duration}`;
}

/** A simple repeat is exactly what the "Intervalles" quick-add builds: one
 *  effort segment, at most one recovery segment. Anything more nested (a
 *  workout adapted from the catalogue can carry that) falls back to the
 *  generic recursive editor below so no data is lost. */
function isSimpleRepeat(step: WorkoutStepRepeat): boolean {
  const singleEffort = step.steps.length === 1 && step.steps[0].kind === "segment";
  const simpleBetween = !step.between || (step.between.length === 1 && step.between[0].kind === "segment");
  return singleEffort && simpleBetween;
}

/**
 * The workout builder's block list: a single flowing sequence of numbered
 * blocks spanning warm-up / main set / cool-down, with only one block open
 * as a full form at a time (`activeId`). Every other block is a compact
 * summary row — this is what keeps the page from becoming a 2500px wall of
 * always-open forms. Reordering across phases isn't supported (a block's
 * phase is fixed at creation, same as before); within a phase, the active
 * block carries its own move up/down controls.
 */
export function WorkoutBlockListEditor({ sections }: WorkoutBlockListEditorProps) {
  const { t } = useTranslation("common");
  const [active, setActive] = useState<ActiveId | null>(null);

  const sectionByKey = (key: SectionKey) => sections.find((s) => s.key === key)!;

  const handleRemove = (section: SectionKey, index: number) => {
    const target = sectionByKey(section);
    target.onChange(target.steps.filter((_, i) => i !== index));
    setActive((prev) => {
      if (!prev) return prev;
      const p = parseActiveId(prev);
      if (p.section !== section || p.index <= index) return prev;
      return activeId(section, p.index - 1);
    });
  };

  const handleDuplicate = (section: SectionKey, index: number) => {
    const target = sectionByKey(section);
    const clone = structuredClone(target.steps[index]);
    const next = [...target.steps];
    next.splice(index + 1, 0, clone);
    target.onChange(next);
    setActive((prev) => {
      if (!prev) return prev;
      const p = parseActiveId(prev);
      if (p.section !== section || p.index <= index) return prev;
      return activeId(section, p.index + 1);
    });
  };

  const handleMove = (section: SectionKey, index: number, direction: -1 | 1) => {
    const target = sectionByKey(section);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= target.steps.length) return;
    const next = [...target.steps];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    target.onChange(next);
    setActive(activeId(section, newIndex));
  };

  const handleQuickAdd = (qa: QuickAdd) => {
    const target = sectionByKey(qa.section);
    const newIndex = target.steps.length;
    target.onChange([...target.steps, qa.build()]);
    setActive(activeId(qa.section, newIndex));
  };

  let blockNumber = 0;

  return (
    <div className="border-t border-filet pt-5">
      {sections.map((section) =>
        section.steps.map((step, index) => {
          blockNumber += 1;
          const id = activeId(section.key, index);
          const isActive = active === id;
          return isActive ? (
            <ActiveBlockCard
              key={id}
              number={blockNumber}
              phaseLabel={section.label}
              step={step}
              canMoveUp={index > 0}
              canMoveDown={index < section.steps.length - 1}
              onMoveUp={() => handleMove(section.key, index, -1)}
              onMoveDown={() => handleMove(section.key, index, 1)}
              onClose={() => setActive(null)}
              onChange={(nextStep) => {
                const next = [...section.steps];
                next[index] = nextStep;
                section.onChange(next);
              }}
            />
          ) : (
            <CompactBlockRow
              key={id}
              number={blockNumber}
              phaseLabel={section.label}
              step={step}
              onModify={() => setActive(id)}
              onDuplicate={() => handleDuplicate(section.key, index)}
              onRemove={() => handleRemove(section.key, index)}
            />
          );
        }),
      )}

      <div className="border-t border-dashed border-filet pt-5 pb-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground">
        <span>+ {t("calculators:workoutBuilder.addBlock")}</span>
        {QUICK_ADDS.map((qa) => (
          <span key={qa.id} className="flex items-center gap-2">
            <span aria-hidden>·</span>
            <button
              type="button"
              className="uppercase hover:text-foreground transition-colors py-1"
              onClick={() => handleQuickAdd(qa)}
            >
              {t(`calculators:workoutBuilder.blockEditor.quickAdd.${qa.id}`)}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Compact summary row ────────────────────────────────────────────────

function CompactBlockRow({
  number,
  phaseLabel,
  step,
  onModify,
  onDuplicate,
  onRemove,
}: {
  number: number;
  phaseLabel: string;
  step: WorkoutStep;
  onModify: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 border-b border-filet">
      <button type="button" onClick={onModify} className="flex items-center gap-4 text-left min-w-0">
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground shrink-0">
          {t("calculators:workoutBuilder.blockEditor.blockLabel", { number })} · {phaseLabel}
        </span>
        <span className="font-sans font-bold uppercase tracking-[-0.02em] text-lg truncate">
          {summarizeStep(step)}
        </span>
      </button>
      <div className="ml-auto flex items-center gap-3 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground shrink-0">
        <button type="button" onClick={onModify} className="uppercase hover:text-foreground transition-colors py-1.5">
          {t("calculators:workoutBuilder.blockEditor.modify")}
        </button>
        <button type="button" onClick={onDuplicate} className="uppercase hover:text-foreground transition-colors py-1.5 hidden sm:inline">
          {t("calculators:workoutBuilder.blockEditor.duplicate")}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="uppercase border border-zone-5 text-zone-5 px-2 py-1.5 hover:bg-zone-5/10 transition-colors"
          aria-label={t("calculators:workoutBuilder.blockEditor.remove")}
        >
          {t("calculators:workoutBuilder.blockEditor.remove")}
        </button>
      </div>
    </div>
  );
}

// ── Active block: the one open full form ─────────────────────────────

function ActiveBlockCard({
  number,
  phaseLabel,
  step,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onClose,
  onChange,
}: {
  number: number;
  phaseLabel: string;
  step: WorkoutStep;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onClose: () => void;
  onChange: (step: WorkoutStep) => void;
}) {
  const { t } = useTranslation("common");

  return (
    <div className="bg-card p-4 sm:p-5 my-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-accent-acid">
          {t("calculators:workoutBuilder.blockEditor.blockLabel", { number })} · {phaseLabel} —{" "}
          {t("calculators:workoutBuilder.blockEditor.editing")}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onMoveUp} disabled={!canMoveUp} aria-label={t("calculators:workoutBuilder.blockEditor.moveUp")}>
            <ChevronUp className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onMoveDown} disabled={!canMoveDown} aria-label={t("calculators:workoutBuilder.blockEditor.moveDown")}>
            <ChevronDown className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label={t("calculators:workoutBuilder.blockEditor.close")}>
            <Check className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {step.kind === "segment" ? (
          <SegmentForm step={step} onChange={onChange as (s: WorkoutStepSegment) => void} />
        ) : isSimpleRepeat(step) ? (
          <SimpleRepeatForm step={step} onChange={onChange as (s: WorkoutStepRepeat) => void} />
        ) : (
          <ComplexRepeatForm step={step} onChange={onChange as (s: WorkoutStepRepeat) => void} />
        )}
      </div>
    </div>
  );
}

// ── Field pieces ──────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function ZonePicker({ value, onChange }: { value: ZoneNumber | undefined; onChange: (zone: ZoneNumber) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {ZONE_NUMBERS.map((z) => (
        <button
          key={z}
          type="button"
          onClick={() => onChange(z)}
          className={cn(
            "font-mono text-[11px] font-bold px-3 py-2 transition-opacity",
            zoneClass(z, "bg"),
            zoneClass(z, "textOn"),
            value === z ? "opacity-100" : "opacity-40 hover:opacity-70",
          )}
        >
          Z{z}
        </button>
      ))}
    </div>
  );
}

function DurationFields({
  durationSec,
  onChange,
}: {
  durationSec: number | undefined;
  onChange: (durationSec: number | undefined) => void;
}) {
  const { t } = useTranslation("common");
  const total = durationSec ?? 0;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  const update = (nextMinutes: number, nextSeconds: number) => {
    const nextTotal = Math.max(0, nextMinutes * 60 + nextSeconds);
    onChange(nextTotal || undefined);
  };

  return (
    <div className="flex gap-2">
      <div className="w-20">
        <Input
          type="number"
          min={0}
          value={minutes}
          onChange={(e) => update(Number(e.target.value || 0), seconds)}
          aria-label={t("calculators:workoutBuilder.blockEditor.minutes")}
        />
      </div>
      <div className="w-20">
        <Input
          type="number"
          min={0}
          max={59}
          value={seconds}
          onChange={(e) => update(minutes, Number(e.target.value || 0))}
          aria-label={t("calculators:workoutBuilder.blockEditor.seconds")}
        />
      </div>
    </div>
  );
}

// ── Segment form ──────────────────────────────────────────────────────

function SegmentForm({
  step,
  onChange,
}: {
  step: WorkoutStepSegment;
  onChange: (step: WorkoutStepSegment) => void;
}) {
  const { t } = useTranslation("common");
  const zoneNum = step.zone ? getZoneNumber(step.zone) : undefined;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={t("calculators:workoutBuilder.blockEditor.duration")}>
          <DurationFields durationSec={step.durationSec} onChange={(durationSec) => onChange({ ...step, durationSec })} />
        </Field>
        <Field label={t("calculators:workoutBuilder.blockEditor.distance")}>
          <Input
            type="number"
            min={0}
            value={step.distanceM ?? ""}
            onChange={(e) => onChange({ ...step, distanceM: e.target.value ? Number(e.target.value) : undefined })}
          />
        </Field>
        <Field label={t("calculators:workoutBuilder.blockEditor.role")}>
          <Segmented
            value={step.role ?? "effort"}
            onChange={(role) => onChange({ ...step, role })}
            options={STEP_ROLES.map((role) => ({
              value: role,
              label: t(`calculators:workoutBuilder.blockEditor.roles.${role}`),
            }))}
          />
        </Field>
      </div>

      <Field label={t("calculators:workoutBuilder.blockEditor.zone")}>
        <ZonePicker value={zoneNum} onChange={(z) => onChange({ ...step, zone: `Z${z}` })} />
      </Field>

      <Field label={t("calculators:workoutBuilder.blockEditor.instruction")}>
        <Input
          type="text"
          value={step.description}
          onChange={(e) => onChange({ ...step, description: e.target.value, descriptionEn: e.target.value })}
          placeholder={t("calculators:workoutBuilder.blockEditor.instructionPlaceholder")}
        />
      </Field>
    </div>
  );
}

// ── Simple repeat form (the "Intervalles" common case) ─────────────────

function SimpleRepeatForm({
  step,
  onChange,
}: {
  step: WorkoutStepRepeat;
  onChange: (step: WorkoutStepRepeat) => void;
}) {
  const { t } = useTranslation("common");
  const effort = step.steps[0] as WorkoutStepSegment;
  const recovery = step.between?.[0] as WorkoutStepSegment | undefined;
  const effortZone = effort.zone ? getZoneNumber(effort.zone) : undefined;
  const recoveryZone = recovery?.zone ? getZoneNumber(recovery.zone) : undefined;

  const updateEffort = (patch: Partial<WorkoutStepSegment>) => {
    onChange({ ...step, steps: [{ ...effort, ...patch }] });
  };

  const updateRecovery = (patch: Partial<WorkoutStepSegment>) => {
    const base: WorkoutStepSegment = recovery ?? makeSegment({ role: "recovery", zone: "Z1", durationSec: 0 });
    onChange({ ...step, between: [{ ...base, ...patch }] });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={t("calculators:workoutBuilder.blockEditor.repetitions")}>
          <Input
            type="number"
            min={1}
            value={step.count}
            onChange={(e) => onChange({ ...step, count: Math.max(1, Number(e.target.value || 1)) })}
          />
        </Field>
        <Field label={t("calculators:workoutBuilder.blockEditor.duration")}>
          <DurationFields durationSec={effort.durationSec} onChange={(durationSec) => updateEffort({ durationSec })} />
        </Field>
        <Field label={t("calculators:workoutBuilder.blockEditor.zone")}>
          <ZonePicker value={effortZone} onChange={(z) => updateEffort({ zone: `Z${z}` })} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-filet">
        <Field label={t("calculators:workoutBuilder.blockEditor.recovery")}>
          <DurationFields durationSec={recovery?.durationSec} onChange={(durationSec) => updateRecovery({ durationSec })} />
        </Field>
        <Field label={t("calculators:workoutBuilder.blockEditor.zone")}>
          <ZonePicker value={recoveryZone} onChange={(z) => updateRecovery({ zone: `Z${z}` })} />
        </Field>
      </div>

      <Field label={t("calculators:workoutBuilder.blockEditor.instruction")}>
        <Input
          type="text"
          value={effort.description}
          onChange={(e) => updateEffort({ description: e.target.value, descriptionEn: e.target.value })}
          placeholder={t("calculators:workoutBuilder.blockEditor.instructionPlaceholder")}
        />
      </Field>
    </div>
  );
}

// ── Complex repeat fallback ──────────────────────────────────────────
// Reached only for structures the quick-adds never produce (e.g. a
// workout adjusted from the catalogue with several nested steps). Reuses
// the contribute wizard's generic recursive editor so nothing is lost.

function ComplexRepeatForm({
  step,
  onChange,
}: {
  step: WorkoutStepRepeat;
  onChange: (step: WorkoutStepRepeat) => void;
}) {
  const { t } = useTranslation("common");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("calculators:workoutBuilder.blockEditor.advancedNotice")}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("calculators:workoutBuilder.blockEditor.count")}>
          <Input
            type="number"
            min={1}
            value={step.count}
            onChange={(e) => onChange({ ...step, count: Math.max(1, Number(e.target.value || 1)) })}
          />
        </Field>
      </div>

      <WorkoutStepListEditor
        steps={step.steps}
        onChange={(steps) => onChange({ ...step, steps })}
        label={t("calculators:workoutBuilder.blockEditor.steps")}
      />
      <WorkoutStepListEditor
        steps={step.between ?? []}
        onChange={(between) => onChange({ ...step, between: between.length > 0 ? between : undefined })}
        label={t("calculators:workoutBuilder.blockEditor.between")}
      />
    </div>
  );
}

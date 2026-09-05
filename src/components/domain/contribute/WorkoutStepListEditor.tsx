import { useId, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ChevronUp, ChevronDown } from "@/components/icons";
import type { WorkoutRepeatUnit, WorkoutStep, WorkoutStepRole, WorkoutStepRepeat, WorkoutStepSegment } from "@/types";
import { cn } from "@/lib/utils";

interface WorkoutStepListEditorProps {
  steps: WorkoutStep[];
  onChange: (steps: WorkoutStep[]) => void;
  label: string;
  depth?: number;
}

const REPEAT_UNITS: WorkoutRepeatUnit[] = ["reps", "sets", "blocks"];
const STEP_ROLES: WorkoutStepRole[] = ["effort", "recovery", "transition"];

function createDefaultSegment(role: WorkoutStepRole = "effort"): WorkoutStepSegment {
  return {
    kind: "segment",
    description: "",
    descriptionEn: "",
    durationSec: role === "recovery" ? 60 : 300,
    zone: role === "recovery" ? "Z1" : "Z2",
    role,
  };
}

function createDefaultRepeat(): WorkoutStepRepeat {
  return {
    kind: "repeat",
    count: 2,
    unit: "reps",
    steps: [createDefaultSegment()],
    between: [createDefaultSegment("recovery")],
  };
}

export function WorkoutStepListEditor({ steps, onChange, label, depth = 0 }: WorkoutStepListEditorProps) {
  const { t } = useTranslation("contribute");

  const updateStep = (index: number, nextStep: WorkoutStep) => {
    const next = [...steps];
    next[index] = nextStep;
    onChange(next);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, currentIndex) => currentIndex !== index));
  };

  const moveStep = (from: number, to: number) => {
    const next = [...steps];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div
      className={cn("zn-stack", depth > 0 && "zn-contrib-nest")}
      style={{ "--gap": "var(--sp-6)" } as CSSProperties}
    >
      <div className="zn-row zn-row--split">
        <h3 className="zn-kicker zn-kicker--inline">{label}</h3>
        <span className="zn-mono zn-faint">{steps.length}</span>
      </div>

      {steps.length === 0 ? (
        <div className="zn-contrib-slot">
          <p className="zn-body zn-body--sm zn-muted">{t("blocks.emptyState")}</p>
        </div>
      ) : (
        <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
          {steps.map((step, index) => (
            <WorkoutStepEditor
              key={`${step.kind}-${index}`}
              step={step}
              depth={depth}
              onChange={(nextStep) => updateStep(index, nextStep)}
              onRemove={() => removeStep(index)}
              canMoveUp={index > 0}
              canMoveDown={index < steps.length - 1}
              onMoveUp={() => moveStep(index, index - 1)}
              onMoveDown={() => moveStep(index, index + 1)}
            />
          ))}
        </div>
      )}

      <div
        className="zn-row zn-contrib-add"
        style={{ "--gap": "var(--sp-4)" } as CSSProperties}
      >
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...steps, createDefaultSegment()])}>
          <Plus />
          {t("blocks.addSegment")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...steps, createDefaultRepeat()])}>
          <Plus />
          {t("blocks.addRepeat")}
        </Button>
      </div>
    </div>
  );
}

interface WorkoutStepEditorProps {
  step: WorkoutStep;
  depth: number;
  onChange: (step: WorkoutStep) => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function WorkoutStepEditor({
  step,
  depth,
  onChange,
  onRemove,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: WorkoutStepEditorProps) {
  const { t } = useTranslation("contribute");

  return (
    <Card className={cn(depth > 0 && "zn-contrib-substep")}>
      <CardHeader>
        <div className="zn-row zn-row--split">
          <CardTitle className="zn-contrib-step__kind">
            {step.kind === "segment" ? t("blocks.segment") : t("blocks.repeat")}
          </CardTitle>
          <div className="zn-row" style={{ "--gap": "var(--sp-2)" } as CSSProperties}>
            <Button type="button" variant="ghost" size="icon" disabled={!canMoveUp} onClick={onMoveUp} aria-label={t("blocks.moveUp")}>
              <ChevronUp />
            </Button>
            <Button type="button" variant="ghost" size="icon" disabled={!canMoveDown} onClick={onMoveDown} aria-label={t("blocks.moveDown")}>
              <ChevronDown />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="zn-contrib-remove" onClick={onRemove} aria-label={t("blocks.removeBlock")}>
              <Trash2 />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {step.kind === "segment" ? (
          <SegmentEditor step={step} onChange={onChange} />
        ) : (
          <RepeatEditor step={step} onChange={onChange} depth={depth} />
        )}
      </CardContent>
    </Card>
  );
}

function SegmentEditor({
  step,
  onChange,
}: {
  step: WorkoutStepSegment;
  onChange: (step: WorkoutStepSegment) => void;
}) {
  const { t } = useTranslation("contribute");
  const uid = useId();
  const totalSec = step.durationSec ?? 0;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;

  const updateDuration = (nextMinutes: number, nextSeconds: number) => {
    const nextTotal = Math.max(0, nextMinutes * 60 + nextSeconds);
    onChange({ ...step, durationSec: nextTotal || undefined });
  };

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
      <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-description`}>
            {t("blocks.description")}
          </label>
          <input
            id={`${uid}-description`}
            type="text"
            value={step.description}
            onChange={(e) => onChange({ ...step, description: e.target.value })}
            placeholder={t("blocks.descriptionPlaceholder")}
            className="zn-contrib-input"
          />
        </div>
        <div className="zn-contrib-field">
          <label
            className="zn-contrib-field__label"
            data-optional="true"
            htmlFor={`${uid}-description-en`}
          >
            {t("blocks.descriptionEn")}
          </label>
          <input
            id={`${uid}-description-en`}
            type="text"
            value={step.descriptionEn ?? ""}
            onChange={(e) => onChange({ ...step, descriptionEn: e.target.value || undefined })}
            placeholder={t("blocks.descriptionEnPlaceholder")}
            className="zn-contrib-input"
          />
        </div>
      </div>

      <div
        className="zn-grid"
        style={{ "--cols": 4, "--cols-md": 2, "--gap": "var(--sp-6)" } as CSSProperties}
      >
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-minutes`}>
            {t("blocks.durationMinutes")}
          </label>
          <input
            id={`${uid}-minutes`}
            type="number"
            min={0}
            value={minutes}
            onChange={(e) => updateDuration(Number(e.target.value || 0), seconds)}
            data-mono="true"
            className="zn-contrib-input"
          />
        </div>
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-seconds`}>
            {t("blocks.durationSeconds")}
          </label>
          <input
            id={`${uid}-seconds`}
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => updateDuration(minutes, Number(e.target.value || 0))}
            data-mono="true"
            className="zn-contrib-input"
          />
        </div>
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-distance`}>
            {t("blocks.distanceM")}
          </label>
          <input
            id={`${uid}-distance`}
            type="number"
            min={0}
            value={step.distanceM ?? ""}
            onChange={(e) => onChange({ ...step, distanceM: e.target.value ? Number(e.target.value) : undefined })}
            data-mono="true"
            className="zn-contrib-input"
          />
        </div>
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-zone`}>
            {t("blocks.zone")}
          </label>
          <input
            id={`${uid}-zone`}
            type="text"
            value={step.zone ?? ""}
            onChange={(e) => onChange({ ...step, zone: e.target.value || undefined })}
            placeholder={t("blocks.zonePlaceholder")}
            data-mono="true"
            className="zn-contrib-input"
          />
        </div>
      </div>

      <div className="zn-contrib-field">
        <label className="zn-contrib-field__label" htmlFor={`${uid}-role`}>
          {t("blocks.role")}
        </label>
        <Select
          value={step.role ?? "effort"}
          onValueChange={(value) => onChange({ ...step, role: value as WorkoutStepRole })}
        >
          <SelectTrigger id={`${uid}-role`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STEP_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {t(`blocks.roles.${role}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function RepeatEditor({
  step,
  onChange,
  depth,
}: {
  step: WorkoutStepRepeat;
  onChange: (step: WorkoutStepRepeat) => void;
  depth: number;
}) {
  const { t } = useTranslation("contribute");
  const uid = useId();

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
      <div
        className="zn-grid"
        style={{ "--cols": 2, "--gap": "var(--sp-6)" } as CSSProperties}
      >
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-count`}>
            {t("blocks.count")}
          </label>
          <input
            id={`${uid}-count`}
            type="number"
            min={1}
            value={step.count}
            onChange={(e) => onChange({ ...step, count: Math.max(1, Number(e.target.value || 1)) })}
            data-mono="true"
            className="zn-contrib-input"
          />
        </div>
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-unit`}>
            {t("blocks.unit")}
          </label>
          <Select
            value={step.unit ?? "blocks"}
            onValueChange={(value) => onChange({ ...step, unit: value as WorkoutRepeatUnit })}
          >
            <SelectTrigger id={`${uid}-unit`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPEAT_UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {t(`blocks.units.${unit}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <WorkoutStepListEditor
        steps={step.steps}
        onChange={(steps) => onChange({ ...step, steps })}
        label={t("blocks.steps")}
        depth={depth + 1}
      />

      <WorkoutStepListEditor
        steps={step.between ?? []}
        onChange={(between) => onChange({ ...step, between: between.length > 0 ? between : undefined })}
        label={t("blocks.between")}
        depth={depth + 1}
      />
    </div>
  );
}

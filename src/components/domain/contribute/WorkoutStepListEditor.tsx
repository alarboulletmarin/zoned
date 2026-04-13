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
    <div className={cn("space-y-3", depth > 0 && "pl-3 sm:pl-4")}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </h3>
        <span className="text-xs text-muted-foreground">{steps.length}</span>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">{t("blocks.emptyState")}</p>
        </div>
      ) : (
        <div className="space-y-3">
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

      <div className="flex flex-col sm:flex-row gap-2">
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => onChange([...steps, createDefaultSegment()])}>
          <Plus className="size-4" />
          {t("blocks.addSegment")}
        </Button>
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => onChange([...steps, createDefaultRepeat()])}>
          <Plus className="size-4" />
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
    <Card className={cn(depth > 0 && "border-dashed")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm">
            {step.kind === "segment" ? t("blocks.segment") : t("blocks.repeat")}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" disabled={!canMoveUp} onClick={onMoveUp} aria-label={t("blocks.moveUp")}>
              <ChevronUp className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" disabled={!canMoveDown} onClick={onMoveDown} aria-label={t("blocks.moveDown")}>
              <ChevronDown className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label={t("blocks.removeBlock")}>
              <Trash2 className="size-4 text-destructive" />
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
  const totalSec = step.durationSec ?? 0;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;

  const updateDuration = (nextMinutes: number, nextSeconds: number) => {
    const nextTotal = Math.max(0, nextMinutes * 60 + nextSeconds);
    onChange({ ...step, durationSec: nextTotal || undefined });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t("blocks.description")}</label>
          <input
            type="text"
            value={step.description}
            onChange={(e) => onChange({ ...step, description: e.target.value })}
            placeholder={t("blocks.descriptionPlaceholder")}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t("blocks.descriptionEn")}</label>
          <input
            type="text"
            value={step.descriptionEn ?? ""}
            onChange={(e) => onChange({ ...step, descriptionEn: e.target.value || undefined })}
            placeholder={t("blocks.descriptionEnPlaceholder")}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t("blocks.durationMinutes")}</label>
          <input
            type="number"
            min={0}
            value={minutes}
            onChange={(e) => updateDuration(Number(e.target.value || 0), seconds)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t("blocks.durationSeconds")}</label>
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => updateDuration(minutes, Number(e.target.value || 0))}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t("blocks.distanceM")}</label>
          <input
            type="number"
            min={0}
            value={step.distanceM ?? ""}
            onChange={(e) => onChange({ ...step, distanceM: e.target.value ? Number(e.target.value) : undefined })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t("blocks.zone")}</label>
          <input
            type="text"
            value={step.zone ?? ""}
            onChange={(e) => onChange({ ...step, zone: e.target.value || undefined })}
            placeholder={t("blocks.zonePlaceholder")}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">{t("blocks.role")}</label>
        <Select
          value={step.role ?? "effort"}
          onValueChange={(value) => onChange({ ...step, role: value as WorkoutStepRole })}
        >
          <SelectTrigger className="w-full">
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t("blocks.count")}</label>
          <input
            type="number"
            min={1}
            value={step.count}
            onChange={(e) => onChange({ ...step, count: Math.max(1, Number(e.target.value || 1)) })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t("blocks.unit")}</label>
          <Select
            value={step.unit ?? "blocks"}
            onValueChange={(value) => onChange({ ...step, unit: value as WorkoutRepeatUnit })}
          >
            <SelectTrigger className="w-full">
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

import {
  useState,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Gauge,
  Save,
  Trash2,
  Plus,
  Target,
  FlaskConical,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from "@/components/ui/responsive-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { StatBlock } from "@/components/domain/StatBlock";
import { SEOHead } from "@/components/seo";
import {
  getRunnerProfileOrMigrate,
  saveRunnerProfile,
  loadRunnerProfile,
  updateBaseData,
  setPerformanceReference,
  removePerformanceReference,
  addBenchmark,
  deleteBenchmark,
  addPersonalRecord,
  deletePersonalRecord,
} from "@/lib/runnerProfile";
import { saveUserZonePrefs } from "@/lib/zones";
import { usePickLang } from "@/lib/i18n-utils";
import { CommuteSection } from "@/components/domain/CommuteSection";
import type {
  RunnerProfile,
  BenchmarkType,
  BenchmarkEntry,
} from "@/types/runner-profile";
import type { RaceDistance } from "@/types/plan";
import type { Difficulty } from "@/types";
import { DIFFICULTY_META } from "@/types";
import { RACE_DISTANCE_META } from "@/types/plan";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Nothing measured yet. A dash, not a sentence — the label already says what
 *  the missing number would have been. */
const NOT_SET = "—";

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0)
    return `${h}h${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function deriveVma(type: BenchmarkType, result: number): number | undefined {
  if (type === "half_cooper" && result > 0)
    return Math.round((result / 100) * 10) / 10;
  if (type === "cooper_12min" && result > 0)
    return Math.round((result / 200) * 10) / 10;
  if (type === "lab_test" && result > 0)
    return Math.round(result * 10) / 10;
  return undefined;
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

const RACE_DISTANCES = Object.keys(RACE_DISTANCE_META) as RaceDistance[];
const DIFFICULTY_KEYS: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
  "elite",
];
const BENCHMARK_TYPES: BenchmarkType[] = [
  "half_cooper",
  "cooper_12min",
  "lab_test",
  "critical_velocity",
  "time_trial",
  "other",
];

type PersonalRecordEntry = RunnerProfile["personalRecords"][number];

// ---------------------------------------------------------------------------
// TimeInputs (reusable sub-component)
// ---------------------------------------------------------------------------

/** Hours, minutes, seconds — three outlined number fields, each carrying its
 *  own unit inside the frame, so the row reads as one duration. */
function TimeInputs({
  hours,
  minutes,
  seconds,
  onHoursChange,
  onMinutesChange,
  onSecondsChange,
  hLabel,
  mLabel,
  sLabel,
}: {
  hours: string;
  minutes: string;
  seconds: string;
  onHoursChange: (v: string) => void;
  onMinutesChange: (v: string) => void;
  onSecondsChange: (v: string) => void;
  hLabel: string;
  mLabel: string;
  sLabel: string;
}) {
  return (
    <div className="zn-num__time">
      <span className="zn-numfield" style={{ "--field-w": "30px" } as CSSProperties}>
        <input
          type="number"
          min={0}
          max={9}
          value={hours}
          onChange={(e) => onHoursChange(e.target.value)}
          className="zn-numfield__input"
          aria-label={hLabel}
        />
        <span className="zn-numfield__unit">{hLabel}</span>
      </span>
      <span className="zn-numfield" style={{ "--field-w": "36px" } as CSSProperties}>
        <input
          type="number"
          min={0}
          max={59}
          value={minutes}
          onChange={(e) => onMinutesChange(e.target.value)}
          className="zn-numfield__input"
          aria-label={mLabel}
        />
        <span className="zn-numfield__unit">{mLabel}</span>
      </span>
      <span className="zn-numfield" style={{ "--field-w": "36px" } as CSSProperties}>
        <input
          type="number"
          min={0}
          max={59}
          value={seconds}
          onChange={(e) => onSecondsChange(e.target.value)}
          className="zn-numfield__input"
          aria-label={sLabel}
        />
        <span className="zn-numfield__unit">{sLabel}</span>
      </span>
    </div>
  );
}

/**
 * The head of a tab panel: what the panel holds, what it is for, how many
 * there are, and the one action that adds to it. A panel that is already a
 * list of outlined blocks does not get wrapped in a card as well — a frame
 * inside a frame reads as a mistake on paper.
 */
function PanelHead({
  title,
  description,
  meta,
  action,
}: {
  title: string;
  description: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <div className="zn-row zn-row--split zn-row--start">
      <div
        className="zn-stack zn-measure"
        style={{ "--gap": "var(--sp-4)" } as CSSProperties}
      >
        <h2 className="zn-title" data-level="3">
          {title}
        </h2>
        <p className="zn-body zn-body--sm zn-muted">{description}</p>
        {meta && <span className="zn-mono zn-faint">{meta}</span>}
      </div>
      {action && <div className="zn-fixed">{action}</div>}
    </div>
  );
}

function timeToFields(totalSeconds: number | undefined): {
  h: string;
  m: string;
  s: string;
} {
  if (!totalSeconds) return { h: "", m: "", s: "" };
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h: h > 0 ? String(h) : "", m: String(m), s: s > 0 ? String(s) : "" };
}

function fieldsToSeconds(h: string, m: string, s: string): number {
  return (
    (parseInt(h, 10) || 0) * 3600 +
    (parseInt(m, 10) || 0) * 60 +
    (parseInt(s, 10) || 0)
  );
}

// ---------------------------------------------------------------------------
// Tab 1: BaseDataSection
// ---------------------------------------------------------------------------

/** One measured value: a label, an outlined mono field carrying its unit, and
 *  the line that says what is out of range. */
function NumberField({
  id,
  label,
  unit,
  value,
  onChange,
  error,
  min,
  max,
  step,
  placeholder,
  width,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder: string;
  width: string;
}) {
  return (
    <div className="zn-num__field">
      <label className="zn-label" htmlFor={id}>
        {label}
      </label>
      <span
        className="zn-numfield"
        data-invalid={error ? "true" : undefined}
        style={{ "--field-w": width } as CSSProperties}
      >
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className="zn-numfield__input"
        />
        <span className="zn-numfield__unit">{unit}</span>
      </span>
      {error && (
        <p id={`${id}-error`} className="zn-num__error">
          {error}
        </p>
      )}
    </div>
  );
}

function BaseDataSection({
  profile,
  onSave,
}: {
  profile: RunnerProfile | null;
  onSave: (p: RunnerProfile) => void;
}) {
  const { t } = useTranslation("profile");
  const pickLang = usePickLang();

  const [fcMax, setFcMax] = useState("");
  const [vma, setVma] = useState("");
  const [weeklyKm, setWeeklyKm] = useState("");
  const [longRunKm, setLongRunKm] = useState("");
  const [runnerLevel, setRunnerLevel] = useState("");

  // Sync from profile when it changes
  useEffect(() => {
    if (!profile) return;
    setFcMax(profile.fcMax != null ? String(profile.fcMax) : "");
    setVma(profile.vma != null ? String(profile.vma) : "");
    setWeeklyKm(
      profile.currentWeeklyKm != null ? String(profile.currentWeeklyKm) : "",
    );
    setLongRunKm(
      profile.currentLongRunKm != null ? String(profile.currentLongRunKm) : "",
    );
    setRunnerLevel(profile.runnerLevel ?? "");
  }, [profile]);

  const parsedFcMax = fcMax !== "" ? Number(fcMax) : undefined;
  const parsedVma = vma !== "" ? Number(vma) : undefined;
  const parsedWeekly = weeklyKm !== "" ? Number(weeklyKm) : undefined;
  const parsedLong = longRunKm !== "" ? Number(longRunKm) : undefined;

  const fcMaxError =
    parsedFcMax !== undefined && (parsedFcMax < 100 || parsedFcMax > 250);
  const vmaError =
    parsedVma !== undefined && (parsedVma < 8 || parsedVma > 30);
  const weeklyError =
    parsedWeekly !== undefined && (parsedWeekly < 0 || parsedWeekly > 500);
  const longError =
    parsedLong !== undefined && (parsedLong < 0 || parsedLong > 200);

  const hasError = fcMaxError || vmaError || weeklyError || longError;

  function handleSave() {
    if (hasError) return;
    const updated: RunnerProfile = {
      ...(profile ?? {
        version: 1 as const,
        performanceReferences: {},
        benchmarks: [],
        personalRecords: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      fcMax: parsedFcMax,
      vma: parsedVma,
      currentWeeklyKm: parsedWeekly,
      currentLongRunKm: parsedLong,
      runnerLevel: (runnerLevel || undefined) as Difficulty | undefined,
    };
    saveRunnerProfile(updated);
    onSave(loadRunnerProfile()!);
    toast.success(t("base.saved"));
  }

  function handleUpdateZones() {
    if (!parsedFcMax && !parsedVma) return;
    saveUserZonePrefs({
      fcMax: parsedFcMax,
      vma: parsedVma,
    });
    toast.success(t("base.zonesUpdated"));
  }

  return (
    <div
      className="zn-split"
      style={{ "--split": "1fr 1fr", "--gap": "var(--sp-17)" } as CSSProperties}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("base.title")}</CardTitle>
          <CardDescription>{t("base.description")}</CardDescription>
        </CardHeader>
        <CardContent
          className="zn-stack"
          style={{ "--gap": "var(--sp-11)" } as CSSProperties}
        >
          <div className="zn-num__fields">
            <NumberField
              id="profile-vma"
              label={t("base.vma")}
              unit={t("base.vmaUnit")}
              value={vma}
              onChange={setVma}
              error={vmaError ? t("base.vmaError") : undefined}
              min={8}
              max={30}
              step={0.1}
              placeholder="16.5"
              width="52px"
            />
            <NumberField
              id="profile-fcmax"
              label={t("base.fcMax")}
              unit={t("base.fcMaxUnit")}
              value={fcMax}
              onChange={setFcMax}
              error={fcMaxError ? t("base.fcMaxError") : undefined}
              min={100}
              max={250}
              placeholder="185"
              width="52px"
            />
            <NumberField
              id="profile-weekly"
              label={t("base.weeklyKm")}
              unit={t("base.weeklyKmUnit")}
              value={weeklyKm}
              onChange={setWeeklyKm}
              error={weeklyError ? t("base.weeklyKmError") : undefined}
              min={0}
              max={500}
              placeholder="40"
              width="52px"
            />
            <NumberField
              id="profile-longrun"
              label={t("base.longRunKm")}
              unit={t("base.longRunKmUnit")}
              value={longRunKm}
              onChange={setLongRunKm}
              error={longError ? t("base.longRunKmError") : undefined}
              min={0}
              max={200}
              placeholder="18"
              width="52px"
            />
          </div>

          {/* Level: a single choice, so the selected one inverts to ink rather
              than hiding inside a dropdown. */}
          <div className="zn-num__field">
            <span className="zn-label">{t("base.runnerLevel")}</span>
            <Segmented<Difficulty>
              label={t("base.runnerLevel")}
              value={runnerLevel as Difficulty}
              onChange={(v) => setRunnerLevel(v)}
              options={DIFFICULTY_KEYS.map((d) => ({
                value: d,
                label: pickLang(DIFFICULTY_META[d], "label"),
              }))}
            />
          </div>

          <div className="zn-num__actions">
            {/* The screen's single vermillon fill. */}
            <Button onClick={handleSave} disabled={hasError}>
              <Save />
              {t("base.save")}
            </Button>
            <Button
              variant="outline"
              onClick={handleUpdateZones}
              disabled={!parsedFcMax && !parsedVma}
            >
              <Gauge />
              {t("base.updateZones")}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/plan/new">
                <Target />
                {t("base.createPlan")}
              </Link>
            </Button>
            {hasError && (
              <span className="zn-mono zn-faint zn-push">
                {t("base.errorHint")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="zn-num__aside">
        {/* An empty VMA is not an error, but it is the reason five other
            screens stay blank — so it says so, and offers the six-minute way
            out. */}
        {!profile?.vma && (
          <Alert
            kind="warning"
            title={t("base.noVmaTitle")}
            action={
              <Button variant="outline" size="sm" asChild>
                <Link to="/calculators/vma">{t("base.noVmaAction")}</Link>
              </Button>
            }
          >
            {t("base.noVmaBody")}
          </Alert>
        )}

        <div className="zn-num__source">
          <span className="zn-kicker zn-kicker--inline">
            {t("base.sourceTitle")}
          </span>
          <p className="zn-body zn-body--sm zn-muted">{t("base.sourceBody")}</p>
          <span className="zn-source">{t("base.sourceCitation")}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2: PerformanceReferencesSection
// ---------------------------------------------------------------------------

function ReferenceRow({
  distance,
  initialRef,
  onSave,
  onClear,
}: {
  distance: RaceDistance;
  initialRef?: { totalSeconds: number; date?: string; label?: string };
  onSave: (
    distance: RaceDistance,
    data: { totalSeconds: number; date?: string; label?: string },
  ) => void;
  onClear: (distance: RaceDistance) => void;
}) {
  const { t } = useTranslation("profile");
  const pickLang = usePickLang();
  const meta = RACE_DISTANCE_META[distance];

  const init = timeToFields(initialRef?.totalSeconds);
  const [hours, setHours] = useState(init.h);
  const [minutes, setMinutes] = useState(init.m);
  const [seconds, setSeconds] = useState(init.s);
  const [date, setDate] = useState(initialRef?.date ?? "");
  const [label, setLabel] = useState(initialRef?.label ?? "");

  // Re-sync if parent profile changes
  useEffect(() => {
    const f = timeToFields(initialRef?.totalSeconds);
    setHours(f.h);
    setMinutes(f.m);
    setSeconds(f.s);
    setDate(initialRef?.date ?? "");
    setLabel(initialRef?.label ?? "");
  }, [initialRef?.totalSeconds, initialRef?.date, initialRef?.label]);

  const totalSec = fieldsToSeconds(hours, minutes, seconds);
  const distanceLabel = pickLang(meta, "label");

  function handleSave() {
    if (totalSec <= 0) return;
    onSave(distance, {
      totalSeconds: totalSec,
      date: date || undefined,
      label: label || undefined,
    });
  }

  return (
    <div className="zn-num__row" data-filled={initialRef ? "true" : undefined}>
      <div className="zn-row zn-row--split">
        <span className="zn-title" data-level="4">
          {distanceLabel}
        </span>
        {initialRef && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onClear(distance)}
            aria-label={`${t("references.clear")} · ${distanceLabel}`}
          >
            <Trash2 />
          </Button>
        )}
      </div>

      <div className="zn-num__field">
        <span className="zn-label">{t("references.time")}</span>
        <TimeInputs
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          onHoursChange={setHours}
          onMinutesChange={setMinutes}
          onSecondsChange={setSeconds}
          hLabel={t("references.hours")}
          mLabel={t("references.minutes")}
          sLabel={t("references.seconds")}
        />
      </div>

      <div className="zn-num__fields">
        <div className="zn-num__field">
          <label className="zn-label" htmlFor={`ref-${distance}-date`}>
            {t("references.date")}
          </label>
          <DateInput
            id={`ref-${distance}-date`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={TODAY_ISO}
          />
        </div>
        <div className="zn-num__field">
          <label className="zn-label" htmlFor={`ref-${distance}-label`}>
            {t("references.label")}
          </label>
          <input
            id={`ref-${distance}-label`}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t("references.labelPlaceholder")}
            className="zn-num__input"
          />
        </div>
      </div>

      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={totalSec <= 0}
        >
          <Save />
          {t("references.save")}
        </Button>
      </div>
    </div>
  );
}

function PerformanceReferencesSection({
  profile,
  onUpdate,
}: {
  profile: RunnerProfile | null;
  onUpdate: (p: RunnerProfile) => void;
}) {
  const { t } = useTranslation("profile");

  function handleSaveRef(
    distance: RaceDistance,
    data: { totalSeconds: number; date?: string; label?: string },
  ) {
    setPerformanceReference(distance, data);
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("references.saved"));
  }

  function handleClear(distance: RaceDistance) {
    removePerformanceReference(distance);
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("references.cleared"));
  }

  const filled = RACE_DISTANCES.filter(
    (d) => profile?.performanceReferences[d],
  ).length;

  return (
    <div
      className="zn-stack"
      style={{ "--gap": "var(--sp-11)" } as CSSProperties}
    >
      <PanelHead
        title={t("references.title")}
        description={t("references.description")}
        meta={t("references.count", {
          count: filled,
          total: RACE_DISTANCES.length,
        })}
      />
      <div className="zn-num__rows">
        {RACE_DISTANCES.map((distance) => (
          <ReferenceRow
            key={distance}
            distance={distance}
            initialRef={profile?.performanceReferences[distance]}
            onSave={handleSaveRef}
            onClear={handleClear}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3: BenchmarkHistorySection
// ---------------------------------------------------------------------------

function BenchmarkHistorySection({
  profile,
  onUpdate,
}: {
  profile: RunnerProfile | null;
  onUpdate: (p: RunnerProfile) => void;
}) {
  const { t } = useTranslation("profile");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bmType, setBmType] = useState<BenchmarkType>("half_cooper");
  const [bmDate, setBmDate] = useState(TODAY_ISO);
  const [bmResult, setBmResult] = useState("");
  const [bmNotes, setBmNotes] = useState("");

  const benchmarks = [...(profile?.benchmarks ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  function resetDialog() {
    setBmType("half_cooper");
    setBmDate(TODAY_ISO);
    setBmResult("");
    setBmNotes("");
  }

  function openDialog() {
    resetDialog();
    setDialogOpen(true);
  }

  function handleAdd() {
    const result = Number(bmResult);
    if (!result || result <= 0) return;
    const derived = deriveVma(bmType, result);
    addBenchmark({
      type: bmType,
      date: bmDate,
      result,
      derivedVma: derived,
      notes: bmNotes || undefined,
    });
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("benchmarks.added"));
    setDialogOpen(false);
    resetDialog();
  }

  function handleDelete(id: string) {
    deleteBenchmark(id);
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("benchmarks.deleted"));
  }

  function handleUseVma(vma: number) {
    updateBaseData({ vma });
    saveUserZonePrefs({ vma });
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("benchmarks.vmaUpdated", { vma }));
  }

  const columns: ResponsiveTableColumn<BenchmarkEntry>[] = [
    {
      key: "type",
      header: t("benchmarks.type"),
      hideOnMobile: true,
      cell: (bm) => t(`benchmarks.types.${bm.type}`),
    },
    {
      key: "date",
      header: t("benchmarks.date"),
      className: "zn-num__num",
      cell: (bm) => bm.date,
    },
    {
      key: "result",
      header: t("benchmarks.result"),
      className: "zn-num__num",
      cell: (bm) =>
        `${bm.result} ${t(`benchmarks.resultUnits.${bm.type}`)}`.trim(),
    },
    {
      key: "vma",
      header: t("benchmarks.derivedVma"),
      cell: (bm) =>
        bm.derivedVma ? (
          <span
            className="zn-row"
            style={{ "--gap": "var(--sp-5)" } as CSSProperties}
          >
            <span className="zn-mono">{bm.derivedVma} km/h</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUseVma(bm.derivedVma!)}
            >
              {t("benchmarks.useVma")}
            </Button>
          </span>
        ) : (
          <span className="zn-mono zn-faint">{NOT_SET}</span>
        ),
    },
    {
      key: "notes",
      header: t("benchmarks.notes"),
      cell: (bm) =>
        bm.notes ? (
          <span className="zn-body zn-body--sm zn-muted">{bm.notes}</span>
        ) : (
          <span className="zn-faint">{NOT_SET}</span>
        ),
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("benchmarks.delete")}</span>,
      className: "zn-num__rowaction",
      cell: (bm) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleDelete(bm.id)}
          aria-label={`${t("benchmarks.delete")} · ${bm.date}`}
        >
          <Trash2 />
        </Button>
      ),
    },
  ];

  return (
    <div
      className="zn-stack"
      style={{ "--gap": "var(--sp-11)" } as CSSProperties}
    >
      <PanelHead
        title={t("benchmarks.title")}
        description={t("benchmarks.description")}
        meta={
          benchmarks.length > 0
            ? t("benchmarks.count", { count: benchmarks.length })
            : undefined
        }
        action={
          benchmarks.length > 0 ? (
            <Button size="sm" onClick={openDialog}>
              <Plus />
              {t("benchmarks.add")}
            </Button>
          ) : undefined
        }
      />

      {benchmarks.length === 0 ? (
        <EmptyState
          variant="not-started"
          icon={FlaskConical}
          title={t("benchmarks.emptyTitle")}
          description={t("benchmarks.empty")}
          action={
            <Button onClick={openDialog}>
              <Plus />
              {t("benchmarks.add")}
            </Button>
          }
        />
      ) : (
        <ResponsiveTable<BenchmarkEntry>
          data={benchmarks}
          columns={columns}
          rowKey={(bm) => bm.id}
          caption={t("benchmarks.title")}
          mobileCardTitle={(bm) => t(`benchmarks.types.${bm.type}`)}
        />
      )}

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("benchmarks.add")}</DialogTitle>
          </DialogHeader>
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-11)" } as CSSProperties}
          >
            <div className="zn-num__field">
              <label className="zn-label" htmlFor="bm-type">
                {t("benchmarks.type")}
              </label>
              <Select
                value={bmType}
                onValueChange={(v) => setBmType(v as BenchmarkType)}
              >
                <SelectTrigger id="bm-type" className="zn-num__control">
                  <SelectValue placeholder={t("benchmarks.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {BENCHMARK_TYPES.map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      {t(`benchmarks.types.${bt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="zn-num__field">
              <label className="zn-label" htmlFor="bm-date">
                {t("benchmarks.date")}
              </label>
              <DateInput
                id="bm-date"
                value={bmDate}
                onChange={(e) => setBmDate(e.target.value)}
                max={TODAY_ISO}
              />
            </div>

            <NumberField
              id="bm-result"
              label={t("benchmarks.result")}
              unit={t(`benchmarks.resultUnits.${bmType}`)}
              value={bmResult}
              onChange={setBmResult}
              min={0}
              step={bmType === "lab_test" ? 0.1 : 1}
              placeholder={t(`benchmarks.resultPlaceholders.${bmType}`)}
              width="72px"
            />

            <div className="zn-num__field">
              <label className="zn-label" htmlFor="bm-notes">
                {t("benchmarks.notes")}
              </label>
              <input
                id="bm-notes"
                type="text"
                value={bmNotes}
                onChange={(e) => setBmNotes(e.target.value)}
                placeholder={t("benchmarks.notesPlaceholder")}
                className="zn-num__input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("benchmarks.cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!bmResult || Number(bmResult) <= 0}
            >
              <Save />
              {t("benchmarks.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 4: PersonalRecordsSection
// ---------------------------------------------------------------------------

interface RecordRow {
  record: PersonalRecordEntry;
  originalIndex: number;
}

function PersonalRecordsSection({
  profile,
  onUpdate,
}: {
  profile: RunnerProfile | null;
  onUpdate: (p: RunnerProfile) => void;
}) {
  const { t } = useTranslation("profile");
  const pickLang = usePickLang();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [prDistance, setPrDistance] = useState<string>("10K");
  const [prCustom, setPrCustom] = useState("");
  const [prHours, setPrHours] = useState("");
  const [prMinutes, setPrMinutes] = useState("");
  const [prSeconds, setPrSeconds] = useState("");
  const [prDate, setPrDate] = useState("");
  const [prLabel, setPrLabel] = useState("");

  // Sort records by RACE_DISTANCE_META order, custom distances last
  const records = [...(profile?.personalRecords ?? [])].sort((a, b) => {
    const aIdx = RACE_DISTANCES.indexOf(a.distance as RaceDistance);
    const bIdx = RACE_DISTANCES.indexOf(b.distance as RaceDistance);
    const aOrder = aIdx >= 0 ? aIdx : 999;
    const bOrder = bIdx >= 0 ? bIdx : 999;
    return aOrder - bOrder;
  });

  function resetDialog() {
    setPrDistance("10K");
    setPrCustom("");
    setPrHours("");
    setPrMinutes("");
    setPrSeconds("");
    setPrDate("");
    setPrLabel("");
  }

  function openDialog() {
    resetDialog();
    setDialogOpen(true);
  }

  function handleAdd() {
    const totalSec = fieldsToSeconds(prHours, prMinutes, prSeconds);
    if (totalSec <= 0) return;
    const distance = prDistance === "other" ? prCustom : prDistance;
    if (!distance) return;
    addPersonalRecord({
      distance,
      timeSeconds: totalSec,
      date: prDate || undefined,
      label: prLabel || undefined,
      provenance: "manual",
    });
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("records.added"));
    setDialogOpen(false);
    resetDialog();
  }

  function handleDelete(index: number) {
    deletePersonalRecord(index);
    const updated = loadRunnerProfile();
    if (updated) onUpdate(updated);
    toast.success(t("records.deleted"));
  }

  // We need the original index for deletion (since we sort for display)
  // Map sorted records back to their original indices
  const originalRecords = profile?.personalRecords ?? [];
  const sortedWithIndex: RecordRow[] = records.map((r) => ({
    record: r,
    originalIndex: originalRecords.indexOf(r),
  }));

  function getDistanceLabel(distance: string): string {
    const meta = RACE_DISTANCE_META[distance as RaceDistance];
    if (meta) return pickLang(meta, "label");
    return distance;
  }

  const columns: ResponsiveTableColumn<RecordRow>[] = [
    {
      key: "distance",
      header: t("records.distance"),
      hideOnMobile: true,
      cell: ({ record }) => getDistanceLabel(record.distance),
    },
    {
      key: "time",
      header: t("records.time"),
      className: "zn-num__num",
      cell: ({ record }) => formatTime(record.timeSeconds),
    },
    {
      key: "date",
      header: t("records.date"),
      className: "zn-num__num",
      cell: ({ record }) =>
        record.date ?? <span className="zn-faint">{NOT_SET}</span>,
    },
    {
      key: "label",
      header: t("records.label"),
      cell: ({ record }) =>
        record.label ?? <span className="zn-faint">{NOT_SET}</span>,
    },
    {
      key: "provenance",
      header: t("records.provenance"),
      cell: ({ record }) => (
        <Badge variant="outline">
          {t(`records.provenances.${record.provenance}`)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">{t("records.delete")}</span>,
      className: "zn-num__rowaction",
      cell: ({ record, originalIndex }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleDelete(originalIndex)}
          aria-label={`${t("records.delete")} · ${getDistanceLabel(record.distance)}`}
        >
          <Trash2 />
        </Button>
      ),
    },
  ];

  return (
    <div
      className="zn-stack"
      style={{ "--gap": "var(--sp-11)" } as CSSProperties}
    >
      <PanelHead
        title={t("records.title")}
        description={t("records.description")}
        meta={
          sortedWithIndex.length > 0
            ? t("records.count", { count: sortedWithIndex.length })
            : undefined
        }
        action={
          sortedWithIndex.length > 0 ? (
            <Button size="sm" onClick={openDialog}>
              <Plus />
              {t("records.add")}
            </Button>
          ) : undefined
        }
      />

      {sortedWithIndex.length === 0 ? (
        <EmptyState
          variant="not-started"
          icon={Target}
          title={t("records.emptyTitle")}
          description={t("records.empty", {
            distances: RACE_DISTANCES.length,
          })}
          action={
            <Button onClick={openDialog}>
              <Plus />
              {t("records.add")}
            </Button>
          }
        />
      ) : (
        <ResponsiveTable<RecordRow>
          data={sortedWithIndex}
          columns={columns}
          rowKey={({ record, originalIndex }) =>
            `${record.distance}-${originalIndex}`
          }
          caption={t("records.title")}
          mobileCardTitle={({ record }) => getDistanceLabel(record.distance)}
        />
      )}

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("records.add")}</DialogTitle>
          </DialogHeader>
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-11)" } as CSSProperties}
          >
            <div className="zn-num__field">
              <label className="zn-label" htmlFor="pr-distance">
                {t("records.distance")}
              </label>
              <Select value={prDistance} onValueChange={setPrDistance}>
                <SelectTrigger id="pr-distance" className="zn-num__control">
                  <SelectValue placeholder={t("records.selectDistance")} />
                </SelectTrigger>
                <SelectContent>
                  {RACE_DISTANCES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {pickLang(RACE_DISTANCE_META[d], "label")}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">
                    {t("records.customDistance")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {prDistance === "other" && (
              <div className="zn-num__field">
                <label className="zn-label" htmlFor="pr-custom">
                  {t("records.customDistance")}
                </label>
                <input
                  id="pr-custom"
                  type="text"
                  value={prCustom}
                  onChange={(e) => setPrCustom(e.target.value)}
                  placeholder={t("records.customDistancePlaceholder")}
                  className="zn-num__input"
                />
              </div>
            )}

            <div className="zn-num__field">
              <span className="zn-label">{t("records.time")}</span>
              <TimeInputs
                hours={prHours}
                minutes={prMinutes}
                seconds={prSeconds}
                onHoursChange={setPrHours}
                onMinutesChange={setPrMinutes}
                onSecondsChange={setPrSeconds}
                hLabel={t("records.hours")}
                mLabel={t("records.minutes")}
                sLabel={t("records.seconds")}
              />
            </div>

            <div className="zn-num__field">
              <label className="zn-label" htmlFor="pr-date">
                {t("records.date")}
              </label>
              <DateInput
                id="pr-date"
                value={prDate}
                onChange={(e) => setPrDate(e.target.value)}
                max={TODAY_ISO}
              />
            </div>

            <div className="zn-num__field">
              <label className="zn-label" htmlFor="pr-label">
                {t("records.label")}
              </label>
              <input
                id="pr-label"
                type="text"
                value={prLabel}
                onChange={(e) => setPrLabel(e.target.value)}
                placeholder={t("records.labelPlaceholder")}
                className="zn-num__input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("records.cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                fieldsToSeconds(prHours, prMinutes, prSeconds) <= 0 ||
                (prDistance === "other" && !prCustom.trim())
              }
            >
              <Save />
              {t("records.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function RunnerProfilePage() {
  const { t } = useTranslation("profile");

  const [profile, setProfile] = useState<RunnerProfile | null>(null);

  useEffect(() => {
    const existedBefore =
      localStorage.getItem("zoned-runner-profile") !== null;
    const p = getRunnerProfileOrMigrate();
    if (p) {
      setProfile(p);
      if (!existedBefore) toast.success(t("base.migrated"));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadProfile = () => {
    const updated = loadRunnerProfile();
    if (updated) setProfile(updated);
  };

  const testCount = profile?.benchmarks.length ?? 0;

  return (
    <>
      <SEOHead
        title={t("seo.title")}
        description={t("seo.description")}
        noindex={true}
      />

      <div className="zn-num">
        {/* The four numbers everything else is computed from, next to the
            title that names them. */}
        <section
          className="zn-split zn-num__head"
          style={{ "--split": "1fr 380px" } as CSSProperties}
        >
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-6)" } as CSSProperties}
          >
            <span className="zn-kicker">{t("kicker")}</span>
            <h1 className="zn-display" data-level="2">
              {t("title")}
            </h1>
            <p className="zn-body zn-body--lead zn-num__lede">
              {t("description")}
            </p>
          </div>

          <div className="zn-num__stats">
            {/* The one value the five other screens are computed from, so it
                takes the full ink inversion rather than a tint. */}
            <StatBlock
              tone="ink"
              value={profile?.vma != null ? String(profile.vma) : NOT_SET}
              label={t("stats.vma")}
              footnote={
                testCount > 0
                  ? t("stats.vmaFoot", { count: testCount })
                  : undefined
              }
            />
            <StatBlock
              tone="card"
              value={profile?.fcMax != null ? String(profile.fcMax) : NOT_SET}
              label={t("stats.fcMax")}
            />
            <StatBlock
              tone="card"
              size="sm"
              value={
                profile?.currentWeeklyKm != null
                  ? String(profile.currentWeeklyKm)
                  : NOT_SET
              }
              label={t("stats.weekly")}
            />
            <StatBlock
              tone="card"
              size="sm"
              value={
                profile?.currentLongRunKm != null
                  ? String(profile.currentLongRunKm)
                  : NOT_SET
              }
              label={t("stats.longRun")}
            />
          </div>
        </section>

        <Tabs defaultValue="base">
          <TabsList className="zn-num__tabs">
            <TabsTrigger value="base">{t("tabs.base")}</TabsTrigger>
            <TabsTrigger value="references">{t("tabs.references")}</TabsTrigger>
            <TabsTrigger value="benchmarks">{t("tabs.benchmarks")}</TabsTrigger>
            <TabsTrigger value="records">{t("tabs.records")}</TabsTrigger>
            <TabsTrigger value="commute">{t("tabs.commute")}</TabsTrigger>
          </TabsList>

          <TabsContent value="base" className="zn-num__panel">
            <BaseDataSection profile={profile} onSave={(p) => setProfile(p)} />
          </TabsContent>

          <TabsContent value="references" className="zn-num__panel">
            <PerformanceReferencesSection
              profile={profile}
              onUpdate={reloadProfile}
            />
          </TabsContent>

          <TabsContent value="benchmarks" className="zn-num__panel">
            <BenchmarkHistorySection
              profile={profile}
              onUpdate={reloadProfile}
            />
          </TabsContent>

          <TabsContent value="records" className="zn-num__panel">
            <PersonalRecordsSection
              profile={profile}
              onUpdate={reloadProfile}
            />
          </TabsContent>

          <TabsContent value="commute" className="zn-num__panel">
            <CommuteSection />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

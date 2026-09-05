import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Brain,
  ClipboardCheck,
  Clock,
  Flag,
  Flame,
  Heart,
  Info,
  Route,
  Settings,
  Trash2,
  Utensils,
} from "@/components/icons";
import { decodeSharedSimulation, sharedSimulationUrl } from "@/lib/share/raceSimShare";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SEOHead } from "@/components/seo";
import { Alert } from "@/components/ui/alert";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  Checklist,
  DEFAULT_SETTINGS,
  MentalCuesPanel,
  NutritionPanel,
  RACE_OPTIONS,
  RaceDaySheet,
  RaceSimActions,
  RaceSimForm,
  RaceSimNav,
  RaceSimSection,
  RaceSimSummaryBar,
  RaceTimeline,
  SplitsPanel,
  Stat,
  WarmupChecklist,
  resolveSettings,
  type RaceSimNavItem,
  type RaceSimSettings,
} from "@/components/domain/raceSim";
import { cn } from "@/lib/utils";
import { generateRacePlan, getDistanceLabelEn } from "@/lib/raceSimulator";
import type { RacePlan, RaceSimInput } from "@/lib/raceSimulator";
import { formatSplitTime, formatPaceDisplay } from "@/lib/splits";
import {
  getAllSimulations,
  saveSimulation,
  deleteSimulation,
} from "@/lib/raceSimStorage";
import type { SavedSimulation } from "@/lib/raceSimStorage";
import { useSettings } from "@/hooks/useSettings";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { convertPace, getPaceUnit } from "@/lib/units";
import { toast } from "sonner";
import { exportRaceSimToPDF } from "@/lib/export/raceSimPdf";
import { useIsEnglish, usePickLang, formatDate } from "@/lib/i18n-utils";

type SectionId =
  | "timeline"
  | "dayBefore"
  | "packing"
  | "morning"
  | "warmup"
  | "race"
  | "nutrition"
  | "mental"
  | "recovery";

/**
 * Reference blocks start folded; the ones you act on start open. Collapsing
 * everything by default made the chevrons decorative, and opening everything
 * made the page a four-thousand-pixel tunnel.
 */
const DEFAULT_OPEN: Record<SectionId, boolean> = {
  timeline: true,
  dayBefore: true,
  packing: false,
  morning: true,
  warmup: false,
  race: true,
  nutrition: true,
  mental: false,
  recovery: false,
};

function settingsFromInput(input: RaceSimInput): RaceSimSettings {
  const match = RACE_OPTIONS.find(
    (opt) => Math.abs(opt.distanceKm - input.distanceKm) < 0.01,
  );
  return {
    distance: match ? match.value : "custom",
    customDistance: match ? "" : String(input.distanceKm),
    targetTime: formatSplitTime(input.targetTimeSeconds),
    startTime: input.startTime,
    strategy: input.strategy,
    weight: input.bodyWeightKg?.toString() ?? "",
  };
}

export function RaceSimulatorPage() {
  const { t } = useTranslation("simulator");
  const { t: tCommon } = useTranslation("common");
  const isEn = useIsEnglish();
  const pick = usePickLang();
  const { settings: userSettings } = useSettings();
  const unit = userSettings.unitSystem;
  // The settings panel lives in the left column on desktop and in a sheet
  // below it — "Ajuster" has to reach the one that is actually on screen.
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [settings, setSettings] = useState<RaceSimSettings>(DEFAULT_SETTINGS);
  const [plan, setPlan] = useState<RacePlan | null>(null);
  const [planInput, setPlanInput] = useState<RaceSimInput | null>(null);
  const [view, setView] = useState<"prepare" | "raceDay">("prepare");
  const [formOpen, setFormOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Partial<Record<SectionId, boolean>>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [exporting, setExporting] = useState(false);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setSavedSimulations(getAllSimulations());
  }, []);

  const resolved = resolveSettings(settings);

  const applyPlan = useCallback((input: RaceSimInput) => {
    setPlan(generateRacePlan(input));
    setPlanInput(input);
    setChecked({});
    setOpenSections({});
    setFormOpen(false);
    setSheetOpen(false);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!resolved.valid || resolved.targetSeconds === null) return;
    applyPlan({
      distanceKm: resolved.distanceKm,
      targetTimeSeconds: resolved.targetSeconds,
      startTime: settings.startTime,
      strategy: settings.strategy,
      bodyWeightKg: settings.weight ? parseFloat(settings.weight) : undefined,
    });
  }, [resolved, settings, applyPlan]);

  const handleLoad = useCallback(
    (input: RaceSimInput) => {
      setSettings(settingsFromInput(input));
      applyPlan(input);
    },
    [applyPlan],
  );

  // `/race-simulator/shared?d=…` — the inputs fully describe the plan, so a shared
  // link just replays them through the same path a saved simulation takes.
  const sharedParam = searchParams.get("d");
  useEffect(() => {
    if (!sharedParam) return;
    const input = decodeSharedSimulation(sharedParam);
    if (!input) {
      toast.error(t("shared.invalid"));
      return;
    }
    handleLoad(input);
    setIsShared(true);
  }, [sharedParam, handleLoad, t]);

  const handleSave = useCallback(() => {
    if (!plan || !planInput) return;
    const label = `${isEn ? getDistanceLabelEn(plan.distanceKm) : plan.distanceLabel} - ${formatSplitTime(plan.targetTimeSeconds)}`;
    try {
      saveSimulation({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        label,
        input: planInput,
      });
      setSavedSimulations(getAllSimulations());
      toast.success(t("saved.savedSuccess"));
    } catch {
      toast.error(t("saved.maxReached"));
    }
  }, [plan, planInput, isEn, t]);

  const handleShare = useCallback(async () => {
    if (!plan || !planInput) return;
    const url = sharedSimulationUrl(planInput);
    if (navigator.share) {
      try {
        await navigator.share({ title: plan.distanceLabel, url });
      } catch {
        // Share sheet dismissed — nothing to do.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success(tCommon("share.toast.linkCopied"));
  }, [plan, planInput, tCommon]);

  const handleExportPdf = useCallback(async () => {
    if (!plan) return;
    setExporting(true);
    const toastId = toast.loading(
      tCommon("export.loading.pdf", tCommon("export.title")),
    );
    try {
      await exportRaceSimToPDF(plan, isEn);
      toast.success(tCommon("calculators:raceSimulator.pdfExported"), { id: toastId });
    } catch {
      toast.error(tCommon("calculators:raceSimulator.exportFailed"), { id: toastId });
    } finally {
      setExporting(false);
    }
  }, [plan, isEn, tCommon]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteSimulation(deleteTarget);
    setSavedSimulations(getAllSimulations());
    setDeleteTarget(null);
    toast.success(t("saved.deletedSuccess"));
  }, [deleteTarget, t]);

  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id as SectionId]: !(prev[id as SectionId] ?? DEFAULT_OPEN[id as SectionId]),
    }));
  }, []);

  const toggleChecked = useCallback((key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleJump = useCallback((id: string) => {
    setOpenSections((prev) => ({ ...prev, [id as SectionId]: true }));
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const paceUnit = getPaceUnit(unit);

  // Every plan block, in the order you meet it on the day. Drives both the
  // rendered grid and the anchor rail, so the two can never drift apart.
  const sections = useMemo(() => {
    if (!plan) return [];
    const durationMin = plan.targetTimeSeconds / 60;
    const recovery = plan.fuelingPlan.timeline.filter(
      (cp) => cp.timeMin >= durationMin,
    );

    const list: {
      id: SectionId;
      label: string;
      navLabel: string;
      icon: React.ReactNode;
      meta?: React.ReactNode;
      wide?: boolean;
      body: React.ReactNode;
    }[] = [
      {
        id: "timeline",
        label: t("sections.timeline"),
        navLabel: t("nav.timeline"),
        icon: <Clock className="size-4" />,
        meta: `${plan.wakeUpTime} → ${plan.estimatedFinishTime}`,
        body: <RaceTimeline timeline={plan.timeline} />,
      },
    ];

    if (plan.dayBeforeChecklist.length > 0) {
      list.push({
        id: "dayBefore",
        label: t("sections.dayBefore"),
        navLabel: t("nav.dayBefore"),
        icon: <Flag className="size-4" />,
        meta: t("meta.items", { count: plan.dayBeforeChecklist.length }),
        body: (
          <Checklist
            entries={plan.dayBeforeChecklist.map((item, i) => ({
              key: `dayBefore:${i}`,
              text: pick(item, "text"),
            }))}
            checked={checked}
            onToggle={toggleChecked}
          />
        ),
      });
    }

    if (plan.raceDayChecklist.length > 0) {
      list.push({
        id: "packing",
        label: t("sections.packing"),
        navLabel: t("nav.packing"),
        icon: <ClipboardCheck className="size-4" />,
        meta: t("meta.items", { count: plan.raceDayChecklist.length }),
        body: (
          <Checklist
            entries={plan.raceDayChecklist.map((item, i) => ({
              key: `packing:${i}`,
              text: pick(item, "text"),
            }))}
            checked={checked}
            onToggle={toggleChecked}
          />
        ),
      });
    }

    list.push({
      id: "morning",
      label: t("sections.morning"),
      navLabel: t("nav.morning"),
      icon: <Utensils className="size-4" />,
      meta: plan.wakeUpTime,
      body: (
        <div className="zn-stack" style={{ "--gap": "var(--sp-10)" } as React.CSSProperties}>
          <div className="zn-rs-stats">
            <Stat label={t("labels.wakeUp")} value={plan.wakeUpTime} />
            <Stat
              label={t("labels.breakfast")}
              value={plan.breakfast.time}
              hint={t("meta.carbs", { amount: plan.breakfast.carbsG })}
            />
          </div>
          <p className="zn-rs-note zn-rs-note--muted">
            {pick(plan.breakfast, "description")}
          </p>
        </div>
      ),
    });

    if (plan.warmupExercises.length > 0) {
      list.push({
        id: "warmup",
        label: t("sections.warmup"),
        navLabel: t("nav.warmup"),
        icon: <Flame className="size-4" />,
        meta: `${plan.warmupStartTime} · ${plan.warmupDurationMin} min`,
        body: (
          <WarmupChecklist
            exercises={plan.warmupExercises}
            startTime={plan.warmupStartTime}
            totalDurationMin={plan.warmupDurationMin}
            checked={checked}
            onToggle={toggleChecked}
          />
        ),
      });
    }

    list.push({
      id: "race",
      label: t("sections.race"),
      navLabel: t("nav.race"),
      icon: <Route className="size-4" />,
      wide: true,
      meta: `${formatPaceDisplay(convertPace(plan.targetTimeSeconds / 60 / plan.distanceKm, unit))}${paceUnit}`,
      body: (
        <SplitsPanel
          plan={plan}
          strategy={planInput?.strategy ?? "even"}
          unit={unit}
        />
      ),
    });

    list.push({
      id: "nutrition",
      label: t("sections.nutrition"),
      navLabel: t("nav.nutrition"),
      icon: <Utensils className="size-4" />,
      meta:
        plan.fuelingPlan.carbsPerHourG > 0
          ? `${plan.fuelingPlan.carbsPerHourG} g/h`
          : t("meta.hydrationOnly"),
      body: (
        <NutritionPanel
          fuelingPlan={plan.fuelingPlan}
          durationMin={durationMin}
        />
      ),
    });

    list.push({
      id: "mental",
      label: t("sections.mental"),
      navLabel: t("nav.mental"),
      icon: <Brain className="size-4" />,
      meta: t("meta.segments", { count: plan.mentalCues.length }),
      body: <MentalCuesPanel cues={plan.mentalCues} />,
    });

    if (recovery.length > 0) {
      list.push({
        id: "recovery",
        label: t("sections.recovery"),
        navLabel: t("nav.recovery"),
        icon: <Heart className="size-4" />,
        body: (
          <ul className="zn-rs-cp">
            {recovery.map((cp, i) => (
              <li key={i} className="zn-rs-cp__item">
                <span className="zn-rs-cp__text">{pick(cp, "action")}</span>
              </li>
            ))}
          </ul>
        ),
      });
    }

    return list;
  }, [plan, planInput, checked, toggleChecked, pick, t, unit, paceUnit]);

  const navItems: RaceSimNavItem[] = sections.map((s) => ({
    id: s.id,
    label: s.navLabel,
  }));

  const allOpen =
    sections.length > 0 &&
    sections.every((s) => openSections[s.id] ?? DEFAULT_OPEN[s.id]);

  const handleToggleAll = useCallback(() => {
    const next = !allOpen;
    setOpenSections(
      Object.fromEntries(sections.map((s) => [s.id, next])) as Partial<
        Record<SectionId, boolean>
      >,
    );
  }, [allOpen, sections]);

  const distanceLabel = plan
    ? isEn
      ? getDistanceLabelEn(plan.distanceKm)
      : plan.distanceLabel
    : "";

  const formNode = (
    <RaceSimForm
      settings={settings}
      onChange={setSettings}
      onGenerate={handleGenerate}
      submitLabel={plan ? t("inputs.regenerate") : t("inputs.generate")}
    />
  );

  return (
    <>
      <SEOHead
        title={t("title")}
        description={t("description")}
        canonical="/race-simulator"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("title"),
            description: t("description"),
            url: "https://zoned.run/race-simulator",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: tCommon("calculators:raceSimulator.seoBreadcrumb") },
            ],
          },
        ]}
      />
      <PageContainer width="wide" className="zn-rsp">
        {/* Mono kicker, display title, one sentence. */}
        <header
          className="zn-rsp__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
        >
          <span className="zn-kicker">{t("kicker")}</span>
          <h1 className="zn-display" data-level="2">
            {t("title")}
          </h1>
          <p className="zn-body zn-body--lead zn-measure">{t("description")}</p>
        </header>

        {isShared && (
          <Alert kind="info" className="zn-rsp__banner">
            {t("shared.banner")}
          </Alert>
        )}

        {plan && (
          <RaceSimSummaryBar
            className="zn-rsp__summary"
            distanceLabel={distanceLabel}
            timeLabel={formatSplitTime(plan.targetTimeSeconds)}
            paceLabel={`${formatPaceDisplay(convertPace(plan.targetTimeSeconds / 60 / plan.distanceKm, unit))}${paceUnit}`}
            startTime={plan.startTime}
            strategyLabel={t(`inputs.${planInput?.strategy ?? "even"}`)}
            onAdjust={() => {
              if (isDesktop) {
                setFormOpen(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                setSheetOpen(true);
              }
            }}
          />
        )}

        <div className="zn-rsp__layout">
          {/* Left rail — settings before generation, navigation after. The app
              header is in flow in this design, so the rail sticks to the top of
              the viewport rather than under a bar that is no longer there. */}
          <aside className="zn-rsp__rail">
            {formOpen || !plan ? (
              <Card size="flush" className="zn-rsp__settings">
                <h2 className="zn-kicker zn-rsp__settingstitle">
                  {t("inputs.title")}
                </h2>
                {formNode}
                {plan && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="zn-rsp__closeform"
                    onClick={() => setFormOpen(false)}
                  >
                    {t("inputs.close")}
                  </Button>
                )}
              </Card>
            ) : (
              <div
                className="zn-stack"
                style={{ "--gap": "var(--sp-13)" } as React.CSSProperties}
              >
                {/* The anchors only exist in "Préparer" — the race-day sheet
                    renders one continuous run sheet, with nothing to jump to. */}
                {view === "prepare" && (
                  <RaceSimNav
                    items={navItems}
                    onJump={handleJump}
                    onToggleAll={handleToggleAll}
                    allOpen={allOpen}
                  />
                )}
                <RaceSimActions
                  onExportPdf={handleExportPdf}
                  onSave={handleSave}
                  onShare={handleShare}
                  exporting={exporting}
                />
              </div>
            )}
          </aside>

          {/* Plan */}
          <div className="zn-rsp__panel">
            {/* Mobile settings — inline until a plan exists, then behind "Ajuster". */}
            {!plan && (
              <Card size="flush" className="zn-rsp__settings zn-rsp__mobileform">
                <h2 className="zn-kicker zn-rsp__settingstitle">
                  {t("inputs.title")}
                </h2>
                {formNode}
              </Card>
            )}

            {!plan ? (
              <EmptyPlan />
            ) : (
              <>
                <div
                  className="zn-cluster zn-rsp__viewbar"
                  style={{ "--gap": "var(--sp-8)" } as React.CSSProperties}
                >
                  <Segmented
                    className="zn-rsp__switch"
                    label={t("view.label")}
                    value={view}
                    onChange={setView}
                    options={[
                      { value: "prepare", label: t("view.prepare") },
                      { value: "raceDay", label: t("view.raceDay") },
                    ]}
                  />
                  <p className="zn-caption zn-muted">
                    {view === "prepare" ? t("view.prepareHint") : t("view.raceDayHint")}
                  </p>
                </div>

                {view === "prepare" ? (
                  <>
                    <div className="zn-rsp__strip">
                      <RaceSimNav items={navItems} onJump={handleJump} variant="chips" />
                    </div>

                    <div className="zn-rsp__sections">
                      {sections.map((section) => (
                        <RaceSimSection
                          key={section.id}
                          id={section.id}
                          icon={section.icon}
                          title={section.label}
                          meta={section.meta}
                          open={openSections[section.id] ?? DEFAULT_OPEN[section.id]}
                          onToggle={toggleSection}
                          className={cn(
                            "zn-rsp__section",
                            section.wide && "zn-rsp__section--wide",
                          )}
                        >
                          {section.body}
                        </RaceSimSection>
                      ))}
                    </div>
                  </>
                ) : (
                  <RaceDaySheet
                    plan={plan}
                    unit={unit}
                    checked={checked}
                    onToggle={toggleChecked}
                  />
                )}
              </>
            )}

            {/* Saved simulations */}
            {savedSimulations.length > 0 && (
              <section className="zn-rsp__saved" aria-labelledby="rs-saved">
                <h2 id="rs-saved" className="zn-kicker zn-rsp__savedtitle">
                  {t("saved.title")}
                </h2>
                <ul className="zn-rsp__savedlist">
                  {savedSimulations.map((sim) => (
                    <li key={sim.id} className="zn-ct__saveditem">
                      <div className="zn-fill">
                        <span className="zn-ct__savedname zn-truncate">
                          {sim.label}
                        </span>
                        <span className="zn-ct__saveddate">
                          {formatDate(new Date(sim.createdAt))}
                        </span>
                      </div>
                      <div
                        className="zn-cluster zn-fixed"
                        style={{ "--gap": "var(--sp-2)" } as React.CSSProperties}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoad(sim.input)}
                        >
                          {t("actions.load")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t("actions.delete")}
                          onClick={() => setDeleteTarget(sim.id)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </PageContainer>

      {/* Mobile action bar — the PDF is what ends up on a phone race morning.
          Opaque cream on an ink rule: no blur, no translucency. */}
      {plan && (
        <div className="zn-rsp__bar">
          <RaceSimActions
            variant="bar"
            onExportPdf={handleExportPdf}
            onSave={handleSave}
            onShare={handleShare}
            exporting={exporting}
          />
          <Button
            variant="outline"
            size="icon"
            aria-label={t("inputs.adjust")}
            onClick={() => setSheetOpen(true)}
          >
            <Settings size={15} />
          </Button>
        </div>
      )}

      {/* Mobile settings sheet */}
      <Sheet open={sheetOpen && !!plan && !isDesktop} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="zn-rsp__sheet">
          <SheetHeader>
            <SheetTitle>{t("inputs.title")}</SheetTitle>
          </SheetHeader>
          <div className="zn-rsp__sheetbody">{formNode}</div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {tCommon("calculators:raceSimulator.deleteConfirm")}
            </DialogTitle>
            <DialogDescription>
              {tCommon("calculators:raceSimulator.deleteDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                {tCommon("calculators:raceSimulator.cancel")}
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 size={15} />
              {t("actions.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * No plan yet. The form that undoes this state sits in the rail on desktop and
 * directly above on a phone, so the block names what is missing and prints the
 * four things the form will produce rather than repeating the button.
 */
function EmptyPlan() {
  const { t } = useTranslation("simulator");
  const steps = [
    { icon: <Clock size={15} />, text: t("emptyState.timeline") },
    { icon: <Route size={15} />, text: t("emptyState.splits") },
    { icon: <Utensils size={15} />, text: t("emptyState.nutrition") },
    { icon: <Brain size={15} />, text: t("emptyState.mental") },
  ];
  return (
    <Card
      size="flush"
      className="zn-rsp__empty zn-stack"
      style={{ "--gap": "var(--sp-13)" } as React.CSSProperties}
    >
      <div
        className="zn-row zn-row--start"
        style={{ "--gap": "var(--sp-5)" } as React.CSSProperties}
      >
        <Info size={15} className="zn-fixed zn-faint" />
        <p className="zn-body zn-body--sm zn-muted">{t("empty")}</p>
      </div>
      <ul className="zn-rsp__steps">
        {steps.map((step, i) => (
          <li key={i} className="zn-rsp__step">
            {step.icon}
            {step.text}
          </li>
        ))}
      </ul>
    </Card>
  );
}

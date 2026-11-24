import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download, Loader2, Save, Share, Trash2, Watch } from "@/components/icons";
import { decodeSharedSimulation, sharedSimulationUrl } from "@/lib/share/raceSimShare";
import { Button } from "@/components/ui/button";
import { ActionsMenu } from "@/components/ui/actions-menu";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
import { SEOHead } from "@/components/seo";
import { Alert } from "@/components/ui/alert";
import { PageContainer } from "@/components/layout/PageContainer";
import { StepChrono, Wristband, printWristband } from "@/components/calc";
import {
  DEFAULT_SETTINGS,
  RACE_OPTIONS,
  RaceSimForm,
  resolveSettings,
  timeToMinutes,
  type RaceSimSettings,
} from "@/components/domain/raceSim";
import {
  PassagesTable,
  RacePrepDocument,
  useChapters,
  type ChapterId,
} from "@/components/domain/raceSim/RacePrepDocument";
import { RaceDayNow } from "@/components/domain/raceSim/RaceDayNow";
import { generateRacePlan, getDistanceLabelEn } from "@/lib/raceSimulator";
import type { RaceSimInput } from "@/lib/raceSimulator";
import { formatSplitTime, formatPaceDisplay, type SplitStrategy } from "@/lib/splits";
import { getAllSimulations, saveSimulation, deleteSimulation } from "@/lib/raceSimStorage";
import type { SavedSimulation } from "@/lib/raceSimStorage";
import { secondsToTimeDigits, hmsParamsToSeconds } from "@/lib/paceFields";
import { minutesToDurationDigits } from "@/lib/durationFields";
import { toast } from "@/components/ui/toast";
import { exportRaceSimToPDF } from "@/lib/export/raceSimPdf";
import { useIsEnglish, formatDate } from "@/lib/i18n-utils";
import { failureReason } from "@/lib/failure";
import { useMyNumbers } from "@/hooks/useMyNumbers";
import { minutesToHm } from "@/lib/raceDay";
import { RACE_DISTANCE_META } from "@/types/plan";
import type { UpcomingRace } from "@/lib/myNumbers";
import { raceLabel } from "@/pages/CalculateursPage";

function settingsFromInput(input: RaceSimInput): RaceSimSettings {
  const match = RACE_OPTIONS.find((opt) => Math.abs(opt.distanceKm - input.distanceKm) < 0.01);
  return {
    distance: match ? match.value : "custom",
    customDistance: match ? "" : String(input.distanceKm).replace(".", ","),
    targetTime: secondsToTimeDigits(input.targetTimeSeconds, input.distanceKm),
    startTime: minutesToDurationDigits(timeToMinutes(input.startTime)),
    strategy: input.strategy,
    weight: input.bodyWeightKg?.toString().replace(".", ",") ?? "",
  };
}

/** What the person typed for one race of their plan: the plan knows neither the gun time nor, sometimes, the target. */
interface RaceEntry {
  target?: number;
  start?: number;
  strategy?: SplitStrategy;
}

const ENTRIES_KEY = "zoned-race-sim-entries";

const CHAPTER_IDS: ChapterId[] = ["eve", "morning", "warmup", "race", "after"];

function loadEntries(): Record<string, RaceEntry> {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    return parsed && typeof parsed === "object" ? (parsed as Record<string, RaceEntry>) : {};
  } catch {
    // Unreadable storage: the times are typed again, nothing else depends on them.
    return {};
  }
}

function saveEntries(entries: Record<string, RaceEntry>) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

/** `?km=&h=&m=&s=&strat=&start=HHMM`, from the split generator. */
function settingsFromSplitsLink(params: URLSearchParams): RaceSimSettings | null {
  const km = Number((params.get("km") ?? "").replace(",", "."));
  if (!(km > 0)) return null;
  const seconds = hmsParamsToSeconds(params.get("h"), params.get("m"), params.get("s"));
  const strat = params.get("strat");
  const start = params.get("start") ?? "";
  const match = RACE_OPTIONS.find((opt) => Math.abs(opt.distanceKm - km) < 0.01);
  return {
    ...DEFAULT_SETTINGS,
    distance: match ? match.value : "custom",
    customDistance: match ? "" : String(km).replace(".", ","),
    targetTime: seconds > 0 ? secondsToTimeDigits(seconds, km) : "",
    startTime: /^\d{3,4}$/.test(start) ? String(Number(start)) : "",
    strategy: strat === "negative" || strat === "positive" ? strat : "even",
  };
}

export function RaceSimulatorPage() {
  const { t } = useTranslation("simulator");
  const { t: tCommon } = useTranslation("common");
  const isEn = useIsEnglish();
  const { numbers, ready } = useMyNumbers();
  const [searchParams] = useSearchParams();

  /** A race key, "other", or null to follow the plan (first race, else other). */
  const [choice, setChoice] = useState<string | null>(() => searchParams.get("race"));
  const [entries, setEntries] = useState<Record<string, RaceEntry>>({});
  const [settings, setSettings] = useState<RaceSimSettings>(() => settingsFromSplitsLink(searchParams) ?? DEFAULT_SETTINGS);
  const [otherInput, setOtherInput] = useState<RaceSimInput | null>(null);
  const [view, setView] = useState<"prepare" | "raceDay">("prepare");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [exporting, setExporting] = useState(false);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [activeChapter, setActiveChapter] = useState<ChapterId>("eve");

  useEffect(() => {
    setSavedSimulations(getAllSimulations());
    setEntries(loadEntries());
  }, []);

  const resolved = resolveSettings(settings);
  const fromSplits = searchParams.has("km");
  const effectiveChoice = choice ?? (fromSplits || !ready ? "other" : numbers.races[0]?.key ?? "other");
  const race: UpcomingRace | undefined = numbers.races.find((r) => r.key === effectiveChoice);
  const entry = race ? entries[race.key] ?? {} : {};

  const updateEntry = (patch: RaceEntry) => {
    if (!race) return;
    setEntries((prev) => {
      const next = { ...prev, [race.key]: { ...prev[race.key], ...patch } };
      try {
        saveEntries(next);
      } catch (err) {
        // Kept for this visit; only the next one will have to type it again.
        toast.failure(t("band.saveFailed"), err);
      }
      return next;
    });
  };

  // A race of the plan: its distance and target, plus what was typed here.
  const raceTarget = entry.target ?? race?.targetSeconds;
  const raceStrategy: SplitStrategy = entry.strategy ?? "negative";
  const raceInput: RaceSimInput | null =
    race && raceTarget && entry.start !== undefined
      ? {
          distanceKm: race.distanceKm,
          targetTimeSeconds: raceTarget,
          startTime: minutesToHm(entry.start).padStart(5, "0"),
          strategy: race.isTrail ? "even" : raceStrategy,
        }
      : null;

  const input = race ? raceInput : otherInput;
  const plan = useMemo(() => (input ? generateRacePlan(input) : null), [input]);
  const isTrail = race?.isTrail ?? false;
  const strategy = input?.strategy ?? "even";

  const handleLoad = useCallback((loaded: RaceSimInput) => {
    setChoice("other");
    setSettings(settingsFromInput(loaded));
    setOtherInput(loaded);
    setChecked({});
  }, []);

  const handleGenerate = useCallback(() => {
    if (!resolved.valid || resolved.targetSeconds === null || resolved.startTime === null) return;
    setOtherInput({
      distanceKm: resolved.distanceKm,
      targetTimeSeconds: resolved.targetSeconds,
      startTime: resolved.startTime,
      strategy: settings.strategy,
      bodyWeightKg: settings.weight ? parseFloat(settings.weight.replace(",", ".")) || undefined : undefined,
    });
    setChecked({});
  }, [resolved, settings]);

  // A split-generator link that already carries everything: the day is laid out at once.
  useEffect(() => {
    if (fromSplits && resolved.valid) handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // `/race-simulator?d=…`, a shared simulation replays its inputs.
  const sharedParam = searchParams.get("d");
  useEffect(() => {
    if (!sharedParam) return;
    const decoded = decodeSharedSimulation(sharedParam);
    if (!decoded) {
      toast.error(t("shared.invalid"));
      return;
    }
    handleLoad(decoded);
    setIsShared(true);
  }, [sharedParam, handleLoad, t]);

  const distanceText = (km: number) => (isEn ? getDistanceLabelEn(km) : plan?.distanceLabel ?? `${km} km`);
  const title = race
    ? raceLabel(race, isEn)
    : plan
      ? distanceText(plan.distanceKm)
      : t("titleOther");

  const raceDateLong = race
    ? new Date(`${race.date}T12:00:00`).toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";
  const subline = race
    ? [
        isEn ? RACE_DISTANCE_META[race.distance].labelEn : RACE_DISTANCE_META[race.distance].label,
        race.elevationGain ? `${race.elevationGain} D+` : null,
        raceDateLong,
        t("pick.fromPlan"),
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  const handleSave = useCallback(() => {
    if (!plan || !input) return;
    const label = `${race ? raceLabel(race, isEn) : distanceText(plan.distanceKm)} - ${formatSplitTime(plan.targetTimeSeconds)}`;
    try {
      saveSimulation({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), label, input });
      setSavedSimulations(getAllSimulations());
      toast.success(t("saved.done"));
    } catch (err) {
      const reason = failureReason(err);
      toast.failure(t(reason === "limit" ? "saved.maxReached" : "saved.saveFailed"), reason);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, input, race, isEn, t]);

  const shareSimulation = useCallback(
    async (shared: RaceSimInput, shareTitle: string) => {
      const url = sharedSimulationUrl(shared);
      if (navigator.share) {
        try {
          await navigator.share({ title: shareTitle, url });
        } catch {
          // Share sheet dismissed, nothing to do.
        }
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        toast.success(tCommon("share.toast.linkCopied"));
      } catch (err) {
        toast.failure(tCommon("share.toast.linkCopyFailed"), err);
      }
    },
    [tCommon],
  );

  const handleExportPdf = useCallback(async () => {
    if (!plan) return;
    setExporting(true);
    const toastId = toast.loading(tCommon("export.loading.pdf", tCommon("export.title")));
    try {
      await exportRaceSimToPDF(plan, isEn);
      toast.success(tCommon("calculators:raceSimulator.pdfExported"), { id: toastId });
    } catch (err) {
      toast.failure(tCommon("calculators:raceSimulator.exportFailed"), err, { id: toastId });
    } finally {
      setExporting(false);
    }
  }, [plan, isEn, tCommon]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteSimulation(deleteTarget);
    setSavedSimulations(getAllSimulations());
    setDeleteTarget(null);
  }, [deleteTarget]);

  const toggleChecked = useCallback((key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const chapters = useChapters(plan ?? PLACEHOLDER_PLAN, race?.date);

  // The chapter rail follows the reading: the active chapter is the last one
  // whose top has reached the line where a tap on the rail puts it (its
  // scroll-margin). Over the last half screen of the page that line slides
  // down to the bottom of the viewport, so the chapters a short page cannot
  // lift that high still take their turn, the last one included. While a
  // tapped chapter is being scrolled to, the rail keeps the tap.
  const jumping = useRef<number | null>(null);
  const followReading = useCallback(() => {
    if (jumping.current !== null) return;
    const els = CHAPTER_IDS.map((id) => document.getElementById(`rs-${id}`));
    if (!els[0]) return;
    const base = parseFloat(getComputedStyle(els[0]).scrollMarginTop) + 8;
    const span = window.innerHeight / 2;
    const remaining = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    const line = remaining < span ? base + (window.innerHeight - base) * (1 - Math.max(0, remaining) / span) : base;
    let active = 0;
    els.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= line) active = i;
    });
    setActiveChapter(CHAPTER_IDS[active]);
  }, []);

  useEffect(() => {
    if (!plan || view !== "prepare") return;
    let frame = 0;
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        followReading();
      });
    };
    followReading();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [plan, view, followReading]);

  // On a phone the rail scrolls sideways: keep the active chapter in it.
  const railRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    const pill = rail?.querySelector<HTMLElement>("[aria-current]");
    if (!rail || !pill || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({ left: pill.offsetLeft - (rail.clientWidth - pill.offsetWidth) / 2, behavior: "smooth" });
  }, [activeChapter]);

  const endJump = useRef<(() => void) | null>(null);
  const jump = (id: ChapterId) => {
    setActiveChapter(id);
    endJump.current?.();
    const started = performance.now();
    const end = () => {
      window.removeEventListener("scrollend", onScrollEnd);
      window.clearTimeout(timer);
      jumping.current = null;
      endJump.current = null;
    };
    // A scrollend this early belongs to a scroll that was already running.
    const onScrollEnd = () => performance.now() - started >= 100 && end();
    // scrollend is not in every Safari: the timeout releases the rail anyway.
    const timer = window.setTimeout(end, 1200);
    jumping.current = timer;
    endJump.current = end;
    window.addEventListener("scrollend", onScrollEnd);
    document.getElementById(`rs-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const wristRows = plan
    ? plan.splits.map((s, i) => ({
        km: String(i === plan.splits.length - 1 ? plan.distanceKm : s.index),
        split: formatSplitTime(s.splitTimeSeconds),
        passage: formatSplitTime(s.cumulativeTimeSeconds),
      }))
    : [];
  const hasSplits = !!plan && !isTrail && plan.splits.length > 0;

  const actions = plan && (
    <div className="zn-rs2__actions">
      <Button variant="outline" onClick={handleExportPdf} disabled={exporting}>
        {exporting ? <Loader2 className="zn-rsp__barspin" /> : <Download />}
        {t("actions.exportPdf")}
      </Button>
      {hasSplits && (
        <Button variant="outline" onClick={printWristband}>
          <Watch />
          {t("actions.wristband")}
        </Button>
      )}
      <Button variant="outline" onClick={() => input && shareSimulation(input, title)}>
        <Share />
        {t("actions.share")}
      </Button>
      <Button variant="ghost" onClick={handleSave}>
        <Save />
        {t("actions.save")}
      </Button>
    </div>
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
      <PageContainer width="wide" className="zn-rs2">
        {/* Choisir la course : celles du plan, puis Autre. */}
        <div className="zn-rs2__pick">
          <p className="zn-kicker">{t("kicker")}</p>
          <div className="zn-rs2__chips" role="radiogroup" aria-label={t("pick.label")}>
            {numbers.races.map((r) => (
              <button
                key={r.key}
                type="button"
                role="radio"
                aria-checked={effectiveChoice === r.key}
                className="zn-rs2__chip"
                onClick={() => {
                  setChoice(r.key);
                  setChecked({});
                }}
              >
                <span>{raceLabel(r, isEn)}</span>
                <span className="zn-rs2__chipmeta">{t("pick.daysLeft", { count: r.daysLeft })}</span>
              </button>
            ))}
            <button
              type="button"
              role="radio"
              aria-checked={effectiveChoice === "other"}
              className="zn-rs2__chip"
              onClick={() => setChoice("other")}
            >
              {numbers.races.length > 0 ? t("pick.other") : t("pick.otherOnly")}
            </button>
          </div>
        </div>

        <header className="zn-rs2__head">
          <h1 className="zn-display" data-level="2">
            {title}
          </h1>
          {subline && <p className="zn-body zn-muted">{subline}</p>}
          {!race && !plan && <p className="zn-body zn-muted">{t("descriptionShort")}</p>}
        </header>

        {isShared && (
          <Alert kind="info" className="zn-rs2__banner">
            {t("shared.banner")}
          </Alert>
        )}

        <div className="zn-rs2__band">
          {race ? (
            <>
              <div className="zn-rs2__cells">
                <StepChrono
                  label={t("band.target")}
                  format="hms"
                  value={raceTarget}
                  distanceKm={race.distanceKm}
                  step={30}
                  fallback={Math.round((race.distanceKm * 360) / 300) * 300}
                  onChange={(v) => updateEntry({ target: v })}
                />
                {!race.isTrail && (
                  <div className="zn-rs2__cell">
                    <span className="zn-calc-field__label">{t("band.pace")}</span>
                    <span className="zn-rs2__cellvalue">
                      {raceTarget ? `${formatPaceDisplay(raceTarget / 60 / race.distanceKm)}/km` : "-"}
                    </span>
                  </div>
                )}
                <StepChrono
                  label={t("band.start")}
                  format="hm"
                  value={entry.start}
                  min={0}
                  max={23 * 60 + 59}
                  step={5}
                  fallback={9 * 60}
                  onChange={(v) => updateEntry({ start: v })}
                />
              </div>
              {!race.isTrail && (
                <Segmented
                  label={t("inputs.strategy")}
                  value={raceStrategy}
                  onChange={(v) => updateEntry({ strategy: v })}
                  options={[
                    { value: "even", label: t("inputs.even") },
                    { value: "negative", label: t("inputs.negative") },
                    { value: "positive", label: t("inputs.positive") },
                  ]}
                />
              )}
              {!raceInput && <p className="zn-rs2__missing">{t(raceTarget ? "band.missingStart" : "band.missing")}</p>}
            </>
          ) : (
            <div className="zn-rs2__form">
              <RaceSimForm
                settings={settings}
                onChange={setSettings}
                onGenerate={handleGenerate}
                submitLabel={plan ? t("inputs.regenerate") : t("inputs.generate")}
              />
            </div>
          )}
        </div>

        {plan && (
          <>
            <div className="zn-rs2__mode">
              <Segmented
                label={t("view.label")}
                value={view}
                onChange={setView}
                options={[
                  { value: "prepare", label: t("view.prepare") },
                  { value: "raceDay", label: t("view.raceDay") },
                ]}
              />
            </div>

            {view === "prepare" && (
              <nav ref={railRef} className="zn-rs2__chapters" aria-label={t("doc.chapters")}>
                {chapters.map((c) => (
                  <a
                    key={c.id}
                    href={`#rs-${c.id}`}
                    aria-current={activeChapter === c.id || undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      jump(c.id);
                    }}
                  >
                    <span>{c.name}</span>
                    <span className="zn-rs2__chapterat">{c.at}</span>
                  </a>
                ))}
              </nav>
            )}

            <div className="zn-rs2__doc">
              {view === "prepare" ? (
                <RacePrepDocument
                  plan={plan}
                  chapters={chapters}
                  strategy={strategy}
                  isTrail={isTrail}
                  checked={checked}
                  onToggle={toggleChecked}
                />
              ) : (
                <RaceDayNow
                  plan={plan}
                  raceDate={race?.date}
                  isTrail={isTrail}
                  done={checked}
                  onToggleDone={toggleChecked}
                />
              )}
            </div>

            <aside className="zn-rs2__side">
              {hasSplits && (
                <section className="zn-rs2__passages" aria-labelledby="rs-passages">
                  <h2 id="rs-passages" className="zn-kicker">
                    {t("doc.passagesTitle", { strategy: t(`inputs.${strategy}`) })}
                  </h2>
                  <PassagesTable plan={plan} compact />
                  <p className="zn-calc-hint">{t("doc.passagesHint", { time: minutesToHm(timeToMinutes(plan.startTime)) })}</p>
                </section>
              )}
              {actions}
            </aside>
            {hasSplits && <Wristband title={`${title} · ${formatSplitTime(plan.targetTimeSeconds)}`} rows={wristRows} />}
          </>
        )}

        {savedSimulations.length > 0 && (
          <section className="zn-rs2__saved zn-rsp__saved" aria-labelledby="rs-saved">
            <h2 id="rs-saved" className="zn-kicker zn-rsp__savedtitle">
              {t("saved.title")}
            </h2>
            <ul className="zn-rsp__savedlist">
              {savedSimulations.map((sim) => (
                <li key={sim.id} className="zn-ct__saveditem">
                  <div className="zn-fill">
                    <span className="zn-ct__savedname zn-truncate">{sim.label}</span>
                    <span className="zn-ct__saveddate">{formatDate(new Date(sim.createdAt))}</span>
                  </div>
                  <div className="zn-cluster zn-fixed">
                    <Button variant="ghost" size="sm" onClick={() => handleLoad(sim.input)}>
                      {t("actions.load")}
                    </Button>
                    <ActionsMenu label={t("saved.actionsLabel", { name: sim.label })}>
                      <DropdownMenuItem onSelect={() => shareSimulation(sim.input, sim.label)}>
                        <Share />
                        {t("actions.share")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        className="zn-more__danger"
                        onSelect={() => setDeleteTarget(sim.id)}
                      >
                        <Trash2 />
                        {t("actions.deleteMenu")}
                      </DropdownMenuItem>
                    </ActionsMenu>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </PageContainer>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tCommon("calculators:raceSimulator.deleteConfirm")}</DialogTitle>
            <DialogDescription>{tCommon("calculators:raceSimulator.deleteDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{tCommon("calculators:raceSimulator.cancel")}</Button>
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

/** Keeps `useChapters` unconditional before a plan exists; never rendered. */
const PLACEHOLDER_PLAN = generateRacePlan({ distanceKm: 10, targetTimeSeconds: 3000, startTime: "09:00", strategy: "even" });

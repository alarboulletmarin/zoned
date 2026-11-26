import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/toast";
import { ArrowLeft } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SEOHead } from "@/components/seo";
import {
  buildCatalogueLookup,
  describeIssue,
  formatIssueReport,
  importConfigToPlanConfig,
  importPlanToTrainingPlan,
  loadAgentCatalogue,
  readImportFragment,
  readImportParams,
  validateImportParams,
  validateImportPayload,
  type CatalogueLookup,
  type FragmentReadFailure,
  type ImportIssue,
} from "@/lib/agentApi";
import { generatePlan } from "@/lib/planGenerator";
import { computePlanStats } from "@/lib/planStats";
import { savePlan } from "@/lib/planStorage";
import { isoDateOnly } from "@/lib/planDates";
import { usePickLang } from "@/lib/i18n-utils";
import type { TrainingPlan } from "@/types/plan";

type State =
  | { status: "loading" }
  | { status: "unreadable"; reason: FragmentReadFailure }
  | { status: "invalid"; errors: ImportIssue[]; warnings: ImportIssue[] }
  | { status: "failed" }
  | { status: "ready"; plan: TrainingPlan; warnings: ImportIssue[]; generated: boolean; lookup: CatalogueLookup };

/**
 * `/plan/import#d=…` (or `#distance=10K&date=…`), the door an AI agent
 * opens back into Zoned.
 *
 * The payload is in the fragment, so it never left the user's browser. The
 * page decodes it, validates it against the catalogue, shows the plan, and
 * saves nothing until the person presses Add. When the payload is wrong it
 * says exactly what, issue by issue, and offers the report as text to paste
 * back to the assistant that wrote it. Contract: docs/agent-api.md.
 */
export function PlanImportPage() {
  const { hash, search } = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("plan");
  const pick = usePickLang();
  const lang = i18n.language?.startsWith("en") ? "en" : "fr";
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    (async () => {
      // `#distance=10K&date=...`, the flat form (importParams.ts), or failing
      // that the encoded payload of `#d=` / `#j=`.
      const params = readImportParams(hash, search);
      const read = params ? null : await readImportFragment(hash);
      if (cancelled) return;
      if (read && !read.ok) {
        setState({ status: "unreadable", reason: read.reason });
        return;
      }
      const lookup = buildCatalogueLookup(await loadAgentCatalogue());
      const today = isoDateOnly(new Date());
      const result = params
        ? validateImportParams(params, lookup, { today })
        : validateImportPayload(read?.ok ? read.raw : undefined, lookup, { today });
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: "invalid", errors: result.errors, warnings: result.warnings });
        return;
      }
      const meta = { id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      const { payload } = result;
      const plan =
        payload.kind === "config"
          ? await generatePlan({ ...importConfigToPlanConfig(payload), ...meta })
          : importPlanToTrainingPlan(payload, lookup, meta);
      if (!cancelled) {
        setState({ status: "ready", plan, warnings: result.warnings, generated: payload.kind === "config", lookup });
      }
    })().catch(() => {
      // Said on screen: the "failed" state renders the error alert.
      if (!cancelled) setState({ status: "failed" });
    });

    return () => {
      cancelled = true;
    };
  }, [hash, search]);

  const head = (title: string) => <SEOHead noindex title={title} canonical="/plan/import" />;
  const back = (
    <Button variant="outline" size="sm" asChild>
      <Link to="/plans">
        <ArrowLeft />
        {t("import.backToPlans")}
      </Link>
    </Button>
  );

  if (state.status === "loading") {
    return (
      <>
        {head(t("import.title"))}
        <div className="zn-planshared">
          <section className="zn-planshared__head">
            <Spinner size={22} label={t("import.loading")} />
          </section>
        </div>
      </>
    );
  }

  if (state.status === "unreadable" || state.status === "failed") {
    const message =
      state.status === "failed" ? t("import.failed") : t(`import.unreadable.${state.reason}`);
    return (
      <>
        {head(t("import.title"))}
        <div className="zn-planshared">
          <section className="zn-planshared__head">
            <Alert kind="error" title={t("import.title")} action={back}>
              {message}
            </Alert>
          </section>
        </div>
      </>
    );
  }

  if (state.status === "invalid") {
    const copyReport = async () => {
      try {
        await navigator.clipboard.writeText(formatIssueReport(state.errors, state.warnings));
        toast.success(t("import.reportCopied"));
      } catch (err) {
        toast.failure(t("import.reportCopyFailed"), err);
      }
    };
    return (
      <>
        {head(t("import.title"))}
        <div className="zn-planshared">
          <section className="zn-planshared__head">
            <span className="zn-kicker">{t("import.invalidKicker", { count: state.errors.length })}</span>
            <h1 className="zn-display" data-level="2">
              {t("import.invalidTitle")}
            </h1>
            <p className="zn-body zn-body--lead zn-measure">{t("import.invalidLead")}</p>
            <div className="zn-cluster">
              <Button onClick={copyReport}>{t("import.copyReport")}</Button>
              {back}
            </div>
          </section>
          <section className="zn-planshared__weeks" aria-label={t("import.issuesLabel")}>
            {state.errors.map((issue, i) => (
              <div key={`e${i}`} className="zn-planshared__week zn-planimport__issue">
                <span className="zn-mono zn-planimport__path">{issue.path || "payload"}</span>
                <span className="zn-body">{describeIssue(issue, lang)}</span>
              </div>
            ))}
          </section>
        </div>
      </>
    );
  }

  const { plan, warnings, generated, lookup } = state;
  const stats = computePlanStats(plan);
  const planName = pick(plan, "name");
  const shape = [
    t("shared.weeks", { count: plan.totalWeeks }),
    t("shared.sessions", { count: stats.totalSessions }),
    `${Math.round(stats.totalEstimatedKm)} km`,
  ].join(" · ");

  const handleAdd = () => {
    const saved = savePlan(plan);
    if (!saved.ok) {
      toast.failure(t("errors.planSaveFailed"), saved);
      return;
    }
    toast.success(t("import.added"));
    navigate(`/plan/${plan.id}`);
  };

  const sessionNames = (sessions: TrainingPlan["weeks"][number]["sessions"]) =>
    sessions
      .map((s) => {
        const w = lookup.get(s.workoutId);
        return w ? pick(w, "name") : t("import.raceDay");
      })
      .join(" · ");

  return (
    <>
      {head(planName)}
      <div className="zn-planshared">
        <section className="zn-planshared__head">
          <span className="zn-kicker">{shape}</span>
          <h1 className="zn-display" data-level="2">
            {planName}
          </h1>
          <p className="zn-body zn-body--lead zn-measure">
            {generated ? t("import.subtitleConfig") : t("import.subtitlePlan")}
          </p>
          {warnings.length > 0 && (
            <Alert kind="info" title={t("import.warningsTitle")}>
              {/* A short plan first: it changes what the runner is adding,
                  a default only fills a blank. */}
              {[...warnings]
                .sort((a, b) => Number(b.code === "weeks_below_recommended") - Number(a.code === "weeks_below_recommended"))
                .map((w) => describeIssue(w, lang))
                .join(" ")}
            </Alert>
          )}
          <div className="zn-cluster">
            <Button onClick={handleAdd} className="zn-planshared__add">
              {t("import.add")}
            </Button>
          </div>
        </section>

        <section className="zn-planshared__weeks">
          {plan.weeks.map((week) => (
            <div key={week.weekNumber} className="zn-planshared__week zn-planimport__week">
              <span className="zn-mono zn-planshared__num">
                {t("shared.week", { number: week.weekNumber })}
              </span>
              <span className="zn-kicker zn-kicker--inline">
                {t(`shared.phase.${week.phase}`)}
                {week.isRecoveryWeek && week.phase !== "recovery" ? ` · ${t("import.recoveryWeek")}` : ""}
              </span>
              <span className="zn-mono zn-planshared__count">
                {t("shared.sessions", { count: week.sessions.length })}
              </span>
              {week.sessions.length > 0 && (
                <span className="zn-body zn-planimport__sessions">{sessionNames(week.sessions)}</span>
              )}
            </div>
          ))}
        </section>
      </div>

      <div className="zn-planshared__cta">
        <Button onClick={handleAdd}>{t("import.add")}</Button>
      </div>
    </>
  );
}

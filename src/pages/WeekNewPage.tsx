import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Sparkles, Plus, BookOpen } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { savePlan } from "@/lib/planStorage";
import { createEmptyWeekPlan } from "@/lib/weekToPlan";

/**
 * Week creation mode picker — mobile-first (cards stack to one column
 * under sm:). "Generate" and "Scratch" both create an empty single-week
 * plan; "Generate" passes `state.openSettings` so WeekViewPage surfaces the
 * generator settings on arrival (the user picks their parameters, then
 * generates — never blindly), while "Scratch" lands straight on the
 * composer, which defaults an empty week to the source picker. "Pre-built"
 * links to the gallery.
 */
export function WeekNewPage() {
  const { t } = useTranslation("library");
  const navigate = useNavigate();

  function createWeek(openSettings: boolean) {
    const plan = createEmptyWeekPlan(t("weekly.generate.defaultName"));
    savePlan(plan);
    navigate(
      `/weeks/${plan.id}`,
      openSettings ? { state: { openSettings: true } } : undefined,
    );
  }

  return (
    <>
      <SEOHead
        noindex
        title={t("weekly.new.title")}
        canonical="/weeks/new"
      />
      <div className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/weeks">
              <ArrowLeft className="mr-2 size-4" />
              {t("weekly.new.back")}
            </Link>
          </Button>

          {/* Title */}
          <div className="border-b border-filet pb-6">
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              {t("weekly.new.subtitle")}
            </p>
            <h1 className="font-sans font-bold uppercase leading-[0.92] tracking-[-0.04em] text-4xl sm:text-5xl mt-2">
              {t("weekly.new.title")}
            </h1>
          </div>

          {/* Cards — three modes: generate, build from scratch, or pre-built. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border border border-border">
            {/* Generate a balanced 80/20 week */}
            <button
              type="button"
              onClick={() => createWeek(true)}
              className={cn(
                "h-full w-full text-left bg-background p-5 sm:p-6 transition-colors hover:bg-secondary",
                "flex items-center gap-4 sm:flex-col sm:items-start sm:text-left"
              )}
            >
              <div className="size-10 sm:size-12 bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="size-5 sm:size-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="font-sans font-bold uppercase tracking-[-0.02em] text-lg sm:text-xl mt-0 sm:mt-3">
                  {t("weekly.new.generate")}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t("weekly.new.generateDesc")}
                </p>
              </div>
            </button>

            {/* Build an empty week by hand, session by session */}
            <button
              type="button"
              onClick={() => createWeek(false)}
              className={cn(
                "h-full w-full text-left bg-background p-5 sm:p-6 transition-colors hover:bg-secondary",
                "flex items-center gap-4 sm:flex-col sm:items-start sm:text-left"
              )}
            >
              <div className="size-10 sm:size-12 bg-zone-2/10 flex items-center justify-center shrink-0">
                <Plus className="size-5 sm:size-6 text-zone-2" />
              </div>
              <div className="min-w-0">
                <h2 className="font-sans font-bold uppercase tracking-[-0.02em] text-lg sm:text-xl mt-0 sm:mt-3">
                  {t("weekly.new.scratch")}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t("weekly.new.scratchDesc")}
                </p>
              </div>
            </button>

            {/* Pre-built week */}
            <Link
              to="/weeks/new/prebuilt"
              className="h-full w-full bg-background p-5 sm:p-6 transition-colors hover:bg-secondary flex items-center gap-4 sm:flex-col sm:items-start sm:text-left"
            >
              <div className="size-10 sm:size-12 bg-zone-5/10 flex items-center justify-center shrink-0">
                <BookOpen className="size-5 sm:size-6 text-zone-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-sans font-bold uppercase tracking-[-0.02em] text-lg sm:text-xl mt-0 sm:mt-3">
                  {t("weekly.new.modes.prebuilt.title")}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t("weekly.new.modes.prebuilt.desc")}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

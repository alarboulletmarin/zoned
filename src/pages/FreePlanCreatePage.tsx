import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CalendarRange } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { getAllPlans, savePlan } from "@/lib/planStorage";
import { createFreePlan } from "@/lib/createFreePlan";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { cn } from "@/lib/utils";

const MIN_WEEKS = 4;
const MAX_WEEKS = 52;
const DEFAULT_WEEKS = 12;

export function FreePlanCreatePage() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [weeks, setWeeks] = useState(DEFAULT_WEEKS);
  const [startDate, setStartDate] = useState("");
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = getAllPlans().length < 5;
  const isValid = name.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    if (!canCreate) {
      setError(t("freePlan.limitReached"));
      return;
    }

    const plan = createFreePlan(name.trim(), weeks, startDate || undefined);
    savePlan(plan);
    triggerStorageWarning();
    navigate(`/plan/${plan.id}`);
  };

  return (
    <>
      <SEOHead
        title={t("freePlan.title")}
        description={t("freePlan.seoDescription")}
        canonical="/plan/new/free"
      />
      <div className="py-8">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Back */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/plan/new">
              <ArrowLeft className="mr-2 size-4" />
              {t("freePlan.back")}
            </Link>
          </Button>

          {/* Title */}
          <div className="text-center space-y-2">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CalendarRange className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">
              {t("freePlan.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("freePlan.subtitle")}
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardContent className="p-6 space-y-5">
              {/* Plan name */}
              <div>
                <label htmlFor="plan-name" className="text-sm font-medium mb-2 block">
                  {t("freePlan.planName")}
                </label>
                <input
                  id="plan-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValid) handleSubmit();
                  }}
                  placeholder={t("freePlan.namePlaceholder")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={100}
                  autoFocus
                />
              </div>

              {/* Number of weeks */}
              <div>
                <label htmlFor="plan-weeks" className="text-sm font-medium mb-2 block">
                  {t("freePlan.numberOfWeeks")}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="plan-weeks"
                    type="range"
                    min={MIN_WEEKS}
                    max={MAX_WEEKS}
                    value={weeks}
                    onChange={(e) => setWeeks(parseInt(e.target.value, 10))}
                    className="flex-1 accent-primary"
                  />
                  <div className="w-16 text-center">
                    <input
                      type="number"
                      min={MIN_WEEKS}
                      max={MAX_WEEKS}
                      value={weeks}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= MIN_WEEKS && v <= MAX_WEEKS) {
                          setWeeks(v);
                        }
                      }}
                      className="w-full rounded-md border bg-background px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {MIN_WEEKS} - {MAX_WEEKS} {t("freePlan.weeks")}
                </p>
              </div>

              {/* Optional dates */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("freePlan.startDate")}
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => { setUseCustomDate(false); setStartDate(""); }}
                    className={cn(
                      "flex-1 rounded-lg border p-3 text-sm transition-colors",
                      !useCustomDate ? "border-primary bg-primary/10 font-medium" : "hover:bg-accent/50"
                    )}
                  >
                    {t("freePlan.startNow")}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUseCustomDate(true); setStartDate(new Date().toISOString().split("T")[0]); }}
                    className={cn(
                      "flex-1 rounded-lg border p-3 text-sm transition-colors",
                      useCustomDate ? "border-primary bg-primary/10 font-medium" : "hover:bg-accent/50"
                    )}
                  >
                    {t("freePlan.chooseDate")}
                  </button>
                </div>
                {useCustomDate && (
                  <input
                    id="plan-start"
                    type="date"
                    lang={isEn ? "en" : "fr"}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border bg-background px-4 py-3 min-h-[44px] text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
                {startDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("freePlan.endDate")} :{" "}
                    {(() => {
                      const d = new Date(startDate);
                      d.setDate(d.getDate() + weeks * 7);
                      return d.toLocaleDateString(isEn ? "en-US" : "fr-FR");
                    })()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive text-center">
              {error}{" "}
              <Link to="/plans" className="underline font-medium">
                {t("freePlan.managePlans")}
              </Link>
            </div>
          )}

          {!canCreate && !error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive text-center">
              {t("freePlan.limitReachedShort")}
              <Link to="/plans" className="underline font-medium">
                {t("freePlan.deleteExisting")}
              </Link>
            </div>
          )}

          {/* Submit */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={!isValid || !canCreate}
          >
            {t("freePlan.create")}
          </Button>
        </div>
      </div>
    </>
  );
}

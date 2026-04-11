import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CalendarRange } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { savePlan } from "@/lib/planStorage";
import { createFreePlan } from "@/lib/createFreePlan";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { cn } from "@/lib/utils";
import { useIsEnglish } from "@/lib/i18n-utils";

const MIN_WEEKS = 4;
const MAX_WEEKS = 52;
const DEFAULT_WEEKS = 12;

export function FreePlanCreatePage() {
  const { t } = useTranslation("common");
  const isEn = useIsEnglish();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [weeks, setWeeks] = useState(DEFAULT_WEEKS);
  const [startDate, setStartDate] = useState("");
  const [useCustomDate, setUseCustomDate] = useState(false);

  const isValid = name.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    const plan = createFreePlan(name.trim(), weeks, startDate || undefined);
    savePlan(plan);
    triggerStorageWarning();
    navigate(`/plan/${plan.id}`);
  };

  return (
    <>
      <SEOHead
        title={t("calculators:freePlan.title")}
        description={t("calculators:freePlan.seoDescription")}
        canonical="/plan/new/free"
      />
      <div className="py-8">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Back */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/plan/new">
              <ArrowLeft className="mr-2 size-4" />
              {t("calculators:freePlan.back")}
            </Link>
          </Button>

          {/* Title */}
          <div className="text-center space-y-2">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CalendarRange className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">
              {t("calculators:freePlan.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("calculators:freePlan.subtitle")}
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardContent className="p-6 space-y-5">
              {/* Plan name */}
              <div>
                <label htmlFor="plan-name" className="text-sm font-medium mb-2 block">
                  {t("calculators:freePlan.planName")}
                </label>
                <input
                  id="plan-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValid) handleSubmit();
                  }}
                  placeholder={t("calculators:freePlan.namePlaceholder")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={100}
                  autoFocus
                />
              </div>

              {/* Number of weeks */}
              <div>
                <label htmlFor="plan-weeks" className="text-sm font-medium mb-2 block">
                  {t("calculators:freePlan.numberOfWeeks")}
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
                  {MIN_WEEKS} - {MAX_WEEKS} {t("calculators:freePlan.weeks")}
                </p>
              </div>

              {/* Optional dates */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("calculators:freePlan.startDate")}
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
                    {t("calculators:freePlan.startNow")}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUseCustomDate(true); setStartDate(new Date().toISOString().split("T")[0]); }}
                    className={cn(
                      "flex-1 rounded-lg border p-3 text-sm transition-colors",
                      useCustomDate ? "border-primary bg-primary/10 font-medium" : "hover:bg-accent/50"
                    )}
                  >
                    {t("calculators:freePlan.chooseDate")}
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
                    {t("calculators:freePlan.endDate")} :{" "}
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

          {/* Submit */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            {t("calculators:freePlan.create")}
          </Button>
        </div>
      </div>
    </>
  );
}

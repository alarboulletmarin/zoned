import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CalendarRange } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { getAllPlans, savePlan } from "@/lib/planStorage";
import { createFreePlan } from "@/lib/createFreePlan";

const MIN_WEEKS = 4;
const MAX_WEEKS = 52;
const DEFAULT_WEEKS = 12;

export function FreePlanCreatePage() {
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [weeks, setWeeks] = useState(DEFAULT_WEEKS);
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canCreate = getAllPlans().length < 5;
  const isValid = name.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    if (!canCreate) {
      setError(
        isEn
          ? "You've reached the limit of 5 plans. Delete an existing plan."
          : "Limite de 5 plans atteinte. Supprimez un plan existant."
      );
      return;
    }

    const plan = createFreePlan(name.trim(), weeks, startDate || undefined);
    savePlan(plan);
    navigate(`/plan/${plan.id}`);
  };

  return (
    <>
      <SEOHead
        title={isEn ? "Free Plan" : "Plan libre"}
        description={
          isEn
            ? "Create a blank training plan."
            : "Cr\u00e9ez un plan d'entra\u00eenement vierge."
        }
        canonical="/plan/new/free"
      />
      <div className="py-8">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Back */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/plan/new">
              <ArrowLeft className="mr-2 size-4" />
              {isEn ? "Back" : "Retour"}
            </Link>
          </Button>

          {/* Title */}
          <div className="text-center space-y-2">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CalendarRange className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">
              {isEn ? "Free Plan" : "Plan libre"}
            </h1>
            <p className="text-muted-foreground">
              {isEn
                ? "Create a blank plan and fill it at your own pace"
                : "Cr\u00e9ez un plan vierge et remplissez-le \u00e0 votre rythme"}
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardContent className="p-6 space-y-5">
              {/* Plan name */}
              <div>
                <label htmlFor="plan-name" className="text-sm font-medium mb-2 block">
                  {isEn ? "Plan name" : "Nom du plan"}
                </label>
                <input
                  id="plan-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValid) handleSubmit();
                  }}
                  placeholder={
                    isEn
                      ? "e.g. Spring marathon prep"
                      : "ex. Pr\u00e9pa marathon de printemps"
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={100}
                  autoFocus
                />
              </div>

              {/* Number of weeks */}
              <div>
                <label htmlFor="plan-weeks" className="text-sm font-medium mb-2 block">
                  {isEn ? "Number of weeks" : "Nombre de semaines"}
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
                  {MIN_WEEKS} - {MAX_WEEKS}{" "}
                  {isEn ? "weeks" : "semaines"}
                </p>
              </div>

              {/* Optional dates */}
              <div>
                <label htmlFor="plan-start" className="text-sm font-medium mb-2 block">
                  {isEn ? "Start date (optional)" : "Date de d\u00e9but (optionnel)"}
                </label>
                <input
                  id="plan-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {startDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {isEn ? "End date" : "Date de fin"} :{" "}
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
                {isEn ? "Manage plans" : "G\u00e9rer les plans"}
              </Link>
            </div>
          )}

          {!canCreate && !error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive text-center">
              {isEn
                ? "You've reached the limit of 5 plans. "
                : "Limite de 5 plans atteinte. "}
              <Link to="/plans" className="underline font-medium">
                {isEn ? "Delete an existing plan" : "Supprimer un plan existant"}
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
            {isEn ? "Create" : "Cr\u00e9er"}
          </Button>
        </div>
      </div>
    </>
  );
}

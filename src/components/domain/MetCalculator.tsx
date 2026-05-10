import { useMemo, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Flame, Info, ExternalLink } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePickLang } from "@/lib/i18n-utils";
import {
  MET_ACTIVITIES,
  CATEGORY_ORDER,
  classifyIntensity,
  computeCalories,
  computeVO2,
  type MetActivity,
  type MetCategory,
} from "@/lib/metCalculator";

const INTENSITY_COLOR: Record<ReturnType<typeof classifyIntensity>, string> = {
  light: "bg-zone-2/15 text-zone-2",
  moderate: "bg-zone-3/15 text-zone-3",
  vigorous: "bg-zone-5/15 text-zone-5",
};

export function MetCalculator() {
  const { t } = useTranslation("calculators");
  const pickLang = usePickLang();

  const [weight, setWeight] = useState<string>("70");
  const [duration, setDuration] = useState<string>("45");
  const [activityId, setActivityId] = useState<string>(MET_ACTIVITIES[2].id); // Course 10 km/h
  const [activeCategory, setActiveCategory] = useState<MetCategory>("running");
  const [customMet, setCustomMet] = useState<string>("8");

  const weightKg = parseFloat(weight) || 0;
  const durationMin = parseFloat(duration) || 0;
  const customMetValue = parseFloat(customMet) || 0;

  const selectedActivity = useMemo(
    () => MET_ACTIVITIES.find((a) => a.id === activityId) ?? MET_ACTIVITIES[0],
    [activityId],
  );

  const activitiesByCategory = useMemo(() => {
    const map = new Map<MetCategory, MetActivity[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const activity of MET_ACTIVITIES) {
      map.get(activity.category)?.push(activity);
    }
    return map;
  }, []);

  function ResultsBlock({ met }: { met: number }) {
    const kcal = computeCalories(met, weightKg, durationMin);
    const vo2 = computeVO2(met);
    const intensity = classifyIntensity(met);
    const valid = met > 0 && weightKg > 0 && durationMin > 0;

    if (!valid) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Info className="size-4" />
          {t("calculateurs.met.fillInputs")}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/10 to-transparent p-4">
          <div className="text-xs text-muted-foreground mb-1">
            {t("calculateurs.met.calories")}
          </div>
          <div className="text-2xl font-bold tabular-nums flex items-baseline gap-1">
            <Flame className="size-5 text-primary" />
            {Math.round(kcal)}
            <span className="text-sm font-normal text-muted-foreground">kcal</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {t("calculateurs.met.formula")}
          </div>
        </div>
        <div className="rounded-xl border border-border/50 p-4">
          <div className="text-xs text-muted-foreground mb-1">MET</div>
          <div className="text-2xl font-bold tabular-nums">{met.toFixed(1)}</div>
          <Badge className={cn("mt-1 text-xs", INTENSITY_COLOR[intensity])} variant="secondary">
            {t(`calculateurs.met.intensity.${intensity}`)}
          </Badge>
        </div>
        <div className="rounded-xl border border-border/50 p-4">
          <div className="text-xs text-muted-foreground mb-1">
            {t("calculateurs.met.vo2")}
          </div>
          <div className="text-2xl font-bold tabular-nums flex items-baseline gap-1">
            {vo2.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground">
              ml/kg/min
            </span>
          </div>
        </div>
      </div>
    );
  }

  const sharedInputs = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label htmlFor="met-weight" className="text-sm font-medium">
          {t("calculateurs.met.weight")}
        </label>
        <div className="flex items-center gap-2">
          <input
            id="met-weight"
            type="number"
            min={20}
            max={250}
            step={1}
            placeholder="70"
            value={weight}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
            className="flex h-9 w-full max-w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-sm text-muted-foreground">kg</span>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="met-duration" className="text-sm font-medium">
          {t("calculateurs.met.duration")}
        </label>
        <div className="flex items-center gap-2">
          <input
            id="met-duration"
            type="number"
            min={1}
            max={600}
            step={1}
            placeholder="45"
            value={duration}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
            className="flex h-9 w-full max-w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-sm text-muted-foreground">min</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="size-5 text-primary" />
          {t("calculateurs.met.calculatorTitle")}
        </CardTitle>
        <CardDescription>
          {t("calculateurs.met.calculatorDescription")}{" "}
          <a
            href="https://fr.wikipedia.org/wiki/%C3%89quivalent_m%C3%A9tabolique"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-primary hover:underline"
          >
            Wikipédia
            <ExternalLink className="size-3" />
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sharedInputs}

        <Tabs defaultValue="activity">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="activity">
              {t("calculateurs.met.tabActivity")}
            </TabsTrigger>
            <TabsTrigger value="custom">
              {t("calculateurs.met.tabCustom")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4 pt-4">
            {/* Category selector */}
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ORDER.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70",
                  )}
                >
                  {t(`calculateurs.met.category.${cat}`)}
                </button>
              ))}
            </div>

            {/* Activity grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(activitiesByCategory.get(activeCategory) ?? []).map((activity) => {
                const intensity = classifyIntensity(activity.met);
                const isActive = activityId === activity.id;
                return (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => setActivityId(activity.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm transition-all",
                      isActive
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-accent/50",
                    )}
                  >
                    <span className="flex-1 min-w-0">{pickLang(activity, "label")}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className={cn("text-xs", INTENSITY_COLOR[intensity])}>
                        {activity.met.toFixed(1)} MET
                      </Badge>
                    </span>
                  </button>
                );
              })}
            </div>

            <ResultsBlock met={selectedActivity.met} />
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="met-custom" className="text-sm font-medium">
                {t("calculateurs.met.customMetLabel")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="met-custom"
                  type="number"
                  min={0.5}
                  max={25}
                  step={0.1}
                  placeholder="8"
                  value={customMet}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomMet(e.target.value)}
                  className="flex h-9 w-full max-w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="text-sm text-muted-foreground">MET</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("calculateurs.met.customMetHelp")}
              </p>
            </div>

            <ResultsBlock met={customMetValue} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

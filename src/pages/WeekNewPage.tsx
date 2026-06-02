import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Sparkles, Pencil } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import {
  EditorialTitle,
  FadeUp,
  StaggerGrid,
  StaggerItem,
} from "@/components/editorial";
import { savePlan } from "@/lib/planStorage";
import { createEmptyWeekPlan } from "@/lib/weekToPlan";

export function WeekNewPage() {
  const { t } = useTranslation("library");
  const navigate = useNavigate();
  const [name, setName] = useState("");

  function handleScratch() {
    const plan = createEmptyWeekPlan(name.trim() || t("weekly.generate.defaultName"));
    savePlan(plan);
    navigate(`/plan/${plan.id}`);
  }

  return (
    <>
      <SEOHead noindex title={t("weekly.new.title")} canonical="/weeks/new" />
      <div className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/weeks">
              <ArrowLeft className="mr-2 size-4" />
              {t("weekly.list.title")}
            </Link>
          </Button>

          <div className="text-center space-y-2">
            <EditorialTitle as="h1" size="md">
              {t("weekly.new.title")}
            </EditorialTitle>
            <FadeUp as="p" delay={0.1} className="text-muted-foreground">
              {t("weekly.new.subtitle")}
            </FadeUp>
          </div>

          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Generate */}
            <StaggerItem>
              <Link to="/weeks/new/generate" className="block h-full">
                <Card
                  interactive
                  className="h-full bg-gradient-to-br from-primary/10 dark:from-primary/20 to-transparent border-border/50 hover:shadow-md hover:-translate-y-1 hover:border-foreground/40 transition-all duration-200"
                >
                  <CardContent className="p-5 sm:p-6 flex items-center gap-4 sm:flex-col sm:text-center">
                    <div className="size-10 sm:size-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="size-5 sm:size-8 text-primary" />
                    </div>
                    <div className="space-y-1 sm:space-y-2 min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold">
                        {t("weekly.new.generate")}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t("weekly.new.generateDesc")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>

            {/* From scratch */}
            <StaggerItem>
              <Card className="h-full bg-gradient-to-br from-zone-2/10 dark:from-zone-2/20 to-transparent border-border/50">
                <CardContent className="p-5 sm:p-6 flex flex-col items-center gap-4 text-center h-full">
                  <div className="size-10 sm:size-16 rounded-full bg-zone-2/10 flex items-center justify-center shrink-0">
                    <Pencil className="size-5 sm:size-8 text-zone-2" />
                  </div>
                  <div className="space-y-1 sm:space-y-2 min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold">
                      {t("weekly.new.scratch")}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t("weekly.new.scratchDesc")}
                    </p>
                  </div>
                  <div className="mt-auto w-full space-y-2 pt-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("weekly.new.namePlaceholder")}
                      onKeyDown={(e) => e.key === "Enter" && handleScratch()}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button onClick={handleScratch} className="w-full">
                      {t("weekly.new.scratchCreate")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerGrid>
        </div>
      </div>
    </>
  );
}

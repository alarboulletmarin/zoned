import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Zap, CalendarRange, BookOpen } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";

export function PlanNewPage() {
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  return (
    <>
      <SEOHead
        title={isEn ? "New Training Plan" : "Nouveau plan d'entra\u00eenement"}
        description={
          isEn
            ? "Choose how to create your training plan."
            : "Choisissez comment cr\u00e9er votre plan d'entra\u00eenement."
        }
        canonical="/plan/new"
      />
      <div className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/plans">
              <ArrowLeft className="mr-2 size-4" />
              {isEn ? "Back to plans" : "Retour aux plans"}
            </Link>
          </Button>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">
              {isEn ? "Create a plan" : "Cr\u00e9er un plan"}
            </h1>
            <p className="text-muted-foreground">
              {isEn
                ? "Choose the type of plan that suits you"
                : "Choisissez le type de plan qui vous convient"}
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Assisted plan */}
            <Link to="/plan/new/assisted" className="block">
              <Card interactive className="h-full bg-gradient-to-br from-primary/10 dark:from-primary/20 to-transparent border-border/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:flex-col sm:text-center">
                  <div className="size-10 sm:size-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="size-5 sm:size-8 text-primary" />
                  </div>
                  <div className="space-y-1 sm:space-y-2 min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold">
                      {isEn ? "Assisted plan" : "Plan assisté"}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {isEn
                        ? "Answer a few questions and get an auto-generated plan"
                        : "Répondez à quelques questions et obtenez un plan généré automatiquement"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Free plan */}
            <Link to="/plan/new/free" className="block">
              <Card interactive className="h-full bg-gradient-to-br from-zone-2/10 dark:from-zone-2/20 to-transparent border-border/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:flex-col sm:text-center">
                  <div className="size-10 sm:size-16 rounded-full bg-zone-2/10 flex items-center justify-center shrink-0">
                    <CalendarRange className="size-5 sm:size-8 text-zone-2" />
                  </div>
                  <div className="space-y-1 sm:space-y-2 min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold">
                      {isEn ? "Free plan" : "Plan libre"}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {isEn
                        ? "Create a blank plan and place workouts manually"
                        : "Créez un plan vierge et placez vos séances manuellement"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Pre-built plans */}
            <Link to="/plan/new/prebuilt" className="block">
              <Card interactive className="h-full bg-gradient-to-br from-zone-5/10 dark:from-zone-5/20 to-transparent border-border/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:flex-col sm:text-center">
                  <div className="size-10 sm:size-16 rounded-full bg-zone-5/10 flex items-center justify-center shrink-0">
                    <BookOpen className="size-5 sm:size-8 text-zone-5" />
                  </div>
                  <div className="space-y-1 sm:space-y-2 min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold">
                      {isEn ? "Pre-built plans" : "Plans prêt-à-l'emploi"}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {isEn
                        ? "Choose a structured plan and start immediately"
                        : "Choisissez un plan structuré et commencez immédiatement"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

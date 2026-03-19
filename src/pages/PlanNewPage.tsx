import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Zap, CalendarRange } from "@/components/icons";
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
        <div className="max-w-2xl mx-auto space-y-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assisted plan */}
            <Link to="/plan/new/assisted" className="block">
              <Card interactive className="h-full cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="size-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">
                      {isEn ? "Assisted plan" : "Plan assist\u00e9"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isEn
                        ? "Answer a few questions and a plan is generated automatically for your goal"
                        : "R\u00e9pondez \u00e0 quelques questions et un plan est g\u00e9n\u00e9r\u00e9 automatiquement pour votre objectif"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Free plan */}
            <Link to="/plan/new/free" className="block">
              <Card interactive className="h-full cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarRange className="size-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">
                      {isEn ? "Free plan" : "Plan libre"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isEn
                        ? "Create a blank plan and place your workouts manually on a calendar"
                        : "Cr\u00e9ez un plan vierge et placez vos s\u00e9ances manuellement sur un calendrier"}
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

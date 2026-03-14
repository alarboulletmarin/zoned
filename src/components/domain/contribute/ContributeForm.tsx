import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QuickIdeaForm } from "./QuickIdeaForm";
import { FullWorkoutWizard } from "./FullWorkoutWizard";

export function ContributeForm() {
  const { t } = useTranslation("contribute");

  return (
    <Tabs defaultValue="quick" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="quick">{t("quickIdea.title")}</TabsTrigger>
        <TabsTrigger value="full">{t("fullWorkout.title")}</TabsTrigger>
      </TabsList>

      <TabsContent value="quick" className="mt-6">
        <QuickIdeaForm />
      </TabsContent>

      <TabsContent value="full" className="mt-6">
        <FullWorkoutWizard />
      </TabsContent>
    </Tabs>
  );
}

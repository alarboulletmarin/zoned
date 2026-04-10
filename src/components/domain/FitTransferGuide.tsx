import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WorkoutTemplate } from "@/types";

function getOS(): "windows" | "macos" | "linux" | "other" {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("cros")) return "other";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("win")) return "windows";
  if (ua.includes("linux")) return "linux";
  return "other";
}

interface FitTransferGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: WorkoutTemplate;
}

export function FitTransferGuide({ open, onOpenChange, workout }: FitTransferGuideProps) {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const [showOtherBrands, setShowOtherBrands] = useState(false);
  const os = getOS();
  const filename = `${workout.id}.fit`;

  const osPath = t(`fitTransfer.osPath.${os}`);

  const steps = [
    t("fitTransfer.step1"),
    t("fitTransfer.step2OsPath", { path: osPath }),
    t("fitTransfer.step3"),
    t("fitTransfer.step4", { filename }),
    t("fitTransfer.step5"),
  ];

  function formatWorkoutAsText(): string {
    const lines: string[] = [];
    const name = isEn ? (workout.nameEn || workout.name) : workout.name;
    lines.push(name);
    lines.push("");

    const sections = [
      { label: t("fitTransfer.warmup"), blocks: workout.warmupTemplate },
      { label: t("fitTransfer.mainSet"), blocks: workout.mainSetTemplate },
      { label: t("fitTransfer.cooldown"), blocks: workout.cooldownTemplate },
    ];

    for (const section of sections) {
      if (!section.blocks?.length) continue;
      lines.push(`${section.label} :`);
      for (const block of section.blocks) {
        const desc = isEn ? (block.descriptionEn || block.description) : block.description;
        const rep = block.repetitions ? `${block.repetitions}x ` : "";
        lines.push(`  ${rep}${desc} (${block.durationMin}min, ${block.zone})`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  async function copyInstructions() {
    try {
      await navigator.clipboard.writeText(formatWorkoutAsText());
      toast.success(t("fitTransfer.instructionsCopied"));
    } catch {
      toast.error(t("fitTransfer.copyFailed"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("fitTransfer.workoutDownloaded")}
          </DialogTitle>
          <DialogDescription>
            {t("fitTransfer.fileDownloaded", { filename })}
          </DialogDescription>
        </DialogHeader>

        <ol className="space-y-3 text-sm">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 size-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-muted-foreground pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        <p className="text-xs text-muted-foreground">
          {t("fitTransfer.compatible")}
        </p>

        {/* Other brands toggle */}
        <button
          type="button"
          onClick={() => setShowOtherBrands(!showOtherBrands)}
          className="text-sm text-primary hover:underline text-left"
        >
          {t("fitTransfer.noGarmin")}
        </button>

        {showOtherBrands && (
          <div className="space-y-3 rounded-lg border p-4 text-sm">
            <p className="text-muted-foreground">
              {t("fitTransfer.fitGarminOnly")}
            </p>
            <Button variant="outline" size="sm" onClick={copyInstructions}>
              {t("fitTransfer.copyInstructions")}
            </Button>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Polar : Polar Flow → {t("fitTransfer.polarPath", { defaultValue: isEn ? "Favorites → Create" : "Favoris → Créer" })}</li>
              <li>Suunto : Suunto App → {t("fitTransfer.suuntoPath", { defaultValue: isEn ? "Training → Create" : "Entraînement → Créer" })}</li>
              <li>COROS : COROS App → Workout → {t("fitTransfer.corosPath", { defaultValue: isEn ? "Create" : "Créer" })}</li>
              <li>Apple Watch : {t("fitTransfer.applePath", { defaultValue: isEn ? "Workout → Create (watchOS 9+)" : "Exercice → Créer (watchOS 9+)" })}</li>
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {t("fitTransfer.gotIt")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

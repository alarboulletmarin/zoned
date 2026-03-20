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
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const [showOtherBrands, setShowOtherBrands] = useState(false);
  const os = getOS();
  const filename = `${workout.id}.fit`;

  const osPath = {
    windows: isEn ? "File Explorer → This PC → GARMIN" : "Explorateur de fichiers → Ce PC → GARMIN",
    macos: isEn ? "Finder → Sidebar → GARMIN" : "Finder → Barre latérale → GARMIN",
    linux: isEn ? "File manager → /media/GARMIN" : "Gestionnaire de fichiers → /media/GARMIN",
    other: isEn ? "Your file manager → GARMIN drive" : "Gestionnaire de fichiers → GARMIN",
  }[os];

  const steps = isEn
    ? [
        "Connect your Garmin watch to your computer with the USB cable",
        `Your watch appears as a USB drive: ${osPath}`,
        "Open the watch folder and navigate to: GARMIN → NewFiles",
        `Copy the file ${filename} into this folder`,
        "Safely eject your watch — the workout will appear in Training → My Workouts",
      ]
    : [
        "Branchez votre montre Garmin à votre ordinateur avec le câble USB",
        `Votre montre apparaît comme un disque USB : ${osPath}`,
        "Ouvrez le dossier de la montre et naviguez vers : GARMIN → NewFiles",
        `Copiez le fichier ${filename} dans ce dossier`,
        "Débranchez votre montre en toute sécurité — la séance apparaîtra dans Entraînement → Mes séances",
      ];

  function formatWorkoutAsText(): string {
    const lines: string[] = [];
    const name = isEn ? (workout.nameEn || workout.name) : workout.name;
    lines.push(name);
    lines.push("");

    const sections = [
      { label: isEn ? "Warm-up" : "Échauffement", blocks: workout.warmupTemplate },
      { label: isEn ? "Main set" : "Corps de séance", blocks: workout.mainSetTemplate },
      { label: isEn ? "Cool-down" : "Retour au calme", blocks: workout.cooldownTemplate },
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
      toast.success(isEn ? "Instructions copied!" : "Instructions copiées !");
    } catch {
      toast.error(isEn ? "Failed to copy" : "Erreur de copie");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEn ? "Workout downloaded!" : "Séance téléchargée !"}
          </DialogTitle>
          <DialogDescription>
            {isEn
              ? `The file ${filename} has been downloaded.`
              : `Le fichier ${filename} a été téléchargé.`}
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
          {isEn
            ? "Compatible with: Forerunner, Fenix, Enduro, Venu, Epix, Instinct, Vivoactive"
            : "Compatible avec : Forerunner, Fenix, Enduro, Venu, Epix, Instinct, Vivoactive"}
        </p>

        {/* Other brands toggle */}
        <button
          type="button"
          onClick={() => setShowOtherBrands(!showOtherBrands)}
          className="text-sm text-primary hover:underline text-left"
        >
          {isEn ? "Don't have a Garmin watch?" : "Vous n'avez pas de montre Garmin ?"}
        </button>

        {showOtherBrands && (
          <div className="space-y-3 rounded-lg border p-4 text-sm">
            <p className="text-muted-foreground">
              {isEn
                ? "FIT export is compatible with Garmin watches only. For other brands, recreate this workout manually in your watch's companion app."
                : "L'export FIT est compatible uniquement avec les montres Garmin. Pour les autres marques, recréez cette séance manuellement dans l'app de votre montre."}
            </p>
            <Button variant="outline" size="sm" onClick={copyInstructions}>
              {isEn ? "Copy workout instructions" : "Copier les instructions"}
            </Button>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Polar : Polar Flow → {isEn ? "Favorites → Create" : "Favoris → Créer"}</li>
              <li>Suunto : Suunto App → {isEn ? "Training → Create" : "Entraînement → Créer"}</li>
              <li>COROS : COROS App → Workout → {isEn ? "Create" : "Créer"}</li>
              <li>Apple Watch : {isEn ? "Workout → Create (watchOS 9+)" : "Exercice → Créer (watchOS 9+)"}</li>
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {isEn ? "Got it" : "Compris"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Brain, Heart, Sparkles, Dumbbell, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ZoneNumber, ZoneMeta } from "@/types";
import { allWorkouts } from "@/data/workouts";
import { getDominantZone } from "@/types";

interface ZoneDetailModalProps {
  zone: ZoneNumber | null;
  zoneMeta: ZoneMeta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ZoneDetailModal({
  zone,
  zoneMeta,
  open,
  onOpenChange,
}: ZoneDetailModalProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  // Derive display values only when zoneMeta is available
  const label = zoneMeta ? (isEn ? zoneMeta.labelEn : zoneMeta.label) : "";
  const description = zoneMeta ? (isEn ? zoneMeta.descriptionEn : zoneMeta.description) : "";
  const physiology = zoneMeta ? (isEn ? zoneMeta.physiologyEn : zoneMeta.physiology) : "";
  const sensation = zoneMeta ? (isEn ? zoneMeta.sensationEn : zoneMeta.sensation) : "";
  const benefit = zoneMeta ? (isEn ? zoneMeta.benefitEn : zoneMeta.benefit) : "";

  // Find 3 example workouts for this zone
  const exampleWorkouts = zone
    ? allWorkouts
        .filter((w) => getDominantZone(w) === zone)
        .slice(0, 3)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`zone-${zone ?? 1} max-h-[85vh] overflow-y-auto border-l-4`} style={{ borderLeftColor: 'var(--zone-color)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="zone-badge text-lg">Z{zone}</span>
            <span>{label}</span>
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Physiology Section */}
          <section className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Brain className="size-4 text-muted-foreground" />
              {isEn ? "Physiology" : "Physiologie"}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {physiology}
            </p>
          </section>

          {/* Sensation Section */}
          <section className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Heart className="size-4 text-muted-foreground" />
              {isEn ? "How it feels" : "Ressenti"}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {sensation}
            </p>
          </section>

          {/* Benefit Section */}
          <section className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Sparkles className="size-4 text-muted-foreground" />
              {isEn ? "Benefits" : "Benefices"}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {benefit}
            </p>
          </section>

          {/* Examples Section */}
          <section className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Dumbbell className="size-4 text-muted-foreground" />
              {isEn ? "Example workouts" : "Exemples de séances"}
            </h4>
            <div className="space-y-2">
              {exampleWorkouts.map((workout) => (
                <Link
                  key={workout.id}
                  to={`/workout/${workout.id}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group"
                >
                  <span className="text-sm">{isEn ? workout.nameEn : workout.name}</span>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </div>
            <Button variant="outline" size="sm" asChild className="w-full mt-2">
              <Link to="/library" onClick={() => onOpenChange(false)}>
                {isEn ? "See all workouts" : "Voir toutes les séances"}
              </Link>
            </Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

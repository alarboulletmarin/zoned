import { useTranslation } from "react-i18next";
import { Brain, Heart, Sparkles, Dumbbell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ZoneNumber, ZoneMeta } from "@/types";

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

  if (!zone || !zoneMeta) return null;

  const label = isEn ? zoneMeta.labelEn : zoneMeta.label;
  const description = isEn ? zoneMeta.descriptionEn : zoneMeta.description;
  const physiology = isEn ? zoneMeta.physiologyEn : zoneMeta.physiology;
  const sensation = isEn ? zoneMeta.sensationEn : zoneMeta.sensation;
  const benefit = isEn ? zoneMeta.benefitEn : zoneMeta.benefit;
  const examples = isEn ? zoneMeta.examplesEn : zoneMeta.examples;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`zone-${zone} zone-stripe pl-4 max-h-[85vh] overflow-y-auto`}>
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
          <section className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Dumbbell className="size-4 text-muted-foreground" />
              {isEn ? "Example workouts" : "Exemples de seances"}
            </h4>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {example}
                </Badge>
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

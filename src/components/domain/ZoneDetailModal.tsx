import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Brain, Heart, Sparkles, Dumbbell, ArrowRight } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ZoneNumber, ZoneMeta } from "@/types";
import { useWorkouts } from "@/hooks";
import { getDominantZone } from "@/types";
import { usePickLang } from "@/lib/i18n-utils";

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
  const { t } = useTranslation("common");
  const pick = usePickLang();
  const { workouts: allWorkouts } = useWorkouts();

  // Derive display values only when zoneMeta is available
  const label = pick(zoneMeta, "label");
  const description = pick(zoneMeta, "description");
  const physiology = pick(zoneMeta, "physiology");
  const sensation = pick(zoneMeta, "sensation");
  const benefit = pick(zoneMeta, "benefit");

  // Find 3 example workouts for this zone
  const exampleWorkouts = zone
    ? allWorkouts
        .filter((w) => getDominantZone(w) === zone)
        .slice(0, 3)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="zn-zonedetail">
        <DialogHeader>
          {/* The zone mark is the badge itself — zone.css draws the ramp fill
              and the Z-code together, so the dialog needs no second tint. */}
          <DialogTitle className="zn-zonedetail__title">
            <span className="zn-zone-badge" data-zone={zone ?? 1} data-size="lg">
              Z{zone}
            </span>
            <span>{label}</span>
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="zn-zonedetail__body">
          {/* Physiology Section */}
          <section className="zn-zonedetail__section">
            <h4 className="zn-zonedetail__heading">
              <Brain />
              {t("zones.physiology")}
            </h4>
            <p className="zn-zonedetail__text">{physiology}</p>
          </section>

          {/* Sensation Section */}
          <section className="zn-zonedetail__section">
            <h4 className="zn-zonedetail__heading">
              <Heart />
              {t("zones.howItFeels")}
            </h4>
            <p className="zn-zonedetail__text">{sensation}</p>
          </section>

          {/* Benefit Section */}
          <section className="zn-zonedetail__section">
            <h4 className="zn-zonedetail__heading">
              <Sparkles />
              {t("zones.benefits")}
            </h4>
            <p className="zn-zonedetail__text">{benefit}</p>
          </section>

          {/* Examples Section */}
          <section className="zn-zonedetail__section">
            <h4 className="zn-zonedetail__heading">
              <Dumbbell />
              {t("zones.exampleWorkouts")}
            </h4>
            <div className="zn-zonedetail__examples">
              {exampleWorkouts.map((workout) => (
                <Link
                  key={workout.id}
                  to={`/workout/${workout.id}`}
                  onClick={() => onOpenChange(false)}
                  className="zn-zonedetail__example"
                >
                  <span>{pick(workout, "name")}</span>
                  <ArrowRight />
                </Link>
              ))}
            </div>
            <Button variant="outline" size="sm" asChild className="zn-zonedetail__all">
              <Link to="/library" onClick={() => onOpenChange(false)}>
                {t("zones.seeAllWorkouts")}
              </Link>
            </Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

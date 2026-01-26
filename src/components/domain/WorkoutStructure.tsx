import { useTranslation } from "react-i18next";
import { Lightbulb, AlertTriangle } from "lucide-react";
import { ZoneBadge } from "./ZoneBadge";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate, WorkoutBlock } from "@/types";
import { getZoneNumber } from "@/types";

interface WorkoutStructureProps {
  workout: WorkoutTemplate;
  className?: string;
}

export function WorkoutStructure({ workout, className }: WorkoutStructureProps) {
  const { t, i18n } = useTranslation("session");
  const isEn = i18n.language === "en";

  const phases = [
    {
      key: "warmup",
      label: t("structure.warmup"),
      blocks: workout.warmupTemplate,
    },
    {
      key: "main",
      label: t("structure.main"),
      blocks: workout.mainSetTemplate,
    },
    {
      key: "cooldown",
      label: t("structure.cooldown"),
      blocks: workout.cooldownTemplate,
    },
  ].filter((phase) => phase.blocks.length > 0);

  return (
    <div className={cn("space-y-4", className)}>
      {phases.map((phase) => (
        <div key={phase.key} className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {phase.label}
          </h4>
          <div className="space-y-2">
            {phase.blocks.map((block, index) => (
              <BlockItem key={index} block={block} isEn={isEn} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface BlockItemProps {
  block: WorkoutBlock;
  isEn: boolean;
}

function BlockItem({ block, isEn }: BlockItemProps) {
  const description = isEn && block.descriptionEn
    ? block.descriptionEn
    : block.description;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg bg-muted/50",
        block.zone && `zone-${getZoneNumber(block.zone)} zone-stripe pl-2`
      )}
    >
      {block.zone && (
        <ZoneBadge zone={block.zone} size="sm" className="shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm">{description}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          {block.durationMin && <span>{block.durationMin} min</span>}
          {block.repetitions && <span>×{block.repetitions}</span>}
          {block.distance && <span>{block.distance}</span>}
          {block.rest && <span>Rest: {block.rest}</span>}
        </div>
      </div>
    </div>
  );
}

// Coaching Tips Section
interface CoachingTipsProps {
  workout: WorkoutTemplate;
  className?: string;
}

export function CoachingTips({ workout, className }: CoachingTipsProps) {
  const { t, i18n } = useTranslation("session");
  const isEn = i18n.language === "en";

  const tips = isEn ? workout.coachingTipsEn : workout.coachingTips;
  const mistakes = isEn ? workout.commonMistakesEn : workout.commonMistakes;

  return (
    <div className={cn("space-y-6", className)}>
      {tips.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="size-4 text-success" />
            {t("coaching.tips")}
          </h4>
          <ul className="space-y-1.5">
            {tips.map((tip, index) => (
              <li
                key={index}
                className="text-sm text-muted-foreground pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-success"
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {mistakes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            {t("coaching.mistakes")}
          </h4>
          <ul className="space-y-1.5">
            {mistakes.map((mistake, index) => (
              <li
                key={index}
                className="text-sm text-muted-foreground pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-destructive"
              >
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

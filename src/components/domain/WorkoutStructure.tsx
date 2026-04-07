import { useTranslation } from "react-i18next";
import { Lightbulb, AlertTriangle } from "@/components/icons";
import { ZoneBadge } from "./ZoneBadge";
import { cn } from "@/lib/utils";
import type { WorkoutTemplate, WorkoutBlock, ZoneRange, ZoneNumber } from "@/types";
import { getZoneNumber } from "@/types";
import { formatPace } from "@/lib/zones";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";

interface WorkoutStructureProps {
  workout: WorkoutTemplate;
  userZones?: ZoneRange[];
  className?: string;
  /** Volume scaling (0-100) from plan context. Scales main set durations. */
  volumePercent?: number;
}

export function WorkoutStructure({ workout, userZones, className, volumePercent }: WorkoutStructureProps) {
  const { t, i18n } = useTranslation("session");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const scale = volumePercent != null && volumePercent !== 100 ? volumePercent / 100 : null;

  const phases = [
    {
      key: "warmup",
      label: t("structure.warmup"),
      blocks: workout.warmupTemplate,
      scale: null,
    },
    {
      key: "main",
      label: t("structure.main"),
      blocks: workout.mainSetTemplate,
      scale, // only scale main set
    },
    {
      key: "cooldown",
      label: t("structure.cooldown"),
      blocks: workout.cooldownTemplate,
      scale: null,
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
              <BlockItem key={index} block={block} isEn={isEn} userZones={userZones} durationScale={phase.scale} />
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
  userZones?: ZoneRange[];
  durationScale?: number | null;
}

/**
 * Format personalized zone info from user zones
 */
function formatPersonalizedZone(zoneNumber: ZoneNumber, userZones: ZoneRange[]): string | null {
  const zoneData = userZones.find((z) => z.zone === zoneNumber);
  if (!zoneData) return null;

  const parts: string[] = [];

  // Add HR range if available
  if (zoneData.hrMin && zoneData.hrMax) {
    parts.push(`${zoneData.hrMin}-${zoneData.hrMax} bpm`);
  }

  // Add pace range if available
  if (zoneData.paceMinPerKm && zoneData.paceMaxPerKm) {
    parts.push(`${formatPace(zoneData.paceMinPerKm)}-${formatPace(zoneData.paceMaxPerKm)}/km`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

function BlockItem({ block, isEn, userZones, durationScale }: BlockItemProps) {
  const description = isEn && block.descriptionEn
    ? block.descriptionEn
    : block.description;

  const zoneNumber = block.zone ? getZoneNumber(block.zone) : null;
  const personalizedInfo = zoneNumber && userZones && userZones.length > 0
    ? formatPersonalizedZone(zoneNumber, userZones)
    : null;

  // Build duration/meta string (scale if from plan)
  const metaParts: string[] = [];
  if (block.durationMin) {
    const scaledDuration = durationScale ? Math.round(block.durationMin * durationScale) : block.durationMin;
    metaParts.push(`${scaledDuration} min`);
  }
  if (block.repetitions && block.repetitions > 1) metaParts.push(`${block.repetitions}x`);
  if (block.distance) metaParts.push(block.distance);
  const metaString = metaParts.join(" · ");

  // Recovery info — skip if description already mentions it
  const rawRecovery = block.recovery || block.rest;
  const descLower = description.toLowerCase();
  const hasIntervalSlash = /\d+s?\s*\/\s*\d+/.test(description);
  const hasIntervalPlus = /\d+\s*min\s.*\+\s*\d+/.test(description);
  const descAlreadyMentionsRecovery = descLower.includes("récup") || descLower.includes("recovery") || descLower.includes("repos") || hasIntervalSlash || hasIntervalPlus;
  const recoveryText = rawRecovery && !descAlreadyMentionsRecovery ? rawRecovery : null;

  // Inter-series recovery for multi-set patterns like "2x(10x ...)"
  const seriesMatch = description.match(/^(\d+)x\s*\(/);
  const seriesCount = seriesMatch ? parseInt(seriesMatch[1]) : null;

  return (
    <div
      className={cn(
        "p-3 rounded-lg bg-muted/50",
        block.zone && `zone-${getZoneNumber(block.zone)}`
      )}
    >
      {/* Header row: Zone badge + personalized info */}
      {block.zone && (
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <ZoneBadge zone={block.zone} size="sm" showLabel />
          {personalizedInfo && (
            <span className="text-[11px] text-muted-foreground">
              {personalizedInfo}
            </span>
          )}
        </div>
      )}
      {/* Content row: Description + meta aligned */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm flex-1 min-w-0"><GlossaryLinkedText text={description} /></p>
        {metaString && (
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {metaString}
          </span>
        )}
      </div>
      {/* Recovery between reps */}
      {recoveryText && (
        <p className="text-xs text-muted-foreground mt-1.5 italic">
          {isEn ? "Recovery" : "Récupération"} : {recoveryText}
        </p>
      )}
      {/* Inter-series recovery for multi-set blocks */}
      {seriesCount && seriesCount > 1 && (
        <p className="text-xs text-muted-foreground mt-1 italic">
          {isEn
            ? `${seriesCount} sets — ~3 min jog between sets`
            : `${seriesCount} séries — ~3 min footing entre les séries`}
        </p>
      )}
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
  const isEn = i18n.language?.startsWith("en") ?? false;

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
                <GlossaryLinkedText text={tip} />
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
                <GlossaryLinkedText text={mistake} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

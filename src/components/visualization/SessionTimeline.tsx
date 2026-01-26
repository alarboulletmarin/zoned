import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useTranslation } from "react-i18next";
import type { WorkoutTemplate, ZoneNumber, WorkoutBlock } from "@/types";
import { getZoneNumber, ZONE_META } from "@/types";
import { cn } from "@/lib/utils";

// Zone colors
const ZONE_COLORS: Record<ZoneNumber, string> = {
  1: "#94a3b8",
  2: "#22c55e",
  3: "#eab308",
  4: "#f97316",
  5: "#ef4444",
  6: "#7c3aed",
};

interface TimelinePoint {
  time: number;
  zone: ZoneNumber;
  phase: "warmup" | "main" | "cooldown";
  description: string;
}

interface SessionTimelineProps {
  workout: WorkoutTemplate;
  className?: string;
  height?: number;
}

export function SessionTimeline({
  workout,
  className,
  height = 200,
}: SessionTimelineProps) {
  const { t, i18n } = useTranslation("session");
  const isEn = i18n.language === "en";

  const { data, phaseMarkers } = useMemo(() => {
    const points: TimelinePoint[] = [];
    let currentTime = 0;
    const markers: { time: number; label: string }[] = [];

    const processBlocks = (
      blocks: WorkoutBlock[],
      phase: "warmup" | "main" | "cooldown"
    ) => {
      if (blocks.length === 0) return;

      const phaseStart = currentTime;
      for (const block of blocks) {
        const duration = block.durationMin || 5; // Default 5 min if not specified
        const zone = block.zone ? getZoneNumber(block.zone) : 2; // Default Z2
        const desc = isEn && block.descriptionEn ? block.descriptionEn : block.description;

        // Add point at start
        points.push({
          time: currentTime,
          zone,
          phase,
          description: desc,
        });

        // Add point at end (same zone)
        currentTime += duration;
        points.push({
          time: currentTime,
          zone,
          phase,
          description: desc,
        });
      }

      // Mark phase boundary
      if (phaseStart > 0 && phase !== "warmup") {
        markers.push({
          time: phaseStart,
          label: t(`structure.${phase}`),
        });
      }
    };

    processBlocks(workout.warmupTemplate, "warmup");
    processBlocks(workout.mainSetTemplate, "main");
    processBlocks(workout.cooldownTemplate, "cooldown");

    return { data: points, phaseMarkers: markers };
  }, [workout, t, isEn]);

  if (data.length === 0) {
    return null;
  }

  const maxTime = data[data.length - 1]?.time || 60;

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="zoneGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="time"
            type="number"
            domain={[0, maxTime]}
            tickFormatter={(value) => `${value}'`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />

          <YAxis
            domain={[0, 6]}
            ticks={[1, 2, 3, 4, 5, 6]}
            tickFormatter={(value) => `Z${value}`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            width={30}
          />

          {/* Phase markers */}
          {phaseMarkers.map((marker, index) => (
            <ReferenceLine
              key={index}
              x={marker.time}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
          ))}

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                const point = payload[0].payload as TimelinePoint;
                const meta = ZONE_META[point.zone];
                return (
                  <div className="bg-popover text-popover-foreground rounded-md border px-3 py-2 shadow-md text-sm">
                    <p className="font-medium" style={{ color: ZONE_COLORS[point.zone] }}>
                      Z{point.zone} - {isEn ? meta.labelEn : meta.label}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {point.description}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t(`structure.${point.phase}`)} • {point.time} min
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          <Area
            type="stepAfter"
            dataKey="zone"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#zoneGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Zone legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-3">
        {([1, 2, 3, 4, 5, 6] as ZoneNumber[]).map((zone) => (
          <div key={zone} className="flex items-center gap-1 text-xs">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: ZONE_COLORS[zone] }}
            />
            <span className="text-muted-foreground">
              Z{zone}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

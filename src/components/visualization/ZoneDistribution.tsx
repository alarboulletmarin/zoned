import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import type { WorkoutTemplate, ZoneNumber } from "@/types";
import { getZoneNumber, ZONE_META } from "@/types";
import { cn } from "@/lib/utils";

// Zone colors (hex values matching CSS variables)
const ZONE_COLORS: Record<ZoneNumber, string> = {
  1: "#94a3b8",
  2: "#22c55e",
  3: "#eab308",
  4: "#f97316",
  5: "#ef4444",
  6: "#7c3aed",
};

interface ZoneDistributionProps {
  workout: WorkoutTemplate;
  className?: string;
  showLegend?: boolean;
}

interface ZoneData {
  zone: ZoneNumber;
  label: string;
  duration: number;
  percentage: number;
  color: string;
}

export function ZoneDistribution({
  workout,
  className,
  showLegend = true,
}: ZoneDistributionProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const data = useMemo(() => {
    const zoneDurations: Record<ZoneNumber, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };

    // Calculate duration per zone from all phases
    const allBlocks = [
      ...workout.warmupTemplate,
      ...workout.mainSetTemplate,
      ...workout.cooldownTemplate,
    ];

    for (const block of allBlocks) {
      if (block.zone && block.durationMin) {
        const zoneNum = getZoneNumber(block.zone);
        zoneDurations[zoneNum] += block.durationMin;
      }
    }

    const total = Object.values(zoneDurations).reduce((a, b) => a + b, 0);

    // Filter out zones with no duration and create data array
    const result: ZoneData[] = [];
    for (const [zone, duration] of Object.entries(zoneDurations)) {
      if (duration > 0) {
        const zoneNum = parseInt(zone) as ZoneNumber;
        const meta = ZONE_META[zoneNum];
        result.push({
          zone: zoneNum,
          label: isEn ? meta.labelEn : meta.label,
          duration,
          percentage: total > 0 ? Math.round((duration / total) * 100) : 0,
          color: ZONE_COLORS[zoneNum],
        });
      }
    }

    return result.sort((a, b) => a.zone - b.zone);
  }, [workout, isEn]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="percentage"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.zone} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.[0]) {
                  const d = payload[0].payload as ZoneData;
                  return (
                    <div className="bg-popover text-popover-foreground rounded-md border px-3 py-2 shadow-md text-sm">
                      <p className="font-medium">Z{d.zone} - {d.label}</p>
                      <p className="text-muted-foreground">
                        {d.duration} min ({d.percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-2 justify-center">
          {data.map((item) => (
            <div key={item.zone} className="flex items-center gap-1.5 text-xs">
              <div
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">
                Z{item.zone} {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple bar version for cards
interface ZoneDistributionBarProps {
  workout: WorkoutTemplate;
  className?: string;
}

export function ZoneDistributionBar({
  workout,
  className,
}: ZoneDistributionBarProps) {
  const data = useMemo(() => {
    const zoneDurations: Record<ZoneNumber, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };

    const allBlocks = [
      ...workout.warmupTemplate,
      ...workout.mainSetTemplate,
      ...workout.cooldownTemplate,
    ];

    for (const block of allBlocks) {
      if (block.zone && block.durationMin) {
        const zoneNum = getZoneNumber(block.zone);
        zoneDurations[zoneNum] += block.durationMin;
      }
    }

    const total = Object.values(zoneDurations).reduce((a, b) => a + b, 0);

    return Object.entries(zoneDurations)
      .filter(([_, duration]) => duration > 0)
      .map(([zone, duration]) => ({
        zone: parseInt(zone) as ZoneNumber,
        percentage: total > 0 ? (duration / total) * 100 : 0,
      }))
      .sort((a, b) => a.zone - b.zone);
  }, [workout]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex h-2 rounded-full overflow-hidden", className)}>
      {data.map((item) => (
        <div
          key={item.zone}
          style={{
            width: `${item.percentage}%`,
            backgroundColor: ZONE_COLORS[item.zone],
          }}
        />
      ))}
    </div>
  );
}

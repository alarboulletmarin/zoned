import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronUp, ChevronDown, Trash2 } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { WorkoutBlock, Zone, ZoneNumber } from "@/types";
import { ZONE_META, getZoneNumber } from "@/types";

interface BlockEditorProps {
  block: WorkoutBlock;
  onChange: (block: WorkoutBlock) => void;
  onRemove: () => void;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const ZONES: Zone[] = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6"];

export function BlockEditor({
  block,
  onChange,
  onRemove,
  index,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: BlockEditorProps) {
  const { t, i18n } = useTranslation("contribute");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const zoneNumber: ZoneNumber = block.zone ? getZoneNumber(block.zone) : 2;

  const update = (partial: Partial<WorkoutBlock>) => {
    onChange({ ...block, ...partial });
  };

  return (
    <Card
      size="compact"
      className={cn(
        "relative overflow-hidden",
        block.zone && `zone-${zoneNumber} zone-stripe`
      )}
    >
      <CardContent className="p-4 pl-4 space-y-3">
        {/* Header: index + action buttons */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            #{index + 1}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              aria-label={t("blocks.moveUp")}
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              aria-label={t("blocks.moveDown")}
            >
              <ChevronDown className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
              aria-label={t("blocks.removeBlock")}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* Description FR */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t("blocks.description")}
          </label>
          <textarea
            value={block.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder={t("blocks.descriptionPlaceholder")}
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 placeholder:italic focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        </div>

        {/* Description EN (smaller) */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t("blocks.descriptionEn")}
          </label>
          <textarea
            value={block.descriptionEn ?? ""}
            onChange={(e) => update({ descriptionEn: e.target.value || undefined })}
            placeholder={t("blocks.descriptionEnPlaceholder")}
            rows={1}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground/60 placeholder:italic focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        </div>

        {/* Duration + Zone + Repetitions row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Duration */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t("blocks.duration")}
            </label>
            <input
              type="number"
              min={0}
              value={block.durationMin ?? ""}
              onChange={(e) =>
                update({
                  durationMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Zone */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t("blocks.zone")}
            </label>
            <Select
              value={block.zone ?? ""}
              onValueChange={(value) => update({ zone: value as Zone })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZONES.map((zone) => {
                  const zn = getZoneNumber(zone);
                  const meta = ZONE_META[zn];
                  const label = isEn ? meta.labelEn : meta.label;
                  return (
                    <SelectItem key={zone} value={zone}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: `var(--zone-${zn})` }}
                        />
                        {zone} - {label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Repetitions */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t("blocks.repetitions")}
            </label>
            <input
              type="number"
              min={0}
              value={block.repetitions ?? ""}
              onChange={(e) =>
                update({
                  repetitions: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="-"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Recovery */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t("blocks.recovery")}
          </label>
          <input
            type="text"
            value={block.recovery ?? ""}
            onChange={(e) => update({ recovery: e.target.value || undefined })}
            placeholder={t("blocks.recoveryPlaceholder")}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 placeholder:italic focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </CardContent>
    </Card>
  );
}

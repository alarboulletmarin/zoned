import { useId, type CSSProperties } from "react";
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
import type { WorkoutBlock, Zone, ZoneNumber } from "@/types";
import { ZONE_META, getZoneNumber } from "@/types";
import { usePickLang } from "@/lib/i18n-utils";

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
  const { t } = useTranslation("contribute");
  const pickLang = usePickLang();
  const uid = useId();

  const zoneNumber: ZoneNumber = block.zone ? getZoneNumber(block.zone) : 2;

  const update = (partial: Partial<WorkoutBlock>) => {
    onChange({ ...block, ...partial });
  };

  return (
    <Card size="compact">
      <CardContent>
        <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
          {/* Header: index + zone + action buttons */}
          <div className="zn-row zn-row--split">
            <span className="zn-row" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
              <span className="zn-mono zn-faint">#{index + 1}</span>
              {block.zone && (
                <span className="zn-zone-badge" data-zone={zoneNumber}>
                  {block.zone}
                </span>
              )}
            </span>
            <div className="zn-row" style={{ "--gap": "var(--sp-2)" } as CSSProperties}>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                aria-label={t("blocks.moveUp")}
              >
                <ChevronUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                aria-label={t("blocks.moveDown")}
              >
                <ChevronDown />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onRemove}
                aria-label={t("blocks.removeBlock")}
                className="zn-contrib-remove"
              >
                <Trash2 />
              </Button>
            </div>
          </div>

          {/* Description FR */}
          <div className="zn-contrib-field">
            <label className="zn-contrib-field__label" htmlFor={`${uid}-description`}>
              {t("blocks.description")}
            </label>
            <textarea
              id={`${uid}-description`}
              value={block.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder={t("blocks.descriptionPlaceholder")}
              rows={2}
              className="zn-contrib-input"
            />
          </div>

          {/* Description EN (smaller) */}
          <div className="zn-contrib-field">
            <label
              className="zn-contrib-field__label"
              data-optional="true"
              htmlFor={`${uid}-description-en`}
            >
              {t("blocks.descriptionEn")}
            </label>
            <textarea
              id={`${uid}-description-en`}
              value={block.descriptionEn ?? ""}
              onChange={(e) => update({ descriptionEn: e.target.value || undefined })}
              placeholder={t("blocks.descriptionEnPlaceholder")}
              rows={1}
              data-size="sm"
              className="zn-contrib-input"
            />
          </div>

          {/* Duration + Zone + Repetitions row */}
          <div
            className="zn-grid"
            style={{ "--cols": 3, "--cols-md": 3, "--gap": "var(--sp-6)" } as CSSProperties}
          >
            {/* Duration */}
            <div className="zn-contrib-field">
              <label className="zn-contrib-field__label" htmlFor={`${uid}-duration`}>
                {t("blocks.duration")}
              </label>
              <input
                id={`${uid}-duration`}
                type="number"
                min={0}
                value={block.durationMin ?? ""}
                onChange={(e) =>
                  update({
                    durationMin: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                data-mono="true"
                className="zn-contrib-input"
              />
            </div>

            {/* Zone */}
            <div className="zn-contrib-field">
              <label className="zn-contrib-field__label" htmlFor={`${uid}-zone`}>
                {t("blocks.zone")}
              </label>
              <Select
                value={block.zone ?? ""}
                onValueChange={(value) => update({ zone: value as Zone })}
              >
                <SelectTrigger id={`${uid}-zone`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZONES.map((zone) => {
                    const zn = getZoneNumber(zone);
                    const meta = ZONE_META[zn];
                    const label = pickLang(meta, "label");
                    return (
                      <SelectItem key={zone} value={zone}>
                        <span
                          className="zn-row"
                          style={{ "--gap": "var(--sp-4)" } as CSSProperties}
                        >
                          <span className="zn-zone-badge" data-zone={zn}>
                            {zone}
                          </span>
                          {label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Repetitions */}
            <div className="zn-contrib-field">
              <label className="zn-contrib-field__label" htmlFor={`${uid}-repetitions`}>
                {t("blocks.repetitions")}
              </label>
              <input
                id={`${uid}-repetitions`}
                type="number"
                min={0}
                value={block.repetitions ?? ""}
                onChange={(e) =>
                  update({
                    repetitions: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="-"
                data-mono="true"
                className="zn-contrib-input"
              />
            </div>
          </div>

          {/* Recovery */}
          <div className="zn-contrib-field">
            <label className="zn-contrib-field__label" htmlFor={`${uid}-recovery`}>
              {t("blocks.recovery")}
            </label>
            <input
              id={`${uid}-recovery`}
              type="text"
              value={block.recovery ?? ""}
              onChange={(e) => update({ recovery: e.target.value || undefined })}
              placeholder={t("blocks.recoveryPlaceholder")}
              className="zn-contrib-input"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

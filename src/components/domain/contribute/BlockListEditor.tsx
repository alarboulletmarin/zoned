import { type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus } from "@/components/icons";
import { BlockEditor } from "./BlockEditor";
import type { WorkoutBlock, Zone } from "@/types";

interface BlockListEditorProps {
  blocks: WorkoutBlock[];
  onChange: (blocks: WorkoutBlock[]) => void;
  label: string;
}

function createDefaultBlock(): WorkoutBlock {
  return {
    description: "",
    descriptionEn: "",
    durationMin: 5,
    zone: "Z2" as Zone,
  };
}

export function BlockListEditor({ blocks, onChange, label }: BlockListEditorProps) {
  const { t } = useTranslation("contribute");

  const handleBlockChange = (index: number, updated: WorkoutBlock) => {
    const next = [...blocks];
    next[index] = updated;
    onChange(next);
  };

  const handleRemove = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...blocks];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    const next = [...blocks];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...blocks, createDefaultBlock()]);
  };

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
      <h3 className="zn-kicker zn-kicker--inline">{label}</h3>

      {blocks.length === 0 ? (
        <div className="zn-contrib-slot">
          <p className="zn-body zn-body--sm zn-muted">{t("blocks.emptyState")}</p>
        </div>
      ) : (
        <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
          {blocks.map((block, index) => (
            <BlockEditor
              key={index}
              block={block}
              onChange={(updated) => handleBlockChange(index, updated)}
              onRemove={() => handleRemove(index)}
              index={index}
              canMoveUp={index > 0}
              canMoveDown={index < blocks.length - 1}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
            />
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="zn-contrib-add-full"
      >
        <Plus />
        {t("blocks.addBlock")}
      </Button>
    </div>
  );
}

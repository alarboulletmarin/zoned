import { type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "@/components/icons";

interface StringListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  label: string;
  placeholder: string;
  addLabel: string;
  removeLabel: string;
}

export function StringListEditor({
  items,
  onChange,
  label,
  placeholder,
  addLabel,
  removeLabel,
}: StringListEditorProps) {
  const handleChange = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...items, ""]);
  };

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
      <h3 className="zn-kicker zn-kicker--inline">{label}</h3>

      {items.length > 0 && (
        <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
          {items.map((item, index) => (
            <div
              key={index}
              className="zn-row"
              style={{ "--gap": "var(--sp-4)" } as CSSProperties}
            >
              <textarea
                value={item}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={placeholder}
                rows={1}
                aria-label={`${label} ${index + 1}`}
                className="zn-contrib-input zn-fill"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemove(index)}
                aria-label={removeLabel}
                className="zn-contrib-remove zn-fixed"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
        <Plus />
        {addLabel}
      </Button>
    </div>
  );
}

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
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </h3>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={item}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={placeholder}
                rows={1}
                className="flex flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 placeholder:italic focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemove(index)}
                aria-label={removeLabel}
                className="shrink-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
      >
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </div>
  );
}

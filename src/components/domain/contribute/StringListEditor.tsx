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
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
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
                className="flex flex-1 border-2 border-foreground bg-background px-4 py-2 font-mono text-sm outline-2 outline-offset-2 outline-transparent transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-muted-foreground focus-visible:outline-ring resize-none"
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

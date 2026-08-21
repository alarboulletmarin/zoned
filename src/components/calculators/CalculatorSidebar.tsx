import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CalculatorLabel } from "./CalculatorPanel";

/** Aside column wrapper for a full-detail calculator page (formula, caveats, related tools). */
export function CalculatorSidebar({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <aside className={cn("flex flex-col gap-6 sm:gap-7", className)}>
      {children}
    </aside>
  );
}

/** "La formule utilisée" box — monospace formula line(s) + a short source note. */
export function CalculatorFormulaBox({
  label,
  formula,
  note,
  source,
}: {
  label: string;
  formula: React.ReactNode;
  note?: React.ReactNode;
  source?: React.ReactNode;
}) {
  return (
    <div>
      <CalculatorLabel>{label}</CalculatorLabel>
      <div className="border-2 border-border/70 px-4 py-3.5 mt-3 font-mono text-[13px] leading-[1.8] text-foreground/85">
        {formula}
        {note && <div className="text-muted-foreground mt-1">{note}</div>}
      </div>
      {source && <p className="mt-3 text-[13px] leading-[1.6] text-muted-foreground">{source}</p>}
    </div>
  );
}

/** "À savoir" — short bullet list of caveats/usage notes. */
export function CalculatorInfoList({ label, items }: { label: string; items: React.ReactNode[] }) {
  return (
    <div className="border-t border-border pt-5">
      <CalculatorLabel>{label}</CalculatorLabel>
      <ul className="mt-3 space-y-2 text-sm leading-[1.7] text-foreground/80 list-disc pl-[18px]">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** "Enchaîner sur" — related-tool links list. */
export function CalculatorRelatedLinks({
  label,
  links,
}: {
  label: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div className="border-t border-border pt-5">
      <CalculatorLabel>{label}</CalculatorLabel>
      <div className="flex flex-col mt-3">
        {links.map((link, i) => (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "py-3 flex items-center justify-between gap-3 group",
              i > 0 && "border-t border-border",
            )}
          >
            <span className="text-[15px] font-medium">{link.label}</span>
            <span className="font-mono text-[11px] text-muted-foreground group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Local-computation reassurance note, pinned at the bottom of the sidebar. */
export function CalculatorLocalNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-auto border-2 border-border/70 px-4 py-3.5 font-mono text-[11px] leading-[1.7] text-muted-foreground">
      {children}
    </div>
  );
}

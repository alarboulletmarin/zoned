import type { ComponentType, ReactNode } from "react";
import type { CSSProperties } from "react";
import type { IconProps } from "@/components/icons";

// ── One answer, drawn ────────────────────────────────────────────────

/**
 * A radio wearing paper. The input stays a real radio — same name, same
 * arrow keys, same checked state — and the label around it is what the eye
 * reads. Chosen is the 2.5px vermillon frame, never a tint.
 */
export function Option({
  name,
  checked,
  onSelect,
  title,
  body,
  data,
  glyph: Glyph,
  shape,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  body?: string;
  data?: string;
  glyph?: ComponentType<IconProps>;
  shape?: "tile";
}) {
  return (
    <label className="zn-wiz-opt" data-shape={shape}>
      <input
        type="radio"
        className="sr-only"
        name={name}
        checked={checked}
        onChange={onSelect}
      />
      {Glyph ? (
        <span className="zn-wiz-opt__glyph" aria-hidden="true">
          <Glyph size={18} />
        </span>
      ) : null}
      <span className="zn-wiz-opt__text">
        <span className="zn-wiz-opt__title">{title}</span>
        {body ? <span className="zn-wiz-opt__body">{body}</span> : null}
      </span>
      {data ? <span className="zn-mono zn-wiz-opt__data">{data}</span> : null}
    </label>
  );
}

/** One line of the recap: a term and its value. */
export function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <>
      <dt className="zn-wiz-sum__label">{label}</dt>
      <dd className="zn-wiz-sum__value" data-mono={mono ? "true" : undefined}>
        {value}
      </dd>
    </>
  );
}

/** Le groupe de choix d'une question. Un `fieldset`, étiqueté par la question. */
export function OptionStack({
  questionId,
  children,
}: {
  questionId: string;
  children: ReactNode;
}) {
  return (
    <fieldset
      className="zn-contrib-group zn-stack"
      style={{ "--gap": "var(--sp-5)" } as CSSProperties}
      aria-labelledby={questionId}
    >
      {children}
    </fieldset>
  );
}

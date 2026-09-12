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
  onCommit,
  title,
  body,
  data,
  glyph: Glyph,
  shape,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  /**
   * Ce qu'il y a à faire une fois la réponse donnée — passer à la suite.
   *
   * Il n'est appelé que sur un geste de POINTEUR. Au clavier, les flèches
   * déplacent la sélection à l'intérieur d'un groupe de radios : avancer à
   * chaque flèche empêcherait de lire les réponses. Le filtre est
   * `event.detail` — un clic synthétisé par le clavier (flèche, espace) le
   * porte à 0, un clic de doigt ou de souris à 1. Il écarte du même coup le
   * second clic, celui que le label renvoie sur la radio qu'il enveloppe.
   */
  onCommit?: () => void;
  title: string;
  body?: string;
  data?: string;
  glyph?: ComponentType<IconProps>;
  shape?: "tile";
}) {
  return (
    <label
      className="zn-wiz-opt"
      data-shape={shape}
      onClick={(event) => {
        if (event.detail > 0) onCommit?.();
      }}
    >
      <input
        type="radio"
        className="sr-only"
        name={name}
        checked={checked}
        onChange={onSelect}
        /* La sortie clavier de l'auto-avance. Les flèches déplacent la
           sélection dans le groupe sans valider — sinon on ne pourrait pas
           lire les réponses —, donc il faut un geste qui dise « celle-là, et
           on continue ». C'est Entrée, et c'est aussi ce qui remplace le
           bouton « Suivant » retiré de ces étapes. */
        onKeyDown={(event) => {
          if (event.key !== "Enter" || !onCommit) return;
          event.preventDefault();
          onSelect();
          onCommit();
        }}
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

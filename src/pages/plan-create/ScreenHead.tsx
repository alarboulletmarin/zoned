import type { ReactNode } from "react";

/**
 * Le titre d'un écran, qui reçoit le focus à chaque changement d'étape
 * (`tabIndex={-1}`, voir la page) : le lecteur d'écran annonce la question.
 */
export function ScreenHead({
  kicker,
  title,
  lede,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <header className="zn-pc__head">
      {kicker && <span className="zn-pc__kicker">{kicker}</span>}
      <h1 className="zn-pc__title" tabIndex={-1} data-quiet-focus>
        {title}
      </h1>
      {lede && <p className="zn-pc__lede">{lede}</p>}
    </header>
  );
}

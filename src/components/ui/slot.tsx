import * as React from "react";

import { cn } from "@/lib/utils";

type AnyProps = Record<string, unknown>;

/** Assign one node to a ref, whichever of the two shapes React hands us.
 *  A callback ref may return a cleanup (React 19); hand it straight back. */
function setRef(ref: unknown, node: unknown): unknown {
  if (typeof ref === "function") return (ref as (n: unknown) => unknown)(node);
  if (ref && typeof ref === "object") (ref as { current: unknown }).current = node;
  return undefined;
}

/** Both refs get the node. If either answered with a React 19 cleanup, we owe
 *  React one cleanup that runs theirs and detaches the other the old way —
 *  otherwise React never calls us with `null` and a cleanup ref is left open. */
function composeRefs(ours: unknown, theirs: unknown) {
  return (node: unknown) => {
    const a = setRef(ours, node);
    const b = setRef(theirs, node);
    if (typeof a !== "function" && typeof b !== "function") return;
    return () => {
      if (typeof a === "function") a();
      else setRef(ours, null);
      if (typeof b === "function") b();
      else setRef(theirs, null);
    };
  };
}

/**
 * `asChild`: render the caller's own element instead of ours, wearing our props.
 * That is what lets `<Button asChild><Link/></Button>` be a real anchor — middle
 * click, "open in a new tab", keyboard focus — with the button's paint on it.
 *
 * Merge rules: the child wins on every plain prop, `style` and `className`;
 * event handlers run ours first, then the child's unless ours called
 * `preventDefault()`; refs compose. React 19 passes `ref` as an ordinary prop,
 * so it arrives in `slotProps` and reads back off `child.props` — no
 * `forwardRef`, no `element.ref` (deprecated in 19).
 */
function Slot({ children, ...slotProps }: { children?: React.ReactNode } & AnyProps) {
  if (!React.isValidElement(children)) {
    throw new Error(
      "<Slot> (asChild) veut un unique élément React comme enfant, " +
        `reçu : ${children === undefined ? "rien" : typeof children}.`,
    );
  }

  const child = children as React.ReactElement<AnyProps>;
  const childProps = child.props;
  const merged: AnyProps = { ...slotProps, ...childProps };

  for (const key of Object.keys(slotProps)) {
    const ours = slotProps[key];
    const theirs = childProps[key];
    if (key === "className") merged.className = cn(ours as string, theirs as string);
    else if (key === "style") merged.style = { ...(ours as object), ...(theirs as object) };
    else if (key === "ref") merged.ref = composeRefs(ours, theirs);
    else if (/^on[A-Z]/.test(key) && typeof ours === "function") {
      merged[key] =
        typeof theirs === "function"
          ? (...args: unknown[]) => {
              (ours as (...a: unknown[]) => void)(...args);
              if (!(args[0] as { defaultPrevented?: boolean } | undefined)?.defaultPrevented) {
                (theirs as (...a: unknown[]) => void)(...args);
              }
            }
          : ours;
    }
  }

  return React.cloneElement(child, merged);
}

export { Slot };

"use client";

import * as React from "react";
import { X } from "@/components/icons";

import { cn } from "@/lib/utils";
import { Slot } from "@/components/ui/slot";
import { NativeDialog } from "@/components/ui/native-dialog";
import { useSheetDrag } from "@/hooks/useSheetDrag";

/**
 * Sheet, the same paper and outline as a dialog, hinged on one edge.
 *
 * Same engine as `dialog.tsx`: a native <dialog> opened with showModal(). The
 * only thing that differs is `side`, which still lands on the element as
 * `data-side` because sheet.css selects the four edges off it.
 */

interface SheetContextValue {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext(part: string) {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error(`<${part}> doit être rendu à l'intérieur d'un <Sheet>.`);
  }
  return context;
}

function Sheet({
  open = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const id = React.useId();
  const value = React.useMemo<SheetContextValue>(
    () => ({
      open,
      onOpenChange,
      titleId: `${id}sheet-title`,
      descriptionId: `${id}sheet-description`,
    }),
    [open, onOpenChange, id],
  );

  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<"dialog"> & {
  side?: "top" | "bottom" | "left" | "right";
}) {
  const { open, onOpenChange, titleId, descriptionId } =
    useSheetContext("SheetContent");

  // Le glisser-pour-fermer, réservé au bord bas : c'est là que le pouce le
  // cherche. Les hameçons sont posés avant le retour anticipé, comme le veut
  // la règle des hooks.
  const drag = useSheetDrag(
    open && side === "bottom",
    React.useCallback(() => onOpenChange?.(false), [onOpenChange]),
  );

  if (!open) return null;

  return (
    <NativeDialog
      data-slot="sheet-content"
      data-state="open"
      data-side={side}
      className={cn("zn-sheet", className)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onDismiss={() => onOpenChange?.(false)}
      {...props}
      {...drag}
    >
      {children}
      <SheetClose className="zn-sheet__close">
        <X />
        <span className="sr-only">Fermer</span>
      </SheetClose>
    </NativeDialog>
  );
}

function SheetClose({
  asChild = false,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { onOpenChange } = useSheetContext("SheetClose");
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sheet-close"
      type="button"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) onOpenChange?.(false);
      }}
      {...props}
    />
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("zn-sheet__header", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("zn-sheet__footer", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, id, ...props }: React.ComponentProps<"h2">) {
  const { titleId } = useSheetContext("SheetTitle");
  return (
    <h2
      data-slot="sheet-title"
      id={id ?? titleId}
      className={cn("zn-sheet__title", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, id, ...props }: React.ComponentProps<"p">) {
  const { descriptionId } = useSheetContext("SheetDescription");
  return (
    <p
      data-slot="sheet-description"
      id={id ?? descriptionId}
      className={cn("zn-sheet__description", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
};

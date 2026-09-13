"use client";

import * as React from "react";
import { X } from "@/components/icons";

import { cn } from "@/lib/utils";
import { Slot } from "@/components/ui/slot";
import { NativeDialog } from "@/components/ui/native-dialog";

/**
 * Dialog, a centred paper panel over an ink wash.
 *
 * The panel is a native <dialog> opened with showModal(): the top layer, the
 * focus trap, Escape and the focus returning to the opener are the platform's.
 * `native-dialog.tsx` adds the three the platform withholds, the scroll lock,
 * the cleanup on unmount, and dismissal by clicking the scene.
 *
 * The public API is the one the twenty-odd call sites already use: `open` and
 * `onOpenChange` on the root, `className` on the content, and the header /
 * title / description / footer / close parts. There is no overlay element any
 * more, `.zn-dialog::backdrop` is the scene, and no portal, because the top
 * layer is not somewhere you can be stacked under.
 */

interface DialogContextValue {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(part: string) {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error(`<${part}> doit être rendu à l'intérieur d'un <Dialog>.`);
  }
  return context;
}

function Dialog({
  open = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  // The title and description ids are minted here rather than in the parts, so
  // the content can point aria-labelledby / aria-describedby at them whether or
  // not the call site renders either one, which is what Radix did.
  const id = React.useId();
  const value = React.useMemo<DialogContextValue>(
    () => ({
      open,
      onOpenChange,
      titleId: `${id}dialog-title`,
      descriptionId: `${id}dialog-description`,
    }),
    [open, onOpenChange, id],
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<"dialog">) {
  const { open, onOpenChange, titleId, descriptionId } =
    useDialogContext("DialogContent");

  // Mounted only while open, as the portal was: the share sheet alone holds 37
  // template previews, and they have no business rendering on a page nobody
  // opened. The cost is the exit animation, which needs a node to play on.
  if (!open) return null;

  return (
    <NativeDialog
      data-slot="dialog-content"
      data-state="open"
      className={cn("zn-dialog", className)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onDismiss={() => onOpenChange?.(false)}
      {...props}
    >
      {children}
      <DialogClose className="zn-dialog__close">
        <X />
        <span className="sr-only">Fermer</span>
      </DialogClose>
    </NativeDialog>
  );
}

function DialogClose({
  asChild = false,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { onOpenChange } = useDialogContext("DialogClose");
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="dialog-close"
      type="button"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) onOpenChange?.(false);
      }}
      {...props}
    />
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("zn-dialog__header", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("zn-dialog__footer", className)}
      {...props}
    />
  );
}

function DialogTitle({ className, id, ...props }: React.ComponentProps<"h2">) {
  const { titleId } = useDialogContext("DialogTitle");
  return (
    <h2
      data-slot="dialog-title"
      id={id ?? titleId}
      className={cn("zn-dialog__title", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, id, ...props }: React.ComponentProps<"p">) {
  const { descriptionId } = useDialogContext("DialogDescription");
  return (
    <p
      data-slot="dialog-description"
      id={id ?? descriptionId}
      className={cn("zn-dialog__description", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
};

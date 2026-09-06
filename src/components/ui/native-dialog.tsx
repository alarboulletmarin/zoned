/**
 * The native <dialog> engine, shared by every modal surface in the app.
 *
 * `showModal()` hands over the four things a modal is hard to get right:
 * the top layer (so there is no z-index left to arbitrate), the focus trap,
 * Escape, and the focus returning to whatever was focused before the panel
 * opened. `MobileMenu.tsx` proved it on the full-screen menu; this file is the
 * same move made reusable for the dialog and sheet primitives, the command
 * palette and the share sheet.
 *
 * Four things the platform does NOT give, so they are written here:
 *
 *   1. The scroll lock. Refcounted, because two panels can overlap — the
 *      mobile menu hands off to the command palette while its own `close`
 *      event is still queued. Two independent locks would each save the body's
 *      overflow at a moment the other had already changed it, and the loser
 *      would restore `hidden` for good.
 *   2. The cleanup when the panel unmounts. Removing an open <dialog> from the
 *      DOM fires NO `close` event, so an effect that waits for one never runs:
 *      that is exactly how the mobile menu left the desktop page permanently
 *      unscrollable after crossing 1024px with the panel open.
 *   3. Dismissal by clicking the scene. A click on the ::backdrop is reported
 *      on the <dialog> itself, so it is told apart by comparing the pointer to
 *      the panel's own rectangle.
 *   4. Keeping the toasts on top. The top layer is not a z-index, so an open
 *      panel paints over `sonner` whatever it stacks at; the toast layer is
 *      re-promoted after every showModal().
 *
 * There is no `role="dialog"` and no `aria-modal` here: a <dialog> shown with
 * showModal() carries both from the platform, and the rule on this project is
 * that a declared role owes its keyboard contract. This one's contract is the
 * browser's.
 */

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
} from "react";

/* ── the scroll lock ──────────────────────────────────────────────────── */

let openPanels = 0;
let restoreOverflow = "";

function lockScroll() {
  if (openPanels++ === 0) {
    restoreOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
}

function unlockScroll() {
  if (openPanels > 0 && --openPanels === 0) {
    document.body.style.overflow = restoreOverflow;
  }
}

/**
 * Hold the page still while `active`. The count is shared with every other
 * panel, so the body is only handed back once the last one has gone — and the
 * cleanup runs on unmount, which is the case no `close` event ever covers.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockScroll();
    return () => unlockScroll();
  }, [active]);
}

/* ── the toasts ───────────────────────────────────────────────────────── */

/**
 * Lift the toast layer back above the panel that just opened.
 *
 * The top layer is not a z-index, it is a different plane: an open modal
 * paints over the whole document, so `sonner`'s toaster — z-index 999999999
 * and all — ends up behind the backdrop. The share sheet reports every one of
 * its four actions with a toast, so that feedback simply disappeared.
 *
 * A `popover` is the one other way into the top layer, and the top layer is
 * ordered by promotion, so the layer is re-promoted after every showModal():
 * the panel goes up, then the toasts go up again on top of it. The attribute
 * is only set the first time a modal opens — before that the wrapper is an
 * ordinary zero-size div and the toaster behaves exactly as it always has.
 *
 * The toasts are inert while a modal is open, so they are read and not
 * clicked. That is what Radix did too: it parked `pointer-events: none` on the
 * body for the life of the dialog.
 */
function raiseToastLayer() {
  const layer = document.querySelector<HTMLElement>(".zn-toast-layer");
  if (!layer) return;
  try {
    if (!layer.hasAttribute("popover")) layer.setAttribute("popover", "manual");
    if (layer.matches(":popover-open")) layer.hidePopover();
    layer.showPopover();
  } catch {
    // No popover support: the toast stays under the panel, which is a lost
    // message rather than a broken page. Nothing else depends on this.
  }
}

/* ── where a floating child belongs ───────────────────────────────────── */

const DialogContainerContext = createContext<HTMLElement | null>(null);

/**
 * The open <dialog> a component is rendered inside, or null at the page level.
 *
 * A modal dialog sits in the top layer, above everything the document can
 * paint, so a popover portalled to `document.body` — a date picker, a select,
 * a tooltip — would open *behind* the panel that asked for it. Radix's
 * `Portal` takes a `container`, and this is the answer to hand it.
 */
export function useDialogContainer() {
  return useContext(DialogContainerContext);
}

/* ── the element ──────────────────────────────────────────────────────── */

export interface NativeDialogProps extends Omit<ComponentProps<"dialog">, "open"> {
  /** Raised for Escape, the ::backdrop, and any close() from inside. */
  onDismiss?: () => void;
}

export function NativeDialog({
  onDismiss,
  onMouseDown,
  children,
  ...props
}: NativeDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // Read at event time, never as a dependency: the effect below must run once
  // and only once, or showModal would fire again on every parent re-render.
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleClose = () => {
      // `close()` does not fire its event synchronously — it queues it. So the
      // cleanup below can close the element, a remount can reopen it, and OUR
      // close event is only then delivered, to the listener the remount just
      // attached. A close event on an element that is open again is that echo,
      // never a dismissal. Without this the panel closed the instant it
      // opened, under React's development double-invoke.
      if (dialog.open) return;
      dismiss.current?.();
    };
    dialog.addEventListener("close", handleClose);
    dialog.showModal();
    raiseToastLayer();
    lockScroll();
    setContainer(dialog);

    return () => {
      // The listener goes first: closing here is us tidying up, not the user
      // dismissing, and calling back into a parent that is already unmounting
      // would be a loop. Then the lock is released — the cleanup that no
      // `close` event would ever have triggered — and the element is closed by
      // hand, which is what releases the top layer and hands the focus back.
      dialog.removeEventListener("close", handleClose);
      unlockScroll();
      dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      onMouseDown={(event: ReactMouseEvent<HTMLDialogElement>) => {
        onMouseDown?.(event);
        if (event.defaultPrevented) return;
        // Anything inside the panel reports itself as the target; only the
        // ::backdrop reports the dialog. Dismissing on mousedown rather than
        // click is what Radix did, and it also means a drag that starts inside
        // the panel and is released on the scene never closes it.
        if (event.target !== event.currentTarget) return;
        const box = event.currentTarget.getBoundingClientRect();
        const insidePanel =
          event.clientX >= box.left &&
          event.clientX <= box.right &&
          event.clientY >= box.top &&
          event.clientY <= box.bottom;
        if (!insidePanel) event.currentTarget.close();
      }}
      {...props}
    >
      <DialogContainerContext.Provider value={container}>
        {children}
      </DialogContainerContext.Provider>
    </dialog>
  );
}

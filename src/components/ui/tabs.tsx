import * as React from "react";

import { cn } from "@/lib/utils";

/* Tabs — the WAI-ARIA tab pattern, hand-written.
   There is no native element for this, so the whole contract is here:
   role, aria wiring, one tab stop, arrows with wrap-around, Home/End, and
   automatic activation (the selection follows the focus, which is what the
   Radix default this replaced did and what every call site expects). */

type TabsContextValue = {
  baseId: string;
  value: string;
  select: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error(`${component} must be used inside <Tabs>`);
  return context;
}

const triggerId = (baseId: string, value: string) =>
  `${baseId}-trigger-${value}`;
const contentId = (baseId: string, value: string) =>
  `${baseId}-content-${value}`;

function Tabs({
  className,
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const baseId = React.useId();
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const value = valueProp ?? uncontrolled;

  /* Selecting what is already selected is a no-op: onValueChange fires on a
     real change only, and the subtree is not re-rendered because a tab was
     clicked or re-focused. */
  const select = React.useCallback(
    (next: string) => {
      if (next === value) return;
      if (valueProp === undefined) setUncontrolled(next);
      onValueChange?.(next);
    },
    [value, valueProp, onValueChange],
  );

  const context = React.useMemo(
    () => ({ baseId, value, select }),
    [baseId, value, select],
  );

  return (
    <TabsContext.Provider value={context}>
      <div
        dir="ltr"
        data-orientation="horizontal"
        data-slot="tabs"
        className={cn("zn-tabs", className)}
        {...props}
      />
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      data-orientation="horizontal"
      data-slot="tabs-list"
      className={cn("zn-tabs__list", className)}
      {...props}
    />
  );
}

/* The four keys the list owns. Everything else — Tab, Space, Enter — is left
   to the browser, because each trigger is a real <button>. */
const NAV_KEYS = ["ArrowLeft", "ArrowRight", "Home", "End"];

function TabsTrigger({
  className,
  value,
  disabled = false,
  onClick,
  onFocus,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"button">, "value"> & { value: string }) {
  const { baseId, value: selected, select } = useTabsContext("TabsTrigger");
  const isSelected = value === selected;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-controls={contentId(baseId, value)}
      data-state={isSelected ? "active" : "inactive"}
      data-disabled={disabled ? "" : undefined}
      data-orientation="horizontal"
      data-slot="tabs-trigger"
      disabled={disabled}
      id={triggerId(baseId, value)}
      /* One tab stop for the whole list: only the active tab is reachable
         with Tab, the others are reached with the arrows. */
      tabIndex={isSelected ? 0 : -1}
      className={cn("zn-tabs__trigger", className)}
      onClick={(event) => {
        onClick?.(event);
        select(value);
      }}
      /* Automatic activation: arrowing onto a tab selects it. Also the reason
         a mouse click selects on browsers that do focus a clicked button. */
      onFocus={(event) => {
        onFocus?.(event);
        select(value);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !NAV_KEYS.includes(event.key)) return;

        const list = event.currentTarget.closest('[role="tablist"]');
        if (!list) return;
        const tabs = Array.from(
          list.querySelectorAll<HTMLButtonElement>(
            '[role="tab"]:not([disabled])',
          ),
        );
        const from = tabs.indexOf(event.currentTarget);
        if (from === -1) return;

        const to =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : // Wrap at both ends.
                (from + (event.key === "ArrowLeft" ? -1 : 1) + tabs.length) %
                tabs.length;

        event.preventDefault();
        tabs[to]?.focus();
      }}
      {...props}
    />
  );
}

/* An unselected panel is not rendered — same as the Radix default this
   replaces, so screen readers and tests see exactly one panel. */
function TabsContent({
  className,
  value,
  ...props
}: Omit<React.ComponentProps<"div">, "value"> & { value: string }) {
  const { baseId, value: selected } = useTabsContext("TabsContent");
  if (value !== selected) return null;

  return (
    <div
      role="tabpanel"
      aria-labelledby={triggerId(baseId, value)}
      data-state="active"
      data-orientation="horizontal"
      data-slot="tabs-content"
      id={contentId(baseId, value)}
      tabIndex={0}
      className={cn("zn-tabs__content", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

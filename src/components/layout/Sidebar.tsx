import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  CalendarRange,
  Gauge,
  Heart,
  Calculator,
  Library,
  GraduationCap,
  Book,
  FlaskConical,
  ClipboardCheck,
  ChevronDown,
  Dices,
  Send,
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Flag,
  UserRound,
  Route as RouteIcon,
  Utensils,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getRandomWorkout } from "@/data/workouts";

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavItem {
  href?: string;
  action?: string;
  icon: (props: IconProps) => React.JSX.Element;
  labelKey: string;
  /**
   * Optional secondary entries that appear *only* when the parent route
   * is active and the sidebar is expanded. Used for /routes today
   * (Mes parcours, Trouver une piste). Collapsed mode hides them to
   * avoid a hidden tree behind the icon rail.
   */
  subItems?: NavItem[];
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    labelKey: "nav.sessions",
    items: [
      { href: "/library", icon: BookOpen, labelKey: "nav.library" },
      { href: "/collections", icon: Library, labelKey: "collections.title" },
      { href: "/favorites", icon: Heart, labelKey: "nav.favorites" },
      { href: "/my-zones", icon: Gauge, labelKey: "nav.myZones" },
      { href: "/profile", icon: UserRound, labelKey: "nav.profile" },
      { href: "/workout/builder", icon: Plus, labelKey: "nav.builder" },
    ],
  },
  {
    labelKey: "nav.plan",
    items: [
      { href: "/plans", icon: CalendarRange, labelKey: "nav.plans" },
      { href: "/race-simulator", icon: Flag, labelKey: "simulator.title" },
      {
        href: "/routes",
        icon: RouteIcon,
        labelKey: "routes:title",
        subItems: [
          { href: "/routes/mine", icon: Heart, labelKey: "routes:myRoutes" },
          { href: "/routes/tracks", icon: Flag, labelKey: "routes:trackFinder.entry" },
        ],
      },
      { href: "/plans/methodology", icon: FlaskConical, labelKey: "nav.planMethodology" },
    ],
  },
  {
    labelKey: "actions.tools",
    items: [
      { href: "/calculators", icon: Calculator, labelKey: "calculators:calculateurs.title" },
    ],
  },
  {
    labelKey: "nav.learn",
    items: [
      { href: "/learn", icon: GraduationCap, labelKey: "nav.learn" },
      { href: "/nutrition", icon: Utensils, labelKey: "nav.nutrition" },
      { href: "/methodology", icon: FlaskConical, labelKey: "nav.methodology" },
      { href: "/glossary", icon: Book, labelKey: "nav.glossary" },
    ],
  },
  {
    labelKey: "nav.quickActions",
    items: [
      { href: "/quiz", icon: ClipboardCheck, labelKey: "quiz.title" },
      { action: "random", icon: Dices, labelKey: "randomWorkout.title" },
    ],
  },
];

const footerItems: NavItem[] = [
  { href: "/contribute", icon: Send, labelKey: "nav.contribute" },
  { href: "/settings", icon: Settings, labelKey: "nav.settings" },
  { href: "/changelog", icon: Sparkles, labelKey: "nav.changelog" },
];

const prefixRoutes = ["/learn", "/collections", "/glossary", "/plan", "/calculators", "/routes"];

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  return prefixRoutes.some(
    (prefix) => href === prefix && pathname.startsWith(prefix + "/")
  );
}

// ---------------------------------------------------------------------------
// Unified nav item - same DOM for collapsed & expanded, CSS handles visibility
// ---------------------------------------------------------------------------

function SidebarNavItem({
  item,
  pathname,
  collapsed,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

  const label = t(item.labelKey);
  const active = item.href ? isActive(pathname, item.href) : false;

  const handleRandomWorkout = async () => {
    if (isLoadingRandom) return;
    setIsLoadingRandom(true);
    try {
      const workout = await getRandomWorkout();
      navigate(`/workout/${workout.id}`);
      onClick?.();
    } finally {
      setIsLoadingRandom(false);
    }
  };

  const classes = cn(
    "flex items-center rounded-md py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap",
    collapsed ? "justify-center px-2 gap-0" : "px-3 gap-3",
    active
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
  );

  const content = (
    <>
      <item.icon className="size-4 shrink-0" />
      <span
        className={cn(
          "transition-all duration-300 overflow-hidden",
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}
      >
        {label}
      </span>
    </>
  );

  const element = item.action === "random" ? (
    <button
      onClick={handleRandomWorkout}
      disabled={isLoadingRandom}
      className={cn(classes, "w-full")}
      aria-label={label}
    >
      {content}
    </button>
  ) : (
    <Link
      to={item.href!}
      viewTransition
      onClick={onClick}
      className={classes}
      aria-label={collapsed ? label : undefined}
      data-onboarding={
        item.href === "/library" ? "library" :
        item.href === "/quiz" ? "quiz" :
        item.href === "/plans" ? "plans" :
        item.href === "/workout/builder" ? "builder" :
        undefined
      }
    >
      {content}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{element}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return element;
}

// ---------------------------------------------------------------------------
// Sub-item — smaller variant rendered under an active parent. Always
// uses the expanded layout (sub-items are hidden in collapsed mode).
// ---------------------------------------------------------------------------

function SidebarSubNavItem({
  item,
  pathname,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  onClick?: () => void;
}) {
  const { t } = useTranslation("common");
  const label = t(item.labelKey);
  const active = item.href ? pathname === item.href : false;

  return (
    <Link
      to={item.href!}
      viewTransition
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-accent/70 text-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      <item.icon className="size-3.5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Group expand/collapse — persisted in localStorage. The first time a user
// loads the app, every group except the one matching the active route stays
// folded so the rail reads as a short table of contents rather than a
// vertically scrolling list. Subsequent loads restore the user's choices.
// ---------------------------------------------------------------------------

const GROUP_STATE_KEY = "zoned-sidebar-groups";

function readStoredGroupState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(GROUP_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed != null ? parsed : {};
  } catch {
    return {};
  }
}

function findActiveGroupKey(pathname: string): string | null {
  for (const group of navGroups) {
    if (group.items.some((item) => item.href && isActive(pathname, item.href))) {
      return group.labelKey;
    }
  }
  return null;
}

function useGroupCollapseState(pathname: string) {
  // Compute the default open set from storage + active group. Stored values
  // take precedence over the heuristic so navigation never re-collapses a
  // group the user explicitly opened.
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const stored = readStoredGroupState();
    const activeKey = findActiveGroupKey(pathname);
    const next: Record<string, boolean> = {};
    for (const group of navGroups) {
      next[group.labelKey] =
        stored[group.labelKey] ?? group.labelKey === activeKey;
    }
    return next;
  });

  // Whenever the route changes to a group that's currently collapsed, open
  // it. Other groups keep whatever state the user set — we never re-close
  // anything on navigation.
  useEffect(() => {
    const activeKey = findActiveGroupKey(pathname);
    if (!activeKey) return;
    setOpenMap((prev) => (prev[activeKey] ? prev : { ...prev, [activeKey]: true }));
  }, [pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(GROUP_STATE_KEY, JSON.stringify(openMap));
    } catch {
      // Storage quota or private mode — silently ignore, the next load just
      // falls back to the heuristic.
    }
  }, [openMap]);

  const toggle = useCallback((key: string) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return { openMap, toggle };
}

// ---------------------------------------------------------------------------
// Group header — clickable label + chevron. Only shown when the sidebar is
// expanded; the icon-rail mode bypasses grouping entirely so every shortcut
// stays one click away.
// ---------------------------------------------------------------------------

function GroupHeader({
  label,
  count,
  open,
  onToggle,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="group/header flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80 hover:text-foreground transition-colors"
    >
      <span className="flex items-center gap-2">
        <span>{label}</span>
        <span className="text-muted-foreground/50 font-normal tabular-nums">
          {count}
        </span>
      </span>
      <ChevronDown
        className={cn(
          "size-3 transition-transform duration-200",
          open ? "rotate-0" : "-rotate-90",
        )}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Sidebar content (shared between desktop & mobile)
// ---------------------------------------------------------------------------

function SidebarContent({
  collapsed,
  onLinkClick,
}: {
  collapsed: boolean;
  onLinkClick?: () => void;
}) {
  const { t } = useTranslation("common");
  const location = useLocation();
  const { openMap, toggle } = useGroupCollapseState(location.pathname);

  // In icon-only mode, the user gets a fast visual scan of every shortcut.
  // Hiding items behind collapsed groups would defeat the rail's purpose.
  const showAllItems = collapsed;

  // Render the group separator (border between groups) outside the per-group
  // render so we can keep it consistent regardless of which groups are open.
  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        {navGroups.map((group, index) => {
          const isOpen = showAllItems || openMap[group.labelKey];
          const itemsForCount = group.items.length;
          return (
            <div key={group.labelKey} className={cn(index > 0 && "mt-2")}>
              {index > 0 && !collapsed && (
                <div className="mb-1 mx-1 border-t border-border/40" />
              )}
              {index > 0 && collapsed && (
                <div className="my-1 mx-2 border-t border-border/40" />
              )}

              {!collapsed && (
                <GroupHeader
                  label={t(group.labelKey)}
                  count={itemsForCount}
                  open={!!openMap[group.labelKey]}
                  onToggle={() => toggle(group.labelKey)}
                />
              )}

              <div
                className={cn(
                  "flex flex-col gap-0.5 overflow-hidden transition-[max-height,opacity] duration-200 ease-out",
                  isOpen
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0 pointer-events-none",
                )}
              >
                {group.items.map((item) => {
                  const parentActive = item.href
                    ? isActive(location.pathname, item.href)
                    : false;
                  return (
                    <div key={item.labelKey} className="flex flex-col gap-0.5">
                      <SidebarNavItem
                        item={item}
                        pathname={location.pathname}
                        collapsed={collapsed}
                        onClick={onLinkClick}
                      />
                      {!collapsed && parentActive && item.subItems?.length ? (
                        <div className="ml-3 flex flex-col gap-0.5 border-l border-border/40 pl-2">
                          {item.subItems.map((sub) => (
                            <SidebarSubNavItem
                              key={sub.labelKey}
                              item={sub}
                              pathname={location.pathname}
                              onClick={onLinkClick}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer — always visible. Settings + contribute + changelog are too
          important to hide behind a collapsed group. */}
      <div className="shrink-0 px-2 py-2 border-t border-border/40">
        <div className="flex flex-col gap-0.5 pt-1">
          {footerItems.map((item) => (
            <SidebarNavItem
              key={item.labelKey}
              item={item}
              pathname={location.pathname}
              collapsed={collapsed}
              onClick={onLinkClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop Sidebar
// ---------------------------------------------------------------------------

export function Sidebar({
  collapsed,
  onToggleCollapse,
  className,
}: SidebarProps) {
  const { t } = useTranslation("common");

  return (
    <aside
      className={cn(
        // The global TopBar is `fixed h-12 z-50` so anything sitting at
        // top-0 ends up underneath it. We anchor the sidebar at top-12
        // and shrink the height accordingly so the toggle button stays
        // visible (was clipped by the TopBar before).
        "sticky top-12 hidden md:flex h-[calc(100vh-3rem)] flex-col border-r bg-background overflow-hidden",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[52px]" : "w-60",
        className
      )}
    >
      {/* Header - toggle button */}
      <div className={cn(
        "flex h-12 shrink-0 items-center border-b transition-all duration-300",
        collapsed ? "justify-center px-1" : "justify-end px-3"
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapse}
              aria-label={t("actions.menu")}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">{t("actions.menu")}</TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Content */}
      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Mobile Sidebar (Sheet)
// ---------------------------------------------------------------------------

export function MobileSidebar({
  open,
  onOpenChange,
}: MobileSidebarProps) {
  const { t } = useTranslation("common");
  const location = useLocation();

  useEffect(() => {
    onOpenChange(false);
  }, [location.pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>{t("actions.menu")}</SheetTitle>
        </SheetHeader>
        <div className="h-full">
          <SidebarContent
            collapsed={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

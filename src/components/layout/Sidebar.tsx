import { useEffect, useState } from "react";
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
  Dices,
  Send,
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Flag,
  UserRound,
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

const prefixRoutes = ["/learn", "/collections", "/glossary", "/plan", "/calculators"];

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

  return (
    <div className="flex h-full flex-col">
      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        {navGroups.map((group, index) => (
          <div key={group.labelKey} className={cn(index > 0 && "mt-3")}>
            {index > 0 && (
              <div className={cn("mb-2 border-t", collapsed ? "mx-2" : "mx-1")} />
            )}
            <div
              className={cn(
                "mb-1 overflow-hidden px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all duration-300 whitespace-nowrap",
                collapsed ? "h-0 opacity-0" : "h-5 opacity-100"
              )}
            >
              {t(group.labelKey)}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
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
        ))}
      </nav>

      {/* Footer */}
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
        "sticky top-0 hidden md:flex h-screen flex-col border-r bg-background overflow-hidden",
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

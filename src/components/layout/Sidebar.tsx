import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  CalendarRange,
  Heart,
  Target,
  Library,
  GraduationCap,
  Book,
  ClipboardCheck,
  Dices,
  Send,
  Settings,
  Sparkles,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
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
import { changeLanguage, getCurrentLanguage } from "@/i18n";
import { getRandomWorkout } from "@/data/workouts";
import Logo from "@/assets/logo.svg?react";

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  className?: string;
}

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
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
    labelKey: "nav.training",
    items: [
      { href: "/library", icon: BookOpen, labelKey: "nav.library" },
      { href: "/plans", icon: CalendarRange, labelKey: "nav.plans" },
      { href: "/favorites", icon: Heart, labelKey: "nav.favorites" },
      { href: "/my-zones", icon: Target, labelKey: "myZones.title" },
    ],
  },
  {
    labelKey: "nav.discover",
    items: [
      { href: "/collections", icon: Library, labelKey: "collections.title" },
      { href: "/learn", icon: GraduationCap, labelKey: "nav.learn" },
      { href: "/glossary", icon: Book, labelKey: "nav.glossary" },
    ],
  },
  {
    labelKey: "actions.tools",
    items: [
      { href: "/quiz", icon: ClipboardCheck, labelKey: "quiz.title" },
      { action: "random", icon: Dices, labelKey: "randomWorkout.title" },
      { href: "/contribute", icon: Send, labelKey: "nav.contribute" },
    ],
  },
];

const footerItems: NavItem[] = [
  { href: "/settings", icon: Settings, labelKey: "nav.settings" },
  { href: "/changelog", icon: Sparkles, labelKey: "nav.changelog" },
];

const prefixRoutes = ["/learn", "/collections", "/glossary", "/plan"];

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
    "flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap",
    collapsed ? "justify-center px-2" : "px-3",
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
  theme,
  onThemeToggle,
  onLinkClick,
}: {
  collapsed: boolean;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  onLinkClick?: () => void;
}) {
  const { t } = useTranslation("common");
  const location = useLocation();
  const currentLang = getCurrentLanguage();

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
      <div className="border-t px-2 py-3">
        <div className="flex flex-col gap-0.5">
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

        {/* Theme & Language toggles */}
        <div className="mt-3 flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onThemeToggle}
                aria-label={theme === "light" ? t("theme.dark") : t("theme.light")}
              >
                {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                {theme === "light" ? t("theme.dark") : t("theme.light")}
              </TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => changeLanguage(currentLang === "fr" ? "en" : "fr")}
                aria-label={currentLang === "fr" ? "English" : "Français"}
              >
                <span className="text-xs font-semibold">{currentLang.toUpperCase()}</span>
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                {currentLang === "fr" ? "English" : "Français"}
              </TooltipContent>
            )}
          </Tooltip>
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
  theme,
  onThemeToggle,
  className,
}: SidebarProps) {
  const { t } = useTranslation("common");

  return (
    <aside
      className={cn(
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
      <SidebarContent
        collapsed={collapsed}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Mobile Sidebar (Sheet)
// ---------------------------------------------------------------------------

export function MobileSidebar({
  open,
  onOpenChange,
  theme,
  onThemeToggle,
}: MobileSidebarProps) {
  const { t } = useTranslation("common");
  const location = useLocation();

  useEffect(() => {
    onOpenChange(false);
  }, [location.pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2">
            <Logo className="w-16 h-8" />
            <span className="font-bold text-base">{t("app.name")}</span>
          </SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100%-57px)]">
          <SidebarContent
            collapsed={false}
            theme={theme}
            onThemeToggle={onThemeToggle}
            onLinkClick={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

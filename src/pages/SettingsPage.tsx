import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Code, FileText, Send, Trash2 } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ResponsiveTable,
  type ResponsiveTableColumn,
} from "@/components/ui/responsive-table";
import { Segmented } from "@/components/ui/segmented";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PRACTICE_META, PRACTICES, type Practice } from "@/types/practice";
import { MODULE_IDS } from "@/types/settings";
import { isModuleHidden, visiblePractices } from "@/lib/settingsSchema";
import { StatBlock } from "@/components/domain/StatBlock";
import { DataExportImport } from "@/components/domain/DataExportImport";
import { useAppStats } from "@/hooks/useAppStats";
import { useFavorites } from "@/hooks/useFavorites";
import { usePlans } from "@/hooks/usePlans";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { changeLanguage } from "@/i18n";
import { getLatestVersionString } from "@/data/changelog";
import { BACKUP_STORAGE_KEYS } from "@/lib/backup";
import type { ThemePreference } from "@/lib/theme";
import type { OpeningAnimation, UnitSystem } from "@/types/settings";

const REPO_URL = "https://github.com/alarboulletmarin/zoned";

/** localStorage sits on a ~5 MB budget; the stat says how much of it is used. */
const STORAGE_BUDGET_KB = 5 * 1024;

interface AboutRow {
  key: string;
  label: string;
  value: string;
}

/**
 * Settings, the local profile, and the facts about the app itself.
 *
 * The discipline palettes and the colour-blind palettes used to be set here.
 * The redesign made both meaningless: there is one ink ramp for all three
 * disciplines, and it is legible in greyscale by construction, which is the
 * whole argument for it. The controls are gone; the hook state they wrote to
 * is reported to the cleanup lot rather than deleted here.
 */
export function SettingsPage() {
  const { t, i18n } = useTranslation(["common", "routes", "content"]);
  const {
    settings,
    setUnitSystem,
    setRouteGeneratorEnabled,
    setOpeningAnimation,
    setEnabledPractices,
    setModuleHidden,
  } = useSettings();
  const { preference: themePreference, setPreference: setThemePreference } =
    useTheme();
  const { favorites } = useFavorites();
  const { plans } = usePlans();
  const stats = useAppStats();
  const [confirmWipe, setConfirmWipe] = useState(false);

  /* Vide veut dire toutes côté stockage, mais l'interrupteur doit montrer
     l'état réel : tout allumé. Décocher écrit donc le complément, et remettre
     la dernière manquante revient au tableau vide plutôt que de figer une
     liste qui ne suivrait plus l'arrivée d'une pratique. */
  const shownPractices = visiblePractices(settings);
  const togglePractice = (practice: Practice, on: boolean) => {
    const next = on
      ? PRACTICES.filter((p) => p === practice || shownPractices.includes(p))
      : shownPractices.filter((p) => p !== practice);
    setEnabledPractices(next.length === PRACTICES.length ? [] : [...next]);
  };
  const pickPracticeLabel = (practice: Practice) =>
    i18n.language.startsWith("en")
      ? PRACTICE_META[practice].labelEn
      : PRACTICE_META[practice].label;

  const language = i18n.language?.startsWith("en") ? "en" : "fr";

  // What the app actually occupies in this browser, read from the same keys
  // the backup writes, a number, not an adjective.
  const storageKb = useMemo(() => {
    let chars = 0;
    for (const key of BACKUP_STORAGE_KEYS) {
      chars += (localStorage.getItem(key) ?? "").length + key.length;
    }
    return Math.max(1, Math.round((chars * 2) / 1024));
  }, []);

  // "Installée" means launched from the home screen rather than from a tab.
  const installed = useMemo(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches,
    [],
  );

  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: "light", label: t("theme.light") },
    { value: "dark", label: t("theme.dark") },
    { value: "system", label: t("theme.system") },
  ];

  const openingOptions: { value: OpeningAnimation; label: string }[] = [
    { value: "system", label: t("settings.openingAnimation.system") },
    { value: "always", label: t("settings.openingAnimation.always") },
    { value: "never", label: t("settings.openingAnimation.never") },
  ];

  const aboutColumns: ResponsiveTableColumn<AboutRow>[] = [
    {
      key: "label",
      header: t("settingsPage.tableItem"),
      cell: (row) => row.label,
      scope: "col",
    },
    {
      key: "value",
      header: t("settingsPage.tableValue"),
      cell: (row) => <span className="zn-mono">{row.value}</span>,
    },
  ];

  const aboutRows: AboutRow[] = [
    {
      key: "version",
      label: t("settingsPage.rowVersion"),
      value: getLatestVersionString(),
    },
    { key: "licence", label: t("settingsPage.rowLicence"), value: "MIT" },
    {
      key: "workouts",
      label: t("settingsPage.rowWorkouts"),
      value: stats.workouts > 0 ? String(stats.workouts) : "-",
    },
    {
      key: "offline",
      label: t("settingsPage.rowOffline"),
      value: installed
        ? t("settingsPage.offlineInstalled")
        : t("settingsPage.offlineTab"),
    },
  ];

  function wipeEverything() {
    for (const key of BACKUP_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
    setConfirmWipe(false);
    toast.success(t("settingsPage.wipeDone"));
    setTimeout(() => window.location.reload(), 800);
  }

  return (
    <>
      <SEOHead noindex={true} title={t("seo.settings")} canonical="/settings" />

      <div className="zn-set">
        {/* 1, what this screen is, and the two numbers it is about */}
        <section
          className="zn-section zn-split zn-set__head"
          style={
            { "--split": "1fr auto", "--gap": "var(--sp-15)" } as CSSProperties
          }
        >
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-6)" } as CSSProperties}
          >
            <span className="zn-kicker">{t("settingsPage.kicker")}</span>
            <h1 className="zn-display" data-level="2">
              {t("settings.title")}
            </h1>
            <p className="zn-body zn-body--lead zn-measure">
              {t("settings.description")}
            </p>
          </div>

          <div
            className="zn-cluster zn-set__stats"
            style={{ "--gap": "var(--sp-6)" } as CSSProperties}
          >
            <StatBlock
              tone="card"
              size="sm"
              value={t("settingsPage.storageValue", { n: storageKb })}
              label={t("settingsPage.statStorage")}
              footnote={t("settingsPage.storageFoot", {
                n: STORAGE_BUDGET_KB / 1024,
              })}
            />
            <StatBlock
              tone="card"
              size="sm"
              value={String(favorites.length)}
              label={t("settingsPage.statFavorites")}
            />
          </div>
        </section>

        {/* 2, the two columns: what you see, and what you own */}
        <section
          className="zn-section zn-grid"
          style={
            {
              "--cols": 2,
              "--cols-md": 1,
              "--gap": "var(--sp-17)",
            } as CSSProperties
          }
        >
          {/* ── left: display, then the facts about the app ─────────────── */}
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-11)" } as CSSProperties}
          >
            <Card>
              <CardHeader>
                <CardTitle>{t("settingsPage.display")}</CardTitle>
                <CardDescription>
                  {t("settingsPage.displayHint")}
                </CardDescription>
              </CardHeader>
              <CardContent
                className="zn-stack"
                style={{ "--gap": "var(--sp-11)" } as CSSProperties}
              >
                <div
                  className="zn-stack"
                  style={{ "--gap": "var(--sp-4)" } as CSSProperties}
                >
                  <label className="zn-label" htmlFor="settings-language">
                    {t("settingsPage.language")}
                  </label>
                  <p className="zn-caption zn-muted" id="settings-language-hint">
                    {t("settingsPage.languageHint")}
                  </p>
                  <Select
                    value={language}
                    onValueChange={(value) =>
                      void changeLanguage(value as "fr" | "en")
                    }
                  >
                    <SelectTrigger
                      id="settings-language"
                      aria-describedby="settings-language-hint"
                      className="zn-set__control"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className="zn-stack"
                  style={{ "--gap": "var(--sp-4)" } as CSSProperties}
                >
                  <label className="zn-label" htmlFor="settings-theme">
                    {t("settings.theme.title")}
                  </label>
                  <p className="zn-caption zn-muted" id="settings-theme-hint">
                    {t("settings.theme.description")}
                  </p>
                  <Select
                    value={themePreference}
                    onValueChange={(value) =>
                      setThemePreference(value as ThemePreference)
                    }
                  >
                    <SelectTrigger
                      id="settings-theme"
                      aria-describedby="settings-theme-hint"
                      className="zn-set__control"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* The launch screen. `system` follows the OS reduced-motion
                    setting; `always` is the only way the app ever plays motion
                    against it, and it exists because the choice belongs to the
                    person making it, not to the code. */}
                <div
                  className="zn-stack"
                  style={{ "--gap": "var(--sp-4)" } as CSSProperties}
                >
                  <label className="zn-label" htmlFor="settings-opening">
                    {t("settings.openingAnimation.title")}
                  </label>
                  <p className="zn-caption zn-muted" id="settings-opening-hint">
                    {t("settings.openingAnimation.description")}
                  </p>
                  <Select
                    value={settings.openingAnimation}
                    onValueChange={(value) =>
                      setOpeningAnimation(value as OpeningAnimation)
                    }
                  >
                    <SelectTrigger
                      id="settings-opening"
                      aria-describedby="settings-opening-hint"
                      className="zn-set__control"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {openingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className="zn-stack"
                  style={{ "--gap": "var(--sp-4)" } as CSSProperties}
                >
                  <span className="zn-label">
                    {t("settings.unitSystem.title")}
                  </span>
                  <p className="zn-caption zn-muted">
                    {t("settingsPage.unitsHint")}
                  </p>
                  <Segmented<UnitSystem>
                    className="zn-set__control"
                    label={t("settings.unitSystem.title")}
                    value={settings.unitSystem}
                    onChange={setUnitSystem}
                    options={[
                      {
                        value: "metric",
                        label: t("settingsPage.unitsMetric"),
                        title: t("settings.unitSystem.metric"),
                      },
                      {
                        value: "imperial",
                        label: t("settingsPage.unitsImperial"),
                        title: t("settings.unitSystem.imperial"),
                      },
                    ]}
                  />
                </div>

                {/* The one feature that emits a coordinate to a public
                    service, so it keeps its own switch and its caveat. */}
                <div className="zn-set__toggle">
                  <div
                    className="zn-row zn-row--split zn-row--start"
                    style={{ "--gap": "var(--sp-10)" } as CSSProperties}
                  >
                    <label
                      className="zn-label zn-fill"
                      htmlFor="settings-routes"
                    >
                      {t("routes:privacy.toggle")}
                    </label>
                    <Switch
                      id="settings-routes"
                      aria-describedby="settings-routes-hint"
                      className="zn-fixed"
                      checked={settings.routeGeneratorEnabled}
                      onCheckedChange={setRouteGeneratorEnabled}
                    />
                  </div>
                  <p
                    id="settings-routes-hint"
                    className="zn-caption zn-muted"
                    style={{ marginBlockStart: "var(--sp-4)" }}
                  >
                    {t("settingsPage.routesCaveat")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ce que l'app met en avant. Les pratiques partent toutes
                affichées : le défaut est le tableau vide, personne n'a de
                question à répondre au premier lancement, et décocher écrit le
                complément explicite. Masquer un module le retire de la
                navigation, la route, elle, reste valide (voir ModuleGate). */}
            <Card className="zn-set__band">
              <CardHeader>
                <CardTitle>{t("settingsPage.tailored")}</CardTitle>
                <CardDescription>{t("settingsPage.tailoredDesc")}</CardDescription>
              </CardHeader>
              <CardContent
                className="zn-stack"
                style={{ "--gap": "var(--sp-11)" } as CSSProperties}
              >
                <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
                  <span className="zn-kicker">{t("settingsPage.practices")}</span>
                  {PRACTICES.map((practice) => (
                    <div
                      key={practice}
                      className="zn-row zn-row--split zn-row--start"
                      style={{ "--gap": "var(--sp-10)" } as CSSProperties}
                    >
                      <label className="zn-label zn-fill" htmlFor={`settings-practice-${practice}`}>
                        {pickPracticeLabel(practice)}
                      </label>
                      <Switch
                        id={`settings-practice-${practice}`}
                        className="zn-fixed"
                        checked={shownPractices.includes(practice)}
                        // La dernière pratique ne se décoche pas : une app sans
                        // aucune pratique n'a plus rien à montrer.
                        disabled={shownPractices.length === 1 && shownPractices.includes(practice)}
                        onCheckedChange={(on) => togglePractice(practice, on)}
                      />
                    </div>
                  ))}
                  <p className="zn-caption zn-muted">{t("settingsPage.practicesHint")}</p>
                </div>

                <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
                  <span className="zn-kicker">{t("settingsPage.modules")}</span>
                  {MODULE_IDS.map((module) => (
                    <div
                      key={module}
                      className="zn-row zn-row--split zn-row--start"
                      style={{ "--gap": "var(--sp-10)" } as CSSProperties}
                    >
                      <label className="zn-label zn-fill" htmlFor={`settings-module-${module}`}>
                        {t(`modules.${module}.name`)}
                      </label>
                      <Switch
                        id={`settings-module-${module}`}
                        className="zn-fixed"
                        checked={!isModuleHidden(settings, module)}
                        onCheckedChange={(on) => setModuleHidden(module, !on)}
                      />
                    </div>
                  ))}
                  <p className="zn-caption zn-muted">{t("settingsPage.modulesHint")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="zn-set__band">
              <CardHeader>
                <CardTitle>{t("settingsPage.about")}</CardTitle>
              </CardHeader>
              <CardContent
                className="zn-stack"
                style={{ "--gap": "var(--sp-10)" } as CSSProperties}
              >
                <ResponsiveTable
                  data={aboutRows}
                  columns={aboutColumns}
                  rowKey="key"
                  caption={t("settingsPage.about")}
                />
                <div
                  className="zn-cluster"
                  style={{ "--gap": "var(--sp-5)" } as CSSProperties}
                >
                  <Button variant="outline" size="sm" asChild>
                    <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                      <Code />
                      {t("settingsPage.sourceCode")}
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/changelog">
                      <FileText />
                      {t("content:changelog.title")}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/contribute">
                      <Send />
                      {t("settingsPage.contribute")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── right: the data, and the one way to lose it ─────────────── */}
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-11)" } as CSSProperties}
          >
            <DataExportImport />

            <Alert kind="info" title={t("settingsPage.privacyTitle")}>
              {t("settingsPage.privacyBody")}
            </Alert>

            <Card className="zn-set__danger">
              <CardHeader>
                <CardTitle>
                  <span
                    className="zn-row"
                    style={{ "--gap": "var(--sp-6)" } as CSSProperties}
                  >
                    {t("settingsPage.wipeTitle")}
                    <Badge variant="outline">
                      {t("settingsPage.wipeBadge")}
                    </Badge>
                  </span>
                </CardTitle>
                <CardDescription>
                  {t("settingsPage.wipeBody", {
                    favorites: favorites.length,
                    plans: plans.length,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmWipe(true)}
                >
                  <Trash2 />
                  {t("settingsPage.wipeButton")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Dialog open={confirmWipe} onOpenChange={setConfirmWipe}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settingsPage.wipeConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("settingsPage.wipeConfirmBody", {
                favorites: favorites.length,
                plans: plans.length,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmWipe(false)}>
              {t("actions.cancel")}
            </Button>
            <Button variant="destructive" onClick={wipeEverything}>
              {t("settingsPage.wipeConfirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

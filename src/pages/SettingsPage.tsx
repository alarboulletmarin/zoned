import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { useSettings } from "@/hooks/useSettings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DataExportImport } from "@/components/domain/DataExportImport";
import type { ColorPalette } from "@/types/settings";

const ZONE_NUMBERS = [1, 2, 3, 4, 5, 6] as const;

function ZonePreview() {
  return (
    <div className="flex gap-1 mt-4">
      {ZONE_NUMBERS.map((zone) => (
        <div
          key={zone}
          className="flex-1 h-8 rounded flex items-center justify-center text-xs font-medium"
          style={{
            backgroundColor: `var(--zone-${zone})`,
            color: "white",
          }}
        >
          Z{zone}
        </div>
      ))}
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation(["common", "routes"]);
  const { settings, setColorPalette, setUnitSystem, setRouteGeneratorEnabled } =
    useSettings();

  const paletteOptions: { value: ColorPalette; label: string }[] = [
    {
      value: "standard",
      label: t("settings.colorPalette.options.standard"),
    },
    {
      value: "deuteranopia",
      label: t("settings.colorPalette.options.deuteranopia"),
    },
    {
      value: "tritanopia",
      label: t("settings.colorPalette.options.tritanopia"),
    },
  ];

  return (
    <>
      <SEOHead
        noindex={true}
        title={t("seo.settings")}
        canonical="/settings"
      />
      <div className="py-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
          <p className="text-muted-foreground">{t("settings.description")}</p>
        </div>

        <div className="space-y-6">
          {/* Color Palette */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.colorPalette.title")}</CardTitle>
              <CardDescription>
                {t("settings.colorPalette.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={settings.colorPalette}
                onValueChange={(value) => setColorPalette(value as ColorPalette)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paletteOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ZonePreview />
            </CardContent>
          </Card>

          {/* Unit System */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.unitSystem.title")}</CardTitle>
              <CardDescription>
                {t("settings.unitSystem.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {settings.unitSystem === "metric"
                    ? t("settings.unitSystem.metric")
                    : t("settings.unitSystem.imperial")}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">km</span>
                  <Switch
                    checked={settings.unitSystem === "imperial"}
                    onCheckedChange={(checked) =>
                      setUnitSystem(checked ? "imperial" : "metric")
                    }
                  />
                  <span className="text-sm text-muted-foreground">mi</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.privacy.title")}</CardTitle>
              <CardDescription>
                {t("settings.privacy.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>{t("settings.privacy.noServer")}</li>
                <li>{t("settings.privacy.noAccount")}</li>
                <li>{t("settings.privacy.localStorage")}</li>
                <li>{t("settings.privacy.analytics")}</li>
              </ul>

              {/* Route Generator opt-in: the only feature that emits the
                  user's start coordinate to a public service, so it gets a
                  dedicated toggle here rather than buried in the route page. */}
              <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">
                    {t("routes:privacy.toggle")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("routes:privacy.body")}
                  </p>
                </div>
                <Switch
                  checked={settings.routeGeneratorEnabled}
                  onCheckedChange={setRouteGeneratorEnabled}
                  aria-label={t("routes:privacy.toggle")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Export/Import */}
          <DataExportImport />
        </div>
      </div>
    </>
  );
}

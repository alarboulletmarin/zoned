import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Flame,
  Info,
  Calculator,
  Activity,
  List,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SEOHead } from "@/components/seo";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { metSections } from "@/data/guides/met";
import type { MetBlock } from "@/data/guides/met";
import { pickLang } from "@/lib/i18n-utils";

const SECTION_ICONS: Record<string, React.ComponentType<IconProps>> = {
  Info,
  Calculator,
  Activity,
  List,
  AlertTriangle,
  Flame,
};

export function MetGuidePage() {
  const { t } = useTranslation("guides");

  function renderBlock(block: MetBlock, blockIdx: number) {
    const text = pickLang(block, "text");

    switch (block.type) {
      case "paragraph":
        return (
          <p key={blockIdx} className="text-muted-foreground leading-relaxed">
            <GlossaryLinkedText text={text ?? ""} />
          </p>
        );

      case "list":
        return (
          <div key={blockIdx} className="space-y-2">
            {text && <h4 className="font-medium text-sm">{text}</h4>}
            <ul className="space-y-1.5 ml-1">
              {block.items?.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1 shrink-0">&#8226;</span>
                  <span>{pickLang(item, "text")}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case "tip":
        return (
          <div
            key={blockIdx}
            className="flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
          >
            <Info className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              <GlossaryLinkedText text={text ?? ""} />
            </p>
          </div>
        );

      case "warning":
        return (
          <div
            key={blockIdx}
            className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
          >
            <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <GlossaryLinkedText text={text ?? ""} />
            </p>
          </div>
        );

      case "formula":
        return (
          <div
            key={blockIdx}
            className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center"
          >
            <code className="text-base font-semibold text-foreground">
              {block.formula}
            </code>
          </div>
        );

      case "table":
        return (
          <div key={blockIdx} className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {block.rows?.map((row, i) => (
                  <tr key={i} className="border-b last:border-b-0 hover:bg-muted/50">
                    <td className="py-2 px-3 font-medium w-1/3 align-top">
                      {pickLang(row, "label")}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {pickLang(row, "value")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <>
      <SEOHead
        title={t("met.title")}
        description={t("met.seoDescription")}
        canonical="/guides/met"
        jsonLd={[
          {
            "@type": "Article",
            name: t("met.seoArticleName"),
            description: t("met.seoArticleDescription"),
            url: "https://zoned.run/guides/met",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://zoned.run/guides" },
              { "@type": "ListItem", position: 3, name: t("met.title") },
            ],
          },
        ]}
      />
      <div className="py-8">
        {/* Back link */}
        <Link
          to="/guides"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          {t("backToGuides")}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Flame className="size-8 text-primary" />
            {t("met.title")}
          </h1>
          <p className="text-muted-foreground text-lg">{t("met.subtitle")}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              to="/calculators/met"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {t("met.openCalculator")}
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="https://fr.wikipedia.org/wiki/%C3%89quivalent_m%C3%A9tabolique"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("met.wikipediaLink")}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {/* Sections */}
        <Tabs defaultValue={metSections[0].id}>
          <TabsList className="flex-wrap h-auto gap-1 mb-6">
            {metSections.map((section) => {
              const Icon = SECTION_ICONS[section.icon] ?? Info;
              return (
                <TabsTrigger key={section.id} value={section.id} className="gap-1.5">
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{pickLang(section, "title")}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {metSections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">{pickLang(section, "title")}</h2>
                {section.content.map((block, i) => renderBlock(block, i))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}

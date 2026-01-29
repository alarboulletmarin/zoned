import { useParams, Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Clock, BookOpen, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { getArticleBySlug, getAdjacentArticles } from "@/data/articles";
import { cn } from "@/lib/utils";

/**
 * Simple Markdown renderer
 * Handles: headers, bold, links, lists, tables, horizontal rules
 */
function renderMarkdown(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let inList = false;
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1 my-4 text-muted-foreground">
          {listItems.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(2); // Skip header and separator
      elements.push(
        <div key={key++} className="my-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                {header.map((cell, i) => (
                  <th key={i} className="text-left py-2 px-3 font-semibold">
                    {parseInline(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  {row.map((cell, j) => (
                    <td key={j} className="py-2 px-3 text-muted-foreground">
                      {parseInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  const parseInline = (text: string): React.ReactNode => {
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Links
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>');

    // Return as HTML
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Horizontal rule
    if (line.trim() === "---") {
      flushList();
      flushTable();
      elements.push(<hr key={key++} className="my-6 border-border" />);
      continue;
    }

    // Table detection
    if (line.includes("|") && line.trim().startsWith("|")) {
      flushList();
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cells = line.split("|").filter((c) => c.trim() !== "");
      // Skip separator row (contains only dashes)
      if (cells.every((c) => /^[\s-]+$/.test(c))) {
        tableRows.push(cells);
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headers
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-xl font-bold mt-8 mb-4">
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-lg font-semibold mt-6 mb-3">
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // Lists
    if (line.trim().startsWith("- ")) {
      inList = true;
      listItems.push(line.trim().slice(2));
      continue;
    } else if (inList && line.trim() === "") {
      flushList();
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line.trim())) {
      flushList();
      const match = line.trim().match(/^\d+\.\s(.*)$/);
      if (match) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(match[1]);
      }
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      flushList();
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={key++} className="my-4 text-muted-foreground leading-relaxed">
        {parseInline(line)}
      </p>
    );
  }

  flushList();
  flushTable();

  return elements;
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language === "en";

  const article = slug ? getArticleBySlug(slug) : undefined;
  const { prev, next } = slug ? getAdjacentArticles(slug) : { prev: null, next: null };

  if (!article) {
    return <Navigate to="/learn" replace />;
  }

  const content = isEn ? article.contentEn : article.content;
  const title = isEn ? article.titleEn : article.title;
  const description = isEn ? article.descriptionEn : article.description;
  const truncatedDescription = description.length > 155 ? description.slice(0, 152) + "..." : description;

  return (
    <>
      <SEOHead
        title={title}
        description={truncatedDescription}
        canonical={`/learn/${slug}`}
        ogType="article"
        jsonLd={{
          "@type": "Article",
          headline: title,
          description: truncatedDescription,
        }}
      />
      <div className="py-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">
          <Home className="size-4" />
        </Link>
        <ChevronRight className="size-3" />
        <Link to="/learn" className="hover:text-foreground transition-colors">
          {t("learn.title")}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground truncate">{title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <BookOpen className="size-4" />
          <span>{t(`learn.categories.${article.category}`)}</span>
          <span>-</span>
          <Clock className="size-3" />
          <span>{article.readTime} min {t("learn.readTime")}</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">{title}</h1>
        <p className="text-lg text-muted-foreground">{description}</p>
      </header>

      {/* Content */}
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        {renderMarkdown(content)}
      </article>

      {/* CTA to My Zones (for zones article) */}
      {article.slug === "zones" && (
        <div className="mt-8 p-6 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground mb-4">
            {t("learn.zonesCtaText")}
          </p>
          <Button asChild>
            <Link to="/my-zones">{t("learn.zonesCtaButton")}</Link>
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-12 pt-8 border-t flex justify-between gap-4">
        {prev ? (
          <Link
            to={`/learn/${prev.slug}`}
            className={cn(
              "flex-1 group p-4 rounded-lg border hover:bg-muted transition-colors",
              "flex flex-col gap-1"
            )}
          >
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ChevronLeft className="size-3" />
              {t("learn.prevArticle")}
            </span>
            <span className="font-medium group-hover:text-primary transition-colors">
              {isEn ? prev.titleEn : prev.title}
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {next ? (
          <Link
            to={`/learn/${next.slug}`}
            className={cn(
              "flex-1 group p-4 rounded-lg border hover:bg-muted transition-colors",
              "flex flex-col gap-1 text-right"
            )}
          >
            <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              {t("learn.nextArticle")}
              <ChevronRight className="size-3" />
            </span>
            <span className="font-medium group-hover:text-primary transition-colors">
              {isEn ? next.titleEn : next.title}
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>

      {/* Back to Learn */}
      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link to="/learn">
            <BookOpen className="size-4 mr-2" />
            {t("learn.backToHub")}
          </Link>
        </Button>
      </div>
    </div>
    </>
  );
}

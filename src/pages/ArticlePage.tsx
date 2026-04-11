import { useParams, Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Clock, BookOpen, Home, Loader2, Lightbulb, AlertTriangle, Info, Activity } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { useArticle, useAdjacentArticles } from "@/hooks/useArticles";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { ReadingProgress } from "@/components/domain/ReadingProgress";
import { TableOfContents } from "@/components/domain/TableOfContents";
import { cn } from "@/lib/utils";
import { RelatedContent } from "@/components/domain/RelatedContent";

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
    // Split on bold markers and links, producing React elements
    const parts: React.ReactNode[] = [];
    let partKey = 0;

    // Combined regex to find **bold** or [link text](url)
    const inlineRegex = /(\*\*(.*?)\*\*)|(\[(.*?)\]\((.*?)\))/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = inlineRegex.exec(text)) !== null) {
      // Add plain text before this match
      if (match.index > lastIndex) {
        const plainText = text.slice(lastIndex, match.index);
        parts.push(<GlossaryLinkedText key={partKey++} text={plainText} />);
      }

      if (match[2] !== undefined) {
        // Bold: **text**
        parts.push(<strong key={partKey++}>{match[2]}</strong>);
      } else if (match[4] !== undefined && match[5] !== undefined) {
        // Link: [text](url)
        parts.push(
          <a key={partKey++} href={match[5]} className="text-primary underline hover:no-underline">
            {match[4]}
          </a>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining plain text
    if (lastIndex < text.length) {
      const plainText = text.slice(lastIndex);
      parts.push(<GlossaryLinkedText key={partKey++} text={plainText} />);
    }

    // If no inline formatting found, just use GlossaryLinkedText for the whole thing
    if (parts.length === 0) {
      return <GlossaryLinkedText text={text} />;
    }

    return <>{parts}</>;
  };

  const renderCallout = (type: "tip" | "warning" | "key" | "stat", text: string, calloutKey: number): React.ReactNode => {
    const config = {
      tip: {
        icon: Lightbulb,
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        border: "border-emerald-200 dark:border-emerald-800",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        title: "Conseil",
      },
      warning: {
        icon: AlertTriangle,
        bg: "bg-amber-50 dark:bg-amber-950/30",
        border: "border-amber-200 dark:border-amber-800",
        iconColor: "text-amber-600 dark:text-amber-400",
        title: "Attention",
      },
      key: {
        icon: Info,
        bg: "bg-blue-50 dark:bg-blue-950/30",
        border: "border-blue-200 dark:border-blue-800",
        iconColor: "text-blue-600 dark:text-blue-400",
        title: "À retenir",
      },
      stat: {
        icon: Activity,
        bg: "bg-purple-50 dark:bg-purple-950/30",
        border: "border-purple-200 dark:border-purple-800",
        iconColor: "text-purple-600 dark:text-purple-400",
        title: "Chiffre clé",
      },
    };

    const { icon: Icon, bg, border, iconColor, title } = config[type];

    return (
      <div key={calloutKey} className={`my-6 rounded-lg border ${border} ${bg} p-4`}>
        <div className="flex gap-3">
          <Icon className={`size-5 shrink-0 mt-0.5 ${iconColor}`} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm mb-1">{title}</p>
            <div className="text-sm text-muted-foreground leading-relaxed">{parseInline(text)}</div>
          </div>
        </div>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Blockquote / Callout blocks
    if (line.startsWith("> ") || line === ">") {
      flushList();
      flushTable();

      // Collect consecutive blockquote lines
      const blockLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
        blockLines.push(lines[i].startsWith("> ") ? lines[i].slice(2) : "");
        i++;
      }
      i--; // Back up since the for loop will increment

      const firstLine = blockLines[0];

      // Detect callout type from first line
      let calloutType: "tip" | "warning" | "key" | "stat" | null = null;
      let markerLength = 0;

      if (firstLine.startsWith("\u{1F4A1}")) {
        calloutType = "tip";
        markerLength = "\u{1F4A1}".length;
      } else if (firstLine.startsWith("TIP:")) {
        calloutType = "tip";
        markerLength = 4;
      } else if (firstLine.startsWith("\u{26A0}\u{FE0F}")) {
        calloutType = "warning";
        markerLength = "\u{26A0}\u{FE0F}".length;
      } else if (firstLine.startsWith("WARNING:")) {
        calloutType = "warning";
        markerLength = 8;
      } else if (firstLine.startsWith("\u{1F4CC}")) {
        calloutType = "key";
        markerLength = "\u{1F4CC}".length;
      } else if (firstLine.startsWith("KEY:")) {
        calloutType = "key";
        markerLength = 4;
      } else if (firstLine.startsWith("\u{1F4CA}")) {
        calloutType = "stat";
        markerLength = "\u{1F4CA}".length;
      } else if (firstLine.startsWith("STAT:")) {
        calloutType = "stat";
        markerLength = 5;
      }

      if (calloutType) {
        // Strip marker from first line and join all lines
        blockLines[0] = firstLine.slice(markerLength).trimStart();
        const text = blockLines.join(" ").trim();
        elements.push(renderCallout(calloutType, text, key++));
      } else {
        // Regular blockquote (no recognized marker)
        const text = blockLines.join(" ").trim();
        elements.push(
          <blockquote
            key={key++}
            className="my-6 border-l-4 border-border pl-4 italic text-muted-foreground"
          >
            {parseInline(text)}
          </blockquote>
        );
      }
      continue;
    }

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
      const headerText = line.slice(3).trim();
      const headerId = headerText
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      elements.push(
        <h2 key={key++} id={headerId} className="text-xl font-bold mt-8 mb-4 scroll-mt-16">
          {headerText}
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
  const isEn = i18n.language?.startsWith("en") ?? false;

  const { article, isLoading } = useArticle(slug);
  const { prev, next } = useAdjacentArticles(slug);

  // Loading state
  if (isLoading) {
    return (
      <div className="py-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

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
        jsonLd={[
          {
            "@type": "Article",
            headline: title,
            description: truncatedDescription,
            author: { "@type": "Person", name: "Andrea Larboullet-Marin" },
            publisher: { "@type": "Organization", name: "Zoned", url: "https://zoned.run" },
            datePublished: "2026-03-01",
            dateModified: "2026-03-20",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("article.home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("article.learn"), item: "https://zoned.run/learn" },
              { "@type": "ListItem", position: 3, name: title },
            ],
          },
          ...(slug === "faq"
            ? [
                {
                  "@type": "FAQPage" as const,
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: t("pages.articleFaq.q1"),
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: t("pages.articleFaq.a1"),
                      },
                    },
                    {
                      "@type": "Question",
                      name: t("pages.articleFaq.q2"),
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: t("pages.articleFaq.a2"),
                      },
                    },
                    {
                      "@type": "Question",
                      name: t("pages.articleFaq.q3"),
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: t("pages.articleFaq.a3"),
                      },
                    },
                    {
                      "@type": "Question",
                      name: t("pages.articleFaq.q4"),
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: t("pages.articleFaq.a4"),
                      },
                    },
                    {
                      "@type": "Question",
                      name: t("pages.articleFaq.q5"),
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: t("pages.articleFaq.a5"),
                      },
                    },
                    {
                      "@type": "Question",
                      name: t("pages.articleFaq.q6"),
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: t("pages.articleFaq.a6"),
                      },
                    },
                    {
                      "@type": "Question",
                      name: t("pages.articleFaq.q7"),
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: t("pages.articleFaq.a7"),
                      },
                    },
                    {
                      "@type": "Question",
                      name: t("pages.articleFaq.q8"),
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: t("pages.articleFaq.a8"),
                      },
                    },
                    {
                      "@type": "Question",
                      name: t("pages.articleFaq.q9"),
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: t("pages.articleFaq.a9"),
                      },
                    },
                  ],
                },
              ]
            : []),
        ]}
      />
      <ReadingProgress />
      <div className="py-8 max-w-3xl mx-auto xl:max-w-5xl">
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
      <header className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <BookOpen className="size-4" />
          <span>{t(`learn.categories.${article.category}`)}</span>
          <span>-</span>
          <Clock className="size-3" />
          <span>{article.readTime} min {t("learn.readTime")}</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">{title}</h1>
        <p className="text-lg text-muted-foreground"><GlossaryLinkedText text={description} /></p>
      </header>

      {/* Mobile TOC */}
      <div className="xl:hidden">
        <TableOfContents content={content} />
      </div>

      {/* Content + Desktop TOC sidebar */}
      <div className="xl:flex xl:gap-10">
        <article className="prose prose-neutral dark:prose-invert max-w-3xl flex-1 min-w-0">
          {renderMarkdown(content)}
        </article>

        {/* Desktop sticky TOC */}
        <aside className="hidden xl:block w-56 shrink-0">
          <div className="sticky top-20">
            <TableOfContents content={content} />
          </div>
        </aside>
      </div>

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

      {/* Related Content */}
      <div className="mt-10 max-w-3xl">
        <RelatedContent source={{ type: "article", id: article.slug }} />
      </div>

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

import type { CSSProperties } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, ChevronLeft, ChevronRight, Home } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SEOHead } from "@/components/seo";
import { StatBlock } from "@/components/domain/StatBlock";
import { ZoneScale } from "@/components/visualization";
import { useArticle, useAdjacentArticles } from "@/hooks/useArticles";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { ReadingProgress } from "@/components/domain/ReadingProgress";
import { TableOfContents } from "@/components/domain/TableOfContents";
import { usePickLang, useIsEnglish } from "@/lib/i18n-utils";
import { RelatedContent } from "@/components/domain/RelatedContent";

/** The four kinds of pulled-out block an article can carry. */
type CalloutKind = "tip" | "warning" | "key" | "stat";
type CalloutLabels = Record<CalloutKind, string>;

/**
 * The article renderer.
 *
 * Handles the markdown-ish subset the article files actually use: headings,
 * bold, links, wiki-links, bullet and numbered lists, tables, rules, plain
 * blockquotes and the four marker-prefixed callouts. Everything it emits
 * carries a `.zn-prose__*` class — the reading treatment lives in
 * `src/styles/components/learn.css` and is shared with the guides.
 *
 * `labels` is passed in rather than translated here: this is a plain function,
 * not a component, so it has no hook of its own.
 */
function renderMarkdown(
  content: string,
  labels: CalloutLabels,
): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let inList = false;
  let listOrdered = false;
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (inList && listItems.length > 0) {
      const items = listItems.map((item, i) => (
        <li key={i}>{parseInline(item)}</li>
      ));
      elements.push(
        listOrdered ? (
          <ol key={key++} className="zn-prose__list" data-ordered="true">
            {items}
          </ol>
        ) : (
          <ul key={key++} className="zn-prose__list">
            {items}
          </ul>
        ),
      );
      listItems = [];
      inList = false;
      listOrdered = false;
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(2); // Skip header and separator
      elements.push(
        <div key={key++} className="zn-scroll-x">
          <table className="zn-prose__table">
            <thead>
              <tr>
                {header.map((cell, i) => (
                  <th key={i} scope="col">
                    {parseInline(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{parseInline(cell.trim())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      tableRows = [];
      inTable = false;
    }
  };

  const parseInline = (raw: string): React.ReactNode => {
    // A wiki-link names a glossary entry by its id. The id is not prose, so
    // the brackets come off and the hyphens become spaces — the auto-linker
    // then matches the phrase exactly as it does everywhere else, instead of
    // the reader being shown "[[seuil-lactique]]" mid-sentence.
    const text = raw.replace(/\[\[([^\]]+)\]\]/g, (_, id: string) =>
      id.replace(/-/g, " "),
    );

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
          <a key={partKey++} href={match[5]} className="zn-prose__link">
            {match[4]}
          </a>,
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

  /**
   * A pulled-out block. One treatment for the four kinds — two ink rules and a
   * mono label — because the label is the only thing that differs, and a
   * coloured panel per kind would spend four accents on a page allowed one.
   */
  const renderCallout = (
    kind: CalloutKind,
    text: string,
    calloutKey: number,
  ): React.ReactNode => (
    <aside key={calloutKey} className="zn-prose__callout" data-kind={kind}>
      <span className="zn-kicker zn-prose__callout-label">{labels[kind]}</span>
      <p className="zn-prose__callout-text">{parseInline(text)}</p>
    </aside>
  );

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
      let calloutType: CalloutKind | null = null;
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
          <blockquote key={key++} className="zn-prose__quote">
            {parseInline(text)}
          </blockquote>,
        );
      }
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      flushList();
      flushTable();
      elements.push(<hr key={key++} className="zn-prose__rule" />);
      continue;
    }

    // Table detection
    if (line.includes("|") && line.trim().startsWith("|")) {
      flushList();
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line.split("|").filter((c) => c.trim() !== ""));
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
        <h2 key={key++} id={headerId} className="zn-prose__h2">
          {headerText}
        </h2>,
      );
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={key++} className="zn-prose__h3">
          {line.slice(4)}
        </h3>,
      );
      continue;
    }

    // Bullet list
    if (line.trim().startsWith("- ")) {
      if (inList && listOrdered) flushList();
      inList = true;
      listOrdered = false;
      listItems.push(line.trim().slice(2));
      continue;
    }

    // Numbered list
    const numbered = line.trim().match(/^\d+\.\s(.*)$/);
    if (numbered) {
      if (inList && !listOrdered) flushList();
      inList = true;
      listOrdered = true;
      listItems.push(numbered[1]);
      continue;
    }

    // Empty line. A blank line between two items does NOT end the list — the
    // article files space their numbered steps out, and closing the list on
    // every gap turned one sequence of four steps into four one-item lists.
    if (line.trim() === "") {
      const next = lines.slice(i + 1).find((l) => l.trim() !== "");
      const continues =
        inList &&
        next !== undefined &&
        (listOrdered
          ? /^\d+\.\s/.test(next.trim())
          : next.trim().startsWith("- "));
      if (!continues) flushList();
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={key++} className="zn-prose__p">
        {parseInline(line)}
      </p>,
    );
  }

  flushList();
  flushTable();

  return elements;
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation(["content", "common"]);
  const pick = usePickLang();
  const isEn = useIsEnglish();

  const { article, isLoading, error } = useArticle(slug);
  const { prev, next } = useAdjacentArticles(slug);

  // Loading state
  if (isLoading) {
    return (
      <div className="zn-article">
        <div className="zn-article__loading">
          <Spinner size={22} label={t("content:article.loading")} />
        </div>
      </div>
    );
  }

  // The text did not arrive. Say so, say what is still reachable, and give the
  // way back — a redirect here would look like the article never existed.
  if (error) {
    return (
      <div className="zn-article">
        <div className="zn-article__head">
          <Alert
            kind="error"
            title={t("content:article.error.title")}
            action={
              <Button variant="outline" asChild>
                <Link to="/learn">{t("content:learn.backToHub")}</Link>
              </Button>
            }
          >
            {t("content:article.error.text")}
          </Alert>
        </div>
      </div>
    );
  }

  if (!article) {
    return <Navigate to="/learn" replace />;
  }

  const content = pick(article, "content");
  const title = pick(article, "title");
  const description = pick(article, "description");
  const truncatedDescription = description.length > 155 ? description.slice(0, 152) + "..." : description;

  // Build an ISO datetime from the article's YYYY-MM-DD metadata. We avoid
  // hardcoding dates so each article gets its own published_time / modified_time
  // in both OG meta and Article schema.
  const publishedAt = `${article.publishedAt}T08:00:00+01:00`;
  const updatedAt = `${article.updatedAt || article.publishedAt}T08:00:00+01:00`;

  const updatedLabel = new Date(updatedAt).toLocaleDateString(
    isEn ? "en-US" : "fr-FR",
    { year: "numeric", month: "long", day: "numeric" },
  );

  // Word count drives Article richness for Google. Strip markdown noise first.
  const wordCount = content
    .replace(/[#>*_`\-|]/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const calloutLabels: CalloutLabels = {
    tip: t("content:article.callout.tip"),
    warning: t("content:article.callout.warning"),
    key: t("content:article.callout.key"),
    stat: t("content:article.callout.stat"),
  };

  return (
    <>
      <SEOHead
        title={title}
        description={truncatedDescription}
        canonical={`/learn/${slug}`}
        ogType="article"
        article={{
          publishedTime: publishedAt,
          modifiedTime: updatedAt,
          author: "Andrea Larboullet-Marin",
          section: t(`content:learn.categories.${article.category}`),
          tags: [
            t(`content:learn.categories.${article.category}`),
            "course à pied",
            "running",
          ],
        }}
        jsonLd={[
          {
            "@type": "Article",
            headline: title,
            description: truncatedDescription,
            image: "https://zoned.run/og-image.png",
            author: {
              "@type": "Person",
              name: "Andrea Larboullet-Marin",
              url: "https://zoned.run/about",
            },
            publisher: {
              "@type": "Organization",
              name: "Zoned",
              url: "https://zoned.run",
              logo: {
                "@type": "ImageObject",
                url: "https://zoned.run/pwa-512x512.png",
                width: 512,
                height: 512,
              },
            },
            datePublished: publishedAt,
            dateModified: updatedAt,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://zoned.run/learn/${slug}`,
            },
            wordCount,
            timeRequired: `PT${article.readTime}M`,
            articleSection: t(`content:learn.categories.${article.category}`),
            inLanguage: pick(article, "title") === article.titleEn ? "en-US" : "fr-FR",
            isAccessibleForFree: true,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("content:article.home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("content:article.learn"), item: "https://zoned.run/learn" },
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

      <div className="zn-article">
        {/* 1 — where you are, what this is, and what it is called */}
        <section
          className="zn-stack zn-article__head"
          style={{ "--gap": "var(--sp-10)" } as CSSProperties}
        >
          <nav
            aria-label={t("content:article.breadcrumb")}
            className="zn-row zn-article__crumbs"
            style={{ "--gap": "var(--sp-4)" } as CSSProperties}
          >
            <Link
              to="/"
              aria-label={t("content:article.home")}
              className="zn-article__crumb"
            >
              <Home size={15} />
            </Link>
            <ChevronRight size={13} />
            <Link to="/learn" className="zn-body zn-body--sm zn-article__crumb">
              {t("content:learn.title")}
            </Link>
            <ChevronRight size={13} />
            <span
              className="zn-body zn-body--sm zn-fill zn-truncate"
              aria-current="page"
            >
              {title}
            </span>
          </nav>

          <div
            className="zn-cluster"
            style={{ "--gap": "var(--sp-6)" } as CSSProperties}
          >
            <Badge variant="outline">
              {t(`content:learn.categories.${article.category}`)}
            </Badge>
            <span className="zn-mono zn-article__meta">
              {t("content:article.updatedOn", { date: updatedLabel })}
            </span>
          </div>

          <h1 className="zn-display zn-article__title" data-level="2">
            {title}
          </h1>

          <p className="zn-body zn-body--lead zn-article__lede">
            <GlossaryLinkedText text={description} />
          </p>
        </section>

        {/* 2 — the reading column, and the rail that says how long and where.
            The rail is first in the DOM so it lands above the article on a
            phone and beside it on a desktop. */}
        <div
          className="zn-split zn-article__body"
          style={
            {
              "--split": "1fr 300px",
              "--gap": "var(--sp-18)",
            } as CSSProperties
          }
        >
          <aside
            className="zn-stack zn-article__rail"
            style={{ "--gap": "var(--sp-11)" } as CSSProperties}
          >
            <StatBlock
              tone="card"
              size="sm"
              value={`${article.readTime} ${t("common:units.minutes")}`}
              label={t("content:article.readTimeLabel")}
            />
            <TableOfContents content={content} />
          </aside>

          <article className="zn-prose zn-measure">
            {renderMarkdown(content, calloutLabels)}
          </article>
        </div>

        {/* 3 — the zones article ends on the scale it explained, and on the one
            filled action this screen spends */}
        {article.slug === "zones" && (
          <section
            className="zn-section zn-stack"
            style={{ "--gap": "var(--sp-11)" } as CSSProperties}
          >
            <ZoneScale />
            <p className="zn-body zn-measure">
              {t("content:learn.zonesCtaText")}
            </p>
            <Button asChild className="zn-article__cta">
              <Link to="/my-zones">{t("content:learn.zonesCtaButton")}</Link>
            </Button>
          </section>
        )}

        {/* 4 — what to read next. Related content, the two neighbours, the way
            back — one band, so an article with no neighbours never leaves a
            rule with nothing under it. */}
        <section
          className="zn-section zn-stack"
          style={{ "--gap": "var(--sp-15)" } as CSSProperties}
        >
          <RelatedContent source={{ type: "article", id: article.slug }} />

          {(prev || next) && (
            <nav
              className="zn-grid"
              aria-label={t("content:article.pager")}
              style={{ "--cols": 2 } as CSSProperties}
            >
              {prev && (
                <Link
                  to={`/learn/${prev.slug}`}
                  className="zn-article__navcard"
                  data-dir="prev"
                >
                  <span
                    className="zn-kicker zn-row zn-article__navdir"
                    style={{ "--gap": "var(--sp-3)" } as CSSProperties}
                  >
                    <ChevronLeft size={12} />
                    {t("content:learn.prevArticle")}
                  </span>
                  <span className="zn-article__navname">
                    {pick(prev, "title")}
                  </span>
                </Link>
              )}

              {next && (
                <Link
                  to={`/learn/${next.slug}`}
                  className="zn-article__navcard"
                  data-dir="next"
                >
                  <span
                    className="zn-kicker zn-row zn-article__navdir"
                    style={{ "--gap": "var(--sp-3)" } as CSSProperties}
                  >
                    {t("content:learn.nextArticle")}
                    <ChevronRight size={12} />
                  </span>
                  <span className="zn-article__navname">
                    {pick(next, "title")}
                  </span>
                </Link>
              )}
            </nav>
          )}

          <Button variant="outline" asChild className="zn-article__cta">
            <Link to="/learn">
              <BookOpen size={16} />
              {t("content:learn.backToHub")}
            </Link>
          </Button>
        </section>
      </div>
    </>
  );
}

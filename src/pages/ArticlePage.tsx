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
              { "@type": "ListItem", position: 1, name: isEn ? "Home" : "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: isEn ? "Learn" : "Apprendre", item: "https://zoned.run/learn" },
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
                      name: isEn
                        ? "My watch shows Zone 4 but I feel like I'm in Zone 2. Who should I trust?"
                        : "Ma montre indique Zone 4 mais je me sens en Zone 2. Qui croire ?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: isEn
                          ? "Trust your sensations. Heart rate can be skewed by heat, stress, fatigue, caffeine, and sensor position. The golden rule for Zone 2: if you can hold a normal conversation without effort, you're in the right zone regardless of what your watch displays."
                          : "Faites confiance à vos sensations. La fréquence cardiaque peut être faussée par la chaleur, le stress, la fatigue, la caféine et la position du capteur. La règle d'or pour la Zone 2 : si vous pouvez tenir une conversation normale sans effort, vous êtes dans la bonne zone, peu importe ce qu'affiche votre montre.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: isEn
                        ? "Should I stay exactly in my zone?"
                        : "Dois-je rester exactement dans ma zone ?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: isEn
                          ? "No, zones are indicative ranges, not beat-precise targets. Being 3-5 bpm above or below the limit has no significant physiological importance. What matters is respecting the session's objective."
                          : "Non, les zones sont des plages indicatives, pas des cibles au battement près. Être à 3-5 bpm au-dessus ou en-dessous de la limite n'a aucune importance physiologique significative. Ce qui compte, c'est de respecter l'objectif de la séance.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: isEn
                        ? "How many times per week should I run?"
                        : "Combien de fois par semaine dois-je courir ?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: isEn
                          ? "Beginners (< 1 year): 2-3 outings per week. Regular runners: 3-5 outings covering most goals from 10K to marathon, alternating hard and easy days. Advanced runners: 5-7 outings, sometimes doubles, requiring years of gradual progression."
                          : "Débutants (< 1 an) : 2-3 sorties par semaine. Coureurs réguliers : 3-5 sorties couvrent la plupart des objectifs du 10 km au marathon, en alternant jours durs et faciles. Coureurs avancés : 5-7 sorties, parfois en biquotidien, nécessitant des années de progression graduelle.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: isEn
                        ? "Is the 10% rule a myth or reality?"
                        : "La règle des 10%, c'est un mythe ou une réalité ?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: isEn
                          ? "The 10% rule (don't increase weekly volume by more than 10%) is a useful guardrail, not an absolute physiological law. It forces progressivity, but doesn't account for training history. Use it as a guiding principle, not a rigid rule."
                          : "La règle des 10% (ne pas augmenter le volume hebdomadaire de plus de 10%) est un garde-fou utile, pas une loi physiologique absolue. Elle force la progressivité mais ne tient pas compte de l'historique. Utilisez-la comme principe directeur, pas comme règle rigide.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: isEn
                        ? "When will I see progress?"
                        : "Quand vais-je voir des progrès ?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: isEn
                          ? "First cardiovascular changes appear as early as 2-3 weeks of regular training. Measurable progress on a test or race generally arrives after 6-12 weeks of consistent work. Patience is crucial - changing programs every 3 weeks never lets adaptations settle."
                          : "Les premiers changements cardiovasculaires apparaissent dès 2-3 semaines d'entraînement régulier. Les progrès mesurables sur un test ou une course arrivent généralement après 6-12 semaines de travail cohérent. La patience est cruciale - changer de programme toutes les 3 semaines ne laisse jamais le temps aux adaptations de s'installer.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: isEn
                        ? "I'm in pain during the run. Continue or stop?"
                        : "J'ai mal pendant la course. Je continue ou j'arrête ?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: isEn
                          ? "Distinguish discomfort from pain. Discomfort (heaviness, slight stiffness, soreness) is often normal and usually passes after 10-15 minutes. Pain (sharp, localized, increasing or causing limping): stop immediately. When in doubt, a session missed out of caution is always preferable to weeks of forced rest."
                          : "Distinguez l'inconfort de la douleur. L'inconfort (lourdeur, légère raideur, courbatures) est souvent normal et passe généralement après 10-15 minutes. La douleur (aiguë, localisée, qui augmente ou fait boiter) : arrêtez immédiatement. Dans le doute, une séance manquée par prudence est toujours préférable à des semaines d'arrêt forcé.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: isEn
                        ? "How do I prevent running injuries?"
                        : "Comment éviter les blessures ?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: isEn
                          ? "Progress gradually (most injuries come from increasing volume or intensity too quickly). Vary stimuli (different terrains, shoes in rotation, different paces). Do strength training 15-20 minutes twice a week for hamstrings, quads, calves and glutes. Listen to warning signals early."
                          : "Progresser graduellement (la majorité des blessures viennent d'un volume ou intensité augmentés trop vite). Varier les stimuli (terrains, chaussures en rotation, allures différentes). Faire du renforcement musculaire 15-20 min 2 fois par semaine pour ischio-jambiers, quadriceps, mollets et fessiers. Écouter les signaux d'alerte tôt.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: isEn
                        ? "Morning or evening, what's better for running?"
                        : "Matin ou soir, qu'est-ce qui est mieux ?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: isEn
                          ? "Physiologically, evening has a slight advantage: higher body temperature, more mobile joints, better reaction time. But the best time is when you actually run. Consistency beats theoretical optimization."
                          : "Physiologiquement, le soir a un léger avantage : température corporelle plus élevée, articulations plus mobiles, meilleur temps de réaction. Mais le meilleur moment est celui où vous courez réellement. La constance bat l'optimisation théorique.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: isEn
                        ? "Can I run every day?"
                        : "Puis-je courir tous les jours ?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: isEn
                          ? "It's possible but with precautions: alternate easy and hard days, keep at least 1-2 days per week very light or cross-training (cycling, swimming), and listen to your body. Many runners thrive with 5-6 days per week and 1-2 days of complete rest. Rest is part of training."
                          : "C'est possible mais avec des précautions : alterner impérativement jours faciles et durs, garder au moins 1-2 jours par semaine très légers ou en cross-training (vélo, natation), et écouter son corps. Beaucoup de coureurs prospèrent avec 5-6 jours par semaine et 1-2 jours de repos complet. Le repos fait partie de l'entraînement.",
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

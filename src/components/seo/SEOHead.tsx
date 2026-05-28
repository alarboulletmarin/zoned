import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const SITE_URL = "https://zoned.run";
const SITE_NAME = "Zoned";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const TWITTER_HANDLE = "@zoned_run";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Article-specific metadata. Improves rich-snippet quality on /learn pages. */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

/**
 * SEOHead renders document metadata using React 19's native auto-hoisting:
 * <title>, <meta>, <link>, and <script> rendered anywhere in the tree get
 * lifted into <head>. The big win vs react-helmet-async is that the tags
 * are part of the JSX tree from the very first render, so:
 *   - The prerender pass captures them in page.content() without timing
 *     hacks (no useEffect race).
 *   - Crawlers that execute JS see the real metadata immediately.
 *   - StrictMode double-renders no longer create duplicate/missing tags.
 *
 * The only thing we still touch imperatively is <html lang>, since that
 * attribute can't be expressed as a hoistable head tag.
 */
export function SEOHead({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noindex = false,
  jsonLd,
  article,
}: SEOHeadProps) {
  const { i18n } = useTranslation();
  const rawLang = i18n.language || "fr";
  const isEn = rawLang.startsWith("en");
  const lang = isEn ? "en" : "fr";

  // <html lang> can't be hoisted, so we set it imperatively.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — ${isEn ? "Science-Based Running Workouts" : "Séances de course scientifiques par zones"}`;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
  const locale = isEn ? "en_US" : "fr_FR";
  const altLocale = isEn ? "fr_FR" : "en_US";
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;
  const desc = description ?? "";

  // Site-wide JSON-LD (WebSite + Organization). Every page gets these for
  // free; route-specific schemas (Article, ExercisePlan, HowTo, etc.) layer
  // on top via the `jsonLd` prop.
  const baseLd: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: ["fr-FR", "en-US"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/library?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/pwa-512x512.png`,
      founder: { "@type": "Person", name: "Andrea Larboullet-Marin" },
      sameAs: ["https://github.com/alarboulletmarin/zoned"],
    },
  ];

  const pageLd = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const allLd = [...baseLd, ...pageLd];

  const baseLoc = canonical || "/";

  return (
    <>
      {/* Primary --------------------------------------------------------- */}
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="author" content="Andrea Larboullet-Marin" />
      <meta name="publisher" content={SITE_NAME} />
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        }
      />
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang -------------------------------------------------------- */}
      <link rel="alternate" hrefLang="fr-FR" href={`${SITE_URL}${baseLoc}`} />
      <link rel="alternate" hrefLang="en-US" href={`${SITE_URL}${baseLoc}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${baseLoc}`} />

      {/* Open Graph ------------------------------------------------------ */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content={altLocale} />

      {/* Article-specific OG -------------------------------------------- */}
      {ogType === "article" && article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {ogType === "article" && article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {ogType === "article" && article?.author && (
        <meta property="article:author" content={article.author} />
      )}
      {ogType === "article" && article?.section && (
        <meta property="article:section" content={article.section} />
      )}
      {ogType === "article" &&
        article?.tags?.map((tag) => (
          <meta key={`tag-${tag}`} property="article:tag" content={tag} />
        ))}

      {/* Twitter Card --------------------------------------------------- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* JSON-LD -------------------------------------------------------- */}
      {allLd.map((ld, i) => (
        <script
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ "@context": "https://schema.org", ...ld }),
          }}
        />
      ))}
    </>
  );
}

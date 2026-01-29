import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const SITE_URL = "https://zoned.run";
const SITE_NAME = "Zoned";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

export function SEOHead({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noindex = false,
  jsonLd,
}: SEOHeadProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Language */}
      <html lang={lang} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={lang === "fr" ? "fr_FR" : "en_US"} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* Alternate Languages */}
      <link rel="alternate" hrefLang="fr" href={`${SITE_URL}${canonical || "/"}`} />
      <link rel="alternate" hrefLang="en" href={`${SITE_URL}${canonical || "/"}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${canonical || "/"}`} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            ...jsonLd,
          })}
        </script>
      )}
    </Helmet>
  );
}

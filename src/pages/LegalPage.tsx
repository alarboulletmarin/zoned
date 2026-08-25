// src/pages/LegalPage.tsx
// /legal — privacy policy and legal notice, the two documents French law
// expects a published site to carry.
//
// Why a page of its own rather than a section of /about: AboutPage is the
// editorial pitch (counters, bio, ko-fi) and legal prose has no business
// competing with it, but mostly because these two documents need a stable
// address that can be cited from a form, a store listing or a mail. They
// share one route because they answer the same question — who is behind this
// and what does it do with my data — and splitting them would have made two
// screens that differ by a heading.
//
// The copy lives in the `content` namespace, which is lazy-loaded, so several
// kilobytes of prose that nobody reads twice stay out of the entry chunk.

import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { PageContainer } from "@/components/layout/PageContainer";

/** One heading, then one paragraph per `body` entry. No formatting: prose. */
interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalPage() {
  const { t } = useTranslation("content");

  const documents = (["privacy", "notice"] as const).map((key) => ({
    key,
    title: t(`content:legal.${key}.title`),
    intro: t(`content:legal.${key}.intro`),
    sections: t(`content:legal.${key}.sections`, {
      returnObjects: true,
    }) as LegalSection[],
  }));

  return (
    <>
      <SEOHead
        title={t("content:legal.title")}
        description={t("content:legal.seoDescription")}
        canonical="/legal"
        jsonLd={[
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("content:article.home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("content:legal.title") },
            ],
          },
        ]}
      />

      <PageContainer width="narrow" className="py-10 md:py-14">
        <header>
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-accent-acid">
            {t("content:legal.eyebrow")}
          </p>
          <EditorialTitle as="h1" size="xl" className="mt-4 !leading-[1.1]">
            {t("content:legal.title")}
          </EditorialTitle>
          <FadeUp
            as="p"
            delay={0.1}
            className="mt-4 max-w-[62ch] text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            {t("content:legal.description")}
          </FadeUp>
          <p className="mt-5 font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
            {t("content:legal.updatedLabel")} · {t("content:legal.updated")}
          </p>
        </header>

        {documents.map((doc) => (
          <section key={doc.key} className="mt-12 md:mt-16" aria-labelledby={`legal-${doc.key}`}>
            <h2
              id={`legal-${doc.key}`}
              className="border-t-2 border-foreground pt-4 font-sans text-2xl md:text-3xl font-bold uppercase leading-[0.95] tracking-tight"
            >
              {doc.title}
            </h2>
            <p className="mt-4 max-w-[62ch] text-muted-foreground leading-relaxed">
              {doc.intro}
            </p>

            <div className="mt-8 space-y-8">
              {doc.sections.map((section) => (
                <article key={section.heading} className="border-t border-filet pt-5">
                  <h3 className="font-bold uppercase tracking-tight">{section.heading}</h3>
                  <div className="mt-2.5 space-y-3">
                    {section.body.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="max-w-[68ch] text-sm md:text-[15px] text-muted-foreground leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </PageContainer>
    </>
  );
}

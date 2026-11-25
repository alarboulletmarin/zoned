import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { AGENT_API_BASE, PLAN_IMPORT_PATH, SITE_URL } from "@/lib/agentApi/constants";
import { IMPORT_PARAMS, exampleImportParams, planImportParamsUrl } from "@/lib/agentApi/importParams";
import { isoDateOnly } from "@/lib/planDates";
import { isServerSnapshot } from "@/prerender/snapshot";

// Build day, injected by Vite in both the client and the prerender bundle
// (vite.config.ts, vite.ssr.config.ts), so the example links in the static
// HTML and in the first client render carry the same date.
declare const __BUILD_DAY__: string | undefined;
const BUILD_DAY = typeof __BUILD_DAY__ === "string" && __BUILD_DAY__.length > 0 ? __BUILD_DAY__ : undefined;

const CONTRACT_URL = "https://github.com/alarboulletmarin/zoned/blob/develop/docs/agent-api.md";

/**
 * `/agents`, the page an AI assistant reads to hand a plan back to Zoned.
 *
 * Prerendered, so a browsing tool that never runs JavaScript, or that only
 * opens pages a link pointed it to (the footer does), still reads every
 * instruction and every example. The same contract as llms.txt, from the
 * same module: the parameter table is `IMPORT_PARAMS`, the examples are
 * `exampleImportParams`, which the build validates. Contract:
 * docs/agent-api.md.
 */
export function AgentsPage() {
  const { t, i18n } = useTranslation(["content", "common"]);
  const lang = i18n.language?.startsWith("en") ? "en" : "fr";

  // The examples must stay valid in a browser that keeps the page open for
  // months: the static HTML uses the build day, the client moves to today.
  const [today, setToday] = useState(() => (isServerSnapshot() && BUILD_DAY) || isoDateOnly(new Date()));
  useEffect(() => {
    setToday(isoDateOnly(new Date()));
  }, []);

  const examples = exampleImportParams(today);
  const minimal = planImportParamsUrl(examples.minimal, lang);
  const full = planImportParamsUrl(examples.full, lang);
  const english = planImportParamsUrl(examples.minimal, "en");
  const template = `${SITE_URL}${PLAN_IMPORT_PATH}#distance=10K&date=YYYY-MM-DD&days=3&time=1:10:00`;

  const resources: { href: string; label: string; text: string }[] = [
    { href: "/llms.txt", label: "llms.txt", text: t("agentsPage.resLlms") },
    { href: "/llms-full.txt", label: "llms-full.txt", text: t("agentsPage.resLlmsFull") },
    { href: `${AGENT_API_BASE}/index.json`, label: "api/v1/index.json", text: t("agentsPage.resIndex") },
    { href: `${AGENT_API_BASE}/workouts.json`, label: "api/v1/workouts.json", text: t("agentsPage.resWorkouts") },
    {
      href: `${AGENT_API_BASE}/schema/plan-import.schema.json`,
      label: "plan-import.schema.json",
      text: t("agentsPage.resSchema"),
    },
    { href: CONTRACT_URL, label: "docs/agent-api.md", text: t("agentsPage.resContract") },
  ];

  const codeLink = (url: string) => (
    <p className="zn-agents__code">
      <a href={url}>{url}</a>
    </p>
  );

  return (
    <>
      <SEOHead
        title={t("agentsPage.seoTitle")}
        description={t("agentsPage.seoDescription")}
        canonical="/agents"
        jsonLd={[
          {
            "@type": "TechArticle",
            headline: t("agentsPage.title"),
            description: t("agentsPage.seoDescription"),
            url: `${SITE_URL}/agents`,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("common:nav.home"), item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: t("agentsPage.seoTitle") },
            ],
          },
        ]}
      />

      <div className="zn-agents">
        <section className="zn-section">
          <div className="zn-stack" style={{ "--gap": "var(--sp-10)" } as CSSProperties}>
            <span className="zn-kicker">{t("agentsPage.kicker")}</span>
            <h1 className="zn-display" data-level="2">
              {t("agentsPage.title")}
            </h1>
            <p className="zn-body zn-body--lead zn-measure">{t("agentsPage.lead")}</p>
            <p className="zn-caption">
              {/* A plain anchor: the other language is another prerendered file. */}
              <a className="zn-inline-link" href={lang === "en" ? "/agents" : "/agents?lang=en"}>
                {t("agentsPage.englishLink")}
              </a>
            </p>
          </div>
        </section>

        <section className="zn-section">
          <article className="zn-prose zn-agents__body">
            <aside className="zn-prose__callout" data-kind="warning">
              <span className="zn-kicker zn-prose__callout-label">{t("agentsPage.directiveLabel")}</span>
              <p className="zn-prose__p">
                <strong>{t("agentsPage.directive")}</strong>
              </p>
            </aside>

            <h2 className="zn-prose__h2">{t("agentsPage.pathsTitle")}</h2>
            <p className="zn-prose__p">{t("agentsPage.pathsText")}</p>

            <h2 className="zn-prose__h2">{t("agentsPage.standardTitle")}</h2>
            <ol className="zn-prose__list" data-ordered="true">
              <li>{t("agentsPage.step1")}</li>
              <li>{t("agentsPage.step2")}</li>
              <li>{t("agentsPage.step3")}</li>
            </ol>
            <p className="zn-prose__p">{t("agentsPage.templateLabel")}</p>
            <p className="zn-agents__code">{template}</p>

            <h3 className="zn-prose__h3">{t("agentsPage.examplesTitle")}</h3>
            <p className="zn-prose__p">{t("agentsPage.exampleMinimal")}</p>
            {codeLink(minimal)}
            <p className="zn-prose__p">{t("agentsPage.exampleFull")}</p>
            {codeLink(full)}
            {lang === "fr" && (
              <>
                <p className="zn-prose__p">{t("agentsPage.exampleEnglish")}</p>
                {codeLink(english)}
              </>
            )}

            <h3 className="zn-prose__h3" id="parametres">
              {t("agentsPage.paramsTitle")}
            </h3>
            <p className="zn-prose__p">{t("agentsPage.paramsLead")}</p>
            <div className="zn-agents__scroll">
              <table className="zn-prose__table">
                <thead>
                  <tr>
                    <th scope="col">{t("agentsPage.colParam")}</th>
                    <th scope="col">{t("agentsPage.colValue")}</th>
                    <th scope="col">{t("agentsPage.colNote")}</th>
                  </tr>
                </thead>
                <tbody>
                  {IMPORT_PARAMS.map((p) => (
                    <tr key={p.key}>
                      <td>{p.key}</td>
                      <td>
                        <span className="zn-agents__term">{p.format}</span>
                        {p.required
                          ? ` · ${t("agentsPage.required")}`
                          : p.default
                            ? ` · ${t("agentsPage.defaultValue", { value: p.default })}`
                            : ""}
                      </td>
                      <td>{lang === "en" ? p.note : p.noteFr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="zn-prose__h3">{t("agentsPage.errorsTitle")}</h3>
            <p className="zn-prose__p">{t("agentsPage.errorsText")}</p>

            <h2 className="zn-prose__h2">{t("agentsPage.customTitle")}</h2>
            <p className="zn-prose__p">{t("agentsPage.customText")}</p>
            <p className="zn-agents__code">{`${SITE_URL}${PLAN_IMPORT_PATH}#d=<base64url JSON>`}</p>

            <h2 className="zn-prose__h2">{t("agentsPage.resourcesTitle")}</h2>
            <ul className="zn-prose__list">
              {resources.map((r) => (
                <li key={r.href}>
                  {/* Plain anchors: static files the router must not catch. */}
                  <a className="zn-prose__link" href={r.href}>
                    {r.label}
                  </a>
                  {`, ${r.text}`}
                </li>
              ))}
            </ul>

            <h2 className="zn-prose__h2">{t("agentsPage.privacyTitle")}</h2>
            <p className="zn-prose__p">{t("agentsPage.privacyText")}</p>
          </article>
        </section>
      </div>
    </>
  );
}

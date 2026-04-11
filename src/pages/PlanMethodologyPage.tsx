import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePickLang } from "@/lib/i18n-utils";
import { Link } from "react-router-dom";
import {
  FlaskConical,
  ChevronDown,
  BookOpen,
  Activity,
  TrendingUp,
  Dumbbell,
  Timer,
  Calendar,
  Route,
  RefreshCw,
  ArrowRight,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { PLAN_PRINCIPLES } from "@/data/plan-methodology";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Icon resolver -- maps icon string name to component
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  Calendar,
  Activity,
  RefreshCw,
  TrendingUp,
  Route,
  Dumbbell,
  Timer,
};

function PrincipleIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Activity;
  return <Icon className={className} />;
}

// ---------------------------------------------------------------------------
// Color palette for principle cards (cycling through)
// ---------------------------------------------------------------------------

const CARD_COLORS = [
  { bg: "bg-blue-500/10", text: "text-blue-500" },
  { bg: "bg-orange-500/10", text: "text-orange-500" },
  { bg: "bg-green-500/10", text: "text-green-500" },
  { bg: "bg-purple-500/10", text: "text-purple-500" },
  { bg: "bg-amber-500/10", text: "text-amber-500" },
  { bg: "bg-rose-500/10", text: "text-rose-500" },
  { bg: "bg-teal-500/10", text: "text-teal-500" },
];

// ---------------------------------------------------------------------------
// Scientific references for the bottom section
// ---------------------------------------------------------------------------

interface Reference {
  author: string;
  year: number;
  title: string;
  journal?: string;
  link?: string;
}

const SCIENTIFIC_REFERENCES: Reference[] = [
  {
    author: "Daniels, J.",
    year: 2014,
    title: "Daniels' Running Formula",
    journal: "Human Kinetics, 3rd ed.",
  },
  {
    author: "Pfitzinger, P. & Douglas, S.",
    year: 2009,
    title: "Advanced Marathoning",
    journal: "Human Kinetics, 2nd ed.",
  },
  {
    author: "Mujika, I. & Padilla, S.",
    year: 2003,
    title: "Scientific bases for precompetition tapering strategies",
    journal: "Med Sci Sports Exerc 35(7):1182-1187",
    link: "https://pubmed.ncbi.nlm.nih.gov/12840639/",
  },
  {
    author: "Seiler, S.",
    year: 2010,
    title: "What is best practice for training intensity and duration distribution in endurance athletes?",
    journal: "Int J Sports Physiol Perform 5(3):276-291",
    link: "https://pubmed.ncbi.nlm.nih.gov/20861519/",
  },
  {
    author: "Gabbett, T.",
    year: 2016,
    title: "The training-injury prevention paradox: should athletes be training smarter and harder?",
    journal: "Br J Sports Med 50(5):273-280",
    link: "https://pubmed.ncbi.nlm.nih.gov/26758673/",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlanMethodologyPage() {
  const { t } = useTranslation("common");
  const pick = usePickLang();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleCard(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <SEOHead
        title={t("planMethodology.title")}
        description={t("planMethodology.seoDescription")}
        canonical="/plans/methodology"
        jsonLd={{
          "@type": "WebPage",
          name: t("planMethodology.title"),
          url: "https://zoned.run/plans/methodology",
          description: t("planMethodology.seoDescription"),
        }}
      />

      <div className="py-8 space-y-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <FlaskConical className="size-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">
            {t("planMethodology.heading")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("planMethodology.intro")}
          </p>
        </div>

        {/* Intro paragraph */}
        <section className="space-y-3">
          <div className="text-muted-foreground space-y-3 pl-0">
            <GlossaryLinkedText
              as="p"
              text={t("planMethodology.introText")}
            />
            <GlossaryLinkedText
              as="p"
              className="text-sm italic border-l-2 border-primary/30 pl-4"
              text={t("planMethodology.introDisclaimer")}
            />
          </div>
        </section>

        {/* Principles cards */}
        <section className="space-y-4">
          {PLAN_PRINCIPLES.map((principle, index) => {
            const isExpanded = expandedId === principle.id;
            const color = CARD_COLORS[index % CARD_COLORS.length];

            return (
              <Card
                key={principle.id}
                className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent transition-shadow hover:shadow-md"
              >
                <CardHeader
                  className="cursor-pointer select-none"
                  onClick={() => toggleCard(principle.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-lg shrink-0", color.bg)}>
                      <PrincipleIcon
                        name={principle.icon}
                        className={cn("size-5", color.text)}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-lg">
                          {pick(principle, "title")}
                        </CardTitle>
                        <ChevronDown
                          className={cn(
                            "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                      <CardDescription className="text-sm">
                        <GlossaryLinkedText
                          text={pick(principle, "summary")}
                        />
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 space-y-5">
                    {/* Details */}
                    <div className="pl-12">
                      <GlossaryLinkedText
                        as="p"
                        className="text-sm text-muted-foreground leading-relaxed"
                        text={pick(principle, "details")}
                      />
                    </div>

                    {/* Rules */}
                    <ul className="pl-12 space-y-1.5">
                      {principle.rules.map((rule, ruleIndex) => (
                        <li
                          key={ruleIndex}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                          <span className="text-muted-foreground">
                            {pick(rule, "text")}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* References */}
                    {principle.references && principle.references.length > 0 && (
                      <div className="pl-12 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Sources
                        </p>
                        <ul className="space-y-0.5">
                          {principle.references.map((ref, refIndex) => (
                            <li
                              key={refIndex}
                              className="text-xs text-muted-foreground"
                            >
                              {ref.author} ({ref.year}). <span className="italic">{ref.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Related article link */}
                    {principle.relatedArticle && (
                      <div className="pl-12">
                        <Link
                          to={`/learn/${principle.relatedArticle}`}
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          {t("planMethodology.learnMore")}
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </section>

        {/* Bottom references section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <BookOpen className="size-5 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold">
              {t("planMethodology.scientificReferences")}
            </h2>
          </div>

          <div className="space-y-3">
            {SCIENTIFIC_REFERENCES.map((ref, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/50 bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent p-4 flex flex-col sm:flex-row sm:items-start gap-3"
              >
                <span className="shrink-0 inline-flex items-center justify-center size-8 rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                  {ref.year}
                </span>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium text-sm">{ref.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {ref.author}
                    {ref.journal && <> &mdash; {ref.journal}</>}
                  </p>
                  {ref.link && (
                    <a
                      href={ref.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {t("planMethodology.viewStudy")}
                      <ArrowRight className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

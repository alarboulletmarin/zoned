import type { CSSProperties } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Footprints,
  Leaf,
  Shield,
  RefreshCw,
  Flag,
  Star,
  Target,
  Route,
  Mountain,
  Rocket,
  Dumbbell,
  HeartPulse,
  Library,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { SEOHead } from "@/components/seo";
import { WorkoutCard } from "@/components/domain";
import { ZoneScale } from "@/components/visualization";
import { useCollection, useCollections } from "@/hooks/useCollections";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { usePickLang } from "@/lib/i18n-utils";

/** Map collection icon strings to actual icon components (same as CollectionCard) */
const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  Footprints,
  Leaf,
  Shield,
  RefreshCw,
  Flag,
  Star,
  Target,
  Route,
  Mountain,
  Rocket,
  Dumbbell,
  HeartPulse,
};

export function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation("common");
  const pickLang = usePickLang();

  const { collection, workouts, isLoading } = useCollection(slug);
  const allCollections = useCollections();

  // 404 state — the address matches nothing, so say how many parcours exist
  // and hand back the index that lists them.
  if (!collection) {
    return (
      <div className="zn-disc">
        <section className="zn-disc__head">
          <EmptyState
            variant="no-results"
            icon={Library}
            title={t("collectionsDetail.collectionNotFound")}
            description={t("collectionsDetail.notFoundDescription", {
              count: allCollections.length,
            })}
            action={
              <Button variant="outline" asChild>
                <Link to="/collections">
                  <ArrowLeft size={16} />
                  {t("collections.backToCollections")}
                </Link>
              </Button>
            }
          />
        </section>
      </div>
    );
  }

  const Icon = ICON_MAP[collection.icon] ?? Target;
  const name = pickLang(collection, "name");
  const description = pickLang(collection, "description");
  const workoutCount = collection.workoutIds.length;
  const kind = collection.isProgression
    ? t("collections.progression")
    : t("collections.freeSelection");

  return (
    <>
      <SEOHead
        title={name}
        description={description.slice(0, 155)}
        canonical={`/collections/${collection.slug}`}
        jsonLd={[
          {
            "@type": "ItemList",
            name,
            description: description.slice(0, 155),
            url: `https://zoned.run/collections/${collection.slug}`,
            numberOfItems: workouts.length,
            itemListElement: workouts.map((w, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: pickLang(w, "name"),
              url: `https://zoned.run/workout/${w.id}`,
            })),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Collections", item: "https://zoned.run/collections" },
              { "@type": "ListItem", position: 3, name },
            ],
          },
        ]}
      />

      <div className="zn-disc">
        {/* 1 — the parcours, named and counted, with the way back */}
        <section
          className="zn-disc__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <Button variant="link" asChild>
            <Link to="/collections">
              <ArrowLeft size={16} />
              {t("collections.backToCollections")}
            </Link>
          </Button>

          <span className="zn-kicker">
            {t("collectionsDetail.kicker", { count: workoutCount, kind })}
          </span>
          <h1 className="zn-display" data-level="2">
            {name}
          </h1>
        </section>

        {/* 2 — what the parcours is for */}
        <section className="zn-disc__group">
          <div className="zn-coll__hero">
            <div className="zn-coll__glyph" aria-hidden="true">
              <Icon />
            </div>
            <p className="zn-body zn-body--lead zn-coll__heroinner">
              <GlossaryLinkedText text={description} />
            </p>
            <p className="zn-mono zn-faint">
              {t("collections.workoutCount", { count: workoutCount })} · {kind}
            </p>
          </div>
        </section>

        {/* 3 — the ink ramp orders the zones, it does not name them */}
        {workouts.length > 0 && (
          <div className="zn-disc__legend">
            <ZoneScale />
          </div>
        )}

        {/* 4 — the sessions, in the order the parcours states */}
        <section className="zn-disc__results" aria-busy={isLoading}>
          {isLoading ? (
            <div className="zn-disc__wait">
              <Spinner size={22} label={t("status.loading")} />
            </div>
          ) : workouts.length > 0 ? (
            <div
              className="zn-grid"
              style={{ "--gap": "var(--sp-13)" } as CSSProperties}
            >
              {workouts.map((workout, index) => (
                <div key={workout.id} className="zn-coll__item">
                  {collection.isProgression && (
                    <span
                      className="zn-coll__step"
                      aria-label={t("collections.step", { number: index + 1 })}
                    >
                      {index + 1}
                    </span>
                  )}
                  <WorkoutCard workout={workout} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              variant="no-results"
              icon={Library}
              title={t("collectionsDetail.noWorkoutsTitle")}
              description={t("collectionsDetail.noWorkoutsDescription", {
                count: workoutCount,
              })}
              action={
                <Button variant="outline" asChild>
                  <Link to="/collections">
                    <ArrowLeft size={16} />
                    {t("collections.backToCollections")}
                  </Link>
                </Button>
              }
            />
          )}
        </section>
      </div>
    </>
  );
}

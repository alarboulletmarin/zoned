import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllTermsSync } from "@/data/glossary";
import { getWorkoutByIdSync } from "@/data/workouts";
import { getDominantZone, getWorkoutDiscipline, isRunningWorkout, isStrengthWorkout } from "@/types";
import { linksFor, type HubLang, type LinkSource } from "@/lib/seo/hub-links";
import { preloadRoute } from "@/prerender/preload";
import { HubLinks } from "./HubLinks";

function sourceFor(pathname: string): LinkSource | null {
  const path = pathname.replace(/\/$/, "") || "/";

  const workoutId = path.match(/^\/workout\/([^/]+)$/)?.[1];
  if (workoutId) {
    const id = decodeURIComponent(workoutId);
    const workout = getWorkoutByIdSync(id);
    if (workout && isStrengthWorkout(workout)) {
      return { kind: "workout", id: workout.id, discipline: "strength" };
    }
    if (workout && isRunningWorkout(workout)) {
      const hasZones = Boolean(workout.mainSetTemplate?.length || workout.mainSetStructure?.length);
      return {
        kind: "workout",
        id: workout.id,
        category: workout.category,
        zone: hasZones ? getDominantZone(workout) : null,
        discipline: getWorkoutDiscipline(workout),
      };
    }
    return { kind: "workout", id };
  }

  const glossaryId = path.match(/^\/glossary\/([^/]+)$/)?.[1];
  if (glossaryId) {
    const id = decodeURIComponent(glossaryId);
    const term = getAllTermsSync().find((item) => item.id === id);
    return { kind: "glossary", id, category: term?.category, zone: term?.zone ?? null };
  }

  const article = path.match(/^\/learn\/([^/]+)$/)?.[1];
  if (article) return { kind: "article", id: decodeURIComponent(article) };

  if (path === "/calculators" || path.startsWith("/calculators/")) {
    return { kind: "calculator", id: path };
  }

  if (
    path === "/guides" ||
    path.startsWith("/guides/") ||
    path === "/nutrition" ||
    path === "/race-simulator" ||
    path === "/compare" ||
    path.startsWith("/compare/") ||
    path === "/plan/new" ||
    path === "/plan/new/prebuilt" ||
    path === "/plans/methodology" ||
    path === "/learn"
  ) {
    return { kind: "page", id: path };
  }

  return null;
}

/**
 * Maillage sous les pages publiques. Au prerendu le cache est deja chaud,
 * donc les liens sont dans le HTML. Apres une navigation client, on recharge
 * le catalogue puis on recalcule.
 */
export function RouteHubLinks() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation("common");
  const lang: HubLang = i18n.language?.startsWith("en") ? "en" : "fr";
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!sourceFor(pathname)) return;
    let cancelled = false;
    preloadRoute(pathname).then(() => {
      if (!cancelled) setVersion((value) => value + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const source = useMemo(() => sourceFor(pathname), [pathname, version]);
  if (!source) return null;
  return <HubLinks links={linksFor(source, lang)} lang={lang} />;
}

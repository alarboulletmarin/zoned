/**
 * Donnees du catalogue avant le premier rendu.
 *
 * Les pages lisent le cache synchrone. Le serveur et le client qui hydrate
 * appellent la meme fonction, sinon le HTML et l'hydratation divergent.
 */

import { loadArticleContent } from "@/data/articles";
import { loadAllTerms } from "@/data/glossary";
import { loadAllStrengthSessions } from "@/data/strength";
import { loadAllWorkouts, loadDisciplineWorkouts } from "@/data/workouts";

export async function preloadRoute(pathname: string): Promise<void> {
  const path = pathname.replace(/\/$/, "") || "/";
  const jobs: Promise<unknown>[] = [loadAllTerms()];

  const needsCatalogue =
    path === "/library" ||
    path.startsWith("/workout/") ||
    path.startsWith("/glossary") ||
    path.startsWith("/learn") ||
    path.startsWith("/collections") ||
    path === "/plan/new/prebuilt" ||
    path.startsWith("/plan/prebuilt/") ||
    path === "/weeks/new/prebuilt" ||
    path.startsWith("/weeks/prebuilt/");

  if (needsCatalogue) {
    jobs.push(
      loadAllWorkouts(),
      loadAllStrengthSessions(),
      loadDisciplineWorkouts("cycling"),
      loadDisciplineWorkouts("swimming"),
    );
  }

  const article = path.match(/^\/learn\/([^/]+)$/);
  if (article?.[1]) jobs.push(loadArticleContent(decodeURIComponent(article[1])));

  await Promise.all(jobs);
}

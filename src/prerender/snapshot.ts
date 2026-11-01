/**
 * Premier rendu aligne sur le HTML pret a l'emploi.
 *
 * Le serveur n'a pas de localStorage. Le client qui hydrate le meme
 * document doit partir du meme etat, puis lire le stockage dans un effet.
 */

export function isServerSnapshot(): boolean {
  if (import.meta.env.SSR) return true;
  if (typeof document === "undefined" || typeof window === "undefined") return false;
  const stampedPath = document.documentElement.getAttribute("data-prerender-path");
  if (!stampedPath) return false;
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const expected = stampedPath.replace(/\/$/, "") || "/";
  if (path !== expected) return false;
  const stampedLang = document.documentElement.getAttribute("data-prerender-lang") === "en" ? "en" : "fr";
  const queryLang = new URLSearchParams(window.location.search).get("lang") === "en" ? "en" : "fr";
  if (queryLang !== stampedLang) return false;
  try {
    const stored = localStorage.getItem("zoned-language");
    // Un choix anglais memorise sur l'URL francaise rendrait un autre texte
    // que le HTML. On laisse alors le client repeindre, sans hydrater.
    if (stored === "en" && stampedLang === "fr") return false;
  } catch {
    // Stockage illisible : le HTML fait foi.
  }
  return true;
}

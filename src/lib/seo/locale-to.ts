import type { To } from "react-router-dom";

/**
 * Sur une page anglaise, les liens internes gardent ?lang=en.
 * Sinon le maillage anglais retombe sur les URL francaises.
 */
export function localeTo(to: string, isEn: boolean): To {
  if (!isEn) return to;
  const hashIndex = to.indexOf("#");
  const hash = hashIndex >= 0 ? to.slice(hashIndex) : "";
  const bare = hashIndex >= 0 ? to.slice(0, hashIndex) : to;
  const [pathname, search = ""] = bare.split("?");
  if (search.split("&").includes("lang=en")) return to;
  const next = search ? `${search}&lang=en` : "lang=en";
  return hash ? { pathname, search: `?${next}`, hash } : { pathname, search: `?${next}` };
}

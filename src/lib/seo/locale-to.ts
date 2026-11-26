import type { To } from "react-router-dom";
import type { SupportedLanguage } from "@/i18n";

/**
 * Sur une page anglaise ou italienne, les liens internes gardent ?lang=en ou ?lang=it.
 * Sinon le maillage retombe sur les URL francaises.
 */
export function localeTo(to: string, langOrIsEn: boolean | SupportedLanguage): To {
  const lang: SupportedLanguage =
    typeof langOrIsEn === "boolean" ? (langOrIsEn ? "en" : "fr") : langOrIsEn;
  if (lang === "fr") return to;
  const param = `lang=${lang}`;
  const hashIndex = to.indexOf("#");
  const hash = hashIndex >= 0 ? to.slice(hashIndex) : "";
  const bare = hashIndex >= 0 ? to.slice(0, hashIndex) : to;
  const [pathname, search = ""] = bare.split("?");
  if (search.split("&").includes(param)) return to;
  const next = search ? `${search}&${param}` : param;
  return hash ? { pathname, search: `?${next}`, hash } : { pathname, search: `?${next}` };
}

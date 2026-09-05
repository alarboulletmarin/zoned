import { createContext, useContext, type ReactNode } from "react";

/**
 * Which language a film is in.
 *
 * Every composition takes a `lang` prop and publishes it here; leaf components
 * read it with `useLang()` rather than being told, exactly the way `useLayout()`
 * hands them the format. That symmetry is the point: a component branches on
 * neither format nor language, it just asks.
 *
 * The two languages are separate compositions rather than one composition with
 * a prop, so both stay previewable in the studio and renderable by id — same
 * reasoning as the two formats, see Root.tsx.
 */
export type Lang = "fr" | "en";

export const LANGS: Lang[] = ["fr", "en"];

/** Uppercase tag used in composition ids: `Overview-Wide-EN`. */
export const langTag = (lang: Lang) => lang.toUpperCase();

const LangContext = createContext<Lang>("fr");

export const LangProvider: React.FC<{ lang: Lang; children: ReactNode }> = ({
  lang,
  children,
}) => <LangContext.Provider value={lang}>{children}</LangContext.Provider>;

export const useLang = () => useContext(LangContext);

/**
 * A decimal, punctuated for the language: 7,7 km in French, 7.7 km in English.
 *
 * This existed as a bare `.replace(".", ",")` in two visuals, which put a French
 * comma in the middle of an English sentence.
 */
export const decimal = (value: number, digits: number, lang: Lang) => {
  const fixed = value.toFixed(digits);
  return lang === "fr" ? fixed.replace(".", ",") : fixed;
};

/**
 * A percentage, spaced for the language.
 *
 * French sets a space before the sign, English does not. Small, and the kind of
 * thing that makes a film read as translated rather than written.
 */
export const percent = (value: number, lang: Lang) =>
  lang === "fr" ? `${value} %` : `${value}%`;

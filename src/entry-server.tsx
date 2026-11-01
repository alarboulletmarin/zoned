import { StrictMode } from "react";
import { prerender } from "react-dom/static";
import i18n, { ensureTranslations, type SupportedLanguage } from "./i18n";
import { preloadRoute } from "./prerender/preload";
import App from "./App";

export async function renderRoute(pathname: string, lang: SupportedLanguage): Promise<string> {
  await preloadRoute(pathname);
  await ensureTranslations(lang);
  await i18n.changeLanguage(lang);

  const url = lang === "en" ? `${pathname}?lang=en` : pathname;
  const { prelude } = await prerender(
    <StrictMode>
      <App ssrLocation={url} />
    </StrictMode>,
    {
      onError(error) {
        console.error(`[prerender] ${lang} ${pathname}`, error);
      },
    },
  );

  return new Response(prelude).text();
}

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { EyeOff } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SEOHead } from "@/components/seo";
import { useSettings } from "@/hooks/useSettings";
import { isModuleHidden } from "@/lib/settingsSchema";
import type { ModuleId } from "@/types/settings";

/**
 * La porte d'une surface masquée dans les réglages.
 *
 * Trois choses qu'elle ne fait **pas**, et chacune est une décision :
 *
 * 1. **Jamais de 404, jamais de redirection.** Masquer une surface est un
 *    choix d'affichage ; l'URL reste valide, et quelqu'un qui arrive par un
 *    lien partagé ou un favori doit comprendre ce qui se passe, pas se prendre
 *    une page d'erreur pour un réglage qu'il a posé lui-même.
 *
 * 2. **Elle n'envoie pas dans les réglages pour revenir.** Le bouton réaffiche
 *    la surface **sur place**, et la page apparaît. Annuler vaut mieux que
 *    confirmer : un aller-retour vers `/settings` pour retrouver une bascule
 *    parmi d'autres, c'est trois écrans pour défaire un clic.
 *
 * 3. **Elle ne s'enveloppe pas dans la table du routeur.** Elle vit DANS
 *    l'élément de route, ce qui garde `generate-route-meta`,
 *    `generate-sitemap` et la liste de prérendu au byte près. Et
 *    `scripts/prerender.ts` tourne sur un localStorage neuf, donc
 *    `DEFAULT_SETTINGS` s'applique et aucun module n'est masqué dans `dist` —
 *    remonter cette porte dans le routeur viderait silencieusement une
 *    douzaine de pages prérendues.
 *
 * Une surface masquée passe en `noindex` le temps qu'elle l'est : ce qu'un
 * robot verrait là n'est pas la page.
 */
export function ModuleGate({
  module,
  children,
  canonical,
}: {
  module: ModuleId;
  children: ReactNode;
  /** L'URL canonique de la page enveloppée, pour l'en-tête de l'état masqué. */
  canonical?: string;
}) {
  const { t } = useTranslation("common");
  const { settings, setModuleHidden } = useSettings();

  if (!isModuleHidden(settings, module)) return <>{children}</>;

  const name = t(`modules.${module}.name`);

  return (
    <>
      <SEOHead
        title={name}
        description={t("modules.hidden.description", { module: name })}
        canonical={canonical}
        noindex
      />
      <EmptyState
        variant="not-started"
        icon={EyeOff}
        title={t("modules.hidden.title", { module: name })}
        description={t("modules.hidden.description", { module: name })}
        action={
          <Button onClick={() => setModuleHidden(module, false)}>
            {t("modules.hidden.cta")}
          </Button>
        }
      />
    </>
  );
}

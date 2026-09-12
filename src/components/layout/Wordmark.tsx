/**
 * La signature de la marque, et le logo tout court.
 *
 * Le logo de Zoned est le nom : Bricolage Grotesque 800, approche -0,04 em,
 * suivi d'un point vermillon. Un signe dessiné a été construit puis écarté —
 * le gréement des doodles ne sait dessiner que la famille debout, donc une
 * figure unique lit toujours « un coureur » et jamais « du sport », et à 16 px
 * elle devient un pâté (le raisonnement complet est dans l'en-tête de
 * scripts/generate-wordmark.mjs).
 *
 * Ici, dans une page, le mot reste du TEXTE : il se sélectionne, il suit le
 * thème, il ne coûte rien. `src/assets/logo.svg` est le même mot vectorisé, et
 * il ne sert que là où le CSS n'arrive pas — le favicon, les cartes de partage
 * rendues avec `skipFonts`, l'OG, la bannière du README, la vidéo.
 *
 * Le nom n'est pas traduit et n'est pas une clé i18n : c'est un nom propre.
 */
export function Wordmark({
  size,
  className,
}: {
  /** Cap height in px. Defaults to the 26px the design system uses in the header. */
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={className ? `zn-wordmark ${className}` : "zn-wordmark"}
      style={size ? { fontSize: `${size}px` } : undefined}
    >
      zoned<span className="zn-wordmark__dot">.</span>
    </span>
  );
}

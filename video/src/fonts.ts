/**
 * Les trois familles, servies depuis le paquet plutôt que depuis Google.
 *
 * `@remotion/google-fonts` allait chercher les fichiers sur fonts.gstatic.com À
 * CHAQUE RENDU. Un rendu devenait donc dépendant du réseau, et un réseau qui
 * coupe ne fait pas échouer le rendu : il le sort avec la police de repli, ce
 * qui est le mauvais mode d'échec — quarante-huit films dans la mauvaise
 * typographie, sans un mot.
 *
 * L'app a tranché la même question dans le même sens (« We self-host instead »,
 * src/styles/design/fonts.css). Les fichiers sont donc les SIENS, copiés dans
 * `public/fonts/` par `bun run sync`, et jamais versionnés ici : une police
 * dupliquée dans deux paquets est une police qui finit par diverger.
 *
 * Ce sont des fontes variables, d'où les plages de graisse plutôt que des
 * valeurs : une seule ressource par famille couvre tout ce que les films
 * demandent.
 */

import { continueRender, delayRender, staticFile } from "remotion";

type Face = {
  family: string;
  file: string;
  /** Plage de graisse de la fonte variable, telle que l'app la déclare. */
  weight: string;
};

const FACES: Face[] = [
  { family: "Bricolage Grotesque", file: "bricolage-grotesque-latin.woff2", weight: "400 800" },
  { family: "Space Grotesk", file: "space-grotesk-latin.woff2", weight: "300 700" },
  { family: "JetBrains Mono", file: "jetbrains-mono-latin.woff2", weight: "400 700" },
];

/**
 * Le rendu attend les trois.
 *
 * `delayRender` est pris au chargement du module, donc avant que la moindre
 * image ne soit demandée : sans lui, Remotion photographie la première frame
 * pendant que les fontes arrivent encore, et seule celle-là sort en repli.
 */
const handle = delayRender("Chargement des trois familles", {
  // Les fichiers sont locaux, donc une seconde suffit quand tout va bien. La
  // fenêtre est large parce que le défaut de 30 s se mesure depuis le
  // chargement du module, pas depuis la requête : un onglet ouvert tard dans un
  // rendu, pendant que l'encodeur et le serveur de `public/` se disputent la
  // machine, a échoué à la frame 388 sur une police de 76 ko. Un rendu de
  // treize secondes perdu au bout de treize minutes, pour ça.
  timeoutInMilliseconds: 120_000,
  retries: 3,
});

const loaded = Promise.all(
  FACES.map(async ({ family, file, weight }) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, {
      weight,
      style: "normal",
      display: "block",
    });
    await face.load();
    document.fonts.add(face);
  }),
);

loaded
  .then(() => continueRender(handle))
  .catch((err) => {
    // Volontairement fatal. Une famille manquante se voit sur les quarante-huit
    // films à la fois, et elle se voit mal : c'est exactement le genre de panne
    // qui passe une revue et se découvre à la publication.
    throw new Error(
      `Police introuvable dans public/fonts/ — lancer \`bun run sync\` (${(err as Error).message})`,
    );
  });

/**
 * Les noms de famille, avec leurs replis.
 *
 * Les replis ne servent qu'au studio pendant la seconde de chargement : au
 * rendu, `delayRender` garantit que la vraie fonte est là avant la première
 * frame.
 */
export const displayFamily = '"Bricolage Grotesque", system-ui, sans-serif';
export const textFamily = '"Space Grotesk", system-ui, -apple-system, sans-serif';
export const monoFamily = '"JetBrains Mono", ui-monospace, "SF Mono", monospace';

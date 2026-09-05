/* La figure qui montre.
 *
 * Elle accompagne les flèches d'annotation : la légende dit quoi regarder, la
 * flèche dit où, et la figure dit que quelqu'un te le montre. C'est ce qui
 * garde le personnage au centre au lieu de laisser une flèche seule flotter
 * sur la page.
 *
 * Bras avant tendu à l'horizontale (coude à +90) : au-dessous il propose, au-
 * dessus il salue. Le cadre est serré à droite pour que la main tombe près du
 * bord — la flèche prend le relais juste après.
 *
 *   bun scripts/doodles/pointing.mjs
 */
import { writeFileSync } from "node:fs";
import { Figure, svg, ground } from "./rig.mjs";

const OUT = new URL("../../src/assets/doodles/", import.meta.url).pathname;

const f = new Figure().pose({
  head: 4,
  frontArm: -24, frontElbow: 90,
  backArm: -35, backElbow: -90,
});
f.plantLead({ knee: -5 });
for (let k = 0; k < 6; k++) {
  const [a, b] = [f.P[63], f.P[65]];
  const deg = (Math.atan2(a[1] - b[1], a[0] - b[0]) * 180) / Math.PI;
  if (Math.abs(deg) < 0.15) break;
  f.pose({ leadFoot: -deg });
}

const b = f.bbox(), gy = f.groundY();
const h = Math.max(b.h, gy - b.y0) + 10;
const w = h * 0.86;                       // portrait : la figure remplit le cadre
const x0 = b.x0 - (w - b.w) * 0.62;       // la main tendue affleure le bord droit
writeFileSync(`${OUT}pointing.svg`,
  svg([...f.paths([Figure.LEAD_SOLE]), { d: ground(x0 + 4, x0 + w - 4, gy) }],
      { x0, y0: b.y0, w, h }, { pad: 6 }));
console.log(`→ pointing.svg  ${Math.round(w)}x${Math.round(h)}`);

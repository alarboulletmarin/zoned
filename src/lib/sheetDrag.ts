/**
 * Le glisser-pour-fermer d'une bottom sheet, réduit à sa décision.
 *
 * Ici plutôt que dans le composant parce que `bun test` n'a pas de DOM et que
 * PlanWorkoutPanel.tsx tire toute la chaîne i18n — dont `import.meta.glob`, que
 * Vite résout et que bun ne connaît pas. La règle est la seule partie du geste
 * qui se teste sans navigateur ; le reste (la prise sur l'en-tête, la
 * transition coupée tant que le doigt est posé) se mesure au navigateur.
 */

/** Ferme au-delà de cette course, quelle que soit la vitesse. */
const CLOSE_DISTANCE = 100;
/** …ou en deçà, si le doigt partait à cette vitesse (px/ms) au lâcher. */
const CLOSE_SPEED = 0.5;
/** Course minimale sous laquelle un tremblement rapide ne compte pas. */
const FLICK_FLOOR = 24;

/**
 * La sheet se ferme-t-elle sur ce geste ? La course, OU l'élan : un flick court
 * et vif est le geste réflexe sur mobile et ne parcourt jamais 100px.
 *
 * @param deltaY course verticale du doigt, en px (positive vers le bas)
 * @param speed  vitesse au lâcher, en px/ms (positive vers le bas)
 */
export function shouldCloseSheet(deltaY: number, speed: number): boolean {
  if (deltaY > CLOSE_DISTANCE) return true;
  return speed > CLOSE_SPEED && deltaY > FLICK_FLOOR;
}

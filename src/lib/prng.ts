/**
 * PRNG déterministe, mulberry32 : un hachage 32 bits, léger, aux bonnes
 * propriétés statistiques.
 *
 *   - sortie uniforme dans [0, 1), là où `Math.sin(seed)` se replie mal
 *     quand l'entrée grandit (une graine du type `Date.now()` perdait de la
 *     précision) ;
 *   - cinq lignes, aucune dépendance, reproductible sous une graine donnée,
 *     ce que les tests et le partage d'un plan par sa config exigent.
 *
 * Référence : https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 */

/**
 * Construit un tirage dans [0, 1) depuis une graine entière 32 bits. La
 * graine passe par `>>> 0` pour qu'une entrée flottante ou négative tombe
 * sur un état valide. La fonction rendue est à état : chaque appel donne la
 * valeur suivante du flux.
 */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

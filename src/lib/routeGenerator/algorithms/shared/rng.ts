/**
 * Deterministic PRNG used to derive bearings, angle offsets and other
 * geometry seeds inside the route algorithms. We use mulberry32, a
 * lightweight 32-bit hash function with good statistical properties:
 *
 *   - Uniformly distributed output in [0, 1) — unlike `Math.sin(seed)`
 *     which folds badly when the input grows large (the previous
 *     implementation lost precision for `Date.now()`-style seeds).
 *   - 5 lines, no dependency, suitable for tests where reproducibility
 *     under a given seed is required.
 *   - Fast enough that we can re-instantiate per-call without caching.
 *
 * Reference: https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 */

/**
 * Build a [0, 1) PRNG from a 32-bit integer seed. The seed is coerced
 * via `>>> 0` so floating-point or negative inputs land on a valid
 * integer state. Returns a stateful function — successive calls
 * produce successive values from the stream.
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

/**
 * Deterministic bearing in [0, 360) for a given seed. Same seed always
 * produces the same bearing — a property the algorithms rely on so a
 * regenerate-with-same-seed yields the exact same trace.
 */
export function seededBearing(seed: number): number {
  return mulberry32(seed)() * 360;
}

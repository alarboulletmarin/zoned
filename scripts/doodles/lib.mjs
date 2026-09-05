export const f1 = (n) => (Math.round(n * 10) / 10).toString();
// Catmull-Rom (uniform) through pts -> cubic path. open chain.
export function cr(pts, t = 1 / 6) {
  const p = pts;
  let d = `M ${f1(p[0][0])} ${f1(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i];
    const p1 = p[i], p2 = p[i + 1];
    const p3 = p[i + 2] || p[i + 1];
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d;
}
export const rot = (pts, [cx, cy], deg) => {
  const a = (deg * Math.PI) / 180, s = Math.sin(a), c = Math.cos(a);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
};
export const tr = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
export const sc = (pts, [cx, cy], k, ky = k) => pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * ky]);

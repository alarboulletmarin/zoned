# Handoff — Route Generator MVP

> **Branch** : `route-generator-mvp` (8 commits au-dessus de `main`, jamais pushée)
> **Date** : 2026-05-06
> **Status** : MVP fonctionnel mais qualité de routing insuffisante
> **Reprise** : nouvelle session, contexte propre

---

## 1. Ce qui est livré et fonctionne

### Architecture
- Types : `src/types/route.ts`
- Lib : `src/lib/routeGenerator/{constants,routing,elevation,geocoding,index}.ts`
- Algos : `src/lib/routeGenerator/algorithms/{loop,outAndBack}.ts`
- Storage : `src/lib/routeStorage.ts` + clé `zoned-routes` dans `BACKUP_STORAGE_KEYS`
- Export GPX : `src/lib/export/gpx.ts`

### UI
- `src/pages/{RouteGeneratorPage,RouteDetailPage,MyRoutesPage}.tsx`
- `src/components/visualization/route/{RouteMap,ElevationChart}.tsx` (Leaflet lazy + SVG custom)
- `src/components/domain/{RouteParametersForm,AddressSearchInput}.tsx`
- `src/components/ui/segmented.tsx` (composant réutilisable)
- i18n FR/EN namespace `routes` (15e namespace, parité OK)
- Routes `/routes`, `/routes/mine`, `/routes/:id` dans `App.tsx`
- Lien Sidebar dans le groupe `nav.plan`

### Fonctionnalités
- Slider distance Radix 1-50 km step 0.5 + édition inline
- Segmented controls Forme/Discipline/Surface
- Bearing slider avec affichage cardinal `N · 0°` `NE · 45°` etc
- Autocomplete adresse Nominatim (debounce 600 ms, cache sessionStorage)
- Géoloc avec détection préalable Permissions API + 3 messages d'erreur distincts
- Carte initiale visible (vue France métropolitaine par défaut)
- **Multi-candidates** : 3 propositions par génération avec bearings équidistants ou seeds variés
- Export GPX, save localStorage, liste, détail, suppression
- Tests Vitest sur les fonctions géométriques (`elevation.test.ts`, 12 tests)

### Build/Tests
- Build OK, 222 tests pass, i18n parity OK
- Bundle Leaflet et Recharts (custom SVG en réalité) lazy-chargés

---

## 2. Diagnostic du problème "qualité de routing"

L'utilisateur (Andréa, basé à Maréchal Vauban Nice 06300) signale :

> *"Certains parcours restent sur des zones très fréquentées, je n'ai jamais de proposition Promenade des Anglais, j'ai des parcours sur l'eau, des quartiers dangereux (Falicon, l'Ariane)…"*

### Cause racine
L'algorithme actuel place les waypoints en **triangulation géométrique aveugle** autour du start :

```ts
// algorithms/loop.ts
const offset = seededAngleOffset(seed);
return [0, 120, 240].map((step) =>
  destinationPoint(start, radiusM, (offset + step) % 360),
);
```

Ces 3 waypoints sont calculés mathématiquement sans regarder :
1. **Le terrain** : un waypoint en pleine mer ou en zone industrielle est aussi probable qu'un dans un parc
2. **Les POI runners-friendly** : promenade, voies vertes, parcs, sentiers connus
3. **Les quartiers à éviter** : zones peu peuplées, mal éclairées, ou réputées peu sûres

Brouter route vers ces waypoints aveugles, ce qui donne :
- Des tracés qui touchent la rive et reviennent (waypoints en mer)
- Des tracés qui traversent l'Ariane (waypoint au nord)
- Aucune attraction vers la Promenade des Anglais (au sud, mais aucun waypoint mathématique ne tombe pile dessus)

---

## 3. Stratégie Strava-like proposée

### Pivot : POI-aware routing
Remplacer la triangulation aveugle par une **sélection de waypoints depuis des POI runners-friendly** récupérés via **Overpass API** (lecture OSM).

### Architecture cible

```
src/lib/routeGenerator/
├── poi/
│   ├── overpass.ts         # Wrapper Overpass API
│   ├── poiTypes.ts         # Park, Promenade, Greenway, Trail, Beach…
│   ├── poiSelector.ts      # Pondère et choisit N POI dans un rayon
│   └── poiCache.ts         # Cache sessionStorage par bbox+type
└── algorithms/
    ├── loop.ts             # ↘ refactored: utilise POI quand dispo
    └── poiAwareLoop.ts     # nouveau : path through chosen POI
```

### Overpass query type

```overpass
[out:json][timeout:25];
(
  way[leisure=park](around:{radius},{lat},{lon});
  way[highway~"^(footway|cycleway|path)$"][name~"promenade",i](around:{radius},{lat},{lon});
  way[route=hiking](around:{radius},{lat},{lon});
  way[natural=beach](around:{radius},{lat},{lon});
  way[leisure=nature_reserve](around:{radius},{lat},{lon});
);
out center 50;
```

`out center` retourne le centroïde de chaque way → utilisable directement comme waypoint Brouter.

### Algorithme POI-aware

Pseudo-code :

```ts
async function generatePoiAwareLoop(start, distanceKm, discipline, seed) {
  // 1. Fetch POI dans un rayon = distanceKm * 0.4 km autour du start
  const radius = distanceKm * 1000 * 0.4;
  const candidates = await overpassQuery(start, radius, [
    "leisure=park",
    "highway=footway+name~promenade",
    "natural=beach",
    "route=hiking",
  ]);

  // 2. Score chaque POI par:
  //    - distance au start (privilégier ~radius/2 pour boucle équilibrée)
  //    - type (parc > promenade > sentier)
  //    - couverture angulaire (étaler en azimut)
  const scored = scoreAndDiversify(candidates, start, seed);

  // 3. Prendre top 2-3 POI pour former la boucle
  const waypoints = scored.slice(0, 3);

  // 4. Router via Brouter
  let trace = await routeViaBrouter([start, ...waypoints, start], discipline);

  // 5. Si distance hors tolérance, ajouter/retirer un POI ou ajuster le rayon
  //    (loop iter, max 3 passes)
  return trace;
}
```

### Fallback
Si Overpass ne retourne pas assez de POI (rural, zones peu cartographiées) → fallback sur l'algo actuel `triangleAvengle` mais **filtré** : reverse-geocode chaque waypoint avec Nominatim et **rejeter** si :
- `class === "natural"` et `type === "water"` → waypoint en mer
- pas de `address` retourné → zone non-routable

---

## 4. Implémentation détaillée recommandée

### Étape 1 — Module POI (~200 lignes)

`src/lib/routeGenerator/poi/overpass.ts` :

```ts
const OVERPASS_BASE = "https://overpass-api.de/api/interpreter";

export interface PoiCandidate {
  id: number;
  type: "park" | "promenade" | "greenway" | "trail" | "beach";
  point: RouteCoordinate;
  name?: string;
  /** Empirical "running-friendliness" score 0-1. */
  weight: number;
}

const POI_QUERIES: Record<PoiCandidate["type"], string> = {
  park: 'way[leisure=park]',
  promenade: 'way[highway~"^(footway|cycleway|path)$"][name~"promenade",i]',
  greenway: 'way[route=bicycle][name~"voie verte",i]',
  trail: 'way[route=hiking]',
  beach: 'way[natural=beach]',
};

const POI_WEIGHTS: Record<PoiCandidate["type"], number> = {
  promenade: 1.0,
  beach: 0.95,
  park: 0.9,
  greenway: 0.85,
  trail: 0.7,
};

export async function fetchPoiCandidates(args: {
  center: RouteCoordinate;
  radiusM: number;
  types?: PoiCandidate["type"][];
  signal?: AbortSignal;
}): Promise<PoiCandidate[]> {
  const types = args.types ?? Object.keys(POI_QUERIES) as PoiCandidate["type"][];
  const [lon, lat] = args.center;

  const subqueries = types.map((t) =>
    `${POI_QUERIES[t]}(around:${Math.round(args.radiusM)},${lat},${lon});`
  ).join("\n");

  const ql = `[out:json][timeout:25];(${subqueries});out center 80;`;

  const response = await fetch(OVERPASS_BASE, {
    method: "POST",
    body: `data=${encodeURIComponent(ql)}`,
    signal: args.signal,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!response.ok) throw new Error(`Overpass ${response.status}`);

  const data = await response.json() as {
    elements: Array<{
      id: number;
      type: "way" | "node";
      center?: { lat: number; lon: number };
      lat?: number;
      lon?: number;
      tags?: { name?: string; leisure?: string; highway?: string; natural?: string; route?: string };
    }>;
  };

  return data.elements.flatMap((el) => {
    const lat = el.center?.lat ?? el.lat;
    const lon = el.center?.lon ?? el.lon;
    if (lat == null || lon == null) return [];
    const type = inferType(el.tags ?? {});
    if (!type) return [];
    return [{
      id: el.id,
      type,
      point: [lon, lat] as RouteCoordinate,
      name: el.tags?.name,
      weight: POI_WEIGHTS[type],
    }];
  });
}

function inferType(tags: Record<string, string | undefined>): PoiCandidate["type"] | null {
  if (tags.natural === "beach") return "beach";
  if (tags.leisure === "park") return "park";
  if (tags.route === "hiking") return "trail";
  if (tags.route === "bicycle" && /voie verte/i.test(tags.name ?? "")) return "greenway";
  if (tags.highway && /promenade/i.test(tags.name ?? "")) return "promenade";
  return null;
}
```

### Étape 2 — Selector

`src/lib/routeGenerator/poi/poiSelector.ts` :

```ts
import { destinationPoint, haversineDistanceM } from "../elevation";

/**
 * Pick `count` POI that:
 * - Lie roughly at half the target distance from the start (so the routed
 *   loop has a reasonable triangulation).
 * - Are spread in azimuth (no two POI within 60° of each other).
 * - Maximise total weight.
 */
export function selectDiverseWaypoints(
  start: RouteCoordinate,
  candidates: PoiCandidate[],
  targetRadiusM: number,
  count: number,
  seed: number,
): PoiCandidate[] {
  if (candidates.length === 0) return [];

  // Score each candidate
  const scored = candidates.map((c) => {
    const distance = haversineDistanceM(start, c.point);
    const distanceScore = 1 - Math.abs(distance - targetRadiusM) / targetRadiusM;
    const bearing = computeBearing(start, c.point);
    return {
      candidate: c,
      score: c.weight * Math.max(0, distanceScore),
      bearing,
    };
  }).filter((s) => s.score > 0.1)
    .sort((a, b) => b.score - a.score);

  // Greedy pick: take best, then next best at >60° from already picked
  const picked: typeof scored = [];
  for (const s of scored) {
    if (picked.length >= count) break;
    const conflict = picked.some((p) =>
      angularDistance(p.bearing, s.bearing) < 60,
    );
    if (!conflict) picked.push(s);
  }

  // Fill with remaining if we couldn't fill the diversity quota
  if (picked.length < count) {
    for (const s of scored) {
      if (picked.length >= count) break;
      if (!picked.includes(s)) picked.push(s);
    }
  }

  return picked.map((p) => p.candidate);
}

function computeBearing(from: RouteCoordinate, to: RouteCoordinate): number {
  const [lon1, lat1] = from;
  const [lon2, lat2] = to;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1r = lat1 * Math.PI / 180;
  const lat2r = lat2 * Math.PI / 180;
  const x = Math.sin(dLon) * Math.cos(lat2r);
  const y = Math.cos(lat1r) * Math.sin(lat2r) - Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLon);
  return ((Math.atan2(x, y) * 180 / Math.PI) + 360) % 360;
}

function angularDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}
```

### Étape 3 — Refactor `loop.ts` et `outAndBack.ts`

```ts
export async function generateLoop(args) {
  const radiusM = (args.targetDistanceKm * 1000 / Math.PI) * 0.5;

  // ── NEW: try POI-aware first ──
  try {
    const pois = await fetchPoiCandidates({ center: args.start, radiusM: radiusM * 1.5 });
    if (pois.length >= 3) {
      const waypoints = selectDiverseWaypoints(args.start, pois, radiusM, 3, args.seed);
      const trace = await routeViaBrouter({
        waypoints: [args.start, ...waypoints.map(w => w.point), args.start],
        discipline: args.discipline,
      });
      // Iterative correction if distance off
      // ... (same loop as before)
      return { ...trace, attempts: 0, withinTolerance: ... };
    }
  } catch { /* fall through to triangulation fallback */ }

  // ── Existing triangulation fallback ──
  // ... unchanged
}
```

### Étape 4 — UI : afficher les POI sélectionnés

Optionnel mais ajout valeur : dans la carte, afficher des markers gris sur les POI traversés avec leur nom (ex : "Promenade des Anglais", "Parc Phoenix"). Donne du sens au tracé.

### Étape 5 — Tests

`overpass.test.ts` : mock fetch, vérifier parsing.
`poiSelector.test.ts` : vérifier diversité angulaire + bonus weight.
Test d'intégration : avec mock Overpass + mock Brouter, vérifier qu'une boucle Nice 10km utilise bien Promenade des Anglais comme POI.

---

## 5. Roadmap restante

### Sprint 1.3 — Polish (court)
- [ ] Sticky CTA mobile vraiment fixe au viewport (actuellement `sticky bottom-0` mais dans le `<form>` qui n'a pas la hauteur du viewport)
- [ ] Multi-trace overlay : afficher les 3 candidats simultanément en gris léger + sélectionné en orange (la carte montre actuellement seulement le sélectionné)
- [ ] Settings > Privacy toggle : "Activer le générateur de parcours" (cf brief §6.4)
- [ ] Tests Vitest sur `loop.ts`/`outAndBack.ts` avec mock de Brouter

### Sprint 2 — POI-aware (gros chantier)
- [ ] Module `poi/` (overpass + selector)
- [ ] Refactor `loop.ts` et `outAndBack.ts` pour utiliser POI quand disponible
- [ ] Fallback triangulation aveugle + reverse-geocode pour rejeter waypoints en eau
- [ ] Markers POI nommés sur la carte
- [ ] Tests d'intégration zone Nice + Paris

### Sprint 3 — UC5/UC6 (workout-aware)
- Cf `design-artifacts/E-PRD/Design-Deliveries/ROUTE-GENERATOR-PRD.md` §3.3
- Mapping séance → contraintes terrain (VMA = plat, côtes = D+ marqué)
- Attacher route à `PlanSession`

### Sprint 4 — UC8 préférences avancées
- Polygone "éviter cette zone" sur la carte
- Profil custom Brouter via POST (BRF) si l'utilisateur veut pousser

---

## 6. Notes techniques

### Brouter
- Endpoint : `https://brouter.de/brouter`
- Profils utilisés : `trekking` (running), `fastbike` (cycling)
- Latence mesurée : 0.18 - 0.76 s selon zone
- Pas de rate-limit observé sur 5 requêtes simultanées
- Fallback OSRM possible mais pas implémenté

### Nominatim
- Rate-limit : 1 req/s public — respecté via `respectRateLimit()` dans `geocoding.ts`
- User-Agent recommandé mais Zoned ne l'envoie pas (browser fetch limité)

### Overpass (à ajouter)
- Endpoint : `https://overpass-api.de/api/interpreter`
- Recommandation : timeout 25s dans la query, batcher les types en 1 seule requête
- Rate-limit : pas dur mais éviter > 100 req/min

### localStorage
- Clé `zoned-routes` : `Route[]`
- Soft limit : 100 routes (`ROUTE_STORAGE_SOFT_LIMIT`)
- Inclus dans `BACKUP_STORAGE_KEYS`

---

## 7. Reproduire le bug "parcours sur l'eau / Falicon"

1. Saisir position : `43.7115, 7.2865` (Maréchal Vauban Nice)
2. Forme : Aller-retour
3. Distance : 20 km
4. Surface : Mixte
5. Bearing : laisser à 0° (Nord) ou ne rien spécifier
6. Cliquer "Générer un parcours"
7. Constat actuel : direction Falicon/Ariane (au nord). Avec multi-candidates (commit `53597cc`), candidate 2 = Sud-Est (mer/Vieux-Nice) — mieux mais pas optimal.

GPX de référence sauvegardé par l'utilisateur : `/home/andrea/Downloads/Aller-retour_20_km.gpx`

---

## 8. Commits sur la branche `route-generator-mvp`

```
7d17b7d fix(routes): surface clear errors when geolocation is blocked or times out
53597cc feat(routes): generate 3 candidate routes per request with bearing/seed variation
36050d5 feat(routes): refine form UI with slider, segmented controls, address autocomplete and initial map
8b8e4d1 feat(routes): add Route Generator UI (form, map, elevation, pages, sidebar, i18n)
5352743 fix(library): wrap discipline filter tabs to avoid horizontal scroll on mobile
549977c feat(backup): include zoned-routes in localStorage backup keys
4cea3eb feat(routes): add Route Generator foundation (types, lib, storage, algorithms)
```

Branche **non poussée**, à `git push -u origin route-generator-mvp` avant de partir.

---

## 9. Pour reprendre dans une session fraîche

```bash
cd /home/andrea/projets/gitlab/oss/zoned
git checkout route-generator-mvp
git status                                  # propre
git log --oneline -10                       # récap commits
cat _bmad-output/handoff/ROUTE-GENERATOR-HANDOFF.md  # ce document
cat design-artifacts/A-Product-Brief/ROUTE-GENERATOR-BRIEF.md
cat design-artifacts/E-PRD/Design-Deliveries/ROUTE-GENERATOR-PRD.md
```

Démarrer Sprint 2 directement par l'implémentation Étape 1 (`poi/overpass.ts`).

---

**Test rapide pour démarrer la nouvelle session** :

```bash
# Vérifier que l'Overpass query fonctionne pour Nice
curl -sS "https://overpass-api.de/api/interpreter" \
  --data-urlencode 'data=[out:json][timeout:25];(way[leisure=park](around:5000,43.7115,7.2865);way[highway~"^(footway|cycleway|path)$"][name~"promenade",i](around:5000,43.7115,7.2865););out center 20;' \
  | jq '.elements | length, .elements[0:3] | .[] | {name: .tags.name, lat: .center.lat, lon: .center.lon}'
```

Si ça retourne des éléments avec "Promenade des Anglais" → on est prêt à coder.

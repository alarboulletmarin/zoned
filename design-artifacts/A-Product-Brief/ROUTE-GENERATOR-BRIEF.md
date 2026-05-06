# Product Brief — Route Generator

> **Status** : Draft v1 (proposition)
> **Auteur** : Andréa (avec assistance Claude Code)
> **Date** : 2026-05-06
> **Module impacté** : nouveau — `src/lib/routeGenerator/`, `src/pages/Route*.tsx`

---

## 1. Vision en une phrase

Permettre à n'importe quel coureur (et bientôt cycliste) de générer un parcours réel
adapté à sa séance, depuis sa position, sans compte, sans paywall, sans rien envoyer
à Zoned — exactement ce que Strava cache derrière son abonnement annuel.

---

## 2. Problème utilisateur

Aujourd'hui, un utilisateur de Zoned qui veut faire concrètement la séance suggérée
par son plan doit improviser un parcours, ouvrir une autre app (Strava Premium,
Komoot, Plotaroute) ou se contenter d'une boucle approximative connue. Cela casse
la promesse "tout-en-un science-based gratuit" que Zoned tient sur tout le reste
du parcours utilisateur (séance → plan → simulator → export).

**Trois douleurs concrètes** :

1. **Coureur urbain** veut une boucle plate de 8 km depuis chez lui pour faire un
   tempo, et ne sait pas où aller — il finit toujours par tourner autour du même parc.
2. **Trail runner** veut 600 m D+ sur 12 km autour d'un point de bivouac, sans avoir
   le temps de chercher manuellement sur OpenRunner.
3. **Coureur en plan** ouvre Zoned, voit "demain : 10×400 m VMA piste ou route plate",
   mais aucun lien vers un parcours plat de la bonne distance n'existe.

---

## 3. Hypothèses de valeur (testables)

| # | Hypothèse | Comment on la valide |
|---|---|---|
| H1 | Les utilisateurs de Zoned veulent un parcours adapté à leur séance, pas juste un parcours générique | Tracking anonyme : taux de clic depuis page séance vers générateur |
| H2 | Une génération de boucle simple (distance + position) couvre 80 % des besoins | A/B implicite : voir lesquels des UC1-UC8 sont utilisés |
| H3 | Les utilisateurs accepteront le tradeoff "ma position est envoyée à un service de routing public" si c'est documenté et explicite | Toggle Settings > Privacy avec lien vers explication |
| H4 | Cette feature débloque un argument de différenciation fort vs Strava/Komoot/Komoot/Runna (tous payants pour cette fonction) | SEO + témoignages |

---

## 4. Success criteria — comment on saura que c'est réussi

**Phase MVP réussie si** :
- Un utilisateur peut générer une boucle de N km depuis sa position en moins de 10 s
- La distance générée est dans une tolérance de ±5 % de la cible
- Le parcours est exportable en GPX et FIT
- Aucun fichier > 500 lignes ajouté dans le projet
- Tests unitaires sur l'algorithme de génération (boucle, AR) > 80 % de couverture
- Build TS/i18n/lint passent
- Pas d'augmentation > 50 KB du bundle gzip principal (lazy-load Leaflet)

**Au-delà du MVP** :
- 50 % des utilisateurs ayant un plan actif génèrent au moins un parcours en 30 jours
- 20 % des séances de plan complétées sont associées à un parcours généré

---

## 5. Anti-goals — ce qu'on ne fait surtout pas

| Anti-goal | Pourquoi |
|---|---|
| **Pas de tracking GPS en temps réel** | Hors-scope, déjà rejeté (issue #5). C'est un générateur, pas un compteur. |
| **Pas d'auth, pas de comptes** | Philosophie locale-first. Stockage `zoned-routes` en localStorage, point. |
| **Pas de social** (likes, partages publics, leaderboards) | Non-but de Zoned. Un export GPX et un lien partageable suffisent. |
| **Pas de tile server hébergé par Zoned** | Trop coûteux, hors-scope. On utilise des providers tiers gratuits (OSM, OpenFreeMap, Carto). |
| **Pas de routing maison** | Rebuilder OSRM/Brouter dans le navigateur = mois de boulot pour zéro valeur. On consomme des APIs publiques. |
| **Pas d'image-based POI** (photos lieux, etc.) | Bundle/UX bloat. Pas la mission de Zoned. |
| **Pas de "premium routes"** ni de paywall sur des features avancées | Philosophie. Tout ou rien. |
| **Pas de génération de parcours automatique pour TOUTES les séances du plan** (sauf si l'utilisateur le demande explicitement) | Évite le bruit visuel et les attentes irréalistes (un parcours dépend de la position du jour). |

---

## 6. Contraintes

### Philosophiques (non-négociables)

1. **Aucune donnée utilisateur en cloud Zoned**. Routes stockées en localStorage uniquement.
2. **Tradeoff routing service explicite**. Position de départ envoyée à un service public
   le temps d'une requête, sans identifiant, sans cookie persistent. À mentionner
   dans Settings > Privacy avec un toggle "désactiver la génération de parcours".
3. **Aucun service payant en runtime obligatoire**. Tout le stack OSM/Brouter/Open-Elevation
   est gratuit et open. Si un provider devient payant, on doit avoir un fallback.
4. **Bilingue FR-first**. Nouveau namespace `routes.json` à créer dans les 2 langues
   simultanément (vérifier avec `bun run check:i18n`).

### Techniques

1. **Pas de backend Zoned**. Toutes les requêtes faites depuis le navigateur via `fetch`.
2. **Respect du rate-limit Nominatim** (1 req/s) : debounce de l'input adresse à ≥ 1 s.
3. **Cache des résultats** dans `sessionStorage` pour éviter les requêtes répétées
   identiques (géocodage, élévation).
4. **Lazy-loading** de la lib carte (Leaflet ≈ 40 KB gzip) : chargement uniquement
   sur la route `/routes/*`.
5. **Fallback offline** : la route déjà générée doit être consultable et exportable
   sans réseau (le parcours stocké contient tous les points + élévation).

### Légales

1. **Attribution OSM obligatoire** sur la carte (footer Leaflet attribution suffit).
2. **Mentionner les services tiers** utilisés dans la page About + une page
   `/legal/services` listant les providers et liens vers leur ToS.
3. **Pas de cache permanent des tuiles côté Zoned** (interdit par les ToS OSM).

---

## 7. Use cases (8 scénarios)

Pour chaque UC : intent utilisateur → entrées → sortie → exigences spécifiques.

### UC1 — Boucle depuis ma position [MVP]

> *"Je suis chez moi, je veux courir 8 km, donne-moi une boucle."*

- **Entrées** : `startPoint` (geoloc browser ou adresse), `distanceKm`, `surface` (route/trail/mixte)
- **Sortie** : trace GeoJSON/GPX, profil élévation, distance réelle, D+ total
- **Exigences** :
  - Boucle vraie (start === end, ±50 m)
  - Tolérance distance ±5 %
  - Algorithme déterministe avec seed pour permettre "regénérer" différent

### UC2 — Aller-retour [MVP]

> *"Je suis dans un endroit nouveau, je veux faire un AR de 6 km dans la direction du parc."*

- **Entrées** : `startPoint`, `distanceKm`, `direction` (libre / N/E/S/O / cap en degrés)
- **Sortie** : trace AR (le retour suit l'aller en sens inverse — ou l'évite si possible)
- **Exigences** :
  - Distance retour incluse dans la distance cible
  - Option "éviter le retour identique" pour faire une demi-boucle

### UC3 — Avec dénivelé contrôlé [v1]

> *"Je veux 10 km avec entre 200 et 300 m D+ pour ma séance de côtes."*

- **Entrées** : UC1/UC2 + `elevationGain` (min/max)
- **Sortie** : parcours respectant la fourchette ou refus explicite si terrain pas adapté
- **Exigences** :
  - Recherche multi-tentatives (jusqu'à 5 candidats) pour trouver la bonne fourchette
  - Si impossible : message clair "pas assez de relief dans un rayon de N km, propose plat ou agrandis la zone"

### UC4 — Du A au B en X km [v1]

> *"Je veux courir de chez moi à la gare en faisant 10 km au lieu des 4 directs."*

- **Entrées** : `startPoint`, `endPoint`, `distanceKm` (≥ distance directe)
- **Sortie** : trace A→B avec détour
- **Exigences** :
  - Si distance cible < distance directe : erreur claire
  - Détour intelligent (pas de zigzag stupide)

### UC5 — Workout-aware [v2]

> *"Voici la séance Z2 endurance 40 min de mon plan, suggère un parcours adapté."*

- **Entrées** : `WorkoutTemplate` ou `PlanSession`, `startPoint`
- **Sortie** : parcours dont les caractéristiques correspondent à la séance
- **Mapping intelligence** :
  | Type séance | Contraintes parcours |
  |---|---|
  | VMA, intervalles | Plat (D+ < 30 m), surface route lisse |
  | Tempo / seuil | Plat à modéré, surface continue |
  | Sortie longue | Distance large, peu importe le terrain |
  | Côtes | D+ marqué (≥ 80 m sur 5 km par ex.) |
  | Récup | Plat, idéalement parc/sentier doux |
  | Trail | Ratio sentiers > 50 % |

### UC6 — Pour ma séance du plan [v2]

> *"Demain : sortie longue 18 km. Génère et attache à ma session."*

- **Entrées** : `PlanSession` du plan en cours
- **Sortie** : parcours attaché à la session, visible dans le calendrier du plan
- **Exigences** :
  - Persiste l'association `session.routeId` dans le `TrainingPlan`
  - Sur la page de la session : rendu mini-carte + lien vers détail

### UC7 — Multi-suggestions [v2]

> *"Donne-moi 3 propositions différentes pour les mêmes contraintes."*

- **Entrées** : UC1-UC4 + `count: 3`
- **Sortie** : top-3 ranked par variété (algorithme : maximiser la dissimilarité géographique)
- **Exigences** :
  - Génération parallèle (jusqu'à 3 routings simultanés en respectant le rate-limit)
  - Score visible : "varié 🟢 / similaire 🟡 / quasi-identique 🔴"

### UC8 — Préférences avancées [v3]

> *"Évite la grande route à l'est, préfère les parcs."*

- **Entrées** : UC1-UC4 + `avoid: GeoZone[]`, `prefer: ('park' | 'forest' | 'water')[]`
- **Sortie** : parcours filtré
- **Exigences** :
  - Utiliser les profils Brouter (`fastrunning-with-park-preference`)
  - Polygones `avoid` à dessiner sur la carte (UI avancée)

---

## 8. Choix techniques recommandés

### Stack carte

| Layer | Choix recommandé | Alternative | Pourquoi |
|---|---|---|---|
| Renderer carte | **Leaflet 1.9** | MapLibre GL JS | Bundle léger (~40 KB gzip), API simple, écosystème mature pour overlays GPX |
| Tile provider | **OpenStreetMap.org** + **Carto Positron** | OpenFreeMap | Gratuit, attribution simple, fallback automatique |
| Routing engine | **Brouter** (https://brouter.de) | OSRM public | Profils outdoor, surface-aware, pas de hard rate limit officiel |
| Elevation | **OpenTopoData** (`api.opentopodata.org/v1/aster30m`) ou profil intégré Brouter | Open-Elevation | Brouter renvoie déjà l'élévation par segment |
| Geocoding | **Nominatim** (rate 1 req/s) | Photon (Komoot) | Standard OSM, suffit pour MVP |
| GPS browser | **`navigator.geolocation`** | — | Standard, demande permission utilisateur |

### Stack code

```
src/types/route.ts                      # Route, RouteSegment, ElevationPoint, RouteConstraints, RouteSurface
src/lib/routeGenerator/
   ├── index.ts                         # Façade publique
   ├── geocoding.ts                     # Nominatim wrapper + cache sessionStorage
   ├── routing.ts                       # Brouter wrapper + retry + fallback OSRM
   ├── elevation.ts                     # Profil dénivelé depuis trace
   ├── algorithms/
   │   ├── loop.ts                      # UC1, UC3 — triangulation + ajustement itératif
   │   ├── outAndBack.ts                # UC2
   │   ├── pointToPoint.ts              # UC4
   │   └── workoutAware.ts              # UC5/UC6 — wrapper qui dérive contraintes depuis WorkoutTemplate
   ├── scorer.ts                        # Ranking pour UC7
   ├── constants.ts                     # Endpoints, rate limits, defaults
   └── *.test.ts                        # Vitest, colocalisés
src/lib/routeStorage.ts                 # zoned-routes localStorage + ajout dans backup.ts
src/lib/export/gpx.ts                   # Nouveau format export
src/components/visualization/route/
   ├── RouteMap.tsx                     # Wrapper Leaflet (lazy-loaded)
   ├── ElevationChart.tsx               # Recharts (déjà dans le projet)
   ├── RouteParametersForm.tsx          # Form Radix
   └── RouteSummaryCard.tsx
src/components/domain/
   ├── RouteCard.tsx                    # Vignette dans liste
   └── PlanSessionRouteAttacher.tsx     # UC6 — bouton "attacher un parcours à cette session"
src/hooks/useRoutes.ts
src/hooks/useRouteGenerator.ts
src/pages/
   ├── RouteGeneratorPage.tsx           # /routes
   ├── RouteDetailPage.tsx              # /routes/:id
   └── MyRoutesPage.tsx                 # /routes/mine (liste)
src/i18n/locales/{fr,en}/routes.json    # Nouveau namespace
```

### Algorithme de boucle (UC1) — pseudocode

```ts
async function generateLoop(start: LatLng, distanceKm: number, surface: Surface, seed: number): Promise<Route> {
  const radius = (distanceKm / Math.PI) * 1000; // mètres
  const angles = generateTriangleAngles(seed); // 3 angles séparés de ~120° + jitter
  const waypoints = angles.map(angle => destinationPoint(start, radius, angle));

  let trace = await brouter([start, ...waypoints, start], surface);
  let attempts = 0;

  // Ajustement itératif : si distance off, ajuster le rayon
  while (Math.abs(trace.distanceKm - distanceKm) > distanceKm * 0.05 && attempts < 4) {
    const correction = distanceKm / trace.distanceKm;
    const newRadius = radius * correction;
    const newWaypoints = angles.map(angle => destinationPoint(start, newRadius, angle));
    trace = await brouter([start, ...newWaypoints, start], surface);
    attempts++;
  }

  return {
    id: nanoid(),
    points: trace.points,
    elevationGain: trace.elevationGain,
    distanceKm: trace.distanceKm,
    surface,
    generatedAt: Date.now(),
  };
}
```

---

## 9. Plan de phases

### Phase 0 — Spike technique (1 jour)
- Tester Brouter avec 3 requêtes manuelles (boucle 5 km Paris, AR 8 km en montagne, A→B 10 km)
- Mesurer latence (cible < 2 s/requête)
- Vérifier les profils disponibles (`fastrunning`, `safety`, `trail`)
- Confirmer la couverture mondiale (testez Suisse, US, Maroc)
- **Décision Go/No-Go** sur Brouter avant d'écrire du code

### Phase 1 — MVP (2-3 semaines)
- Types + hook + storage + backup
- Algos `loop` et `outAndBack`
- Page `/routes` avec form + map preview + export GPX
- i18n FR/EN minimal
- Tests Vitest sur les algos purs (mocking de Brouter)
- **Livrable** : un utilisateur peut générer une boucle ou AR depuis sa position et exporter

### Phase 2 — v1 (2 semaines)
- Algos `pointToPoint` + dénivelé contrôlé
- Page `/routes/mine` (liste + favoris)
- Page `/routes/:id` (détail + édition mineure : nom, tags)
- Settings > Privacy : toggle activation génération + explication
- Multi-suggestions (UC7)

### Phase 3 — v2 (3 semaines)
- Workout-aware (UC5)
- Intégration plan : UC6, attacher route à session
- Visualisation timeline avec mini-map sur la session du plan

### Phase 4 — v3 (futur, si la demande est là)
- Préférences avancées (avoid/prefer zones)
- Import GPX existant (pour analyse d'un parcours connu)
- Partage par URL (encodé dans le hash du lien, sans serveur)

---

## 10. Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Brouter rate-limited ou down | Moyenne | Haut | Fallback OSRM + retry exponentiel + message clair "service indisponible, réessaie plus tard" |
| Distance générée souvent hors tolérance ±5 % | Moyenne | Moyen | Ajustement itératif (max 4 tentatives), si toujours hors tolérance présenter le parcours avec la vraie distance et proposer "régénérer" |
| Tuiles OSM trop chargées en zone urbaine = lent | Faible | Faible | Lazy-load + spinner + suggérer Carto en alternative |
| Bundle bloat (Leaflet + plugins) | Moyenne | Moyen | Lazy-load route-only, mesurer bundle avant/après |
| Utilisateur désactive géoloc | Haute | Faible | Fallback : champ "adresse de départ" |
| Couverture rurale / trail technique faible (Brouter parfois manque de chemins privés) | Moyenne | Moyen | Documenter, prévoir l'import GPX manuel en v3 |
| Question RGPD sur "envoi de coords à serveur tiers" | Faible mais sérieux | Haut | Toggle Settings + page `/legal/services` + mention dans CGU |

---

## 11. Open questions à trancher avant Phase 1

- [ ] **Q1** — Lib carte : Leaflet (recommandé) ou MapLibre ? *(Décision : Leaflet sauf si on prévoit une montée en charge visuelle forte)*
- [ ] **Q2** — Fallback routing si Brouter down : OSRM ou bloquer ? *(Recommandation : OSRM avec message dégradé "profils basique, pas de surface preference")*
- [ ] **Q3** — Stockage : combien de routes max en localStorage ? *(Recommandation : 100, comme les plans + warning au-delà)*
- [ ] **Q4** — Doit-on demander à l'utilisateur de définir une "position habituelle" dans son profil pour pré-remplir UC1/UC6 ? *(Recommandation : oui, dans `RunnerProfile` — champ optionnel `homeLocation`)*
- [ ] **Q5** — Le toggle Settings doit être ON ou OFF par défaut ? *(Recommandation : OFF — aligner sur la philosophie privacy-first, l'utilisateur active explicitement la première fois)*
- [ ] **Q6** — On distingue tuiles "light" (Carto Positron) en mode clair vs "dark" en mode sombre ? *(Recommandation : oui, cohérence avec le thème)*
- [ ] **Q7** — Doit-on attendre le merge de la PR #74 (multi-discipline) pour démarrer Phase 1, afin que UC1 supporte directement running + cycling ? *(Recommandation : oui — ajout d'un champ `discipline` au type `Route` est trivial si la PR est mergée, et évite un refactor plus tard)*

---

## 12. Lien avec la philosophie Zoned

Cette feature respecte les 5 piliers :

| Pilier | Comment |
|---|---|
| Local-first | Routes en localStorage, profils en localStorage, exports GPX/FIT en local |
| Zero-account | Pas d'auth, pas d'identifiant utilisateur envoyé |
| Zero-tracking | Tradeoff position envoyée au routing public assumé et toggleable |
| 100 % gratuit | Stack OSM/Brouter/OpenTopoData/Nominatim entièrement gratuit |
| Science-based | Algorithme explicable, pas de "black box ML", pas de recommandations magiques |
| Bilingue FR-first | Nouveau namespace en parité dès le MVP |

Une seule entorse "raisonnable" est faite : la position de l'utilisateur est envoyée
à un service tiers le temps d'une requête HTTPS. Cette entorse est **explicite,
documentée, désactivable, et correspond à un standard de l'industrie**. Sans elle,
la feature n'existe simplement pas. Le tradeoff est clairement gagnant.

---

## 13. Ce qui reste à valider avec le mainteneur

- Validation de la vision et du périmètre MVP
- Confirmation de l'ordre de priorité vs autres chantiers (PR #74, Trail/Ultra #51, etc.)
- Décision sur les Open Questions Q1-Q7
- Définition d'un budget temps acceptable

Une fois ce brief validé, l'étape suivante est un **PRD léger** (`design-artifacts/E-PRD/`)
qui découpe les phases en stories implémentables, et un **plan de spike** technique
sur Brouter avant tout commit de code.

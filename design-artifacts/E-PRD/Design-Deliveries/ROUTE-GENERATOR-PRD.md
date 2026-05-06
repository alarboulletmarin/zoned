# Product Requirements Document — Route Generator

> **Status** : Draft v1
> **Auteur** : Andréa (avec assistance Claude Code)
> **Date** : 2026-05-06
> **Dépend de** : `design-artifacts/A-Product-Brief/ROUTE-GENERATOR-BRIEF.md` (v1)
> **Hypothèse** : la PR #74 (multi-discipline foundation, type `Discipline`) est mergée avant le démarrage de la Phase 1.

---

## 1. Résumé exécutif

Le Route Generator (RG) ajoute à Zoned une capacité de génération de parcours réels (boucle, aller-retour, point-à-point) à partir de la position de l'utilisateur, en cohérence avec sa séance Zoned. Le MVP couvre UC1, UC2, l'export GPX et le stockage local (cf brief §7). Il s'appuie sur Brouter (routing), Nominatim (géocodage), Leaflet (carte) — tout gratuit, tout open. La feature dépend du merge préalable de la PR #74 pour intégrer le champ `discipline` au type `Route`. **Effort total estimé : ~10 semaines mainteneur solo, découpées en 4 phases** (3 sprints MVP, 2 sprints v1, 3 sprints v2, futur v3).

---

## 2. Personas

### P1 — Marc, coureur urbain (35 ans, Paris)
- **Situation** : 3 sorties/semaine depuis chez lui, plan Zoned 10K en cours.
- **Douleur** : tourne autour des mêmes 4-5 boucles connues. S'ennuie. Improvise mal les distances de tempo.
- **Comment le RG aide** : génère une boucle 8 km plate depuis son adresse, l'exporte sur sa montre Garmin, varie ses parcours sans effort cognitif.

### P2 — Léa, trail runner en déplacement (29 ans, voyage en montagne)
- **Situation** : passe un week-end à Chamonix, veut faire 12 km / 600 m D+ depuis son gîte.
- **Douleur** : ouvre OpenRunner, traçage manuel à la souris, 20 minutes perdues.
- **Comment le RG aide** : entre son adresse + contraintes (D+, surface trail), récupère un parcours en 30 s, l'exporte en GPX pour sa montre.

### P3 — Sofia, coureuse en plan structuré (42 ans, Lyon)
- **Situation** : suit un plan semi-marathon Zoned, calendrier sur l'app, séance quotidienne consultée le matin.
- **Douleur** : voit "10×400 m VMA route plate" sans savoir où l'exécuter localement. Annule la séance ou la fait sur tapis.
- **Comment le RG aide** : depuis la séance du plan, un bouton "Suggérer un parcours" propose une boucle plate adaptée et l'attache à la session (UC6).

### P4 — Tom, cycliste (post PR #74) (38 ans, Lille)
- **Situation** : utilise Zoned côté plan vélo (introduit par la PR #74). Veut un parcours de 40 km à intensité Z2.
- **Douleur** : Strava Routes payant, Komoot payant pour les options sérieuses.
- **Comment le RG aide** : génère un parcours discipline=cycling, profil vélo Brouter (`fastbike`), même UI que running.

---

## 3. User Stories par phase

### Phase 1 — MVP (3 sprints d'1 semaine)

#### US-1.1 — Génération boucle running depuis position GPS
**En tant que** Marc (coureur urbain)
**je veux** générer une boucle de N km à partir de ma position GPS du navigateur
**afin de** sortir courir immédiatement sans manipuler une autre app.

Critères d'acceptation :
- **Given** la permission de géoloc accordée, **when** je saisis "8 km" et clique "Générer", **then** une boucle est tracée sur la carte en moins de 10 s avec une distance dans la fourchette 7,6–8,4 km (±5 %).
- La boucle est une vraie boucle : `start === end ±50 m`.
- Si la distance générée est hors tolérance après 4 tentatives d'ajustement (cf brief §8 algorithme), le résultat est quand même affiché avec un badge "approximatif" et un bouton "Régénérer".

Notes techniques : cf brief §8 — algorithme `loop.ts`, profil Brouter `fastrunning`. Seed déterministe pour permettre régénération différente.
Estimation : **5 SP**.

#### US-1.2 — Génération boucle running depuis adresse saisie
**En tant que** Léa (en déplacement)
**je veux** saisir une adresse de départ (ex: nom du gîte) au lieu d'utiliser le GPS
**afin de** planifier un parcours sans être encore sur place.

Critères d'acceptation :
- Le champ adresse est debouncé à ≥ 1 s (rate-limit Nominatim).
- Auto-complétion via Nominatim, jusqu'à 5 suggestions.
- Si aucune correspondance : message "Adresse introuvable, précisez ville ou code postal".
- Le résultat sélectionné est mis en cache `sessionStorage` pour la session.

Notes techniques : `geocoding.ts` (cf brief §8 stack code).
Estimation : **3 SP**.

#### US-1.3 — Génération aller-retour
**En tant que** Léa (terrain inconnu)
**je veux** générer un aller-retour de N km dans une direction donnée
**afin de** explorer un côté précis sans risquer de me perdre.

Critères d'acceptation :
- **Given** un point de départ et une distance cible, **when** je sélectionne "Aller-retour" + une direction (libre / N/S/E/O / cap manuel en degrés), **then** un AR est tracé dont la distance totale est dans la cible ±5 %.
- Option "éviter le retour identique" disponible (la trace retour passe par un chemin différent quand possible).

Notes techniques : `algorithms/outAndBack.ts`.
Estimation : **5 SP**.

#### US-1.4 — Visualisation carte + tracé
**En tant que** tout utilisateur
**je veux** voir le parcours sur une carte interactive
**afin de** vérifier visuellement qu'il me convient avant export.

Critères d'acceptation :
- Carte Leaflet rendue en lazy-load (chargement uniquement sur `/routes/*`).
- Trace polyline visible, marqueur de départ/arrivée distincts.
- Zoom/pan fonctionnels au tactile et clavier (flèches, +/-).
- Tuiles OSM par défaut, fallback Carto Positron si OSM lent.
- Attribution OSM affichée en footer.

Notes techniques : `RouteMap.tsx` (cf brief §8). Thème clair/sombre via tuiles dédiées (Q6 du brief).
Estimation : **5 SP**.

#### US-1.5 — Profil dénivelé
**En tant que** Léa (trail)
**je veux** voir le profil altimétrique du parcours
**afin de** anticiper l'effort et la difficulté.

Critères d'acceptation :
- Graphique Recharts (déjà dans le projet) en dessous de la carte.
- Axe X = distance cumulée (km), axe Y = altitude (m).
- D+ total et D− total affichés dans une carte récap (RouteSummaryCard).
- Données issues du retour Brouter (élévation par segment, pas de requête séparée Open-Elevation au MVP).

Notes techniques : `ElevationChart.tsx`, `elevation.ts` (passthrough Brouter au MVP).
Estimation : **3 SP**.

#### US-1.6 — Export GPX
**En tant que** Marc (utilisateur Garmin)
**je veux** exporter le parcours en GPX
**afin de** l'envoyer sur ma montre.

Critères d'acceptation :
- Bouton "Télécharger GPX" dans la carte récap.
- Fichier GPX 1.1 valide (validable par xmllint), contient tous les points `<trkpt>` avec lat/lon/ele.
- Nommage : `zoned-route-<distance>km-<YYYYMMDD>.gpx`.
- Le GPX est généré côté client, pas de requête réseau supplémentaire.

Notes techniques : `src/lib/export/gpx.ts` (nouveau format export).
Estimation : **3 SP**.

#### US-1.7 — Sauvegarde locale du parcours
**En tant que** tout utilisateur
**je veux** sauvegarder un parcours généré
**afin de** le retrouver plus tard sans le régénérer.

Critères d'acceptation :
- Bouton "Sauvegarder" dans la carte récap, demande un nom (default = "Boucle 8 km — date").
- Stockage en `localStorage` clé `zoned-routes`.
- Limite max 100 routes (cf brief Q3) ; au-delà, warning "Limite atteinte, supprimez d'anciennes routes" + lien vers `/routes/mine`.
- L'objet sauvegardé contient tous les points (offline consultable, brief §6 contraintes techniques).
- Le parcours est ajouté à `backup.ts` (export complet des données utilisateur).

Notes techniques : `routeStorage.ts`, intégration `backup.ts`.
Estimation : **3 SP**.

#### US-1.8 — Liste mes parcours
**En tant que** tout utilisateur
**je veux** voir la liste de mes parcours sauvegardés
**afin de** réutiliser, exporter ou supprimer.

Critères d'acceptation :
- Page `/routes/mine` liste les routes en cards (RouteCard) avec : nom, distance, D+, surface, date.
- Tri par date (récent → ancien), filtre par discipline (after PR #74).
- Click sur une card ouvre `/routes/:id` (US à venir v1, mais lien fonctionnel dès MVP).
- Bouton "Supprimer" avec confirmation.
- État vide : illustration + CTA "Générer mon premier parcours".

Notes techniques : `MyRoutesPage.tsx`, `RouteCard.tsx`, hook `useRoutes`.
Estimation : **3 SP**.

**Total Phase 1 : 30 SP** (≈ 3 sprints d'1 semaine pour mainteneur solo).

---

### Phase 2 — v1 (2 sprints)

#### US-2.1 — Dénivelé contrôlé
**En tant que** Léa (séance de côtes)
**je veux** spécifier une fourchette de D+ (min/max)
**afin de** obtenir un parcours qui colle à ma séance terrain.

Critères d'acceptation :
- Champs "D+ minimum" et "D+ maximum" optionnels dans le form.
- L'algo tente jusqu'à 5 candidats pour respecter la fourchette.
- Si impossible : message clair "Pas assez de relief dans un rayon de N km, étends la zone ou accepte un parcours plat" + bouton "Générer plat".

Notes techniques : extension de `loop.ts` pour scoring multi-critères ; cf brief §7 UC3.
Estimation : **5 SP**.

#### US-2.2 — Point-to-point avec détour
**En tant que** Marc (commute running)
**je veux** un parcours de chez moi à la gare en 10 km au lieu des 4 directs
**afin de** allonger en faisant un détour.

Critères d'acceptation :
- Champs `startPoint` et `endPoint` distincts.
- Si `distanceKm < distanceDirecte` : erreur claire avec la distance directe affichée.
- Détour intelligent : pas de zigzag visible (heuristique simple : un seul waypoint de détour à 90° de l'axe direct).

Notes techniques : `algorithms/pointToPoint.ts` (cf brief §7 UC4, §8).
Estimation : **5 SP**.

#### US-2.3 — Multi-suggestions (top-3)
**En tant que** Marc
**je veux** voir 3 propositions différentes pour les mêmes contraintes
**afin de** choisir celle qui me plaît le plus.

Critères d'acceptation :
- Toggle "Proposer 3 variantes" dans le form.
- 3 routings parallèles déclenchés en respectant le rate-limit Brouter.
- Score de variété affiché (vert/jaune/rouge) selon dissimilarité géographique (cf brief §7 UC7).
- L'utilisateur sélectionne sa préférée et passe à l'export/save.

Notes techniques : `scorer.ts`.
Estimation : **8 SP**.

#### US-2.4 — Settings > Privacy : toggle activation génération
**En tant que** utilisateur soucieux de privacy
**je veux** activer/désactiver explicitement la génération (qui envoie ma position à un service tiers)
**afin de** contrôler ce qui sort de mon navigateur.

Critères d'acceptation :
- Toggle dans `/settings` section Privacy, **OFF par défaut** (cf brief Q5).
- Au premier accès à `/routes`, modal d'explication + activation.
- Lien vers `/legal/services` (page à créer en livrable annexe, cf §13).
- Si OFF, la page `/routes` affiche un bandeau "Active la génération dans Settings > Privacy" sans formulaire.

Notes techniques : extension `useSettings`, nouvelle clé `enableRouteGeneration: boolean`.
Estimation : **3 SP**.

**Total Phase 2 : 21 SP**.

---

### Phase 3 — v2 (3 sprints)

#### US-3.1 — Workout-aware (séance Zoned → contraintes terrain)
**En tant que** Sofia (coureuse en plan)
**je veux** que le RG comprenne ma séance et propose un parcours adapté
**afin de** ne pas réfléchir aux contraintes terrain.

Critères d'acceptation :
- Donné un `WorkoutTemplate` (id de séance), le RG dérive automatiquement : surface préférée, fourchette D+, distance cible (depuis `targetDistanceKm` ou heuristique sur `typicalDuration`).
- Mapping conforme au brief §7 UC5 (VMA → plat ; Côtes → D+ marqué ; Trail → ratio sentiers > 50 %).
- Si la séance ne fournit pas `targetDistanceKm`, fallback sur durée + allure Z2 estimée.

Notes techniques : `algorithms/workoutAware.ts` (wrapper qui dérive `RouteConstraints` depuis `WorkoutTemplate`).
Estimation : **8 SP**.

#### US-3.2 — Attacher route à session du plan
**En tant que** Sofia
**je veux** depuis ma séance du plan, générer/attacher un parcours
**afin de** retrouver le parcours quand je consulte la séance le matin.

Critères d'acceptation :
- Bouton "Suggérer un parcours" sur la page `PlanSessionDetail`.
- Le parcours généré est sauvegardé puis attaché : `PlanSession.routeId = route.id`.
- Persistence : modification du `TrainingPlan` en `localStorage`.
- Bouton "Détacher" disponible sans supprimer la route.

Notes techniques : extension de `PlanSession` (`routeId?: string`), composant `PlanSessionRouteAttacher.tsx`.
Estimation : **5 SP**.

#### US-3.3 — Mini-map dans la session du plan
**En tant que** Sofia
**je veux** voir un aperçu du parcours dans la fiche séance du calendrier
**afin de** valider visuellement avant de partir.

Critères d'acceptation :
- Si `session.routeId` existe, afficher une mini-map (statique ou interactive simple) sur la fiche.
- Lien "Voir détail" → `/routes/:id`.
- La mini-map utilise la même lib Leaflet déjà chargée (pas de dépendance ajoutée).

Notes techniques : variant compact de `RouteMap.tsx` avec interactions désactivables.
Estimation : **3 SP**.

#### US-3.4 — Support cycling (PR #74 mergée)
**En tant que** Tom (cycliste)
**je veux** générer un parcours vélo
**afin de** utiliser Zoned pour mes sorties cyclistes aussi.

Critères d'acceptation :
- Sélecteur discipline dans le form du RG (running / cycling), default = discipline du plan actif ou running.
- Profil Brouter `fastbike` (cycling) vs `fastrunning` (running).
- Les routes sauvegardées portent `route.discipline` (champ obligatoire après PR #74).
- Filtre par discipline disponible dans `/routes/mine`.

Notes techniques : extension du type `Route`, ajout du paramètre `discipline` dans toute la chaîne d'algos.
Estimation : **5 SP**.

**Total Phase 3 : 21 SP**.

---

### Phase 4 — v3 (futur, scope ouvert)

Listing court (cf brief §9 Phase 4) :
- **US-4.1** — Préférences avancées (avoid zones, prefer parks/forêt/eau) (UC8).
- **US-4.2** — Import GPX existant pour analyser un parcours connu.
- **US-4.3** — Partage URL encodé en hash (sans serveur, format compressé).

Pas d'estimation à ce stade.

---

## 4. Critères d'acceptation globaux

| Critère | Cible | Mesure |
|---|---|---|
| **Performance génération** | < 10 s pour 95 % des cas (urbain dense + ruraux) | Tracking event `route_generation_duration_ms` (Vercel Analytics) |
| **Tolérance distance** | ±5 % sur 90 % des générations | Test automatisé, historique sur 50 cas représentatifs |
| **Bundle impact** | ≤ 50 KB gzip ajoutés au bundle principal | `bun run build` mesure avant/après ; Leaflet en lazy-import dynamique |
| **A11y** | Niveau AA WCAG 2.1 sur les pages RG | Navigation clavier complète, ARIA labels sur la carte (`role="application"`, `aria-label`), skip-to-content présent |
| **i18n** | Parité FR/EN dès le MVP | `bun run check:i18n` passe sans erreur sur namespace `routes.json` |
| **PWA / offline** | Route déjà générée consultable offline | Service worker cache + données stockées localement (points + élévation) |
| **Tests** | > 80 % coverage sur algorithmes purs (`loop`, `outAndBack`, `pointToPoint`, `scorer`) | Vitest, intégration sur flow GPX export |
| **TS strict** | Pas de `any`, pas de `@ts-ignore` | `bun run build` strict mode |

---

## 5. Découpage en issues GitHub recommandé

Issues à créer sur le dépôt `alarboulletmarin/zoned`. Chaque issue couvre 1 à 2 stories. Labels existants à utiliser : `enhancement`, `differentiation`, `UX`, `acquisition`, `SEO`, `quick-win`.

| # | Titre | Labels | Stories | Dépendances |
|---|---|---|---|---|
| 1 | `[Feature] Route Generator — Spike technique Brouter` | `enhancement`, `differentiation` | (Phase 0 brief §9) | — |
| 2 | `[Feature] Route Generator — Types et storage local` | `enhancement` | US-1.7 (partie type) | #1 |
| 3 | `[Feature] Route Generator — Geocoding + Routing wrappers` | `enhancement` | (infra) | #2 |
| 4 | `[Feature] Route Generator — Algorithme boucle (UC1)` | `enhancement`, `differentiation` | US-1.1 | #3 |
| 5 | `[Feature] Route Generator — Algorithme aller-retour (UC2)` | `enhancement` | US-1.3 | #3 |
| 6 | `[Feature] Route Generator — Page /routes (form + map + profile)` | `enhancement`, `UX` | US-1.2, US-1.4, US-1.5 | #4, #5 |
| 7 | `[Feature] Route Generator — Export GPX` | `enhancement` | US-1.6 | #4 |
| 8 | `[Feature] Route Generator — Sauvegarde + page /routes/mine` | `enhancement`, `UX` | US-1.7, US-1.8 | #2, #6 |
| 9 | `[Feature] Route Generator — i18n FR/EN namespace routes` | `enhancement` | (transverse Phase 1) | #6 |
| 10 | `[Feature] Route Generator — Dénivelé contrôlé (UC3)` | `enhancement`, `differentiation` | US-2.1 | #4 |
| 11 | `[Feature] Route Generator — Point-to-point (UC4)` | `enhancement` | US-2.2 | #3 |
| 12 | `[Feature] Route Generator — Multi-suggestions (UC7)` | `enhancement`, `UX` | US-2.3 | #4 |
| 13 | `[Feature] Route Generator — Settings Privacy toggle` | `enhancement`, `UX` | US-2.4 | #6 |
| 14 | `[Feature] Route Generator — Workout-aware (UC5)` | `enhancement`, `differentiation`, `retention` | US-3.1 | #4, #10 |
| 15 | `[Feature] Route Generator — Intégration plan (UC6)` | `enhancement`, `retention` | US-3.2, US-3.3 | #14 |
| 16 | `[Feature] Route Generator — Support cycling` | `enhancement` | US-3.4 | #14, **PR #74 mergée** |

---

## 6. Spécifications techniques par module

### 6.1 `geocoding.ts`

```ts
export interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
  type: "address" | "poi" | "city";
}

export async function geocodeAddress(query: string): Promise<GeocodingResult[]>;
export async function reverseGeocode(lat: number, lon: number): Promise<string>;
```

- **Erreurs gérées** : timeout (> 5 s), 429 rate-limit (rejette avec message dédié), aucune correspondance (renvoie `[]`).
- **Cache** : `sessionStorage` clé `zoned-geo-<sha1(query)>`, TTL implicite (durée de la session navigateur).
- **Debounce** : géré dans le composant `RouteParametersForm.tsx`, ≥ 1 s avant appel.

### 6.2 `routing.ts`

```ts
export interface RoutingResult {
  points: Array<[lat: number, lon: number, ele: number]>;
  distanceKm: number;
  elevationGain: number;
  elevationLoss: number;
  durationSecEstimated: number;
}

export interface RoutingOptions {
  profile: "fastrunning" | "fastbike" | "trekking" | "trail";
  surface?: "road" | "trail" | "mixed";
}

export async function route(
  waypoints: Array<[lat: number, lon: number]>,
  options: RoutingOptions
): Promise<RoutingResult>;
```

- **Erreurs gérées** : Brouter timeout (> 10 s), 5xx, no-route-found (waypoint inaccessible), hors-couverture.
- **Fallback** : sur 2 erreurs Brouter consécutives, bascule OSRM avec message dégradé "profil basique, pas de surface preference" (cf brief Q2).
- **Retry** : exponentiel 1× / 2× backoff, max 2 retries.
- **Cache** : `sessionStorage` clé sur hash des waypoints + options, taille max 20 entrées (FIFO).

### 6.3 `elevation.ts`

```ts
export interface ElevationProfile {
  points: Array<{ distanceKm: number; elevationM: number }>;
  totalGain: number;
  totalLoss: number;
}

export function buildProfile(routePoints: RoutingResult["points"]): ElevationProfile;
```

- Au MVP : passthrough depuis Brouter (élévation déjà incluse). Pas d'appel externe.
- v3 (si Brouter dégradé) : option d'enrichissement via OpenTopoData, avec cache.
- **Erreurs** : si `points` < 2, renvoie profil vide.

### 6.4 `algorithms/loop.ts`

```ts
export async function generateLoop(
  start: LatLng,
  constraints: RouteConstraints,
  seed?: number
): Promise<Route>;
```

- Algorithme cf brief §8 (triangulation + ajustement itératif, max 4 tentatives).
- **Erreurs** : `RouteOutOfTolerance` (renvoie quand même la meilleure trace), `NoRouteFound` (impossible de tracer).

### 6.5 `algorithms/outAndBack.ts`

```ts
export async function generateOutAndBack(
  start: LatLng,
  constraints: RouteConstraints & { direction: number | "free"; avoidReturnIdentical?: boolean },
  seed?: number
): Promise<Route>;
```

- Cap manuel en degrés (0-359) ou direction libre (choisi aléatoirement par seed).
- Si `avoidReturnIdentical` : 2 routings (aller + retour différent), concaténation.

### 6.6 `algorithms/pointToPoint.ts`

```ts
export async function generatePointToPoint(
  start: LatLng,
  end: LatLng,
  constraints: RouteConstraints
): Promise<Route>;
```

- Si `targetKm < distanceDirecte` : throw `DistanceTooShortError` avec `directDistanceKm`.
- Sinon : ajoute 1 waypoint perpendiculaire au milieu pour atteindre la distance cible.

### 6.7 `algorithms/workoutAware.ts`

```ts
export function deriveConstraints(workout: WorkoutTemplate): RouteConstraints;

export async function generateForWorkout(
  workout: WorkoutTemplate,
  start: LatLng
): Promise<Route>;
```

- Mapping séance → contraintes selon brief §7 UC5.
- Surface préférée, fourchette D+, distance cible dérivée de `targetDistanceKm` ou de la durée moyenne × allure Z2.

### 6.8 `scorer.ts`

```ts
export function rankRoutes(routes: Route[]): Array<Route & { varietyScore: "high" | "mid" | "low" }>;
```

- Heuristique de dissimilarité géographique : distance moyenne entre traces (Hausdorff simplifiée).

---

## 7. Modèle de données

```ts
// src/types/route.ts

import type { Discipline } from "@/types"; // ajouté par PR #74

export type RouteSurface = "road" | "trail" | "mixed";
export type RouteShape = "loop" | "out-and-back" | "point-to-point";

export interface LatLng {
  lat: number;
  lon: number;
}

export interface RoutePoint {
  lat: number;
  lon: number;
  ele: number;       // mètres
  distanceKm: number; // distance cumulée depuis le départ
}

export interface RouteConstraints {
  distanceKm: number;
  shape: RouteShape;
  surface?: RouteSurface;
  elevationGainMin?: number;     // m, optionnel (UC3)
  elevationGainMax?: number;     // m, optionnel (UC3)
  direction?: number | "free";   // 0-359 ou libre (UC2)
  avoidReturnIdentical?: boolean; // UC2
  workoutId?: string;            // si workout-aware (UC5)
}

export interface Route {
  id: string;                    // nanoid
  name: string;                  // user-defined ou auto "Boucle 8km — 06/05/2026"
  discipline: Discipline;        // running | cycling | swimming (PR #74)
  shape: RouteShape;
  surface: RouteSurface;
  points: RoutePoint[];          // tous les points, offline-consultable
  distanceKm: number;
  elevationGain: number;         // m
  elevationLoss: number;         // m
  durationSecEstimated: number;  // estimation Brouter
  startPoint: LatLng;
  endPoint: LatLng;
  generatedAt: number;           // timestamp ms
  generatorVersion: 1;           // pour évolutions futures
  seed?: number;                 // pour permettre régénération identique
  workoutId?: string;            // si rattaché à une séance
  tags?: string[];               // user-defined (v1)
  notes?: string;                // user-defined (v1)
}
```

### Justification des champs

| Champ | Pourquoi |
|---|---|
| `id` (nanoid) | Cohérent avec les autres entités Zoned (workouts, plans). |
| `discipline` | Hypothèse PR #74 : permet de filtrer dans `/routes/mine`, dériver le profil Brouter. |
| `points[]` complet | Offline-consultable (brief §6 contrainte technique). |
| `distanceKm` réelle | Différente de `constraints.distanceKm` cible : ce qu'on a réellement obtenu. |
| `seed` | Permet la régénération identique pour debug + bouton "Variante" qui change le seed. |
| `generatorVersion` | Évolutions algorithmiques sans casser d'anciennes routes. |
| `workoutId` | UC5/UC6 : couplage séance ⇄ parcours. |

---

## 8. UI/UX wireframes ASCII

### Page `/routes` (génération)

```
+---------------------------------------------------------------+
| Header (TopBar Zoned)                                         |
+---------------------------------------------------------------+
|                                                               |
|  Génère ton parcours                                          |
|  ----------------------------------                           |
|                                                               |
|  Discipline:  [Running v]  [Cycling]  (PR #74)                |
|                                                               |
|  Départ:                                                      |
|   ( ) Ma position GPS                                         |
|   ( ) Adresse: [_____________________________] [autocomplete] |
|                                                               |
|  Type:    ( ) Boucle  ( ) Aller-retour  ( ) Point à point    |
|  Distance:[_8_] km        Surface: [Mixte v]                  |
|                                                               |
|  v Plus d'options (D+, direction, multi-suggestions)         |
|                                                               |
|  [  Générer  ]                                                |
|                                                               |
+---------------------------------------------------------------+
|                                                               |
|  +-----------------------------------+  +------------------+  |
|  |          CARTE LEAFLET             |  | Distance: 8,1km |  |
|  |                                    |  | D+:      45 m   |  |
|  |   [tracé du parcours]              |  | D-:      45 m   |  |
|  |                                    |  | Durée:  ~46 min |  |
|  |   [marker départ]                  |  |                  |  |
|  |                                    |  | [Sauvegarder]   |  |
|  |   © OpenStreetMap contributors     |  | [Exporter GPX]  |  |
|  +-----------------------------------+  | [Régénérer]     |  |
|                                          +------------------+  |
|                                                               |
|  +---------------------------------------------------------+  |
|  |  PROFIL DÉNIVELÉ (Recharts)                             |  |
|  |  altitude (m)                                           |  |
|  |    ___/\__/\___                                         |  |
|  |  __                  \__                                |  |
|  |  +--+--+--+--+--+--+--+--+ distance (km)                |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

### Page `/routes/:id` (détail)

```
+---------------------------------------------------------------+
| < Retour à mes parcours                                       |
+---------------------------------------------------------------+
|                                                               |
|  Boucle 8 km — 06/05/2026          [Renommer]  [Supprimer]   |
|  Tags: [matin] [tempo]                                        |
|                                                               |
|  +-----------------------------------+  +------------------+  |
|  |          CARTE                     |  | Distance: 8,1km |  |
|  |                                    |  | D+: 45 m        |  |
|  |          (interactive)              |  | Surface: route  |  |
|  |                                    |  | Discipline: run |  |
|  +-----------------------------------+  | Généré: 06/05    |  |
|                                          | Séance: VMA-014 |  |
|                                          |                  |  |
|                                          | [Exporter GPX]  |  |
|                                          | [Détacher       |  |
|                                          |  séance]        |  |
|                                          +------------------+  |
|                                                               |
|  +---------------------------------------------------------+  |
|  |  PROFIL DÉNIVELÉ                                        |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  Notes: [______________________________________________]      |
|                                                               |
+---------------------------------------------------------------+
```

### Page `/routes/mine` (liste)

```
+---------------------------------------------------------------+
| Mes parcours                              [+ Générer]         |
+---------------------------------------------------------------+
|                                                               |
|  Filtre: [Toutes disciplines v]   Tri: [Récent v]            |
|                                                               |
|  +-------------------+  +-------------------+                 |
|  | [mini-map]        |  | [mini-map]        |                 |
|  | Boucle 8km        |  | AR Forêt 12km     |                 |
|  | Running · route   |  | Trail · sentier   |                 |
|  | D+ 45m · 46 min   |  | D+ 320m · 1h45    |                 |
|  | 06/05/2026        |  | 04/05/2026        |                 |
|  | [Détail] [GPX]    |  | [Détail] [GPX]    |                 |
|  +-------------------+  +-------------------+                 |
|                                                               |
|  +-------------------+                                        |
|  | [mini-map]        |                                        |
|  | Tempo Parc 6km    |                                        |
|  | ...                |                                        |
|  +-------------------+                                        |
|                                                               |
+---------------------------------------------------------------+
```

---

## 9. Edge cases & erreurs

| Cas | Comportement attendu |
|---|---|
| **Permission GPS refusée** | Fallback automatique sur le champ "Adresse de départ", message non-bloquant "GPS désactivé, saisis ton adresse". |
| **Brouter timeout / down** | 2 retries exponentiels, puis fallback OSRM avec bandeau dégradé. Si OSRM échoue aussi : message "Service de routing indisponible, réessaie dans quelques minutes". |
| **Distance hors tolérance après 4 tentatives** | Affichage du parcours avec badge "approximatif (X,X km au lieu de Y km)" + bouton "Régénérer (seed différent)". |
| **Pays sans bonne couverture OSM** (rare, ex: certaines zones rurales africaines) | Message "Couverture cartographique limitée dans cette zone, envisage l'import GPX (v3)". |
| **localStorage plein** (au-delà de 100 routes ou quota navigateur ~5 MB) | Warning bloquant à la sauvegarde + bouton "Voir mes parcours" pour purger les anciens. Pas de purge automatique. |
| **Adresse introuvable** | Message "Adresse introuvable, précise la ville ou le code postal", pas de génération déclenchée. |
| **Distance cible < distance directe (point-to-point)** | Erreur claire avec affichage de la distance directe : "La distance directe est de X km. Choisis au moins Y km." |
| **Toggle Privacy OFF** | Page `/routes` affiche un bandeau d'activation sans formulaire ; bouton "Activer dans Settings". |
| **Connexion offline + tentative de génération** | Message "Génération nécessite une connexion. Tu peux consulter tes parcours déjà sauvegardés." |

---

## 10. Tests

### 10.1 Tests unitaires (Vitest)

| Fichier sous test | Tests clés |
|---|---|
| `loop.ts` | Triangulation correcte (3 angles ≈ 120° + jitter) ; ajustement itératif converge ; seed déterministe (même seed → même angles) ; invariant `start === end ±50 m` ; tolérance ±5 % atteinte sur 50 cas mockés. |
| `outAndBack.ts` | Distance retour incluse dans cible ; option `avoidReturnIdentical` génère 2 routings ; cap manuel respecté à ±10°. |
| `pointToPoint.ts` | Erreur si `targetKm < distanceDirecte` ; détour ajoute 1 waypoint au plus. |
| `workoutAware.ts` | Mapping séance VMA → surface road + D+ < 30 m ; mapping séance Côtes → D+ marqué ; mapping séance Trail → surface trail. |
| `scorer.ts` | Tri par dissimilarité ; classification high/mid/low cohérente. |
| `geocoding.ts` (mocké) | Cache hit/miss ; debounce respecté ; rate-limit 429 → erreur dédiée. |
| `routing.ts` (mocké) | Retry sur timeout ; fallback OSRM après 2 échecs ; cache FIFO max 20. |
| `routeStorage.ts` | Save/load/delete ; limite 100 routes ; intégration backup. |
| `gpx.ts` | Sortie XML valide (validation par parser) ; tous les `<trkpt>` présents ; nom de fichier conforme. |

### 10.2 Tests d'intégration

- **Flow GPX export complet** : génération mock → sauvegarde → export → parsing du GPX produit (vérifie nb points, structure XML).
- **Flow workout-aware** : depuis un `WorkoutTemplate` mock, dérivation de contraintes → génération mock → vérification que les contraintes sont propagées.
- **Flow plan attachment** : génération → sauvegarde → attachement à `PlanSession` → re-load du plan → vérification `routeId`.

### 10.3 Tests d'invariants (property-based, optionnel mais recommandé)

- Pour 100 entrées (start, distanceKm) tirées aléatoirement : la boucle vérifie `|start - end| < 50 m`.
- Pour 100 entrées : `|distanceGénérée - distanceCible| / distanceCible < 0.05` dans 90 % des cas.
- GPX exporté : nb de `<trkpt>` === nb de `route.points`.

### 10.4 Tests e2e (manuel au MVP)

Checklist manuelle sur Firefox + Chrome desktop + Safari iOS :
- Permission GPS → génération boucle 5 km.
- Adresse → génération AR 8 km.
- Sauvegarde → consultation `/routes/mine` → suppression.
- Export GPX → ouverture sur Garmin Connect Web (validation visuelle).

Si Playwright est introduit dans le projet plus tard, automatiser ces flows.

---

## 11. Métrique de succès post-merge

### À J+7 (sanity check)

- Bundle gzip principal : **+ ≤ 50 KB** (mesure avant/après).
- Aucune erreur en sentry/console critique sur la route `/routes/*`.
- `bun run check:i18n` passe sur namespace `routes.json`.

### À J+30 (adoption)

- Vercel Analytics events :
  - `route_page_view` (entrée sur `/routes`).
  - `route_generation_success` / `route_generation_failure` (avec raison).
  - `route_exported_gpx`.
  - `route_attached_to_session` (UC6).
- **Taux de visite** `/routes` parmi visiteurs uniques : > 15 %.
- **Conversion** depuis page séance plan → page RG : > 20 %.

### À J+30 (utilité)

- **50 % des plans actifs** ont au moins 1 route attachée (cible du brief §4).
- **20 % des séances complétées** sont associées à un parcours généré (cible brief §4).

### Signaux qualitatifs

- Mention dans /contribute issues / discussions GitHub.
- Mention organique sur Twitter / Reddit / forums running.
- 0 ticket bloquant en 30 jours.

---

## 12. Risques projet (tactiques, complémentaires au brief §10)

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| **Tablette ARM / iPad : Leaflet lent en zoom dense urbain** | Moyenne | Moyen | Limiter le nombre de tiles chargées, utiliser Carto Positron par défaut sur mobile, profiler si plainte utilisateur. |
| **Permissions PWA mobile (geoloc en background ou en standalone)** | Moyenne | Moyen | Tester sur iOS Safari (PWA installée) et Chrome Android dès Phase 1 ; documenter les limitations Safari (geoloc one-shot, pas de continu). |
| **Charge serveurs Brouter / OSRM / Nominatim si succès viral** | Faible | Haut | Cache agressif sessionStorage côté client ; documenter dans `/legal/services` ; envisager auto-hébergement Brouter si incident répété (futur). |
| **Plainte utilisateur "ma position envoyée à un serveur tiers"** | Faible | Haut | Toggle OFF par défaut + page transparence + article blog dédié (cf §13). |
| **Régression sur le bundle après ajout de Leaflet** | Moyenne | Moyen | Mesure CI : si `+ > 50 KB` gzip, fail build (script à ajouter dans `bun run build:check`). |
| **Maintenance long-terme du namespace i18n routes** | Faible | Faible | `bun run check:i18n` en CI bloque les divergences ; mainteneur unique ne touche qu'un endroit. |

---

## 13. Livrables annexes

- [ ] **Page `/legal/services`** — listing public des providers tiers (Nominatim, Brouter, OSRM, OpenStreetMap, Carto, OpenTopoData) avec lien vers leurs ToS et explication du tradeoff position. **Bloquant pour US-2.4**.
- [ ] **Mention dans `/about`** — paragraphe transparence sur le tradeoff position envoyée à des services publics.
- [ ] **Article blog `/learn/comment-fonctionne-le-route-generator`** — bilingue, ~800 mots, explique algorithme + tradeoffs + comment c'est gratuit. À publier en même temps que le merge MVP. SEO win.
- [ ] **Update `README.md`** — ajout dans la features list + screenshot.
- [ ] **Update `CHANGELOG.md`** — entrée dédiée à la v0.5.0 (ou version où le RG arrive).
- [ ] **OG image** dédiée à `/routes` (`bun run generate:og`).
- [ ] **Sitemap** : ajout des routes `/routes` et `/routes/mine` (mais pas `/routes/:id` — données locales).

---

## 14. Open issues with brief

Notes d'incohérences ou points à clarifier dans le brief avant Phase 1 (à valider avec le mainteneur) :

- **Q1 vs §8 contradiction sur élévation** : le brief §8 mentionne OpenTopoData *ou* le profil intégré Brouter comme source d'élévation, mais la stack code suggère un fichier `elevation.ts` séparé. Décision proposée dans ce PRD §6.3 : MVP = passthrough Brouter, OpenTopoData repoussé en v3 si dégradation observée. **À confirmer**.
- **§9 Phase 1 estime "2-3 semaines" pour MVP** : avec 30 SP découpés ici en 8 stories, et un mainteneur solo sur ~10h/semaine, l'estimation réaliste est plutôt 3-4 semaines. **À aligner**.
- **UC5 (workout-aware) "Trail → ratio sentiers > 50 %"** : Brouter ne renvoie pas un ratio surface natif. Implémentation possible via post-processing (parser tags OSM des way IDs), mais coût non-trivial. **À ajuster** : v2 = "préférer profil Brouter `trail`", reporter le calcul du ratio à une éventuelle v3.
- **UC6 attachement plan** : le brief mentionne `session.routeId`, mais `PlanSession` actuel (cf `src/types/plan.ts`) n'a pas ce champ. À ajouter explicitement (modification non-breaking, optional). **Décidé dans ce PRD US-3.2 — à valider**.
- **Q3 limite localStorage** : 100 routes proposées. Avec ~50 KB par route (points + élévation), 100 routes = 5 MB, soit le quota localStorage typique. **Risque de blocage silencieux** : prévoir test de quota effectif avant écriture, message clair si quota atteint avant 100. **À renforcer**.
- **Q7 PR #74** : ce PRD assume la PR mergée. Si elle est repoussée, l'US-3.4 (cycling) tombe et le champ `route.discipline` devient un littéral `"running"` constant pour le MVP. **Coût de migration faible**, à garder en tête.

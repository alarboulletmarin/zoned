# Cartographie des icônes — Lucide → Material Symbols (Sharp)

**Phase 1 de la migration. Aucun code applicatif n'a été modifié :** ce document
est la table d'arbitrage à valider avant la génération (phase 2).

- **Cible :** `@material-symbols/svg-400` v0.45.9, dossier `sharp/`, poids 400.
- **Licence :** Apache 2.0 (© Google). Le paquet ne fournit aucun fichier NOTICE.
- **Vérification :** chaque nom ci-dessous a été confirmé par un `ls` réel dans
  `node_modules/@material-symbols/svg-400/sharp/`. Aucun nom ne vient de mémoire.
- **Source de vérité machine :** `scripts/data/icon-mapping.csv` (lu par le générateur).

## Résumé

| | |
|---|---|
| Exports actuels | 112 |
| Correspondance exacte | 98 |
| Correspondance approchante | 12 |
| Manquants | 2 (`GithubIcon`, `StravaIcon`) |
| Variante `-fill` disponible | 110 / 110 icônes mappées |

## Différences de géométrie

| | Actuel (Lucide) | Cible (Material Sharp) |
|---|---|---|
| viewBox | `0 0 24 24` | `0 -960 960 960` |
| Rendu | contour, `stroke="currentColor"`, `strokeWidth={2}` | tracé plein, `fill="currentColor"` |
| Terminaisons | `strokeLinecap` / `strokeLinejoin` : `round` | sans objet |
| Variante pleine | inexistante | `<nom>-fill.svg` |

## Points d'arbitrage

### 1. Les deux manquants : logos de marque

Material Symbols ne publie pas de logos tiers. `GithubIcon` et `StravaIcon` n'ont
donc aucun équivalent, et je ne dessine rien à la main. État actuel :

- `StravaIcon` — déjà un tracé de marque en `fill="currentColor"`, viewBox 24.
  Il n'a jamais été une icône Lucide.
- `GithubIcon` — actuellement le tracé **Lucide** (contour, strokeWidth 2). C'est le
  seul reliquat Lucide qui subsisterait à l'exécution après migration, ce qui maintient
  l'obligation de licence ISC de façon permanente et non plus seulement historique.

Trois options, à trancher :

| Option | Effet |
|---|---|
| **A.** Conserver les deux tels quels, hors pipeline de génération | Le plus simple. Maintient la dépendance ISC vivante pour GitHub. |
| **B.** Conserver Strava, remplacer le tracé GitHub par le logo officiel Octicons (MIT) | Supprime tout tracé Lucide du runtime. Ajoute une 3ᵉ licence à créditer. |
| **C.** Supprimer les deux exports | Hors périmètre : casserait des sites d'appel. |

Sans arbitrage de ta part, la phase 2 partira sur **l'option A** (préservation à
l'identique, hors génération), qui respecte l'interdit « ne pas dessiner d'icône maison ».

### 2. Les 12 correspondances approchantes

Aucune n'est un bouche-trou : le concept existe, seule la métaphore graphique diffère.
Celles qui méritent un œil, avec leur contexte d'usage réel :

| Export | Proposé | Contexte dans Zoned | Alternative si tu préfères |
|---|---|---|---|
| `Sparkles` | `star_shine` | génération assistée, semaines | `wand_shine` |
| `Mountain` | `landscape` | catégorie « côtes », plans trail | `mountain_flag`, `hiking` |
| `TreePine` | `forest` | catégorie « trail » | `park`, `nature` |
| `Crosshair` | `my_location` | catégorie « fartlek » | `center_focus_strong`, `adjust` |
| `Rocket` | `rocket_launch` | catégorie « VMA / VO2max » | `rocket` |
| `Brain` | `psychology` | sections science, zones | `neurology`, `cognition` |
| `Droplets` | `water_drop` | hydratation (guide nutrition) | `water_drops` (deux gouttes, plus fidèle) |
| `Share` | `share` | partage de séance / semaine | `ios_share` (plus fidèle au tracé Lucide) |
| `Rows3` | `view_stream` | mode d'affichage « focus » | `view_agenda`, `density_medium` |
| `Grid3x3` | `grid_on` | mode d'affichage « compact » | `view_module`, `apps` |
| `Library` | `library_books` | bibliothèque de séances | `local_library` |
| `CalendarOff` | `event_busy` | jour sans séance | `free_cancellation` |

### 3. Doublons dans le fichier actuel

`Check` / `CheckIcon` et `Circle` / `CircleIcon` sont deux paires de tracés
strictement identiques. Les quatre exports sont conservés (aucun site d'appel touché) ;
ils pointeront simplement sur le même SVG source.

### 4. Exports jamais importés

`Bell`, `Mail`, `Users`, `Languages`, `Minus`, `PanelLeftClose`, `PanelLeftOpen` ne
sont importés nulle part dans `src/`. Ils sont **conservés et migrés** — je ne supprime
pas d'export sans validation. Signalé au cas où tu voudrais les retirer séparément.

## Table de correspondance complète

| Export actuel | Nom Material (`sharp/`) | Variante `-fill` | Statut | Note |
|---|---|---|---|---|
| `Menu` | `menu` | oui | exact | — |
| `X` | `close` | oui | exact | — |
| `Lock` | `lock` | oui | exact | — |
| `LockOpen` | `lock_open` | oui | exact | — |
| `Home` | `home` | oui | exact | — |
| `ArrowRight` | `arrow_forward` | oui | exact | — |
| `ArrowLeft` | `arrow_back` | oui | exact | — |
| `ArrowUp` | `arrow_upward` | oui | exact | — |
| `ChevronLeft` | `chevron_left` | oui | exact | — |
| `ChevronRight` | `chevron_right` | oui | exact | — |
| `ChevronDown` | `keyboard_arrow_down` | oui | exact | `expand_more` absent du paquet |
| `ChevronUp` | `keyboard_arrow_up` | oui | exact | `expand_less` absent du paquet |
| `ExternalLink` | `open_in_new` | oui | exact | — |
| `PanelLeftClose` | `left_panel_close` | oui | exact | export jamais importé |
| `PanelLeftOpen` | `left_panel_open` | oui | exact | export jamais importé |
| `LayoutGrid` | `grid_view` | oui | exact | — |
| `Rows3` | `view_stream` | oui | **approchant** | trois bandes horizontales au lieu de trois rangées pleine largeur |
| `Grid3x3` | `grid_on` | oui | **approchant** | grille 4×4 au lieu de 3×3 |
| `List` | `format_list_bulleted` | oui | exact | — |
| `Search` | `search` | oui | exact | — |
| `Filter` | `filter_alt` | oui | exact | — |
| `Download` | `download` | oui | exact | — |
| `Upload` | `upload` | oui | exact | — |
| `Save` | `save` | oui | exact | — |
| `Trash2` | `delete` | oui | exact | — |
| `RotateCcw` | `rotate_left` | oui | exact | alternative sémantique : `restart_alt` |
| `Settings` | `settings` | oui | exact | — |
| `Heart` | `favorite` | oui | exact | — |
| `Pencil` | `edit` | oui | exact | — |
| `Plus` | `add` | oui | exact | — |
| `Minus` | `remove` | oui | exact | export jamais importé |
| `Copy` | `content_copy` | oui | exact | — |
| `Share` | `share` | oui | **approchant** | Lucide = flèche hors boîte (proche de `ios_share`), Material = nœuds reliés |
| `Eye` | `visibility` | oui | exact | — |
| `EyeOff` | `visibility_off` | oui | exact | — |
| `Check` | `check` | oui | exact | — |
| `CheckIcon` | `check` | oui | exact | doublon de `Check` dans le fichier actuel |
| `Circle` | `circle` | oui | exact | — |
| `CircleIcon` | `circle` | oui | exact | doublon de `Circle` dans le fichier actuel |
| `MoreHorizontal` | `more_horiz` | oui | exact | — |
| `MoreVertical` | `more_vert` | oui | exact | — |
| `Maximize2` | `open_in_full` | oui | exact | — |
| `Minimize2` | `close_fullscreen` | oui | exact | — |
| `ArrowLeftRight` | `swap_horiz` | oui | exact | — |
| `Undo2` | `undo` | oui | exact | — |
| `Redo2` | `redo` | oui | exact | — |
| `RefreshCw` | `refresh` | oui | exact | — |
| `Loader2` | `progress_activity` | oui | exact | arc de spinner, compatible avec `animate-spin` |
| `Shuffle` | `shuffle` | oui | exact | — |
| `Send` | `send` | oui | exact | — |
| `Link2` | `link` | oui | exact | — |
| `Info` | `info` | oui | exact | — |
| `AlertTriangle` | `warning` | oui | exact | — |
| `Shield` | `shield` | oui | exact | — |
| `Code` | `code` | oui | exact | — |
| `Star` | `star` | oui | exact | — |
| `Bell` | `notifications` | oui | exact | export jamais importé |
| `Mail` | `mail` | oui | exact | export jamais importé |
| `Users` | `group` | oui | exact | export jamais importé |
| `UserRound` | `person` | oui | exact | — |
| `Languages` | `translate` | oui | exact | export jamais importé |
| `Moon` | `dark_mode` | oui | exact | — |
| `Sun` | `light_mode` | oui | exact | — |
| `Image` | `image` | oui | exact | — |
| `FileText` | `description` | oui | exact | — |
| `Watch` | `watch` | oui | exact | — |
| `Sparkles` | `star_shine` | oui | **approchant** | `auto_awesome` absent de ce paquet, `star_shine` est son remplaçant amont |
| `Lightbulb` | `lightbulb` | oui | exact | — |
| `Book` | `book` | oui | exact | — |
| `BookOpen` | `menu_book` | oui | exact | — |
| `GraduationCap` | `school` | oui | exact | — |
| `Library` | `library_books` | oui | **approchant** | rayonnage de livres au lieu de colonnes de temple |
| `Calculator` | `calculate` | oui | exact | — |
| `Calendar` | `calendar_today` | oui | exact | — |
| `CalendarDays` | `calendar_month` | oui | exact | — |
| `CalendarRange` | `date_range` | oui | exact | — |
| `CalendarOff` | `event_busy` | oui | **approchant** | calendrier barré d'une croix |
| `Clock` | `schedule` | oui | exact | — |
| `Timer` | `timer` | oui | exact | — |
| `Gauge` | `speed` | oui | exact | — |
| `Target` | `target` | oui | exact | — |
| `Crosshair` | `my_location` | oui | **approchant** | réticule avec point central |
| `Compass` | `explore` | oui | exact | — |
| `MapPin` | `location_on` | oui | exact | — |
| `Flag` | `flag` | oui | exact | — |
| `Route` | `route` | oui | exact | — |
| `Mountain` | `landscape` | oui | **approchant** | paysage montagneux au lieu du triangle seul |
| `TreePine` | `forest` | oui | **approchant** | bosquet au lieu d'un sapin isolé |
| `Footprints` | `footprint` | oui | exact | — |
| `Dumbbell` | `fitness_center` | oui | exact | — |
| `Activity` | `vital_signs` | oui | exact | — |
| `HeartPulse` | `ecg_heart` | oui | exact | — |
| `Flame` | `local_fire_department` | oui | exact | — |
| `Rocket` | `rocket_launch` | oui | **approchant** | fusée verticale avec flammes, alternative : `rocket` |
| `Zap` | `bolt` | oui | exact | — |
| `TrendingUp` | `trending_up` | oui | exact | — |
| `Leaf` | `eco` | oui | exact | — |
| `Droplets` | `water_drop` | oui | **approchant** | une goutte au lieu de deux, alternative : `water_drops` |
| `Utensils` | `restaurant` | oui | exact | — |
| `Coffee` | `coffee` | oui | exact | — |
| `Pill` | `pill` | oui | exact | — |
| `Snowflake` | `ac_unit` | oui | exact | — |
| `Wheat` | `wheat` | oui | exact | — |
| `Scale` | `balance` | oui | exact | — |
| `FlaskConical` | `science` | oui | exact | — |
| `Brain` | `psychology` | oui | **approchant** | profil de tête avec cerveau, alternatives : `neurology`, `cognition` |
| `Dices` | `casino` | oui | exact | — |
| `ClipboardCheck` | `assignment_turned_in` | oui | exact | — |
| `Bike` | `directions_bike` | oui | exact | — |
| `Waves` | `waves` | oui | exact | — |
| `GithubIcon` | — | — | **MANQUANT** | logo de marque, hors périmètre Material Symbols |
| `StravaIcon` | — | — | **MANQUANT** | logo de marque, hors périmètre Material Symbols |

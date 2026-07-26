# Cartographie des icônes — Lucide → Material Symbols (Sharp)

État **final** de la migration. Ce document et
`scripts/data/icon-mapping.csv` sont la source de vérité : le CSV est lu par
`scripts/generate-icons.ts`, qui émet `src/components/icons/index.tsx`.

- **Cible :** `@material-symbols/svg-600` v0.45.9, dossier `sharp/`, poids 600.
- **Licence :** Apache 2.0 (© Google), tracés modifiés — voir [THIRD-PARTY.md](../THIRD-PARTY.md).
  Le paquet ne fournit aucun fichier NOTICE.
- **Vérification :** chaque nom a été confirmé par un `ls` réel dans
  `node_modules/@material-symbols/svg-600/sharp/`. Aucun nom ne vient de mémoire.
- **Régénérer :** `bun run generate:icons` — `bun run check:icons` échoue si le
  fichier commité diverge de la table.

## Résumé

| | |
|---|---|
| Exports | 124 (112 repris de l'ancien set + 12 ajoutés pour le contexte) |
| Correspondance exacte | 110 |
| Correspondance approchante | 12 |
| Manquants (logos de marque) | 2 |
| Variante `-fill` disponible | 122 / 122 icônes mappées |

Sur les 120 glyphes distincts, 71 ont une variante pleine réellement différente
du contour ; les 51 autres ont un `-fill` identique en amont et sont émis une
seule fois, avec un commentaire dans le fichier généré.

## Contrat de composant

```ts
interface IconProps {
  className?: string;
  size?: number | string;   // défaut 24
  filled?: boolean;         // bascule sur le tracé -fill
}
```

| | Ancien (Lucide) | Actuel (Material Sharp) |
|---|---|---|
| viewBox | `0 0 24 24` global | `0 -960 960 960`, porté par icône |
| Rendu | contour, `stroke="currentColor"`, `strokeWidth={2}` | tracé plein, `fill="currentColor"` |
| Terminaisons | `strokeLinecap` / `strokeLinejoin` : `round` | sans objet |
| Variante pleine | inexistante (obtenue via `fill-*` en CSS) | prop `filled` |
| Accessibilité | rien | `aria-hidden="true"`, `focusable="false"` |

**Conséquence sur les appels :** les utilitaires `fill-*` ne remplissent plus rien
(le glyphe est déjà peint en `currentColor`) ; il faut `filled`. Dix sites
reposaient dessus pour les cœurs « favori » et les étoiles de notation.

## Ajouts contextuels

Cinq exports ont été ajoutés après coup, parce que l'export d'origine était
partagé par plusieurs sens et que le glyphe ne convenait qu'à l'un d'eux :

| Export | Material | Remplace | Où |
|---|---|---|---|
| `Run` | `directions_run` | `Footprints` | sélecteurs de discipline « course » |
| `Pool` | `pool` | `Waves` | sélecteurs de discipline « natation », test CSS |
| `HeartRate` | `monitor_heart` | `Heart` | FC max dans le calculateur de zones |
| `Stretching` | `sports_gymnastics` | `Waves` | catégorie renforcement « mobilité » |
| `Healing` | `healing` | `HeartPulse` | catégorie renforcement « prévention blessures » |
| `Sprint` | `sprint` | `Rocket` | catégorie VMA / VO2max |
| `Level1`…`Level4` | `signal_cellular_1_bar`…`4_bar` | `Dumbbell` | échelle de difficulté |
| `Intervals` | `graphic_eq` | `Crosshair` | catégorie « fartlek » |
| `UpperBody` | `rowing` | `ArrowUp` | catégorie renforcement « haut du corps » |

### L'échelle de difficulté

Un haltère précédait le libellé de difficulté (« Débutant », « Intermédiaire »,
« Avancé », « Élite ») — un choix hérité de l'ancien set, sans rapport avec un
niveau, et illisible à `size-3`. La famille `signal_cellular_*_bar` offre
exactement quatre paliers : le triangle vide donne la référence, la portion
pleine croît avec le niveau, donc le glyphe **porte** l'information au lieu de la
décorer. `DifficultyIcon` (`src/components/domain/`) fait la correspondance, sur
le modèle de `CategoryIcon`.

### Fartlek et haut du corps

Deux reprises directes de l'ancien set n'avaient aucun rapport avec ce qu'elles
désignaient : un réticule (`my_location`) pour le fartlek et une flèche vers le
haut (`arrow_upward`) pour le renforcement du haut du corps. `graphic_eq` alterne
des barres hautes et basses — l'alternance rapide/lent du jeu d'allures — et
`rowing` montre un mouvement de tirage, typique du travail du haut du corps.

`ArrowUp` reste en service sur le bouton « remonter en haut de page ».
`Crosshair` n'est plus utilisé, comme `Waves`.

`Rocket` reste en service sur le changelog, où la fusée désigne les entrées
« performance ». `Dumbbell` reste l'icône du renforcement musculaire.

`Footprints` reste en service là où l'empreinte est juste (technique de foulée,
collection « premiers pas », renforcement des jambes). `Heart` reste l'icône des
favoris. `HeartPulse` reste utilisé par les données (récupération, nutrition).

## Points restés en l'état

- **Deux manquants.** Material Symbols ne publie pas de logos tiers.
  `GithubIcon` et `StravaIcon` gardent leur géométrie d'origine (viewBox 24) dans
  `src/components/icons/brand.tsx`, fichier maintenu à la main et réexporté par le
  fichier généré. `GithubIcon` vient de Lucide, d'où la section ISC de THIRD-PARTY.md.
- **Doublons.** `Check`/`CheckIcon` et `Circle`/`CircleIcon` étaient des tracés
  identiques dans l'ancien set ; les quatre exports sont conservés et pointent sur
  le même SVG.
- **Exports sans usage.** `Bell`, `Mail`, `Users`, `Languages`, `Minus`,
  `PanelLeftClose`, `PanelLeftOpen` n'étaient déjà importés nulle part, et `Waves`
  l'est devenu depuis le passage à `Pool`/`Stretching`. Tous sont conservés.

## Table de correspondance complète

| Export | Nom Material (`sharp/`) | Variante `-fill` | Statut | Note |
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
| `Run` | `directions_run` | oui | exact | discipline « course à pied », remplace Footprints sur les sélecteurs de discipline |
| `Pool` | `pool` | oui | exact | discipline « natation », remplace Waves sur les sélecteurs de discipline |
| `HeartRate` | `monitor_heart` | oui | exact | fréquence cardiaque (FC max, zones) — à distinguer de `Heart`, qui est l’icône « favoris » |
| `Stretching` | `sports_gymnastics` | oui | exact | catégorie renforcement « mobilité » |
| `Healing` | `healing` | oui | exact | catégorie renforcement « prévention blessures » |
| `Sprint` | `sprint` | oui | exact | catégorie VMA / VO2max — coureur en action, remplace Rocket qui reste sur le changelog |
| `Level1` | `signal_cellular_1_bar` | oui | exact | échelle de difficulté : 1 barre sur 4 (débutant) |
| `Level2` | `signal_cellular_2_bar` | oui | exact | échelle de difficulté : 2 barres sur 4 (intermédiaire) |
| `Level3` | `signal_cellular_3_bar` | oui | exact | échelle de difficulté : 3 barres sur 4 (avancé) |
| `Level4` | `signal_cellular_4_bar` | oui | exact | échelle de difficulté : 4 barres sur 4 (élite) |
| `Intervals` | `graphic_eq` | oui | exact | catégorie « fartlek » — barres alternées haut/bas, l'alternance rapide/lent du jeu d'allures |
| `UpperBody` | `rowing` | oui | exact | catégorie renforcement « haut du corps » — mouvement de tirage |
| `GithubIcon` | — | — | **MANQUANT** | logo de marque, hors périmètre Material Symbols |
| `StravaIcon` | — | — | **MANQUANT** | logo de marque, hors périmètre Material Symbols |

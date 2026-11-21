# `src/styles/components/` — the hand-written component layer

One file per primitive, imported once from `src/styles/index.css`. No Tailwind,
no utility classes, no CSS-in-JS. These files are the paint; the `.tsx` files in
`src/components/ui/` are the behaviour.

## Rules

**Prefix every class `zn-`.** Tailwind is gone, so the prefix no longer guards
against generated utilities — it guards against us. A bare `.card` or `.menu`
belongs to whoever writes it first, and `.zn-menu` was once carried by both the
full-screen dialog and every dropdown, which put every dropdown in the app
full-screen on an ink ground. The prefix keeps the namespace ours; naming a
class after the one component it paints is what keeps it unambiguous inside it.
`.sr-only` is the single deliberate exception, and it lives in base.css.

**Variants come from the `data-*` attributes the components already emit** —
`data-variant`, `data-size`, `data-state`, `data-side`, `data-slot`,
`data-disabled`, `data-placeholder`. Never invent a parallel modifier class for
something already expressed as an attribute:

```css
.zn-btn[data-variant="outline"] { ... }   /* yes */
.zn-btn--outline { ... }                   /* no  */
```

Sub-parts that carry no attribute use BEM: `.zn-btn__spinner`.

**Every value is a token.** `var(--sp-6)`, `var(--border-rule)`, `var(--r-pill)`.
A raw pixel value is allowed only where the design system states one outright
(a 36px small-button height, a 38x20 legend swatch). Never re-round: the grid is
2px, so 26px card padding stays 26px.

**Write the real states.** The reference components in the design bundle fake
`:hover` and `:active` with `onMouseDown` handlers because inline styles cannot
express a pseudo-class. Here they are actual CSS:

- hover — colour only, never a size change
- `:active` — `transform: translateY(var(--press-shift))`, the stamp pressing in
- `:focus-visible` — inherited from `base.css` (2.5px vermillon, 2px offset).
  Only re-declare it when the element needs a different offset, and never remove it
- `:disabled` / `[data-disabled]` — `--state-disabled-fill` / `-text` / `-border`

**Keep the touch floor.** Anything clickable needs
`@media (pointer: coarse) { min-block-size: var(--hit-min); }`. Tailwind used to
carry this on every button size; these sheets carry it now, in 63 blocks, and
nothing outside them will. `--hit-min` is 44px.

**Obey the system's hard limits.** No gradient, no blur, no transparency other
than the zone ink ramp. One shadow — `var(--shadow-block)`, a hard offset with no
blur — and only on a floating surface (dialog, sheet, popover, dropdown, toast).
Never on a list card, never stacked. One accent fill per screen.

## What a port must not change

The component's public API: prop names, variant names, default values, the
`data-*` attributes, the DOM structure, and every `aria-*` / `role` / `htmlFor`
already present. A port swaps the `className` string for `cn("zn-thing", className)`
and nothing else.

`className` stays a pass-through prop, and `cn` still assembles it — it is
`clsx` alone now, because `tailwind-merge` left with the utilities it arbitrated
between. Sheets are still imported into `@layer components`, under the empty
`utilities` layer: the layer costs nothing, and it is what keeps `.sr-only`
above every component rule.

## What moves, and why

`design/motion.css` holds the rule: motion says where a thing came from
(origine), that a wait is real (attente), or that a gesture landed (geste).
Animate what changes, never what is: nothing moves on page load, only what was
just done moves, once. Only the three duration tokens, no `forwards`, and the
reduced-motion clamp covers every CSS animation; the few lines of JS motion
(FLIP, view transitions) read the preference themselves. Each rule below
carries a comment naming its clause.

| What | Where | Clause |
|---|---|---|
| The ink pill slides to the chosen segment, tab or rail session | `useSlidingIndicator`, `segmented.css`, `tabs.css`, `cockpit.css` | geste |
| A sheet or dialog leaves the way it came | `usePresence` and `useHeld` in `ui/native-dialog.tsx`, `sheet.css`, `dialog.css` | origine |
| A disclosure opens and closes in height, the chevron turns | `_layout.css` | origine |
| The switch knob and its track | `switch.css` | geste |
| One-pixel press on everything clickable | `base.css` | geste |
| The stamp on a session just closed | `ui/stamp.tsx`, `stamp.css`, `useJustChanged` | geste |
| The favourite heart fills from its centre | `FavoriteButton.tsx`, `favorite-button.css` | geste |
| Copied, on the copy button, 1.5s | `useCopiedFlag`, `.zn-swap` in `button.css` | geste |
| A new activity row enters 8px, the review bar grows | `useJustAdded`, `activity.css` | origine, geste |
| The session an undo brought back is tinted, then fades | `PlanDayList.tsx`, `plan-page.css` | geste |
| Hero, plan week and wizard step slide 12px in the direction of travel | `lib/directionalTransition.ts`, `animations.css` | geste |
| Card title and profile carry into the detail page | `lib/sharedTransition.ts` | origine |
| Calculator shapes and the editor profile follow the input; blocks slide to their new place | `race-sim.css`, `visualization.css`, `zone.css`, `useFlip` | geste |
| The dice turns a quarter, the drawn session lands from the button | `discovery.css` | geste, origine |

The only loop is still the run cycle, shown while something actually loads.

Screen continuity waits for the destination layout, bounded by a 300 ms safety
timeout, because the app runs on `BrowserRouter`: React Router's own
`viewTransition` needs a data router, so the props on `TopBar` and
`MobileMenu` are inert. `WeekViewPage` displays a single week and has no
previous/next navigation to animate.

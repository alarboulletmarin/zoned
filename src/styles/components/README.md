# `src/styles/components/` — the hand-written component layer

One file per primitive, imported once from `src/styles/index.css`. No Tailwind,
no utility classes, no CSS-in-JS. These files are the paint; the `.tsx` files in
`src/components/ui/` are the behaviour.

## Rules

**Prefix every class `zn-`.** The app still ships Tailwind during the migration,
and a bare `.card` would collide with generated utilities.

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
`@media (pointer: coarse) { min-block-size: var(--hit-min); }`. Tailwind carried
this as `[@media(pointer:coarse)]:min-h-11` on every button size; it vanishes
silently with Tailwind if it is not rewritten here.

**Obey the system's hard limits.** No gradient, no blur, no transparency other
than the zone ink ramp. One shadow — `var(--shadow-block)`, a hard offset with no
blur — and only on a floating surface (dialog, sheet, popover, dropdown, toast).
Never on a list card, never stacked. One accent fill per screen.

## What a port must not change

The component's public API: prop names, variant names, default values, the
`data-*` attributes, the DOM structure, and every `aria-*` / `role` / `htmlFor`
already present. A port swaps the `className` string for `cn("zn-thing", className)`
and nothing else.

`className` stays a pass-through prop. Call sites still hand Tailwind classes in
during the migration, and they have to keep winning over the base rules — which
is why `cn` (and `tailwind-merge` inside it) survives until Tailwind is removed.

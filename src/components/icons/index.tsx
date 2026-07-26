/**
 * Material Symbols icons — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Regenerate with: bun run generate:icons
 * Generator:       scripts/generate-icons.ts
 * Mapping table:   scripts/data/icon-mapping.csv (rationale in docs/icon-mapping.md)
 *
 * Source:  Material Symbols, Sharp style, weight 400
 *          https://github.com/google/material-design-icons
 *          via the @material-symbols/svg-400 npm package (v0.45.9)
 * Licence: Apache License 2.0, © Google — see licenses/APACHE-2.0.txt
 *          The upstream package ships no NOTICE file, so none is propagated.
 *
 * Modifications applied to the original SVGs:
 *   - each glyph is wrapped in a React component instead of a standalone file
 *   - the <svg> wrapper attributes are rewritten: fixed width/height replaced
 *     by a `size` prop, `fill` bound to `currentColor`, and
 *     `aria-hidden`/`focusable` added so icons stay out of the a11y tree
 *   - the outline and `-fill` path data of a glyph are merged into one
 *     component, selected at runtime by the `filled` prop
 *   - the path data itself is copied verbatim, unaltered
 *
 * Brand logos (GithubIcon, StravaIcon) have no Material equivalent and are
 * re-exported from ./brand — that file is hand-maintained.
 */

import type { ReactNode } from "react";
import type { IconProps } from "./types";

export type { IconProps } from "./types";
export { GithubIcon, StravaIcon } from "./brand";

/**
 * Shared <svg> wrapper. The viewBox is supplied per icon rather than fixed
 * globally, so glyphs on a different grid stay renderable.
 */
function Svg({
  viewBox,
  size,
  className,
  children,
}: {
  viewBox: string;
  size: number | string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

// `menu-fill` is identical to the outline upstream: `filled` is a no-op.
export function Menu({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M120-240v-60h720v60H120Zm0-210v-60h720v60H120Zm0-210v-60h720v60H120Z"/>
    </Svg>
  );
}

// `close-fill` is identical to the outline upstream: `filled` is a no-op.
export function X({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="m249-207-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/>
    </Svg>
  );
}

export function Lock({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M160-80v-554h130v-96q0-78.85 55.61-134.42Q401.21-920 480.11-920q78.89 0 134.39 55.58Q670-808.85 670-730v96h130v554H160Zm374.5-222.03Q557-324.06 557-355q0-30-22.67-54.5t-54.5-24.5q-31.83 0-54.33 24.5t-22.5 55q0 30.5 22.67 52.5t54.5 22q31.83 0 54.33-22.03ZM350-634h260v-96q0-54.17-37.88-92.08-37.88-37.92-92-37.92T388-822.08q-38 37.91-38 92.08v96Z"/>
      ) : (
        <path d="M160-80v-554h130v-96q0-78.85 55.61-134.42Q401.21-920 480.11-920q78.89 0 134.39 55.58Q670-808.85 670-730v96h130v554H160Zm60-60h520v-434H220v434Zm314.5-162.03Q557-324.06 557-355q0-30-22.67-54.5t-54.5-24.5q-31.83 0-54.33 24.5t-22.5 55q0 30.5 22.67 52.5t54.5 22q31.83 0 54.33-22.03ZM350-634h260v-96q0-54.17-37.88-92.08-37.88-37.92-92-37.92T388-822.08q-38 37.91-38 92.08v96ZM220-140v-434 434Z"/>
      )}
    </Svg>
  );
}

export function LockOpen({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M160-80v-554h450v-96q0-54.17-37.88-92.08-37.88-37.92-92-37.92T388-822.08q-38 37.91-38 92.08h-60q0-79 55.61-134.5 55.6-55.5 134.5-55.5 78.89 0 134.39 55.58Q670-808.85 670-730v96h130v554H160Zm374.5-222.03Q557-324.06 557-355q0-30-22.67-54.5t-54.5-24.5q-31.83 0-54.33 24.5t-22.5 55q0 30.5 22.67 52.5t54.5 22q31.83 0 54.33-22.03Z"/>
      ) : (
        <path d="M160-80v-554h450v-96q0-54.17-37.88-92.08-37.88-37.92-92-37.92T388-822.08q-38 37.91-38 92.08h-60q0-79 55.61-134.5 55.6-55.5 134.5-55.5 78.89 0 134.39 55.58Q670-808.85 670-730v96h130v554H160Zm60-60h520v-434H220v434Zm314.5-162.03Q557-324.06 557-355q0-30-22.67-54.5t-54.5-24.5q-31.83 0-54.33 24.5t-22.5 55q0 30.5 22.67 52.5t54.5 22q31.83 0 54.33-22.03ZM220-140v-434 434Z"/>
      )}
    </Svg>
  );
}

export function Home({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z"/>
      ) : (
        <path d="M220-180h150v-250h220v250h150v-390L480-765 220-570v390Zm-60 60v-480l320-240 320 240v480H530v-250H430v250H160Zm320-353Z"/>
      )}
    </Svg>
  );
}

// `arrow_forward-fill` is identical to the outline upstream: `filled` is a no-op.
export function ArrowRight({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M686-450H160v-60h526L438-758l42-42 320 320-320 320-42-42 248-248Z"/>
    </Svg>
  );
}

// `arrow_back-fill` is identical to the outline upstream: `filled` is a no-op.
export function ArrowLeft({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="m274-450 248 248-42 42-320-320 320-320 42 42-248 248h526v60H274Z"/>
    </Svg>
  );
}

// `arrow_upward-fill` is identical to the outline upstream: `filled` is a no-op.
export function ArrowUp({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M450-160v-526L202-438l-42-42 320-320 320 320-42 42-248-248v526h-60Z"/>
    </Svg>
  );
}

// `chevron_left-fill` is identical to the outline upstream: `filled` is a no-op.
export function ChevronLeft({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M561-240 320-481l241-241 43 43-198 198 198 198-43 43Z"/>
    </Svg>
  );
}

// `chevron_right-fill` is identical to the outline upstream: `filled` is a no-op.
export function ChevronRight({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M530-481 332-679l43-43 241 241-241 241-43-43 198-198Z"/>
    </Svg>
  );
}

// `keyboard_arrow_down-fill` is identical to the outline upstream: `filled` is a no-op.
export function ChevronDown({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M480-344 240-584l43-43 197 197 197-197 43 43-240 240Z"/>
    </Svg>
  );
}

// `keyboard_arrow_up-fill` is identical to the outline upstream: `filled` is a no-op.
export function ChevronUp({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M480-554 283-357l-43-43 240-240 240 240-43 43-197-197Z"/>
    </Svg>
  );
}

// `open_in_new-fill` is identical to the outline upstream: `filled` is a no-op.
export function ExternalLink({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M120-120v-720h339v60H180v600h600v-279h60v339H120Zm262-219-42-43 398-398H519v-60h321v321h-60v-218L382-339Z"/>
    </Svg>
  );
}

export function PanelLeftClose({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M663-344v-272L527-480l136 136ZM387-180h393v-600H387v600Zm-267 60v-720h720v720H120Z"/>
      ) : (
        <path d="M663-344v-272L527-480l136 136ZM180-180h147v-600H180v600Zm207 0h393v-600H387v600Zm-60 0H180h147Zm-207 60v-720h720v720H120Z"/>
      )}
    </Svg>
  );
}

export function PanelLeftOpen({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M527-616v272l136-136-136-136ZM387-180h393v-600H387v600Zm-267 60v-720h720v720H120Z"/>
      ) : (
        <path d="M527-616v272l136-136-136-136ZM180-180h147v-600H180v600Zm207 0h393v-600H387v600Zm-60 0H180h147Zm-207 60v-720h720v720H120Z"/>
      )}
    </Svg>
  );
}

export function LayoutGrid({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M120-510v-330h330v330H120Zm0 390v-330h330v330H120Zm390-390v-330h330v330H510Zm0 390v-330h330v330H510Z"/>
      ) : (
        <path d="M120-510v-330h330v330H120Zm0 390v-330h330v330H120Zm390-390v-330h330v330H510Zm0 390v-330h330v330H510ZM180-570h210v-210H180v210Zm390 0h210v-210H570v210Zm0 390h210v-210H570v210Zm-390 0h210v-210H180v210Zm390-390Zm0 180Zm-180 0Zm0-180Z"/>
      )}
    </Svg>
  );
}

export function Rows3({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M120-200v-250h720v250H120Zm0-310v-250h720v250H120Z"/>
      ) : (
        <path d="M780-260v-190H180v190h600Zm0-250v-190H180v190h600ZM180-200q-24 0-42-18t-18-42v-440q0-24 18-42t42-18h600q24 0 42 18t18 42v440q0 24-18 42t-42 18H180Z"/>
      )}
    </Svg>
  );
}

export function Grid3x3({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M120-120h200v-200H120v200Zm260 0h200v-200H380v200Zm260 0h200v-200H640v200ZM120-380h200v-200H120v200Zm260 0h200v-200H380v200Zm260 0h200v-200H640v200ZM120-640h200v-200H120v200Zm260 0h200v-200H380v200Zm260 0h200v-200H640v200Z"/>
      ) : (
        <path d="M120-120v-720h720v720H120Zm60-60h160v-160H180v160Zm220 0h160v-160H400v160Zm220 0h160v-160H620v160ZM180-400h160v-160H180v160Zm220 0h160v-160H400v160Zm220 0h160v-160H620v160ZM180-620h160v-160H180v160Zm220 0h160v-160H400v160Zm220 0h160v-160H620v160Z"/>
      )}
    </Svg>
  );
}

// `format_list_bulleted-fill` is identical to the outline upstream: `filled` is a no-op.
export function List({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M377-198v-60h463v60H377Zm0-252v-60h463v60H377Zm0-253v-60h463v60H377ZM189-161q-28.05 0-48.02-19Q121-199 121-227.5t19.5-48q19.5-19.5 48-19.5t47.5 19.98q19 19.97 19 48.02 0 27.23-19.39 46.61Q216.23-161 189-161Zm0-252q-28.05 0-48.02-19.5Q121-452 121-480t19.98-47.5Q160.95-547 189-547q27.23 0 46.61 19.5Q255-508 255-480t-19.39 47.5Q216.23-413 189-413Zm-48.5-272.5Q121-705 121-733t19.5-47.5Q160-800 188-800t47.5 19.5Q255-761 255-733t-19.5 47.5Q216-666 188-666t-47.5-19.5Z"/>
    </Svg>
  );
}

// `search-fill` is identical to the outline upstream: `filled` is a no-op.
export function Search({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M796-121 533-384q-30 26-70 40.5T378-329q-108 0-183-75t-75-181q0-106 75-181t182-75q106 0 180.5 75T632-585q0 43-14 83t-42 75l264 262-44 44ZM377-389q81 0 138-57.5T572-585q0-81-57-138.5T377-781q-82 0-139.5 57.5T180-585q0 81 57.5 138.5T377-389Z"/>
    </Svg>
  );
}

export function Filter({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M400-160v-280L118-800h724L560-440v280H400Z"/>
      ) : (
        <path d="M400-160v-280L118-800h724L560-440v280H400Zm80-276 240-304H240l240 304Zm0 0Z"/>
      )}
    </Svg>
  );
}

// `download-fill` is identical to the outline upstream: `filled` is a no-op.
export function Download({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M480-313 287-506l43-43 120 120v-371h60v371l120-120 43 43-193 193ZM160-160v-203h60v143h520v-143h60v203H160Z"/>
    </Svg>
  );
}

// `upload-fill` is identical to the outline upstream: `filled` is a no-op.
export function Upload({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M450-313v-371L330-564l-43-43 193-193 193 193-43 43-120-120v371h-60ZM160-160v-203h60v143h520v-143h60v203H160Z"/>
    </Svg>
  );
}

export function Save({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M840-683v563H120v-720h563l157 157ZM553.5-275.26q30.5-30.27 30.5-73.5 0-43.24-30.26-73.74-30.27-30.5-73.5-30.5-43.24 0-73.74 30.26-30.5 30.27-30.5 73.5 0 43.24 30.26 73.74 30.27 30.5 73.5 30.5 43.24 0 73.74-30.26ZM233-584h358v-143H233v143Z"/>
      ) : (
        <path d="M840-683v563H120v-720h563l157 157Zm-60 27L656-780H180v600h600v-476ZM553.5-275.26q30.5-30.27 30.5-73.5 0-43.24-30.26-73.74-30.27-30.5-73.5-30.5-43.24 0-73.74 30.26-30.5 30.27-30.5 73.5 0 43.24 30.26 73.74 30.27 30.5 73.5 30.5 43.24 0 73.74-30.26ZM233-584h358v-143H233v143Zm-53-72v476-600 124Z"/>
      )}
    </Svg>
  );
}

export function Trash2({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M367-266h60v-399h-60v399Zm166 0h60v-399h-60v399ZM201-120v-630h-41v-60h188v-30h264v30h188v60h-41v630H201Z"/>
      ) : (
        <path d="M201-120v-630h-41v-60h188v-30h264v30h188v60h-41v630H201Zm60-60h438v-570H261v570Zm106-86h60v-399h-60v399Zm166 0h60v-399h-60v399ZM261-750v570-570Z"/>
      )}
    </Svg>
  );
}

// `rotate_left-fill` is identical to the outline upstream: `filled` is a no-op.
export function RotateCcw({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M435-80q-48-7-93-25t-85-48l43-44q32 24 66 37.5t69 19.5v60Zm90 0v-60q110-21 182.5-103.5T780-443q0-127-86.5-213.5T480-743h-20l79 79-44 44-153-153 153-153 44 44-79 79h20q75 0 140.5 28T735-698q49 49 77 114.5T840-443q0 140-89 241T525-80ZM194-216q-28-38-46.5-84.5T122-398h61q5 38 18.5 73t36.5 65l-44 44Zm-72-272q7-50 25-95.5t47-85.5l44 43q-23 33-36.5 68T183-488h-61Z"/>
    </Svg>
  );
}

export function Settings({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m388-80-20-126q-19-7-40-19t-37-25l-118 54-93-164 108-79q-2-9-2.5-20.5T185-480q0-9 .5-20.5T188-521L80-600l93-164 118 54q16-13 37-25t40-18l20-127h184l20 126q19 7 40.5 18.5T669-710l118-54 93 164-108 77q2 10 2.5 21.5t.5 21.5q0 10-.5 21t-2.5 21l108 78-93 164-118-54q-16 13-36.5 25.5T592-206L572-80H388Zm92-270q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38Z"/>
      ) : (
        <path d="m388-80-20-126q-19-7-40-19t-37-25l-118 54-93-164 108-79q-2-9-2.5-20.5T185-480q0-9 .5-20.5T188-521L80-600l93-164 118 54q16-13 37-25t40-18l20-127h184l20 126q19 7 40.5 18.5T669-710l118-54 93 164-108 77q2 10 2.5 21.5t.5 21.5q0 10-.5 21t-2.5 21l108 78-93 164-118-54q-16 13-36.5 25.5T592-206L572-80H388Zm48-60h88l14-112q33-8 62.5-25t53.5-41l106 46 40-72-94-69q4-17 6.5-33.5T715-480q0-17-2-33.5t-7-33.5l94-69-40-72-106 46q-23-26-52-43.5T538-708l-14-112h-88l-14 112q-34 7-63.5 24T306-642l-106-46-40 72 94 69q-4 17-6.5 33.5T245-480q0 17 2.5 33.5T254-413l-94 69 40 72 106-46q24 24 53.5 41t62.5 25l14 112Zm44-210q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38Zm0-130Z"/>
      )}
    </Svg>
  );
}

export function Heart({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m480-121-41-37q-106-97-175-167.5t-110-126Q113-507 96.5-552T80-643q0-90 60.5-150.5T290-854q57 0 105.5 27t84.5 78q42-54 89-79.5T670-854q89 0 149.5 60.5T880-643q0 46-16.5 91T806-451.5q-41 55.5-110 126T521-158l-41 37Z"/>
      ) : (
        <path d="m480-121-41-37q-105.77-97.12-174.88-167.56Q195-396 154-451.5T96.5-552Q80-597 80-643q0-90.15 60.5-150.58Q201-854 290-854q57 0 105.5 27t84.5 78q42-54 89-79.5T670-854q89 0 149.5 60.42Q880-733.15 880-643q0 46-16.5 91T806-451.5Q765-396 695.88-325.56 626.77-255.12 521-158l-41 37Zm0-79q101.24-93 166.62-159.5Q712-426 750.5-476t54-89.14q15.5-39.13 15.5-77.72 0-66.14-42-108.64T670.22-794q-51.52 0-95.37 31.5T504-674h-49q-26-56-69.85-88-43.85-32-95.37-32Q224-794 182-751.5t-42 108.82q0 38.68 15.5 78.18 15.5 39.5 54 90T314-358q66 66 166 158Zm0-297Z"/>
      )}
    </Svg>
  );
}

export function Pencil({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M121-120v-128l616-616 128 128-616 616H121Zm618-577 40-40-41-41-40 40 41 41Z"/>
      ) : (
        <path d="M180-180h44l472-471-44-44-472 471v44Zm-60 60v-128l617-616 128 128-617 616H120Zm659-617-41-41 41 41Zm-105 64-22-22 44 44-22-22Z"/>
      )}
    </Svg>
  );
}

// `add-fill` is identical to the outline upstream: `filled` is a no-op.
export function Plus({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M450-450H200v-60h250v-250h60v250h250v60H510v250h-60v-250Z"/>
    </Svg>
  );
}

// `remove-fill` is identical to the outline upstream: `filled` is a no-op.
export function Minus({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M200-450v-60h560v60H200Z"/>
    </Svg>
  );
}

export function Copy({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M240-200v-680h560v680H240ZM120-80v-680h60v620h500v60H120Z"/>
      ) : (
        <path d="M240-200v-680h560v680H240Zm60-60h440v-560H300v560ZM120-80v-680h60v620h500v60H120Zm180-180v-560 560Z"/>
      )}
    </Svg>
  );
}

export function Share({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M686-80q-47.5 0-80.75-33.25T572-194q0-8 5-34L278-403q-16.28 17.34-37.64 27.17Q219-366 194-366q-47.5 0-80.75-33T80-480q0-48 33.25-81T194-594q24 0 45 9.3 21 9.29 37 25.7l301-173q-2-8-3.5-16.5T572-766q0-47.5 33.25-80.75T686-880q47.5 0 80.75 33.25T800-766q0 47.5-33.25 80.75T686-652q-23.27 0-43.64-9Q622-670 606-685L302-516q3 8 4.5 17.5t1.5 18q0 8.5-1 16t-3 15.5l303 173q16-15 36.09-23.5 20.1-8.5 43.07-8.5Q734-308 767-274.75T800-194q0 47.5-33.25 80.75T686-80Z"/>
      ) : (
        <path d="M686-80q-47.5 0-80.75-33.25T572-194q0-8 5-34L278-403q-16.28 17.34-37.64 27.17Q219-366 194-366q-47.5 0-80.75-33T80-480q0-48 33.25-81T194-594q24 0 45 9.3 21 9.29 37 25.7l301-173q-2-8-3.5-16.5T572-766q0-47.5 33.25-80.75T686-880q47.5 0 80.75 33.25T800-766q0 47.5-33.25 80.75T686-652q-23.27 0-43.64-9Q622-670 606-685L302-516q3 8 4.5 17.5t1.5 18q0 8.5-1 16t-3 15.5l303 173q16-15 36.09-23.5 20.1-8.5 43.07-8.5Q734-308 767-274.75T800-194q0 47.5-33.25 80.75T686-80Zm.04-60q22.96 0 38.46-15.54 15.5-15.53 15.5-38.5 0-22.96-15.54-38.46-15.53-15.5-38.5-15.5-22.96 0-38.46 15.54-15.5 15.53-15.5 38.5 0 22.96 15.54 38.46 15.53 15.5 38.5 15.5Zm-492-286q22.96 0 38.46-15.54 15.5-15.53 15.5-38.5 0-22.96-15.54-38.46-15.53-15.5-38.5-15.5-22.96 0-38.46 15.54-15.5 15.53-15.5 38.5 0 22.96 15.54 38.46 15.53 15.5 38.5 15.5ZM724.5-727.54q15.5-15.53 15.5-38.5 0-22.96-15.54-38.46-15.53-15.5-38.5-15.5-22.96 0-38.46 15.54-15.5 15.53-15.5 38.5 0 22.96 15.54 38.46 15.53 15.5 38.5 15.5 22.96 0 38.46-15.54ZM686-194ZM194-480Zm492-286Z"/>
      )}
    </Svg>
  );
}

export function Eye({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M600.5-379.5Q650-429 650-500t-49.5-120.5Q551-670 480-670t-120.5 49.5Q310-571 310-500t49.5 120.5Q409-330 480-330t120.5-49.5Zm-200-41Q368-453 368-500t32.5-79.5Q433-612 480-612t79.5 32.5Q592-547 592-500t-32.5 79.5Q527-388 480-388t-79.5-32.5ZM216-283Q98-366 40-500q58-134 176-217t264-83q146 0 264 83t176 217q-58 134-176 217t-264 83q-146 0-264-83Z"/>
      ) : (
        <path d="M600.5-379.5Q650-429 650-500t-49.5-120.5Q551-670 480-670t-120.5 49.5Q310-571 310-500t49.5 120.5Q409-330 480-330t120.5-49.5Zm-200-41Q368-453 368-500t32.5-79.5Q433-612 480-612t79.5 32.5Q592-547 592-500t-32.5 79.5Q527-388 480-388t-79.5-32.5ZM216-283Q98-366 40-500q58-134 176-217t264-83q146 0 264 83t176 217q-58 134-176 217t-264 83q-146 0-264-83Zm264-217Zm222.5 174.5Q804-391 857-500q-53-109-154.5-174.5T480-740q-121 0-222.5 65.5T102-500q54 109 155.5 174.5T480-260q121 0 222.5-65.5Z"/>
      )}
    </Svg>
  );
}

export function EyeOff({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M816-64 648-229q-35 14-79 21.5t-89 7.5q-146 0-265-81.5T40-500q20-52 55.5-101.5T182-696L56-822l42-43 757 757-39 44ZM480-330q14 0 30-2.5t27-7.5L320-557q-5 12-7.5 27t-2.5 30q0 72 50 121t120 49Zm278 40L629-419q10-16 15.5-37.5T650-500q0-71-49.5-120.5T480-670q-22 0-43 5t-38 16L289-760q35-16 89.5-28T485-800q143 0 261.5 81.5T920-500q-26 64-67 117t-95 93ZM585-463 443-605q29-11 60-4.5t54 28.5q23 23 32 51.5t-4 66.5Z"/>
      ) : (
        <path d="m629-419-44-44q26-71-27-118t-115-24l-44-44q17-11 38-16t43-5q71 0 120.5 49.5T650-500q0 22-5.5 43.5T629-419Zm129 129-40-40q49-36 85.5-80.5T857-500q-50-111-150-175.5T490-740q-42 0-86 8t-69 19l-46-47q35-16 89.5-28T485-800q143 0 261.5 81.5T920-500q-26 64-67 117t-95 93Zm58 226L648-229q-35 14-79 21.5t-89 7.5q-146 0-265-81.5T40-500q20-52 55.5-101.5T182-696L56-822l42-43 757 757-39 44ZM223-654q-37 27-71.5 71T102-500q51 111 153.5 175.5T488-260q33 0 65-4t48-12l-64-64q-11 5-27 7.5t-30 2.5q-70 0-120-49t-50-121q0-15 2.5-30t7.5-27l-97-97Zm305 142Zm-116 58Z"/>
      )}
    </Svg>
  );
}

// `check-fill` is identical to the outline upstream: `filled` is a no-op.
export function Check({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M378-246 154-470l43-43 181 181 384-384 43 43-427 427Z"/>
    </Svg>
  );
}

// `check-fill` is identical to the outline upstream: `filled` is a no-op.
export function CheckIcon({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M378-246 154-470l43-43 181 181 384-384 43 43-427 427Z"/>
    </Svg>
  );
}

export function Circle({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Z"/>
      ) : (
        <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z"/>
      )}
    </Svg>
  );
}

export function CircleIcon({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Z"/>
      ) : (
        <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z"/>
      )}
    </Svg>
  );
}

// `more_horiz-fill` is identical to the outline upstream: `filled` is a no-op.
export function MoreHorizontal({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M207.86-432Q188-432 174-446.14t-14-34Q160-500 174.14-514t34-14Q228-528 242-513.86t14 34Q256-460 241.86-446t-34 14Zm272 0Q460-432 446-446.14t-14-34Q432-500 446.14-514t34-14Q500-528 514-513.86t14 34Q528-460 513.86-446t-34 14Zm272 0Q732-432 718-446.14t-14-34Q704-500 718.14-514t34-14Q772-528 786-513.86t14 34Q800-460 785.86-446t-34 14Z"/>
    </Svg>
  );
}

// `more_vert-fill` is identical to the outline upstream: `filled` is a no-op.
export function MoreVertical({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M479.86-160Q460-160 446-174.14t-14-34Q432-228 446.14-242t34-14Q500-256 514-241.86t14 34Q528-188 513.86-174t-34 14Zm0-272Q460-432 446-446.14t-14-34Q432-500 446.14-514t34-14Q500-528 514-513.86t14 34Q528-460 513.86-446t-34 14Zm0-272Q460-704 446-718.14t-14-34Q432-772 446.14-786t34-14Q500-800 514-785.86t14 34Q528-732 513.86-718t-34 14Z"/>
    </Svg>
  );
}

// `open_in_full-fill` is identical to the outline upstream: `filled` is a no-op.
export function Maximize2({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M120-120v-300h60v198l558-558H540v-60h300v300h-60v-198L222-180h198v60H120Z"/>
    </Svg>
  );
}

// `close_fullscreen-fill` is identical to the outline upstream: `filled` is a no-op.
export function Minimize2({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="m122-80-42-42 298-298H160v-60h320v320h-60v-218L122-80Zm358-400v-320h60v218l298-298 42 42-298 298h218v60H480Z"/>
    </Svg>
  );
}

// `swap_horiz-fill` is identical to the outline upstream: `filled` is a no-op.
export function ArrowLeftRight({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M273-160 80-353l193-193 42 42-121 121h316v60H194l121 121-42 42Zm414-254-42-42 121-121H450v-60h316L645-758l42-42 193 193-193 193Z"/>
    </Svg>
  );
}

// `undo-fill` is identical to the outline upstream: `filled` is a no-op.
export function Undo2({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M259-200v-60h310q70 0 120.5-46.5T740-422q0-69-50.5-115.5T569-584H274l114 114-42 42-186-186 186-186 42 42-114 114h294q95 0 163.5 64T800-422q0 94-68.5 158T568-200H259Z"/>
    </Svg>
  );
}

// `redo-fill` is identical to the outline upstream: `filled` is a no-op.
export function Redo2({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M392-200q-95 0-163.5-64T160-422q0-94 68.5-158T392-644h294L572-758l42-42 186 186-186 186-42-42 114-114H391q-70 0-120.5 46.5T220-422q0 69 50.5 115.5T391-260h310v60H392Z"/>
    </Svg>
  );
}

// `refresh-fill` is identical to the outline upstream: `filled` is a no-op.
export function RefreshCw({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M480-160q-133 0-226.5-93.5T160-480q0-133 93.5-226.5T480-800q85 0 149 34.5T740-671v-129h60v254H546v-60h168q-38-60-97-97t-137-37q-109 0-184.5 75.5T220-480q0 109 75.5 184.5T480-220q83 0 152-47.5T728-393h62q-29 105-115 169t-195 64Z"/>
    </Svg>
  );
}

// `progress_activity-fill` is identical to the outline upstream: `filled` is a no-op.
export function Loader2({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M323-111q-73-31-127-85t-85-127q-31-73-31-157t31-157q31-73 85-127t127-85q73-31 157-31v60q-141 0-240.5 99.5T140-480q0 141 99.5 240.5T480-140q141 0 240.5-99.5T820-480h60q0 84-31 157t-85 127q-54 54-127 85T480-80q-84 0-157-31Z"/>
    </Svg>
  );
}

// `shuffle-fill` is identical to the outline upstream: `filled` is a no-op.
export function Shuffle({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M576-160v-60h120L522-393l42-43 176 174v-121h60v223H576Zm-374 0-42-43 538-537H576v-60h224v223h-60v-120L202-160Zm193-363L160-757l43-43 235 234-43 43Z"/>
    </Svg>
  );
}

export function Send({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M120-160v-245l302-75-302-77v-243l760 320-760 320Z"/>
      ) : (
        <path d="M120-160v-640l760 320-760 320Zm60-93 544-227-544-230v168l242 62-242 60v167Zm0 0v-457 457Z"/>
      )}
    </Svg>
  );
}

// `link-fill` is identical to the outline upstream: `filled` is a no-op.
export function Link2({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M450-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h170v60H280q-58.33 0-99.17 40.76-40.83 40.77-40.83 99Q140-422 180.83-381q40.84 41 99.17 41h170v60ZM325-450v-60h310v60H325Zm185 170v-60h170q58.33 0 99.17-40.76 40.83-40.77 40.83-99Q820-538 779.17-579q-40.84-41-99.17-41H510v-60h170q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H510Z"/>
    </Svg>
  );
}

export function Info({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M453-280h60v-240h-60v240Zm50.5-323.2q9.5-9.2 9.5-22.8 0-14.45-9.48-24.22-9.48-9.78-23.5-9.78t-23.52 9.78Q447-640.45 447-626q0 13.6 9.48 22.8 9.48 9.2 23.5 9.2t23.52-9.2ZM480.27-80q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Z"/>
      ) : (
        <path d="M453-280h60v-240h-60v240Zm50.5-323.2q9.5-9.2 9.5-22.8 0-14.45-9.48-24.22-9.48-9.78-23.5-9.78t-23.52 9.78Q447-640.45 447-626q0 13.6 9.48 22.8 9.48 9.2 23.5 9.2t23.52-9.2ZM480.27-80q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm.23-60Q622-140 721-239.5t99-241Q820-622 721.19-721T480-820q-141 0-240.5 98.81T140-480q0 141 99.5 240.5t241 99.5Zm-.5-340Z"/>
      )}
    </Svg>
  );
}

export function AlertTriangle({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m40-120 440-760 440 760H40Zm465.5-125.68q8.5-8.67 8.5-21.5 0-12.82-8.68-21.32-8.67-8.5-21.5-8.5-12.82 0-21.32 8.68-8.5 8.67-8.5 21.5 0 12.82 8.68 21.32 8.67 8.5 21.5 8.5 12.82 0 21.32-8.68ZM454-348h60v-224h-60v224Z"/>
      ) : (
        <path d="m40-120 440-760 440 760H40Zm104-60h672L480-760 144-180Zm361.5-65.68q8.5-8.67 8.5-21.5 0-12.82-8.68-21.32-8.67-8.5-21.5-8.5-12.82 0-21.32 8.68-8.5 8.67-8.5 21.5 0 12.82 8.68 21.32 8.67 8.5 21.5 8.5 12.82 0 21.32-8.68ZM454-348h60v-224h-60v224Zm26-122Z"/>
      )}
    </Svg>
  );
}

export function Shield({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M480-81q-140-35-230-162.5T160-523v-238l320-120 320 120v238q0 152-90 279.5T480-81Z"/>
      ) : (
        <path d="M480-81q-140-35-230-162.5T160-523v-238l320-120 320 120v238q0 152-90 279.5T480-81Zm0-62q115-38 187.5-143.5T740-523v-196l-260-98-260 98v196q0 131 72.5 236.5T480-143Zm0-337Z"/>
      )}
    </Svg>
  );
}

// `code-fill` is identical to the outline upstream: `filled` is a no-op.
export function Code({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M320-242 80-482l242-242 43 43-199 199 197 197-43 43Zm318 2-43-43 199-199-197-197 43-43 240 240-242 242Z"/>
    </Svg>
  );
}

export function Star({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
      ) : (
        <path d="m323-245 157-94 157 95-42-178 138-120-182-16-71-168-71 167-182 16 138 120-42 178Zm-90 125 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-355Z"/>
      )}
    </Svg>
  );
}

export function Bell({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M160-200v-60h80v-304q0-84 49.5-150.5T420-798v-82h120v82q81 17 130.5 83.5T720-564v304h80v60H160ZM480-80q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Z"/>
      ) : (
        <path d="M160-200v-60h80v-304q0-84 49.5-150.5T420-798v-82h120v82q81 17 130.5 83.5T720-564v304h80v60H160Zm320-302Zm0 422q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM300-260h360v-304q0-75-52.5-127.5T480-744q-75 0-127.5 52.5T300-564v304Z"/>
      )}
    </Svg>
  );
}

export function Mail({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M80-160v-640h800v640H80Zm400-302 340-223v-55L480-522 140-740v55l340 223Z"/>
      ) : (
        <path d="M80-160v-640h800v640H80Zm400-302L140-685v465h680v-465L480-462Zm0-60 336-218H145l335 218ZM140-685v-55 520-465Z"/>
      )}
    </Svg>
  );
}

export function Users({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM250-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42Zm426 0q-42 42-108 42-11 0-24.5-1.5T519-488q24-25 36.5-61.5T568-631q0-45-12.5-79.5T519-774q11-3 24.5-5t24.5-2q66 0 108 42t42 108q0 66-42 108Z"/>
      ) : (
        <path d="M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM250-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42Zm426 0q-42 42-108 42-11 0-24.5-1.5T519-488q24-25 36.5-61.5T568-631q0-45-12.5-79.5T519-774q11-3 24.5-5t24.5-2q66 0 108 42t42 108q0 66-42 108ZM98-220h520v-34q0-16-9.5-31T585-306q-72-32-121-43t-106-11q-57 0-106.5 11T130-306q-14 6-23 21t-9 31v34Zm324.5-346.5Q448-592 448-631t-25.5-64.5Q397-721 358-721t-64.5 25.5Q268-670 268-631t25.5 64.5Q319-541 358-541t64.5-25.5ZM358-220Zm0-411Z"/>
      )}
    </Svg>
  );
}

export function UserRound({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M372-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42ZM160-160v-94q0-38 19-65t49-41q67-30 128.5-45T480-420q62 0 123 15.5T731-360q31 14 50 41t19 65v94H160Z"/>
      ) : (
        <path d="M372-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42ZM160-160v-94q0-38 19-65t49-41q67-30 128.5-45T480-420q62 0 123 15.5T731-360q31 14 50 41t19 65v94H160Zm60-60h520v-34q0-16-9.5-30.5T707-306q-64-31-117-42.5T480-360q-57 0-111 11.5T252-306q-14 7-23 21.5t-9 30.5v34Zm324.5-346.5Q570-592 570-631t-25.5-64.5Q519-721 480-721t-64.5 25.5Q390-670 390-631t25.5 64.5Q441-541 480-541t64.5-25.5ZM480-631Zm0 411Z"/>
      )}
    </Svg>
  );
}

// `translate-fill` is identical to the outline upstream: `filled` is a no-op.
export function Languages({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="m475-80 185-480h79L924-80h-65l-45-117H584L539-80h-64ZM162-201l-42-42 201-201q-51-53-85.5-107.5T183-660h65q16 43 43.5 85t72.5 88q46-48 85-117.5T505-740H40v-60h290v-80h60v80h290v60H567q-17 78-61.5 159.5T406-443l102 104-24 63-121-125-201 200Zm443-51h188l-94-248-94 248Z"/>
    </Svg>
  );
}

export function Moon({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q8 0 17 .5t23 1.5q-36 32-56 79t-20 99q0 90 63 153t153 63q52 0 99-18.5t79-51.5q1 12 1.5 19.5t.5 14.5q0 150-105 255T480-120Z"/>
      ) : (
        <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q8 0 17 .5t23 1.5q-36 32-56 79t-20 99q0 90 63 153t153 63q52 0 99-18.5t79-51.5q1 12 1.5 19.5t.5 14.5q0 150-105 255T480-120Zm0-60q109 0 190-67.5T771-406q-25 11-53.67 16.5Q688.67-384 660-384q-114.69 0-195.34-80.66Q384-545.31 384-660q0-24 5-51.5t18-62.5q-98 27-162.5 109.5T180-480q0 125 87.5 212.5T480-180Zm-4-297Z"/>
      )}
    </Svg>
  );
}

export function Sun({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M338.5-338.5Q280-397 280-480t58.5-141.5Q397-680 480-680t141.5 58.5Q680-563 680-480t-58.5 141.5Q563-280 480-280t-141.5-58.5ZM200-450H40v-60h160v60Zm720 0H760v-60h160v60ZM450-760v-160h60v160h-60Zm0 720v-160h60v160h-60ZM262-658l-100-97 43-44 96 100-39 41Zm494 496-98-100 41-41 99 98-42 43Zm-99-537 98-99 44 42-99 98-43-41ZM162-205l99-98 42 42-98 99-43-43Z"/>
      ) : (
        <path d="M579-381q41-41 41-99t-41-99q-41-41-99-41t-99 41q-41 41-41 99t41 99q41 41 99 41t99-41Zm-240.5 42.5Q280-397 280-480t58.5-141.5Q397-680 480-680t141.5 58.5Q680-563 680-480t-58.5 141.5Q563-280 480-280t-141.5-58.5ZM200-450H40v-60h160v60Zm720 0H760v-60h160v60ZM450-760v-160h60v160h-60Zm0 720v-160h60v160h-60ZM262-658l-100-97 43-44 96 100-39 41Zm494 496-98-100 41-41 99 98-42 43Zm-99-537 98-99 44 42-99 98-43-41ZM162-205l99-98 42 42-98 99-43-43Zm318-275Z"/>
      )}
    </Svg>
  );
}

export function Image({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M236-277h489L578-473 446-302l-93-127-117 152ZM120-120v-720h720v720H120Z"/>
      ) : (
        <path d="M236-277h489L578-473 446-302l-93-127-117 152ZM120-120v-720h720v720H120Zm60-60h600v-600H180v600Zm0 0v-600 600Z"/>
      )}
    </Svg>
  );
}

export function FileText({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M319-250h322v-60H319v60Zm0-170h322v-60H319v60ZM160-80v-800h421l219 219v581H160Zm391-554h189L551-820v186Z"/>
      ) : (
        <path d="M319-250h322v-60H319v60Zm0-170h322v-60H319v60ZM160-80v-800h421l219 219v581H160Zm391-554v-186H220v680h520v-494H551ZM220-820v186-186 680-680Z"/>
      )}
    </Svg>
  );
}

export function Watch({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m366-80-47-171q-55-35-87-95t-32-134q0-74 32-134.5t87-94.5l47-171h228l47 171q55 34 87 94.5T760-480q0 74-32 134t-87 95L594-80H366Zm270-244q64-64 64-156t-64-156q-64-64-156-64t-156 64q-64 64-64 156t64 156q64 64 156 64t156-64Z"/>
      ) : (
        <path d="M411-820h138-138Zm0 680h138-138Zm-45 60-47-171q-55-35-87-95t-32-134q0-74 32-134.5t87-94.5l47-171h228l47 171q55 34 87 94.5T760-480q0 74-32 134t-87 95L594-80H366Zm270-244q64-64 64-156t-64-156q-64-64-156-64t-156 64q-64 64-64 156t64 156q64 64 156 64t156-64ZM393-744q23-7 44.5-10.5T480-758q21 0 42.5 3.5T567-744l-18-76H411l-18 76Zm18 604h138l18-76q-23 6-44.5 9.5T480-203q-21 0-42.5-3.5T393-216l18 76Z"/>
      )}
    </Svg>
  );
}

export function Sparkles({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M852-226 746-332l42-42 106 106-42 42ZM708-706l-42-42 106-106 42 42-106 106Zm-456 0L146-812l42-42 106 106-42 42ZM108-226l-42-42 106-106 42 42-106 106Zm125 106 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
      ) : (
        <path d="M852-226 746-332l42-42 106 106-42 42ZM708-706l-42-42 106-106 42 42-106 106Zm-456 0L146-812l42-42 106 106-42 42ZM108-226l-42-42 106-106 42 42-106 106Zm215-19 157-94 157 95-42-178 138-120-182-16-71-168-71 167-182 16 138 120-42 178Zm-90 125 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-365Z"/>
      )}
    </Svg>
  );
}

export function Lightbulb({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M422.5-103.5Q399-127 399-161h162q0 34-23.5 57.5T480-80q-34 0-57.5-23.5ZM318-223v-60h324v60H318Zm5-121q-66-43-104.5-107.5T180-597q0-122 89-211t211-89q122 0 211 89t89 211q0 81-38 145.5T637-344H323Z"/>
      ) : (
        <path d="M422.5-103.5Q399-127 399-161h162q0 34-23.5 57.5T480-80q-34 0-57.5-23.5ZM318-223v-60h324v60H318Zm5-121q-66-43-104.5-107.5T180-597q0-122 89-211t211-89q122 0 211 89t89 211q0 81-38 145.5T637-344H323Zm22-60h271q48-32 76-83t28-110q0-99-70.5-169.5T480-837q-99 0-169.5 70.5T240-597q0 59 28 110t77 83Zm135 0Z"/>
      )}
    </Svg>
  );
}

export function Book({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M160-80v-800h640v800H160Zm326-474 97-56 97 56v-266H486v266Z"/>
      ) : (
        <path d="M160-80v-800h640v800H160Zm60-60h520v-680h-60v266l-97-56-97 56v-266H220v680Zm0 0v-680 680Zm266-414 97-56 97 56-97-56-97 56Z"/>
      )}
    </Svg>
  );
}

export function BookOpen({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M512-250q50-25 98-37.5T712-300q38 0 78.5 6t69.5 16v-429q-34-17-72-25t-76-8q-54 0-104.5 16.5T512-677v427Zm-30 90q-51-38-111-58.5T248-239q-52 0-112.5 20.5T40-176v-572q42-24 98-38t110-14q63 0 122.5 17T482-731q51-35 109.5-52T712-800q54 0 110 14.5t98 37.5v572q-34-23-95-43t-113-20q-63 0-121 21t-109 58Zm78-414v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-610q-38 0-73 9.5T560-574Zm0 220v-49q33-14 67.5-20.5T700-430q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-390q-38 0-73 9t-67 27Zm0-110v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-500q-38 0-73 9.5T560-464Z"/>
      ) : (
        <path d="M248-300q53.57 0 104.28 12.5Q403-275 452-250v-427q-45-30-97.62-46.5Q301.76-740 248-740q-38 0-74.5 9.5T100-707v434q31-14 70.5-20.5T248-300Zm264 50q50-25 98-37.5T712-300q38 0 78.5 6t69.5 16v-429q-34-17-71.82-25-37.82-8-76.18-8-54 0-104.5 16.5T512-677v427Zm-30 90q-51-38-111-58.5T248-239q-52 0-112.5 20.5T40-176v-572q42-24 98.12-38 56.12-14 109.88-14 63 0 122.5 17T482-731q51-35 109.5-52T712-800q53.76 0 109.88 14.5T920-748v572q-34-23-95-43t-113-20q-63 0-121 21t-109 58ZM276-495Zm284-79v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-610q-38 0-73 9.5T560-574Zm0 220v-49q33-13.5 67.5-20.25T700-430q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-390q-38 0-73 9t-67 27Zm0-110v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-500q-38 0-73 9.5T560-464Z"/>
      )}
    </Svg>
  );
}

export function GraduationCap({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M860-283v-282L479-360 40-600l439-240 441 240v317h-60ZM479-120 189-279v-210l290 159 290-159v210L479-120Z"/>
      ) : (
        <path d="M479-120 189-279v-240L40-600l439-240 441 240v317h-60v-282l-91 46v240L479-120Zm0-308 315-172-315-169-313 169 313 172Zm0 240 230-127v-168L479-360 249-485v170l230 127Zm1-240Zm-1 74Zm0 0Z"/>
      )}
    </Svg>
  );
}

export function Library({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M343-420h225v-60H343v60Zm0-90h395v-60H343v60Zm0-90h395v-60H343v60ZM200-200v-680h680v680H200ZM80-80v-680h60v620h620v60H80Z"/>
      ) : (
        <path d="M343-420h225v-60H343v60Zm0-90h395v-60H343v60Zm0-90h395v-60H343v60ZM200-200v-680h680v680H200Zm60-60h560v-560H260v560ZM80-80v-680h60v620h620v60H80Zm180-740v560-560Z"/>
      )}
    </Svg>
  );
}

export function Calculator({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M314-228h50v-88h88v-50h-88v-88h-50v88h-88v50h88v88Zm215-35h201v-49H529v49Zm0-107h201v-50H529v50ZM241-605h196v-50H241v50ZM120-120v-720h720v720H120Zm446-413 61-61 61 61 36-36-61-61 61-61-36-36-61 61-61-61-36 36 61 61-61 61 36 36Z"/>
      ) : (
        <path d="M314-228h50v-88h88v-50h-88v-88h-50v88h-88v50h88v88Zm215-35h201v-49H529v49Zm0-107h201v-50H529v50ZM241-605h196v-50H241v50ZM120-120v-720h720v720H120Zm60-60h600v-600H180v600Zm0 0v-600 600Zm386-353 61-61 61 61 36-36-61-61 61-61-36-36-61 61-61-61-36 36 61 61-61 61 36 36Z"/>
      )}
    </Svg>
  );
}

export function Calendar({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M120-80v-740h125v-60h65v60h340v-60h65v60h125v740H120Zm60-60h600v-430H180v430Z"/>
      ) : (
        <path d="M120-80v-740h125v-60h65v60h340v-60h65v60h125v740H120Zm60-60h600v-430H180v430Zm0-490h600v-130H180v130Zm0 0v-130 130Z"/>
      )}
    </Svg>
  );
}

export function CalendarDays({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M440-400v-80h80v80h-80Zm-160 0v-80h80v80h-80Zm320 0v-80h80v80h-80ZM440-240v-80h80v80h-80Zm-160 0v-80h80v80h-80Zm320 0v-80h80v80h-80ZM120-80v-740h125v-60h65v60h340v-60h65v60h125v740H120Zm60-60h600v-430H180v430Z"/>
      ) : (
        <path d="M440-400v-80h80v80h-80Zm-160 0v-80h80v80h-80Zm320 0v-80h80v80h-80ZM440-240v-80h80v80h-80Zm-160 0v-80h80v80h-80Zm320 0v-80h80v80h-80ZM120-80v-740h125v-60h65v60h340v-60h65v60h125v740H120Zm60-60h600v-430H180v430Zm0-490h600v-130H180v130Zm0 0v-130 130Z"/>
      )}
    </Svg>
  );
}

export function CalendarRange({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M277.5-405.5Q266-417 266-434t11.5-28.5Q289-474 306-474t28.5 11.5Q346-451 346-434t-11.5 28.5Q323-394 306-394t-28.5-11.5Zm177 0Q443-417 443-434t11.5-28.5Q466-474 483-474t28.5 11.5Q523-451 523-434t-11.5 28.5Q500-394 483-394t-28.5-11.5Zm170 0Q613-417 613-434t11.5-28.5Q636-474 653-474t28.5 11.5Q693-451 693-434t-11.5 28.5Q670-394 653-394t-28.5-11.5ZM120-80v-740h125v-60h65v60h340v-60h65v60h125v740H120Zm60-60h600v-430H180v430Z"/>
      ) : (
        <path d="M277.5-405.5Q266-417 266-434t11.5-28.5Q289-474 306-474t28.5 11.5Q346-451 346-434t-11.5 28.5Q323-394 306-394t-28.5-11.5Zm177 0Q443-417 443-434t11.5-28.5Q466-474 483-474t28.5 11.5Q523-451 523-434t-11.5 28.5Q500-394 483-394t-28.5-11.5Zm170 0Q613-417 613-434t11.5-28.5Q636-474 653-474t28.5 11.5Q693-451 693-434t-11.5 28.5Q670-394 653-394t-28.5-11.5ZM120-80v-740h125v-60h65v60h340v-60h65v60h125v740H120Zm60-60h600v-430H180v430Zm0-490h600v-130H180v130Zm0 0v-130 130Z"/>
      )}
    </Svg>
  );
}

export function CalendarOff({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m381-218-43-43 100-99-100-99 43-43 99 100 99-100 43 43-100 99 100 99-43 43-99-100-99 100ZM120-80v-740h125v-60h65v60h340v-60h65v60h125v740H120Zm60-60h600v-430H180v430Z"/>
      ) : (
        <path d="m381-218-43-43 100-99-100-99 43-43 99 100 99-100 43 43-100 99 100 99-43 43-99-100-99 100ZM120-80v-740h125v-60h65v60h340v-60h65v60h125v740H120Zm60-60h600v-430H180v430Zm0-490h600v-130H180v130Zm0 0v-130 130Z"/>
      )}
    </Svg>
  );
}

export function Clock({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m627-287 45-45-159-160v-201h-60v225l174 181ZM480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-82 31.5-155t86-127.5Q252-817 325-848.5T480-880q82 0 155 31.5t127.5 86Q817-708 848.5-635T880-480q0 82-31.5 155t-86 127.5Q708-143 635-111.5T480-80Z"/>
      ) : (
        <path d="m627-287 45-45-159-160v-201h-60v225l174 181ZM480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-82 31.5-155t86-127.5Q252-817 325-848.5T480-880q82 0 155 31.5t127.5 86Q817-708 848.5-635T880-480q0 82-31.5 155t-86 127.5Q708-143 635-111.5T480-80Zm0-400Zm0 340q140 0 240-100t100-240q0-140-100-240T480-820q-140 0-240 100T140-480q0 140 100 240t240 100Z"/>
      )}
    </Svg>
  );
}

export function Timer({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M360-860v-60h240v60H360Zm90 447h60v-230h-60v230ZM340.5-109.5Q275-138 226-187t-77.5-114.5Q120-367 120-441t28.5-139.5Q177-646 226-695t114.5-77.5Q406-801 480-801q67 0 125.5 22T710-717l51-51 43 43-51 51q36 40 61.5 97T840-441q0 74-28.5 139.5T734-187q-49 49-114.5 77.5T480-81q-74 0-139.5-28.5Z"/>
      ) : (
        <path d="M360-860v-60h240v60H360Zm90 447h60v-230h-60v230ZM340.5-109.5Q275-138 226-187t-77.5-114.5Q120-367 120-441t28.5-139.5Q177-646 226-695t114.5-77.5Q406-801 480-801q67 0 126 22.5T711-716l51-51 42 42-51 51q36 40 61.5 97T840-441q0 74-28.5 139.5T734-187q-49 49-114.5 77.5T480-81q-74 0-139.5-28.5Zm352-119Q780-316 780-441t-87.5-212.5Q605-741 480-741t-212.5 87.5Q180-566 180-441t87.5 212.5Q355-141 480-141t212.5-87.5ZM480-440Z"/>
      )}
    </Svg>
  );
}

export function Gauge({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M418-340q25 25 63 23.5t55-27.5l221-333-333 221q-26 18-28.5 54.5T418-340ZM192-160q-18 0-34-8.5T134-193q-26-48-40-100T80-399q0-83 31.5-156T197-682.5q54-54.5 126.5-86T478-800q83 0 156.5 31.5t128 86Q817-628 848.5-555T880-399q0 54-13 106.5T827-193q-9 16-25 24.5t-34 8.5H192Z"/>
      ) : (
        <path d="M473.5-303.5Q517-305 537-336l216-339-335 219q-30 20-32 64t21 67q23 23 66.5 21.5ZM478-799q57 0 119 18.5T716-717l-52 37q-45-30-96.5-44.5T477.98-739q-140.47 0-239.23 100.22Q140-538.57 140-396.02 140-351 152.5-305q12.5 46 35.5 85h579q22-36 35-84t13-94q0-42-12.5-90.5T758-578l39-52q38 56 57 112.5T875-404q2 60-12 113t-41 98q-12 23-25.5 28t-33.5 5H192q-17 0-33.5-8.5T134-193q-26-48-40-97.5T80-396q0-83 31.5-156.5t85.5-128Q251-735 323.68-767T478-799Zm-9 331Z"/>
      )}
    </Svg>
  );
}

// `target-fill` is identical to the outline upstream: `filled` is a no-op.
export function Target({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5ZM721-239q99-99 99-241t-99-241q-99-99-241-99t-241 99q-99 99-99 241t99 241q99 99 241 99t241-99Zm-411-71q-70-70-70-170t70-170q70-70 170-70t170 70q70 70 70 170t-70 170q-70 70-170 70t-170-70Zm297.5-42.5Q660-405 660-480t-52.5-127.5Q555-660 480-660t-127.5 52.5Q300-555 300-480t52.5 127.5Q405-300 480-300t127.5-52.5Zm-184-71Q400-447 400-480t23.5-56.5Q447-560 480-560t56.5 23.5Q560-513 560-480t-23.5 56.5Q513-400 480-400t-56.5-23.5Z"/>
    </Svg>
  );
}

export function Crosshair({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M450-42v-75q-137-14-228-105T117-450H42v-60h75q14-137 105-228t228-105v-75h60v75q137 14 228 105t105 228h75v60h-75q-14 137-105 228T510-117v75h-60Zm244.5-223.5Q784-355 784-480t-89.5-214.5Q605-784 480-784t-214.5 89.5Q176-605 176-480t89.5 214.5Q355-176 480-176t214.5-89.5Zm-321-108Q330-417 330-480t43.5-106.5Q417-630 480-630t106.5 43.5Q630-543 630-480t-43.5 106.5Q543-330 480-330t-106.5-43.5Z"/>
      ) : (
        <path d="M450-42v-75q-137-14-228-105T117-450H42v-60h75q14-137 105-228t228-105v-75h60v75q137 14 228 105t105 228h75v60h-75q-14 137-105 228T510-117v75h-60Zm244.5-223.5Q784-355 784-480t-89.5-214.5Q605-784 480-784t-214.5 89.5Q176-605 176-480t89.5 214.5Q355-176 480-176t214.5-89.5Zm-321-108Q330-417 330-480t43.5-106.5Q417-630 480-630t106.5 43.5Q630-543 630-480t-43.5 106.5Q543-330 480-330t-106.5-43.5ZM544-416q26-26 26-64t-26-64q-26-26-64-26t-64 26q-26 26-26 64t26 64q26 26 64 26t64-26Zm-64-64Z"/>
      )}
    </Svg>
  );
}

export function Compass({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m303-303 270-83 83-270-270 83-83 270Zm177-137q-17 0-28.5-11.5T440-480q0-17 11.5-28.5T480-520q17 0 28.5 11.5T520-480q0 17-11.5 28.5T480-440Zm0 360q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Z"/>
      ) : (
        <path d="m303-303 270-83 83-270-270 83-83 270Zm176.76-137q-16.76 0-28.26-11.74-11.5-11.73-11.5-28.5 0-16.76 11.74-28.26 11.73-11.5 28.5-11.5 16.76 0 28.26 11.74 11.5 11.73 11.5 28.5 0 16.76-11.74 28.26-11.73 11.5-28.5 11.5Zm.51 360q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm.22-60Q622-140 721-239.49q99-99.48 99-241Q820-622 721-721t-240.51-99q-141.52 0-241 99Q140-622 140-480.49q0 141.52 99.49 241 99.48 99.49 241 99.49ZM480-480Z"/>
      )}
    </Svg>
  );
}

export function MapPin({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M529.5-510.59q20.5-20.59 20.5-49.5t-20.59-49.41q-20.59-20.5-49.5-20.5t-49.41 20.59q-20.5 20.59-20.5 49.5t20.59 49.41q20.59 20.5 49.5 20.5t49.41-20.59ZM480-80Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Z"/>
      ) : (
        <path d="M529.5-510.5Q550-531 550-560t-20.5-49.5Q509-630 480-630t-49.5 20.5Q410-589 410-560t20.5 49.5Q451-490 480-490t49.5-20.5ZM480-159q133-121 196.5-219.5T740-552q0-118-75.5-193T480-820q-109 0-184.5 75T220-552q0 75 65 173.5T480-159Zm0 79Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/>
      )}
    </Svg>
  );
}

export function Flag({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M200-120v-680h343l19 86h238v370H544l-19-85H260v309h-60Z"/>
      ) : (
        <path d="M200-120v-680h343l19 86h238v370H544l-18.93-85H260v309h-60Zm300-452Zm95 168h145v-250H511l-19-86H260v251h316l19 85Z"/>
      )}
    </Svg>
  );
}

export function Route({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M200-120v-503.56q-35-13.44-57.5-41.7-22.5-28.27-22.5-64.41Q120-776 152.5-808t78-32q45.5 0 77.5 32.14t32 78.05q0 35.81-22.5 64.31T260-624v444h190v-660h310v503.56q35 13.44 57.5 41.8Q840-266.27 840-230q0 45-32.08 77.5Q775.83-120 730-120q-45 0-77.5-32.5T620-230q0-36.3 22.5-65.15Q665-324 700-336v-444H510v660H200Z"/>
      ) : (
        <path d="M200-120v-503.56q-35-13.44-57.5-41.7-22.5-28.27-22.5-64.41Q120-776 152.5-808t78-32q45.5 0 77.5 32.14t32 78.05q0 35.81-22.5 64.31T260-624v444h190v-660h310v503.56q35 13.44 57.5 41.8Q840-266.27 840-230q0 45-32.08 77.5Q775.83-120 730-120q-45 0-77.5-32.5T620-230q0-36.3 22.5-65.15Q665-324 700-336v-444H510v660H200Zm30.5-560q20.5 0 35-15t14.5-35.5q0-20.5-14.37-35Q251.25-780 230-780q-20 0-35 14.37-15 14.38-15 35.63 0 20 15 35t35.5 15Zm500 500q20.5 0 35-15t14.5-35.5q0-20.5-14.37-35Q751.25-280 730-280q-20 0-35 14.37-15 14.38-15 35.63 0 20 15 35t35.5 15ZM230-730Zm500 500Z"/>
      )}
    </Svg>
  );
}

export function Mountain({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m40-240 240-320 195 260h75L397-503l163-217 360 480H40Z"/>
      ) : (
        <path d="m40-240 240-320 195 260h325L560-619 435-453l-38-50 163-217 360 480H40Zm510-60Zm-390 0h240L280-460 160-300Zm0 0h240-240Z"/>
      )}
    </Svg>
  );
}

export function TreePine({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M543-80v-119h115v119H543Zm-240 0v-149H0l189-274H94l266-377 266 377h-94l189 274H418v149H303Zm455-149L590-473h93L499-737l101-143 266 377h-94l188 274H758Z"/>
      ) : (
        <path d="M303-80v-149H0l189-274H94l266-377 120 170 120-170 266 377h-94l188 274H658v149H543v-149H418v149H303Zm377-209h165L656-563h89L600-769l-80 115 106 151h-94l148 214Zm-564 0h489L416-563h89L360-769 215-563h90L116-289Zm0 0h189-90 290-89 189-489Zm564 0H532h94-106 225-89 189-165Zm-137 60h115-115Zm178 0Z"/>
      )}
    </Svg>
  );
}

export function Footprints({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M260-920q85 0 132.5 75.5T440-680q0 45-10.5 85T408-525l-275 57q-15-27-34-81.5T80-680q0-103 51-171.5T260-920Zm55 680q-74 0-113.5-52.5T160-413l253-53q9 17 18 42t9 51q0 57-35.5 95T315-240Zm385-480q78 0 129 68.5T880-480q0 75-18.5 130T828-269l-276-56q-11-30-21.5-70T520-480q0-89 47.5-164.5T700-720ZM645-40q-54 0-89.5-38T520-173q0-26 9-51t18-42l253 51q-2 68-41.5 121.5T645-40Z"/>
      ) : (
        <path d="M260-860q-52 0-86 51t-34 129q0 78 23 131.5t32 67.5l144-30q14-38 27.5-84t13.5-85q0-67-31.5-123.5T260-860Zm55 560q28 0 46.5-20.5T380-373q0-20-9-41.5T351-453l-131 27q-1 43 21.5 84.5T315-300Zm385-360q-57 0-88.5 56.5T580-480q0 40 14 85.5t28 83.5l143 29q10-15 32.5-68T820-480q0-78-34-129t-86-51Zm-55 560q51 0 73-42t22-85l-131-26q-10 17-19.5 38.5T580-173q0 32 18.5 52.5T645-100ZM315-240q-77 0-117-57t-38-128l-18-27q-11-17-36.5-77T80-680q0-103 51-171.5T260-920q85 0 132.5 75.5T440-680q0 58-16 107t-28 79l8 13q8 14 22 44.5t14 63.5q0 57-35.5 95T315-240ZM645-40q-54 0-89.5-38T520-173q0-33 14-63.5t22-44.5l8-13q-12-30-28-79t-16-107q0-89 47.5-164.5T700-720q78 0 129 68.5T880-480q0 91-25.5 150.5T818-253l-18 28q1 71-38.5 128T645-40Z"/>
      )}
    </Svg>
  );
}

// `fitness_center-fill` is identical to the outline upstream: `filled` is a no-op.
export function Dumbbell({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="m550-84-42-42 142-142-382-382-142 142-42-42 56-58-56-56 85-85-42-42 42-42 43 41 84-84 56 56 58-56 42 42-142 142 382 382 142-142 42 42-56 58 56 56-86 86 42 42-42 42-42-42-84 84-56-56-58 56Z"/>
    </Svg>
  );
}

// `vital_signs-fill` is identical to the outline upstream: `filled` is a no-op.
export function Activity({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M48-450v-60h213l102 241 232-579 146 338h171v60H699L597-689 364-110 219-450H48Z"/>
    </Svg>
  );
}

export function HeartPulse({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M645-840q100 0 167.5 74T880-590q0 20-3 29.5t-9 50.5H621l-82-106h-44l-72 217-67-111H92q-6-40-9-49.5T80-589q0-103 67-177t167-74q48 0 90.5 19t75.5 53q32-34 74.5-53t90.5-19ZM479-82 148-415q-8-8-15-16.5T120-450h199l90 134h51l70-217 56 83h253q-6 9-12.5 17.5T812-416L479-82Z"/>
      ) : (
        <path d="M148-415q-35-35-51.5-80T80-589q0-103 67-177t167-74q48 0 90.5 19t75.5 53q32-34 74.5-53t90.5-19q100 0 167.5 74T880-590q0 49-17 94t-51 80L479-82 148-415Zm166-365q-74.57 0-124.29 56.44Q140-667.12 140-590q0 20.72 4 40.86T156-510h219l56 83 69-218h26l91 135h187.21q7.9-19.43 11.84-39.43 3.95-20 3.95-40.57 0-77-49.95-133.5Q720.11-780 645.19-780q-35.19 0-67.69 14.5T521-725l-30.76 33H469l-31-33q-24.27-25.82-56.64-40.41Q349-780 314-780Zm166 612 281-282H584.87L529-533l-70 217h-25l-91-134H198l282 282Zm0-306Z"/>
      )}
    </Svg>
  );
}

export function Flame({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M160-400q0-105 50-187t110-138q60-56 110-85.5l50-29.5v132q0 37 25 58.5t56 21.5q17 0 32.5-7t28.5-23l18-22q72 42 116 116.5T800-400q0 95-49 171.5T622-113q23-26 35.5-58t12.5-67q0-38-14-71.5T615-370L480-502 346-370q-28 27-42 60.5T290-238q0 35 12.5 67t35.5 58q-80-39-129-115.5T160-400Zm320-18 92 90q18 18 28 41t10 49q0 53-38 90.5T480-110q-54 0-92-37.5T350-238q0-26 9.5-49t28.5-41l92-90Z"/>
      ) : (
        <path d="M220-400q0 63 28.5 118.5T328-189q-4-12-6-24.5t-2-24.5q0-32 12-60t35-51l113-111 113 111q23 23 35 51t12 60q0 12-2 24.5t-6 24.5q51-37 79.5-92.5T740-400q0-54-23-105.5T651-600q-21 15-44 23.5t-46 8.5q-61 0-101-41.5T420-714v-20q-46 33-83 73t-63 83.5q-26 43.5-40 89T220-400Zm260 24-71 70q-14 14-21.5 31t-7.5 37q0 41 29 69.5t71 28.5q42 0 71-28.5t29-69.5q0-20-7.5-37T551-306l-71-70Zm0-464v132q0 34 23.5 57t57.5 23q18 0 33.5-7.5T622-658l18-22q74 42 117 117t43 163q0 134-93 227T480-80q-134 0-227-93t-93-227q0-128 86-246.5T480-840Z"/>
      )}
    </Svg>
  );
}

export function Rocket({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m98-537 168-168q14-14 33-20t39-2l77 14q-55 62-89 117.5T263-466L98-537Zm202 89q27-73 68-137.5T461-702q88-88 201-131.5T873-860q17 98-26 211T716-448q-52 52-117 93t-138 68L300-448Zm335.5-105q29.5 0 49.5-20t20-49.5q0-29.5-20-49.5t-49.5-20q-29.5 0-49.5 20t-20 49.5q0 29.5 20 49.5t49.5 20ZM551-85l-72-165q74-29 129.5-63T726-402l14 77q4 20-2 39.5T718-252L551-85ZM162-318q35-35 85-35.5t85 34.5q35 35 35 85t-35 85q-26 26-81 43T87-74q15-109 32-163.5t43-80.5Z"/>
      ) : (
        <path d="m187-551 106 45q18-36 38.5-71t43.5-67l-79-16-109 109Zm154 81 133 133q57-26 107-59t81-64q81-81 119-166t41-192q-107 3-192 41T464-658q-31 31-64 81t-59 107Zm209-145.5q0-29.5 20-49.5t49.5-20q29.5 0 49.5 20t20 49.5q0 29.5-20 49.5t-49.5 20q-29.5 0-49.5-20t-20-49.5Zm5 432.5 109-109-16-79q-32 23-67 43.5T510-289l45 106Zm326-694q9 136-34 248T705-418l-2 2-2 2 22 110q3 15-1.5 29T706-250L535-78l-85-198-170-170-198-85 172-171q11-11 25-15.5t29-1.5l110 22q1-1 2-1.5t2-1.5q99-99 211-142.5T881-877ZM149-325q35-35 85.5-35.5T320-326q35 35 34.5 85.5T319-155q-26 26-80.5 43T75-80q15-109 31.5-164t42.5-81Zm42 43q-14 15-25 47t-19 82q50-8 82-19t47-25q19-17 19.5-42.5T278-284q-19-18-44.5-17.5T191-282Z"/>
      )}
    </Svg>
  );
}

export function Zap({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m320-80 40-280H160l360-520h80l-40 320h240L400-80h-80Z"/>
      ) : (
        <path d="m393-165 279-335H492l36-286-253 366h154l-36 255Zm-73 85 40-280H160l360-520h80l-40 320h240L400-80h-80Zm154-396Z"/>
      )}
    </Svg>
  );
}

// `trending_up-fill` is identical to the outline upstream: `filled` is a no-op.
export function TrendingUp({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="m123-240-43-43 292-291 167 167 241-241H653v-60h227v227h-59v-123L538-321 371-488 123-240Z"/>
    </Svg>
  );
}

export function Leaf({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M444-80q-42 0-78.5-8T298-112q32-119 87.5-230.5T535-529q-112 54-194.5 150T228-161q-4-4-7.5-7t-7.5-7q-45-45-69-103t-24-122q0-69 26-133t75-113q77-79 200-102.5t368-6.5q19 238-5.5 365T679-183q-48 50-109 76.5T444-80Z"/>
      ) : (
        <path d="M213-175q-43.59-45-68.3-104Q120-338 120-400q0-73 25.5-133.5T222-645q35-35 87-59t122.5-37.5Q502-755 591-758.5t198 3.5q8 108 5.5 197.5t-16 160.75q-13.5 71.25-38 124.56Q716-218.87 680-183q-51 51-110 77T444-80q-69 0-126.5-23.5T213-175Zm103 0q25 17 58 26t69.92 9Q497-140 547-162t91-64q27-27 46-70.5t31-103Q727-459 731-534t0-165q-94-2-168.5 2.5T431-680q-57 12-98 30.5T266-604q-42 43-64 91t-22 98q0 48 20.5 100.5T251-230q53-98 127-176t157-123q-87 75-141 162.5T316-175Zm0 0Zm0 0Z"/>
      )}
    </Svg>
  );
}

export function Droplets({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M479-208q16 0 24.5-5.5T512-230q0-11-8.5-17t-25.5-6q-42 0-85.5-26.5T337-373q-2-9-9-14.5t-15-5.5q-11 0-17 8.5t-4 17.5q15 84 71 121.5T479-208Zm-227.5 34Q160-268 160-408q0-100 79.5-217.5T480-880q161 137 240.5 254.5T800-408q0 140-91.5 234T480-80q-137 0-228.5-94Z"/>
      ) : (
        <path d="M479-208q16 0 24.5-5.5T512-230q0-11-8.5-17t-25.5-6q-42 0-85.5-26.5T337-373q-2-9-9-14.5t-15-5.5q-11 0-17 8.5t-4 17.5q15 84 71 121.5T479-208Zm-227.5 34Q160-268 160-408q0-100 79.5-217.5T480-880q161 137 240.5 254.5T800-408q0 140-91.5 234T480-80q-137 0-228.5-94ZM666-216.5Q740-293 740-408q0-79-66.5-179.5T480-800Q353-688 286.5-587.5T220-408q0 115 74 191.5T480-140q112 0 186-76.5ZM480-480Z"/>
      )}
    </Svg>
  );
}

// `restaurant-fill` is identical to the outline upstream: `filled` is a no-op.
export function Utensils({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M285-80v-368q-52-11-88.5-52.5T160-600v-280h60v280h65v-280h60v280h65v-280h60v280q0 58-36.5 99.5T345-448v368h-60Zm415 0v-320H585v-305q0-79 48-127t127-48v800h-60Z"/>
    </Svg>
  );
}

export function Coffee({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M442-242q-116 0-199-80t-83-195v-323h589q54 0 92.5 37t38.5 91q0 60-37 106t-94 46h-25v43q0 115-83 195t-199 80ZM220-620h444v-160H220v160Zm504 0h25q33 0 52-28.5t19-63.5q0-29-21-48.5T749-780h-25v160ZM160-120v-60h640v60H160Z"/>
      ) : (
        <path d="M442-242q-116 0-199-80t-83-195v-323h589q54 0 92.5 37t38.5 91q0 60-37 106t-94 46h-25v43q0 115-83 195t-199 80ZM220-620h444v-160H220v160Zm222 318q91 0 156.5-62T664-517v-43H220v43q0 91 65.5 153T442-302Zm282-318h25q33 0 52-28.5t19-63.5q0-29-21-48.5T749-780h-25v160ZM160-120v-60h640v60H160Zm282-440Z"/>
      )}
    </Svg>
  );
}

export function Pill({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m661-342 113-114q32-32 49-73t17-86q0-94-65.5-159.5T615-840q-45 0-86 17t-73 49L342-661l319 319ZM345-120q45 0 86-17t73-49l114-113-319-319-113 114q-32 32-49 73t-17 86q0 94 65.5 159.5T345-120Z"/>
      ) : (
        <path d="M345-120q-94 0-159.5-65.5T120-345q0-45 17-86t49-73l270-270q32-32 73-49t86-17q94 0 159.5 65.5T840-615q0 45-17 86t-49 73L504-186q-32 32-73 49t-86 17Zm273-265 114-113q23-23 35.5-53.5T780-615q0-69-48-117t-117-48q-33 0-63.5 12.5T498-732L385-618l233 233ZM345-180q32 0 63-12.5t54-35.5l113-114-233-233-114 113q-23 23-35.5 53.5T180-345q0 69 48 117t117 48Z"/>
      )}
    </Svg>
  );
}

// `ac_unit-fill` is identical to the outline upstream: `filled` is a no-op.
export function Snowflake({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M450-80v-195L301-126l-43-42 192-192v-90h-90L172-262l-44-41 147-147H80v-60h195L125-660l43-43 192 193h90v-91L262-789l42-44 146 147v-194h60v194l150-150 42 43-192 192v91h91l189-189 43 42-147 147h194v60H686l148 149-41 43-192-192h-91v90l192 193-41 43-151-151v195h-60Z"/>
    </Svg>
  );
}

export function Wheat({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m122-80-42-42 114-114q-29-29-47.5-56T128-364q0-30 11.5-57.5T172-470l39-38 38 38q27 27 38.5 65t.5 75l66-66q-29-30-47.5-57T288-525q0-30 11-57.5t32-48.5l39-38 38 38q27 27 38.5 66t.5 76l73-73q-27-30-47.5-57T452-690q0-30 12.5-59t33.5-50l81-81 42 42-45 45 6 7q23 27 31.5 63t-2.5 70l226-226 43 42-238 237q35-14 73-7.5t67 29.5l7 5 47-43 44 44-82 83q-22 21-49.5 32.5T691-445q-43 0-72-22t-59-51l-83 84q39-17 82-6t72 40l39 39-38 38q-21 21-49 32.5T525-279q-43 0-72-22t-58-51l-81 80q40-17 83.5-7t74.5 40l39 39-39 38q-21 21-48.5 32.5T366-118q-44 0-73-22t-59-52L122-80Z"/>
      ) : (
        <path d="m122-80-42-43 122-121q-30-30-46-67t-16-76q0-38 14-72.5t41-60.5l50-49 36 35q1-36 15-69t40-58l50-49 36 35q1-36 15.5-69t39.5-58l110-109 42 42-59 60 7 7q26 25 40 58t15 70l204-204 42 42-202 204q36 1 68.5 15.5T803-576l8 7 59-60 42 42-108 109q-26 26-59.5 40.5T674-422l36 36-49 49q-26 26-59 40.5T533-281l36 36-50 50q-26 27-61 41t-73 14q-35 0-69-16t-69-48L122-80Zm123-208q22-21 33.5-46.5T290-386q0-26-11.5-51T245-485q-23 23-34.5 48T199-386q0 26 11.5 51.5T245-288Zm141 89q26 0 51-11.5t48-34.5q-23-22-48-33.5T386-290q-26 0-51 11.5T287-244q22 22 47.5 33.5T386-199Zm0-229q22-23 33.5-48t11.5-51q0-26-11.5-51.5T386-625q-23 21-34.5 46.5T340-527q0 26 11.5 51t34.5 48Zm142 88q26 0 51-11.5t46-34.5q-21-22-46-33.5T528-431q-26 0-51.5 11.5T429-385q22 22 47.5 33.5T528-340Zm-1-229q22-22 33.5-47.5T572-668q0-26-11-51.5T528-768q-23 23-34.5 48T482-669q0 26 11.5 51.5T527-569Zm142 88q26 0 51-12t48-35q-23-22-48.5-33.5T668-573q-26 0-50.5 11.5T570-527q23 23 48 34.5t51 11.5Z"/>
      )}
    </Svg>
  );
}

// `balance-fill` is identical to the outline upstream: `filled` is a no-op.
export function Scale({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M80-120v-60h370v-484q-26-9-46.5-29.5T374-740H215l125 302q-1 45-38.5 76.5T210-330q-54 0-91.5-31.5T80-438l125-302h-85v-60h254q12-35 41-57.5t65-22.5q36 0 65 22.5t41 57.5h254v60h-85l125 302q-1 45-38.5 76.5T750-330q-54 0-91.5-31.5T620-438l125-302H586q-9 26-29.5 46.5T510-664v484h370v60H80Zm595-320h150l-75-184-75 184Zm-540 0h150l-75-184-75 184Zm345-280q21 0 35.5-15t14.5-35q0-21-14.5-35.5T480-820q-20 0-35 14.5T430-770q0 20 15 35t35 15Z"/>
    </Svg>
  );
}

export function FlaskConical({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M172-120q-42 0-59.5-39t11.5-71l248-280v-270h-82v-60h380v60h-82v270l248 280q29 32 11.5 71T788-120H172Z"/>
      ) : (
        <path d="M172-120q-42 0-59.5-39t11.5-71l248-280v-270h-82v-60h380v60h-82v270l248 280q29 32 11.5 71T788-120H172Zm-12-60h640L528-488v-292h-96v292L160-180Zm318-300Z"/>
      )}
    </Svg>
  );
}

export function Brain({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M449-374h60l3-44q12-2 22.5-8.5T553-441l42 14 28-48-30-24q5-14 5-29t-5-29l30-24-28-48-42 14q-8-8-19-14t-22-9l-3-44h-60l-3 44q-11 3-22 9t-19 14l-42-14-28 48 30 24q-5 14-5 29t5 29l-30 24 28 48 42-14q8 8 18.5 14.5T446-418l3 44Zm-19.5-104.5Q409-499 409-528t20.5-49.5Q450-598 479-598t49.5 20.5Q549-557 549-528t-20.5 49.5Q508-458 479-458t-49.5-20.5ZM240-80v-172q-57-52-88.5-121.5T120-520q0-150 105-255t255-105q125 0 221.5 73.5T827-615l64 255H760v200H600v80H240Z"/>
      ) : (
        <path d="M449-374h60l3-44q12-2 22.47-8.46Q544.94-432.92 553-441l42 14 28-48-30-24q5-14 5-29t-5-29l30-24-28-48-42 14q-8.33-7.69-19.17-13.85Q523-635 512-638l-3-44h-60l-3 44q-11 3-21.83 9.15Q413.33-622.69 405-615l-42-14-28 48 30 24q-5 14-5 29t5 29l-30 24 28 48 42-14q8.06 8.08 18.53 14.54Q434-420 446-418l3 44Zm-19.5-104.38q-20.5-20.38-20.5-49.5t20.38-49.62q20.38-20.5 49.5-20.5t49.62 20.38q20.5 20.38 20.5 49.5t-20.38 49.62q-20.38 20.5-49.5 20.5t-49.62-20.38ZM240-80v-172q-57-52-88.5-121.5T120-520q0-150 105-255t255-105q125 0 221.5 73.5T827-615l64 255H760v200H600v80h-60v-140h160v-200h114l-45-180q-24-97-105-158.5T480-820q-125 0-212.5 86.5T180-522.46q0 64.42 26.32 122.39Q232.65-342.09 281-297l19 18v199h-60Zm257-370Z"/>
      )}
    </Svg>
  );
}

export function Dices({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M335.5-264.62q14.5-14.62 14.5-35.5 0-20.88-14.62-35.38-14.62-14.5-35.5-14.5-20.88 0-35.38 14.62-14.5 14.62-14.5 35.5 0 20.88 14.62 35.38 14.62 14.5 35.5 14.5 20.88 0 35.38-14.62Zm0-360q14.5-14.62 14.5-35.5 0-20.88-14.62-35.38-14.62-14.5-35.5-14.5-20.88 0-35.38 14.62-14.5 14.62-14.5 35.5 0 20.88 14.62 35.38 14.62 14.5 35.5 14.5 20.88 0 35.38-14.62Zm180 180q14.5-14.62 14.5-35.5 0-20.88-14.62-35.38-14.62-14.5-35.5-14.5-20.88 0-35.38 14.62-14.5 14.62-14.5 35.5 0 20.88 14.62 35.38 14.62 14.5 35.5 14.5 20.88 0 35.38-14.62Zm180 180q14.5-14.62 14.5-35.5 0-20.88-14.62-35.38-14.62-14.5-35.5-14.5-20.88 0-35.38 14.62-14.5 14.62-14.5 35.5 0 20.88 14.62 35.38 14.62 14.5 35.5 14.5 20.88 0 35.38-14.62Zm0-360q14.5-14.62 14.5-35.5 0-20.88-14.62-35.38-14.62-14.5-35.5-14.5-20.88 0-35.38 14.62-14.5 14.62-14.5 35.5 0 20.88 14.62 35.38 14.62 14.5 35.5 14.5 20.88 0 35.38-14.62ZM120-120v-720h720v720H120Z"/>
      ) : (
        <path d="M335.5-264.62q14.5-14.62 14.5-35.5 0-20.88-14.62-35.38-14.62-14.5-35.5-14.5-20.88 0-35.38 14.62-14.5 14.62-14.5 35.5 0 20.88 14.62 35.38 14.62 14.5 35.5 14.5 20.88 0 35.38-14.62Zm0-360q14.5-14.62 14.5-35.5 0-20.88-14.62-35.38-14.62-14.5-35.5-14.5-20.88 0-35.38 14.62-14.5 14.62-14.5 35.5 0 20.88 14.62 35.38 14.62 14.5 35.5 14.5 20.88 0 35.38-14.62Zm180 180q14.5-14.62 14.5-35.5 0-20.88-14.62-35.38-14.62-14.5-35.5-14.5-20.88 0-35.38 14.62-14.5 14.62-14.5 35.5 0 20.88 14.62 35.38 14.62 14.5 35.5 14.5 20.88 0 35.38-14.62Zm180 180q14.5-14.62 14.5-35.5 0-20.88-14.62-35.38-14.62-14.5-35.5-14.5-20.88 0-35.38 14.62-14.5 14.62-14.5 35.5 0 20.88 14.62 35.38 14.62 14.5 35.5 14.5 20.88 0 35.38-14.62Zm0-360q14.5-14.62 14.5-35.5 0-20.88-14.62-35.38-14.62-14.5-35.5-14.5-20.88 0-35.38 14.62-14.5 14.62-14.5 35.5 0 20.88 14.62 35.38 14.62 14.5 35.5 14.5 20.88 0 35.38-14.62ZM120-120v-720h720v720H120Zm60-60h600v-600H180v600Zm0 0v-600 600Z"/>
      )}
    </Svg>
  );
}

export function ClipboardCheck({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="m423-329 277-277-43-43-234 234-121-121-42 42 163 165ZM120-120v-720h265q5-35 32-57.5t63-22.5q36 0 63 22.5t32 57.5h265v720H120Zm384.5-687.5Q515-818 515-832t-10.5-24.5Q494-867 480-867t-24.5 10.5Q445-846 445-832t10.5 24.5Q466-797 480-797t24.5-10.5Z"/>
      ) : (
        <path d="m423-329 277-277-43-43-234 234-121-121-42 42 163 165ZM120-120v-720h265q5-35 32-57.5t63-22.5q36 0 63 22.5t32 57.5h265v720H120Zm60-60h600v-600H180v600Zm324.5-627.5Q515-818 515-832t-10.5-24.5Q494-867 480-867t-24.5 10.5Q445-846 445-832t10.5 24.5Q466-797 480-797t24.5-10.5ZM180-180v-600 600Z"/>
      )}
    </Svg>
  );
}

// `directions_bike-fill` is identical to the outline upstream: `filled` is a no-op.
export function Bike({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M619.08-754q-30.08 0-51.58-21.42t-21.5-51.5q0-30.08 21.42-51.58t51.5-21.5q30.08 0 51.58 21.42t21.5 51.5q0 30.08-21.42 51.58t-51.5 21.5ZM422-548l89 95v247h-60v-200L263-570l171-171q8-8 22.5-14.5T487-762q16 0 30.5 6.5T540-741l78 78q27 27 64.54 46.5Q720.08-597 767-597v60q-59.56 0-107.78-22.5T573-620l-40-40-111 112Zm-221.91 78Q283-470 339-413.91t56 139Q395-192 338.91-136t-139 56Q117-80 61-136.09t-56-139Q5-358 61.09-414t139-56ZM304-171q42-42 42-104t-42-104q-42-42-104-42T96-379q-42 42-42 104t42 104q42 42 104 42t104-42Zm595-242.91q56 56.09 56 139T898.91-136q-56.09 56-139 56T621-136.09q-56-56.09-56-139T621.09-414q56.09-56 139-56T899-413.91ZM864-171q42-42 42-104t-42-104q-42-42-104-42t-104 42q-42 42-42 104t42 104q42 42 104 42t104-42Z"/>
    </Svg>
  );
}

// `waves-fill` is identical to the outline upstream: `filled` is a no-op.
export function Waves({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M80-146v-60q28-3 48-16t40-27.5q20-14.5 45-25.5t62-11q37 0 63 12.5t47.5 27.5q21.5 15 43.5 27.5t51 12.5q29 0 51-12.5t43.5-27.5q21.5-15 47.5-27.5t63-12.5q37 0 61.5 11t45 25.5Q812-235 832-222t48 16v60q-35-2-58.5-14.5t-44-27Q757-202 736-214t-51-12q-30 0-52.5 12.5t-44 27.5q-21.5 15-47 27.5T480-146q-36 0-61.5-12.5t-47-27.5q-21.5-15-44-27.5T275-226q-30 0-51.5 12T182-187.5q-20 14.5-43.5 27T80-146Zm0-176v-60q28-3 48-16t40-27.5q20-14.5 45-25.5t62-11q37 0 63 12.5t47.5 27.5q21.5 15 43.5 27.5t51 12.5q29 0 51-12.5t43.5-27.5q21.5-15 47.5-27.5t63-12.5q37 0 61.5 11t45 25.5Q812-411 832-398t48 16v60q-35-4-58.5-17t-44-27Q757-380 736-391t-51-11q-30 0-52 12.5T589-362q-22 15-47.5 27.5T480-322q-36 0-61.5-12.5t-47-27.5q-21.5-15-44-27.5T275-402q-30 0-51.5 12T182-363.5q-20 14.5-43.5 27T80-322Zm0-176v-60q28-2 48-14.5t40-27q20-14.5 45-26.5t62-12q37 0 63 12.5t47.5 27.5q21.5 15 43.5 27.5t51 12.5q29 0 51-12.5t43.5-27.5q21.5-15 47.5-27.5t63-12.5q37 0 61.5 12t45 26.5q20.5 14.5 40.5 27t48 14.5v60q-35-2-58.5-14.5t-44-27Q757-554 736-566t-51-12q-30 0-52.5 12.5t-44 27.5q-21.5 15-47 27.5T480-498q-36 0-61.5-12.5t-47-27.5q-21.5-15-44-27.5T275-578q-30 0-51.5 12T182-539.5q-20 14.5-43.5 27T80-498Zm0-176v-60q28-3 48-16t40-27.5q20-14.5 45-25.5t62-11q37 0 63 12.5t47.5 27.5q21.5 15 43.5 27.5t51 12.5q29 0 51-12.5t43.5-27.5q21.5-15 47.5-27.5t63-12.5q37 0 61.5 11t45 25.5Q812-763 832-750t48 16v60q-35-2-58.5-14.5t-44-27Q757-730 736-742t-51-12q-30 0-52.5 12.5t-44 27.5q-21.5 15-47 27.5T480-674q-36 0-61.5-12.5t-47-27.5q-21.5-15-44-27.5T275-754q-30 0-51.5 12T182-715.5q-20 14.5-43.5 27T80-674Z"/>
    </Svg>
  );
}

// `directions_run-fill` is identical to the outline upstream: `filled` is a no-op.
export function Run({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M535-40v-239l-108-99-42 188-265-55 11-56 199 40 73-369-100 47v134h-60v-175l164-69q32-14 45.5-17.5T480-714q20 0 35.5 8.5T542-680l42 67q26 42 71 73t105 31v60q-67 0-119.5-31T543-573l-39 158 91 84v291h-60Zm-46.5-735.5Q467-797 467-827t21.5-51.5Q510-900 540-900t51.5 21.5Q613-857 613-827t-21.5 51.5Q570-754 540-754t-51.5-21.5Z"/>
    </Svg>
  );
}

// `pool-fill` is identical to the outline upstream: `filled` is a no-op.
export function Pool({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="M80-120v-64q36-3 57.5-21t67.5-18q46 0 75 21.5t67 21.5q38 0 62.5-21.5T480-223q46 0 75 21.5t67 21.5q38 0 63-21.5t71-21.5q46 0 67 18t57 21v64q-35-3-60.5-22.5T756-162q-38 0-65 21t-69 21q-42 0-73-21t-69-21q-38 0-66.5 21T343-120q-42 0-71-21t-67-21q-38 0-64 19.5T80-120Zm0-188v-60q36-3 57.5-20.5T205-406q46 0 73 19t65 19q38 0 64.5-19t72.5-19q46 0 73 19t65 19q38 0 65-19t73-19q46 0 67 17.5t57 20.5v60q-35-3-60.5-22.5T756-350q-38 0-65 21t-69 21q-42 0-73-21t-69-21q-38 0-64.5 21T347-308q-42 0-73-21t-69-21q-38 0-64 19.5T80-308Zm655.5-501.5Q763-782 763-742t-27.5 67.5Q708-647 668-647t-67.5-27.5Q573-702 573-742t27.5-67.5Q628-837 668-837t67.5 27.5ZM343-491q-18 0-32.5-7T288-516l135-135-54-54-158-57v-79l209 80 253 253q-11 9-25.5 13t-29.5 4q-38 0-65.5-21T480-533q-45 0-72 21t-65 21Z"/>
    </Svg>
  );
}

export function HeartRate({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M80-510v-290h800v290H659l-79-157h-40L400-388l-61-122H80Zm0 350v-290h221l79 158h40l140-280 61 122h259v290H80Z"/>
      ) : (
        <path d="M80-570v-230h800v230h-60v-170H140v170H80Zm0 410v-230h60v170h680v-170h60v230H80Zm221-290 79 158h40l140-280 61 122h259v-60H659l-79-157h-40L400-388l-61-122H80v60h221Zm179-30Z"/>
      )}
    </Svg>
  );
}

// `sports_gymnastics-fill` is identical to the outline upstream: `filled` is a no-op.
export function Stretching({ className, size = 24 }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      <path d="m490-80-20-398-149-52H40v-60h243l275-197 39 46-149 107 97 34 340-200 35 42-346 251-24 427h-60ZM240.08-647q-30.08 0-51.58-21.42t-21.5-51.5q0-30.08 21.42-51.58t51.5-21.5q30.08 0 51.58 21.42t21.5 51.5q0 30.08-21.42 51.58t-51.5 21.5Z"/>
    </Svg>
  );
}

export function Healing({ className, size = 24, filled = false }: IconProps) {
  return (
    <Svg viewBox="0 -960 960 960" size={size} className={className}>
      {filled ? (
        <path d="M260-55 55-260l650-650 205 205L260-55Zm244-201 205-205 201 201L705-55 504-256Zm7-125q11-11 11-28t-11-28q-11-11-28-11t-28 11q-11 11-11 28t11 28q11 11 28 11t28-11Zm-102-63q17 0 28-11t11-28q0-17-11-28t-28-11q-17 0-28 11t-11 28q0 17 11 28t28 11Zm147 0q17 0 28-11t11-28q0-17-11-28t-28-11q-17 0-28 11t-11 28q0 17 11 28t28 11Zm-299-58L55-705l205-205 201 201-204 207Zm254-26q11-11 11-28t-11-28q-11-11-28-11t-28 11q-11 11-11 28t11 28q11 11 28 11t28-11Z"/>
      ) : (
        <path d="M483-277 260-55 55-260l221-222L55-705l205-205 223 223 222-223 205 205-222 223 222 222L705-55 483-277Zm28-251.21q11-11.21 11-27.79t-11-27.79Q500-595 483-595t-28 11.21q-11 11.21-11 27.79t11 27.79Q466-517 483-517t28-11.21ZM315-521l127-126-180-179-124 124 177 181Zm94 77q16.58 0 27.79-11T448-483q0-17-11.21-28T409-522q-16.58 0-27.79 11T370-483q0 17 11.21 28T409-444Zm102 62.79q11-11.21 11-27.79t-11-27.79Q500-448 483-448t-28 11.21q-11 11.21-11 27.79t11 27.79Q466-370 483-370t28-11.21ZM556-444q16.58 0 27.79-11T595-483q0-17-11.21-28T556-522q-16.58 0-27.79 11T517-483q0 17 11.21 28T556-444Zm-34 126 180 180 124-124-179-179-125 123ZM358-606Zm248 248Z"/>
      )}
    </Svg>
  );
}

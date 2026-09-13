import type { CSSProperties } from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, URL_LABEL, useLayout } from "../theme";
import { useLang } from "../lang";
import { CURVE, useBreath, useRamp, useSpring } from "../motion";

/**
 * A real app screen in a device frame.
 *
 * The 16:9 cut gets the desktop capture in browser chrome; the 9:16 cut gets
 * the phone capture in a handset. Same `shot` id either way, so a composition
 * never branches on format for its product footage.
 *
 * Three motions run at once and none of them stop: the frame arrives on a
 * spring out of a blur, the image pushes in slowly behind it, and the whole
 * device drifts against that push. The counter-drift is what sells depth — a
 * frame and its contents moving as one flat plane is a screenshot, not a shot.
 *
 * The capture is read from the current language's directory, so the English cut
 * shows the English app. Before the directory existed, a second `bun run shots`
 * pass overwrote the first one's files and the French films came back with
 * English screens in them, silently.
 *
 * Files come from `bun run shots` — see scripts/capture-shots.ts.
 */

export type Device = "desktop" | "phone";

/** Capture viewports from scripts/capture-shots.ts — the frames must match. */
const SHOT_SIZE = {
  desktop: { w: 1440, h: 900 },
  mobile: { w: 390, h: 844 },
} as const;

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ width: 11, height: 11, borderRadius: 999, background: color }} />
);

const BrowserChrome: React.FC<{ path: string; scale: number }> = ({ path, scale }) => (
  <div
    style={{
      height: 46 * scale,
      flex: "0 0 auto",
      display: "flex",
      alignItems: "center",
      gap: 9 * scale,
      padding: `0 ${18 * scale}px`,
      background: "#f1f5f9",
      borderBottom: `1px solid ${COLORS.border}`,
    }}
  >
    <Dot color="#e2e8f0" />
    <Dot color="#e2e8f0" />
    <Dot color="#e2e8f0" />
    <div
      style={{
        marginLeft: 14 * scale,
        padding: `${5 * scale}px ${16 * scale}px`,
        borderRadius: 999,
        background: "#ffffff",
        border: `1px solid ${COLORS.border}`,
        fontSize: 17 * scale,
        fontWeight: 500,
        color: COLORS.muted,
        letterSpacing: "-0.01em",
      }}
    >
      {URL_LABEL}
      {path}
    </div>
  </div>
);

export const Screenshot: React.FC<{
  shot: string;
  /** Defaults to the device that suits the current format. */
  device?: Device;
  /** Path shown in the browser pill, e.g. "/library". */
  path?: string;
  /** Entrance frame, sequence-local. */
  at?: number;
  /** Frames over which the push-in runs. */
  dur?: number;
  /** Push-in amount, 0.08 = 8 %. */
  zoom?: number;
  /** Vertical drift in pixels across `dur`, negative pans up. */
  drift?: number;
  style?: CSSProperties;
}> = ({ shot, device, path = "", at = 0, dur = 150, zoom = 0.09, drift = -30, style }) => {
  const l = useLayout();
  const lang = useLang();
  const frame = useCurrentFrame();
  const kind: Device = device ?? (l.story ? "phone" : "desktop");

  const land = useSpring(at, { bounce: 0.26, speed: 0.9 });
  const sharpen = useRamp(at, 30, CURVE.glide);
  const push = interpolate(frame, [at, at + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // The device sways against the image push; different periods so the two never
  // sync up into a single flat wobble.
  const swayY = useBreath(8.5, 7);
  const swayX = useBreath(11.5, 5, 1.4);
  const tilt = useBreath(13, 0.35, 0.7);

  const src = staticFile(
    `shots/${lang}/${shot}-${kind === "phone" ? "mobile" : "desktop"}.png`,
  );
  const chromeScale = l.story ? 1.35 : 1;

  const image = (
    <Img
      src={src}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "top center",
        transform: `scale(${1 + zoom * push}) translateY(${drift * push}px)`,
        transformOrigin: "top center",
      }}
    />
  );

  const shell: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    background: COLORS.panel,
    boxShadow:
      "0 60px 110px -34px rgba(15,23,42,0.34), 0 10px 26px -10px rgba(15,23,42,0.12)",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
        opacity: Math.min(1, land * 1.8),
        filter: sharpen < 1 ? `blur(${(1 - sharpen) * 14}px)` : undefined,
        transform: [
          `translateY(${(1 - land) * 80 + swayY}px)`,
          `translateX(${swayX}px)`,
          `scale(${0.9 + land * 0.1})`,
          `rotate(${tilt}deg)`,
        ].join(" "),
        ...style,
      }}
    >
      {kind === "phone" ? (
        // Height-driven: the handset takes the height it is offered and derives
        // its width, so the frame keeps a phone's proportions instead of
        // stretching into a tablet and cropping half the capture away.
        <div
          style={{
            ...shell,
            height: "100%",
            width: "auto",
            aspectRatio: `${SHOT_SIZE.mobile.w} / ${SHOT_SIZE.mobile.h}`,
            maxWidth: "100%",
            borderRadius: 54,
            border: `13px solid ${COLORS.fg}`,
          }}
        >
          {image}
        </div>
      ) : (
        // Nested enclosure: a hairline tray holding the window, with concentric
        // radii. A window sitting flat on the ground looks pasted on.
        <div
          style={{
            width: "100%",
            maxHeight: "100%",
            padding: 12,
            borderRadius: 30,
            background: "rgba(255,255,255,0.55)",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 60px 110px -40px rgba(15,23,42,0.28)",
          }}
        >
          <div
            style={{
              ...shell,
              display: "flex",
              flexDirection: "column",
              borderRadius: 18,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <BrowserChrome path={path} scale={chromeScale} />
            <div
              style={{
                aspectRatio: `${SHOT_SIZE.desktop.w} / ${SHOT_SIZE.desktop.h}`,
                overflow: "hidden",
              }}
            >
              {image}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

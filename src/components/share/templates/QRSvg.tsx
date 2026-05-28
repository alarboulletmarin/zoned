/**
 * QRSvg — render a QR code as inline SVG.
 *
 * Synchronous and pure: html-to-image captures it as plain SVG with no
 * font/image dependency. We use `qrcode`'s `create()` (sync API, returns a
 * matrix) and emit a grid of <rect> elements ourselves so the resulting
 * SVG has no external dependencies.
 */

import { useMemo } from "react";
import QRCode from "qrcode";

interface QRSvgProps {
  value: string;
  /** Total side length in CSS pixels (defaults to 200). */
  size?: number;
  /** Foreground colour for "on" modules. */
  fg?: string;
  /** Background colour, transparent by default so it sits on any card. */
  bg?: string;
  /** Module margin in QR units (white border). */
  margin?: number;
}

export function QRSvg({
  value,
  size = 200,
  fg = "#0f172a",
  bg = "transparent",
  margin = 2,
}: QRSvgProps) {
  const cells = useMemo(() => {
    try {
      // M-level correction balances density and resilience.
      const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
      const n = qr.modules.size;
      const rows: number[][] = [];
      for (let r = 0; r < n; r++) {
        const row: number[] = [];
        for (let c = 0; c < n; c++) {
          row.push(qr.modules.get(r, c) ? 1 : 0);
        }
        rows.push(row);
      }
      return { rows, n };
    } catch {
      return { rows: [], n: 0 };
    }
  }, [value]);

  if (!cells.n) return null;

  const total = cells.n + margin * 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ display: "block" }}
    >
      {bg !== "transparent" && (
        <rect width={total} height={total} fill={bg} />
      )}
      {cells.rows.map((row, r) =>
        row.map((v, c) =>
          v ? (
            <rect
              key={`${r}-${c}`}
              x={c + margin}
              y={r + margin}
              width={1}
              height={1}
              fill={fg}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

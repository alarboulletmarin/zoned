/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
// `virtual:pwa-register/react`, used by <UpdatePrompt>. Referenced here rather
// than listed in tsconfig `types`: that route pulls in workbox's own types,
// which are written for a service worker and would demand the WebWorker lib
// (self, ExtendableEvent…) across browser code.
/// <reference types="vite-plugin-pwa/react" />

declare module "*.svg?react" {
  import { FunctionComponent, SVGProps } from "react";
  const content: FunctionComponent<SVGProps<SVGElement>>;
  export default content;
}

/** Détecteur de codes-barres natif (Chrome, Android) : absent des types DOM. */
interface BarcodeDetector {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}
declare const BarcodeDetector:
  | { new (options?: { formats?: string[] }): BarcodeDetector }
  | undefined;

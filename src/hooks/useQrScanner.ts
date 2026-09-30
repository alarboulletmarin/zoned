import { useEffect, useRef, useState, type RefObject } from "react";

export type ScannerStatus = "starting" | "scanning" | "denied" | "unavailable";

/** Un décodeur : rend le texte du code QR visible dans la vidéo, ou null. */
type Reader = (video: HTMLVideoElement) => Promise<string | null>;

/** Intervalle entre deux lectures : assez pour ne pas rater une trame à 4 par seconde. */
const INTERVAL = 70;
/** Côté maximal de l'image analysée : au-delà, jsQR devient trop lent sans lire mieux. */
const MAX_SIDE = 960;

/**
 * Ouvre la caméra arrière dans `video` et rend chaque code QR lu à `onCode`,
 * tant que `active`. La caméra est coupée dès que le composant se démonte.
 * Détecteur natif quand le navigateur en a un, jsQR (chargé à la demande) sinon.
 */
export function useQrScanner(
  video: RefObject<HTMLVideoElement | null>,
  active: boolean,
  onCode: (text: string) => void,
): ScannerStatus {
  const [status, setStatus] = useState<ScannerStatus>("starting");
  // Toujours la dernière version, sans relancer la caméra à chaque rendu
  const latest = useRef(onCode);
  useEffect(() => {
    latest.current = onCode;
  });

  useEffect(() => {
    const element = video.current;
    if (!active || !element) return;
    return startScanner(element, setStatus, (text) => latest.current(text));
  }, [video, active]);

  return status;
}

/** Lance la caméra et la lecture ; rend la fonction qui coupe tout. */
function startScanner(
  element: HTMLVideoElement,
  onStatus: (status: ScannerStatus) => void,
  onCode: (text: string) => void,
): () => void {
  let stopped = false;
  let stream: MediaStream | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function run() {
    if (!navigator.mediaDevices?.getUserMedia) return onStatus("unavailable");
    onStatus("starting");
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        audio: false,
      });
    } catch (error) {
      // Fenêtre fermée pendant la demande d'accès : plus personne pour lire le statut
      if (stopped) return;
      const denied =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError");
      return onStatus(denied ? "denied" : "unavailable");
    }
    if (stopped) return stream.getTracks().forEach((track) => track.stop());
    element.srcObject = stream;
    try {
      await element.play();
    } catch {
      // Lecture interrompue (fenêtre fermée entre-temps) : rien à faire
    }
    if (stopped) return;
    let read: Reader;
    try {
      read = await makeReader();
    } catch {
      // Le décodeur de secours n'a pas pu se charger (hors ligne, bloqué) : pas de lecture possible
      if (!stopped) onStatus("unavailable");
      return;
    }
    if (stopped) return;
    onStatus("scanning");

    const tick = async () => {
      if (stopped) return;
      if (element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && element.videoWidth > 0) {
        try {
          const text = await read(element);
          if (text && !stopped) onCode(text);
        } catch {
          // Image illisible : la suivante fera l'affaire
        }
      }
      if (!stopped) timer = setTimeout(tick, INTERVAL);
    };
    void tick();
  }
  void run();

  return () => {
    stopped = true;
    clearTimeout(timer);
    stream?.getTracks().forEach((track) => track.stop());
    element.srcObject = null;
  };
}

async function makeReader(): Promise<Reader> {
  if (typeof BarcodeDetector !== "undefined") {
    try {
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      return async (video) => (await detector.detect(video))[0]?.rawValue ?? null;
    } catch {
      // Format non pris en charge par ce détecteur : jsQR
    }
  }
  const { default: jsQR } = await import("jsqr");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  return async (video) => {
    if (!context) return null;
    const scale = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(data, width, height, { inversionAttempts: "dontInvert" })?.data ?? null;
  };
}

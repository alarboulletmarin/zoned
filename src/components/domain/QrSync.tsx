import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Download, Upload } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQrScanner } from "@/hooks/useQrScanner";
import { useWakeLock } from "@/hooks/useWakeLock";
import {
  SYNC_STORAGE_KEYS,
  restoreBackup,
  type BackupData,
  type RestoreMode,
} from "@/lib/backup";
import type { QrImage } from "@/lib/qrImage";
import { Receiver, buildSyncData, encodeFrames, qrSyncSupported } from "@/lib/qrSync";

/** Quatre images par seconde : lisible par une caméra, sous le seuil des scintillements gênants. */
const FRAME_MS = 250;

const gap = (value: string) => ({ "--gap": value }) as CSSProperties;

/** Envoyer ou recevoir ses données par code QR animé, sans réseau. */
export function QrSync() {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState<"send" | "receive" | null>(null);
  const supported = qrSyncSupported();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.qrSync.title")}</CardTitle>
          <CardDescription>{t("settings.qrSync.description")}</CardDescription>
        </CardHeader>
        <CardContent className="zn-stack" style={gap("var(--sp-8)")}>
          {supported ? (
            <div className="zn-cluster" style={gap("var(--sp-6)")}>
              <Button variant="outline" onClick={() => setOpen("send")}>
                <Upload />
                {t("settings.qrSync.sendButton")}
              </Button>
              <Button variant="outline" onClick={() => setOpen("receive")}>
                <Download />
                {t("settings.qrSync.receiveButton")}
              </Button>
            </div>
          ) : (
            <Alert kind="info">{t("settings.qrSync.unsupported")}</Alert>
          )}
        </CardContent>
      </Card>

      <Dialog open={open === "send"} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent>
          <SendBody onClose={() => setOpen(null)} />
        </DialogContent>
      </Dialog>
      <Dialog open={open === "receive"} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent>
          <ReceiveBody onClose={() => setOpen(null)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Appareil émetteur : montre les données en code QR animé, que l'autre appareil filme. */
function SendBody({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation("common");
  const [images, setImages] = useState<QrImage[] | "failed" | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useWakeLock(true);

  useEffect(() => {
    let active = true;
    const data = buildSyncData((key) => localStorage.getItem(key));
    // Le générateur de QR n'est chargé qu'à l'ouverture de cette fenêtre
    Promise.all([encodeFrames(data), import("@/lib/qrImage")]).then(
      ([frames, { qrImages }]) => {
        if (active) setImages(qrImages(frames));
      },
      () => {
        if (active) setImages("failed");
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const count = Array.isArray(images) ? images.length : 0;
  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), FRAME_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  const image = Array.isArray(images) ? images[index % count] : undefined;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("settings.qrSync.sendTitle")}</DialogTitle>
        <DialogDescription>{t("settings.qrSync.sendHint")}</DialogDescription>
      </DialogHeader>
      {image ? (
        <div className="zn-stack" style={gap("var(--sp-6)")}>
          <div
            className="zn-qrsync__code"
            role="img"
            aria-label={t("settings.qrSync.qrLabel", { current: index + 1, total: count })}
          >
            <svg viewBox={`0 0 ${image.size} ${image.size}`} shapeRendering="crispEdges">
              <path d={image.path} />
            </svg>
          </div>
          <div className="zn-qrsync__meter">
            <span className="zn-qrsync__count" aria-hidden="true">
              {index + 1} / {count}
            </span>
            {count > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                aria-pressed={paused}
                onClick={() => setPaused((p) => !p)}
              >
                {paused ? t("settings.qrSync.resume") : t("settings.qrSync.pause")}
              </Button>
            ) : null}
          </div>
        </div>
      ) : images === "failed" ? (
        <Alert kind="error">{t("settings.qrSync.sendFailed")}</Alert>
      ) : (
        <p role="status">{t("settings.qrSync.preparing")}</p>
      )}
      <p className="zn-qrsync__note">{t("settings.qrSync.localNote")}</p>
      <DialogFooter>
        <Button onClick={onClose}>{t("settings.qrSync.done")}</Button>
      </DialogFooter>
    </>
  );
}

interface Progress {
  got: number;
  count: number;
  have: readonly boolean[];
}

/** Appareil récepteur : filme le code de l'autre appareil, puis applique les données reçues. */
function ReceiveBody({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation("common");
  const video = useRef<HTMLVideoElement>(null);
  const [receiver, setReceiver] = useState(() => new Receiver());
  const [progress, setProgress] = useState<Progress | null>(null);
  const [failure, setFailure] = useState<"invalid" | "newer" | null>(null);
  const [received, setReceived] = useState<BackupData | null>(null);
  const [mode, setMode] = useState<RestoreMode>("replace");
  const [applying, setApplying] = useState(false);
  useWakeLock(received === null);

  // La caméra s'éteint dès qu'il y a un résultat, bon ou mauvais
  const status = useQrScanner(video, failure === null && received === null, async (text) => {
    const result = await receiver.accept(text);
    if (result.kind === "progress") setProgress(result);
    else if (result.kind === "done") setReceived(result.backup);
    else if (result.kind === "failed") setFailure(result.reason);
  });

  function retry() {
    setReceiver(new Receiver());
    setProgress(null);
    setFailure(null);
  }

  function apply() {
    if (!received || applying) return;
    setApplying(true);
    try {
      restoreBackup(localStorage, received.localStorage, mode, SYNC_STORAGE_KEYS);
    } catch (err) {
      console.error("QR sync restore failed, rolled back", err);
      toast.failure(t("settings.qrSync.applyError"), err);
      setApplying(false);
      onClose();
      return;
    }
    toast.success(t("settings.qrSync.applied"));
    setTimeout(() => window.location.reload(), 1000);
  }

  if (received) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t("settings.qrSync.confirmTitle")}</DialogTitle>
          <DialogDescription>{t("settings.qrSync.confirmDescription")}</DialogDescription>
        </DialogHeader>
        <div className="zn-stack" style={gap("var(--sp-6)")}>
          <p className="zn-label">{t("settings.data.restoreModeLabel")}</p>
          <div className="zn-grid" style={{ "--cols": 2, "--gap": "var(--sp-5)" } as CSSProperties}>
            {(["replace", "merge"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className="zn-choice"
              >
                <span className="zn-choice__title">{t(`settings.data.${value}ModeTitle`)}</span>
                <span className="zn-choice__text">
                  {t(`settings.data.${value}ModeDescription`)}
                </span>
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={applying}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={apply} disabled={applying}>
            {t("settings.qrSync.apply")}
          </Button>
        </DialogFooter>
      </>
    );
  }

  const problem =
    failure === "newer"
      ? t("settings.qrSync.newer")
      : failure === "invalid"
        ? t("settings.qrSync.invalid")
        : status === "denied"
          ? t("settings.qrSync.denied")
          : status === "unavailable"
            ? t("settings.qrSync.unavailable")
            : null;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("settings.qrSync.receiveTitle")}</DialogTitle>
        <DialogDescription>{t("settings.qrSync.receiveHint")}</DialogDescription>
      </DialogHeader>
      {problem ? (
        <>
          <Alert kind="error">{problem}</Alert>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t("settings.qrSync.close")}
            </Button>
            {failure ? <Button onClick={retry}>{t("settings.qrSync.retry")}</Button> : null}
          </DialogFooter>
        </>
      ) : (
        <>
          <video
            ref={video}
            className="zn-qrsync__scanner"
            aria-label={t("settings.qrSync.camera")}
            playsInline
            muted
            autoPlay
          />
          {progress ? (
            <div
              className="zn-qrsync__progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={progress.count}
              aria-valuenow={progress.got}
              aria-valuetext={t("settings.qrSync.progress", {
                got: progress.got,
                count: progress.count,
              })}
            >
              <span className="zn-qrsync__count">
                {t("settings.qrSync.progress", { got: progress.got, count: progress.count })}
              </span>
              <span className="zn-qrsync__cells" aria-hidden="true">
                {progress.have.map((have, i) => (
                  <span key={i} className="zn-qrsync__cell" data-on={have} />
                ))}
              </span>
            </div>
          ) : (
            <p role="status">
              {status === "scanning" ? t("settings.qrSync.aim") : t("settings.qrSync.starting")}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t("settings.qrSync.close")}
            </Button>
          </DialogFooter>
        </>
      )}
    </>
  );
}

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  durationDigits,
  durationToMinutes,
  formatDurationDigits,
  minutesToDurationDigits,
  normalizeDurationDigits,
} from "@/lib/durationFields";
import {
  formatPaceDigits,
  formatTimeDigits,
  normalizePaceDigits,
  normalizeTimeDigits,
  paceDigits,
  paceDigitsToSeconds,
  secondsToPaceDigits,
  secondsToTimeDigits,
  timeDigits,
  timeDigitsToSeconds,
} from "@/lib/paceFields";

/**
 * LE champ de temps de l'application. Une durée, une allure, un chrono : un
 * seul champ, au masque du chronomètre, les chiffres entrent par la DROITE.
 * On tape 125 et on lit 1:25, on tape 33000 et on lit 3:30:00.
 *
 * Trois formes, une par question :
 * - `hm`, une durée d'activité, `h:mm` (`lib/durationFields.ts`) ;
 * - `ms`, une allure ou un temps court, `m:ss` (`lib/paceFields.ts`) ;
 * - `hms`, un chrono d'arrivée, `m:ss` puis `h:mm:ss` passé quatre chiffres.
 *   Quatre chiffres sont ambigus (52:30 en minutes ou en heures), la distance
 *   tranche, d'où `distanceKm`.
 *
 * Le composant ne tient pas d'état : l'appelant garde les CHIFFRES (masque
 * retiré) et les relit avec la fonction de la lib qui va avec sa forme. Ce
 * qu'il porte, c'est ce que chaque écran recopiait jusqu'ici :
 * - `type="text"` + `inputMode="numeric"` + `pattern`, le pavé de chiffres
 *   seuls sur iOS comme sur Android, sans point ni moins ;
 * - le curseur ramené à la fin après chaque frappe, pour que l'effacement
 *   retire toujours le dernier chiffre ;
 * - le rangement à la SORTIE du champ (0:90 devient 1:30), jamais pendant la
 *   frappe, où le 9 de 90 serait devenu 0:09.
 *
 * Coller `1:45:00`, `3h30` ou `45'` marche aussi : seuls les chiffres sont
 * gardés, et ils entrent dans le masque dans l'ordre.
 */
export type ChronoFormat = "hm" | "ms" | "hms";

const FORMATS: Record<
  ChronoFormat,
  {
    digits: (raw: string) => string;
    format: (digits: string) => string;
    placeholder: string;
  }
> = {
  hm: { digits: durationDigits, format: formatDurationDigits, placeholder: "0:00" },
  ms: { digits: paceDigits, format: formatPaceDigits, placeholder: "0:00" },
  hms: { digits: timeDigits, format: formatTimeDigits, placeholder: "0:00:00" },
};

function normalize(format: ChronoFormat, digits: string, distanceKm: number): string {
  if (format === "hm") return normalizeDurationDigits(digits);
  if (format === "ms") return normalizePaceDigits(digits);
  return normalizeTimeDigits(digits, distanceKm);
}

type NativeProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "inputMode" | "pattern" | "value" | "onChange" | "defaultValue"
>;

export interface ChronoInputProps extends NativeProps {
  format: ChronoFormat;
  /** Les chiffres saisis, masque retiré. */
  digits: string;
  onDigitsChange: (digits: string) => void;
  /** Pour `hms` seulement : la distance qui départage minutes et heures. */
  distanceKm?: number;
  /** Laisse le champ tel quel en le quittant (rare, l'état est dérivé ailleurs). */
  keepOnBlur?: boolean;
}

export const ChronoInput = forwardRef<HTMLInputElement, ChronoInputProps>(
  function ChronoInput(
    {
      format,
      digits,
      onDigitsChange,
      distanceKm = 0,
      keepOnBlur = false,
      onBlur,
      placeholder,
      autoComplete = "off",
      ...rest
    },
    forwardedRef,
  ) {
    const ref = useRef<HTMLInputElement>(null);
    useImperativeHandle(forwardedRef, () => ref.current as HTMLInputElement);
    const spec = FORMATS[format];

    // Le curseur revient à la fin après chaque frappe, tant que le champ est
    // tenu : les chiffres entrent par la droite, l'effacement doit toujours
    // retirer le dernier, où que le doigt ait posé le curseur.
    useEffect(() => {
      const field = ref.current;
      if (!field || document.activeElement !== field) return;
      const end = field.value.length;
      field.setSelectionRange(end, end);
    }, [digits]);

    return (
      <input
        {...rest}
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9:]*"
        autoComplete={autoComplete}
        placeholder={placeholder ?? spec.placeholder}
        value={spec.format(digits)}
        onChange={(e) => onDigitsChange(spec.digits(e.target.value))}
        onBlur={(e) => {
          if (!keepOnBlur) {
            const tidy = normalize(format, digits, distanceKm);
            if (tidy !== digits) onDigitsChange(tidy);
          }
          onBlur?.(e);
        }}
      />
    );
  },
);

/**
 * Des chiffres à la valeur, et retour, pour chaque forme. `hm` compte en
 * MINUTES (une durée d'activité), `ms` et `hms` en SECONDES.
 */
export function readChrono(
  format: ChronoFormat,
  digits: string,
  distanceKm = 0,
): number | undefined {
  if (format === "hm") return durationToMinutes(digits);
  if (format === "ms") return paceDigitsToSeconds(digits);
  return timeDigitsToSeconds(digits, distanceKm);
}

export function chronoDigits(
  format: ChronoFormat,
  value: number | undefined,
  distanceKm = 0,
): string {
  if (value === undefined) return "";
  if (format === "hm") return minutesToDurationDigits(value);
  if (format === "ms") return secondsToPaceDigits(value);
  return secondsToTimeDigits(value, distanceKm);
}

export interface ChronoValueInputProps
  extends Omit<ChronoInputProps, "digits" | "onDigitsChange"> {
  /** Minutes pour `hm`, secondes pour `ms` et `hms`. */
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
}

/**
 * Le même champ, branché sur un NOMBRE plutôt que sur des chiffres, pour les
 * écrans dont l'état est déjà une durée (`durationSec`, `durationMin`).
 *
 * Il garde ses chiffres en brouillon : redériver le champ du nombre à chaque
 * frappe rangerait 0:90 en 1:30 avant que l'on ait fini de taper. Le
 * brouillon ne suit la valeur que lorsqu'elle change AILLEURS, c'est-à-dire
 * quand elle ne correspond plus à ce qu'il contient.
 */
export const ChronoValueInput = forwardRef<HTMLInputElement, ChronoValueInputProps>(
  function ChronoValueInput({ format, value, onValueChange, distanceKm = 0, ...rest }, ref) {
    const [draft, setDraft] = useState(() => chronoDigits(format, value, distanceKm));

    useEffect(() => {
      setDraft((current) =>
        readChrono(format, current, distanceKm) === value
          ? current
          : chronoDigits(format, value, distanceKm),
      );
    }, [format, value, distanceKm]);

    return (
      <ChronoInput
        {...rest}
        ref={ref}
        format={format}
        distanceKm={distanceKm}
        digits={draft}
        onDigitsChange={(digits) => {
          setDraft(digits);
          const next = readChrono(format, digits, distanceKm);
          onValueChange(next !== undefined && next > 0 ? next : undefined);
        }}
      />
    );
  },
);

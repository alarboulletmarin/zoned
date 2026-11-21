import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { loadUserZonePrefs, validateZonePrefs } from "@/lib/zones";

export function PlanVmaForm({ onSave }: { onSave: (vma: number) => void }) {
  const { t } = useTranslation(["plan", "common"]);
  const id = useId();
  const [input, setInput] = useState(() => String(loadUserZonePrefs()?.vma ?? ""));
  const value = input.trim();
  const parsed = /^[0-9]+(?:[.,][0-9]+)?$/.test(value) ? Number(value.replace(",", ".")) : undefined;
  const vma = validateZonePrefs({ vma: parsed }).vma;
  const invalid = value !== "" && vma === undefined;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (vma !== undefined) onSave(vma);
  }

  return (
    <form onSubmit={submit}>
      <Alert
        kind="info"
        title={t("view.estimatedPacesTitle")}
        action={
          <span className="zn-plan-vma">
            <label htmlFor={id}>{t("view.estimatedPacesVma")}</label>
            <span className="zn-numfield">
              <input
                id={id}
                className="zn-numfield__input"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? `${id}-error` : undefined}
              />
              <span className="zn-numfield__unit">km/h</span>
            </span>
            <Button type="submit" variant="outline" size="sm" disabled={vma === undefined}>
              {t("view.estimatedPacesSubmit")}
            </Button>
            {invalid && (
              <span id={`${id}-error`} className="zn-plan-vma__error">
                {t("common:myZones.zoneCalculator.invalidVma")}
              </span>
            )}
          </span>
        }
      >
        {t("view.estimatedPaces")}
      </Alert>
    </form>
  );
}

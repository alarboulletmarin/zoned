import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDecimal, StepField } from "@/components/calc";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useMyNumbers } from "@/hooks/useMyNumbers";
import { formatPace, setMyNumber } from "@/lib/zones";

type Key = "vma" | "fcMax";

const FIELDS: Record<Key, { unit: string; step: number; min: number; max: number; decimals: number; fallback: number }> = {
  vma: { unit: "km/h", step: 0.1, min: 8, max: 30, decimals: 1, fallback: 15 },
  fcMax: { unit: "bpm", step: 1, min: 100, max: 250, decimals: 0, fallback: 180 },
};

/**
 * Tes repères, le seul endroit où la VMA et la FC max se posent, se changent
 * et se suppriment. Les tuiles du hub des calculateurs : une tuile se touche
 * et devient son champ, sur place. Le seuil se lit, il vient de la VMA.
 */
export function MyNumbersTiles({
  revision,
  onChange,
}: {
  /** Changes when the profile was written elsewhere on the page (a test adopted as VMA). */
  revision?: string;
  onChange?: () => void;
}) {
  const { t, i18n } = useTranslation(["profile", "calculators"]);
  const { numbers, refresh } = useMyNumbers();
  const [editing, setEditing] = useState<Key | null>(null);
  useEffect(refresh, [revision, refresh]);
  // Leaving a field gives the focus back to its tile, not to the page.
  const lastEdited = useRef<Key | null>(null);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (editing) lastEdited.current = editing;
    else if (lastEdited.current) {
      section.current?.querySelector<HTMLElement>(`[data-number="${lastEdited.current}"]`)?.focus();
      lastEdited.current = null;
    }
  }, [editing]);
  const setIt = t("calculators:hub.setIt");

  const write = (key: Key, value: number | undefined) => {
    const saved = setMyNumber(key, value);
    if (!saved.ok) {
      toast.failure(t("base.saveFailed"), saved);
      return;
    }
    refresh();
    onChange?.();
    setEditing(null);
  };

  const tile = (key: Key, label: string, value: string | undefined, foot: string) =>
    editing === key ? (
      <EditTile
        key={key}
        label={label}
        current={numbers[key]}
        field={FIELDS[key]}
        onSave={(v) => write(key, v)}
        onDelete={() => write(key, undefined)}
        onCancel={() => setEditing(null)}
      />
    ) : (
      <button
        key={key}
        type="button"
        data-number={key}
        className="zn-calc-tile"
        data-empty={value === undefined || undefined}
        aria-label={t(value === undefined ? "numbers.setLabel" : "numbers.changeLabel", { label })}
        onClick={() => setEditing(key)}
      >
        <span className="zn-calc-tile__label">{label}</span>
        <span className="zn-calc-tile__value">
          {value ?? "-"}
          {value !== undefined && <small> {FIELDS[key].unit}</small>}
        </span>
        <span className="zn-calc-tile__foot">{value === undefined ? setIt : foot}</span>
      </button>
    );

  return (
    <section ref={section} className="zn-calc-section" aria-labelledby="my-numbers">
      <h2 id="my-numbers" className="zn-calc-h2">
        {t("calculators:hub.mine")}
      </h2>
      <div className="zn-calc-tiles zn-mynum__tiles" data-cols="3">
        {tile(
          "vma",
          t("calculators:hub.tiles.vma"),
          numbers.vma === undefined ? undefined : formatDecimal(numbers.vma, 1, i18n.language),
          numbers.vma ? t("calculators:hub.tiles.vmaFoot", { pace: formatPace(60 / numbers.vma) }) : "",
        )}
        {tile(
          "fcMax",
          t("calculators:hub.tiles.fcMax"),
          numbers.fcMax === undefined ? undefined : String(numbers.fcMax),
          t("calculators:hub.tiles.fcMaxFoot"),
        )}
        <Link to="/calculators/zones" className="zn-calc-tile" data-empty={!numbers.threshold || undefined}>
          <span className="zn-calc-tile__label">{t("calculators:hub.tiles.threshold")}</span>
          <span className="zn-calc-tile__value">
            {numbers.threshold ? `${formatPace(numbers.threshold.fast)}-${formatPace(numbers.threshold.slow)}` : "-"}
          </span>
          <span className="zn-calc-tile__foot">
            {numbers.threshold ? t("calculators:hub.tiles.thresholdFoot") : t("numbers.thresholdFromVma")}
          </span>
        </Link>
      </div>
    </section>
  );
}

function EditTile({
  label,
  current,
  field,
  onSave,
  onDelete,
  onCancel,
}: {
  label: string;
  current: number | undefined;
  field: (typeof FIELDS)[Key];
  onSave: (value: number) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation("profile");
  const [draft, setDraft] = useState(current);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.querySelector("input")?.focus(), []);

  return (
    <div
      ref={ref}
      className="zn-calc-tile zn-mynum__edit"
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
        if (e.key !== "Enter" || e.target instanceof HTMLButtonElement) return;
        // Without it, Enter goes on to press the tile the focus has just returned to.
        e.preventDefault();
        // An out-of-range number in the field: the draft is still the last valid one.
        if ((e.target as HTMLElement).getAttribute("aria-invalid")) return;
        if (draft !== undefined && draft !== current) onSave(draft);
      }}
    >
      <StepField
        label={label}
        unit={field.unit}
        value={draft}
        onChange={setDraft}
        step={field.step}
        min={field.min}
        max={field.max}
        decimals={field.decimals}
        fallback={current ?? field.fallback}
      />
      <div className="zn-mynum__actions">
        {draft !== undefined && draft !== current && (
          <Button size="sm" onClick={() => onSave(draft)}>
            {t("numbers.save")}
          </Button>
        )}
        {current !== undefined && (
          <Button size="sm" variant="outline" onClick={onDelete}>
            {t("numbers.delete")}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onCancel}>
          {t("numbers.cancel")}
        </Button>
      </div>
    </div>
  );
}

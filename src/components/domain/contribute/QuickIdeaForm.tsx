import { useId, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, ExternalLink, Copy } from "@/components/icons";
import { submitQuickIdea, copyToClipboard } from "@/lib/issueBuilder";
import type { WorkoutCategory, Difficulty } from "@/types";
import { CATEGORY_META, DIFFICULTY_META } from "@/types";
import { usePickLang } from "@/lib/i18n-utils";

const CATEGORIES = Object.keys(CATEGORY_META) as WorkoutCategory[];
const DIFFICULTIES = Object.keys(DIFFICULTY_META) as Difficulty[];

export function QuickIdeaForm() {
  const { t } = useTranslation("contribute");
  const pickLang = usePickLang();
  const uid = useId();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<WorkoutCategory>("endurance");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  // A field only states its reason once the writer has left it: an empty form
  // is not a wrong form.
  const [touched, setTouched] = useState<{ name?: boolean; description?: boolean }>({});

  const isValid = name.trim().length > 0 && description.trim().length > 0;
  const nameInvalid = touched.name === true && name.trim().length === 0;
  const descriptionInvalid = touched.description === true && description.trim().length === 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    const { url, markdown } = submitQuickIdea({
      name: name.trim(),
      description: description.trim(),
      category,
      difficulty,
    });

    if (url) {
      window.open(url, "_blank");
      toast.success(t("submit.success"));
    } else {
      const copied = await copyToClipboard(markdown);
      if (copied) {
        toast.success(t("submit.urlTooLong"));
      }
    }
  };

  const handleCopy = async () => {
    if (!isValid) return;

    const { markdown } = submitQuickIdea({
      name: name.trim(),
      description: description.trim(),
      category,
      difficulty,
    });

    const copied = await copyToClipboard(markdown);
    if (copied) {
      toast.success(t("submit.copied"));
    }
  };

  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-11)" } as CSSProperties}>
      <p className="zn-body zn-body--sm zn-muted zn-contrib__lead">
        {t("quickIdea.subtitle")}
      </p>

      {/* Name */}
      <div className="zn-contrib-field">
        <label className="zn-contrib-field__label" htmlFor={`${uid}-name`}>
          {t("quickIdea.nameLabel")}
          <span className="zn-contrib-field__req" aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-name`}
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          placeholder={t("quickIdea.namePlaceholder")}
          aria-invalid={nameInvalid || undefined}
          aria-describedby={nameInvalid ? `${uid}-name-error` : undefined}
          className="zn-contrib-input"
        />
        {nameInvalid && (
          <p id={`${uid}-name-error`} role="alert" className="zn-contrib-field__error">
            <AlertTriangle size={14} />
            {t("submit.required")}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="zn-contrib-field">
        <label className="zn-contrib-field__label" htmlFor={`${uid}-description`}>
          {t("quickIdea.descriptionLabel")}
          <span className="zn-contrib-field__req" aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${uid}-description`}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
          placeholder={t("quickIdea.descriptionPlaceholder")}
          rows={4}
          aria-invalid={descriptionInvalid || undefined}
          aria-describedby={descriptionInvalid ? `${uid}-description-error` : undefined}
          className="zn-contrib-input"
        />
        {descriptionInvalid && (
          <p id={`${uid}-description-error`} role="alert" className="zn-contrib-field__error">
            <AlertTriangle size={14} />
            {t("submit.required")}
          </p>
        )}
      </div>

      {/* Category + Difficulty row */}
      <div
        className="zn-grid"
        style={{ "--cols": 2, "--gap": "var(--sp-8)" } as CSSProperties}
      >
        {/* Category */}
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-category`}>
            {t("quickIdea.categoryLabel")}
          </label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as WorkoutCategory)}
          >
            <SelectTrigger id={`${uid}-category`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat];
                return (
                  <SelectItem key={cat} value={cat}>
                    {pickLang(meta, "label")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty */}
        <div className="zn-contrib-field">
          <label className="zn-contrib-field__label" htmlFor={`${uid}-difficulty`}>
            {t("quickIdea.difficultyLabel")}
          </label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as Difficulty)}
          >
            <SelectTrigger id={`${uid}-difficulty`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((diff) => {
                const meta = DIFFICULTY_META[diff];
                return (
                  <SelectItem key={diff} value={diff}>
                    {pickLang(meta, "label")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit buttons */}
      <div
        className="zn-row zn-contrib__actions"
        style={{ "--gap": "var(--sp-6)" } as CSSProperties}
      >
        <Button type="button" onClick={handleSubmit} disabled={!isValid}>
          <ExternalLink />
          {t("submit.generateIssue")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          disabled={!isValid}
        >
          <Copy />
          {t("submit.copyDescription")}
        </Button>
      </div>
    </div>
  );
}

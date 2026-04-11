import { useState } from "react";
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
import { ExternalLink, Copy } from "@/components/icons";
import { submitQuickIdea, copyToClipboard } from "@/lib/issueBuilder";
import type { WorkoutCategory, Difficulty } from "@/types";
import { CATEGORY_META, DIFFICULTY_META } from "@/types";
import { usePickLang } from "@/lib/i18n-utils";

const CATEGORIES = Object.keys(CATEGORY_META) as WorkoutCategory[];
const DIFFICULTIES = Object.keys(DIFFICULTY_META) as Difficulty[];

export function QuickIdeaForm() {
  const { t } = useTranslation("contribute");
  const pickLang = usePickLang();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<WorkoutCategory>("endurance");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");

  const isValid = name.trim().length > 0 && description.trim().length > 0;

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
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t("quickIdea.subtitle")}
        </p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("quickIdea.nameLabel")} <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("quickIdea.namePlaceholder")}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 placeholder:italic focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("quickIdea.descriptionLabel")} <span className="text-destructive">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("quickIdea.descriptionPlaceholder")}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 placeholder:italic focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      {/* Category + Difficulty row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("quickIdea.categoryLabel")}
          </label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as WorkoutCategory)}
          >
            <SelectTrigger className="w-full">
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
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("quickIdea.difficultyLabel")}
          </label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as Difficulty)}
          >
            <SelectTrigger className="w-full">
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
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className="flex-1"
        >
          <ExternalLink className="size-4" />
          {t("submit.generateIssue")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          disabled={!isValid}
        >
          <Copy className="size-4" />
          {t("submit.copyDescription")}
        </Button>
      </div>
    </div>
  );
}

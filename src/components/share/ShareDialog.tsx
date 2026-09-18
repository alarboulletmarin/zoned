/**
 * ShareDialog, the workout's share sheet: the 40 workout templates in the
 * generic `ShareSheet`, with the workout's public link under "Copier le
 * lien". The sheet itself, carousel, actions and capture, lives in
 * ShareSheet.tsx.
 */

import { useTranslation } from "react-i18next";
import type { WorkoutTemplate } from "@/types";
import { ShareSheet } from "./ShareSheet";
import { SHARE_TEMPLATES } from "./shareTemplates";
import { workoutShareUrl } from "./templates/_shared";

interface ShareDialogProps {
  workout: WorkoutTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ workout, open, onOpenChange }: ShareDialogProps) {
  const { t } = useTranslation("common");
  return (
    <ShareSheet
      open={open}
      onOpenChange={onOpenChange}
      templates={SHARE_TEMPLATES}
      subject={{ workout }}
      subjectId={workout.id}
      shareUrl={workoutShareUrl(workout)}
      title={t("share.title")}
      subtitle={t("share.subtitle")}
    />
  );
}

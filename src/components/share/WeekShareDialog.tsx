/**
 * WeekShareDialog, the week's share sheet: the four week images in the
 * generic `ShareSheet`, with the week's link under "Copier le lien".
 */

import { useTranslation } from "react-i18next";
import { ShareSheet } from "./ShareSheet";
import { WEEK_SHARE_TEMPLATES, type WeekShareSubject } from "./weekTemplates";

interface WeekShareDialogProps {
  subject: WeekShareSubject;
  shareUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WeekShareDialog({ subject, shareUrl, open, onOpenChange }: WeekShareDialogProps) {
  const { t } = useTranslation("common");
  return (
    <ShareSheet
      open={open}
      onOpenChange={onOpenChange}
      templates={WEEK_SHARE_TEMPLATES}
      subject={subject}
      subjectId={subject.plan.id}
      shareUrl={shareUrl}
      title={t("share.weekTitle")}
      subtitle={t("share.subtitle")}
    />
  );
}

import i18n from "@/i18n";
import { activityKindOf } from "@/lib/activitySession";

/**
 * The name an export prints for a session.
 *
 * The names a page hands over win, then an activity is named from its kind
 * (Vélotaf, Repos actif), and only then does the raw id show. Without the
 * middle step every caller that did not preload names, the plans list among
 * them, printed `__activity_commute__` in the calendar: no catalogue lookup
 * knows a bike commute.
 */
export function exportSessionName(workoutId: string, names: Record<string, string>): string {
  const given = names[workoutId];
  if (given) return given;
  const activity = activityKindOf(workoutId);
  if (activity) return i18n.t(`plan:activity.${activity.kind}`);
  return workoutId;
}

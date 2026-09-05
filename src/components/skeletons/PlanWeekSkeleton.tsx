import { type CSSProperties } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for a single training week as rendered by PlanWeeklyView.
 * Mirrors the horizontal day strip + summary footer so a long plan
 * (16+ weeks) shows useful structure during data load instead of one
 * giant pulsing rectangle.
 *
 * The strip follows the real board (`.zn-planweek__board`,
 * `src/styles/components/plan-calendar.css`): four days then three on a
 * phone, the whole week on one line from 768px, and a day that reserves 80px
 * there and 120px here. Seven equal columns at 390px — what this used to
 * draw — is 45px per day, a shape the plan view never takes.
 */
export function PlanWeekSkeleton() {
  return (
    <div
      className="zn-stack zn-planweek-skel"
      style={{ "--gap": "var(--sp-6)" } as CSSProperties}
      aria-hidden
    >
      <div className="zn-row zn-row--split">
        <Skeleton className="zn-planweek-skel__label" />
        <Skeleton className="zn-planweek-skel__label zn-planweek-skel__label--short" />
      </div>
      <div className="zn-planweek-skel__board">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="zn-planweek-skel__day" />
        ))}
      </div>
      <div className="zn-row">
        <Skeleton className="zn-planweek-skel__fact zn-planweek-skel__fact--long" />
        <Skeleton className="zn-planweek-skel__fact zn-planweek-skel__fact--mid" />
        <Skeleton className="zn-planweek-skel__fact zn-planweek-skel__fact--short" />
      </div>
    </div>
  );
}

/** Stack N week skeletons (e.g. 4 for a tapered marathon plan view). */
export function PlanWeekSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="zn-stack" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
      {Array.from({ length: count }, (_, i) => (
        <PlanWeekSkeleton key={i} />
      ))}
    </div>
  );
}

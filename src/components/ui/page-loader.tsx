import { useIsEnglish } from "@/lib/i18n-utils";

/**
 * PageLoader — a whole-route wait: a lazily loaded page, a plan being built.
 *
 * Holds a reserved height so the layout does not jump when the content lands,
 * and names the wait in words rather than spinning silently. The words are held
 * back a second by CSS: under that, the wait is over before it can be read.
 *
 * The label is inline rather than an i18n key because `common` has no generic
 * loading string and this batch may not edit the locale files — move it to
 * `common:actions.loading` next time they are open.
 */
export function PageLoader() {
  const isEn = useIsEnglish();

  return (
    <div className="zn-page-loader" role="status" aria-live="polite">
      <span className="zn-page-loader__ring" aria-hidden="true" />
      <span className="zn-page-loader__label">
        {isEn ? "Loading…" : "Chargement…"}
      </span>
    </div>
  );
}

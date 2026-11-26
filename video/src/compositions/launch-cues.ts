/**
 * The cue sheet of the Launch film, in seconds.
 *
 * Shared by the picture (Launch.tsx) and the score (scripts/launch-score.ts),
 * so a hit in the music cannot drift from the cut it punctuates. Moving a cue
 * means re-running `bun run launch:score`.
 */
export const LAUNCH_CUES = {
  question: 0,
  answer: 4.5,
  research: 9,
  /** The riser ends here, then two seconds of almost nothing. */
  introducing: 14,
  /** First impact. */
  title: 16,
  capable: 21,
  zones: 27,
  /** The heartbeat enters. */
  benchmarks: 33,
  safety: 44,
  privacy: 50,
  montage: 56,
  /** Second impact. */
  hit: 62,
  /** Last impact, the wordmark. */
  signature: 67,
  outro: 67,
} as const;

export const LAUNCH_SECONDS = 74;

import type {
  WorkoutCategory,
  Difficulty,
  WorkoutTemplate,
  WorkoutBlock,
} from "@/types";
import { CATEGORY_META, DIFFICULTY_META } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuickIdeaData {
  name: string;
  description: string;
  category: WorkoutCategory;
  difficulty: Difficulty;
}

export interface IssueSubmission {
  url: string | null;
  markdown: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GITHUB_REPO_URL = "https://github.com/alarboulletmarin/zoned";
const MAX_URL_LENGTH = 2000;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function blocksToMarkdownTable(blocks: WorkoutBlock[]): string {
  if (blocks.length === 0) return "_None_\n";

  const header =
    "| Description | Duration (min) | Zone | Reps | Rest | Recovery |\n" +
    "|-------------|---------------|------|------|------|----------|\n";

  const rows = blocks
    .map((b) => {
      const desc = b.description || "-";
      const duration = b.durationMin != null ? String(b.durationMin) : "-";
      const zone = b.zone ?? "-";
      const reps = b.repetitions != null ? String(b.repetitions) : "-";
      const rest = b.rest ?? "-";
      const recovery = b.recovery ?? "-";
      return `| ${desc} | ${duration} | ${zone} | ${reps} | ${rest} | ${recovery} |`;
    })
    .join("\n");

  return header + rows + "\n";
}

function listToMarkdown(items: string[]): string {
  if (items.length === 0) return "_None_\n";
  return items.map((item) => `- ${item}`).join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build markdown body for a quick workout idea submission.
 */
export function buildQuickIdeaMarkdown(data: QuickIdeaData): string {
  const categoryMeta = CATEGORY_META[data.category];
  const difficultyMeta = DIFFICULTY_META[data.difficulty];

  return [
    `## Workout Idea`,
    "",
    `**Name:** ${data.name}`,
    `**Category:** ${categoryMeta.label} (${categoryMeta.labelEn})`,
    `**Difficulty:** ${difficultyMeta.label} (${difficultyMeta.labelEn})`,
    "",
    `### Description`,
    "",
    data.description,
    "",
  ].join("\n");
}

/**
 * Build comprehensive markdown for a full workout contribution.
 */
export function buildFullWorkoutMarkdown(
  data: Partial<WorkoutTemplate>,
): string {
  const sections: string[] = [];

  // -- Basic Info --
  sections.push("## Basic Info", "");

  if (data.name) sections.push(`**Name:** ${data.name}`);
  if (data.nameEn) sections.push(`**Name (EN):** ${data.nameEn}`);
  if (data.category) {
    const cat = CATEGORY_META[data.category];
    sections.push(`**Category:** ${cat.label} (${cat.labelEn})`);
  }
  if (data.difficulty) {
    const diff = DIFFICULTY_META[data.difficulty];
    sections.push(`**Difficulty:** ${diff.label} (${diff.labelEn})`);
  }
  if (data.sessionType) sections.push(`**Session Type:** ${data.sessionType}`);
  if (data.targetSystem)
    sections.push(`**Target System:** ${data.targetSystem}`);
  if (data.typicalDuration) {
    sections.push(
      `**Duration:** ${data.typicalDuration.min}-${data.typicalDuration.max} min`,
    );
  }
  if (data.description) {
    sections.push("", `### Description (FR)`, "", data.description);
  }
  if (data.descriptionEn) {
    sections.push("", `### Description (EN)`, "", data.descriptionEn);
  }
  sections.push("");

  // -- Environment --
  if (data.environment) {
    const env = data.environment;
    const flags: string[] = [];
    if (env.requiresHills) flags.push("Requires hills");
    if (env.requiresTrack) flags.push("Requires track");
    if (env.prefersFlat) flags.push("Prefers flat terrain");
    if (env.prefersSoft) flags.push("Prefers soft surface");

    sections.push("## Environment", "");
    sections.push(flags.length > 0 ? flags.join(" | ") : "_No constraints_");
    sections.push("");
  }

  // -- Warmup --
  sections.push("## Warmup", "");
  if (data.warmupTemplate && data.warmupTemplate.length > 0) {
    sections.push(blocksToMarkdownTable(data.warmupTemplate));
  } else {
    sections.push("_Not specified_", "");
  }

  // -- Main Set --
  sections.push("## Main Set", "");
  if (data.mainSetTemplate && data.mainSetTemplate.length > 0) {
    sections.push(blocksToMarkdownTable(data.mainSetTemplate));
  } else {
    sections.push("_Not specified_", "");
  }

  // -- Cooldown --
  sections.push("## Cooldown", "");
  if (data.cooldownTemplate && data.cooldownTemplate.length > 0) {
    sections.push(blocksToMarkdownTable(data.cooldownTemplate));
  } else {
    sections.push("_Not specified_", "");
  }

  // -- Coaching Tips --
  sections.push("## Coaching Tips", "");
  if (data.coachingTips && data.coachingTips.length > 0) {
    sections.push(listToMarkdown(data.coachingTips));
  } else {
    sections.push("_Not specified_", "");
  }

  // -- Common Mistakes --
  sections.push("## Common Mistakes", "");
  if (data.commonMistakes && data.commonMistakes.length > 0) {
    sections.push(listToMarkdown(data.commonMistakes));
  } else {
    sections.push("_Not specified_", "");
  }

  // -- JSON data for easy import --
  sections.push("## Raw Data (JSON)", "");
  sections.push("```json");
  sections.push(JSON.stringify(data, null, 2));
  sections.push("```");
  sections.push("");

  return sections.join("\n");
}

/**
 * Build a GitHub "New Issue" URL with pre-filled template, title, and body.
 *
 * Returns `null` when the resulting URL exceeds `MAX_URL_LENGTH`, signaling
 * the caller to fall back to clipboard.
 */
export function buildGithubIssueUrl(
  template: "workout_idea" | "workout_detailed",
  title: string,
  body: string,
): string | null {
  const url =
    `${GITHUB_REPO_URL}/issues/new` +
    `?template=${template}.md` +
    `&title=${encodeURIComponent(title)}` +
    `&body=${encodeURIComponent(body)}`;

  if (url.length > MAX_URL_LENGTH) {
    return null;
  }

  return url;
}

/**
 * Copy text to the clipboard.
 *
 * Returns `true` on success, `false` if the Clipboard API is unavailable or
 * the write fails.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convenience wrapper: build markdown and attempt to create a GitHub URL for
 * a quick idea. The caller should open the URL when non-null, or fall back to
 * copying the markdown to the clipboard.
 */
export function submitQuickIdea(data: QuickIdeaData): IssueSubmission {
  const markdown = buildQuickIdeaMarkdown(data);
  const url = buildGithubIssueUrl("workout_idea", data.name, markdown);
  return { url, markdown };
}

/**
 * Convenience wrapper: build markdown and attempt to create a GitHub URL for
 * a full workout contribution.
 */
export function submitFullWorkout(
  data: Partial<WorkoutTemplate>,
): IssueSubmission {
  const markdown = buildFullWorkoutMarkdown(data);
  const title = data.name ?? "New workout contribution";
  const url = buildGithubIssueUrl("workout_detailed", title, markdown);
  return { url, markdown };
}

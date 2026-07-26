import { Level1, Level2, Level3, Level4, type IconProps } from "@/components/icons";
import type { Difficulty } from "@/types";
import type { ComponentType } from "react";

/**
 * Difficulty reads as a gauge: the glyph carries the level itself, filling
 * 1 to 4 bars out of 4, so the badge is legible without the label.
 */
const DIFFICULTY_ICONS: Record<Difficulty, ComponentType<IconProps>> = {
  beginner: Level1,
  intermediate: Level2,
  advanced: Level3,
  elite: Level4,
};

interface DifficultyIconProps {
  difficulty: Difficulty;
  className?: string;
}

export function DifficultyIcon({ difficulty, className }: DifficultyIconProps) {
  const Icon = DIFFICULTY_ICONS[difficulty];
  return <Icon className={className} />;
}

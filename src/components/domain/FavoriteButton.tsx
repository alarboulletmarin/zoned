import { useState } from "react";
import { Heart } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks";

interface FavoriteButtonProps {
  workoutId: string;
  size?: "sm" | "default";
  className?: string;
}

export function FavoriteButton({
  workoutId,
  size = "default",
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(workoutId);
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!favorited) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
    }
    toggleFavorite(workoutId);
  };

  return (
    <Button
      variant="ghost"
      size={size === "sm" ? "icon-sm" : "icon"}
      className={cn(
        "shrink-0",
        favorited && "text-red-500 hover:text-red-600",
        className
      )}
      onClick={handleClick}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          size === "sm" ? "size-4" : "size-5",
          favorited && "fill-current",
          animating && "animate-heart-bounce"
        )}
      />
    </Button>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("common");
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
        "shrink-0 relative after:absolute after:inset-[-6px] after:content-['']",
        favorited && "text-red-500 hover:text-red-600",
        className
      )}
      onClick={handleClick}
      aria-label={favorited ? t("actions.removeFromFavorites") : t("actions.addToFavorites")}
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

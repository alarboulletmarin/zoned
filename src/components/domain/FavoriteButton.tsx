import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks";

interface FavoriteButtonProps {
  workoutId: string;
  size?: "sm" | "default";
  /**
   * Show the action next to the heart. On a detail page a bare icon floating
   * top-right reads as decoration; on a dense card the icon alone is right.
   */
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  workoutId,
  size = "default",
  showLabel = false,
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

  const label = favorited ? t("actions.removeFromFavorites") : t("actions.addToFavorites");

  return (
    <Button
      variant="ghost"
      size={showLabel ? "sm" : size === "sm" ? "icon-sm" : "icon"}
      className={cn(
        "shrink-0 relative after:absolute after:inset-[-6px] after:content-['']",
        showLabel && "rounded-full px-3 min-h-11 gap-1.5",
        favorited && "text-red-500 hover:text-red-600",
        className
      )}
      onClick={handleClick}
      aria-label={label}
    >
      <Heart
        className={cn(
          size === "sm" && !showLabel ? "size-4" : "size-5",
          favorited && "fill-current",
          animating && "animate-heart-bounce"
        )}
      />
      {showLabel && <span className="text-sm">{label}</span>}
    </Button>
  );
}

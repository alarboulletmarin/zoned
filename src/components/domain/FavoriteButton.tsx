import { useTranslation } from "react-i18next";
import { Heart } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks";
import { useJustChanged } from "@/hooks/useJustChanged";

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

/**
 * The favourite toggle.
 *
 * A saved session wears a FILLED heart. The colour alone was the state, on the
 * claim that the icon set had no filled variant, it does: `Heart` takes a
 * `filled` prop, and so do a dozen of its neighbours. An outline that changes
 * hue asks the reader to remember which hue means saved; a solid shape does
 * not, and it survives being looked at quickly, which is the only way anyone
 * looks at a favourite toggle.
 *
 * The colour is the house vermillon, not a stray red: this system has one
 * accent, and a second one cancels the first. And nothing bounces: motion says
 * where something came from or that a wait is real, so a 400ms scale animation
 * on a state change is decoration and it is gone.
 *
 * Geste : au clic, et seulement au clic, le plein s'ouvre depuis le centre
 * du contour, sans que le coeur grossisse ; le retrait le referme, plus vite.
 * Le plein est un second glyphe posé sur le contour (favorite-button.css).
 */
export function FavoriteButton({
  workoutId,
  size = "default",
  showLabel = false,
  className,
}: FavoriteButtonProps) {
  const { t } = useTranslation("common");
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(workoutId);
  const just = useJustChanged([[workoutId, favorited] as const], (prev, next) => prev !== next);
  const justChanged = just.keys.has(workoutId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(workoutId);
  };

  const label = favorited ? t("actions.removeFromFavorites") : t("actions.addToFavorites");

  return (
    <Button
      variant="ghost"
      size={showLabel ? "sm" : size === "sm" ? "icon-sm" : "icon"}
      className={cn("zn-favorite", className)}
      data-labelled={showLabel || undefined}
      aria-pressed={favorited}
      aria-label={label}
      onClick={handleClick}
    >
      <span className="zn-favorite__glyph" data-just={justChanged ? (favorited ? "on" : "off") : undefined}>
        <Heart />
        {(favorited || justChanged) && (
          <span
            className="zn-favorite__fill"
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) just.clear(workoutId);
            }}
          >
            <Heart filled />
          </span>
        )}
      </span>
      {showLabel && <span className="zn-favorite__label">{label}</span>}
    </Button>
  );
}

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Le menu d'une séance, ce qu'on peut lui faire sans quitter le plan.
 *
 * Il a d'abord vécu dans `PlanWeeklyView`, en JSX inline, où seul le tableau
 * de la semaine pouvait l'ouvrir. La vue liste, elle, n'avait rien : un appui
 * sur une rangée ne faisait rien du tout, et les quatre gestes qu'elle propose
 * n'existaient qu'en glyphes de 14px alignés au bout de la ligne. Deux vues du
 * même plan, deux grammaires. Il est donc sorti d'ici pour que les deux
 * ouvrent LE MÊME objet.
 *
 * Le composant ne décide de rien : il reçoit une liste d'entrées et un point
 * d'ancrage. Chaque vue sait ce qu'elle sait faire, le tableau propose de
 * retirer et de verrouiller une séance tirée au sort, la liste propose de
 * l'échanger et de lui substituer une variante, et compose sa liste.
 *
 * Ce qu'il ajoute à ce que faisait la version inline : il RESTE À L'ÉCRAN. La
 * version d'origine posait `left: x; top: y` puis se recentrait par un
 * `translate(-50%)`, sans jamais consulter la fenêtre. Une séance touchée près
 * du bord droit d'un téléphone de 390px ouvrait donc un menu dont la moitié
 * sortait de l'écran, et un appui en bas de page un menu qui descendait sous
 * le pli. Il se mesure maintenant avant la peinture (useLayoutEffect, donc
 * sans clignotement) et se replie au-dessus du doigt s'il n'y a pas la place
 * en dessous.
 */

export interface SessionActionMenuItem {
  /** Clé de rendu. Le libellé ne convient pas : deux entrées peuvent le partager. */
  key: string;
  icon: ReactNode;
  label: string;
  onSelect: () => void;
  /** Le seul ton distinct : ce qui détruit. */
  variant?: "destructive";
}

interface SessionActionMenuProps {
  /** Le point touché, en coordonnées de fenêtre. */
  x: number;
  y: number;
  items: SessionActionMenuItem[];
  onClose: () => void;
}

/** L'écart gardé avec chaque bord de la fenêtre, et avec le doigt. */
const EDGE = 8;
const OFFSET = 4;

export function SessionActionMenu({ x, y, items, onClose }: SessionActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  /* Avant la peinture : on mesure le menu rendu, puis on le range dans la
     fenêtre. `useLayoutEffect` et non `useEffect`, ce dernier s'exécute APRÈS
     la peinture, donc le menu apparaîtrait une frame à la mauvaise place.
     Le ResizeObserver rattrape les mesures PÉRIMÉES : la police de l'interface
     finit de charger après le premier rendu, les libellés s'élargissent, et un
     rangement calculé sur l'ancienne largeur laisse le menu sur le bord.

     ── Pourquoi le placement passe par `transform` et non par `left` / `top`
     ────────────────────────────────────────────────────────────────────────
     Parce qu'une boîte `fixed` posée par son seul `left` se fait DIMENSIONNER
     par lui : sa largeur disponible vaut `largeur de fenêtre − left`. Le menu
     se rétrécissait donc à mesure qu'on le poussait à droite, et le rangement
     ci-dessous est un calcul qui DÉPEND de la largeur.

     Les deux se sont mordu la queue. Ouvert près du bord droit, le menu
     naissait à 143px (sa largeur minimale, faute de place), l'observateur le
     décalait de 8px vers la gauche, ces 8px lui rendaient 8px de largeur
     disponible, il s'élargissait, l'observateur repartait, dix-neuf fois,
     exactement 8px par image, jusqu'à sa largeur naturelle de 274. Vu de
     l'écran : un bandeau étroit qui se déroule de la droite vers la gauche.

     Ancré à `0, 0`, le menu prend toujours toute la fenêtre comme place
     disponible, donc sa largeur ne dépend plus d'où on le met. Le `transform`
     le déplace sans toucher à la mise en page : la boucle n'a plus de prise. */
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    const place = () => {
      const { width, height } = el.getBoundingClientRect();
      /* clientWidth et non innerWidth : sur un bureau, innerWidth compte la
         barre de défilement, et le menu se rangerait quinze pixels trop loin. */
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;

      const left = Math.min(Math.max(x - width / 2, EDGE), Math.max(EDGE, vw - width - EDGE));

      /* Sous le doigt par défaut : c'est là que le regard va. S'il n'y a pas
         la place, au-dessus, et si l'écran est trop court pour les deux,
         collé en haut, où il reste au moins entièrement lisible. */
      let top = y + OFFSET;
      if (top + height > vh - EDGE) {
        const above = y - height - OFFSET;
        top = above >= EDGE ? above : Math.max(EDGE, vh - height - EDGE);
      }

      setPos((prev) =>
        prev && prev.left === left && prev.top === top ? prev : { left, top },
      );
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(el);
    return () => observer.disconnect();
  }, [x, y]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    /* Le voile prend la fenêtre entière : c'est lui qui ferme le menu quand on
       touche à côté, plutôt qu'un écouteur posé sur le document, un voile ne
       peut pas rater un événement qu'un autre gestionnaire a arrêté en route. */
    <div className="zn-plan-menu__scrim" onPointerDown={onClose}>
      <div
        ref={menuRef}
        className="zn-menu zn-plan-menu"
        role="menu"
        /* Tant qu'on n'a pas mesuré, le menu est rendu mais invisible : il faut
           qu'il occupe sa vraie boîte pour qu'on puisse la lire, et il ne faut
           pas qu'on le voie à l'ancre 0,0. La mesure a lieu avant la peinture,
           donc cet état ne se voit jamais. */
        style={
          pos
            ? { transform: `translate3d(${pos.left}px, ${pos.top}px, 0)` }
            : { visibility: "hidden" }
        }
        onPointerDown={(e) => e.stopPropagation()}
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            role="menuitem"
            className="zn-menu__item"
            data-variant={item.variant}
            onClick={() => {
              item.onSelect();
              onClose();
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

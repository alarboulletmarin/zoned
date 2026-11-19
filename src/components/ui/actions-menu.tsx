import type { ComponentProps, ReactNode } from "react";
import { Loader2, MoreHorizontal } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Le bouton ··· d'un objet enregistré : un plan, une semaine, une séance
 * construite, une simulation. C'est là que vivent les gestes rares (exporter,
 * partager, dupliquer, renommer, supprimer), pour qu'une carte ou une ligne ne
 * porte pas une rangée de boutons au poids de son contenu, ni une corbeille
 * toujours visible.
 *
 * - Une cible de 44 px, et une étiquette qui NOMME l'objet (Actions du plan
 *   Marathon de Séville) : dix boutons ··· identiques sur une page ne se
 *   distinguent qu'à leur étiquette.
 * - Une marge de 16 px contre les bords de l'écran, pour que le menu ne s'y
 *   colle ni ne s'y coupe sur un téléphone.
 * - Les entrées sont des `DropdownMenuItem` passés en enfants ; la
 *   destructive vient en dernier, sous un séparateur, avec la classe
 *   `zn-more__danger`.
 *
 * Radix porte le clavier : flèches, Entrée, Échap, et le retour du focus au
 * bouton, sauf si `onCloseAutoFocus` l'empêche (un renommage en place).
 */
interface ActionsMenuProps {
  /** L'étiquette du bouton, qui nomme l'objet. */
  label: string;
  /** Une action en cours : le bouton tourne au lieu de montrer ···. */
  busy?: boolean;
  className?: string;
  onCloseAutoFocus?: ComponentProps<typeof DropdownMenuContent>["onCloseAutoFocus"];
  children: ReactNode;
}

export function ActionsMenu({ label, busy = false, className, onCloseAutoFocus, children }: ActionsMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn("zn-more", className)} aria-label={label}>
          {busy ? <Loader2 className="zn-spin" size={20} /> : <MoreHorizontal size={20} />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        collisionPadding={16}
        className="zn-more__list"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
